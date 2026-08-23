import pino from 'pino'

export function createLogger(bindings = {}) {
  return pino({
    base: { service: 'showins-bot', ...bindings },
    level: process.env.LOG_LEVEL || 'info',
    timestamp: pino.stdTimeFunctions.isoTime
  })
}
