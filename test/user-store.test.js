import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import test from 'node:test'
import { createUserStore } from '../src/services/user-store.js'

test('storage pengguna mempertahankan registrasi dan status premium secara lokal', async () => {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'showins-users-'))
  const filePath = path.join(directory, 'users.json')

  try {
    const userStore = createUserStore({ filePath })
    await userStore.load()
    const registration = await userStore.register('0812 3456 7890')
    const premiumUser = await userStore.setPremium('6281234567890', true)

    assert.equal(registration.created, true)
    assert.equal(premiumUser.premium, true)

    const reloadedStore = createUserStore({ filePath })
    await reloadedStore.load()
    assert.equal(reloadedStore.get('6281234567890').premium, true)
  } finally {
    await fs.rm(directory, { recursive: true, force: true })
  }
})
