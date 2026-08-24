const ANSI = {
  reset: '\u001B[0m',
  dim: '\u001B[2m',
  cyan: '\u001B[36m',
  blue: '\u001B[34m',
  green: '\u001B[32m',
  yellow: '\u001B[33m',
  red: '\u001B[31m',
  magenta: '\u001B[35m',
  white: '\u001B[97m'
}

const LABELS = {
  debug: 'DEBUG',
  info: 'INFO ',
  warn: 'WARN ',
  error: 'ERROR',
  fatal: 'FATAL'
}

const CHAT_SOURCES = Object.freeze({
  private: { label: 'PRIVATE', color: 'cyan', marker: '◆' },
  group: { label: 'GROUP', color: 'magenta', marker: '◆' },
  channel: { label: 'CHANNEL', color: 'yellow', marker: '◆' }
})

function color(text, name, enabled) {
  return enabled ? `${ANSI[name] || ''}${text}${ANSI.reset}` : text
}

function getTime() {
  return new Date().toLocaleTimeString('id-ID', { hour12: false })
}

function formatContext(context = {}) {
  const safeEntries = Object.entries(context)
    .filter(([key, value]) => key !== 'err' && value !== undefined && value !== null)
    .map(([key, value]) => `${key}=${Array.isArray(value) ? value.join('.') : String(value)}`)

  return safeEntries.length > 0 ? `  ${safeEntries.join('  ')}` : ''
}

function normalizeArgs(args) {
  if (typeof args[0] === 'string') return { context: {}, message: args[0] }
  return { context: args[0] || {}, message: args[1] || args[0]?.err?.message || 'Tanpa pesan' }
}

export function classifyChat(jid = '') {
  const normalizedJid = String(jid).toLowerCase()
  if (normalizedJid.endsWith('@g.us')) return 'group'
  if (normalizedJid.endsWith('@newsletter')) return 'channel'
  return 'private'
}

export function createLogger() {
  const colorsEnabled = process.stdout.isTTY !== false && process.env.NO_COLOR === undefined
  const writeLine = (line, level = 'info') => {
    const output = level === 'error' || level === 'fatal' ? console.error : console.log
    output(line)
  }

  const write = (level, ...args) => {
    const { context, message } = normalizeArgs(args)
    const labelColor = level === 'error' || level === 'fatal' ? 'red' : level === 'warn' ? 'yellow' : 'blue'
    const line = `${color(`[${getTime()}]`, 'dim', colorsEnabled)} ${color(LABELS[level], labelColor, colorsEnabled)} ${message}${formatContext(context)}`
    writeLine(line, level)
  }

  const writeActivity = (type, context = {}) => {
    const source = CHAT_SOURCES[context.source] || CHAT_SOURCES.private
    const event = type === 'command' ? 'CMD' : 'RSP'
    const eventColor = type === 'command' ? 'green' : 'blue'
    const sourceLabel = color(`${source.marker} ${source.label}`, source.color, colorsEnabled)
    const eventLabel = color(event, eventColor, colorsEnabled)
    const details = formatContext(context)
    const line = `${color(`[${getTime()}]`, 'dim', colorsEnabled)} ${color('SHOWINS', 'white', colorsEnabled)} ${eventLabel} ${sourceLabel}${details}`
    writeLine(line)
  }

  return {
    ...Object.fromEntries(Object.keys(LABELS).map(level => [level, (...args) => write(level, ...args)])),
    command: context => writeActivity('command', context),
    reply: context => writeActivity('reply', context)
  }
}
