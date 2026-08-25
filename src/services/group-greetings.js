function numberFromJid(jid) {
  return String(jid || '').split('@')[0].split(':')[0]
}

export function renderGroupTemplate(template, { participant, metadata, botName }) {
  const replacements = {
    user: `@${numberFromJid(participant)}`,
    number: numberFromJid(participant),
    group: metadata.subject || 'Grup',
    count: String(metadata.participants?.length || 0),
    bot: botName || 'Showins Bot'
  }
  return String(template).replace(/\{(user|number|group|count|bot)\}/g, (_match, key) => replacements[key])
}

export function createGroupGreetingService({ groupProfiles, config, logger }) {
  return {
    async handle({ socket, update }) {
      if (!update?.id?.endsWith('@g.us') || !['add', 'remove'].includes(update.action)) return
      const profile = groupProfiles.get(update.id)
      const template = update.action === 'add' ? profile?.welcomeTemplate : profile?.goodbyeTemplate
      if (!template) return
      try {
        const metadata = await socket.groupMetadata(update.id)
        for (const participant of update.participants || []) {
          const text = renderGroupTemplate(template, { participant, metadata, botName: config.bot.name })
          await socket.sendMessage(update.id, { text, mentions: [participant] })
        }
      } catch (error) {
        logger.error?.({ err: error, group: update.id, action: update.action }, 'Pesan otomatis grup tidak terkirim')
      }
    }
  }
}
