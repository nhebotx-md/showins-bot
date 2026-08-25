import assert from 'node:assert/strict'
import test from 'node:test'
import bucinPlugin from '../plugins/fun/bucin.js'
import { getRomanticLine } from '../src/services/romantic-lines.js'

test('bank gombalan lokal mengembalikan teks yang pantas', () => {
  const line = getRomanticLine(() => 0)
  assert.match(line, /lagu/)
  assert.doesNotMatch(line, /narkoba|lipstik|tabok/i)
})

test('plugin bucin membalas gombalan yang ditandai sebagai hiburan', async () => {
  const replies = []
  await bucinPlugin.execute({ reply: async text => replies.push(text) })
  assert.match(replies[0], /Gombalan acak untuk hiburan/)
})
