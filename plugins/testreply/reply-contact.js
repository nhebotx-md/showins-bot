import { buildBotContactReply } from '../../src/services/reply-showcase.js'

export default {
  name: 'reply-contact',
  category: 'testreply',
  access: 'registered',
  description: 'Menguji kartu kontak nomor bot sendiri dengan fallback teks.',
  commands: ['replycontact'],
  async execute({ config, sendResponse }) {
    await sendResponse(buildBotContactReply({
      botName: config.bot.name,
      pairingNumber: config.connection.pairingNumber
    }))
  }
}
