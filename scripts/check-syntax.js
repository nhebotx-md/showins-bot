import fs from 'node:fs/promises'
import path from 'node:path'
import { spawnSync } from 'node:child_process'

const directories = ['src', 'plugins', 'test']
const rootFiles = ['config.example.js']

async function collectJavaScriptFiles(directory) {
  const entries = await fs.readdir(directory, { withFileTypes: true })
  const files = []

  for (const entry of entries) {
    const target = path.join(directory, entry.name)
    if (entry.isDirectory()) {
      files.push(...(await collectJavaScriptFiles(target)))
    } else if (entry.isFile() && entry.name.endsWith('.js')) {
      files.push(target)
    }
  }

  return files
}

const files = [...rootFiles]
for (const directory of directories) files.push(...(await collectJavaScriptFiles(directory)))

for (const file of files.sort()) {
  const result = spawnSync(process.execPath, ['--check', file], { encoding: 'utf8' })
  if (result.status !== 0) {
    process.stderr.write(result.stderr || `Sintaks tidak valid: ${file}\n`)
    process.exit(result.status || 1)
  }
}

console.log(`${files.length} berkas JavaScript lolos pemeriksaan sintaks.`)
