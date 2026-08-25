import assert from 'node:assert/strict'
import test from 'node:test'
import { addGroupPlugin, deleteQuotedGroupPlugin, groupLinkPlugin, kickGroupPlugin, listAdminGroupPlugin, promoteGroupPlugin, revokeGroupLinkPlugin } from '../src/services/group-members.js'

const config = { bot: { prefix: '.' } }
const targetJid = '6281234567890@s.whatsapp.net'
const senderJid = '6282222222222@s.whatsapp.net'
const metadata = {
  subject: 'Grup Uji',
  participants: [
    { id: senderJid, admin: 'admin' },
    { id: targetJid, admin: null },
    { id: '6283333333333@s.whatsapp.net', admin: 'superadmin' }
  ]
}

function memberContext(socket, overrides = {}) {
  return {
    socket,
    jid: '120363000000000000@g.us',
    message: {
      key: { participant: senderJid },
      message: { extendedTextMessage: { contextInfo: { mentionedJid: [targetJid] } } }
    },
    args: [],
    config,
    reply: async text => overrides.replies.push(text),
    sendResponse: async payload => overrides.responses.push(payload)
  }
}

test('adapter moderasi grup memakai target quote/mention dan API peserta yang benar', async () => {
  const updates = []
  const replies = []
  const responses = []
  const socket = {
    user: { id: '6289999999999:1@s.whatsapp.net' },
    groupMetadata: async () => metadata,
    groupParticipantsUpdate: async (...args) => updates.push(args)
  }

  await kickGroupPlugin.execute(memberContext(socket, { replies, responses }))
  assert.deepEqual(updates[0], ['120363000000000000@g.us', [targetJid], 'remove'])
  assert.match(responses[0].content.text, /dikeluarkan/)

  await promoteGroupPlugin.execute(memberContext(socket, { replies, responses }))
  assert.deepEqual(updates[1], ['120363000000000000@g.us', [targetJid], 'promote'])
})

test('adapter daftar admin dan tautan grup memakai respons aman dengan fallback', async () => {
  const responses = []
  const replies = []
  const socket = {
    groupMetadata: async () => metadata,
    groupInviteCode: async () => 'current-code',
    groupRevokeInvite: async () => 'renewed-code'
  }
  const base = { socket, jid: '120363000000000000@g.us', config, reply: async text => replies.push(text), sendResponse: async payload => responses.push(payload) }

  await listAdminGroupPlugin.execute(base)
  await groupLinkPlugin.execute(base)
  await revokeGroupLinkPlugin.execute(base)

  assert.match(responses[0].content.text, /ADMIN GRUP/)
  assert.match(replies[0], /current-code/)
  assert.match(replies[1], /renewed-code/)
})

test('adapter add membatasi batch dan delete hanya memakai key pesan yang di-quote', async () => {
  const replies = []
  const responses = []
  const sent = []
  const reactions = []
  const socket = {
    user: { id: '6289999999999:1@s.whatsapp.net' },
    groupMetadata: async () => metadata,
    groupParticipantsUpdate: async () => [{ status: '200' }, { status: '408' }],
    sendMessage: async (...args) => sent.push(args)
  }
  await addGroupPlugin.execute({ socket, jid: '120363000000000000@g.us', args: ['081234567890', '6281230000000'], reply: async text => replies.push(text), sendResponse: async payload => responses.push(payload) })
  assert.match(responses[0].content.text, /Berhasil ditambahkan: 1/)
  assert.match(responses[0].content.text, /Undangan dikirim: 1/)

  await deleteQuotedGroupPlugin.execute({
    socket,
    jid: '120363000000000000@g.us',
    message: { message: { extendedTextMessage: { contextInfo: { stanzaId: 'quoted-message', participant: targetJid } } } },
    reply: async text => replies.push(text),
    react: async emoji => reactions.push(emoji)
  })
  assert.equal(sent[0][1].delete.id, 'quoted-message')
  assert.deepEqual(reactions, ['✅'])
})
