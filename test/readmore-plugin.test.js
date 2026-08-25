import assert from 'node:assert/strict'
import test from 'node:test'
import readmore from '../plugins/tools/readmore.js'

const config = { bot: { prefix: '.' } }

test('readmore hasil adaptasi memvalidasi pemisah dan menyisipkan separator WhatsApp', async () => {
  const replies = []
  await readmore.execute({ args: ['Halo|rahasia'], config, reply: async text => replies.push(text) })
  await readmore.execute({ args: ['tanpa-pemisah'], config, reply: async text => replies.push(text) })

  assert.equal(readmore.category, 'tools')
  assert.equal(readmore.access, 'registered')
  assert.match(replies[0], /^Halo/)
  assert.match(replies[0], /rahasia$/)
  assert.ok(replies[0].length > 4000)
  assert.match(replies[1], /\.readmore <teks awal>\|<teks lanjutan>/)
})
