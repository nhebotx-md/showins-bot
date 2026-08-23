#!/usr/bin/env bash
set -Eeuo pipefail

if ! command -v node >/dev/null 2>&1; then
  echo 'Node.js belum ditemukan. Jalankan installer ini dari Ubuntu proot yang sudah memiliki Node.js 20+.'
  exit 1
fi

major_version=$(node -p "process.versions.node.split('.')[0]")
if [ "$major_version" -lt 20 ]; then
  echo "Node.js $major_version terdeteksi. Showins Bot membutuhkan Node.js 20 atau lebih baru."
  exit 1
fi

if [ ! -f config.js ]; then
  cp config.example.js config.js
  echo 'config.js dibuat dari contoh. Edit pairingNumber sebelum menjalankan bot.'
fi

npm install --omit=dev --no-audit --no-fund
npm run check
npm test

echo
echo 'Pemasangan selesai.'
echo 'Langkah berikutnya: edit config.js, isi pairingNumber, lalu jalankan npm start.'
