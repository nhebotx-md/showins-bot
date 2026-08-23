# Arsitektur Showins Bot

Showins Bot sengaja dibuat kecil, tetapi setiap tanggung jawab dipisahkan agar mudah dikembangkan tanpa mengganggu koneksi WhatsApp.

| Lokasi | Tanggung jawab | Kapan diubah |
|---|---|---|
| `config.js` | Nama bot, prefix, nomor pairing, dan mode | Saat menyiapkan bot untuk akun Anda |
| `src/core/baileys.js` | Satu-satunya adapter import ItsLiaaa Baileys dan identitas versinya | Saat library atau API koneksi diperbarui |
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
