import assert from 'node:assert/strict'
import test from 'node:test'
import { createQuizSessionService } from '../src/services/quiz-sessions.js'
import tebakKimia from '../plugins/fun/tebakkimia.js'
import tebakNegara from '../plugins/fun/tebaknegara.js'
import susunKata from '../plugins/fun/susunkata.js'

const config = { bot: { prefix: '.', ownerNumbers: [] } }
const logger = { reply() {} }
const userStore = { get() { return null } }

function createSocket(sent) {
  return {
    async sendMessage(jid, content, options) {
      sent.push({ jid, content, options })
      if (content.text?.includes('*Kata Acak*')) return { key: { id: 'quiz-message-id' } }
      return { key: { id: `reply-${sent.length}` } }
    }
  }
}

test('quiz ShooNhee yang diadaptasi memerlukan quote pesan quiz sebelum menerima jawaban', async () => {
  const sent = []
  const socket = createSocket(sent)
  const quiz = createQuizSessionService({
    config,
    logger,
    userStore,
    timeoutMs: 30_000,
    banks: { kataacak: [{ soal: 'KBAU', jawaban: 'BUKA' }], caklontong: [{ soal: 'Contoh', jawaban: 'Jawab' }] }
  })
  const commandMessage = { key: { remoteJid: '628111@s.whatsapp.net', fromMe: false }, message: { conversation: '.kataacak' } }
  const context = {
    jid: '628111@s.whatsapp.net',
    socket,
    message: commandMessage,
    async reply() {},
    async sendResponse(payload) {
      return socket.sendMessage(this.jid, payload.content, { quoted: this.message })
    }
  }

  await quiz.start({ game: 'kataacak', context })
  assert.match(sent[0].content.text, /Balas pesan quiz ini/)

  const ignored = await quiz.handleResponse({
    socket,
    message: { key: { remoteJid: context.jid, fromMe: false }, message: { conversation: 'BUKA' } }
  })
  assert.equal(ignored, false)

  const handled = await quiz.handleResponse({
    socket,
    message: {
      key: { remoteJid: context.jid, fromMe: false },
      message: { extendedTextMessage: { text: 'buka', contextInfo: { stanzaId: 'quiz-message-id' } } }
    }
  })
  assert.equal(handled, true)
  assert.deepEqual(sent.at(-2).content.react, { text: '🎉', key: { remoteJid: context.jid, fromMe: false } })
  assert.match(sent.at(-1).content.text, /Benar/)
})

test('quiz memberi hint dan menerima menyerah hanya pada quote pesan quiz', async () => {
  const sent = []
  const socket = createSocket(sent)
  const quiz = createQuizSessionService({
    config,
    logger,
    userStore,
    timeoutMs: 30_000,
    banks: { kataacak: [{ soal: 'KBAU', jawaban: 'BUKA' }], caklontong: [{ soal: 'Contoh', jawaban: 'Jawab' }] }
  })
  const context = {
    jid: '628222@s.whatsapp.net',
    socket,
    message: { key: { remoteJid: '628222@s.whatsapp.net', fromMe: false }, message: { conversation: '.kataacak' } },
    async reply() {},
    async sendResponse(payload) { return socket.sendMessage(this.jid, payload.content, { quoted: this.message }) }
  }

  await quiz.start({ game: 'kataacak', context })
  const wrong = await quiz.handleResponse({
    socket,
    message: { key: { remoteJid: context.jid, fromMe: false }, message: { extendedTextMessage: { text: 'salah', contextInfo: { stanzaId: 'quiz-message-id' } } } }
  })
  assert.equal(wrong, true)
  assert.match(sent.at(-1).content.text, /Hint berikutnya/)

  const surrender = await quiz.handleResponse({
    socket,
    message: { key: { remoteJid: context.jid, fromMe: false }, message: { extendedTextMessage: { text: 'nyerah', contextInfo: { stanzaId: 'quiz-message-id' } } } }
  })
  assert.equal(surrender, true)
  assert.match(sent.at(-1).content.text, /dihentikan/)
})

test('adapter batch quiz ShooNhee memakai field pertanyaan dan jawaban khusus serta alias sumber', async () => {
  const sent = []
  const socket = createSocket(sent)
  const quiz = createQuizSessionService({
    config,
    logger,
    userStore,
    timeoutMs: 30_000,
    banks: { tebakkimia: [{ unsur: 'Aluminium', lambang: 'Al' }] }
  })
  const context = {
    jid: '628333@s.whatsapp.net',
    socket,
    message: { key: { remoteJid: '628333@s.whatsapp.net', fromMe: false }, message: { conversation: '.tebakkimia' } },
    async reply() {},
    async sendResponse(payload) { return socket.sendMessage(this.jid, payload.content, { quoted: this.message }) }
  }

  await quiz.start({ game: 'tebakkimia', context })
  assert.match(sent[0].content.text, /\*Soal:\* Aluminium/)

  assert.deepEqual(tebakKimia.commands, ['tebakkimia', 'kimia', 'chemistry', 'unsur'])
  assert.ok(tebakNegara.commands.includes('guesscountry'))
  assert.ok(susunKata.commands.includes('scramble'))
  assert.equal(tebakKimia.adaptedFrom.category, 'game')
})
