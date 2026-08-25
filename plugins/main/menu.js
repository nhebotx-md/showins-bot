import { getMenuCategories, getMenuTheme, renderCategoryDetail, renderCategoryOverview } from '../../src/services/plugin-menu.js'

export default {
  name: 'menu',
  category: 'main',
  access: 'public',
  description: 'Menampilkan menu dasar Showins Bot.',
  commands: ['menu', 'help'],
  async execute({ args, config, plugins, reply, role, sendMenu, userStore, senderNumber }) {
    const requestedCategory = args[0]?.toLowerCase()
    const themeId = userStore?.get(senderNumber)?.menuTheme
    const theme = getMenuTheme(themeId)
    if (requestedCategory) {
      const detail = renderCategoryDetail({
        botName: config.bot.name,
        prefix: config.bot.prefix,
        plugins,
        categoryId: requestedCategory,
        role,
        theme: theme.id
      })

      if (!detail) {
        await reply(`Kategori tidak ditemukan. Gunakan ${config.bot.prefix}menu untuk melihat semua menu kategori.`)
        return
      }

      await reply(detail.text)
      return
    }

    const categories = getMenuCategories(plugins)
    const options = categories.map(category => ({
      label: category.label,
      id: `${config.bot.prefix}cat${category.id}`
    }))

    await sendMenu({
      title: `${config.bot.name} • ${theme.label}`,
      text: renderCategoryOverview({ botName: config.bot.name, prefix: config.bot.prefix, plugins, theme: theme.id }),
      footer: `Tema: ${theme.label} • Showins Bot`,
      options
    })
  }
}
