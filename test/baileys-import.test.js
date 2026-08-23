import assert from 'node:assert/strict'
import test from 'node:test'
import {
  Browsers,
  delay,
  makeCacheableSignalKeyStore,
  makeWASocket,
  useMultiFileAuthState
} from '@itsliaaa/baileys'

test('ItsLiaaa Baileys menyediakan API inti yang dipakai base bot', () => {
  assert.equal(typeof makeWASocket, 'function')
  assert.equal(typeof useMultiFileAuthState, 'function')
  assert.equal(typeof makeCacheableSignalKeyStore, 'function')
  assert.equal(typeof delay, 'function')
  assert.deepEqual(Browsers.ubuntu('Chrome').slice(0, 2), ['Ubuntu', 'Chrome'])
})
