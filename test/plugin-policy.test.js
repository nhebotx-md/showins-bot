import assert from 'node:assert/strict'
import test from 'node:test'
import {
  createShooNheePortPolicy,
  getPluginContextViolation,
  mapShooNheeAccess,
  mapShooNheeCategory,
  mapShooNheeRequirements
} from '../src/core/plugin-policy.js'

test('matriks ShooNhee memetakan kategori dan access ke kontrak Showins', () => {
  assert.equal(mapShooNheeCategory('cek'), 'fun')
  assert.equal(mapShooNheeCategory('group'), 'group')
  assert.equal(mapShooNheeCategory('pushkontak'), null)
  assert.equal(mapShooNheeAccess({}), 'registered')
  assert.equal(mapShooNheeAccess({ isPremium: true }), 'premium')
  assert.equal(mapShooNheeAccess({ isOwner: true, isPremium: true }), 'owner')

  assert.deepEqual(createShooNheePortPolicy({
    category: 'group', isPremium: true, isGroup: true, isAdmin: true, isBotAdmin: true
  }), {
    category: 'group',
    access: 'premium',
    requirements: { scope: 'group', admin: true, botAdmin: true }
  })
})

test('matriks menolak metadata sumber yang kontradiktif', () => {
  assert.throws(
    () => mapShooNheeRequirements({ isGroup: true, isPrivate: true }),
    /sekaligus khusus grup dan khusus private/
  )
})

test('guard konteks memeriksa scope, admin pengirim, dan admin bot', async () => {
  const message = { key: { remoteJid: '120363000000@g.us', participant: '628111@s.whatsapp.net' } }
  const socket = {
    user: { id: '628999@s.whatsapp.net' },
    async groupMetadata() {
      return {
        participants: [
          { id: '628111@s.whatsapp.net', admin: 'admin' },
          { id: '628999@s.whatsapp.net', admin: 'superadmin' }
        ]
      }
    }
  }

  const guardedPlugin = { requirements: { scope: 'group', admin: true, botAdmin: true } }
  assert.equal(await getPluginContextViolation({ plugin: guardedPlugin, message, jid: message.key.remoteJid, socket }), null)
  assert.equal(
    await getPluginContextViolation({ plugin: guardedPlugin, message, jid: '628111@s.whatsapp.net', socket }),
    'Perintah ini hanya dapat digunakan di grup.'
  )

  const nonAdminMessage = { key: { remoteJid: '120363000000@g.us', participant: '628222@s.whatsapp.net' } }
  assert.equal(
    await getPluginContextViolation({ plugin: guardedPlugin, message: nonAdminMessage, jid: nonAdminMessage.key.remoteJid, socket }),
    'Perintah ini hanya dapat digunakan oleh admin grup.'
  )
})
