import { buildPlainReply } from '../../src/services/reply-showcase.js'

export default {
  name: 'reply-plain',
  category: 'testreply',
  access: 'registered',
  description: 'Menguji balasan teks sederhana yang mengutip pesan pengguna.',
  commands: ['replyplain'],
  async execute({ config, senderNumber, sendResponse }) {
    await sendResponse(buildPlainReply({ botName: config.bot.name, senderNumber }))
  }
}
