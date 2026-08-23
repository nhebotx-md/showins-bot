export default {
  name: 'ping',
  description: 'Memeriksa respons bot.',
  commands: ['ping'],
  async execute({ reply }) {
    const startedAt = Date.now()
    await reply(`Pong. Respons lokal: ${Date.now() - startedAt} ms.`)
  }
}
