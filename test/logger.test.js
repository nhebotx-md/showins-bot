import assert from 'node:assert/strict'
import test from 'node:test'
import { classifyChat, createLogger } from '../src/core/logger.js'

test('logger menyediakan seluruh level yang dipakai base bot', () => {
  const logger = createLogger()
  for (const level of ['debug', 'info', 'warn', 'error', 'fatal']) {
    assert.equal(typeof logger[level], 'function')
  }
  assert.equal(typeof logger.command, 'function')
  assert.equal(typeof logger.reply, 'function')
})

test('logger mengenali sumber private, grup, dan channel', () => {
  assert.equal(classifyChat('6281234567890@s.whatsapp.net'), 'private')
  assert.equal(classifyChat('1203630@g.us'), 'group')
  assert.equal(classifyChat('1203630@newsletter'), 'channel')
})

test('logger aktivitas menampilkan event command dan respons dengan label sumber', () => {
  const lines = []
  const originalLog = console.log
  console.log = line => lines.push(line)

  try {
    const logger = createLogger()
    logger.command({ source: 'group', role: 'owner', command: '.users' })
    logger.reply({ source: 'group', role: 'owner', command: '.users', type: 'text', chars: 42 })
  } finally {
    console.log = originalLog
  }

  const plainLines = lines.map(line => line.replace(/\u001B\[[0-?]*[ -/]*[@-~]/g, ''))
  assert.equal(plainLines.length, 2)
  assert.match(plainLines[0], /IN\s+GROUP\s+OWNER\s+\.users/)
  assert.match(plainLines[1], /OUT\s+GROUP\s+TEXT\s+42 KARAKTER/)
})

test('panel Command Ledger menampilkan total plugin dan count setiap kategori', () => {
  const lines = []
  const originalLog = console.log
  console.log = line => lines.push(line)

  try {
    createLogger().startup({
      botName: 'Showins Bot',
      engine: 'ItsLiaaa',
      userCount: 4,
      plugins: [
        { category: 'main' },
        { category: 'tools' },
        { category: 'tools' },
        { category: 'owner' }
      ]
    })
  } finally {
    console.log = originalLog
  }

  const panel = lines.map(line => line.replace(/\u001B\[[0-?]*[ -/]*[@-~]/g, '')).join('\n')
  assert.match(panel, /PLUGINS 4 ACTIVE/)
  assert.match(panel, /USERS   4 REGISTERED/)
  assert.match(panel, /UTAMA\s+1/)
  assert.match(panel, /TOOLS\s+2/)
  assert.match(panel, /OWNER\s+1/)
  assert.match(panel, /TOTAL 4/)
})
