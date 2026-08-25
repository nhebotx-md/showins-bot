import assert from 'node:assert/strict'
import test from 'node:test'
import darePlugin, { getRandomDarePrompt } from '../plugins/fun/dare.js'

test('dare memilih tantangan lokal secara deterministik saat random diinjeksikan', () => {
  assert.equal(getRandomDarePrompt(() => 0), 'Tulis satu kalimat penyemangat untuk dirimu sendiri.')
  assert.equal(getRandomDarePrompt(() => 0.999), 'Buat pertanyaan ringan yang ingin kamu tanyakan kepada teman.')
})

test('dare menyatakan tantangan bersifat sukarela dan melindungi data pribadi', async () => {
  const replies = []
  await darePlugin.execute({ reply: async text => replies.push(text) })
  assert.match(replies[0], /DARE — TANTANGAN RINGAN/)
  assert.match(replies[0], /Tantangan ini sukarela/)
  assert.match(replies[0], /jangan membagikan data pribadi/)
})
