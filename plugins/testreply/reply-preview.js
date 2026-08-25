import { buildPreviewReply } from '../../src/services/reply-showcase.js'

export default {
  name: 'reply-preview',
  category: 'testreply',
  access: 'registered',
  description: 'Menguji balasan dengan kartu context preview yang ringkas.',
  commands: ['replypreview'],
  async execute({ config, sendResponse }) {
    await sendResponse(buildPreviewReply({ botName: config.bot.name }))
  }
}
