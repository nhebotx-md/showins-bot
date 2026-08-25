const truthPrompts = Object.freeze([
  'Kebiasaan kecil apa yang paling ingin kamu pertahankan tahun ini?',
  'Hal sederhana apa yang biasanya membuat harimu lebih baik?',
  'Keahlian apa yang ingin kamu pelajari jika punya waktu luang?',
  'Buku, film, atau lagu apa yang paling berkesan bagimu akhir-akhir ini?',
  'Apa satu hal yang ingin kamu apresiasi dari dirimu sendiri?',
  'Jika bisa merancang hari libur ideal, seperti apa jadwalmu?',
  'Nasihat baik apa yang pernah kamu terima dan masih kamu ingat?',
  'Kebiasaan digital apa yang sedang ingin kamu kurangi?',
  'Apa pencapaian kecil yang membuatmu bangga belakangan ini?',
  'Tempat seperti apa yang membuatmu merasa nyaman untuk berpikir?',
  'Topik apa yang paling senang kamu ceritakan kepada teman?',
  'Apa yang biasanya membantumu kembali fokus saat sedang lelah?'
])

export function getRandomTruthPrompt(random = Math.random) {
  return truthPrompts[Math.floor(random() * truthPrompts.length)]
}

export default {
  name: 'truth',
  category: 'fun',
  access: 'registered',
  description: 'Mengirim satu pertanyaan Truth ringan untuk permainan.',
  commands: ['truth', 'truthq'],
  requirements: { scope: 'any', admin: false, botAdmin: false },
  adaptedFrom: {
    repository: 'ShooNhee-md',
    path: 'plugins/fun/truth.js',
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
      '*TRUTH — PERMAINAN RINGAN*',
      '',
      getRandomTruthPrompt(),
      '',
      '_Jawab hanya jika kamu nyaman. Tidak perlu membagikan data pribadi._'
    ].join('\n'))
  }
}
