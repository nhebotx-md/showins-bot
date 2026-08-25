const RESPONSE_SETS = Object.freeze({
  prediction: Object.freeze([
    'Mungkin, kalau kamu memberi ruang untuk prosesnya.',
    'Peluangnya ada, tetapi hasilnya tetap bergantung pada tindakanmu.',
    'Belum dapat dipastikan; jadikan ini dorongan untuk mencoba.',
    'Bisa jadi, mari lihat langkah kecil yang bisa kamu lakukan hari ini.',
    'Terdengar mungkin, tetapi jangan jadikan jawaban bot sebagai keputusan penting.'
  ]),
  timing: Object.freeze([
    'Saat persiapanmu sudah matang.',
    'Setelah kamu memulai langkah pertamanya.',
    'Tidak ada waktu pasti, tetapi konsistensi biasanya membantu.',
    'Mungkin lebih dekat daripada yang kamu kira, tetap realistis ya.',
    'Waktunya bergantung pada banyak hal yang tidak bisa ditebak bot.'
  ]),
  quantity: Object.freeze([
    'Cukup untuk dinikmati satu per satu.',
    'Lebih dari satu kemungkinan, pilih yang paling masuk akal.',
    'Tidak ada angka pasti; coba ukur dengan data yang kamu punya.',
    'Sedikit tetapi bermakna lebih baik daripada banyak tanpa arah.',
    'Anggap ini pengingat untuk membuat rencana, bukan angka ramalan.'
  ]),
  place: Object.freeze([
    'Di tempat yang membuatmu nyaman untuk memulai.',
    'Mulai dari lingkungan terdekat terlebih dahulu.',
    'Coba cari di sumber resmi atau tanya orang yang relevan.',
    'Tempat terbaik tergantung tujuan yang sedang kamu kejar.',
    'Bot tidak bisa memastikan lokasi, tetapi kamu bisa memecah pencarianmu.'
  ]),
  reason: Object.freeze([
    'Biasanya ada beberapa faktor; coba lihat situasinya dari sudut berbeda.',
    'Mungkin karena kebutuhan atau prioritasnya belum jelas.',
    'Cari penyebab yang bisa dibuktikan, bukan hanya asumsi.',
    'Kadang jawabannya sederhana: butuh waktu, komunikasi, atau persiapan.',
    'Belum tentu ada satu penyebab tunggal untuk itu.'
  ]),
  method: Object.freeze([
    'Mulai dari langkah paling kecil yang bisa kamu lakukan sekarang.',
    'Buat rencana sederhana, coba, lalu evaluasi hasilnya.',
    'Cari informasi tepercaya dan jangan terburu-buru.',
    'Tentukan tujuan, siapkan pilihan, kemudian jalankan dengan konsisten.',
    'Minta bantuan orang yang tepat bila situasinya membutuhkan keahlian khusus.'
  ])
})

function pick(items) {
  return items[Math.floor(Math.random() * items.length)]
}

export function createOraclePlugin({ name, aliases = [], description, kind = 'prediction', sourcePath }) {
  const responses = RESPONSE_SETS[kind] || RESPONSE_SETS.prediction
  return {
    name,
    category: 'fun',
    access: 'registered',
    description,
    commands: [name, ...aliases],
    requirements: { scope: 'any', admin: false, botAdmin: false },
    adaptedFrom: {
      repository: 'ShooNhee-md',
      path: sourcePath,
      category: 'fun'
    },
    async execute({ args, config, reply }) {
      const question = args.join(' ').trim()
      if (!question) {
        await reply(`Gunakan format: ${config.bot.prefix}${name} <pertanyaan>`)
        return
      }

      await reply([
        `🎲 *${name.toUpperCase()}*`,
        '',
        `Pertanyaan: _${question}_`,
        '',
        `Jawaban: *${pick(responses)}*`,
        '',
        '_Untuk hiburan ringan, bukan kepastian atau pengganti keputusan penting._'
      ].join('\n'))
    }
  }
}
