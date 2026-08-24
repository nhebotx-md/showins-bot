import { BAILEYS_INFO } from '../src/core/baileys.js'

export default {
  name: 'status',
  category: 'system',
  description: 'Menampilkan status dasar runtime.',
  commands: ['status', 'info'],
  async execute({ config, reply }) {
    const uptime = Math.floor(process.uptime())
    await reply(
      [
        `*${config.bot.name}*`,
        `Mode: ${config.bot.mode}`,
        `Node: ${process.version}`,
        `Uptime: ${uptime} detik`,
        `Library: ${BAILEYS_INFO.displayName} ${BAILEYS_INFO.version}`
      ].join('\n')
    )
  }
}
