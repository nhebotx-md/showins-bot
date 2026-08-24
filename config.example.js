/**
 * Salin berkas ini menjadi `config.js`, lalu isi nomor dan preferensi Anda.
 * `config.js` sengaja tidak dikirim ke GitHub agar data pemilik tetap privat.
 */
export default {
  bot: {
    name: 'Showins Bot',
    prefix: '.',
    ownerNumbers: ['6281234567890'],
    mode: 'public'
  },

  data: {
    // Database lokal pengguna terdaftar dan premium. Berkas ini tidak masuk Git.
    userStorePath: './storage/users.json'
  },

  connection: {
    // Nomor WhatsApp utama: hanya angka, format negara Indonesia 628xxxx.
    pairingNumber: '6281234567890',
    usePairingCode: true,
    authDir: './storage/session',

    // Fingerprint ini dipilih untuk runtime Linux/Ubuntu proot.
    browser: {
      platform: 'ubuntu',
      name: 'Chrome'
    },

    markOnlineOnConnect: false,
    syncFullHistory: false,
    reconnect: {
      maxAttempts: 5,
      baseDelayMs: 4_000
    }
  }
}
