import { createDreamWorld, renderDreamWorld } from '../../src/services/dream-world.js'

export default {
  name: 'mimpi',
  category: 'fun',
  access: 'registered',
  description: 'Membuat cerita Dream World imajinatif untuk hiburan.',
  commands: ['mimpi', 'dream', 'dreamworld'],
  requirements: { scope: 'any', admin: false, botAdmin: false },
  adaptedFrom: {
    repository: 'ShooNhee-md',
    path: 'plugins/fun/mimpi.js',
    category: 'fun',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    isAdmin: false,
    isBotAdmin: false
  },
  async execute({ args, react, reply }) {
    await react('🌙')
    const dream = createDreamWorld(args.join(' ') || 'Penjelajah')
    await reply(renderDreamWorld(dream))
  }
}
