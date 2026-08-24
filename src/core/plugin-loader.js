import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { ACCESS_LEVELS } from './access-control.js'
import { isPluginCategory } from './plugin-categories.js'

const moduleDir = path.dirname(fileURLToPath(import.meta.url))
const defaultPluginDir = path.resolve(moduleDir, '../../plugins')

function validatePlugin(plugin, file) {
  if (
    !plugin?.name ||
    !plugin?.description ||
    !isPluginCategory(plugin.category) ||
    !Object.hasOwn(ACCESS_LEVELS, plugin.access) ||
    !Array.isArray(plugin.commands) ||
    plugin.commands.length === 0 ||
    typeof plugin.execute !== 'function'
  ) {
    throw new Error(`${file} tidak mengekspor plugin valid.`)
  }
  return plugin
}

export async function loadPlugins({ logger, pluginDir = defaultPluginDir }) {
  const entries = await fs.readdir(pluginDir, { withFileTypes: true })
  const files = entries
    .filter(entry => entry.isFile() && entry.name.endsWith('.js'))
    .map(entry => entry.name)
    .sort()

  const plugins = []
  for (const file of files) {
    try {
      const moduleUrl = pathToFileURL(path.join(pluginDir, file)).href
      const plugin = validatePlugin((await import(moduleUrl)).default, file)
      plugins.push(plugin)
      logger.info({ plugin: plugin.name, category: plugin.category, access: plugin.access, commands: plugin.commands }, 'Plugin dimuat')
    } catch (error) {
      logger.error({ err: error, file }, 'Plugin dilewati karena gagal dimuat')
    }
  }

  logger.info({ total: plugins.length }, 'Sistem plugin siap')
  return plugins
}
