import assert from 'node:assert/strict'
import test from 'node:test'
import { canAccess, getSenderNumber, getSenderNumbers, resolveUserRole } from '../src/core/access-control.js'

const config = { bot: { ownerNumbers: ['6281111111111'] } }
const userStore = {
  get(number) {
    return {
      '6282222222222': { number, premium: true },
      '6283333333333': { number, premium: false }
    }[number] || null
  }
}

test('kontrol akses membedakan owner, premium, terdaftar, dan guest', () => {
  assert.equal(resolveUserRole({ config, userStore, senderNumber: '6281111111111' }), 'owner')
  assert.equal(resolveUserRole({ config, userStore, senderNumber: '6282222222222' }), 'premium')
  assert.equal(resolveUserRole({ config, userStore, senderNumber: '6283333333333' }), 'registered')
  assert.equal(resolveUserRole({ config, userStore, senderNumber: '6284444444444' }), 'guest')
  assert.equal(resolveUserRole({ config, userStore, message: { key: { fromMe: true } } }), 'owner')
  assert.equal(
    resolveUserRole({
      config,
      userStore,
      message: { key: { remoteJid: '1245321@lid', remoteJidAlt: '6281111111111@s.whatsapp.net' } }
    }),
    'owner'
  )
  assert.equal(canAccess('guest', 'public'), true)
  assert.equal(canAccess('guest', 'registered'), false)
  assert.equal(canAccess('premium', 'registered'), true)
  assert.equal(canAccess('registered', 'premium'), false)
  assert.equal(canAccess('owner', 'owner'), true)
})

test('nomor pengirim diambil dari participant grup, JID pribadi, dan alternatif LID', () => {
  assert.equal(getSenderNumber({ key: { participant: '6282222222222@s.whatsapp.net' } }), '6282222222222')
  assert.equal(getSenderNumber({ key: { remoteJid: '6283333333333@s.whatsapp.net' } }), '6283333333333')
  assert.equal(
    getSenderNumber({ key: { remoteJid: '1245321@lid', remoteJidAlt: '6281111111111@s.whatsapp.net' } }),
    '6281111111111'
  )
  assert.deepEqual(
    getSenderNumbers({ key: { participant: '829122@lid', participantAlt: '6282222222222@s.whatsapp.net' } }),
    ['6282222222222']
  )
})
