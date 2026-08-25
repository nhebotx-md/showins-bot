import { createOraclePlugin } from '../../src/services/fun-oracle.js'

export default createOraclePlugin({ name: 'apakah', description: 'Memberi respons hiburan untuk pertanyaan “apakah”.', kind: 'prediction', sourcePath: 'plugins/fun/apakah.js' })
