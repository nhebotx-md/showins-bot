import assert from 'node:assert/strict'
import test from 'node:test'
import menuPlugin from '../plugins/main/menu.js'

const config = { bot: { name: 'Showins Bot', prefix: '.' } }
const plugins = [
  menuPlugin,
  { name: 'ping', category: 'tools', description: 'Memeriksa respons bot.', commands: ['ping'] },
  { name: 'status', category: 'system', description: 'Menampilkan status.', commands: ['status', 'info'] }
]

test('plugin menu mengirim semua submenu kategori sebagai pilihan interactive menu', async () => {
  const sentMenus = []
  await menuPlugin.execute({
    args: [],
    config,
    plugins,
    reply: async () => {},
    senderNumber: '6281234567890',
    userStore: { get: () => ({ menuTheme: 'ledger' }) },
    sendMenu: async payload => sentMenus.push(payload)
  })

  assert.equal(sentMenus.length, 1)
  assert.equal(sentMenus[0].title, 'Showins Bot • Ledger')
  assert.equal(sentMenus[0].footer, 'Tema: Ledger • Showins Bot')
  assert.match(sentMenus[0].text, /SHOWINS BOT \/ MENU/)
  assert.deepEqual(sentMenus[0].options, [
    { label: 'Utama', id: '.catmain' },
    { label: 'Tools', id: '.cattools' },
    { label: 'Fun', id: '.catfun' },
    { label: 'Test Reply', id: '.cattestreply' },
    { label: 'Grup', id: '.catgroup' },
    { label: 'Media', id: '.catmedia' },
    { label: 'Owner', id: '.catowner' },
    { label: 'Sistem', id: '.catsystem' }
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
