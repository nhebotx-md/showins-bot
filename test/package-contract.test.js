import assert from 'node:assert/strict'
import fs from 'node:fs'
import test from 'node:test'

const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'))

test('package mengunci dependency runtime ke ItsLiaaa Baileys yang telah divalidasi', () => {
  assert.equal(packageJson.dependencies['@itsliaaa/baileys'], '0.3.18-final')
  assert.equal(packageJson.dependencies['@itsukichan/baileys'], undefined)
  assert.equal(packageJson.dependencies['@whiskeysockets/baileys'], undefined)
})
