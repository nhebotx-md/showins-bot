export default {
  name: 'status',
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
        'Library: Itsukichann Baileys mod edge'
      ].join('\n')
    )
  }
}
