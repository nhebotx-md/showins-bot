export default {
  name: 'kataacak',
  category: 'fun',
  access: 'registered',
  description: 'Memulai quiz menyusun kata dengan jawaban melalui quote pesan bot.',
  commands: ['kataacak', 'ka', 'acakkata'],
  requirements: { scope: 'any', admin: false, botAdmin: false },
  adaptedFrom: {
    repository: 'ShooNhee-md',
    path: 'plugins/game/kataacak.js',
    category: 'game'
  },
  async execute({ services, ...context }) {
    await services.quiz.start({ game: 'kataacak', context })
  }
}
