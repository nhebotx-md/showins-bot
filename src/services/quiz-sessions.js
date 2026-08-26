import fs from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { getSenderNumber, getSenderNumbers, resolveUserRole } from '../core/access-control.js'
import { classifyChat } from '../core/logger.js'
import { brandMessageContent, createResponseBranding } from './response-branding.js'

const quizDataDirectory = new URL('../data/quiz/', import.meta.url)
const QUIZ_META = Object.freeze({
  asahotak: Object.freeze({ title: 'Asah Otak', emoji: '🧠', command: 'asahotak', file: 'asahotak.json' }),
  caklontong: Object.freeze({ title: 'Cak Lontong', emoji: '🤔', command: 'caklontong', file: 'caklontong.json' }),
  kataacak: Object.freeze({ title: 'Kata Acak', emoji: '🔤', command: 'kataacak', file: 'kataacak.json' }),
  riddle: Object.freeze({ title: 'Riddle', emoji: '❓', command: 'riddle', file: 'riddle.json' }),
  siapakahaku: Object.freeze({ title: 'Siapakah Aku', emoji: '🎭', command: 'siapakahaku', file: 'siapakahaku.json' }),
  susunkata: Object.freeze({ title: 'Susun Kata', emoji: '🔠', command: 'susunkata', file: 'susunkata.json' }),
  tebakfilm: Object.freeze({ title: 'Tebak Film', emoji: '🎬', command: 'tebakfilm', file: 'tebakfilm.json' }),
  tebakhewan: Object.freeze({ title: 'Tebak Hewan', emoji: '🐾', command: 'tebakhewan', file: 'tebakhewan.json' }),
  tebakkalimat: Object.freeze({ title: 'Tebak Kalimat', emoji: '📖', command: 'tebakkalimat', file: 'tebakkalimat.json' }),
  tebakkata: Object.freeze({ title: 'Tebak Kata', emoji: '📝', command: 'tebakkata', file: 'tebakkata.json' }),
  tebakkimia: Object.freeze({ title: 'Tebak Kimia', emoji: '🧪', command: 'tebakkimia', file: 'tebakkimia.json', questionField: 'unsur', answerField: 'lambang' }),
  tebaklagu: Object.freeze({ title: 'Tebak Lagu', emoji: '🎵', command: 'tebaklagu', file: 'tebaklagu.json' }),
  tebaklirik: Object.freeze({ title: 'Tebak Lirik', emoji: '🎤', command: 'tebaklirik', file: 'tebaklirik.json' }),
  tebaknegara: Object.freeze({ title: 'Tebak Negara', emoji: '🌍', command: 'tebaknegara', file: 'tebaknegara.json' }),
  tebakprofesi: Object.freeze({ title: 'Tebak Profesi', emoji: '👨‍💼', command: 'tebakprofesi', file: 'tebakprofesi.json' }),
  tebaktebakan: Object.freeze({ title: 'Tebak-tebakan', emoji: '😄', command: 'tebaktebakan', file: 'tebaktebakan.json' }),
  tekateki: Object.freeze({ title: 'Teka-teki', emoji: '🧩', command: 'tekateki', file: 'tekateki.json' })
})

const defaultQuizBanks = Object.freeze(Object.fromEntries(await Promise.all(
  Object.entries(QUIZ_META).map(async ([game, meta]) => [
    game,
    JSON.parse(await fs.readFile(new URL(meta.file, quizDataDirectory), 'utf8'))
  ])
)))

function randomItem(items) {
  return items[Math.floor(Math.random() * items.length)]
}

function normalizeAnswer(value = '') {
  return String(value).toLowerCase().trim().replace(/[^\p{L}\p{N}]+/gu, '')
}

function messageText(message = {}) {
  return (
    message.conversation ||
    message.extendedTextMessage?.text ||
    message.imageMessage?.caption ||
    message.videoMessage?.caption ||
    ''
  ).trim()
}

function quotedMessageId(message = {}) {
  return message.extendedTextMessage?.contextInfo?.stanzaId || ''
}

function renderHint(answer, attempt) {
  const value = String(answer).trim()
  const revealedCount = Math.min(value.length, Math.max(1, attempt + 1))
  return `${value.slice(0, revealedCount)}${'_'.repeat(Math.max(0, value.length - revealedCount))}`
}

function filePathFromUrl(url) {
  return fileURLToPath(url)
}

export function getQuizBankPaths() {
  return Object.freeze(Object.fromEntries(Object.entries(QUIZ_META).map(([game, meta]) => [
    game,
    filePathFromUrl(new URL(meta.file, quizDataDirectory))
  ])))
}

