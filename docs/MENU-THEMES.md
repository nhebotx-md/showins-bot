# Tema Menu Pribadi

Showins Bot mengadaptasi gagasan pemilih varian menu dari ShooNhee-md, tetapi menerapkannya sebagai **preferensi per pengguna**. Pilihan disimpan pada `storage/users.json`, sehingga satu pengguna dapat memakai tampilan berbeda tanpa mengubah menu pengguna lain atau konfigurasi bot global.

## Memilih tema

Jalankan command berikut tanpa argumen untuk membuka pemilih interaktif. Bila pesan interaktif tidak tersedia, bot tetap mengirimkan daftar tema dalam teks yang dapat digunakan sebagai referensi.

```text
.menutheme
```

Tema juga dapat ditetapkan langsung, misalnya `.menutheme ledger`. Alias `.setmenu`, `.menustyle`, dan `.menuvariant` tersedia agar alurnya tetap familier bagi pengguna ShooNhee-md. Untuk kembali ke tampilan standar, gunakan `.menutheme reset`.

| ID | Tampilan | Karakteristik |
|---|---|---|
| `classic` | Classic | Tampilan kategori yang jelas dan familiar; menjadi tema default. |
| `compact` | Compact | Ringkas untuk chat padat atau layar kecil Termux. |
| `ledger` | Ledger | Panel garis tegas yang selaras dengan gaya Command Ledger di terminal. |
| `aura` | Aura | Dekoratif ringan menggunakan simbol yang aman ditampilkan WhatsApp. |

## Cakupan dan batas keamanan

Tema mengubah hanya **format teks menu utama dan detail kategori**. Tombol kategori, alias `cat<kategori>`, kontrol akses, label command terkunci, serta fallback teks tidak berubah. Command pemilih tema tersedia untuk pengguna terdaftar; owner tetap dapat menyimpan pilihan pribadi tanpa harus menjalankan registrasi.

Varian ShooNhee-md yang mengandalkan identitas quote palsu, dokumen dengan ukuran fiktif, metadata forwarding/reputasi palsu, atau media lokal tidak diadaptasi. Showins Bot menggunakan quote asli dari command pengguna dan mekanisme pesan interaktif dengan fallback yang telah tersedia.
