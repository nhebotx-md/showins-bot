import assert from 'node:assert/strict'
import test from 'node:test'
import menuPlugin from '../plugins/menu.js'
import { createCommandRouter } from '../src/core/command-router.js'

const config = { bot: { name: 'Showins Bot', prefix: '.' } }
const logger = { error() {} }

test('router memetakan catfun, catgroup, dan catowner ke submenu masing-masing', async () => {
  const sent = []
  const socket = {
    async sendMessage(jid, content) {
      sent.push({ jid, content })
    }
  }
  const router = createCommandRouter({ config, logger, plugins: [menuPlugin] })

  for (const [command, label] of [
    ['.catfun', 'Fun'],
    ['.catgroup', 'Grup'],
    ['.catowner', 'Owner']
  ]) {
    await router({
      socket,
      messages: [
        {
          key: { remoteJid: '6280000000000@s.whatsapp.net', fromMe: false },
          message: { conversation: command }
        }
      ]
    })
    assert.match(sent.at(-1).content.text, new RegExp(`Showins Bot — ${label}`))
    assert.match(sent.at(-1).content.text, /Belum ada fitur aktif/)
  }
})
