/**
 * Adapter pesan kaya milik Baileys mod. Bila klien penerima tidak mendukung
 * interaktif, fallback teks tetap dikirim sehingga menu tidak pernah hilang.
 */
export async function sendInteractiveMenu(socket, jid, { title, text, footer, options, quoted }) {
  const interactiveButtons = options.map(option => ({
    name: 'quick_reply',
    buttonParamsJson: JSON.stringify({ display_text: option.label, id: option.id })
  }))

  try {
    return await socket.sendMessage(
      jid,
      { title, text, footer, interactiveButtons },
      { quoted }
    )
  } catch {
    const fallback = [title, text, '', ...options.map(option => `• ${option.label}: ${option.id}`)].join('\n')
    return socket.sendMessage(jid, { text: fallback }, { quoted })
  }
}
