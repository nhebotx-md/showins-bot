import assert from 'node:assert/strict'
import test from 'node:test'
import akankah from '../plugins/fun/akankah.js'
import kapan from '../plugins/fun/kapan.js'

const config = { bot: { prefix: '.' } }

test('plugin hiburan ShooNhee yang diadaptasi memvalidasi pertanyaan dan membalas secara quoted oleh router', async () => {
  const replies = []
  await akankah.execute({ args: [], config, reply: async text => replies.push(text) })
  await akankah.execute({ args: ['aku', 'bisa', 'belajar', 'konsisten?'], config, reply: async text => replies.push(text) })

  assert.equal(akankah.category, 'fun')
  assert.equal(akankah.access, 'registered')
  assert.deepEqual(akankah.requirements, { scope: 'any', admin: false, botAdmin: false })
  assert.match(replies[0], /\.akankah <pertanyaan>/)
  assert.match(replies[1], /AKANKAH/)
  assert.match(replies[1], /aku bisa belajar konsisten\?/) 
  assert.match(replies[1], /bukan kepastian/)
})

test('varian pertanyaan waktu memakai respons hiburan yang tidak mengklaim prediksi pasti', async () => {
  const replies = []
  await kapan.execute({ args: ['aku', 'selesai?'], config, reply: async text => replies.push(text) })

  assert.match(replies[0], /KAPAN/)
  assert.match(replies[0], /bukan kepastian/)
})
