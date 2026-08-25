import { DEFAULT_MENU_THEME, getMenuTheme, listMenuThemes } from '../../src/services/plugin-menu.js'

function formatThemePicker({ prefix, currentTheme }) {
  const lines = ['🎨 *PILIH TEMA MENU*', '', `Tema aktif: *${currentTheme.label}*`, '', 'Pilih dari opsi interaktif di bawah atau ketik command:']
  for (const theme of listMenuThemes()) {
    const marker = theme.id === currentTheme.id ? ' ✓' : ''
    lines.push(`• *${theme.id}*${marker} — ${theme.description}`)
  }
  lines.push('', `Contoh: *${prefix}menutheme ledger*`, `Reset: *${prefix}menutheme reset*`)
  return lines.join('\n')
}

export default {
  name: 'menutheme',
  category: 'main',
  access: 'registered',
  description: 'Memilih tampilan menu pribadi yang disimpan untuk nomor Anda.',
  commands: ['menutheme', 'setmenu', 'menustyle', 'menuvariant'],
  sourceReference: 'ShooNhee-md/plugins/owner/setmenu.js',
  async execute({ args, config, userStore, senderNumber, reply, sendMenu }) {
    const requested = args[0]?.toLowerCase()
    const currentTheme = getMenuTheme(userStore.get(senderNumber)?.menuTheme)

    if (!requested) {
      await sendMenu({
        title: 'Tema Menu',
        text: formatThemePicker({ prefix: config.bot.prefix, currentTheme }),
        footer: 'Preferensi disimpan per pengguna',
        options: listMenuThemes().map(theme => ({
          label: `${theme.label}${theme.id === currentTheme.id ? ' ✓' : ''}`,
          id: `${config.bot.prefix}menutheme ${theme.id}`
        }))
      })
      return
    }

    const selectedTheme = requested === 'reset' ? getMenuTheme(DEFAULT_MENU_THEME) : getMenuTheme(requested)
    if (requested !== 'reset' && selectedTheme.id !== requested) {
      await reply(`Tema tidak ditemukan. Gunakan ${config.bot.prefix}menutheme untuk melihat pilihan.`)
      return
    }

    await userStore.setMenuTheme(senderNumber, selectedTheme.id)
    await reply(`✅ Tema menu pribadi diubah ke *${selectedTheme.label}*. Gunakan ${config.bot.prefix}menu untuk melihatnya.`)
  }
}
