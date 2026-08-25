import { buildPollReply } from '../../src/services/reply-showcase.js'

export default {
  name: 'reply-poll',
  category: 'testreply',
  access: 'registered',
  description: 'Menguji pesan poll Itsukichan-compatible dengan fallback teks.',
  commands: ['replypoll'],
  async execute({ config, sendResponse }) {
    await sendResponse(buildPollReply({ botName: config.bot.name }))
  }
}
