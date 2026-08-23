/**
 * Satu titik integrasi untuk ItsLiaaa Baileys.
 *
 * Simpan semua import library WhatsApp di modul ini agar perubahan versi atau
 * migrasi API di masa depan dapat diaudit tanpa mencari ke seluruh source.
 */
export const BAILEYS_INFO = Object.freeze({
  packageName: '@itsliaaa/baileys',
  displayName: 'ItsLiaaa Baileys',
  version: '0.3.18-final'
})

export {
  Browsers,
  delay,
  DisconnectReason,
  makeCacheableSignalKeyStore,
  makeWASocket,
  useMultiFileAuthState
} from '@itsliaaa/baileys'
