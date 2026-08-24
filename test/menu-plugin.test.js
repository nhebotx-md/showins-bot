import assert from 'node:assert/strict'
import test from 'node:test'
import menuPlugin from '../plugins/menu.js'

const config = { bot: { name: 'Showins Bot', prefix: '.' } }
const plugins = [
  menuPlugin,
  { name: 'ping', category: 'tools', description: 'Memeriksa respons bot.', commands: ['ping'] },
  { name: 'status', category: 'system', description: 'Menampilkan status.', commands: ['status', 'info'] }
]

test('plugin menu mengirim kategori aktif sebagai pilihan interactive menu', async () => {
  const sentMenus = []
  await menuPlugin.execute({
    args: [],
    config,
    plugins,
    reply: async () => {},
    sendMenu: async payload => sentMenus.push(payload)
  })

  assert.equal(sentMenus.length, 1)
  assert.deepEqual(sentMenus[0].options, [
    { label: 'Utama', id: '.menu main' },
    { label: 'Tools', id: '.menu tools' },
    { label: 'Sistem', id: '.menu system' }
  ])
})

test('plugin menu menampilkan detail kategori dan menangani kategori tidak dikenal', async () => {
  const replies = []
  const context = {
    config,
    plugins,
    sendMenu: async () => {},
    reply: async text => replies.push(text)
  }

  await menuPlugin.execute({ ...context, args: ['tools'] })
  await menuPlugin.execute({ ...context, args: ['tidak-ada'] })

  assert.match(replies[0], /\*\.ping\*/)
  assert.match(replies[1], /Kategori tidak ditemukan/)
})
