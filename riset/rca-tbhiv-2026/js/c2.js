/* RCA TB-HIV 2026 · C2 Daftar sampel dan kode bukti: kerangka & undian, calon C6, daftar sentinel C5, sesi C7, lembar penghubung */
(function () {
  'use strict';
  const RCA = window.RCA, h = RCA.h, S = RCA.S;
  const C2 = RCA.c2 = {};
  const FR = S.c2.frames;
  /** baris contoh pada templat C2a (baris 5) */
  const EXAMPLE = { A: { B: 'P001', C: 'A001', F: '2025-03-14' }, B: { B: 'P014', C: 'B001', F: '2025-02-10' }, CP3: { B: 'P001', C: 'C001', F: '2025-03-14' } };
  const ID_WORDS = /\b(nama|nik|no\.?\s*rm|rekam medis|alamat|telepon|telp|hp|no\.?\s*register|id sitb|id siha|nomor rm)\b/i;
  let st = { tab: 'kerangka', fac: null, frame: 'A', data: null };

  C2.render = async function (main, params) {
    if (params && params.tab) st.tab = params.tab;
    main.innerHTML = '';
    main.appendChild(h('div', { class: 'page-head' }, h('div', { class: 'grow' }, h('h1', null, S.forms.C2.title),
      h('p', null, 'Kelola unit telaah, calon kasus kematian, daftar sistem sentinel, dan sesi wawancara. Identitas pasien tidak pernah dimasukkan ke aplikasi; hubungan kode dengan NIK/no. RM ada di berkas penghubung yang disimpan di fasyankes.'))));
    const tabs = [['kerangka', 'Kerangka dan undian C3'], ['c6', 'Calon kematian C6'], ['c5', 'Daftar sistem sentinel C5'], ['c7', 'Sesi wawancara C7'], ['penghubung', 'Lembar penghubung kode'], ['indeks', 'Indeks silang']];
    const tb = h('div', { class: 'tabs', role: 'tablist' });
    tabs.forEach(([k, l]) => tb.appendChild(h('button', { role: 'tab', 'aria-selected': st.tab === k ? 'true' : 'false', onclick: () => { st.tab = k; C2.render(main); } }, l)));
    main.appendChild(tb);
    const body = h('div'); main.appendChild(body);
    try {
      if (st.tab === 'kerangka') await kerangka(body);
      if (st.tab === 'c6') await calon(body);
      if (st.tab === 'c5') await sentinel(body);
      if (st.tab === 'c7') await sesi(body);
      if (st.tab === 'penghubung') await penghubung(body);
      if (st.tab === 'indeks') await indeks(body);
    } catch (e) { body.appendChild(h('div', { class: 'notice err' }, e.message)); }
  };

  function facSelect(value, onChange, filter) {
    const sel = h('select', { 'aria-label': 'Fasyankes' });
    sel.appendChild(h('option', { value: '' }, '— pilih fasyankes —'));
    RCA.state.regions.kk.forEach(k => {
      const g = h('optgroup', { label: k.name + ' (' + k.capaian + ')' });
      RCA.state.regions.fac.filter(f => f.kk === k.code && (!filter || filter(f))).forEach(f => g.appendChild(h('option', { value: f.code, selected: f.code === value }, RCA.reg.facLabel(f) + (f.sentinel === 'Ya' ? ' · sentinel' : ''))));
      if (g.children.length) sel.appendChild(g);
    });
    sel.addEventListener('change', () => onChange(sel.value));
    return sel;
  }

  const IND = { '5': 'TB/HIV-5', '6': 'TB/HIV-6', '41a': 'TB/HIV-4.1a' };
  function c5Result(r) {
    if (!r) return h('p', null, '–');
    if (r.status) return h('p', null, 'Fasyankes ini belum ditandai sentinel. Tandai di Admin › Fasyankes dan sentinel, lalu tekan "Isi dari kerangka C2a" di tab Daftar sistem sentinel C5.');
    if (r.catatan) return h('p', null, r.catatan);
    if (r.error) return h('p', null, r.error);
    const rows = Object.keys(IND).map(k => { const x = (r.rincian || {})[k] || {}; return [IND[k], x.baris_kerangka || 0, x.dalam_triwulan || 0, x.di_c5 === undefined ? '–' : x.di_c5, x.baru || 0, x.diperbarui || 0, x.tanggal_tidak_terbaca || 0, x.tidak_lagi_di_c2a || 0]; });
    const notes = [];
    if (Object.values(r.rincian || {}).some(x => x && x.di_c5 === undefined) && !Object.keys(IND).some(k => /Valid/.test(r[k] || ''))) notes.push('Kolom "Di C5", "Baru", dan "Diperbarui" kosong karena server (Apps Script) masih versi lama. Ganti Code.gs dengan versi terbaru, lalu Deploy › Manage deployments › Edit › New version, kemudian tekan "Tarik ulang dari C2a".');
    Object.keys(IND).forEach(k => { const x = (r.rincian || {})[k] || {};
      if (x.tanggal_tidak_terbaca) notes.push(IND[k] + ': ' + x.tanggal_tidak_terbaca + ' baris C2a tanggal kuncinya (kolom F) kosong atau tidak terbaca sehingga tidak dapat ditentukan triwulannya (' + (x.contoh_tanggal_tidak_terbaca || []).join(', ') + '). Perbaiki tanggal di C2a lalu unggah ulang.');
      if (x.tidak_lagi_di_c2a) notes.push(IND[k] + ': ' + x.tidak_lagi_di_c2a + ' baris C5 tidak lagi ada di C2a TW III (' + (x.contoh_tidak_lagi || []).join(', ') + '); baris tidak dihapus, periksa di C5.');
      if (/Valid/.test(r[k] || '')) notes.push(IND[k] + ': ' + r[k]); });
    return h('div', { class: 'stack' }, h('p', null, 'Periode: ' + (r.periode || '–') + (r.periode_catatan ? ' · ' + r.periode_catatan : '') + '. Seluruh baris C2a bertanggal dalam periode ini ditarik ke C5; kolom data sistem baris yang sudah ada diperbarui, isian pencocokan sumber tidak diubah.'),
      h('div', { class: 'table-wrap no-cards' }, h('table', { class: 't' }, h('thead', null, h('tr', null, ['Indikator', 'Baris C2a', 'Dalam TW', 'Di C5', 'Baru', 'Diperbarui', 'Tgl tidak terbaca', 'Tidak lagi di C2a'].map((x, i) => h('th', { class: i ? 'n' : '' }, x)))),
        h('tbody', null, rows.map(rw => h('tr', null, rw.map((v, i) => h('td', { class: i ? 'n' : '' }, v))))))),
      notes.length ? h('div', { class: 'notice warn' }, h('ul', null, notes.map(n => h('li', null, n)))) : null);
  }
  RCA.c5Result = c5Result;
  async function c5PullAll() {
    try {
      const res = await RCA.api('c5.fromC2All', {});
      RCA.modal('Tarik C5 dari C2a · semua sentinel', res.length ? h('div', { class: 'stack' }, res.map(r => h('div', null, h('h3', null, RCA.reg.facLabel(RCA.reg.fac(r.fac))), c5Result(r)))) : h('p', null, 'Belum ada fasyankes yang ditandai sentinel.'), null, { wide: true });
    } catch (e) { RCA.toast(e.message, 'err'); }
  }
  RCA.c5PullAll = c5PullAll;

  /* ------------------------------------------------------------ kerangka & undian */
  async function kerangka(body) {
    body.appendChild(h('div', { class: 'row', style: { marginBottom: '12px' } }, facSelect(st.fac, v => { st.fac = v; st.data = null; C2.render(RCA.$('#main')); }),
      h('a', { class: 'btn small', href: 'templates/C2a_Templat_Kerangka_Sampel.xlsx', download: '' }, 'Unduh templat C2a'),
      h('a', { class: 'btn small', href: 'templates/C2a-P_Berkas_Penghubung_Kode_Fasyankes.xlsx', download: '' }, 'Unduh templat penghubung C2a-P')));
    if (!st.fac) { body.appendChild(h('div', { class: 'notice' }, 'Pilih fasyankes untuk mengunggah kerangka sampel (C2a) dan menjalankan undian. Undian memakai angka acak tetap yang ditetapkan 12 Oktober 2026 (seed 20261012), sehingga hasilnya dapat diulang pihak lain.')); return; }
    const d = st.data = await RCA.api('c2.get', { fac: st.fac });
    const fac = d.fac, kk = RCA.reg.kk(fac.kk), prov = kk.prov;
    const perl = d.perluasan;
    body.appendChild(h('div', { class: 'card', style: { marginBottom: '12px' } },
      h('dl', { class: 'kv' }, h('dt', null, 'Fasyankes'), h('dd', null, RCA.reg.facLabel(fac) + ' (slot ' + fac.slot + ')'),
        h('dt', null, 'Kab/kota'), h('dd', null, kk.name + ' · capaian ' + kk.capaian),
        h('dt', null, 'Perluasan A dan B (provinsi ' + prov + ')'), h('dd', null, h('b', null, perl), RCA.can.review() ? [' ', h('button', { class: 'linkbtn', onclick: async () => {
          if (!await RCA.confirm('Ubah perluasan', 'Perluasan diputuskan sama untuk pasangan kab/kota dalam provinsi sebelum undian. Ubah menjadi ' + (perl === 'Ya' ? 'Tidak' : 'Ya') + '?', 'Ubah')) return;
          await RCA.api('config.perluasan', { prov, value: perl !== 'Ya' }); C2.render(RCA.$('#main'));
        } }, 'ubah')] : null))));
    if (RCA.can.review()) {
      const inp = h('input', { type: 'file', accept: '.xlsx,.xls', hidden: true });
      inp.addEventListener('change', () => { const file = inp.files[0]; inp.value = ''; if (file) uploadAll(file, d); });
      const undrawn = ['A', 'B', 'CP3'].filter(k => d.frames[k].und && !d.frames[k].und.tanggal_undian && d.frames[k].rows.length);
      body.appendChild(h('div', { class: 'card', style: { marginBottom: '12px' } }, inp,
        h('h3', null, 'Unggah berkas C2a fasyankes ini'),
        h('p', { class: 'muted' }, 'Satu berkas C2a dibaca sekaligus: lembar A_TBHIV, B_ARV, dan CP3_TB. Pasien yang tercatat meninggal otomatis masuk Calon kematian C6 (perlu diverifikasi). Bila fasyankes ini sentinel, baris dalam triwulan verifikasi otomatis masuk daftar sistem C5.'),
        h('div', { class: 'row' }, h('button', { class: 'btn primary', onclick: () => inp.click() }, 'Unggah berkas C2a'),
          undrawn.length ? h('button', { class: 'btn', onclick: () => drawAll(undrawn) }, 'Jalankan undian ' + undrawn.join(', ')) : null)));
    }
    const ft = h('div', { class: 'tabs', role: 'tablist' });
    ['A', 'B', 'CP3'].forEach(k => {
      const f = d.frames[k]; const n = f.rows.filter(x => x.terpilih).length;
      ft.appendChild(h('button', { role: 'tab', 'aria-selected': st.frame === k ? 'true' : 'false', onclick: () => { st.frame = k; C2.render(RCA.$('#main')); } }, FR[k].title + ' (' + n + ' terpilih)'));
    });
    body.appendChild(ft);
    // sinkron: unit terpilih di semua kerangka fasyankes ini = lembar penghubung = daftar C3
    const syncBox = h('div', { class: 'notice', style: { marginBottom: '12px' } }, 'Memeriksa kesesuaian dengan daftar C3…'); body.appendChild(syncBox);
    (async () => {
      const kSet = new Set(); ['A', 'B', 'CP3'].forEach(k => d.frames[k].rows.forEach(x => { if (x.terpilih) kSet.add({ A: 'C3A', B: 'C3B', CP3: 'C3CP3' }[k] + '|' + x.kode_unit); }));
      try {
        const u = (await RCA.api('units.list', { form: 'C3' })).filter(x => x.fac === st.fac && !(x.meta && x.meta.yatim));
        const uSet = new Set(u.map(x => x.sub + '|' + x.unit)), miss = [...kSet].filter(k => !uSet.has(k)), extra = [...uSet].filter(k => !kSet.has(k));
        syncBox.className = 'notice ' + (miss.length || extra.length ? 'err' : 'ok');
        syncBox.textContent = miss.length || extra.length ? 'Belum sinkron: ' + (miss.length ? miss.length + ' unit terpilih belum tampil di C3 (' + miss.map(k => k.split('|')[1]).join(', ') + '). ' : '') + (extra.length ? extra.length + ' unit di C3 tidak ada di kerangka (' + extra.map(k => k.split('|')[1]).join(', ') + '). ' : '') + 'Muat ulang halaman; bila tetap, pastikan Code.gs terbaru sudah di-deploy.'
          : '✓ Sinkron: ' + kSet.size + ' unit terpilih di kerangka A/B/CP3 = ' + uSet.size + ' unit di lembar penghubung = ' + uSet.size + ' unit di daftar C3 ' + st.fac + '.';
      } catch (e) { syncBox.textContent = 'Tidak dapat memeriksa daftar C3: ' + e.message; }
    })();
    const f = d.frames[st.frame], fr = FR[st.frame], und = f.und, info = f.info;
    body.appendChild(h('p', { class: 'muted' }, fr.crit));
    const sel = f.rows.filter(x => x.terpilih);
    const cnt = t => sel.filter(x => (x.status_pilih || '').toLowerCase().includes(t)).length;
    body.appendChild(h('div', { class: 'kpis', style: { marginBottom: '12px' } },
      [['Baris diterima', f.rows.length], ['Baris 2025', info.n2025], ['Layak acak (N)', info.N], ['Acak/sensus terpilih', cnt('acak') + cnt('sensus')], ['Purposif terpilih', cnt('purposif')], ['Masuk C3 (kerangka ini)', sel.length + ' / 6 inti']]
        .map(([l, v]) => h('div', { class: 'kpi' }, h('b', null, v), h('span', null, l)))));
    const actions = h('div', { class: 'row', style: { marginBottom: '12px' } });
    if (RCA.can.review()) {
      if (und && !und.tanggal_undian && f.rows.length) actions.appendChild(h('button', { class: 'btn primary', onclick: () => draw() }, 'Jalankan undian kerangka ' + st.frame));
      if (und) {
        const rk = h('input', { type: 'number', value: und.rekap || '', style: { width: '120px' }, 'aria-label': 'Rekap SITB/SIHA 2025' });
        actions.appendChild(h('label', { class: 'row' }, h('span', null, 'Rekap SITB/SIHA 2025:'), rk, RCA.help.tip('Angka rekap resmi fasyankes untuk periode 2025 (A: T03 kasus TB baru-kambuh HIV positif; B: H01 ODHIV baru memulai ARV; CP3: T01 kasus TB baru-kambuh ternotifikasi). Dipakai untuk memeriksa kelengkapan daftar sebelum undian; selisih >10% perlu klarifikasi.', 'Contoh: 42'),
          h('button', { class: 'btn small', onclick: async () => { await RCA.api('c2.rekap', { fac: st.fac, frame: st.frame, rekap: rk.value }); C2.render(RCA.$('#main')); } }, 'Simpan')));
      }
    }
    body.appendChild(actions);
    if (und && und.tanggal_undian) {
      const P = info.P || {};
      body.appendChild(h('div', { class: 'notice ok', style: { marginBottom: '12px' } }, 'Undian ' + RCA.fmtDT(und.tanggal_undian) + ' oleh ' + und.oleh + ' · kunci ' + f.Ukey + ' · U = ' + und.U + ' · N = ' + info.N +
        (info.sensus ? ' · Sensus (baris 2025 ≤ 6)' : Object.keys(P).length ? ' · posisi inti ' + [P.P1, P.P3, P.P5].join(', ') + '; P2/P4/P6 ' + [P.P2, P.P4, P.P6].join(', ') + '; cadangan 4–9 ' + [P.P7, P.P8, P.P9, P.P10, P.P11, P.P12].join(', ') : ' · N ≤ 3: seluruh unit layak menjadi acak inti') +
        ' · perluasan ' + (und.perluasan || 'Tidak') + (und.rekap ? ' · rekap ' + und.rekap + ' (selisih ' + Math.round((info.n2025 - und.rekap) / und.rekap * 100) + '%)' : '')));
      if (und.sumber === 'impor') body.appendChild(h('div', { class: 'notice', style: { marginBottom: '12px' } }, h('b', null, 'Hasil undian diimpor dari aplikasi lama dan dibekukan. '),
        'Unit terpilih, cadangan, dan purposif sama dengan aplikasi lama sehingga unit yang sudah ditelaah tidak berubah.' + (info.beda_baru ? ' Bila diundi ulang dengan aplikasi baru, ' + info.beda_baru + ' baris akan berstatus lain; hasil lama tetap dipakai.' : '') +
        ' Penetapan purposif/pengganti baru tetap dapat dilakukan.'));
    } else if (f.rows.length) body.appendChild(h('div', { class: 'notice warn', style: { marginBottom: '12px' } }, 'Undian belum dijalankan. Periksa kelengkapan daftar dan rekap SITB/SIHA lebih dahulu. Setelah undian, baris tidak boleh ditambah atau diubah kecuali sebagai versi baru dengan alasan.'));
    if (!f.rows.length) { body.appendChild(h('div', { class: 'notice' }, 'Belum ada kerangka untuk ' + fr.title + '. Unggah lembar ' + fr.sheet + ' dari templat C2a yang diisi fasyankes (tanpa identitas).')); return; }
    const q = h('input', { type: 'search', placeholder: 'Cari kode pasien/lokal' });
    const onlySel = h('input', { type: 'checkbox' });
    const tbody = h('tbody');
    const drawRows = () => {
      tbody.innerHTML = '';
      f.rows.filter(x => (!onlySel.checked || x.terpilih || (x.acak || '').startsWith('Cadangan')) && (!q.value || (x.c_B + ' ' + x.c_C).toLowerCase().includes(q.value.toLowerCase())))
        .forEach(x => tbody.appendChild(h('tr', { style: { cursor: RCA.can.review() ? 'pointer' : 'default' }, onclick: () => RCA.can.review() && editRow(x) },
          h('td', { class: 'n' }, x.no), h('td', null, x.c_B), h('td', null, h('b', null, x.c_C)), h('td', null, x.c_F), h('td', null, x.periode), h('td', { class: 'n' }, x.no_urut || ''),
          h('td', null, x.acak), h('td', null, x.s_pilihan || ''), h('td', null, x.s_alasan || ''), h('td', null, x.terpilih ? h('b', { class: 'masuk' }, '✓ ' + x.kode_unit) : h('small', { class: 'muted' }, x.masuk_c3 || '')),
          h('td', null, h('small', null, x.penanda)), h('td', null, h('small', { style: { color: 'var(--s-kembali)' } }, x.cek)), h('td', null, x.s_akses || ''), h('td', null, x.s_telaah || ''), h('td', null, x.s_diganti || ''))));
    };
    q.addEventListener('input', drawRows); onlySel.addEventListener('change', drawRows);
    body.appendChild(h('div', { class: 'filters' }, q, h('label', { class: 'row' }, onlySel, 'Hanya terpilih dan cadangan')));
    body.appendChild(h('div', { class: 'table-wrap', style: { maxHeight: '70vh' } }, h('table', { class: 't' }, h('thead', null, h('tr', null,
      ['No', 'Kode pasien', 'Kode lokal', 'Tanggal kunci', 'Periode', 'No urut acak', 'Pilihan acak', 'Purposif/pengganti', 'Alasan', 'Masuk C3 dan lembar penghubung', 'Penanda bantu purposif', 'Cek', 'Akses', 'Telaah', 'Diganti oleh'].map(x => h('th', null, x)))), tbody)));
    drawRows();
    body.appendChild(h('p', { class: 'muted', style: { marginTop: '10px' } }, 'Ketuk baris untuk menetapkan purposif, pengganti, akses sumber, atau status telaah. Unit acak yang tidak dapat ditelaah diganti cadangan acak menurut nomornya; baris awal tetap dicatat.'));
  }

  function findSheet(wb, frame) {
    const fr = FR[frame];
    const n = wb.SheetNames.find(x => x === fr.sheet) || wb.SheetNames.find(x => { const u = x.toUpperCase().replace(/[\s_\-]/g, ''); return frame === 'CP3' ? u.includes('CP3') : frame === 'A' ? (u.includes('ATB') || u === 'KERANGKAA') : (u.includes('BARV') || u === 'KERANGKAB'); });
    return n ? wb.Sheets[n] : null;
  }
  function readFrame(wb, frame) {
    const fr = FR[frame];
    const ws = findSheet(wb, frame);
    if (!ws) return null;
    const aoa = XLSX.utils.sheet_to_json(ws, { header: 1, raw: true, defval: '' });
    // baris judul kolom: biasanya baris 4; cari baris yang memuat "Kode pasien" agar tetap terbaca bila ada baris disisipkan/dihapus
    let hi = aoa.slice(0, 12).findIndex(r => (r || []).some(v => /kode\s*pasien/i.test(String(v))));
    if (hi < 0) hi = 3;
    const hdr = (aoa[hi] || []).map(String).join(' | ');
    if (ID_WORDS.test(hdr)) throw new Error('Lembar ' + fr.sheet + ' memuat judul kolom identitas (nama/NIK/no. RM/alamat/telepon). Hapus kolom tersebut sebelum mengunggah.');
    const last = fr.cols[fr.cols.length - 1].k;
    const dateCols = fr.cols.filter(c => c.t === 'date').map(c => c.k);
    const letters = 'ABCDEFGHIJKLMNO'.split('').slice(0, 'ABCDEFGHIJKLMNO'.indexOf(last) + 1);
    const rows = [];
    const ex = EXAMPLE[frame];
    for (let i = hi + 1; i < aoa.length; i++) {
      const r = aoa[i]; if (!r || /^\s*contoh/i.test(String(r[0]))) continue;
      // baris contoh templat yang tidak diubah (tanpa tulisan "Contoh") tetap dilewati
      if (i === hi + 1 && ex && String(r[1]).trim() === ex.B && String(r[2]).trim() === ex.C && RCA.isoDate(r[5]) === ex.F) continue;
      const o = {};
      letters.forEach((L, j) => { if (j === 0) return; let v = r[j]; if (dateCols.includes(L) || v instanceof Date) v = RCA.isoDate(v); if (v !== '' && v !== null) o[L] = String(v).trim(); });
      if (o.C) { o._row = i + 1; rows.push(o); }
    }
    if (rows.some(o => Object.values(o).some(v => /\b\d{16}\b/.test(v)))) throw new Error('Lembar ' + fr.sheet + ' memuat angka 16 digit (mirip NIK). Periksa dan hapus sebelum mengunggah.');
    return rows;
  }
  async function uploadAll(file, d) {
    if (!RCA.needXLSX()) return;
    let wb, frames = {};
    try {
      wb = XLSX.read(await file.arrayBuffer());
      ['A', 'B', 'CP3'].forEach(k => { const r = readFrame(wb, k); if (r) frames[k] = r; });
    } catch (e) { return RCA.modal('Berkas tidak dapat diunggah', h('p', null, e.message)); }
    if (!Object.keys(frames).length) return RCA.toast('Lembar A_TBHIV, B_ARV, atau CP3_TB tidak ditemukan', 'err');
    const y25 = rows => rows.filter(x => /^2025/.test(x.F || '')).length;
    const badF = rows => rows.filter(x => !/^\d{4}-\d{2}-\d{2}$/.test(x.F || ''));
    const tw3 = rows => rows.filter(x => /^\d{4}-\d{2}-\d{2}$/.test(x.F || '') && x.F >= '2025-07-01' && x.F <= '2025-09-30').length;
    const probs = ['A', 'B', 'CP3'].filter(k => frames[k] && badF(frames[k]).length);
    const dead = (k, rows) => rows.filter(x => (k === 'A' && x.L === 'Meninggal') || (k === 'B' && x.M === 'Meninggal')).length;
    const drawn = ['A', 'B', 'CP3'].filter(k => frames[k] && d.frames[k].und && d.frames[k].und.tanggal_undian);
    const nv = h('input', { type: 'checkbox' }); const reason = h('textarea', { rows: 2, placeholder: 'Alasan daftar susulan (wajib bila versi baru)' });
    const body = h('div', { class: 'stack' },
      RCA.anl.tbl(['Lembar', 'Baris', 'Tanggal kunci terbaca', 'Baris 2025', 'TW III 2025', 'Kematian tercatat', 'Keterangan'], ['A', 'B', 'CP3'].map(k => frames[k] ? [FR[k].sheet, frames[k].length, frames[k].length - badF(frames[k]).length, y25(frames[k]), tw3(frames[k]), k === 'CP3' ? '–' : dead(k, frames[k]), drawn.includes(k) ? 'Sudah diundi: dilewati kecuali versi baru' : 'Akan diunggah'] : [FR[k].sheet, '–', '–', '–', '–', '–', 'Lembar tidak ada'])),
      probs.length ? h('div', { class: 'notice warn' }, h('b', null, 'Tanggal kunci (kolom F) kosong atau tidak terbaca: '), 'baris ini tetap diunggah, tetapi tidak dapat diundi atau ditarik ke C5 sampai tanggalnya diisi. ',
        h('ul', null, probs.map(k => { const L = badF(frames[k]); return h('li', null, FR[k].sheet + ' (' + L.length + '): ' + L.slice(0, 25).map(x => 'baris ' + x._row + ' ' + x.C + (x.F ? ' "' + x.F + '"' : ' kosong')).join(', ') + (L.length > 25 ? ' …' : '')); }))) : null,
      drawn.length ? h('div', { class: 'notice warn' }, h('label', { class: 'row' }, nv, 'Unggah sebagai versi baru untuk kerangka yang sudah diundi (' + drawn.join(', ') + '); undian kerangka tersebut harus diulang.'), reason) : null,
      h('p', { class: 'muted' }, 'Baris lama kerangka yang diunggah akan diganti. Kematian otomatis menjadi calon C6 berstatus "Belum diperiksa" sampai duplikasi, dokumentasi, dan kematian dikonfirmasi.'));
    const ok = await RCA.modal('Unggah C2a · ' + st.fac, body, [{ label: 'Batal', value: false }, { label: 'Unggah', cls: 'primary', value: true, validate: () => { if (nv.checked && !reason.value.trim()) { reason.focus(); return false; } return true; } }], { wide: true });
    if (!ok) return;
    try {
      const clean = {}; Object.keys(frames).forEach(k => { clean[k] = frames[k].map(x => { const o = Object.assign({}, x); delete o._row; return o; }); });
      const res = await RCA.api('c2.uploadAll', { fac: st.fac, frames: clean, newVersion: nv.checked, reason: reason.value });
      const r = res.report;
      await RCA.modal('Hasil unggah C2a', h('div', { class: 'stack' },
        h('h3', null, 'Kerangka'), h('ul', null, Object.keys(r.frames).map(k => h('li', null, FR[k].sheet + ': ' + r.frames[k]))),
        h('h3', null, 'Calon kematian C6'), h('p', null, r.c6.kematian_terdeteksi + ' kematian terdeteksi · ' + r.c6.calon_baru + ' calon baru · ' + r.c6.ditautkan + ' ditautkan ke calon yang sudah ada.'),
        h('h3', null, 'Daftar sistem sentinel C5'), c5Result(r.c5)));
      C2.render(RCA.$('#main'));
    } catch (e) { RCA.toast(e.message, 'err'); }
  }
  async function drawAll(list) {
    if (!await RCA.confirm('Jalankan undian', 'Undian sistematis untuk kerangka ' + list.join(', ') + ' di ' + st.fac + ' memakai angka acak tetap. Setelah undian, baris kerangka tidak boleh diubah. Lanjutkan?', 'Jalankan undian')) return;
    for (const k of list) { try { await RCA.api('c2.draw', { fac: st.fac, frame: k }); } catch (e) { RCA.toast(k + ': ' + e.message, 'err'); } }
    RCA.toast('Undian selesai', 'ok'); C2.render(RCA.$('#main'));
  }
  async function draw() {
    if (!await RCA.confirm('Jalankan undian', 'Undian memakai angka acak tetap untuk ' + st.fac + ' kerangka ' + st.frame + '. Setelah undian, baris kerangka tidak boleh diubah. Lanjutkan?', 'Jalankan undian')) return;
    try { await RCA.api('c2.draw', { fac: st.fac, frame: st.frame }); RCA.toast('Undian selesai', 'ok'); C2.render(RCA.$('#main')); } catch (e) { RCA.toast(e.message, 'err'); }
  }
  async function editRow(x) {
    const O = S.c2.opts;
    const mk = (k, l, opts, t) => { const f = { k, l, t: t || (opts ? 'select' : 'text'), o: opts }; return { f, el: RCA.forms.widget(f, x['s_' + k], v => { vals[k] = v; }, false) }; };
    const vals = {};
    const flds = [mk('pilihan', 'Pilihan purposif/pengganti', O.SelOpt), mk('alasan', 'Alasan purposif', O.Alasan), mk('keterangan', 'Keterangan alasan dan masukan fasyankes', null, 'textarea'),
      mk('akses', 'Akses sumber', O.Akses), mk('telaah', 'Status telaah', O.Telaah), mk('diganti', 'Diganti oleh (kode unit)'), mk('catatan', 'Catatan koordinator', null, 'textarea')];
    const body = h('div', { class: 'stack' },
      h('dl', { class: 'kv' }, h('dt', null, 'Kode pasien / lokal'), h('dd', null, x.c_B + ' / ' + x.c_C), h('dt', null, 'Pilihan acak'), h('dd', null, x.acak || '–'), h('dt', null, 'Penanda bantu'), h('dd', null, x.penanda || '–')),
      h('div', { class: 'fgrid' }, flds.map(o => { const tp = RCA.help.forField(o.f, 'purposif acak cadangan'); return h('div', { class: 'f' + (o.f.t === 'textarea' ? ' full' : '') }, h('div', { class: 'lblrow' }, h('label', { class: 'lbl' }, o.f.l), tp.btn), tp.box, o.el); })),
      h('p', { class: 'muted' }, 'Pengganti berasal dari kelompok dan daftar yang sama dengan metode semula. Purposif wajib disertai alasan.'));
    const ok = await RCA.modal('Baris ' + x.c_C, body, [{ label: 'Batal', value: false }, { label: 'Simpan', cls: 'primary', value: true }], { wide: true });
    if (!ok || !Object.keys(vals).length) return;
    try { await RCA.api('c2.update', { id: x.id, fields: vals }); C2.render(RCA.$('#main')); } catch (e) { RCA.toast(e.message, 'err'); }
  }

  /* ------------------------------------------------------------ calon C6 */
  async function calon(body) {
    // direktori pengguna ikut diperbarui (penelaah yang baru disetujui langsung muncul di pilihan)
    const [rows, b] = await Promise.all([RCA.swr('c6.calon', {}, { onFresh: () => RCA.softRefresh(body, () => { body.innerHTML = ''; calon(body); }) }),
      RCA.swr('bootstrap', {}, { onFresh: d => { RCA.state.users = d.users; } }).catch(() => null)]);
    if (b && b.users) RCA.state.users = b.users;
    const target = Number(S.params.c6['Target kasus per kab/kota'] || 5);
    body.appendChild(h('p', null, 'Daftar calon dihimpun Dinkes kab/kota bersama fasyankes dan jejaringnya. Calon dipilih hanya bila memenuhi syarat (duplikasi diperiksa, TB dan HIV terdokumentasi, kematian terkonfirmasi, periode Januari 2025–Juni 2026 atau perluasan 2024). Target hingga ' + target + ' per kab/kota, 10 per provinsi, 60 keseluruhan.'));
    // ---- saringan (tersimpan selama sesi)
    const f = st.cf = st.cf || {};
    const prov = r => RCA.reg.kk(r.kk).prov || '';
    const uniqSorted = a => [...new Set(a.filter(Boolean))].sort();
    const match = r => (!f.prov || prov(r) === f.prov) && (!f.kk || r.kk === f.kk) && (!f.fac || r.fasyankes === f.fac) && (!f.periode || (r.periode || 'Tanpa tanggal') === f.periode)
      && (!f.eligible || r.eligible === f.eligible) && (!f.dipilih || (r.dipilih || 'Belum') === f.dipilih) && (!f.asal || (r.asal || 'Manual') === f.asal) && (!f.status || (r.status || '–') === f.status)
      && (!f.pen || r.pen1 === f.pen || r.pen2 === f.pen || (f.pen === '_none' && !r.pen1 && !r.pen2))
      && (!f.q || [r.kode_calon, r.kode_pasien, r.kode_kasus, r.kode_unit_c3, r.fasyankes].join(' ').toLowerCase().includes(f.q.toLowerCase()));
    const sumBox = h('div'), listBox = h('div'), countEl = h('span', { class: 'muted small' });
    const resetBtn = h('button', { type: 'button', class: 'btn small', onclick: () => { Object.keys(f).forEach(k => delete f[k]); drawFilters(); draw(); } }, 'Hapus saringan');
    const mk = (k, label, opts) => { const sel = h('select', { 'aria-label': label }, h('option', { value: '' }, label), opts.map(([v, l]) => h('option', { value: v, selected: f[k] === v }, l))); sel.addEventListener('change', () => { f[k] = sel.value; if (k === 'prov') { f.kk = ''; f.fac = ''; } if (k === 'kk') f.fac = ''; drawFilters(); draw(); }); return sel; };
    const fbar = h('div', { class: 'filters no-print' });
    const drawFilters = () => {
      fbar.innerHTML = '';
      const kks = RCA.state.regions.kk.filter(k => !f.prov || k.prov === f.prov);
      const facs = uniqSorted(rows.filter(r => (!f.prov || prov(r) === f.prov) && (!f.kk || r.kk === f.kk)).map(r => r.fasyankes));
      const q = h('input', { type: 'search', placeholder: 'Cari kode calon/pasien/kasus/unit C3', value: f.q || '' }); q.addEventListener('input', () => { f.q = q.value; draw(); });
      [mk('prov', 'Semua provinsi', RCA.state.regions.prov.map(p => [p.code, p.name])),
        mk('kk', 'Semua kab/kota', kks.map(k => [k.code, k.name])),
        mk('fac', 'Semua fasyankes', facs.map(c => [c, c])),
        mk('periode', 'Semua periode', uniqSorted(rows.map(r => r.periode || 'Tanpa tanggal')).map(v => [v, v])),
        mk('eligible', 'Syarat: semua', [['Ya', 'Memenuhi syarat'], ['Tidak', 'Tidak memenuhi']]),
        mk('dipilih', 'Dipilih: semua', uniqSorted(rows.map(r => r.dipilih || 'Belum')).map(v => [v, 'Dipilih: ' + v])),
        mk('asal', 'Semua asal', uniqSorted(rows.map(r => r.asal || 'Manual')).map(v => [v, v])),
        mk('status', 'Semua status', uniqSorted(rows.map(r => r.status || '–')).map(v => [v, v])),
        mk('pen', 'Semua penelaah', [['_none', 'Belum ada penelaah']].concat(uniqSorted(rows.flatMap(r => [r.pen1, r.pen2])).map(e => [e, userName(e)]))),
        q].forEach(x => fbar.appendChild(x));
    };
    const draw = () => {
      const L = rows.filter(match);
      countEl.textContent = L.length + ' dari ' + rows.length + ' calon'; resetBtn.hidden = !Object.values(f).some(Boolean);
      // rekap per kab/kota mengikuti saringan wilayah
      const per = {}; L.forEach(r => { per[r.kk] = per[r.kk] || { c: 0, e: 0, p: 0 }; per[r.kk].c++; if (r.eligible === 'Ya') per[r.kk].e++; if (r.dipilih === 'Ya') per[r.kk].p++; });
      const kks = RCA.state.regions.kk.filter(k => (!f.prov || k.prov === f.prov) && (!f.kk || k.code === f.kk));
      const tot = kks.reduce((t, k) => { const p = per[k.code] || { c: 0, e: 0, p: 0 }; t.c += p.c; t.e += p.e; t.p += p.p; return t; }, { c: 0, e: 0, p: 0 });
      sumBox.innerHTML = '';
      sumBox.appendChild(h('div', { class: 'table-wrap', style: { marginBottom: '12px' } }, h('table', { class: 't' }, h('thead', null, h('tr', null, ['Kab/kota', 'Provinsi', 'Calon', 'Memenuhi syarat', 'Dipilih', 'Target'].map(x => h('th', null, x)))),
        h('tbody', null, kks.map(k => { const p = per[k.code] || { c: 0, e: 0, p: 0 }; return h('tr', { style: { cursor: 'pointer' }, title: 'Saring kab/kota ini', onclick: () => { f.prov = k.prov; f.kk = k.code; f.fac = ''; drawFilters(); draw(); } }, h('td', null, k.name), h('td', null, RCA.reg.prov(k.prov).name || ''), h('td', { class: 'n' }, p.c), h('td', { class: 'n' }, p.e), h('td', { class: 'n' }, h('b', { style: p.p >= target ? { color: 'var(--need-ok)' } : null }, p.p)), h('td', { class: 'n' }, target)); }),
          kks.length > 1 ? h('tr', null, h('td', null, h('b', null, 'Jumlah')), h('td', null, ''), h('td', { class: 'n' }, h('b', null, tot.c)), h('td', { class: 'n' }, h('b', null, tot.e)), h('td', { class: 'n' }, h('b', null, tot.p)), h('td', { class: 'n' }, target * kks.length)) : null))));
      listBox.innerHTML = '';
      if (!L.length) { listBox.appendChild(h('p', { class: 'muted' }, rows.length ? 'Tidak ada calon yang cocok dengan saringan.' : 'Belum ada calon.')); return; }
      listBox.appendChild(h('div', { class: 'table-wrap' }, h('table', { class: 't' }, h('thead', null, h('tr', null, ['Kode calon', 'Kab/kota', 'Fasyankes', 'Kode pasien', 'Asal', 'Tgl kematian', 'Periode', 'Memenuhi syarat', 'Dipilih', 'Kode kasus C6', 'Kode unit C3', 'Penelaah 1', 'Penelaah 2', 'Status'].map(x => h('th', null, x)))),
        h('tbody', null, L.map(r => h('tr', { style: { cursor: 'pointer' }, onclick: () => RCA.can.review() && editCalon(r) },
          h('td', null, h('b', null, r.kode_calon)), h('td', null, r.kk), h('td', null, r.fasyankes), h('td', null, r.kode_pasien), h('td', null, h('small', null, r.asal || 'Manual')), h('td', null, r.tgl_mati), h('td', null, r.periode),
          h('td', null, r.eligible === 'Ya' ? h('span', { class: 'st st-Valid' }, 'Ya') : h('span', { class: 'st st-Belum' }, 'Tidak')), h('td', null, r.dipilih), h('td', null, h('b', null, r.kode_kasus)), h('td', null, r.kode_unit_c3),
          h('td', null, userName(r.pen1)), h('td', null, userName(r.pen2)), h('td', null, r.status)))))));
      RCA.cardify && RCA.cardify(listBox);
    };
    body.appendChild(fbar);
    body.appendChild(h('div', { class: 'row', style: { margin: '4px 0 10px' } }, countEl, resetBtn, RCA.can.review() ? h('button', { class: 'btn primary small', onclick: () => editCalon({}) }, '+ Tambah calon') : null));
    body.appendChild(sumBox); body.appendChild(listBox);
    drawFilters(); draw();
  }
  const userName = em => { const u = RCA.state.users.find(x => x.email === em); return u ? u.name : (em || ''); };
  async function editCalon(r) {
    const vals = Object.assign({}, r);
    const cols = S.c2.c6_calon_cols.filter(c => c.k !== 'kode_kasus');
    const g = h('div', { class: 'fgrid' });
    cols.forEach(c => {
      let f = c;
      if (c.k === 'kk') f = Object.assign({}, c, { t: 'select', o: RCA.state.regions.kk.map(k => k.code) });
      const tp = RCA.help.forField(f, 'C6 calon kematian'); g.appendChild(h('div', { class: 'f' }, h('div', { class: 'lblrow' }, h('label', { class: 'lbl' }, c.l), tp.btn), tp.box, RCA.forms.widget(f, vals[c.k], v => { vals[c.k] = v; }, false)));
    });
    const revs = RCA.state.users.filter(u => ['Enumerator', 'Koordinator', 'SuperAdmin'].includes(u.role));
    ['pen1', 'pen2'].forEach((k, i) => {
      const sel = h('select'); sel.appendChild(h('option', { value: '' }, '— pilih —'));
      revs.forEach(u => sel.appendChild(h('option', { value: u.email, selected: vals[k] === u.email }, u.name + (u.code ? ' (' + u.code + ')' : ''))));
      sel.addEventListener('change', () => { vals[k] = sel.value; });
      g.appendChild(h('div', { class: 'f' }, h('label', { class: 'lbl' }, i ? 'Penelaah 2 (penilaian kedua, tersamar)' : 'Penelaah 1 (yang berkunjung)'), sel));
    });
    const ok = await RCA.modal(r.kode_calon ? 'Calon ' + r.kode_calon : 'Calon baru', h('div', { class: 'stack' }, g,
      h('p', { class: 'muted' }, 'Kode pasien ditulis dengan awalan kode fasyankes (contoh BLL-RS-P008) karena kode penghubung hanya unik di dalam satu fasyankes. Penelaah 2 tidak dapat membuka penilaian pertama.')),
      [{ label: 'Batal', value: false }, { label: 'Simpan', cls: 'primary', value: true }], { wide: true });
    if (!ok) return;
    try { await RCA.api('c6.calon.save', { row: vals }); RCA.toast('Tersimpan', 'ok'); C2.render(RCA.$('#main')); } catch (e) { RCA.toast(e.message, 'err'); }
  }

  /* ------------------------------------------------------------ sentinel C5 */
  const C5COLS = { '5': ['kode_baris', 'kode_unit_c3', 'kode_pasien', 'tgl_sis', 'tipe_sis', 'hiv_sis'], '6': ['kode_baris', 'kode_unit_c3', 'kode_pasien', 'tgl_sis', 'tipe_sis', 'hiv_sis', 'arv_sis'], '41a': ['kode_baris', 'kode_unit_c3', 'kode_pasien', 'tgl_sis', 'masuk_sis', 'tpt_sis'] };
  async function sentinel(body) {
    const sent = RCA.state.regions.fac.filter(f => f.sentinel === 'Ya');
    body.appendChild(h('p', null, 'Enam sentinel (satu per provinsi) bagian dari 24 fasyankes. Unggah daftar ekspor SITB/SIHA satu triwulan per indikator; enumerator lalu mencocokkan setiap baris dengan register di formulir C5 (arah 1), dan menambahkan baris telusur register (arah 2).'));
    const byProv = {}; sent.forEach(f => { const p = RCA.reg.kk(f.kk).prov; byProv[p] = (byProv[p] || 0) + 1; });
    const warn = RCA.state.regions.prov.filter(p => byProv[p.code] !== 1);
    if (warn.length) body.appendChild(h('div', { class: 'notice warn', style: { marginBottom: '12px' } }, 'Sentinel harus tepat satu per provinsi. Periksa: ' + warn.map(p => p.name + ' (' + (byProv[p.code] || 0) + ')').join(', ') + '. ' + (RCA.can.admin() || RCA.can.review() ? 'Tetapkan di menu Admin › Fasyankes.' : '')));
    body.appendChild(RCA.help.indicatorPanel());
    body.appendChild(h('div', { class: 'row', style: { margin: '12px 0' } }, h('button', { class: 'btn small', onclick: templC5 }, 'Unduh templat daftar sistem C5'),
      RCA.can.review() && sent.length ? h('button', { class: 'btn small primary', onclick: c5PullAll }, 'Tarik ulang semua sentinel dari C2a (TW III 2025)') : null));
    body.appendChild(h('p', { class: 'small muted' }, 'Setiap kali C2a diunggah (atau fasyankes ditandai sentinel, atau periode di C5 Identitas diubah), seluruh baris C2a bertanggal 1 Jul–30 Sep 2025 otomatis ditarik ke lembar pencocokan C5: baris baru ditambahkan, kolom data sistem baris lama diperbarui, isian sumber oleh enumerator tidak diubah.'));
    sent.forEach(f => {
      const card = h('div', { class: 'card', style: { marginBottom: '10px' } }, h('h3', null, RCA.reg.facLabel(f)));
      if (RCA.can.review()) {
        const row = h('div', { class: 'row' });
        [['5', 'TB/HIV-5'], ['6', 'TB/HIV-6'], ['41a', 'TB/HIV-4.1a']].forEach(([ind, l]) => {
          const inp = h('input', { type: 'file', accept: '.xlsx,.csv', hidden: true });
          inp.addEventListener('change', () => { const file = inp.files[0]; inp.value = ''; if (file) uploadC5(f.code, ind, file); });
          row.appendChild(inp); row.appendChild(h('button', { class: 'btn small', onclick: () => inp.click() }, 'Unggah daftar ' + l));
        });
        row.appendChild(h('button', { class: 'btn small primary', onclick: async () => { try { const r = await RCA.api('c5.fromC2', { fac: f.code }); RCA.modal('Isi dari kerangka C2a · ' + f.code, c5Result(r)); } catch (e) { RCA.toast(e.message, 'err'); } } }, 'Tarik ulang dari C2a'));
        card.appendChild(row);
      }
      body.appendChild(card);
    });
    if (!sent.length) body.appendChild(h('div', { class: 'notice' }, 'Belum ada fasyankes yang ditandai sentinel.'));
  }
  function templC5() {
    if (!RCA.needXLSX()) return;
    const wb = XLSX.utils.book_new();
    const lab = { kode_baris: 'Kode baris C5 (tanpa identitas, contoh S5-001)', kode_unit_c3: 'Kode unit C3 bila sama', kode_pasien: 'Kode pasien (berkas penghubung)', tgl_sis: 'Tanggal (sistem) HH/BB/TTTT', tipe_sis: 'Tipe pasien: sistem (Baru/Kambuh/Lainnya)', hiv_sis: 'Status HIV: sistem (Positif/Negatif/Tidak diketahui/Kosong)', arv_sis: 'Status ARV: sistem', masuk_sis: 'Status masuk: sistem', tpt_sis: 'Tanggal mulai TPT: sistem' };
    Object.keys(C5COLS).forEach(ind => { const ws = XLSX.utils.aoa_to_sheet([C5COLS[ind], C5COLS[ind].map(k => lab[k])]); XLSX.utils.book_append_sheet(wb, ws, 'TBHIV' + ind); });
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([['Baris 1 = kunci kolom (jangan diubah). Baris 2 = keterangan. Data mulai baris 3.'], ['Jangan mencantumkan nama, NIK, nomor RM, ID SITB/SIHA. Daftar beridentitas disimpan petugas berwenang.']]), 'Petunjuk');
    XLSX.writeFile(wb, 'Templat_Daftar_Sistem_C5.xlsx');
  }
  async function uploadC5(fac, ind, file) {
    if (!RCA.needXLSX()) return;
    const wb = XLSX.read(await file.arrayBuffer());
    // berkas C2a (lembar A_TBHIV / B_ARV / CP3_TB) diunggah di sini: proses sebagai C2a lalu tarik C5 dari kerangka
    if (['A', 'B', 'CP3'].some(k => findSheet(wb, k))) {
      RCA.toast('Berkas ini adalah C2a. Diunggah sebagai kerangka C2a ' + fac + '; C5 ditarik otomatis dari kerangka.', null, 7000);
      st.fac = fac;
      let d; try { d = await RCA.api('c2.get', { fac }); } catch (e) { return RCA.toast(e.message, 'err'); }
      return uploadAll(file, d);
    }
    const ws = wb.Sheets['TBHIV' + ind] || wb.Sheets[wb.SheetNames[0]];
    const aoa = XLSX.utils.sheet_to_json(ws, { header: 1, raw: true, defval: '' });
    const keys = aoa[0].map(String);
    if (ID_WORDS.test(aoa[0].concat(aoa[1] || []).join(' '))) return RCA.toast('Berkas tampak memuat kolom identitas. Hapus dulu.', 'err');
    const rows = aoa.slice(2).filter(r => r.some(v => v !== '')).map(r => { const o = {}; keys.forEach((k, j) => { let v = r[j]; if (/^tgl_|^tpt_/.test(k) || v instanceof Date) v = RCA.isoDate(v); if (v !== '') o[k] = String(v); }); return o; });
    if (!rows.every(r => r.kode_baris)) return RCA.toast('Kolom kode_baris wajib terisi di setiap baris', 'err');
    try { const r = await RCA.api('c5.upload', { fac, ind, rows }); RCA.toast(r.added + ' baris ditambahkan (total ' + r.total + ')', 'ok'); } catch (e) { RCA.toast(e.message, 'err'); }
  }

  /* ------------------------------------------------------------ sesi C7 */
  async function sesi(body) {
    const units = await RCA.api('units.list', { form: 'C7' });
    const ses = units.filter(u => u.sub === 'C7S');
    body.appendChild(h('p', null, 'Target awal 36 wawancara (30 provinsi, 6 nasional) dan 12 diskusi kelompok. Sesi dianggap terlaksana bila tanggal diisi di formulir C7. Peserta dicatat dengan kode; identitas ada di berkas penghubung peserta C7-P.'));
    const T = S.c7.target;
    body.appendChild(h('div', { class: 'table-wrap', style: { marginBottom: '12px' } }, h('table', { class: 't' }, h('thead', null, h('tr', null, ['Provinsi', 'Target', 'Sesi tercatat', 'Valid'].map(x => h('th', null, x)))),
      h('tbody', null, Object.keys(T).map(p => { const u = ses.filter(x => x.unit.startsWith(p + '-')); return h('tr', null, h('td', null, p), h('td', null, T[p]), h('td', { class: 'n' }, u.filter(x => x.status !== 'Belum').length + '/' + u.length), h('td', { class: 'n' }, u.filter(x => x.status === 'Valid').length)); })))));
    if (RCA.can.review()) body.appendChild(h('button', { class: 'btn', style: { marginBottom: '12px' }, onclick: async () => {
      const vals = {}; const mk = (k, l) => h('div', { class: 'f' }, h('label', { class: 'lbl' }, l), RCA.forms.widget({ t: 'text' }, '', v => { vals[k] = v; }));
      const ok = await RCA.modal('Tambah sesi', h('div', { class: 'fgrid' }, mk('code', 'Kode sesi (contoh BAL-W6)'), mk('kk', 'Kab/kota (kode) atau Keduanya/Nasional'), mk('target', 'Informan sasaran'), mk('catatan', 'Alasan tambahan/pengganti')), [{ label: 'Batal', value: false }, { label: 'Tambah', cls: 'primary', value: true }]);
      if (!ok) return; try { await RCA.api('c7.addSession', vals); C2.render(RCA.$('#main')); } catch (e) { RCA.toast(e.message, 'err'); }
    } }, '+ Tambah sesi'));
    body.appendChild(h('div', { class: 'table-wrap' }, h('table', { class: 't' }, h('thead', null, h('tr', null, ['Kode sesi', 'Kab/kota', 'Informan sasaran', 'Status'].map(x => h('th', null, x)))),
      h('tbody', null, ses.map(u => h('tr', { style: { cursor: 'pointer' }, onclick: () => { location.hash = '#/edit/C7/C7S/' + encodeURIComponent(u.unit); } }, h('td', null, h('b', null, u.unit)), h('td', null, u.meta.kk7 || u.kk), h('td', null, u.meta.target), h('td', null, h('span', { class: 'st st-' + u.status }, u.status))))))));
  }

  /* ------------------------------------------------------------ lembar penghubung */
  async function penghubung(body) {
    body.appendChild(h('div', { class: 'notice', style: { marginBottom: '12px' } }, h('b', null, 'Cara mencocokkan kode dengan NIK/no. RM: '),
      h('ol', null, h('li', null, 'Fasyankes membuat kode pasien (P001, P002…) di berkas penghubung C2a-P yang disimpan di fasyankes; satu orang memakai kode yang sama di semua lembar.'),
        h('li', null, 'Koordinator mengirim daftar kode unit terpilih (tanpa penanda dan alasan) sekurang-kurangnya 3 hari kerja sebelum kunjungan.'),
        h('li', null, 'Petugas berwenang mencari NIK/no. RM melalui berkas penghubung dan menyiapkan berkas rekam medis per kode unit.'),
        h('li', null, 'Enumerator hanya mencatat kode unit di aplikasi. Petunjuk non-identitas (tanggal kunci, jenis kelamin, umur, sumber baris) tampil di setiap unit C3 untuk membantu memastikan berkas yang benar.'))));
    const fs = facSelect(st.fac, v => { st.fac = v; C2.render(RCA.$('#main')); });
    body.appendChild(h('div', { class: 'row', style: { marginBottom: '12px' } }, fs));
    if (!st.fac) return;
    const units = await RCA.api('units.list', { form: 'C3' });
    // sama persis dengan unit terpilih di tab Kerangka dan daftar C3 (rekaman lama yang tidak terpilih tidak dicetak)
    const mine = units.filter(u => u.fac === st.fac && !(u.meta && u.meta.yatim)).sort((a, b) => (a.meta.frame || '').localeCompare(b.meta.frame || '') || a.unit.localeCompare(b.unit));
    const rows = mine.map(u => [u.unit, u.meta.kode_pasien, u.meta.kode_lokal, u.meta.frame, u.meta.pilihan || '', (u.meta.petunjuk || {}).tgl || u.meta.tb_dx || '', '', '', '', '']);
    const head = ['Kode unit', 'Kode pasien', 'Kode episode/riwayat lokal', 'Kerangka', 'Pilihan', 'Tanggal kunci', 'No. RM (diisi di fasyankes)', 'No. register / ID SITB-SIHA (diisi di fasyankes)', 'Lokasi berkas', 'Siap (✓)'];
    body.appendChild(h('div', { class: 'row', style: { marginBottom: '10px' } },
      h('button', { class: 'btn', onclick: () => window.print() }, 'Cetak'),
      h('button', { class: 'btn', onclick: () => { if (!RCA.needXLSX()) return; const wb = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([['Lembar penghubung kode unit terpilih · ' + st.fac + ' · DISIMPAN DI FASYANKES, JANGAN DIKIRIM KEMBALI'], head].concat(rows)), 'Penghubung'); XLSX.writeFile(wb, 'Lembar_Penghubung_' + st.fac + '.xlsx'); } }, 'Unduh Excel')));
    body.appendChild(h('h2', null, 'Lembar penghubung · ' + st.fac + ' · ' + RCA.reg.facName(st.fac) + ' · ' + rows.length + ' unit'));
    body.appendChild(h('p', { class: 'muted' }, 'Disimpan di fasyankes dengan akses terbatas. Kolom no. RM dan register diisi tangan oleh petugas berwenang dan tidak dimasukkan ke aplikasi.'));
    body.appendChild(h('div', { class: 'table-wrap' }, h('table', { class: 't' }, h('thead', null, h('tr', null, head.map(x => h('th', null, x)))), h('tbody', null, rows.map(r => h('tr', null, r.map((v, i) => h('td', { style: i >= 6 ? { minWidth: '120px' } : null }, v))))))));
    if (!rows.length) body.appendChild(h('p', { class: 'muted' }, 'Belum ada unit terpilih di fasyankes ini.'));
  }

  /* ------------------------------------------------------------ indeks silang */
  async function indeks(body) {
    const [c3, cal, t5, t6, t41] = await Promise.all([RCA.api('units.list', { form: 'C3' }), RCA.api('c6.calon'),
      RCA.api('rec.table', { form: 'C5', sub: 'C5_5' }), RCA.api('rec.table', { form: 'C5', sub: 'C5_6' }), RCA.api('rec.table', { form: 'C5', sub: 'C5_41a' })]);
    const links = {};
    const add = (c3code, act, code) => { if (!c3code) return; (links[c3code] = links[c3code] || []).push(act + ' ' + code); };
    cal.forEach(c => add(c.kode_unit_c3, 'C6', c.kode_kasus || c.kode_calon));
    [['TB/HIV-5', t5.C5_5], ['TB/HIV-6', t6.C5_6], ['TB/HIV-4.1a', t41.C5_41a]].forEach(([l, recs]) => (recs || []).forEach(r => (r.data.cocok || []).forEach(x => add(x.kode_unit_c3, 'C5 ' + l, x.kode_baris))));
    const pid = {}; c3.forEach(u => { const k = u.fac + '|' + u.meta.kode_pasien; (pid[k] = pid[k] || []).push(u.unit); });
    const multi = Object.keys(pid).filter(k => pid[k].length > 1);
    body.appendChild(h('p', null, 'Kode yang dipakai di lebih dari satu kegiatan. Beberapa kegiatan tidak berarti beberapa pasien: jumlah unit, dokumen, entri sistem, kasus kematian, dan pasien unik dilaporkan terpisah.'));
    body.appendChild(h('div', { class: 'kpis', style: { marginBottom: '12px' } }, [['Unit C3', c3.length], ['Pasien unik C3', Object.keys(pid).length], ['Pasien di >1 kerangka', multi.length], ['Unit C3 tertaut ke C5/C6', Object.keys(links).length]].map(([l, v]) => h('div', { class: 'kpi' }, h('b', null, v), h('span', null, l)))));
    body.appendChild(h('div', { class: 'table-wrap' }, h('table', { class: 't' }, h('thead', null, h('tr', null, h('th', null, 'Kode unit C3'), h('th', null, 'Dipakai juga di'))),
      h('tbody', null, Object.keys(links).map(k => h('tr', null, h('td', null, h('b', null, k)), h('td', null, links[k].join('; ')))), multi.map(k => h('tr', null, h('td', null, k.replace('|', ' · ')), h('td', null, 'Pasien sama di unit: ' + pid[k].join(', '))))))));
  }
})();
