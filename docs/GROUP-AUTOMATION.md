# Moderasi dan Otomasi Grup

Porting ShooNhee-md pada Showins Bot menggunakan **API grup resmi dari koneksi aktif**, quote pesan asli, dan validasi admin di router. Tidak ada broadcast, tag massal, identitas palsu, atau penghapusan file.

| Kelompok | Command | Syarat |
|---|---|---|
| Akses grup | `.open`, `.close`, `.setnamegc`, `.setdeskgc`, `.poll` | Pengguna terdaftar, admin grup, dan bot admin. |
| Peserta | `.add`, `.kick`, `.promote`, `.demote`, `.listadmin`, `.linkgc`, `.revoke` | Pengguna terdaftar, admin grup, dan bot admin. `.add` maksimal 10 nomor; command target memakai reply atau mention. |
| Penghapusan pesan | `.delete` | Pengguna terdaftar, admin grup, bot admin, dan harus mengutip pesan target. |
| Aturan | `.rulesgrup`, `.setrulesgrup`, `.resetrulesgrup` | Lihat aturan: pengguna terdaftar. Ubah/hapus: admin grup. |
| Pesan otomatis | `.setwelcome`, `.welcome`, `.resetwelcome`, `.setgoodbye`, `.goodbye`, `.resetgoodbye` | Lihat template: pengguna terdaftar. Ubah/hapus: admin grup. |
| Status | `.afk <alasan>` | Pengguna terdaftar. Status berhenti otomatis ketika pengguna kembali mengirim pesan. |

## Template welcome dan goodbye

Template tersimpan secara lokal di `storage/groups.json`; berkas ini tidak diikutkan ke Git. Placeholder yang tersedia adalah `{user}`, `{number}`, `{group}`, `{count}`, dan `{bot}`. Contoh aman:

```text
.setwelcome Halo {user}, selamat datang di {group}. Anggota sekarang: {count}.
.setgoodbye Sampai jumpa {number}. Terima kasih sudah pernah bergabung di {group}.
```

Ketika peserta ditambahkan atau keluar, bot hanya mengirim pesan jika template terkait memang sudah diatur oleh admin. Pesan otomatis tidak memakai quote, kontak, atau atribut channel yang dibuat-buat.
