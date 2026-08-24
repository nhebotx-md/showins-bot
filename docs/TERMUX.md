# Menjalankan Showins Bot di Termux

Showins Bot dapat dijalankan **langsung di Termux biasa**; Ubuntu proot bukan syarat. Node.js **20 atau lebih baru** tetap wajib digunakan. Ubuntu proot hanya alternatif apabila Anda ingin lingkungan Linux terpisah.

## 1. Jalankan langsung di Termux

Di Termux utama, pasang tool dasar dan cek Node.

```bash
pkg update -y
pkg install -y nodejs-lts git tmux
node -v
```

Jika `node -v` belum menunjukkan versi 20 atau lebih baru, perbarui paket Node terlebih dahulu. Bot juga akan menghentikan startup dengan pesan yang jelas bila versi Node tidak memenuhi syarat.

## 2. Clone dan konfigurasi

```bash
git clone https://github.com/nhebotx-md/showins-bot.git
cd showins-bot
bash scripts/install-termux.sh
nano config.js
```

Installer akan memasang dependency, membuat `config.js` bila belum ada, dan menjalankan pemeriksaan dasar. Isi `pairingNumber` memakai nomor WhatsApp utama dengan format `628xxxxxxxxxx`, tanpa tanda tambah, spasi, atau nol di depan.

Pastikan `bot.ownerNumbers` di `config.js` berisi nomor pemilik bot dalam format yang sama. Nomor ini otomatis memiliki akses owner dan tidak perlu mendaftar. Saat bot pertama berjalan, `storage/users.json` akan dibuat untuk menyimpan pengguna terdaftar dan premium; berkas tersebut bersifat lokal serta tidak diunggah ke GitHub.

## 3. Pasang dependency dan jalankan

```bash
npm start
```

Saat socket sudah siap, kode pairing baru akan tampil satu kali. Buka WhatsApp Business/Messenger utama → **Perangkat tertaut** → **Tautkan perangkat** → **Tautkan dengan nomor telepon**, lalu masukkan kode terbaru. Jangan gunakan kode kustom atau kode dari percobaan lama.

> Fingerprint `Ubuntu Chrome` pada konfigurasi adalah identitas protokol WhatsApp Web, bukan instruksi agar Android harus memakai Ubuntu proot. Biarkan pengaturan ini tetap seperti semula saat menjalankan bot langsung di Termux.

## Jika muncul status 401 sebelum kode pairing

Status `401` pada tahap ini berarti WhatsApp menolak sesi pairing sebelum perangkat terdaftar. Ini bukan bukti bahwa Termux biasa tidak didukung. Jangan menjalankan ulang berkali-kali dan **jangan** memakai `rm -rf storage`, karena perintah tersebut juga menghapus database pengguna/premium.

Cadangkan lalu reset hanya session pairing dengan:

```bash
bash scripts/reset-pairing-session.sh
npm start
```

Skrip tersebut memindahkan `storage/session/` ke folder backup bertimestamp dan mempertahankan `storage/users.json`. Pastikan Node 20+, nomor pairing format `628...`, koneksi tanpa VPN/proxy, serta hanya satu proses bot yang sedang berjalan. Jika 401 tetap muncul sebelum kode tampil, hentikan percobaan berulang dan simpan keluaran terminal; penolakan dapat berasal dari sisi server WhatsApp/protokol pairing.

## Memperbarui source tanpa menghapus session

Jika bot sudah pernah terhubung, gunakan pembaruan berikut dari folder bot di Termux. Perintah ini mengambil source terbaru dan memasang dependency ItsLiaa Baileys tanpa mengubah `config.js` atau `storage/session/`.

```bash
cd ~/showins-bot
git pull --ff-only
npm install --omit=dev --no-audit --no-fund
npm run check
npm test
```

Jangan memindahkan atau menghapus `storage/session/` selama log masih menampilkan `CONNECTED`. Cadangkan session hanya apabila WhatsApp benar-benar logout atau Anda ingin menautkan akun lain.

## 4. Menjalankan di latar belakang

Jalankan dari Termux utama:

```bash
tmux new-session -d -s showins 'cd ~/showins-bot && npm start'
tmux capture-pane -pt showins -S -100
```

| Kebutuhan | Perintah |
|---|---|
| Melihat status | `tmux ls` |
| Membaca log | `tmux capture-pane -pt showins -S -120` |
| Masuk terminal bot | `tmux attach -t showins` |
| Keluar tanpa mematikan bot | Tekan `Ctrl+b`, lalu `d` |
| Menghentikan bot | `tmux kill-session -t showins` |

## Alternatif: Ubuntu proot

Jika tetap ingin memakai Ubuntu proot, pasang `proot-distro`, masuk ke Ubuntu, lalu ikuti perintah yang sama dari folder bot di dalam proot. Runtime Termux biasa dan Ubuntu proot sama-sama memerlukan Node 20+.

## Penting

Jangan memasukkan `storage/session/` atau `config.js` ke GitHub. Jika koneksi logout, backup dulu `storage/session/` sebelum menghapusnya dan melakukan pairing ulang.
