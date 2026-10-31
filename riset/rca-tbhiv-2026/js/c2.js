/* RCA TB-HIV 2026 · C2 Daftar sampel dan kode bukti: kerangka & undian, calon C6, daftar sentinel C5, sesi C7, lembar penghubung */
(function () {
  'use strict';
  const RCA = window.RCA, h = RCA.h, S = RCA.S;
  const C2 = RCA.c2 = {};
  const FR = S.c2.frames;
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
    const ft = h('div', { class: 'tabs', role: 'tablist' });
    ['A', 'B', 'CP3'].forEach(k => {
      const f = d.frames[k]; const n = f.rows.filter(x => x.terpilih).length;
      ft.appendChild(h('button', { role: 'tab', 'aria-selected': st.frame === k ? 'true' : 'false', onclick: () => { st.frame = k; C2.render(RCA.$('#main')); } }, FR[k].title + ' (' + n + ' terpilih)'));
    });
    body.appendChild(ft);
    const f = d.frames[st.frame], fr = FR[st.frame], und = f.und, info = f.info;
    body.appendChild(h('p', { class: 'muted' }, fr.crit));
    const sel = f.rows.filter(x => x.terpilih);
    const cnt = t => sel.filter(x => (x.status_pilih || '').toLowerCase().includes(t)).length;
    body.appendChild(h('div', { class: 'kpis', style: { marginBottom: '12px' } },
      [['Baris diterima', f.rows.length], ['Baris 2025', info.n2025], ['Layak acak (N)', info.N], ['Acak/sensus terpilih', cnt('acak') + cnt('sensus')], ['Purposif terpilih', cnt('purposif')], ['Total terpilih', sel.length + ' / 6 inti']]
        .map(([l, v]) => h('div', { class: 'kpi' }, h('b', null, v), h('span', null, l)))));
    const actions = h('div', { class: 'row', style: { marginBottom: '12px' } });
    if (RCA.can.review()) {
      const inp = h('input', { type: 'file', accept: '.xlsx,.xls,.csv', hidden: true });
      inp.addEventListener('change', () => { const file = inp.files[0]; inp.value = ''; if (file) uploadFrame(file, und); });
      actions.appendChild(inp);
      actions.appendChild(h('button', { class: 'btn', onclick: () => inp.click() }, und && und.tanggal_undian ? 'Unggah versi baru kerangka' : 'Unggah kerangka (C2a)'));
      if (und && !und.tanggal_undian && f.rows.length) actions.appendChild(h('button', { class: 'btn primary', onclick: () => draw() }, 'Jalankan undian sistematis'));
      if (und) {
        const rk = h('input', { type: 'number', value: und.rekap || '', style: { width: '120px' }, 'aria-label': 'Rekap SITB/SIHA 2025' });
        actions.appendChild(h('label', { class: 'row' }, h('span', null, 'Rekap SITB/SIHA 2025:'), rk,
          h('button', { class: 'btn small', onclick: async () => { await RCA.api('c2.rekap', { fac: st.fac, frame: st.frame, rekap: rk.value }); C2.render(RCA.$('#main')); } }, 'Simpan')));
      }
    }
    body.appendChild(actions);
    if (und && und.tanggal_undian) {
      const P = info.P || {};
      body.appendChild(h('div', { class: 'notice ok', style: { marginBottom: '12px' } }, 'Undian ' + RCA.fmtDT(und.tanggal_undian) + ' oleh ' + und.oleh + ' · kunci ' + f.Ukey + ' · U = ' + und.U + ' · N = ' + info.N +
        (info.sensus ? ' · Sensus (baris 2025 ≤ 6)' : Object.keys(P).length ? ' · posisi inti ' + [P.P1, P.P3, P.P5].join(', ') + '; P2/P4/P6 ' + [P.P2, P.P4, P.P6].join(', ') + '; cadangan 4–9 ' + [P.P7, P.P8, P.P9, P.P10, P.P11, P.P12].join(', ') : ' · N ≤ 3: seluruh unit layak menjadi acak inti') +
        ' · perluasan ' + (und.perluasan || 'Tidak') + (und.rekap ? ' · rekap ' + und.rekap + ' (selisih ' + Math.round((info.n2025 - und.rekap) / und.rekap * 100) + '%)' : '')));
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
          h('td', null, x.acak), h('td', null, x.s_pilihan || ''), h('td', null, x.s_alasan || ''), h('td', null, x.terpilih ? h('b', null, x.kode_unit) : ''),
          h('td', null, h('small', null, x.penanda)), h('td', null, h('small', { style: { color: 'var(--s-kembali)' } }, x.cek)), h('td', null, x.s_akses || ''), h('td', null, x.s_telaah || ''), h('td', null, x.s_diganti || ''))));
    };
    q.addEventListener('input', drawRows); onlySel.addEventListener('change', drawRows);
    body.appendChild(h('div', { class: 'filters' }, q, h('label', { class: 'row' }, onlySel, 'Hanya terpilih dan cadangan')));
    body.appendChild(h('div', { class: 'table-wrap', style: { maxHeight: '70vh' } }, h('table', { class: 't' }, h('thead', null, h('tr', null,
      ['No', 'Kode pasien', 'Kode lokal', 'Tanggal kunci', 'Periode', 'No urut acak', 'Pilihan acak', 'Purposif/pengganti', 'Alasan', 'Kode unit', 'Penanda bantu purposif', 'Cek', 'Akses', 'Telaah', 'Diganti oleh'].map(x => h('th', null, x)))), tbody)));
    drawRows();
    body.appendChild(h('p', { class: 'muted', style: { marginTop: '10px' } }, 'Ketuk baris untuk menetapkan purposif, pengganti, akses sumber, atau status telaah. Unit acak yang tidak dapat ditelaah diganti cadangan acak menurut nomornya; baris awal tetap dicatat.'));
  }

  async function uploadFrame(file, und) {
    if (!RCA.needXLSX()) return;
    const fr = FR[st.frame];
    let reason = '';
    if (und && und.tanggal_undian) { reason = await RCA.prompt('Unggah versi baru', 'Alasan daftar susulan (dicatat sebagai versi baru)', { required: true, multiline: true }); if (!reason) return; }
    const wb = XLSX.read(await file.arrayBuffer(), { cellDates: true });
    const ws = wb.Sheets[fr.sheet] || wb.Sheets[wb.SheetNames.find(n => n.toUpperCase().includes(st.frame === 'CP3' ? 'CP3' : st.frame === 'A' ? 'A_' : 'B_'))];
    if (!ws) return RCA.toast('Lembar ' + fr.sheet + ' tidak ditemukan di berkas', 'err');
    const aoa = XLSX.utils.sheet_to_json(ws, { header: 1, raw: true, defval: '' });
    const hdr = (aoa[3] || []).map(String).join(' | ');
    if (ID_WORDS.test(hdr)) return RCA.modal('Berkas memuat kolom identitas', h('p', null, 'Judul kolom tampak memuat identitas (nama/NIK/no. RM/alamat/telepon). Hapus kolom tersebut di perangkat Anda sebelum mengunggah. Identitas hanya disimpan di berkas penghubung fasyankes.'));
    const last = fr.cols[fr.cols.length - 1].k;
    const letters = 'ABCDEFGHIJKLMNO'.split('').slice(0, 'ABCDEFGHIJKLMNO'.indexOf(last) + 1);
    const rows = [];
    for (let i = 5; i < aoa.length; i++) {
      const r = aoa[i]; if (!r || String(r[0]).toLowerCase() === 'contoh') continue;
      const o = {};
      letters.forEach((L, j) => { if (j === 0) return; let v = r[j]; if (v instanceof Date) v = new Date(v.getTime() - v.getTimezoneOffset() * 60000).toISOString().slice(0, 10); if (v !== '' && v !== null) o[L] = String(v).trim(); });
      if (o.C) rows.push(o);
    }
    const bad = rows.filter(o => Object.values(o).some(v => /\b\d{16}\b/.test(v)));
    if (bad.length) return RCA.modal('Kemungkinan NIK terdeteksi', h('p', null, bad.length + ' baris memuat angka 16 digit (mirip NIK). Periksa dan hapus sebelum mengunggah.'));
    if (!await RCA.confirm('Unggah kerangka', rows.length + ' baris akan diunggah untuk ' + st.fac + ' · ' + fr.title + '. Baris lama kerangka ini diganti.', 'Unggah')) return;
    try { await RCA.api('c2.upload', { fac: st.fac, frame: st.frame, rows, newVersion: !!reason, reason }); RCA.toast('Kerangka diunggah: ' + rows.length + ' baris', 'ok'); C2.render(RCA.$('#main')); }
    catch (e) { RCA.toast(e.message, 'err'); }
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
      h('div', { class: 'fgrid' }, flds.map(o => h('div', { class: 'f' + (o.f.t === 'textarea' ? ' full' : '') }, h('label', { class: 'lbl' }, o.f.l), o.el))),
      h('p', { class: 'muted' }, 'Pengganti berasal dari kelompok dan daftar yang sama dengan metode semula. Purposif wajib disertai alasan.'));
    const ok = await RCA.modal('Baris ' + x.c_C, body, [{ label: 'Batal', value: false }, { label: 'Simpan', cls: 'primary', value: true }], { wide: true });
    if (!ok || !Object.keys(vals).length) return;
    try { await RCA.api('c2.update', { id: x.id, fields: vals }); C2.render(RCA.$('#main')); } catch (e) { RCA.toast(e.message, 'err'); }
  }

  /* ------------------------------------------------------------ calon C6 */
  async function calon(body) {
    const [rows, b] = await Promise.all([RCA.api('c6.calon'), RCA.api('bootstrap')]);
    RCA.state.users = b.users;
    const target = Number(S.params.c6['Target kasus per kab/kota'] || 5);
    body.appendChild(h('p', null, 'Daftar calon dihimpun Dinkes kab/kota bersama fasyankes dan jejaringnya. Calon dipilih hanya bila memenuhi syarat (duplikasi diperiksa, TB dan HIV terdokumentasi, kematian terkonfirmasi, periode Januari 2025–Juni 2026 atau perluasan 2024). Target hingga ' + target + ' per kab/kota, 10 per provinsi, 60 keseluruhan.'));
    const per = {}; rows.forEach(r => { per[r.kk] = per[r.kk] || { c: 0, e: 0, p: 0 }; per[r.kk].c++; if (r.eligible === 'Ya') per[r.kk].e++; if (r.dipilih === 'Ya') per[r.kk].p++; });
    body.appendChild(h('div', { class: 'table-wrap', style: { marginBottom: '12px' } }, h('table', { class: 't' }, h('thead', null, h('tr', null, ['Kab/kota', 'Calon', 'Memenuhi syarat', 'Dipilih', 'Target'].map(x => h('th', null, x)))),
      h('tbody', null, RCA.state.regions.kk.map(k => { const p = per[k.code] || { c: 0, e: 0, p: 0 }; return h('tr', null, h('td', null, k.name), h('td', { class: 'n' }, p.c), h('td', { class: 'n' }, p.e), h('td', { class: 'n' }, h('b', null, p.p)), h('td', { class: 'n' }, target)); })))));
    if (RCA.can.review()) body.appendChild(h('button', { class: 'btn primary', style: { marginBottom: '12px' }, onclick: () => editCalon({}) }, '+ Tambah calon'));
    body.appendChild(h('div', { class: 'table-wrap' }, h('table', { class: 't' }, h('thead', null, h('tr', null, ['Kode calon', 'Kab/kota', 'Fasyankes', 'Kode pasien', 'Tgl kematian', 'Periode', 'Memenuhi syarat', 'Dipilih', 'Kode kasus C6', 'Kode unit C3', 'Penelaah 1', 'Penelaah 2', 'Status'].map(x => h('th', null, x)))),
      h('tbody', null, rows.map(r => h('tr', { style: { cursor: 'pointer' }, onclick: () => RCA.can.review() && editCalon(r) },
        h('td', null, h('b', null, r.kode_calon)), h('td', null, r.kk), h('td', null, r.fasyankes), h('td', null, r.kode_pasien), h('td', null, r.tgl_mati), h('td', null, r.periode),
        h('td', null, r.eligible === 'Ya' ? h('span', { class: 'st st-Valid' }, 'Ya') : h('span', { class: 'st st-Belum' }, 'Tidak')), h('td', null, r.dipilih), h('td', null, h('b', null, r.kode_kasus)), h('td', null, r.kode_unit_c3),
        h('td', null, userName(r.pen1)), h('td', null, userName(r.pen2)), h('td', null, r.status)))))));
    if (!rows.length) body.appendChild(h('p', { class: 'muted' }, 'Belum ada calon.'));
  }
  const userName = em => { const u = RCA.state.users.find(x => x.email === em); return u ? u.name : (em || ''); };
  async function editCalon(r) {
    const vals = Object.assign({}, r);
    const cols = S.c2.c6_calon_cols.filter(c => c.k !== 'kode_kasus');
    const g = h('div', { class: 'fgrid' });
    cols.forEach(c => {
      let f = c;
      if (c.k === 'kk') f = Object.assign({}, c, { t: 'select', o: RCA.state.regions.kk.map(k => k.code) });
      g.appendChild(h('div', { class: 'f' }, h('label', { class: 'lbl' }, c.l), RCA.forms.widget(f, vals[c.k], v => { vals[c.k] = v; }, false)));
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
    body.appendChild(h('div', { class: 'row', style: { marginBottom: '12px' } }, h('button', { class: 'btn small', onclick: templC5 }, 'Unduh templat daftar sistem C5')));
    sent.forEach(f => {
      const card = h('div', { class: 'card', style: { marginBottom: '10px' } }, h('h3', null, RCA.reg.facLabel(f)));
      if (RCA.can.review()) {
        const row = h('div', { class: 'row' });
        [['5', 'TB/HIV-5'], ['6', 'TB/HIV-6'], ['41a', 'TB/HIV-4.1a']].forEach(([ind, l]) => {
          const inp = h('input', { type: 'file', accept: '.xlsx,.csv', hidden: true });
          inp.addEventListener('change', () => { const file = inp.files[0]; inp.value = ''; if (file) uploadC5(f.code, ind, file); });
          row.appendChild(inp); row.appendChild(h('button', { class: 'btn small', onclick: () => inp.click() }, 'Unggah daftar ' + l));
        });
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
    const wb = XLSX.read(await file.arrayBuffer(), { cellDates: true });
    const ws = wb.Sheets['TBHIV' + ind] || wb.Sheets[wb.SheetNames[0]];
    const aoa = XLSX.utils.sheet_to_json(ws, { header: 1, raw: true, defval: '' });
    const keys = aoa[0].map(String);
    if (ID_WORDS.test(aoa[0].concat(aoa[1] || []).join(' '))) return RCA.toast('Berkas tampak memuat kolom identitas. Hapus dulu.', 'err');
    const rows = aoa.slice(2).filter(r => r.some(v => v !== '')).map(r => { const o = {}; keys.forEach((k, j) => { let v = r[j]; if (v instanceof Date) v = new Date(v.getTime() - v.getTimezoneOffset() * 60000).toISOString().slice(0, 10); if (v !== '') o[k] = String(v); }); return o; });
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
    const mine = units.filter(u => u.fac === st.fac);
    const rows = mine.map(u => [u.unit, u.meta.kode_pasien, u.meta.kode_lokal, u.meta.frame, (u.meta.petunjuk || {}).tgl || u.meta.tb_dx || '', '', '', '', '']);
    const head = ['Kode unit', 'Kode pasien', 'Kode episode/riwayat lokal', 'Kerangka', 'Tanggal kunci', 'No. RM (diisi di fasyankes)', 'No. register / ID SITB-SIHA (diisi di fasyankes)', 'Lokasi berkas', 'Siap (✓)'];
    body.appendChild(h('div', { class: 'row', style: { marginBottom: '10px' } },
      h('button', { class: 'btn', onclick: () => window.print() }, 'Cetak'),
      h('button', { class: 'btn', onclick: () => { if (!RCA.needXLSX()) return; const wb = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([['Lembar penghubung kode unit terpilih · ' + st.fac + ' · DISIMPAN DI FASYANKES, JANGAN DIKIRIM KEMBALI'], head].concat(rows)), 'Penghubung'); XLSX.writeFile(wb, 'Lembar_Penghubung_' + st.fac + '.xlsx'); } }, 'Unduh Excel')));
    body.appendChild(h('h2', null, 'Lembar penghubung · ' + st.fac + ' · ' + RCA.reg.facName(st.fac)));
    body.appendChild(h('p', { class: 'muted' }, 'Disimpan di fasyankes dengan akses terbatas. Kolom no. RM dan register diisi tangan oleh petugas berwenang dan tidak dimasukkan ke aplikasi.'));
    body.appendChild(h('div', { class: 'table-wrap' }, h('table', { class: 't' }, h('thead', null, h('tr', null, head.map(x => h('th', null, x)))), h('tbody', null, rows.map(r => h('tr', null, r.map((v, i) => h('td', { style: i >= 5 ? { minWidth: '120px' } : null }, v))))))));
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
