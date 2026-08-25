import fs from 'node:fs/promises'
import path from 'node:path'

const required = [
  'config.example.js',
  'src/index.js',
  'src/core/baileys.js',
  'src/core/access-control.js',
  'src/core/runtime.js',
  'src/core/plugin-policy.js',
  'src/core/plugin-categories.js',
  'src/core/connection-manager.js',
  'src/core/command-router.js',
  'src/core/plugin-loader.js',
  'src/services/rich-messages.js',
  'src/services/reply-showcase.js',
  'src/services/plugin-menu.js',
  'src/services/user-store.js',
  'src/services/quiz-sessions.js',
  'src/services/fun-oracle.js',
  'src/services/fun-check.js',
  'src/services/group-settings.js',
  'scripts/reset-pairing-session.sh',
  'scripts/check-plugin-safety.js',
  'plugins/main',
  'plugins/tools',
  'plugins/fun',
  'plugins/testreply',
  'plugins/group',
  'plugins/media',
  'plugins/owner',
  'plugins/system',
  'plugins/main/menu.js',
  'plugins/main/menutheme.js',
  'plugins/main/register.js',
  'plugins/tools/ping.js',
  'plugins/fun/premium.js',
  'plugins/testreply/reply-test.js',
  'plugins/owner/owner.js',
  'plugins/system/status.js',
  'docs/TERMUX.md',
  'docs/ARCHITECTURE.md',
  'docs/REPLY-LAB.md',
  'docs/MENU-THEMES.md',
  'docs/GROUP-AUTOMATION.md',
  'docs/ITSUKICHAN-MESSAGE-RESEARCH.md',
  'docs/SHOONHEE-PLUGIN-COMPATIBILITY.md',
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
  ,'test/plugin-policy.test.js'
  ,'test/plugin-safety-check.test.js'
  ,'test/quiz-sessions.test.js'
  ,'test/group-settings.test.js'
  ,'test/menu-theme.test.js'
  ,'test/group-members.test.js'
  ,'test/group-profile.test.js'
  ,'test/afk-service.test.js'
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
