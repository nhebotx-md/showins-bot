export default {
  name: 'afk',
  category: 'group',
  access: 'registered',
  description: 'Menandai diri sebagai AFK dan memberi tahu saat disebut atau kembali aktif.',
  commands: ['afk', 'away', 'brb'],
  requirements: { scope: 'any', admin: false, botAdmin: false },
  adaptedFrom: {
    repository: 'ShooNhee-md',
    path: 'plugins/group/afk.js',
    category: 'group',
    isGroup: false,
    isAdmin: false,
    isBotAdmin: false
  },
  async execute({ args, message, services, reply }) {
    const reason = args.join(' ').trim() || 'Tidak ada alasan'
    const senderJid = message.key.participant || message.key.remoteJid
    services.afk.set(senderJid, reason)
    await reply(`💤 Status AFK aktif.\nAlasan: *${reason}*\n\nKirim pesan apa pun untuk menonaktifkan AFK.`)
  }
}
