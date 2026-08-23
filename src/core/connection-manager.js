import {
  Browsers,
  DisconnectReason,
  fetchLatestBaileysVersion,
  makeCacheableSignalKeyStore,
  makeWASocket,
  useMultiFileAuthState
} from '@itsukichan/baileys'
import pino from 'pino'
import { normalizePhoneNumber } from './config.js'

const wait = milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds))

function getStatusCode(lastDisconnect) {
  return (
    lastDisconnect?.error?.output?.statusCode ||
    lastDisconnect?.error?.statusCode ||
    lastDisconnect?.error?.data?.statusCode ||
    0
  )
}

export class ConnectionManager {
  constructor({ config, logger, onMessages, onPairingCode }) {
    this.config = config
    this.logger = logger
    this.onMessages = onMessages
    this.onPairingCode = onPairingCode
    this.socket = null
    this.stopped = false
    this.reconnectAttempts = 0
    this.pairingRequested = false
  }

  async start() {
    this.stopped = false
    await this.connect()
  }

  async stop() {
    this.stopped = true
    this.socket?.ws?.close()
    this.socket = null
  }

  async connect() {
    const { state, saveCreds } = await useMultiFileAuthState(this.config.connection.authDir)
    const { version, isLatest } = await fetchLatestBaileysVersion()
    this.logger.info({ version, isLatest }, 'Membuat koneksi WhatsApp')

    const browser = this.config.connection.browser || {}
    this.socket = makeWASocket({
      version,
      auth: {
        creds: state.creds,
        keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'silent' }))
      },
      browser: Browsers.ubuntu(browser.name || 'Chrome'),
      logger: pino({ level: 'silent' }),
      printQRInTerminal: false,
      markOnlineOnConnect: Boolean(this.config.connection.markOnlineOnConnect),
      syncFullHistory: Boolean(this.config.connection.syncFullHistory),
      connectTimeoutMs: 60_000,
      defaultQueryTimeoutMs: undefined,
      generateHighQualityLinkPreview: true
    })

    this.socket.ev.on('creds.update', saveCreds)
    this.socket.ev.on('messages.upsert', this.onMessages)
    this.socket.ev.on('connection.update', update => this.handleConnectionUpdate(update, state))
  }

  async handleConnectionUpdate(update, state) {
    const { connection, lastDisconnect, qr } = update

    if (
      qr &&
      this.config.connection.usePairingCode &&
      !state.creds.registered &&
      !this.pairingRequested
    ) {
      const number = normalizePhoneNumber(this.config.connection.pairingNumber)
      if (!number) {
        this.logger.error('Nomor pairing belum diatur pada config.js')
        return
      }

      this.pairingRequested = true
      try {
        await wait(2_500)
        // Biarkan library menghasilkan kode resmi WhatsApp. Jangan memaksa kode kustom.
        const code = await this.socket.requestPairingCode(number)
        this.logger.info({ number }, 'Kode pairing berhasil diminta dari WhatsApp')
        this.onPairingCode(code)
      } catch (error) {
        this.pairingRequested = false
        this.logger.error({ err: error }, 'Gagal meminta pairing code')
      }
    }

    if (connection === 'open') {
      this.reconnectAttempts = 0
      this.pairingRequested = false
      this.logger.info('CONNECTED — Showins Bot siap menerima perintah')
      return
    }

    if (connection !== 'close' || this.stopped) return

    const statusCode = getStatusCode(lastDisconnect)
    const loggedOut = statusCode === DisconnectReason.loggedOut
    const maxAttempts = this.config.connection.reconnect.maxAttempts

    if (loggedOut) {
      this.logger.error({ statusCode }, 'Session keluar. Hapus hanya storage/session lalu lakukan pairing ulang.')
      return
    }

    if (this.reconnectAttempts >= maxAttempts) {
      this.logger.error(
        { statusCode, maxAttempts },
        'Batas reconnect tercapai. Periksa jaringan dan session sebelum mencoba lagi.'
      )
      return
    }

    this.reconnectAttempts += 1
    const delayMs = this.config.connection.reconnect.baseDelayMs * this.reconnectAttempts
    this.logger.warn({ statusCode, attempt: this.reconnectAttempts, delayMs }, 'Koneksi putus; mencoba lagi')
    await wait(delayMs)
    if (!this.stopped) await this.connect()
  }
}
