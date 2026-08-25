function parsePollInput(input = '') {
  let parts = String(input).split('|').map(part => part.trim())
  const multiple = parts[0]?.toLowerCase() === 'multi'
  if (multiple) parts = parts.slice(1)
  if (parts.length < 2) return null

  const question = parts[0]
  const options = parts.slice(1).join('|').split(',').map(option => option.trim()).filter(Boolean)
  if (!question || options.length < 2 || options.length > 12 || question.length > 255) return null
  return { question, options, multiple }
}

export default {
  name: 'poll',
  category: 'group',
  access: 'registered',
  description: 'Membuat poll WhatsApp di grup.',
  commands: ['poll', 'voting', 'vote', 'survei'],
  requirements: { scope: 'group', admin: false, botAdmin: false },
  adaptedFrom: {
    repository: 'ShooNhee-md',
    path: 'plugins/group/poll.js',
    category: 'group',
    isGroup: true
  },
  async execute({ args, config, sendResponse }) {
    const parsed = parsePollInput(args.join(' '))
    if (!parsed) {
      await sendResponse({
        type: 'poll-help',
        summary: 'POLL FORMAT',
        content: { text: `Gunakan format: ${config.bot.prefix}poll <pertanyaan> | <opsi 1>, <opsi 2>.\nUntuk pilihan ganda: ${config.bot.prefix}poll multi | <pertanyaan> | <opsi 1>, <opsi 2>.` },
        fallback: `Gunakan format: ${config.bot.prefix}poll <pertanyaan> | <opsi 1>, <opsi 2>.`
      })
      return
    }

    const fallback = [`*${parsed.question}*`, ...parsed.options.map((option, index) => `${index + 1}. ${option}`)].join('\n')
    await sendResponse({
      type: 'poll',
      summary: `POLL ${parsed.options.length} OPSI`,
      content: {
        poll: {
          name: parsed.question,
          values: parsed.options,
          selectableCount: parsed.multiple ? parsed.options.length : 1
        }
      },
      fallback
    })
  }
}

export { parsePollInput }
