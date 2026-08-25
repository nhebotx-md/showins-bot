const DEFAULT_RULES = Object.freeze([
  'Jangan membanjiri command atau mention bot.',
  'Gunakan fitur dengan bijak dan hormati pengguna lain.',
  'Jangan gunakan bot untuk penipuan, banjir pesan, atau penyalahgunaan.',
  'Laporkan bug ke owner dengan konteks yang jelas.',
  'Bot dapat menjalani pemeliharaan sewaktu-waktu.'
])

export default {
  name: 'rules',
  category: 'main',
  access: 'registered',
  description: 'Menampilkan aturan dasar penggunaan bot.',
  commands: ['rules', 'aturanbot', 'botrules'],
  requirements: { scope: 'any', admin: false, botAdmin: false },
  adaptedFrom: {
    repository: 'ShooNhee-md',
    path: 'plugins/main/rules.js',
    category: 'main',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    isAdmin: false,
    isBotAdmin: false
  },
  async execute({ config, reply }) {
    const lines = [`*ATURAN ${config.bot.name.toUpperCase()}*`, '', ...DEFAULT_RULES.map((rule, index) => `${index + 1}. ${rule}`)]
    await reply(lines.join('\n'))
  }
}
