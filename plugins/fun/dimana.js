import { createOraclePlugin } from '../../src/services/fun-oracle.js'

export default createOraclePlugin({ name: 'dimana', description: 'Memberi respons ringan untuk pertanyaan “di mana”.', kind: 'place', sourcePath: 'plugins/fun/dimana.js' })
