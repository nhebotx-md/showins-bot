import { sendInteractiveMenu } from '../services/rich-messages.js'
import { canAccess, getAccessLabel, getSenderNumber, getSenderNumbers, resolveUserRole } from './access-control.js'
import { classifyChat } from './logger.js'
import { getCategoryIdFromMenuCommand } from './plugin-categories.js'
import { getPluginContextViolation } from './plugin-policy.js'

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

export function createCommandRouter({ config, plugins, logger, userStore, services = {} }) {
  const commandMap = new Map()
  for (const plugin of plugins) {
    for (const command of plugin.commands) commandMap.set(command.toLowerCase(), plugin)
  }

  return async ({ socket, messages }) => {
    for (const message of messages) {
      if (!message.message || message.key.remoteJid === 'status@broadcast') continue

      const parsed = getCommand(getText(message.message), config.bot.prefix)
      if (!parsed?.command) {
        await services.quiz?.handleResponse?.({ socket, message })
        continue
      }

      const jid = message.key.remoteJid
      const source = classifyChat(jid)
      const senderNumber = getSenderNumber(message)
      const senderNumbers = getSenderNumbers(message)
      const role = resolveUserRole({ config, userStore, message, senderNumbers })
      const commandLabel = `${config.bot.prefix}${parsed.command}`

      // Hanya command yang melewati parser ini yang dicatat. Pesan chat biasa
      // berhenti pada continue di atas dan tidak pernah menghasilkan log terminal.
      logger.command?.({ source, role, from: senderNumber || 'LID', target: jid, command: commandLabel })

      const reply = async text => {
        const result = await socket.sendMessage(jid, { text }, { quoted: message })
        logger.reply?.({
          source,
          role,
          from: senderNumber || 'LID',
          target: jid,
          command: commandLabel,
          type: 'text',
          chars: String(text).length
        })
        return result
      }
      const sendMenu = async data => {
        const result = await sendInteractiveMenu(socket, jid, { ...data, quoted: message })
        logger.reply?.({
          source,
          role,
          from: senderNumber || 'LID',
          target: jid,
          command: commandLabel,
          type: 'interactive',
          options: Array.isArray(data.options) ? data.options.length : 0
        })
        return result
      }
      const sendResponse = async ({ content, type = 'custom', summary = 'RESPONS BOT', fallback }) => {
        try {
          const result = await socket.sendMessage(jid, content, { quoted: message })
          logger.reply?.({
            source,
            role,
            from: senderNumber || 'LID',
            target: jid,
            command: commandLabel,
            type,
            summary
          })
          return result
        } catch (error) {
          if (!fallback) throw error

          const result = await socket.sendMessage(jid, { text: fallback }, { quoted: message })
          logger.reply?.({
            source,
            role,
            from: senderNumber || 'LID',
            target: jid,
            command: commandLabel,
            type: 'fallback',
            summary: `FALLBACK / ${summary}`
          })
          return result
        }
      }
      const react = async emoji => {
        const result = await socket.sendMessage(jid, { react: { text: emoji, key: message.key } })
        logger.reply?.({
          source,
          role,
          from: senderNumber || 'LID',
          target: jid,
          command: commandLabel,
          type: 'reaction',
          summary: `REACTION ${emoji}`
        })
        return result
      }

      const categoryId = getCategoryIdFromMenuCommand(parsed.command)
      const plugin = commandMap.get(parsed.command) || (categoryId ? commandMap.get('menu') : null)
      if (!plugin) {
        await reply(`Perintah tidak ditemukan. Coba ${config.bot.prefix}menu`)
        continue
      }

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
        services,
        logger,
        reply,
        sendMenu,
        sendResponse,
        react
      }

      if (!canAccess(role, plugin.access)) {
        await context.reply(
          `Akses ditolak. Perintah ini hanya untuk pengguna ${getAccessLabel(plugin.access)}. ` +
            `Peran Anda: ${role === 'guest' ? 'belum terdaftar' : role}.`
        )
        continue
      }

      try {
        const contextViolation = await getPluginContextViolation({ plugin, message, jid, socket })
        if (contextViolation) {
          await context.reply(contextViolation)
          continue
        }
      } catch (error) {
        logger.error({ err: error, plugin: plugin.name, command: parsed.command }, 'Konteks command tidak dapat diverifikasi')
        await context.reply('Izin command tidak dapat diverifikasi saat ini.')
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
