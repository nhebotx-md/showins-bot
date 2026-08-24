import { buildMentionReply } from '../src/services/reply-showcase.js'

export default {
  name: 'reply-mention',
  category: 'testreply',
  access: 'registered',
  description: 'Menguji quoted reply dengan mention pengguna yang nyata.',
  commands: ['replymention'],
  async execute({ config, senderNumber, sendResponse }) {
    await sendResponse(buildMentionReply({ botName: config.bot.name, senderNumber }))
  }
}
