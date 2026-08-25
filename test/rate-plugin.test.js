import assert from 'node:assert/strict'
import test from 'node:test'
import ratePlugin from '../plugins/fun/rate.js'

test('rate memvalidasi subjek dan menyatakan hasil sebagai hiburan', async () => {
  const replies = []
  const context = { config: { bot: { prefix: '.' } }, reply: async text => replies.push(text) }
  await ratePlugin.execute({ ...context, args: [] })
  await ratePlugin.execute({ ...context, args: ['desain', 'menu'] })
  assert.match(replies[0], /\.rate/)
  assert.match(replies[1], /desain menu/)
  assert.match(replies[1], /dibuat acak untuk hiburan/)
})
