import assert from 'node:assert/strict'
import test from 'node:test'
import replyButtons from '../plugins/reply-buttons.js'
import replyDocument from '../plugins/reply-document.js'
import replyPlain from '../plugins/reply-plain.js'
import replyReaction from '../plugins/reply-reaction.js'
import replyTest from '../plugins/reply-test.js'

const config = { bot: { name: 'Showins Bot', prefix: '.' } }

test('menu Reply Lab menawarkan semua variasi reply yang dapat diuji', async () => {
  const menus = []
  await replyTest.execute({ config, sendMenu: async payload => menus.push(payload) })

  assert.equal(replyTest.category, 'testreply')
  assert.equal(replyTest.access, 'registered')
  assert.equal(menus[0].options.length, 6)
  assert.deepEqual(menus[0].options.map(option => option.id), [
    '.replyplain', '.replypreview', '.replymention', '.replydocument', '.replyreaction', '.replybuttons'
  ])
})

test('plugin reply mengirim payload melalui helper router dan reaksi sebelum konfirmasi', async () => {
  const responses = []
  const reactions = []
  const textReplies = []

  await replyPlain.execute({ config, senderNumber: '628111222333', sendResponse: async payload => responses.push(payload) })
  await replyDocument.execute({ config, sendResponse: async payload => responses.push(payload) })
  await replyReaction.execute({ config, react: async emoji => reactions.push(emoji), reply: async text => textReplies.push(text) })
  await replyButtons.execute({ config, sendMenu: async payload => responses.push(payload) })

  assert.equal(responses[0].type, 'plain')
  assert.equal(responses[1].type, 'document')
  assert.deepEqual(reactions, ['✨'])
  assert.match(textReplies[0], /REACTION/)
  assert.equal(responses[2].options.length, 3)
})
