const LABELS = {
  debug: 'DEBUG',
  info: 'INFO ',
  warn: 'WARN ',
  error: 'ERROR',
  fatal: 'FATAL'
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

export function createLogger() {
  const write = (level, ...args) => {
    const { context, message } = normalizeArgs(args)
    const time = new Date().toLocaleTimeString('id-ID', { hour12: false })
    const line = `[${time}] ${LABELS[level]}  ${message}${formatContext(context)}`
    const output = level === 'error' || level === 'fatal' ? console.error : console.log
    output(line)
  }

  return Object.fromEntries(Object.keys(LABELS).map(level => [level, (...args) => write(level, ...args)]))
}
