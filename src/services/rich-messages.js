/**
 * Adapter pesan interaktif untuk payload native-flow yang didukung ItsLiaaa
 * Baileys. Bila pengiriman interaktif ditolak oleh klien atau akun penerima,
 * fallback teks dikirim agar perintah tetap dapat digunakan.
 */
import { brandMessageContent, buildBrandedTextContent, formatBrandedText } from './response-branding.js'

function buildTextFallback({ title, text, options }) {
  return [title, text, '', ...options.map(option => `• ${option.label}: ${option.id}`)].join('\n')
}

function buildQuickReplyButtons(options) {
  return options.map(option => ({
    name: 'quick_reply',
    buttonParamsJson: JSON.stringify({ display_text: option.label, id: option.id })
  }))
}

export async function sendInteractiveMenu(socket, jid, { title, text, footer, options, quoted, branding }) {
  const safeOptions = Array.isArray(options) ? options.filter(option => option?.label && option?.id) : []
  const fallback = formatBrandedText(buildTextFallback({ title, text, options: safeOptions }), branding)

  if (safeOptions.length === 0) {
    return socket.sendMessage(jid, buildBrandedTextContent(fallback, branding), { quoted })
  }

  try {
    return await socket.sendMessage(
      jid,
      brandMessageContent({ title, text, footer, interactiveButtons: buildQuickReplyButtons(safeOptions) }, branding),
      { quoted }
    )
  } catch {
    return socket.sendMessage(jid, buildBrandedTextContent(fallback, branding), { quoted })
  }
}
