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
│   ├── core/             # Adapter Baileys, koneksi, session, router, dan loader plugin
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
| `.menu` atau `.help` | Menu utama berisi seluruh submenu kategori |
| `.catfun` | Membuka menu kategori Fun |
| `.catgroup` | Membuka menu kategori Grup |
| `.catowner` | Membuka menu kategori Owner |
| `.cat<kategori>` | Membuka menu kategori lain, misalnya `.cattools` atau `.catsystem` |
| `.register` | Mendaftarkan nomor sendiri sebagai pengguna bot |
| `.ping` | Menguji respons bot |
| `.status` atau `.info` | Melihat status runtime |
| `.premium` | Contoh fitur kategori Fun untuk pengguna premium |
| `.adduser <nomor>` | Mendaftarkan pengguna secara manual — khusus owner |
| `.addpremium <nomor>` | Memberikan premium — khusus owner |
| `.delpremium <nomor>` | Mencabut premium — khusus owner |
| `.users` | Melihat daftar pengguna — khusus owner |

Menu utama memuat submenu untuk seluruh kategori: **Utama**, **Tools**, **Fun**, **Grup**, **Media**, **Owner**, dan **Sistem**. Setiap tombol menjalankan command `cat<kategori>` dan menampilkan menu kategori masing-masing. Kategori yang belum memiliki plugin akan tetap terbuka, tetapi menampilkan pemberitahuan bahwa belum ada fitur aktif.

## Akses owner, premium, dan pengguna

Bot membaca `bot.ownerNumbers` dari `config.js`; nomor tersebut langsung dianggap **owner** dan tidak perlu menjalankan registrasi. Data pengguna disimpan lokal di `storage/users.json`, yang otomatis dibuat saat bot dijalankan dan tidak pernah masuk Git.

| Peran | Cara dikenali | Akses |
|---|---|---|
| **Owner** | Nomor ada di `bot.ownerNumbers` | Seluruh command, termasuk pengelolaan pengguna dan premium. |
| **Premium** | Pengguna terdaftar dengan status premium | Command `registered`, `premium`, dan `public`. |
| **Terdaftar** | Nomor ada di database pengguna | Command `registered` dan `public`. |
| **Belum terdaftar** | Nomor tidak ditemukan di database | Menu kategori dan `.register`; command lain ditolak otomatis. |

Setiap plugin wajib menentukan `access`: `public`, `registered`, `premium`, atau `owner`. Menu tetap dapat dilihat siapa pun, tetapi command yang terkunci diberi penanda peran yang dibutuhkan.

Deteksi identitas mendukung chat pribadi dan grup, termasuk JID alternatif pada mode privasi LID. Command yang dikirim dari akun WhatsApp yang menautkan bot (`fromMe`) selalu diperlakukan sebagai **owner**. Untuk command owner dari nomor lain, nomor tersebut harus ada di `bot.ownerNumbers` dalam format `628...`.

## Menambah fitur tanpa mengubah inti bot

Buat berkas baru di `plugins/`. Contoh paling kecil:

```js
export default {
  name: 'halo',
  category: 'tools',
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

`npm run check` memeriksa sintaks seluruh berkas JavaScript di `src/`, `plugins/`, dan `test/`. Pengujian memastikan nomor pairing dibersihkan dengan benar, plugin dasar termuat, source tidak mengirim kode pairing kustom, adapter pusat tetap menunjuk **ItsLiaaa Baileys `0.3.18-final`**, serta menu interaktif selalu memiliki fallback teks.

## Logger terminal Termux

Semua log terminal dikendalikan dari satu file: `src/core/logger.js`. Saat startup, desain **Command Ledger** menggunakan frame runtime, badge inventory kategori, dan panel aktivitas terpisah agar informasi dapat dipindai cepat pada layar Termux. Panel menampilkan total plugin aktif dan count seluruh kategori—termasuk kategori yang masih bernilai `0`—tanpa lagi mencetak satu baris per plugin. Logger aktivitas hanya bekerja setelah router mengenali command berprefix, sehingga chat biasa, media biasa, atau percakapan yang bukan command **tidak dicetak** ke terminal.

| Bagian terminal | Makna |
|---|---|
| `FEATURE INVENTORY` | Badge count plugin pada Utama, Tools, Fun, Grup, Media, Owner, dan Sistem, serta total keseluruhannya. |
| `LIVE ACTIVITY` | Panel terpisah dengan garis kolom konsisten: `TIME │ FLOW │ CONTEXT │ ACTION`. `USER → BOT` berarti bot menerima command; `BOT → USER` berarti bot berhasil membalas. |
| `PRIVATE / GROUP / CHANNEL` | Pada baris masuk, menunjukkan asal command serta role pengirim. Pada baris keluar, logger menampilkan `DELIVERED → target`. |
| `CONNECTION` | Status koneksi ringkas, termasuk connecting, pairing, connected, dan reconnecting. |

Setiap command menghasilkan pasangan visual. Baris pertama menunjukkan **USER → BOT**, sumber dan role, lalu command. Baris kedua hanya muncul setelah pengiriman sukses sebagai **BOT → USER** dengan status `DELIVERED → target`; nomor target chat pribadi disamarkan agar tidak memenuhi terminal. Warna ANSI dipakai secara terbatas untuk hierarchy: cyan bagi frame, magenta bagi inventory, hijau untuk command, biru untuk respons, dan kuning/merah untuk status perhatian atau kegagalan. Atur `NO_COLOR=1` bila menginginkan keluaran tanpa warna.

## Pengembangan dengan ItsLiaaa Baileys

Semua import koneksi WhatsApp dipusatkan pada `src/core/baileys.js`. Ketika akan memakai kemampuan library—misalnya media, grup, album, atau interactive/native-flow message—gunakan adapter layanan di `src/services/` atau tambahkan adapter baru. Jangan mengimpor library langsung dari plugin agar perubahan API dapat diaudit di satu tempat.

| Kebutuhan | Lokasi pengembangan |
|---|---|
| Session, pairing, reconnect | `src/core/connection-manager.js` |
| Import dan versi library | `src/core/baileys.js` |
| Quick reply dan fallback | `src/services/rich-messages.js` |
| Perintah bot | `plugins/` |

## Batas penggunaan

Showins Bot terhubung melalui WhatsApp Web dan bukan produk resmi WhatsApp. Gunakan hanya pada akun yang Anda kelola, hindari spam atau pengiriman massal, dan patuhi ketentuan layanan WhatsApp. Session di `storage/session/` bersifat sangat sensitif—jangan pernah dibagikan atau diunggah ke repository.

## Library

Proyek menggunakan [ItsLiaaa Baileys](https://github.com/itsliaaa/baileys) versi `0.3.18-final`. Library ini menyediakan dukungan fitur pesan yang lebih luas, termasuk pesan interaktif, album, rich response, code block, tabel, pembayaran, dan fitur WhatsApp Business. [1]

### Referensi

[1]: https://github.com/itsliaaa/baileys "ItsLiaaa Baileys — fitur dan dokumentasi"
