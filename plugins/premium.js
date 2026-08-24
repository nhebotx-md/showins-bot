export default {
  name: 'premium',
  category: 'fun',
  access: 'premium',
  description: 'Memeriksa akses fitur khusus premium.',
  commands: ['premium'],
  async execute({ reply }) {
    await reply('Akses premium aktif. Fitur khusus premium siap dikembangkan pada kategori Fun.')
  }
}
