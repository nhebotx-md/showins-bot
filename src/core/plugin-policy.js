export const SHOO_NHEE_CATEGORY_MAP = Object.freeze({
  ai: null,
  anime: 'fun',
  asupan: 'media',
  canvas: 'media',
  cek: 'fun',
  clan: 'fun',
  convert: 'media',
  download: 'media',
  ephoto: 'media',
  finance: null,
  fun: 'fun',
  game: 'fun',
  group: 'group',
  info: 'tools',
  islamic: 'fun',
  jpm: null,
  main: 'main',
  media: 'media',
  nsfw: null,
  owner: 'owner',
  panel: null,
  primbon: 'fun',
  pushkontak: null,
  random: 'fun',
  religi: 'fun',
  rpg: null,
  search: 'tools',
  stalker: 'tools',
  sticker: 'media',
  store: null,
  testbutton: 'testreply',
  tools: 'tools',
  tts: 'media',
  user: 'tools',
  utility: 'tools',
  vps: null
})

export function mapShooNheeCategory(category) {
  return SHOO_NHEE_CATEGORY_MAP[String(category || '').toLowerCase()] ?? null
}

export function mapShooNheeAccess({ isOwner = false, isPremium = false } = {}) {
  if (isOwner) return 'owner'
  if (isPremium) return 'premium'
  return 'registered'
}

export function mapShooNheeRequirements({ isGroup = false, isPrivate = false, isAdmin = false, isBotAdmin = false } = {}) {
  if (isGroup && isPrivate) {
    throw new Error('Plugin sumber tidak boleh sekaligus khusus grup dan khusus private.')
  }

  return Object.freeze({
    scope: isGroup ? 'group' : isPrivate ? 'private' : 'any',
    admin: Boolean(isAdmin),
    botAdmin: Boolean(isBotAdmin)
  })
}

export function createShooNheePortPolicy(metadata = {}) {
  return Object.freeze({
    category: mapShooNheeCategory(metadata.category),
    access: mapShooNheeAccess(metadata),
    requirements: mapShooNheeRequirements(metadata)
  })
}

function normalizeJid(jid = '') {
  return String(jid).trim().toLowerCase().replace(/:[^@]+(?=@)/, '')
}

function isGroupJid(jid = '') {
  return String(jid).endsWith('@g.us')
}

function isAdmin(participant) {
  return participant?.admin === 'admin' || participant?.admin === 'superadmin'
}

function findParticipant(participants, candidateJids) {
  const normalizedCandidates = new Set(candidateJids.map(normalizeJid).filter(Boolean))
  return participants.find(participant => normalizedCandidates.has(normalizeJid(participant.id))) || null
}

export async function getPluginContextViolation({ plugin, message, jid, socket }) {
  const requirements = plugin.requirements || { scope: 'any', admin: false, botAdmin: false }
  const group = isGroupJid(jid)

  if (requirements.scope === 'group' && !group) return 'Perintah ini hanya dapat digunakan di grup.'
  if (requirements.scope === 'private' && group) return 'Perintah ini hanya dapat digunakan di chat pribadi.'
  if (!requirements.admin && !requirements.botAdmin) return null

  if (!group) return 'Perintah ini memerlukan konteks grup.'
  if (typeof socket.groupMetadata !== 'function') return 'Metadata grup tidak tersedia untuk memverifikasi izin command.'

  const metadata = await socket.groupMetadata(jid)
  const participants = Array.isArray(metadata?.participants) ? metadata.participants : []
  const sender = findParticipant(participants, [
    message?.key?.participantAlt,
    message?.key?.participant,
    message?.key?.remoteJidAlt,
    message?.key?.remoteJid
  ])
  const bot = findParticipant(participants, [socket?.user?.id])

  if (requirements.admin && !isAdmin(sender)) return 'Perintah ini hanya dapat digunakan oleh admin grup.'
  if (requirements.botAdmin && !isAdmin(bot)) return 'Bot harus menjadi admin grup untuk menjalankan perintah ini.'
  return null
}
