import assert from 'node:assert/strict'
import fs from 'node:fs'
import test from 'node:test'

const source = fs.readFileSync('src/core/connection-manager.js', 'utf8')

test('pairing memakai kode resmi secara eksplisit dan fingerprint Ubuntu Chrome', () => {
  assert.match(source, /Browsers\.ubuntu\(browser\.name \|\| 'Chrome'\)/)
  assert.match(source, /requestPairingCode\(number\)/)
  assert.doesNotMatch(source, /requestPairingCode\(number,/)
  assert.match(source, /void this\.requestPairingCode\(socket, state\)/)
  assert.doesNotMatch(source, /const \{ connection, lastDisconnect, qr \} = update/)
  assert.doesNotMatch(source, /fetchLatestBaileysVersion/)
})
