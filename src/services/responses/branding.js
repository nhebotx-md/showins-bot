const DEFAULT_SOURCE_URL = 'https://github.com/nhebotx-md/showins-bot'
const DEFAULT_THUMBNAIL_URL = 'https://raw.githubusercontent.com/nhebotx-md/showins-bot/main/assets/showins-response-card.png'

function getBotName(config = {}) {
  return String(config?.bot?.name || 'Showins Bot').trim() || 'Showins Bot'
}

export function createResponseBranding(config = {}) {
  const options = config?.bot?.responseBranding || {}
  return Object.freeze({
    enabled: options.enabled !== false,
    botName: getBotName(config),
    sourceUrl: String(options.sourceUrl || DEFAULT_SOURCE_URL),
    thumbnailUrl: String(options.thumbnailUrl || DEFAULT_THUMBNAIL_URL),
    label: String(options.label || 'RESPONS OTOMATIS').toUpperCase()
  })
}

export function formatBrandedText(text, branding = {}) {
  const body = String(text ?? '')
  if (!branding.enabled || !body.trim()) return body

  return [
    `╭─〔 *${branding.botName}* 〕`,
    `│ ${branding.label} · membalas pesan Anda`,
    '╰────────────────────',
    '',
    body
  ].join('\n')
}

export function buildBrandContextInfo(existing = {}, branding = {}) {
  if (!branding.enabled || existing?.externalAdReply) return existing || {}

  return {
    ...(existing || {}),
    externalAdReply: {
      title: branding.botName,
      body: 'Respons otomatis dengan identitas bot yang jelas',
      sourceUrl: branding.sourceUrl,
      mediaType: 1,
      renderLargerThumbnail: false,
      showAdAttribution: false,
      ...(branding.thumbnailUrl ? { thumbnailUrl: branding.thumbnailUrl } : {})
    }
  }
}

export function buildBrandedTextContent(text, branding) {
  return {
    text: formatBrandedText(text, branding),
    contextInfo: buildBrandContextInfo({}, branding)
  }
}

export function brandMessageContent(content = {}, branding = {}) {
  if (!content || typeof content !== 'object') return buildBrandedTextContent(content, branding)

  const branded = { ...content }
  if (typeof branded.text === 'string') branded.text = formatBrandedText(branded.text, branding)
  if (typeof branded.caption === 'string') branded.caption = formatBrandedText(branded.caption, branding)
  branded.contextInfo = buildBrandContextInfo(branded.contextInfo, branding)
  return branded
}
