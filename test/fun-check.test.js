import assert from 'node:assert/strict'
import test from 'node:test'
import cekBaik from '../plugins/fun/cekbaik.js'
import cekPintar from '../plugins/fun/cekpintar.js'

test('plugin cek ShooNhee yang diadaptasi mempertahankan policy dan membalas sebagai hiburan acak', async () => {
  const replies = []
  await cekBaik.execute({ args: ['Budi'], reply: async text => replies.push(text) })

  assert.equal(cekBaik.category, 'fun')
  assert.equal(cekBaik.access, 'registered')
  assert.equal(cekBaik.adaptedFrom.category, 'cek')
  assert.match(replies[0], /KEBAIKAN/)
  assert.match(replies[0], /Target: _Budi_/)
  assert.match(replies[0], /Hanya hiburan acak/)
})

test('plugin cek memakai target default yang aman bila argumen tidak diberikan', async () => {
  const replies = []
  await cekPintar.execute({ args: [], reply: async text => replies.push(text) })

  assert.match(replies[0], /Target: _kamu_/)
  assert.match(replies[0], /SEMANGAT BELAJAR/)
})
