export function inspectRuntime({
  platform = process.platform,
  arch = process.arch,
  nodeVersion = process.versions.node
} = {}) {
  const major = Number.parseInt(String(nodeVersion).split('.')[0], 10)
  const runtime = platform === 'android'
    ? 'TERMUX NATIVE'
    : platform === 'linux'
      ? 'LINUX / PROOT'
      : platform.toUpperCase()

  return {
    arch,
    nodeVersion,
    runtime,
    supported: Number.isInteger(major) && major >= 20
  }
}
