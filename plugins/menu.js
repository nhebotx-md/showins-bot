import { getMenuCategories, renderCategoryDetail, renderCategoryOverview } from '../src/services/plugin-menu.js'

export default {
  name: 'menu',
  category: 'main',
  description: 'Menampilkan menu dasar Showins Bot.',
  commands: ['menu', 'help'],
  async execute({ args, config, plugins, reply, sendMenu }) {
    const requestedCategory = args[0]?.toLowerCase()
    if (requestedCategory) {
      const detail = renderCategoryDetail({
        botName: config.bot.name,
        prefix: config.bot.prefix,
        plugins,
        categoryId: requestedCategory
      })

      if (!detail) {
        await reply(`Kategori tidak ditemukan. Gunakan ${config.bot.prefix}menu untuk melihat kategori aktif.`)
        return
      }

      await reply(detail.text)
      return
    }

    const categories = getMenuCategories(plugins)
    const options = categories.map(category => ({
      label: category.label,
      id: `${config.bot.prefix}menu ${category.id}`
    }))

    await sendMenu({
      title: config.bot.name,
      text: renderCategoryOverview({ botName: config.bot.name, prefix: config.bot.prefix, plugins }),
      footer: 'Showins Bot • ItsLiaaa Baileys',
      options
    })
  }
}
