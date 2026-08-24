import assert from 'node:assert/strict'
import test from 'node:test'
import { inspectRuntime } from '../src/core/runtime.js'

test('runtime mengenali Termux native dan menolak Node di bawah versi minimum', () => {
  const termux = inspectRuntime({ platform: 'android', arch: 'arm64', nodeVersion: '22.14.0' })
  const unsupported = inspectRuntime({ platform: 'android', arch: 'arm64', nodeVersion: '18.20.0' })

  assert.equal(termux.runtime, 'TERMUX NATIVE')
  assert.equal(termux.supported, true)
  assert.equal(unsupported.supported, false)
})