export function createQuizSessionService({ config, logger, userStore, banks = defaultQuizBanks, timeoutMs = 90_000 } = {}) {
  const sessions = new Map()
  const branding = createResponseBranding(config)

  function clearSession(jid) {
    const session = sessions.get(jid)
    if (session?.timer) clearTimeout(session.timer)
    sessions.delete(jid)
  }

  async function logReply({ message, jid, command, type, summary }) {
    const senderNumber = getSenderNumber(message)
    const senderNumbers = getSenderNumbers(message)
    const role = resolveUserRole({ config, userStore, message, senderNumbers })
    logger?.reply?.({
      source: classifyChat(jid),
      role,
      from: senderNumber || 'LID',
      target: jid,
      command: `${config.bot.prefix}${command}`,
      type,
      summary
    })
  }

  async function sendSessionReply({ socket, message, jid, command, content, type, summary }) {
    const result = await socket.sendMessage(jid, brandMessageContent(content, branding), { quoted: message })
    await logReply({ message, jid, command, type, summary })
    return result
  }

  async function start({ game, context }) {
    const meta = QUIZ_META[game]
    const bank = banks[game]
    if (!meta || !Array.isArray(bank) || bank.length === 0) {
      await context.reply('Bank soal quiz tidak tersedia saat ini.')
      return
    }

    const active = sessions.get(context.jid)
    if (active) {
      const seconds = Math.max(1, Math.ceil((active.expiresAt - Date.now()) / 1000))
      await context.reply(`Masih ada quiz *${QUIZ_META[active.game].title}* yang berjalan. Balas pesan quiz tersebut atau ketik *nyerah*. Sisa waktu: *${seconds} detik*.`)
      return
    }

    const question = randomItem(bank)
    const answer = String(question[meta.answerField || 'jawaban'] || '').trim()
    if (!answer) {
      await context.reply('Data quiz tidak valid.')
      return
    }

    const prompt = question[meta.questionField || 'soal'] || question.kata || 'Susun jawaban yang benar.'
    const text = [
      `${meta.emoji} *${meta.title}*`,
      '',
      `*Soal:* ${prompt}`,
      `*Hint:* ${renderHint(answer, 0)}`,
      `*Waktu:* ${Math.round(timeoutMs / 1000)} detik`,
      '',
      '_Balas pesan quiz ini dengan jawabanmu, atau ketik “nyerah”._'
    ].join('\n')
    const result = await context.sendResponse({
      type: 'quiz',
      summary: `QUIZ ${meta.title.toUpperCase()}`,
      content: { text },
      fallback: text
    })

    const session = {
      game,
      answer,
      command: meta.command,
      quoteId: result?.key?.id || '',
      attempts: 0,
      expiresAt: Date.now() + timeoutMs,
      timer: null
    }
    session.timer = setTimeout(async () => {
      if (sessions.get(context.jid) !== session) return
      clearSession(context.jid)
      await sendSessionReply({
        socket: context.socket,
        message: context.message,
        jid: context.jid,
        command: meta.command,
        type: 'quiz-timeout',
        summary: `QUIZ ${meta.title.toUpperCase()} TIMEOUT`,
        content: { text: `⏱️ Waktu habis untuk *${meta.title}*.\n\nJawaban: *${answer}*` }
      })
    }, timeoutMs)
    session.timer.unref?.()
    sessions.set(context.jid, session)
  }

  async function handleResponse({ socket, message }) {
    const jid = message?.key?.remoteJid
    const session = sessions.get(jid)
    if (!session) return false

    const text = messageText(message.message)
    if (!text || text.startsWith(config.bot.prefix) || quotedMessageId(message.message) !== session.quoteId) return false

    const meta = QUIZ_META[session.game]
    const normalized = normalizeAnswer(text)
    const command = session.command

    if (['nyerah', 'menyerah', 'surrender'].includes(normalized)) {
      clearSession(jid)
      await sendSessionReply({
        socket,
        message,
        jid,
        command,
        type: 'quiz-surrender',
        summary: `QUIZ ${meta.title.toUpperCase()} MENYERAH`,
        content: { text: `🏳️ Quiz *${meta.title}* dihentikan.\n\nJawaban: *${session.answer}*` }
      })
      return true
    }

    session.attempts += 1
    if (normalizeAnswer(session.answer) === normalized) {
      clearSession(jid)
      await socket.sendMessage(jid, { react: { text: '🎉', key: message.key } })
      await sendSessionReply({
        socket,
        message,
        jid,
        command,
        type: 'quiz-correct',
        summary: `QUIZ ${meta.title.toUpperCase()} BENAR`,
        content: { text: `🎉 *Benar!* Jawaban ${meta.title}: *${session.answer}*.\n\nKeren, kamu menjawab dalam *${session.attempts}* percobaan.` }
      })
      return true
    }

    await socket.sendMessage(jid, { react: { text: '❌', key: message.key } })
    await sendSessionReply({
      socket,
      message,
      jid,
      command,
      type: 'quiz-hint',
      summary: `QUIZ ${meta.title.toUpperCase()} HINT`,
      content: { text: `❌ Belum tepat. Hint berikutnya: *${renderHint(session.answer, session.attempts)}*` }
    })
    return true
  }

  return Object.freeze({ start, handleResponse, clearSession, getQuizBankPaths })
}

export function createShooNheeQuizPlugin({ game, aliases = [], description, sourcePath }) {
  const meta = QUIZ_META[game]
  if (!meta) throw new Error(`Quiz ${game} belum terdaftar.`)

  return Object.freeze({
    name: meta.command,
    category: 'fun',
    access: 'registered',
    description,
    commands: [meta.command, ...aliases],
    requirements: { scope: 'any', admin: false, botAdmin: false },
    adaptedFrom: {
      repository: 'ShooNhee-md',
      path: sourcePath,
      category: 'game'
    },
    async execute({ services, ...context }) {
      await services.quiz.start({ game, context })
    }
  })
}
