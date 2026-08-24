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
  group: Object.freeze({
    id: 'group',
    label: 'Grup',
    description: 'Fitur yang berjalan khusus di grup.',
    order: 30
  }),
  media: Object.freeze({
    id: 'media',
    label: 'Media',
    description: 'Fitur pemrosesan media dan stiker.',
    order: 40
  }),
  owner: Object.freeze({
    id: 'owner',
    label: 'Owner',
    description: 'Kontrol bot yang hanya tersedia untuk pemilik.',
    order: 50
  }),
  system: Object.freeze({
    id: 'system',
    label: 'Sistem',
    description: 'Informasi runtime dan pengelolaan dasar.',
    order: 60
  })
})

export function getPluginCategory(categoryId) {
  return PLUGIN_CATEGORIES[categoryId] || null
}

export function isPluginCategory(categoryId) {
  return Boolean(getPluginCategory(categoryId))
}

export function getCategoriesForPlugins(plugins) {
  const activeCategoryIds = new Set(plugins.map(plugin => plugin.category))
  return Object.values(PLUGIN_CATEGORIES)
    .filter(category => activeCategoryIds.has(category.id))
    .sort((left, right) => left.order - right.order)
}
