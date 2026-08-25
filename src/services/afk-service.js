function senderJid(message = {}) {
  return message.key?.participant || message.key?.remoteJid || ''
}

function mentionedJids(message = {}) {
  const source = message.message?.extendedTextMessage?.contextInfo || message.message?.imageMessage?.contextInfo || message.message?.videoMessage?.contextInfo || {}
  return Array.isArray(source.mentionedJid) ? source.mentionedJid : []
}

function numberFromJid(jid) {
  return String(jid).split('@')[0].split(':')[0]
}

export function formatAfkDuration(milliseconds) {
  const seconds = Math.max(0, Math.floor(milliseconds / 1000))
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  if (hours > 0) return `${hours} jam ${minutes % 60} menit`
  if (minutes > 0) return `${minutes} menit ${seconds % 60} detik`
  return `${seconds} detik`
}

export function createAfkService({ now = () => Date.now() } = {}) {
  const entries = new Map()
  return {
    set(jid, reason) {
      entries.set(jid, { reason: reason || 'Tidak ada alasan', startedAt: now() })
      return entries.get(jid)
    },
    get(jid) {
      return entries.get(jid) || null
    },
    clear(jid) {
      const entry = entries.get(jid) || null
      entries.delete(jid)
      return entry
    },
    async handleMessage({ socket, message, prefix }) {
      const sender = senderJid(message)
      const text = String(message.message?.conversation || message.message?.extendedTextMessage?.text || '').trim()
      if (!sender || text.toLowerCase().startsWith(`${prefix}afk`)) return false
      let responded = false
      const ownAfk = this.clear(sender)
      if (ownAfk) {
        const duration = formatAfkDuration(now() - ownAfk.startedAt)
        await socket.sendMessage(message.key.remoteJid, { text: `👋 @${numberFromJid(sender)} kembali dari AFK setelah *${duration}*.`, mentions: [sender] }, { quoted: message })
        responded = true
      }
      for (const mentioned of mentionedJids(message)) {
        const entry = this.get(mentioned)
        if (!entry) continue
        const duration = formatAfkDuration(now() - entry.startedAt)
        await socket.sendMessage(message.key.remoteJid, { text: `💤 @${numberFromJid(mentioned)} sedang AFK.\nAlasan: *${entry.reason}*\nSejak: *${duration}*`, mentions: [mentioned] }, { quoted: message })
        responded = true
      }
      return responded
    }
  }
}
