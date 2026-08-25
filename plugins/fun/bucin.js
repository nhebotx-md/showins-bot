import { getRomanticLine } from '../../src/services/romantic-lines.js'

export default {
  name: 'bucin',
  category: 'fun',
  access: 'registered',
  description: 'Mengirim gombalan atau kalimat romantis ringan secara acak.',
  commands: ['bucin', 'gombal', 'love', 'romantis'],
  requirements: { scope: 'any', admin: false, botAdmin: false },
  adaptedFrom: {
    repository: 'ShooNhee-md',
    path: 'plugins/fun/bucin.js',
    category: 'fun',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    isAdmin: false,
    isBotAdmin: false
  },
  async execute({ reply }) {
    await reply(`> _${getRomanticLine()}_\n\n_Gombalan acak untuk hiburan._`)
  }
}
