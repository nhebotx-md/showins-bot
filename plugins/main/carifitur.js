import { canAccess } from '../../src/core/access-control.js'

function normalize(value) {
  return String(value || '').trim().toLocaleLowerCase('id-ID')
}

function normalizeJid(value) {
  return String(value || '').trim().toLowerCase().replace(/:[^@]+(?=@)/, '')
}

function isAdmin(participant) {
  return participant?.admin === 'admin' || participant?.admin === 'superadmin'
}

function isGroup(jid) {
  return String(jid).endsWith('@g.us')
}

function findParticipant(participants, candidates) {
  const ids = new Set(candidates.map(normalizeJid).filter(Boolean))
  return participants.find(participant => ids.has(normalizeJid(participant.id))) || null
}

function similarity(left, right) {
  const source = normalize(left)
  const query = normalize(right)
  if (!source || !query) return 0
  if (source.includes(query)) return 1
  const sourceWords = new Set(source.split(/\s+/))
  const queryWords = query.split(/\s+/)
  return queryWords.reduce((score, word) => score + (sourceWords.has(word) ? 1 : 0), 0) / queryWords.length
}

export function findFeatures(plugins, query) {
  return plugins
    .map(plugin => {
      const aliases = plugin.commands.slice(1).join(' ')
      const score = Math.max(
        similarity(plugin.name, query) * 3,
        similarity(aliases, query) * 2,
        similarity(plugin.description, query),
        similarity(plugin.category, query)
      )
      return { plugin, score }
    })
    .filter(item => item.score > 0)
    .sort((left, right) => right.score - left.score || left.plugin.name.localeCompare(right.plugin.name))
}

export async function filterAvailableFeatures({ plugins, role, jid, socket, message }) {
  const group = isGroup(jid)
  const restricted = plugins.filter(plugin => plugin.requirements?.admin || plugin.requirements?.botAdmin)
  let senderIsAdmin = false
  let botIsAdmin = false
  if (group && restricted.length > 0 && typeof socket.groupMetadata === 'function') {
    const metadata = await socket.groupMetadata(jid)
    const participants = Array.isArray(metadata?.participants) ? metadata.participants : []
    senderIsAdmin = isAdmin(findParticipant(participants, [message?.key?.participantAlt, message?.key?.participant, message?.key?.remoteJidAlt, message?.key?.remoteJid]))
    botIsAdmin = isAdmin(findParticipant(participants, [socket.user?.id]))
  }

  return plugins.filter(plugin => {
    if (!canAccess(role, plugin.access)) return false
    const requirements = plugin.requirements || { scope: 'any', admin: false, botAdmin: false }
    if (requirements.scope === 'group' && !group) return false
    if (requirements.scope === 'private' && group) return false
    if (requirements.admin && !senderIsAdmin) return false
    if (requirements.botAdmin && !botIsAdmin) return false
    return true
  })
}

export default {
  name: 'carifitur',
  category: 'main',
  access: 'registered',
  description: 'Mencari command aktif berdasarkan nama, kategori, atau deskripsi.',
  commands: ['carifitur', 'searchcmd', 'findcmd', 'cari', 'search', 'cf'],
  requirements: { scope: 'any', admin: false, botAdmin: false },
  adaptedFrom: {
    repository: 'ShooNhee-md',
    path: 'plugins/main/carifitur.js',
    category: 'main',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    isAdmin: false,
    isBotAdmin: false
  },
  async execute({ args, config, plugins, role, jid, socket, message, reply, sendMenu }) {
    const query = args.join(' ').trim()
    if (!query) {
      await reply(`Gunakan format: ${config.bot.prefix}carifitur <kata kunci>, misalnya ${config.bot.prefix}carifitur grup`)
      return
    }
    const availablePlugins = await filterAvailableFeatures({ plugins, role, jid, socket, message })
    const results = findFeatures(availablePlugins, query).slice(0, 8)
    if (results.length === 0) {
      await reply(`Tidak ada fitur yang dapat Anda akses dan cocok dengan _${query}_. Coba kata lain atau lihat ${config.bot.prefix}menu.`)
      return
    }
    const lines = [`Ditemukan *${results.length}* fitur teratas untuk _${query}_:`, '', ...results.map((item, index) => `${index + 1}. *${config.bot.prefix}${item.plugin.name}* — ${item.plugin.description}`)]
    await sendMenu({
      title: 'CARI FITUR',
      text: lines.join('\n'),
      footer: 'Pilih command untuk menjalankannya.',
      options: results.map(item => ({ label: `${config.bot.prefix}${item.plugin.name}`, id: `${config.bot.prefix}${item.plugin.name}` }))
    })
  }
}
