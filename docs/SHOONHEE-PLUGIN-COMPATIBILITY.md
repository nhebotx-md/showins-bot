# Peta Kompatibilitas Plugin ShooNhee-md

Dokumen ini mencatat hasil checker statis terhadap commit `e95f25a` dari repository sumber ShooNhee-md. Checker membaca **749** berkas JavaScript pada `plugins/` tanpa mengimpor atau menjalankan plugin. Hal ini penting karena kontrak ShooNhee-md (`config` dan `handler(m, { sock })`) berbeda dari kontrak Showins Bot (`default export`, `commands`, `access`, dan `execute(context)`).

> Plugin tidak dipindahkan sebagai source mentah. Setiap fitur diadaptasi ke kontrak Showins Bot agar kontrol akses, logger Command Ledger, fallback pesan, dan quote pesan tetap konsisten.

| Kelompok sumber | Tujuan Showins Bot | Status adaptasi | Pertimbangan |
|---|---|---|---|
| `cek/` dan bagian lokal `fun/` | `plugins/fun/` | Siap diadaptasi | Respons teks deterministik/acak dapat memakai quote bawaan router. Konten seksual, diagnosis mental, atau klaim hidup tidak diikutkan. |
| `game/` | `plugins/fun/` dengan mesin sesi terpisah | Perlu fondasi | Banyak wrapper memakai mesin quiz bersama, state per chat, jawaban quote, hint, dan timeout. |
| `group/` | `plugins/group/` | Diadaptasi selektif | Command moderasi dan konfigurasi grup yang aman memakai guard konteks, penyimpanan lokal, serta event peserta grup. |
| `tools/`, `utility/`, `info/` | `plugins/tools/` | Selektif | Utilitas lokal dapat diadaptasi; operasi file, proses sistem, dan layanan jaringan harus ditinjau satu per satu. |
| `media/`, `sticker/`, `download/` | `plugins/media/` | Memerlukan adapter | Memerlukan validasi media, batas ukuran, dan/atau layanan eksternal yang terkonfigurasi. |
| `testbutton/` dan pola reply | `plugins/testreply/` | Selektif | Hanya quote asli, rich preview yang jujur, reaksi, poll, lokasi demo, dan interaktif dengan fallback teks. |
| `rpg/`, `clan/`, `finance/` | Belum diaktifkan | Memerlukan model data | Bergantung pada ekonomi, inventaris, clan, atau layanan finansial; tidak dapat dipindah sebagai plugin mandiri. |
| `ai/`, `search/`, `stalker/`, `tts/` | Belum diaktifkan | Memerlukan layanan eksplisit | Mayoritas memanggil jaringan atau API; rahasia dan kebijakan layanan harus dikonfigurasi sebelum diaktifkan. |

## Batch aman yang sudah diadaptasi

Sebanyak **70 plugin hasil adaptasi** aktif setelah checker: 17 quiz teks dari kategori `game/`, 10 command pertanyaan santai dari `fun/`, 10 command indikator hiburan dari `cek/`, 23 command grup dari `group/`, `readmore` dari `tools/`, serta command informasi dan hiburan lokal dari `main/` dan `fun/`. Seluruhnya menggunakan `adaptedFrom`, sehingga loader memeriksa kategori, access, dan requirements sumber sebelum plugin boleh aktif.

| Kelompok | Command utama | Perilaku respons |
|---|---|---|
| Quiz teks | `.asahotak`, `.caklontong`, `.kataacak`, `.riddle`, `.tebakkimia`, dan 12 quiz lain | Bot mengirim soal yang mengutip command; jawaban hanya diterima bila membalas quote pesan quiz, dengan hint, menyerah, jawaban benar, dan timeout. |
| Pertanyaan santai | `.akankah`, `.apakah`, `.bagaimana`, `.berapa`, `.bisakah`, `.coba`, `.dimana`, `.haruskah`, `.kapan`, `.mengapa` | Reply berisi respons ringan yang jelas ditandai bukan kepastian atau dasar keputusan penting. |
| Cek hiburan | `.cekbaik`, `.cekcreative`, `.cekgamer`, `.cekgacha`, `.cekkpopers`, `.ceklapar`, `.cekotaku`, `.cekpintar`, `.ceksabar`, `.cekwibu` | Persentase acak lokal, selalu ditandai sebagai hiburan dan bukan asesmen pribadi. |
| Fitur grup | `.open`, `.close`, `.setnamegc`, `.setdeskgc`, `.poll`, `.kick`, `.promote`, `.demote`, `.add`, `.delete`, `.linkgc`, `.revoke` | Router memverifikasi konteks grup; moderasi memerlukan admin pengirim dan bot-admin. Add dibatasi maksimal 10 nomor; delete wajib mengutip pesan target. |
| Profil grup | `.rulesgrup`, `.setrulesgrup`, `.resetrulesgrup`, `.welcome`, `.setwelcome`, `.resetwelcome`, `.goodbye`, `.setgoodbye`, `.resetgoodbye` | Konfigurasi disimpan lokal pada `storage/groups.json`. Welcome/goodbye hanya aktif bila admin menyimpan template dan memakai placeholder yang diizinkan. |
| Status pengguna | `.afk`, `.away`, `.brb` | Status runtime per pengguna; bot memberi tahu saat pengguna disebut dan menghapus status ketika pengguna mengirim pesan lagi. |
| Informasi utama | `.rules`, `.aturanbot`, `.botrules` | Menampilkan aturan dasar penggunaan bot dalam reply teks yang jelas. |
| Inventaris fitur | `.carifitur`, `.stats` | Mencari command yang benar-benar dapat diakses pada konteks chat saat ini dan merangkum runtime tanpa identitas pengguna. |
| Hiburan lokal | `.top`, `.rate`, `.mimpi`, `.bucin` | Top anggota, rating, cerita mimpi, dan gombalan lokal yang ditandai sebagai hiburan; bukan penilaian atau prediksi. |
| Ringkasan akses | `.benefitpremium`, `.benefitowner` | Menampilkan command premium atau owner yang benar-benar aktif dari metadata plugin; tidak membuat klaim paket, limit, atau layanan yang tidak tersedia. |
| Utilitas pesan | `.readmore` | Membuat spoiler/read-more menggunakan separator WhatsApp; respons tetap mengutip command pengguna. |

