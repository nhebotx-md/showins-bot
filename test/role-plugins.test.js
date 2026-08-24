import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import test from 'node:test'
import ownerPlugin from '../plugins/owner.js'
import premiumPlugin from '../plugins/premium.js'
import registerPlugin from '../plugins/register.js'
import { createUserStore } from '../src/services/user-store.js'

async function createTemporaryUserStore() {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'showins-role-plugin-'))
  const userStore = createUserStore({ filePath: path.join(directory, 'users.json') })
  await userStore.load()
  return { directory, userStore }
}

test('register mendaftarkan pengguna sendiri dan owner dapat menetapkan premium', async () => {
  const { directory, userStore } = await createTemporaryUserStore()
  const replies = []

  try {
    await registerPlugin.execute({
      role: 'guest',
      senderNumber: '6281234567890',
      userStore,
      reply: async text => replies.push(text)
    })
    assert.equal(userStore.get('6281234567890').premium, false)

    await ownerPlugin.execute({
      command: 'addpremium',
      args: ['6281234567890'],
      userStore,
      reply: async text => replies.push(text)
    })
    assert.equal(userStore.get('6281234567890').premium, true)

    await premiumPlugin.execute({ reply: async text => replies.push(text) })
    assert.match(replies.join('\n'), /Pendaftaran berhasil/)
    assert.match(replies.join('\n'), /sekarang berstatus premium/)
    assert.match(replies.join('\n'), /Akses premium aktif/)
  } finally {
    await fs.rm(directory, { recursive: true, force: true })
  }
})
