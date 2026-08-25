import { canAccess, getAccessLabel } from '../core/access-control.js'
import { getAllPluginCategories, getCategoryMenuCommand, getPluginCategory } from '../core/plugin-categories.js'

export const DEFAULT_MENU_THEME = 'classic'

export const MENU_THEMES = Object.freeze({
  classic: Object.freeze({ id: 'classic', label: 'Classic', description: 'Tampilan standar yang jelas dan familiar.' }),
  compact: Object.freeze({ id: 'compact', label: 'Compact', description: 'Tampilan ringkas untuk layar Termux dan chat padat.' }),
  ledger: Object.freeze({ id: 'ledger', label: 'Ledger', description: 'Panel garis tegas bergaya Command Ledger.' }),
  aura: Object.freeze({ id: 'aura', label: 'Aura', description: 'Tampilan dekoratif ringan dengan simbol WhatsApp-safe.' })
})

export function getMenuTheme(themeId) {
  return MENU_THEMES[themeId] || MENU_THEMES[DEFAULT_MENU_THEME]
}

export function listMenuThemes() {
  return Object.values(MENU_THEMES)
}

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

export function renderCategoryOverview({ botName, prefix, plugins, theme = DEFAULT_MENU_THEME }) {
  const categories = getMenuCategories(plugins)
  const selectedTheme = getMenuTheme(theme)
  const standardLines = []

  for (const category of categories) {
    standardLines.push(`• *${category.label}* — ${prefix}${getCategoryMenuCommand(category.id)}`)
    standardLines.push(`  ${category.description} (${category.plugins.length} fitur)`)
  }

  const instruction = `Ketik atau tekan *${prefix}cat<kategori>* untuk membuka submenu.`
  if (selectedTheme.id === 'compact') {
    return [`*${botName} · MENU*`, `Tema: ${selectedTheme.label}`, '', ...categories.map(category => `• ${category.label} (${category.plugins.length}) → ${prefix}${getCategoryMenuCommand(category.id)}`), '', instruction].join('\n')
  }
  if (selectedTheme.id === 'ledger') {
    return [`╭─〔 *${botName.toUpperCase()} / MENU* 〕`, `│ Tema      : ${selectedTheme.label}`, `│ Kategori  : ${categories.length}`, `├─〔 *PILIH KATEGORI* 〕`, ...categories.map(category => `│ ${category.icon} ${category.label.padEnd(11)} ${prefix}${getCategoryMenuCommand(category.id)}`), `╰─ ${instruction}`].join('\n')
  }
  if (selectedTheme.id === 'aura') {
    return [`✦ *${botName}* ✦`, '_Pusat perintah berdasarkan kategori_', '', ...categories.map(category => `◇ ${category.icon} *${category.label}*\n  ${prefix}${getCategoryMenuCommand(category.id)} · ${category.plugins.length} fitur`), '', `✧ ${instruction}`].join('\n')
  }
  return [`*${botName}*`, 'Pusat perintah berdasarkan kategori.', '', '*Pilih menu kategori*', ...standardLines, '', instruction].join('\n')
}

export function renderCategoryDetail({ botName, prefix, plugins, categoryId, role = 'guest', theme = DEFAULT_MENU_THEME }) {
  const category = getPluginCategory(categoryId)
  if (!category) return null

  const categoryPlugins = pluginsForCategory(plugins, category.id)
  const selectedTheme = getMenuTheme(theme)
  const lines = selectedTheme.id === 'ledger'
    ? [`╭─〔 *${botName.toUpperCase()} / ${category.label.toUpperCase()}* 〕`, `│ ${category.description}`, '├─〔 *COMMAND* 〕']
    : selectedTheme.id === 'aura'
      ? [`✦ *${botName} — ${category.label}* ✦`, `_${category.description}_`, '']
      : selectedTheme.id === 'compact'
        ? [`*${botName} · ${category.label}*`, '']
        : [`*${botName} — ${category.label}*`, category.description, '']
  if (categoryPlugins.length === 0) {
    lines.push(selectedTheme.id === 'ledger' ? '│ Belum ada fitur aktif pada kategori ini.' : 'Belum ada fitur aktif pada kategori ini.')
  } else {
    for (const plugin of categoryPlugins) {
      const command = `*${formatCommands(plugin.commands, prefix)}*`
      lines.push(selectedTheme.id === 'ledger' ? `│ ${command}` : command)
      if (canAccess(role, plugin.access)) {
        lines.push(selectedTheme.id === 'ledger' ? `│   ${plugin.description}` : `  ${plugin.description}`)
      } else {
        const locked = `${plugin.description} [Terkunci: ${getAccessLabel(plugin.access)}]`
        lines.push(selectedTheme.id === 'ledger' ? `│   ${locked}` : `  ${locked}`)
      }
    }
  }

  lines.push(selectedTheme.id === 'ledger' ? `╰─ Kembali: *${prefix}menu*` : '', `Kembali ke semua kategori: *${prefix}menu*`)
  return { category, text: lines.join('\n'), plugins: categoryPlugins }
}
