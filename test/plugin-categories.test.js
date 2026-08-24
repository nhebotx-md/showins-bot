import assert from 'node:assert/strict'
import test from 'node:test'
import {
  getCategoriesForPlugins,
  getCategoryIdFromMenuCommand,
  getCategoryMenuCommand,
  getPluginCategory,
  isPluginCategory
} from '../src/core/plugin-categories.js'
import { getMenuCategories, renderCategoryDetail, renderCategoryOverview } from '../src/services/plugin-menu.js'

const plugins = [
  { name: 'status', category: 'system', access: 'registered', description: 'Status bot.', commands: ['status'] },
  { name: 'menu', category: 'main', access: 'public', description: 'Menu bot.', commands: ['menu', 'help'] },
  { name: 'ping', category: 'tools', access: 'premium', description: 'Uji respons.', commands: ['ping'] }
]

test('registry hanya menerima kategori plugin Showins yang dikenal', () => {
  assert.equal(isPluginCategory('main'), true)
  assert.equal(isPluginCategory('system'), true)
  assert.equal(isPluginCategory('tidak-ada'), false)
  assert.equal(getPluginCategory('media').label, 'Media')
  assert.equal(getCategoryMenuCommand('fun'), 'catfun')
  assert.equal(getCategoryMenuCommand('testreply'), 'cattestreply')
  assert.equal(getCategoryIdFromMenuCommand('catgroup'), 'group')
  assert.equal(getCategoryIdFromMenuCommand('catowner'), 'owner')
  assert.equal(getCategoryIdFromMenuCommand('cattestreply'), 'testreply')
  assert.equal(getCategoryIdFromMenuCommand('catunknown'), null)
})

test('kategori aktif diurutkan sesuai prioritas registry', () => {
  assert.deepEqual(
    getCategoriesForPlugins(plugins).map(category => category.id),
    ['main', 'tools', 'system']
  )
  assert.equal(getMenuCategories(plugins)[1].plugins[0].name, 'ping')
})

test('menu kategori membuat ringkasan dan detail perintah dengan prefix yang benar', () => {
  const overview = renderCategoryOverview({ botName: 'Showins Bot', prefix: '.', plugins })
  const guestDetail = renderCategoryDetail({ botName: 'Showins Bot', prefix: '.', plugins, categoryId: 'tools' })
  const premiumDetail = renderCategoryDetail({ botName: 'Showins Bot', prefix: '.', plugins, categoryId: 'tools', role: 'premium' })

  assert.match(overview, /\*Utama\* — \.catmain/)
  assert.match(overview, /\*Fun\* — \.catfun/)
  assert.match(overview, /\*Test Reply\* — \.cattestreply/)
  assert.match(overview, /\*Sistem\* — \.catsystem/)
  assert.equal(guestDetail.category.label, 'Tools')
  assert.match(guestDetail.text, /\*\.ping\*/)
  assert.match(guestDetail.text, /Terkunci: premium/)
  assert.doesNotMatch(premiumDetail.text, /Terkunci/)
  assert.match(
    renderCategoryDetail({ botName: 'Showins Bot', prefix: '.', plugins, categoryId: 'media' }).text,
    /Belum ada fitur aktif/
  )
})
