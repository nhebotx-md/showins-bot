import { createOraclePlugin } from '../../src/services/fun-oracle.js'

export default createOraclePlugin({ name: 'akankah', aliases: ['akan', 'will'], description: 'Memberi respons hiburan untuk pertanyaan “akankah”.', kind: 'prediction', sourcePath: 'plugins/fun/akankah.js' })
