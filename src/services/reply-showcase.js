const REPOSITORY_URL = 'https://github.com/nhebotx-md/showins-bot'

function heading(title, subtitle) {
  return `╭─ ${title}\n│ ${subtitle}\n╰────────────────`
}

export function buildPlainReply({ botName, senderNumber }) {
  return {
    content: {
      text: `${heading('REPLY / PLAIN', `${botName} • quoted text`)}\n\nHalo @${senderNumber || 'user'}. Ini adalah balasan teks sederhana yang mengutip pesan Anda.`,
      mentions: senderNumber ? [`${senderNumber}@s.whatsapp.net`] : []
    },
    type: 'plain',
    summary: 'PLAIN QUOTED TEXT'
  }
}

export function buildPreviewReply({ botName }) {
  return {
    content: {
      text: `${heading('REPLY / PREVIEW', 'context card • compact')}\n\nBalasan ini menguji kartu context preview tanpa meniru identitas kontak, invoice, atau kanal lain.`,
      contextInfo: {
        externalAdReply: {
          title: `${botName} · Reply Lab`,
          body: 'Preview card untuk uji desain reply',
          sourceUrl: REPOSITORY_URL,
          mediaType: 1,
          renderLargerThumbnail: false,
          showAdAttribution: false
        }
      }
    },
    type: 'preview',
    summary: 'CONTEXT PREVIEW CARD'
  }
}

export function buildMentionReply({ botName, senderNumber }) {
  return {
    content: {
      text: `${heading('REPLY / MENTION', `${botName} • direct attention`)}\n\n@${senderNumber || 'user'}, balasan ini menguji mention nyata pada pesan yang dikutip.`,
      mentions: senderNumber ? [`${senderNumber}@s.whatsapp.net`] : []
    },
    type: 'mention',
    summary: 'QUOTED MENTION'
  }
}

export function buildDocumentReply({ botName }) {
  const documentText = [
    'SHOWINS BOT · REPLY LAB',
    'Dokumen ini dibuat sebagai uji balasan dokumen dengan caption.',
    'Tidak berisi data pengguna atau session WhatsApp.'
  ].join('\n')

  return {
    content: {
      document: Buffer.from(documentText, 'utf8'),
      mimetype: 'text/plain',
      fileName: 'showins-reply-lab.txt',
      caption: `${heading('REPLY / DOCUMENT', `${botName} • text attachment`)}\n\nBalasan ini menguji dokumen ringan dengan caption dan quoted message.`
    },
    type: 'document',
    summary: 'DOCUMENT WITH CAPTION'
  }
}

export function buildReactionReply({ botName }) {
  return `${heading('REPLY / REACTION', `${botName} • acknowledgement`)}\n\nReaksi dikirim lebih dahulu, lalu pesan ini menjadi konfirmasi balasan.`
}

export function buildPollReply({ botName }) {
  return {
    content: {
      poll: {
        name: `${botName} · Model Poll Reply`,
        values: ['Plain quoted text', 'Context preview', 'Native-flow button'],
        selectableCount: 1,
        toAnnouncementGroup: false,
        canAddOption: false
      }
    },
    type: 'poll',
    summary: 'POLL MESSAGE',
    fallback: `${heading('REPLY / POLL', `${botName} • fallback`)}\n\nPoll tidak didukung klien ini. Pilihan: Plain quoted text, Context preview, Native-flow button.`
  }
}

export function buildLocationReply({ botName }) {
  return {
    content: {
      location: {
        degreesLatitude: 0,
        degreesLongitude: 0,
        name: `${botName} · Reply Lab`,
        address: 'Koordinat demonstrasi 0,0 — bukan lokasi pengguna.'
      }
    },
    type: 'location',
    summary: 'LOCATION MESSAGE',
    fallback: `${heading('REPLY / LOCATION', `${botName} • fallback`)}\n\nModel location tidak didukung klien ini. Tidak ada lokasi pengguna yang dikirim.`
  }
}

export function buildBotContactReply({ botName, pairingNumber }) {
  const number = String(pairingNumber || '').replace(/\D/g, '')
  const displayNumber = number || 'tidak tersedia'
  const vcard = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `FN:${botName}`,
    `TEL;type=CELL;type=VOICE;waid=${displayNumber}:${displayNumber}`,
    'END:VCARD'
  ].join('\n')

  return {
    content: {
      contacts: {
        displayName: botName,
        contacts: [{ displayName: botName, vcard }]
      }
    },
    type: 'contact',
    summary: 'BOT CONTACT CARD',
    fallback: `${heading('REPLY / CONTACT', `${botName} • fallback`)}\n\nKartu kontak tidak didukung klien ini. Nomor bot: ${displayNumber}.`
  }
}
