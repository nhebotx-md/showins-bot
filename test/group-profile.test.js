import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import test from 'node:test'
import { createGroupProfileStore } from '../src/services/group-profile-store.js'
import { createGroupGreetingService, renderGroupTemplate } from '../src/services/group-greetings.js'
import { goodbyePlugins, groupRulesPlugin, resetGroupRulesPlugin, setGroupRulesPlugin, welcomePlugins } from '../src/services/group-profile.js'

test('profil grup menyimpan dan memulihkan aturan secara lokal', async () => {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'showins-groups-'))
  const filePath = path.join(directory, 'groups.json')
  try {
    const store = createGroupProfileStore({ filePath })
    await store.load()
    await store.setRules('120363000000000000@g.us', 'Jangan spam. Hormati anggota lain.')
    const reloaded = createGroupProfileStore({ filePath })
    await reloaded.load()
    assert.equal(reloaded.get('120363000000000000@g.us').rules, 'Jangan spam. Hormati anggota lain.')
  } finally {
    await fs.rm(directory, { recursive: true, force: true })
  }
})

test('plugin aturan grup menyimpan, menampilkan, dan mereset konfigurasi', async () => {
  const calls = []
  const store = {
    current: null,
    get() { return this.current },
    async setRules(_jid, rules) { this.current = { rules } },
    async clearRules() { this.current = { rules: '' } }
  }
  const context = {
    jid: '120363000000000000@g.us',
    config: { bot: { prefix: '.' } },
    services: { groupProfiles: store },
    reply: async text => calls.push(text)
  }
  await setGroupRulesPlugin.execute({ ...context, args: ['Jangan', 'spam'] })
  await groupRulesPlugin.execute(context)
  await resetGroupRulesPlugin.execute(context)

  assert.match(calls[0], /disimpan/)
  assert.match(calls[1], /Jangan spam/)
  assert.match(calls[2], /dihapus/)
})

test('template welcome dan goodbye memakai placeholder aman lalu dikirim pada event peserta grup', async () => {
  const calls = []
  const store = {
    get: () => ({ welcomeTemplate: 'Halo {user}, selamat datang di {group}. Anggota: {count}.', goodbyeTemplate: 'Sampai jumpa {number} dari {group}.' }),
    async setTemplate() {}
  }
  const socket = {
    groupMetadata: async () => ({ subject: 'Grup Uji', participants: [{ id: '6281234567890@s.whatsapp.net' }, { id: '6282222222222@s.whatsapp.net' }] }),
    sendMessage: async (...args) => calls.push(args)
  }
  const service = createGroupGreetingService({ groupProfiles: store, config: { bot: { name: 'Showins' } }, logger: { error() {} } })
  await service.handle({ socket, update: { id: '120363000000000000@g.us', action: 'add', participants: ['6281234567890@s.whatsapp.net'] } })
  await service.handle({ socket, update: { id: '120363000000000000@g.us', action: 'remove', participants: ['6282222222222@s.whatsapp.net'] } })

  assert.match(calls[0][1].text, /@6281234567890/)
  assert.match(calls[0][1].text, /Grup Uji/)
  assert.match(calls[1][1].text, /6282222222222/)
  assert.equal(renderGroupTemplate('{bot} {unknown}', { participant: '6281234567890@s.whatsapp.net', metadata: {}, botName: 'Showins' }), 'Showins {unknown}')

  const context = { jid: '120363000000000000@g.us', args: ['Halo', '{user}'], config: { bot: { prefix: '.' } }, services: { groupProfiles: store }, reply: async text => calls.push(['reply', text]) }
  await welcomePlugins.set.execute(context)
  await goodbyePlugins.set.execute({ ...context, args: ['Sampai', '{number}'] })
  assert.match(calls.at(-2)[1], /welcome disimpan/)
  assert.match(calls.at(-1)[1], /goodbye disimpan/)
})
