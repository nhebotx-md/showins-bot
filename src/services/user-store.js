import fs from 'node:fs/promises'
import path from 'node:path'
import { normalizePhoneNumber } from '../core/config.js'

function createRecord(number, existing = {}) {
  return {
    number,
    premium: Boolean(existing.premium),
    menuTheme: typeof existing.menuTheme === 'string' ? existing.menuTheme : 'classic',
    registeredAt: existing.registeredAt || new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
}

export class UserStore {
  constructor({ filePath }) {
    this.filePath = filePath
    this.users = new Map()
  }

  async load() {
    await fs.mkdir(path.dirname(this.filePath), { recursive: true })

    try {
      const raw = await fs.readFile(this.filePath, 'utf8')
      const parsed = JSON.parse(raw)
      const users = Array.isArray(parsed.users) ? parsed.users : []
      for (const user of users) {
        const number = normalizePhoneNumber(user?.number)
        if (number.length >= 8) this.users.set(number, createRecord(number, user))
      }
    } catch (error) {
      if (error.code !== 'ENOENT') throw new Error(`Data pengguna tidak dapat dibaca: ${error.message}`)
      await this.save()
    }
  }

  get(number) {
    return this.users.get(normalizePhoneNumber(number)) || null
  }

  list() {
    return [...this.users.values()].sort((left, right) => left.number.localeCompare(right.number))
  }

  async register(number) {
    const normalizedNumber = normalizePhoneNumber(number)
    if (normalizedNumber.length < 8) throw new Error('Nomor pengguna tidak valid.')
    if (this.users.has(normalizedNumber)) return { user: this.get(normalizedNumber), created: false }

    const user = createRecord(normalizedNumber)
    this.users.set(normalizedNumber, user)
    await this.save()
    return { user, created: true }
  }

  async setPremium(number, premium) {
    const normalizedNumber = normalizePhoneNumber(number)
    const current = this.get(normalizedNumber)
    if (!current) throw new Error('Pengguna belum terdaftar. Minta pengguna menjalankan .register terlebih dahulu.')

    const user = createRecord(normalizedNumber, { ...current, premium })
    this.users.set(normalizedNumber, user)
    await this.save()
    return user
  }

  async setMenuTheme(number, menuTheme) {
    const normalizedNumber = normalizePhoneNumber(number)
    if (normalizedNumber.length < 8) throw new Error('Nomor pengguna tidak valid.')

    const current = this.get(normalizedNumber)
    const user = createRecord(normalizedNumber, { ...current, menuTheme })
    this.users.set(normalizedNumber, user)
    await this.save()
    return user
  }

  async save() {
    const temporaryPath = `${this.filePath}.tmp`
    const data = JSON.stringify({ version: 1, users: this.list() }, null, 2)
    await fs.writeFile(temporaryPath, `${data}\n`, 'utf8')
    await fs.rename(temporaryPath, this.filePath)
  }
}

export function createUserStore({ filePath = './storage/users.json' } = {}) {
  return new UserStore({ filePath: path.resolve(filePath) })
}
