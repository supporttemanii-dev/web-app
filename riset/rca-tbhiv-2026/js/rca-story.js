/* RCA TB-HIV 2026 · mesin cerita per unit untuk Root Cause Analysis
   Untuk setiap unit telaah (C3 A/B/CP3) dan kasus kematian (C6) menyusun:
   - linimasa bertanggal (dengan status bukti dan kode sumber),
   - APA YANG TERJADI: titik putus pada kaskade pelayanan, jenis kesenjangan, dan buktinya,
   - MENGAPA: penjelasan dari penelaah (P22, alasan tercatat, konteks), bukti lintas formulir (C4, C5, C6),
     dan kategori faktor (F1–F7, pasien/komunitas, keparahan) beserta asal penetapannya.
   Aturan kesenjangan memakai RCA.AUTO (sama dengan formulir dan rekap CP); tidak ada ambang baru. */
(function () {
  'use strict';
  const RCA = window.RCA, A = RCA.AUTO, C = RCA.calc;
  const has = C.has, days = C.days;
  const ST = { Y: 'tercatat', TL: 'ada bukti tidak dilakukan', TC: 'tidak ditemukan keterangan', TBL: 'tidak berlaku', BD: 'belum dapat dinilai' };
  const BULAN = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
  const fmt = v => { const m = String(v || '').match(/^(\d{4})-(\d{2})-(\d{2})/); return m ? (+m[3]) + ' ' + BULAN[+m[2] - 1] + ' ' + m[1] : String(v || ''); };
  const plural = (n, w) => n + ' ' + w;
  const cap = s => s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
  const clip = (s, n) => { s = String(s || '').replace(/\s+/g, ' ').trim(); return s.length > n ? s.slice(0, n - 1) + '…' : s; };
  const sentence = s => { s = String(s || '').replace(/\s+/g, ' ').trim(); if (!s) return ''; if (s === s.toUpperCase() && /[A-Z]{4}/.test(s)) s = s.charAt(0) + s.slice(1).toLowerCase(); return s; };
  const ev = (d, k) => ({ st: d[k + '__st'] || '', src: d[k + '__src'] || '' });
  const bukti = (d, k) => { const e = ev(d, k); return k + (e.st ? ' · St ' + e.st : '') + (e.src ? ' · ' + e.src : ''); };

  /* ---------------- taksonomi faktor (sama dengan C4 dan C6 B4) */
  const FAKTOR = ['F1 Penyelenggaraan pelayanan', 'F2 Tenaga kesehatan', 'F3 Sistem informasi', 'F4 Diagnostik', 'F5 Obat dan teknologi lain', 'F6 Pembiayaan',
    'F7 Kepemimpinan dan tata kelola', 'Faktor pasien/komunitas', 'Keparahan penyakit'];
  const KATA = [
    [0, /\b(alur|tidak ditawarkan|belum ditawarkan|tidak dirujuk|rujuk(an)? (tidak|belum)|terpisah|satu atap|antre|antri|jadwal|layanan (tidak|belum)|tidak dilacak|pelacakan|tidak ada pendamping|dukungan (hanya|tidak)|tidak diberikan|belum diberikan|tidak dilakukan|tidak diperiksa|koordinasi)\b/i],
    [1, /\b(petugas (cuti|baru|ganti|kurang|sibuk|tidak)|tenaga|kekurangan (petugas|tenaga)|mutasi|beban kerja|belum (dilatih|terlatih)|tidak terlatih|pelatihan|dokter (tidak|belum)|rangkap)\b/i],
    [2, /\b(tidak tercatat|belum tercatat|tidak terisi|belum (di)?(input|entri|entry)|salah (input|entri)|tidak (di)?input|tanggal .{0,30}berbeda|berbeda (antara|dengan|di)|tidak sesuai|selisih|ganda|data (tidak|belum)|pencatatan|sitb dan siha|siha dan sitb)\b/i],
    [3, /\b(tcm|cartridge|rontgen|x-?ray|laboratorium|spesimen|sampel dahak|reagen|cd4|viral load|lf-?lam|hasil (belum|tidak|terlambat)|alat (rusak|tidak))\b/i],
    [4, /\b(stok|kosong|kekosongan|habis|tidak tersedia|keterbatasan obat|belum tersedia|logistik|(6h|3hp|inh|oat|arv|tpt) .{0,20}(kosong|habis|terbatas|tidak tersedia|belum tersedia)|keterbatasan stok)\b/i],
    [5, /\b(biaya|bpjs|jkn|ongkos|transport|mahal|tidak mampu|ekonomi)\b/i],
    [6, /\b(kebijakan|sk direktur|supervisi|regulasi|manajemen|tata kelola|dinas kesehatan (tidak|belum)|selektif pemberian|prioritas)\b/i],
    [7, /\b(menolak|tidak mau|tidak bersedia|pindah|mangkir|lfu|loss to follow|hilang kontak|tidak (datang|kembali|kontrol)|putus (obat|berobat|arv)|stigma|takut|keluarga|alamat|bekerja|jarak|jauh|kepatuhan|tidak patuh|lupa|menyangkal|denial|tidak diketahui keberadaan)\b/i],
    [8, /\b(kondisi (sudah )?berat|perburukan|stadium (3|4|iii|iv)|ahd|advanced|meninggal (sebelum|dalam|setelah \d+ hari)|kritis|sepsis|io berat|meningitis|kaheksia|syok|cardiopulmonary|henti jantung)\b/i]];
  function klasifikasi(teks) { const t = String(teks || ''); const o = new Set(); KATA.forEach(([i, re]) => { if (re.test(t)) o.add(FAKTOR[i]); }); return [...o]; }
  RCA.storyFaktor = FAKTOR;

  /* ---------------- konteks lintas formulir */
  function konteks(V) {
    const c4 = {}; ((V.C4 || {}).C4 || []).forEach(r => { c4[r.unit] = r.data; });
    const c6byUnit = {}, c6 = {};
    ((V.C6 || {}).C6A || []).forEach(r => { c6[r.unit] = c6[r.unit] || {}; c6[r.unit].A = r; if (r.data.kode_unit_c3) c6byUnit[r.data.kode_unit_c3] = r.unit; });
    ['C6B', 'C6C', 'C6P'].forEach(s => ((V.C6 || {})[s] || []).forEach(r => { c6[r.unit] = c6[r.unit] || {}; c6[r.unit][s.slice(2)] = r; }));
    const c5 = {};
    ['C5_5', 'C5_6', 'C5_41a'].forEach(s => ((V.C5 || {})[s] || []).forEach(r => (r.data.cocok || []).forEach((x, i) => { if (x.kode_unit_c3) (c5[x.kode_unit_c3] = c5[x.kode_unit_c3] || []).push({ sub: s, fac: r.unit, i, row: x }); })));
    const c5id = {}; ((V.C5 || {}).C5ID || []).forEach(r => { c5id[r.unit] = r.data; });
    return { c4, c6, c6byUnit, c5, c5id };
  }

  /* kesenjangan → penjelasan dari C4 (penilaian fasilitas untuk CP yang sama) */
  function dariC4(K, fac, cps, why) {
    const m = (K.c4[fac] || {}).matriks_cp || {};
    cps.forEach(cp => {
      const r = m[cp]; if (!r) return;
      const t = [r.klasifikasi ? 'klasifikasi ' + r.klasifikasi : '', r.masalah ? 'masalah: ' + r.masalah : '', r.dugaan ? 'dugaan penyebab: ' + r.dugaan : ''].filter(Boolean).join(' · ');
      if (t || (r.faktor || []).length) why.push({ sumber: 'C4 ' + fac + ' · ' + cp, jenis: 'fasilitas', teks: t || 'Faktor sistem dicatat penilai fasilitas', faktor: r.faktor || [], asal: 'C4' });
    });
  }

  /* ---------------- C3 unit A: episode TB-HIV */
  function storyA(rec, K) {
    const d = rec.data, u = rec.unit, gaps = [], why = [], tl = [];
    const add = (k, label, extra) => { if (has(d[k])) tl.push(Object.assign({ tgl: d[k], label, kode: k }, ev(d, k), extra || {})); };
    add('U13', 'Diagnosis HIV'); add('U14', 'Pertama kali mulai ARV'); add('P02', 'Gejala pertama tercatat'); add('A00', 'Tercatat sebagai terduga TB');
    add('P05', 'Pemeriksaan TB diminta'); add('P08', 'Hasil pemeriksaan TB diterima'); add('A01', 'Diagnosis TB (' + [d.A02, d.A03, d.A04, d.A05].filter(Boolean).join(', ') + ')');
    add('A07', 'Tes HIV pada episode ini'); add('A08', 'Mulai OAT'); add('P11', 'Penawaran/rujukan ARV'); add('A11', 'Mulai/mulai kembali ARV');
    add('A14', 'Luaran TB: ' + (d.A13 || '?')); add('T04', 'Kontak pelayanan terakhir'); add('T06', 'Kematian tercatat');
    (d.rujukan || []).forEach(r => { if (has(r.tanggal_rujuk)) tl.push({ tgl: r.tanggal_rujuk, label: 'Dirujuk ' + (r.layanan || '') + ' ' + (r.asal || '') + ' → ' + (r.tujuan || '') + (r.tanggal_hadir_di_tujuan ? ' (hadir ' + fmt(r.tanggal_hadir_di_tujuan) + ')' : ' (kehadiran tidak tercatat)'), kode: 'rujukan', src: r.sumber || '', st: r.status || '' }); });
    (d.interupsi || []).forEach(r => { if (has(r.tanggal_jadwal_terlewat)) tl.push({ tgl: r.tanggal_jadwal_terlewat, label: (r.jenis || 'Interupsi') + ' ' + (r.layanan || '') + (r.tanggal_kembali_berobat ? ' (kembali ' + fmt(r.tanggal_kembali_berobat) + ')' : ' (belum kembali)'), kode: 'interupsi', src: r.sumber || '', st: r.status || '' }); });

    // ---- APA YANG TERJADI (langkah kaskade)
    const step = (langkah, cp, jenis, teks, b) => gaps.push({ langkah, cp, jenis, teks, bukti: b });
    const dxOat = A.hari_dx_oat(d), oatArv = A.hari_oat_arv(d), dugaDx = A.hari_terduga_dx(d);
    if (d.A06 === 'Belum dapat dipastikan') step('Status HIV', 'CP3', 'Belum dapat dipastikan', 'Status HIV saat diagnosis TB belum dapat dipastikan', bukti(d, 'A06'));
    if (has(d.A01) && !has(d.A08)) { const s = ev(d, 'A08').st; step('Mulai OAT', 'CP4', s === 'TL' ? 'Tidak dilakukan' : 'Tidak tercatat', 'OAT tidak tercatat dimulai setelah diagnosis TB ' + fmt(d.A01) + (d.A09 ? ' (alasan tercatat: ' + clip(d.A09, 80) + ')' : ''), bukti(d, 'A08')); }
    const cp6 = A.cp6(d);
    if (/^Kesenjangan: terlambat/.test(cp6)) step('Mulai ARV', 'CP6', 'Terlambat', 'ARV dimulai ' + oatArv + ' hari setelah OAT (batas ' + (d.A04 === 'TB RO' ? 56 : 14) + ' hari)' + (A.cp6_pnpk(d) ? '; menurut PNPK 2019: ' + A.cp6_pnpk(d) : ''), bukti(d, 'A11'));
    else if (/^Kesenjangan: tidak dimulai/.test(cp6)) step('Mulai ARV', 'CP6', ev(d, 'A11').st === 'TC' ? 'Tidak tercatat' : 'Tidak dilakukan', 'ARV tidak dimulai selama episode TB (status ARV saat OAT: ' + (d.A10 || '?') + ')', bukti(d, 'A11'));
    else if (cp6 === 'TC belum ditelusuri') step('Mulai ARV', 'CP6', 'Belum dapat dipastikan', 'Mulai ARV tidak ditemukan dan penelusuran belum lengkap', bukti(d, 'A11'));
    else if ((d.A10 === 'Belum pernah ARV' || d.A10 === 'Pernah ARV, terputus') && ev(d, 'A11').st === 'TBL' && d.A13 === 'Meninggal') step('Mulai ARV', 'CP6', 'Tidak sempat', 'ARV belum dimulai; pasien meninggal ' + (has(d.A14) && has(d.A08) ? days(d.A08, d.A14) + ' hari setelah OAT' : 'sebelum ARV dimulai'), bukti(d, 'A11'));
    if (d.A10b === 'Terinterupsi') step('ARV berlanjut', 'CP9', 'Terputus', 'ARV terinterupsi selama pengobatan TB', bukti(d, 'A10b'));
    if (['Putus berobat', 'Tidak dievaluasi', 'Belum diketahui'].includes(d.A13)) step('Luaran TB', 'CP10', d.A13 === 'Putus berobat' ? 'Hasil buruk' : 'Tidak tercatat', 'Luaran pengobatan TB: ' + d.A13, bukti(d, 'A13'));
    if (d.A13 === 'Gagal') step('Luaran TB', 'CP10', 'Hasil buruk', 'Pengobatan TB gagal', bukti(d, 'A13'));
    if (d.A13 === 'Meninggal') step('Luaran TB', 'CP13', 'Meninggal', 'Pasien meninggal' + (has(d.A14) ? ' ' + fmt(d.A14) : '') + (has(d.A14) && has(d.A08) ? ', ' + days(d.A08, d.A14) + ' hari setelah mulai OAT' : ''), bukti(d, 'A13'));
    if (d.A19 === 'Tidak hadir' || d.A18 === 'Tidak hadir') { if (d.A13 !== 'Meninggal') step('Retensi HIV', 'CP14', 'Terputus', 'Tidak hadir di layanan HIV ' + (d.A19 === 'Tidak hadir' ? '180' : '90') + ' hari setelah OAT selesai', bukti(d, d.A19 === 'Tidak hadir' ? 'A19' : 'A18')); }
    if (['Terputus/hilang kontak', 'Pindah, belum terkonfirmasi'].includes(d.T03)) step('Kesinambungan HIV', 'CP12', 'Terputus', 'Status layanan HIV per 30/06/2026: ' + d.T03 + (has(d.T04) ? ' (kontak terakhir ' + fmt(d.T04) + ')' : ''), bukti(d, 'T03'));
    rujInt(d, step);
    dataGap(d, ['A15', 'A16', 'A17', 'T05'], step);

    // ---- MENGAPA
    pushWhy(why, d, [['P22', 'Mekanisme menurut penelaah', 'penelaah'], ['A12', 'Alasan penundaan ARV (tercatat)', 'tercatat'], ['A09', 'Alasan belum mulai OAT (tercatat)', 'tercatat'],
      ['P21', 'Konteks pelayanan', 'konteks'], ['P18', 'Dukungan pengobatan', 'konteks'], ['P12', 'Pemantauan tahap awal', 'konteks'], ['P04', 'Pemeriksaan diagnostik', 'konteks'], ['Z02', 'Uraian ketidaksesuaian data', 'data'], ['U10', 'Akses unit terbatas', 'konteks']]);
    interWhy(d, why);
    if (dugaDx !== '' && dugaDx > 14) why.push({ sumber: 'Linimasa', jenis: 'data', teks: 'Terduga TB sampai diagnosis ' + dugaDx + ' hari' });
    if (dxOat !== '' && dxOat > 7) why.push({ sumber: 'Linimasa', jenis: 'data', teks: 'Diagnosis TB sampai mulai OAT ' + dxOat + ' hari' });
    return finish(rec, 'A', d, tl, gaps, why, K);
  }

  /* ---------------- C3 unit B: riwayat ARV dan TPT */
  function storyB(rec, K) {
    const d = rec.data, gaps = [], why = [], tl = [];
    const add = (k, label) => { if (has(d[k])) tl.push(Object.assign({ tgl: d[k], label, kode: k }, ev(d, k))); };
    add('U13', 'Diagnosis HIV'); add('B01', 'Mulai ARV di fasyankes ini (' + (d.B02 || '') + ')'); add('B03', 'Skrining TB (' + (d.B04 || 'hasil ?') + ')'); add('B06', 'Keputusan diagnostik TB: ' + (d.B05 || '?'));
    add('B07', 'Mulai OAT'); add('B09', 'Penilaian kelayakan TPT: ' + (d.B08 || '?')); add('B12', 'Penawaran TPT: ' + (d.B11 || '?')); add('B13', 'Mulai TPT ' + (d.B14 || '')); add('B17', 'Luaran TPT: ' + (d.B16 || '?'));
    add('T04', 'Kontak pelayanan terakhir'); add('T06', 'Kematian tercatat');
    (d.rujukan || []).forEach(r => { if (has(r.tanggal_rujuk)) tl.push({ tgl: r.tanggal_rujuk, label: 'Dirujuk ' + (r.layanan || '') + ' → ' + (r.tujuan || ''), kode: 'rujukan', src: r.sumber || '' }); });
    (d.interupsi || []).forEach(r => { if (has(r.tanggal_jadwal_terlewat)) tl.push({ tgl: r.tanggal_jadwal_terlewat, label: (r.jenis || 'Interupsi') + ' ' + (r.layanan || ''), kode: 'interupsi', src: r.sumber || '' }); });
    const step = (langkah, cp, jenis, teks, b) => gaps.push({ langkah, cp, jenis, teks, bukti: b });
    const cp2 = A.cp2(d);
    if (/^Kesenjangan/.test(cp2)) step('Skrining TB', 'CP2', ev(d, 'B03').st === 'TL' ? 'Tidak dilakukan' : 'Tidak tercatat', 'Skrining TB saat mulai ARV tidak tercatat atau tidak dilakukan', bukti(d, 'B03'));
    if (d.B04 === 'Positif/indikasi pemeriksaan') { const x = A.hari_skr_dx(d); if (d.B05 === 'Belum selesai') step('Diagnostik TB', 'CP4', 'Tidak selesai', 'Skrining positif, diagnostik TB belum selesai', bukti(d, 'B05')); else if (x !== '' && x > 14) step('Diagnostik TB', 'CP4', 'Terlambat', 'Keputusan diagnostik ' + x + ' hari setelah skrining positif (batas 14 hari)', bukti(d, 'B06')); }
    if (d.B08 === 'Tidak tercatat') step('Kelayakan TPT', 'CP5', 'Tidak tercatat', 'Penilaian kelayakan TPT tidak tercatat', bukti(d, 'B08'));
    if (d.B08 === 'Ditunda') step('Kelayakan TPT', 'CP5', 'Tertunda', 'Penilaian kelayakan TPT ditunda', bukti(d, 'B08'));
    const cp7 = A.cp7(d);
    if (/terlambat/.test(cp7)) step('Mulai TPT', 'CP7', 'Terlambat', 'TPT dimulai ' + A.hari_layak_tpt(d) + ' hari setelah dinyatakan layak (batas 30 hari)', bukti(d, 'B13'));
    else if (/tidak dimulai/.test(cp7)) step('Mulai TPT', 'CP7', 'Tidak dilakukan', 'Layak TPT tetapi TPT tidak dimulai', bukti(d, 'B13'));
    else if (!has(d.B13) && d.B11 === 'Ditawarkan, menolak') step('Mulai TPT', 'CP7', 'Pasien menolak', 'TPT ditawarkan, pasien menolak', bukti(d, 'B11'));
    else if (!has(d.B13) && (d.B11 === 'TC' || d.B11 === 'Tidak ditawarkan (terdokumentasi)') && d.B08 !== 'TBL (TB aktif)') step('Mulai TPT', 'CP7', d.B11 === 'TC' ? 'Tidak tercatat' : 'Tidak dilakukan', 'TPT ' + (d.B11 === 'TC' ? 'tidak tercatat ditawarkan' : 'tidak ditawarkan'), bukti(d, 'B11'));
    if (['Putus', 'Dihentikan: efek samping', 'Belum diketahui'].includes(d.B16) && has(d.B13)) step('Luaran TPT', 'CP11', d.B16 === 'Belum diketahui' ? 'Tidak tercatat' : 'Hasil buruk', 'Luaran TPT: ' + d.B16, bukti(d, 'B16'));
    if (['Terputus/hilang kontak', 'Pindah, belum terkonfirmasi'].includes(d.T03)) step('Kesinambungan HIV', 'CP12', 'Terputus', 'Status layanan HIV per 30/06/2026: ' + d.T03 + (has(d.T04) ? ' (kontak terakhir ' + fmt(d.T04) + ')' : ''), bukti(d, 'T03'));
    if (d.T03 === 'Meninggal') step('Kesinambungan HIV', 'CP13', 'Meninggal', 'Pasien meninggal' + (has(d.T06) ? ' ' + fmt(d.T06) : ''), bukti(d, 'T03'));
    rujInt(d, step);
    dataGap(d, ['B18', 'B19', 'B20', 'T05'], step);
    pushWhy(why, d, [['P22', 'Mekanisme menurut penelaah', 'penelaah'], ['B15', 'Alasan belum mulai TPT (tercatat)', 'tercatat'], ['P17', 'Efek samping dan respons', 'konteks'], ['P21', 'Konteks pelayanan', 'konteks'],
      ['P18', 'Dukungan pengobatan', 'konteks'], ['P04', 'Pemeriksaan diagnostik', 'konteks'], ['Z02', 'Uraian ketidaksesuaian data', 'data'], ['U10', 'Akses unit terbatas', 'konteks']]);
    interWhy(d, why);
    if (has(d.P13)) why.push({ sumber: 'Kunjungan 6 bulan pertama', jenis: 'data', teks: d.P13 + ' kunjungan' + (has(d.P14) ? ', ' + d.P14 + ' dengan skrining TB tercatat' : '') });
    return finish(rec, 'B', d, tl, gaps, why, K);
  }

  /* ---------------- C3 CP3: penetapan status HIV episode TB */
  function storyCP3(rec, K) {
    const d = rec.data, gaps = [], why = [], tl = [];
    if (has(d.R_E)) tl.push({ tgl: d.R_E, label: 'Diagnosis TB', kode: 'R_E' });
    if (has(d.R_G)) tl.push({ tgl: d.R_G, label: 'Tes HIV ditawarkan (' + (d.R_F || '') + ')', kode: 'R_G' });
    if (has(d.R_I)) tl.push({ tgl: d.R_I, label: 'Tes HIV / dokumentasi diagnosis (' + (d.R_K || 'hasil ?') + ')', kode: 'R_I', src: d.R_N || '' });
    const m = A.cp3_mek(d), x = A.hari_dx_tes(d);
    if (/^Pelayanan/.test(m)) gaps.push({ langkah: 'Tes HIV', cp: 'CP3', jenis: /menolak/.test(m) ? 'Pasien menolak' : 'Tidak dilakukan', teks: m.replace('Pelayanan: ', 'Pelayanan: '), bukti: 'R_F ' + (d.R_F || '') + ' · R_H ' + (d.R_H || '') });
    else if (/^Pencatatan/.test(m)) gaps.push({ langkah: 'Pencatatan status HIV', cp: 'R6', jenis: 'Masalah data', teks: m, bukti: 'R_K ' + (d.R_K || '') + ' · R_L ' + (d.R_L || '') });
    else if (/^Belum dapat/.test(m)) gaps.push({ langkah: 'Tes HIV', cp: 'CP3', jenis: 'Belum dapat dipastikan', teks: m, bukti: 'R_F/R_H' });
    if (x !== '' && x > 14 && !/^Pelayanan/.test(m)) gaps.push({ langkah: 'Tes HIV', cp: 'CP3', jenis: 'Terlambat', teks: 'Tes HIV ' + x + ' hari setelah diagnosis TB', bukti: 'R_E/R_I' });
    pushWhy(why, d, [['R_M', 'Alasan tidak dites (tercatat)', 'tercatat'], ['R_R', 'Catatan penelaah', 'penelaah']]);
    return finish(rec, 'CP3', d, tl, gaps, why, K, m);
  }

  const LBL = { A15: 'status HIV di SITB', A16: 'ARV di SITB', A17: 'luaran TB di SITB', T05: 'status ARV di SIHA', B18: 'tanggal mulai ARV di SIHA', B19: 'pemberian TPT di SIHA', B20: 'luaran TPT di SIHA' };
  function dataGap(d, ks, step) {
    const L = RCA.bedaSistem(d, ks);
    if (!L.length && d.Z01 !== 'Ada') return;
    const parts = L.map(k => LBL[k] + ' ' + (d[k] === 'Ya, berbeda' ? 'berbeda dari sumber' : 'tidak tercatat padahal ada di sumber'));
    if (d.Z01 === 'Ada') parts.push(d.Z02 ? 'ketidaksesuaian antarsumber: ' + clip(sentence(d.Z02), 180) : 'ketidaksesuaian antarsumber');
    step('Data', 'R6', 'Masalah data', cap(parts.join('; ')), L.concat(d.Z01 === 'Ada' ? ['Z01'] : []).join(', '));
  }
  function interWhy(d, why) {
    (d.interupsi || []).forEach(r => { const t = [r.alasan_tercatat && !KOSONG.test(r.alasan_tercatat) ? 'alasan: ' + sentence(r.alasan_tercatat) : '', r.upaya_penelusuran_dan_ta ? 'upaya penelusuran: ' + sentence(r.upaya_penelusuran_dan_ta) : ''].filter(Boolean).join(' · ');
      if (t) why.push({ sumber: 'Interupsi ' + (r.layanan || '') + (r.tanggal_jadwal_terlewat ? ' ' + fmt(r.tanggal_jadwal_terlewat) : ''), jenis: 'tercatat', teks: t, kelas: true }); });
  }
  function rujInt(d, step) {
    (d.rujukan || []).forEach(r => { if (!has(r.tanggal_rujuk)) return; const x = days(r.tanggal_rujuk, r.tanggal_hadir_di_tujuan);
      if (x === '' || x > 30) step('Rujukan', 'CP8', x === '' ? 'Tidak tercatat' : 'Terlambat', 'Rujukan ' + (r.layanan || '') + ' ke ' + (r.tujuan || '?') + ' ' + fmt(r.tanggal_rujuk) + (x === '' ? ': kehadiran di tujuan tidak tercatat' : ': hadir ' + x + ' hari kemudian'), 'tabel rujukan · ' + (r.sumber || '')); });
    (d.interupsi || []).forEach(r => { if (r.jenis !== 'Interupsi' && r.jenis !== 'Kunjungan terlewat') return; const x = days(r.tanggal_jadwal_terlewat, r.tanggal_kembali_berobat);
      if (r.jenis === 'Interupsi' && (x === '' || x > 90)) step('Penelusuran', 'CP12', x === '' ? 'Belum kembali' : 'Terlambat', 'Interupsi ' + (r.layanan || '') + ' sejak ' + fmt(r.tanggal_jadwal_terlewat) + (x === '' ? ', belum tercatat kembali' : ', kembali setelah ' + x + ' hari'), 'tabel interupsi · ' + (r.sumber || '')); });
  }
  const KOSONG = /^\s*(alasan[^.]{0,40})?\b(tidak|belum) (tercatat|ada|diketahui|ditemukan)\b[^a-z]*$|^\s*(-|–|tidak ada|tc|tt)\s*\.?\s*$/i;
  const JELAS = new Set(['P22', 'P21', 'A12', 'A09', 'B15', 'R_M', 'R_R', 'P17', 'P18']);
  function pushWhy(why, d, list) {
    list.forEach(([k, label, jenis]) => {
      const v = d[k]; if (!has(v)) return;
      const kosong = KOSONG.test(String(v));
      if (kosong && jenis !== 'tercatat') return;
      why.push({ sumber: label + ' (' + k + ')', jenis: kosong ? 'kosong' : jenis, teks: kosong ? 'Tidak tercatat (' + sentence(v) + ')' : sentence(v), st: d[k + '__st'] || '', src: d[k + '__src'] || '', kelas: !kosong && JELAS.has(k) });
    });
  }

  function finish(rec, frame, d, tl, gaps, why, K, mek) {
    const u = rec.unit, fac = rec.fac;
    const cps = [...new Set(gaps.map(g => g.cp))];
    dariC4(K, fac, cps, why);
    const kasus = K.c6byUnit[u];
    if (kasus) { const c = K.c6[kasus] || {}; const B = (c.B || {}).data || {}, P = (c.P || {}).data || {};
      (B.B4 || []).forEach(x => why.push({ sumber: 'C6 ' + kasus + ' · masalah', jenis: 'kematian', teks: [x.masalah, x.penyumbang ? 'penyumbang: ' + x.penyumbang : '', x.klas ? '(' + x.klas + ')' : ''].filter(Boolean).join(' '), faktor: x.faktor || [], asal: 'C6' }));
      if (B.sebab || B.hubungan) why.push({ sumber: 'C6 ' + kasus + ' · sebab kematian', jenis: 'kematian', teks: [B.sebab, B.hubungan ? 'hubungan dengan TB: ' + B.hubungan : ''].filter(Boolean).join(' · ') });
      (P.faktor || []).forEach(x => why.push({ sumber: 'C6 ' + kasus + ' · panel', jenis: 'kematian', teks: [x.masalah_klinis_atau_pelaya, x.faktor_penyumbang].filter(Boolean).join(' · '), faktor: x.faktor_sistem ? [x.faktor_sistem] : [], asal: 'C6' })); }
    (K.c5[u] || []).forEach(x => why.push({ sumber: 'C5 ' + x.fac + ' ' + ({ C5_5: 'TB/HIV-5', C5_6: 'TB/HIV-6', C5_41a: 'TB/HIV-4.1a' })[x.sub] + ' · ' + (x.row.kode_baris || ''), jenis: 'data', teks: [x.row.jenis || '', x.row.penjelasan || ''].filter(Boolean).join(' · ') || 'Baris pencocokan terkait' }));
    // kategori faktor: dari C4/C6 (penilai) + kata kunci teks penjelasan (otomatis)
    const fk = {};
    why.forEach(w => { (w.faktor || []).forEach(f => { (fk[f] = fk[f] || new Set()).add(w.asal || 'penilai'); }); if (w.kelas) klasifikasi(w.teks).forEach(f => { (fk[f] = fk[f] || new Set()).add('kata kunci'); }); });
    gaps.filter(g => g.jenis === 'Masalah data').forEach(() => { (fk['F3 Sistem informasi'] = fk['F3 Sistem informasi'] || new Set()).add('ketidaksesuaian sistem–sumber'); });
    gaps.filter(g => g.jenis === 'Pasien menolak').forEach(() => { (fk['Faktor pasien/komunitas'] = fk['Faktor pasien/komunitas'] || new Set()).add('jenis kesenjangan'); });
    const faktor = Object.keys(fk).sort((a, b) => FAKTOR.indexOf(a) - FAKTOR.indexOf(b)).map(f => ({ f, asal: [...fk[f]] }));
    tl.sort((a, b) => String(a.tgl).localeCompare(String(b.tgl)));
    const base = tl.find(t => t.kode === (frame === 'B' ? 'B01' : frame === 'CP3' ? 'R_E' : 'A01'));
    tl.forEach(t => { t.hari = base ? days(base.tgl, t.tgl) : ''; });
    const kel = A.kelompok(d);
    const s = {
      key: rec.sub + '|' + u, form: 'C3', sub: rec.sub, unit: u, fac, kk: rec.kk, prov: rec.prov, status: rec.status, frame, kelompok: kel,
      pasien: d.U02 || '', profil: [d.U12, has(d.U11) ? d.U11 + ' th' : ''].filter(Boolean).join(', '), timeline: tl, gaps, why, faktor, mek: mek || '',
      kasusC6: K.c6byUnit[u] || '', ringkas: '', rec
    };
    s.ringkas = narasi(s, d);
    return s;
  }

  /* ringkasan naratif satu paragraf */
  function narasi(s, d) {
    const p = [];
    const who = s.profil ? cap(s.profil) : 'Pasien';
    if (s.frame === 'A') {
      p.push(who + (has(d.U13) ? ', HIV diketahui ' + fmt(d.U13) : '') + '.');
      if (has(d.A01)) p.push('TB ' + (d.A03 ? d.A03.replace(/^[A-Z](?=[a-z])/, c => c.toLowerCase()) : '') + (d.A04 ? ' (' + d.A04 + ')' : '') + ' didiagnosis ' + fmt(d.A01) + (has(d.A00) ? ' (' + A.hari_terduga_dx(d) + ' hari setelah tercatat terduga)' : '') + (has(d.A08) ? '; OAT dimulai ' + (A.hari_dx_oat(d) === 0 ? 'hari yang sama' : A.hari_dx_oat(d) + ' hari kemudian') : '; mulai OAT tidak tercatat') + '.');
      if (d.A10 === 'Sedang ARV') p.push('Sudah menjalani ARV saat OAT dimulai' + (d.A10b ? '; ARV berlanjut selama pengobatan TB: ' + d.A10b : '') + '.');
      else if (has(d.A11)) p.push('ARV dimulai ' + fmt(d.A11) + ', ' + A.hari_oat_arv(d) + ' hari setelah OAT.');
      else if (d.A10) p.push('Status ARV saat OAT: ' + d.A10 + '; ARV tidak tercatat dimulai selama episode.');
      if (d.A13) p.push('Luaran TB: ' + d.A13.replace(/^[A-Z](?=[a-z])/, c => c.toLowerCase()) + (has(d.A14) ? ' (' + fmt(d.A14) + ')' : '') + '.');
      if (d.T03) p.push('Status layanan HIV per 30 Jun 2026: ' + d.T03.replace(/^[A-Z](?=[a-z])/, c => c.toLowerCase()) + '.');
    } else if (s.frame === 'B') {
      p.push(who + (has(d.B01) ? '; mulai ARV ' + fmt(d.B01) + (d.B02 ? ' (' + d.B02 + ')' : '') : '') + '.');
      p.push(has(d.B03) ? 'Skrining TB ' + fmt(d.B03) + ' (' + (d.B04 || 'hasil ?').replace(/^[A-Z](?=[a-z])/, c => c.toLowerCase()) + ').' : 'Skrining TB saat mulai ARV tidak tercatat.');
      if (d.B08) p.push('Kelayakan TPT: ' + d.B08.replace(/^[A-Z](?=[a-z])/, c => c.toLowerCase()) + (has(d.B13) ? '; TPT ' + (d.B14 || '') + ' dimulai ' + fmt(d.B13) + (d.B16 ? ', luaran ' + d.B16.replace(/^[A-Z](?=[a-z])/, c => c.toLowerCase()) : '') : '; TPT tidak tercatat dimulai') + '.');
      if (d.T03) p.push('Status layanan HIV per 30 Jun 2026: ' + d.T03.replace(/^[A-Z](?=[a-z])/, c => c.toLowerCase()) + '.');
    } else {
      p.push('Episode TB ' + (has(d.R_E) ? 'didiagnosis ' + fmt(d.R_E) : '') + '; status HIV di daftar: ' + (d.R_D || '?').replace(/^[A-Z](?=[a-z])/, c => c.toLowerCase()) + '.');
      p.push('Penetapan status HIV: ' + (s.mek || 'belum dinilai').replace(/^[A-Z](?=[a-z])/, c => c.toLowerCase()) + '.');
    }
    if (s.gaps.length) p.push('Titik putus: ' + s.gaps.map(g => g.langkah + ' (' + g.cp + ', ' + g.jenis.replace(/^[A-Z](?=[a-z])/, c => c.toLowerCase()) + ')').join('; ') + '.');
    else p.push('Tidak ditemukan kesenjangan pada langkah yang dinilai.');
    const w = s.why.find(x => x.jenis === 'penelaah') || s.why.find(x => x.jenis === 'tercatat');
    if (w && s.gaps.length) p.push('Penjelasan: ' + clip(w.teks, 220));
    return p.join(' ');
  }

  /* ---------------- C6: cerita kasus kematian */
  function storyC6(kasus, K, calon) {
    const c = K.c6[kasus] || {}; const rA = c.A, a = (rA || {}).data || {}, b = (c.B || {}).data || {}, pn = (c.P || {}).data || {};
    const tl = [], gaps = [], why = [];
    const add = (k, label) => { if (has(a[k])) tl.push(Object.assign({ tgl: a[k], label, kode: k }, ev(a, k))); };
    add('gejala_tgl', 'Gejala pertama'); add('kontak_tgl', 'Kontak pertama terkait TB' + (a.kontak_fas ? ' (' + a.kontak_fas + ')' : '')); add('dx_hiv_tgl', 'Diagnosis HIV'); add('dx_tb_tgl', 'Diagnosis TB');
    add('oat_tgl', 'Mulai OAT'); add('arv_tgl', 'Mulai/ulang ARV'); add('cd4_tgl', 'CD4' + (has(a.cd4) ? ' ' + a.cd4 : '')); add('bahaya_tgl', 'Tanda bahaya pertama'); add('tgl_mati', 'Kematian (' + (a.mati_tempat || '?') + ')');
    (a.kronologi || []).forEach(k => { if (has(k.tgl)) tl.push({ tgl: k.tgl, label: [k.tahap, k.kejadian].filter(Boolean).join(': '), kode: 'kronologi', st: k.status || '', src: k.sumber || '' }); });
    const kat = A.c6_kategori(a);
    if (kat !== 'Tanggal tidak diketahui') gaps.push({ langkah: 'Kematian', cp: 'CP13', jenis: kat, teks: 'Kematian ' + (kat === 'Sebelum OAT' ? 'sebelum OAT dimulai' : kat + ' setelah mulai OAT'), bukti: 'A3' });
    ['T1', 'T2', 'T3', 'T4', 'T5'].forEach(t => { const x = (b.B1 || {})[t] || {}; if (/^[12]$/.test(String(x.skor))) gaps.push({ langkah: ({ T1: 'Akses dan diagnosis', T2: 'Awal terapi', T3: 'Pemantauan', T4: 'Rujukan', T5: 'Penanganan saat memburuk' })[t], cp: t, jenis: 'Mutu kurang (skor ' + x.skor + ')', teks: x.alasan || 'Skor mutu ' + x.skor, bukti: 'B1 ' + t }); });
    [['d1', 'Keterlambatan mencari pelayanan'], ['d2', 'Keterlambatan mencapai layanan tepat'], ['d3', 'Keterlambatan tata laksana di fasyankes']].forEach(([k, l]) => { const x = (b.B2 || {})[k] || {}; if (x.nilai === 'Ada') gaps.push({ langkah: l, cp: k.toUpperCase(), jenis: 'Keterlambatan', teks: x.bukti || l, bukti: 'B2' }); });
    (b.B4 || []).forEach(x => why.push({ sumber: 'Masalah ' + (x.fase || ''), jenis: 'penelaah', teks: [x.masalah, x.respons ? 'respons: ' + x.respons : '', x.penyumbang ? 'penyumbang: ' + x.penyumbang : '', x.klas ? '(' + x.klas + (x.keyakinan ? ', keyakinan ' + x.keyakinan.toLowerCase() : '') + ')' : ''].filter(Boolean).join(' · '), faktor: x.faktor || [], asal: 'C6' }));
    if (b.sebab || b.hubungan || b.peluang) why.push({ sumber: 'Sebab kematian dan kesimpulan (B5)', jenis: 'penelaah', teks: [b.sebab, b.hubungan ? 'hubungan dengan TB: ' + b.hubungan : '', b.peluang ? 'peluang perbaikan: ' + b.peluang : ''].filter(Boolean).join(' · ') });
    (pn.faktor || []).forEach(x => why.push({ sumber: 'Panel', jenis: 'penelaah', teks: [x.masalah_klinis_atau_pelaya, x.faktor_penyumbang, x.peluang_perbaikan_tindakan ? 'perbaikan: ' + x.peluang_perbaikan_tindakan : ''].filter(Boolean).join(' · '), faktor: x.faktor_sistem ? [x.faktor_sistem] : [], asal: 'C6' }));
    if (pn.klas_akhir) why.push({ sumber: 'Klasifikasi akhir panel', jenis: 'penelaah', teks: pn.klas_akhir });
    ['rujukan', 'interupsi', 'bahaya_respons', 'mati_sebab'].forEach(k => { if (has(a[k])) why.push({ sumber: ({ rujukan: 'Rujukan dan kehadiran', interupsi: 'Interupsi dan kepatuhan', bahaya_respons: 'Respons terhadap perburukan', mati_sebab: 'Sebab kematian tercatat' })[k], jenis: 'tercatat', teks: sentence(a[k]) }); });
    (a.A5 || []).forEach(x => why.push({ sumber: 'Informasi tidak tersedia', jenis: 'data', teks: [x.info, x.dampak ? 'dampak: ' + x.dampak : ''].filter(Boolean).join(' · ') }));
    const fk = {}; why.forEach(w => { (w.faktor || []).forEach(f => { (fk[f] = fk[f] || new Set()).add('penelaah C6'); }); if (w.jenis === 'penelaah') klasifikasi(w.teks).forEach(f => { (fk[f] = fk[f] || new Set()).add('kata kunci'); }); });
    tl.sort((x, y) => String(x.tgl).localeCompare(String(y.tgl)));
    const base = tl.find(t => t.kode === 'dx_tb_tgl'); tl.forEach(t => { t.hari = base ? days(base.tgl, t.tgl) : ''; });
    const unitC3 = a.kode_unit_c3 || (calon || {}).kode_unit_c3 || '';
    const s = { key: 'C6|' + kasus, form: 'C6', sub: 'C6A', unit: kasus, fac: (rA || {}).fac || (calon || {}).fasyankes || '', kk: (rA || {}).kk || '', prov: (rA || {}).prov || '', status: (rA || {}).status || '',
      frame: 'C6', kelompok: 'Purposif', pasien: a.kode_pasien || '', profil: [a.jk, has(a.umur) ? a.umur + ' th' : ''].filter(Boolean).join(', '), timeline: tl, gaps, why,
      faktor: Object.keys(fk).sort((x, y) => FAKTOR.indexOf(x) - FAKTOR.indexOf(y)).map(f => ({ f, asal: [...fk[f]] })), kategori: kat, unitC3, rec: rA, recs: c };
    const p = [cap(s.profil || 'Pasien') + '.'];
    if (has(a.dx_tb_tgl)) p.push('TB didiagnosis ' + fmt(a.dx_tb_tgl) + (has(a.oat_tgl) ? ', OAT ' + fmt(a.oat_tgl) : a.oat_tidak === 'Ya' ? ', OAT tidak pernah dimulai' : '') + '.');
    if (a.arv_status) p.push('Status ARV saat TB: ' + a.arv_status + (has(a.arv_tgl) ? ' (ARV ' + fmt(a.arv_tgl) + ')' : '') + '.');
    if (has(a.tgl_mati)) p.push('Meninggal ' + fmt(a.tgl_mati) + (a.mati_tempat ? ' di ' + a.mati_tempat : '') + ' (' + kat.toLowerCase() + ').');
    const low = gaps.filter(g => /^T\d/.test(g.cp)); if (low.length) p.push('Mutu kurang pada fase: ' + low.map(g => g.langkah).join(', ') + '.');
    if (b.peluang) p.push('Peluang perbaikan (penilai 1): ' + b.peluang + '.');
    const w = why.find(x => x.jenis === 'penelaah'); if (w) p.push('Penjelasan: ' + clip(w.teks, 220));
    s.ringkas = p.join(' ');
    return s;
  }

  /* ---------------- bangun semua cerita */
  RCA.story = {
    fmt, ST, klasifikasi, FAKTOR,
    build(V) {
      const K = konteks(V); const out = [];
      ((V.C3 || {}).C3A || []).forEach(r => out.push(storyA(r, K)));
      ((V.C3 || {}).C3B || []).forEach(r => out.push(storyB(r, K)));
      ((V.C3 || {}).C3CP3 || []).forEach(r => out.push(storyCP3(r, K)));
      return out;
    },
    buildC6(V, calon) { const K = konteks(V); const by = {}; (calon || []).forEach(c => { if (c.kode_kasus) by[c.kode_kasus] = c; }); return Object.keys(K.c6).filter(k => K.c6[k].A || K.c6[k].B).map(k => storyC6(k, K, by[k])); },
    konteks
  };
})();
