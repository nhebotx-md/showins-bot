function describePercent(percent, label) {
  if (percent >= 90) return `Sangat tinggi untuk indikator *${label}* hari ini.`
  if (percent >= 70) return `Terlihat kuat pada indikator *${label}* hari ini.`
  if (percent >= 50) return `Cukup baik pada indikator *${label}* hari ini.`
  if (percent >= 30) return `Masih bisa diasah pada indikator *${label}* hari ini.`
  return `Gunakan ini sebagai candaan ringan, bukan penilaian diri.`
}

export function createFunCheckPlugin({ name, aliases = [], label, description, sourcePath }) {
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
      category: 'cek'
    },
    async execute({ args, reply }) {
      const target = args.join(' ').trim() || 'kamu'
      const percent = Math.floor(Math.random() * 101)
      await reply([
        `📊 *${label.toUpperCase()}*`,
        '',
        `Target: _${target}_`,
        `Hasil hiburan: *${percent}%*`,
        '',
        describePercent(percent, label),
        '',
        '_Hanya hiburan acak, bukan asesmen pribadi._'
      ].join('\n'))
    }
  }
}
