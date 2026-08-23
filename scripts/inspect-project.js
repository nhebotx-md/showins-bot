import fs from 'node:fs/promises'
import path from 'node:path'

const required = [
  'config.example.js',
  'src/index.js',
  'src/core/connection-manager.js',
  'src/core/command-router.js',
  'src/core/plugin-loader.js',
  'plugins/menu.js',
  'docs/TERMUX.md'
]

const missing = []
for (const file of required) {
  try {
    await fs.access(path.resolve(file))
  } catch {
    missing.push(file)
  }
}

if (missing.length > 0) {
  console.error(`Berkas wajib belum ada: ${missing.join(', ')}`)
  process.exit(1)
}

console.log('Struktur Showins Bot lengkap dan siap dipasang.')
