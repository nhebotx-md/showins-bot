# Respons Visual Showins Bot

Showins Bot menerapkan **wrapper respons terpusat** agar balasan command, error akses, fallback menu, hasil quiz, notifikasi AFK, dan sambutan grup tampil konsisten. Setiap balasan yang merespons pesan pengguna tetap memakai quote terhadap pesan pemicu yang sebenarnya.

## Bentuk respons

Setiap pesan teks atau caption respons memakai header berikut sebelum isi command.

```text
╭─〔 Showins Bot 〕
│ RESPONS OTOMATIS · membalas pesan Anda
╰────────────────────

<isi respons command>
```

Selain header teks, payload membawa kartu context preview dengan nama **Showins Bot** dan tautan sumber yang dikonfigurasi. Kartu ini hanya menjelaskan bahwa respons berasal dari bot; kartu tidak menyatakan verifikasi platform, bukan message forward, dan bukan kontak pihak ketiga.

| Jalur respons | Perilaku visual | Quote asli |
|---|---|---|
| Command teks, penolakan akses, dan error | Header + context preview Showins Bot | Ya |
| `sendResponse` untuk pesan kaya | Caption/teks diberi header; context preview hanya ditambahkan bila plugin belum menyetel preview sendiri | Ya |
| Menu quick reply | Payload interaktif diberi context preview; fallback teks juga diberi header | Ya |
| Hasil quiz, AFK | Header + context preview | Ya |
| Sambutan/pamitan grup | Header + context preview | Tidak ada pesan pengguna yang dapat di-quote pada event peserta |
| Reaksi dan penghapusan pesan | Aksi protokol, tanpa badan teks | Reaksi mengarah ke pesan pemicu |

## Konfigurasi

Tambahkan atau sesuaikan bagian berikut pada `config.js`. Salin strukturnya dari `config.example.js`; jangan mengunggah `config.js` ke Git.

```js
bot: {
  name: 'Showins Bot',
  responseBranding: {
    enabled: true,
    label: 'RESPONS OTOMATIS',
    sourceUrl: 'https://github.com/nhebotx-md/showins-bot',
    thumbnailUrl: 'https://raw.githubusercontent.com/nhebotx-md/showins-bot/main/assets/showins-response-card.png'
  }
}
```

Atur `enabled: false` untuk memakai tampilan teks lama tanpa wrapper. `name`, `label`, `sourceUrl`, dan `thumbnailUrl` harus mengidentifikasi bot atau sumber yang memang Anda kelola. `thumbnailUrl` bersifat opsional; bila diisi, kartu preview dapat menampilkan aset visual asli Showins Bot.

## Struktur pengembangan lokal

Semua pembungkus dan gaya respons berada di `src/services/responses/`, sehingga perubahan visual tidak perlu mencampur logika router, akses plugin, atau koneksi WhatsApp.

| Lokasi | Kegunaan |
|---|---|
| `src/services/responses/branding.js` | Membuat header teks, context preview, dan konfigurasi kartu visual. |
| `src/services/responses/index.js` | Facade import stabil untuk command router dan layanan otomatis. |
| `src/services/responses/README.md` | Panduan singkat untuk menambah variasi respons baru secara lokal. |

Untuk menambah variasi tampilan, buat modul baru pada folder tersebut lalu ekspor melalui `index.js`. Dengan cara ini, plugin tetap memanggil `reply`, `sendMenu`, atau `sendResponse` seperti biasa dan tidak perlu mengetahui detail desain pesan.

## Dokumen dan kartu kontak

Reply Lab tetap memiliki contoh **dokumen nyata** dengan isi, tipe MIME, nama berkas, dan caption yang akurat. Kartu kontak hanya boleh memuat nomor bot sendiri yang dikonfigurasi. Jangan mengubah payload menjadi forward palsu, kartu kontak yang menyamar sebagai pihak lain, tanda verified yang tidak resmi, atau dokumen yang nama dan isi sebenarnya tidak sesuai.

## Pemeriksaan

```bash
npm run check
npm test
npm run inspect
```

Regresi memeriksa bahwa branding mempertahankan isi respons, tidak menggantikan preview jujur dari plugin, tidak membentuk atribut forwarded, serta diterapkan pada router, quiz, AFK, dan sambutan grup.
