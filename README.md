# Showins Bot

> **Base WhatsApp bot yang ringkas, modular, dan mudah dikembangkan dari Termux.**

Showins Bot adalah fondasi baru untuk bot WhatsApp pribadi. Proyek ini memakai **ItsLiaaa Baileys** versi `0.3.18-final`, mod aktif dengan fitur pesan lanjutan dan alur pairing yang terdokumentasi. Fondasinya sengaja sederhana: koneksi yang terisolasi, konfigurasi yang jelas, plugin mandiri, log rapi, serta pengujian dasar.

## Mengapa base ini berbeda?

| Prinsip | Implementasi |
|---|---|
| **Stabil** | Reconnect memiliki batas; session tidak pernah dihapus otomatis; 405 sebelum pairing dihentikan tanpa loop. |
| **Aman untuk pairing** | Ubuntu Chrome fingerprint dan kode pairing asli dari WhatsApp; tidak ada kode custom yang dipaksakan. |
| **Mudah dipahami** | Satu plugin = satu berkas. Perintah otomatis terdaftar saat plugin berada di `plugins/<kategori>/` yang sesuai. |
| **Siap fitur pesan kaya** | Adapter disediakan untuk quick reply; Baileys mod mendukung album, interactive message, rich response, code block, table, sticker pack, dan fitur bisnis lain. |
| **Lokal terlebih dahulu** | Dibuat untuk Termux/Ubuntu proot tanpa dashboard atau layanan tambahan. |

## Struktur proyek

