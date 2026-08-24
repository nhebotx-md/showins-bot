# Arsitektur Showins Bot

Showins Bot sengaja dibuat kecil, tetapi setiap tanggung jawab dipisahkan agar mudah dikembangkan tanpa mengganggu koneksi WhatsApp.

| Lokasi | Tanggung jawab | Kapan diubah |
|---|---|---|
| `config.js` | Nama bot, prefix, nomor pairing, dan mode | Saat menyiapkan bot untuk akun Anda |
| `src/core/baileys.js` | Satu-satunya adapter import ItsLiaaa Baileys dan identitas versinya | Saat library atau API koneksi diperbarui |
| `src/core/logger.js` | Seluruh format dan klasifikasi logger terminal | Saat mengubah tampilan atau event log Termux |
| `src/core/access-control.js` | Deteksi nomor pengirim, peran, dan kebijakan akses command | Saat menambah level peran atau kebijakan akses |
| `src/core/plugin-categories.js` | Registry kategori, urutan, label, dan deskripsi kategori plugin | Saat menambah jenis fitur baru |
| `src/core/connection-manager.js` | Session, pairing, koneksi, dan reconnect | Hanya bila mengubah perilaku koneksi |
| `src/core/command-router.js` | Membaca pesan dan mengarahkan perintah ke plugin | Bila ingin mengubah format perintah |
| `plugins/` | Fitur bot yang berdiri sendiri | Lokasi utama untuk menambah fitur baru |
| `src/services/` | Pembantu yang dipakai banyak plugin | Untuk formatter, API, atau pesan kaya |
| `src/services/user-store.js` | Penyimpanan lokal pengguna terdaftar dan premium | Saat mengubah format data pengguna |
| `storage/session/` | Kredensial WhatsApp | Jangan diunggah atau dihapus kecuali recovery session |
| `docs/` | Panduan manusia | Saat ada perubahan cara penggunaan |

## Alur pesan

```text
WhatsApp → ConnectionManager → CommandRouter → Plugin → Balasan WhatsApp
```

## Aturan integrasi library

Showins Bot menggunakan `@itsliaaa/baileys` versi `0.3.18-final`. Modul inti mengimpor API library melalui `src/core/baileys.js`; plugin tidak boleh mengimpor library tersebut secara langsung. Aturan ini memisahkan kode fitur dari detail koneksi WhatsApp dan membuat migrasi API dapat diuji dengan lebih aman.

Pesan native-flow/interaktif dibungkus dalam `src/services/rich-messages.js`. Jika WhatsApp atau klien penerima menolak payload interaktif, adapter otomatis mengirim teks yang berisi perintah yang sama.

## Kontrak kategori plugin

Setiap plugin **wajib** memiliki `category` yang terdaftar di `src/core/plugin-categories.js`. Kategori yang tersedia saat ini adalah `main`, `tools`, `fun`, `group`, `media`, `owner`, dan `system`. Menu utama selalu memuat submenu dari seluruh kategori, termasuk kategori yang belum memiliki fitur; hal ini menjaga struktur navigasi tetap konsisten ketika plugin baru ditambahkan.

```js
export default {
  name: 'halo',
  category: 'tools',
  description: 'Menyapa pengguna.',
  commands: ['halo'],
  async execute({ reply }) {
    await reply('Halo dari Showins Bot.')
  }
}
```

Plugin `menu` menggunakan `src/services/plugin-menu.js` untuk membuat ringkasan kategori pada `.menu` dan detail perintah pada command `cat<kategori>`. Gunakan ID kategori huruf kecil tanpa spasi: `.catfun`, `.catgroup`, `.catowner`, `.cattools`, atau `.catsystem`. `src/core/command-router.js` mengenali alias tersebut dan meneruskannya ke plugin menu, sehingga setiap kategori memiliki halaman menu sendiri. Respons tombol `quick_reply` native-flow membawa alias yang sama dan diproses tanpa pengguna perlu mengetik ulang perintah.

## Membuat plugin baru

Buat satu berkas baru di `plugins/`, misalnya `plugins/halo.js`.

```js
export default {
  name: 'halo',
  category: 'fun',
  description: 'Contoh fitur sederhana.',
  commands: ['halo'],
  async execute({ reply }) {
    await reply('Halo dari plugin baru.')
  }
}
```

Setelah bot direstart, perintah `.halo` langsung tersedia. Tidak perlu mendaftarkan plugin ke file lain.

## Kontrak akses plugin

Selain `category`, setiap plugin **wajib** memiliki `access` dengan satu dari empat nilai: `public`, `registered`, `premium`, atau `owner`. `src/core/command-router.js` menentukan nomor pengirim dari chat pribadi atau peserta grup, lalu menguji peran sebelum memanggil `execute` plugin.

```js
export default {
  name: 'fitur-premium',
  category: 'fun',
  access: 'premium',
  description: 'Contoh fitur khusus premium.',
  commands: ['fiturpremium'],
  async execute({ reply }) {
    await reply('Fitur premium berjalan.')
  }
}
```

Nomor yang tercantum dalam `bot.ownerNumbers` pada `config.js` selalu berperan sebagai owner dan tidak ditulis ulang ke database pengguna. Pengguna lain dapat menjalankan `.register` untuk mendaftarkan nomornya; owner dapat memakai `.adduser`, `.addpremium`, `.delpremium`, serta `.users`. Database `storage/users.json` dibuat lokal, memakai penulisan atomik, dan diabaikan oleh Git.

Resolver identitas memprioritaskan `participantAlt` dan `remoteJidAlt` sebelum JID biasa agar nomor telepon tetap ditemukan ketika WhatsApp memakai identifier LID. Pesan yang ditandai `fromMe` diperlakukan sebagai owner karena berasal dari akun yang menautkan bot. Seluruh keputusan akses dilakukan oleh router sebelum plugin dijalankan.

## Logger aktivitas command

`src/core/logger.js` adalah satu-satunya modul yang membentuk keluaran terminal. Setelah loader selesai, `logger.startup()` membuat panel **Command Ledger** dengan jumlah keseluruhan plugin dan inventory jumlah plugin per kategori dari registry. Plugin loader tidak menulis satu baris untuk setiap plugin.

Router memanggil `logger.command()` hanya setelah parser menemukan command berprefix, dan memanggil `logger.reply()` hanya setelah respons teks atau interaktif berhasil dikirim. Karena pesan biasa berhenti sebelum tahap parser command, pesan tersebut tidak menghasilkan log aktivitas. Koneksi memakai `logger.connection()` dan pairing memakai `logger.pairing()`, sehingga status sistem tetap ringkas dan tidak bercampur dengan tabel command.

Sumber chat ditentukan dari JID tujuan: `@s.whatsapp.net`/`@lid` sebagai private, `@g.us` sebagai group, dan `@newsletter` sebagai channel. Tabel aktivitas memakai kolom `TIME`, `DIR`, `SOURCE`, `ROLE / RESULT`, dan `ACTION`; pengaturan lingkungan `NO_COLOR=1` menonaktifkan warna ANSI tanpa mengubah struktur data log.
