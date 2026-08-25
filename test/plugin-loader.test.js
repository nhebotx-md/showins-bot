import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import test from 'node:test'
import { loadPlugins } from '../src/core/plugin-loader.js'

const logger = { info() {}, error() {} }

test('plugin dasar dapat dimuat dan memiliki command', async () => {
  const plugins = await loadPlugins({ logger })
  assert.equal(plugins.length, 17)
  assert.ok(plugins.some(plugin => plugin.commands.includes('menu')))
  assert.ok(plugins.some(plugin => plugin.commands.includes('ping')))
  assert.ok(plugins.every(plugin => typeof plugin.category === 'string'))
})

test('loader memindai subfolder kategori secara deterministik', async () => {
  const plugins = await loadPlugins({ logger })

  assert.deepEqual(plugins.map(plugin => plugin.category), [
    'fun',
    'main', 'main',
    'owner',
    'system',
    'testreply', 'testreply', 'testreply', 'testreply', 'testreply', 'testreply',
    'testreply', 'testreply', 'testreply', 'testreply', 'testreply',
    'tools'
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
