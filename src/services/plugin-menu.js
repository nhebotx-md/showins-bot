import { getCategoriesForPlugins, getPluginCategory } from '../core/plugin-categories.js'

function formatCommands(commands, prefix) {
  return commands.map(command => `${prefix}${command}`).join(', ')
}

function pluginsForCategory(plugins, categoryId) {
  return plugins
    .filter(plugin => plugin.category === categoryId)
    .sort((left, right) => left.name.localeCompare(right.name))
}

export function getMenuCategories(plugins) {
  return getCategoriesForPlugins(plugins).map(category => ({
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
    '*Kategori aktif*'
  ]

  for (const category of categories) {
    lines.push(`• *${category.label}* — ${category.plugins.length} fitur`)
    lines.push(`  ${category.description}`)
  }

  lines.push('', `Ketik *${prefix}menu <kategori>* untuk melihat perintah.`)
  return lines.join('\n')
}

export function renderCategoryDetail({ botName, prefix, plugins, categoryId }) {
  const category = getPluginCategory(categoryId)
  if (!category) return null

  const categoryPlugins = pluginsForCategory(plugins, category.id)
  if (categoryPlugins.length === 0) return null

  const lines = [`*${botName} — ${category.label}*`, category.description, '']
  for (const plugin of categoryPlugins) {
    lines.push(`*${formatCommands(plugin.commands, prefix)}*`)
    lines.push(`  ${plugin.description}`)
  }

  lines.push('', `Kembali ke semua kategori: *${prefix}menu*`)
  return { category, text: lines.join('\n'), plugins: categoryPlugins }
}
