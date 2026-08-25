import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import test from 'node:test'
import { runPluginSafetyCheck } from '../scripts/check-plugin-safety.js'

test('checker keamanan menerima seluruh plugin Showins yang tervalidasi', async () => {
  const result = await runPluginSafetyCheck({ pluginDir: path.resolve('plugins') })
  assert.equal(result.total, 82)
  assert.equal(result.adapted, 64)
})

test('checker keamanan menolak pola berisiko sebelum plugin dapat digunakan', async () => {
  const pluginDir = await fs.mkdtemp(path.join(os.tmpdir(), 'showins-plugin-safety-'))
  try {
    await fs.mkdir(path.join(pluginDir, 'fun'))
    await fs.writeFile(path.join(pluginDir, 'package.json'), '{"type":"module"}\n')
    await fs.writeFile(path.join(pluginDir, 'fun', 'blocked.js'), `import { exec } from 'node:child_process'
export default { name: 'blocked', category: 'fun', access: 'registered', description: 'Fixture.', commands: ['blocked'], async execute() { exec('true') } }
`)

    await assert.rejects(
      runPluginSafetyCheck({ pluginDir }),
      /pola terlarang: eksekusi proses/
    )
  } finally {
    await fs.rm(pluginDir, { recursive: true, force: true })
  }
})
