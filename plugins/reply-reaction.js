import { buildReactionReply } from '../src/services/reply-showcase.js'

export default {
  name: 'reply-reaction',
  category: 'testreply',
  access: 'registered',
  description: 'Menguji reaksi pesan diikuti konfirmasi quoted reply.',
  commands: ['replyreaction'],
  async execute({ config, react, reply }) {
    await react('✨')
    await reply(buildReactionReply({ botName: config.bot.name }))
  }
}
