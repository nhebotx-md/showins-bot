const darePrompts = Object.freeze([
  'Tulis satu kalimat penyemangat untuk dirimu sendiri.',
  'Ceritakan tempat impianmu dalam tepat lima kata.',
  'Pilih satu warna dan jelaskan suasana yang diingatkan warna itu.',
  'Buat judul film imajiner tentang hari ini.',
  'Tulis tiga kata yang menggambarkan suasana hatimu saat ini.',
  'Buat satu pantun ringan bertema persahabatan.',
  'Ceritakan camilan favoritmu dalam satu kalimat kreatif.',
  'Buat nama playlist imajiner untuk menemani sore hari.',
  'Pilih satu kata positif dan gunakan dalam sebuah kalimat.',
  'Tulis satu hal sederhana yang ingin kamu apresiasi hari ini.',
  'Bayangkan kafe kecil impianmu, lalu jelaskan namanya.',
  'Buat pertanyaan ringan yang ingin kamu tanyakan kepada teman.'
])

export function getRandomDarePrompt(random = Math.random) {
  return darePrompts[Math.floor(random() * darePrompts.length)]
}

export default {
  name: 'dare',
  category: 'fun',
  access: 'registered',
  description: 'Mengirim satu tantangan kreativitas ringan untuk permainan.',
  commands: ['dare', 'dareq', 'tantang'],
  requirements: { scope: 'any', admin: false, botAdmin: false },
  adaptedFrom: {
    repository: 'ShooNhee-md',
    path: 'plugins/fun/dare.js',
    category: 'fun',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    isAdmin: false,
    isBotAdmin: false
  },
  async execute({ reply }) {
    await reply([
      '*DARE — TANTANGAN RINGAN*',
      '',
      getRandomDarePrompt(),
      '',
      '_Tantangan ini sukarela. Lewati jika tidak nyaman dan jangan membagikan data pribadi._'
    ].join('\n'))
  }
}
