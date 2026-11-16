# Panduan Pemasangan CBT UAS HIV/AIDS & IMS

**Jadwal ujian:** Selasa, 17 November 2026, pukul 08.10–09.40 WITA.
**Isi ujian:** 50 soal HOTS pilihan ganda dengan 5 opsi.

## Isi paket

```
cbt-uas-hiv/
├── web/                  → UNGGAH KE GITHUB (aman, tidak berisi kunci jawaban)
│   ├── index.html        halaman ujian mahasiswa (gaya CAT)
│   ├── dosen.html        dashboard pemantauan dosen
│   ├── style.css
│   ├── app.js            logika ujian + deteksi pelanggaran
│   ├── dosen.js          logika dashboard + ekspor Excel
│   └── config.js         ← isi API_URL di sini
├── apps-script/          → TEMPEL DI GOOGLE APPS SCRIPT (JANGAN diunggah ke GitHub)
│   ├── Code.gs           backend/server
│   └── Soal.gs           bank soal + KUNCI JAWABAN
├── Bank_Soal_dan_Kunci.xlsx  → untuk ditelaah dosen (JANGAN diunggah ke GitHub)
└── PANDUAN.md
```

> ⚠️ Repositori GitHub Pages bersifat publik. Karena itu, kunci jawaban **hanya** disimpan di Apps Script/Spreadsheet. Penilaian dilakukan oleh server, sehingga mahasiswa tidak dapat melihat kunci jawaban dari kode halaman.

---

## Langkah 1 — Siapkan Google Spreadsheet & Apps Script (±10 menit)

1. Buka Google Drive, lalu buat **Google Spreadsheet baru**. Beri nama, misalnya `CBT UAS HIV IMS 2026`.
2. Buka menu **Ekstensi → Apps Script**.
3. Hapus isi file `Code.gs` bawaan, lalu tempel isi **`apps-script/Code.gs`**.
4. Klik **＋ → Skrip**, beri nama `Soal`, lalu tempel isi **`apps-script/Soal.gs`**.
5. Simpan (ikon disket). Pilih fungsi **`setup`** pada menu tarik-turun, lalu klik **Jalankan**.
   Berikan izin yang diminta: *Tinjau izin → pilih akun → Lanjutan → Buka (tidak aman) → Izinkan*. Peringatan ini wajar karena skrip dibuat sendiri.
6. Kembali ke Spreadsheet. Sekarang tersedia 5 sheet: `Config`, `Mahasiswa`, `Soal`, `Peserta`, dan `Log_Pelanggaran`.

### Isi sheet `Mahasiswa`
Hapus 2 baris contoh, lalu tempel daftar peserta: **kolom A = NIM, B = Nama, C = Kelas** (Kelas boleh dikosongkan).
Kolom NIM sudah berformat teks sehingga angka 0 di depan NIM tidak hilang.

### Atur sheet `Config`
| Kunci | Yang perlu dilakukan |
|---|---|
| `KODE_AKSES` | Ganti dengan kode yang akan Anda umumkan saat ujian, misalnya `HIVUAS17`. Huruf besar/kecil tidak dibedakan. |
| `PASSWORD_DOSEN` | **Wajib diganti** dengan password yang kuat. |
| `MULAI` / `SELESAI` | Sudah diisi `2026-11-17T08:10:00+08:00` dan `09:40`. `+08:00` = WITA. |
| `LOGIN_DIBUKA_MENIT_SEBELUM` | Default 30: mahasiswa bisa login dan menunggu di ruang tunggu sejak 07.40 WITA. |
| `MODE_UJI` | Ubah ke `YA` hanya untuk uji coba malam ini (jadwal diabaikan). **Kembalikan ke `TIDAK` sebelum ujian.** |
| `ACAK_SOAL`, `ACAK_OPSI`, `TAMPILKAN_PERINGKAT` | Semuanya `YA` sesuai permintaan Anda. |

> 💡 Jika perlu **memperpanjang waktu** saat ujian berlangsung, cukup ubah `SELESAI` di sheet. Timer seluruh mahasiswa akan menyesuaikan dalam ±15 detik.

## Langkah 2 — Deploy sebagai Web App

1. Di Apps Script, klik **Terapkan (Deploy) → Deployment baru**.
2. Klik ikon roda gigi, lalu pilih **Aplikasi Web**.
   - *Jalankan sebagai*: **Saya**
   - *Yang memiliki akses*: **Siapa saja** (Anyone)
3. Klik **Terapkan**, lalu **salin URL** yang berakhiran `/exec`.

> Bila nanti Anda mengubah `Code.gs`, gunakan **Terapkan → Kelola deployment → ✏️ Edit → Versi: Versi baru → Terapkan**. Cara ini membuat URL tetap sama. Membuat "Deployment baru" akan menghasilkan URL lain.
> Untuk mengubah **soal**, ada dua cara: (a) edit `Soal.gs` lalu pilih menu Spreadsheet **CBT → 2. Muat ulang soal dari Soal.gs**, atau (b) edit langsung di sheet `Soal` lalu pilih **CBT → 3. Terapkan hasil edit langsung di sheet Soal**. Lakukan sebelum ujian dimulai.

## Langkah 3 — Hubungkan & unggah ke GitHub Pages

1. Buka `web/config.js`, lalu ganti `TEMPEL_URL_WEB_APP_DI_SINI` dengan URL `/exec` tadi. Sesuaikan juga `NAMA_INSTITUSI`.
2. Buat repositori GitHub baru (Public), lalu unggah **isi folder `web/`** saja (6 file).
3. Buka **Settings → Pages**. Pada *Source*, pilih **Deploy from a branch**, branch `main`, folder `/ (root)`, lalu Save.
4. Setelah 1–2 menit, situs dapat diakses:
   - Mahasiswa: `https://USERNAME.github.io/NAMA-REPO/`
   - Dosen: `https://USERNAME.github.io/NAMA-REPO/dosen.html`

