# Arsitektur Showins Bot

Showins Bot sengaja dibuat kecil, tetapi setiap tanggung jawab dipisahkan agar mudah dikembangkan tanpa mengganggu koneksi WhatsApp.

| Lokasi | Tanggung jawab | Kapan diubah |
|---|---|---|
| `config.js` | Nama bot, prefix, nomor pairing, dan mode | Saat menyiapkan bot untuk akun Anda |
| `src/core/baileys.js` | Satu-satunya adapter import ItsLiaaa Baileys dan identitas versinya | Saat library atau API koneksi diperbarui |
| `src/core/plugin-categories.js` | Registry kategori, urutan, label, dan deskripsi kategori plugin | Saat menambah jenis fitur baru |
| `src/core/connection-manager.js` | Session, pairing, koneksi, dan reconnect | Hanya bila mengubah perilaku koneksi |
| `src/core/command-router.js` | Membaca pesan dan mengarahkan perintah ke plugin | Bila ingin mengubah format perintah |
| `plugins/` | Fitur bot yang berdiri sendiri | Lokasi utama untuk menambah fitur baru |
| `src/services/` | Pembantu yang dipakai banyak plugin | Untuk formatter, API, atau pesan kaya |
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

Setiap plugin **wajib** memiliki `category` yang terdaftar di `src/core/plugin-categories.js`. Kategori yang tersedia saat ini adalah `main`, `tools`, `group`, `media`, `owner`, dan `system`. Menu hanya menampilkan kategori yang memiliki minimal satu plugin aktif; karena itu kategori baru akan muncul otomatis setelah plugin pertama ditambahkan.

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

Plugin `menu` menggunakan `src/services/plugin-menu.js` untuk membuat ringkasan kategori pada `.menu` dan detail perintah pada `.menu <kategori>`. Gunakan ID kategori huruf kecil, misalnya `.menu tools` atau `.menu system`. Respons tombol `quick_reply` native-flow juga diparsing oleh `src/core/command-router.js`, sehingga pilihan kategori dapat ditekan langsung tanpa mengetik ulang perintah.

## Membuat plugin baru

Buat satu berkas baru di `plugins/`, misalnya `plugins/halo.js`.

```js
export default {
  name: 'halo',
  description: 'Contoh fitur sederhana.',
  commands: ['halo'],
  async execute({ reply }) {
    await reply('Halo dari plugin baru.')
  }
}
```

Setelah bot direstart, perintah `.halo` langsung tersedia. Tidak perlu mendaftarkan plugin ke file lain.
