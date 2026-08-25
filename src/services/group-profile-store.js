import fs from 'node:fs/promises'
import path from 'node:path'

function createRecord(jid, existing = {}) {
  return {
    jid,
    rules: typeof existing.rules === 'string' ? existing.rules : '',
    welcomeTemplate: typeof existing.welcomeTemplate === 'string' ? existing.welcomeTemplate : '',
    goodbyeTemplate: typeof existing.goodbyeTemplate === 'string' ? existing.goodbyeTemplate : '',
    updatedAt: new Date().toISOString()
  }
}

export class GroupProfileStore {
  constructor({ filePath }) {
    this.filePath = filePath
    this.groups = new Map()
  }

  async load() {
    await fs.mkdir(path.dirname(this.filePath), { recursive: true })
    try {
      const parsed = JSON.parse(await fs.readFile(this.filePath, 'utf8'))
      for (const group of Array.isArray(parsed.groups) ? parsed.groups : []) {
        if (typeof group?.jid === 'string' && group.jid.endsWith('@g.us')) this.groups.set(group.jid, createRecord(group.jid, group))
      }
    } catch (error) {
      if (error.code !== 'ENOENT') throw new Error(`Profil grup tidak dapat dibaca: ${error.message}`)
      await this.save()
    }
  }

  get(jid) {
    return this.groups.get(jid) || null
  }

  list() {
    return [...this.groups.values()].sort((left, right) => left.jid.localeCompare(right.jid))
  }

  async setRules(jid, rules) {
    if (!jid.endsWith('@g.us')) throw new Error('ID grup tidak valid.')
    const group = createRecord(jid, { ...this.get(jid), rules })
    this.groups.set(jid, group)
    await this.save()
    return group
  }

  async clearRules(jid) {
    return this.setRules(jid, '')
  }

  async setTemplate(jid, field, template) {
    if (!['welcomeTemplate', 'goodbyeTemplate'].includes(field)) throw new Error('Jenis template grup tidak valid.')
    if (!jid.endsWith('@g.us')) throw new Error('ID grup tidak valid.')
    const group = createRecord(jid, { ...this.get(jid), [field]: template })
    this.groups.set(jid, group)
    await this.save()
    return group
  }

  async save() {
    const temporaryPath = `${this.filePath}.tmp`
    await fs.writeFile(temporaryPath, `${JSON.stringify({ version: 1, groups: this.list() }, null, 2)}\n`, 'utf8')
    await fs.rename(temporaryPath, this.filePath)
  }
}

export function createGroupProfileStore({ filePath = './storage/groups.json' } = {}) {
  return new GroupProfileStore({ filePath: path.resolve(filePath) })
}
