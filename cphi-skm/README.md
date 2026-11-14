# SKM Sehat — Survei Kepuasan Masyarakat Layanan Kesehatan

Aplikasi web (PWA) untuk Survei Kepuasan Masyarakat di Puskesmas dan Rumah Sakit, sesuai **PermenPAN-RB No. 14 Tahun 2017**.
Frontend (HTML/CSS/JS) di-host di **GitHub Pages**; data disimpan di **Google Spreadsheet/Drive** melalui **Google Apps Script**.

## Fitur

| Fitur | Keterangan |
|---|---|
| Tampilan super-app | Menu kotak seperti m-banking/Gojek, bottom navigation, responsif HP–tablet–desktop, bisa dipasang ke layar utama (PWA) |
| Instrumen Standar | 9 unsur SKM (skala 1–4), profil responden (umur, JK, pendidikan, pekerjaan, jenis pembayaran), saran |
| Instrumen Baru (Form Builder) | 22 tipe pertanyaan: teks, angka, pilihan, kotak centang, dropdown, ya/tidak, skala SKM, rating bintang, skala linear/NPS, matriks, tanggal/jam, GPS, foto, tanda tangan, keterangan, pemisah halaman. Ada logika tampil (DAN/ATAU), validasi, opsi "Lainnya", tempel banyak opsi, impor/ekspor JSON |
| Cakupan fasilitas | 1 instrumen untuk 1 fasilitas, atau 1 instrumen untuk banyak fasilitas; unit layanan bisa dibatasi |
| Mode isian | Enumerator (login, **offline** + antrean sinkron), Responden (tautan/QR/WhatsApp), Kiosk tablet (kembali ke awal otomatis) |
| Peran | Super Admin, Project Koordinator, Data Manager, Enumerator, Responden (tanpa login) |
| Dashboard | IKM, mutu A–D, NRR per unsur, tren, kelompok umur, perbandingan fasilitas & unit, profil responden, saran |
| Dashboard publik | Hanya data agregat (tanpa data pribadi), kode **iframe embed** untuk website lain |
| Laporan otomatis | Sistematika Bab I–V + kata pengantar, kop instansi, tanda tangan, rencana tindak lanjut, lampiran. Ekspor **PDF, Word (.docx), Excel**, cetak |
| Impor / migrasi data | Unggah Excel/CSV/ODS dari Google Form, Sheets, KoboToolbox, Clappia, ODK, atau rekap manual. Kolom dicocokkan otomatis (bisa diubah), jawaban berupa teks label atau kode dikonversi otomatis, nilai yang tidak cocok dipadankan manual, fasilitas & unit dicocokkan dengan nama/kode. Tersedia template Excel. Impor ulang tidak menggandakan data. Data langsung masuk dashboard & laporan |
| Periode | Bulanan, triwulan, semester, tahunan, sesuai periode survei, atau rentang bebas. Respons disimpan di **spreadsheet terpisah per periode** |
| UU PDP | Persetujuan responden, penanda "data pribadi" (disamarkan untuk peran tertentu dan tidak tampil di dashboard publik), log audit |

## Struktur folder

```
index.html          aplikasi utama
embed.html          dashboard publik untuk iframe
manifest.json, sw.js  PWA & cache offline
css/app.css         gaya (warna utama mengikuti Pengaturan)
icons/              logo & ikon aplikasi (ganti dengan logo Anda)
js/config.js        ← ISI API_URL & GOOGLE_CLIENT_ID
js/core.js          logika IKM, validasi, agregasi (dipakai juga di Apps Script)
js/api.js           koneksi API, sesi, antrean offline
js/mock.js          server tiruan untuk MODE DEMO
js/renderer.js      tampilan pengisian survei
js/builder.js       form builder
js/dashboard.js     dashboard & grafik
js/report.js        laporan Bab I–V + ekspor PDF/Word/Excel
js/admin.js         menu pengelolaan
js/importer.js      impor/migrasi data Excel/CSV
js/app.js           router & beranda
apps-script/        Code.gs, Core.gs, appsscript.json → salin ke Google Apps Script
```

## Coba dulu (mode demo)