## Kategori yang tidak akan diadaptasi otomatis

Checker menemukan plugin dengan pola eksekusi proses, evaluasi dinamis, penghapusan file, pengiriman massal, konten dewasa, serta model pesan yang berpotensi menipu. Kategori `nsfw/`, `pushkontak/`, dan `jpm/` dikecualikan. Command `eval`, `exec`, pengelolaan panel/VPS jarak jauh, broadcast, spam, pemalsuan kontak/order/pembayaran, dan penghapusan file juga tidak akan dipindahkan ke Showins Bot.

## Prinsip adaptasi reply dan quote

Showins Bot sudah mengirim respons command dengan `quoted: message`, sehingga respons teks, menu interaktif, dan payload custom akan mengutip pesan yang memanggil command. Untuk fitur yang membutuhkan jawaban atas pesan non-command—seperti quiz—adapter sesi akan mencocokkan `stanzaId` quote dengan pesan game yang dibuat bot. Pesan biasa yang bukan jawaban sesi tidak dicatat ke Command Ledger.

Setiap payload pesan kaya harus mempunyai fallback teks. Preview dapat memakai `externalAdReply` hanya bila judul, URL, dan sumber mencerminkan isi nyata pesan; payload yang menyamar sebagai pihak ketiga tidak boleh digunakan.

## Matriks access dan konteks

| Metadata ShooNhee-md | Kebijakan Showins Bot | Catatan |
|---|---|---|
| `isOwner: true` | `access: 'owner'` | Hanya pemilik bot yang lolos resolver peran Showins Bot. |
| `isPremium: true` tanpa `isOwner` | `access: 'premium'` | Owner tetap melampaui batas premium melalui kebijakan akses hierarkis. |
| Tidak owner dan tidak premium | `access: 'registered'` | Adaptasi sumber tidak otomatis menjadi publik; command publik harus diputuskan secara eksplisit. |
| `isGroup: true` | `requirements.scope: 'group'` | Router menolak chat pribadi sebelum handler dijalankan. |
| `isPrivate: true` | `requirements.scope: 'private'` | Router menolak command dari grup sebelum handler dijalankan. |
| `isAdmin: true` | `requirements.admin: true` | Router mengambil metadata grup dan memverifikasi pengirim adalah admin. |
| `isBotAdmin: true` | `requirements.botAdmin: true` | Router memverifikasi akun bot merupakan admin grup. |

Metadata `isGroup: true` dan `isPrivate: true` secara bersamaan dianggap kontradiktif dan ditolak oleh checker. Semua plugin hasil adaptasi wajib memakai mapping ini sebelum diaktifkan.

## Checker yang digunakan

Audit menandai indikator berikut untuk tinjauan atau penolakan: `child_process`/`exec`, `eval`, pengiriman massal, konten dewasa, model palsu atau pembayaran/order, operasi hapus berkas, serta akses jaringan. Indikator statis tidak berarti seluruh plugin pada suatu kategori berbahaya, tetapi mengharuskan adaptasi manual dan test sebelum command diaktifkan.

Di Showins Bot, `npm run check` sekarang menjalankan pemeriksaan sintaks **dan** `scripts/check-plugin-safety.js`. Checker memindai source plugin Showins, menolak pola berisiko, lalu memuat plugin melalui validator policy. Karena itu plugin hasil adaptasi yang salah kategori, salah access, requirements hilang, atau berasal dari kategori sumber yang tidak disetujui tidak dapat lolos checker.

## Referensi

[1]: https://github.com/nhebotx-md/ShooNhee-md/tree/e95f25a/plugins "ShooNhee-md — direktori plugin sumber yang diaudit"
