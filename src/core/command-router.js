import { sendInteractiveMenu } from '../services/rich-messages.js'

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

export function createCommandRouter({ config, plugins, logger }) {
  const commandMap = new Map()
  for (const plugin of plugins) {
    for (const command of plugin.commands) commandMap.set(command.toLowerCase(), plugin)
  }

  return async ({ socket, messages }) => {
    for (const message of messages) {
      if (!message.message || message.key.fromMe || message.key.remoteJid === 'status@broadcast') continue

      const parsed = getCommand(getText(message.message), config.bot.prefix)
      if (!parsed?.command) continue

      const plugin = commandMap.get(parsed.command)
      const jid = message.key.remoteJid
      if (!plugin) {
        await socket.sendMessage(
          jid,
          { text: `Perintah tidak ditemukan. Coba ${config.bot.prefix}menu` },
          { quoted: message }
        )
        continue
      }

      const context = {
        socket,
        message,
        jid,
        args: parsed.args,
        command: parsed.command,
        config,
        plugins,
        logger,
        reply: text => socket.sendMessage(jid, { text }, { quoted: message }),
        sendMenu: data => sendInteractiveMenu(socket, jid, { ...data, quoted: message })
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
