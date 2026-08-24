import fs from 'node:fs/promises'
import path from 'node:path'

const required = [
  'config.example.js',
  'src/index.js',
  'src/core/baileys.js',
  'src/core/plugin-categories.js',
  'src/core/connection-manager.js',
  'src/core/command-router.js',
  'src/core/plugin-loader.js',
  'src/services/rich-messages.js',
  'src/services/plugin-menu.js',
  'plugins/menu.js',
  'docs/TERMUX.md',
  'docs/ARCHITECTURE.md',
  'test/plugin-categories.test.js',
  'test/rich-messages.test.js'
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
