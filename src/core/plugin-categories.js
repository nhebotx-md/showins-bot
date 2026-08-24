export const PLUGIN_CATEGORIES = Object.freeze({
  main: Object.freeze({
    id: 'main',
    label: 'Utama',
    description: 'Navigasi dan bantuan penggunaan bot.',
    order: 10
  }),
  tools: Object.freeze({
    id: 'tools',
    label: 'Tools',
    description: 'Utilitas dan pemeriksaan respons bot.',
    order: 20
  }),
  fun: Object.freeze({
    id: 'fun',
    label: 'Fun',
    description: 'Fitur hiburan dan interaksi santai.',
    order: 30
  }),
  group: Object.freeze({
    id: 'group',
    label: 'Grup',
    description: 'Fitur yang berjalan khusus di grup.',
    order: 40
  }),
  media: Object.freeze({
    id: 'media',
    label: 'Media',
    description: 'Fitur pemrosesan media dan stiker.',
    order: 50
  }),
  owner: Object.freeze({
    id: 'owner',
    label: 'Owner',
    description: 'Kontrol bot yang hanya tersedia untuk pemilik.',
    order: 60
  }),
  system: Object.freeze({
    id: 'system',
    label: 'Sistem',
    description: 'Informasi runtime dan pengelolaan dasar.',
    order: 70
  })
})

export function getPluginCategory(categoryId) {
  return PLUGIN_CATEGORIES[categoryId] || null
}

export function isPluginCategory(categoryId) {
  return Boolean(getPluginCategory(categoryId))
}

export function getCategoryMenuCommand(categoryId) {
  return isPluginCategory(categoryId) ? `cat${categoryId}` : null
}

export function getCategoryIdFromMenuCommand(command) {
  const normalizedCommand = String(command || '').toLowerCase()
  return Object.keys(PLUGIN_CATEGORIES).find(categoryId => getCategoryMenuCommand(categoryId) === normalizedCommand) || null
}

export function getAllPluginCategories() {
  return Object.values(PLUGIN_CATEGORIES).sort((left, right) => left.order - right.order)
}

export function getCategoriesForPlugins(plugins) {
  const activeCategoryIds = new Set(plugins.map(plugin => plugin.category))
  return getAllPluginCategories()
    .filter(category => activeCategoryIds.has(category.id))
    .sort((left, right) => left.order - right.order)
}
