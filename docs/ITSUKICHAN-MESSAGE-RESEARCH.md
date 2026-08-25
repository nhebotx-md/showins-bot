# Riset Model Pesan Itsukichan Baileys

Dokumentasi paket Itsukichan Baileys mencantumkan model pesan non-media seperti quote, mention, reaction, lokasi, kontak, poll, order/product/payment, berbagai tombol, dan interactive message; juga model media seperti GIF, video, audio, image, album, PTV, serta view-once. Referensi ini digunakan sebagai inspirasi kemampuan, bukan alasan untuk mengganti library runtime Showins Bot.[1]

Showins tetap menggunakan `@itsliaaa/baileys`. Hanya payload yang dapat diuji dengan adapter aktif dan yang tidak menyamar sebagai identitas, pembayaran, atau transaksi pihak lain yang akan ditambahkan ke Reply Lab.

| Model Itsukichan yang diteliti | Arah evaluasi Showins |
|---|---|
| Quote, mention, reaction, interactive button | Sudah tersedia atau menjadi basis pengujian reply saat ini |
| Poll, contact, location | Kandidat payload non-deceptive untuk command uji tambahan |
| Album, PTV, view-once, GIF | Memerlukan aset media dan akan dipisahkan dari test teks agar tidak membebani Termux |
| Product, order, payment, invite | Tidak digunakan sebagai reply demo karena berisiko menyerupai transaksi atau identitas nyata |

## Model yang diadaptasi

Tiga model non-media telah diadaptasi setelah pemeriksaan source ItsLiaaa lokal menemukan penanganan `pollCreationMessage`, `contactsArrayMessage`, dan `locationMessage` pada jalur kirim pesan. Setiap model memakai fallback teks apabila klien penerima menolak payload.

| Command | Payload | Perilaku aman |
|---|---|---|
| `.replypoll` | Poll dengan tiga pilihan gaya reply | Tidak mengumpulkan data atau memicu tindakan otomatis |
| `.replylocation` | Location dengan koordinat demonstrasi `0,0` | Menegaskan bahwa ini bukan lokasi pengguna |
| `.replycontact` | Kartu kontak dari nomor pairing bot | Hanya memuat nomor bot yang sudah digunakan pada chat, bukan kontak pihak lain |

## Referensi

[1]: https://github.com/Itsukichann/Baileys "Itsukichann/Baileys — README dan indeks model pesan"
