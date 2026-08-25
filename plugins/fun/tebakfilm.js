import { createShooNheeQuizPlugin } from '../../src/services/quiz-sessions.js'
export default createShooNheeQuizPlugin({ game: 'tebakfilm', aliases: ['tf', 'guessmovie'], description: 'Memulai quiz tebak film dengan jawaban melalui quote pesan bot.', sourcePath: 'plugins/game/tebakfilm.js' })
