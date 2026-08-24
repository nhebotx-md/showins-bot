import assert from 'node:assert/strict'
import test from 'node:test'
import { loadPlugins } from '../src/core/plugin-loader.js'

const logger = { info() {}, error() {} }

test('plugin dasar dapat dimuat dan memiliki command', async () => {
  const plugins = await loadPlugins({ logger })
  assert.ok(plugins.length >= 3)
  assert.ok(plugins.some(plugin => plugin.commands.includes('menu')))
  assert.ok(plugins.some(plugin => plugin.commands.includes('ping')))
  assert.ok(plugins.every(plugin => typeof plugin.category === 'string'))
})
