/* RCA TB-HIV 2026 · petunjuk (tooltip), contoh isian, glosarium istilah, definisi indikator, dan cara hitung otomatis.
 * Isi dapat ditambah/diubah tanpa menyentuh berkas lain:
 *   EX_CODE   : contoh per kode butir (C3)        GLOSS : istilah → penjelasan
 *   AUTO_DOC  : cara hitung kolom otomatis         INDICATORS : definisi TB/HIV-5, -6, -4.1a, -3.1a
 */
(function () {
  'use strict';
  const RCA = window.RCA, h = RCA.h;
  const help = RCA.help = {};

  /* ---------------------------------------------------------------- definisi indikator (Protokol V13 Bagian 4; C5) */
  const INDICATORS = help.INDICATORS = {
    'TB/HIV-5': {
      nama: 'Status HIV diketahui pada pasien TB',
      N: 'Episode TB baru dan kambuh dengan status HIV positif atau negatif yang tercatat.',
      D: 'Seluruh episode TB baru dan kambuh yang memenuhi kriteria pada periode pelaporan.',
      sumber: 'SITB sebagai sumber utama; register TB, register laboratorium/KTS, rekam medis bila perlu.',
      catatan: 'Pasien dengan status HIV belum diketahui tetap masuk penyebut. Status positif yang sudah diketahui dan terdokumentasi tidak memerlukan tes ulang.',
      contoh: 'Triwulan III 2025: 120 episode TB baru/kambuh (D), 103 memiliki status HIV tercatat (N) → 86%.'
    },
    'TB/HIV-6': {
      nama: 'Pengobatan ARV pada pasien TB-HIV',
      N: 'Episode TB-HIV baru dan kambuh pada pasien yang sudah menggunakan ARV sebelum TB atau memulai ARV selama pengobatan TB.',
      D: 'Seluruh episode TB baru dan kambuh dengan HIV positif yang memenuhi kriteria.',
      sumber: 'SITB dan SIHA; register TB, ikhtisar perawatan HIV/register ARV, farmasi.',
      catatan: 'Indikator ini belum menunjukkan apakah ARV dimulai tepat waktu; ketepatan waktu dinilai terpisah (CP6, batas 14 hari TB SO dan 56 hari TB RO setelah OAT).',
      contoh: '40 episode TB-HIV (D), 31 sudah/mulai ARV (N) → 78%.'
    },
    'TB/HIV-4.1a': {
      nama: 'Inisiasi TPT pada peserta baru pengobatan ARV',
      N: 'Peserta baru pengobatan ARV yang memulai TPT paling lambat pada akhir jendela TPT periode pelaporan.',
      D: 'ODHIV yang pertama kali memulai ARV dengan tanggal mulai dalam periode pelaporan.',
      sumber: 'SIHA; ikhtisar perawatan HIV/register ARV, register/kartu TPT, farmasi.',
      catatan: 'Rujuk masuk, kembali setelah putus ARV, dan status inisiasi belum pasti tidak dihitung sebagai peserta baru.',
      contoh: '60 ODHIV baru memulai ARV (D), 21 memulai TPT (N) → 35%.'
    },
    'TB/HIV-3.1a': {
      nama: 'Skrining TB pada peserta baru pengobatan ARV',
      N: 'Individu yang pertama kali memulai ARV dan memiliki catatan skrining TB.',
      D: 'Seluruh individu yang pertama kali memulai ARV.',
      sumber: 'SIHA (tanggal pertama mulai ARV dan tanggal skrining TB).',
      catatan: 'Dilaporkan sebagai nilai dasar; tidak diverifikasi di C5.',
      contoh: '60 peserta baru ARV, 60 tercatat diskrining → 100% (periksa apakah skrining benar dilakukan).'
    }
  };
  help.indicatorPanel = function (only) {
    const keys = only ? [].concat(only) : ['TB/HIV-5', 'TB/HIV-6', 'TB/HIV-4.1a'];
    return h('details', { class: 'relpanel indpanel', open: !!only },
      h('summary', null, h('b', null, 'Apa itu ' + keys.join(', ') + '?')),
      keys.map(k => { const x = INDICATORS[k]; return h('div', { class: 'ind' }, h('h4', null, k + ' · ' + x.nama),
        h('dl', { class: 'kv' }, h('dt', null, 'Pembilang (N)'), h('dd', null, x.N), h('dt', null, 'Penyebut (D)'), h('dd', null, x.D), h('dt', null, 'Sumber'), h('dd', null, x.sumber),
          h('dt', null, 'Catatan'), h('dd', null, x.catatan), h('dt', null, 'Contoh'), h('dd', null, x.contoh))); }),
      h('p', { class: 'muted' }, 'Capaian = 100 × N/D. Faktor verifikasi (FV) = hasil hitung ulang dari sumber ÷ nilai yang dilaporkan, dihitung terpisah untuk N dan D. FV > 1,10 berarti laporan lebih rendah daripada sumber (pelaporan kurang); FV < 0,90 berarti laporan lebih tinggi (pelaporan lebih).'));
  };

  /* ---------------------------------------------------------------- glosarium */
  const GLOSS = help.GLOSS = {
    'Y': 'Status bukti: tercatat atau ada bukti dilakukan.',
    'TL': 'Status bukti: ada bukti tidak dilakukan, ditolak, atau ditunda (tulis alasannya).',
    'TC': 'Tidak ditemukan keterangan pada sumber relevan yang sudah diperiksa. Bukan berarti pelayanan gagal; menjadi kesenjangan hanya setelah penelusuran sumber selesai (Z05).',
    'TBL': 'Tidak berlaku untuk unit/fasilitas ini.',
    'BD': 'Belum dapat dinilai: sumber belum diakses, bukti bertentangan, atau waktu pengamatan belum cukup. Bila dokumen ada di fasilitas lain dan belum diakses, gunakan BD, bukan TL.',
    'St': 'Status bukti untuk satu fakta: Y, TL, TC, TBL, atau BD.',
    'Sumber': 'Kode sumber dokumen: W keterangan petugas; RM rekam medis; TB kartu/register TB; HIV ikhtisar/register HIV; LAB; FAR farmasi; TPT; RUJ rujukan; KOM komunitas; SITB; SIHA; LAIN. Beri nomor bila lebih dari satu (RM1, RM2).',
    'OAT': 'Obat anti-tuberkulosis.',
    'ARV': 'Obat antiretroviral untuk HIV.',
    'TPT': 'Terapi pencegahan tuberkulosis bagi ODHIV tanpa TB aktif.',
    '3HP': 'Paduan TPT rifapentin + isoniazid mingguan selama 3 bulan (lengkap bila ≥11 dosis dalam 120 hari).',
    '1HP': 'Paduan TPT rifapentin + isoniazid harian selama 1 bulan (28 dosis).',
    '3HR': 'Paduan TPT isoniazid + rifampisin harian selama 3 bulan.',
    '6H': 'Paduan TPT isoniazid harian 6 bulan (lengkap bila ≥144 dosis dalam 239 hari).',
    'TB SO': 'TB sensitif obat.',
    'TB RO': 'TB resistan obat.',
    'ODHIV': 'Orang dengan HIV.',
    'PDP': 'Layanan perawatan, dukungan, dan pengobatan HIV (layanan ARV).',
    'SITB': 'Sistem Informasi Tuberkulosis.',
    'SIHA': 'Sistem Informasi HIV/AIDS.',
    'KTS': 'Konseling dan tes HIV sukarela.',
    'TCM': 'Tes cepat molekuler (misalnya GeneXpert) untuk diagnosis TB.',
    'LF-LAM': 'Tes urin lipoarabinomannan untuk membantu diagnosis TB pada ODHIV dengan imunitas rendah.',
    'CD4': 'Jumlah sel CD4 (sel/µL), penanda kekebalan tubuh.',
    'VL': 'Viral load, jumlah virus HIV dalam darah.',
    'PPK': 'Pengobatan pencegahan kotrimoksazol.',
    'IRIS': 'Sindrom pulih imun: perburukan setelah ARV dimulai karena sistem imun pulih.',
    'ESO': 'Efek samping obat.',
    'PMO': 'Pengawas menelan obat.',
    'LFU': 'Lost to follow-up, putus berobat/hilang kontak.',
    'Juknis': 'Petunjuk Teknis Kolaborasi TBC-HIV 2023: ARV paling lambat 14 hari setelah OAT pada TB SO dan 56 hari pada TB RO.',
    'PNPK': 'Pedoman Nasional Pelayanan Kedokteran HIV 2019, dipakai sebagai pembanding (sensitivitas).',
    'purposif': 'Unit dipilih dengan sengaja karena ada alasan (P1–P8), misalnya interupsi, keterlambatan, atau kematian. Tidak dipakai untuk menghitung frekuensi.',
    'acak': 'Unit dipilih dengan undian sistematis (titik awal acak, interval N/3). Dipakai untuk menggambarkan frekuensi kesenjangan.',
    'Sensus': 'Seluruh baris kerangka ditelaah karena jumlahnya ≤ kuota (6).',
    'cadangan': 'Unit acak pengganti bila unit acak inti tidak dapat ditelaah; dipakai berurutan menurut nomornya.',
    'perluasan': 'Tambahan 3 acak + 1 purposif untuk kerangka A dan B (total 10), diputuskan sama untuk pasangan kab/kota dalam provinsi.',
    'kerangka': 'Daftar lengkap unit yang memenuhi kriteria di fasyankes (C2a): A episode TB-HIV, B riwayat ARV, CP3 episode TB.',
    'unit': 'Satu episode TB-HIV, satu riwayat ARV/pencegahan, atau satu episode TB (CP3). Beberapa dokumen untuk satu unit tidak menambah sampel.',
    'episode': 'Satu periode diagnosis-pengobatan TB; episode berulang dibedakan.',
    'pemicu': 'Tanda otomatis bahwa unit acak perlu pendalaman (bagian P), misalnya ARV melewati batas atau luaran tidak berhasil.',
    'n/N': 'n = unit dengan kesenjangan; N = unit yang dapat dinilai untuk aspek itu. Acak dan purposif disajikan terpisah.',
    'CP': 'Titik penilaian (checkpoint) pelayanan; 14 CP dinilai di setiap fasyankes.',
    'CP1': 'Akses awal dari komunitas.', 'CP2': 'Skrining TB pada ODHIV.', 'CP3': 'Penetapan status HIV pasien TB.', 'CP4': 'Penyelesaian pemeriksaan diagnostik TB.',
    'CP5': 'Penilaian kelayakan TPT.', 'CP6': 'Memulai atau melanjutkan ARV pada pasien TB-HIV.', 'CP7': 'Penawaran dan pemberian awal TPT.', 'CP8': 'Koordinasi rujukan (kehadiran di tujuan ≤30 hari).',
    'CP9': 'Kepatuhan dan dukungan pengobatan.', 'CP10': 'Pemantauan dan luaran pengobatan TB.', 'CP11': 'Penyelesaian TPT.', 'CP12': 'Penelusuran pasien dan kembali berobat (≤90 hari).',
    'CP13': 'Telaah kematian sebagai proses organisasi fasilitas.', 'CP14': 'Retensi perawatan HIV 90/180 hari setelah TB selesai.',
    'R1': 'Ranah: akses dan penetapan status HIV dalam pelayanan TB.', 'R2': 'Ranah: skrining TB dan penyelesaian diagnosis.', 'R3': 'Ranah: kelayakan dan pemberian TPT.',
    'R4': 'Ranah: pengobatan ARV dan kesinambungan pelayanan.', 'R5': 'Ranah: luaran dan pembelajaran dari kematian.', 'R6': 'Ranah: informasi dan akuntabilitas (kesesuaian SITB/SIHA), lintas CP.',
    'F1': 'Faktor sistem: penyelenggaraan pelayanan.', 'F2': 'Faktor sistem: tenaga kesehatan.', 'F3': 'Faktor sistem: sistem informasi.', 'F4': 'Faktor sistem: diagnostik.',
    'F5': 'Faktor sistem: obat dan teknologi lain.', 'F6': 'Faktor sistem: pembiayaan.', 'F7': 'Faktor sistem: kepemimpinan dan tata kelola.',
    'M1': 'Bukti minimum pertama untuk CP ini (lihat teks di kartu). Ya = terpenuhi; TBL = tidak berlaku.', 'M2': 'Bukti minimum kedua.', 'M3': 'Bukti minimum ketiga.',
    'Keberlakuan': 'Penuh, sebagian, hanya kewajiban rujukan, atau tidak berlaku menurut fungsi fasilitas. Bukan untuk menyatakan penilaian belum selesai.',
    'Kecukupan': 'Kecukupan bukti: memadai, terbatas, atau bertentangan.',
    'Keyakinan': 'Tinggi: ≥2 jenis sumber saling mendukung, ≥1 berupa dokumen/catatan/unit C3/observasi. Sedang: satu sumber terverifikasi atau beberapa keterangan konsisten. Rendah: hanya keterangan satu petugas atau sumber bertentangan.',
    'Klasifikasi': 'Terlaksana dan terverifikasi; terlaksana sebagian atau terlambat; dipastikan tidak terlaksana; belum dapat dipastikan; tidak berlaku.',
    'FV': 'Faktor verifikasi = hitung ulang dari sumber ÷ nilai dilaporkan; batas kerja 0,90–1,10.',
    'Model A': 'Sumber independen lengkap untuk periode efektif; faktor verifikasi dapat dihitung.',
    'Model B': 'Jejak independen sebagian; hanya mendukung butir yang dicatat.',
    'Model C': 'Hanya penjelasan petugas/artefak; tidak memverifikasi pelayanan.',
    'arah 1': 'Arah 1: dari daftar sistem (SITB/SIHA) ke sumber pelayanan (entri tanpa bukti?).',
    'arah 2': 'Arah 2: dari sumber pelayanan (register) ke sistem (pelayanan belum tercatat?).',
    'sentinel': 'Fasyankes (1 per provinsi) yang menjalani verifikasi data dua arah C5.',
    'triwulan': 'Periode verifikasi C5: pilihan awal triwulan III 2025 (1 Juli–30 September 2025).',
    'T1': 'Fase akses dan diagnosis.', 'T2': 'Fase awal terapi.', 'T3': 'Fase pemantauan.', 'T4': 'Fase rujukan.', 'T5': 'Fase penanganan saat kondisi memburuk.',
    'Keterlambatan 1': 'Keterlambatan mencari pelayanan (dari gejala ke kontak pertama).',
    'Keterlambatan 2': 'Keterlambatan mencapai layanan yang tepat (rujukan, akses, biaya, jarak).',
    'Keterlambatan 3': 'Keterlambatan memperoleh tata laksana memadai di fasyankes.',
    'Skor': 'Mutu pelayanan per fase: 1 sangat buruk, 2 buruk, 3 memadai, 4 baik, 5 sangat baik, BD tidak dapat dinilai. Alasan wajib ditulis.',
    'Peluang perbaikan': 'Ada tindakan pelayanan yang secara wajar dapat dilakukan berbeda. Ya → wajib penilaian kedua.',
    'C2a': 'Templat kerangka sampel yang diisi fasyankes (tanpa identitas).', 'C2b': 'Daftar induk sampel dan log pemilihan (undian, purposif, pengganti).',
    'C2a-P': 'Berkas penghubung kode pasien ↔ identitas; disimpan di fasyankes, tidak dikirim.',
    'WP3': 'Paket kerja mutu, pemadanan, dan rekonsiliasi data.', 'WP7': 'Paket kerja sintesis dan penetapan akar masalah (2027).',
    'D/N': 'Penyebut (D) dan pembilang (N) indikator.',
    'DPJP': 'Dokter penanggung jawab pelayanan.', 'DPPM': 'Jejaring layanan pemerintah–swasta (District-based Public-Private Mix).'
  };
  const TERM_RE = new RegExp('(^|[^A-Za-z0-9/-])(' + Object.keys(GLOSS).filter(k => k.length > 1 && !['St', 'unit', 'episode', 'Sumber'].includes(k))
    .sort((a, b) => b.length - a.length).map(k => k.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&')).join('|') + ')(?![A-Za-z0-9])', 'g');
  help.terms = function (text) {
    const out = []; let m; TERM_RE.lastIndex = 0;
    while ((m = TERM_RE.exec(text || ''))) if (!out.includes(m[2])) out.push(m[2]);
    return out;
  };

  /* ---------------------------------------------------------------- cara hitung otomatis */
  const AUTO_DOC = help.AUTO_DOC = {
    hari_dx_oat: 'A08 − A01 (hari).', hari_oat_arv: 'A11 − A08 (hari).', hari_dx_teshiv: 'A07 − A01 (hari).', hari_terduga_dx: 'A01 − A00 (hari).',
    arv_lewat: '"Ya" bila A11 − A08 > 14 hari (TB SO) atau > 56 hari (TB RO); "Nilai klinis" bila meningitis/SSP.',
    kelompok: 'Dari U03: berisi "purposif" → Purposif; "berurutan" → Berurutan; selain itu Acak/sensus.',
    cek_A: 'Memeriksa tanggal melewati batas data 30/06/2026, urutan tanggal tidak logis, St kosong padahal isian ada, dan Sumber kosong padahal St = Y.',
    cek_B: 'Seperti cek A untuk unit B, ditambah skrining/TPT sebelum mulai ARV dan luaran TPT sebelum mulai TPT.',
    pemicu_A: 'Muncul bila unit purposif, OAT tidak tercatat, ARV melewati batas, ARV terinterupsi, ARV belum dimulai, luaran tidak berhasil/belum diketahui, ada rujukan/interupsi, status HIV per 30/06/2026 tidak pasti, atau beda dengan SITB/SIHA. Pemicu mewajibkan bagian P.',
    pemicu_B: 'Muncul bila unit purposif, skrining tidak tercatat/positif, diagnostik belum selesai atau lewat 14 hari, kelayakan TPT ditunda/tidak tercatat, layak tetapi TPT belum mulai, luaran TPT tidak berhasil, rujukan/interupsi, atau beda sistem.',
    cp6: 'Untuk pasien belum/pernah ARV terputus: St A11 = Y → "terlambat" bila melewati batas, selain itu "dalam batas"; TC (setelah penelusuran selesai) atau TL dengan jendela cukup → "tidak dimulai"; jendela OAT + batas melewati 30/06/2026 → "pengamatan belum cukup".',
    cp6_pnpk: 'Sensitivitas PNPK 2019: TB SO terlambat bila > 56 hari, atau > 14 hari dengan CD4 < 50.',
    hari_arv_skr: 'B03 − B01 (hari).', hari_skr_dx: 'B06 − B03 (hari).', hari_arv_tpt: 'B13 − B01 (hari).', hari_layak_tpt: 'B13 − B09 (hari).',
    tpt_matang: 'Matang bila tanggal mulai TPT ≤ batas paduan (3HP 02/03/2026; 1HP 23/05/2026; 3HR 28/02/2026; 6H 03/11/2025) sehingga penyelesaian dapat diamati sampai 30/06/2026.',
    cp7: 'Untuk unit Layak TPT: mulai > 30 hari setelah kelayakan → "terlambat"; tidak dimulai dengan jendela cukup → "tidak dimulai".',
    cp2: 'Dari St B03: Y → terjadi; TL atau TC setelah penelusuran selesai → kesenjangan.',
    cp3_mek: 'Membedakan masalah pelayanan (tidak ditawarkan, ditawarkan tidak dites, menolak) dari pencatatan (dites tetapi SITB kosong/berbeda) dan belum dapat dipastikan.',
    hari_dx_tes: 'Tanggal tes − tanggal diagnosis TB (hari).',
    c6_kategori: 'Waktu kematian sejak mulai OAT: sebelum OAT, 0–14, 15–30, 31–90, 91–180, >180 hari, atau tidak diketahui.',
    c6_oat_arv: 'Tanggal mulai ARV − tanggal mulai OAT (hari).',
    m_status: 'Dari M1–M3: semua Ya → sudah diperiksa; sebagian → sebagian; TBL diabaikan.',
    m_saran: 'Saran: belum dapat dipastikan bila bukti minimum/kecukupan belum terpenuhi; sebagian bila ≥1 kesenjangan unit acak; terverifikasi bila N acak ≥3 tanpa kesenjangan dan bukti memadai. Klasifikasi akhir tetap keputusan tim.',
    c5_D_sis: 'Penyebut menurut sistem: baris ada di sistem, tanggal dalam periode efektif, dan kriteria D terpenuhi.',
    c5_D_src: 'Penyebut menurut sumber (hanya bila sumber lengkap diperiksa).', c5_N_sis: 'Pembilang menurut sistem.', c5_N_src: 'Pembilang menurut sumber.',
    c5_status: 'Sesuai bila D dan N sistem = sumber; selain itu jenis beda (hanya di sistem, hanya di sumber, beda penyebut, beda pembilang).',
    c5_terpilih: 'Sensus/satu bulan: semua baris periode efektif. Sampel: posisi INT((j+U)×N/n)+1 pada kerangka acak arah 1.',
    c5_lengkap: 'Ya bila sumber diperiksa, kode sumber terisi, dan butir sumber yang dibutuhkan lengkap.'
  };

  /* ---------------------------------------------------------------- contoh per kode butir C3 */
  const EX_CODE = help.EX_CODE = {
    U01: 'BLL-RS-A007', U02: 'P007', U03: 'Acak inti', U04: 'P2 Keterlambatan (untuk unit purposif)', U05: '2025', U06: 'FA1', U07: '27/10/2026', U08: '22',
    U09: 'Dapat ditelaah', U10: '"Rekam medis rawat inap di gudang arsip; dijanjikan tersedia 28/10"', U11: '34', U12: 'Laki-laki',
    U13: '14/03/2025 · St Y · Sumber HIV1', U14: '22/04/2025 · St Y · HIV1', U15: 'Terverifikasi pertama kali',
    A00: '05/03/2025 · St Y · TB1 (register terduga TBC.06)', A01: '10/03/2025 · St Y · RM1', A02: 'Bakteriologis', A03: 'Paru', A04: 'TB SO', A05: 'Baru',
    A06: 'Ditetapkan selama episode', A07: '14/03/2025 · St Y · LAB1', A08: '18/03/2025 · St Y · TB1', A09: '"Pasien dirujuk ke RS untuk rawat inap; OAT dimulai di RS"',
    A10: 'Belum pernah ARV · St Y · HIV1', A10b: 'Ya (bila sedang ARV saat OAT)', A11: '22/04/2025 · St Y · HIV1', A12: '"Menunggu hasil CD4 dan konseling kepatuhan (RM1 01/04/2025)"',
    A13: 'Pengobatan lengkap · St Y · TB1', A14: '20/09/2025', A15: 'Ya, sesuai', A16: 'Ya, berbeda (SITB: belum ARV)', A17: 'Ya, sesuai',
    A18: 'Hadir · St Y · HIV2', A19: 'Pengamatan belum cukup · St BD',
    B01: '10/02/2025 · St Y · HIV1', B02: 'Baru pertama kali ARV', B03: '10/02/2025 · St Y · HIV1', B04: 'Negatif', B05: 'TBL (skrining negatif)', B06: '17/02/2025', B07: '–',
    B08: 'Layak · St Y · HIV1', B09: '10/02/2025', B10: 'Tidak pernah (terdokumentasi)', B11: 'Ditawarkan, diterima', B12: '10/02/2025', B13: '10/03/2025 · St Y · FAR1',
    B14: '3HP', B15: '"Stok 3HP kosong Februari 2025 (kartu stok FAR2)"', B16: 'Lengkap · St Y · TPT1', B17: '02/06/2025', B18: 'Ya, sesuai', B19: 'Tidak tercatat', B20: 'Belum dicek',
    T01: 'Ya (lalu isi bagian Rujukan)', T02: 'Dipastikan tidak', T03: 'Aktif ARV · St Y · HIV2', T04: '12/06/2026', T05: 'Ya, sesuai', T06: '– (atau 01/08/2025 · St Y · RM2)', T07: 'Tidak',
    Z01: 'Ada', Z02: '"Tanggal mulai ARV di SITB 29/04/2025, ikhtisar HIV 22/04/2025"', Z03: '"Konfirmasi ke PDP RS rujukan apakah ARV diambil Mei 2025"', Z04: 'C5/WP3',
    Z05: 'Lengkap untuk aspek yang dinilai', Z06: 'Ya', Z07: 'K1 30/10/2026', Z08: 'Tidak',
    P01: '15', P02: '01/02/2025', P03: '"20/02/2025 Puskesmas Sawan I (batuk 3 minggu)"', P04: '"TCM 12/03/2025: MTB detected, RR not detected"', P05: '11/03/2025', P06: '11/03/2025',
    P07: '12/03/2025', P08: '13/03/2025', P09: '14/03/2025', P10: '"14/03/2025 ditawarkan, diterima"', P11: '"25/03/2025 dirujuk ke PDP"', P12: '"18/05/2025 BTA negatif"',
    P13: '6', P14: '4', P15: 'Lengkap', P16: '"11 dari 12 dosis mingguan"', P17: '"Mual minggu ke-3; paduan dilanjutkan"', P18: '"Pendamping komunitas mengantar ke PDP"',
    P21: '"Pasien bekerja musiman di luar kota"', P22: '"Rujukan internal tanpa konfirmasi kedatangan"',
    CD4: '180', CD4_tgl: '20/03/2025'
  };

  /* ---------------------------------------------------------------- contoh berbasis aturan */
  function ruleExample(f) {
    const l = (f.l || '').toLowerCase();
    if (f.t === 'date') return '14/03/2025 (pilih dari kalender). Bila hanya bulan/tahun diketahui, kosongkan dan tulis --/03/2025 di catatan.';
    if (f.t === 'multi') return 'Centang semua yang sesuai, misalnya ' + (f.o || []).slice(0, 2).join(' dan ') + '.';
    if (f.t === 'select') {
      const o = (f.o || []).filter(x => !/^(—|TC|BD|TBL)/.test(x));
      return o.length ? 'Pilih satu, misalnya "' + o[0] + '".' : 'Pilih satu.';
    }
    const map = [
      [/kode unit c3/, 'BLL-RS-A007 (kosongkan bila kasus tidak ditelaah di C3)'], [/kode unit/, 'BLL-RS-A007'], [/kode kasus/, 'C6-BLL-01'], [/kode calon/, 'BLL-K01'],
      [/kode pasien/, 'P007 (atau BLL-RS-P008 untuk C6)'], [/kode baris/, 'S5-C014'], [/kode sesi/, 'BAL-W1'], [/kode peserta/, 'BAL-F2-04 (sesi + urutan duduk)'],
      [/kode bukti/, 'BLL-RS-D01 (dokumen), BLL-RS-O01 (observasi)'], [/kode sumber/, 'RM1, TB1, LAB1'], [/kode berkas/, 'KR-C6-BLL-01'], [/kode fasyankes|fasyankes \(kode\)|fasilitas \(kode\)|kode fasilitas/, 'BLL-RS'],
      [/kode kab/, 'BLL'], [/\(kode\)|kode\)|penelaah|pengambil data|pewawancara|pencatat|dikumpulkan oleh|diperiksa oleh/, 'FA1 (kode petugas, bukan nama)'],
      [/durasi|menit/, '25'], [/umur/, '34'], [/jumlah peserta/, '7'], [/cd4/, '180'], [/skor kaskade/, '48'], [/pembilang/, '101'], [/penyebut/, '151'],
      [/u acak/, '0,4831 (dibekukan, tidak diubah lagi)'], [/^n |n seluruh|n kerangka/, '120'], [/no\. urut|nomor urut/, '12'], [/jumlah|volume/, '42'],
      [/jadwal/, 'Senin–Jumat 08.00–12.00'], [/pembiayaan/, 'JKN dan program; pasien menanggung transport rujukan'], [/tenaga terlatih|mutasi/, 'Dokter PDP terlatih TB-HIV (2024); perawat TB mutasi 03/2025'],
      [/penanggung jawab/, 'TB: perawat poli paru; PDP: dokter PDP; SITB: petugas RR'], [/kepemilikan|kelas rs/, 'Pemerintah daerah, kelas B'], [/tim \(kode\)|tim/, 'K1, FA1, PK1'],
      [/pendamping/, 'Dinkes Kab. Buleleng (pemegang program TB)'], [/waktu kerja/, 'alur 40 / dokumen 60 / diagnostik 30 / observasi 45 / wawancara 60 / matriks 90'],
      [/alasan/, '"ARV ditunda menunggu hasil CD4; RM1 01/04/2025"'], [/uraian ketidaksesuaian|ketidaksesuaian/, '"Tanggal mulai ARV di SITB berbeda 7 hari dari ikhtisar"'],
      [/dugaan penyebab|dugaan/, '"Rujukan ARV dari poli paru ke PDP tidak dikonfirmasi kembali"'], [/praktik/, '"PDP dan poli TB satu ruang, ARV dimulai hari yang sama"'],
      [/masalah/, '"Skrining positif tidak diperiksa TCM karena spesimen tidak terkirim"'], [/peluang perbaikan/, '"Pemeriksaan LF-LAM saat rawat inap; Fasyankes"'],
      [/bukti|kode bukti/, '"Register rujukan hal. 12 (R); observasi sesi PDP 28/10 (O)"'], [/kejadian/, '"Rawat inap; TCM MTB detected; OAT dimulai"'],
      [/penjelasan|keterangan/, '"Entri SITB dilakukan bulan berikutnya oleh petugas RR"'], [/pertanyaan/, '"Konfirmasi ke PDP apakah pasien datang"'],
      [/informasi yang tidak|belum tersedia/, '"Ringkasan pulang tidak ditemukan; dicari di RS rujukan"'], [/refleksi/, '"Peserta ragu di awal; rekaman jernih"'],
      [/usulan|tindak lanjut/, '"Daftar pasien belum ARV dibahas mingguan; PJ: kepala Puskesmas"'], [/perspektif/, '"Pasien putus berobat; populasi kunci"'],
      [/kutipan/, '"Saya takut ketemu tetangga di poli HIV" (tanpa nama)'], [/tema/, 'Stigma di ruang tunggu'], [/hambatan/, '"Hasil TCM kembali 5 hari"'],
      [/periode/, 'Januari–Desember 2025'], [/lokasi|tempat/, 'Rak rekam medis TB / ruang PDP'], [/langkah/, 'Pasien TB HIV positif diantar ke PDP'],
      [/stok/, 'Ada (cukup 2 bulan)'], [/hari tanpa stok|kekosongan/, '14 hari (Feb 2025)'], [/sumber daftar|sumber/, 'Register TB, SITB'],
      [/indikator/, 'Status HIV diketahui, TB/HIV-5 2025'], [/nilai|angka/, '86% (5.582/6.462)'], [/keterbatasan/, '"Data 2026 baru sampai triwulan II"'],
      [/fasyankes|fasilitas/, 'BLL-RS'], [/peserta|informan/, 'Pengelola program TB Dinkes, DPJP PDP'], [/pic|petugas/, 'Pemegang program HIV Dinkes'],
      [/bahasa/, 'Bahasa Indonesia, tanpa penerjemah'], [/jam/, '27/10/2026, 09.00–10.10']
    ];
    for (const [re, ex] of map) if (re.test(l)) return ex;
    return f.t === 'textarea' ? 'Tulis singkat dan faktual, sebutkan kode sumber dan tanggal; tanpa nama atau NIK.' : (f.t === 'number' ? 'Angka saja, misalnya 12.' : 'Isi singkat sesuai sumber; tanpa nama atau NIK.');
  }
  function typeHint(f) {
    return { date: 'Format tanggal HH/BB/TTTT. Jangan memakai tanggal entri sistem sebagai tanggal kejadian.', number: 'Isi angka.', select: 'Pilih satu jawaban.', multi: 'Boleh lebih dari satu.',
             textarea: 'Isian bebas; jangan menulis nama, NIK, nomor RM, alamat, atau nomor telepon.', text: '' }[f.t] || '';
  }
  help.explain = function (f, extraText) {
    const code = ((f.l || '').match(/^([A-Z]\d+[a-z]?)\s/) || [])[1] || (/^CD4/.test(f.k) ? f.k : '');
    const ex = (code && EX_CODE[code]) || f.ex || ruleExample(f);
    const terms = help.terms([f.l, (f.o || []).join(' '), extraText || ''].join(' '));
    if (f.st) terms.unshift('St', 'Sumber');
    return { h: f.h || '', hint: typeHint(f), ex, auto: f.t === 'auto' ? AUTO_DOC[f.fn] : '', terms: [...new Set(terms)].slice(0, 8) };
  };

  /* ---------------------------------------------------------------- UI */
  let tipId = 0;
  function tipBody(x) {
    return h('div', { class: 'tipbox', role: 'note' },
      x.auto ? h('p', null, h('b', null, 'Cara hitung: '), x.auto) : null,
      x.h ? h('p', null, h('b', null, 'Petunjuk: '), x.h) : null,
      x.hint ? h('p', null, x.hint) : null,
      x.ex && !x.auto ? h('p', null, h('b', null, 'Contoh: '), x.ex) : null,
      x.terms && x.terms.length ? h('dl', { class: 'gl' }, x.terms.filter(t => GLOSS[t]).map(t => [h('dt', null, t), h('dd', null, GLOSS[t])])) : null);
  }
  /** tombol "?" yang membuka/menutup kotak petunjuk di bawah label */
  help.button = function (x, label) {
    const id = 'tip' + (++tipId);
    const box = tipBody(x); box.id = id; box.hidden = true;
    const btn = h('button', { type: 'button', class: 'tipbtn', 'aria-expanded': 'false', 'aria-controls': id, 'aria-label': 'Petunjuk dan contoh: ' + (label || '') },
      h('span', { 'aria-hidden': 'true' }, '?'));
    btn.addEventListener('click', e => { e.preventDefault(); e.stopPropagation(); box.hidden = !box.hidden; btn.setAttribute('aria-expanded', String(!box.hidden)); });
    return { btn, box };
  };
  help.forField = function (f, extra) { return help.button(help.explain(f, extra), f.l); };
  /** tooltip mandiri untuk teks bebas (dipakai di C2, dashboard) */
  help.tip = function (text, ex) {
    const t = help.button({ h: text, ex, terms: help.terms(text) }, text.slice(0, 40));
    return h('span', { class: 'tipwrap' }, t.btn, t.box);
  };
  help.toggleAll = function (root, open) {
    RCA.$$('.tipbox', root).forEach(b => { b.hidden = !open; });
    RCA.$$('.tipbtn', root).forEach(b => b.setAttribute('aria-expanded', String(open)));
  };
})();
