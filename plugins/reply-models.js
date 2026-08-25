export default {
  name: 'reply-models',
  category: 'testreply',
  access: 'registered',
  description: 'Membuka model pesan poll, location, dan contact yang diadaptasi dari Itsukichan.',
  commands: ['replymodels', 'itsukichanmodels'],
  async execute({ config, sendMenu }) {
    await sendMenu({
      title: 'Itsukichan Model Lab',
      text: 'Pilih model pesan non-deceptive yang diadaptasi untuk runtime ItsLiaaa. Jika klien menolak payload tertentu, bot mengirim fallback teks.',
      footer: `${config.bot.name} • Reply Lab`,
      options: [
        { label: 'Poll message', id: `${config.bot.prefix}replypoll` },
        { label: 'Location message', id: `${config.bot.prefix}replylocation` },
        { label: 'Bot contact card', id: `${config.bot.prefix}replycontact` },
        { label: 'Kembali ke Reply Lab', id: `${config.bot.prefix}replytest` }
      ]
    })
  }
}
