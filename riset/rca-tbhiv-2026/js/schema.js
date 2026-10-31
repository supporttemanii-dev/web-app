/* Dihasilkan otomatis dari instrumen RCA TB-HIV 2026 (gen_schema.py). Ubah instrumen lalu jalankan ulang generator,
   atau edit langsung bila hanya perubahan kecil. */
window.RCA_SCHEMA = {
 "version": "2026-10-31",
 "forms": {
  "C1": {
   "title": "C1 Profil awal dan lembar pendalaman",
   "unit": "kk",
   "sub": [
    {
     "id": "C1",
     "title": "Profil dan lembar pendalaman kab/kota",
     "sections": [
      {
       "type": "fields",
       "id": "hdr",
       "title": "Identitas kab/kota dan pendalaman",
       "fields": [
        {
         "k": "provinsi",
         "l": "Provinsi",
         "t": "text",
         "pre": "province_name"
        },
        {
         "k": "kedudukan",
         "l": "Kedudukan",
         "t": "select",
         "o": [
          "Capaian relatif rendah",
          "Capaian relatif tinggi"
         ]
        },
        {
         "k": "skor",
         "l": "Skor kaskade",
         "t": "number"
        },
        {
         "k": "pasangan",
         "l": "Pasangan kab/kota (skor)",
         "t": "text"
        },
        {
         "k": "tgl_pendalaman",
         "l": "Tanggal pendalaman",
         "t": "date"
        },
        {
         "k": "peserta",
         "l": "Peserta daerah (jabatan)",
         "t": "textarea"
        },
        {
         "k": "ringkasan",
         "l": "Ringkasan kontras dengan pasangan",
         "t": "textarea"
        }
       ]
      },
      {
       "type": "table",
       "id": "indikator",
       "k": "indikator",
       "title": "1 · Profil ringkas: indikator, pembilang, penyebut, sumber, periode, keterbatasan",
       "note": "Bedakan rekap sistem asal, hasil pemadanan, dan verifikasi sumber. Konfirmasi angka saat pendalaman.",
       "cols": [
        {
         "k": "indikator",
         "l": "Indikator",
         "t": "text"
        },
        {
         "k": "nilai",
         "l": "Nilai kab/kota",
         "t": "text"
        },
        {
         "k": "pembilang",
         "l": "Pembilang",
         "t": "number"
        },
        {
         "k": "penyebut",
         "l": "Penyebut",
         "t": "number"
        },
        {
         "k": "provinsi",
         "l": "Provinsi",
         "t": "text"
        },
        {
         "k": "pasangan",
         "l": "Pasangan",
         "t": "text"
        },
        {
         "k": "sumber",
         "l": "Sumber",
         "t": "text"
        },
        {
         "k": "periode",
         "l": "Periode",
         "t": "text"
        },
        {
         "k": "keterbatasan",
         "l": "Keterbatasan rekap daerah",
         "t": "textarea"
        },
        {
         "k": "konfirmasi",
         "l": "Status konfirmasi",
         "t": "select",
         "o": [
          "Dikonfirmasi",
          "Dikoreksi",
          "Belum dapat dipastikan"
         ]
        },
        {
         "k": "nilai_konf",
         "l": "Angka dikonfirmasi/dikoreksi",
         "t": "text"
        },
        {
         "k": "ket_konf",
         "l": "Sumber dan penjelasan perbedaan",
         "t": "textarea"
        }
       ]
      },
      {
       "type": "table",
       "id": "wp23",
       "k": "wp23",
       "title": "Hasil WP2–WP3 yang telah tersedia",
       "cols": [
        {
         "k": "analisis",
         "l": "Analisis/indikator",
         "t": "text"
        },
        {
         "k": "hasil",
         "l": "Hasil",
         "t": "textarea"
        },
        {
         "k": "tanggal",
         "l": "Tanggal/versi data",
         "t": "text"
        },
        {
         "k": "implikasi",
         "l": "Implikasi untuk kunjungan",
         "t": "textarea"
        }
       ]
      },
      {
       "type": "table",
       "id": "masalah",
       "k": "masalah",
       "title": "2 · Masalah dari profil awal",
       "cols": [
        {
         "k": "masalah",
         "l": "Masalah",
         "t": "textarea"
        }
       ]
      },
      {
       "type": "table",
       "id": "dugaan",
       "k": "dugaan",
       "title": "3 · Dugaan penyebab awal (2–4; untuk diuji, belum merupakan akar masalah)",
       "max": 4,
       "cols": [
        {
         "k": "dugaan",
         "l": "Dugaan penyebab awal",
         "t": "textarea"
        },
        {
         "k": "cp",
         "l": "CP terkait",
         "t": "text"
        },
        {
         "k": "fokus",
         "l": "Fokus penelusuran",
         "t": "textarea"
        },
        {
         "k": "bukti",
         "l": "Bukti yang diperlukan",
         "t": "textarea"
        },
        {
         "k": "status",
         "l": "Status",
         "t": "select",
         "o": [
          "Belum diuji",
          "Didukung",
          "Dibantah",
          "Belum cukup bukti"
         ]
        }
       ]
      },
      {
       "type": "table",
       "id": "belum_jelas",
       "k": "belum_jelas",
       "title": "4 · Informasi yang belum jelas",
       "cols": [
        {
         "k": "info",
         "l": "Informasi",
         "t": "textarea"
        },
        {
         "k": "rencana",
         "l": "Rencana klarifikasi",
         "t": "textarea"
        }
       ]
      },
      {
       "type": "table",
       "id": "pertanyaan",
       "k": "pertanyaan",
       "title": "5 · Pertanyaan untuk partisipan kunjungan lapangan",
       "cols": [
        {
         "k": "kelompok",
         "l": "Kelompok partisipan",
         "t": "text"
        },
        {
         "k": "pertanyaan",
         "l": "Pertanyaan",
         "t": "textarea"
        }
       ]
      },
      {
       "type": "table",
       "id": "sumber",
       "k": "sumber",
       "title": "6 · Sumber yang harus disiapkan",
       "cols": [
        {
         "k": "sumber",
         "l": "Sumber",
         "t": "textarea"
        },
        {
         "k": "status",
         "l": "Status",
         "t": "select",
         "o": [
          "Tersedia",
          "Sebagian",
          "Belum tersedia"
         ]
        },
        {
         "k": "pic",
         "l": "PIC",
         "t": "text"
        },
        {
         "k": "tenggat",
         "l": "Tenggat",
         "t": "date"
        }
       ]
      },
      {
       "type": "table",
       "id": "kandidat",
       "k": "kandidat",
       "title": "7 · Kandidat fasyankes dan sentinel",
       "cols": [
        {
         "k": "fasyankes",
         "l": "Fasyankes",
         "t": "text"
        },
        {
         "k": "jenis",
         "l": "Jenis",
         "t": "select",
         "o": [
          "RS",
          "Pkm"
         ]
        },
        {
         "k": "tbhiv",
         "l": "TB-HIV 2025 (2026)",
         "t": "text"
        },
        {
         "k": "status_hiv",
         "l": "Status HIV",
         "t": "text"
        },
        {
         "k": "arv",
         "l": "ARV",
         "t": "text"
        },
        {
         "k": "berhasil",
         "l": "Berhasil Jan–Ags (n)",
         "t": "text"
        },
        {
         "k": "tpt_baru",
         "l": "TPT ODHIV baru (n)",
         "t": "text"
        },
        {
         "k": "tpt_art",
         "l": "TPT dlm ART",
         "t": "text"
        },
        {
         "k": "skor",
         "l": "Skor usulan",
         "t": "text"
        },
        {
         "k": "sentinel",
         "l": "Kandidat sentinel",
         "t": "select",
         "o": [
          "Ya",
          "Tidak"
         ]
        },
        {
         "k": "catatan",
         "l": "Catatan",
         "t": "textarea"
        }
       ]
      },
      {
       "type": "fields",
       "id": "kesiapan",
       "title": "Kesiapan lapangan (tidak menunggu pemadanan nasional)",
       "fields": [
        {
         "k": "informan",
         "l": "Kandidat informan",
         "t": "textarea"
        },
        {
         "k": "kecukupan",
         "l": "Kecukupan sumber kasus (A, B, CP3, kematian)",
         "t": "textarea"
        },
        {
         "k": "penghubung",
         "l": "Petugas penghubung (jabatan)",
         "t": "textarea"
        },
        {
         "k": "akses_dok",
         "l": "Akses dokumen (rekam medis, register)",
         "t": "select",
         "o": [
          "Tersedia",
          "Sebagian",
          "Belum tersedia"
         ]
        },
        {
         "k": "akses_sitb",
         "l": "Akses SITB lokal",
         "t": "select",
         "o": [
          "Fasyankes",
          "Dinas kesehatan",
          "Belum tersedia"
         ]
        },
        {
         "k": "akses_siha",
         "l": "Akses SIHA lokal",
         "t": "select",
         "o": [
          "Fasyankes",
          "Dinas kesehatan",
          "Belum tersedia"
         ]
        },
        {
         "k": "izin",
         "l": "Status izin",
         "t": "textarea"
        }
       ]
      },
      {
       "type": "table",
       "id": "usulan_fokus",
       "k": "usulan_fokus",
       "title": "8 · Usulan fokus kunjungan",
       "cols": [
        {
         "k": "fokus",
         "l": "Fokus (titik penilaian)",
         "t": "text"
        },
        {
         "k": "alasan",
         "l": "Alasan dari profil awal",
         "t": "textarea"
        }
       ]
      },
      {
       "type": "table",
       "id": "fokus_sepakat",
       "k": "fokus_sepakat",
       "title": "9 · Fokus kunjungan yang disepakati (diisi saat pendalaman)",
       "cols": [
        {
         "k": "fokus",
         "l": "Fokus/CP",
         "t": "text"
        },
        {
         "k": "fasyankes",
         "l": "Fasyankes",
         "t": "text"
        },
        {
         "k": "bukti",
         "l": "Bukti dan catatan yang diperiksa",
         "t": "textarea"
        },
        {
         "k": "informan",
         "l": "Informan",
         "t": "text"
        },
        {
         "k": "pic",
         "l": "PIC daerah",
         "t": "text"
        },
        {
         "k": "hasil",
         "l": "Hasil pendalaman",
         "t": "textarea"
        }
       ]
      },
      {
       "type": "fields",
       "id": "hasil",
       "title": "Hasil pendalaman dan keputusan",
       "note": "Kabupaten/kota tetap mengikuti keputusan SWG 2 Oktober 2026.",
       "fields": [
        {
         "k": "fas_utama",
         "l": "Fasyankes utama (RS dan Puskesmas): nama, status usulan/disepakati, tanggal keputusan",
         "t": "textarea"
        },
        {
         "k": "sentinel",
         "l": "Keputusan sentinel",
         "t": "textarea"
        },
        {
         "k": "pj",
         "l": "Penanggung jawab",
         "t": "text"
        },
        {
         "k": "tindak_lanjut",
         "l": "Tindak lanjut dan tenggat",
         "t": "textarea"
        },
        {
         "k": "catatan",
         "l": "Catatan lain",
         "t": "textarea"
        }
       ]
      }
     ]
    }
   ]
  },
  "C2": {
   "title": "C2 Daftar sampel dan kode bukti",
   "unit": "special"
  },
  "C3": {
   "title": "C3 Telaah catatan pelayanan",
   "unit": "c2unit",
   "sub": [
    {
     "id": "C3A",
     "frame": "A",
     "title": "Unit A · Episode TB-HIV",
     "sections": [
      {
       "type": "fields",
       "id": "U",
       "title": "U · Identitas dan riwayat HIV",
       "fields": [
        {
         "k": "U01",
         "l": "U01 Kode unit (dari C2b)",
         "t": "text",
         "pre": "unit_code",
         "h": "Salin dari C2b; contoh BLL-RS-A007"
        },
        {
         "k": "U02",
         "l": "U02 Kode pasien",
         "t": "text",
         "pre": "patient_code",
         "h": "Sama dengan C2a/C2b"
        },
        {
         "k": "U03",
         "l": "U03 Pilihan di C2b",
         "t": "select",
         "o": [
          "Acak inti",
          "Acak perluasan",
          "Purposif inti",
          "Purposif perluasan",
          "Sensus",
          "Tambahan 2026 acak",
          "Tambahan 2026 purposif",
          "Pengganti acak",
          "Pengganti purposif",
          "Pengganti berurutan (cadangan habis)"
         ],
         "pre": "selection"
        },
        {
         "k": "U04",
         "l": "U04 Alasan purposif",
         "t": "select",
         "o": [
          "P1 Interupsi atau putus",
          "P2 Keterlambatan",
          "P3 Ketidaksesuaian data",
          "P4 Pelayanan berhasil",
          "P5 Meninggal",
          "P6 Status HIV tidak diketahui/kosong",
          "P7 Lainnya",
          "Tidak berlaku (acak/sensus)",
          "P8 ODHIV lama: TPT"
         ],
         "pre": "reason",
         "h": "Salin dari C2b"
        },
        {
         "k": "U05",
         "l": "U05 Periode kejadian awal",
         "t": "select",
         "o": [
          "2025",
          "Tambahan 2026"
         ],
         "pre": "period"
        },
        {
         "k": "U06",
         "l": "U06 Kode penelaah",
         "t": "text",
         "pre": "user_code"
        },
        {
         "k": "U07",
         "l": "U07 Tanggal telaah",
         "t": "date",
         "pre": "today"
        },
        {
         "k": "U08",
         "l": "U08 Durasi bagian inti (menit)",
         "t": "number",
         "h": "Untuk pengukuran waktu kunjungan Bali"
        },
        {
         "k": "U09",
         "l": "U09 Akses unit",
         "t": "select",
         "o": [
          "Dapat ditelaah",
          "Sebagian",
          "Tidak dapat ditelaah"
         ],
         "h": "Akses unit: Dapat ditelaah / Sebagian / Tidak dapat ditelaah. Bila terbatas, isi U10. Bila tidak dapat ditelaah: isi U10, Peta sumber, Z05, lalu berhenti"
        },
        {
         "k": "U10",
         "l": "U10 Alasan dan upaya bila akses terbatas",
         "t": "textarea"
        },
        {
         "k": "U11",
         "l": "U11 Umur saat awal riwayat (tahun)",
         "t": "number"
        },
        {
         "k": "U12",
         "l": "U12 Jenis kelamin",
         "t": "select",
         "o": [
          "Laki-laki",
          "Perempuan",
          "TC"
         ]
        },
        {
         "k": "U13",
         "l": "U13 Tanggal diagnosis HIV",
         "t": "date",
         "h": "Bila hanya bulan/tahun diketahui: kosongkan tanggal, St = Y, tulis --/BB/TTTT di Z02. Jangan memakai tanggal entri sistem. Boleh sebelum 2024 bila tercatat",
         "st": true,
         "src": true,
         "so": [
          "Y",
          "TL",
          "TC",
          "TBL",
          "BD"
         ]
        },
        {
         "k": "U14",
         "l": "U14 Tanggal pertama kali pernah mulai ARV",
         "t": "date",
         "st": true,
         "src": true,
         "so": [
          "Y",
          "TL",
          "TC",
          "TBL",
          "BD"
         ],
         "h": "Sepanjang riwayat; pindahan/pemberian kembali bukan inisiasi pertama"
        },
        {
         "k": "U15",
         "l": "U15 Kepastian inisiasi ARV pertama",
         "t": "select",
         "o": [
          "Terverifikasi pertama kali",
          "Belum pernah ARV (terdokumentasi)",
          "Belum dapat dipastikan"
         ]
        }
       ]
      },
      {
       "type": "fields",
       "id": "A",
       "title": "A · Episode TB-HIV (inti)",
       "fields": [
        {
         "k": "A00",
         "l": "A00 Tanggal pertama tercatat sebagai terduga TB (inti)",
         "t": "date",
         "h": "Tanggal pertama tercatat sebagai terduga TB (register TBC.06/SITB atau permintaan pemeriksaan TB). Tulis BD bila tidak ditemukan.",
         "st": true,
         "src": true,
         "so": [
          "Y",
          "TL",
          "TC",
          "TBL",
          "BD"
         ]
        },
        {
         "k": "A01",
         "l": "A01 Tanggal diagnosis TB",
         "t": "date",
         "st": true,
         "src": true,
         "so": [
          "Y",
          "TL",
          "TC",
          "TBL",
          "BD"
         ]
        },
        {
         "k": "A02",
         "l": "A02 Dasar diagnosis",
         "t": "select",
         "o": [
          "Bakteriologis",
          "Klinis",
          "TC"
         ]
        },
        {
         "k": "A03",
         "l": "A03 Lokasi TB",
         "t": "select",
         "o": [
          "Paru",
          "Ekstraparu",
          "Paru dan ekstraparu",
          "Meningitis/SSP",
          "TC"
         ],
         "h": "Meningitis/SSP memengaruhi waktu ARV"
        },
        {
         "k": "A04",
         "l": "A04 Resistansi obat",
         "t": "select",
         "o": [
          "TB SO",
          "TB RO",
          "Belum diketahui"
         ]
        },
        {
         "k": "A05",
         "l": "A05 Tipe pasien",
         "t": "select",
         "o": [
          "Baru",
          "Kambuh",
          "Lainnya",
          "TC"
         ]
        },
        {
         "k": "A06",
         "l": "A06 Status HIV saat diagnosis TB",
         "t": "select",
         "o": [
          "Sudah diketahui positif sebelum episode",
          "Ditetapkan selama episode",
          "Belum dapat dipastikan"
         ],
         "h": "Bila sudah diketahui sebelumnya, lewati A07"
        },
        {
         "k": "A07",
         "l": "A07 Tanggal tes HIV pada episode ini",
         "t": "date",
         "st": true,
         "src": true,
         "so": [
          "Y",
          "TL",
          "TC",
          "TBL",
          "BD"
         ]
        },
        {
         "k": "A08",
         "l": "A08 Tanggal mulai OAT",
         "t": "date",
         "st": true,
         "src": true,
         "so": [
          "Y",
          "TL",
          "TC",
          "TBL",
          "BD"
         ],
         "h": "Kosong bila belum mulai; isi A09"
        },
        {
         "k": "A09",
         "l": "A09 Alasan belum mulai OAT (tercatat)",
         "t": "textarea"
        },
        {
         "k": "A10",
         "l": "A10 Status ARV saat OAT dimulai (atau saat diagnosis bila belum OAT)",
         "t": "select",
         "o": [
          "Sedang ARV",
          "Pernah ARV, terputus",
          "Belum pernah ARV",
          "Belum pasti"
         ],
         "st": true,
         "src": true,
         "so": [
          "Y",
          "TL",
          "TC",
          "TBL",
          "BD"
         ]
        },
        {
         "k": "A10b",
         "l": "A10b ARV berlanjut selama pengobatan TB (bila sedang ARV saat OAT dimulai)",
         "t": "select",
         "o": [
          "Ya",
          "Terinterupsi",
          "BD",
          "TBL (belum ARV saat OAT)"
         ],
         "st": true,
         "src": true,
         "so": [
          "Y",
          "TL",
          "TC",
          "TBL",
          "BD"
         ],
         "h": "Untuk CP6 dan TB/HIV-6; interupsi dirinci di lembar Interupsi"
        },
        {
         "k": "A11",
         "l": "A11 Tanggal mulai/mulai kembali ARV selama episode",
         "t": "date",
         "h": "Batas ARV: TB SO 14 hari, TB RO 56 hari setelah OAT (Juknis Kolaborasi TBC-HIV 2023). Bila sedang ARV dan berlanjut: kosong",
         "st": true,
         "src": true,
         "so": [
          "Y",
          "TL",
          "TC",
          "TBL",
          "BD"
         ]
        },
        {
         "k": "A12",
         "l": "A12 Alasan penundaan ARV (tercatat)",
         "t": "textarea"
        },
        {
         "k": "A13",
         "l": "A13 Luaran pengobatan TB sampai 30/06/2026",
         "t": "select",
         "o": [
          "Sembuh",
          "Pengobatan lengkap",
          "Gagal",
          "Putus berobat",
          "Meninggal",
          "Tidak dievaluasi",
          "Masih berobat",
          "Pindah",
          "Belum diketahui"
         ],
         "st": true,
         "src": true,
         "so": [
          "Y",
          "TL",
          "TC",
          "TBL",
          "BD"
         ]
        },
        {
         "k": "A14",
         "l": "A14 Tanggal luaran/selesai terapi",
         "t": "date"
        },
        {
         "k": "A15",
         "l": "A15 Status HIV di SITB",
         "t": "select",
         "o": [
          "Ya, sesuai",
          "Ya, berbeda",
          "Tidak tercatat",
          "Belum dicek"
         ],
         "h": "Dibandingkan dengan sumber pelayanan"
        },
        {
         "k": "A16",
         "l": "A16 Pengobatan ARV di SITB",
         "t": "select",
         "o": [
          "Ya, sesuai",
          "Ya, berbeda",
          "Tidak tercatat",
          "Belum dicek"
         ]
        },
        {
         "k": "A17",
         "l": "A17 Luaran TB di SITB",
         "t": "select",
         "o": [
          "Ya, sesuai",
          "Ya, berbeda",
          "Tidak tercatat",
          "Belum dicek"
         ]
        },
        {
         "k": "A18",
         "l": "A18 Retensi HIV 90 hari (±30) setelah OAT selesai dengan berhasil",
         "t": "select",
         "o": [
          "Hadir",
          "Tidak hadir",
          "Pengamatan belum cukup",
          "TBL"
         ],
         "st": true,
         "src": true,
         "so": [
          "Y",
          "TL",
          "TC",
          "TBL",
          "BD"
         ],
         "h": "BD bila pengamatan belum cukup; TBL bila meninggal atau OAT tidak selesai"
        },
        {
         "k": "A19",
         "l": "A19 Retensi HIV 180 hari (±30) setelah OAT selesai dengan berhasil",
         "t": "select",
         "o": [
          "Hadir",
          "Tidak hadir",
          "Pengamatan belum cukup",
          "TBL"
         ],
         "st": true,
         "src": true,
         "so": [
          "Y",
          "TL",
          "TC",
          "TBL",
          "BD"
         ],
         "h": "Untuk CP14"
        }
       ]
      },
      {
       "type": "fields",
       "id": "T",
       "title": "T · Kesinambungan (inti)",
       "fields": [
        {
         "k": "T01",
         "l": "T01 Ada rujukan atau pindah layanan",
         "t": "select",
         "o": [
          "Ya",
          "Dipastikan tidak",
          "TC",
          "BD"
         ],
         "h": "Bila Ya: isi lembar Rujukan"
        },
        {
         "k": "T02",
         "l": "T02 Ada kunjungan terlewat atau interupsi",
         "t": "select",
         "o": [
          "Ya",
          "Dipastikan tidak",
          "TC",
          "BD"
         ],
         "h": "Bila Ya: isi lembar Interupsi"
        },
        {
         "k": "T03",
         "l": "T03 Status pelayanan HIV per 30/06/2026",
         "t": "select",
         "o": [
          "Aktif ARV",
          "Belum mulai ARV",
          "Terputus/hilang kontak",
          "Pindah, terkonfirmasi",
          "Pindah, belum terkonfirmasi",
          "Meninggal",
          "Belum diketahui"
         ],
         "st": true,
         "src": true,
         "so": [
          "Y",
          "TL",
          "TC",
          "TBL",
          "BD"
         ]
        },
        {
         "k": "T04",
         "l": "T04 Tanggal kontak pelayanan terakhir",
         "t": "date"
        },
        {
         "k": "T05",
         "l": "T05 Status ARV per 30/06/2026 di SIHA",
         "t": "select",
         "o": [
          "Ya, sesuai",
          "Ya, berbeda",
          "Tidak tercatat",
          "Belum dicek"
         ]
        },
        {
         "k": "T06",
         "l": "T06 Tanggal kematian (bila tercatat)",
         "t": "date",
         "st": true,
         "src": true,
         "so": [
          "Y",
          "TL",
          "TC",
          "TBL",
          "BD"
         ]
        },
        {
         "k": "T07",
         "l": "T07 Calon telaah kematian C6",
         "t": "select",
         "o": [
          "Ya",
          "Tidak",
          "Perlu verifikasi"
         ]
        }
       ]
      },
      {
       "type": "fields",
       "id": "Z",
       "title": "Z · Penutupan",
       "fields": [
        {
         "k": "Z01",
         "l": "Z01 Ketidaksesuaian antarsumber",
         "t": "select",
         "o": [
          "Tidak ditemukan",
          "Ada",
          "Belum dapat diperiksa"
         ],
         "h": "Tulis kedua nilai dan sumbernya; jangan menghapus salah satu"
        },
        {
         "k": "Z02",
         "l": "Z02 Uraian ketidaksesuaian",
         "t": "textarea"
        },
        {
         "k": "Z03",
         "l": "Z03 Pertanyaan atau bukti yang masih diperlukan",
         "t": "textarea"
        },
        {
         "k": "Z04",
         "l": "Z04 Diteruskan ke (C4, C5/WP3, C6, C7)",
         "t": "multi",
         "o": [
          "C4",
          "C5/WP3",
          "C6",
          "C7"
         ]
        },
        {
         "k": "Z05",
         "l": "Z05 Status telaah",
         "t": "select",
         "o": [
          "Lengkap untuk aspek yang dinilai",
          "Masih sebagian",
          "Tidak berhasil"
         ],
         "h": "Status telaah. TC hanya menjadi insiden pelayanan setelah penelusuran sumber selesai (Lengkap untuk aspek yang dinilai)."
        },
        {
         "k": "Z06",
         "l": "Z06 Pendalaman dilakukan",
         "t": "select",
         "o": [
          "Ya",
          "Sebagian",
          "Tidak"
         ],
         "h": "Wajib untuk unit purposif dan unit acak yang memunculkan pemicu (lihat kotak Pemicu pendalaman). Wajib bila unit purposif atau ada pemicu"
        },
        {
         "k": "Z07",
         "l": "Z07 Diperiksa oleh (kode) dan tanggal",
         "t": "text"
        },
        {
         "k": "Z08",
         "l": "Z08 Terpilih pengambilan data ulang C9",
         "t": "select",
         "o": [
          "Ya",
          "Tidak"
         ]
        }
       ]
      },
      {
       "type": "fields",
       "id": "AUTO",
       "title": "Hitungan otomatis dan pemicu",
       "fields": [
        {
         "k": "auto_hari_dx_oat",
         "l": "Hari diagnosis TB → mulai OAT",
         "t": "auto",
         "fn": "hari_dx_oat"
        },
        {
         "k": "auto_hari_oat_arv",
         "l": "Hari mulai OAT → mulai ARV",
         "t": "auto",
         "fn": "hari_oat_arv"
        },
        {
         "k": "auto_arv_lewat",
         "l": "ARV melewati batas juknis",
         "t": "auto",
         "fn": "arv_lewat"
        },
        {
         "k": "auto_hari_dx_teshiv",
         "l": "Hari diagnosis TB → tes HIV",
         "t": "auto",
         "fn": "hari_dx_teshiv"
        },
        {
         "k": "auto_kelompok",
         "l": "Kelompok sampel (otomatis)",
         "t": "auto",
         "fn": "kelompok"
        },
        {
         "k": "auto_cek_A",
         "l": "Cek isian (otomatis)",
         "t": "auto",
         "fn": "cek_A"
        },
        {
         "k": "auto_pemicu_A",
         "l": "Pemicu pendalaman (otomatis)",
         "t": "auto",
         "fn": "pemicu_A"
        },
        {
         "k": "auto_cp6",
         "l": "CP6 penilaian (otomatis)",
         "t": "auto",
         "fn": "cp6"
        },
        {
         "k": "auto_hari_terduga_dx",
         "l": "Hari terduga TB → diagnosis TB (otomatis)",
         "t": "auto",
         "fn": "hari_terduga_dx"
        },
        {
         "k": "auto_cp6_pnpk",
         "l": "CP6 menurut PNPK 2019 (sensitivitas, otomatis)",
         "t": "auto",
         "fn": "cp6_pnpk"
        }
       ]
      },
      {
       "type": "fields",
       "id": "CD4",
       "title": "CD4 (bersyarat: ARV >14 hari setelah OAT atau belum dimulai)",
       "fields": [
        {
         "k": "CD4",
         "l": "CD4 awal (sel/µL); isi bila ARV >14 hari setelah OAT atau belum dimulai",
         "t": "number",
         "src": true
        },
        {
         "k": "CD4_tgl",
         "l": "Tanggal CD4",
         "t": "date"
        },
        {
         "k": "CD4_status",
         "l": "Status CD4",
         "t": "select",
         "o": [
          "Tercatat",
          "Tidak diperiksa",
          "Hasil tidak tersedia",
          "Waktu tidak sesuai untuk kondisi awal"
         ]
        }
       ],
       "collapsed": true
      },
      {
       "type": "fields",
       "id": "P",
       "title": "P · Pendalaman (unit purposif atau ada pemicu)",
       "fields": [
        {
         "k": "P01",
         "l": "P01 Durasi pendalaman (menit)",
         "t": "number",
         "h": "Berlaku: A dan B"
        },
        {
         "k": "P02",
         "l": "P02 Tanggal gejala pertama tercatat",
         "t": "date",
         "st": true,
         "src": true,
         "so": [
          "Y",
          "TL",
          "TC",
          "TBL",
          "BD"
         ],
         "h": "Berlaku: A"
        },
        {
         "k": "P03",
         "l": "P03 Tanggal dan fasilitas kontak pertama terkait TB",
         "t": "text",
         "st": true,
         "src": true,
         "so": [
          "Y",
          "TL",
          "TC",
          "TBL",
          "BD"
         ],
         "h": "Tulis kode fasilitas, bukan nama Berlaku: A"
        },
        {
         "k": "P04",
         "l": "P04 Pemeriksaan diagnostik TB: jenis dan hasil",
         "t": "textarea",
         "st": true,
         "src": true,
         "so": [
          "Y",
          "TL",
          "TC",
          "TBL",
          "BD"
         ],
         "h": "Berlaku: A dan B"
        },
        {
         "k": "P05",
         "l": "P05 Tanggal pemeriksaan diminta",
         "t": "date",
         "h": "Berlaku: A dan B"
        },
        {
         "k": "P06",
         "l": "P06 Tanggal spesimen dikirim",
         "t": "date",
         "h": "Berlaku: A dan B"
        },
        {
         "k": "P07",
         "l": "P07 Tanggal spesimen diperiksa",
         "t": "date",
         "h": "Berlaku: A dan B"
        },
        {
         "k": "P08",
         "l": "P08 Tanggal hasil diterima fasyankes",
         "t": "date",
         "h": "Berlaku: A dan B"
        },
        {
         "k": "P09",
         "l": "P09 Tanggal hasil disampaikan kepada pasien",
         "t": "date",
         "h": "Berlaku: A dan B"
        },
        {
         "k": "P10",
         "l": "P10 Tanggal penawaran tes HIV dan respons pasien",
         "t": "textarea",
         "st": true,
         "src": true,
         "so": [
          "Y",
          "TL",
          "TC",
          "TBL",
          "BD"
         ],
         "h": "Bila status HIV ditetapkan selama episode Berlaku: A"
        },
        {
         "k": "P11",
         "l": "P11 Tanggal penawaran atau rujukan ARV",
         "t": "date",
         "st": true,
         "src": true,
         "so": [
          "Y",
          "TL",
          "TC",
          "TBL",
          "BD"
         ],
         "h": "Berlaku: A"
        },
        {
         "k": "P12",
         "l": "P12 Pemantauan akhir tahap awal OAT: tanggal dan hasil",
         "t": "text",
         "st": true,
         "src": true,
         "so": [
          "Y",
          "TL",
          "TC",
          "TBL",
          "BD"
         ],
         "h": "Berlaku: A"
        },
        {
         "k": "P18",
         "l": "P18 Dukungan pengobatan: kebutuhan dan yang diterima",
         "t": "textarea",
         "st": true,
         "src": true,
         "so": [
          "Y",
          "TL",
          "TC",
          "TBL",
          "BD"
         ],
         "h": "Berlaku: A dan B"
        },
        {
         "k": "P21",
         "l": "P21 Konteks yang menjelaskan pelayanan (bila tercatat dan relevan)",
         "t": "textarea",
         "st": true,
         "src": true,
         "so": [
          "Y",
          "TL",
          "TC",
          "TBL",
          "BD"
         ],
         "h": "Contoh: kehamilan, penahanan, biaya, dukungan komunitas Berlaku: A dan B"
        },
        {
         "k": "P22",
         "l": "P22 Mekanisme yang ditemukan penelaah",
         "t": "textarea",
         "h": "Fakta dan dugaan dibedakan Berlaku: A dan B"
        }
       ],
       "collapsed": true,
       "note": "Wajib untuk unit purposif dan untuk unit acak yang memunculkan pemicu. Unit acak tanpa pemicu tidak perlu pendalaman."
      },
      {
       "type": "table",
       "id": "sumber",
       "k": "sumber",
       "title": "Sumber yang dibuka untuk unit ini",
       "cols": [
        {
         "k": "kode_sumber",
         "l": "Kode sumber (RM1, TB1, LAB1, ...)",
         "t": "text"
        },
        {
         "k": "jenis_sumber",
         "l": "Jenis sumber",
         "t": "select",
         "o": [
          "RM",
          "TB",
          "HIV",
          "LAB",
          "FAR",
          "TPT",
          "RUJ",
          "KOM",
          "SITB",
          "SIHA",
          "LAIN"
         ]
        },
        {
         "k": "fasilitas_atau_lokasi",
         "l": "Fasilitas atau lokasi (kode)",
         "t": "text"
        },
        {
         "k": "tahap_perjalanan",
         "l": "Tahap perjalanan",
         "t": "select",
         "o": [
          "Sebelum fasyankes sampel",
          "Di fasyankes sampel",
          "Sesudah fasyankes sampel"
         ]
        },
        {
         "k": "lokator_nonidentitas",
         "l": "Lokator nonidentitas (tanggal catatan, halaman)",
         "t": "textarea"
        },
        {
         "k": "akses",
         "l": "Akses",
         "t": "select",
         "o": [
          "Lengkap",
          "Sebagian",
          "Belum diakses",
          "Tidak ditemukan"
         ]
        },
        {
         "k": "petugas_penghubung_cara",
         "l": "Petugas penghubung, cara akses, tenggat",
         "t": "text"
        },
        {
         "k": "keterangan",
         "l": "Keterangan",
         "t": "textarea"
        }
       ],
       "note": "Kode sumber: W keterangan petugas; RM rekam medis; TB kartu/register TB; HIV ikhtisar/register HIV; LAB; FAR farmasi; TPT; RUJ rujukan; KOM komunitas; SITB; SIHA; LAIN. Beri nomor bila lebih dari satu (RM1, RM2)."
      },
      {
       "type": "table",
       "id": "rujukan",
       "k": "rujukan",
       "title": "Kejadian rujukan (isi bila T01 = Ya)",
       "cols": [
        {
         "k": "layanan",
         "l": "Layanan",
         "t": "select",
         "o": [
          "TB",
          "ARV",
          "TPT",
          "Diagnostik",
          "Lainnya"
         ]
        },
        {
         "k": "asal",
         "l": "Asal (kode fasilitas)",
         "t": "text"
        },
        {
         "k": "tujuan",
         "l": "Tujuan (kode fasilitas)",
         "t": "text"
        },
        {
         "k": "tanggal_rujuk",
         "l": "Tanggal rujuk",
         "t": "date"
        },
        {
         "k": "tanggal_hadir_di_tujuan",
         "l": "Tanggal hadir di tujuan",
         "t": "date"
        },
        {
         "k": "pelayanan_di_tujuan_dan",
         "l": "Pelayanan di tujuan dan tanggal",
         "t": "text"
        },
        {
         "k": "tanggal_umpan_balik_ke_a",
         "l": "Tanggal umpan balik ke asal",
         "t": "date"
        },
        {
         "k": "status",
         "l": "Status",
         "t": "select",
         "o": [
          "Y",
          "TL",
          "TC",
          "TBL",
          "BD"
         ]
        },
        {
         "k": "sumber",
         "l": "Sumber (kode)",
         "t": "text"
        }
       ],
       "when": {
        "k": "T01",
        "eq": "Ya"
       }
      },
      {
       "type": "table",
       "id": "interupsi",
       "k": "interupsi",
       "title": "Kejadian interupsi (isi bila T02 = Ya)",
       "cols": [
        {
         "k": "layanan",
         "l": "Layanan",
         "t": "select",
         "o": [
          "TB",
          "ARV",
          "TPT",
          "TB dan ARV",
          "ARV dan TPT"
         ]
        },
        {
         "k": "jenis",
         "l": "Jenis",
         "t": "select",
         "o": [
          "Kunjungan terlewat",
          "Interupsi"
         ]
        },
        {
         "k": "tanggal_jadwal_terlewat",
         "l": "Tanggal jadwal terlewat atau obat terakhir",
         "t": "date"
        },
        {
         "k": "alasan_tercatat",
         "l": "Alasan tercatat",
         "t": "textarea"
        },
        {
         "k": "upaya_penelusuran_dan_ta",
         "l": "Upaya penelusuran dan tanggal",
         "t": "text"
        },
        {
         "k": "tanggal_kembali_berobat",
         "l": "Tanggal kembali berobat",
         "t": "date"
        },
        {
         "k": "fasilitas_tempat_kembali",
         "l": "Fasilitas tempat kembali (kode)",
         "t": "text"
        },
        {
         "k": "status",
         "l": "Status",
         "t": "select",
         "o": [
          "Y",
          "TL",
          "TC",
          "TBL",
          "BD"
         ]
        },
        {
         "k": "sumber",
         "l": "Sumber (kode)",
         "t": "text"
        }
       ],
       "when": {
        "k": "T02",
        "eq": "Ya"
       },
       "note": "Bila TB dan ARV (atau ARV dan TPT) terputus bersamaan dengan tanggal obat terakhir yang sama, catat satu baris dengan layanan gabungan."
      },
      {
       "type": "photos",
       "id": "foto",
       "title": "Foto pendukung (opsional)",
       "note": "Foto dikompres otomatis. Potong dan tutup (blur) nama, NIK, nomor RM, alamat, atau wajah sebelum mengunggah."
      }
     ]
    },
    {
     "id": "C3B",
     "frame": "B",
     "title": "Unit B · Riwayat ARV dan TPT",
     "sections": [
      {
       "type": "fields",
       "id": "U",
       "title": "U · Identitas dan riwayat HIV",
       "fields": [
        {
         "k": "U01",
         "l": "U01 Kode unit (dari C2b)",
         "t": "text",
         "pre": "unit_code",
         "h": "Salin dari C2b; contoh BLL-RS-A007"
        },
        {
         "k": "U02",
         "l": "U02 Kode pasien",
         "t": "text",
         "pre": "patient_code",
         "h": "Sama dengan C2a/C2b"
        },
        {
         "k": "U03",
         "l": "U03 Pilihan di C2b",
         "t": "select",
         "o": [
          "Acak inti",
          "Acak perluasan",
          "Purposif inti",
          "Purposif perluasan",
          "Sensus",
          "Tambahan 2026 acak",
          "Tambahan 2026 purposif",
          "Pengganti acak",
          "Pengganti purposif",
          "Pengganti berurutan (cadangan habis)"
         ],
         "pre": "selection"
        },
        {
         "k": "U04",
         "l": "U04 Alasan purposif",
         "t": "select",
         "o": [
          "P1 Interupsi atau putus",
          "P2 Keterlambatan",
          "P3 Ketidaksesuaian data",
          "P4 Pelayanan berhasil",
          "P5 Meninggal",
          "P6 Status HIV tidak diketahui/kosong",
          "P7 Lainnya",
          "Tidak berlaku (acak/sensus)",
          "P8 ODHIV lama: TPT"
         ],
         "pre": "reason",
         "h": "Salin dari C2b"
        },
        {
         "k": "U05",
         "l": "U05 Periode kejadian awal",
         "t": "select",
         "o": [
          "2025",
          "Tambahan 2026"
         ],
         "pre": "period"
        },
        {
         "k": "U06",
         "l": "U06 Kode penelaah",
         "t": "text",
         "pre": "user_code"
        },
        {
         "k": "U07",
         "l": "U07 Tanggal telaah",
         "t": "date",
         "pre": "today"
        },
        {
         "k": "U08",
         "l": "U08 Durasi bagian inti (menit)",
         "t": "number",
         "h": "Untuk pengukuran waktu kunjungan Bali"
        },
        {
         "k": "U09",
         "l": "U09 Akses unit",
         "t": "select",
         "o": [
          "Dapat ditelaah",
          "Sebagian",
          "Tidak dapat ditelaah"
         ],
         "h": "Akses unit: Dapat ditelaah / Sebagian / Tidak dapat ditelaah. Bila terbatas, isi U10. Bila tidak dapat ditelaah: isi U10, Peta sumber, Z05, lalu berhenti"
        },
        {
         "k": "U10",
         "l": "U10 Alasan dan upaya bila akses terbatas",
         "t": "textarea"
        },
        {
         "k": "U11",
         "l": "U11 Umur saat awal riwayat (tahun)",
         "t": "number"
        },
        {
         "k": "U12",
         "l": "U12 Jenis kelamin",
         "t": "select",
         "o": [
          "Laki-laki",
          "Perempuan",
          "TC"
         ]
        },
        {
         "k": "U13",
         "l": "U13 Tanggal diagnosis HIV",
         "t": "date",
         "h": "Bila hanya bulan/tahun diketahui: kosongkan tanggal, St = Y, tulis --/BB/TTTT di Z02. Jangan memakai tanggal entri sistem. Boleh sebelum 2024 bila tercatat",
         "st": true,
         "src": true,
         "so": [
          "Y",
          "TL",
          "TC",
          "TBL",
          "BD"
         ]
        },
        {
         "k": "U14",
         "l": "U14 Tanggal pertama kali pernah mulai ARV",
         "t": "date",
         "st": true,
         "src": true,
         "so": [
          "Y",
          "TL",
          "TC",
          "TBL",
          "BD"
         ],
         "h": "Sepanjang riwayat; pindahan/pemberian kembali bukan inisiasi pertama"
        },
        {
         "k": "U15",
         "l": "U15 Kepastian inisiasi ARV pertama",
         "t": "select",
         "o": [
          "Terverifikasi pertama kali",
          "Belum pernah ARV (terdokumentasi)",
          "Belum dapat dipastikan"
         ]
        }
       ]
      },
      {
       "type": "fields",
       "id": "B",
       "title": "B · Riwayat ARV dan TPT (inti)",
       "fields": [
        {
         "k": "B01",
         "l": "B01 Tanggal mulai ARV di fasyankes ini",
         "t": "date",
         "st": true,
         "src": true,
         "so": [
          "Y",
          "TL",
          "TC",
          "TBL",
          "BD"
         ]
        },
        {
         "k": "B02",
         "l": "B02 Status masuk (terverifikasi)",
         "t": "select",
         "o": [
          "Baru pertama kali ARV",
          "Rujuk masuk",
          "Kembali setelah putus ARV",
          "Belum pasti",
          "ODHIV lama (sebelum 2025)"
         ],
         "h": "Bandingkan dengan U14–U15"
        },
        {
         "k": "B03",
         "l": "B03 Tanggal skrining TB saat mulai ARV",
         "t": "date",
         "st": true,
         "src": true,
         "so": [
          "Y",
          "TL",
          "TC",
          "TBL",
          "BD"
         ]
        },
        {
         "k": "B04",
         "l": "B04 Hasil skrining TB",
         "t": "select",
         "o": [
          "Negatif",
          "Positif/indikasi pemeriksaan",
          "Hasil tidak tercatat"
         ]
        },
        {
         "k": "B05",
         "l": "B05 Keputusan diagnostik TB (bila skrining positif)",
         "t": "select",
         "o": [
          "TB",
          "Bukan TB",
          "Belum selesai",
          "TBL (skrining negatif)"
         ]
        },
        {
         "k": "B06",
         "l": "B06 Tanggal keputusan diagnostik",
         "t": "date"
        },
        {
         "k": "B07",
         "l": "B07 Tanggal mulai OAT (bila TB)",
         "t": "date",
         "h": "Rujukan dicatat di lembar Rujukan"
        },
        {
         "k": "B08",
         "l": "B08 Hasil penilaian kelayakan TPT",
         "t": "select",
         "o": [
          "Layak",
          "Ditunda",
          "Tidak layak",
          "Tidak tercatat",
          "TBL (TB aktif)",
          "Belum dapat ditetapkan (TB aktif belum disingkirkan)"
         ],
         "st": true,
         "src": true,
         "so": [
          "Y",
          "TL",
          "TC",
          "TBL",
          "BD"
         ]
        },
        {
         "k": "B09",
         "l": "B09 Tanggal penilaian kelayakan TPT",
         "t": "date"
        },
        {
         "k": "B10",
         "l": "B10 Riwayat TPT sebelumnya",
         "t": "select",
         "o": [
          "Tidak pernah (terdokumentasi)",
          "Pernah lengkap",
          "Pernah tidak lengkap",
          "Belum diketahui"
         ]
        },
        {
         "k": "B11",
         "l": "B11 Penawaran TPT",
         "t": "select",
         "o": [
          "Ditawarkan, diterima",
          "Ditawarkan, menolak",
          "Tidak ditawarkan (terdokumentasi)",
          "TC",
          "TBL"
         ],
         "h": "Periksa walau kelayakan tidak tercatat"
        },
        {
         "k": "B12",
         "l": "B12 Tanggal penawaran TPT",
         "t": "date"
        },
        {
         "k": "B13",
         "l": "B13 Tanggal mulai TPT",
         "t": "date",
         "st": true,
         "src": true,
         "so": [
          "Y",
          "TL",
          "TC",
          "TBL",
          "BD"
         ],
         "h": "Kosong bila belum mulai; isi B15"
        },
        {
         "k": "B14",
         "l": "B14 Paduan TPT",
         "t": "select",
         "o": [
          "3HP",
          "1HP",
          "3HR",
          "6H",
          "Lainnya",
          "TC"
         ]
        },
        {
         "k": "B15",
         "l": "B15 Alasan belum mulai TPT (tercatat)",
         "t": "textarea"
        },
        {
         "k": "B16",
         "l": "B16 Luaran TPT sampai 30/06/2026",
         "t": "select",
         "o": [
          "Lengkap",
          "Sedang terapi",
          "Dihentikan: efek samping",
          "Dihentikan: TB aktif",
          "Putus",
          "Meninggal",
          "Pindah",
          "Belum diketahui",
          "TBL (tidak mulai)"
         ],
         "st": true,
         "src": true,
         "so": [
          "Y",
          "TL",
          "TC",
          "TBL",
          "BD"
         ],
         "h": "Kriteria penyelesaian menurut lembar acuan klinis"
        },
        {
         "k": "B17",
         "l": "B17 Tanggal luaran/obat TPT terakhir",
         "t": "date"
        },
        {
         "k": "B18",
         "l": "B18 Tanggal mulai ARV di SIHA",
         "t": "select",
         "o": [
          "Ya, sesuai",
          "Ya, berbeda",
          "Tidak tercatat",
          "Belum dicek"
         ]
        },
        {
         "k": "B19",
         "l": "B19 Pemberian TPT di SIHA",
         "t": "select",
         "o": [
          "Ya, sesuai",
          "Ya, berbeda",
          "Tidak tercatat",
          "Belum dicek"
         ]
        },
        {
         "k": "B20",
         "l": "B20 Luaran TPT di SIHA",
         "t": "select",
         "o": [
          "Ya, sesuai",
          "Ya, berbeda",
          "Tidak tercatat",
          "Belum dicek"
         ]
        }
       ]
      },
      {
       "type": "fields",
       "id": "T",
       "title": "T · Kesinambungan (inti)",
       "fields": [
        {
         "k": "T01",
         "l": "T01 Ada rujukan atau pindah layanan",
         "t": "select",
         "o": [
          "Ya",
          "Dipastikan tidak",
          "TC",
          "BD"
         ],
         "h": "Bila Ya: isi lembar Rujukan"
        },
        {
         "k": "T02",
         "l": "T02 Ada kunjungan terlewat atau interupsi",
         "t": "select",
         "o": [
          "Ya",
          "Dipastikan tidak",
          "TC",
          "BD"
         ],
         "h": "Bila Ya: isi lembar Interupsi"
        },
        {
         "k": "T03",
         "l": "T03 Status pelayanan HIV per 30/06/2026",
         "t": "select",
         "o": [
          "Aktif ARV",
          "Belum mulai ARV",
          "Terputus/hilang kontak",
          "Pindah, terkonfirmasi",
          "Pindah, belum terkonfirmasi",
          "Meninggal",
          "Belum diketahui"
         ],
         "st": true,
         "src": true,
         "so": [
          "Y",
          "TL",
          "TC",
          "TBL",
          "BD"
         ]
        },
        {
         "k": "T04",
         "l": "T04 Tanggal kontak pelayanan terakhir",
         "t": "date"
        },
        {
         "k": "T05",
         "l": "T05 Status ARV per 30/06/2026 di SIHA",
         "t": "select",
         "o": [
          "Ya, sesuai",
          "Ya, berbeda",
          "Tidak tercatat",
          "Belum dicek"
         ]
        },
        {
         "k": "T06",
         "l": "T06 Tanggal kematian (bila tercatat)",
         "t": "date",
         "st": true,
         "src": true,
         "so": [
          "Y",
          "TL",
          "TC",
          "TBL",
          "BD"
         ]
        },
        {
         "k": "T07",
         "l": "T07 Calon telaah kematian C6",
         "t": "select",
         "o": [
          "Ya",
          "Tidak",
          "Perlu verifikasi"
         ]
        }
       ]
      },
      {
       "type": "fields",
       "id": "Z",
       "title": "Z · Penutupan",
       "fields": [
        {
         "k": "Z01",
         "l": "Z01 Ketidaksesuaian antarsumber",
         "t": "select",
         "o": [
          "Tidak ditemukan",
          "Ada",
          "Belum dapat diperiksa"
         ],
         "h": "Tulis kedua nilai dan sumbernya; jangan menghapus salah satu"
        },
        {
         "k": "Z02",
         "l": "Z02 Uraian ketidaksesuaian",
         "t": "textarea"
        },
        {
         "k": "Z03",
         "l": "Z03 Pertanyaan atau bukti yang masih diperlukan",
         "t": "textarea"
        },
        {
         "k": "Z04",
         "l": "Z04 Diteruskan ke (C4, C5/WP3, C6, C7)",
         "t": "multi",
         "o": [
          "C4",
          "C5/WP3",
          "C6",
          "C7"
         ]
        },
        {
         "k": "Z05",
         "l": "Z05 Status telaah",
         "t": "select",
         "o": [
          "Lengkap untuk aspek yang dinilai",
          "Masih sebagian",
          "Tidak berhasil"
         ],
         "h": "Status telaah. TC hanya menjadi insiden pelayanan setelah penelusuran sumber selesai (Lengkap untuk aspek yang dinilai)."
        },
        {
         "k": "Z06",
         "l": "Z06 Pendalaman dilakukan",
         "t": "select",
         "o": [
          "Ya",
          "Sebagian",
          "Tidak"
         ],
         "h": "Wajib untuk unit purposif dan unit acak yang memunculkan pemicu (lihat kotak Pemicu pendalaman). Wajib bila unit purposif atau ada pemicu"
        },
        {
         "k": "Z07",
         "l": "Z07 Diperiksa oleh (kode) dan tanggal",
         "t": "text"
        },
        {
         "k": "Z08",
         "l": "Z08 Terpilih pengambilan data ulang C9",
         "t": "select",
         "o": [
          "Ya",
          "Tidak"
         ]
        }
       ]
      },
      {
       "type": "fields",
       "id": "AUTO",
       "title": "Hitungan otomatis, pemicu, kematangan TPT",
       "fields": [
        {
         "k": "auto_hari_arv_skr",
         "l": "Hari mulai ARV → skrining TB",
         "t": "auto",
         "fn": "hari_arv_skr"
        },
        {
         "k": "auto_hari_skr_dx",
         "l": "Hari skrining → keputusan diagnostik",
         "t": "auto",
         "fn": "hari_skr_dx"
        },
        {
         "k": "auto_hari_arv_tpt",
         "l": "Hari mulai ARV → mulai TPT",
         "t": "auto",
         "fn": "hari_arv_tpt"
        },
        {
         "k": "auto_hari_layak_tpt",
         "l": "Hari kelayakan → mulai TPT",
         "t": "auto",
         "fn": "hari_layak_tpt"
        },
        {
         "k": "auto_kelompok",
         "l": "Kelompok sampel (otomatis)",
         "t": "auto",
         "fn": "kelompok"
        },
        {
         "k": "auto_cek_B",
         "l": "Cek isian (otomatis)",
         "t": "auto",
         "fn": "cek_B"
        },
        {
         "k": "auto_pemicu_B",
         "l": "Pemicu pendalaman (otomatis)",
         "t": "auto",
         "fn": "pemicu_B"
        },
        {
         "k": "auto_tpt_matang",
         "l": "Kematangan TPT (otomatis)",
         "t": "auto",
         "fn": "tpt_matang"
        },
        {
         "k": "auto_cp7",
         "l": "CP7 penilaian (otomatis)",
         "t": "auto",
         "fn": "cp7"
        },
        {
         "k": "auto_cp2",
         "l": "CP2 penilaian (otomatis)",
         "t": "auto",
         "fn": "cp2"
        }
       ]
      },
      {
       "type": "fields",
       "id": "P",
       "title": "P · Pendalaman (unit purposif atau ada pemicu)",
       "fields": [
        {
         "k": "P01",
         "l": "P01 Durasi pendalaman (menit)",
         "t": "number",
         "h": "Berlaku: A dan B"
        },
        {
         "k": "P04",
         "l": "P04 Pemeriksaan diagnostik TB: jenis dan hasil",
         "t": "textarea",
         "st": true,
         "src": true,
         "so": [
          "Y",
          "TL",
          "TC",
          "TBL",
          "BD"
         ],
         "h": "Berlaku: A dan B"
        },
        {
         "k": "P05",
         "l": "P05 Tanggal pemeriksaan diminta",
         "t": "date",
         "h": "Berlaku: A dan B"
        },
        {
         "k": "P06",
         "l": "P06 Tanggal spesimen dikirim",
         "t": "date",
         "h": "Berlaku: A dan B"
        },
        {
         "k": "P07",
         "l": "P07 Tanggal spesimen diperiksa",
         "t": "date",
         "h": "Berlaku: A dan B"
        },
        {
         "k": "P08",
         "l": "P08 Tanggal hasil diterima fasyankes",
         "t": "date",
         "h": "Berlaku: A dan B"
        },
        {
         "k": "P09",
         "l": "P09 Tanggal hasil disampaikan kepada pasien",
         "t": "date",
         "h": "Berlaku: A dan B"
        },
        {
         "k": "P13",
         "l": "P13 Kunjungan HIV 6 bulan pertama: jumlah kunjungan",
         "t": "number",
         "h": "Atau sampai 30/06/2026 Berlaku: B"
        },
        {
         "k": "P14",
         "l": "P14 Kunjungan dengan skrining TB tercatat",
         "t": "text",
         "h": "Tidak boleh melebihi P13 Berlaku: B"
        },
        {
         "k": "P15",
         "l": "P15 Kelengkapan daftar kunjungan",
         "t": "select",
         "o": [
          "Lengkap",
          "Sebagian",
          "Belum diakses"
         ],
         "h": "Berlaku: B"
        },
        {
         "k": "P16",
         "l": "P16 Obat TPT diambil dari target (contoh 10 dari 12 dosis mingguan)",
         "t": "text",
         "st": true,
         "src": true,
         "so": [
          "Y",
          "TL",
          "TC",
          "TBL",
          "BD"
         ],
         "h": "Berlaku: B"
        },
        {
         "k": "P17",
         "l": "P17 Efek samping, pergantian paduan, dan respons",
         "t": "textarea",
         "st": true,
         "src": true,
         "so": [
          "Y",
          "TL",
          "TC",
          "TBL",
          "BD"
         ],
         "h": "Berlaku: B"
        },
        {
         "k": "P18",
         "l": "P18 Dukungan pengobatan: kebutuhan dan yang diterima",
         "t": "textarea",
         "st": true,
         "src": true,
         "so": [
          "Y",
          "TL",
          "TC",
          "TBL",
          "BD"
         ],
         "h": "Berlaku: A dan B"
        },
        {
         "k": "P21",
         "l": "P21 Konteks yang menjelaskan pelayanan (bila tercatat dan relevan)",
         "t": "textarea",
         "st": true,
         "src": true,
         "so": [
          "Y",
          "TL",
          "TC",
          "TBL",
          "BD"
         ],
         "h": "Contoh: kehamilan, penahanan, biaya, dukungan komunitas Berlaku: A dan B"
        },
        {
         "k": "P22",
         "l": "P22 Mekanisme yang ditemukan penelaah",
         "t": "textarea",
         "h": "Fakta dan dugaan dibedakan Berlaku: A dan B"
        }
       ],
       "collapsed": true,
       "note": "Wajib untuk unit purposif dan untuk unit acak yang memunculkan pemicu. Unit acak tanpa pemicu tidak perlu pendalaman."
      },
      {
       "type": "table",
       "id": "sumber",
       "k": "sumber",
       "title": "Sumber yang dibuka untuk unit ini",
       "cols": [
        {
         "k": "kode_sumber",
         "l": "Kode sumber (RM1, TB1, LAB1, ...)",
         "t": "text"
        },
        {
         "k": "jenis_sumber",
         "l": "Jenis sumber",
         "t": "select",
         "o": [
          "RM",
          "TB",
          "HIV",
          "LAB",
          "FAR",
          "TPT",
          "RUJ",
          "KOM",
          "SITB",
          "SIHA",
          "LAIN"
         ]
        },
        {
         "k": "fasilitas_atau_lokasi",
         "l": "Fasilitas atau lokasi (kode)",
         "t": "text"
        },
        {
         "k": "tahap_perjalanan",
         "l": "Tahap perjalanan",
         "t": "select",
         "o": [
          "Sebelum fasyankes sampel",
          "Di fasyankes sampel",
          "Sesudah fasyankes sampel"
         ]
        },
        {
         "k": "lokator_nonidentitas",
         "l": "Lokator nonidentitas (tanggal catatan, halaman)",
         "t": "textarea"
        },
        {
         "k": "akses",
         "l": "Akses",
         "t": "select",
         "o": [
          "Lengkap",
          "Sebagian",
          "Belum diakses",
          "Tidak ditemukan"
         ]
        },
        {
         "k": "petugas_penghubung_cara",
         "l": "Petugas penghubung, cara akses, tenggat",
         "t": "text"
        },
        {
         "k": "keterangan",
         "l": "Keterangan",
         "t": "textarea"
        }
       ],
       "note": "Kode sumber: W keterangan petugas; RM rekam medis; TB kartu/register TB; HIV ikhtisar/register HIV; LAB; FAR farmasi; TPT; RUJ rujukan; KOM komunitas; SITB; SIHA; LAIN. Beri nomor bila lebih dari satu (RM1, RM2)."
      },
      {
       "type": "table",
       "id": "rujukan",
       "k": "rujukan",
       "title": "Kejadian rujukan (isi bila T01 = Ya)",
       "cols": [
        {
         "k": "layanan",
         "l": "Layanan",
         "t": "select",
         "o": [
          "TB",
          "ARV",
          "TPT",
          "Diagnostik",
          "Lainnya"
         ]
        },
        {
         "k": "asal",
         "l": "Asal (kode fasilitas)",
         "t": "text"
        },
        {
         "k": "tujuan",
         "l": "Tujuan (kode fasilitas)",
         "t": "text"
        },
        {
         "k": "tanggal_rujuk",
         "l": "Tanggal rujuk",
         "t": "date"
        },
        {
         "k": "tanggal_hadir_di_tujuan",
         "l": "Tanggal hadir di tujuan",
         "t": "date"
        },
        {
         "k": "pelayanan_di_tujuan_dan",
         "l": "Pelayanan di tujuan dan tanggal",
         "t": "text"
        },
        {
         "k": "tanggal_umpan_balik_ke_a",
         "l": "Tanggal umpan balik ke asal",
         "t": "date"
        },
        {
         "k": "status",
         "l": "Status",
         "t": "select",
         "o": [
          "Y",
          "TL",
          "TC",
          "TBL",
          "BD"
         ]
        },
        {
         "k": "sumber",
         "l": "Sumber (kode)",
         "t": "text"
        }
       ],
       "when": {
        "k": "T01",
        "eq": "Ya"
       }
      },
      {
       "type": "table",
       "id": "interupsi",
       "k": "interupsi",
       "title": "Kejadian interupsi (isi bila T02 = Ya)",
       "cols": [
        {
         "k": "layanan",
         "l": "Layanan",
         "t": "select",
         "o": [
          "TB",
          "ARV",
          "TPT",
          "TB dan ARV",
          "ARV dan TPT"
         ]
        },
        {
         "k": "jenis",
         "l": "Jenis",
         "t": "select",
         "o": [
          "Kunjungan terlewat",
          "Interupsi"
         ]
        },
        {
         "k": "tanggal_jadwal_terlewat",
         "l": "Tanggal jadwal terlewat atau obat terakhir",
         "t": "date"
        },
        {
         "k": "alasan_tercatat",
         "l": "Alasan tercatat",
         "t": "textarea"
        },
        {
         "k": "upaya_penelusuran_dan_ta",
         "l": "Upaya penelusuran dan tanggal",
         "t": "text"
        },
        {
         "k": "tanggal_kembali_berobat",
         "l": "Tanggal kembali berobat",
         "t": "date"
        },
        {
         "k": "fasilitas_tempat_kembali",
         "l": "Fasilitas tempat kembali (kode)",
         "t": "text"
        },
        {
         "k": "status",
         "l": "Status",
         "t": "select",
         "o": [
          "Y",
          "TL",
          "TC",
          "TBL",
          "BD"
         ]
        },
        {
         "k": "sumber",
         "l": "Sumber (kode)",
         "t": "text"
        }
       ],
       "when": {
        "k": "T02",
        "eq": "Ya"
       },
       "note": "Bila TB dan ARV (atau ARV dan TPT) terputus bersamaan dengan tanggal obat terakhir yang sama, catat satu baris dengan layanan gabungan."
      },
      {
       "type": "photos",
       "id": "foto",
       "title": "Foto pendukung (opsional)",
       "note": "Foto dikompres otomatis. Potong dan tutup (blur) nama, NIK, nomor RM, alamat, atau wajah sebelum mengunggah."
      }
     ]
    },
    {
     "id": "C3CP3",
     "frame": "CP3",
     "title": "CP3 · Penetapan status HIV pada episode TB",
     "sections": [
      {
       "type": "fields",
       "id": "CP3",
       "title": "Penelusuran status HIV episode TB (tingkat register: kartu/register TB, register lab/KTS, SITB)",
       "note": "Mekanisme: 'Pelayanan' = kesenjangan pada penawaran atau pelaksanaan tes; 'Pencatatan' = tes/status terdokumentasi di sumber tetapi kosong/berbeda di SITB (teruskan ke C5/WP3); 'Belum dapat dipastikan' = bukti tidak cukup.",
       "fields": [
        {
         "k": "R_B",
         "l": "Kode unit (dari C2b)",
         "t": "text",
         "pre": "unit_code",
         "h": "Salin dari C2b; contoh BLL-RS-A007"
        },
        {
         "k": "R_C",
         "l": "Pilihan di C2b",
         "t": "select",
         "o": [
          "Acak inti",
          "Purposif inti",
          "Pengganti acak",
          "Pengganti purposif",
          "Tambahan 2026 acak",
          "Tambahan 2026 purposif",
          "Pengganti berurutan (cadangan habis)"
         ],
         "pre": "selection"
        },
        {
         "k": "R_D",
         "l": "Status HIV di daftar C2a",
         "t": "select",
         "o": [
          "Positif",
          "Negatif",
          "Tidak diketahui",
          "Kosong"
         ],
         "pre": "hiv_status"
        },
        {
         "k": "R_E",
         "l": "Tanggal diagnosis TB",
         "t": "date",
         "pre": "tb_dx_date"
        },
        {
         "k": "R_F",
         "l": "Tes HIV ditawarkan",
         "t": "select",
         "o": [
          "Ya",
          "Menolak",
          "Tidak ditawarkan (terdokumentasi)",
          "TC",
          "TBL (sudah diketahui positif)"
         ]
        },
        {
         "k": "R_G",
         "l": "Tanggal penawaran",
         "t": "date"
        },
        {
         "k": "R_H",
         "l": "Tes HIV dilakukan",
         "t": "select",
         "o": [
          "Ya",
          "Tidak",
          "TC",
          "TBL (sudah diketahui positif)"
         ]
        },
        {
         "k": "R_I",
         "l": "Tanggal tes atau dokumentasi diagnosis terdahulu",
         "t": "date"
        },
        {
         "k": "R_J",
         "l": "Tempat tes",
         "t": "select",
         "o": [
          "Fasyankes ini",
          "Fasyankes lain",
          "Diagnosis terdahulu terdokumentasi",
          "TC"
         ]
        },
        {
         "k": "R_K",
         "l": "Hasil tes HIV menurut sumber",
         "t": "select",
         "o": [
          "Positif",
          "Negatif",
          "Tidak tercatat"
         ]
        },
        {
         "k": "R_L",
         "l": "Status HIV di SITB saat telaah",
         "t": "select",
         "o": [
          "Positif",
          "Negatif",
          "Kosong",
          "Tidak diketahui",
          "Belum dicek"
         ]
        },
        {
         "k": "R_M",
         "l": "Alasan tidak dites (tercatat)",
         "t": "textarea"
        },
        {
         "k": "R_N",
         "l": "Sumber (kode: TB, LAB, KTS, SITB)",
         "t": "text"
        },
        {
         "k": "R_O",
         "l": "Kode penelaah",
         "t": "text",
         "pre": "user_code"
        },
        {
         "k": "R_P",
         "l": "Tanggal telaah",
         "t": "date",
         "pre": "today"
        },
        {
         "k": "R_Q",
         "l": "Durasi (menit)",
         "t": "number"
        },
        {
         "k": "R_R",
         "l": "Catatan",
         "t": "textarea"
        },
        {
         "k": "auto_cp3_mek",
         "l": "Mekanisme (otomatis)",
         "t": "auto",
         "fn": "cp3_mek"
        },
        {
         "k": "auto_hari_dx_tes",
         "l": "Hari diagnosis TB → tes",
         "t": "auto",
         "fn": "hari_dx_tes"
        }
       ]
      },
      {
       "type": "photos",
       "id": "foto",
       "title": "Foto pendukung (opsional)",
       "note": "Foto dikompres otomatis. Potong dan tutup (blur) nama, NIK, nomor RM, alamat, atau wajah sebelum mengunggah."
      }
     ]
    }
   ]
  },
  "C4": {
   "title": "C4 Penilaian fasilitas dan 14 CP",
   "unit": "fac",
   "sub": [
    {
     "id": "C4",
     "title": "Penilaian fasilitas dan 14 CP",
     "sections": [
      {
       "type": "fields",
       "id": "identitas",
       "title": "A · Identitas dan profil fungsi fasilitas",
       "fields": [
        {
         "k": "kode_fasyankes_rca",
         "l": "Kode fasyankes RCA (dari C2b)",
         "t": "text",
         "pre": "facility_code"
        },
        {
         "k": "kode_kab_kota",
         "l": "Kode kab/kota",
         "t": "text",
         "pre": "kk_code"
        },
        {
         "k": "jenis_fasyankes",
         "l": "Jenis fasyankes",
         "t": "select",
         "o": [
          "Puskesmas",
          "RS",
          "Klinik",
          "Klinik Lapas/Rutan",
          "Lain"
         ]
        },
        {
         "k": "kepemilikan_kelas_rs",
         "l": "Kepemilikan / kelas RS",
         "t": "text"
        },
        {
         "k": "fasilitas_sentinel",
         "l": "Fasilitas sentinel (C5)",
         "t": "select",
         "o": [
          "Ya",
          "Tidak"
         ],
         "pre": "sentinel_yn"
        },
        {
         "k": "tanggal_kunjungan",
         "l": "Tanggal kunjungan (mulai)",
         "t": "date"
        },
        {
         "k": "tanggal_kunjungan_2",
         "l": "Tanggal kunjungan (selesai)",
         "t": "date"
        },
        {
         "k": "tim",
         "l": "Tim (kode)",
         "t": "text"
        },
        {
         "k": "pendamping_kemenkes_swg_dinkes",
         "l": "Pendamping Kemenkes/SWG/Dinkes",
         "t": "text"
        },
        {
         "k": "model_layanan_tb_hiv",
         "l": "Model layanan TB-HIV",
         "t": "select",
         "o": [
          "Terpisah, rujukan internal",
          "Terpadu satu atap (OSS)",
          "TB-HIV dipusatkan di poli TB selama pengobatan",
          "Lain"
         ]
        },
        {
         "k": "jadwal_layanan_tb",
         "l": "Jadwal layanan TB (hari/jam)",
         "t": "text"
        },
        {
         "k": "jadwal_layanan_pdp",
         "l": "Jadwal layanan PDP (hari/jam)",
         "t": "text"
        },
        {
         "k": "penanggung_jawab_tb_pdp_sitb_s",
         "l": "Penanggung jawab TB / PDP / SITB / SIHA / farmasi (jabatan)",
         "t": "text"
        },
        {
         "k": "tenaga_terlatih_tb_hiv_dan_mut",
         "l": "Tenaga terlatih TB-HIV dan mutasi penting 2024–2026 (tanggal)",
         "t": "textarea"
        },
        {
         "k": "volume_2025_tb_hiv_odhiv_baru",
         "l": "Volume 2025 (dari C1, dikonfirmasi): TB-HIV / ODHIV baru ART / ODHIV dalam ART / kasus TB",
         "t": "textarea"
        },
        {
         "k": "pembiayaan_layanan",
         "l": "Pembiayaan layanan (JKN, APBD, program, biaya pasien)",
         "t": "text"
        },
        {
         "k": "waktu_kerja_tim_alur_dokumen_s",
         "l": "Waktu kerja tim (menit): alur / dokumen-stok / diagnostik-pencatatan / observasi / wawancara / matriks",
         "t": "textarea"
        }
       ]
      },
      {
       "type": "matrix",
       "id": "layanan",
       "k": "layanan",
       "title": "A1 · Layanan yang tersedia (konfirmasi dengan petugas dan dokumen)",
       "rows": [
        {
         "k": "poli_klaster_tb",
         "l": "Poli/klaster TB (TB SO)"
        },
        {
         "k": "pengobatan_tb_ro",
         "l": "Pengobatan TB RO"
        },
        {
         "k": "layanan_pdp_arv",
         "l": "Layanan PDP/ARV"
        },
        {
         "k": "tes_hiv",
         "l": "Tes HIV (pasien TB)"
        },
        {
         "k": "tpt",
         "l": "TPT (6H/3HP/3HR)"
        },
        {
         "k": "tcm",
         "l": "TCM (on-site)"
        },
        {
         "k": "bta_mikroskopis",
         "l": "BTA mikroskopis"
        },
        {
         "k": "lf_lam",
         "l": "LF-LAM"
        },
        {
         "k": "rontgen_dada",
         "l": "Rontgen dada"
        },
        {
         "k": "cd4",
         "l": "CD4"
        },
        {
         "k": "viral_load",
         "l": "Viral load (pengambilan/pemeriksaan)"
        },
        {
         "k": "rawat_inap",
         "l": "Rawat inap"
        },
        {
         "k": "farmasi_oat_arv_tpt",
         "l": "Farmasi OAT, ARV, TPT"
        },
        {
         "k": "pendamping_komunitas_tb_hiv",
         "l": "Pendamping komunitas TB/HIV"
        },
        {
         "k": "layanan_bagi_warga_binaan",
         "l": "Layanan bagi warga binaan (jejaring Lapas/Rutan)"
        }
       ],
       "cols": [
        {
         "k": "tersedia_di_fasilitas",
         "l": "Tersedia di fasilitas",
         "t": "select",
         "o": [
          "Ya",
          "Tidak"
         ]
        },
        {
         "k": "melalui_rujukan_ke",
         "l": "Melalui rujukan ke (kode)",
         "t": "text"
        },
        {
         "k": "sejak_perubahan_2024_2026",
         "l": "Sejak/perubahan 2024–2026",
         "t": "text"
        },
        {
         "k": "kode_bukti",
         "l": "Kode bukti",
         "t": "text"
        }
       ]
      },
      {
       "type": "table",
       "id": "dugaan",
       "k": "dugaan",
       "title": "A3 · Dugaan dari C1 yang diuji di fasyankes ini",
       "cols": [
        {
         "k": "dugaan_penyebab_awal",
         "l": "Dugaan penyebab awal (C1)",
         "t": "textarea"
        },
        {
         "k": "cp_terkait",
         "l": "CP terkait",
         "t": "text"
        },
        {
         "k": "bukti_yang_akan_dicari",
         "l": "Bukti yang akan dicari",
         "t": "textarea"
        },
        {
         "k": "hasil_akhir",
         "l": "Hasil akhir",
         "t": "select",
         "o": [
          "Didukung",
          "Dibantah",
          "Belum cukup bukti"
         ]
        },
        {
         "k": "bukti_penentu",
         "l": "Bukti penentu (kode)",
         "t": "textarea"
        },
        {
         "k": "penjelasan_alternatif_yang",
         "l": "Penjelasan alternatif yang diperiksa",
         "t": "textarea"
        }
       ],
       "note": "Salin dugaan penyebab awal dari C1 (tombol \"Ambil dari C1\"). Dugaan yang dibantah sama pentingnya dengan yang didukung.",
       "max": 4,
       "prefill": "c1_dugaan"
      },
      {
       "type": "table",
       "id": "alur",
       "k": "alur",
       "title": "B · Peta alur pelayanan dan pembagian tanggung jawab",
       "cols": [
        {
         "k": "jalur",
         "l": "Jalur",
         "t": "text"
        },
        {
         "k": "langkah",
         "l": "Langkah",
         "t": "text"
        },
        {
         "k": "titik_layanan_unit",
         "l": "Titik layanan/unit",
         "t": "text"
        },
        {
         "k": "petugas_penanggung_jawab",
         "l": "Petugas penanggung jawab",
         "t": "text"
        },
        {
         "k": "pencatatan",
         "l": "Pencatatan (formulir, SITB/SIHA)",
         "t": "textarea"
        },
        {
         "k": "serah_terima_ke_langkah_be",
         "l": "Serah terima ke langkah berikut",
         "t": "text"
        },
        {
         "k": "hambatan_yang_disebut_diam",
         "l": "Hambatan yang disebut/diamati",
         "t": "textarea"
        },
        {
         "k": "kode_bukti",
         "l": "Kode bukti",
         "t": "textarea"
        }
       ],
       "note": "Tiga jalur: (1) pasien TB ke tes HIV dan ARV; (2) ODHIV ke skrining TB, pemeriksaan, dan TPT; (3) rujukan keluar-masuk. Foto sketsa didaftarkan di Daftar bukti."
      },
      {
       "type": "matrix",
       "id": "dokumen",
       "k": "dokumen",
       "title": "D1 · SOP dan dokumen",
       "rows": [
        {
         "k": "alur_sop_tes_hiv_pada_pasien_t",
         "l": "Alur/SOP tes HIV pada pasien TB"
        },
        {
         "k": "alur_sop_skrining_tb_di_layana",
         "l": "Alur/SOP skrining TB di layanan HIV"
        },
        {
         "k": "alur_pemeriksaan_tb_pada_odhiv",
         "l": "Alur pemeriksaan TB pada ODHIV (TCM/LF-LAM/rontgen)"
        },
        {
         "k": "sop_inisiasi_arv_pada_pasien_t",
         "l": "SOP inisiasi ARV pada pasien TB"
        },
        {
         "k": "sop_algoritme_tpt",
         "l": "SOP/algoritme TPT (kelayakan, paduan, pemantauan)"
        },
        {
         "k": "sop_rujukan_dan_umpan_balik",
         "l": "SOP rujukan dan umpan balik (internal dan eksternal)"
        },
        {
         "k": "sop_pelacakan_pasien_mangkir_p",
         "l": "SOP pelacakan pasien mangkir/putus"
        },
        {
         "k": "sop_pencatatan_sitb_siha_dan_v",
         "l": "SOP pencatatan SITB/SIHA dan validasi data"
        },
        {
         "k": "prosedur_pencatatan_dan_telaah",
         "l": "Prosedur pencatatan dan telaah kematian"
        },
        {
         "k": "sk_tim_jejaring_tb_hiv_atau_dp",
         "l": "SK tim/jejaring TB-HIV atau DPPM"
        }
       ],
       "cols": [
        {
         "k": "ada",
         "l": "Ada",
         "t": "select",
         "o": [
          "Ya",
          "Tidak"
         ]
        },
        {
         "k": "tanggal_berlaku_revisi",
         "l": "Tanggal berlaku/revisi",
         "t": "date"
        },
        {
         "k": "sesuai_praktik_yang_diamat",
         "l": "Sesuai praktik yang diamati",
         "t": "select",
         "o": [
          "Ya",
          "Sebagian",
          "Tidak",
          "BD"
         ]
        },
        {
         "k": "kode_bukti",
         "l": "Kode bukti",
         "t": "text"
        }
       ]
      },
      {
       "type": "matrix",
       "id": "stok",
       "k": "stok",
       "title": "D2 · Ketersediaan obat dan bahan",
       "rows": [
        {
         "k": "oat_tb_so",
         "l": "OAT TB SO"
        },
        {
         "k": "arv_lini_pertama",
         "l": "ARV lini pertama (termasuk DTG)"
        },
        {
         "k": "inh",
         "l": "INH (TPT)"
        },
        {
         "k": "rifapentin_3hp",
         "l": "Rifapentin/3HP"
        },
        {
         "k": "kotrimoksazol",
         "l": "Kotrimoksazol"
        },
        {
         "k": "reagen_tes_hiv",
         "l": "Reagen tes HIV"
        },
        {
         "k": "cartridge_tcm",
         "l": "Cartridge TCM"
        },
        {
         "k": "lf_lam",
         "l": "LF-LAM"
        },
        {
         "k": "pot_dahak_media_transport_spes",
         "l": "Pot dahak/media transport spesimen"
        }
       ],
       "cols": [
        {
         "k": "stok_saat_kunjungan",
         "l": "Stok saat kunjungan",
         "t": "select",
         "o": [
          "Ada",
          "Kosong"
         ]
        },
        {
         "k": "hari_tanpa_stok",
         "l": "Hari tanpa stok (3 bulan terakhir)",
         "t": "text"
        },
        {
         "k": "kekosongan_2024_jun_2026",
         "l": "Kekosongan 2024–Jun 2026 (tanggal, lama)",
         "t": "text"
        },
        {
         "k": "kode_bukti",
         "l": "Kode bukti",
         "t": "text"
        }
       ],
       "note": "Kartu stok atau catatan elektronik yang sah. Ingatan petugas dicatat sebagai keterangan belum terverifikasi (W)."
      },
      {
       "type": "matrix",
       "id": "d3",
       "k": "d3",
       "title": "D3 · Diagnostik dan pengiriman spesimen",
       "rows": [
        {
         "k": "lokasi_tcm_terdekat_dan_cara_p",
         "l": "Lokasi TCM terdekat dan cara pengiriman"
        },
        {
         "k": "waktu_tunggu_hasil_yang_biasa",
         "l": "Waktu tunggu hasil yang biasa (hari) dan bukti"
        },
        {
         "k": "gangguan_alat_cartridge_2024_2",
         "l": "Gangguan alat/cartridge 2024–2026 (tanggal)"
        },
        {
         "k": "akses_cd4_dan_viral_load",
         "l": "Akses CD4 dan viral load"
        }
       ],
       "cols": [
        {
         "k": "isian",
         "l": "Isian",
         "t": "textarea"
        },
        {
         "k": "kode_bukti",
         "l": "Kode bukti",
         "t": "text"
        }
       ]
      },
      {
       "type": "matrix",
       "id": "d4",
       "k": "d4",
       "title": "D4 · Pencatatan dan pelaporan",
       "rows": [
        {
         "k": "siapa_mengentri_sitb_dan_siha",
         "l": "Siapa mengentri SITB dan SIHA; dari sumber apa; frekuensi entri"
        },
        {
         "k": "cara_status_arv_pasien_tb_dipe",
         "l": "Cara status ARV pasien TB diperbarui di SITB (dan status TB di SIHA)"
        },
        {
         "k": "tunggakan_entri_atau_perubahan",
         "l": "Tunggakan entri atau perubahan sistem 2025–2026 (tanggal)"
        },
        {
         "k": "validasi_data_bersama_tb_dan_h",
         "l": "Validasi data bersama TB dan HIV (frekuensi, notulen)"
        },
        {
         "k": "penanda_masalah_data_untuk_c5",
         "l": "Penanda masalah data untuk C5 atau WP3"
        }
       ],
       "cols": [
        {
         "k": "isian",
         "l": "Isian",
         "t": "textarea"
        },
        {
         "k": "kode_bukti",
         "l": "Kode bukti",
         "t": "text"
        }
       ]
      },
      {
       "type": "matrix",
       "id": "d5",
       "k": "d5",
       "title": "D5 · Privasi, kerahasiaan, dan akses",
       "rows": [
        {
         "k": "ruang_konseling_tes_hiv_yang_m",
         "l": "Ruang konseling/tes HIV yang menjaga privasi"
        },
        {
         "k": "penanda_status_hiv_terlihat_pa",
         "l": "Penanda status HIV terlihat pada berkas atau antrean"
        },
        {
         "k": "layanan_bagi_populasi_kunci_da",
         "l": "Layanan bagi populasi kunci dan warga binaan"
        },
        {
         "k": "biaya_yang_ditanggung_pasien",
         "l": "Biaya yang ditanggung pasien (transport, pemeriksaan)"
        }
       ],
       "cols": [
        {
         "k": "isian",
         "l": "Isian",
         "t": "textarea"
        },
        {
         "k": "kode_bukti",
         "l": "Kode bukti",
         "t": "text"
        }
       ]
      },
      {
       "type": "matrix",
       "id": "observasi",
       "k": "observasi",
       "title": "E · Observasi sesi pelayanan",
       "rows": [
        {
         "k": "tanggal_jam_durasi_jenis",
         "l": "Tanggal, jam, durasi, jenis (observasi/simulasi)"
        },
        {
         "k": "alur_pasien_yang_diamati",
         "l": "Alur pasien yang diamati (urutan titik layanan, waktu tunggu)"
        },
        {
         "k": "penawaran_tes_hiv_skrining_tb",
         "l": "Penawaran tes HIV / skrining TB / penawaran TPT"
        },
        {
         "k": "informasi_rujukan_dan_jadwal_k",
         "l": "Informasi rujukan dan jadwal kunjungan berikut"
        },
        {
         "k": "privasi_dan_kerahasiaan",
         "l": "Privasi dan kerahasiaan"
        },
        {
         "k": "pencatatan_saat_pelayanan",
         "l": "Pencatatan saat pelayanan (formulir, SITB/SIHA)"
        },
        {
         "k": "catatan_pengamat",
         "l": "Catatan pengamat"
        }
       ],
       "cols": [
        {
         "k": "e1_sesi_tb",
         "l": "E1 Sesi TB",
         "t": "textarea"
        },
        {
         "k": "e2_sesi_hiv_pdp",
         "l": "E2 Sesi HIV/PDP",
         "t": "textarea"
        },
        {
         "k": "kode_bukti",
         "l": "Kode bukti",
         "t": "text"
        }
       ],
       "note": "Sekurang-kurangnya satu sesi TB dan satu sesi HIV. Kehadiran pengamat dimintakan izin pasien (C8); bila menolak, pakai simulasi."
      },
      {
       "type": "table",
       "id": "ww_peserta",
       "k": "ww_peserta",
       "title": "F · Wawancara singkat petugas (2–3 per fasyankes)",
       "cols": [
        {
         "k": "kode_peserta",
         "l": "Kode peserta",
         "t": "text"
        },
        {
         "k": "peran",
         "l": "Peran",
         "t": "text"
        },
        {
         "k": "kesediaan_lisan_dicatat",
         "l": "Kesediaan lisan dicatat (C8)",
         "t": "select",
         "o": [
          "Ya",
          "Tidak"
         ]
        },
        {
         "k": "perekaman",
         "l": "Perekaman",
         "t": "select",
         "o": [
          "Ya",
          "Tidak"
         ]
        },
        {
         "k": "sesi_dipakai_bersama_wp6",
         "l": "Sesi dipakai bersama WP6",
         "t": "select",
         "o": [
          "Ya",
          "Tidak"
         ]
        },
        {
         "k": "catatan",
         "l": "Catatan",
         "t": "textarea"
        }
       ],
       "max": 6,
       "note": "Pertanyaan inti: Q1. Ceritakan langkah yang terjadi ketika pasien TB diketahui HIV positif di sini. Siapa melakukan apa, dan kapan pasien mulai ARV? Q2. Bagaimana ODHIV dengan skrining positif diperiksa dan bagaimana hasilnya kembali kepada petugas? Q3. Bagaimana kelayakan TPT diputuskan, dan apa yang membuat TPT ditunda atau tidak diberikan? Q4. Bagaimana pasien yang dirujuk atau mangkir diketahui sudah sampai atau kembali? Q5. Siapa mengentri SITB/SIHA, dari catatan apa, dan apa yang membuat data terlambat atau berbeda? Q6. Apa yang berubah pada 2025–2026 (petugas, alur, obat, sistem)? Kapan tepatnya? Q7. Bagaimana kematian pasien TB-HIV dicatat dan dibahas di fasilitas ini? Q8. Bila ada contoh pelayanan yang berjalan baik, apa yang membuatnya berhasil?"
      },
      {
       "type": "table",
       "id": "ww_keterangan",
       "k": "ww_keterangan",
       "title": "F · Ringkasan keterangan petugas per CP",
       "cols": [
        {
         "k": "kode_peserta",
         "l": "Kode peserta",
         "t": "text"
        },
        {
         "k": "cp",
         "l": "CP",
         "t": "text"
        },
        {
         "k": "ringkasan_keterangan",
         "l": "Ringkasan keterangan",
         "t": "textarea"
        },
        {
         "k": "perlu_diverifikasi_dengan",
         "l": "Perlu diverifikasi dengan",
         "t": "text"
        },
        {
         "k": "kode_bukti",
         "l": "Kode bukti",
         "t": "textarea"
        },
        {
         "k": "status_verifikasi",
         "l": "Status verifikasi",
         "t": "text"
        }
       ]
      },
      {
       "type": "matrix",
       "id": "matriks_cp",
       "k": "matriks_cp",
       "title": "Matriks CP · bukti minimum, status pemeriksaan, dan penilaian",
       "rows": [
        {
         "k": "CP1",
         "l": "CP1 Akses awal dari komunitas",
         "v": {
          "ro_B": "Akses awal dari komunitas",
          "ro_C": "R1",
          "ro_H": "Catatan rujukan komunitas/penjangkau ke fasyankes, atau konfirmasi tertulis tidak ada (R/X)",
          "ro_J": "Klarifikasi petugas penghubung komunitas atau Dinkes (W/X)",
          "ro_L": "Tidak ada (TBL)"
         },
         "info": {
          "q": "Mengapa individu yang dirujuk atau membutuhkan pelayanan belum datang ke fasilitas?",
          "cek": "• Catatan rujukan dari komunitas/penjangkau dan konfirmasi kedatangan\n• Jejaring dengan klinik populasi kunci, Lapas/Rutan, dan pendamping\n• Hambatan akses yang disebut komunitas (C7) atau petugas\n• Biaya, jarak, jam layanan, stigma",
          "cat": "Proporsi berhasil mengakses hanya dihitung bila ada daftar kohort rujukan yang jelas; bukti utama sering dari C7 dan Dinkes."
         },
         "pre": {
          "M3": "TBL"
         }
        },
        {
         "k": "CP2",
         "l": "CP2 Skrining TB",
         "v": {
          "ro_B": "Skrining TB",
          "ro_C": "R2",
          "ro_H": "Formulir/alat skrining di layanan HIV diperiksa (D/R)",
          "ro_J": "Observasi atau simulasi sesi HIV (O/S)",
          "ro_L": "Rekap C3 CP2 (K): terpenuhi bila ≥3 unit acak/sensus kerangka terkait telah ditelaah inti"
         },
         "info": {
          "q": "Kunjungan mana yang seharusnya mencakup skrining TB, apakah dilaksanakan, dan mengapa terlewat?",
          "cek": "• Formulir skrining di layanan HIV dan cara pengisiannya\n• Observasi sesi HIV: skrining ditanyakan atau tidak\n• Rekap C3 CP2 (B03–B04; P13–P15)\n• Kemungkinan isian otomatis atau 100% tanpa proses (C1)",
          "cat": "Cakupan per kunjungan dibedakan dari cakupan pada peserta baru ARV."
         }
        },
        {
         "k": "CP3",
         "l": "CP3 Penetapan status HIV",
         "v": {
          "ro_B": "Penetapan status HIV",
          "ro_C": "R1",
          "ro_H": "Alur tes HIV pasien TB dipetakan (D/W)",
          "ro_J": "CP3_Register 6 episode (K); di sentinel tetap dikerjakan kecuali penghitungan ulang TB/HIV-5 C5 selesai dua arah (R)",
          "ro_L": "Satu klarifikasi singkat petugas (W); wajib menurut V13 Bagian 10"
         },
         "info": {
          "q": "Mengapa status HIV pasien TB belum diketahui: penawaran, penerimaan, pelaksanaan tes, penyampaian hasil, atau pencatatan?",
          "cek": "• Siapa menawarkan tes dan di titik mana\n• Ketersediaan reagen (D2) dan petugas tes\n• Alur hasil ke poli TB dan ke SITB\n• CP3_Register C3: mekanisme pelayanan vs pencatatan",
          "cat": "Status HIV yang sudah diketahui ditetapkan berdasarkan dokumentasi diagnosis; tes ulang tidak dipersyaratkan."
         }
        },
        {
         "k": "CP4",
         "l": "CP4 Penyelesaian pemeriksaan diagnostik",
         "v": {
          "ro_B": "Penyelesaian pemeriksaan diagnostik",
          "ro_C": "R2",
          "ro_H": "Akses TCM/LF-LAM/rontgen dan waktu tunggu hasil (R/W)",
          "ro_J": "Rekap C3 CP4 (K): terpenuhi bila semua unit acak/sensus dengan skrining positif telah ditelaah; TBL bila tidak ada",
          "ro_L": "Klarifikasi alur spesimen dan umpan balik hasil (W)"
         },
         "info": {
          "q": "Di mana pemeriksaan TB pada ODHIV tertunda: permintaan, spesimen, pengiriman, hasil, atau keputusan klinis?",
          "cek": "• Akses TCM, LF-LAM, rontgen (D3)\n• Waktu dari skrining positif ke keputusan (C3 B04–B06, P04–P09)\n• Pencatatan hasil negatif maupun positif di SIHA\n• Alur rujukan spesimen dan umpan balik hasil",
          "cat": "Penyelesaian pada hari yang sama dilaporkan deskriptif, bukan satu-satunya ukuran keberhasilan."
         }
        },
        {
         "k": "CP5",
         "l": "CP5 Penilaian kelayakan TPT",
         "v": {
          "ro_B": "Penilaian kelayakan TPT",
          "ro_C": "R3",
          "ro_H": "Algoritme kelayakan TPT yang dipakai beserta versinya (D)",
          "ro_J": "Rekap C3 CP5 (K): terpenuhi bila ≥3 unit acak/sensus kerangka terkait telah ditelaah inti",
          "ro_L": "Klarifikasi petugas penilai (W)"
         },
         "info": {
          "q": "Apakah kelayakan TPT dinilai dan didokumentasikan, termasuk penyingkiran TB aktif dan alasan penundaan?",
          "cek": "• Algoritme yang dipakai dan versinya\n• Siapa menilai dan di mana dicatat\n• Rekap C3 CP5 (B08–B09): alasan ditunda/tidak layak\n• Penilaian pada ODHIV lama, bukan hanya ODHIV baru",
          "cat": "CD4 atau riwayat kontak tidak diberlakukan sebagai syarat untuk semua pasien."
         }
        },
        {
         "k": "CP6",
         "l": "CP6 Memulai atau melanjutkan ARV",
         "v": {
          "ro_B": "Memulai atau melanjutkan ARV",
          "ro_C": "R4",
          "ro_H": "Pembagian tugas poli TB dan PDP serta serah terima (D/W/O)",
          "ro_J": "Rekap C3 CP6 (K): terpenuhi bila ≥3 unit acak/sensus kerangka terkait telah ditelaah inti",
          "ro_L": "Cara status ARV diperbarui di SITB (R/W)"
         },
         "info": {
          "q": "Apakah ARV dimulai tepat waktu pada pasien yang belum ARV dan dilanjutkan pada pasien yang sudah ARV? Bila tidak, di mana alurnya terhenti?",
          "cek": "• Pembagian tugas poli TB dan PDP; serah terima pasien\n• Mekanisme menindaklanjuti pasien TB-HIV yang belum memperoleh ARV\n• Rekap C3 CP6 (A10–A12): selisih hari, alasan penundaan, tempat ARV; kesinambungan ARV pada pasien yang sudah ARV (A10b)\n• Cara status ARV diperbarui di SITB (D4)",
          "cat": "Pasien yang melanjutkan ARV dibedakan dari yang baru memulai; ketepatan waktu dinilai menurut acuan saat pelayanan (Panduan Bagian 3)."
         }
        },
        {
         "k": "CP7",
         "l": "CP7 Penawaran dan pemberian awal TPT",
         "v": {
          "ro_B": "Penawaran dan pemberian awal TPT",
          "ro_C": "R3",
          "ro_H": "Kartu stok INH/3HP 3 bulan terakhir dan kekosongan 2024–Jun 2026 (R)",
          "ro_J": "Rekap C3 CP7 (K): terpenuhi bila ≥3 unit acak/sensus kerangka terkait telah ditelaah inti",
          "ro_L": "Klarifikasi penawaran dan pemberian (W)"
         },
         "info": {
          "q": "Apakah hambatan inisiasi TPT terletak pada kelayakan, penawaran, persetujuan pasien, akses, atau ketersediaan obat?",
          "cek": "• Penawaran dan pemberian pada kunjungan yang sama\n• Stok INH/3HP (D2) dan tanggal kekosongan\n• Rekap C3 CP7 (B11–B15): selisih hari, penolakan, alasan\n• Kebijakan TPT di RS rujukan dibandingkan Puskesmas (C1)",
          "cat": "Penawaran dan pemberian awal dicatat sebagai dua tahap."
         }
        },
        {
         "k": "CP8",
         "l": "CP8 Koordinasi rujukan",
         "v": {
          "ro_B": "Koordinasi rujukan",
          "ro_C": "R4",
          "ro_H": "Register/buku rujukan dan umpan balik (R)",
          "ro_J": "Rekap C3 CP8 (K): terpenuhi bila ≥3 unit acak/sensus kerangka terkait telah ditelaah inti",
          "ro_L": "Jejaring rujukan dipetakan (D/W)"
         },
         "info": {
          "q": "Apakah rujukan dari fasilitas asal sampai, diterima, dan dilayani di tujuan, termasuk ke fasilitas di luar sampel?",
          "cek": "• Buku/register rujukan dan umpan balik\n• Konfirmasi kedatangan dalam 30 hari (C3 lembar Rujukan)\n• Jejaring RS swasta, Puskesmas, PDP, Lapas/Rutan\n• Pelayanan terverifikasi tetapi belum tercatat atau terhubung di SITB/SIHA (WP3)",
          "cat": "Penyelesaian dan waktunya disajikan menurut tujuan rujukan."
         }
        },
        {
         "k": "CP9",
         "l": "CP9 Kepatuhan dan dukungan pengobatan",
         "v": {
          "ro_B": "Kepatuhan dan dukungan pengobatan",
          "ro_C": "R4 (usulan)",
          "ro_H": "Catatan dukungan pengobatan/PMO/pendamping (R)",
          "ro_J": "Klarifikasi peran pendamping atau komunitas (W/X)",
          "ro_L": "Tidak ada (TBL)"
         },
         "info": {
          "q": "Apakah kebutuhan dukungan pengobatan dikenali dan dukungan diterima pasien?",
          "cek": "• Catatan PMO, pendamping, konseling kepatuhan, kunjungan rumah\n• Kunjungan terlewat dan respons petugas (C3 T02, P18)\n• Peran komunitas (koordinasi dengan C7)\n• Dukungan bagi penerima TPT dianalisis terpisah dari pasien TB-HIV",
          "cat": "Agenda dan daftar partisipasi WP4–WP6 dipakai bersama untuk mengurangi permintaan data berulang."
         },
         "pre": {
          "M3": "TBL"
         }
        },
        {
         "k": "CP10",
         "l": "CP10 Pemantauan dan luaran pengobatan",
         "v": {
          "ro_B": "Pemantauan dan luaran pengobatan",
          "ro_C": "R5",
          "ro_H": "Pencatatan luaran TB.03/SITB diperiksa (R)",
          "ro_J": "Rekap C3 CP10 (K): terpenuhi bila ≥3 unit acak/sensus kerangka terkait telah ditelaah inti",
          "ro_L": "Tidak ada (TBL)"
         },
         "info": {
          "q": "Apakah catatan tindak lanjut klinis dan luaran pengobatan konsisten antarlayanan, dan di mana perbedaannya muncul?",
          "cek": "• Pemeriksaan dahak follow-up dan akhir pengobatan\n• Pencatatan luaran TB.03, termasuk pindah dan meninggal\n• Rekap C3 CP10 (A13–A14) dan kesesuaian SITB (A17)\n• Dasar kategori 'pengobatan lengkap' dibandingkan 'sembuh' (C1)",
          "cat": "Pasien yang pindah atau belum diketahui statusnya tetap dicatat."
         },
         "pre": {
          "M3": "TBL"
         }
        },
        {
         "k": "CP11",
         "l": "CP11 Penyelesaian TPT",
         "v": {
          "ro_B": "Penyelesaian TPT",
          "ro_C": "R3",
          "ro_H": "Pencatatan dosis/pemantauan TPT (R)",
          "ro_J": "Rekap C3 CP11 (K): terpenuhi bila ≥3 unit acak/sensus kerangka terkait telah ditelaah inti",
          "ro_L": "Tidak ada (TBL)"
         },
         "info": {
          "q": "Apakah rangkaian TPT diselesaikan sesuai paduan; bila tidak, karena toksisitas, penghentian, pindah, atau informasi luaran tidak lengkap?",
          "cek": "• Pemantauan selama TPT dan pencatatan dosis\n• Penanganan efek samping\n• Rekap C3 CP11 (B16–B17)\n• Rangkaian dengan pengamatan belum cukup diberi BD",
          "cat": "Penilaian mengikuti paduan dan batas waktu penyelesaian pada Panduan Bagian 4.6."
         },
         "pre": {
          "M3": "TBL"
         }
        },
        {
         "k": "CP12",
         "l": "CP12 Penelusuran pasien dan kembali berobat",
         "v": {
          "ro_B": "Penelusuran pasien dan kembali berobat",
          "ro_C": "R4",
          "ro_H": "Daftar mangkir dan bukti pelacakan (R)",
          "ro_J": "Rekap C3 CP12 (K): terpenuhi bila ≥3 unit acak/sensus kerangka terkait telah ditelaah inti",
          "ro_L": "Klarifikasi petugas pelacak (W)"
         },
         "info": {
          "q": "Bagaimana pasien yang terputus dikenali, ditelusuri, dan dipastikan kembali, termasuk di fasilitas lain?",
          "cek": "• Daftar mangkir dan frekuensi pemeriksaannya\n• Upaya pelacakan tercatat dan oleh siapa\n• Kembali dalam 90 hari (C3 lembar Interupsi)\n• Verifikasi pelayanan di fasilitas lain",
          "cat": "Definisi terputus mengikuti Panduan Bagian 4.8."
         }
        },
        {
         "k": "CP13",
         "l": "CP13 Telaah kematian (proses organisasi)",
         "v": {
          "ro_B": "Telaah kematian (proses organisasi)",
          "ro_C": "R5",
          "ro_H": "Prosedur dan sumber pencatatan kematian (D/R)",
          "ro_J": "Dokumen telaah/audit kematian 2024–2026, atau konfirmasi tertulis tidak ada (D); rujuk kode kasus C6 di fasyankes ini",
          "ro_L": "Bukti tindak lanjut hasil telaah (D/W)"
         },
         "info": {
          "q": "Apakah fasilitas mengenali dan mencatat kematian pasien TB-HIV, menelaahnya, dan menindaklanjuti hasilnya?",
          "cek": "• Prosedur pencatatan kematian dan sumbernya (register kematian RS)\n• Dokumen telaah/audit kematian 2024–2026 dan pesertanya\n• Bukti tindakan perbaikan setelah telaah\n• Dugaan kematian TB-HIV yang belum dinotifikasi (RS)",
          "cat": "Unit penilaian adalah fasilitas. Telaah klinis kasus dilakukan dengan C6 (WP5)."
         }
        },
        {
         "k": "CP14",
         "l": "CP14 Retensi jangka lebih panjang",
         "v": {
          "ro_B": "Retensi jangka lebih panjang",
          "ro_C": "R4",
          "ro_H": "Rekap C3 CP14 (K): terpenuhi bila ≥3 unit acak/sensus kerangka terkait telah ditelaah inti",
          "ro_J": "Klarifikasi alur kelanjutan layanan HIV setelah TB (W)",
          "ro_L": "Tidak ada (TBL)"
         },
         "info": {
          "q": "Apakah perawatan HIV berlanjut setelah pengobatan TB selesai; bila tidak, mengapa?",
          "cek": "• Kunjungan HIV 90 dan 180 hari (±30) setelah OAT (C3 A18–A19)\n• Perpindahan pasien setelah TB selesai\n• Hambatan stigma atau akses (C7)\n• Penjadwalan kunjungan lanjutan oleh PDP",
          "cat": "Pasien yang belum mencapai durasi pengamatan tidak dimasukkan ke penyebut kegagalan retensi."
         },
         "pre": {
          "M3": "TBL"
         }
        },
        {
         "k": "R6",
         "l": "R6 Informasi dan akuntabilitas (lintas CP)",
         "v": {
          "ro_B": "Informasi dan akuntabilitas (lintas CP)",
          "ro_C": "R6",
          "ro_H": "Alur entri SITB/SIHA dan validasi bersama (D/W)",
          "ro_J": "Rekap C3 R6 (K): terpenuhi bila ≥3 unit acak/sensus kerangka terkait telah ditelaah inti",
          "ro_L": "Hasil C5 bila sentinel; TBL bila bukan sentinel"
         },
         "info": {
          "q": "Di mana pelayanan yang terjadi tidak tercatat, tercatat berbeda, atau tidak terhubung antara SITB dan SIHA, dan mengapa?",
          "cek": "• Siapa mengentri SITB/SIHA, dari sumber apa, frekuensi (D4)\n• Validasi data bersama TB dan HIV\n• Rekap C3 R6 (kesesuaian SITB/SIHA; CP3_Register 'Pencatatan')\n• Hasil penghitungan ulang C5 bila sentinel",
          "cat": "Temuan R6 diteruskan ke WP3 dan tidak dipakai untuk mengoreksi data nasional."
         },
         "pre": {
          "keberlakuan": "Penuh"
         }
        }
       ],
       "cols": [
        {
         "k": "ro_B",
         "l": "Fokus",
         "t": "ro"
        },
        {
         "k": "ro_C",
         "l": "Ranah",
         "t": "ro"
        },
        {
         "k": "keberlakuan",
         "l": "Keberlakuan",
         "t": "select",
         "o": [
          "Penuh",
          "Sebagian",
          "Hanya kewajiban rujukan",
          "Tidak berlaku"
         ]
        },
        {
         "k": "alasan_keberlakuan",
         "l": "Alasan keberlakuan",
         "t": "textarea"
        },
        {
         "k": "pj",
         "l": "Penanggung jawab layanan (jabatan)",
         "t": "text"
        },
        {
         "k": "periode",
         "l": "Periode sumber yang diperiksa",
         "t": "text"
        },
        {
         "k": "ro_H",
         "l": "M1 bukti minimum",
         "t": "ro"
        },
        {
         "k": "M1",
         "l": "M1",
         "t": "select",
         "o": [
          "Ya",
          "Tidak",
          "TBL"
         ]
        },
        {
         "k": "ro_J",
         "l": "M2 bukti minimum",
         "t": "ro"
        },
        {
         "k": "M2",
         "l": "M2",
         "t": "select",
         "o": [
          "Ya",
          "Tidak",
          "TBL"
         ]
        },
        {
         "k": "ro_L",
         "l": "M3 bukti minimum",
         "t": "ro"
        },
        {
         "k": "M3",
         "l": "M3",
         "t": "select",
         "o": [
          "Ya",
          "Tidak",
          "TBL"
         ]
        },
        {
         "k": "auto_m_status",
         "l": "Status pemeriksaan (otomatis)",
         "t": "auto",
         "fn": "m_status"
        },
        {
         "k": "kecukupan",
         "l": "Kecukupan bukti",
         "t": "select",
         "o": [
          "Memadai",
          "Terbatas",
          "Bertentangan"
         ]
        },
        {
         "k": "c3_acak_N",
         "l": "C3 acak/sensus: N",
         "t": "number",
         "c3fill": true
        },
        {
         "k": "c3_acak_n",
         "l": "C3 acak/sensus: n kesenjangan",
         "t": "number",
         "c3fill": true
        },
        {
         "k": "c3_purp_N",
         "l": "C3 purposif: N",
         "t": "number",
         "c3fill": true
        },
        {
         "k": "c3_purp_n",
         "l": "C3 purposif: n",
         "t": "number",
         "c3fill": true
        },
        {
         "k": "c3_bd",
         "l": "C3 BD",
         "t": "number",
         "c3fill": true
        },
        {
         "k": "kode_unit_contoh",
         "l": "Kode unit contoh",
         "t": "text"
        },
        {
         "k": "auto_m_saran",
         "l": "Saran klasifikasi (otomatis)",
         "t": "auto",
         "fn": "m_saran"
        },
        {
         "k": "klasifikasi",
         "l": "Klasifikasi akhir",
         "t": "select",
         "o": [
          "Terlaksana dan terverifikasi",
          "Terlaksana sebagian atau terlambat",
          "Dipastikan tidak terlaksana",
          "Belum dapat dipastikan",
          "Tidak berlaku"
         ]
        },
        {
         "k": "alasan_beda",
         "l": "Alasan bila berbeda dari saran",
         "t": "textarea"
        },
        {
         "k": "masalah",
         "l": "Masalah utama",
         "t": "textarea"
        },
        {
         "k": "praktik_baik",
         "l": "Praktik yang berjalan baik",
         "t": "textarea"
        },
        {
         "k": "faktor",
         "l": "Faktor sistem (F1–F7)",
         "t": "multi",
         "o": [
          "F1 Penyelenggaraan pelayanan",
          "F2 Tenaga kesehatan",
          "F3 Sistem informasi",
          "F4 Diagnostik",
          "F5 Obat dan teknologi lain",
          "F6 Pembiayaan",
          "F7 Kepemimpinan dan tata kelola"
         ]
        },
        {
         "k": "akses_keadilan",
         "l": "Akses/keadilan terkait",
         "t": "textarea",
         "o": [
          "Ya",
          "Tidak"
         ]
        },
        {
         "k": "dugaan",
         "l": "Dugaan penyebab",
         "t": "textarea"
        },
        {
         "k": "alternatif",
         "l": "Penjelasan alternatif yang diperiksa",
         "t": "textarea"
        },
        {
         "k": "keyakinan",
         "l": "Keyakinan",
         "t": "select",
         "o": [
          "Tinggi",
          "Sedang",
          "Rendah"
         ]
        },
        {
         "k": "kode_bukti",
         "l": "Kode bukti (Daftar_Bukti)",
         "t": "text"
        },
        {
         "k": "perlu_pendalaman",
         "l": "Perlu Pendalaman_CP",
         "t": "select",
         "o": [
          "Ya",
          "Tidak"
         ]
        },
        {
         "k": "diteruskan",
         "l": "Diteruskan ke (C5, C6, C7, WP3, Dinkes)",
         "t": "multi",
         "o": [
          "C5",
          "C6",
          "C7",
          "WP3",
          "Dinkes",
          "WP7"
         ]
        }
       ],
       "c3fill": true,
       "note": "Angka C3 disalin dari lembar Rekap_CP buku kerja C3 fasyankes yang sama (CP1 dan CP13 tidak memakai C3). n/N menggambarkan pola dalam sampel, bukan prevalensi fasilitas; acak dan purposif disajikan terpisah. Insiden terverifikasi pada unit purposif membuktikan proses tidak selalu berjalan, tetapi tidak dipakai untuk menghitung frekuensi. Saran \"terverifikasi\" hanya muncul bila kecukupan bukti Memadai dan BD lebih sedikit dari N acak/sensus."
      },
      {
       "type": "table",
       "id": "pendalaman_cp",
       "k": "pendalaman_cp",
       "title": "Pendalaman CP (hanya bila \"Perlu Pendalaman_CP\" = Ya)",
       "cols": [
        {
         "k": "cp",
         "l": "CP",
         "t": "text"
        },
        {
         "k": "pemicu_pendalaman",
         "l": "Pemicu pendalaman (kesenjangan, temuan berbeda dari dugaan, praktik baik)",
         "t": "textarea"
        },
        {
         "k": "uraian_temuan",
         "l": "Uraian temuan (fakta, dengan kode bukti)",
         "t": "textarea"
        },
        {
         "k": "rantai_sebab_yang_ditelusu",
         "l": "Rantai sebab yang ditelusuri (mengapa → mengapa)",
         "t": "textarea"
        },
        {
         "k": "faktor_sistem",
         "l": "Faktor sistem (F1–F7)",
         "t": "text"
        },
        {
         "k": "bukti_yang_mendukung",
         "l": "Bukti yang mendukung",
         "t": "textarea"
        },
        {
         "k": "bukti_yang_membantah_atau",
         "l": "Bukti yang membantah atau penjelasan alternatif",
         "t": "textarea"
        },
        {
         "k": "kapan_mulai_terjadi",
         "l": "Kapan mulai terjadi (tanggal perubahan)",
         "t": "text"
        },
        {
         "k": "keyakinan",
         "l": "Keyakinan",
         "t": "select",
         "o": [
          "Tinggi",
          "Sedang",
          "Rendah"
         ]
        },
        {
         "k": "informasi_belum_tersedia_d",
         "l": "Informasi belum tersedia dan tindak lanjut",
         "t": "textarea"
        }
       ]
      },
      {
       "type": "table",
       "id": "daftar_bukti",
       "k": "daftar_bukti",
       "title": "Daftar bukti (untuk telaah jarak jauh)",
       "cols": [
        {
         "k": "kode_bukti",
         "l": "Kode bukti (contoh BLL-RS-D01)",
         "t": "textarea"
        },
        {
         "k": "jenis",
         "l": "Jenis",
         "t": "select",
         "o": [
          "D Dokumen",
          "R Register/catatan/stok/laporan",
          "K Unit C3",
          "O Observasi",
          "S Simulasi",
          "W Wawancara singkat",
          "X Sumber luar fasilitas"
         ]
        },
        {
         "k": "uraian_singkat",
         "l": "Uraian singkat",
         "t": "textarea"
        },
        {
         "k": "cp_terkait",
         "l": "CP terkait",
         "t": "text"
        },
        {
         "k": "periode_yang_dicakup",
         "l": "Periode yang dicakup",
         "t": "text"
        },
        {
         "k": "lokasi_berkas_atau_nama_fo",
         "l": "Lokasi berkas atau nama foto",
         "t": "text"
        },
        {
         "k": "dikumpulkan_oleh_dan_tangg",
         "l": "Dikumpulkan oleh (kode) dan tanggal",
         "t": "text"
        },
        {
         "k": "keterangan",
         "l": "Keterangan",
         "t": "textarea"
        },
        {
         "k": "asal_sumber",
         "l": "Asal sumber (register, sistem, atau petugas asal; bukti dengan asal sama dihitung satu sumber)",
         "t": "textarea"
        }
       ],
       "note": "Satu baris per bukti. Foto dokumen tidak boleh memuat identitas pasien. Jenis: D dokumen; R register; K unit C3; O observasi; S simulasi; W wawancara; X sumber luar."
      },
      {
       "type": "fields",
       "id": "kesimpulan",
       "title": "J · Kesimpulan fasyankes, tindak lanjut, dan pemeriksaan mutu",
       "fields": [
        {
         "k": "tiga_temuan_utama",
         "l": "Tiga temuan utama (dengan CP dan kode bukti)",
         "t": "textarea"
        },
        {
         "k": "praktik_yang_berjalan_baik_dan",
         "l": "Praktik yang berjalan baik dan dapat dipelajari",
         "t": "textarea"
        },
        {
         "k": "hasil_uji_dugaan_c1",
         "l": "Hasil uji dugaan C1 (lembar Dugaan_C1)",
         "t": "textarea"
        },
        {
         "k": "temuan_yang_berbeda_dari_dugaa",
         "l": "Temuan yang berbeda dari dugaan awal",
         "t": "textarea"
        },
        {
         "k": "ketidaksesuaian_data_yang_dite",
         "l": "Ketidaksesuaian data yang diteruskan (C5/WP3)",
         "t": "textarea"
        },
        {
         "k": "unit_yang_diteruskan_ke_c6",
         "l": "Unit yang diteruskan ke C6",
         "t": "textarea"
        },
        {
         "k": "pertanyaan_untuk_c7",
         "l": "Pertanyaan untuk C7 (WP6)",
         "t": "textarea"
        },
        {
         "k": "informasi_yang_belum_tersedia",
         "l": "Informasi yang belum tersedia dan rencana klarifikasi jarak jauh",
         "t": "textarea"
        },
        {
         "k": "umpan_balik_lisan_kepada_fasil",
         "l": "Umpan balik lisan kepada fasilitas (tanggal, peserta)",
         "t": "textarea"
        },
        {
         "k": "diperiksa_kelengkapan_oleh_dan",
         "l": "Diperiksa kelengkapan oleh (kode) dan tanggal",
         "t": "textarea"
        },
        {
         "k": "masalah_mutu_yang_perlu_disele",
         "l": "Masalah mutu yang perlu diselesaikan (C9)",
         "t": "textarea"
        },
        {
         "k": "disetujui_koordinator_lapangan",
         "l": "Disetujui koordinator lapangan (kode) dan tanggal",
         "t": "textarea"
        }
       ]
      },
      {
       "type": "photos",
       "id": "foto",
       "title": "Foto pendukung (opsional)",
       "note": "Foto dikompres otomatis. Potong dan tutup (blur) nama, NIK, nomor RM, alamat, atau wajah sebelum mengunggah."
      }
     ]
    }
   ]
  },
  "C5": {
   "title": "C5 Verifikasi data sentinel",
   "unit": "sentinel",
   "sub": [
    {
     "id": "C5ID",
     "title": "Identitas, metode, dan sistem data",
     "sections": [
      {
       "type": "fields",
       "id": "identitas",
       "title": "Identitas sentinel, akses, dan cakupan verifikasi",
       "fields": [
        {
         "k": "kode_fasyankes_rca",
         "l": "Kode fasyankes RCA",
         "t": "text",
         "pre": "facility_code"
        },
        {
         "k": "provinsi_kab_kota",
         "l": "Provinsi / kab/kota",
         "t": "text",
         "pre": "region_text"
        },
        {
         "k": "jenis_fasyankes",
         "l": "Jenis fasyankes",
         "t": "text"
        },
        {
         "k": "alasan_penetapan_sebagai_senti",
         "l": "Alasan penetapan sebagai sentinel (V13 Bagian 8A)",
         "t": "text"
        },
        {
         "k": "alasan_bila_triwulan_bukan_tri",
         "l": "Alasan bila triwulan bukan triwulan III 2025",
         "t": "text"
        },
        {
         "k": "akses_sitb",
         "l": "Akses SITB",
         "t": "select",
         "o": [
          "Fasyankes",
          "Dinas kesehatan",
          "Belum tersedia"
         ]
        },
        {
         "k": "akses_siha",
         "l": "Akses SIHA",
         "t": "select",
         "o": [
          "Fasyankes",
          "Dinas kesehatan",
          "Belum tersedia"
         ]
        },
        {
         "k": "petugas_berwenang_pemegang_aks",
         "l": "Petugas berwenang pemegang akses (jabatan/kode)",
         "t": "text"
        },
        {
         "k": "pemeriksa_hasil_dari_tim_evalu",
         "l": "Pemeriksa hasil dari tim evaluasi (kode)",
         "t": "text"
        },
        {
         "k": "tanggal_ekspor_sitb_dan_versi",
         "l": "Tanggal ekspor SITB dan versi data",
         "t": "text"
        },
        {
         "k": "tanggal_ekspor_siha_dan_versi",
         "l": "Tanggal ekspor SIHA dan versi data",
         "t": "text"
        },
        {
         "k": "sumber_rekap_resmi_untuk_nilai",
         "l": "Sumber rekap resmi untuk nilai dilaporkan (nama berkas, tanggal)",
         "t": "textarea"
        },
        {
         "k": "register_yang_tersedia_untuk_t",
         "l": "Register yang tersedia untuk triwulan (TB, lab/KTS, ikhtisar HIV, TPT, farmasi)",
         "t": "textarea"
        },
        {
         "k": "sumber_lengkap_untuk_periode_e",
         "l": "Sumber lengkap untuk periode efektif: TB/HIV-5",
         "t": "select",
         "o": [
          "Ya",
          "Tidak"
         ]
        },
        {
         "k": "sumber_lengkap_untuk_periode_e_2",
         "l": "Sumber lengkap untuk periode efektif: TB/HIV-6",
         "t": "select",
         "o": [
          "Ya",
          "Tidak"
         ]
        },
        {
         "k": "sumber_lengkap_untuk_periode_e_3",
         "l": "Sumber lengkap untuk periode efektif: TB/HIV-4.1a",
         "t": "select",
         "o": [
          "Ya",
          "Tidak"
         ]
        },
        {
         "k": "arah_1_selesai_tb_hiv_5",
         "l": "Arah 1 (sistem ke sumber) selesai: TB/HIV-5",
         "t": "select",
         "o": [
          "Ya",
          "Tidak"
         ]
        },
        {
         "k": "arah_1_selesai_tb_hiv_6",
         "l": "Arah 1 selesai: TB/HIV-6",
         "t": "select",
         "o": [
          "Ya",
          "Tidak"
         ]
        },
        {
         "k": "arah_1_selesai_tb_hiv_4_1a",
         "l": "Arah 1 selesai: TB/HIV-4.1a",
         "t": "select",
         "o": [
          "Ya",
          "Tidak"
         ]
        },
        {
         "k": "arah_2_selesai_tb_hiv_5",
         "l": "Arah 2 (sumber ke sistem) selesai: TB/HIV-5",
         "t": "select",
         "o": [
          "Ya",
          "Tidak"
         ]
        },
        {
         "k": "arah_2_selesai_tb_hiv_6",
         "l": "Arah 2 selesai: TB/HIV-6",
         "t": "select",
         "o": [
          "Ya",
          "Tidak"
         ]
        },
        {
         "k": "arah_2_selesai_tb_hiv_4_1a",
         "l": "Arah 2 selesai: TB/HIV-4.1a",
         "t": "select",
         "o": [
          "Ya",
          "Tidak"
         ]
        },
        {
         "k": "pembatasan_karena_waktu",
         "l": "Pembatasan karena waktu (indikator dan baris yang tidak diperiksa)",
         "t": "textarea"
        },
        {
         "k": "tanggal_pelaksanaan_dan_pelaks",
         "l": "Tanggal pelaksanaan dan pelaksana",
         "t": "text"
        },
        {
         "k": "durasi_kerja_tb_hiv_5_arah_1_a",
         "l": "Durasi kerja (menit): TB/HIV-5 arah 1 / arah 2; TB/HIV-6 arah 1 / arah 2; TB/HIV-4.1a arah 1 / arah 2",
         "t": "textarea"
        }
       ]
      },
      {
       "type": "fields",
       "id": "parameter",
       "title": "Parameter periode",
       "fields": [
        {
         "k": "tw_awal",
         "l": "Awal triwulan verifikasi",
         "t": "date",
         "h": "Pilihan awal triwulan III 2025 (1 Juli–30 September 2025). Ubah bila triwulan lain dipilih dan catat alasannya."
        },
        {
         "k": "tw_akhir",
         "l": "Akhir triwulan verifikasi",
         "t": "date"
        },
        {
         "k": "tpt_akhir",
         "l": "Akhir jendela mulai TPT untuk pembilang TB/HIV-4.1a",
         "t": "date"
        }
       ]
      },
      {
       "type": "fields",
       "id": "jejak",
       "title": "C · Pemeriksaan awal ketersediaan jejak",
       "fields": [
        {
         "k": "rekam_medis_atau_simrs_memuat",
         "l": "Rekam medis atau SIMRS memuat diagnosis TB, tes HIV, ARV, TPT",
         "t": "select",
         "o": [
          "Ya",
          "Sebagian",
          "Tidak",
          "BD"
         ]
        },
        {
         "k": "farmasi_resep_kartu_stok_atau",
         "l": "Farmasi: resep, kartu stok, atau catatan pengambilan ARV, OAT, TPT",
         "t": "select",
         "o": [
          "Ya",
          "Sebagian",
          "Tidak",
          "BD"
         ]
        },
        {
         "k": "laboratorium_keluaran_atau_buk",
         "l": "Laboratorium: keluaran atau buku TCM, log reagen tes HIV, formulir permintaan",
         "t": "select",
         "o": [
          "Ya",
          "Sebagian",
          "Tidak",
          "BD"
         ]
        },
        {
         "k": "kts_atau_formulir_persetujuan",
         "l": "KTS atau formulir persetujuan tes HIV",
         "t": "select",
         "o": [
          "Ya",
          "Sebagian",
          "Tidak",
          "BD"
         ]
        },
        {
         "k": "kartu_pasien_atau_register_ker",
         "l": "Kartu pasien atau register kertas TB/HIV",
         "t": "select",
         "o": [
          "Ya",
          "Sebagian",
          "Tidak",
          "BD"
         ]
        },
        {
         "k": "catatan_pemeriksaan_awal",
         "l": "Catatan pemeriksaan awal",
         "t": "text"
        },
        {
         "k": "pencocokan_pusat_sitb_siha_sel",
         "l": "Pencocokan pusat SITB–SIHA selesai sebelum kunjungan (Ya/Tidak)",
         "t": "select",
         "o": [
          "Ya",
          "Tidak"
         ]
        },
        {
         "k": "pencocokan_pusat_tanggal_berka",
         "l": "Pencocokan pusat: tanggal, berkas, pelaksana (kode)",
         "t": "text"
        }
       ]
      },
      {
       "type": "fields",
       "id": "metode",
       "title": "D–E · Metode, periode efektif, dan model bukti per indikator",
       "fields": [
        {
         "k": "met_5",
         "l": "TB/HIV-5: Metode ditetapkan",
         "t": "select",
         "o": [
          "Sensus",
          "Satu bulan",
          "Sampel"
         ],
         "h": "Sensus bila daftar sistem ≤40; bila lebih, undi satu dari tiga bulan; bila bulan itu masih >40, gunakan sampel (target 30 per arah)."
        },
        {
         "k": "bulan_5",
         "l": "TB/HIV-5: Nomor bulan hasil undian (1/2/3 dari awal triwulan)",
         "t": "select",
         "o": [
          "1",
          "2",
          "3"
         ]
        },
        {
         "k": "u1_5",
         "l": "TB/HIV-5: U acak arah 1 (0 ≤ U < 1; bekukan angka)",
         "t": "number"
        },
        {
         "k": "model_5",
         "l": "TB/HIV-5: Model ditetapkan (A / B / C / BD)",
         "t": "select",
         "o": [
          "A",
          "B",
          "C",
          "BD"
         ],
         "h": "A: sumber independen lengkap untuk periode efektif. B: jejak sebagian. C: hanya penjelasan petugas. BD: belum dapat dipastikan."
        },
        {
         "k": "jejak_5",
         "l": "TB/HIV-5: Jejak independen indikator/periode",
         "t": "select",
         "o": [
          "Lengkap",
          "Sebagian",
          "Tidak ada",
          "BD"
         ]
        },
        {
         "k": "buktimodel_5",
         "l": "TB/HIV-5: Kode bukti penetapan model dan cakupan sumber",
         "t": "text"
        },
        {
         "k": "kerangka2_5",
         "l": "TB/HIV-5: Kode kerangka sumber arah 2 dan cakupannya",
         "t": "text"
        },
        {
         "k": "n2_5",
         "l": "TB/HIV-5: N seluruh entri kerangka sumber arah 2",
         "t": "number"
        },
        {
         "k": "u2_5",
         "l": "TB/HIV-5: U acak arah 2 (0 ≤ U < 1; bekukan angka)",
         "t": "number"
        },
        {
         "k": "lap_num_5",
         "l": "TB/HIV-5: Pembilang dilaporkan (rekap resmi periode efektif)",
         "t": "number"
        },
        {
         "k": "lap_den_5",
         "l": "TB/HIV-5: Penyebut dilaporkan (rekap resmi periode efektif)",
         "t": "number"
        },
        {
         "k": "met_6",
         "l": "TB/HIV-6: Metode ditetapkan",
         "t": "select",
         "o": [
          "Sensus",
          "Satu bulan",
          "Sampel"
         ],
         "h": "Sensus bila daftar sistem ≤40; bila lebih, undi satu dari tiga bulan; bila bulan itu masih >40, gunakan sampel (target 30 per arah)."
        },
        {
         "k": "bulan_6",
         "l": "TB/HIV-6: Nomor bulan hasil undian (1/2/3 dari awal triwulan)",
         "t": "select",
         "o": [
          "1",
          "2",
          "3"
         ]
        },
        {
         "k": "u1_6",
         "l": "TB/HIV-6: U acak arah 1 (0 ≤ U < 1; bekukan angka)",
         "t": "number"
        },
        {
         "k": "model_6",
         "l": "TB/HIV-6: Model ditetapkan (A / B / C / BD)",
         "t": "select",
         "o": [
          "A",
          "B",
          "C",
          "BD"
         ],
         "h": "A: sumber independen lengkap untuk periode efektif. B: jejak sebagian. C: hanya penjelasan petugas. BD: belum dapat dipastikan."
        },
        {
         "k": "jejak_6",
         "l": "TB/HIV-6: Jejak independen indikator/periode",
         "t": "select",
         "o": [
          "Lengkap",
          "Sebagian",
          "Tidak ada",
          "BD"
         ]
        },
        {
         "k": "buktimodel_6",
         "l": "TB/HIV-6: Kode bukti penetapan model dan cakupan sumber",
         "t": "text"
        },
        {
         "k": "kerangka2_6",
         "l": "TB/HIV-6: Kode kerangka sumber arah 2 dan cakupannya",
         "t": "text"
        },
        {
         "k": "n2_6",
         "l": "TB/HIV-6: N seluruh entri kerangka sumber arah 2",
         "t": "number"
        },
        {
         "k": "u2_6",
         "l": "TB/HIV-6: U acak arah 2 (0 ≤ U < 1; bekukan angka)",
         "t": "number"
        },
        {
         "k": "lap_num_6",
         "l": "TB/HIV-6: Pembilang dilaporkan (rekap resmi periode efektif)",
         "t": "number"
        },
        {
         "k": "lap_den_6",
         "l": "TB/HIV-6: Penyebut dilaporkan (rekap resmi periode efektif)",
         "t": "number"
        },
        {
         "k": "met_41a",
         "l": "TB/HIV-4.1a: Metode ditetapkan",
         "t": "select",
         "o": [
          "Sensus",
          "Satu bulan",
          "Sampel"
         ],
         "h": "Sensus bila daftar sistem ≤40; bila lebih, undi satu dari tiga bulan; bila bulan itu masih >40, gunakan sampel (target 30 per arah)."
        },
        {
         "k": "bulan_41a",
         "l": "TB/HIV-4.1a: Nomor bulan hasil undian (1/2/3 dari awal triwulan)",
         "t": "select",
         "o": [
          "1",
          "2",
          "3"
         ]
        },
        {
         "k": "u1_41a",
         "l": "TB/HIV-4.1a: U acak arah 1 (0 ≤ U < 1; bekukan angka)",
         "t": "number"
        },
        {
         "k": "model_41a",
         "l": "TB/HIV-4.1a: Model ditetapkan (A / B / C / BD)",
         "t": "select",
         "o": [
          "A",
          "B",
          "C",
          "BD"
         ],
         "h": "A: sumber independen lengkap untuk periode efektif. B: jejak sebagian. C: hanya penjelasan petugas. BD: belum dapat dipastikan."
        },
        {
         "k": "jejak_41a",
         "l": "TB/HIV-4.1a: Jejak independen indikator/periode",
         "t": "select",
         "o": [
          "Lengkap",
          "Sebagian",
          "Tidak ada",
          "BD"
         ]
        },
        {
         "k": "buktimodel_41a",
         "l": "TB/HIV-4.1a: Kode bukti penetapan model dan cakupan sumber",
         "t": "text"
        },
        {
         "k": "kerangka2_41a",
         "l": "TB/HIV-4.1a: Kode kerangka sumber arah 2 dan cakupannya",
         "t": "text"
        },
        {
         "k": "n2_41a",
         "l": "TB/HIV-4.1a: N seluruh entri kerangka sumber arah 2",
         "t": "number"
        },
        {
         "k": "u2_41a",
         "l": "TB/HIV-4.1a: U acak arah 2 (0 ≤ U < 1; bekukan angka)",
         "t": "number"
        },
        {
         "k": "lap_num_41a",
         "l": "TB/HIV-4.1a: Pembilang dilaporkan (rekap resmi periode efektif)",
         "t": "number"
        },
        {
         "k": "lap_den_41a",
         "l": "TB/HIV-4.1a: Penyebut dilaporkan (rekap resmi periode efektif)",
         "t": "number"
        }
       ]
      },
      {
       "type": "table",
       "id": "alur_pencatatan",
       "k": "alur_pencatatan",
       "title": "Alur pencatatan dari sumber ke SITB/SIHA dan rekap kab/kota",
       "cols": [
        {
         "k": "indikator",
         "l": "Indikator",
         "t": "select",
         "o": [
          "TB/HIV-5",
          "TB/HIV-6",
          "TB/HIV-4.1a"
         ]
        },
        {
         "k": "langkah",
         "l": "Langkah",
         "t": "text"
        },
        {
         "k": "dari",
         "l": "Dari (formulir/register)",
         "t": "text"
        },
        {
         "k": "ke",
         "l": "Ke (SITB/SIHA/rekap)",
         "t": "text"
        },
        {
         "k": "pelaksana",
         "l": "Pelaksana (jabatan)",
         "t": "text"
        },
        {
         "k": "waktu_entri_biasa",
         "l": "Waktu entri biasa (hari setelah pelayanan)",
         "t": "text"
        },
        {
         "k": "hambatan_atau_titik_rawan",
         "l": "Hambatan atau titik rawan",
         "t": "textarea"
        },
        {
         "k": "kode_bukti",
         "l": "Kode bukti",
         "t": "textarea"
        }
       ]
      },
      {
       "type": "matrix",
       "id": "sistem_data",
       "k": "sistem_data",
       "title": "Penilaian sistem pengelolaan data",
       "rows": [
        {
         "k": "q5",
         "l": "Tanggung jawab · Ada penanggung jawab tertulis untuk entri SITB dan SIHA"
        },
        {
         "k": "q6",
         "l": "Tanggung jawab · Ada pengganti bila petugas entri tidak hadir atau mutasi"
        },
        {
         "k": "q7",
         "l": "Definisi · Petugas memahami definisi pembilang dan penyebut TB/HIV-5, -6, -4.1a sesuai lembar rujukan"
        },
        {
         "k": "q8",
         "l": "Definisi · Status 'pindahan' dan 'pemberian kembali ARV' dibedakan dari peserta baru"
        },
        {
         "k": "q9",
         "l": "Formulir · Formulir/register sumber tersedia dan dipakai untuk semua pelayanan TB-HIV dan TPT"
        },
        {
         "k": "q10",
         "l": "Formulir · Hasil tes HIV pasien TB dan status ARV punya tempat pencatatan yang jelas di register TB"
        },
        {
         "k": "q11",
         "l": "Pengolahan · Ada jadwal entri rutin dan batas waktu entri"
        },
        {
         "k": "q12",
         "l": "Pengolahan · Ada pemeriksaan silang SITB–SIHA atau validasi bersama TB dan HIV"
        },
        {
         "k": "q13",
         "l": "Pengolahan · Koreksi data setelah pelaporan didokumentasikan"
        },
        {
         "k": "q14",
         "l": "Pemanfaatan · Data capaian dibahas dalam rapat fasyankes atau dengan Dinkes"
        },
        {
         "k": "q15",
         "l": "Pemanfaatan · Daftar pasien TB-HIV belum ARV atau ODHIV belum TPT dipakai untuk tindak lanjut"
        },
        {
         "k": "q16",
         "l": "Asal sumber · Ada catatan pelayanan independen dari SITB/SIHA untuk memeriksa kejadian dan butir indikator"
        },
        {
         "k": "q17",
         "l": "Cadangan data · Ada cadangan/salinan berkala SITB/SIHA dan prosedur pemulihan bila sistem tidak dapat diakses (dinilai terpisah dari sumber independen)"
        }
       ],
       "cols": [
        {
         "k": "nilai",
         "l": "Penilaian",
         "t": "select",
         "o": [
          "Ya",
          "Sebagian",
          "Tidak",
          "BD"
         ]
        },
        {
         "k": "bukti",
         "l": "Bukti (kode)",
         "t": "text"
        },
        {
         "k": "ket",
         "l": "Keterangan",
         "t": "textarea"
        }
       ],
       "note": "Ya / Sebagian / Tidak / BD dengan bukti. Keterangan petugas tanpa dokumen dicatat sebagai W."
      },
      {
       "type": "table",
       "id": "tindak_lanjut",
       "k": "tindak_lanjut",
       "title": "Pertanyaan tindak lanjut berkode (sampai 30 November 2026)",
       "cols": [
        {
         "k": "kode_pertanyaan",
         "l": "Kode pertanyaan",
         "t": "textarea"
        },
        {
         "k": "indikator",
         "l": "Indikator",
         "t": "text"
        },
        {
         "k": "kode_baris_c5",
         "l": "Kode baris C5",
         "t": "text"
        },
        {
         "k": "pertanyaan",
         "l": "Pertanyaan",
         "t": "textarea"
        },
        {
         "k": "dikirim_kepada_dan_tanggal",
         "l": "Dikirim kepada (jabatan) dan tanggal",
         "t": "text"
        },
        {
         "k": "jawaban_dan_bukti",
         "l": "Jawaban dan bukti",
         "t": "textarea"
        },
        {
         "k": "tanggal_jawaban",
         "l": "Tanggal jawaban",
         "t": "date"
        },
        {
         "k": "status",
         "l": "Status",
         "t": "select",
         "o": [
          "Selesai",
          "Belum selesai"
         ]
        }
       ]
      },
      {
       "type": "photos",
       "id": "foto",
       "title": "Foto pendukung (opsional)",
       "note": "Foto dikompres otomatis. Potong dan tutup (blur) nama, NIK, nomor RM, alamat, atau wajah sebelum mengunggah."
      }
     ]
    },
    {
     "id": "C5_5",
     "ind": "5",
     "title": "Pencocokan TB/HIV-5",
     "sections": [
      {
       "type": "table",
       "id": "cocok",
       "k": "cocok",
       "title": "Lembar pencocokan TB/HIV-5: status HIV pada episode TB baru dan kambuh",
       "cols": [
        {
         "k": "kode_baris",
         "l": "Kode baris C5",
         "t": "text"
        },
        {
         "k": "kode_unit_c3",
         "l": "Kode unit C3 bila sama",
         "t": "text"
        },
        {
         "k": "kode_pasien",
         "l": "Kode pasien (berkas penghubung)",
         "t": "text"
        },
        {
         "k": "asal",
         "l": "Asal baris",
         "t": "select",
         "o": [
          "Daftar sistem",
          "Telusur register",
          "Pencocokan pusat SITB–SIHA"
         ]
        },
        {
         "k": "ada_sistem",
         "l": "Ada di daftar sistem",
         "t": "select",
         "o": [
          "Ya",
          "Tidak"
         ]
        },
        {
         "k": "sumber_diperiksa",
         "l": "Sumber diperiksa",
         "t": "select",
         "o": [
          "Ya",
          "Sebagian",
          "Belum"
         ]
        },
        {
         "k": "ada_sumber",
         "l": "Ada di sumber",
         "t": "select",
         "o": [
          "Ya",
          "Tidak",
          "BD"
         ]
        },
        {
         "k": "kode_sumber",
         "l": "Kode sumber",
         "t": "text"
        },
        {
         "k": "tgl_sis",
         "l": "Tanggal diagnosis TB: sistem",
         "t": "date"
        },
        {
         "k": "tgl_src",
         "l": "Tanggal diagnosis TB: sumber",
         "t": "date"
        },
        {
         "k": "tipe_sis",
         "l": "Tipe pasien: sistem",
         "t": "select",
         "o": [
          "Baru",
          "Kambuh",
          "Lainnya",
          "TC"
         ]
        },
        {
         "k": "tipe_src",
         "l": "Tipe pasien: sumber",
         "t": "select",
         "o": [
          "Baru",
          "Kambuh",
          "Lainnya",
          "TC"
         ]
        },
        {
         "k": "hiv_sis",
         "l": "Status HIV: sistem",
         "t": "select",
         "o": [
          "Positif",
          "Negatif",
          "Tidak diketahui",
          "Kosong"
         ]
        },
        {
         "k": "hiv_src",
         "l": "Status HIV: sumber",
         "t": "select",
         "o": [
          "Positif",
          "Negatif",
          "Tidak diketahui",
          "Kosong"
         ]
        },
        {
         "k": "auto_D_sis",
         "l": "D sistem",
         "t": "auto",
         "fn": "c5_D_sis"
        },
        {
         "k": "auto_D_src",
         "l": "D sumber",
         "t": "auto",
         "fn": "c5_D_src"
        },
        {
         "k": "auto_N_sis",
         "l": "N sistem",
         "t": "auto",
         "fn": "c5_N_sis"
        },
        {
         "k": "auto_N_src",
         "l": "N sumber",
         "t": "auto",
         "fn": "c5_N_src"
        },
        {
         "k": "auto_status",
         "l": "Status pencocokan (otomatis)",
         "t": "auto",
         "fn": "c5_status"
        },
        {
         "k": "jenis",
         "l": "Jenis ketidaksesuaian (ditetapkan)",
         "t": "select",
         "o": [
          "Sesuai",
          "Pelayanan belum tercatat dalam sistem",
          "Entri tanpa bukti sumber",
          "Perbedaan definisi atau periode",
          "Duplikasi",
          "Perpindahan fasilitas",
          "Keterlambatan entri",
          "Perbedaan belum terselesaikan"
         ]
        },
        {
         "k": "tgl_entri",
         "l": "Tanggal entri di sistem (lokasi/waktu entri)",
         "t": "date"
        },
        {
         "k": "penjelasan",
         "l": "Penjelasan petugas",
         "t": "textarea"
        },
        {
         "k": "bukti",
         "l": "Bukti konfirmasi (kode)",
         "t": "text"
        },
        {
         "k": "konfirmasi",
         "l": "Dikonfirmasi petugas fasyankes",
         "t": "select",
         "o": [
          "Ya",
          "Tidak"
         ]
        },
        {
         "k": "tl_kode",
         "l": "Pertanyaan tindak lanjut (kode)",
         "t": "text"
        },
        {
         "k": "selesai",
         "l": "Status penyelesaian",
         "t": "select",
         "o": [
          "Selesai",
          "Belum selesai"
         ]
        },
        {
         "k": "jejak",
         "l": "Jejak independen diperiksa (model B/C)",
         "t": "select",
         "o": [
          "RM/SIMRS",
          "Farmasi (resep, kartu stok)",
          "Laboratorium (TCM, tes HIV)",
          "KTS/persetujuan tes",
          "Kartu pasien",
          "Register kertas",
          "Tidak ada jejak"
         ]
        },
        {
         "k": "hasil_jejak",
         "l": "Hasil penelusuran jejak",
         "t": "select",
         "o": [
          "Sesuai sistem",
          "Berbeda dari sistem",
          "Tidak ditemukan",
          "Tidak ada jejak"
         ]
        },
        {
         "k": "artefak",
         "l": "Artefak ditunjukkan petugas",
         "t": "select",
         "o": [
          "Ya",
          "Tidak"
         ]
        },
        {
         "k": "auto_terpilih",
         "l": "Terpilih sampel (otomatis)",
         "t": "auto",
         "fn": "c5_terpilih"
        },
        {
         "k": "no_urut2",
         "l": "No. urut pada kerangka sumber arah 2",
         "t": "number"
        },
        {
         "k": "kode_jejak",
         "l": "Kode bukti jejak independen",
         "t": "text"
        },
        {
         "k": "butir_jejak",
         "l": "Butir yang didukung jejak",
         "t": "text"
        },
        {
         "k": "auto_lengkap",
         "l": "Sumber lengkap untuk hitung (otomatis)",
         "t": "auto",
         "fn": "c5_lengkap"
        }
       ],
       "big": true,
       "note": "D = Episode TB baru atau kambuh dengan tanggal diagnosis dalam periode efektif. N = Dari D, status HIV positif atau negatif tercatat. Sumber: Register TB, register laboratorium/KTS, rekam medis bila perlu. Satu baris per episode/individu; identitas hanya di daftar kerja petugas berwenang.",
       "summary": [
        "kode_baris",
        "asal",
        "auto_status"
       ]
      },
      {
       "type": "photos",
       "id": "foto",
       "title": "Foto pendukung (opsional)",
       "note": "Foto dikompres otomatis. Potong dan tutup (blur) nama, NIK, nomor RM, alamat, atau wajah sebelum mengunggah."
      }
     ]
    },
    {
     "id": "C5_6",
     "ind": "6",
     "title": "Pencocokan TB/HIV-6",
     "sections": [
      {
       "type": "table",
       "id": "cocok",
       "k": "cocok",
       "title": "Lembar pencocokan TB/HIV-6: ARV pada episode TB-HIV baru dan kambuh",
       "cols": [
        {
         "k": "kode_baris",
         "l": "Kode baris C5",
         "t": "text"
        },
        {
         "k": "kode_unit_c3",
         "l": "Kode unit C3 bila sama",
         "t": "text"
        },
        {
         "k": "kode_pasien",
         "l": "Kode pasien (berkas penghubung)",
         "t": "text"
        },
        {
         "k": "asal",
         "l": "Asal baris",
         "t": "select",
         "o": [
          "Daftar sistem",
          "Telusur register",
          "Pencocokan pusat SITB–SIHA"
         ]
        },
        {
         "k": "ada_sistem",
         "l": "Ada di daftar sistem",
         "t": "select",
         "o": [
          "Ya",
          "Tidak"
         ]
        },
        {
         "k": "sumber_diperiksa",
         "l": "Sumber diperiksa",
         "t": "select",
         "o": [
          "Ya",
          "Sebagian",
          "Belum"
         ]
        },
        {
         "k": "ada_sumber",
         "l": "Ada di sumber",
         "t": "select",
         "o": [
          "Ya",
          "Tidak",
          "BD"
         ]
        },
        {
         "k": "kode_sumber",
         "l": "Kode sumber",
         "t": "text"
        },
        {
         "k": "tgl_sis",
         "l": "Tanggal diagnosis TB: sistem",
         "t": "date"
        },
        {
         "k": "tgl_src",
         "l": "Tanggal diagnosis TB: sumber",
         "t": "date"
        },
        {
         "k": "tipe_sis",
         "l": "Tipe pasien: sistem",
         "t": "select",
         "o": [
          "Baru",
          "Kambuh",
          "Lainnya",
          "TC"
         ]
        },
        {
         "k": "tipe_src",
         "l": "Tipe pasien: sumber",
         "t": "select",
         "o": [
          "Baru",
          "Kambuh",
          "Lainnya",
          "TC"
         ]
        },
        {
         "k": "hiv_sis",
         "l": "Status HIV: sistem",
         "t": "select",
         "o": [
          "Positif",
          "Negatif",
          "Tidak diketahui",
          "Kosong"
         ]
        },
        {
         "k": "hiv_src",
         "l": "Status HIV: sumber",
         "t": "select",
         "o": [
          "Positif",
          "Negatif",
          "Tidak diketahui",
          "Kosong"
         ]
        },
        {
         "k": "arv_sis",
         "l": "Status ARV: sistem",
         "t": "select",
         "o": [
          "Sudah ARV sebelum TB",
          "Mulai ARV selama pengobatan TB",
          "Belum ARV",
          "Tidak diketahui"
         ]
        },
        {
         "k": "arv_src",
         "l": "Status ARV: sumber",
         "t": "select",
         "o": [
          "Sudah ARV sebelum TB",
          "Mulai ARV selama pengobatan TB",
          "Belum ARV",
          "Tidak diketahui"
         ]
        },
        {
         "k": "auto_D_sis",
         "l": "D sistem",
         "t": "auto",
         "fn": "c5_D_sis"
        },
        {
         "k": "auto_D_src",
         "l": "D sumber",
         "t": "auto",
         "fn": "c5_D_src"
        },
        {
         "k": "auto_N_sis",
         "l": "N sistem",
         "t": "auto",
         "fn": "c5_N_sis"
        },
        {
         "k": "auto_N_src",
         "l": "N sumber",
         "t": "auto",
         "fn": "c5_N_src"
        },
        {
         "k": "auto_status",
         "l": "Status pencocokan (otomatis)",
         "t": "auto",
         "fn": "c5_status"
        },
        {
         "k": "jenis",
         "l": "Jenis ketidaksesuaian (ditetapkan)",
         "t": "select",
         "o": [
          "Sesuai",
          "Pelayanan belum tercatat dalam sistem",
          "Entri tanpa bukti sumber",
          "Perbedaan definisi atau periode",
          "Duplikasi",
          "Perpindahan fasilitas",
          "Keterlambatan entri",
          "Perbedaan belum terselesaikan"
         ]
        },
        {
         "k": "tgl_entri",
         "l": "Tanggal entri di sistem (lokasi/waktu entri)",
         "t": "date"
        },
        {
         "k": "penjelasan",
         "l": "Penjelasan petugas",
         "t": "textarea"
        },
        {
         "k": "bukti",
         "l": "Bukti konfirmasi (kode)",
         "t": "text"
        },
        {
         "k": "konfirmasi",
         "l": "Dikonfirmasi petugas fasyankes",
         "t": "select",
         "o": [
          "Ya",
          "Tidak"
         ]
        },
        {
         "k": "tl_kode",
         "l": "Pertanyaan tindak lanjut (kode)",
         "t": "text"
        },
        {
         "k": "selesai",
         "l": "Status penyelesaian",
         "t": "select",
         "o": [
          "Selesai",
          "Belum selesai"
         ]
        },
        {
         "k": "jejak",
         "l": "Jejak independen diperiksa (model B/C)",
         "t": "select",
         "o": [
          "RM/SIMRS",
          "Farmasi (resep, kartu stok)",
          "Laboratorium (TCM, tes HIV)",
          "KTS/persetujuan tes",
          "Kartu pasien",
          "Register kertas",
          "Tidak ada jejak"
         ]
        },
        {
         "k": "hasil_jejak",
         "l": "Hasil penelusuran jejak",
         "t": "select",
         "o": [
          "Sesuai sistem",
          "Berbeda dari sistem",
          "Tidak ditemukan",
          "Tidak ada jejak"
         ]
        },
        {
         "k": "artefak",
         "l": "Artefak ditunjukkan petugas",
         "t": "select",
         "o": [
          "Ya",
          "Tidak"
         ]
        },
        {
         "k": "auto_terpilih",
         "l": "Terpilih sampel (otomatis)",
         "t": "auto",
         "fn": "c5_terpilih"
        },
        {
         "k": "no_urut2",
         "l": "No. urut pada kerangka sumber arah 2",
         "t": "number"
        },
        {
         "k": "kode_jejak",
         "l": "Kode bukti jejak independen",
         "t": "text"
        },
        {
         "k": "butir_jejak",
         "l": "Butir yang didukung jejak",
         "t": "text"
        },
        {
         "k": "auto_lengkap",
         "l": "Sumber lengkap untuk hitung (otomatis)",
         "t": "auto",
         "fn": "c5_lengkap"
        }
       ],
       "big": true,
       "note": "D = Episode TB baru atau kambuh, tanggal diagnosis dalam periode efektif, HIV positif. N = Dari D, sudah ARV sebelum TB atau mulai ARV selama pengobatan TB. Sumber: Register TB, ikhtisar perawatan HIV/register ARV, farmasi. Satu baris per episode/individu; identitas hanya di daftar kerja petugas berwenang.",
       "summary": [
        "kode_baris",
        "asal",
        "auto_status"
       ]
      },
      {
       "type": "photos",
       "id": "foto",
       "title": "Foto pendukung (opsional)",
       "note": "Foto dikompres otomatis. Potong dan tutup (blur) nama, NIK, nomor RM, alamat, atau wajah sebelum mengunggah."
      }
     ]
    },
    {
     "id": "C5_41a",
     "ind": "41a",
     "title": "Pencocokan TB/HIV-4.1a",
     "sections": [
      {
       "type": "table",
       "id": "cocok",
       "k": "cocok",
       "title": "Lembar pencocokan TB/HIV-4.1a: inisiasi TPT pada peserta baru ARV",
       "cols": [
        {
         "k": "kode_baris",
         "l": "Kode baris C5",
         "t": "text"
        },
        {
         "k": "kode_unit_c3",
         "l": "Kode unit C3 bila sama",
         "t": "text"
        },
        {
         "k": "kode_pasien",
         "l": "Kode pasien (berkas penghubung)",
         "t": "text"
        },
        {
         "k": "asal",
         "l": "Asal baris",
         "t": "select",
         "o": [
          "Daftar sistem",
          "Telusur register",
          "Pencocokan pusat SITB–SIHA"
         ]
        },
        {
         "k": "ada_sistem",
         "l": "Ada di daftar sistem",
         "t": "select",
         "o": [
          "Ya",
          "Tidak"
         ]
        },
        {
         "k": "sumber_diperiksa",
         "l": "Sumber diperiksa",
         "t": "select",
         "o": [
          "Ya",
          "Sebagian",
          "Belum"
         ]
        },
        {
         "k": "ada_sumber",
         "l": "Ada di sumber",
         "t": "select",
         "o": [
          "Ya",
          "Tidak",
          "BD"
         ]
        },
        {
         "k": "kode_sumber",
         "l": "Kode sumber",
         "t": "text"
        },
        {
         "k": "tgl_sis",
         "l": "Tanggal mulai ARV: sistem",
         "t": "date"
        },
        {
         "k": "tgl_src",
         "l": "Tanggal mulai ARV: sumber",
         "t": "date"
        },
        {
         "k": "masuk_sis",
         "l": "Status masuk: sistem",
         "t": "select",
         "o": [
          "Baru pertama kali ARV",
          "Rujuk masuk",
          "Kembali setelah putus ARV",
          "Belum pasti"
         ]
        },
        {
         "k": "masuk_src",
         "l": "Status masuk: sumber",
         "t": "select",
         "o": [
          "Baru pertama kali ARV",
          "Rujuk masuk",
          "Kembali setelah putus ARV",
          "Belum pasti"
         ]
        },
        {
         "k": "tpt_sis",
         "l": "Tanggal mulai TPT: sistem",
         "t": "date"
        },
        {
         "k": "tpt_src",
         "l": "Tanggal mulai TPT: sumber",
         "t": "date"
        },
        {
         "k": "auto_D_sis",
         "l": "D sistem",
         "t": "auto",
         "fn": "c5_D_sis"
        },
        {
         "k": "auto_D_src",
         "l": "D sumber",
         "t": "auto",
         "fn": "c5_D_src"
        },
        {
         "k": "auto_N_sis",
         "l": "N sistem",
         "t": "auto",
         "fn": "c5_N_sis"
        },
        {
         "k": "auto_N_src",
         "l": "N sumber",
         "t": "auto",
         "fn": "c5_N_src"
        },
        {
         "k": "auto_status",
         "l": "Status pencocokan (otomatis)",
         "t": "auto",
         "fn": "c5_status"
        },
        {
         "k": "jenis",
         "l": "Jenis ketidaksesuaian (ditetapkan)",
         "t": "select",
         "o": [
          "Sesuai",
          "Pelayanan belum tercatat dalam sistem",
          "Entri tanpa bukti sumber",
          "Perbedaan definisi atau periode",
          "Duplikasi",
          "Perpindahan fasilitas",
          "Keterlambatan entri",
          "Perbedaan belum terselesaikan"
         ]
        },
        {
         "k": "tgl_entri",
         "l": "Tanggal entri di sistem (lokasi/waktu entri)",
         "t": "date"
        },
        {
         "k": "penjelasan",
         "l": "Penjelasan petugas",
         "t": "textarea"
        },
        {
         "k": "bukti",
         "l": "Bukti konfirmasi (kode)",
         "t": "text"
        },
        {
         "k": "konfirmasi",
         "l": "Dikonfirmasi petugas fasyankes",
         "t": "select",
         "o": [
          "Ya",
          "Tidak"
         ]
        },
        {
         "k": "tl_kode",
         "l": "Pertanyaan tindak lanjut (kode)",
         "t": "text"
        },
        {
         "k": "selesai",
         "l": "Status penyelesaian",
         "t": "select",
         "o": [
          "Selesai",
          "Belum selesai"
         ]
        },
        {
         "k": "jejak",
         "l": "Jejak independen diperiksa (model B/C)",
         "t": "select",
         "o": [
          "RM/SIMRS",
          "Farmasi (resep, kartu stok)",
          "Laboratorium (TCM, tes HIV)",
          "KTS/persetujuan tes",
          "Kartu pasien",
          "Register kertas",
          "Tidak ada jejak"
         ]
        },
        {
         "k": "hasil_jejak",
         "l": "Hasil penelusuran jejak",
         "t": "select",
         "o": [
          "Sesuai sistem",
          "Berbeda dari sistem",
          "Tidak ditemukan",
          "Tidak ada jejak"
         ]
        },
        {
         "k": "artefak",
         "l": "Artefak ditunjukkan petugas",
         "t": "select",
         "o": [
          "Ya",
          "Tidak"
         ]
        },
        {
         "k": "auto_terpilih",
         "l": "Terpilih sampel (otomatis)",
         "t": "auto",
         "fn": "c5_terpilih"
        },
        {
         "k": "no_urut2",
         "l": "No. urut pada kerangka sumber arah 2",
         "t": "number"
        },
        {
         "k": "kode_jejak",
         "l": "Kode bukti jejak independen",
         "t": "text"
        },
        {
         "k": "butir_jejak",
         "l": "Butir yang didukung jejak",
         "t": "text"
        },
        {
         "k": "auto_lengkap",
         "l": "Sumber lengkap untuk hitung (otomatis)",
         "t": "auto",
         "fn": "c5_lengkap"
        }
       ],
       "big": true,
       "note": "D = ODHIV yang pertama kali memulai ARV dengan tanggal mulai dalam periode efektif. N = Dari D, mulai TPT paling lambat pada akhir jendela TPT (Parameter). Sumber: Ikhtisar perawatan HIV/register ARV, register/kartu TPT, farmasi. Satu baris per episode/individu; identitas hanya di daftar kerja petugas berwenang.",
       "summary": [
        "kode_baris",
        "asal",
        "auto_status"
       ]
      },
      {
       "type": "photos",
       "id": "foto",
       "title": "Foto pendukung (opsional)",
       "note": "Foto dikompres otomatis. Potong dan tutup (blur) nama, NIK, nomor RM, alamat, atau wajah sebelum mengunggah."
      }
     ]
    }
   ]
  },
  "C6": {
   "title": "C6 Telaah kematian",
   "unit": "c6case",
   "sub": [
    {
     "id": "C6A",
     "title": "Bagian A · Kronologi",
     "sections": [
      {
       "type": "fields",
       "id": "reg",
       "title": "Data kasus (register C6)",
       "fields": [
        {
         "k": "kode_kasus",
         "l": "Kode kasus C6",
         "t": "text",
         "pre": "unit_code"
        },
        {
         "k": "kode_unit_c3",
         "l": "Kode unit C3 bila sama",
         "t": "text",
         "pre": "c3_link",
         "h": "Bila kasus juga ditelaah di C3, fakta C3 dipakai kembali; jumlah pasien tidak digandakan."
        },
        {
         "k": "kode_pasien",
         "l": "Kode pasien (kode fasyankes + kode penghubung, contoh BLL-RS-P008)",
         "t": "text",
         "pre": "patient_code"
        },
        {
         "k": "fasyankes",
         "l": "Fasyankes (kode)",
         "t": "text",
         "pre": "facility_code"
        },
        {
         "k": "pengambil",
         "l": "Pengambil data (kode)",
         "t": "text",
         "pre": "user_code"
        },
        {
         "k": "tgl_ambil",
         "l": "Tanggal pengambilan data",
         "t": "date",
         "pre": "today"
        },
        {
         "k": "durasi",
         "l": "Durasi (menit)",
         "t": "number"
        }
       ]
      },
      {
       "type": "fields",
       "id": "A1",
       "title": "A1 · Kelayakan dan identitas kasus (tanpa pengenal langsung)",
       "fields": [
        {
         "k": "sumber_daftar",
         "l": "Sumber daftar calon",
         "t": "multi",
         "o": [
          "Laporan program",
          "Register TB/HIV",
          "Register kematian RS",
          "Rawat inap/ringkasan pulang",
          "Rujukan",
          "SITB/SIHA"
         ]
        },
        {
         "k": "reg_rs_belum",
         "l": "Ditemukan dari register kematian RS dan belum dinotifikasi",
         "t": "select",
         "o": [
          "Ya",
          "Tidak"
         ]
        },
        {
         "k": "duplikasi",
         "l": "Duplikasi diperiksa",
         "t": "select",
         "o": [
          "Ya",
          "Tidak"
         ]
        },
        {
         "k": "duplikat_dari",
         "l": "Duplikat dari (kode calon)",
         "t": "text"
        },
        {
         "k": "dok_tb",
         "l": "Dokumentasi TB",
         "t": "select",
         "o": [
          "Ya",
          "Tidak"
         ]
        },
        {
         "k": "dok_hiv",
         "l": "Dokumentasi HIV",
         "t": "select",
         "o": [
          "Ya",
          "Tidak"
         ]
        },
        {
         "k": "dok_sumber",
         "l": "Sumber dokumentasi TB/HIV",
         "t": "text"
        },
        {
         "k": "mati_konf",
         "l": "Status kematian terkonfirmasi",
         "t": "select",
         "o": [
          "Ya",
          "Tidak"
         ]
        },
        {
         "k": "tgl_mati",
         "l": "Tanggal kematian",
         "t": "date"
        },
        {
         "k": "mati_sumber",
         "l": "Sumber konfirmasi kematian",
         "t": "text"
        },
        {
         "k": "periode",
         "l": "Periode",
         "t": "select",
         "o": [
          "Januari 2025–Juni 2026",
          "Perluasan 2024"
         ]
        },
        {
         "k": "umur",
         "l": "Umur saat kematian (tahun)",
         "t": "number"
        },
        {
         "k": "jk",
         "l": "Jenis kelamin",
         "t": "select",
         "o": [
          "L",
          "P"
         ]
        }
       ]
      },
      {
       "type": "table",
       "id": "A2",
       "k": "A2",
       "title": "A2 · Sumber dokumen yang diperiksa",
       "cols": [
        {
         "k": "kode",
         "l": "Kode sumber",
         "t": "text"
        },
        {
         "k": "jenis",
         "l": "Jenis (RM jalan/inap, register TB/HIV, lab, farmasi, rujukan, ringkasan pulang, dokumen kematian)",
         "t": "text"
        },
        {
         "k": "fas",
         "l": "Fasilitas (kode)",
         "t": "text"
        },
        {
         "k": "rentang",
         "l": "Rentang tanggal",
         "t": "text"
        },
        {
         "k": "akses",
         "l": "Akses",
         "t": "select",
         "o": [
          "Lengkap",
          "Sebagian",
          "Belum"
         ]
        }
       ]
      },
      {
       "type": "fields",
       "id": "A3",
       "title": "A3 · Data kunci (isi yang tercatat; beri kode sumber dan status)",
       "fields": [
        {
         "k": "gejala_tgl",
         "l": "Tanggal gejala pertama",
         "t": "date",
         "st": true,
         "src": true,
         "so": [
          "Y",
          "TL",
          "TC",
          "TBL",
          "BD"
         ]
        },
        {
         "k": "kontak_tgl",
         "l": "Tanggal kontak pertama terkait TB",
         "t": "date",
         "st": true,
         "src": true,
         "so": [
          "Y",
          "TL",
          "TC",
          "TBL",
          "BD"
         ]
        },
        {
         "k": "kontak_fas",
         "l": "Fasilitas kontak pertama",
         "t": "text"
        },
        {
         "k": "dx_tb_tgl",
         "l": "Tanggal diagnosis TB",
         "t": "date",
         "st": true,
         "src": true,
         "so": [
          "Y",
          "TL",
          "TC",
          "TBL",
          "BD"
         ]
        },
        {
         "k": "dx_tb_dasar",
         "l": "Dasar diagnosis TB",
         "t": "select",
         "o": [
          "Bakteriologis",
          "Klinis"
         ]
        },
        {
         "k": "dx_tb_lokasi",
         "l": "Lokasi TB",
         "t": "multi",
         "o": [
          "Paru",
          "Ekstraparu",
          "Meningitis/SSP"
         ],
         "h": "Meningitis/SSP memengaruhi waktu ARV"
        },
        {
         "k": "dx_tb_res",
         "l": "Resistansi",
         "t": "select",
         "o": [
          "SO",
          "RO"
         ]
        },
        {
         "k": "dx_tb_tipe",
         "l": "Tipe pasien",
         "t": "select",
         "o": [
          "Baru",
          "Kambuh",
          "Lain"
         ]
        },
        {
         "k": "dx_hiv_tgl",
         "l": "Tanggal diagnosis HIV",
         "t": "date",
         "st": true,
         "src": true,
         "so": [
          "Y",
          "TL",
          "TC",
          "TBL",
          "BD"
         ],
         "h": "Boleh sebelum 2024 bila tercatat"
        },
        {
         "k": "dx_hiv_waktu",
         "l": "Diagnosis HIV",
         "t": "select",
         "o": [
          "Sebelum episode TB",
          "Selama episode"
         ]
        },
        {
         "k": "ranap",
         "l": "Rawat inap saat awal",
         "t": "select",
         "o": [
          "Ya",
          "Tidak"
         ]
        },
        {
         "k": "stadium",
         "l": "Stadium klinis",
         "t": "text"
        },
        {
         "k": "cd4",
         "l": "CD4 (sel/µL)",
         "t": "number"
        },
        {
         "k": "cd4_tgl",
         "l": "Tanggal CD4",
         "t": "date"
        },
        {
         "k": "io_lain",
         "l": "IO lain",
         "t": "text"
        },
        {
         "k": "gizi",
         "l": "Status gizi/IMT",
         "t": "text"
        },
        {
         "k": "komorbid",
         "l": "Komorbid",
         "t": "text"
        },
        {
         "k": "oat_tgl",
         "l": "Tanggal mulai OAT",
         "t": "date",
         "h": "Tulis 'Tidak dimulai' di catatan hanya bila terdokumentasi belum pernah OAT. Kosong bila belum mulai; isi A09",
         "st": true,
         "src": true,
         "so": [
          "Y",
          "TL",
          "TC",
          "TBL",
          "BD"
         ]
        },
        {
         "k": "oat_tidak",
         "l": "OAT tidak pernah dimulai (terdokumentasi)",
         "t": "select",
         "o": [
          "Ya",
          "Tidak"
         ]
        },
        {
         "k": "oat_paduan",
         "l": "Paduan OAT",
         "t": "text"
        },
        {
         "k": "oat_perubahan",
         "l": "Perubahan/interupsi OAT",
         "t": "textarea"
        },
        {
         "k": "arv_status",
         "l": "Status ARV saat TB",
         "t": "select",
         "o": [
          "Sedang ARV",
          "Pernah ARV, terputus",
          "Belum pernah ARV",
          "Belum pasti"
         ],
         "st": true,
         "src": true,
         "so": [
          "Y",
          "TL",
          "TC",
          "TBL",
          "BD"
         ]
        },
        {
         "k": "arv_tgl",
         "l": "Tanggal mulai/ulang ARV",
         "t": "date",
         "st": true,
         "src": true,
         "so": [
          "Y",
          "TL",
          "TC",
          "TBL",
          "BD"
         ]
        },
        {
         "k": "arv_paduan",
         "l": "Paduan ARV",
         "t": "text"
        },
        {
         "k": "ppk",
         "l": "Kotrimoksazol (PPK)",
         "t": "select",
         "o": [
          "Ya",
          "Tidak"
         ]
        },
        {
         "k": "ppk_tgl",
         "l": "Tanggal PPK",
         "t": "date"
        },
        {
         "k": "vl",
         "l": "Viral load",
         "t": "text"
        },
        {
         "k": "vl_tgl",
         "l": "Tanggal VL",
         "t": "date"
        },
        {
         "k": "komplikasi",
         "l": "Komplikasi tercatat di rekam medis",
         "t": "multi",
         "o": [
          "IRIS",
          "ESO/toksisitas",
          "Interaksi obat",
          "Kegagalan terapi TB",
          "Kegagalan virologis",
          "Lainnya"
         ]
        },
        {
         "k": "komplikasi_lain",
         "l": "Komplikasi lainnya",
         "t": "text"
        },
        {
         "k": "rujukan",
         "l": "Rujukan dan kehadiran di tujuan",
         "t": "textarea"
        },
        {
         "k": "interupsi",
         "l": "Interupsi, kepatuhan, penelusuran",
         "t": "textarea"
        },
        {
         "k": "bahaya_tgl",
         "l": "Tanggal tanda bahaya pertama",
         "t": "date",
         "st": true,
         "src": true,
         "so": [
          "Y",
          "TL",
          "TC",
          "TBL",
          "BD"
         ]
        },
        {
         "k": "bahaya_respons",
         "l": "Respons terhadap perburukan",
         "t": "textarea"
        },
        {
         "k": "mati_tempat",
         "l": "Tempat kematian",
         "t": "select",
         "o": [
          "RS",
          "Fasyankes lain",
          "Rumah",
          "TC"
         ]
        },
        {
         "k": "mati_sebab",
         "l": "Sebab kematian tercatat",
         "t": "text"
        },
        {
         "k": "auto_kategori",
         "l": "Kategori waktu kematian (otomatis)",
         "t": "auto",
         "fn": "c6_kategori"
        },
        {
         "k": "auto_oat_arv",
         "l": "Hari OAT → ARV (otomatis)",
         "t": "auto",
         "fn": "c6_oat_arv"
        }
       ]
      },
      {
       "type": "table",
       "id": "kronologi",
       "k": "kronologi",
       "title": "A4 · Kronologi bertanggal",
       "note": "Satu baris per kejadian, sejak gejala atau kontak awal sampai kematian. Tahap: AD akses dan diagnosis; AT awal terapi; PM pemantauan; RJ rujukan; PB perburukan. Keterangan petugas diberi sumber W.",
       "cols": [
        {
         "k": "tgl",
         "l": "Tanggal",
         "t": "date"
        },
        {
         "k": "fas",
         "l": "Fasilitas (kode)",
         "t": "text"
        },
        {
         "k": "tahap",
         "l": "Tahap",
         "t": "select",
         "o": [
          "AD",
          "AT",
          "PM",
          "RJ",
          "PB"
         ]
        },
        {
         "k": "kejadian",
         "l": "Kejadian, temuan klinis, pemeriksaan, keputusan, terapi",
         "t": "textarea"
        },
        {
         "k": "sumber",
         "l": "Sumber",
         "t": "text"
        },
        {
         "k": "status",
         "l": "Status",
         "t": "select",
         "o": [
          "Y",
          "TL",
          "TC",
          "TBL",
          "BD"
         ]
        },
        {
         "k": "catatan",
         "l": "Catatan pengambil data",
         "t": "textarea"
        }
       ]
      },
      {
       "type": "table",
       "id": "A5",
       "k": "A5",
       "title": "A5 · Bagian yang tidak tersedia dan klarifikasi petugas",
       "cols": [
        {
         "k": "info",
         "l": "Informasi yang tidak ditemukan (dan sumber yang sudah diperiksa)",
         "t": "textarea"
        },
        {
         "k": "w",
         "l": "Keterangan petugas (W): siapa, tanggal, isi ringkas",
         "t": "textarea"
        },
        {
         "k": "dampak",
         "l": "Dampak terhadap penilaian",
         "t": "textarea"
        }
       ]
      },
      {
       "type": "fields",
       "id": "A6",
       "title": "A6 · Pemeriksaan kecukupan oleh penelaah klinis",
       "fields": [
        {
         "k": "kecukupan",
         "l": "Kecukupan kronologi",
         "t": "select",
         "o": [
          "Memadai",
          "Terbatas",
          "Tidak memadai"
         ],
         "h": "Tidak memadai: kasus dicatat sebagai keterbatasan, tidak dinilai."
        },
        {
         "k": "fase_terbatas",
         "l": "Fase yang tidak dapat dinilai (bila terbatas)",
         "t": "text"
        },
        {
         "k": "salinan",
         "l": "Salinan tanpa pengenal untuk penilaian kedua: kode berkas, oleh, tanggal",
         "t": "text"
        },
        {
         "k": "penelaah_cek",
         "l": "Penelaah klinis (kode), tanggal",
         "t": "text"
        }
       ]
      },
      {
       "type": "photos",
       "id": "foto",
       "title": "Foto pendukung (opsional)",
       "note": "Foto dikompres otomatis. Potong dan tutup (blur) nama, NIK, nomor RM, alamat, atau wajah sebelum mengunggah."
      }
     ]
    },
    {
     "id": "C6B",
     "title": "Bagian B · Penilaian pertama",
     "sections": [
      {
       "type": "fields",
       "id": "hdr",
       "title": "Penelaah 1",
       "fields": [
        {
         "k": "penelaah1",
         "l": "Penelaah 1 (kode)",
         "t": "text",
         "pre": "user_code"
        },
        {
         "k": "tgl",
         "l": "Tanggal",
         "t": "date",
         "pre": "today"
        },
        {
         "k": "durasi",
         "l": "Durasi penilaian (menit)",
         "t": "number"
        }
       ]
      },
      {
       "type": "matrix",
       "id": "B1",
       "k": "B1",
       "title": "B1 · Skor mutu pelayanan per fase",
       "rows": [
        {
         "k": "T1",
         "l": "T1 Akses dan diagnosis",
         "v": {
          "ro_cak": "Gejala dan kontak awal, pemeriksaan, penyampaian hasil, keputusan diagnosis TB dan HIV"
         }
        },
        {
         "k": "T2",
         "l": "T2 Awal terapi",
         "v": {
          "ro_cak": "Mulai OAT dan ARV, paduan dan dosis, kotrimoksazol, penundaan dan alasannya"
         }
        },
        {
         "k": "T3",
         "l": "T3 Pemantauan",
         "v": {
          "ro_cak": "Pemantauan klinis dan laboratorium TB dan HIV, tindak lanjut hasil, kepatuhan, interupsi"
         }
        },
        {
         "k": "T4",
         "l": "T4 Rujukan",
         "v": {
          "ro_cak": "Keputusan rujukan, penyelesaian, umpan balik"
         }
        },
        {
         "k": "T5",
         "l": "T5 Penanganan saat kondisi memburuk",
         "v": {
          "ro_cak": "Pengenalan tanda bahaya, eskalasi, tata laksana menjelang kematian"
         }
        }
       ],
       "cols": [
        {
         "k": "ro_cak",
         "l": "Cakupan",
         "t": "ro"
        },
        {
         "k": "skor",
         "l": "Skor 1–5 / BD",
         "t": "select",
         "o": [
          "1",
          "2",
          "3",
          "4",
          "5",
          "BD"
         ],
         "req": true
        },
        {
         "k": "alasan",
         "l": "Alasan penilaian (wajib) dan bukti (tanggal, kode sumber)",
         "t": "textarea",
         "req": true
        }
       ],
       "note": "Skala: 1 sangat buruk; 2 buruk; 3 memadai; 4 baik; 5 sangat baik; BD tidak dapat dinilai. Nilai keputusan berdasarkan informasi yang tersedia bagi petugas saat itu dan pedoman yang berlaku pada periode pelayanan."
      },
      {
       "type": "matrix",
       "id": "B2",
       "k": "B2",
       "title": "B2 · Tiga keterlambatan",
       "rows": [
        {
         "k": "d1",
         "l": "1 Mencari pelayanan (dari gejala ke kontak pertama)"
        },
        {
         "k": "d2",
         "l": "2 Mencapai layanan yang tepat (rujukan, akses, biaya, jarak)"
        },
        {
         "k": "d3",
         "l": "3 Memperoleh tata laksana memadai di fasyankes"
        }
       ],
       "cols": [
        {
         "k": "nilai",
         "l": "Penilaian",
         "t": "select",
         "o": [
          "Ada",
          "Tidak",
          "BD"
         ]
        },
        {
         "k": "bukti",
         "l": "Bukti dan perkiraan lama",
         "t": "textarea"
        }
       ]
      },
      {
       "type": "matrix",
       "id": "B3",
       "k": "B3",
       "title": "B3 · Komplikasi: diagnosis tercatat dibedakan dari interpretasi penelaah",
       "rows": [
        {
         "k": "iris_sindrom_pulih_i",
         "l": "IRIS / sindrom pulih imun"
        },
        {
         "k": "toksisitas_efek_samp",
         "l": "Toksisitas / efek samping obat"
        },
        {
         "k": "interaksi_obat",
         "l": "Interaksi obat"
        },
        {
         "k": "kegagalan_terapi_tb",
         "l": "Kegagalan terapi TB"
        },
        {
         "k": "kegagalan_virologis",
         "l": "Kegagalan virologis"
        },
        {
         "k": "infeksi_oportunistik",
         "l": "Infeksi oportunistik lain / progresi penyakit"
        }
       ],
       "cols": [
        {
         "k": "rm",
         "l": "Tercatat di RM",
         "t": "select",
         "o": [
          "Ya",
          "Tidak"
         ]
        },
        {
         "k": "interp",
         "l": "Interpretasi penelaah",
         "t": "select",
         "o": [
          "Mungkin",
          "Tidak mungkin",
          "BD"
         ]
        },
        {
         "k": "bukti",
         "l": "Bukti: hubungan waktu, obat, temuan, respons; penjelasan lain",
         "t": "textarea"
        }
       ]
      },
      {
       "type": "table",
       "id": "B4",
       "k": "B4",
       "title": "B4 · Masalah, faktor penyumbang, dan peluang perbaikan",
       "cols": [
        {
         "k": "masalah",
         "l": "Masalah klinis atau pelayanan",
         "t": "textarea"
        },
        {
         "k": "fase",
         "l": "Fase",
         "t": "select",
         "o": [
          "T1 Akses dan diagnosis",
          "T2 Awal terapi",
          "T3 Pemantauan",
          "T4 Rujukan",
          "T5 Penanganan saat kondisi memburuk"
         ]
        },
        {
         "k": "respons",
         "l": "Respons pelayanan",
         "t": "textarea"
        },
        {
         "k": "penyumbang",
         "l": "Faktor penyumbang",
         "t": "textarea"
        },
        {
         "k": "faktor",
         "l": "Faktor sistem (F1–F7)",
         "t": "multi",
         "o": [
          "F1 Penyelenggaraan pelayanan",
          "F2 Tenaga kesehatan",
          "F3 Sistem informasi",
          "F4 Diagnostik",
          "F5 Obat dan teknologi lain",
          "F6 Pembiayaan",
          "F7 Kepemimpinan dan tata kelola",
          "Faktor pasien/komunitas",
          "Keparahan penyakit"
         ]
        },
        {
         "k": "klas",
         "l": "Klasifikasi",
         "t": "select",
         "o": [
          "Terverifikasi",
          "Mungkin berperan",
          "Belum cukup bukti",
          "Bukti bertentangan"
         ]
        },
        {
         "k": "bukti",
         "l": "Bukti dan penjelasan alternatif",
         "t": "textarea"
        },
        {
         "k": "peluang",
         "l": "Peluang perbaikan dan pihak yang dapat menindaklanjuti",
         "t": "textarea"
        },
        {
         "k": "pihak",
         "l": "Pihak",
         "t": "select",
         "o": [
          "Fasyankes",
          "Dinkes kab/kota",
          "Dinkes provinsi",
          "Program nasional",
          "Komunitas",
          "Lintas sektor"
         ]
        },
        {
         "k": "keyakinan",
         "l": "Keyakinan",
         "t": "select",
         "o": [
          "Tinggi",
          "Sedang",
          "Rendah"
         ]
        }
       ],
       "note": "Klasifikasi faktor penyumbang (V13 Bagian 11): Terverifikasi; Mungkin berperan; Belum cukup bukti; Bukti bertentangan. Faktor sistem sama dengan C4."
      },
      {
       "type": "fields",
       "id": "B5",
       "title": "B5 · Sebab kematian dan kesimpulan",
       "fields": [
        {
         "k": "sebab",
         "l": "Sebab kematian tercatat dan sumbernya",
         "t": "textarea"
        },
        {
         "k": "hubungan",
         "l": "Dugaan hubungan dengan TB (bukan penetapan sebab resmi)",
         "t": "select",
         "o": [
          "Terkait TB",
          "Terkait HIV atau IO lain",
          "Sebab lain",
          "Belum dapat ditentukan"
         ]
        },
        {
         "k": "peluang",
         "l": "Peluang perbaikan pelayanan",
         "t": "select",
         "o": [
          "Ya",
          "Tidak",
          "BD"
         ],
         "req": true,
         "h": "Ya = wajib penilaian kedua."
        },
        {
         "k": "panel_q",
         "l": "Pertanyaan untuk panel",
         "t": "textarea"
        }
       ]
      }
     ],
     "blind": "reviewer2"
    },
    {
     "id": "C6C",
     "title": "C6-C · Penilaian kedua (tersamar)",
     "sections": [
      {
       "type": "fields",
       "id": "hdr",
       "title": "Penelaah 2 (penilaian kedua, tanpa melihat penilaian pertama)",
       "fields": [
        {
         "k": "kode_berkas",
         "l": "Kode berkas kronologi",
         "t": "text"
        },
        {
         "k": "penelaah2",
         "l": "Penelaah 2 (kode)",
         "t": "text",
         "pre": "user_code"
        },
        {
         "k": "tgl",
         "l": "Tanggal",
         "t": "date",
         "pre": "today"
        },
        {
         "k": "durasi",
         "l": "Durasi (menit)",
         "t": "number"
        },
        {
         "k": "pernyataan",
         "l": "Pernyataan",
         "t": "multi",
         "o": [
          "Saya tidak melihat penilaian pertama sebelum menyelesaikan lembar ini",
          "Saya tidak terlibat dalam pelayanan pasien ini"
         ],
         "req": true
        },
        {
         "k": "kecukupan",
         "l": "Kecukupan kronologi untuk dinilai",
         "t": "select",
         "o": [
          "Memadai",
          "Terbatas",
          "Tidak memadai"
         ]
        },
        {
         "k": "fase_terbatas",
         "l": "Fase terbatas",
         "t": "text"
        }
       ]
      },
      {
       "type": "matrix",
       "id": "C1",
       "k": "C1",
       "title": "C1 · Skor mutu pelayanan per fase",
       "rows": [
        {
         "k": "T1",
         "l": "T1 Akses dan diagnosis",
         "v": {
          "ro_cak": "Gejala dan kontak awal, pemeriksaan, penyampaian hasil, keputusan diagnosis TB dan HIV"
         }
        },
        {
         "k": "T2",
         "l": "T2 Awal terapi",
         "v": {
          "ro_cak": "Mulai OAT dan ARV, paduan dan dosis, kotrimoksazol, penundaan dan alasannya"
         }
        },
        {
         "k": "T3",
         "l": "T3 Pemantauan",
         "v": {
          "ro_cak": "Pemantauan klinis dan laboratorium TB dan HIV, tindak lanjut hasil, kepatuhan, interupsi"
         }
        },
        {
         "k": "T4",
         "l": "T4 Rujukan",
         "v": {
          "ro_cak": "Keputusan rujukan, penyelesaian, umpan balik"
         }
        },
        {
         "k": "T5",
         "l": "T5 Penanganan saat kondisi memburuk",
         "v": {
          "ro_cak": "Pengenalan tanda bahaya, eskalasi, tata laksana menjelang kematian"
         }
        }
       ],
       "cols": [
        {
         "k": "ro_cak",
         "l": "Cakupan",
         "t": "ro"
        },
        {
         "k": "skor",
         "l": "Skor 1–5 / BD",
         "t": "select",
         "o": [
          "1",
          "2",
          "3",
          "4",
          "5",
          "BD"
         ],
         "req": true
        },
        {
         "k": "alasan",
         "l": "Alasan penilaian (wajib) dan bukti (tanggal, kode sumber)",
         "t": "textarea",
         "req": true
        }
       ],
       "note": "Skala: 1 sangat buruk; 2 buruk; 3 memadai; 4 baik; 5 sangat baik; BD tidak dapat dinilai. Nilai keputusan berdasarkan informasi yang tersedia bagi petugas saat itu dan pedoman yang berlaku pada periode pelayanan."
      },
      {
       "type": "matrix",
       "id": "C2",
       "k": "C2",
       "title": "C2 · Tiga keterlambatan",
       "rows": [
        {
         "k": "d1",
         "l": "1 Mencari pelayanan (dari gejala ke kontak pertama)"
        },
        {
         "k": "d2",
         "l": "2 Mencapai layanan yang tepat (rujukan, akses, biaya, jarak)"
        },
        {
         "k": "d3",
         "l": "3 Memperoleh tata laksana memadai di fasyankes"
        }
       ],
       "cols": [
        {
         "k": "nilai",
         "l": "Penilaian",
         "t": "select",
         "o": [
          "Ada",
          "Tidak",
          "BD"
         ]
        },
        {
         "k": "bukti",
         "l": "Bukti dan perkiraan lama",
         "t": "textarea"
        }
       ]
      },
      {
       "type": "fields",
       "id": "C3",
       "title": "C3 · Kesimpulan",
       "fields": [
        {
         "k": "peluang",
         "l": "Peluang perbaikan pelayanan",
         "t": "select",
         "o": [
          "Ya",
          "Tidak",
          "BD"
         ],
         "req": true
        },
        {
         "k": "faktor1",
         "l": "Faktor penyumbang utama 1 (tahap T1–T5, faktor sistem F1–F7, bukti)",
         "t": "textarea"
        },
        {
         "k": "faktor2",
         "l": "Faktor penyumbang utama 2",
         "t": "textarea"
        },
        {
         "k": "faktor3",
         "l": "Faktor penyumbang utama 3",
         "t": "textarea"
        },
        {
         "k": "keyakinan",
         "l": "Keyakinan keseluruhan",
         "t": "select",
         "o": [
          "Tinggi",
          "Sedang",
          "Rendah"
         ]
        },
        {
         "k": "panel_q",
         "l": "Hal yang perlu dibahas di panel",
         "t": "textarea"
        }
       ]
      }
     ],
     "only": "reviewer2"
    },
    {
     "id": "C6P",
     "title": "Panel dan faktor penyumbang",
     "sections": [
      {
       "type": "fields",
       "id": "panel",
       "title": "Lembar panel daring penelaah klinis",
       "fields": [
        {
         "k": "tgl",
         "l": "Tanggal panel",
         "t": "date"
        },
        {
         "k": "peserta",
         "l": "Peserta (kode)",
         "t": "text"
        },
        {
         "k": "alasan",
         "l": "Alasan dibahas",
         "t": "multi",
         "o": [
          "Perbedaan penilaian",
          "Kematian dini",
          "Implikasi program luas"
         ]
        },
        {
         "k": "implikasi_luas",
         "l": "Implikasi program luas (isi)",
         "t": "select",
         "o": [
          "Ya",
          "Tidak"
         ]
        },
        {
         "k": "ringkasan",
         "l": "Ringkasan perbedaan penilaian pertama dan kedua (fase, skor, peluang perbaikan)",
         "t": "textarea"
        },
        {
         "k": "hasil",
         "l": "Hasil pembahasan",
         "t": "select",
         "o": [
          "Sepakat",
          "Sepakat setelah diskusi",
          "Tidak sepakat: kedua penilaian dipertahankan",
          "Belum dibahas"
         ]
        },
        {
         "k": "klas_akhir",
         "l": "Klasifikasi akhir faktor penyumbang (rujuk nomor masalah B4)",
         "t": "textarea"
        },
        {
         "k": "peluang_akhir",
         "l": "Peluang perbaikan akhir",
         "t": "select",
         "o": [
          "Ya",
          "Tidak",
          "BD"
         ]
        },
        {
         "k": "implikasi",
         "l": "Peluang perbaikan akhir dan implikasi program",
         "t": "textarea"
        },
        {
         "k": "pengelola",
         "l": "Pengelola program yang diundang (tidak ikut menetapkan klasifikasi)",
         "t": "text"
        }
       ]
      },
      {
       "type": "table",
       "id": "faktor",
       "k": "faktor",
       "title": "Faktor penyumbang dan peluang perbaikan (setelah panel)",
       "cols": [
        {
         "k": "no_masalah",
         "l": "No masalah",
         "t": "textarea"
        },
        {
         "k": "masalah_klinis_atau_pelaya",
         "l": "Masalah klinis atau pelayanan",
         "t": "textarea"
        },
        {
         "k": "fase",
         "l": "Fase",
         "t": "select",
         "o": [
          "T1 Akses dan diagnosis",
          "T2 Awal terapi",
          "T3 Pemantauan",
          "T4 Rujukan",
          "T5 Penanganan saat memburuk"
         ]
        },
        {
         "k": "faktor_penyumbang",
         "l": "Faktor penyumbang",
         "t": "textarea"
        },
        {
         "k": "faktor_sistem",
         "l": "Faktor sistem",
         "t": "select",
         "o": [
          "F1 Penyelenggaraan pelayanan",
          "F2 Tenaga kesehatan",
          "F3 Sistem informasi",
          "F4 Diagnostik",
          "F5 Obat dan teknologi lain",
          "F6 Pembiayaan",
          "F7 Kepemimpinan dan tata kelola",
          "Faktor pasien/komunitas",
          "Keparahan penyakit"
         ]
        },
        {
         "k": "klasifikasi",
         "l": "Klasifikasi (setelah panel)",
         "t": "select",
         "o": [
          "Terverifikasi",
          "Mungkin berperan",
          "Belum cukup bukti",
          "Bukti bertentangan"
         ]
        },
        {
         "k": "bukti_dan_penjelasan_alter",
         "l": "Bukti dan penjelasan alternatif",
         "t": "textarea"
        },
        {
         "k": "peluang_perbaikan_tindakan",
         "l": "Peluang perbaikan / tindakan",
         "t": "textarea"
        },
        {
         "k": "pihak_yang_dapat_menindakl",
         "l": "Pihak yang dapat menindaklanjuti",
         "t": "select",
         "o": [
          "Fasyankes",
          "Dinkes kab/kota",
          "Dinkes provinsi",
          "Program nasional",
          "Komunitas",
          "Lintas sektor"
         ]
        },
        {
         "k": "indikator_pemantauan",
         "l": "Indikator pemantauan",
         "t": "text"
        },
        {
         "k": "keyakinan",
         "l": "Keyakinan",
         "t": "select",
         "o": [
          "Tinggi",
          "Sedang",
          "Rendah"
         ]
        }
       ]
      }
     ],
     "coordOnly": true
    }
   ]
  },
  "C7": {
   "title": "C7 Wawancara mendalam dan diskusi kelompok",
   "unit": "c7",
   "sub": [
    {
     "id": "C7S",
     "title": "Sesi wawancara/diskusi",
     "sections": [
      {
       "type": "fields",
       "id": "daftar",
       "title": "Baris Daftar Sesi C7",
       "fields": [
        {
         "k": "kode_sesi",
         "l": "Kode sesi",
         "t": "text",
         "pre": "unit_code"
        },
        {
         "k": "kk",
         "l": "Kab/kota",
         "t": "text",
         "pre": "kk_code"
        },
        {
         "k": "sasaran",
         "l": "Informan sasaran",
         "t": "textarea",
         "pre": "target"
        },
        {
         "k": "tanggal",
         "l": "Tanggal",
         "t": "date",
         "h": "Sesi dianggap terlaksana bila Tanggal diisi."
        },
        {
         "k": "jumlah",
         "l": "Jumlah peserta",
         "t": "number"
        },
        {
         "k": "bersedia",
         "l": "Semua bersedia",
         "t": "select",
         "o": [
          "Ya",
          "Tidak"
         ]
        },
        {
         "k": "direkam",
         "l": "Direkam",
         "t": "select",
         "o": [
          "Ya",
          "Tidak"
         ]
        },
        {
         "k": "lembar_selesai",
         "l": "Lembar catatan sesi selesai",
         "t": "select",
         "o": [
          "Ya",
          "Tidak"
         ]
        },
        {
         "k": "catatan",
         "l": "Catatan (pengganti, alasan batal, perubahan metode)",
         "t": "textarea"
        },
        {
         "k": "perspektif",
         "l": "Perspektif yang benar-benar tercakup (mis. pasien putus berobat, menolak TPT, populasi kunci)",
         "t": "textarea"
        },
        {
         "k": "pengalaman",
         "l": "Pengalaman langsung, keterangan organisasi, atau keduanya",
         "t": "select",
         "o": [
          "Langsung",
          "Organisasi",
          "Keduanya"
         ]
        },
        {
         "k": "rekrutmen_gagal",
         "l": "Rekrutmen tidak berhasil (siapa, jumlah, alasan)",
         "t": "textarea"
        }
       ]
      },
      {
       "type": "fields",
       "id": "lembar",
       "title": "Lembar catatan sesi",
       "note": "Diisi pencatat dan diperiksa pewawancara paling lambat 24 jam setelah sesi. Jangan menulis nama peserta.",
       "fields": [
        {
         "k": "jenis",
         "l": "Jenis",
         "t": "select",
         "o": [
          "W",
          "F1",
          "F2"
         ]
        },
        {
         "k": "jam",
         "l": "Tanggal, jam mulai–selesai",
         "t": "text"
        },
        {
         "k": "tempat",
         "l": "Tempat atau mode",
         "t": "text"
        },
        {
         "k": "pewawancara",
         "l": "Pewawancara/fasilitator",
         "t": "text",
         "pre": "user_code"
        },
        {
         "k": "pencatat",
         "l": "Pencatat",
         "t": "text"
        },
        {
         "k": "bahasa",
         "l": "Bahasa / penerjemah",
         "t": "text"
        }
       ]
      },
      {
       "type": "table",
       "id": "peserta",
       "k": "peserta",
       "title": "Peserta (berkode, tanpa nama)",
       "note": "Kode peserta sama dengan kode sesi; untuk diskusi, kode sesi ditambah urutan duduk (misalnya BAL-F2-04). Ragu atau diam berarti tidak bersedia.",
       "cols": [
        {
         "k": "kode",
         "l": "Kode peserta",
         "t": "text"
        },
        {
         "k": "peran",
         "l": "Peran",
         "t": "text"
        },
        {
         "k": "kesediaan",
         "l": "Kesediaan lisan",
         "t": "select",
         "o": [
          "Ya",
          "Tidak"
         ]
        },
        {
         "k": "rekam",
         "l": "Izin rekam",
         "t": "select",
         "o": [
          "Ya",
          "Tidak"
         ]
        },
        {
         "k": "jalur",
         "l": "Jalur rekrutmen",
         "t": "text"
        },
        {
         "k": "pengalaman",
         "l": "Pengalaman relevan, sukarela (mis. pernah putus obat, menolak TPT, populasi kunci)",
         "t": "textarea"
        }
       ]
      },
      {
       "type": "table",
       "id": "keterangan",
       "k": "keterangan",
       "title": "Keterangan utama per pertanyaan/CP",
       "cols": [
        {
         "k": "no",
         "l": "No. pertanyaan / CP",
         "t": "text"
        },
        {
         "k": "ket",
         "l": "Keterangan utama",
         "t": "textarea"
        },
        {
         "k": "contoh",
         "l": "Contoh konkret (tanpa pengenal)",
         "t": "textarea"
        },
        {
         "k": "waktu",
         "l": "Bulan/tahun kejadian; sesudah 30/06/2026?",
         "t": "text"
        },
        {
         "k": "verifikasi",
         "l": "Perlu diverifikasi dengan",
         "t": "multi",
         "o": [
          "C3",
          "C4",
          "C5",
          "C6",
          "WP3"
         ]
        },
        {
         "k": "keyakinan",
         "l": "Keyakinan pencatat",
         "t": "select",
         "o": [
          "Tinggi",
          "Sedang",
          "Rendah"
         ]
        }
       ]
      },
      {
       "type": "fields",
       "id": "refleksi",
       "title": "Ringkasan dan refleksi",
       "fields": [
        {
         "k": "luar_dugaan",
         "l": "Hal di luar dugaan awal",
         "t": "textarea"
        },
        {
         "k": "praktik_baik",
         "l": "Praktik yang berjalan baik",
         "t": "textarea"
        },
        {
         "k": "usulan",
         "l": "Usulan perbaikan, pihak pelaksana, dan apa yang dapat menghambat pelaksanaannya",
         "t": "textarea"
        },
        {
         "k": "permintaan",
         "l": "Permintaan peserta (tidak dipakai, bantuan rujukan)",
         "t": "textarea"
        },
        {
         "k": "refleksi",
         "l": "Refleksi pewawancara (hubungan dengan peserta, gangguan, mutu rekaman)",
         "t": "textarea"
        }
       ]
      },
      {
       "type": "table",
       "id": "tema",
       "k": "tema",
       "title": "Tema dan kutipan kunci (matriks tema berkode)",
       "cols": [
        {
         "k": "tema",
         "l": "Tema",
         "t": "text"
        },
        {
         "k": "cp",
         "l": "CP / faktor terkait",
         "t": "text"
        },
        {
         "k": "kutipan",
         "l": "Kutipan kunci (tanpa pengenal)",
         "t": "textarea"
        },
        {
         "k": "catatan",
         "l": "Catatan analitik",
         "t": "textarea"
        }
       ]
      }
     ]
    },
    {
     "id": "C7K",
     "title": "Cakupan perspektif kab/kota",
     "sections": [
      {
       "type": "fields",
       "id": "cakupan",
       "title": "Cakupan perspektif kab/kota (isi setiap akhir hari)",
       "note": "Sebelum membuat klaim perbandingan antarkab/kota, pastikan perspektif dan periode yang sama tersedia di kedua kab/kota. Tema diskusi kelompok dari kab/kota berbeda (Jabar, Bali) tidak dibandingkan langsung. Bila penjelasan pesaing yang penting tidak punya perspektif pembanding, rencanakan satu wawancara tambahan dalam beban yang ada.",
       "fields": [
        {
         "k": "pengelola_program_dinkes",
         "l": "Pengelola program Dinkes",
         "t": "select",
         "o": [
          "Ya",
          "Sebagian",
          "Tidak"
         ]
        },
        {
         "k": "petugas_klinisi_tb",
         "l": "Petugas/klinisi TB",
         "t": "select",
         "o": [
          "Ya",
          "Sebagian",
          "Tidak"
         ]
        },
        {
         "k": "petugas_klinisi_hiv",
         "l": "Petugas/klinisi HIV",
         "t": "select",
         "o": [
          "Ya",
          "Sebagian",
          "Tidak"
         ]
        },
        {
         "k": "pasien_tb_hiv_dalam_peng",
         "l": "Pasien TB-HIV dalam pengobatan",
         "t": "select",
         "o": [
          "Ya",
          "Sebagian",
          "Tidak"
         ]
        },
        {
         "k": "pasien_putus_berobat_ata",
         "l": "Pasien putus berobat atau menolak TPT",
         "t": "select",
         "o": [
          "Ya",
          "Sebagian",
          "Tidak"
         ]
        },
        {
         "k": "populasi_kunci",
         "l": "Populasi kunci",
         "t": "select",
         "o": [
          "Ya",
          "Sebagian",
          "Tidak"
         ]
        },
        {
         "k": "komunitas_pendamping",
         "l": "Komunitas/pendamping",
         "t": "select",
         "o": [
          "Ya",
          "Sebagian",
          "Tidak"
         ]
        },
        {
         "k": "diskusi_petugas",
         "l": "Diskusi petugas",
         "t": "select",
         "o": [
          "Ya",
          "Sebagian",
          "Tidak"
         ]
        },
        {
         "k": "diskusi_komunitas",
         "l": "Diskusi komunitas",
         "t": "select",
         "o": [
          "Ya",
          "Sebagian",
          "Tidak"
         ]
        },
        {
         "k": "klaim_perbandingan_yang",
         "l": "Klaim perbandingan yang didukung",
         "t": "textarea"
        }
       ]
      }
     ],
     "unit": "kk"
    }
   ]
  }
 },
 "c2": {
  "frames": {
   "A": {
    "sheet": "A_TBHIV",
    "title": "Kerangka A: episode TB-HIV",
    "crit": "Kriteria: Semua episode TB (TB SO dan TB RO, semua tipe pasien) yang didiagnosis di fasyankes ini pada 1 Januari–31 Desember 2025 dengan status HIV positif, termasuk yang meninggal, putus berobat, pindah, atau belum memulai OAT.",
    "cols": [
     {
      "k": "B",
      "l": "Kode pasien*",
      "t": "text"
     },
     {
      "k": "C",
      "l": "Kode episode lokal*",
      "t": "text"
     },
     {
      "k": "D",
      "l": "Jenis kelamin",
      "t": "select",
      "o": [
       "L",
       "P"
      ]
     },
     {
      "k": "E",
      "l": "Umur (tahun)",
      "t": "number"
     },
     {
      "k": "F",
      "l": "Tanggal diagnosis TB*",
      "t": "date"
     },
     {
      "k": "G",
      "l": "Tanggal mulai OAT",
      "t": "date"
     },
     {
      "k": "H",
      "l": "Jenis TB",
      "t": "select",
      "o": [
       "TB SO",
       "TB RO"
      ]
     },
     {
      "k": "I",
      "l": "Tipe pasien",
      "t": "select",
      "o": [
       "Baru",
       "Kambuh",
       "Lainnya"
      ]
     },
     {
      "k": "J",
      "l": "Status ARV pada episode TB",
      "t": "select",
      "o": [
       "Sudah ARV sebelum TB",
       "Mulai ARV selama pengobatan TB",
       "Belum ARV",
       "Tidak diketahui"
      ]
     },
     {
      "k": "K",
      "l": "Tanggal mulai ARV (bila mulai selama pengobatan TB)",
      "t": "date"
     },
     {
      "k": "L",
      "l": "Hasil akhir pengobatan TB",
      "t": "select",
      "o": [
       "Sembuh",
       "Pengobatan lengkap",
       "Gagal",
       "Meninggal",
       "Putus berobat",
       "Pindah",
       "Tidak dievaluasi",
       "Masih berobat"
      ]
     },
     {
      "k": "M",
      "l": "Tanggal hasil akhir",
      "t": "date"
     },
     {
      "k": "N",
      "l": "Sumber baris",
      "t": "select",
      "o": [
       "Ekspor SITB",
       "Register TB",
       "Keduanya"
      ]
     },
     {
      "k": "O",
      "l": "Catatan fasyankes",
      "t": "text"
     }
    ],
    "date": "F",
    "tgl2": "G"
   },
   "B": {
    "sheet": "B_ARV",
    "title": "Kerangka B: riwayat pengobatan ARV",
    "crit": "Kriteria: Semua ODHIV yang memulai pengobatan ARV di fasyankes ini pada 1 Januari–31 Desember 2025, apa pun status masuknya (baru, rujuk masuk, kembali setelah putus, atau belum pasti), termasuk yang kemudian putus, pindah, atau meninggal.",
    "cols": [
     {
      "k": "B",
      "l": "Kode pasien*",
      "t": "text"
     },
     {
      "k": "C",
      "l": "Kode riwayat lokal*",
      "t": "text"
     },
     {
      "k": "D",
      "l": "Jenis kelamin",
      "t": "select",
      "o": [
       "L",
       "P"
      ]
     },
     {
      "k": "E",
      "l": "Umur (tahun)",
      "t": "number"
     },
     {
      "k": "F",
      "l": "Tanggal mulai ARV di fasyankes ini*",
      "t": "date"
     },
     {
      "k": "G",
      "l": "Status masuk",
      "t": "select",
      "o": [
       "Baru pertama kali ARV",
       "Rujuk masuk",
       "Kembali setelah putus ARV",
       "Belum pasti",
       "ODHIV lama (sebelum 2025)"
      ]
     },
     {
      "k": "H",
      "l": "Skrining TB saat mulai ARV",
      "t": "select",
      "o": [
       "Tercatat negatif",
       "Tercatat positif",
       "Tidak tercatat"
      ]
     },
     {
      "k": "I",
      "l": "TB aktif didiagnosis setelah mulai ARV",
      "t": "select",
      "o": [
       "Ya",
       "Tidak",
       "Tidak diketahui"
      ]
     },
     {
      "k": "J",
      "l": "TPT",
      "t": "select",
      "o": [
       "Mulai",
       "Tidak mulai",
       "Tidak memenuhi syarat",
       "Tidak diketahui"
      ]
     },
     {
      "k": "K",
      "l": "Tanggal mulai TPT",
      "t": "date"
     },
     {
      "k": "L",
      "l": "Status TPT",
      "t": "select",
      "o": [
       "Lengkap",
       "Sedang berjalan",
       "Berhenti (efek samping/TB)",
       "Putus",
       "Tidak diketahui",
       "Tidak berlaku"
      ]
     },
     {
      "k": "M",
      "l": "Status ARV per 30 Juni 2026",
      "t": "select",
      "o": [
       "Masih ARV",
       "Putus (LFU)",
       "Meninggal",
       "Rujuk keluar",
       "Berhenti",
       "Tidak diketahui"
      ]
     },
     {
      "k": "N",
      "l": "Sumber baris",
      "t": "select",
      "o": [
       "Ekspor SIHA",
       "Register ARV",
       "Keduanya"
      ]
     },
     {
      "k": "O",
      "l": "Catatan fasyankes",
      "t": "text"
     }
    ],
    "date": "F"
   },
   "CP3": {
    "sheet": "CP3_TB",
    "title": "Kerangka CP3: episode TB untuk penetapan status HIV",
    "crit": "Kriteria: Semua episode TB (semua jenis dan tipe pasien) yang didiagnosis di fasyankes ini pada 1 Januari–31 Desember 2025, apa pun status HIV-nya (positif, negatif, tidak diketahui, atau kosong).",
    "cols": [
     {
      "k": "B",
      "l": "Kode pasien*",
      "t": "text"
     },
     {
      "k": "C",
      "l": "Kode episode lokal*",
      "t": "text"
     },
     {
      "k": "D",
      "l": "Jenis kelamin",
      "t": "select",
      "o": [
       "L",
       "P"
      ]
     },
     {
      "k": "E",
      "l": "Umur (tahun)",
      "t": "number"
     },
     {
      "k": "F",
      "l": "Tanggal diagnosis TB*",
      "t": "date"
     },
     {
      "k": "G",
      "l": "Jenis TB",
      "t": "select",
      "o": [
       "TB SO",
       "TB RO"
      ]
     },
     {
      "k": "H",
      "l": "Tipe pasien",
      "t": "select",
      "o": [
       "Baru",
       "Kambuh",
       "Lainnya"
      ]
     },
     {
      "k": "I",
      "l": "Status HIV tercatat",
      "t": "select",
      "o": [
       "Positif",
       "Negatif",
       "Tidak diketahui",
       "Kosong"
      ]
     },
     {
      "k": "J",
      "l": "Tanggal tes HIV (bila ada)",
      "t": "date"
     },
     {
      "k": "K",
      "l": "Sumber baris",
      "t": "select",
      "o": [
       "Ekspor SITB",
       "Register TB",
       "Keduanya"
      ]
     },
     {
      "k": "L",
      "l": "Catatan fasyankes",
      "t": "text"
     }
    ],
    "date": "F"
   }
  },
  "opts": {
   "SelOpt": [
    "Purposif inti",
    "Purposif perluasan",
    "Pengganti acak",
    "Pengganti purposif",
    "Tambahan 2026 acak",
    "Tambahan 2026 purposif",
    "Cadangan",
    "Pengganti berurutan (cadangan habis)"
   ],
   "Alasan": [
    "P1 Interupsi atau putus",
    "P2 Keterlambatan",
    "P3 Ketidaksesuaian data",
    "P4 Pelayanan berhasil",
    "P5 Meninggal",
    "P6 Status HIV tidak diketahui/kosong",
    "P7 Lainnya (tulis)",
    "P8 ODHIV lama: TPT"
   ],
   "Akses": [
    "Tersedia",
    "Sebagian",
    "Belum tersedia",
    "Tidak ditemukan"
   ],
   "Telaah": [
    "Belum",
    "Berlangsung",
    "Selesai",
    "Tidak berhasil"
   ]
  },
  "angka_acak": {
   "DLS|1|A": 0.6106,
   "DLS|1|B": 0.4125,
   "DLS|1|CP3": 0.8918,
   "DLS|2|A": 0.6521,
   "DLS|2|B": 0.6114,
   "DLS|2|CP3": 0.7561,
   "MDN|1|A": 0.4228,
   "MDN|1|B": 0.994,
   "MDN|1|CP3": 0.1392,
   "MDN|2|A": 0.1112,
   "MDN|2|B": 0.9401,
   "MDN|2|CP3": 0.1548,
   "JTI|1|A": 0.479,
   "JTI|1|B": 0.8545,
   "JTI|1|CP3": 0.703,
   "JTI|2|A": 0.2066,
   "JTI|2|B": 0.967,
   "JTI|2|CP3": 0.4706,
   "JPS|1|A": 0.6138,
   "JPS|1|B": 0.3687,
   "JPS|1|CP3": 0.5621,
   "JPS|2|A": 0.7149,
   "JPS|2|B": 0.2478,
   "JPS|2|CP3": 0.6036,
   "IDM|1|A": 0.8025,
   "IDM|1|B": 0.2811,
   "IDM|1|CP3": 0.7485,
   "IDM|2|A": 0.4555,
   "IDM|2|B": 0.9878,
   "IDM|2|CP3": 0.8409,
   "BGR|1|A": 0.0974,
   "BGR|1|B": 0.9353,
   "BGR|1|CP3": 0.0441,
   "BGR|2|A": 0.0497,
   "BGR|2|B": 0.3209,
   "BGR|2|CP3": 0.9928,
   "SDA|1|A": 0.2717,
   "SDA|1|B": 0.1206,
   "SDA|1|CP3": 0.7045,
   "SDA|2|A": 0.8028,
   "SDA|2|B": 0.0802,
   "SDA|2|CP3": 0.1721,
   "SBY|1|A": 0.2382,
   "SBY|1|B": 0.0406,
   "SBY|1|CP3": 0.6485,
   "SBY|2|A": 0.303,
   "SBY|2|B": 0.5293,
   "SBY|2|CP3": 0.2651,
   "BLL|1|A": 0.61,
   "BLL|1|B": 0.3599,
   "BLL|1|CP3": 0.4997,
   "BLL|2|A": 0.8261,
   "BLL|2|B": 0.5966,
   "BLL|2|CP3": 0.8064,
   "BDG|1|A": 0.4912,
   "BDG|1|B": 0.7985,
   "BDG|1|CP3": 0.0675,
   "BDG|2|A": 0.1833,
   "BDG|2|B": 0.2545,
   "BDG|2|CP3": 0.4962,
   "KJP|1|A": 0.3701,
   "KJP|1|B": 0.777,
   "KJP|1|CP3": 0.7463,
   "KJP|2|A": 0.3861,
   "KJP|2|B": 0.9776,
   "KJP|2|CP3": 0.4605,
   "KBJ|1|A": 0.3328,
   "KBJ|1|B": 0.8616,
   "KBJ|1|CP3": 0.5992,
   "KBJ|2|A": 0.8453,
   "KBJ|2|B": 0.1123,
   "KBJ|2|CP3": 0.9063
  },
  "c6_calon_cols": [
   {
    "k": "kk",
    "l": "Kab/kota",
    "t": "select",
    "o": [
     "DLS",
     "MDN",
     "JTI",
     "JPS",
     "IDM",
     "BGR",
     "SDA",
     "SBY",
     "BLL",
     "BDG",
     "KJP",
     "KBJ"
    ]
   },
   {
    "k": "fasyankes",
    "l": "Fasyankes (kode RCA)",
    "t": "text"
   },
   {
    "k": "kode_calon",
    "l": "Kode calon",
    "t": "text"
   },
   {
    "k": "kode_pasien",
    "l": "Kode pasien (kode fasyankes + kode penghubung, contoh BLL-RS-P008)",
    "t": "text"
   },
   {
    "k": "sumber",
    "l": "Sumber daftar",
    "t": "select",
    "o": [
     "Laporan program daerah",
     "Register TB",
     "Register HIV/ARV",
     "Register kematian RS",
     "Catatan rawat inap",
     "Ringkasan pulang",
     "Dokumen rujukan",
     "SITB/SIHA lokal",
     "Lainnya"
    ]
   },
   {
    "k": "reg_rs",
    "l": "Dari register kematian RS, belum dinotifikasi",
    "t": "select",
    "o": [
     "Ya",
     "Tidak"
    ]
   },
   {
    "k": "duplikasi",
    "l": "Duplikasi diperiksa",
    "t": "select",
    "o": [
     "Ya",
     "Tidak",
     "Belum diperiksa"
    ]
   },
   {
    "k": "tb",
    "l": "TB terdokumentasi",
    "t": "select",
    "o": [
     "Ya",
     "Tidak",
     "Belum diperiksa"
    ]
   },
   {
    "k": "hiv",
    "l": "HIV terdokumentasi",
    "t": "select",
    "o": [
     "Ya",
     "Tidak",
     "Belum diperiksa"
    ]
   },
   {
    "k": "mati",
    "l": "Kematian terkonfirmasi",
    "t": "select",
    "o": [
     "Ya",
     "Tidak",
     "Belum diperiksa"
    ]
   },
   {
    "k": "tgl_mati",
    "l": "Tanggal kematian",
    "t": "date"
   },
   {
    "k": "kecukupan",
    "l": "Kecukupan dokumen",
    "t": "select",
    "o": [
     "Memadai",
     "Terbatas",
     "Tidak memadai"
    ]
   },
   {
    "k": "dipilih",
    "l": "Dipilih",
    "t": "select",
    "o": [
     "Ya",
     "Tidak",
     "Cadangan"
    ]
   },
   {
    "k": "alasan",
    "l": "Alasan purposif",
    "t": "select",
    "o": [
     "Kematian dini",
     "Kematian lanjut",
     "Status ARV",
     "Jenis fasyankes",
     "Alur rujukan",
     "Variasi kelengkapan dokumen",
     "Belum dinotifikasi (register kematian RS)",
     "Lainnya"
    ]
   },
   {
    "k": "kode_kasus",
    "l": "Kode kasus C6",
    "t": "text"
   },
   {
    "k": "kode_unit_c3",
    "l": "Kode unit C3 bila sama",
    "t": "text"
   },
   {
    "k": "status",
    "l": "Status telaah",
    "t": "select",
    "o": [
     "Dinilai",
     "Tidak dapat ditelaah",
     "Belum"
    ]
   },
   {
    "k": "alasan_gagal",
    "l": "Alasan tidak dapat ditelaah",
    "t": "text"
   },
   {
    "k": "duplikat_dari",
    "l": "Duplikat dari (kode calon)",
    "t": "text"
   }
  ]
 },
 "params": {
  "c3": {},
  "tpt_matang": {
   "3HP": "2026-03-02",
   "1HP": "2026-05-23",
   "3HR": "2026-02-28",
   "6H": "2025-11-03"
  },
  "c5": {},
  "c6": {},
  "c6_rand": [
   0.3592,
   0.2352,
   0.6819,
   0.1097,
   0.7722,
   0.3838,
   0.272,
   0.0814,
   0.0907,
   0.4676,
   0.1817,
   0.1791,
   0.8188,
   0.0979,
   0.631,
   0.8727,
   0.3264,
   0.404,
   0.7015,
   0.984,
   0.1366,
   0.8047,
   0.3075,
   0.4902,
   0.2866,
   0.5469,
   0.5007,
   0.3596,
   0.4614,
   0.503,
   0.9569,
   0.6418,
   0.0535,
   0.4555,
   0.5418,
   0.0597,
   0.69,
   0.9305,
   0.5818,
   0.5978,
   0.4607,
   0.2828,
   0.0761,
   0.0785,
   0.5057,
   0.5188,
   0.2187,
   0.7185,
   0.3656,
   0.7715,
   0.0107,
   0.2516,
   0.1169,
   0.3609,
   0.6026,
   0.809,
   0.9325,
   0.1942,
   0.4501,
   0.1449,
   0.2801,
   0.7952,
   0.0459,
   0.8511,
   0.195,
   0.9886,
   0.3367,
   0.293,
   0.6075,
   0.7849
  ]
 },
 "c7": {
  "sessions": [
   {
    "code": "SUT-W1",
    "kk": "DLS",
    "target": "Pengelola program HIV Dinkes Kab. Deli Serdang"
   },
   {
    "code": "SUT-W2",
    "kk": "MDN",
    "target": "Pengelola program HIV Dinkes Kota Medan"
   },
   {
    "code": "SUT-W3",
    "kk": "DLS",
    "target": "DPJP atau penanggung jawab PDP RS Haji Medan"
   },
   {
    "code": "SUT-W4",
    "kk": "DLS",
    "target": "Pasien atau mantan pasien TB-HIV Deli Serdang (terlambat ARV, berobat lintas Medan, atau dirujuk untuk pemeriksaan TB)"
   },
   {
    "code": "SUT-W5",
    "kk": "MDN",
    "target": "Pendamping komunitas yang mendampingi pasien di Kota Medan dan Deli Serdang"
   },
   {
    "code": "SUT-F1",
    "kk": "Keduanya",
    "target": "Diskusi petugas pelaksana dari 4 fasyankes sampel (6–8 orang)"
   },
   {
    "code": "SUT-F2",
    "kk": "Keduanya",
    "target": "Diskusi komunitas (6–8 orang): ODHIV dengan riwayat TB atau penerima TPT; komposisi akhir menurut adendum"
   },
   {
    "code": "DKI-W1",
    "kk": "JTI",
    "target": "Pengelola program Suku Dinas Kesehatan Jakarta Timur"
   },
   {
    "code": "DKI-W2",
    "kk": "JPS",
    "target": "Pengelola program Suku Dinas Kesehatan Jakarta Pusat"
   },
   {
    "code": "DKI-W3",
    "kk": "JTI",
    "target": "DPJP atau penanggung jawab PDP RS Hermina Jatinegara; alternatif: Petugas klinik Lapas/Rutan Cipinang atau Rutan Pondok Bambu"
   },
   {
    "code": "DKI-W4",
    "kk": "JTI",
    "target": "Pasien atau mantan pasien Jakarta Timur (ditawari TPT, berhenti, atau terlambat ARV)"
   },
   {
    "code": "DKI-W5",
    "kk": "JPS",
    "target": "Pendamping atau petugas klinik komunitas populasi kunci di Jakarta Pusat"
   },
   {
    "code": "DKI-F1",
    "kk": "Keduanya",
    "target": "Diskusi petugas pelaksana dari 4 fasyankes sampel (6–8 orang)"
   },
   {
    "code": "DKI-F2",
    "kk": "Keduanya",
    "target": "Diskusi komunitas (6–8 orang): ODHIV populasi kunci yang ditawari atau menjalani TPT; komposisi akhir menurut adendum"
   },
   {
    "code": "JBR-W1",
    "kk": "IDM",
    "target": "Pengelola program HIV Dinkes Kab. Indramayu"
   },
   {
    "code": "JBR-W2",
    "kk": "BGR",
    "target": "Pengelola program TB atau HIV Dinkes Kab. Bogor"
   },
   {
    "code": "JBR-W3",
    "kk": "IDM",
    "target": "DPJP atau penanggung jawab TB RSUD M.A. Sentot Patrol"
   },
   {
    "code": "JBR-W4",
    "kk": "IDM",
    "target": "Pasien atau mantan pasien TB-HIV Indramayu (tes HIV, perjalanan ke layanan PDP, tidak mulai obat)"
   },
   {
    "code": "JBR-W5",
    "kk": "BGR",
    "target": "Penanggung jawab layanan PDP RSUD Cibinong (simpul jejaring PDP)"
   },
   {
    "code": "JBR-F1",
    "kk": "BGR",
    "target": "Diskusi petugas pelaksana dari 2 fasyankes sampel di kab/kota ini (6–8 orang)"
   },
   {
    "code": "JBR-F2",
    "kk": "IDM",
    "target": "Diskusi komunitas (6–8 orang): ODHIV dengan riwayat TB; komposisi akhir menurut adendum"
   },
   {
    "code": "JTM-W1",
    "kk": "SDA",
    "target": "Pengelola program HIV Dinkes Kab. Sidoarjo"
   },
   {
    "code": "JTM-W2",
    "kk": "SBY",
    "target": "Pengelola program HIV atau TB Dinkes Kota Surabaya"
   },
   {
    "code": "JTM-W3",
    "kk": "SDA",
    "target": "Penanggung jawab layanan TB-HIV RS Siti Khodijah Sepanjang; alternatif: Petugas klinik Rutan Medaeng atau Lapas Porong (bila alur rujukan RS sudah cukup tergali melalui C4)"
   },
   {
    "code": "JTM-W4",
    "kk": "SDA",
    "target": "Pasien atau mantan pasien TB-HIV Sidoarjo yang pernah dirujuk untuk ARV"
   },
   {
    "code": "JTM-W5",
    "kk": "SBY",
    "target": "Pendamping komunitas (misalnya PKBI Jawa Timur) yang mendampingi ODHIV di Surabaya dan Sidoarjo"
   },
   {
    "code": "JTM-F1",
    "kk": "Keduanya",
    "target": "Diskusi petugas pelaksana dari 4 fasyankes sampel (6–8 orang)"
   },
   {
    "code": "JTM-F2",
    "kk": "Keduanya",
    "target": "Diskusi komunitas (6–8 orang): ODHIV dengan riwayat TB atau populasi kunci yang ditawari TPT; komposisi akhir menurut adendum"
   },
   {
    "code": "BAL-W1",
    "kk": "BLL",
    "target": "Pengelola program HIV atau TB Dinkes Kab. Buleleng"
   },
   {
    "code": "BAL-W2",
    "kk": "BDG",
    "target": "Pengelola program Dinkes Kab. Badung"
   },
   {
    "code": "BAL-W3",
    "kk": "BLL",
    "target": "DPJP layanan TB-HIV RSUD Buleleng"
   },
   {
    "code": "BAL-W4",
    "kk": "BLL",
    "target": "Pasien atau mantan pasien TB-HIV Buleleng (terlambat ARV atau pernah putus)"
   },
   {
    "code": "BAL-W5",
    "kk": "BDG",
    "target": "Pendamping komunitas di Badung (pekerja pariwisata, pendatang, populasi kunci)"
   },
   {
    "code": "BAL-F1",
    "kk": "BDG",
    "target": "Diskusi petugas pelaksana dari 2 fasyankes sampel di kab/kota ini (6–8 orang)"
   },
   {
    "code": "BAL-F2",
    "kk": "BLL",
    "target": "Diskusi komunitas (6–8 orang): ODHIV dengan riwayat TB; komposisi akhir menurut adendum"
   },
   {
    "code": "PPA-W1",
    "kk": "KJP",
    "target": "Pengelola program HIV Dinkes Kota Jayapura"
   },
   {
    "code": "PPA-W2",
    "kk": "KBJ",
    "target": "Pengelola program TB atau HIV Dinkes Kab. Jayapura"
   },
   {
    "code": "PPA-W3",
    "kk": "KJP",
    "target": "Pengelola program atau farmasi Dinkes Provinsi Papua (logistik dan pasien lintas kabupaten)"
   },
   {
    "code": "PPA-W4",
    "kk": "KJP",
    "target": "Pasien atau mantan pasien TB-HIV Kota Jayapura (berpindah layanan, putus obat)"
   },
   {
    "code": "PPA-W5",
    "kk": "KBJ",
    "target": "Pendamping komunitas atau kader yang menjangkau kampung di Kab. Jayapura"
   },
   {
    "code": "PPA-F1",
    "kk": "Keduanya",
    "target": "Diskusi petugas pelaksana dari 4 fasyankes sampel (6–8 orang)"
   },
   {
    "code": "PPA-F2",
    "kk": "Keduanya",
    "target": "Diskusi komunitas (6–8 orang): ODHIV dengan riwayat TB; komposisi akhir menurut adendum"
   },
   {
    "code": "NAS-W1",
    "kk": "Nasional",
    "target": "Program TB (Timker TB)"
   },
   {
    "code": "NAS-W2",
    "kk": "Nasional",
    "target": "Program HIV (Timker HIV AIDS dan PIMS)"
   },
   {
    "code": "NAS-W3",
    "kk": "Nasional",
    "target": "Pengelola SITB"
   },
   {
    "code": "NAS-W4",
    "kk": "Nasional",
    "target": "Pengelola SIHA"
   },
   {
    "code": "NAS-W5",
    "kk": "Nasional",
    "target": "Perwakilan komunitas TB"
   },
   {
    "code": "NAS-W6",
    "kk": "Nasional",
    "target": "Perwakilan komunitas HIV atau pelaksana hibah"
   }
  ],
  "target": {
   "SUT": "5 wawancara, 2 diskusi",
   "DKI": "5 wawancara, 2 diskusi",
   "JBR": "5 wawancara, 2 diskusi",
   "JTM": "5 wawancara, 2 diskusi",
   "BAL": "5 wawancara, 2 diskusi",
   "PPA": "5 wawancara, 2 diskusi",
   "NAS": "6 wawancara"
  }
 },
 "regions": {
  "prov": [
   {
    "code": "SUT",
    "name": "Sumatera Utara"
   },
   {
    "code": "DKI",
    "name": "DKI Jakarta"
   },
   {
    "code": "JBR",
    "name": "Jawa Barat"
   },
   {
    "code": "JTM",
    "name": "Jawa Timur"
   },
   {
    "code": "BAL",
    "name": "Bali"
   },
   {
    "code": "PPA",
    "name": "Papua"
   }
  ],
  "kk": [
   {
    "code": "DLS",
    "name": "Kabupaten Deli Serdang",
    "prov": "SUT",
    "capaian": "Rendah"
   },
   {
    "code": "MDN",
    "name": "Kota Medan",
    "prov": "SUT",
    "capaian": "Tinggi"
   },
   {
    "code": "JTI",
    "name": "Kota Jakarta Timur",
    "prov": "DKI",
    "capaian": "Rendah"
   },
   {
    "code": "JPS",
    "name": "Kota Jakarta Pusat",
    "prov": "DKI",
    "capaian": "Tinggi"
   },
   {
    "code": "IDM",
    "name": "Kabupaten Indramayu",
    "prov": "JBR",
    "capaian": "Rendah"
   },
   {
    "code": "BGR",
    "name": "Kabupaten Bogor",
    "prov": "JBR",
    "capaian": "Tinggi"
   },
   {
    "code": "SDA",
    "name": "Kabupaten Sidoarjo",
    "prov": "JTM",
    "capaian": "Rendah"
   },
   {
    "code": "SBY",
    "name": "Kota Surabaya",
    "prov": "JTM",
    "capaian": "Tinggi"
   },
   {
    "code": "BLL",
    "name": "Kabupaten Buleleng",
    "prov": "BAL",
    "capaian": "Rendah"
   },
   {
    "code": "BDG",
    "name": "Kabupaten Badung",
    "prov": "BAL",
    "capaian": "Tinggi"
   },
   {
    "code": "KJP",
    "name": "Kota Jayapura",
    "prov": "PPA",
    "capaian": "Rendah"
   },
   {
    "code": "KBJ",
    "name": "Kabupaten Jayapura",
    "prov": "PPA",
    "capaian": "Tinggi"
   }
  ],
  "fac": [
   {
    "code": "DLS-RS",
    "name": "",
    "kk": "DLS",
    "type": "RS",
    "slot": 1,
    "sentinel": false
   },
   {
    "code": "DLS-PKM",
    "name": "",
    "kk": "DLS",
    "type": "Puskesmas",
    "slot": 2,
    "sentinel": false
   },
   {
    "code": "MDN-RS",
    "name": "",
    "kk": "MDN",
    "type": "RS",
    "slot": 1,
    "sentinel": false
   },
   {
    "code": "MDN-PKM",
    "name": "",
    "kk": "MDN",
    "type": "Puskesmas",
    "slot": 2,
    "sentinel": false
   },
   {
    "code": "JTI-RS",
    "name": "",
    "kk": "JTI",
    "type": "RS",
    "slot": 1,
    "sentinel": false
   },
   {
    "code": "JTI-PKM",
    "name": "",
    "kk": "JTI",
    "type": "Puskesmas",
    "slot": 2,
    "sentinel": false
   },
   {
    "code": "JPS-RS",
    "name": "",
    "kk": "JPS",
    "type": "RS",
    "slot": 1,
    "sentinel": false
   },
   {
    "code": "JPS-PKM",
    "name": "",
    "kk": "JPS",
    "type": "Puskesmas",
    "slot": 2,
    "sentinel": false
   },
   {
    "code": "IDM-RS",
    "name": "",
    "kk": "IDM",
    "type": "RS",
    "slot": 1,
    "sentinel": false
   },
   {
    "code": "IDM-PKM",
    "name": "",
    "kk": "IDM",
    "type": "Puskesmas",
    "slot": 2,
    "sentinel": false
   },
   {
    "code": "BGR-RS",
    "name": "",
    "kk": "BGR",
    "type": "RS",
    "slot": 1,
    "sentinel": false
   },
   {
    "code": "BGR-PKM",
    "name": "",
    "kk": "BGR",
    "type": "Puskesmas",
    "slot": 2,
    "sentinel": false
   },
   {
    "code": "SDA-RS",
    "name": "",
    "kk": "SDA",
    "type": "RS",
    "slot": 1,
    "sentinel": false
   },
   {
    "code": "SDA-PKM",
    "name": "",
    "kk": "SDA",
    "type": "Puskesmas",
    "slot": 2,
    "sentinel": false
   },
   {
    "code": "SBY-RS",
    "name": "",
    "kk": "SBY",
    "type": "RS",
    "slot": 1,
    "sentinel": false
   },
   {
    "code": "SBY-PKM",
    "name": "",
    "kk": "SBY",
    "type": "Puskesmas",
    "slot": 2,
    "sentinel": false
   },
   {
    "code": "BLL-RS",
    "name": "",
    "kk": "BLL",
    "type": "RS",
    "slot": 1,
    "sentinel": false
   },
   {
    "code": "BLL-PKM",
    "name": "",
    "kk": "BLL",
    "type": "Puskesmas",
    "slot": 2,
    "sentinel": false
   },
   {
    "code": "BDG-RS",
    "name": "",
    "kk": "BDG",
    "type": "RS",
    "slot": 1,
    "sentinel": false
   },
   {
    "code": "BDG-PKM",
    "name": "",
    "kk": "BDG",
    "type": "Puskesmas",
    "slot": 2,
    "sentinel": false
   },
   {
    "code": "KJP-RS",
    "name": "",
    "kk": "KJP",
    "type": "RS",
    "slot": 1,
    "sentinel": false
   },
   {
    "code": "KJP-PKM",
    "name": "",
    "kk": "KJP",
    "type": "Puskesmas",
    "slot": 2,
    "sentinel": false
   },
   {
    "code": "KBJ-RS",
    "name": "",
    "kk": "KBJ",
    "type": "RS",
    "slot": 1,
    "sentinel": false
   },
   {
    "code": "KBJ-PKM",
    "name": "",
    "kk": "KBJ",
    "type": "Puskesmas",
    "slot": 2,
    "sentinel": false
   }
  ]
 }
};
