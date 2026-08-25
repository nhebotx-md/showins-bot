import assert from 'node:assert/strict'
import test from 'node:test'
import closePlugin from '../plugins/group/close.js'
import openPlugin from '../plugins/group/open.js'
import setDescriptionPlugin from '../plugins/group/setdeskgc.js'
import setNamePlugin from '../plugins/group/setnamegc.js'

const config = { bot: { prefix: '.' } }

test('plugin grup hasil adaptasi mempertahankan policy admin dan bot-admin', () => {
  for (const plugin of [openPlugin, closePlugin, setNamePlugin, setDescriptionPlugin]) {
    assert.equal(plugin.category, 'group')
    assert.equal(plugin.access, 'registered')
    assert.deepEqual(plugin.requirements, { scope: 'group', admin: true, botAdmin: true })
  }
})

test('open dan close mengubah setting grup hanya ketika status perlu diperbarui', async () => {
  const calls = []
  const replies = []
  const socket = {
    async groupMetadata() { return { announce: true } },
    async groupSettingUpdate(jid, setting) { calls.push({ jid, setting }) }
  }
  await openPlugin.execute({ socket, jid: '120363@g.us', reply: async text => replies.push(text) })
  assert.deepEqual(calls, [{ jid: '120363@g.us', setting: 'not_announcement' }])

  await closePlugin.execute({
    socket: { ...socket, async groupMetadata() { return { announce: true } } },
    jid: '120363@g.us',
    reply: async text => replies.push(text)
  })
  assert.match(replies.at(-1), /sudah tertutup/)
})

test('setnamegc dan setdeskgc memvalidasi input dan memakai API grup yang benar', async () => {
  const calls = []
  const replies = []
  const socket = {
    async groupUpdateSubject(jid, value) { calls.push({ type: 'subject', jid, value }) },
    async groupUpdateDescription(jid, value) { calls.push({ type: 'description', jid, value }) }
  }
  const shared = { socket, jid: '120363@g.us', config, reply: async text => replies.push(text) }

  await setNamePlugin.execute({ ...shared, args: ['Showins', 'Belajar'] })
  await setDescriptionPlugin.execute({ ...shared, args: ['clear'] })
  await setNamePlugin.execute({ ...shared, args: [] })

  assert.deepEqual(calls, [
    { type: 'subject', jid: '120363@g.us', value: 'Showins Belajar' },
    { type: 'description', jid: '120363@g.us', value: '' }
  ])
  assert.match(replies.at(-1), /setnamegc <nama grup baru>/)
})
