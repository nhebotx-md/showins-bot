# Test Reply Lab

Kategori **Test Reply** adalah laboratorium untuk menguji gaya balasan WhatsApp sebelum sebuah desain dijadikan balasan default bot. Semua command di kategori ini memerlukan pengguna terdaftar; owner otomatis dapat mengaksesnya.

## Inventaris sumber ShooNhee-md

Penelusuran terhadap [`setreply.js`](https://github.com/nhebotx-md/ShooNhee-md/blob/main/plugins/owner/setreply.js) dan helper `m.reply` menemukan **9 varian reply yang dapat dipilih**. Repository lama juga memiliki 717 berkas plugin yang memakai pola `reply()`, 159 yang mengirim pesan langsung, dan 64 yang memakai `externalAdReply`; angka tersebut adalah penggunaan pola, bukan jumlah desain unik.

| Varian lama | Karakter utama | Status di Showins Test Reply |
|---|---|---|
| V1 Simple | Teks biasa yang mengutip pesan pengguna | Diadaptasi sebagai `.replyplain` |
| V2 Context | Teks dengan context preview ringkas | Diadaptasi sebagai `.replypreview` |
| V3 Forward | Preview dengan metadata forwarded/newsletter | Tidak diadopsi; metadata forwarded tidak diperlukan untuk uji desain |
| V4 Qkontak | Quoted reply dengan kontak buatan | Tidak diadopsi; Showins tidak meniru identitas kontak |
| V5 FakeTroli | Quote order/katalog buatan dan preview besar | Tidak diadopsi; Showins tidak membuat order/katalog palsu |
| V6 Hehe | Dokumen dengan caption serta quote kontak | Diadaptasi sebagai `.replydocument` tanpa quote kontak buatan |
| V7 Andalan | Quote pembayaran buatan dan preview | Tidak diadopsi; Showins tidak meniru pesan pembayaran |
| V8 Gambar panjang | Preview besar dengan informasi runtime | Dasar visual untuk preview dapat dikustomisasi kemudian |
| V9 Video GIF | Video/GIF dengan caption | Disiapkan untuk tahap berikutnya setelah aset media disetujui |

## Command uji yang tersedia

| Command | Gaya reply | Tujuan uji |
|---|---|---|
| `.replytest` | Menu native-flow | Membuka seluruh pilihan Test Reply |
| `.replyplain` | Quoted text + mention | Menguji format teks dasar |
| `.replypreview` | Context preview card | Menguji title, body, dan konteks preview |
| `.replymention` | Quoted mention | Menguji perhatian ke pengguna dalam grup/pribadi |
| `.replydocument` | Dokumen teks + caption | Menguji lampiran ringan tanpa aset eksternal |
| `.replyreaction` | Reaction lalu quoted reply | Menguji acknowledgement cepat |
| `.replybuttons` | Native-flow quick reply | Menguji tombol serta fallback teks |

Semua payload dibangun melalui `src/services/reply-showcase.js`. Kostumisasi berikutnya—misalnya thumbnail, gambar, GIF, atau branding—cukup dilakukan pada helper ini tanpa mengubah router command atau semua plugin uji.
