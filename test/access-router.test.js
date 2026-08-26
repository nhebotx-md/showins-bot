import assert from 'node:assert/strict'
import test from 'node:test'
import { createCommandRouter } from '../src/core/command-router.js'

const config = { bot: { prefix: '.', ownerNumbers: ['6281111111111'] } }
const logger = { error() {} }
const userStore = {
  get(number) {
    return {
      '6282222222222': { number, premium: true },
      '6283333333333': { number, premium: false }
    }[number] || null
  }
}

function createRouter() {
  return createCommandRouter({
    config,
    logger,
    userStore,
    plugins: ['menu', 'ping', 'premium', 'owner'].map((command, index) => ({
      name: command,
      category: 'main',
      access: ['public', 'registered', 'premium', 'owner'][index],
      commands: [command],
      async execute({ reply, role }) {
        await reply(`ok:${command}:${role}`)
      }
    }))
  })
}

async function runCommand(router, number, command) {
  const sent = []
  await router({
    socket: { async sendMessage(jid, content) { sent.push({ jid, content }) } },
    messages: [{ key: { remoteJid: `${number}@s.whatsapp.net`, fromMe: false }, message: { conversation: `.${command}` } }]
  })
  return sent[0].content.text
}

async function runMessage(router, key, command) {
  const sent = []
  await router({
    socket: { async sendMessage(jid, content) { sent.push({ jid, content }) } },
    messages: [{ key, message: { conversation: `.${command}` } }]
  })
  return sent[0].content.text
}

test('guest hanya dapat membuka menu sedangkan role lain sesuai tingkat aksesnya', async () => {
  const router = createRouter()

  assert.match(await runCommand(router, '6284444444444', 'menu'), /ok:menu:guest/)
  assert.match(await runCommand(router, '6284444444444', 'ping'), /Akses ditolak/)
  assert.match(await runCommand(router, '6283333333333', 'ping'), /ok:ping:registered/)
  assert.match(await runCommand(router, '6282222222222', 'premium'), /ok:premium:premium/)
  assert.match(await runCommand(router, '6281111111111', 'owner'), /ok:owner:owner/)
})

test('owner tetap terdeteksi dari pesan fromMe dan JID alternatif LID', async () => {
  const router = createRouter()

  assert.match(
    await runMessage(router, { remoteJid: '6281111111111@s.whatsapp.net', fromMe: true }, 'owner'),
    /ok:owner:owner/
  )
  assert.match(
    await runMessage(
      router,
      { remoteJid: '1245321@lid', remoteJidAlt: '6281111111111@s.whatsapp.net', fromMe: false },
      'owner'
    ),
    /ok:owner:owner/
  )
})