## Langkah 4 — Uji coba (WAJIB malam ini)

1. Ubah `MODE_UJI` menjadi `YA`, lalu tambahkan NIM Anda sendiri di sheet `Mahasiswa`.
2. Buka halaman mahasiswa di laptop, login, kerjakan beberapa soal, coba pindah tab, lalu kumpulkan.
3. Buka `dosen.html` di perangkat lain dan pastikan data, pelanggaran, dan ekspor Excel berfungsi.
4. Setelah selesai: Spreadsheet → menu **CBT → Hapus data peserta & log**, hapus NIM uji, dan **ubah `MODE_UJI` kembali ke `TIDAK`**.

## Pada hari ujian

| Waktu (WITA) | Kegiatan |
|---|---|
| 07.40 | Mahasiswa sudah bisa login dan menunggu di layar konfirmasi. Hitung mundur berjalan otomatis. |
| 08.10 | Tombol **Mulai Ujian** aktif. Umumkan kode akses tepat pada waktunya. Mahasiswa yang terlambat tetap bisa masuk sampai 09.40, tetapi waktunya tidak ditambah. |
| Selama ujian | Pantau di dashboard: status, nomor soal yang sedang dibuka, progres, koneksi, dan pelanggaran secara langsung (diperbarui tiap 10 detik). |
| 09.40 | Jawaban terkirim otomatis. Ada toleransi jaringan 2 menit. Setelah itu, jawaban yang terlambat dinilai dari autosave terakhir. |
| Setelah 09.42 | Klik **"Kumpulkan semua yang masih mengerjakan"** untuk peserta yang perangkatnya mati atau offline, lalu klik **Ekspor Nilai (Excel)**. |

### Isi file Excel ekspor
1. **Rekap Nilai** — seluruh peserta: NIM, nama, status, benar/salah/kosong, nilai, jumlah pelanggaran, waktu mulai/selesai, durasi, dan cara kumpul.
2. **Peringkat** — urutan dari nilai tertinggi ke terendah.
3. **Analisis Butir** — sebaran jawaban A–E dan indeks kesukaran setiap soal.
4. **Matriks Jawaban** — jawaban per mahasiswa per soal (huruf kapital = benar).
5. **Log Pelanggaran** — waktu, jenis, detail, dan nomor soal.

### Tombol aksi di dashboard
- **Kumpulkan** — mengakhiri ujian satu mahasiswa. Nilainya dihitung dari jawaban terakhir yang tersimpan.
- **Reset** — menghapus sesi agar mahasiswa bisa mengulang dari awal. Gunakan hanya untuk kendala teknis berat.
- Klik angka pelanggaran untuk melihat rinciannya.

## Yang dideteksi dan dicatat sebagai pelanggaran
Sesuai pilihan Anda, pelanggaran **hanya dicatat** dan ujian tidak dihentikan otomatis. Mahasiswa melihat peringatan setiap kali melanggar.

| Kode | Arti |
|---|---|
| PINDAH_TAB | Membuka tab lain, meminimalkan peramban, atau beralih aplikasi di HP |
| FOKUS_HILANG | Beralih ke aplikasi atau jendela lain (Alt+Tab, klik di luar peramban) |
| KELUAR_LAYAR_PENUH | Menekan Esc/F11 atau keluar dari layar penuh |
| PINTASAN | Ctrl+C/V/T/N/U/P, F12, PrintScreen, dan sebagainya (juga diblokir) |
| SALIN_TEMPEL | Mencoba menyalin atau menempel teks |
| UKURAN_JENDELA | Memperkecil jendela atau membagi layar (split screen) |
| LOGIN_ULANG | NIM yang sama login di perangkat/tab lain; sesi lama otomatis diputus |

**Pengamanan tambahan:** watermark NIM+Nama di latar halaman, klik kanan dan seleksi teks dinonaktifkan, tombol Back diblokir, serta satu akun hanya aktif di satu perangkat.

> **Batasan teknis yang perlu diketahui:** tidak ada halaman web yang bisa *secara fisik* mencegah pengguna membuka tab lain atau memakai HP kedua. Yang bisa dilakukan adalah **mendeteksi, memperingatkan, dan mencatat** semua upaya tersebut. Inilah yang dilakukan sistem ini dan juga cara kerja CBT berbasis peramban pada umumnya. Untuk penguncian penuh diperlukan aplikasi khusus seperti Safe Exam Browser. Di iPhone/iPad, mode layar penuh tidak didukung Safari, sehingga yang dideteksi hanya pindah tab/aplikasi. Anjurkan mahasiswa memakai **laptop + Chrome/Edge**.

## Kapasitas & keandalan
- Jawaban disimpan di 3 lapis: perangkat mahasiswa (localStorage), cache server (tiap 15 detik), dan Spreadsheet (tiap ±1 menit).
- Bila peramban tertutup atau listrik padam, mahasiswa cukup membuka situs lagi dan mengklik **Lanjutkan Ujian**. Jawaban, posisi soal, dan urutan soalnya tetap sama. Peristiwa ini dapat muncul di log (misalnya PINDAH_TAB saat halaman tertutup, atau LOGIN_ULANG bila ia login ulang), sehingga dosen dapat menilainya sesuai konteks.
- Sistem ini nyaman digunakan untuk ±150 peserta serentak dengan akun Google biasa.
