import { normalizePhoneNumber } from '../core/config.js'

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

function contextInfo(message = {}) {
  return message.message?.extendedTextMessage?.contextInfo ||
    message.message?.imageMessage?.contextInfo ||
    message.message?.videoMessage?.contextInfo ||
    message.message?.documentMessage?.contextInfo || {}
}

function normalizedJid(jid) {
  return normalizePhoneNumber(String(jid || '').split('@')[0].split(':')[0])
}

function findParticipant(participants, candidate) {
  const candidateNumber = normalizedJid(candidate)
  return participants.find(participant => participant.id === candidate || normalizedJid(participant.id) === candidateNumber) || null
}

async function resolveTarget({ socket, jid, message, args, reply, config }) {
  const context = contextInfo(message)
  const directTarget = context.mentionedJid?.[0] || context.participant || args.find(argument => argument.includes('@'))
  if (!directTarget) {
    await reply(`Pilih target dengan reply pesan atau mention. Contoh: ${config.bot.prefix}kick @user`)
    return null
  }

  const metadata = await socket.groupMetadata(jid)
  const participant = findParticipant(metadata.participants || [], directTarget)
  if (!participant) {
    await reply('Target tidak ditemukan sebagai peserta grup ini.')
    return null
  }

  const sender = message.key.participant || message.key.remoteJid
  const bot = socket.user?.id
  if (normalizedJid(participant.id) === normalizedJid(sender)) {
    await reply('Tindakan terhadap diri sendiri tidak diizinkan.')
    return null
  }
  if (normalizedJid(participant.id) === normalizedJid(bot)) {
    await reply('Tindakan terhadap akun bot tidak diizinkan.')
    return null
  }

  return { participant, metadata }
}

async function sendMention({ sendResponse, fallback, text, jid }) {
  await sendResponse({
    content: { text, mentions: [jid] },
    type: 'group-member',
    summary: 'GROUP MEMBER UPDATE',
    fallback
  })
}

export const kickGroupPlugin = createGroupPlugin({
  name: 'kick',
  aliases: ['remove', 'tendang'],
  description: 'Mengeluarkan anggota non-admin melalui reply atau mention.',
  sourcePath: 'plugins/group/kick.js',
  async execute({ socket, jid, message, args, reply, config, sendResponse }) {
    const target = await resolveTarget({ socket, jid, message, args, reply, config })
    if (!target) return
    if (target.participant.admin) {
      await reply('Anggota tersebut adalah admin. Turunkan perannya terlebih dahulu bila memang diperlukan.')
      return
    }
    await socket.groupParticipantsUpdate(jid, [target.participant.id], 'remove')
    await sendMention({ sendResponse, jid: target.participant.id, text: `✅ @${normalizedJid(target.participant.id)} telah dikeluarkan dari grup.`, fallback: '✅ Anggota telah dikeluarkan dari grup.' })
  }
})

export const promoteGroupPlugin = createGroupPlugin({
  name: 'promote',
  aliases: ['jadikanadmin', 'addadmin'],
  description: 'Menjadikan anggota sebagai admin melalui reply atau mention.',
  sourcePath: 'plugins/group/promote.js',
  async execute({ socket, jid, message, args, reply, config, sendResponse }) {
    const target = await resolveTarget({ socket, jid, message, args, reply, config })
    if (!target) return
    if (target.participant.admin) {
      await reply('Anggota tersebut sudah menjadi admin.')
      return
    }
    await socket.groupParticipantsUpdate(jid, [target.participant.id], 'promote')
    await sendMention({ sendResponse, jid: target.participant.id, text: `✅ @${normalizedJid(target.participant.id)} sekarang menjadi admin grup.`, fallback: '✅ Anggota sekarang menjadi admin grup.' })
  }
})

export const demoteGroupPlugin = createGroupPlugin({
  name: 'demote',
  aliases: ['turunkanadmin', 'deladmin'],
  description: 'Menurunkan admin melalui reply atau mention.',
  sourcePath: 'plugins/group/demote.js',
  async execute({ socket, jid, message, args, reply, config, sendResponse }) {
    const target = await resolveTarget({ socket, jid, message, args, reply, config })
    if (!target) return
    if (!target.participant.admin) {
      await reply('Anggota tersebut bukan admin.')
      return
    }
    await socket.groupParticipantsUpdate(jid, [target.participant.id], 'demote')
    await sendMention({ sendResponse, jid: target.participant.id, text: `✅ @${normalizedJid(target.participant.id)} tidak lagi menjadi admin grup.`, fallback: '✅ Admin telah diturunkan.' })
  }
})

