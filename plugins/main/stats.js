import os from 'node:os'

export function formatBytes(bytes) {
  if (!Number.isFinite(bytes) || bytes <= 0) return '0 B'
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const exponent = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), sizes.length - 1)
  return `${(bytes / (1024 ** exponent)).toFixed(exponent === 0 ? 0 : 1)} ${sizes[exponent]}`
}

export function formatUptime(seconds) {
  const total = Math.max(0, Math.floor(seconds))
  const days = Math.floor(total / 86_400)
  const hours = Math.floor((total % 86_400) / 3_600)
  const minutes = Math.floor((total % 3_600) / 60)
  const rest = total % 60
  return [[days, 'h'], [hours, 'j'], [minutes, 'm'], [rest, 'd']].filter(([value]) => value > 0).map(([value, label]) => `${value}${label}`).join(' ') || '0d'
}

export default {
  name: 'stats',
  category: 'main',
  access: 'registered',
  description: 'Menampilkan statistik runtime bot, plugin, dan penyimpanan lokal.',
  commands: ['stats', 'botstats', 'stat'],
  requirements: { scope: 'any', admin: false, botAdmin: false },
  adaptedFrom: {
    repository: 'ShooNhee-md',
    path: 'plugins/main/stats.js',
    category: 'main',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    isAdmin: false,
    isBotAdmin: false
  },
  async execute({ config, plugins, userStore, services, reply }) {
    const memory = process.memoryUsage()
    const users = userStore.list()
    const premium = users.filter(user => user.premium).length
    const groups = services.groupProfiles?.list?.().length || 0
    const lines = [
      `*${config.bot.name.toUpperCase()} / STATS*`,
      `Uptime: *${formatUptime(process.uptime())}*`,
      `Plugin aktif: *${plugins.length}*`,
      `Pengguna terdaftar: *${users.length}*`,
      `Pengguna premium: *${premium}*`,
      `Profil grup lokal: *${groups}*`,
      `Memori proses: *${formatBytes(memory.heapUsed)} / ${formatBytes(memory.heapTotal)}*`,
      `Memori sistem tersedia: *${formatBytes(os.freemem())} / ${formatBytes(os.totalmem())}*`,
      `Node.js: *${process.version}*`
    ]
    await reply(lines.join('\n'))
  }
}
