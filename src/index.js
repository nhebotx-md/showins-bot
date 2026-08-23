import config from '../config.js'
import { ConnectionManager } from './core/connection-manager.js'
import { validateConfig } from './core/config.js'
import { createLogger } from './core/logger.js'
import { loadPlugins } from './core/plugin-loader.js'
import { createCommandRouter } from './core/command-router.js'

const logger = createLogger()

async function main() {
  const issues = validateConfig(config)
  if (issues.length > 0) {
    logger.fatal({ issues }, 'Konfigurasi belum siap. Periksa config.js.')
    process.exitCode = 1
    return
  }

  const plugins = await loadPlugins({ logger })
  const routeMessage = createCommandRouter({ config, plugins, logger })

  const manager = new ConnectionManager({
    config,
    logger,
    onMessages: routeMessage,
    onPairingCode: code => {
      logger.info(`PAIRING CODE: ${code}`)
      logger.info('Masukkan kode ini di WhatsApp > Perangkat tertaut > Tautkan dengan nomor telepon.')
    }
  })

  const stop = async signal => {
    logger.info({ signal }, 'Sinyal penghentian diterima')
    await manager.stop()
    process.exit(0)
  }

  process.once('SIGINT', () => stop('SIGINT'))
  process.once('SIGTERM', () => stop('SIGTERM'))

  await manager.start()
}

main().catch(error => {
  logger.fatal({ err: error }, 'Base bot berhenti karena kesalahan tak tertangani')
  process.exit(1)
})
