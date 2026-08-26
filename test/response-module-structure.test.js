import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import test from 'node:test'
import { fileURLToPath } from 'node:url'
import { createResponseBranding, formatBrandedText } from '../src/services/responses/index.js'

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

test('facade responses menjadi titik pengembangan lokal dan lokasi adapter lama tidak digunakan', async () => {
  const branding = createResponseBranding({ bot: { name: 'Showins Bot' } })
  assert.match(formatBrandedText('Pesan uji', branding), /Pesan uji/)

  await assert.rejects(fs.access(path.join(rootDir, 'src/services/response-branding.js')))
  await fs.access(path.join(rootDir, 'src/services/responses/branding.js'))
  await fs.access(path.join(rootDir, 'src/services/responses/index.js'))
})