export const listAdminGroupPlugin = createGroupPlugin({
  name: 'listadmin',
  aliases: ['adminlist', 'admins'],
  description: 'Menampilkan daftar admin grup saat ini.',
  sourcePath: 'plugins/group/listadmin.js',
  async execute({ socket, jid, sendResponse }) {
    const metadata = await socket.groupMetadata(jid)
    const admins = (metadata.participants || []).filter(participant => participant.admin)
    const mentions = admins.map(participant => participant.id)
    const text = [`*ADMIN GRUP*`, `Grup: ${metadata.subject || 'Tanpa nama'}`, '', ...admins.map((participant, index) => `${index + 1}. @${normalizedJid(participant.id)}${participant.admin === 'superadmin' ? ' — creator' : ''}`)].join('\n')
    await sendResponse({ content: { text, mentions }, type: 'group-admin-list', summary: 'GROUP ADMIN LIST', fallback: text.replaceAll('@', '') })
  }
})

export const groupLinkPlugin = createGroupPlugin({
  name: 'linkgc',
  aliases: ['linkgroup', 'gclink'],
  description: 'Menampilkan tautan undangan grup saat ini.',
  sourcePath: 'plugins/group/linkgc.js',
  async execute({ socket, jid, reply }) {
    const code = await socket.groupInviteCode(jid)
    await reply(`🔗 Tautan grup saat ini:\nhttps://chat.whatsapp.com/${code}`)
  }
})

export const revokeGroupLinkPlugin = createGroupPlugin({
  name: 'revoke',
  aliases: ['resetlinkgc', 'newlinkgc'],
  description: 'Mereset tautan undangan grup dan membuat tautan baru.',
  sourcePath: 'plugins/group/resetlinkgc.js',
  async execute({ socket, jid, reply }) {
    const code = await socket.groupRevokeInvite(jid)
    await reply(`✅ Tautan lama sudah tidak berlaku. Tautan baru:\nhttps://chat.whatsapp.com/${code}`)
  }
})

export const addGroupPlugin = createGroupPlugin({
  name: 'add',
  aliases: ['addmember', 'invite'],
  description: 'Menambahkan maksimal 10 nomor anggota ke grup ini.',
  sourcePath: 'plugins/group/add.js',
  async execute({ socket, jid, args, reply, sendResponse }) {
    const numbers = [...new Set(args
      .map(value => normalizePhoneNumber(value))
      .filter(number => number.length >= 10))]
    if (numbers.length === 0) {
      await reply('Masukkan nomor tujuan. Contoh: .add 6281234567890')
      return
    }
    if (numbers.length > 10) {
      await reply('Maksimal 10 nomor dapat ditambahkan dalam satu perintah.')
      return
    }

    const metadata = await socket.groupMetadata(jid)
    const candidates = numbers
      .map(number => `${number}@s.whatsapp.net`)
      .filter(candidate => !findParticipant(metadata.participants || [], candidate))
    if (candidates.length === 0) {
      await reply('Semua nomor yang diberikan sudah tercatat sebagai peserta grup.')
      return
    }

    const results = await socket.groupParticipantsUpdate(jid, candidates, 'add')
    const invited = results?.filter(result => String(result.status) === '408').length || 0
    const added = results?.filter(result => String(result.status) === '200').length || 0
    const failed = Math.max(candidates.length - added - invited, 0)
    const text = [`*HASIL TAMBAH ANGGOTA*`, `Berhasil ditambahkan: ${added}`, `Undangan dikirim: ${invited}`, `Tidak berhasil: ${failed}`].join('\n')
    await sendResponse({ content: { text, mentions: candidates }, type: 'group-add', summary: 'GROUP ADD MEMBERS', fallback: text })
  }
})

export const deleteQuotedGroupPlugin = {
  name: 'delete',
  category: 'group',
  access: 'registered',
  description: 'Menghapus pesan yang di-quote oleh admin grup.',
  commands: ['delete', 'del', 'hapus'],
  requirements: GROUP_REQUIREMENTS,
  adaptedFrom: {
    repository: 'ShooNhee-md',
    path: 'plugins/group/delete.js',
    category: 'group',
    isGroup: true,
    isAdmin: true,
    isBotAdmin: true
  },
  async execute({ socket, jid, message, reply, react }) {
    const context = contextInfo(message)
    if (!context.stanzaId) {
      await reply('Reply pesan yang ingin dihapus, lalu kirim .delete.')
      return
    }
    await socket.sendMessage(jid, {
      delete: {
        remoteJid: jid,
        id: context.stanzaId,
        fromMe: Boolean(context.participant && normalizedJid(context.participant) === normalizedJid(socket.user?.id)),
        participant: context.participant
      }
    })
    await react('✅')
  }
}
