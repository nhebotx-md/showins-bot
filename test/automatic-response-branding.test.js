import assert from 'node:assert/strict'
import test from 'node:test'
import { createAfkService } from '../src/services/afk-service.js'
import { createGroupGreetingService } from '../src/services/group-greetings.js'

const config = { bot: { name: 'Showins Bot', prefix: '.', responseBranding: { enabled: true } } }

test('respons AFK otomatis memakai header visual dan tetap mengutip pesan pemicu', async () => {
  const sent = []
  const afk = createAfkService({ config, now: () => 70_000 })
  afk.set('628111@s.whatsapp.net', 'istirahat')
  const message = { key: { remoteJid: '628111@s.whatsapp.net', fromMe: false }, message: { conversation: 'halo' } }
  const socket = { async sendMessage(jid, content, options) { sent.push({ jid, content, options }) } }

  await afk.handleMessage({ socket, message, prefix: '.' })

  assert.match(sent[0].content.text, /Showins Bot/)
  assert.match(sent[0].content.text, /kembali dari AFK/)
  assert.equal(sent[0].content.contextInfo.externalAdReply.title, 'Showins Bot')
  assert.equal(sent[0].options.quoted, message)
})

test('sambutan grup memakai branding bot tanpa mengklaim asal pesan lain', async () => {
  const sent = []
  const greetings = createGroupGreetingService({
    config,
    logger: { error() {} },
    groupProfiles: { get() { return { welcomeTemplate: 'Selamat datang {user} di {group}.' } } }
  })
  const socket = {
    async groupMetadata() { return { subject: 'Ruang Uji', participants: [{ id: '628222@s.whatsapp.net' }] } },
    async sendMessage(jid, content) { sent.push({ jid, content }) }
  }

  await greetings.handle({ socket, update: { id: '1203630@g.us', action: 'add', participants: ['628222@s.whatsapp.net'] } })

  assert.match(sent[0].content.text, /Showins Bot/)
  assert.match(sent[0].content.text, /Selamat datang @628222 di Ruang Uji/)
  assert.equal(sent[0].content.contextInfo.externalAdReply.title, 'Showins Bot')
  assert.equal(Object.hasOwn(sent[0].content.contextInfo, 'isForwarded'), false)
})
