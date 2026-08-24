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
  private: { label: 'PRIVATE', color: 'cyan' },
  group: { label: 'GROUP', color: 'magenta' },
  channel: { label: 'CHANNEL', color: 'yellow' }
})

const CATEGORY_LABELS = Object.freeze({
  main: 'UTAMA',
  tools: 'TOOLS',
  fun: 'FUN',
  group: 'GRUP',
  media: 'MEDIA',
  owner: 'OWNER',
  system: 'SISTEM'
})

const CATEGORY_ORDER = Object.freeze(['main', 'tools', 'fun', 'group', 'media', 'owner', 'system'])

function color(text, name, enabled) {
  return enabled ? `${ANSI[name] || ''}${text}${ANSI.reset}` : text
}

function getTime() {
  return new Date().toLocaleTimeString('id-ID', { hour12: false })
}

function pad(value, length) {
  return String(value ?? '').slice(0, length).padEnd(length)
}

function boxLine(content = '') {
  return `│ ${content.padEnd(52).slice(0, 52)} │`
}

function boxBorder(position) {
  return position === 'top' ? '╭──────────────────────────────────────────────────────╮' : '╰──────────────────────────────────────────────────────╯'
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
    const direction = type === 'command' ? 'IN ' : 'OUT'
    const directionColor = type === 'command' ? 'green' : 'blue'
    const roleOrResult = type === 'command'
      ? pad(context.role || 'guest', 10).toUpperCase()
      : pad(context.type === 'interactive' ? 'MENU' : 'TEXT', 10)
    const action = type === 'command'
      ? context.command || '-'
      : context.type === 'interactive'
        ? `${context.options || 0} KATEGORI`
        : `${context.chars || 0} KARAKTER`
    const line = `${color(getTime(), 'dim', colorsEnabled)}  ${color(direction, directionColor, colorsEnabled)}  ${color(pad(source.label, 8), source.color, colorsEnabled)} ${color(roleOrResult, 'white', colorsEnabled)}  ${color(action, type === 'command' ? 'green' : 'blue', colorsEnabled)}`
    writeLine(line)
  }

  const startup = ({ botName = 'Showins Bot', engine = 'ItsLiaaa', plugins = [], userCount = 0 } = {}) => {
    const categoryCounts = Object.fromEntries(CATEGORY_ORDER.map(category => [category, 0]))
    for (const plugin of plugins) {
      if (Object.hasOwn(categoryCounts, plugin.category)) categoryCounts[plugin.category] += 1
    }

    const firstRow = CATEGORY_ORDER.slice(0, 4)
      .map(category => `${pad(CATEGORY_LABELS[category], 7)} ${String(categoryCounts[category]).padStart(2)}`)
      .join(' │ ')
    const secondRow = CATEGORY_ORDER.slice(4)
      .map(category => `${pad(CATEGORY_LABELS[category], 7)} ${String(categoryCounts[category]).padStart(2)}`)
      .join(' │ ')

    writeLine(color(boxBorder('top'), 'cyan', colorsEnabled))
    writeLine(color(boxLine(`${botName.toUpperCase()}  /  COMMAND LEDGER`), 'cyan', colorsEnabled))
    writeLine(color(boxLine(`STATUS  BOOTING        ENGINE  ${engine.toUpperCase()}`), 'cyan', colorsEnabled))
    writeLine(color(boxLine(`PLUGINS ${plugins.length} ACTIVE       USERS   ${userCount} REGISTERED`), 'cyan', colorsEnabled))
    writeLine(color('├─ CATEGORY INVENTORY ──────────────────────────────────┤', 'cyan', colorsEnabled))
    writeLine(color(boxLine(firstRow), 'cyan', colorsEnabled))
    writeLine(color(boxLine(`${secondRow} │ TOTAL ${plugins.length}`), 'cyan', colorsEnabled))
    writeLine(color('├─ ACTIVITY LEDGER ─────────────────────────────────────┤', 'cyan', colorsEnabled))
    writeLine(color(boxLine('TIME      DIR  SOURCE    ROLE / RESULT  ACTION'), 'cyan', colorsEnabled))
    writeLine(color(boxBorder('bottom'), 'cyan', colorsEnabled))
  }

  const connection = ({ state, detail = '' } = {}) => {
    const stateColor = state === 'CONNECTED' ? 'green' : state === 'FAILED' ? 'red' : state === 'RECONNECTING' ? 'yellow' : 'blue'
    const line = `${color(getTime(), 'dim', colorsEnabled)}  ${color('SYS', stateColor, colorsEnabled)}  ${color(pad('CONNECTION', 8), 'white', colorsEnabled)} ${color(pad(state || 'UPDATE', 16), stateColor, colorsEnabled)} ${detail}`
    writeLine(line)
  }

  const pairing = code => {
    writeLine(color('╭─ PAIRING REQUIRED ────────────────────────────────────╮', 'yellow', colorsEnabled))
    writeLine(color(boxLine(`CODE  ${code}`), 'yellow', colorsEnabled))
    writeLine(color(boxLine('WhatsApp > Perangkat tertaut > Tautkan dengan nomor'), 'yellow', colorsEnabled))
    writeLine(color('╰──────────────────────────────────────────────────────╯', 'yellow', colorsEnabled))
  }

  return {
    ...Object.fromEntries(Object.keys(LABELS).map(level => [level, (...args) => write(level, ...args)])),
    command: context => writeActivity('command', context),
    reply: context => writeActivity('reply', context),
    startup,
    connection,
    pairing
  }
}
