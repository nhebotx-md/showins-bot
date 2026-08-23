export default {
  name: 'menu',
  description: 'Menampilkan menu dasar Showins Bot.',
  commands: ['menu', 'help'],
  async execute({ config, plugins, sendMenu }) {
    const commands = [...new Set(plugins.flatMap(plugin => plugin.commands))]
      .map(command => `${config.bot.prefix}${command}`)
      .join('  •  ')

    await sendMenu({
      title: config.bot.name,
      text: `Base bot siap digunakan.\n\nPerintah tersedia:\n${commands}`,
      footer: 'Showins Bot • ItsLiaaa Baileys',
      options: [
        { label: 'Cek status', id: `${config.bot.prefix}status` },
        { label: 'Uji respons', id: `${config.bot.prefix}ping` }
      ]
    })
  }
}
