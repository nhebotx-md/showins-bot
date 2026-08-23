import assert from 'node:assert/strict'
import fs from 'node:fs'
import test from 'node:test'

const source = fs.readFileSync('src/core/connection-manager.js', 'utf8')

test('event pesan meneruskan socket aktif dan daftar pesan ke command router', () => {
  assert.match(source, /this\.onMessages\(\{ socket: this\.socket, messages: update\.messages \}\)/)
})
