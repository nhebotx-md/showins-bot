import {
  Browsers,
  delay,
  DisconnectReason,
  makeCacheableSignalKeyStore,
  makeWASocket,
  useMultiFileAuthState
} from './baileys.js'
import pino from 'pino'
import { normalizePhoneNumber } from './config.js'

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
    const browser = this.config.connection.browser || {}

    this.logger.info('Membuat koneksi WhatsApp dengan versi kompatibel bawaan ItsLiaaa Baileys')

    // Jangan gunakan pencarian versi Web dinamis di sini. Server WhatsApp dapat
    // menolak versi Web yang baru dirilis sebelum Baileys mod menyesuaikannya.
    const socket = makeWASocket({
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

    this.socket = socket
    socket.ev.on('creds.update', saveCreds)
    socket.ev.on('messages.upsert', update => this.onMessages({ socket, messages: update.messages }))
    socket.ev.on('connection.update', update => this.handleConnectionUpdate(update, state, socket))

  }

  async requestPairingCode(socket, state) {
    const number = normalizePhoneNumber(this.config.connection.pairingNumber)
    if (!number) {
      this.logger.error('Nomor pairing belum diatur pada config.js')
      return
    }

    if (this.pairingRequested || state.creds.registered || socket !== this.socket) return

    this.pairingRequested = true
    this.logger.info({ number }, 'Meminta pairing code resmi dari WhatsApp')

    try {
      await delay(1_500)
      const code = await socket.requestPairingCode(number)
      if (socket !== this.socket || this.stopped) return
      this.onPairingCode(code)
    } catch (error) {
      this.pairingRequested = false
      this.logger.error({ err: error }, 'Permintaan pairing code ditolak sebelum kode diterbitkan')
    }
  }

  async handleConnectionUpdate(update, state, socket) {
    const { connection, lastDisconnect } = update
    if (socket !== this.socket || this.stopped) return

    if (connection === 'open') {
      this.reconnectAttempts = 0
      this.pairingRequested = false
      this.logger.info('CONNECTED — Showins Bot siap menerima perintah')
      return
    }

    if (connection === 'connecting' && this.config.connection.usePairingCode && !state.creds.registered) {
      void this.requestPairingCode(socket, state)
      return
    }

    if (connection !== 'close') return

    const statusCode = getStatusCode(lastDisconnect)
    const loggedOut = statusCode === DisconnectReason.loggedOut
    const maxAttempts = this.config.connection.reconnect.maxAttempts

    if (statusCode === 405 && !state.creds.registered) {
      this.logger.error(
        { statusCode },
        'Handshake 405 sebelum pairing. Bot berhenti agar tidak membuat loop; periksa versi library atau tunggu perbaikan protokol.'
      )
      return
    }

    if (loggedOut) {
      this.logger.error({ statusCode }, 'Session keluar. Backup lalu hapus hanya storage/session sebelum pairing ulang.')
      return
    }

    if (this.reconnectAttempts >= maxAttempts) {
      this.logger.error({ statusCode, maxAttempts }, 'Batas reconnect tercapai. Bot berhenti tanpa loop.')
      return
    }

    this.reconnectAttempts += 1
    const delayMs = this.config.connection.reconnect.baseDelayMs * this.reconnectAttempts
    this.logger.warn({ statusCode, attempt: this.reconnectAttempts, delayMs }, 'Koneksi putus; menjadwalkan reconnect')
    setTimeout(() => {
      if (!this.stopped && socket === this.socket) void this.connect()
    }, delayMs)
  }
}
