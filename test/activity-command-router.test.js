import assert from 'node:assert/strict'
import test from 'node:test'
import { createCommandRouter } from '../src/core/command-router.js'

const config = { bot: { prefix: '.', ownerNumbers: [] } }
const userStore = { get() { return null } }

function createHarness() {
  const events = { command: [], reply: [], sent: [] }
  const logger = {
    command(context) { events.command.push(context) },
    reply(context) { events.reply.push(context) },
    error() {}
  }
  const router = createCommandRouter({
    config,
    userStore,
    logger,
    plugins: [{
      name: 'menu',
      category: 'main',
      access: 'public',
      commands: ['menu'],
      async execute({ reply }) { await reply('Menu bot') }
    }]
  })
  const socket = { async sendMessage(jid, content) { events.sent.push({ jid, content }) } }
  return { events, router, socket }
}

async function dispatch(harness, remoteJid, text) {
  await harness.router({
    socket: harness.socket,
    messages: [{ key: { remoteJid, fromMe: false }, message: { conversation: text } }]
  })
}

test('chat biasa tidak menghasilkan log atau respons bot', async () => {
  const harness = createHarness()
  await dispatch(harness, '6281234567890@s.whatsapp.net', 'halo apa kabar')

  assert.deepEqual(harness.events, { command: [], reply: [], sent: [] })
})

test('command dan respons dicatat dengan sumber private, grup, dan channel', async () => {
  for (const [jid, source] of [
    ['6281234567890@s.whatsapp.net', 'private'],
    ['1203630@g.us', 'group'],
    ['1203630@newsletter', 'channel']
  ]) {
    const harness = createHarness()
    await dispatch(harness, jid, '.menu')

    assert.equal(harness.events.command.length, 1)
    assert.equal(harness.events.reply.length, 1)
    assert.equal(harness.events.command[0].source, source)
    assert.equal(harness.events.reply[0].source, source)
    assert.match(harness.events.sent[0].content.text, /Showins Bot/)
    assert.match(harness.events.sent[0].content.text, /Menu bot/)
    assert.equal(harness.events.sent[0].content.contextInfo.externalAdReply.title, 'Showins Bot')
  }
})
