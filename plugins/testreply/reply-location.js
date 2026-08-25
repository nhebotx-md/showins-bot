import { buildLocationReply } from '../../src/services/reply-showcase.js'

export default {
  name: 'reply-location',
  category: 'testreply',
  access: 'registered',
  description: 'Menguji pesan location demonstrasi tanpa mengirim lokasi pengguna.',
  commands: ['replylocation'],
  async execute({ config, sendResponse }) {
    await sendResponse(buildLocationReply({ botName: config.bot.name }))
  }
}
