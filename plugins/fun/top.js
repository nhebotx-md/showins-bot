function participantJid(participant) {
  return participant?.id || participant?.jid || ''
}

function numberFromJid(jid) {
  return String(jid).split('@')[0].split(':')[0]
}

function shuffled(values, random = Math.random) {
  const copy = [...values]
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1))
    ;[copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]]
  }
  return copy
}

export default {
  name: 'top',
  category: 'fun',
  access: 'registered',
  description: 'Membuat daftar top lima anggota grup secara acak untuk hiburan.',
  commands: ['top', 'top5', 'toplist'],
  requirements: { scope: 'group', admin: false, botAdmin: false },
  adaptedFrom: {
    repository: 'ShooNhee-md',
    path: 'plugins/fun/top.js',
    category: 'fun',
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    isAdmin: false,
    isBotAdmin: false
  },
  async execute({ args, socket, jid, reply, sendResponse }) {
    const topic = args.join(' ').trim()
    if (!topic) {
      await reply('Gunakan format: .top <kategori>, misalnya .top paling kreatif')
      return
    }
    const metadata = await socket.groupMetadata(jid)
    const botNumber = numberFromJid(socket.user?.id)
    const members = (metadata.participants || [])
      .map(participantJid)
      .filter(Boolean)
      .filter(member => numberFromJid(member) !== botNumber)
    if (members.length < 2) {
      await reply('Anggota grup belum cukup untuk membuat daftar hiburan.')
      return
    }
    const winners = shuffled(members).slice(0, Math.min(5, members.length))
    const medals = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣']
    const text = [`🏆 *TOP ${winners.length} ${topic.toUpperCase()}*`, '_Hasil ini dibuat acak untuk hiburan._', '', ...winners.map((member, index) => `${medals[index]} @${numberFromJid(member)}`)].join('\n')
    await sendResponse({ content: { text, mentions: winners }, type: 'fun-top', summary: 'FUN TOP LIST', fallback: text.replaceAll('@', '') })
  }
}
