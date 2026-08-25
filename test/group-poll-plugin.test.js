import assert from 'node:assert/strict'
import test from 'node:test'
import pollPlugin, { parsePollInput } from '../plugins/group/poll.js'

test('poll grup hasil adaptasi memvalidasi format dan mode multi-pilihan', () => {
  assert.deepEqual(parsePollInput('Makan apa? | Nasi, Mie'), {
    question: 'Makan apa?', options: ['Nasi', 'Mie'], multiple: false
  })
  assert.deepEqual(parsePollInput('multi | Pilih | Satu, Dua, Tiga'), {
    question: 'Pilih', options: ['Satu', 'Dua', 'Tiga'], multiple: true
  })
  assert.equal(parsePollInput('hanya satu bagian'), null)
})

test('poll grup mengirim payload poll dengan fallback teks', async () => {
  const responses = []
  await pollPlugin.execute({
    args: ['multi', '|', 'Pilih', '|', 'Satu,', 'Dua'],
    config: { bot: { prefix: '.' } },
    sendResponse: async payload => responses.push(payload)
  })

  assert.equal(pollPlugin.requirements.scope, 'group')
  assert.equal(responses[0].content.poll.name, 'Pilih')
  assert.equal(responses[0].content.poll.selectableCount, 2)
  assert.match(responses[0].fallback, /1\. Satu/)
})
