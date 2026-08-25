import assert from 'node:assert/strict'
import test from 'node:test'
import statsPlugin, { formatBytes, formatUptime } from '../plugins/main/stats.js'

test('format statistik menampilkan bytes dan uptime dengan aman', () => {
  assert.equal(formatBytes(1_024), '1.0 KB')
  assert.equal(formatBytes(0), '0 B')
  assert.equal(formatUptime(3_661), '1j 1m 1d')
})

test('stats merangkum inventaris runtime tanpa menampilkan data profil pengguna', async () => {
  const replies = []
  await statsPlugin.execute({
    config: { bot: { name: 'Showins' } }, plugins: [{}, {}, {}],
    userStore: { list: () => [{ premium: true }, { premium: false }] },
    services: { groupProfiles: { list: () => [{}, {}] } },
    reply: async text => replies.push(text)
  })
  assert.match(replies[0], /Plugin aktif: \*3\*/)
  assert.match(replies[0], /Pengguna premium: \*1\*/)
  assert.doesNotMatch(replies[0], /628\d{6}/)
})
