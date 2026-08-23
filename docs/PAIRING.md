# Pairing Showins Bot

Showins Bot menggunakan **pairing code**, bukan QR. Dengan ItsLiaaa Baileys, kode 8 karakter diminta satu kali ketika socket memasuki status `connecting`, lalu ditampilkan dengan format yang jelas di terminal.

```text
[12:34:56] INFO   PAIRING CODE: ABCD1234
```

Masukkan kode baru itu melalui WhatsApp utama: **Perangkat tertaut → Tautkan perangkat → Tautkan dengan nomor telepon**. Kode lama dapat kedaluwarsa; gunakan selalu kode terakhir yang terminal tampilkan.

## Bila terminal menampilkan 405

`Handshake 405 sebelum pairing` berarti WhatsApp menolak registrasi Web sebelum pairing code dapat diselesaikan. Base bot menghentikan percobaan otomatis pada kondisi ini agar tidak membuat loop log yang membingungkan. Jangan hapus `storage/session/` berulang kali. Simpan bukti log, lalu perbarui library atau tunggu perubahan protokol WhatsApp.

## Catatan versi

Showins Bot memakai `@itsliaaa/baileys` versi `0.3.18-final`, rilis mod yang dipublikasikan pada 27 Juni 2026. Versi ini dipilih karena menyediakan alur pairing `connecting` yang didokumentasikan serta fitur pesan lanjutan seperti album, interactive message, rich response, code block, table, dan inline entities.
