export function normalizePhoneNumber(value = '') {
  return String(value).replace(/\D/g, '').replace(/^0/, '62')
}

export function validateConfig(config) {
  const issues = []

  if (!config?.bot?.name?.trim()) issues.push('bot.name wajib diisi.')
  if (!config?.bot?.prefix?.trim()) issues.push('bot.prefix wajib diisi.')

  const ownerNumbers = Array.isArray(config?.bot?.ownerNumbers)
    ? config.bot.ownerNumbers.map(normalizePhoneNumber).filter(number => number.length >= 8)
    : []
  if (ownerNumbers.length === 0) issues.push('bot.ownerNumbers wajib berisi minimal satu nomor owner format 628xxxx.')

  const number = normalizePhoneNumber(config?.connection?.pairingNumber)
  if (config?.connection?.usePairingCode && number.length < 8) {
    issues.push('connection.pairingNumber harus memakai kode negara, misalnya 6281234567890.')
  }

  if (!config?.connection?.authDir?.trim()) {
    issues.push('connection.authDir wajib diisi.')
  }

  if (config?.data?.userStorePath !== undefined && !String(config.data.userStorePath).trim()) {
    issues.push('data.userStorePath tidak boleh kosong.')
  }

  return issues
}
