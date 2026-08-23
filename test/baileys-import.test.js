import assert from 'node:assert/strict'
import test from 'node:test'
import {
  Browsers,
  fetchLatestBaileysVersion,
  makeCacheableSignalKeyStore,
  makeWASocket,
  useMultiFileAuthState
} from '@itsukichan/baileys'

test('Baileys mod edge menyediakan API inti yang dipakai base bot', () => {
  assert.equal(typeof makeWASocket, 'function')
  assert.equal(typeof useMultiFileAuthState, 'function')
  assert.equal(typeof makeCacheableSignalKeyStore, 'function')
  assert.equal(typeof fetchLatestBaileysVersion, 'function')
  assert.deepEqual(Browsers.ubuntu('Chrome').slice(0, 2), ['Ubuntu', 'Chrome'])
})
