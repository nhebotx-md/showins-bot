import assert from 'node:assert/strict'
import test from 'node:test'
import { normalizePhoneNumber, validateConfig } from '../src/core/config.js'

test('nomor pairing dibersihkan ke format negara', () => {
  assert.equal(normalizePhoneNumber('+62 812-3456-7890'), '6281234567890')
  assert.equal(normalizePhoneNumber('081234567890'), '6281234567890')
})

test('konfigurasi menolak nomor pairing yang belum valid', () => {
  const issues = validateConfig({
    bot: { name: 'Showins', prefix: '.', ownerNumbers: ['6281234567890'] },
    connection: { usePairingCode: true, pairingNumber: '62', authDir: './storage/session' }
  })

  assert.equal(issues.length, 1)
})

test('konfigurasi mengharuskan minimal satu owner yang dapat dideteksi otomatis', () => {
  const issues = validateConfig({
    bot: { name: 'Showins', prefix: '.', ownerNumbers: [] },
    connection: { usePairingCode: false, pairingNumber: '', authDir: './storage/session' }
  })

  assert.match(issues.join('\n'), /bot\.ownerNumbers/)
})
