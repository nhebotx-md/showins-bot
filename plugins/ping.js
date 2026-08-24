export default {
  name: 'ping',
  category: 'tools',
  access: 'registered',
  description: 'Memeriksa respons bot.',
  commands: ['ping'],
  async execute({ reply }) {
    const startedAt = Date.now()
    await reply(`Pong. Respons lokal: ${Date.now() - startedAt} ms.`)
  }
}
