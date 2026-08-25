const readMoreSeparator = '\u200e'.repeat(4001)

export default {
  name: 'readmore',
  category: 'tools',
  access: 'registered',
  description: 'Membuat teks baca selengkapnya atau spoiler sederhana.',
  commands: ['readmore', 'selengkapnya', 'spoiler'],
  requirements: { scope: 'any', admin: false, botAdmin: false },
  adaptedFrom: {
    repository: 'ShooNhee-md',
    path: 'plugins/tools/readmore.js',
    category: 'tools'
  },
  async execute({ args, config, reply }) {
    const input = args.join(' ').trim()
    if (!input || !input.includes('|')) {
      await reply(`Gunakan format: ${config.bot.prefix}readmore <teks awal>|<teks lanjutan>`)
      return
    }

    const [before = '', ...afterParts] = input.split('|')
    const after = afterParts.join('|')
    await reply(`${before}${readMoreSeparator}${after}`)
  }
}
