import config from '../config.js'
import { ConnectionManager } from './core/connection-manager.js'
import { validateConfig } from './core/config.js'
import { createLogger } from './core/logger.js'
import { loadPlugins } from './core/plugin-loader.js'
import { createCommandRouter } from './core/command-router.js'
import { createUserStore } from './services/user-store.js'
import { createGroupProfileStore } from './services/group-profile-store.js'
import { createGroupGreetingService } from './services/group-greetings.js'
import { createAfkService } from './services/afk-service.js'
import { createQuizSessionService } from './services/quiz-sessions.js'
import { inspectRuntime } from './core/runtime.js'

const logger = createLogger()

async function main() {
  const runtime = inspectRuntime()
  if (!runtime.supported) {
    logger.fatal(
      { nodeVersion: runtime.nodeVersion },
      'Node.js 20+ wajib digunakan. Perbarui Node Termux sebelum menjalankan bot.'
    )
    process.exitCode = 1
    return
  }

  const issues = validateConfig(config)
  if (issues.length > 0) {
    logger.fatal({ issues }, 'Konfigurasi belum siap. Periksa config.js.')
    process.exitCode = 1
    return
  }

  const plugins = await loadPlugins({ logger })
  const userStore = createUserStore({ filePath: config.data?.userStorePath || './storage/users.json' })
  await userStore.load()
  const groupProfiles = createGroupProfileStore({ filePath: config.data?.groupStorePath || './storage/groups.json' })
  await groupProfiles.load()
  logger.startup({
    botName: config.bot.name,
    engine: 'ItsLiaaa',
    plugins,
    userCount: userStore.list().length
  })
  logger.connection?.({
    state: 'RUNTIME',
    detail: `${runtime.runtime} · Node ${runtime.nodeVersion} · ${runtime.arch}`
  })

  const services = {
    quiz: createQuizSessionService({ config, logger, userStore }),
    groupProfiles,
    afk: createAfkService()
  }
  const groupGreetings = createGroupGreetingService({ groupProfiles, config, logger })
  const routeMessage = createCommandRouter({ config, plugins, logger, userStore, services })

  const manager = new ConnectionManager({
    config,
    logger,
    onMessages: routeMessage,
    onPairingCode: code => {
      logger.pairing(code)
    },
    onGroupParticipants: groupGreetings.handle
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
