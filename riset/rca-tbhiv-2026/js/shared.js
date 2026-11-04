/* RCA TB-HIV 2026 · daftar bersama per fasyankes dan isian awal dari C2a.
   Daftar bersama: sumber dokumen (kode, jenis, lokasi, akses, petugas penghubung), kode bukti, dan isian berulang
   (fasilitas, petugas, paduan obat, …) diisi sekali di satu unit lalu muncul sebagai pilihan di semua unit
   fasyankes yang sama. Server mengumpulkannya otomatis setiap kali isian disimpan.
   Isian awal C2a: nilai dari daftar kerangka C2a (sistem/register) mengisi isian yang masih kosong di C3, C4, C5, C6;
   setiap isian menampilkan pembanding "C2a: …" agar penelaah memverifikasi dengan dokumen sumber. */
(function () {
  'use strict';
  const RCA = window.RCA, h = RCA.h;
  const SH = RCA.shared = {};
  const has = v => v !== undefined && v !== null && v !== '' && !(Array.isArray(v) && !v.length);

  /* ---------------- konfigurasi (sama dengan server) */
  const SRC_MAP = {
    'C3A/sumber': { kode: 'kode_sumber', jenis: 'jenis_sumber', lokasi: 'fasilitas_atau_lokasi', akses: 'akses', penghubung: 'petugas_penghubung_cara' },
    'C3B/sumber': { kode: 'kode_sumber', jenis: 'jenis_sumber', lokasi: 'fasilitas_atau_lokasi', akses: 'akses', penghubung: 'petugas_penghubung_cara' },
    'C6A/A2': { kode: 'kode', jenis: 'jenis', lokasi: 'fas', akses: 'akses' }
  };
  const BUKTI_SEC = { 'C4/daftar_bukti': 1 };
  const SRC_COLS = ['kode_sumber', 'sumber', 'R_N', 'dok_sumber', 'mati_sumber'];
  const BUKTI_COLS = ['kode_bukti', 'bukti_penentu'];
  const VAL_COLS = ['fasilitas_atau_lokasi', 'fas', 'kontak_fas', 'asal', 'tujuan', 'fasilitas_tempat_kembali', 'petugas_penghubung_cara', 'pelaksana', 'dari', 'ke',
    'titik_layanan_unit', 'petugas_penanggung_jawab', 'dok_sumber', 'mati_sumber', 'oat_paduan', 'arv_paduan', 'perlu_diverifikasi_dengan', 'upaya_penelusuran_dan_ta',
    'pelayanan_di_tujuan_dan', 'petugas_berwenang_pemegang_aks', 'penanggung_jawab_tb_pdp_sitb_s', 'jadwal_layanan_tb', 'jadwal_layanan_pdp', 'pembiayaan_layanan',
    'kepemilikan_kelas_rs', 'tim', 'pendamping_kemenkes_swg_dinkes', 'lokasi_berkas_atau_nama_fo', 'periode_yang_dicakup'];
  const STATIC_SRC = ['W', 'RM1', 'RM2', 'TB1', 'HIV1', 'HIV2', 'LAB1', 'FAR1', 'TPT1', 'RUJ1', 'KOM1', 'SITB', 'SIHA'];
  SH.srcMap = (sub, sec) => SRC_MAP[sub + '/' + sec] || null;

  const get = ed => (ed && ed.related && ed.related.shared) || { sumber: [], bukti: [], vals: {} };
  SH.get = get;
  const facOf = ed => (ed && ed.related && ed.related.fac) || '';
  const lab = it => [it.jenis, it.lokasi, it.akses].filter(Boolean).join(' · ');

  /* ---------------- datalist (satu set untuk editor yang sedang terbuka) */
  SH.refresh = function (ed) {
    let box = document.getElementById('shLists');
    if (!box) { box = h('div', { id: 'shLists', hidden: true }); document.body.appendChild(box); }
    box.innerHTML = '';
    const S = get(ed), seen = new Set();
    const src = h('datalist', { id: 'srcCodes' });
    S.sumber.forEach(it => { seen.add(it.kode); src.appendChild(h('option', { value: it.kode, label: lab(it) || 'daftar fasyankes' }, lab(it))); });
    STATIC_SRC.filter(x => !seen.has(x)).forEach(x => src.appendChild(h('option', { value: x })));
    box.appendChild(src);
    box.appendChild(h('datalist', { id: 'shBukti' }, S.bukti.map(it => h('option', { value: it.kode, label: [it.jenis, it.uraian].filter(Boolean).join(' · ') }, [it.jenis, it.uraian].filter(Boolean).join(' · ')))));
    Object.keys(S.vals || {}).forEach(col => box.appendChild(h('datalist', { id: 'shV_' + col }, S.vals[col].map(v => h('option', { value: v })))));
  };
  SH.update = function (ed, sh) { if (!sh || !ed) return; ed.related = ed.related || {}; ed.related.shared = sh; SH.refresh(ed); RCA.idb.get('cache', 'rec|' + ed.key).then(c => { if (c && c.related) { c.related.shared = sh; RCA.idb.set('cache', 'rec|' + ed.key, c); } }); };

  /** dipanggil dari forms.fieldBlock untuk setiap isian */
  SH.decorate = function (wrap, f, path, ed, rowCtx) {
    if (!ed || f.t === 'auto') return;
    const col = f.k, inp = wrap.querySelector('.stv input[type=text]') || wrap.querySelector(':scope > input[type=text]');
    const sec = rowCtx && rowCtx.sec;
    const map = sec ? SH.srcMap(ed.sub, sec) : null;
    if (inp) {
      if ((map && col === map.kode) || SRC_COLS.includes(col)) { inp.setAttribute('list', 'srcCodes'); inp.setAttribute('autocapitalize', 'characters'); }
      else if (BUKTI_COLS.includes(col)) inp.setAttribute('list', 'shBukti');
      else if (VAL_COLS.includes(col)) inp.setAttribute('list', 'shV_' + col);
    }
    // kode sumber dikenal: lengkapi kolom lain dari daftar fasyankes
    if (inp && map && col === map.kode && !ed.readOnly && rowCtx.apply) {
      inp.addEventListener('change', () => {
        const k = inp.value.trim().toUpperCase(), it = get(ed).sumber.find(x => x.kode === k);
        if (!it) return;
        const fill = {}; Object.keys(map).forEach(key => { if (key !== 'kode' && it[key] && !has(rowCtx.row[map[key]])) fill[map[key]] = it[key]; });
        if (Object.keys(fill).length) { rowCtx.apply(fill); RCA.toast('Sumber ' + k + ' dilengkapi dari daftar fasyankes', 'ok', 3000); }
      });
    }
    // isian panjang berisi kode bukti: pemilih kode bukti
    const ta = wrap.querySelector('textarea');
    if (ta && BUKTI_COLS.includes(col) && !ed.readOnly && get(ed).bukti.length) {
      const sel = h('select', { class: 'sh-pick', 'aria-label': 'Sisipkan kode bukti' }, h('option', { value: '' }, '+ kode bukti fasyankes'),
        get(ed).bukti.map(it => h('option', { value: it.kode }, it.kode + (it.jenis ? ' · ' + it.jenis : ''))));
      sel.addEventListener('change', () => { if (!sel.value) return; ta.value = (ta.value.trim() ? ta.value.trim() + '; ' : '') + sel.value; sel.value = ''; ta.dispatchEvent(new Event('input', { bubbles: true })); });
      (wrap.querySelector('.vbar') || wrap).appendChild(sel);
    }
    // pembanding C2a
    if (!path && ed.c2aVals && has(ed.c2aVals[col])) {
      const cv = ed.c2aVals[col];
      const hint = h('div', { class: 'c2a-hint' });
      const upd = () => {
        const v = ed.data[col], same = has(v) && String(Array.isArray(v) ? v.join('; ') : v) === String(Array.isArray(cv) ? cv.join('; ') : cv);
        hint.className = 'c2a-hint ' + (!has(v) ? '' : same ? 'eq' : 'diff');
        hint.textContent = 'C2a: ' + (Array.isArray(cv) ? cv.join(', ') : (/^\d{4}-\d\d-\d\d$/.test(cv) ? RCA.fmtD(cv) : cv)) + (!has(v) ? '' : same ? ' · sama, cocokkan dengan dokumen' : ' · berbeda dari C2a');
      };
      upd(); (ed.counters = ed.counters || []).push(upd);
      wrap.appendChild(hint);
    }
  };

  /* ---------------- ambil sumber dari daftar fasyankes ke tabel unit ini */
  SH.tableTools = function (sec, ed, rows, refill) {
    const map = SH.srcMap(ed.sub, sec.k), isBukti = BUKTI_SEC[ed.sub + '/' + sec.k];
    if ((!map && !isBukti) || !facOf(ed)) return null;
    const S = get(ed), list = map ? S.sumber : S.bukti;
    const out = h('div', { class: 'sh-tools' });
    if (map && !ed.readOnly && list.length) {
      out.appendChild(h('button', { class: 'btn small', type: 'button', onclick: async () => {
        const have = new Set(rows.map(r => String(r[map.kode] || '').toUpperCase()));
        const boxes = list.map(it => { const cb = h('input', { type: 'checkbox', checked: !have.has(it.kode), disabled: have.has(it.kode) }); return { it, cb }; });
        const ok = await RCA.modal('Sumber dari daftar fasyankes ' + facOf(ed), h('div', null,
          h('p', { class: 'muted' }, 'Pilih sumber yang dibuka untuk unit ini. Kolom kode, jenis, lokasi, akses, dan petugas penghubung terisi otomatis; lokator dan tahap tetap diisi per unit.'),
          h('div', { class: 'sh-list' }, boxes.map(({ it, cb }) => h('label', { class: 'sh-item' }, cb, h('b', null, it.kode), h('span', null, lab(it) || '–'), h('small', { class: 'muted' }, (it.penghubung ? it.penghubung + ' · ' : '') + (it.by ? 'oleh ' + it.by : '') + (have.has(it.kode) ? ' · sudah ada di unit ini' : '')))))),
          [{ label: 'Batal', value: false }, { label: 'Tambahkan', value: true, cls: 'primary' }]);
        if (!ok) return;
        let n = 0;
        boxes.filter(b => b.cb.checked && !b.cb.disabled).forEach(({ it }) => { const r = { _id: RCA.collab.uid() }; Object.keys(map).forEach(k => { if (it[k]) r[map[k]] = it[k]; }); rows.push(r); n++; });
        if (n) { ed.changed(); refill(); RCA.toast(n + ' sumber ditambahkan dari daftar fasyankes', 'ok'); }
      } }, '+ Ambil dari daftar sumber fasyankes (' + list.length + ')'));
    }
    out.appendChild(h('button', { class: 'btn small ghost', type: 'button', onclick: () => SH.manage(ed, map ? 'sumber' : 'bukti') }, 'Kelola daftar fasyankes'));
    if (!list.length) out.appendChild(h('small', { class: 'muted' }, map ? 'Sumber yang Anda isi di sini otomatis menjadi pilihan untuk semua unit di ' + facOf(ed) + '.' : 'Kode bukti yang diisi di sini menjadi pilihan di C4 dan C5 ' + facOf(ed) + '.'));
    return out;
  };

  /* ---------------- kelola daftar fasyankes */
  SH.manage = async function (ed, tab) {
    const fac = facOf(ed); if (!fac) return;
    let S = get(ed);
    try { S = await RCA.api('shared.get', { fac }) || S; SH.update(ed, S); } catch (e) { }
    const body = h('div', { class: 'stack' });
    const save = async (payload) => { try { const r = await RCA.api('shared.set', Object.assign({ fac }, payload)); S = r; SH.update(ed, r); draw(); RCA.toast('Daftar fasyankes diperbarui', 'ok'); } catch (e) { RCA.toast(e.message, 'err', 7000); } };
    let cur = tab || 'sumber';
    const draw = () => {
      body.innerHTML = '';
      const tabs = h('div', { class: 'tabs', role: 'tablist' }, [['sumber', 'Sumber dokumen (' + S.sumber.length + ')'], ['bukti', 'Kode bukti (' + S.bukti.length + ')'], ['vals', 'Isian berulang']].map(([k, l]) =>
        h('button', { role: 'tab', type: 'button', 'aria-selected': cur === k ? 'true' : 'false', onclick: () => { cur = k; draw(); } }, l)));
      body.appendChild(tabs);
      body.appendChild(h('p', { class: 'muted small' }, 'Berlaku untuk semua unit di fasyankes ' + fac + ' (C3, C4, C5, C6). Item baru juga terkumpul otomatis saat isian disimpan.'));
      if (cur === 'vals') {
        const cols = Object.keys(S.vals || {}).filter(c => S.vals[c].length);
        if (!cols.length) body.appendChild(h('p', { class: 'muted' }, 'Belum ada isian berulang.'));
        cols.forEach(c => body.appendChild(h('div', { class: 'sh-vals' }, h('b', null, c.replace(/_/g, ' ')), h('div', { class: 'row' }, S.vals[c].map(v => h('span', { class: 'chip' }, v,
          ed.readOnly ? null : h('button', { type: 'button', class: 'linkbtn', 'aria-label': 'Hapus ' + v, onclick: () => save({ list: 'vals', col: c, value: v, remove: true }) }, '✕')))))));
        return;
      }
      const L = cur === 'sumber' ? S.sumber : S.bukti;
      const flds = cur === 'sumber' ? [['kode', 'Kode'], ['jenis', 'Jenis'], ['lokasi', 'Fasilitas/lokasi'], ['akses', 'Akses'], ['penghubung', 'Petugas penghubung, cara']] : [['kode', 'Kode bukti'], ['jenis', 'Jenis'], ['uraian', 'Uraian singkat']];
      const delBtn = it => ed.readOnly ? null : h('button', { type: 'button', class: 'btn small ghost danger', onclick: async () => { if (await RCA.confirm('Hapus dari daftar', 'Hapus ' + it.kode + ' dari daftar fasyankes ' + fac + '? Isian unit yang sudah memakai kode ini tidak berubah.', 'Hapus', 'danger')) save({ list: cur, kode: it.kode, remove: true }); } }, 'Hapus');
      const trs = L.map(it => h('tr', null, flds.map(([k]) => h('td', null, k === 'kode' ? h('b', null, it.kode) : (it[k] || ''))), h('td', null, h('small', null, it.by || '')), h('td', null, delBtn(it))));
      if (!L.length) trs.push(h('tr', null, h('td', { colspan: flds.length + 2, class: 'muted' }, 'Belum ada.')));
      body.appendChild(h('div', { class: 'table-wrap' }, h('table', { class: 't' }, h('thead', null, h('tr', null, flds.map(x => h('th', null, x[1])), h('th', null, 'Oleh'), h('th', null, ''))), h('tbody', null, trs))));
      if (!ed.readOnly) {
        const inputs = {}; const g = h('div', { class: 'fgrid' }, flds.map(([k, l]) => { inputs[k] = h('input', { type: 'text', 'aria-label': l, placeholder: l }); return h('div', { class: 'f' }, h('label', { class: 'lbl' }, l), inputs[k]); }));
        body.appendChild(h('details', { class: 'relpanel' }, h('summary', null, h('b', null, '+ Tambah ' + (cur === 'sumber' ? 'sumber' : 'kode bukti'))), g,
          h('button', { class: 'btn small primary', type: 'button', onclick: () => { const item = {}; flds.forEach(([k]) => { item[k] = inputs[k].value.trim(); }); if (!item.kode) return RCA.toast('Kode wajib diisi', 'err'); save({ list: cur, kode: item.kode, item }); } }, 'Simpan ke daftar')));
      }
    };
    draw();
    await RCA.modal('Daftar bersama fasyankes ' + fac, body, [{ label: 'Tutup', value: null }], { wide: true });
    if (ed.rerender && RCA.state.editor === ed) ed.rerender();
  };

  /* ================================================================ isian awal dari C2a */
  const isDate = v => /^\d{4}-\d{2}-\d{2}$/.test(String(v || ''));
  const num = v => (v === '' || v === undefined || isNaN(+v)) ? '' : +v;
  const pick = (v, opts) => (opts.includes(v) ? v : '');
  /** nilai C2a yang dipetakan ke isian formulir ini: { kunci isian: nilai } */
  SH.c2aMap = function (ed) {
    const r = ed.related || {}, L = r.c2a || [], out = {};
    const A = L.find(x => x.frame === 'A'), B = L.find(x => x.frame === 'B'), P = L.find(x => x.frame === 'CP3');
    const dt = (k, v) => { if (isDate(v)) out[k] = v; };
    if (ed.form === 'C3') {
      const x = { C3A: A, C3B: B, C3CP3: P }[ed.sub];
      if (x && ed.sub !== 'C3CP3') { out.U11 = num(x.c_E); out.U12 = { L: 'Laki-laki', P: 'Perempuan' }[x.c_D] || ''; }
      if (x && ed.sub === 'C3A') {
        dt('A01', x.c_F); dt('A08', x.c_G); out.A04 = pick(x.c_H, ['TB SO', 'TB RO']); out.A05 = pick(x.c_I, ['Baru', 'Kambuh', 'Lainnya']);
        dt('A11', x.c_K); out.A13 = pick(x.c_L, ['Sembuh', 'Pengobatan lengkap', 'Gagal', 'Putus berobat', 'Meninggal', 'Tidak dievaluasi', 'Masih berobat', 'Pindah']); dt('A14', x.c_M);
        if (x.c_L === 'Meninggal') dt('T06', x.c_M);
      }
      if (x && ed.sub === 'C3B') {
        dt('B01', x.c_F); out.B02 = pick(x.c_G, ['Baru pertama kali ARV', 'Rujuk masuk', 'Kembali setelah putus ARV', 'Belum pasti', 'ODHIV lama (sebelum 2025)']);
        out.B04 = { 'Tercatat negatif': 'Negatif', 'Tercatat positif': 'Positif/indikasi pemeriksaan', 'Tidak tercatat': 'Hasil tidak tercatat' }[x.c_H] || '';
        dt('B13', x.c_K); out.B16 = { Lengkap: 'Lengkap', 'Sedang berjalan': 'Sedang terapi', Putus: 'Putus' }[x.c_L] || '';
        out.T03 = { 'Masih ARV': 'Aktif ARV', 'Putus (LFU)': 'Terputus/hilang kontak', Meninggal: 'Meninggal', 'Rujuk keluar': 'Pindah, belum terkonfirmasi' }[x.c_M] || '';
      }
      if (x && ed.sub === 'C3CP3') dt('R_I', x.c_J);
    }
    if (ed.form === 'C6' && ed.sub === 'C6A') {
      const cal = r.calon || {}, x = A || P || B;
      dt('tgl_mati', cal.tgl_mati);
      out.periode = { Utama: 'Januari 2025–Juni 2026', 'Perluasan 2024': 'Perluasan 2024' }[cal.periode] || '';
      if (x) {
        out.jk = pick(x.c_D, ['L', 'P']);
        const src = String((x.frame === 'CP3' ? x.c_K : x.c_N) || '');
        const sd = []; if (/SITB|SIHA/i.test(src)) sd.push('SITB/SIHA'); if (/Register/i.test(src)) sd.push('Register TB/HIV'); if (/Keduanya/i.test(src)) sd.push('SITB/SIHA', 'Register TB/HIV');
        if (sd.length) out.sumber_daftar = [...new Set(sd)];
      }
      if (A) { dt('dx_tb_tgl', A.c_F); dt('oat_tgl', A.c_G); out.dx_tb_tipe = { Baru: 'Baru', Kambuh: 'Kambuh', Lainnya: 'Lain' }[A.c_I] || ''; out.dx_tb_res = { 'TB SO': 'SO', 'TB RO': 'RO' }[A.c_H] || ''; dt('arv_tgl', A.c_K); }
      else if (P) { dt('dx_tb_tgl', P.c_F); out.dx_tb_tipe = { Baru: 'Baru', Kambuh: 'Kambuh', Lainnya: 'Lain' }[P.c_H] || ''; out.dx_tb_res = { 'TB SO': 'SO', 'TB RO': 'RO' }[P.c_G] || ''; }
      if (!out.arv_tgl && B) dt('arv_tgl', B.c_F);
    }
    if ((ed.form === 'C4' || ed.sub === 'C5ID')) {
      const fac = RCA.reg.fac(ed.unit) || {};
      if (fac.type) out.jenis_fasyankes = /puskesmas|pkm/i.test(fac.type) ? 'Puskesmas' : /^rs/i.test(fac.type) ? 'RS' : fac.type;
      const s = r.c2aSum;
      if (s && ed.form === 'C4') out.volume_2025_tb_hiv_odhiv_baru = 'Dari C2a (perlu dikonfirmasi): TB-HIV 2025 = ' + s.A.y2025 + ' episode' + (s.A.y2026 ? ' (+' + s.A.y2026 + ' Jan–Jun 2026)' : '') + '; ODHIV baru mulai ARV 2025 = ' + s.B.baru2025 + '; episode TB 2025 (CP3) = ' + s.CP3.y2025 + ', status HIV diketahui ' + s.CP3.hivKnown + '/' + s.CP3.n + '.';
    }
    Object.keys(out).forEach(k => { if (!has(out[k])) delete out[k]; });
    return out;
  };
  /** isi isian yang masih kosong dengan nilai C2a; mengembalikan jumlah isian yang terisi */
  SH.applyC2a = function (ed) {
    // hanya untuk isian yang masih dikerjakan; rekaman Dikirim/Valid tidak diubah diam-diam
    if (!['Belum', 'Draf', 'Dikembalikan'].includes(ed.rec ? ed.rec.status : 'Belum')) { ed.c2aApplied = 0; return 0; }
    const vals = ed.c2aVals || {}, keys = new Set();
    let n = 0;
    ed.schema.sections.forEach(s => { if (s.type === 'fields') s.fields.forEach(f => { if (f.t !== 'auto') keys.add(f.k); if (f.st) keys.add(f.k + '__st'); }); });
    Object.keys(vals).forEach(k => {
      if (!keys.has(k) || has(ed.data[k])) return;
      ed.data[k] = vals[k]; n++;
      if (keys.has(k + '__st') && !has(ed.data[k + '__src'])) ed.data[k + '__src'] = 'C2A';
    });
    // C4: dugaan C1 langsung masuk tabel A3 bila masih kosong
    if (ed.form === 'C4' && !(ed.data.dugaan || []).length && ed.related.C1 && (ed.related.C1.dugaan || []).length) {
      ed.data.dugaan = ed.related.C1.dugaan.slice(0, 4).map(x => ({ _id: RCA.collab.uid(), dugaan_penyebab_awal: x.dugaan, cp_terkait: x.cp, bukti_yang_akan_dicari: x.bukti }));
      n++;
    }
    ed.c2aApplied = n;
    return n;
  };
  /** panel ringkas data C2a di atas formulir */
  SH.c2aPanel = function (ed) {
    const r = ed.related || {}, L = r.c2a || [], s = r.c2aSum, n = Object.keys(ed.c2aVals || {}).length;
    if (!L.length && !s) return null;
    const H = { A: ['Kode pasien', 'Kode episode lokal', 'Jenis kelamin', 'Umur', 'Tgl diagnosis TB', 'Tgl mulai OAT', 'Jenis TB', 'Tipe pasien', 'Status ARV episode TB', 'Tgl mulai ARV', 'Hasil akhir TB', 'Tgl hasil akhir', 'Sumber baris'],
      B: ['Kode pasien', 'Kode riwayat lokal', 'Jenis kelamin', 'Umur', 'Tgl mulai ARV', 'Status masuk', 'Skrining TB', 'TB aktif setelah ARV', 'TPT', 'Tgl mulai TPT', 'Status TPT', 'Status ARV 30 Jun 2026', 'Sumber baris'],
      CP3: ['Kode pasien', 'Kode episode lokal', 'Jenis kelamin', 'Umur', 'Tgl diagnosis TB', 'Jenis TB', 'Tipe pasien', 'Status HIV', 'Tgl tes HIV', 'Sumber baris'] };
    const K = ['c_B', 'c_C', 'c_D', 'c_E', 'c_F', 'c_G', 'c_H', 'c_I', 'c_J', 'c_K', 'c_L', 'c_M', 'c_N'];
    return h('details', { class: 'relpanel c2a-panel', open: !!ed.c2aApplied },
      h('summary', null, h('b', null, 'Data C2a' + (L.length ? ' pasien ini' : ' fasyankes ini')), ' · ', n ? n + ' isian memakai nilai C2a sebagai isian awal' : 'sebagai pembanding'),
      h('p', { class: 'muted small' }, 'Nilai C2a berasal dari daftar sistem/register yang diunggah koordinator. Isian bertanda "C2a: …" wajib dicocokkan dengan dokumen sumber; ubah bila berbeda dan isi Status bukti (St). Kode sumber "C2A" diganti dengan kode dokumen yang diperiksa.'),
      L.map(x => h('dl', { class: 'kv' }, h('dt', null, 'Kerangka'), h('dd', null, h('b', null, x.frame)), (H[x.frame] || []).map((l, i) => has(x[K[i]]) ? [h('dt', null, l), h('dd', null, isDate(x[K[i]]) ? RCA.fmtD(x[K[i]]) : String(x[K[i]]))] : null))),
      s ? h('dl', { class: 'kv' }, h('dt', null, 'Kerangka A (TB-HIV)'), h('dd', null, s.A.n + ' baris · 2025: ' + s.A.y2025 + ' · Jan–Jun 2026: ' + s.A.y2026 + ' · meninggal: ' + s.A.meninggal),
        h('dt', null, 'Kerangka B (ARV)'), h('dd', null, s.B.n + ' baris · baru mulai ARV 2025: ' + s.B.baru2025 + ' · TPT mulai: ' + s.B.tpt),
        h('dt', null, 'Kerangka CP3 (TB)'), h('dd', null, s.CP3.n + ' baris · 2025: ' + s.CP3.y2025 + ' · status HIV diketahui: ' + s.CP3.hivKnown + ' · positif: ' + s.CP3.hivPos)) : null);
  };
})();
