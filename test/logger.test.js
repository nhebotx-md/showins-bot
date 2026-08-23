import assert from 'node:assert/strict'
import test from 'node:test'
import { createLogger } from '../src/core/logger.js'

test('logger menyediakan seluruh level yang dipakai base bot', () => {
  const logger = createLogger()
  for (const level of ['debug', 'info', 'warn', 'error', 'fatal']) {
    assert.equal(typeof logger[level], 'function')
  }
})
