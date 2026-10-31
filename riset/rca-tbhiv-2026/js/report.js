/* RCA TB-HIV 2026 · Dashboard Laporan
 * Disusun menurut pertanyaan evaluasi Protokol V13 (Q1–Q6), ranah R1–R6, 14 CP, dan keluaran D3/WP7.
 * Satu model laporan → tampilan HTML, Excel (satu lembar per tabel), dan PDF (jsPDF + autotable).
 */
(function () {
  'use strict';
  const RCA = window.RCA, h = RCA.h, S = RCA.S;
  const R = RCA.report = {};
  const D_ = RCA.calc.D, days = RCA.calc.days, has = RCA.calc.has;
  const pct = (n, N) => N ? Math.round(n / N * 1000) / 10 : null;
  const nN = (n, N) => N ? n + '/' + N + ' (' + pct(n, N) + '%)' : '–';
  const q = (a, p) => { const x = a.filter(v => v !== '' && v !== null && !isNaN(v)).map(Number).sort((m, n) => m - n); if (!x.length) return null; const i = (x.length - 1) * p, lo = Math.floor(i), hi = Math.ceil(i); return Math.round((x[lo] + (x[hi] - x[lo]) * (i - lo)) * 10) / 10; };
  const medIqr = a => { const n = a.filter(v => v !== '' && v !== null && !isNaN(v)).length; return n ? [q(a, .5), q(a, .25) + '–' + q(a, .75), n] : ['–', '–', 0]; };
  const CP_INFO = {}; (S.forms.C4.sub[0].sections.find(s => s.id === 'matriks_cp') || { rows: [] }).rows.forEach(r => { CP_INFO[r.k] = { fokus: r.l.replace(/^\S+\s/, ''), ranah: (r.v || {}).ro_C || '' }; });
  const PROV = () => RCA.state.regions.prov;
  const STAT = ['Belum', 'Draf', 'Dikirim', 'Dikembalikan', 'Valid'];

  /* ================================================================ model */
  function build(D, U, f) {
    const inProv = r => !f.prov || r.prov === f.prov || (r.kk && RCA.reg.kk(r.kk).prov === f.prov);
    const V = {}; ['C1', 'C3', 'C4', 'C5', 'C6', 'C7'].forEach(fm => { V[fm] = {}; Object.keys(D[fm] || {}).forEach(s => { V[fm][s] = (D[fm][s] || []).filter(inProv); }); });
    const units = {}; Object.keys(U).forEach(fm => { units[fm] = (U[fm] || []).filter(inProv); });
    const c2 = D.C2 || {}; const sel = (c2.selected || []).filter(inProv);
    const A = (V.C3.C3A || []).map(r => Object.assign({ _fac: r.fac, _kk: r.kk, _prov: r.prov }, r.data));
    const B = (V.C3.C3B || []).map(r => Object.assign({ _fac: r.fac, _kk: r.kk, _prov: r.prov }, r.data));
    const C = (V.C3.C3CP3 || []).map(r => Object.assign({ _fac: r.fac, _kk: r.kk, _prov: r.prov }, r.data));
    const facs = RCA.state.regions.fac.filter(x => !f.prov || RCA.reg.kk(x.kk).prov === f.prov);
    const rk = RCA.c3Rekap(A, B, C);
    const sections = [];
    const sec = (id, title, intro) => { const s = { id, title, intro, blocks: [] }; sections.push(s); return s; };
    const T = (s, id, title, head, rows, note) => { s.blocks.push({ type: 'table', id, title, head, rows: rows.length ? rows : [head.map((x, i) => i ? '' : 'Belum ada data Valid')], note }); };
    const P = (s, text) => s.blocks.push({ type: 'p', text });
    const L = (s, items) => s.blocks.push({ type: 'list', items });

    /* ---------- 0 ringkasan */
    const s0 = sec('ringkasan', 'Ringkasan', 'Ringkasan otomatis dari data berstatus Valid. Angka sampel menggambarkan pola dalam sampel, bukan prevalensi fasyankes atau estimasi nasional.');
    const cpAcak = Object.keys(rk).filter(k => rk[k].acak_N).map(k => [k, rk[k].acak_n / rk[k].acak_N, rk[k]]).sort((a, b) => b[1] - a[1]);
    const c6B = V.C6.C6B || [];
    const ses = V.C7.C7S || [];
    const bullets = [
      `Unit telaah C3 terpilih: ${sel.length} (target inti ${facs.length * 18}); Valid: ${A.length} unit A, ${B.length} unit B, ${C.length} episode CP3.`,
      cpAcak.length ? `Kesenjangan tertinggi pada unit acak/sensus: ${cpAcak.slice(0, 3).map(x => x[0] + ' ' + nN(x[2].acak_n, x[2].acak_N)).join('; ')}.` : 'Rekap CP dari C3 belum tersedia (belum ada unit Valid).',
      `Penilaian fasilitas C4 Valid: ${(V.C4.C4 || []).length} dari ${facs.length} fasyankes.`,
      `Verifikasi sentinel C5: ${['C5_5', 'C5_6', 'C5_41a'].reduce((a, s) => a + (V.C5[s] || []).length, 0)} lembar indikator Valid dari ${facs.filter(x => x.sentinel === 'Ya').length * 3} yang direncanakan.`,
      `Telaah kematian C6: ${(V.C6.C6A || []).length} kasus Valid; ${c6B.filter(r => r.data.peluang === 'Ya').length} dengan peluang perbaikan menurut penelaah pertama.`,
      `Wawancara/diskusi C7 Valid: ${ses.filter(r => /-W/.test(r.unit)).length} wawancara dan ${ses.filter(r => /-F/.test(r.unit)).length} diskusi kelompok.`
    ];
    L(s0, bullets);

    /* ---------- 1 pelaksanaan */
    const s1 = sec('pelaksanaan', '1. Pelaksanaan pengumpulan data dan kelengkapan', 'Status pengisian per formulir, capaian sampel terhadap target Protokol V13 Bagian 10–12, dan pembedaan jumlah unit, dokumen, kasus, serta pasien unik.');
    T(s1, 'T1.1', 'Status pengisian per formulir', ['Formulir', 'Unit'].concat(STAT).concat(['% Valid']),
      ['C1', 'C3', 'C4', 'C5', 'C6', 'C7'].map(fm => { const us = units[fm] || []; const c = s => us.filter(u => u.status === s).length; return [S.forms[fm].title, us.length].concat(STAT.map(c)).concat([us.length ? pct(c('Valid'), us.length) + '%' : '–']); }));
    T(s1, 'T1.2', 'Sampel C3 per fasyankes (target inti 6 per kerangka; 18 per fasyankes)', ['Fasyankes', 'A terpilih', 'B terpilih', 'CP3 terpilih', 'Total/target', 'Unit Valid', 'Tidak berhasil ditelaah', 'Pasien unik'],
      facs.map(fc => { const s = sel.filter(x => x.fac === fc.code); const v = A.concat(B, C).filter(x => x._fac === fc.code).length;
        return [RCA.reg.facLabel(fc), s.filter(x => x.frame === 'A').length, s.filter(x => x.frame === 'B').length, s.filter(x => x.frame === 'CP3').length, s.length + '/18', v, s.filter(x => x.telaah === 'Tidak berhasil').length, new Set(s.map(x => x.pid)).size]; }));
    const provs = PROV().filter(p => !f.prov || p.code === f.prov);
    const T7 = S.c7.target;
    const P7 = { SUT: 'SUT', DKI: 'DKI', JBR: 'JBR', JTM: 'JTM', BAL: 'BAL', PPA: 'PPA' };
    T(s1, 'T1.3', 'Telaah kematian, sesi kualitatif, dan sentinel per provinsi', ['Provinsi', 'Calon C6', 'Kasus C6 terpilih', 'C6 Valid (target ≤10)', 'Sesi C7 Valid (target)', 'Sentinel', 'Indikator C5 Valid (dari 3)'],
      provs.map(p => { const cal = (c2.calon || []).filter(x => RCA.reg.kk(x.kk).prov === p.code); const sent = RCA.state.regions.fac.filter(x => x.sentinel === 'Ya' && RCA.reg.kk(x.kk).prov === p.code);
        return [p.name, cal.length, cal.filter(x => x.dipilih === 'Ya').length, (V.C6.C6A || []).filter(r => r.prov === p.code).length,
          ses.filter(r => r.unit.startsWith(P7[p.code] + '-')).length + ' (' + (T7[p.code] || '') + ')', sent.map(x => x.code).join(', ') || 'belum ditetapkan',
          sent.length ? ['C5_5', 'C5_6', 'C5_41a'].filter(s => (V.C5[s] || []).some(r => r.unit === sent[0].code)).length : '–']; }));

    /* ---------- 2 Q1 */
    const s2 = sec('q1', '2. Q1 · Kapan dan pada tahap mana pelayanan terputus', 'Rekonstruksi pelayanan dari telaah catatan C3 (WP4). n = unit dengan kesenjangan; N = unit yang dapat dinilai. Acak/sensus dan purposif disajikan terpisah; unit purposif menjelaskan mekanisme dan tidak dipakai untuk frekuensi.');
    const CPS = ['CP2', 'CP3', 'CP5', 'CP6', 'CP7', 'CP8', 'CP10', 'CP11', 'CP12', 'CP14', 'R6'];
    T(s2, 'T2.1', 'Rekap kesenjangan per titik penilaian (C3)', ['CP', 'Ranah', 'Fokus', 'Acak/sensus n/N', 'Purposif n/N', 'BD / pengamatan belum cukup'],
      CPS.map(cp => { const o = rk[cp] || { acak_n: 0, acak_N: 0, purp_n: 0, purp_N: 0, bd: 0 }; const i = CP_INFO[cp] || {}; return [cp, i.ranah || (cp === 'R6' ? 'R6' : ''), i.fokus || 'Kesesuaian SITB/SIHA', nN(o.acak_n, o.acak_N), nN(o.purp_n, o.purp_N), o.bd]; }));
    const AU = RCA.AUTO;
    const iv = (lab, arr) => { const m = medIqr(arr); return [lab, m[0], m[1], m[2]]; };
    T(s2, 'T2.2', 'Waktu antartahap (hari; median dan rentang interkuartil, hanya tanggal sahih)', ['Selang', 'Median', 'IQR', 'n'], [
      iv('Terduga TB → diagnosis TB (A)', A.map(AU.hari_terduga_dx)), iv('Diagnosis TB → tes HIV (A)', A.map(AU.hari_dx_teshiv)), iv('Diagnosis TB → mulai OAT (A)', A.map(AU.hari_dx_oat)),
      iv('Mulai OAT → mulai ARV (A, belum/putus ARV)', A.filter(d => d.A10 === 'Belum pernah ARV' || d.A10 === 'Pernah ARV, terputus').map(AU.hari_oat_arv)),
      iv('Mulai ARV → skrining TB (B)', B.map(AU.hari_arv_skr)), iv('Skrining → keputusan diagnostik (B)', B.map(AU.hari_skr_dx)), iv('Kelayakan → mulai TPT (B)', B.map(AU.hari_layak_tpt)),
      iv('Diagnosis TB → tes HIV (CP3)', C.map(AU.hari_dx_tes))]);
    const arvNeed = A.filter(d => d.A10 === 'Belum pernah ARV' || d.A10 === 'Pernah ARV, terputus');
    const cp6 = arvNeed.map(AU.cp6);
    T(s2, 'T2.3', 'Inisiasi ARV pada episode TB-HIV yang belum/pernah terputus ARV (CP6; Juknis 2023: ≤14 hari TB SO, ≤56 hari TB RO)', ['Kategori', 'Jumlah'],
      ['Terjadi dalam batas', 'Kesenjangan: terlambat', 'Kesenjangan: tidak dimulai', 'Terjadi, waktu dinilai klinis', 'Terjadi, waktu belum dapat dinilai', 'Jendela pengamatan belum cukup', 'TC belum ditelusuri', 'BD', 'St kosong'].map(k => [k, cp6.filter(x => x === k).length]).concat([['Sensitivitas PNPK 2019: terlambat', arvNeed.map(AU.cp6_pnpk).filter(x => /^Terlambat/.test(x)).length]]));
    const cnt = (arr, fn) => arr.filter(fn).length;
    T(s2, 'T2.4', 'Kaskade pencegahan pada unit B (Protokol V13 Bagian 6)', ['Tahap', 'Jumlah unit', 'Dari tahap sebelumnya'], (() => {
      const st = [['Unit B dapat ditelaah', cnt(B, d => d.U09 !== 'Tidak dapat ditelaah')], ['Skrining TB tercatat saat mulai ARV (St B03 = Y)', cnt(B, d => d.B03__st === 'Y')],
        ['Skrining negatif atau TB disingkirkan', cnt(B, d => d.B04 === 'Negatif' || d.B05 === 'Bukan TB')], ['Kelayakan TPT dinilai (B08 terisi)', cnt(B, d => has(d.B08) && d.B08 !== 'Tidak tercatat')],
        ['Layak TPT', cnt(B, d => d.B08 === 'Layak')], ['TPT ditawarkan', cnt(B, d => /^Ditawarkan/.test(d.B11 || ''))], ['TPT dimulai (St B13 = Y)', cnt(B, d => d.B13__st === 'Y')],
        ['TPT lengkap', cnt(B, d => d.B16 === 'Lengkap')]];
      return st.map((x, i) => [x[0], x[1], i ? nN(x[1], st[i - 1][1]) : '']);
    })(), 'Persentase bersyarat N(j+1)/N(j). Penurunan diperiksa untuk membedakan ketidaklayakan klinis, penolakan, pengamatan belum cukup, dan status belum diketahui sebelum disebut kegagalan pelayanan.');
    const ruj = [], intr = [];
    A.concat(B).forEach(d => { (d.rujukan || []).forEach(r => ruj.push(r)); (d.interupsi || []).forEach(r => intr.push(r)); });
    const rujT = ruj.filter(r => r.tanggal_rujuk), rujOk = rujT.filter(r => { const x = days(r.tanggal_rujuk, r.tanggal_hadir_di_tujuan); return x !== '' && x <= 30; });
    const intI = intr.filter(r => r.jenis === 'Interupsi'), intOk = intI.filter(r => { const x = days(r.tanggal_jadwal_terlewat, r.tanggal_kembali_berobat); return x !== '' && x <= 90; });
    T(s2, 'T2.5', 'Rujukan (CP8) dan kembali berobat (CP12)', ['Ukuran', 'Hasil', 'Median hari (IQR)'], [
      ['Rujukan bertanggal, hadir di tujuan ≤30 hari', nN(rujOk.length, rujT.length), (m => m[0] + ' (' + m[1] + ')')(medIqr(rujT.map(r => days(r.tanggal_rujuk, r.tanggal_hadir_di_tujuan))))],
      ['Interupsi, kembali berobat ≤90 hari', nN(intOk.length, intI.length), (m => m[0] + ' (' + m[1] + ')')(medIqr(intI.map(r => days(r.tanggal_jadwal_terlewat, r.tanggal_kembali_berobat))))]]);
    T(s2, 'T2.6', 'Luaran pengobatan TB unit A (sampai 30/06/2026)', ['Luaran', 'Jumlah'], (S.forms.C3.sub[0].sections.flatMap(s => s.fields || []).find(x => x.k === 'A13') || { o: [] }).o.map(o => [o, cnt(A, d => d.A13 === o)]));

    /* ---------- 3 Q2 */
    const s3 = sec('q2', '3. Q2 · Kontribusi masalah pencatatan dan keterhubungan sistem', 'Verifikasi dua arah di sentinel (C5) dan perbandingan butir sistem pada unit C3. Temuan sentinel menjelaskan mekanisme dan tidak diekstrapolasi menjadi estimasi kesalahan nasional.');
    const ids = {}; (V.C5.C5ID || []).forEach(r => { ids[r.unit] = r.data; });
    const fvT = v => v === undefined ? '–' : v.toFixed(2) + (v > 1.1 ? ' (pelaporan kurang)' : v < 0.9 ? ' (pelaporan lebih)' : ' (dalam batas)');
    const rows31 = [], jenis = {};
    [['5', 'C5_5', 'TB/HIV-5'], ['6', 'C5_6', 'TB/HIV-6'], ['41a', 'C5_41a', 'TB/HIV-4.1a']].forEach(([ind, sub, nm]) => (V.C5[sub] || []).forEach(r => {
      const id = ids[r.unit] || {}; const c = RCA.c5.ctx(ind, id); const x = RCA.c5.recap(r.data.cocok || [], c, id);
      Object.entries(x.jenis).forEach(([k, v]) => { jenis[nm] = jenis[nm] || {}; jenis[nm][k] = (jenis[nm][k] || 0) + v; });
      rows31.push([r.unit, nm, c.met || '–', c.model || '–', (x.lapN !== null ? x.lapN : '–') + '/' + (x.lapD !== null ? x.lapD : '–'), x.N_sis + '/' + x.D_sis, x.N_src + '/' + x.D_src, fvT(x.FV_N), fvT(x.FV_D), x.alasan || 'Sah']);
    }));
    T(s3, 'T3.1', 'Penghitungan ulang dan faktor verifikasi per sentinel (N/D)', ['Sentinel', 'Indikator', 'Metode', 'Model', 'Dilaporkan N/D', 'Sistem N/D', 'Sumber N/D', 'FV pembilang', 'FV penyebut', 'Kesahihan'], rows31,
      'FV = hitung ulang ÷ dilaporkan; batas kerja 0,90–1,10. FV hanya sah untuk model A, sensus periode efektif, kedua arah selesai, dan tanpa baris yang belum diperiksa.');
    const JN = ['Sesuai', 'Pelayanan belum tercatat dalam sistem', 'Entri tanpa bukti sumber', 'Perbedaan definisi atau periode', 'Duplikasi', 'Perpindahan fasilitas', 'Keterlambatan entri', 'Perbedaan belum terselesaikan'];
    T(s3, 'T3.2', 'Jenis ketidaksesuaian yang ditetapkan (jumlah baris)', ['Jenis'].concat(['TB/HIV-5', 'TB/HIV-6', 'TB/HIV-4.1a']), JN.map(j => [j].concat(['TB/HIV-5', 'TB/HIV-6', 'TB/HIV-4.1a'].map(n => (jenis[n] || {})[j] || 0))));
    const sysItems = [['A15 Status HIV di SITB', A, 'A15'], ['A16 Pengobatan ARV di SITB', A, 'A16'], ['A17 Luaran TB di SITB', A, 'A17'], ['B18 Tanggal mulai ARV di SIHA', B, 'B18'], ['B19 Pemberian TPT di SIHA', B, 'B19'], ['B20 Luaran TPT di SIHA', B, 'B20'], ['T05 Status ARV per 30/06/2026 di SIHA', A.concat(B), 'T05']];
    T(s3, 'T3.3', 'Kesesuaian butir sistem pada unit C3', ['Butir', 'Ya, sesuai', 'Ya, berbeda', 'Tidak tercatat', 'Belum dicek'], sysItems.map(([l, arr, k]) => [l].concat(['Ya, sesuai', 'Ya, berbeda', 'Tidak tercatat', 'Belum dicek'].map(v => cnt(arr, d => d[k] === v)))));
    const mek = {}; C.forEach(d => { const m = AU.cp3_mek(d); if (m) mek[m] = (mek[m] || 0) + 1; });
    T(s3, 'T3.4', 'CP3: mekanisme penetapan status HIV (pelayanan vs pencatatan)', ['Mekanisme', 'Jumlah episode'], Object.entries(mek).sort((a, b) => b[1] - a[1]));

    /* ---------- 4 Q3 */
    const s4 = sec('q3', '4. Q3 · Perbandingan pasangan kab/kota capaian rendah dan tinggi', 'Perbandingan dalam provinsi memerlukan periode, definisi, dan perspektif yang setara. Tabel ini menyandingkan bukti; penjelasan perbedaan diuji melalui WP7.');
    const kkRow = k => {
      const c1 = (V.C1.C1 || []).find(r => r.unit === k.code); const du = (c1 && c1.data.dugaan) || [];
      const a = A.filter(d => d._kk === k.code), b = B.filter(d => d._kk === k.code), cc = C.filter(d => d._kk === k.code);
      const r = RCA.c3Rekap(a, b, cc); const g = cp => r[cp] ? nN(r[cp].acak_n, r[cp].acak_N) : '–';
      const c4 = (V.C4.C4 || []).filter(x => x.kk === k.code); const kl = c4.flatMap(x => Object.values(x.data.matriks_cp || {}).map(m => m.klasifikasi || ''));
      return [k.name, k.capaian, c1 ? (c1.data.skor || '–') : '–', du.length ? du.filter(x => x.status === 'Didukung').length + '/' + du.filter(x => x.status === 'Dibantah').length + '/' + du.length : '–',
        g('CP3'), g('CP6'), g('CP7'), g('CP8'), kl.filter(x => /terverifikasi/i.test(x)).length + '/' + kl.filter(x => /sebagian/i.test(x)).length + '/' + kl.filter(x => /tidak terlaksana/i.test(x)).length];
    };
    T(s4, 'T4.1', 'Perbandingan pasangan kab/kota', ['Kab/kota', 'Capaian', 'Skor kaskade C1', 'Dugaan C1 didukung/dibantah/total', 'CP3 acak n/N', 'CP6 acak n/N', 'CP7 acak n/N', 'CP8 acak n/N', 'CP C4: terverifikasi/sebagian/tidak'],
      RCA.state.regions.kk.filter(k => !f.prov || k.prov === f.prov).sort((a, b) => a.prov.localeCompare(b.prov) || a.capaian.localeCompare(b.capaian)).map(kkRow));

    /* ---------- 5 profil proses fasilitas */
    const s5 = sec('c4', '5. Profil proses fasilitas dan 14 titik penilaian (C4; masukan D3)', 'Klasifikasi CP ditetapkan dari bukti proses dan unit acak/sensus. Keempat belas CP tidak dijumlahkan menjadi skor fasilitas.');
    const c4r = V.C4.C4 || []; const cpk = Object.keys(CP_INFO);
    const ab = v => /terverifikasi/i.test(v) ? 'Terverifikasi' : /sebagian/i.test(v) ? 'Sebagian' : /tidak terlaksana/i.test(v) ? 'Tidak' : /Tidak berlaku/.test(v) ? 'TBL' : /Belum/.test(v) ? 'Belum pasti' : '';
    T(s5, 'T5.1', 'Klasifikasi akhir per CP dan fasyankes', ['Fasyankes'].concat(cpk), c4r.map(r => [r.unit].concat(cpk.map(c => ab(((r.data.matriks_cp || {})[c] || {}).klasifikasi || '')))));
    T(s5, 'T5.2', 'Rekap klasifikasi per CP (jumlah fasyankes)', ['CP', 'Fokus', 'Terverifikasi', 'Sebagian/terlambat', 'Tidak terlaksana', 'Belum pasti', 'TBL'],
      cpk.map(c => { const v = c4r.map(r => ab(((r.data.matriks_cp || {})[c] || {}).klasifikasi || '')); return [c, (CP_INFO[c] || {}).fokus].concat(['Terverifikasi', 'Sebagian', 'Tidak', 'Belum pasti', 'TBL'].map(k => v.filter(x => x === k).length)); }));
    const fk = {}; c4r.forEach(r => Object.values(r.data.matriks_cp || {}).forEach(m => (m.faktor || []).forEach(x => { fk[x] = (fk[x] || 0) + 1; })));
    T(s5, 'T5.3', 'Faktor sistem yang dikaitkan dengan temuan CP (WHO building blocks)', ['Faktor', 'Jumlah CP-fasyankes'], Object.entries(fk).sort());
    const dug = []; c4r.forEach(r => (r.data.dugaan || []).forEach(d => dug.push([r.unit, d.dugaan_penyebab_awal || '', d.cp_terkait || '', d.hasil_akhir || '', d.bukti_penentu || '', d.penjelasan_alternatif_yang || ''])));
    T(s5, 'T5.4', 'Hasil uji dugaan penyebab awal C1 di fasyankes', ['Fasyankes', 'Dugaan', 'CP', 'Hasil akhir', 'Bukti penentu', 'Penjelasan alternatif'], dug);
    const pb = []; c4r.forEach(r => Object.entries(r.data.matriks_cp || {}).forEach(([cp, m]) => { if (m.praktik_baik) pb.push([r.unit, cp, m.praktik_baik]); }));
    T(s5, 'T5.5', 'Praktik yang berjalan baik', ['Fasyankes', 'CP', 'Uraian'], pb);

    /* ---------- 6 Q4 */
    const s6 = sec('q4', '6. Q4 · Tahap kematian dan peluang perbaikan pelayanan (C6; WP5)', 'Telaah berbasis catatan untuk pembelajaran program, tanpa menyalahkan. Sampel purposif hingga 60 kasus tidak dipakai untuk angka mortalitas, kekurangan pelaporan, atau proporsi kematian yang dapat dicegah.');
    const A6 = {}, B6 = {}, C6 = {}, P6 = {};
    (V.C6.C6A || []).forEach(r => { A6[r.unit] = r.data; }); (V.C6.C6B || []).forEach(r => { B6[r.unit] = r.data; }); (V.C6.C6C || []).forEach(r => { C6[r.unit] = r.data; }); (V.C6.C6P || []).forEach(r => { P6[r.unit] = r.data; });
    const kat = {}; Object.values(A6).forEach(d => { const k = AU.c6_kategori(d); kat[k] = (kat[k] || 0) + 1; });
    T(s6, 'T6.1', 'Waktu kematian sejak mulai OAT', ['Kategori', 'Jumlah kasus'], ['Sebelum OAT', '0–14 hari', '15–30 hari', '31–90 hari', '91–180 hari', 'Lebih dari 180 hari', 'Waktu OAT tidak diketahui', 'Tanggal tidak diketahui'].map(k => [k, kat[k] || 0]));
    const TT = [['T1', 'Akses dan diagnosis'], ['T2', 'Awal terapi'], ['T3', 'Pemantauan'], ['T4', 'Rujukan'], ['T5', 'Penanganan saat memburuk']];
    T(s6, 'T6.2', 'Mutu pelayanan per fase dan kesepakatan antarpenelaah', ['Fase', 'Dinilai (P1)', 'Mutu kurang (skor 1–2)', 'Median skor', 'Pasangan P1–P2', 'Sepakat tepat', 'Kappa dikotomi'],
      TT.map(([t, l]) => { const s1 = Object.values(B6).map(b => ((b.B1 || {})[t] || {}).skor).filter(v => /^[1-5]$/.test(v));
        const pr = Object.keys(C6).map(u => [(((B6[u] || {}).B1 || {})[t] || {}).skor, ((C6[u].C1 || {})[t] || {}).skor]).filter(p => /^[1-5]$/.test(p[0]) && /^[1-5]$/.test(p[1])); const k = RCA.kappa(pr);
        return [t + ' ' + l, s1.length, nN(s1.filter(v => v <= 2).length, s1.length), q(s1, .5) === null ? '–' : q(s1, .5), pr.length, nN(pr.filter(p => p[0] === p[1]).length, pr.length), k.kappa === null ? (pr.length < 5 ? 'n < 5' : '–') : k.kappa.toFixed(2)]; }));
    const bs = Object.values(B6);
    T(s6, 'T6.3', 'Peluang perbaikan dan tiga keterlambatan (penilaian pertama; akhir bila sudah dipanelkan)', ['Ukuran', 'Hasil'], [
      ['Peluang perbaikan (P1 = Ya)', nN(bs.filter(b => b.peluang === 'Ya').length, bs.length)],
      ['Peluang perbaikan akhir setelah panel', nN(Object.values(P6).filter(p => p.peluang_akhir === 'Ya').length, Object.keys(P6).length)],
      ['Keterlambatan 1: mencari pelayanan', nN(bs.filter(b => ((b.B2 || {}).d1 || {}).nilai === 'Ada').length, bs.length)],
      ['Keterlambatan 2: mencapai layanan tepat', nN(bs.filter(b => ((b.B2 || {}).d2 || {}).nilai === 'Ada').length, bs.length)],
      ['Keterlambatan 3: tata laksana di fasyankes', nN(bs.filter(b => ((b.B2 || {}).d3 || {}).nilai === 'Ada').length, bs.length)],
      ['Dugaan terkait TB (bukan sebab resmi)', bs.filter(b => b.hubungan === 'Terkait TB').length]]);
    const mas = []; Object.entries(B6).forEach(([u, b]) => (b.B4 || []).forEach(x => mas.push([u, x.fase || '', x.masalah || '', (x.faktor || []).join('; '), x.klas || '', x.peluang || '', x.keyakinan || ''])));
    T(s6, 'T6.4', 'Masalah, faktor penyumbang, dan peluang perbaikan (B4)', ['Kasus', 'Fase', 'Masalah', 'Faktor sistem', 'Klasifikasi', 'Peluang perbaikan', 'Keyakinan'], mas);

    /* ---------- 7 Q5 */
    const s7 = sec('q5', '7. Q5 · Kelompok yang belum mencapai tahap berikutnya dan hambatan yang dialami', 'Pemilahan sampel C3 menurut jenis kelamin dan umur, serta tema pengalaman pasien, komunitas, dan petugas (C7). Jumlah informan menunjukkan partisipasi, bukan prevalensi hambatan.');
    const grp = (d, by) => by === 'jk' ? (d.U12 || 'Tidak tercatat') : (d.U11 === undefined || d.U11 === '' ? 'Tidak tercatat' : Number(d.U11) < 25 ? '< 25 tahun' : Number(d.U11) < 50 ? '25–49 tahun' : '≥ 50 tahun');
    ['jk', 'umur'].forEach(by => {
      const keys = [...new Set(A.concat(B).map(d => grp(d, by)))].sort();
      T(s7, by === 'jk' ? 'T7.1' : 'T7.2', 'Kesenjangan pada unit acak/sensus menurut ' + (by === 'jk' ? 'jenis kelamin' : 'kelompok umur'), [by === 'jk' ? 'Jenis kelamin' : 'Umur', 'CP2', 'CP5', 'CP6', 'CP7', 'CP10'],
        keys.map(k => { const r = RCA.c3Rekap(A.filter(d => grp(d, by) === k), B.filter(d => grp(d, by) === k), []); return [k].concat(['CP2', 'CP5', 'CP6', 'CP7', 'CP10'].map(cp => r[cp] ? nN(r[cp].acak_n, r[cp].acak_N) : '–')); }));
    });
    const tema = {}; ses.forEach(r => (r.data.tema || []).forEach(t => { if (t.tema) { tema[t.tema] = tema[t.tema] || { n: 0, cp: new Set(), ses: new Set() }; tema[t.tema].n++; if (t.cp) tema[t.tema].cp.add(t.cp); tema[t.tema].ses.add(r.unit); } }));
    T(s7, 'T7.3', 'Tema berkode dari wawancara dan diskusi (C7)', ['Tema', 'Kemunculan', 'Sesi', 'CP/faktor terkait'], Object.entries(tema).sort((a, b) => b[1].n - a[1].n).map(([k, v]) => [k, v.n, v.ses.size, [...v.cp].join(', ')]));
    const K7 = V.C7.C7K || []; const ccols = (S.forms.C7.sub[1].sections[0].fields || []).filter(x => x.t === 'select');
    T(s7, 'T7.4', 'Cakupan perspektif per kab/kota', ['Kab/kota'].concat(ccols.map(c => c.l)), K7.map(r => [RCA.reg.kkName(r.unit)].concat(ccols.map(c => r.data[c.k] || ''))));

    /* ---------- 8 sintesis */
    const s8 = sec('q6', '8. Q6 · Bahan sintesis akar masalah dan tindakan (masukan WP7)', 'Daftar dugaan penyebab beserta bukti dan keyakinannya untuk diuji pada lokakarya akar masalah 2027. Suatu penyebab baru ditetapkan sebagai akar masalah bila: (1) mekanismenya terhadap titik putus didukung bukti dengan keyakinan sekurang-kurangnya sedang; (2) berada dalam kendali program, fasilitas, atau sektor; (3) bila diatasi, titik putus diperkirakan berkurang bermakna; dan (4) memenuhi kriteria lain Protokol V13 Bagian 13.');
    const mat = [];
    c4r.forEach(r => Object.entries(r.data.matriks_cp || {}).forEach(([cp, m]) => { if (m.dugaan || m.masalah) mat.push([r.unit, cp, (CP_INFO[cp] || {}).ranah || '', m.masalah || '', m.dugaan || '', (m.faktor || []).join('; '), m.keyakinan || '', m.kode_bukti || '', m.alternatif || '']); }));
    T(s8, 'T8.1', 'Matriks dugaan penyebab dari C4', ['Fasyankes', 'CP', 'Ranah', 'Masalah utama', 'Dugaan penyebab', 'Faktor sistem', 'Keyakinan', 'Kode bukti', 'Penjelasan alternatif'], mat);
    const kf = {}; mat.forEach(m => { const k = m[1] + ' | ' + (m[5] || 'tanpa faktor'); kf[k] = kf[k] || { n: 0, tinggi: 0, fas: new Set() }; kf[k].n++; if (m[6] === 'Tinggi') kf[k].tinggi++; kf[k].fas.add(m[0]); });
    T(s8, 'T8.2', 'Pola lintas fasyankes: CP × faktor sistem', ['CP | faktor', 'Jumlah temuan', 'Fasyankes', 'Keyakinan tinggi'], Object.entries(kf).sort((a, b) => b[1].n - a[1].n).map(([k, v]) => [k, v.n, v.fas.size, v.tinggi]));
    const us = []; ses.forEach(r => { if (r.data.usulan) us.push([r.unit, r.data.usulan]); }); c4r.forEach(r => { if (r.data.tiga_temuan_utama) us.push([r.unit + ' (C4)', r.data.tiga_temuan_utama]); });
    T(s8, 'T8.3', 'Usulan perbaikan dari peserta dan temuan utama fasyankes', ['Sumber', 'Uraian'], us);

    /* ---------- 9 keterbatasan */
    const s9 = sec('keterbatasan', '9. Keterbatasan dan catatan penafsiran', '');
    L(s9, ['Data berasal dari sampel purposif enam provinsi, dua belas kab/kota, dan 24 fasyankes; hasil menjelaskan mekanisme dan tidak mengestimasi besaran nasional.',
      'Isian kosong atau TC tidak berarti pelayanan tidak diberikan; TC menjadi kesenjangan hanya setelah penelusuran sumber selesai.',
      'Unit purposif dipilih karena ada kesenjangan sehingga tidak dipakai untuk frekuensi; frekuensi hanya dari unit acak/sensus.',
      'Kondisi saat kunjungan (Oktober–November 2026) tidak langsung dianggap penyebab kejadian 2024–Juni 2026; tanggal perubahan ditelusuri.',
      'Keterangan petugas tanpa bukti tertulis dicatat sebagai hipotesis; keyakinan "Sedang" yang hanya bersandar pada keterangan tidak menyatakan pelayanan terverifikasi.',
      'Faktor verifikasi C5 hanya berlaku untuk indikator, periode, dan sumber yang dinilai di sentinel.',
      'Penetapan akar masalah dan prioritas tindakan dilakukan WP7 pada semester pertama 2027.']);
    return { title: 'Laporan Evaluasi Lapangan RCA TB-HIV 2026', subtitle: f.prov ? 'Provinsi ' + RCA.reg.prov(f.prov).name : 'Seluruh lokasi (6 provinsi, 12 kab/kota, 24 fasyankes)',
      meta: [['Dibuat', new Date().toLocaleString('id-ID')], ['Oleh', RCA.state.user.name + ' (' + RCA.state.user.role + ')'], ['Cakupan data', 'Hanya rekaman berstatus Valid'], ['Acuan', 'Protokol RCA TB-HIV V13; Inception Report P4']],
      sections };
  }

  /* ================================================================ tampilan */
  function renderHTML(rep) {
    const wrap = h('article', { class: 'report' });
    wrap.appendChild(h('header', { class: 'rep-head' }, h('h1', null, rep.title), h('p', null, rep.subtitle), h('dl', { class: 'kv' }, rep.meta.map(([a, b]) => [h('dt', null, a), h('dd', null, b)]))));
    const toc = h('nav', { class: 'rep-toc no-print', 'aria-label': 'Daftar isi laporan' }, h('b', null, 'Daftar isi'), h('ol', null, rep.sections.map(s => h('li', null, h('a', { href: '#', onclick: e => { e.preventDefault(); document.getElementById('rep-' + s.id).scrollIntoView({ behavior: 'smooth' }); } }, s.title)))));
    wrap.appendChild(toc);
    rep.sections.forEach(s => {
      const se = h('section', { class: 'rep-sec', id: 'rep-' + s.id }, h('h2', null, s.title), s.intro ? h('p', { class: 'muted' }, s.intro) : null);
      s.blocks.forEach(b => {
        if (b.type === 'p') se.appendChild(h('p', null, b.text));
        if (b.type === 'list') se.appendChild(h('ul', null, b.items.map(x => h('li', null, x))));
        if (b.type === 'table') se.appendChild(h('figure', { class: 'rep-fig' }, h('figcaption', null, h('b', null, 'Tabel ' + b.id.slice(1) + '. '), b.title),
          h('div', { class: 'table-wrap' }, h('table', { class: 't' }, h('thead', null, h('tr', null, b.head.map(x => h('th', null, x)))), h('tbody', null, b.rows.map(r => h('tr', null, r.map((v, i) => h('td', { class: i && typeof v === 'number' ? 'n' : '' }, v === null || v === undefined ? '' : String(v)))))))),
          b.note ? h('p', { class: 'muted small' }, b.note) : null));
      });
      wrap.appendChild(se);
    });
    return wrap;
  }

  /* ================================================================ Excel */
  function toExcel(rep) {
    if (!RCA.needXLSX()) return;
    const wb = XLSX.utils.book_new();
    const sum = [[rep.title], [rep.subtitle], []].concat(rep.meta).concat([[]]);
    rep.sections.forEach(s => { sum.push([s.title]); if (s.intro) sum.push([s.intro]); s.blocks.forEach(b => { if (b.type === 'p') sum.push([b.text]); if (b.type === 'list') b.items.forEach(x => sum.push(['• ' + x])); if (b.type === 'table') sum.push(['Tabel ' + b.id.slice(1) + ': ' + b.title + ' (lembar ' + b.id + ')']); }); sum.push([]); });
    const ws0 = XLSX.utils.aoa_to_sheet(sum); ws0['!cols'] = [{ wch: 120 }];
    XLSX.utils.book_append_sheet(wb, ws0, 'Ringkasan');
    rep.sections.forEach(s => s.blocks.filter(b => b.type === 'table').forEach(b => {
      const aoa = [['Tabel ' + b.id.slice(1) + '. ' + b.title], [s.title], [], b.head].concat(b.rows).concat(b.note ? [[], [b.note]] : []);
      const ws = XLSX.utils.aoa_to_sheet(aoa); ws['!cols'] = b.head.map((x, i) => ({ wch: i === 0 ? 34 : Math.max(12, Math.min(40, String(x).length + 4)) }));
      XLSX.utils.book_append_sheet(wb, ws, b.id.replace(/[^A-Za-z0-9.]/g, '_').slice(0, 31));
    }));
    XLSX.writeFile(wb, 'Laporan_RCA_TBHIV_' + (rep.prov || 'semua') + '_' + RCA.today() + '.xlsx');
  }

  /* ================================================================ PDF */
  const asc = s => String(s === null || s === undefined ? '' : s).replace(/≤/g, '<=').replace(/≥/g, '>=').replace(/→/g, '->').replace(/×/g, 'x').replace(/÷/g, '/').replace(/[“”]/g, '"').replace(/[‘’]/g, "'").replace(/…/g, '...').replace(/[^\x00-\xFF–—•·±µ]/g, '');
  function toPDF(rep) {
    if (!window.jspdf || !window.jspdf.jsPDF) return RCA.toast('Pustaka PDF belum termuat. Coba lagi sebentar.', 'err');
    const { jsPDF } = window.jspdf; const doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });
    const W = doc.internal.pageSize.getWidth(), H = doc.internal.pageSize.getHeight(), M = 14; let y = 18;
    const teal = [15, 92, 99];
    const need = n => { if (y + n > H - 16) { doc.addPage(); y = 18; } };
    const para = (t, size, style, color) => { doc.setFont('helvetica', style || 'normal'); doc.setFontSize(size || 9.5); doc.setTextColor.apply(doc, color || [30, 40, 44]); const lines = doc.splitTextToSize(asc(t), W - 2 * M); lines.forEach(l => { need(5); doc.text(l, M, y); y += (size || 9.5) * 0.45; }); y += 1.5; };
    doc.setFillColor.apply(doc, teal); doc.rect(0, 0, W, 34, 'F');
    doc.setTextColor(255, 255, 255); doc.setFont('helvetica', 'bold'); doc.setFontSize(17); doc.text(asc(rep.title), M, 16);
    doc.setFont('helvetica', 'normal'); doc.setFontSize(10.5); doc.text(asc(rep.subtitle), M, 25); y = 44;
    rep.meta.forEach(([a, b]) => para(a + ': ' + b, 9, 'normal', [70, 80, 84]));
    y += 2;
    rep.sections.forEach((s, si) => {
      if (si > 0) need(30);
      doc.setDrawColor.apply(doc, teal); doc.setLineWidth(0.6); need(12); doc.line(M, y, W - M, y); y += 6;
      para(s.title, 13, 'bold', teal);
      if (s.intro) para(s.intro, 9, 'italic', [80, 90, 94]);
      s.blocks.forEach(b => {
        if (b.type === 'p') para(b.text);
        if (b.type === 'list') b.items.forEach(x => para('•  ' + x));
        if (b.type === 'table') {
          need(20); para('Tabel ' + b.id.slice(1) + '. ' + b.title, 10, 'bold');
          const wide = b.head.length > 7;
          doc.autoTable({ startY: y, head: [b.head.map(asc)], body: b.rows.map(r => r.map(asc)), margin: { left: M, right: M }, theme: 'grid',
            styles: { fontSize: wide ? 6.5 : 8, cellPadding: 1.4, overflow: 'linebreak', textColor: [30, 40, 44] }, headStyles: { fillColor: teal, textColor: 255, fontStyle: 'bold' },
            alternateRowStyles: { fillColor: [242, 247, 247] }, didDrawPage: () => {} });
          y = doc.lastAutoTable.finalY + 3;
          if (b.note) para(b.note, 8, 'italic', [90, 100, 104]);
          y += 2;
        }
      });
    });
    const n = doc.getNumberOfPages();
    for (let i = 1; i <= n; i++) { doc.setPage(i); doc.setFontSize(8); doc.setTextColor(120, 130, 134); doc.text(asc('RCA TB-HIV 2026 · data berkode, akses terbatas'), M, H - 8); doc.text('Halaman ' + i + ' dari ' + n, W - M, H - 8, { align: 'right' }); }
    doc.save('Laporan_RCA_TBHIV_' + (rep.prov || 'semua') + '_' + RCA.today() + '.pdf');
  }

  /* ================================================================ halaman */
  R.page = async function (main) {
    main.innerHTML = '';
    const f = RCA.state.filters._rep = RCA.state.filters._rep || {};
    main.appendChild(h('div', { class: 'page-head' }, h('div', { class: 'grow' }, h('h1', null, 'Dashboard Laporan'),
      h('p', null, 'Laporan tersusun otomatis menurut pertanyaan evaluasi Protokol V13 (Q1–Q6), ranah R1–R6, dan 14 CP dari seluruh data Valid. Simpan sebagai PDF atau Excel untuk bahan D3 dan lokakarya WP7.'))));
    const provSel = h('select', { 'aria-label': 'Cakupan laporan' }); provSel.appendChild(h('option', { value: '' }, 'Seluruh lokasi')); PROV().forEach(p => provSel.appendChild(h('option', { value: p.code, selected: f.prov === p.code }, 'Provinsi ' + p.name)));
    provSel.addEventListener('change', () => { f.prov = provSel.value; R.page(main); });
    const bar = h('div', { class: 'row no-print', style: { marginBottom: '14px' } }, provSel);
    main.appendChild(bar);
    const box = h('div', null, h('p', { class: 'muted' }, 'Menyusun laporan dari data Valid…')); main.appendChild(box);
    let D, U = {};
    try {
      [D] = await Promise.all([RCA.api('analysis.data', {}), ...['C1', 'C3', 'C4', 'C5', 'C6', 'C7'].map(async fm => { try { U[fm] = await RCA.api('units.list', { form: fm }); } catch (e) { U[fm] = []; } })]);
      RCA.idb.set('cache', 'report', { D, U });
    } catch (e) {
      const c = await RCA.idb.get('cache', 'report'); if (!c) { box.innerHTML = ''; box.appendChild(h('div', { class: 'notice err' }, e.message)); return; }
      D = c.D; U = c.U; RCA.toast('Offline: laporan memakai data tersimpan terakhir', 'err');
    }
    let rep;
    try { rep = build(D, U, f); rep.prov = f.prov; } catch (e) { box.innerHTML = ''; box.appendChild(h('div', { class: 'notice err' }, 'Gagal menyusun laporan: ' + e.message)); return; }
    bar.appendChild(h('button', { class: 'btn primary', onclick: () => toPDF(rep) }, 'Simpan PDF'));
    bar.appendChild(h('button', { class: 'btn', onclick: () => toExcel(rep) }, 'Simpan Excel'));
    bar.appendChild(h('button', { class: 'btn ghost', onclick: () => window.print() }, 'Cetak'));
    box.innerHTML = ''; box.appendChild(renderHTML(rep));
  };
  R.build = build;
})();
