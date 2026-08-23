# Pairing Showins Bot

Showins Bot menggunakan **pairing code**, bukan QR. Kode 8 karakter diminta segera setelah socket dibuat dan ditampilkan dengan format yang jelas di terminal.

```text
[12:34:56] INFO   PAIRING CODE: ABCD1234
```

Masukkan kode baru itu melalui WhatsApp utama: **Perangkat tertaut → Tautkan perangkat → Tautkan dengan nomor telepon**. Kode lama dapat kedaluwarsa; gunakan selalu kode terakhir yang terminal tampilkan.

## Bila terminal menampilkan 405

`Handshake 405 sebelum pairing` berarti WhatsApp menolak registrasi Web sebelum pairing code dapat diselesaikan. Base bot menghentikan percobaan otomatis pada kondisi ini agar tidak membuat loop log yang membingungkan. Jangan hapus `storage/session/` berulang kali. Simpan bukti log, lalu perbarui library atau tunggu perubahan protokol WhatsApp.

## Catatan versi

Showins Bot memakai versi kompatibel bawaan Baileys mod, bukan versi Web yang diambil dinamis pada setiap startup. Keputusan ini mengurangi risiko meniru versi Web yang baru dirilis tetapi belum sepenuhnya didukung oleh library.