```text
showins-bot/
├── config.example.js     # Contoh pengaturan yang aman untuk dibagikan
├── config.js             # Pengaturan pribadi Anda (tidak masuk Git)
├── plugins/              # Induk seluruh fitur bot, dipisahkan per kategori
│   ├── main/             # menu.js dan register.js
│   ├── tools/            # ping.js, readmore.js, dan utilitas aman
│   ├── fun/              # quiz, hiburan, dan fitur Fun modular
│   ├── testreply/        # seluruh plugin Reply Lab
│   ├── group/            # command administrasi grup yang terproteksi
│   ├── media/            # disiapkan untuk fitur media
│   ├── owner/            # owner.js dan command administrasi
│   └── system/           # status.js dan command sistem
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

Installer membuat `config.js` jika belum ada, memasang dependency, dan menjalankan pemeriksaan awal. Bot dapat dijalankan langsung dari Termux biasa dengan Node 20+; Ubuntu proot hanya pilihan tambahan. Sebelum `npm start`, edit `config.js` dan isi `connection.pairingNumber` dengan nomor akun WhatsApp utama Anda dalam format `628xxxxxxxxxx`. Saat socket siap untuk autentikasi, terminal meminta pairing code satu kali dan menampilkannya dengan jelas.

Apabila WhatsApp mengembalikan `401` sebelum kode pairing muncul, jangan hapus seluruh folder `storage`. Gunakan `bash scripts/reset-pairing-session.sh` untuk mencadangkan dan mereset **hanya** session pairing, sambil mempertahankan data pengguna/premium.

Untuk panduan Termux lengkap, buka [docs/TERMUX.md](docs/TERMUX.md). Untuk memahami folder dan cara membuat fitur baru, buka [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md). Status audit dan adaptasi plugin ShooNhee-md tersedia pada [docs/SHOONHEE-PLUGIN-COMPATIBILITY.md](docs/SHOONHEE-PLUGIN-COMPATIBILITY.md).

## Perintah yang tersedia

| Perintah | Fungsi |
|---|---|
| `.menu` atau `.help` | Menu utama berisi seluruh submenu kategori |
| `.menutheme` | Menampilkan pilihan tampilan menu pribadi; tersedia `classic`, `compact`, `ledger`, dan `aura`. |
| `.menutheme <tema>` | Menyimpan tema menu untuk pengguna terdaftar; gunakan `.menutheme reset` untuk standar. |
| `.carifitur <kata kunci>` | Mencari command yang benar-benar dapat diakses oleh role dan konteks chat pengguna. |
| `.stats` | Menampilkan statistik runtime, plugin aktif, serta ringkasan penyimpanan lokal tanpa data identitas pengguna. |
| `.benefitpremium` | Menampilkan command premium yang benar-benar aktif berdasarkan metadata plugin. |
| `.benefitowner` | Menampilkan command khusus owner yang benar-benar aktif berdasarkan metadata plugin. |
| `.catfun` | Membuka menu kategori Fun |
| `.catgroup` | Membuka menu kategori Grup |
| `.catowner` | Membuka menu kategori Owner |
| `.cattestreply` | Membuka menu kategori Test Reply |
| `.cat<kategori>` | Membuka menu kategori lain, misalnya `.cattools` atau `.catsystem` |
| `.replytest` | Membuka laboratorium untuk menguji gaya reply pesan |
| `.replymodels` | Membuka uji model pesan Itsukichan-compatible |
| `.asahotak`, `.caklontong`, `.kataacak`, `.riddle`, `.tebakkimia`, dan quiz teks lain | Memulai quiz hasil adaptasi ShooNhee-md; jawaban harus membalas quote pesan quiz bot. |
| `.akankah <pertanyaan>` dan command pertanyaan Fun lain | Respons hiburan ringan yang tidak diklaim sebagai kepastian. |
| `.cekbaik`, `.cekcreative`, `.cekgamer`, dan command cek lain | Indikator acak untuk hiburan, bukan asesmen pribadi. |
| `.open` / `.close` | Membuka atau menutup grup — khusus admin grup ketika bot juga admin. |
| `.setnamegc <nama>` / `.setdeskgc <deskripsi>` | Mengubah nama atau deskripsi grup — khusus admin grup ketika bot juga admin. |
| `.poll pertanyaan | opsi 1, opsi 2` | Membuat poll di grup; gunakan `multi |` di awal untuk pilihan ganda. |
| `.kick`, `.add`, `.promote`, `.demote`, `.listadmin`, `.linkgc`, `.revoke` | Moderasi peserta grup; seluruh tindakan dilindungi validasi admin dan bot-admin. |
| `.delete` | Menghapus pesan yang di-quote di grup — khusus admin ketika bot juga admin. |
| `.rulesgrup`, `.setrulesgrup`, `.resetrulesgrup` | Melihat dan mengelola aturan lokal grup. |
| `.setwelcome` / `.setgoodbye` | Menyimpan template pesan otomatis peserta masuk atau keluar dari grup. |
| `.welcome`, `.goodbye`, `.resetwelcome`, `.resetgoodbye` | Melihat atau menghapus template otomatis grup. |
| `.afk <alasan>` | Menandai pengguna AFK; bot memberi tahu ketika pengguna disebut dan menonaktifkannya saat kembali aktif. |
| `.top <kategori>` | Membuat top lima anggota grup secara acak untuk hiburan. |
| `.rate <subjek>` | Memberi nilai acak yang jelas ditandai sebagai hiburan. |
| `.truth` | Mengirim pertanyaan Truth ringan dari bank prompt lokal; jawaban bersifat opsional dan tidak perlu memuat data pribadi. |
| `.readmore awal|lanjutan` | Membuat teks spoiler/baca selengkapnya yang mengutip command pengguna. |
| `.register` | Mendaftarkan nomor sendiri sebagai pengguna bot |
| `.ping` | Menguji respons bot |
| `.status` atau `.info` | Melihat status runtime |
| `.premium` | Contoh fitur kategori Fun untuk pengguna premium |
| `.adduser <nomor>` | Mendaftarkan pengguna secara manual — khusus owner |
| `.addpremium <nomor>` | Memberikan premium — khusus owner |
| `.delpremium <nomor>` | Mencabut premium — khusus owner |
| `.users` | Melihat daftar pengguna — khusus owner |

Menu utama memuat submenu untuk seluruh kategori: **Utama**, **Tools**, **Fun**, **Test Reply**, **Grup**, **Media**, **Owner**, dan **Sistem**. Setiap tombol menjalankan command `cat<kategori>` dan menampilkan menu kategori masing-masing. Kategori yang belum memiliki plugin akan tetap terbuka, tetapi menampilkan pemberitahuan bahwa belum ada fitur aktif. Lihat [Reply Lab](docs/REPLY-LAB.md) untuk inventaris pola reply, [Tema Menu](docs/MENU-THEMES.md) untuk kostumisasi menu, dan [Otomasi Grup](docs/GROUP-AUTOMATION.md) untuk command grup yang tersedia.

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

Buat berkas baru pada subfolder kategori yang sama dengan nilai `category`. Contoh fitur Tools disimpan di `plugins/tools/halo.js`:

```js
export default {
  name: 'halo',
  category: 'tools',
  access: 'registered',
  description: 'Contoh plugin.',
  commands: ['halo'],
  async execute({ reply }) {
    await reply('Halo dari Showins Bot.')
  }
}
```

Restart bot, lalu gunakan `.halo`. Loader memindai subfolder secara rekursif dalam urutan yang konsisten. Berkas JavaScript yang diletakkan langsung di `plugins/`, atau yang foldernya tidak sama dengan nilai `category`, akan dilewati dan dicatat sebagai kesalahan agar struktur tetap rapi.

## Kualitas dan pemeriksaan

```bash
npm run check
npm test
npm run inspect
```

`npm run check` memeriksa sintaks seluruh berkas JavaScript di `src/`, `plugins/`, dan `test/`, lalu menjalankan checker keamanan plugin. Checker menolak pola eksekusi proses, evaluasi dinamis, broadcast/spam, konten dewasa, model pesan menipu, penghapusan berkas, dan plugin hasil adaptasi ShooNhee-md yang tidak sesuai policy. Pengujian memastikan nomor pairing dibersihkan dengan benar, plugin dasar termuat, quiz hanya menerima jawaban yang mengutip pesan bot, command grup memverifikasi admin, source tidak mengirim kode pairing kustom, adapter pusat tetap menunjuk **ItsLiaaa Baileys `0.3.18-final`**, serta menu interaktif selalu memiliki fallback teks.

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
| Perintah bot | `plugins/<kategori>/` |

## Batas penggunaan

Showins Bot terhubung melalui WhatsApp Web dan bukan produk resmi WhatsApp. Gunakan hanya pada akun yang Anda kelola, hindari spam atau pengiriman massal, dan patuhi ketentuan layanan WhatsApp. Session di `storage/session/` bersifat sangat sensitif—jangan pernah dibagikan atau diunggah ke repository.

## Library

Proyek menggunakan [ItsLiaaa Baileys](https://github.com/itsliaaa/baileys) versi `0.3.18-final`. Library ini menyediakan dukungan fitur pesan yang lebih luas, termasuk pesan interaktif, album, rich response, code block, tabel, pembayaran, dan fitur WhatsApp Business. [1]

### Referensi

[1]: https://github.com/itsliaaa/baileys "ItsLiaaa Baileys — fitur dan dokumentasi"
