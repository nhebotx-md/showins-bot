export default {
  name: 'register',
  category: 'main',
  access: 'public',
  description: 'Mendaftarkan nomor Anda agar dapat memakai fitur bot.',
  commands: ['register'],
  async execute({ role, reply, senderNumber, userStore }) {
    if (role !== 'guest') {
      await reply(`Anda sudah terdaftar sebagai ${role}.`)
      return
    }

    const { created } = await userStore.register(senderNumber)
    await reply(created ? 'Pendaftaran berhasil. Anda sekarang dapat memakai fitur pengguna terdaftar.' : 'Anda sudah terdaftar.')
  }
}
