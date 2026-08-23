import assert from 'node:assert/strict'
import test from 'node:test'
import { BAILEYS_INFO, Browsers, makeWASocket } from '../src/core/baileys.js'

test('adapter pusat mengunci identitas ItsLiaaa Baileys yang digunakan runtime', () => {
  assert.deepEqual(BAILEYS_INFO, {
    packageName: '@itsliaaa/baileys',
    displayName: 'ItsLiaaa Baileys',
    version: '0.3.18-final'
  })
  assert.equal(typeof makeWASocket, 'function')
  assert.deepEqual(Browsers.ubuntu('Chrome').slice(0, 2), ['Ubuntu', 'Chrome'])
})
