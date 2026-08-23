import assert from 'node:assert/strict'
import test from 'node:test'
import { sendInteractiveMenu } from '../src/services/rich-messages.js'

function createSocket({ shouldReject = false } = {}) {
  const calls = []
  return {
    calls,
    async sendMessage(jid, content, options) {
      calls.push({ jid, content, options })
      if (shouldReject && calls.length === 1) throw new Error('interactive rejected')
      return { key: { id: `message-${calls.length}` } }
    }
  }
}

const menu = {
  title: 'Showins Bot',
  text: 'Pilih perintah.',
  footer: 'ItsLiaaa Baileys',
  options: [{ label: 'Uji respons', id: '.ping' }]
}

test('adapter mengirim quick reply payload ItsLiaaa untuk menu yang valid', async () => {
  const socket = createSocket()
  await sendInteractiveMenu(socket, '6280000000000@s.whatsapp.net', menu)

  assert.equal(socket.calls.length, 1)
  assert.deepEqual(socket.calls[0].content.interactiveButtons, [
    {
      name: 'quick_reply',
      buttonParamsJson: JSON.stringify({ display_text: 'Uji respons', id: '.ping' })
    }
  ])
})

test('adapter mengirim fallback teks apabila pengiriman interaktif ditolak', async () => {
  const socket = createSocket({ shouldReject: true })
  await sendInteractiveMenu(socket, '6280000000000@s.whatsapp.net', menu)

  assert.equal(socket.calls.length, 2)
  assert.equal(socket.calls[1].content.text, 'Showins Bot\nPilih perintah.\n\n• Uji respons: .ping')
})
