import assert from 'node:assert/strict'
import fs from 'node:fs'
import test from 'node:test'

const source = fs.readFileSync('src/core/connection-manager.js', 'utf8')

test('pairing memakai kode resmi secara eksplisit dan fingerprint Ubuntu Chrome', () => {
  assert.match(source, /from '\.\/baileys\.js'/)
  assert.match(source, /Browsers\.ubuntu\(browser\.name \|\| 'Chrome'\)/)
  assert.match(source, /requestPairingCode\(number\)/)
  assert.doesNotMatch(source, /requestPairingCode\(number,/)
  assert.match(source, /const \{ connection, lastDisconnect, qr \} = update/)
  assert.match(source, /if \(qr && this\.config\.connection\.usePairingCode/)
  assert.match(source, /await delay\(500\)/)
  assert.doesNotMatch(source, /printQRInTerminal/)
  assert.doesNotMatch(source, /fetchLatestBaileysVersion/)
})
