import assert from 'node:assert/strict'
import test from 'node:test'
import afkPlugin from '../plugins/group/afk.js'
import { createAfkService, formatAfkDuration } from '../src/services/afk-service.js'

test('AFK tersimpan memakai JID pengirim dan selesai saat pengguna mengirim pesan biasa', async () => {
  let now = 1_000
  const afk = createAfkService({ now: () => now })
  const replies = []
  const sent = []
  const sender = '6281234567890@s.whatsapp.net'
  await afkPlugin.execute({ args: ['makan'], message: { key: { participant: sender, remoteJid: '120363000000000000@g.us' } }, services: { afk }, reply: async text => replies.push(text) })
  assert.equal(afk.get(sender).reason, 'makan')

  now = 66_000
  await afk.handleMessage({
    socket: { sendMessage: async (...args) => sent.push(args) },
    message: { key: { participant: sender, remoteJid: '120363000000000000@g.us' }, message: { conversation: 'saya kembali' } },
    prefix: '.'
  })
  assert.equal(afk.get(sender), null)
  assert.match(sent[0][1].text, /kembali dari AFK/)
  assert.match(replies[0], /Status AFK aktif/)
})

test('AFK memberi notifikasi saat pengguna disebut dan durasi tetap terbaca', async () => {
  const afk = createAfkService({ now: () => 3_000 })
  const target = '6281234567890@s.whatsapp.net'
  afk.set(target, 'istirahat')
  const sent = []
  await afk.handleMessage({
    socket: { sendMessage: async (...args) => sent.push(args) },
    message: { key: { participant: '6282222222222@s.whatsapp.net', remoteJid: '120363000000000000@g.us' }, message: { extendedTextMessage: { text: 'halo', contextInfo: { mentionedJid: [target] } } } },
    prefix: '.'
  })
  assert.match(sent[0][1].text, /sedang AFK/)
  assert.equal(formatAfkDuration(61_000), '1 menit 1 detik')
})
