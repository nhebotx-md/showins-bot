import fs from 'node:fs/promises'
import path from 'node:path'

const required = [
  'config.example.js',
  'src/index.js',
  'src/core/baileys.js',
  'src/core/access-control.js',
  'src/core/runtime.js',
  'src/core/plugin-categories.js',
  'src/core/connection-manager.js',
  'src/core/command-router.js',
  'src/core/plugin-loader.js',
  'src/services/rich-messages.js',
  'src/services/reply-showcase.js',
  'src/services/plugin-menu.js',
  'src/services/user-store.js',
  'scripts/reset-pairing-session.sh',
  'plugins/menu.js',
  'plugins/register.js',
  'plugins/owner.js',
  'docs/TERMUX.md',
  'docs/ARCHITECTURE.md',
  'docs/REPLY-LAB.md',
  'test/plugin-categories.test.js',
  'test/category-menu-router.test.js',
  'test/access-control.test.js',
  'test/access-router.test.js',
  'test/activity-command-router.test.js',
  'test/role-plugins.test.js',
  'test/interactive-command-router.test.js',
  'test/rich-messages.test.js'
  ,'test/reply-showcase.test.js'
  ,'test/reply-test-plugins.test.js'
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
