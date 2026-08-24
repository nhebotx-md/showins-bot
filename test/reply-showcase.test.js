import assert from 'node:assert/strict'
import test from 'node:test'
import {
  buildDocumentReply,
  buildMentionReply,
  buildPlainReply,
  buildPreviewReply,
  buildReactionReply
} from '../src/services/reply-showcase.js'

test('helper reply showcase membuat variasi payload aman dan mudah dikustomisasi', () => {
  const plain = buildPlainReply({ botName: 'Showins Bot', senderNumber: '628111222333' })
  const preview = buildPreviewReply({ botName: 'Showins Bot' })
  const mention = buildMentionReply({ botName: 'Showins Bot', senderNumber: '628111222333' })
  const documentReply = buildDocumentReply({ botName: 'Showins Bot' })

  assert.equal(plain.type, 'plain')
  assert.deepEqual(plain.content.mentions, ['628111222333@s.whatsapp.net'])
  assert.equal(preview.type, 'preview')
  assert.equal(preview.content.contextInfo.externalAdReply.title, 'Showins Bot · Reply Lab')
  assert.equal(mention.type, 'mention')
  assert.match(mention.content.text, /@628111222333/)
  assert.equal(documentReply.type, 'document')
  assert.equal(documentReply.content.mimetype, 'text/plain')
  assert.match(buildReactionReply({ botName: 'Showins Bot' }), /REACTION/)
})
