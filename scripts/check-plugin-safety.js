import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { loadPlugins } from '../src/core/plugin-loader.js'

const blockedPatterns = Object.freeze([
  ['eksekusi proses', /child_process|\bexec\(|\bspawn\(/],
  ['evaluasi dinamis', /\beval\(|new Function\(/],
  ['pengiriman massal', /pushkontak|broadcast|\bspam\b/i],
  ['konten dewasa', /nsfw|porn|hentai|rule34/i],
  ['model pesan menipu', /fake(?:contact|payment|order|invoice)/i],
  ['hapus berkas', /fs\.(?:rm|unlink)|rmSync|unlinkSync/]
])

async function collectPluginFiles(directory) {
  const entries = await fs.readdir(directory, { withFileTypes: true })
  const files = []
  for (const entry of entries.sort((left, right) => left.name.localeCompare(right.name))) {
    const target = path.join(directory, entry.name)
    if (entry.isDirectory()) files.push(...await collectPluginFiles(target))
    else if (entry.isFile() && entry.name.endsWith('.js')) files.push(target)
  }
  return files
}

export async function runPluginSafetyCheck({ pluginDir = path.resolve('plugins') } = {}) {
  const files = await collectPluginFiles(pluginDir)
  const violations = []

  for (const file of files) {
    const source = await fs.readFile(file, 'utf8')
    for (const [label, pattern] of blockedPatterns) {
      if (pattern.test(source)) violations.push(`${path.relative(pluginDir, file)} memakai pola terlarang: ${label}`)
    }
  }

  const loadErrors = []
  const plugins = await loadPlugins({
    pluginDir,
    logger: { info() {}, error(entry) { loadErrors.push(`${entry.file}: ${entry.err.message}`) } }
  })
  if (loadErrors.length > 0) violations.push(...loadErrors.map(error => `Loader menolak plugin: ${error}`))

  const adapted = plugins.filter(plugin => plugin.adaptedFrom)
  for (const plugin of adapted) {
    if (!plugin.requirements) violations.push(`${plugin.name} hasil adaptasi tidak memiliki requirements.`)
  }

  if (violations.length > 0) {
    throw new Error(`Checker keamanan plugin gagal:\n- ${violations.join('\n- ')}`)
  }

  return { total: plugins.length, adapted: adapted.length }
}

const currentFile = fileURLToPath(import.meta.url)
if (process.argv[1] && path.resolve(process.argv[1]) === currentFile) {
  const summary = await runPluginSafetyCheck()
  console.log(`Checker keamanan plugin lulus: ${summary.total} plugin, ${summary.adapted} hasil adaptasi ShooNhee-md.`)
}
