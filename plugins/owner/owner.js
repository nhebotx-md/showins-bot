import { normalizePhoneNumber } from '../../src/core/config.js'

function getTargetNumber(args) {
  const number = normalizePhoneNumber(args[0])
  return number.length >= 8 ? number : null
}

export default {
  name: 'owner-users',
  category: 'owner',
  access: 'owner',
  description: 'Mengelola pengguna terdaftar dan status premium.',
  commands: ['adduser', 'addpremium', 'delpremium', 'users'],
  async execute({ args, command, reply, userStore }) {
    if (command === 'users') {
      const users = userStore.list()
      if (users.length === 0) {
        await reply('Belum ada pengguna terdaftar.')
        return
      }

      const lines = users.map((user, index) => `${index + 1}. ${user.number} — ${user.premium ? 'premium' : 'terdaftar'}`)
      await reply(`*Daftar pengguna (${users.length})*\n\n${lines.join('\n')}`)
      return
    }

    const number = getTargetNumber(args)
    if (!number) {
      await reply(`Gunakan format: .${command} 628xxxxxxxxxx`)
      return
    }

    if (command === 'adduser') {
      const { created } = await userStore.register(number)
      await reply(created ? `Pengguna ${number} berhasil didaftarkan.` : `Pengguna ${number} sudah terdaftar.`)
      return
    }

    if (command === 'addpremium') {
      await userStore.setPremium(number, true)
      await reply(`Pengguna ${number} sekarang berstatus premium.`)
      return
    }

    if (command === 'delpremium') {
      await userStore.setPremium(number, false)
      await reply(`Status premium ${number} dicabut.`)
    }
  }
}
