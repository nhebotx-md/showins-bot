import { buildDocumentReply } from '../../src/services/reply-showcase.js'

export default {
  name: 'reply-document',
  category: 'testreply',
  access: 'registered',
  description: 'Menguji balasan dokumen ringan dengan caption.',
  commands: ['replydocument'],
  async execute({ config, sendResponse }) {
    await sendResponse(buildDocumentReply({ botName: config.bot.name }))
  }
}
