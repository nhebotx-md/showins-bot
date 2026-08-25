export function getPremiumPlugins(plugins) {
  return plugins
    .filter(plugin => plugin.access === 'premium')
    .sort((left, right) => left.name.localeCompare(right.name))
}

export default {
  name: 'benefitpremium',
  category: 'main',
  access: 'registered',
  description: 'Menampilkan command premium yang aktif pada bot ini.',
  commands: ['benefitpremium', 'premiumbenefits', 'premiumfitur', 'benefitprem'],
  requirements: { scope: 'any', admin: false, botAdmin: false },
  adaptedFrom: {
    repository: 'ShooNhee-md',
    path: 'plugins/main/benefitpremium.js',
    category: 'main',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    isAdmin: false,
    isBotAdmin: false
  },
  async execute({ config, plugins, reply }) {
    const premiumPlugins = getPremiumPlugins(plugins)
    const commandLines = premiumPlugins.length
      ? premiumPlugins.map(plugin => `• *${config.bot.prefix}${plugin.name}* — ${plugin.description}`)
      : ['• Belum ada command premium aktif.']
    await reply([
      '*FITUR PREMIUM*',
      '',
      'Premium membuka command yang diberi label akses premium oleh pengelola bot.',
      `Command premium aktif: *${premiumPlugins.length}*`,
      '',
      ...commandLines,
      '',
      '_Untuk aktivasi atau informasi, hubungi owner bot._'
    ].join('\n'))
  }
}
