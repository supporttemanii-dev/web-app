/* RCA TB-HIV 2026 · hitungan otomatis (diterjemahkan dari rumus Excel instrumen C3, C4, C5, C6) */
(function () {
  'use strict';
  const RCA = window.RCA;
  const P = RCA.S.params;
  const BATAS = P.c3['Batas data kejadian'] || '2026-06-30';
  const num = (k, d) => { const v = P.c3[k]; return v === undefined || v === null || v === '' ? d : Number(v); };
  const ARV_SO = num('Batas mulai ARV setelah OAT, TB SO (hari)', 14);
  const ARV_RO = num('Batas mulai ARV setelah OAT, TB RO (hari)', 56);
  const TPT_HARI = num('Batas mulai TPT setelah kelayakan ditetapkan (hari)', 30);
  const DX_HARI = num('Batas skrining positif sampai keputusan diagnostik TB (hari)', 14);
  const PNPK = num('Batas PNPK HIV 2019 untuk analisis sensitivitas (hari)', 56);
  const CD4_LOW = num('Batas CD4 rendah untuk sensitivitas PNPK (sel/µL)', 50);

  const D = v => { if (!v) return null; const m = String(v).match(/^(\d{4})-(\d{2})-(\d{2})/); return m ? Date.UTC(+m[1], +m[2] - 1, +m[3]) : null; };
  const days = (a, b) => { const x = D(a), y = D(b); return x === null || y === null ? '' : Math.round((y - x) / 864e5); };
  const isNum = v => v !== '' && v !== null && v !== undefined && !isNaN(v);
  const has = v => v !== undefined && v !== null && v !== '' && !(Array.isArray(v) && !v.length);
  const st = (d, k) => d[k + '__st'] || '';
  RCA.calc = { D, days, has };

  const LENGKAP = 'Lengkap untuk aspek yang dinilai';
  const kelompok = d => { const s = String(d.U03 || d.R_C || ''); return /purposif/i.test(s) ? 'Purposif' : (/berurutan/i.test(s) ? 'Berurutan' : 'Acak/sensus'); };
  /* "Tidak tercatat" di sistem hanya kesenjangan data bila sumber menunjukkan kejadiannya ada (mis. TPT tidak diberikan → wajar tidak ada di SIHA) */
  const ADA_DI_SUMBER = {
    A15: d => has(d.A06) && d.A06 !== 'Belum dapat dipastikan', A16: d => d.A10 === 'Sedang ARV' || has(d.A11), A17: d => has(d.A13) && !['Masih berobat', 'Belum diketahui'].includes(d.A13),
    B18: d => has(d.B01), B19: d => has(d.B13), B20: d => has(d.B13) && has(d.B16) && !/^TBL/.test(d.B16), T05: d => has(d.T03) && !['Belum mulai ARV', 'Belum diketahui'].includes(d.T03) };
  const bedaList = (d, ks) => ks.filter(k => d[k] === 'Ya, berbeda' || (d[k] === 'Tidak tercatat' && (!ADA_DI_SUMBER[k] || ADA_DI_SUMBER[k](d))));
  const bedaSistem = (d, ks) => bedaList(d, ks).length > 0;
  RCA.bedaSistem = bedaList;

  function cekGeneric(d, sub) {
    const out = [];
    const sch = RCA.forms.subSchema(sub);
    const fields = sch.sections.filter(s => s.type === 'fields').flatMap(s => s.fields);
    fields.forEach(f => {
      if (f.t === 'date' && has(d[f.k]) && D(d[f.k]) > D(BATAS) && !/^U07|^Z07|^P01/.test(f.k)) out.push(f.k + ' melewati batas data');
      if (f.st) {
        if (has(d[f.k]) && !st(d, f.k)) out.push('St ' + f.k + ' kosong');
        if (st(d, f.k) === 'Y' && !has(d[f.k + '__src'])) out.push('Sumber ' + f.k + ' kosong');
      }
    });
    return out;
  }

  const A = {
    hari_dx_oat: d => days(d.A01, d.A08),
    hari_oat_arv: d => days(d.A08, d.A11),
    arv_lewat: d => { const x = A.hari_oat_arv(d); if (x === '') return ''; if (d.A03 === 'Meningitis/SSP') return 'Nilai klinis'; return x > (d.A04 === 'TB RO' ? ARV_RO : ARV_SO) ? 'Ya' : 'Tidak'; },
    hari_dx_teshiv: d => days(d.A01, d.A07),
    kelompok,
    hari_terduga_dx: d => days(d.A00, d.A01),
    cek_A: d => {
      const o = cekGeneric(d, 'C3A');
      if (D(d.A08) !== null && D(d.A01) !== null && D(d.A08) < D(d.A01)) o.push('OAT sebelum diagnosis TB');
      if (D(d.A14) !== null && D(d.A08) !== null && D(d.A14) < D(d.A08)) o.push('Luaran sebelum mulai OAT');
      return o.join('; ');
    },
    pemicu_A: d => {
      const o = [];
      if (kelompok(d) === 'Purposif') o.push('Unit purposif');
      if (has(d.A01) && !has(d.A08)) o.push('OAT tidak tercatat');
      if (A.arv_lewat(d) === 'Ya') o.push('ARV melewati batas');
      if (d.A10b === 'Terinterupsi') o.push('ARV terinterupsi selama OAT');
      if ((d.A10 === 'Belum pernah ARV' || d.A10 === 'Pernah ARV, terputus') && !has(d.A11)) o.push('ARV belum dimulai');
      if (['Meninggal', 'Putus berobat', 'Gagal', 'Tidak dievaluasi', 'Belum diketahui'].includes(d.A13)) o.push('Luaran ' + d.A13);
      if (d.T01 === 'Ya') o.push('Rujukan'); if (d.T02 === 'Ya') o.push('Interupsi');
      if (['Terputus/hilang kontak', 'Pindah, belum terkonfirmasi', 'Belum diketahui'].includes(d.T03)) o.push('Status HIV ' + d.T03);
      if ((d.A10 === 'Belum pernah ARV' || d.A10 === 'Pernah ARV, terputus') && has(d.A11) && has(d.A08) && days(d.A08, d.A11) > 14) o.push('ARV >14 hari setelah OAT: isi CD4');
      if (bedaSistem(d, ['A15', 'A16', 'A17', 'T05'])) o.push('Beda sistem (teruskan ke C5/WP3)');
      return o.join('; ');
    },
    cp6: d => {
      if (!(d.A10 === 'Belum pernah ARV' || d.A10 === 'Pernah ARV, terputus')) return '';
      const s = st(d, 'A11');
      if (!s) return 'St kosong'; if (s === 'BD') return 'BD'; if (s === 'TBL') return 'Tidak berlaku';
      if (s === 'Y') { if (!has(d.A11) || !has(d.A08)) return 'Terjadi, waktu belum dapat dinilai'; const l = A.arv_lewat(d); return l === 'Ya' ? 'Kesenjangan: terlambat' : (l === 'Nilai klinis' ? 'Terjadi, waktu dinilai klinis' : 'Terjadi dalam batas'); }
      if (s === 'TC' && d.Z05 !== LENGKAP) return 'TC belum ditelusuri';
      if (!has(d.A08) || D(d.A08) + (d.A04 === 'TB RO' ? ARV_RO : ARV_SO) * 864e5 > D(BATAS)) return 'Jendela pengamatan belum cukup';
      return 'Kesenjangan: tidak dimulai';
    },
    cp6_pnpk: d => {
      const c = A.cp6(d), x = A.hari_oat_arv(d);
      if (!c || x === '') return '';
      if (d.A03 === 'Meningitis/SSP') return 'Nilai klinis';
      if (d.A04 === 'TB RO') return x > ARV_RO ? 'Terlambat menurut PNPK' : 'Dalam batas PNPK';
      if (x > PNPK) return 'Terlambat menurut PNPK';
      if (x <= 14) return 'Dalam batas PNPK';
      if (isNum(d.CD4) && Number(d.CD4) < CD4_LOW) return 'Terlambat menurut PNPK (CD4 <50)';
      if (isNum(d.CD4)) return 'Dalam batas PNPK';
      return '15–56 hari, CD4 tidak diketahui';
    },
    // ---- Unit B
    hari_arv_skr: d => days(d.B01, d.B03),
    hari_skr_dx: d => days(d.B03, d.B06),
    hari_arv_tpt: d => days(d.B01, d.B13),
    hari_layak_tpt: d => days(d.B09, d.B13),
    cek_B: d => {
      const o = cekGeneric(d, 'C3B');
      if (D(d.B03) !== null && D(d.B01) !== null && D(d.B03) < D(d.B01)) o.push('Skrining sebelum mulai ARV (periksa)');
      if (D(d.B13) !== null && D(d.B01) !== null && D(d.B13) < D(d.B01)) o.push('TPT sebelum mulai ARV (periksa)');
      if (D(d.B17) !== null && D(d.B13) !== null && D(d.B17) < D(d.B13)) o.push('Luaran TPT sebelum mulai TPT');
      return o.join('; ');
    },
    pemicu_B: d => {
      const o = [];
      if (kelompok(d) === 'Purposif') o.push('Unit purposif');
      if (has(d.B01) && !has(d.B03)) o.push('Skrining TB tidak tercatat');
      if (d.B04 === 'Positif/indikasi pemeriksaan') o.push('Skrining positif');
      if (d.B05 === 'Belum selesai') o.push('Diagnostik belum selesai');
      const x = days(d.B03, d.B06); if (x !== '' && x > DX_HARI) o.push('Diagnostik lewat batas hari');
      if (d.B08 === 'Ditunda' || d.B08 === 'Tidak tercatat') o.push('Kelayakan TPT ' + d.B08);
      if (!has(d.B13) && (d.B08 === 'Layak' || d.B11 === 'Ditawarkan, diterima')) o.push('Layak/diterima tetapi TPT belum mulai');
      if (['Putus', 'Dihentikan: efek samping', 'Dihentikan: TB aktif', 'Belum diketahui'].includes(d.B16)) o.push('Luaran TPT ' + d.B16);
      if (d.T01 === 'Ya') o.push('Rujukan'); if (d.T02 === 'Ya') o.push('Interupsi');
      if (['Terputus/hilang kontak', 'Pindah, belum terkonfirmasi', 'Belum diketahui'].includes(d.T03)) o.push('Status HIV ' + d.T03);
      if (bedaSistem(d, ['B18', 'B19', 'B20', 'T05'])) o.push('Beda sistem (teruskan ke C5/WP3)');
      return o.join('; ');
    },
    tpt_matang: d => { if (!has(d.B13)) return ''; const b = P.tpt_matang[d.B14]; if (!b) return 'Tidak dapat ditentukan'; return D(d.B13) <= D(b) ? 'Matang' : 'Belum matang'; },
    cp7: d => {
      if (d.B08 !== 'Layak') return '';
      const s = st(d, 'B13');
      if (!s) return 'St kosong'; if (s === 'BD') return 'BD'; if (s === 'TBL') return 'Tidak berlaku';
      if (s === 'Y') { const x = days(d.B09, d.B13); if (x === '') return 'Terjadi, waktu belum dapat dinilai'; return x > TPT_HARI ? 'Kesenjangan: terlambat' : 'Terjadi dalam batas'; }
      if (s === 'TC' && d.Z05 !== LENGKAP) return 'TC belum ditelusuri';
      if (!has(d.B09) || D(d.B09) + TPT_HARI * 864e5 > D(BATAS)) return 'Jendela pengamatan belum cukup';
      return 'Kesenjangan: tidak dimulai';
    },
    cp2: d => {
      const s = st(d, 'B03');
      if (!s) return 'St kosong'; if (s === 'BD') return 'BD'; if (s === 'TBL') return 'Tidak berlaku'; if (s === 'Y') return 'Terjadi';
      if (s === 'TC' && d.Z05 !== LENGKAP) return 'TC belum ditelusuri';
      return 'Kesenjangan: tidak tercatat atau tidak dilakukan';
    },
    // ---- CP3 register
    cp3_mek: d => {
      const F = d.R_F, H = d.R_H, K = d.R_K, L = d.R_L;
      if (!d.R_B) return '';
      if (F === 'TBL (sudah diketahui positif)' || H === 'TBL (sudah diketahui positif)') return L === 'Positif' ? 'Status lama: tercatat sesuai' : (L === 'Belum dicek' ? 'Status lama: SITB belum dicek' : 'Pencatatan: status lama tidak tercatat di SITB');
      if (H === 'Ya') { if (L === 'Belum dicek') return 'Dites: SITB belum dicek'; if (!K || K === 'Tidak tercatat') return 'Belum dapat dipastikan: hasil sumber tidak tercatat'; if (L === 'Kosong' || L === 'Tidak diketahui') return 'Pencatatan: dites, SITB kosong'; return L !== K ? 'Pencatatan: hasil berbeda' : 'Sesuai'; }
      if (H === 'TC') return 'Belum dapat dipastikan: pelaksanaan tes tidak tercatat';
      if (F === 'Menolak') return 'Pelayanan: pasien menolak';
      if (F === 'Ya' && H === 'Tidak') return 'Pelayanan: ditawarkan, tidak dites';
      if (F === 'Ya') return 'Belum dapat dipastikan: pelaksanaan tes belum diisi';
      if (F === 'Tidak ditawarkan (terdokumentasi)') return 'Pelayanan: tidak ditawarkan';
      return 'Belum dapat dipastikan: tidak ada bukti penawaran';
    },
    hari_dx_tes: d => days(d.R_E, d.R_I),
    // ---- C6
    c6_kategori: d => {
      const m = d.tgl_mati, o = d.oat_tgl;
      if (!has(m)) return 'Tanggal tidak diketahui';
      if (d.oat_tidak === 'Ya') return 'Sebelum OAT';
      if (!has(o)) return 'Waktu OAT tidak diketahui';
      const x = days(o, m); if (x < 0) return 'Sebelum OAT';
      return x <= 14 ? '0–14 hari' : x <= 30 ? '15–30 hari' : x <= 90 ? '31–90 hari' : x <= 180 ? '91–180 hari' : 'Lebih dari 180 hari';
    },
    c6_oat_arv: d => days(d.oat_tgl, d.arv_tgl),
    // ---- C4 matriks
    m_status: (row) => {
      const ms = ['M1', 'M2', 'M3'].map(k => row[k] || '');
      const need = ms.filter(v => v !== 'TBL');
      if (!need.length) return 'Tidak berlaku';
      const yes = need.filter(v => v === 'Ya').length;
      return yes === need.length ? 'Sudah diperiksa' : (yes > 0 ? 'Sebagian' : 'Belum diperiksa');
    },
    m_saran: (row) => {
      if (row.keberlakuan === 'Tidak berlaku') return 'Tidak berlaku';
      if (A.m_status(row) !== 'Sudah diperiksa' || row.kecukupan === 'Bertentangan' || !row.kecukupan) return 'Belum dapat dipastikan';
      const N = Number(row.c3_acak_N || 0), n = Number(row.c3_acak_n || 0), bd = Number(row.c3_bd || 0);
      if (n >= 1) return 'Terlaksana sebagian atau terlambat';
      if (N >= 3 && row.kecukupan === 'Memadai' && bd < N) return 'Terlaksana dan terverifikasi';
      return 'Belum dapat dipastikan';
    }
  };
  RCA.AUTO = A;

  /* ---------------- C5: periode efektif dan hitungan baris */
  function c5Ctx(ind, id) {
    id = id || {};
    const awal = id.tw_awal || (P.c5['Awal triwulan verifikasi'] || '2025-07-01');
    const akhir = id.tw_akhir || (P.c5['Akhir triwulan verifikasi'] || '2025-09-30');
    const met = id['met_' + ind] || '';
    let s = awal, e = akhir;
    const b = Number(id['bulan_' + ind] || 0);
    if ((met === 'Satu bulan' || met === 'Sampel') && b >= 1 && b <= 3) {
      const d0 = new Date(D(awal)); const y = d0.getUTCFullYear(), m = d0.getUTCMonth() + b - 1;
      s = new Date(Date.UTC(y, m, 1)).toISOString().slice(0, 10); e = new Date(Date.UTC(y, m + 1, 0)).toISOString().slice(0, 10);
    }
    return { ind, s, e, met, U1: Number(id['u1_' + ind]), model: id['model_' + ind] || '', tptEnd: id.tpt_akhir || P.c5['Akhir jendela mulai TPT untuk pembilang TB/HIV-4.1a'] || akhir, n: Number(P.c5['Ukuran sampel per arah bila metode sampel'] || 30) };
  }
  const inP = (v, c) => { const x = D(v); return x !== null && x >= D(c.s) && x <= D(c.e); };
  function c5Row(r, c) {
    const o = {};
    const okType = t => t === 'Baru' || t === 'Kambuh';
    const lengkap = (r.sumber_diperiksa === 'Ya' && has(r.kode_sumber) && (r.ada_sumber === 'Tidak' || (r.ada_sumber === 'Ya' && has(r.tgl_src) &&
      (c.ind === '41a' ? has(r.masuk_src) : (has(r.tipe_src) && has(r.hiv_src) && (c.ind !== '6' || has(r.arv_src))))))) ? 'Ya' : 'Belum';
    o.lengkap = lengkap;
    if (c.ind === '5') {
      o.D_sis = r.ada_sistem === 'Ya' && inP(r.tgl_sis, c) && okType(r.tipe_sis) ? 1 : 0;
      o.D_src = lengkap !== 'Ya' ? '' : (r.ada_sumber === 'Ya' ? (inP(r.tgl_src, c) && okType(r.tipe_src) ? 1 : 0) : 0);
      o.N_sis = o.D_sis === 1 && (r.hiv_sis === 'Positif' || r.hiv_sis === 'Negatif') ? 1 : 0;
      o.N_src = o.D_src === '' ? '' : (o.D_src === 1 && (r.hiv_src === 'Positif' || r.hiv_src === 'Negatif') ? 1 : 0);
    } else if (c.ind === '6') {
      const arvOk = v => v === 'Sudah ARV sebelum TB' || v === 'Mulai ARV selama pengobatan TB';
      o.D_sis = r.ada_sistem === 'Ya' && inP(r.tgl_sis, c) && okType(r.tipe_sis) && r.hiv_sis === 'Positif' ? 1 : 0;
      o.D_src = lengkap !== 'Ya' ? '' : (r.ada_sumber === 'Ya' ? (inP(r.tgl_src, c) && okType(r.tipe_src) && r.hiv_src === 'Positif' ? 1 : 0) : 0);
      o.N_sis = o.D_sis === 1 && arvOk(r.arv_sis) ? 1 : 0;
      o.N_src = o.D_src === '' ? '' : (o.D_src === 1 && arvOk(r.arv_src) ? 1 : 0);
    } else {
      const tptOk = v => D(v) !== null && D(v) <= D(c.tptEnd);
      o.D_sis = r.ada_sistem === 'Ya' && inP(r.tgl_sis, c) && r.masuk_sis === 'Baru pertama kali ARV' ? 1 : 0;
      o.D_src = lengkap !== 'Ya' ? '' : (r.ada_sumber === 'Ya' ? (inP(r.tgl_src, c) && r.masuk_src === 'Baru pertama kali ARV' ? 1 : 0) : 0);
      o.N_sis = o.D_sis === 1 && tptOk(r.tpt_sis) ? 1 : 0;
      o.N_src = o.D_src === '' ? '' : (o.D_src === 1 && tptOk(r.tpt_src) ? 1 : 0);
    }
    if (lengkap !== 'Ya') o.status = 'Sumber belum diperiksa';
    else if (o.D_sis === o.D_src && o.N_sis === o.N_src) o.status = 'Sesuai';
    else if (r.ada_sistem === 'Ya' && r.ada_sumber === 'Tidak') o.status = 'Hanya di sistem: entri tanpa bukti sumber?';
    else if (r.ada_sistem === 'Tidak' && r.ada_sumber === 'Ya') o.status = 'Hanya di sumber: belum tercatat atau terlambat?';
    else if (o.D_sis !== o.D_src) o.status = 'Beda penyebut: periksa tanggal, tipe, atau status';
    else o.status = o.N_src > o.N_sis ? 'Beda pembilang: pelayanan ada di sumber, tidak di sistem' : 'Beda pembilang: di sistem tanpa bukti sumber';
    return o;
  }
  function c5Rows(rows, c) {
    const frame = []; // kerangka acak arah 1
    rows.forEach((r, i) => { if (r.asal === 'Daftar sistem' && r.ada_sistem === 'Ya' && inP(r.tgl_sis, c)) frame.push(i); });
    const N = frame.length; let picks = null;
    if (c.met === 'Sampel' && isNum(c.U1) && c.U1 >= 0 && c.U1 < 1 && N) {
      const n = Math.min(c.n, N); picks = new Set();
      for (let j = 0; j < n; j++) picks.add(Math.floor((j + c.U1) * N / n) + 1);
    }
    return rows.map((r, i) => {
      const o = c5Row(r, c);
      if (!c.met) o.terpilih = 'Lengkapi metode/periode';
      else if (r.asal === 'Telusur register') o.terpilih = 'Arah 2';
      else if (!inP(r.tgl_sis, c) && !inP(r.tgl_src, c)) o.terpilih = 'Di luar periode';
      else if (String(r.asal || '').startsWith('Pencocokan')) o.terpilih = 'Ya (pusat: sensus)';
      else if (c.met !== 'Sampel') o.terpilih = 'Ya';
      else if (!picks) o.terpilih = 'Isi U acak arah 1';
      else { const pos = frame.indexOf(i) + 1; o.terpilih = pos && picks.has(pos) ? 'Ya' : 'Tidak'; }
      return o;
    });
  }
  function c5Recap(rows, c, id) {
    const calc = c5Rows(rows, c);
    const sel = calc.map((o, i) => ({ o, r: rows[i] })).filter(x => x.o.terpilih.startsWith('Ya') || x.o.terpilih === 'Arah 2');
    const sum = (arr, k) => arr.reduce((a, x) => a + (Number(x.o[k]) || 0), 0);
    const belum = sel.filter(x => x.o.lengkap !== 'Ya').length;
    const res = { rows: rows.length, terpilih: sel.length, D_sis: sum(sel, 'D_sis'), N_sis: sum(sel, 'N_sis'), arah2: rows.filter(r => r.asal === 'Telusur register').length, belum };
    const lapN = Number(id['lap_num_' + c.ind]), lapD = Number(id['lap_den_' + c.ind]);
    res.lapN = isNum(id['lap_num_' + c.ind]) ? lapN : null; res.lapD = isNum(id['lap_den_' + c.ind]) ? lapD : null;
    const sah = c.model === 'A' && c.met === 'Sensus' && belum === 0 && rows.length > 0;
    res.sah = sah; res.alasan = !c.met ? 'Metode belum ditetapkan' : c.model !== 'A' ? 'Model ' + (c.model || 'belum ditetapkan') + ' (FV hanya untuk model A)' : c.met !== 'Sensus' ? 'Metode ' + c.met + ': FV tidak dihitung, laporkan hasil sampel' : belum ? belum + ' baris sumber belum diperiksa' : '';
    res.D_src = sum(sel, 'D_src'); res.N_src = sum(sel, 'N_src');
    if (sah && res.lapN) res.FV_N = res.N_src / res.lapN;
    if (sah && res.lapD) res.FV_D = res.D_src / res.lapD;
    res.status = {}; calc.forEach(o => { res.status[o.status] = (res.status[o.status] || 0) + 1; });
    res.jenis = {}; rows.forEach(r => { if (r.jenis) res.jenis[r.jenis] = (res.jenis[r.jenis] || 0) + 1; });
    return res;
  }
  RCA.c5 = { ctx: c5Ctx, rows: c5Rows, recap: c5Recap };

  /* ---------------- Rekap CP dari C3 (untuk C4 dan analisis) */
  function c3Rekap(recA, recB, recCP3) {
    const grp = d => kelompok(d);
    const out = {};
    const add = (cp, d, assessed, gap, bd) => {
      const g = grp(d); if (g === 'Berurutan') return;
      const o = out[cp] = out[cp] || { acak_N: 0, acak_n: 0, purp_N: 0, purp_n: 0, bd: 0, units: [] };
      if (bd) { o.bd++; return; }
      if (!assessed) return;
      if (g === 'Purposif') { o.purp_N++; if (gap) o.purp_n++; } else { o.acak_N++; if (gap) o.acak_n++; }
      if (gap) o.units.push(d.U01 || d.R_B || '');
    };
    const tcOk = d => d.Z05 === LENGKAP;
    (recB || []).forEach(d => {
      const s = st(d, 'B03');
      add('CP2', d, s === 'Y' || s === 'TL' || (s === 'TC' && tcOk(d)), s === 'TL' || (s === 'TC' && tcOk(d)), s === 'BD');
      add('CP5', d, has(d.B08) && d.B08 !== 'TBL (TB aktif)', d.B08 === 'Tidak tercatat', false);
      const c7 = A.cp7(d);
      add('CP7', d, /^Kesenjangan|^Terjadi dalam/.test(c7), /^Kesenjangan/.test(c7), c7 === 'BD' || c7 === 'Jendela pengamatan belum cukup');
      const st16 = st(d, 'B16');
      add('CP11', d, has(d.B13) && has(st16) && st16 !== 'BD' && ['Lengkap', 'Putus'].includes(d.B16), d.B16 === 'Putus', st16 === 'BD');
    });
    (recA || []).forEach(d => {
      const c6 = A.cp6(d);
      add('CP6', d, /^Kesenjangan|^Terjadi dalam/.test(c6), /^Kesenjangan/.test(c6), c6 === 'BD' || c6 === 'Jendela pengamatan belum cukup');
      add('CP10', d, has(d.A13) && d.A13 !== 'Masih berobat', ['Tidak dievaluasi', 'Belum diketahui', 'Putus berobat'].includes(d.A13), st(d, 'A13') === 'BD');
      add('CP14', d, d.A19 === 'Hadir' || d.A19 === 'Tidak hadir', d.A19 === 'Tidak hadir', d.A19 === 'Pengamatan belum cukup');
    });
    [...(recA || []).map(d => [d, 'A']), ...(recB || []).map(d => [d, 'B'])].forEach(([d, fr]) => {
      (d.rujukan || []).forEach(r => { if (!r.tanggal_rujuk) return; const x = days(r.tanggal_rujuk, r.tanggal_hadir_di_tujuan); add('CP8', d, true, x === '' || x > 30, false); });
      (d.interupsi || []).forEach(r => { if (r.jenis !== 'Interupsi') return; const x = days(r.tanggal_jadwal_terlewat, r.tanggal_kembali_berobat); add('CP12', d, true, x === '' || x > 90, false); });
      const pem = fr === 'A' ? A.pemicu_A(d) : A.pemicu_B(d);
      add('R6', d, d.U09 === 'Dapat ditelaah' || d.U09 === 'Sebagian', /Beda sistem/.test(pem), false);
    });
    (recCP3 || []).forEach(d => {
      const m = A.cp3_mek(d);
      const fake = Object.assign({}, d, { U03: d.R_C });
      add('CP3', fake, m && !/^Belum dapat|belum dicek/.test(m), /^Pelayanan/.test(m), /^Belum dapat/.test(m));
    });
    return out;
  }
  RCA.c3Rekap = c3Rekap;

  /* kappa dikotomi (mutu kurang 1–2 vs memadai 3–5) */
  RCA.kappa = function (pairs) {
    const p = pairs.filter(x => /^[1-5]$/.test(x[0]) && /^[1-5]$/.test(x[1])).map(x => [Number(x[0]) <= 2 ? 1 : 0, Number(x[1]) <= 2 ? 1 : 0]);
    const n = p.length; if (n < 5) return { n, kappa: null, agree: n ? p.filter(x => x[0] === x[1]).length / n : null };
    const po = p.filter(x => x[0] === x[1]).length / n;
    const a1 = p.filter(x => x[0]).length / n, b1 = p.filter(x => x[1]).length / n;
    const pe = a1 * b1 + (1 - a1) * (1 - b1);
    return { n, agree: po, kappa: pe === 1 ? null : (po - pe) / (1 - pe) };
  };
})();
