/**
 * Adapter pesan interaktif untuk payload native-flow yang didukung ItsLiaaa
 * Baileys. Bila pengiriman interaktif ditolak oleh klien atau akun penerima,
 * fallback teks dikirim agar perintah tetap dapat digunakan.
 */
function buildTextFallback({ title, text, options }) {
  return [title, text, '', ...options.map(option => `• ${option.label}: ${option.id}`)].join('\n')
}

function buildQuickReplyButtons(options) {
  return options.map(option => ({
    name: 'quick_reply',
    buttonParamsJson: JSON.stringify({ display_text: option.label, id: option.id })
  }))
}

export async function sendInteractiveMenu(socket, jid, { title, text, footer, options, quoted }) {
  const safeOptions = Array.isArray(options) ? options.filter(option => option?.label && option?.id) : []
  const fallback = buildTextFallback({ title, text, options: safeOptions })

  if (safeOptions.length === 0) {
    return socket.sendMessage(jid, { text: fallback }, { quoted })
  }

  try {
    return await socket.sendMessage(
      jid,
      { title, text, footer, interactiveButtons: buildQuickReplyButtons(safeOptions) },
      { quoted }
    )
  } catch {
    return socket.sendMessage(jid, { text: fallback }, { quoted })
  }
}
