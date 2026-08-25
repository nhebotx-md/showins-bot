const LEVELS = Object.freeze(['Lucid', 'Mystic', 'Ethereal', 'Legendary'])
const SCENES = Object.freeze(['Lautan kristal bercahaya', 'Taman melayang di atas awan', 'Kastel cahaya di bulan kembar', 'Konstelasi hidup di langit malam'])
const EVENTS = Object.freeze(['Kupu-kupu warna-warni membentuk peta', 'Musik berubah menjadi warna di udara', 'Jembatan pelangi muncul di kejauhan', 'Bintang kecil mengantar perjalanan'])
const COMPANIONS = Object.freeze(['Rubah cahaya', 'Burung phoenix kecil', 'Paus langit', 'Kura-kura kosmik'])

function choose(items, random) {
  return items[Math.floor(random() * items.length)]
}

export function createDreamWorld(name, random = Math.random) {
  return {
    level: choose(LEVELS, random),
    scene: choose(SCENES, random),
    event: choose(EVENTS, random),
    companion: choose(COMPANIONS, random),
    explorer: String(name || 'Penjelajah').trim().slice(0, 80) || 'Penjelajah'
  }
}

export function renderDreamWorld(dream) {
  return [
    '╭─〔 🌙 *DREAM WORLD* 〕',
    `│ Penjelajah: *${dream.explorer}*`,
    `│ Level: *${dream.level}*`,
    `│ Dunia: ${dream.scene}`,
    `│ Peristiwa: ${dream.event}`,
    `│ Pendamping: ${dream.companion}`,
    '│',
    '│ _Cerita ini dibuat acak untuk hiburan,_',
    '│ _bukan tafsir mimpi atau prediksi._',
    '╰────────────────────'
  ].join('\n')
}
