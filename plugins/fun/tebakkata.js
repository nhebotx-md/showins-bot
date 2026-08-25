import { createShooNheeQuizPlugin } from '../../src/services/quiz-sessions.js'
export default createShooNheeQuizPlugin({ game: 'tebakkata', aliases: ['tk', 'guessword'], description: 'Memulai quiz tebak kata dengan jawaban melalui quote pesan bot.', sourcePath: 'plugins/game/tebakkata.js' })
