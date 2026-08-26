import assert from 'node:assert/strict'
import test from 'node:test'
import { createCommandRouter } from '../src/core/command-router.js'

const config = { bot: { prefix: '.' } }
const logger = { error() {} }

function createSocket() {
  const sent = []
  return {
    sent,
    async sendMessage(jid, content) {
      sent.push({ jid, content })
    }
  }
}

test('router menjalankan perintah ketika respons quick reply native-flow membawa id kategori', async () => {
  const socket = createSocket()
  const router = createCommandRouter({
    config,
    logger,
    plugins: [
      {
        name: 'menu',
        category: 'main',
        access: 'public',
        commands: ['menu'],
        async execute({ args, reply }) {
          await reply(`Kategori: ${args[0]}`)
        }
      }
    ]
  })

  await router({
    socket,
    messages: [
      {
        key: { remoteJid: '6280000000000@s.whatsapp.net', fromMe: false },
        message: {
          interactiveResponseMessage: {
            nativeFlowResponseMessage: {
              paramsJson: JSON.stringify({ id: '.menu tools' })
            }
          }
        }
      }
    ]
  })

  assert.equal(socket.sent.length, 1)
  assert.equal(socket.sent[0].jid, '6280000000000@s.whatsapp.net')
  assert.match(socket.sent[0].content.text, /Kategori: tools/)
  assert.equal(socket.sent[0].content.contextInfo.externalAdReply.title, 'Showins Bot')
})

test('router mengabaikan respons native-flow dengan JSON yang tidak valid', async () => {
  const socket = createSocket()
  const router = createCommandRouter({ config, logger, plugins: [] })

  await router({
    socket,
    messages: [
      {
        key: { remoteJid: '6280000000000@s.whatsapp.net', fromMe: false },
        message: { interactiveResponseMessage: { nativeFlowResponseMessage: { paramsJson: '{invalid' } } }
      }
    ]
  })

  assert.equal(socket.sent.length, 0)
})
