const GROUP_REQUIREMENTS = Object.freeze({ scope: 'group', admin: true, botAdmin: true })

function createGroupPlugin({ name, aliases, description, sourcePath, execute }) {
  return {
    name,
    category: 'group',
    access: 'registered',
    description,
    commands: [name, ...aliases],
    requirements: GROUP_REQUIREMENTS,
    adaptedFrom: {
      repository: 'ShooNhee-md',
      path: sourcePath,
      category: 'group',
      isGroup: true,
      isAdmin: true,
      isBotAdmin: true
    },
    execute
  }
}

export const openGroupPlugin = createGroupPlugin({
  name: 'open',
  aliases: ['buka', 'opengroup', 'bukagroup'],
  description: 'Membuka grup agar seluruh anggota dapat mengirim pesan.',
  sourcePath: 'plugins/group/open.js',
  async execute({ socket, jid, reply }) {
    const metadata = await socket.groupMetadata(jid)
    if (!metadata.announce) {
      await reply('Grup sudah terbuka; seluruh anggota sudah dapat mengirim pesan.')
      return
    }
    await socket.groupSettingUpdate(jid, 'not_announcement')
    await reply('✅ Grup berhasil dibuka. Seluruh anggota sekarang dapat mengirim pesan.')
  }
})

export const closeGroupPlugin = createGroupPlugin({
  name: 'close',
  aliases: ['tutup', 'closegroup', 'tutupgroup'],
  description: 'Menutup grup agar hanya admin yang dapat mengirim pesan.',
  sourcePath: 'plugins/group/close.js',
  async execute({ socket, jid, reply }) {
    const metadata = await socket.groupMetadata(jid)
    if (metadata.announce) {
      await reply('Grup sudah tertutup; hanya admin yang dapat mengirim pesan.')
      return
    }
    await socket.groupSettingUpdate(jid, 'announcement')
    await reply('✅ Grup berhasil ditutup. Hanya admin yang sekarang dapat mengirim pesan.')
  }
})

export const setGroupNamePlugin = createGroupPlugin({
  name: 'setnamegc',
  aliases: ['setnamegrup', 'setgcname', 'setnamegroup', 'setnamagrup'],
  description: 'Mengubah nama grup.',
  sourcePath: 'plugins/group/setnamegc.js',
  async execute({ socket, jid, args, config, reply }) {
    const name = args.join(' ').trim()
    if (!name) {
      await reply(`Gunakan format: ${config.bot.prefix}setnamegc <nama grup baru>`)
      return
    }
    if (name.length > 100) {
      await reply('Nama grup maksimal 100 karakter.')
      return
    }
    await socket.groupUpdateSubject(jid, name)
    await reply(`✅ Nama grup berhasil diubah menjadi *${name}*.`)
  }
})

export const setGroupDescriptionPlugin = createGroupPlugin({
  name: 'setdeskgc',
  aliases: ['setdesc', 'setdescgc', 'setdeskripsi', 'setdesk'],
  description: 'Mengubah atau menghapus deskripsi grup.',
  sourcePath: 'plugins/group/setdeskgc.js',
  async execute({ socket, jid, args, config, reply }) {
    const suppliedDescription = args.join(' ').trim()
    if (!suppliedDescription) {
      await reply(`Gunakan format: ${config.bot.prefix}setdeskgc <deskripsi baru>, atau ${config.bot.prefix}setdeskgc clear untuk menghapus deskripsi.`)
      return
    }
    const description = suppliedDescription.toLowerCase() === 'clear' ? '' : suppliedDescription
    if (description.length > 2048) {
      await reply('Deskripsi grup maksimal 2048 karakter.')
      return
    }
    await socket.groupUpdateDescription(jid, description)
    await reply(description ? '✅ Deskripsi grup berhasil diperbarui.' : '✅ Deskripsi grup berhasil dihapus.')
  }
})
