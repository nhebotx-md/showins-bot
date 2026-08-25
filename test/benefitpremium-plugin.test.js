import assert from 'node:assert/strict'
import test from 'node:test'
import benefitPremiumPlugin, { getPremiumPlugins } from '../plugins/main/benefitpremium.js'

test('benefit premium hanya mengambil metadata plugin dengan access premium', () => {
  const plugins = [
    { name: 'owner', access: 'owner' },
    { name: 'premiumz', access: 'premium' },
    { name: 'public', access: 'registered' }
  ]
  assert.deepEqual(getPremiumPlugins(plugins).map(plugin => plugin.name), ['premiumz'])
})

test('benefit premium merender command premium aktif tanpa klaim paket yang tidak ada', async () => {
  const replies = []
  await benefitPremiumPlugin.execute({
    config: { bot: { prefix: '.' } },
    plugins: [{ name: 'premium', access: 'premium', description: 'Contoh fitur premium.' }],
    reply: async text => replies.push(text)
  })
  assert.match(replies[0], /\.premium/)
  assert.doesNotMatch(replies[0], /Limit harian|watermark/i)
})
