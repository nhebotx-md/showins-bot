import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { ACCESS_LEVELS } from './access-control.js'
import { isPluginCategory } from './plugin-categories.js'
import { createShooNheePortPolicy } from './plugin-policy.js'

const moduleDir = path.dirname(fileURLToPath(import.meta.url))
const defaultPluginDir = path.resolve(moduleDir, '../../plugins')

function sameRequirements(left = {}, right = {}) {
  return left.scope === right.scope && Boolean(left.admin) === Boolean(right.admin) && Boolean(left.botAdmin) === Boolean(right.botAdmin)
}

function validateAdaptedPlugin(plugin, file) {
  if (!plugin.adaptedFrom) return

  const source = plugin.adaptedFrom
  if (source.repository !== 'ShooNhee-md' || !source.path || !source.category) {
    throw new Error(`${file} memiliki metadata adaptedFrom ShooNhee-md yang tidak lengkap.`)
  }

  const policy = createShooNheePortPolicy(source)
  if (!policy.category) {
    throw new Error(`${file} berasal dari kategori ShooNhee-md yang tidak dapat diadaptasi otomatis.`)
  }

  if (plugin.category !== policy.category || plugin.access !== policy.access || !sameRequirements(plugin.requirements, policy.requirements)) {
    throw new Error(`${file} tidak sesuai dengan policy kategori, access, atau requirements ShooNhee-md.`)
  }
}

function validatePlugin(plugin, file, folderCategory) {
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

  if (folderCategory !== plugin.category) {
    throw new Error(`${file} harus berada di folder kategori ${plugin.category}.`)
  }

  validateAdaptedPlugin(plugin, file)

  return plugin
}

async function collectPluginFiles(pluginDir, relativeDir = '') {
  const directory = path.join(pluginDir, relativeDir)
  const entries = await fs.readdir(directory, { withFileTypes: true })
  const files = []

  for (const entry of entries.sort((left, right) => left.name.localeCompare(right.name))) {
    const relativePath = path.join(relativeDir, entry.name)
    if (entry.isDirectory()) {
      files.push(...await collectPluginFiles(pluginDir, relativePath))
    } else if (entry.isFile() && entry.name.endsWith('.js')) {
      files.push(relativePath)
    }
  }

  return files
}

export async function loadPlugins({ logger, pluginDir = defaultPluginDir }) {
  const files = await collectPluginFiles(pluginDir)

  const plugins = []
  for (const file of files) {
    try {
      const moduleUrl = pathToFileURL(path.join(pluginDir, file)).href
      const folderCategory = file.split(path.sep)[0]
      const plugin = validatePlugin((await import(moduleUrl)).default, file, folderCategory)
      plugins.push(plugin)
    } catch (error) {
      logger.error({ err: error, file }, 'Plugin dilewati karena gagal dimuat')
    }
  }

  return plugins
}
