import assert from 'node:assert/strict'
import test from 'node:test'
import {
  brandMessageContent,
  buildBrandedTextContent,
  createResponseBranding,
  formatBrandedText
} from '../src/services/response-branding.js'

const branding = createResponseBranding({
  bot: {
    name: 'Showins Bot',
    responseBranding: {
      enabled: true,
      label: 'RESPONS OTOMATIS',
      sourceUrl: 'https://example.invalid/showins',
      thumbnailUrl: 'https://example.invalid/showins-card.png'
    }
  }
})

test('branding menambahkan identitas bot pada teks tanpa mengubah isi utama', () => {
  const content = buildBrandedTextContent('Halo pengguna.', branding)
  assert.match(content.text, /Showins Bot/)
  assert.match(content.text, /RESPONS OTOMATIS/)
  assert.match(content.text, /Halo pengguna\./)
  assert.equal(content.contextInfo.externalAdReply.title, 'Showins Bot')
  assert.equal(content.contextInfo.externalAdReply.sourceUrl, 'https://example.invalid/showins')
  assert.equal(content.contextInfo.externalAdReply.thumbnailUrl, 'https://example.invalid/showins-card.png')
})

test('branding mempertahankan preview plugin yang sudah ada dan tidak membuat atribut forwarded atau verifikasi', () => {
  const content = brandMessageContent({
    text: 'Konten plugin',
    contextInfo: { externalAdReply: { title: 'Preview plugin yang jujur', sourceUrl: 'https://example.invalid/plugin' } }
  }, branding)

  assert.match(content.text, /Konten plugin/)
  assert.equal(content.contextInfo.externalAdReply.title, 'Preview plugin yang jujur')
  assert.equal(Object.hasOwn(content.contextInfo, 'forwardingScore'), false)
  assert.equal(Object.hasOwn(content.contextInfo, 'isForwarded'), false)
})

test('branding dapat dinonaktifkan tanpa mengubah teks', () => {
  const disabled = createResponseBranding({ bot: { name: 'Showins Bot', responseBranding: { enabled: false } } })
  assert.equal(formatBrandedText('Teks asli', disabled), 'Teks asli')
})

test('branding memakai kartu visual Showins Bot secara default untuk konfigurasi lama', () => {
  const defaults = createResponseBranding({ bot: { name: 'Showins Bot' } })
  assert.match(defaults.thumbnailUrl, /showins-response-card\.png$/)
})
