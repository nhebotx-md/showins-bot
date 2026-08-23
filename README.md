# Showins Bot

> **Base WhatsApp bot yang ringkas, modular, dan mudah dikembangkan dari Termux.**

Showins Bot adalah fondasi baru untuk bot WhatsApp pribadi. Proyek ini memakai **ItsLiaaa Baileys** versi `0.3.18-final`, mod aktif dengan fitur pesan lanjutan dan alur pairing yang terdokumentasi. Fondasinya sengaja sederhana: koneksi yang terisolasi, konfigurasi yang jelas, plugin mandiri, log rapi, serta pengujian dasar.

## Mengapa base ini berbeda?

| Prinsip | Implementasi |
|---|---|
| **Stabil** | Reconnect memiliki batas; session tidak pernah dihapus otomatis; 405 sebelum pairing dihentikan tanpa loop. |
| **Aman untuk pairing** | Ubuntu Chrome fingerprint dan kode pairing asli dari WhatsApp; tidak ada kode custom yang dipaksakan. |
| **Mudah dipahami** | Satu plugin = satu berkas. Perintah otomatis terdaftar saat plugin berada di folder `plugins/`. |
| **Siap fitur pesan kaya** | Adapter disediakan untuk quick reply; Baileys mod mendukung album, interactive message, rich response, code block, table, sticker pack, dan fitur bisnis lain. |
| **Lokal terlebih dahulu** | Dibuat untuk Termux/Ubuntu proot tanpa dashboard atau layanan tambahan. |

## Struktur proyek

```text
showins-bot/
├── config.example.js     # Contoh pengaturan yang aman untuk dibagikan
├── config.js             # Pengaturan pribadi Anda (tidak masuk Git)
├── plugins/              # Tambahkan fitur bot di sini
├── src/
│   ├── core/             # Koneksi, session, router perintah, dan loader plugin
│   ├── services/         # Pembantu pesan kaya dan layanan bersama
│   └── index.js          # Titik mulai bot
├── storage/session/      # Session WhatsApp (tidak masuk Git)
├── docs/                 # Panduan Termux dan arsitektur
└── test/                 # Pengujian dasar
```

## Memulai cepat

```bash
git clone https://github.com/nhebotx-md/showins-bot.git
cd showins-bot
bash scripts/install-termux.sh
npm start
```

Installer membuat `config.js` jika belum ada, memasang dependency, dan menjalankan pemeriksaan awal. Sebelum `npm start`, edit `config.js` dan isi `connection.pairingNumber` dengan nomor akun WhatsApp utama Anda dalam format `628xxxxxxxxxx`. Saat socket berstatus `connecting`, terminal meminta pairing code satu kali dan menampilkannya dengan jelas.

Untuk panduan Termux lengkap, buka [docs/TERMUX.md](docs/TERMUX.md). Untuk memahami folder dan cara membuat fitur baru, buka [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

## Perintah yang tersedia

| Perintah | Fungsi |
|---|---|
| `.menu` atau `.help` | Menu dan ringkasan fitur dasar |
| `.ping` | Menguji respons bot |
| `.status` atau `.info` | Melihat status runtime |

## Menambah fitur tanpa mengubah inti bot

Buat berkas baru di `plugins/`. Contoh paling kecil:

```js
export default {
  name: 'halo',
  description: 'Contoh plugin.',
  commands: ['halo'],
  async execute({ reply }) {
    await reply('Halo dari Showins Bot.')
  }
}
```

Restart bot, lalu gunakan `.halo`. Plugin dimuat otomatis.

## Kualitas dan pemeriksaan

```bash
npm run check
npm test
npm run inspect
```

Pengujian memastikan nomor pairing dibersihkan dengan benar, plugin dasar termuat, source tidak mengirim kode pairing kustom, serta dependency mod menyediakan API yang dipakai bot.

## Batas penggunaan

Showins Bot terhubung melalui WhatsApp Web dan bukan produk resmi WhatsApp. Gunakan hanya pada akun yang Anda kelola, hindari spam atau pengiriman massal, dan patuhi ketentuan layanan WhatsApp. Session di `storage/session/` bersifat sangat sensitif—jangan pernah dibagikan atau diunggah ke repository.

## Library

Proyek menggunakan [ItsLiaaa Baileys](https://github.com/itsliaaa/baileys) versi `0.3.18-final`. Library ini menyediakan dukungan fitur pesan yang lebih luas, termasuk pesan interaktif, album, rich response, code block, tabel, pembayaran, dan fitur WhatsApp Business. [1]

### Referensi

[1]: https://github.com/itsliaaa/baileys "ItsLiaaa Baileys — fitur dan dokumentasi"
