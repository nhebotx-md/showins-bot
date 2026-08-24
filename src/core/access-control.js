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

export function getSenderNumber(message) {
  const senderJid = message?.key?.participant || message?.key?.remoteJid || ''
  return normalizePhoneNumber(senderJid.split('@')[0].split(':')[0])
}

export function resolveUserRole({ config, userStore, senderNumber }) {
  const normalizedNumber = normalizePhoneNumber(senderNumber)
  const ownerNumbers = new Set((config.bot.ownerNumbers || []).map(normalizePhoneNumber))

  if (ownerNumbers.has(normalizedNumber)) return 'owner'

  const user = userStore?.get(normalizedNumber)
  if (user?.premium) return 'premium'
  if (user) return 'registered'
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
