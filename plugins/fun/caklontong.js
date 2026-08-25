export default {
  name: 'caklontong',
  category: 'fun',
  access: 'registered',
  description: 'Memulai quiz Cak Lontong dengan jawaban melalui quote pesan bot.',
  commands: ['caklontong', 'cak', 'lontong'],
  requirements: { scope: 'any', admin: false, botAdmin: false },
  adaptedFrom: {
    repository: 'ShooNhee-md',
    path: 'plugins/game/caklontong.js',
    category: 'game'
  },
  async execute({ services, ...context }) {
    await services.quiz.start({ game: 'caklontong', context })
  }
}
