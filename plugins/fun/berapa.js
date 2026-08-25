import { createOraclePlugin } from '../../src/services/fun-oracle.js'

export default createOraclePlugin({ name: 'berapa', description: 'Memberi respons hiburan untuk pertanyaan “berapa”.', kind: 'quantity', sourcePath: 'plugins/fun/berapa.js' })
