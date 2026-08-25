import assert from 'node:assert/strict'
import test from 'node:test'
import topPlugin from '../plugins/fun/top.js'

test('top memilih maksimal lima anggota grup dan menandai hasil sebagai hiburan', async () => {
  const responses = []
  await topPlugin.execute({
    args: ['paling', 'kreatif'],
    jid: '120363000000000000@g.us',
    socket: {
      user: { id: '6289999999999:1@s.whatsapp.net' },
      groupMetadata: async () => ({ participants: [
        { id: '6281111111111@s.whatsapp.net' }, { id: '6282222222222@s.whatsapp.net' }, { id: '6283333333333@s.whatsapp.net' },
        { id: '6284444444444@s.whatsapp.net' }, { id: '6285555555555@s.whatsapp.net' }, { id: '6286666666666@s.whatsapp.net' }
      ] })
    },
    reply: async () => {},
    sendResponse: async payload => responses.push(payload)
  })
  assert.equal(responses.length, 1)
  assert.equal(responses[0].content.mentions.length, 5)
  assert.match(responses[0].content.text, /acak untuk hiburan/)
})
