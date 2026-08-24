import assert from 'node:assert/strict'
import test from 'node:test'
import { getCategoriesForPlugins, getPluginCategory, isPluginCategory } from '../src/core/plugin-categories.js'
import { getMenuCategories, renderCategoryDetail, renderCategoryOverview } from '../src/services/plugin-menu.js'

const plugins = [
  { name: 'status', category: 'system', description: 'Status bot.', commands: ['status'] },
  { name: 'menu', category: 'main', description: 'Menu bot.', commands: ['menu', 'help'] },
  { name: 'ping', category: 'tools', description: 'Uji respons.', commands: ['ping'] }
]

test('registry hanya menerima kategori plugin Showins yang dikenal', () => {
  assert.equal(isPluginCategory('main'), true)
  assert.equal(isPluginCategory('system'), true)
  assert.equal(isPluginCategory('tidak-ada'), false)
  assert.equal(getPluginCategory('media').label, 'Media')
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
  const detail = renderCategoryDetail({ botName: 'Showins Bot', prefix: '.', plugins, categoryId: 'tools' })

  assert.match(overview, /\*Utama\* — 1 fitur/)
  assert.match(overview, /\*Sistem\* — 1 fitur/)
  assert.equal(detail.category.label, 'Tools')
  assert.match(detail.text, /\*\.ping\*/)
  assert.equal(renderCategoryDetail({ botName: 'Showins Bot', prefix: '.', plugins, categoryId: 'media' }), null)
})
