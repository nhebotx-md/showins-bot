import assert from 'node:assert/strict'
import fs from 'node:fs'
import test from 'node:test'

const source = fs.readFileSync('scripts/reset-pairing-session.sh', 'utf8')

test('reset pairing hanya memindahkan session dan tidak menghapus data pengguna', () => {
  assert.match(source, /session_dir="storage\/session"/)
  assert.match(source, /mv "\$session_dir" "\$backup_dir"/)
  assert.match(source, /storage\/users\.json tidak diubah/)
  assert.doesNotMatch(source, /rm -rf storage/)
})
