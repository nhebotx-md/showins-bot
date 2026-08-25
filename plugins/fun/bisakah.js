import { createOraclePlugin } from '../../src/services/fun-oracle.js'

export default createOraclePlugin({ name: 'bisakah', description: 'Memberi respons hiburan untuk pertanyaan “bisakah”.', kind: 'prediction', sourcePath: 'plugins/fun/bisakah.js' })
