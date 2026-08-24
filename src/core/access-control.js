import { normalizePhoneNumber } from './config.js'

export const ACCESS_LEVELS = Object.freeze({
  public: 0,
  registered: 1,
  premium: 2,
  owner: 3
})

const ROLE_LABELS = Object.freeze({
  guest: 'belum terdaftar',
  registered: 'terdaftar',
  premium: 'premium',
  owner: 'owner'
})

function phoneNumberFromJid(jid = '') {
  const normalizedJid = String(jid).trim().toLowerCase()
  if (!normalizedJid.endsWith('@s.whatsapp.net') && !normalizedJid.endsWith('@c.us')) return ''
  return normalizePhoneNumber(normalizedJid.split('@')[0].split(':')[0])
}

export function getSenderNumbers(message) {
  const key = message?.key || {}
  const candidates = [key.participantAlt, key.remoteJidAlt, key.participant, key.remoteJid]
    .map(phoneNumberFromJid)
    .filter(number => number.length >= 8)

  return [...new Set(candidates)]
}

export function getSenderNumber(message) {
  return getSenderNumbers(message)[0] || ''
}

export function resolveUserRole({ config, userStore, message, senderNumber, senderNumbers }) {
  // WhatsApp menandai pesan yang dikirim dari akun yang menautkan bot sebagai
  // fromMe. Command dari akun tersebut harus selalu diperlakukan sebagai owner.
  if (message?.key?.fromMe) return 'owner'

  const normalizedNumbers = (senderNumbers || (senderNumber ? [senderNumber] : getSenderNumbers(message)))
    .map(normalizePhoneNumber)
    .filter(number => number.length >= 8)
  const ownerNumbers = new Set((config.bot.ownerNumbers || []).map(normalizePhoneNumber))

  if (normalizedNumbers.some(number => ownerNumbers.has(number))) return 'owner'

  const users = normalizedNumbers.map(number => userStore?.get(number)).filter(Boolean)
  if (users.some(user => user.premium)) return 'premium'
  if (users.length > 0) return 'registered'
  return 'guest'
}

export function canAccess(role, requiredAccess = 'registered') {
  if (requiredAccess === 'public') return true
  const effectiveAccess = role === 'guest' ? 'public' : role
  return ACCESS_LEVELS[effectiveAccess] >= ACCESS_LEVELS[requiredAccess]
}

export function getAccessLabel(requiredAccess = 'registered') {
  return ROLE_LABELS[requiredAccess] || requiredAccess
}
