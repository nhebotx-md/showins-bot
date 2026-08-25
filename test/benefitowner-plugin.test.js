import assert from 'node:assert/strict'
import test from 'node:test'
import benefitOwnerPlugin, { getOwnerPlugins } from '../plugins/main/benefitowner.js'

test('benefit owner hanya mengambil metadata plugin dengan access owner', () => {
  const plugins = [
    { name: 'premium', access: 'premium' },
    { name: 'ownerz', access: 'owner' },
    { name: 'public', access: 'registered' }
  ]
  assert.deepEqual(getOwnerPlugins(plugins).map(plugin => plugin.name), ['ownerz'])
})

test('benefit owner merender command owner aktif tanpa klaim layanan yang tidak tersedia', async () => {
  const replies = []
  await benefitOwnerPlugin.execute({
    config: { bot: { prefix: '.' } },
    plugins: [{ name: 'users', access: 'owner', description: 'Melihat daftar pengguna.' }],
    reply: async text => replies.push(text)
  })
  assert.match(replies[0], /\.users/)
  assert.doesNotMatch(replies[0], /Limit tidak terbatas|panel & server/i)
})
