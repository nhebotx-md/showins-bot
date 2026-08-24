#!/usr/bin/env bash
set -euo pipefail

session_dir="storage/session"
backup_dir="storage/session.backup-$(date +%Y%m%d-%H%M%S)"

if [ -d "$session_dir" ]; then
  mv "$session_dir" "$backup_dir"
  printf 'Session lama dicadangkan ke: %s\n' "$backup_dir"
fi

mkdir -p "$session_dir"
printf 'Session pairing baru siap. Data pengguna di storage/users.json tidak diubah.\n'
