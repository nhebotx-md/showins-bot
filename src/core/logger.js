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

function sectionLine(label) {
  const content = ` ${label.toUpperCase()} `
  return `├─${content}${'─'.repeat(Math.max(0, 52 - content.length))}┤`
}

function tableLine(columns, enabled, colors = []) {
  return columns
    .map((column, index) => color(column, colors[index] || 'white', enabled))
    .join(color(' │ ', 'dim', enabled))
}

function maskTarget(value = '') {
  const digits = String(value).replace(/\D/g, '')
  if (digits.length < 8) return 'TARGET'
  return `${digits.slice(0, 4)}••••${digits.slice(-3)}`
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
    const direction = type === 'command' ? 'USER → BOT' : 'BOT  → USER'
    const directionColor = type === 'command' ? 'green' : 'blue'
    const contextOrDelivery = type === 'command'
      ? `${source.label} · ${(context.role || 'guest').toUpperCase()}`
      : `DELIVERED → ${context.source === 'private' ? maskTarget(context.target || context.from) : source.label}`
    const action = type === 'command'
      ? context.command || '-'
      : context.type === 'interactive'
        ? 'INTERACTIVE MENU'
        : `TEXT / ${context.chars || 0} CHAR`
    const line = tableLine(
      [pad(getTime(), 8), pad(direction, 12), pad(contextOrDelivery, 24), action],
      colorsEnabled,
      ['dim', directionColor, type === 'command' ? source.color : 'blue', type === 'command' ? 'green' : 'blue']
    )
    writeLine(line)
  }

  const startup = ({ botName = 'Showins Bot', engine = 'ItsLiaaa', plugins = [], userCount = 0 } = {}) => {
    const categoryCounts = Object.fromEntries(CATEGORY_ORDER.map(category => [category, 0]))
    for (const plugin of plugins) {
      if (Object.hasOwn(categoryCounts, plugin.category)) categoryCounts[plugin.category] += 1
    }

    const badge = category => `[${CATEGORY_LABELS[category]}:${String(categoryCounts[category]).padStart(2, '0')}]`
    const firstRow = CATEGORY_ORDER.slice(0, 4).map(badge).join(' ')
    const secondRow = `${CATEGORY_ORDER.slice(4).map(badge).join(' ')}  TOTAL:${String(plugins.length).padStart(2, '0')}`

    writeLine(color(boxBorder('top'), 'cyan', colorsEnabled))
    writeLine(color(boxLine(`◆ ${botName.toUpperCase()}  /  COMMAND LEDGER`), 'cyan', colorsEnabled))
    writeLine(color(boxLine(`RUNTIME  ● BOOTING        ENGINE  ${engine.toUpperCase()}`), 'yellow', colorsEnabled))
    writeLine(color(boxLine(`CAPACITY ${String(plugins.length).padStart(2, '0')} PLUGIN        USERS   ${String(userCount).padStart(2, '0')} REGISTERED`), 'green', colorsEnabled))
    writeLine(color(sectionLine('feature inventory'), 'cyan', colorsEnabled))
    writeLine(color(boxLine(firstRow), 'magenta', colorsEnabled))
    writeLine(color(boxLine(secondRow), 'magenta', colorsEnabled))
    writeLine(color(boxBorder('bottom'), 'cyan', colorsEnabled))
    writeLine(color('┌─ LIVE ACTIVITY ───────────────────────────────────────┐', 'blue', colorsEnabled))
    writeLine(color(boxLine('TIME     │ FLOW       │ CONTEXT          │ ACTION'), 'blue', colorsEnabled))
    writeLine(color('└──────────────────────────────────────────────────────┘', 'blue', colorsEnabled))
  }

  const connection = ({ state, detail = '' } = {}) => {
    const stateColor = state === 'CONNECTED' ? 'green' : state === 'FAILED' ? 'red' : state === 'RECONNECTING' ? 'yellow' : 'blue'
    const line = tableLine(
      [pad(getTime(), 8), pad('SYSTEM', 12), pad(state || 'UPDATE', 24), detail],
      colorsEnabled,
      ['dim', 'white', stateColor, stateColor]
    )
    writeLine(line)
  }

  const pairing = code => {
    writeLine(color('╭─ PAIRING / ACTION REQUIRED ───────────────────────────╮', 'yellow', colorsEnabled))
    writeLine(color(boxLine('STATUS  WAITING FOR WHATSAPP INPUT'), 'yellow', colorsEnabled))
    writeLine(color(boxLine(`CODE    ${code}`), 'white', colorsEnabled))
    writeLine(color(boxLine('OPEN    WhatsApp > Perangkat tertaut > Nomor telepon'), 'yellow', colorsEnabled))
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
