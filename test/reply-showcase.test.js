import assert from 'node:assert/strict'
import test from 'node:test'
import {
  buildBotContactReply,
  buildDocumentReply,
  buildLocationReply,
  buildMentionReply,
  buildPlainReply,
  buildPollReply,
  buildPreviewReply,
  buildReactionReply
} from '../src/services/reply-showcase.js'

test('helper reply showcase membuat variasi payload aman dan mudah dikustomisasi', () => {
  const plain = buildPlainReply({ botName: 'Showins Bot', senderNumber: '628111222333' })
  const preview = buildPreviewReply({ botName: 'Showins Bot' })
  const mention = buildMentionReply({ botName: 'Showins Bot', senderNumber: '628111222333' })
  const documentReply = buildDocumentReply({ botName: 'Showins Bot' })
  const pollReply = buildPollReply({ botName: 'Showins Bot' })
  const locationReply = buildLocationReply({ botName: 'Showins Bot' })
  const contactReply = buildBotContactReply({ botName: 'Showins Bot', pairingNumber: '628111222333' })

  assert.equal(plain.type, 'plain')
  assert.deepEqual(plain.content.mentions, ['628111222333@s.whatsapp.net'])
  assert.equal(preview.type, 'preview')
  assert.equal(preview.content.contextInfo.externalAdReply.title, 'Showins Bot · Reply Lab')
  assert.equal(mention.type, 'mention')
  assert.match(mention.content.text, /@628111222333/)
  assert.equal(documentReply.type, 'document')
  assert.equal(documentReply.content.mimetype, 'text/plain')
  assert.equal(pollReply.type, 'poll')
  assert.deepEqual(pollReply.content.poll.values, ['Plain quoted text', 'Context preview', 'Native-flow button'])
  assert.match(pollReply.fallback, /Poll tidak didukung/)
  assert.equal(locationReply.type, 'location')
  assert.equal(locationReply.content.location.degreesLatitude, 0)
  assert.match(locationReply.fallback, /Tidak ada lokasi pengguna/)
  assert.equal(contactReply.type, 'contact')
  assert.match(contactReply.content.contacts.contacts[0].vcard, /628111222333/)
  assert.match(buildReactionReply({ botName: 'Showins Bot' }), /REACTION/)
})
