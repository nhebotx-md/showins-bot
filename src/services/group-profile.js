const GROUP_VIEW_REQUIREMENTS = Object.freeze({ scope: 'group', admin: false, botAdmin: false })
const GROUP_ADMIN_REQUIREMENTS = Object.freeze({ scope: 'group', admin: true, botAdmin: false })

function createGroupProfilePlugin({ name, aliases, description, sourcePath, requirements, execute }) {
  return {
    name,
    category: 'group',
    access: 'registered',
    description,
    commands: [name, ...aliases],
    requirements,
    adaptedFrom: {
      repository: 'ShooNhee-md',
      path: sourcePath,
      category: 'group',
      isGroup: true,
      isAdmin: requirements.admin,
      isBotAdmin: requirements.botAdmin
    },
    execute
  }
}

export const groupRulesPlugin = createGroupProfilePlugin({
  name: 'rulesgrup',
  aliases: ['rulesgroup', 'aturangrup', 'grouprules'],
  description: 'Menampilkan aturan khusus untuk grup ini.',
  sourcePath: 'plugins/group/rulesgrup.js',
  requirements: GROUP_VIEW_REQUIREMENTS,
  async execute({ jid, services, reply }) {
    const rules = services.groupProfiles.get(jid)?.rules
    await reply(rules ? `*ATURAN GRUP*\n\n${rules}` : 'Belum ada aturan khusus untuk grup ini.')
  }
})

export const setGroupRulesPlugin = createGroupProfilePlugin({
  name: 'setrulesgrup',
  aliases: ['setgrouprules', 'setaturangrup'],
  description: 'Menyimpan aturan khusus grup.',
  sourcePath: 'plugins/group/setrulesgrup.js',
  requirements: GROUP_ADMIN_REQUIREMENTS,
  async execute({ jid, args, config, services, reply }) {
    const rules = args.join(' ').trim()
    if (!rules) {
      await reply(`Gunakan format: ${config.bot.prefix}setrulesgrup <aturan grup>`) 
      return
    }
    if (rules.length > 4000) {
      await reply('Aturan grup maksimal 4000 karakter.')
      return
    }
    await services.groupProfiles.setRules(jid, rules)
    await reply(`✅ Aturan grup disimpan. Gunakan ${config.bot.prefix}rulesgrup untuk melihatnya.`)
  }
})

export const resetGroupRulesPlugin = createGroupProfilePlugin({
  name: 'resetrulesgrup',
  aliases: ['clearrulesgrup', 'deleterulesgrup'],
  description: 'Menghapus aturan khusus grup.',
  sourcePath: 'plugins/group/resetrulesgrup.js',
  requirements: GROUP_ADMIN_REQUIREMENTS,
  async execute({ jid, services, reply }) {
    await services.groupProfiles.clearRules(jid)
    await reply('✅ Aturan khusus grup telah dihapus.')
  }
})

function templateHelp(prefix, action) {
  return [`Gunakan format: ${prefix}${action} <pesan>`, '', 'Placeholder tersedia:', '{user} — mention anggota', '{number} — nomor anggota', '{group} — nama grup', '{count} — jumlah anggota', '{bot} — nama bot'].join('\n')
}

function createTemplatePlugins({ prefix, field, label, sourceSet, sourceView, sourceReset }) {
  const set = createGroupProfilePlugin({
    name: `set${prefix}`,
    aliases: [`custom${prefix}`],
    description: `Menyimpan template pesan ${label} otomatis.`,
    sourcePath: sourceSet,
    requirements: GROUP_ADMIN_REQUIREMENTS,
    async execute({ jid, args, config, services, reply }) {
      const template = args.join(' ').trim()
      if (!template) {
        await reply(templateHelp(config.bot.prefix, `set${prefix}`))
        return
      }
      if (template.length > 2000) {
        await reply('Template maksimal 2000 karakter.')
        return
      }
      await services.groupProfiles.setTemplate(jid, field, template)
      await reply(`✅ Template ${label} disimpan. Gunakan ${config.bot.prefix}${prefix} untuk melihatnya.`)
    }
  })
  const view = createGroupProfilePlugin({
    name: prefix,
    aliases: [`show${prefix}`],
    description: `Menampilkan template ${label} aktif.`,
    sourcePath: sourceView,
    requirements: GROUP_VIEW_REQUIREMENTS,
    async execute({ jid, services, reply }) {
      const template = services.groupProfiles.get(jid)?.[field]
      await reply(template ? `*TEMPLATE ${label.toUpperCase()}*\n\n${template}` : `Belum ada template ${label} untuk grup ini.`)
    }
  })
  const reset = createGroupProfilePlugin({
    name: `reset${prefix}`,
    aliases: [`clear${prefix}`],
    description: `Menghapus template ${label} otomatis.`,
    sourcePath: sourceReset,
    requirements: GROUP_ADMIN_REQUIREMENTS,
    async execute({ jid, services, reply }) {
      await services.groupProfiles.setTemplate(jid, field, '')
      await reply(`✅ Template ${label} telah dihapus.`)
    }
  })
  return { set, view, reset }
}

export const welcomePlugins = createTemplatePlugins({
  prefix: 'welcome', field: 'welcomeTemplate', label: 'welcome',
  sourceSet: 'plugins/group/setwelcome.js', sourceView: 'plugins/group/welcome.js', sourceReset: 'plugins/group/resetwelcome.js'
})

export const goodbyePlugins = createTemplatePlugins({
  prefix: 'goodbye', field: 'goodbyeTemplate', label: 'goodbye',
  sourceSet: 'plugins/group/setgoodbye.js', sourceView: 'plugins/group/goodbye.js', sourceReset: 'plugins/group/resetgoodbye.js'
})
