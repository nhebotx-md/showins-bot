import { createOraclePlugin } from '../../src/services/fun-oracle.js'

export default createOraclePlugin({ name: 'bagaimana', description: 'Memberi respons ringan untuk pertanyaan “bagaimana”.', kind: 'method', sourcePath: 'plugins/fun/bagaimana.js' })
