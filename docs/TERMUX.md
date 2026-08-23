# Menjalankan Showins Bot di Termux

Dokumen ini memakai Ubuntu proot karena environment tersebut mudah dipisahkan dari Termux utama.

## 1. Pastikan kebutuhan dasar tersedia

Di Termux utama, pasang tool dasar bila belum ada.

```bash
pkg update -y
pkg install -y proot-distro git tmux
```

Masuk ke Ubuntu proot. Bila belum pernah memasang Ubuntu, jalankan `proot-distro install ubuntu` sekali sebelum perintah berikut.

```bash
proot-distro login ubuntu
```

Di Ubuntu, pastikan Node memenuhi versi minimum.

```bash
node -v
```

Showins Bot membutuhkan Node.js 20 atau lebih baru. Jika perintah di atas sudah menampilkan Node 20+, lanjutkan.

## 2. Clone dan konfigurasi

```bash
git clone https://github.com/nhebotx-md/showins-bot.git
cd showins-bot
bash scripts/install-termux.sh
nano config.js
```

Installer akan memasang dependency, membuat `config.js` bila belum ada, dan menjalankan pemeriksaan dasar. Isi `pairingNumber` memakai nomor WhatsApp utama dengan format `628xxxxxxxxxx`, tanpa tanda tambah, spasi, atau nol di depan.

## 3. Pasang dependency dan jalankan

```bash
npm start
```

Saat kode pairing tampil, buka WhatsApp Business/Messenger utama → **Perangkat tertaut** → **Tautkan perangkat** → **Tautkan dengan nomor telepon**, lalu masukkan kode terbaru. Jangan gunakan kode kustom atau kode dari percobaan lama.

## 4. Menjalankan di latar belakang

Keluar ke Termux utama dengan `exit`, lalu jalankan:

```bash
tmux new-session -d -s showins 'proot-distro login ubuntu -- bash -lc "cd /root/showins-bot && npm start"'
tmux capture-pane -pt showins -S -100
```

| Kebutuhan | Perintah |
|---|---|
| Melihat status | `tmux ls` |
| Membaca log | `tmux capture-pane -pt showins -S -120` |
| Masuk terminal bot | `tmux attach -t showins` |
| Keluar tanpa mematikan bot | Tekan `Ctrl+b`, lalu `d` |
| Menghentikan bot | `tmux kill-session -t showins` |

## Penting

Jangan memasukkan `storage/session/` atau `config.js` ke GitHub. Jika koneksi logout, backup dulu `storage/session/` sebelum menghapusnya dan melakukan pairing ulang.
