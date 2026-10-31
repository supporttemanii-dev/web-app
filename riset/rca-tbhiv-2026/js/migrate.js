/* RCA TB-HIV 2026 · konversi ekspor server aplikasi lama ("RCA_TB-HIV_Server*.xlsx") menjadi paket impor.
   Berjalan di peramban (menu Admin › Impor data lama) dan di Node (pengujian). Tidak mengirim apa pun; hanya membaca berkas.
   Prinsip: data kiriman = versi utama; draf yang belum dikirim = Draf; draf yang berbeda dari kiriman = versi cadangan;
   isian tanpa padanan disimpan di data._lama (ditampilkan hanya-baca di unit). */
(function (root) {
  'use strict';
  const MIG = {};

  /* posisi sel templat Excel C4/C5 (dipakai untuk draf "Titipan" yang menyimpan koordinat baris,kolom) */
  const TPL = {"fields":{"C4_Identitas":{"sheet":"Identitas","rows":{"4":"Kode fasyankes RCA (dari C2b)","5":"Kode kab/kota","6":"Jenis fasyankes","7":"Kepemilikan / kelas RS","8":"Fasilitas sentinel (C5)","9":"Tanggal kunjungan (mulai)","10":"Tanggal kunjungan (selesai)","11":"Tim (kode)","12":"Pendamping Kemenkes/SWG/Dinkes","13":"Model layanan TB-HIV","14":"Jadwal layanan TB (hari/jam)","15":"Jadwal layanan PDP (hari/jam)","16":"Penanggung jawab TB / PDP / SITB / SIHA / farmasi (jabatan)","17":"Tenaga terlatih TB-HIV dan mutasi penting 2024–2026 (tanggal)","18":"Volume 2025 (dari C1, dikonfirmasi): TB-HIV / ODHIV baru ART / ODHIV dalam ART / kasus TB","19":"Pembiayaan layanan (JKN, APBD, program, biaya pasien)","20":"Waktu kerja tim (menit): alur / dokumen-stok / diagnostik-pencatatan / observasi / wawancara / matriks"}},"C4_Kesimpulan":{"sheet":"Kesimpulan","rows":{"5":"Tiga temuan utama (dengan CP dan kode bukti)","6":"Praktik yang berjalan baik dan dapat dipelajari","7":"Hasil uji dugaan C1 (lembar Dugaan_C1)","8":"Temuan yang berbeda dari dugaan awal","9":"Ketidaksesuaian data yang diteruskan (C5/WP3)","10":"Unit yang diteruskan ke C6","11":"Pertanyaan untuk C7 (WP6)","12":"Informasi yang belum tersedia dan rencana klarifikasi jarak jauh","13":"Umpan balik lisan kepada fasilitas (tanggal, peserta)","14":"Diperiksa kelengkapan oleh (kode) dan tanggal","15":"Masalah mutu yang perlu diselesaikan (C9)","16":"Disetujui koordinator lapangan (kode) dan tanggal"}},"C5_Identitas":{"sheet":"Identitas","rows":{"4":"Kode fasyankes RCA","5":"Provinsi / kab/kota","6":"Jenis fasyankes","7":"Alasan penetapan sebagai sentinel (V13 Bagian 8A)","8":"Alasan bila triwulan bukan triwulan III 2025","9":"Akses SITB","10":"Akses SIHA","11":"Petugas berwenang pemegang akses (jabatan/kode)","12":"Pemeriksa hasil dari tim evaluasi (kode)","13":"Tanggal ekspor SITB dan versi data","14":"Tanggal ekspor SIHA dan versi data","15":"Sumber rekap resmi untuk nilai dilaporkan (nama berkas, tanggal)","16":"Register yang tersedia untuk triwulan (TB, lab/KTS, ikhtisar HIV, TPT, farmasi)","20":"Arah 1 (sistem ke sumber) selesai: TB/HIV-5","21":"Arah 1 selesai: TB/HIV-6","22":"Arah 1 selesai: TB/HIV-4.1a","23":"Arah 2 (sumber ke sistem) selesai: TB/HIV-5","24":"Arah 2 selesai: TB/HIV-6","25":"Arah 2 selesai: TB/HIV-4.1a","26":"Pembatasan karena waktu (indikator dan baris yang tidak diperiksa)","27":"Tanggal pelaksanaan dan pelaksana","28":"Durasi kerja (menit): TB/HIV-5 arah 1 / arah 2; TB/HIV-6 arah 1 / arah 2; TB/HIV-4.1a arah 1 / arah 2","17":"Register sumber lengkap untuk triwulan: TB/HIV-5","18":"Register sumber lengkap untuk triwulan: TB/HIV-6","19":"Register sumber lengkap untuk triwulan: TB/HIV-4.1a"}}},"tables":{"C4_Identitas_2":{"sheet":"Identitas","from":24,"to":10000},"C4_Dugaan_C1":{"sheet":"Dugaan_C1","from":5,"to":10000},"C4_Alur":{"sheet":"Alur","from":5,"to":10000},"C4_Dokumen_Stok":{"sheet":"Dokumen_Stok","from":5,"to":15},"C4_Dokumen_Stok_2":{"sheet":"Dokumen_Stok","from":17,"to":10000},"C4_Diagnostik_Pencatatan":{"sheet":"Diagnostik_Pencatatan","from":5,"to":9},"C4_Diagnostik_Pencatatan_2":{"sheet":"Diagnostik_Pencatatan","from":11,"to":16},"C4_Diagnostik_Pencatatan_3":{"sheet":"Diagnostik_Pencatatan","from":18,"to":10000},"C4_Observasi":{"sheet":"Observasi","from":5,"to":10000},"C4_Wawancara":{"sheet":"Wawancara","from":5,"to":17},"C4_Wawancara_2":{"sheet":"Wawancara","from":19,"to":10000},"C4_Matriks_CP":{"sheet":"Matriks_CP","from":5,"to":10000},"C4_Daftar_Bukti":{"sheet":"Daftar_Bukti","from":5,"to":10000},"C5_Parameter":{"sheet":"Parameter","from":5,"to":10000,"off":1},"C5_Cocok_TBHIV6":{"sheet":"Cocok_TBHIV6","from":5,"to":10000},"C5_Cocok_TBHIV4.1a":{"sheet":"Cocok_TBHIV4.1a","from":5,"to":10000},"C5_Cocok_TBHIV5":{"sheet":"Cocok_TBHIV5","from":5,"to":10000},"C5_Alur_Pencatatan":{"sheet":"Alur_Pencatatan","from":5,"to":10000},"C5_Sistem_Data":{"sheet":"Sistem_Data","from":5,"to":10000},"C5_Tindak_Lanjut":{"sheet":"Tindak_Lanjut","from":5,"to":10000},"C4_Pendalaman_CP":{"sheet":"Pendalaman_CP","from":5,"to":10000}}};
  /* lembar formulir C6F: baris pertama setiap blok isian (urutan baris = urutan kolom pada lembar kiriman) */
  const C6F_FIELDS = { A1_Kelayakan: [[4, 'C6F_A1_Kelayakan'], [20, 'C6F_A1_Kelayakan_2']], A3_Data_kunci: [[4, 'C6F_A3_Data_kunci']],
    A6_Kecukupan: [[4, 'C6F_A6_Kecukupan']], B5_Kesimpulan: [[4, 'C6F_B5_Kesimpulan']], Panel: [[4, 'C6F_Panel']] };
  const C6F_TABLES = ['A2_Sumber', 'A4_Kronologi', 'A5_Tidak_tersedia', 'B1_Skor', 'B2_Keterlambatan', 'B3_Komplikasi', 'B4_Masalah'];

  const META = new Set(['Kunci', 'Baris Excel', 'Waktu diperbarui', 'Waktu dibuat', 'Kode fasyankes', 'Dikirim dari', 'No', 'Nomor']);
  const norm = s => String(s === undefined || s === null ? '' : s).toLowerCase().replace(/\(otomatis\)|\*/g, '').replace(/[^a-z0-9]+/g, '');
  const normNP = s => norm(String(s === undefined || s === null ? '' : s).replace(/\([^)]*\)/g, ''));
  const has = v => v !== undefined && v !== null && v !== '' && !(Array.isArray(v) && !v.length);
  const pad = n => String(n).padStart(2, '0');
  const OPT_ALIAS = { pernahterputus: 'Pernah ARV, terputus', belumpernah: 'Belum pernah ARV', sedang: 'Sedang ARV', puskesmas: 'Pkm', rumahsakit: 'RS',
    bukan: 'Tidak', tbso: 'SO', tbro: 'RO', ya: 'Ya', tidak: 'Tidak' };

  const BULAN = { jan: 1, feb: 2, mar: 3, apr: 4, mei: 5, may: 5, jun: 6, jul: 7, agt: 8, agu: 8, ags: 8, aug: 8, sep: 9, okt: 10, oct: 10, nov: 11, des: 12, dec: 12 };
  /** normalkan teks tanggal → {v, catatan}; v = yyyy-mm-dd bila dapat dikenali */
  function normDate(v) {
    let s = String(v).trim(), m;
    if ((m = s.match(/^(\d{4})-(\d{2})-(\d{2})/))) { const y = +m[1]; return { v: m[0], catatan: y < 2000 || y > 2027 ? 'tahun tidak wajar (periksa)' : '' }; }
    if ((m = s.match(/^(\d{1,2})[\/.-](\d{1,2})[\/.-](\d{4})$/))) { const y = +m[3]; return { v: m[3] + '-' + pad(m[2]) + '-' + pad(m[1]), catatan: y < 2000 || y > 2027 ? 'tahun tidak wajar (periksa)' : '' }; }
    if ((m = s.match(/^(\d{1,2})\s+([A-Za-z]{3})[a-z]*\.?\s+(\d{4})$/)) && BULAN[m[2].toLowerCase()]) return { v: m[3] + '-' + pad(BULAN[m[2].toLowerCase()]) + '-' + pad(m[1]), catatan: 'dinormalkan dari "' + s + '"' };
    return { v: s, catatan: 'tanggal tidak lengkap/tidak baku; disimpan apa adanya', gagal: true };
  }
  MIG.normDate = normDate;

  MIG.isOldExport = wb => ['Unit_A', 'C2_A_TBHIV', 'Titipan'].filter(n => wb.SheetNames.includes(n)).length >= 2;

  MIG.convert = function (XLSX, wb, S, opt) {
    opt = opt || {};
    const L = { anomali: [], tanpaPadanan: {}, catatan: [], peringatan: [], hitung: {} };
    const cnt = (k, n) => { L.hitung[k] = (L.hitung[k] || 0) + (n === undefined ? 1 : n); };

    /* ---------- membaca lembar */
    function cellVal(c) {
      if (!c || c.v === undefined || c.v === null) return '';
      if (c.t === 'n' && c.z && XLSX.SSF.is_date(c.z)) {
        const p = XLSX.SSF.parse_date_code(c.v); if (!p) return c.v;
        const d = p.y + '-' + pad(p.m) + '-' + pad(p.d);
        return /h/i.test(c.z) ? d + ' ' + pad(p.H) + ':' + pad(p.M) : d;
      }
      if (c.t === 'n') return c.v;
      if (c.t === 'b') return c.v ? 'Ya' : 'Tidak';
      if (c.t === 'e') return '';
      return String(c.v).trim();
    }
    const cache = {};
    function sheet(name) {
      if (cache[name] !== undefined) return cache[name];
      const ws = wb.Sheets[name]; if (!ws || !ws['!ref']) return (cache[name] = null);
      const rg = XLSX.utils.decode_range(ws['!ref']); const hdr = [], seen = {};
      for (let c = rg.s.c; c <= rg.e.c; c++) {
        let h = String(cellVal(ws[XLSX.utils.encode_cell({ r: rg.s.r, c })]) || '');
        if (!h) h = 'Kolom ' + (c + 1);
        if (seen[h]) h = h + ' #' + (++seen[h]); else seen[h] = 1;
        hdr.push(h);
      }
      const rows = [];
      for (let r = rg.s.r + 1; r <= rg.e.r; r++) {
        const o = {}; let any = false;
        for (let c = rg.s.c; c <= rg.e.c; c++) { const v = cellVal(ws[XLSX.utils.encode_cell({ r, c })]); if (v !== '') any = true; o[hdr[c - rg.s.c]] = v; }
        if (any) rows.push(o);
      }
      return (cache[name] = { hdr, rows });
    }
    const rowsOf = name => (sheet(name) || { rows: [] }).rows;
    const content = name => ((sheet(name) || { hdr: [] }).hdr).filter(h => !['Kunci', 'Baris Excel', 'Waktu diperbarui'].includes(h));

    /* ---------- skema */
    const SUB = {};
    Object.keys(S.forms).forEach(f => (S.forms[f].sub || []).forEach(s => { SUB[s.id] = { form: f, s }; }));
    const sec = (sub, id) => SUB[sub].s.sections.find(x => x.id === id);
    const flds = s => s.fields || s.cols || [];

    /* ---------- rekaman */
    const STORE = { kiriman: {}, draf: {} };
    function rec(kind, sub, unit, meta) {
      const k = SUB[sub].form + '|' + sub + '|' + unit;
      const st = STORE[kind];
      if (!st[k]) st[k] = { form: SUB[sub].form, sub, unit, data: {}, lama: [], meta: {} };
      if (meta) Object.keys(meta).forEach(m => { if (has(meta[m])) st[k].meta[m] = meta[m]; });
      return st[k];
    }
    function anomali(R, f, v, why) {
      L.anomali.push({ formulir: R.sub, unit: R.unit, isian: (f && (f.l || f.k)) || '', nilai: String(v).slice(0, 120), keterangan: why });
      // tampilkan juga di panel unit, karena kotak tanggal/pilihan tidak dapat menampilkan nilai di luar format
      R.lama.push({ lembar: 'Nilai asli tidak sesuai format formulir baru', baris: '', label: (f && (f.l || f.k)) || '', nilai: String(v) + ' (' + why.split(';')[0] + ')' });
    }

    function coerce(f, v, R) {
      if (typeof v === 'string') { v = v.replace(/\s+$/g, '').replace(/^\s+/g, ''); }
      if (!has(v)) return '';
      if (!f) return typeof v === 'number' ? String(v) : v;
      const t = f.t;
      if (t === 'date') {
        const d = normDate(v);
        if (d.catatan) anomali(R, f, String(v).trim(), d.catatan);
        return d.v;
      }
      if (t === 'number') {
        if (typeof v === 'number') return v;
        const n = Number(String(v).replace(',', '.').trim()); if (String(v).trim() !== '' && isFinite(n)) return n;
        anomali(R, f, v, 'bukan angka; disimpan apa adanya'); return String(v);
      }
      if (t === 'select') {
        const s = typeof v === 'number' ? String(v) : String(v).trim();
        if (!f.o || f.o.includes(s)) return s;
        const hit = f.o.find(o => norm(o) === norm(s)) || (OPT_ALIAS[norm(s)] && f.o.includes(OPT_ALIAS[norm(s)]) ? OPT_ALIAS[norm(s)] : null);
        if (hit) return hit;
        anomali(R, f, s, 'nilai di luar pilihan formulir baru; disimpan apa adanya'); return s;
      }
      if (t === 'multi') {
        const O = f.o || [], find = p => O.find(o => norm(o) === norm(p));
        let parts = (Array.isArray(v) ? v : String(v).split(/\s*;\s*/)).map(x => String(x).trim()).filter(x => x && x !== '-');
        parts = [].concat(...parts.map(p => { if (find(p) || p.indexOf(',') < 0) return [p]; const sp = p.split(/\s*,\s*/).filter(Boolean); return sp.every(find) ? sp : [p]; }));
        return parts.map(p => { const hit = find(p); if (!hit) anomali(R, f, p, 'pilihan tidak dikenal; disimpan apa adanya'); return hit || p; });
      }
      return typeof v === 'number' ? String(v) : String(v);
    }

    /* pencocok judul kolom lama → isian baru */
    function matcher(fields, aliases) {
      aliases = aliases || {};
      const ex = {}, np = {}, byK = {};
      fields.forEach(f => { byK[f.k] = f; if (f.t === 'auto' || f.t === 'ro') return; if (!ex[norm(f.l)]) ex[norm(f.l)] = f; if (!np[normNP(f.l)]) np[normNP(f.l)] = f; });
      const auto = new Set(fields.filter(f => f.t === 'auto' || f.t === 'ro').map(f => norm(f.l)));
      return h => {
        if (Object.prototype.hasOwnProperty.call(aliases, h)) {
          const a = aliases[h];
          if (a === null) return { skip: true };
          if (typeof a === 'string') { const base = a.replace(/__(st|src)$/, ''); return { k: a, f: /__(st|src)$/.test(a) ? null : byK[base], base }; }
          return a;
        }
        if (/\(otomatis\)/i.test(h) || auto.has(norm(h))) return { skip: true };
        const last = h.indexOf(' | ') >= 0 ? h.split(' | ').pop() : null;
        const f = ex[norm(h)] || np[normNP(h)] || (last && (ex[norm(last)] || np[normNP(last)]));
        return f ? { k: f.k, f } : null;
      };
    }
    function lamaPush(R, lembar, baris, label, v) { if (!has(v)) return; R.lama.push({ lembar, baris: baris || '', label, nilai: typeof v === 'number' ? String(v) : String(v) }); const k = lembar + ' › ' + label; L.tanpaPadanan[k] = (L.tanpaPadanan[k] || 0) + 1; }
    /* isi satu objek (bagian fields atau satu baris tabel/matriks) dari satu baris lama */
    function apply(target, R, row, match, lembar, baris, skip) {
      let n = 0;
      const keys = Object.keys(row), late = h => { const m = match(h); return m && (m.join || m.lama) ? 1 : 0; };
      keys.sort((a, b) => late(a) - late(b)).forEach(h => {
        if (META.has(h) || (skip && skip.includes(h))) return;
        const v = row[h]; if (!has(v)) return;
        const m = match(h);
        if (!m) { lamaPush(R, lembar, baris, h, v); return; }
        if (m.skip) return;
        if (m.join) { target[m.k] = (has(target[m.k]) ? target[m.k] + '; ' : '') + m.join + ': ' + v; n++; return; }
        if (m.lama) { lamaPush(R, lembar, baris, h, v); return; }
        const val = /__(st|src)$/.test(m.k) ? String(v).trim() : coerce(m.f, v, R);
        if (!has(val)) return;
        if (has(target[m.k]) && String(target[m.k]) !== String(val)) lamaPush(R, lembar, baris, h, v);
        else target[m.k] = val;
        n++;
      });
      return n;
    }
    function matchRowKey(rows, label) {
      const s = String(label || '').trim(); if (!s) return null;
      const byK = rows.find(r => r.k === s || r.k.toUpperCase() === s.toUpperCase()); if (byK) return byK.k;
      const n = norm(s), np = normNP(s);
      const hit = rows.find(r => norm(r.l) === n) || rows.find(r => normNP(r.l) === np) ||
        rows.find(r => { const a = norm(r.l), b = n; const k = Math.min(a.length, b.length, 24); return k >= 8 && a.slice(0, k) === b.slice(0, k); });
      return hit ? hit.k : null;
    }
    /* lembar → bagian */
    function doFields(R, rows, secId, lembar, aliases, skip) {
      const s = sec(R.sub, secId); const m = matcher(flds(s), aliases);
      rows.forEach(r => apply(R.data, R, r, m, lembar, r['Baris Excel'], skip));
    }
    function doTable(R, rows, secId, lembar, aliases, skip) {
      const s = sec(R.sub, secId); const m = matcher(flds(s), aliases);
      const out = R.data[secId] = R.data[secId] || [];
      rows.slice().sort((a, b) => (Number(a['Baris Excel']) || 0) - (Number(b['Baris Excel']) || 0)).forEach(r => {
        const o = {}; const n = apply(o, R, r, m, lembar + (has(r['Baris Excel']) ? '' : ''), r['Baris Excel'] || r['No'] || '', skip);
        if (n && Object.keys(o).length) out.push(o);
      });
      if (!out.length) delete R.data[secId];
    }
    function doMatrix(R, rows, secId, lembar, rowLabel, aliases) {
      const s = sec(R.sub, secId); const m = matcher(flds(s), aliases);
      const M = R.data[secId] = R.data[secId] || {};
      rows.forEach(r => {
        const label = typeof rowLabel === 'function' ? rowLabel(r) : r[rowLabel];
        let rk = matchRowKey(s.rows, String(label || '').replace(/^\s*·\s*$/, ''));
        if (!rk && has(r['Baris Excel']) && s.rows.some(x => x.k === 'q' + Number(r['Baris Excel'])) && secId === 'sistem_data') rk = 'q' + Number(r['Baris Excel']);
        const skip = typeof rowLabel === 'string' ? [rowLabel] : rowLabel.cols || [];
        if (!rk) { Object.keys(r).forEach(h => { if (!META.has(h) && !skip.includes(h)) lamaPush(R, lembar, (label || '') + '', h, r[h]); }); return; }
        const o = M[rk] = M[rk] || {};
        apply(o, R, r, m, lembar, label, skip);
        if (!Object.keys(o).length) delete M[rk];
      });
      if (!Object.keys(M).length) delete R.data[secId];
    }

    /* =============== C2: fasyankes, kerangka, undian (dibekukan) =============== */
    const regions = opt.regions || null;
    const facInfo = {};
    rowsOf('C2_Fasyankes').forEach(r => {
      const code = r['Kode fasyankes']; if (!code) return;
      facInfo[code] = { sentinel: r['C2b | Sentinel C5'] === 'Ya' ? 'Ya' : (r['C2b | Sentinel C5'] === 'Tidak' ? 'Tidak' : ''), perluasan: r['C2b | Perluasan diterapkan (Ya/Tidak)'] === 'Ya' ? 'Ya' : 'Tidak',
        tanggal: String(r['C2b | Tanggal undian'] || '').slice(0, 10), koordinator: r['C2b | Koordinator (kode/jabatan)'] || '' };
      if (r['C2a | Nama fasyankes'] || r['C2b | Nama fasyankes']) L.hitung['nama fasyankes tidak diimpor'] = (L.hitung['nama fasyankes tidak diimpor'] || 0) + 1;
    });
    const FRAMES = [['C2_A_TBHIV', 'A', 14], ['C2_B_ARV', 'B', 14], ['C2_CP3_TB', 'CP3', 11]];
    const frames = [], oldSel = {};
    FRAMES.forEach(([nm, fr, ncol]) => {
      const sh = sheet(nm); if (!sh) return;
      const i0 = sh.hdr.findIndex(h => /^Kode pasien/.test(h)); if (i0 < 0) { L.peringatan.push(nm + ': kolom "Kode pasien" tidak ditemukan'); return; }
      const letters = 'BCDEFGHIJKLMNO'.split('').slice(0, ncol);
      const byFac = {};
      sh.rows.forEach(r => { const f = r['Kode fasyankes']; if (f) (byFac[f] = byFac[f] || []).push(r); });
      Object.keys(byFac).forEach(fac => {
        const rows = byFac[fac].sort((a, b) => (Number(a['No']) || 0) - (Number(b['No']) || 0)).map((r, i) => {
          const o = { no: Number(r['No']) || i + 1 };
          const dcols = { A: 'FGKM', B: 'FK', CP3: 'FJ' }[fr];
          letters.forEach((Lt, j) => {
            let v = r[sh.hdr[i0 + j]]; if (!has(v)) return;
            if (dcols.indexOf(Lt) >= 0 && v !== '-') { const d = normDate(v); if (d.catatan) L.anomali.push({ formulir: 'C2 kerangka ' + fr, unit: fac + ' ' + (r[sh.hdr[i0 + 1]] || ''), isian: sh.hdr[i0 + j], nilai: String(v), keterangan: d.catatan }); v = d.v; }
            o[Lt] = typeof v === 'number' ? v : String(v);
          });
          const map = { s_pilihan: 'Pilihan purposif/pengganti (isi)', s_alasan: 'Alasan purposif', s_keterangan: 'Keterangan alasan dan masukan fasyankes', s_akses: 'Akses sumber',
            s_telaah: 'Status telaah', s_diganti: 'Diganti oleh (kode unit)', s_catatan: 'Catatan koordinator', m_status: 'Status pemilihan', m_terpilih: 'Terpilih (1/0)',
            m_kode_unit: 'Kode unit', m_no_urut: 'No urut acak', m_acak: 'Pilihan acak (otomatis)' };
          Object.keys(map).forEach(k => { const v = r[map[k]]; if (has(v)) o[k] = typeof v === 'number' ? v : String(v); });
          o.m_pilihan = o.s_pilihan || '';
          if (Number(o.m_terpilih) && o.m_kode_unit) oldSel[o.m_kode_unit] = { fac, frame: fr, status: o.m_status };
          return o;
        });
        const drawn = rows.some(x => has(x.m_status));
        const fi = facInfo[fac] || {};
        frames.push({ fac, frame: fr, rows, undian: drawn ? { tanggal: fi.tanggal || '', perluasan: fi.perluasan || 'Tidak', oleh: fi.koordinator || 'aplikasi lama' } : null });
        cnt('C2 kerangka ' + fr + ' (baris)', rows.length);
      });
    });

    /* =============== C3 =============== */
    function c3Matcher(sub) {
      const all = []; SUB[sub].s.sections.forEach(s => { if (s.type === 'fields') flds(s).forEach(f => all.push(f)); });
      const byK = {}; all.forEach(f => { byK[f.k] = f; });
      const lab = matcher(all, { 'Sumber CD4': { lama: true } });
      return h => {
        let m;
        if ((m = h.match(/^(St|Sumber) ([A-Z]\d{2}b?)$/))) { const f = byK[m[2]]; return f && f.st ? { k: m[2] + (m[1] === 'St' ? '__st' : '__src') } : (f ? { lama: true } : null); }
        if ((m = h.match(/^([A-Z]\d{2}b?)(\s|$)/)) && byK[m[1]]) { const f = byK[m[1]]; return f.t === 'auto' ? { skip: true } : { k: f.k, f }; }
        return lab(h);
      };
    }
    const CHILD = { Sumber: 'sumber', Rujukan: 'rujukan', Interupsi: 'interupsi' };
    const childSkip = h => /\(otomatis\)|^Hari |≤ batas/.test(h);
    function c3Unit(kind, sub, row, lembar, children) {
      const unit = row['U01 Kode unit (dari C2b)'] || row['U01'];
      if (!unit) return null;
      const R = rec(kind, sub, unit, { by: (row['Dikirim dari'] || '').split('·').pop().trim(), at: row['Waktu diperbarui'] || '', app: (row['Dikirim dari'] || '').split('·')[0].trim() });
      const m = c3Matcher(sub);
      apply(R.data, R, row, m, lembar, '', ['Waktu dibuat']);
      (children || []).forEach(([name, rows]) => {
        const s = sec(sub, CHILD[name]); const cm = matcher(flds(s));
        const out = R.data[s.id] = R.data[s.id] || [];
        rows.forEach(cr => { const o = {}; const skip = Object.keys(cr).filter(childSkip).concat(['Kode unit']); if (apply(o, R, cr, cm, name, cr['Kode unit'] || '', skip)) out.push(o); });
        if (!out.length) delete R.data[s.id];
      });
      return R;
    }
    const childRows = {};
    Object.keys(CHILD).forEach(n => rowsOf(n).forEach(r => { const u = r['Kode unit']; if (u) ((childRows[u] = childRows[u] || {})[n] = childRows[u][n] || []).push(r); }));
    [['Unit_A', 'C3A'], ['Unit_B', 'C3B']].forEach(([nm, sub]) => rowsOf(nm).forEach(r => {
      const u = r['U01 Kode unit (dari C2b)']; const ch = childRows[u] || {};
      if (c3Unit('kiriman', sub, r, nm, Object.keys(ch).map(k => [k, ch[k]]))) cnt('C3 ' + sub + ' kiriman');
      Object.keys(ch).forEach(k => { delete childRows[u][k]; });
    }));
    Object.keys(childRows).forEach(u => { const n = Object.values(childRows[u]).reduce((a, b) => a + b.length, 0); if (n) L.peringatan.push('Baris Sumber/Rujukan/Interupsi untuk ' + u + ' tidak punya unit C3 yang dikirim (' + n + ' baris, tidak diimpor)'); });
    // CP3 (register)
    const cp3m = matcher(flds(sec('C3CP3', 'CP3')), { 'Sentinel': null, 'Kode fasyankes': null });
    function cp3Unit(kind, r, lembar, meta) {
      const unit = r['Kode unit (dari C2b)']; if (!unit) return;
      const R = rec(kind, 'C3CP3', unit, meta); apply(R.data, R, r, cp3m, lembar, '', ['Kode unit (dari C2b)']); R.data.R_B = R.data.R_B || unit; cnt('C3 C3CP3 ' + kind);
    }
    rowsOf('CP3_Register').forEach(r => cp3Unit('kiriman', r, 'CP3_Register', { at: r['Waktu diperbarui'] }));

    /* =============== C4 / C5 / C6F lembar per kunci =============== */
    const C4SPEC = [['C4_Identitas', 'fields', 'identitas'], ['C4_Identitas_2', 'matrix', 'layanan', 'Layanan'], ['C4_Dugaan_C1', 'table', 'dugaan'], ['C4_Alur', 'table', 'alur'],
      ['C4_Dokumen_Stok', 'matrix', 'dokumen', 'Dokumen'], ['C4_Dokumen_Stok_2', 'matrix', 'stok', 'Item'],
      ['C4_Diagnostik_Pencatatan', 'matrix', 'd3', 'D3 Diagnostik dan pengiriman spesimen'], ['C4_Diagnostik_Pencatatan_2', 'matrix', 'd4', 'D4 Pencatatan dan pelaporan'],
      ['C4_Diagnostik_Pencatatan_3', 'matrix', 'd5', 'D5 Privasi, kerahasiaan, dan akses'], ['C4_Observasi', 'matrix', 'observasi', 'Butir'],
      ['C4_Wawancara', 'table', 'ww_peserta'], ['C4_Wawancara_2', 'table', 'ww_keterangan'], ['C4_Matriks_CP', 'matrix', 'matriks_cp', 'CP'],
      ['C4_Pendalaman_CP', 'table', 'pendalaman_cp'], ['C4_Daftar_Bukti', 'table', 'daftar_bukti'], ['C4_Kesimpulan', 'fields', 'kesimpulan']];
    const C5ID_ALIAS = { 'Register sumber lengkap untuk triwulan: TB/HIV-5': 'sumber_lengkap_untuk_periode_e', 'Register sumber lengkap untuk triwulan: TB/HIV-6': 'sumber_lengkap_untuk_periode_e_2',
      'Register sumber lengkap untuk triwulan: TB/HIV-4.1a': 'sumber_lengkap_untuk_periode_e_3' };
    const C5SPEC = [['C5_Identitas', 'fields', 'C5ID', 'identitas', C5ID_ALIAS], ['C5_Parameter', 'param', 'C5ID', 'parameter'], ['C5_Cocok_TBHIV5', 'table', 'C5_5', 'cocok'],
      ['C5_Cocok_TBHIV6', 'table', 'C5_6', 'cocok'], ['C5_Cocok_TBHIV4.1a', 'table', 'C5_41a', 'cocok'], ['C5_Alur_Pencatatan', 'table', 'C5ID', 'alur_pencatatan'],
      ['C5_Sistem_Data', 'matrix', 'C5ID', 'sistem_data', null, Object.assign(r => (r['Ranah'] || '') + ' · ' + (r['Pertanyaan'] || ''), { cols: ['Ranah', 'Pertanyaan'] })],
      ['C5_Tindak_Lanjut', 'table', 'C5ID', 'tindak_lanjut']];

    function convC4(kind, key, sheets, meta) {
      const R = rec(kind, 'C4', key, meta);
      C4SPEC.forEach(([nm, type, id, rl]) => {
        const rows = sheets[nm]; if (!rows || !rows.length) return;
        if (type === 'fields') doFields(R, rows, id, nm);
        else if (type === 'table') doTable(R, rows, id, nm);
        else doMatrix(R, rows, id, nm, rl, nm === 'C4_Matriks_CP' ? { 'Fokus': null, 'Ranah': null, 'M1 bukti minimum': null, 'M2 bukti minimum': null, 'M3 bukti minimum': null } : null);
      });
      return R;
    }
    function convC5(kind, key, sheets, meta) {
      C5SPEC.forEach(([nm, type, sub, id, alias, rl]) => {
        const rows = sheets[nm]; if (!rows || !rows.length) return;
        const R = rec(kind, sub, key, meta);
        if (type === 'fields') doFields(R, rows, id, nm, alias);
        else if (type === 'table') doTable(R, rows, id, nm, null, ['No']);
        else if (type === 'param') {
          const s = sec(sub, id);
          rows.forEach(r => { const f = flds(s).find(x => norm(x.l) === norm(r['Parameter']) || normNP(x.l) === normNP(r['Parameter'])); if (f) { if (has(r['Nilai'])) R.data[f.k] = coerce(f, r['Nilai'], R); } else lamaPush(R, nm, r['Baris Excel'], String(r['Parameter'] || 'Parameter'), r['Nilai']); });
        } else doMatrix(R, rows, id, nm, rl, { 'Penilaian': 'nilai', 'Bukti (kode)': 'bukti', 'Keterangan': 'ket' });
      });
    }
    /* C6F: Bagian A, B, dan panel */
    const A3_ALIAS = (() => {
      const g = (grp, sub) => grp + ' | ' + sub, a = {};
      const G = 'Gejala pertama dan kontak pertama terkait TB', DT = 'Diagnosis TB', DH = 'Diagnosis HIV', KA = 'Kondisi awal', PT = 'Pengobatan TB', PA = 'Pengobatan ARV',
        KV = 'Kotrimoksazol; viral load', KO = 'Komplikasi tercatat di rekam medis', RJ = 'Rujukan dan kehadiran di tujuan', IN = 'Interupsi, kepatuhan, penelusuran', PB = 'Perburukan dan respons', MT = 'Kematian', KW = 'Kategori waktu kematian';
      Object.assign(a, { [g(G, 'Gejala')]: 'gejala_tgl', [g(G, 'Kontak')]: 'kontak_tgl', [g(G, 'Fasilitas')]: 'kontak_fas', [g(G, 'Status')]: 'gejala_tgl__st', [g(G, 'Sumber')]: 'gejala_tgl__src',
        [g(DT, 'Tanggal')]: 'dx_tb_tgl', [g(DT, 'Dasar diagnosis')]: 'dx_tb_dasar', [g(DT, 'Lokasi')]: 'dx_tb_lokasi', [g(DT, 'Jenis')]: 'dx_tb_res', [g(DT, 'Tipe')]: 'dx_tb_tipe', [g(DT, 'Status')]: 'dx_tb_tgl__st', [g(DT, 'Sumber')]: 'dx_tb_tgl__src',
        [g(DH, 'Tanggal')]: 'dx_hiv_tgl', [g(DH, 'Waktu')]: 'dx_hiv_waktu', [g(DH, 'Status')]: 'dx_hiv_tgl__st', [g(DH, 'Sumber')]: 'dx_hiv_tgl__src',
        [g(KA, 'Rawat inap')]: 'ranap', [g(KA, 'Stadium klinis')]: 'stadium', [g(KA, 'CD4')]: 'cd4', [g(KA, 'CD4 (tgl)')]: 'cd4_tgl', [g(KA, 'IO lain')]: 'io_lain', [g(KA, 'Status gizi/IMT')]: 'gizi', [g(KA, 'Komorbid')]: 'komorbid',
        [g(KA, 'Status')]: { lama: true }, [g(KA, 'Sumber')]: { lama: true },
        [g(PT, 'Mulai OAT')]: 'oat_tgl', [g(PT, 'Paduan')]: 'oat_paduan', [g(PT, 'Perubahan/interupsi')]: 'oat_perubahan', [g(PT, 'Status')]: 'oat_tgl__st', [g(PT, 'Sumber')]: 'oat_tgl__src',
        [g(PA, 'Saat TB')]: 'arv_status', [g(PA, 'Mulai/ulang')]: 'arv_tgl', [g(PA, 'Paduan')]: 'arv_paduan', [g(PA, 'Status')]: 'arv_status__st', [g(PA, 'Sumber')]: 'arv_status__src',
        [g(KV, 'PPK')]: 'ppk', [g(KV, 'PPK (tgl)')]: 'ppk_tgl', [g(KV, 'VL')]: 'vl', [g(KV, 'VL (tgl)')]: 'vl_tgl', [g(KV, 'Status')]: { lama: true }, [g(KV, 'Sumber')]: { lama: true },
        [g(KO, 'Komplikasi')]: 'komplikasi', [g(KO, 'Lainnya')]: 'komplikasi_lain', [g(KO, 'Status')]: { lama: true }, [g(KO, 'Sumber')]: { lama: true },
        [g(RJ, 'Isian')]: 'rujukan', [g(RJ, 'Status')]: { lama: true }, [g(RJ, 'Sumber')]: { lama: true },
        [g(IN, 'Isian')]: 'interupsi', [g(IN, 'Status')]: { lama: true }, [g(IN, 'Sumber')]: { lama: true },
        [g(PB, 'Tanda bahaya pertama')]: 'bahaya_tgl', [g(PB, 'Respons')]: 'bahaya_respons', [g(PB, 'Status')]: 'bahaya_tgl__st', [g(PB, 'Sumber')]: 'bahaya_tgl__src',
        [g(MT, 'Tanggal')]: null, [g(MT, 'Tempat')]: 'mati_tempat', [g(MT, 'Sebab tercatat')]: 'mati_sebab', [g(MT, 'Status')]: { lama: true }, [g(MT, 'Sumber')]: { lama: true },
        [g(KW, 'Kategori')]: null, [g(KW, 'Status')]: { lama: true }, [g(KW, 'Sumber')]: { lama: true } });
      return a;
    })();
    const A1G = 'Duplikasi diperiksa; duplikat dari (kode calon)', DOK = 'Dokumentasi TB / HIV', MK = 'Status dan tanggal kematian terkonfirmasi',
      KP = 'Kode pasien (kode fasyankes + kode penghubung); umur saat kematian; jenis kelamin', PD = 'Pengambil data (kode); tanggal; durasi';
    const A1_ALIAS = { 'Sumber daftar calon': 'sumber_daftar', 'Ditemukan dari register kematian RS dan belum dinotifikasi': 'reg_rs_belum',
      [A1G + ' | Duplikasi diperiksa']: 'duplikasi', [A1G + ' | Duplikat dari']: 'duplikat_dari', [DOK + ' | TB']: 'dok_tb', [DOK + ' | HIV']: 'dok_hiv', [DOK + ' | Sumber']: 'dok_sumber',
      [MK + ' | Terkonfirmasi']: 'mati_konf', [MK + ' | Tanggal']: 'tgl_mati', [MK + ' | Sumber']: 'mati_sumber', 'Periode': 'periode',
      [KP + ' | Umur saat kematian (tahun)']: 'umur', [KP + ' | Jenis kelamin']: 'jk' };
    function convC6(kind, key, sheets, meta) {
      const A = rec(kind, 'C6A', key, meta);
      const s1 = (sheets.C6F_A1_Kelayakan || [])[0] || {}, s2 = (sheets.C6F_A1_Kelayakan_2 || [])[0] || {};
      const reg = { kode_kasus: s1['Kode kasus C6'] || key, kode_unit_c3: s1['Kode unit C3 bila sama'], fasyankes: s1['Fasyankes (kode)'], kode_pasien: s2[KP + ' | Kode pasien'],
        pengambil: s2[PD + ' | Pengambil data (kode)'], tgl_ambil: s2[PD + ' | Tanggal'], durasi: s2[PD + ' | Durasi (menit)'] };
      const regF = flds(sec('C6A', 'reg'));
      Object.keys(reg).forEach(k => { if (has(reg[k])) A.data[k] = coerce(regF.find(f => f.k === k), reg[k], A); });
      if (has(s1['Kab/kota'])) A.meta.kk = s1['Kab/kota'];
      if (sheets.C6F_A1_Kelayakan_2) doFields(A, sheets.C6F_A1_Kelayakan_2, 'A1', 'C6F_A1_Kelayakan_2', A1_ALIAS, [KP + ' | Kode pasien', PD + ' | Pengambil data (kode)', PD + ' | Tanggal', PD + ' | Durasi (menit)']);
      if (sheets.C6F_A2_Sumber) doTable(A, sheets.C6F_A2_Sumber, 'A2', 'C6F_A2_Sumber', { 'Akses: lengkap / sebagian / belum': 'akses', 'Jenis (RM jalan/inap, register TB/HIV, lab, farmasi, rujukan, ringkasan pulang, dokumen kematian)': 'jenis', 'Fasilitas (kode)': 'fas', 'Rentang tanggal': 'rentang', 'Kode sumber': 'kode' });
      if (sheets.C6F_A3_Data_kunci) {
        doFields(A, sheets.C6F_A3_Data_kunci, 'A3', 'C6F_A3_Data_kunci', A3_ALIAS);
        const t = sheets.C6F_A3_Data_kunci[0]['Kematian | Tanggal'];
        if (has(t)) { const d = coerce({ t: 'date', l: 'Tanggal kematian' }, t, A); if (!has(A.data.tgl_mati)) A.data.tgl_mati = d; else if (String(A.data.tgl_mati) !== String(d)) lamaPush(A, 'C6F_A3_Data_kunci', '', 'Kematian | Tanggal (berbeda dari A1)', t); }
        // status/sumber kelompok berlaku juga untuk tanggal pasangannya
        [['gejala_tgl', 'kontak_tgl'], ['arv_status', 'arv_tgl']].forEach(([a, b]) => { ['__st', '__src'].forEach(x => { if (has(A.data[a + x]) && has(A.data[b]) && !has(A.data[b + x])) A.data[b + x] = A.data[a + x]; }); });
      }
      if (sheets.C6F_A4_Kronologi) doTable(A, sheets.C6F_A4_Kronologi, 'kronologi', 'C6F_A4_Kronologi');
      if (sheets.C6F_A5_Tidak_tersedia) doTable(A, sheets.C6F_A5_Tidak_tersedia, 'A5', 'C6F_A5_Tidak_tersedia', { 'Informasi yang tidak ditemukan (dan sumber yang sudah diperiksa)': 'info', 'Keterangan petugas (W): siapa, tanggal, isi ringkas': 'w', 'Dampak terhadap penilaian': 'dampak' });
      if (sheets.C6F_A6_Kecukupan) {
        const SP = 'Salinan tanpa pengenal untuk penilaian kedua', PK = 'Penelaah klinis (kode), tanggal';
        doFields(A, sheets.C6F_A6_Kecukupan, 'A6', 'C6F_A6_Kecukupan', { 'Kecukupan kronologi | Kecukupan kronologi': 'kecukupan', 'Kecukupan kronologi | Terbatas: fase yang tidak dapat dinilai': 'fase_terbatas',
          [SP + ' | Disiapkan']: { k: 'salinan', join: 'disiapkan' }, [SP + ' | Kode berkas']: { k: 'salinan', join: 'kode berkas' }, [SP + ' | Oleh']: { k: 'salinan', join: 'oleh' }, [SP + ' | Tanggal']: { k: 'salinan', join: 'tanggal' },
          [PK + ' | Penelaah klinis (kode)']: { k: 'penelaah_cek', join: 'kode' }, [PK + ' | Tanggal']: { k: 'penelaah_cek', join: 'tanggal' } });
      }
      // Bagian B
      const bSheets = ['C6F_B1_Skor', 'C6F_B2_Keterlambatan', 'C6F_B3_Komplikasi', 'C6F_B4_Masalah', 'C6F_B5_Kesimpulan'];
      if (bSheets.some(n => sheets[n] && sheets[n].length)) {
        const B = rec(kind, 'C6B', key, meta);
        if (sheets.C6F_B1_Skor) doMatrix(B, sheets.C6F_B1_Skor, 'B1', 'C6F_B1_Skor', Object.assign(r => String(r['Fase'] || '').split(' ')[0], { cols: ['Fase', 'Cakupan'] }), { 'Skor 1–5 / BD': 'skor' });
        if (sheets.C6F_B2_Keterlambatan) doMatrix(B, sheets.C6F_B2_Keterlambatan, 'B2', 'C6F_B2_Keterlambatan', 'Keterlambatan');
        if (sheets.C6F_B3_Komplikasi) doMatrix(B, sheets.C6F_B3_Komplikasi, 'B3', 'C6F_B3_Komplikasi', 'Komplikasi');
        if (sheets.C6F_B4_Masalah) doTable(B, sheets.C6F_B4_Masalah, 'B4', 'C6F_B4_Masalah', { 'Masalah klinis atau pelayanan, dan fase': 'masalah', 'Faktor penyumbang dan faktor sistem (F1–F7)': 'penyumbang',
          'Peluang perbaikan dan pihak yang dapat menindaklanjuti': 'peluang', 'Bukti dan penjelasan alternatif': 'bukti' });
        if (sheets.C6F_B5_Kesimpulan) {
          const PN = 'Penelaah 1 (kode), tanggal, durasi penilaian (menit)';
          doFields(B, sheets.C6F_B5_Kesimpulan, 'B5', 'C6F_B5_Kesimpulan', { 'Sebab kematian tercatat dan sumbernya': 'sebab', 'Dugaan hubungan dengan TB (bukan penetapan sebab resmi)': 'hubungan',
            'Peluang perbaikan pelayanan': 'peluang', 'Pertanyaan untuk panel': 'panel_q', [PN + ' | Penelaah 1 (kode)']: null, [PN + ' | Tanggal']: null, [PN + ' | Durasi (menit)']: null });
          const r = sheets.C6F_B5_Kesimpulan[0], hf = flds(sec('C6B', 'hdr'));
          [['penelaah1', 'Penelaah 1 (kode)'], ['tgl', 'Tanggal'], ['durasi', 'Durasi (menit)']].forEach(([k, sl]) => { const v = r[PN + ' | ' + sl]; if (has(v)) B.data[k] = coerce(hf.find(f => f.k === k), v, B); });
        }
        if (!Object.keys(B.data).length && !B.lama.length) delete STORE[kind]['C6|C6B|' + key];
      }
      if (sheets.C6F_Panel && sheets.C6F_Panel.some(r => Object.keys(r).some(h => !META.has(h) && has(r[h])))) {
        const P = rec(kind, 'C6P', key, meta);
        doFields(P, sheets.C6F_Panel, 'panel', 'C6F_Panel', { 'Tanggal panel; peserta (kode) | Tanggal panel': 'tgl', 'Tanggal panel; peserta (kode) | Peserta (kode)': 'peserta', 'Alasan dibahas': 'alasan',
          'Ringkasan perbedaan penilaian pertama dan kedua (fase, skor, peluang perbaikan)': 'ringkasan', 'Hasil pembahasan': 'hasil', 'Klasifikasi akhir faktor penyumbang (rujuk nomor masalah B4)': 'klas_akhir',
          'Peluang perbaikan akhir dan implikasi program': 'implikasi', 'Pengelola program yang diundang pada pembahasan implikasi (bila ada; tidak ikut menetapkan klasifikasi)': 'pengelola' });
        if (!Object.keys(P.data).length && !P.lama.length) delete STORE[kind]['C6|C6P|' + key];
      }
    }
    /* kumpulkan lembar kiriman per kunci */
    function byKey(prefix, keyCol) {
      const out = {};
      wb.SheetNames.filter(n => n.startsWith(prefix) && !/_Rekaman$/.test(n)).forEach(n => rowsOf(n).forEach(r => { const k = r[keyCol || 'Kunci']; if (k) (((out[k] = out[k] || {})[n]) = out[k][n] || []).push(r); }));
      return out;
    }
    const rekam = {};
    ['C1', 'C4', 'C5', 'C6F', 'C6C', 'C6R', 'C7', 'C9'].forEach(p => rowsOf(p + '_Rekaman').forEach(r => { rekam[p + '|' + r['Kunci']] = { by: r['Dikirim oleh'] || '', at: r['Waktu diperbarui'] || '' }; }));
    const k4 = byKey('C4_'); Object.keys(k4).forEach(k => { convC4('kiriman', k, k4[k], rekam['C4|' + k]); cnt('C4 kiriman'); });
    if (Object.keys(k4).length) L.catatan.push('C4_Navigasi (status langkah kerja) tidak diimpor; status dikelola aplikasi baru.');
    const k5 = byKey('C5_'); Object.keys(k5).forEach(k => { convC5('kiriman', k, k5[k], rekam['C5|' + k]); cnt('C5 kiriman (fasyankes)'); });
    if (rowsOf('C5_Rekap').length) L.catatan.push('C5_Rekap (hitungan) tidak diimpor; dihitung ulang aplikasi baru dari lembar pencocokan.');
    const k6 = byKey('C6F_'); Object.keys(k6).forEach(k => { convC6('kiriman', k, k6[k], rekam['C6F|' + k]); cnt('C6 kasus kiriman'); });

    /* =============== C6 register: calon dan kasus =============== */
    const calon = []; const calonByPas = {};
    rowsOf('C6R_Daftar_Calon').forEach(r => {
      const o = { kk: r['Kab/kota'], fasyankes: r['Fasyankes (kode RCA)'], kode_calon: r['Kode calon'], kode_pasien: r['Kode pasien (kode fasyankes + kode penghubung, contoh BLL-RS-P008)'],
        sumber: r['Sumber daftar'], reg_rs: r['Dari register kematian RS, belum dinotifikasi'], duplikasi: r['Duplikasi diperiksa'], tb: r['TB terdokumentasi'], hiv: r['HIV terdokumentasi'],
        mati: r['Kematian terkonfirmasi'], tgl_mati: String(r['Tanggal kematian'] || '').slice(0, 10), kecukupan: r['Kecukupan dokumen'], dipilih: r['Dipilih'], alasan: r['Alasan purposif'],
        kode_kasus: r['Kode kasus C6'], kode_unit_c3: r['Kode unit C3 bila sama'], status: r['Status telaah'], alasan_gagal: r['Alasan tidak dapat ditelaah'], duplikat_dari: r['Duplikat dari (kode calon)'] };
      Object.keys(o).forEach(k => { if (!has(o[k])) delete o[k]; else o[k] = String(o[k]); });
      calon.push(o); if (o.kode_pasien) calonByPas[o.kode_pasien] = o;
      if (o.dipilih === 'Ya' && r['Memenuhi syarat (otomatis)'] !== 'Ya') {
        const why = [o.duplikasi !== 'Ya' ? 'duplikasi: ' + (o.duplikasi || 'kosong') : '', o.tb !== 'Ya' ? 'TB: ' + (o.tb || 'kosong') : '', o.hiv !== 'Ya' ? 'HIV: ' + (o.hiv || 'kosong') : '',
          o.mati !== 'Ya' ? 'kematian: ' + (o.mati || 'kosong') : '', !o.tgl_mati ? 'tanggal kematian kosong' : (o.tgl_mati < '2024-01-01' || o.tgl_mati > '2026-06-30' ? 'tanggal kematian ' + o.tgl_mati + ' di luar periode' : '')].filter(Boolean);
        L.peringatan.push('Calon ' + o.kode_calon + ' (kasus ' + (o.kode_kasus || '-') + ') sudah dipilih di aplikasi lama tetapi belum memenuhi syarat' + (why.length ? ' (' + why.join(', ') + ')' : '') + '. Diimpor apa adanya; lengkapi verifikasi di C2 › Calon kematian C6.');
      }
    });
    rowsOf('C2_C6_Calon_Kematian').forEach(r => {
      const kp = r['Kode pasien']; if (!kp) return;
      const ex = calonByPas[kp];
      const extra = { asal: r['Asal baris'] || '', catatan_impor: r['Catatan fasyankes'] || '' };
      if (ex) { if (extra.asal && !ex.asal) ex.asal = extra.asal; if (extra.catatan_impor) ex.catatan_impor = extra.catatan_impor; return; }
      const o = { kk: r['Kab/kota'], fasyankes: r['Fasyankes (kode RCA)'] || r['Kode fasyankes'], kode_pasien: kp, sumber: r['Sumber daftar'], reg_rs: r['Dari register kematian RS, belum dinotifikasi'],
        duplikasi: r['Duplikasi diperiksa'], tb: r['TB terdokumentasi'], hiv: r['HIV terdokumentasi'], mati: r['Kematian terkonfirmasi'], tgl_mati: String(r['Tanggal kematian'] || '').slice(0, 10),
        kecukupan: r['Kecukupan dokumen'], kode_unit_c3: r['Kode unit C3 bila sama'], asal: extra.asal, catatan_impor: extra.catatan_impor };
      Object.keys(o).forEach(k => { if (!has(o[k])) delete o[k]; else o[k] = String(o[k]); });
      calon.push(o); calonByPas[kp] = o;
    });
    cnt('C6 calon', calon.length);
    const kasusRow = {}; rowsOf('C6R_Kasus').forEach(r => { if (r['Kode kasus C6']) kasusRow[r['Kode kasus C6']] = r; });
    // kasus di register tanpa formulir: buat Bagian A ringkas dari register (Draf)
    const regToA = (R, r) => {
      const a3 = flds(sec('C6A', 'A3')), regF = flds(sec('C6A', 'reg')), a1 = flds(sec('C6A', 'A1')), F = (L2, k) => L2.find(f => f.k === k);
      const put = (fl, k, v) => {
        if (!has(v)) return; const f = F(fl, k);
        if (!has(R.data[k])) { R.data[k] = coerce(f, v, R); return; }
        const nv = f && f.t === 'date' ? normDate(v).v : String(v).trim();
        if (String(R.data[k]) !== String(nv)) { lamaPush(R, 'C6R_Kasus (register C6)', r['Kode kasus C6'], (f && f.l) || k, v); L.anomali.push({ formulir: 'C6A', unit: R.unit, isian: (f && f.l) || k, nilai: String(R.data[k]), keterangan: 'berbeda dengan register C6 (register: ' + nv + '); nilai formulir dipakai' }); }
      };
      put(regF, 'kode_kasus', r['Kode kasus C6']); put(regF, 'kode_pasien', r['Kode pasien (kode fasyankes + kode penghubung)']); put(regF, 'pengambil', r['Pengambil data (kode)']);
      put(a3, 'dx_tb_tgl', r['Tanggal diagnosis TB']);
      const oat = r["Tanggal mulai OAT (tulis 'Tidak dimulai' hanya bila terdokumentasi belum pernah OAT)"]; if (/tidak dimulai/i.test(String(oat))) put(a3, 'oat_tidak', 'Ya'); else put(a3, 'oat_tgl', oat);
      put(a3, 'arv_status', r['Status ARV saat TB']); put(a3, 'arv_tgl', r['Tanggal mulai ARV selama episode']); put(a1, 'tgl_mati', r['Tanggal kematian']);
      ['Penelaah 1 (kode)', 'Penelaah 2 (kode)', 'Kecukupan dokumen', 'Implikasi program luas (isi)', 'Hasil panel', 'Peluang perbaikan akhir', 'Catatan panel dan perbedaan pendapat'].forEach(h => lamaPush(R, 'C6R_Kasus', r['Kode kasus C6'], h, r[h]));
    };

    /* =============== C1 =============== */
    const c1 = byKey('C1_');
    Object.keys(c1).forEach(k => {
      const sh = c1[k], R = rec('kiriman', 'C1', k, rekam['C1|' + k]);
      const one = n => (sh[n] || [])[0];
      const P = one('C1_Profil');
      if (P) {
        doFields(R, [P], 'hdr', 'C1_Profil', { 'Provinsi': 'provinsi', 'Kelompok capaian dalam provinsi': 'kedudukan', 'Skor kaskade (persentil dalam provinsi)': 'skor',
          'Kabupaten/kota pasangan pembanding': { k: 'pasangan', join: 'kab/kota' }, 'Skor kaskade pasangan': { k: 'pasangan', join: 'skor' }, 'Ringkasan profil awal': 'ringkasan',
          'Tanggal pendalaman bersama daerah': 'tgl_pendalaman', 'Peserta daerah (jabatan)': 'peserta', 'Petugas penghubung kunjungan (jabatan)': null,
          'Kode kabupaten/kota': null, 'Nama kabupaten/kota': null });
        const pg = P['Petugas penghubung kunjungan (jabatan)']; if (has(pg)) R.data.penghubung = String(pg);
      }
      const T = (n, id, alias, skip) => { if (sh[n]) doTable(R, sh[n], id, n, alias, skip); };
      T('C1_Indikator', 'indikator', { 'Indikator': 'indikator', 'Nilai kabupaten/kota (profil awal)': 'nilai', 'Nilai provinsi': 'provinsi', 'Nilai pasangan': 'pasangan', 'Status konfirmasi': 'konfirmasi',
        'Angka setelah konfirmasi atau koreksi': 'nilai_konf', 'Sumber dan periode konfirmasi': 'ket_konf', 'Catatan': { k: 'keterbatasan', join: 'catatan' } });
      T('C1_Masalah', 'masalah', { 'Masalah utama dari profil awal': 'masalah', 'Hasil pendalaman': { k: 'masalah', join: 'hasil pendalaman' }, 'Catatan': { k: 'masalah', join: 'catatan' } });
      T('C1_Fokus', 'usulan_fokus', { 'Fokus (titik penilaian)': 'fokus', 'Alasan dari profil awal': 'alasan', 'Titik penilaian': { k: 'alasan', join: 'titik penilaian' }, 'Disepakati': { k: 'alasan', join: 'disepakati' } });
      T('C1_Dugaan', 'dugaan', { 'Dugaan penyebab awal': 'dugaan', 'Titik penilaian terkait': 'cp', 'Bukti yang diperlukan': 'bukti', 'Instrumen pemeriksa': { k: 'fokus', join: 'instrumen' }, 'Fasilitas tempat diperiksa': { k: 'fokus', join: 'fasilitas' } });
      T('C1_Belum', 'belum_jelas', { 'Informasi yang belum diketahui': 'info', 'Sumber untuk menjawab': 'rencana', 'Status': { k: 'rencana', join: 'status' }, 'Catatan': { k: 'rencana', join: 'catatan' } });
      T('C1_Kandidat_2', 'kandidat', { 'Fasyankes': 'fasyankes', 'Jenis': 'jenis', 'Kasus TB-HIV 2025 (2026)': 'tbhiv', 'Status HIV': 'status_hiv', 'ARV': 'arv', 'Berhasil Jan–Ags 2025 (n)': 'berhasil',
        'TPT ODHIV baru (n)': 'tpt_baru', 'TPT ODHIV dalam ART': 'tpt_art', 'Skor usulan': 'skor', 'Sentinel': 'sentinel', 'Alasan atau catatan': 'catatan',
        'Kode fasilitas (otomatis)': { k: 'catatan', join: 'kode' }, 'Status': { k: 'catatan', join: 'status' } });
      T('C1_Informan', 'pertanyaan', { 'Informan (jabatan atau peran)': 'kelompok', 'Pertanyaan pendalaman': 'pertanyaan', 'Dipakai di': { k: 'pertanyaan', join: 'dipakai di' }, 'Status': { k: 'pertanyaan', join: 'status' } });
      T('C1_Dokumen', 'sumber', { 'Dokumen yang diminta': 'sumber', 'Status': 'status', 'Catatan': { lama: true }, 'Tanggal diterima': { lama: true } });
      T('C1_Sumber_Kasus', 'sumber');
      const K = one('C1_Kandidat'); if (K) Object.keys(K).forEach(h => { if (!META.has(h)) lamaPush(R, 'C1_Kandidat', '', h, K[h]); });
      const H = one('C1_Hasil');
      if (H) doFields(R, [H], 'hasil', 'C1_Hasil', { 'Fasilitas dan sentinel yang disepakati': 'fas_utama', 'Penanggung jawab tindak lanjut (jabatan)': 'pj', 'Tindak lanjut sebelum kunjungan': 'tindak_lanjut',
        'Tenggat tindak lanjut': { k: 'tindak_lanjut', join: 'tenggat' }, 'Fokus kunjungan': { k: 'catatan', join: 'fokus kunjungan' }, 'Status akses sistem lokal': { k: 'catatan', join: 'status akses sistem lokal' },
        'Disetujui koordinator (kode)': { k: 'catatan', join: 'disetujui koordinator' }, 'Tanggal persetujuan': { k: 'catatan', join: 'tanggal persetujuan' } });
      cnt('C1 kiriman');
    });

    /* =============== C7 =============== */
    const sessions = [];
    rowsOf('C7_Daftar_Sesi_2').forEach(r => {
      const code = r['Kode sesi']; if (!code) return;
      sessions.push({ code: String(code).toUpperCase(), kk: r['Kab/kota'] || '', target: r['Informan sasaran'] || '' });
      const R = rec('kiriman', 'C7S', String(code).toUpperCase(), rekam['C7|' + r['Kunci']]);
      doFields(R, [r], 'daftar', 'C7_Daftar_Sesi_2', { 'Kab/kota': 'kk', 'Semua bersedia (Ya/Tidak)': 'bersedia', 'Direkam (Ya/Tidak)': 'direkam', 'Lembar catatan sesi selesai (Ya/Tidak)': 'lembar_selesai' });
      cnt('C7 sesi');
    });
    rowsOf('C7_Cakupan').forEach(r => {
      const kk = r['Kab/kota']; if (!kk) return;
      if (!Object.keys(r).some(h => !META.has(h) && h !== 'Kab/kota' && has(r[h]))) return;
      const R = rec('kiriman', 'C7K', kk, rekam['C7|' + r['Kunci']]); doFields(R, [r], 'cakupan', 'C7_Cakupan', { 'Kab/kota': null }); cnt('C7 cakupan');
    });
    if (rowsOf('C7_Daftar_Sesi').length) L.catatan.push('C7_Daftar_Sesi (target per provinsi) tidak diimpor; target sesi ada di aplikasi baru.');
    const c9 = wb.SheetNames.filter(n => /^C9_/.test(n) && !/_Rekaman$/.test(n)).map(n => [n, rowsOf(n).length]).filter(x => x[1]);
    if (c9.length) L.catatan.push('C9 (pengambilan data ganda/mutu) belum ada di aplikasi baru dan tidak diimpor: ' + c9.map(x => x[0] + ' ' + x[1] + ' baris').join(', ') + '. Data tetap tersimpan di berkas lama.');

    /* =============== draf (Titipan) =============== */
    const tit = sheet('Titipan');
    const learned = {};   // label baris tabel templat yang dipelajari dari data kiriman: lembar|baris → nilai kolom label
    function learn(osh, rowCol) { if (learned[osh]) return learned[osh]; const m = {}; rowsOf(osh).forEach(r => { if (has(r['Baris Excel']) && has(r[rowCol])) m[Number(r['Baris Excel'])] = r[rowCol]; }); return (learned[osh] = m); }
    const ROWCOL = {}; C4SPEC.forEach(x => { if (x[1] === 'matrix') ROWCOL[x[0]] = x[3]; });
    Object.assign(ROWCOL, { C5_Sistem_Data: ['Ranah', 'Pertanyaan'], C6F_B1_Skor: ['Fase', 'Cakupan'], C6F_B2_Keterlambatan: 'Keterlambatan', C6F_B3_Komplikasi: 'Komplikasi', C5_Parameter: 'Parameter' });
    function cellsToSheets(inst, key, vals) {
      const out = {}, sisa = [];
      const addRow = (osh, r, h, v) => { const list = out[osh] = out[osh] || []; let o = list.find(x => x['Baris Excel'] === r); if (!o) { o = { 'Kunci': key, 'Baris Excel': r }; list.push(o); } o[h] = v; };
      Object.keys(vals || {}).filter(sh => !/^(Navigasi|Rekap|Petunjuk|Pilihan|Acuan_CP)$/.test(sh)).forEach(sh => Object.keys(vals[sh]).forEach(rc => {
        const v = vals[sh][rc]; if (!has(v)) return;
        const [r, c] = rc.split(',').map(Number); let done = false;
        if (inst === 'C4' || inst === 'C5') {
          const f = Object.keys(TPL.fields).find(o => o.startsWith(inst + '_') && TPL.fields[o].sheet === sh && TPL.fields[o].rows[r] && c === 2);
          if (f) { const o = (out[f] = out[f] || [{ 'Kunci': key }])[0]; o[TPL.fields[f].rows[r]] = v; done = true; }
          else {
            const t = Object.keys(TPL.tables).find(o => o.startsWith(inst + '_') && TPL.tables[o].sheet === sh && r >= TPL.tables[o].from && r <= TPL.tables[o].to);
            if (t) { const hdr = content(t), h = hdr[c - 1 - (TPL.tables[t].off || 0)]; if (h) { addRow(t, r, h, v); done = true; } }
          }
        } else if (inst === 'C6F') {
          if (C6F_FIELDS[sh] && c === 2) {
            const blocks = C6F_FIELDS[sh];
            for (let i = blocks.length - 1; i >= 0; i--) { const [r0, osh] = blocks[i]; if (r >= r0) { const h = content(osh)[r - r0]; if (h) { (out[osh] = out[osh] || [{ 'Kunci': key }])[0][h] = v; done = true; } break; } }
          } else if (C6F_TABLES.includes(sh)) { const osh = 'C6F_' + sh, h = content(osh)[c - 1]; if (h) { addRow(osh, r, h, v); done = true; } }
        }
        if (!done) sisa.push({ sh, rc, v });
      }));
      // lengkapi kolom label baris dari templat yang dipelajari
      Object.keys(out).forEach(osh => {
        const rc = ROWCOL[osh]; if (!rc) return;
        (Array.isArray(rc) ? rc : [rc]).forEach(col => { const m = learn(osh, col); out[osh].forEach(o => { if (!has(o[col]) && m[o['Baris Excel']]) o[col] = m[o['Baris Excel']]; }); });
      });
      return { sheets: out, sisa };
    }
    if (tit) tit.rows.forEach(t => {
      const inst = t['Instrumen'], key = t['Kunci'];
      const js = Object.keys(t).filter(h => /^Bagian \d+$/.test(h)).sort((a, b) => parseInt(a.slice(7)) - parseInt(b.slice(7))).map(h => t[h] || '').join('');
      let o; try { o = JSON.parse(js); } catch (e) { L.peringatan.push('Draf ' + inst + ' ' + key + ' tidak dapat dibaca (JSON rusak)'); return; }
      const meta = { by: t['Petugas'] || '', at: t['Waktu'] || '', ringkas: t['Ringkasan'] || '' };
      if (inst === 'C3' || inst === 'C3G') {
        if (inst === 'C3G') { cnt('draf C3 pengambilan ganda (C9) dilewati'); return; }
        const sub = o.type === 'B' ? 'C3B' : 'C3A';
        const row = Object.assign({ 'U01 Kode unit (dari C2b)': key }, o.data || {});
        const ch = []; Object.keys(o.children || {}).forEach(n => { const cap = n.charAt(0).toUpperCase() + n.slice(1); const rows = (o.children[n] || []).map(x => { const y = {}; Object.keys(x).forEach(k => { if (k.charAt(0) !== '_') y[k] = x[k]; }); return y; }).filter(y => Object.keys(y).some(k => has(y[k]))); if (rows.length && CHILD[cap]) ch.push([cap, rows]); });
        c3Unit('draf', sub, row, 'Titipan ' + inst, ch); STORE.draf['C3|' + sub + '|' + key].meta = meta; return;
      }
      if (inst === 'CP3') {
        (o.episodes || []).forEach(ep => { const r = Object.assign({ 'Kode penelaah': (o.data || {}).penelaah, 'Tanggal telaah': (o.data || {}).tanggal }, ep); cp3Unit('draf', r, 'Titipan CP3', meta); });
        return;
      }
      if (inst === 'C4' || inst === 'C5' || inst === 'C6F') {
        const { sheets, sisa } = cellsToSheets(inst, key, o.vals);
        if (inst === 'C4') convC4('draf', key, sheets, meta);
        if (inst === 'C5') convC5('draf', key, sheets, meta);
        if (inst === 'C6F') { convC6('draf', key, sheets, meta); if (!STORE.kiriman['C6|C6A|' + key] && kasusRow[key]) regToA(STORE.draf['C6|C6A|' + key], kasusRow[key]); }
        if (sisa.length) { const R = rec('draf', inst === 'C4' ? 'C4' : inst === 'C5' ? 'C5ID' : 'C6A', key, meta); sisa.forEach(x => lamaPush(R, 'Titipan ' + x.sh, x.rc, 'sel ' + x.rc, x.v)); }
        return;
      }
      L.peringatan.push('Draf ' + inst + ' ' + key + ' (' + (meta.ringkas || '') + ') tidak dikenali; tidak diimpor.');
    });
    // kasus register tanpa formulir apa pun
    Object.keys(kasusRow).forEach(k => { if (!STORE.kiriman['C6|C6A|' + k] && !STORE.draf['C6|C6A|' + k]) { const R = rec('draf', 'C6A', k, { by: 'register C6 aplikasi lama', at: kasusRow[k]['Waktu diperbarui'] }); regToA(R, kasusRow[k]); cnt('C6A dari register'); } });

    /* =============== susun rekaman: kiriman / draf / cadangan =============== */
    const leafs = (o, p, acc) => { acc = acc || {}; p = p || ''; if (Array.isArray(o)) { if (o.length && typeof o[0] !== 'object') acc[p] = o.join('; '); else o.forEach((x, i) => leafs(x, p + '[' + i + ']', acc)); } else if (o && typeof o === 'object') Object.keys(o).forEach(k => leafs(o[k], p ? p + '.' + k : k, acc)); else if (has(o)) acc[p] = String(o); return acc; };
    function merge(base, over) {
      const out = JSON.parse(JSON.stringify(base));
      Object.keys(over).forEach(k => {
        const v = over[k];
        if (Array.isArray(v) && v.length && typeof v[0] === 'object') { const arr = out[k] = Array.isArray(out[k]) ? out[k] : []; v.forEach((row, i) => { arr[i] = Object.assign({}, arr[i] || {}, row); }); }
        else if (v && typeof v === 'object' && !Array.isArray(v)) { const m = out[k] = out[k] && typeof out[k] === 'object' ? out[k] : {}; Object.keys(v).forEach(r => { m[r] = Object.assign({}, m[r] || {}, v[r]); }); }
        else if (has(v)) out[k] = v;
      });
      return out;
    }
    const stamp = (R, sumber) => { const d = R.data; d._impor = { sumber, oleh: R.meta.by || '', waktu: R.meta.at || '', aplikasi: R.meta.app || 'aplikasi lama', ringkas: R.meta.ringkas || '' }; if (R.lama.length) d._lama = R.lama; return d; };
    const records = [];
    Object.values(STORE.kiriman).forEach(R => records.push({ form: R.form, sub: R.sub, unit: R.unit, status: 'Dikirim', mode: 'main', data: stamp(R, 'Kiriman aplikasi lama'), by: R.meta.by || '', at: R.meta.at || '' }));
    Object.values(STORE.draf).forEach(R => {
      const k = R.form + '|' + R.sub + '|' + R.unit, S0 = STORE.kiriman[k];
      if (!S0) { records.push({ form: R.form, sub: R.sub, unit: R.unit, status: 'Draf', mode: 'main', data: stamp(R, 'Draf aplikasi lama (belum dikirim)'), by: R.meta.by || '', at: R.meta.at || '', note: 'draf belum dikirim' }); cnt('draf tanpa kiriman → Draf'); return; }
      const merged = merge(S0.data, R.data); const a = leafs(S0.data), b = leafs(merged);
      const diff = Object.keys(b).filter(x => x.charAt(0) !== '_' && a[x] !== b[x]);
      const lamaBaru = R.lama.filter(x => !S0.lama.some(y => y.label === x.label && y.nilai === x.nilai));
      if (lamaBaru.length) {   // isian yang hanya ada di draf (mis. butir yang tidak punya kolom di lembar server lama) ikut disimpan di rekaman utama
        const main = records.find(x => x.mode === 'main' && x.form === R.form && x.sub === R.sub && x.unit === R.unit);
        if (main) { main.data._lama = (main.data._lama || []).concat(lamaBaru.map(x => Object.assign({}, x, { lembar: x.lembar + ' (hanya di draf ' + (R.meta.at || '') + ')' }))); cnt('isian hanya-di-draf disimpan ke rekaman utama', lamaBaru.length); }
      }
      if (!diff.length) { cnt('draf identik dengan kiriman (dilewati)'); return; }
      merged._impor = { sumber: 'Draf aplikasi lama yang berbeda dari kiriman', oleh: R.meta.by || '', waktu: R.meta.at || '', berbeda: diff.slice(0, 60) };
      merged._lama = (S0.lama || []).concat(lamaBaru);
      records.push({ form: R.form, sub: R.sub, unit: R.unit, status: 'Dikirim', mode: 'backup', data: merged, by: R.meta.by || '', at: R.meta.at || '', note: diff.length + ' isian berbeda; draf ' + (R.meta.at || '') });
      cnt('draf berbeda → versi cadangan');
    });

    /* =============== pemeriksaan silang =============== */
    const sentinelFac = {};
    Object.keys(facInfo).forEach(f => { sentinelFac[f] = facInfo[f].sentinel; });
    records.filter(r => r.form === 'C5' && r.mode === 'main').forEach(r => {
      const f = r.unit;
      if (STORE.kiriman['C5|C5ID|' + f] || STORE.kiriman['C5|C5_5|' + f] || STORE.kiriman['C5|C5_6|' + f] || STORE.kiriman['C5|C5_41a|' + f]) { if (sentinelFac[f] !== 'Ya') { if (!L._sent || !L._sent[f]) { L.catatan.push(f + ' ditetapkan sentinel C5 karena memiliki data C5 yang dikirim (di C2_Fasyankes kolom sentinel ' + (sentinelFac[f] || 'kosong') + ').'); (L._sent = L._sent || {})[f] = 1; } sentinelFac[f] = 'Ya'; } }
      else if (sentinelFac[f] !== 'Ya' && !(L._ns || {})[f]) { L.peringatan.push('Draf C5 untuk ' + f + ' diimpor sebagai Draf, tetapi ' + f + ' bukan sentinel sehingga tidak tampil di daftar C5 (satu sentinel per provinsi).'); (L._ns = L._ns || {})[f] = 1; }
    });
    delete L._sent; delete L._ns;
    const fac = Object.keys(facInfo).map(code => ({ code, sentinel: sentinelFac[code] === 'Ya' ? 'Ya' : 'Tidak', perluasan: facInfo[code].perluasan }));
    records.filter(r => r.form === 'C3').forEach(r => { if (!oldSel[r.unit]) L.peringatan.push(r.sub + ' ' + r.unit + ': unit tidak tercatat terpilih di kerangka C2 lama; data diimpor tetapi unit tidak tampil di daftar C3 sampai dipilih sebagai purposif/pengganti.'); });
    const kasusSel = new Set(calon.filter(c => c.dipilih === 'Ya' && c.kode_kasus).map(c => c.kode_kasus));
    records.filter(r => r.form === 'C6').forEach(r => { if (!kasusSel.has(r.unit) && !(L._k || {})[r.unit]) { L.peringatan.push('Kasus ' + r.unit + ' punya isian C6 tetapi tidak tercatat sebagai calon terpilih; tidak tampil di daftar C6 sampai calonnya ditandai dipilih.'); (L._k = L._k || {})[r.unit] = 1; } });
    delete L._k;

    const pkg = { versi: 1, dibuat: new Date().toISOString(), sumber: opt.fileName || '', fac, frames, calon, sessions, records, laporan: L };
    return pkg;
  };

  /* ringkasan untuk tampilan */
  MIG.summary = function (pkg) {
    const by = {}; pkg.records.forEach(r => { const k = r.sub + (r.mode === 'backup' ? ' (cadangan)' : r.status === 'Draf' ? ' (draf)' : ''); by[k] = (by[k] || 0) + 1; });
    return by;
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = MIG;
  root.RCA_MIGRATE = MIG;
})(typeof window !== 'undefined' ? window : globalThis);
