export default {
  name: 'reply-test',
  category: 'testreply',
  access: 'registered',
  description: 'Membuka laboratorium untuk memilih dan menguji variasi reply pesan.',
  commands: ['replytest', 'testreply', 'replyshowcase'],
  async execute({ config, sendMenu }) {
    await sendMenu({
      title: 'Showins Reply Lab',
      text: 'Pilih gaya balasan yang ingin diuji. Seluruh mode menggunakan data aman dan dapat menjadi dasar kostumisasi berikutnya.',
      footer: `${config.bot.name} • Test Reply`,
      options: [
        { label: 'Plain quoted text', id: `${config.bot.prefix}replyplain` },
        { label: 'Context preview card', id: `${config.bot.prefix}replypreview` },
        { label: 'Quoted mention', id: `${config.bot.prefix}replymention` },
        { label: 'Document with caption', id: `${config.bot.prefix}replydocument` },
        { label: 'Reaction acknowledgement', id: `${config.bot.prefix}replyreaction` },
        { label: 'Native-flow buttons', id: `${config.bot.prefix}replybuttons` }
      ]
    })
  }
}