Biarkan `API_URL` kosong di `js/config.js`, lalu buka lewat server lokal (`npx serve .` atau `python -m http.server`) atau langsung dari GitHub Pages. Pilih peran demo di halaman **Masuk Petugas**. Data contoh (5 fasilitas, 320 respons) tersimpan di browser.

## Pemasangan produksi

### 1. Backend Google Apps Script
1. Buka https://script.google.com, lalu **New project**. Beri nama, misalnya "SKM Sehat API".
2. Buat file **Code.gs** dan tempel isi `apps-script/Code.gs`.
3. Buat file baru **Core.gs** dan tempel isi `js/core.js` (sama dengan `apps-script/Core.gs`).
4. (Opsional) Project Settings → centang "Show appsscript.json", lalu tempel `apps-script/appsscript.json`.
5. Pilih fungsi **setup**, lalu **Run**, lalu izinkan akses. Langkah ini membuat folder "SKM Kesehatan - Data", spreadsheet Master, dan menjadikan akun Anda **Super Admin**.
6. **Deploy → New deployment → Web app**: *Execute as: Me*, *Who has access: Anyone*. Salin URL yang berakhiran `/exec`.

### 2. Login Google (OAuth Client ID)
1. Buka https://console.cloud.google.com, lalu buat project dan buka **APIs & Services → OAuth consent screen**. Isi data aplikasi (External).
2. **Credentials → Create credentials → OAuth client ID → Web application**.
3. Pada **Authorized JavaScript origins**, tambahkan `https://USERNAME.github.io` (dan `http://localhost:8000` untuk uji lokal).
4. Salin Client ID. Tempel di **Code.gs** (`CLIENT_ID`) **dan** di `js/config.js` (`GOOGLE_CLIENT_ID`).
5. Setelah mengubah Code.gs, buka **Deploy → Manage deployments → Edit → Version: New version**.

### 3. Frontend di GitHub Pages
1. Isi `js/config.js`:
   ```js
   API_URL: 'https://script.google.com/macros/s/XXXX/exec',
   GOOGLE_CLIENT_ID: 'xxxx.apps.googleusercontent.com',
   ```
2. Unggah semua file ke repositori GitHub, lalu buka **Settings → Pages → Deploy from branch (main / root)**.
3. Buka `https://USERNAME.github.io/NAMA-REPO/`.

### 4. Langkah awal di aplikasi
1. **Pengaturan**: nama instansi, alamat, kepala dinas, logo, dan warna.
2. **Faskes & Unit**: tambahkan Puskesmas/RS. Unit standar bisa diisi otomatis.
3. **Periode Survei**: misalnya "Semester I 2027". Spreadsheet respons dibuat otomatis.
4. **Pengguna**: daftarkan email Google petugas beserta perannya dan fasilitas tugasnya.
5. **Form Builder → Instrumen Standar**: atur cakupan dan mode, ubah status ke **Aktif**, lalu simpan.
6. **QR & Tautan**: cetak poster QR atau kirim tautan WhatsApp. **Mode Kiosk** dipakai untuk tablet.
7. **Impor Data** (opsional): migrasikan data lama dari platform lain. Unduh template atau langsung unggah file ekspor platform lama.
8. **Embed Dashboard**: aktifkan dashboard publik, lalu salin kode iframe ke website resmi.

## Catatan teknis
- Permintaan ke Apps Script memakai `Content-Type: text/plain` agar tidak memicu preflight CORS.
- Sesi login berlaku 14 hari (`TOKEN_DAYS`) supaya enumerator bisa bekerja offline lalu sinkron belakangan. Pengiriman ganda dicegah dengan `client_uuid`.
- Foto dan tanda tangan disimpan sebagai berkas di folder Drive "Lampiran"; spreadsheet hanya menyimpan URL-nya.
- Skema form yang melebihi 45.000 karakter otomatis disimpan sebagai berkas JSON di Drive.
- Kuota Apps Script akun gratis memadai untuk ribuan respons per hari. Untuk data sangat besar, buat periode baru agar spreadsheet tetap ringan.
- Setelah memperbarui file aplikasi, naikkan `VER` di `sw.js` agar cache perangkat ikut diperbarui.
