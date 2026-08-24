import { sendInteractiveMenu } from '../services/rich-messages.js'
import { canAccess, getAccessLabel, getSenderNumber, getSenderNumbers, resolveUserRole } from './access-control.js'
import { getCategoryIdFromMenuCommand } from './plugin-categories.js'

function parseNativeFlowResponse(message = {}) {
  const paramsJson = message.interactiveResponseMessage?.nativeFlowResponseMessage?.paramsJson
  if (!paramsJson) return ''

  try {
    const params = JSON.parse(paramsJson)
    return typeof params.id === 'string' ? params.id : typeof params.selected_id === 'string' ? params.selected_id : ''
  } catch {
    return ''
  }
}

function getText(message = {}) {
  return (
    message.conversation ||
    message.extendedTextMessage?.text ||
    message.imageMessage?.caption ||
    message.videoMessage?.caption ||
    message.buttonsResponseMessage?.selectedButtonId ||
    message.listResponseMessage?.singleSelectReply?.selectedRowId ||
    message.templateButtonReplyMessage?.selectedId ||
    parseNativeFlowResponse(message) ||
    ''
  ).trim()
}

function getCommand(text, prefix) {
  if (!text.startsWith(prefix)) return null
  const [command = '', ...args] = text.slice(prefix.length).trim().split(/\s+/)
  return { command: command.toLowerCase(), args }
}

export function createCommandRouter({ config, plugins, logger, userStore }) {
  const commandMap = new Map()
  for (const plugin of plugins) {
    for (const command of plugin.commands) commandMap.set(command.toLowerCase(), plugin)
  }

  return async ({ socket, messages }) => {
    for (const message of messages) {
      if (!message.message || message.key.remoteJid === 'status@broadcast') continue

      const parsed = getCommand(getText(message.message), config.bot.prefix)
      if (!parsed?.command) continue

      const categoryId = getCategoryIdFromMenuCommand(parsed.command)
      const plugin = commandMap.get(parsed.command) || (categoryId ? commandMap.get('menu') : null)
      const jid = message.key.remoteJid
      if (!plugin) {
        await socket.sendMessage(
          jid,
          { text: `Perintah tidak ditemukan. Coba ${config.bot.prefix}menu` },
          { quoted: message }
        )
        continue
      }

      const senderNumber = getSenderNumber(message)
      const senderNumbers = getSenderNumbers(message)
      const role = resolveUserRole({ config, userStore, message, senderNumbers })

      const context = {
        socket,
        message,
        jid,
        args: categoryId ? [categoryId] : parsed.args,
        command: categoryId ? 'menu' : parsed.command,
        senderNumber,
        senderNumbers,
        role,
        userStore,
        config,
        plugins,
        logger,
        reply: text => socket.sendMessage(jid, { text }, { quoted: message }),
        sendMenu: data => sendInteractiveMenu(socket, jid, { ...data, quoted: message })
      }

      if (!canAccess(role, plugin.access)) {
        await context.reply(
          `Akses ditolak. Perintah ini hanya untuk pengguna ${getAccessLabel(plugin.access)}. ` +
            `Peran Anda: ${role === 'guest' ? 'belum terdaftar' : role}.`
        )
        continue
      }

      try {
        await plugin.execute(context)
      } catch (error) {
        logger.error({ err: error, plugin: plugin.name, command: parsed.command }, 'Perintah gagal')
        await context.reply('Terjadi kesalahan saat menjalankan perintah ini.')
      }
    }
  }
}
