import assert from 'node:assert/strict'
import test from 'node:test'
import mimpiPlugin from '../plugins/fun/mimpi.js'
import { createDreamWorld, renderDreamWorld } from '../src/services/dream-world.js'

test('Dream World merender cerita hiburan tanpa klaim tafsir atau prediksi', () => {
  const dream = createDreamWorld('Lintang', () => 0)
  const text = renderDreamWorld(dream)
  assert.match(text, /Lintang/)
  assert.match(text, /bukan tafsir mimpi atau prediksi/)
})

test('plugin mimpi mengirim reaksi dan reply Dream World', async () => {
  const reactions = []
  const replies = []
  await mimpiPlugin.execute({ args: ['Lintang'], react: async emoji => reactions.push(emoji), reply: async text => replies.push(text) })
  assert.deepEqual(reactions, ['🌙'])
  assert.match(replies[0], /DREAM WORLD/)
})
