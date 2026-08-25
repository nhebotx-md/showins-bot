import assert from 'node:assert/strict'
import test from 'node:test'
import menuThemePlugin from '../plugins/main/menutheme.js'
import { getMenuTheme, renderCategoryDetail, renderCategoryOverview } from '../src/services/plugin-menu.js'

const plugins = [
  { name: 'menu', category: 'main', access: 'public', description: 'Menu.', commands: ['menu'] },
  { name: 'ping', category: 'tools', access: 'registered', description: 'Tes respons.', commands: ['ping'] }
]

test('renderer menu mendukung tema aman yang berbeda tanpa mengubah navigasi kategori', () => {
  const ledger = renderCategoryOverview({ botName: 'Showins', prefix: '.', plugins, theme: 'ledger' })
  const aura = renderCategoryDetail({ botName: 'Showins', prefix: '.', plugins, categoryId: 'tools', role: 'registered', theme: 'aura' })

  assert.equal(getMenuTheme('tidak-ada').id, 'classic')
  assert.match(ledger, /SHOWINS \/ MENU/)
  assert.match(ledger, /\.cattools/)
  assert.doesNotMatch(ledger, /undefined/)
  assert.match(aura.text, /✦ \*Showins — Tools\* ✦/)
  assert.match(aura.text, /\.ping/)
})

test('semua tema overview merender kategori tanpa properti visual yang hilang', () => {
  for (const theme of ['classic', 'compact', 'ledger', 'aura']) {
    const output = renderCategoryOverview({ botName: 'Showins', prefix: '.', plugins, theme })
    assert.doesNotMatch(output, /undefined/)
    assert.match(output, /Utama/)
    assert.match(output, /Tools/)
  }
})

test('command menutheme menampilkan pemilih dan menyimpan preferensi pengguna', async () => {
  const users = new Map([['6281234567890', { number: '6281234567890', menuTheme: 'classic' }]])
  const calls = []
  const userStore = {
    get: number => users.get(number) || null,
    async setMenuTheme(number, theme) { users.set(number, { number, menuTheme: theme }) }
  }
  const context = {
    config: { bot: { prefix: '.' } },
    userStore,
    senderNumber: '6281234567890',
    reply: async text => calls.push({ type: 'reply', text }),
    sendMenu: async data => calls.push({ type: 'menu', data })
  }

  await menuThemePlugin.execute({ ...context, args: [] })
  await menuThemePlugin.execute({ ...context, args: ['ledger'] })
  await menuThemePlugin.execute({ ...context, args: ['salah'] })

  assert.equal(calls[0].type, 'menu')
  assert.equal(calls[0].data.options.length, 4)
  assert.equal(users.get('6281234567890').menuTheme, 'ledger')
  assert.match(calls[1].text, /Ledger/)
  assert.match(calls[2].text, /Tema tidak ditemukan/)
})
