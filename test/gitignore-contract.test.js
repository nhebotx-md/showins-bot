import assert from 'node:assert/strict'
import fs from 'node:fs'
import test from 'node:test'

const gitignore = fs.readFileSync('.gitignore', 'utf8')

test('hanya config.js root yang diabaikan, bukan modul konfigurasi internal', () => {
  assert.match(gitignore, /^\/config\.js$/m)
  assert.doesNotMatch(gitignore, /^config\.js$/m)
})
