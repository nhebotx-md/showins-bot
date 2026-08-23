export function normalizePhoneNumber(value = '') {
  return String(value).replace(/\D/g, '').replace(/^0/, '62')
}

export function validateConfig(config) {
  const issues = []

  if (!config?.bot?.name?.trim()) issues.push('bot.name wajib diisi.')
  if (!config?.bot?.prefix?.trim()) issues.push('bot.prefix wajib diisi.')

  const number = normalizePhoneNumber(config?.connection?.pairingNumber)
  if (config?.connection?.usePairingCode && number.length < 8) {
    issues.push('connection.pairingNumber harus memakai kode negara, misalnya 6281234567890.')
  }

  if (!config?.connection?.authDir?.trim()) {
    issues.push('connection.authDir wajib diisi.')
  }

  return issues
}
