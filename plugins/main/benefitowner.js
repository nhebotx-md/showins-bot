export function getOwnerPlugins(plugins) {
  return plugins
    .filter(plugin => plugin.access === 'owner')
    .sort((left, right) => left.name.localeCompare(right.name))
}

export default {
  name: 'benefitowner',
  category: 'main',
  access: 'registered',
  description: 'Menampilkan command khusus owner yang aktif pada bot ini.',
  commands: ['benefitowner', 'ownerbenefits', 'ownerfitur', 'benefitown'],
  requirements: { scope: 'any', admin: false, botAdmin: false },
  adaptedFrom: {
    repository: 'ShooNhee-md',
    path: 'plugins/main/benefitowner.js',
    category: 'main',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    isAdmin: false,
    isBotAdmin: false
  },
  async execute({ config, plugins, reply }) {
    const ownerPlugins = getOwnerPlugins(plugins)
    const commandLines = ownerPlugins.length
      ? ownerPlugins.map(plugin => `• *${config.bot.prefix}${plugin.name}* — ${plugin.description}`)
      : ['• Belum ada command owner aktif.']
    await reply([
      '*AKSES OWNER*',
      '',
      'Owner adalah pemilik bot yang terdeteksi dari konfigurasi bot atau pesan yang dikirim dari akun bot sendiri.',
      `Command khusus owner aktif: *${ownerPlugins.length}*`,
      '',
      ...commandLines,
      '',
      '_Daftar ini hanya menjelaskan akses yang telah diaktifkan; status owner dikelola melalui konfigurasi bot._'
    ].join('\n'))
  }
}
