import assert from 'node:assert/strict'
import test from 'node:test'
import carifiturPlugin, { filterAvailableFeatures, findFeatures } from '../plugins/main/carifitur.js'

const plugins = [
  { name: 'kick', category: 'group', description: 'Mengeluarkan anggota grup.', commands: ['kick', 'remove'], access: 'registered', requirements: { scope: 'group', admin: false, botAdmin: false } },
  { name: 'rate', category: 'fun', description: 'Memberi penilaian acak untuk hiburan.', commands: ['rate', 'nilai'], access: 'registered', requirements: { scope: 'any', admin: false, botAdmin: false } },
  { name: 'menu', category: 'main', description: 'Membuka menu kategori.', commands: ['menu'], access: 'registered', requirements: { scope: 'any', admin: false, botAdmin: false } }
]

test('pencarian fitur mengurutkan plugin aktif berdasarkan kecocokan nama, kategori, dan deskripsi', () => {
  assert.equal(findFeatures(plugins, 'grup')[0].plugin.name, 'kick')
  assert.equal(findFeatures(plugins, 'nilai')[0].plugin.name, 'rate')
})

test('pencarian fitur menyaring command berdasarkan role dan konteks private/grup/admin', async () => {
  const candidates = [
    { name: 'public', category: 'fun', description: 'Fitur umum', commands: ['public'], access: 'registered', requirements: { scope: 'any', admin: false, botAdmin: false } },
    { name: 'owneronly', category: 'owner', description: 'Fitur owner', commands: ['owneronly'], access: 'owner', requirements: { scope: 'any', admin: false, botAdmin: false } },
    { name: 'premiumonly', category: 'fun', description: 'Fitur premium', commands: ['premiumonly'], access: 'premium', requirements: { scope: 'any', admin: false, botAdmin: false } },
    { name: 'groupadmin', category: 'group', description: 'Fitur admin grup', commands: ['groupadmin'], access: 'registered', requirements: { scope: 'group', admin: true, botAdmin: true } }
  ]
  const privateResults = await filterAvailableFeatures({ plugins: candidates, role: 'registered', jid: '6281111111111@s.whatsapp.net', socket: {}, message: { key: { remoteJid: '6281111111111@s.whatsapp.net' } } })
  assert.deepEqual(privateResults.map(plugin => plugin.name), ['public'])
  const premiumResults = await filterAvailableFeatures({ plugins: candidates, role: 'premium', jid: '6281111111111@s.whatsapp.net', socket: {}, message: { key: { remoteJid: '6281111111111@s.whatsapp.net' } } })
  assert.deepEqual(premiumResults.map(plugin => plugin.name), ['public', 'premiumonly'])
  const ownerResults = await filterAvailableFeatures({ plugins: candidates, role: 'owner', jid: '6281111111111@s.whatsapp.net', socket: {}, message: { key: { remoteJid: '6281111111111@s.whatsapp.net' } } })
  assert.deepEqual(ownerResults.map(plugin => plugin.name), ['public', 'owneronly', 'premiumonly'])
  const groupResults = await filterAvailableFeatures({
    plugins: candidates, role: 'registered', jid: '120363000000000000@g.us',
    socket: { user: { id: '6289999999999:1@s.whatsapp.net' }, groupMetadata: async () => ({ participants: [
      { id: '6281111111111@s.whatsapp.net', admin: 'admin' }, { id: '6289999999999@s.whatsapp.net', admin: 'admin' }
    ] }) },
    message: { key: { participant: '6281111111111@s.whatsapp.net', remoteJid: '120363000000000000@g.us' } }
  })
  assert.deepEqual(groupResults.map(plugin => plugin.name), ['public', 'groupadmin'])
})

test('carifitur mengirim pilihan interaktif dari inventaris router tanpa memindai source runtime', async () => {
  const menus = []
  await carifiturPlugin.execute({
    args: ['grup'], config: { bot: { prefix: '.' } }, plugins, role: 'registered', jid: '120363000000000000@g.us',
    message: { key: { participant: '6281111111111@s.whatsapp.net', remoteJid: '120363000000000000@g.us' } },
    socket: { user: { id: '6289999999999@s.whatsapp.net' }, groupMetadata: async () => ({ participants: [] }) },
    reply: async () => {}, sendMenu: async data => menus.push(data)
  })
  assert.equal(menus.length, 1)
  assert.equal(menus[0].options[0].id, '.kick')
  assert.match(menus[0].text, /kick/)
})
