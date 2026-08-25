export default {
  name: 'reply-buttons',
  category: 'testreply',
  access: 'registered',
  description: 'Menguji native-flow quick reply dengan fallback teks.',
  commands: ['replybuttons'],
  async execute({ config, sendMenu }) {
    await sendMenu({
      title: 'Reply / Native Flow',
      text: 'Mode ini menguji tombol quick reply ItsLiaaa. Pilih salah satu gaya balasan untuk menjalankan command berikutnya.',
      footer: `${config.bot.name} • Reply Lab`,
      options: [
        { label: 'Coba Plain', id: `${config.bot.prefix}replyplain` },
        { label: 'Coba Preview', id: `${config.bot.prefix}replypreview` },
        { label: 'Kembali ke Reply Lab', id: `${config.bot.prefix}replytest` }
      ]
    })
  }
}
