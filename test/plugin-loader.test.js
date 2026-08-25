import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import test from 'node:test'
import { loadPlugins } from '../src/core/plugin-loader.js'

const logger = { info() {}, error() {} }

test('plugin dasar dapat dimuat dan memiliki command', async () => {
  const plugins = await loadPlugins({ logger })
  assert.equal(plugins.length, 80)
  assert.ok(plugins.some(plugin => plugin.commands.includes('aturanbot')))
  assert.ok(plugins.some(plugin => plugin.commands.includes('afk')))
  assert.ok(plugins.some(plugin => plugin.commands.includes('setwelcome')))
  assert.ok(plugins.some(plugin => plugin.commands.includes('rulesgrup')))
  assert.ok(plugins.some(plugin => plugin.commands.includes('addmember')))
  assert.ok(plugins.some(plugin => plugin.commands.includes('kick')))
  assert.ok(plugins.some(plugin => plugin.commands.includes('menu')))
  assert.ok(plugins.some(plugin => plugin.commands.includes('menutheme')))
  assert.ok(plugins.some(plugin => plugin.commands.includes('ping')))
  assert.ok(plugins.every(plugin => typeof plugin.category === 'string'))
})

test('loader memindai subfolder kategori secara deterministik', async () => {
  const plugins = await loadPlugins({ logger })

  assert.deepEqual(plugins.map(plugin => plugin.category), [
    ...Array(38).fill('fun'),
    ...Array(23).fill('group'),
    ...Array(4).fill('main'),
    'owner',
    'system',
    ...Array(11).fill('testreply'),
    ...Array(2).fill('tools')
  ])
})

test('loader melewati plugin root dan plugin dengan folder kategori yang tidak cocok', async () => {
  const pluginDir = await fs.mkdtemp(path.join(os.tmpdir(), 'showins-plugin-loader-'))
  const errors = []
  const errorLogger = { info() {}, error(entry) { errors.push(entry) } }
  const pluginSource = category => `export default {
  name: 'fixture-${category}',
  category: '${category}',
  access: 'public',
  description: 'Fixture test.',
  commands: ['fixture${category}'],
  async execute() {}
}`

  try {
    await fs.writeFile(path.join(pluginDir, 'package.json'), '{"type":"module"}\n')
    await fs.writeFile(path.join(pluginDir, 'flat.js'), pluginSource('main'))
    await fs.mkdir(path.join(pluginDir, 'tools'))
    await fs.writeFile(path.join(pluginDir, 'tools', 'wrong-folder.js'), pluginSource('fun'))

    const plugins = await loadPlugins({ logger: errorLogger, pluginDir })

    assert.deepEqual(plugins, [])
    assert.deepEqual(errors.map(entry => entry.file), ['flat.js', path.join('tools', 'wrong-folder.js')])
    assert.match(errors[0].err.message, /folder kategori main/)
    assert.match(errors[1].err.message, /folder kategori fun/)
  } finally {
    await fs.rm(pluginDir, { recursive: true, force: true })
  }
})

test('loader memverifikasi policy pada plugin hasil adaptasi ShooNhee-md', async () => {
  const pluginDir = await fs.mkdtemp(path.join(os.tmpdir(), 'showins-adapted-plugin-'))
  const errors = []
  const errorLogger = { info() {}, error(entry) { errors.push(entry) } }
  const validPlugin = `export default {
  name: 'rate', category: 'fun', access: 'registered',
  description: 'Memberi rating secara santai.', commands: ['rate'], async execute() {},
  requirements: { scope: 'any', admin: false, botAdmin: false },
  adaptedFrom: { repository: 'ShooNhee-md', path: 'plugins/fun/rate.js', category: 'fun' }
}`
  const invalidPlugin = `export default {
  name: 'push', category: 'fun', access: 'registered',
  description: 'Fixture tidak aman.', commands: ['pushfixture'], async execute() {},
  requirements: { scope: 'any', admin: false, botAdmin: false },
  adaptedFrom: { repository: 'ShooNhee-md', path: 'plugins/pushkontak/push.js', category: 'pushkontak' }
}`

  try {
    await fs.writeFile(path.join(pluginDir, 'package.json'), '{"type":"module"}\n')
    await fs.mkdir(path.join(pluginDir, 'fun'))
    await fs.writeFile(path.join(pluginDir, 'fun', 'rate.js'), validPlugin)
    await fs.writeFile(path.join(pluginDir, 'fun', 'push.js'), invalidPlugin)

    const plugins = await loadPlugins({ logger: errorLogger, pluginDir })

    assert.deepEqual(plugins.map(plugin => plugin.name), ['rate'])
    assert.equal(errors.length, 1)
    assert.match(errors[0].err.message, /tidak dapat diadaptasi otomatis/)
  } finally {
    await fs.rm(pluginDir, { recursive: true, force: true })
  }
})
