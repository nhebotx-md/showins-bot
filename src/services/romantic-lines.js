const LINES = Object.freeze([
  'Kalau kamu jadi lagu, aku tidak akan keberatan memutarnya berulang-ulang.',
  'Bukan cuaca yang membuat hari ini hangat, tapi kabar baik darimu.',
  'Lihat kebunku penuh bunga; lihat senyummu, hariku ikut berbunga.',
  'Jarak boleh membentang, tapi doa baik tetap bisa saling menguatkan.',
  'Kamu seperti halaman favorit dalam buku: selalu ingin kubaca lagi.',
  'Kalau ada lomba membuat hari lebih cerah, senyummu pasti juaranya.',
  'Kopi memang pahit, tapi obrolan yang baik selalu terasa manis.',
  'Semoga hari ini ada satu alasan kecil yang membuatmu tersenyum.',
  'Boleh saja langit mendung; mari tetap jadi alasan baik untuk saling menyemangati.',
  'Kadang kata sederhana cukup: semoga kamu baik-baik saja hari ini.',
  'Kamu tidak perlu sempurna untuk membuat hari seseorang terasa berarti.',
  'Hidup tidak selalu mudah, tetapi berjalan bersama orang baik membuatnya lebih ringan.'
])

export function getRomanticLine(random = Math.random) {
  return LINES[Math.floor(random() * LINES.length)]
}
