import assert from 'node:assert/strict'
import test from 'node:test'
import truthPlugin, { getRandomTruthPrompt } from '../plugins/fun/truth.js'

test('truth memilih prompt lokal secara deterministik saat random diinjeksikan', () => {
  assert.equal(getRandomTruthPrompt(() => 0), 'Kebiasaan kecil apa yang paling ingin kamu pertahankan tahun ini?')
  assert.equal(getRandomTruthPrompt(() => 0.999), 'Apa yang biasanya membantumu kembali fokus saat sedang lelah?')
})

test('truth menandai permainan sebagai opsional dan menghindari permintaan data pribadi', async () => {
  const replies = []
  await truthPlugin.execute({ reply: async text => replies.push(text) })
  assert.match(replies[0], /TRUTH — PERMAINAN RINGAN/)
  assert.match(replies[0], /Tidak perlu membagikan data pribadi/)
})
