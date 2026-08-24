import { canAccess, getAccessLabel } from '../core/access-control.js'
import { getAllPluginCategories, getCategoryMenuCommand, getPluginCategory } from '../core/plugin-categories.js'

function formatCommands(commands, prefix) {
  return commands.map(command => `${prefix}${command}`).join(', ')
}

function pluginsForCategory(plugins, categoryId) {
  return plugins
    .filter(plugin => plugin.category === categoryId)
    .sort((left, right) => left.name.localeCompare(right.name))
}

export function getMenuCategories(plugins) {
  return getAllPluginCategories().map(category => ({
    ...category,
    plugins: pluginsForCategory(plugins, category.id)
  }))
}

export function renderCategoryOverview({ botName, prefix, plugins }) {
  const categories = getMenuCategories(plugins)
  const lines = [
    `*${botName}*`,
    'Pusat perintah berdasarkan kategori.',
    '',
    '*Pilih menu kategori*'
  ]

  for (const category of categories) {
    lines.push(`• *${category.label}* — ${prefix}${getCategoryMenuCommand(category.id)}`)
    lines.push(`  ${category.description} (${category.plugins.length} fitur)`)
  }

  lines.push('', `Ketik atau tekan *${prefix}cat<kategori>* untuk membuka submenu.`)
  return lines.join('\n')
}

export function renderCategoryDetail({ botName, prefix, plugins, categoryId, role = 'guest' }) {
  const category = getPluginCategory(categoryId)
  if (!category) return null

  const categoryPlugins = pluginsForCategory(plugins, category.id)
  const lines = [`*${botName} — ${category.label}*`, category.description, '']
  if (categoryPlugins.length === 0) {
    lines.push('Belum ada fitur aktif pada kategori ini.')
  } else {
    for (const plugin of categoryPlugins) {
      lines.push(`*${formatCommands(plugin.commands, prefix)}*`)
      if (canAccess(role, plugin.access)) {
        lines.push(`  ${plugin.description}`)
      } else {
        lines.push(`  ${plugin.description} [Terkunci: ${getAccessLabel(plugin.access)}]`)
      }
    }
  }

  lines.push('', `Kembali ke semua kategori: *${prefix}menu*`)
  return { category, text: lines.join('\n'), plugins: categoryPlugins }
}
