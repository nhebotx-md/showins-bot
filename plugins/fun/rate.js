const RATINGS = Object.freeze([
  ['10/10', 'Sangat menarik untuk versi hiburan ini.'],
  ['9/10', 'Keren dan punya nilai plus.'],
  ['8/10', 'Bagus; lanjutkan gaya tersebut.'],
  ['7/10', 'Cukup kuat dan masih bisa dikembangkan.'],
  ['6/10', 'Lumayan; ada ruang untuk ditingkatkan.'],
  ['100/10', 'Versi hiburan ini menyebutnya legendaris.'],
  ['∞/10', 'Terlalu unik untuk dinilai dengan angka biasa.']
])

export default {
  name: 'rate',
  category: 'fun',
  access: 'registered',
  description: 'Memberi penilaian acak untuk hiburan.',
  commands: ['rate', 'nilai', 'rating'],
  requirements: { scope: 'any', admin: false, botAdmin: false },
  adaptedFrom: {
    repository: 'ShooNhee-md',
    path: 'plugins/fun/rate.js',
    category: 'fun',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    isAdmin: false,
    isBotAdmin: false
  },
  async execute({ args, config, reply }) {
    const subject = args.join(' ').trim()
    if (!subject) {
      await reply(`Gunakan format: ${config.bot.prefix}rate <sesuatu yang ingin dinilai>`)
      return
    }
    const [score, comment] = RATINGS[Math.floor(Math.random() * RATINGS.length)]
    await reply([`*RATE HIBURAN*`, `Subjek: _${subject}_`, `Nilai: *${score}*`, comment, '', '_Nilai ini dibuat acak untuk hiburan, bukan penilaian objektif._'].join('\n'))
  }
}
