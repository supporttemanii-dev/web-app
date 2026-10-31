/* RCA TB-HIV 2026 · Dashboard Analisis: apa yang terjadi, mengapa terjadi, dan penelusuran balik ke data mentah.
   Setiap batang/sel grafik dapat diketuk: panel kanan menampilkan unit terkait (cerita + data mentah + tautan ke formulir). */
(function () {
  'use strict';
  const RCA = window.RCA, h = RCA.h, S = RCA.S, DB = RCA.dash;
  const filt = RCA.state.filters = RCA.state.filters || {};
  const fmt = v => RCA.story.fmt(v);

  /* ---------------- pembantu tampilan (juga dipakai analysis-custom.js) */
  const hbars = (items, max) => { max = max || Math.max(1, ...items.map(x => x[1])); return h('div', { class: 'hbars' }, items.map(([l, v, txt]) => h('div', { class: 'hbar' }, h('span', null, l), h('span', { class: 'track' }, h('i', { style: { width: (v / max * 100) + '%' } })), h('span', { class: 'v' }, txt !== undefined ? txt : v)))); };
  const tbl = (head, rows, opts) => h('div', { class: 'table-wrap' + ((opts && opts.wrapCls) ? ' ' + opts.wrapCls : '') }, h('table', { class: 't ' + ((opts && opts.cls) || '') }, h('thead', null, h('tr', null, head.map((x, i) => h('th', { class: i && (opts && opts.num) ? 'n' : '' }, x)))), h('tbody', null, rows.map(r => h('tr', null, r.map((v, i) => v && v.nodeType ? h('td', { class: i && (opts && opts.num) ? 'n' : '' }, v) : h('td', { class: i && (opts && opts.num) ? 'n' : '' }, v === undefined || v === null ? '' : v)))))));
  const nN = (n, N) => N ? n + '/' + N + ' (' + Math.round(n / N * 100) + '%)' : '–';
  const median = a => { const x = a.filter(v => v !== '' && !isNaN(v)).map(Number).sort((p, q) => p - q); if (!x.length) return '–'; const m = Math.floor(x.length / 2); return x.length % 2 ? x[m] : (x[m - 1] + x[m]) / 2; };
  RCA.anl = { hbars, tbl, nN, median };
  const kpis = list => h('div', { class: 'kpis' }, list.map(([l, v, s]) => h('div', { class: 'kpi' }, h('b', null, v), h('span', null, l), s ? h('small', { class: 'muted', style: { display: 'block' } }, s) : null)));
  const empty = f => h('div', { class: 'placeholder' }, 'Belum ada data ' + (filt._anl && filt._anl.dikirim ? 'Valid atau Dikirim' : 'Valid') + ' untuk ' + f + '. Data muncul di sini setelah koordinator menandai isian sebagai Valid.');
  const subLabel = sub => ((RCA.forms.subSchema(sub) || {}).title || sub).split('·')[0].trim();

  /* ================= panel kanan: penelusuran balik ================= */
  const PANEL = { el: null, body: null, title: null, layout: null };
  function panelInit(layout) {
    PANEL.layout = layout;
    PANEL.title = h('h2', { id: 'anlPanelTitle' });
    PANEL.sub = h('p', { class: 'muted small' });
    PANEL.body = h('div', { class: 'anl-panel-body' });
    PANEL.el = h('aside', { class: 'anl-panel', 'aria-labelledby': 'anlPanelTitle', hidden: true },
      h('div', { class: 'anl-panel-head' }, h('div', { class: 'grow' }, PANEL.title, PANEL.sub),
        h('button', { class: 'iconbtn', type: 'button', 'aria-label': 'Tutup panel', onclick: panelClose }, '✕')), PANEL.body);
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && PANEL.el && !PANEL.el.hidden && !document.querySelector('.modal-back')) panelClose(); });
    return PANEL.el;
  }
  function panelClose() {
    if (!PANEL.el) return; PANEL.el.hidden = true; PANEL.layout.classList.remove('with-panel');
    RCA.$$('.pick[aria-pressed="true"]').forEach(b => b.setAttribute('aria-pressed', 'false'));
  }
  /** tampilkan isi; items: elemen DOM. src = tombol yang diketuk (ditandai terpilih) */
  function panelShow(title, sub, content, src) {
    RCA.$$('.pick[aria-pressed="true"]').forEach(b => b.setAttribute('aria-pressed', 'false'));
    if (src) src.setAttribute('aria-pressed', 'true');
    PANEL.title.textContent = title; PANEL.sub.textContent = sub || '';
    PANEL.body.innerHTML = ''; PANEL.body.appendChild(content);
    PANEL.el.hidden = false; PANEL.layout.classList.add('with-panel'); PANEL.body.scrollTop = 0;
    if (window.matchMedia('(max-width: 1100px)').matches) PANEL.el.focus && PANEL.el.querySelector('.iconbtn').focus();
  }
  const noRaw = () => h('div', { class: 'notice' }, 'Data mentah per unit hanya dapat dibuka oleh Enumerator, Koordinator, dan Super Admin. Peran Pembaca melihat angka agregat.');

  /** batang yang dapat diketuk. items: [{label, n, txt, pick: () => [title, sub, node]}] */
  function pickBars(items, opts) {
    opts = opts || {};
    const max = opts.max || Math.max(1, ...items.map(x => x.n));
    if (!items.length) return h('p', { class: 'muted' }, opts.empty || 'Belum ada.');
    return h('div', { class: 'hbars pickable', role: 'list' }, items.map(it => {
      const b = h('button', { class: 'hbar pick', type: 'button', role: 'listitem', 'aria-pressed': 'false', disabled: !it.n, title: it.n ? 'Ketuk untuk melihat unit dan data mentah' : '',
        'aria-label': it.label + ': ' + (it.txt || it.n) + (it.n ? '. Tampilkan unit terkait.' : '') },
        h('span', { class: 'l' }, it.label), h('span', { class: 'track' }, h('i', { style: { width: (it.n / max * 100) + '%' } })), h('span', { class: 'v' }, it.txt !== undefined ? it.txt : it.n));
      b.addEventListener('click', () => { if (!it.n) return; const [t, s, node] = it.pick(); panelShow(t, s, node, b); });
      return b;
    }));
  }
  /** sel tabel yang dapat diketuk */
  function pickCell(text, fn, cls, title) {
    const b = h('button', { class: 'cellpick pick ' + (cls || ''), type: 'button', 'aria-pressed': 'false', title: title || 'Tampilkan unit terkait' }, text);
    b.addEventListener('click', () => { const [t, s, node] = fn(); panelShow(t, s, node, b); });
    return b;
  }

  /* ---------------- render cerita & data mentah */
  const chip = (t, cls, title) => h('span', { class: 'chip ' + (cls || ''), title: title || '' }, t);
  const jenisCls = j => /Tidak dilakukan|Terputus|Hasil buruk|Meninggal|Mutu kurang|Keterlambatan|Belum kembali/.test(j) ? 'bad' : /Terlambat|Tertunda|Tidak selesai|Tidak sempat|Pasien menolak/.test(j) ? 'warn' : /Masalah data|Tidak tercatat/.test(j) ? 'data' : 'unk';
  function storyCard(s, opts) {
    opts = opts || {};
    const hl = opts.highlight || (() => false);
    const link = RCA.can.raw() ? h('a', { class: 'btn small', href: '#/edit/' + s.form + '/' + s.sub + '/' + encodeURIComponent(s.unit) }, 'Buka formulir') : null;
    const head = h('div', { class: 'st-head' },
      h('div', { class: 'grow' }, h('b', null, s.unit), ' ', h('span', { class: 'muted small' }, [s.form === 'C6' ? 'Kasus kematian C6' : subLabel(s.sub), s.fac, s.kelompok, s.pasien ? 'pasien ' + s.pasien : '', s.profil].filter(Boolean).join(' · '))),
      h('span', { class: 'st st-' + (s.status || 'Belum') }, s.status || '–'), link);
    const body = h('div', { class: 'stack st-body' });
    body.appendChild(h('p', { class: 'st-ring' }, s.ringkas));
    // APA
    body.appendChild(h('h4', null, '1 · Apa yang terjadi'));
    body.appendChild(s.gaps.length ? h('ul', { class: 'gaps' }, s.gaps.map(g => h('li', { class: hl(g) ? 'hl' : '' }, chip(g.cp, 'cp'), chip(g.jenis, jenisCls(g.jenis)), h('b', null, g.langkah + ': '), g.teks, g.bukti ? h('small', { class: 'muted' }, ' · bukti ' + g.bukti) : null)))
      : h('p', { class: 'muted' }, 'Tidak ditemukan kesenjangan pada langkah yang dinilai.'));
    // MENGAPA
    body.appendChild(h('h4', null, '2 · Mengapa ini terjadi'));
    if (s.faktor.length) body.appendChild(h('div', { class: 'chips' }, s.faktor.map(f => chip(f.f, 'fk' + (f.asal.some(a => a !== 'kata kunci') ? ' firm' : ''), 'Asal: ' + f.asal.join(', ') + (f.asal.every(a => a === 'kata kunci') ? ' (otomatis, perlu dikonfirmasi)' : '')))));
    body.appendChild(s.why.length ? h('ul', { class: 'why' }, s.why.map(w => h('li', { class: 'w-' + w.jenis }, h('b', null, w.sumber + ': '), w.teks, w.st || w.src ? h('small', { class: 'muted' }, ' (' + [w.st ? 'St ' + w.st : '', w.src].filter(Boolean).join(' · ') + ')') : null)))
      : h('p', { class: 'notice warn' }, s.gaps.length ? 'Belum ada penjelasan tercatat. Unit ini perlu pendalaman (isi P22 "Mekanisme yang ditemukan penelaah").' : 'Tidak ada catatan penjelasan.'));
    // rantai sebab ringkas
    if (s.gaps.length) {
      const main = s.why.find(w => w.jenis === 'penelaah') || s.why.find(w => w.jenis === 'tercatat') || s.why.find(w => w.jenis === 'fasilitas' || w.jenis === 'kematian');
      body.appendChild(h('div', { class: 'chain', 'aria-label': 'Rantai sebab' },
        h('div', null, h('small', null, 'Kejadian'), s.gaps.slice(0, 3).map(g => h('div', null, g.langkah + ' · ' + g.jenis.toLowerCase()))),
        h('div', null, h('small', null, 'Penyebab langsung'), h('div', null, main ? main.teks.slice(0, 260) + (main.teks.length > 260 ? '…' : '') : 'Belum ditelusuri')),
        h('div', null, h('small', null, 'Faktor sistem/pasien'), s.faktor.length ? s.faktor.map(f => h('div', null, f.f)) : h('div', null, 'Belum diklasifikasi'))));
    }
    // linimasa
    if (s.timeline.length) {
      body.appendChild(h('h4', null, 'Linimasa'));
      body.appendChild(h('ol', { class: 'tline' }, s.timeline.map(t => h('li', null, h('span', { class: 'd' }, fmt(t.tgl)), h('span', { class: 'hx' }, t.hari === '' ? '' : (t.hari >= 0 ? 'H+' : 'H') + t.hari),
        h('span', null, t.label, (t.st || t.src) ? h('small', { class: 'muted' }, ' · ' + [t.kode, t.st ? 'St ' + t.st : '', t.src].filter(Boolean).join(' · ')) : null)))));
    }
    // data mentah
    if (RCA.can.raw()) {
      const raw = h('details', { class: 'rawbox', open: !!opts.rawOpen }, h('summary', null, h('b', null, 'Data mentah (rujukan asli)')));
      raw.addEventListener('toggle', () => { if (raw.open && raw.childNodes.length === 1) { if (s.form === 'C6') ['A', 'B', 'C', 'P'].forEach(k => { const r = (s.recs || {})[k]; if (r) raw.appendChild(rawRecord(r, 'C6' + k)); }); else raw.appendChild(rawRecord(s.rec, s.sub)); } });
      if (opts.rawOpen) raw.dispatchEvent(new Event('toggle'));
      body.appendChild(raw);
    }
    return h('details', { class: 'storycard', open: !!opts.open }, h('summary', null, head, s.gaps.length ? h('div', { class: 'chips' }, s.gaps.map(g => chip(g.cp + ' ' + g.jenis.toLowerCase(), jenisCls(g.jenis) + (hl(g) ? ' on' : '')))) : null), body);
  }
  function storyList(list, opts) {
    opts = opts || {};
    if (!RCA.can.raw()) return noRaw();
    const wrap = h('div', { class: 'stack' });
    if (opts.note) wrap.appendChild(h('p', { class: 'small muted' }, opts.note));
    list.forEach((s, i) => wrap.appendChild(storyCard(s, Object.assign({}, opts, { open: list.length === 1 || i === 0, rawOpen: list.length === 1 }))));
    return wrap;
  }
  /** seluruh isian satu rekaman, berlabel sesuai formulir, dengan St/Sumber */
  function rawRecord(rec, sub) {
    const d = (rec && rec.data) || {}, sch = RCA.forms.subSchema(sub);
    const wrap = h('div', { class: 'stack raw' }, h('p', { class: 'small muted' }, [sub, rec.unit, 'status ' + rec.status, rec.version ? 'versi ' + rec.version : '', rec.updated_name ? 'diubah ' + rec.updated_name : '', rec.updated_at ? RCA.fmtDT(rec.updated_at) : ''].filter(Boolean).join(' · ')));
    const val = v => Array.isArray(v) ? v.join('; ') : v;
    if (!sch) { wrap.appendChild(h('pre', null, JSON.stringify(d, null, 1))); return wrap; }
    sch.sections.forEach(sec => {
      if (sec.type === 'fields') {
        const rows = sec.fields.filter(f => f.t !== 'auto' && (RCA.calc.has(d[f.k]) || d[f.k + '__st'])).map(f => [f.k.length <= 4 ? f.k : '', f.l.replace(/^[A-Z]\d{2}b? /, ''), val(d[f.k]) || '', d[f.k + '__st'] || '', d[f.k + '__src'] || '']);
        if (rows.length) wrap.appendChild(h('div', null, h('h5', null, sec.title), tbl(['Kode', 'Isian', 'Nilai', 'St', 'Sumber'], rows, { cls: 'rawt', wrapCls: 'no-cards' })));
      } else if (sec.type === 'table') {
        const rows = d[sec.k] || []; if (!rows.length) return;
        const cols = sec.cols.filter(c => c.t !== 'auto' && rows.some(r => RCA.calc.has(r[c.k])));
        wrap.appendChild(h('div', null, h('h5', null, sec.title + ' (' + rows.length + ' baris)'), tbl(['#'].concat(cols.map(c => c.l)), rows.map((r, i) => [i + 1].concat(cols.map(c => val(r[c.k]) || ''))), { cls: 'rawt', wrapCls: 'no-cards' })));
      } else if (sec.type === 'matrix') {
        const m = d[sec.k] || {}; const rk = sec.rows.filter(r => m[r.k] && Object.values(m[r.k]).some(RCA.calc.has)); if (!rk.length) return;
        const cols = sec.cols.filter(c => c.t !== 'auto' && c.t !== 'ro' && rk.some(r => RCA.calc.has(m[r.k][c.k])));
        wrap.appendChild(h('div', null, h('h5', null, sec.title), tbl(['Baris'].concat(cols.map(c => c.l)), rk.map(r => [r.l].concat(cols.map(c => val(m[r.k][c.k]) || ''))), { cls: 'rawt', wrapCls: 'no-cards' })));
      }
    });
    if (RCA.migrateUI && d._lama) { const lp = RCA.migrateUI.legacyPanel({ data: d }); if (lp) wrap.appendChild(lp); }
    return wrap;
  }
  /** baris tabel/matriks mentah (C4, C5, C7, C1) */
  function rawRows(title, cols, rows, extra) {
    return h('div', { class: 'stack' }, extra || null, tbl(cols, rows, { cls: 'rawt', wrapCls: 'no-cards' }));
  }

  /* ================= halaman ================= */
  DB.analysis = async function (main) {
    main.innerHTML = '';
    const f = filt._anl = filt._anl || {};
    const canRaw = RCA.can.raw(), canSent = RCA.can.fill();
    main.appendChild(h('div', { class: 'page-head' }, h('div', { class: 'grow' }, h('h1', null, 'Dashboard Analisis'),
      h('p', null, 'Untuk setiap formulir: apa yang terjadi dan mengapa terjadi, sampai ke cerita tiap unit. Ketuk batang atau sel grafik untuk menampilkan unit terkait dan data mentahnya di panel kanan.')),
      h('div', { class: 'row no-print' }, h('button', { class: 'btn', onclick: () => window.print() }, 'Cetak'))));
    const box = h('div', null, h('p', { class: 'muted' }, 'Menghitung…')); main.appendChild(box);
    let D;
    const key = 'analysis' + (f.dikirim ? '+dikirim' : '');
    try { D = await RCA.api('analysis.data', { sertakanDikirim: !!(f.dikirim && canSent) }); RCA.idb.set('cache', key, D); }
    catch (e) { if (e.code === 'OFFLINE') D = await RCA.idb.get('cache', key); if (!D) { box.innerHTML = ''; box.appendChild(h('div', { class: 'notice err' }, e.message)); return; } }
    box.innerHTML = '';
    const provSel = h('select', { 'aria-label': 'Provinsi' }); provSel.appendChild(h('option', { value: '' }, 'Semua provinsi')); RCA.state.regions.prov.forEach(p => provSel.appendChild(h('option', { value: p.code, selected: f.prov === p.code }, p.name)));
    provSel.addEventListener('change', () => { f.prov = provSel.value; DB.analysis(main); });
    const facSel = h('select', { 'aria-label': 'Fasyankes' }); facSel.appendChild(h('option', { value: '' }, 'Semua fasyankes'));
    RCA.state.regions.fac.filter(x => !f.prov || RCA.reg.kk(x.kk).prov === f.prov).forEach(x => facSel.appendChild(h('option', { value: x.code, selected: f.fac === x.code }, x.code)));
    facSel.addEventListener('change', () => { f.fac = facSel.value; DB.analysis(main); });
    const dk = h('input', { type: 'checkbox', checked: !!f.dikirim }); dk.addEventListener('change', () => { f.dikirim = dk.checked; DB.analysis(main); });
    box.appendChild(h('div', { class: 'filters no-print' }, provSel, facSel, canSent ? h('label', { class: 'row' }, dk, h('span', null, 'Sertakan isian berstatus Dikirim (pratinjau, belum Valid)')) : null));
    if (f.dikirim && canSent) box.appendChild(h('div', { class: 'notice warn', style: { marginBottom: '10px' } }, 'Pratinjau: analisis memuat isian yang belum divalidasi koordinator. Untuk laporan, gunakan data Valid saja.'));
    const keep = r => (!f.prov || r.prov === f.prov) && (!f.fac || !r.fac || r.fac === f.fac || r.unit === f.fac);
    const V = {}; Object.keys(D).forEach(fm => { if (fm === 'C2') return; V[fm] = {}; Object.keys(D[fm]).forEach(s => { V[fm][s] = D[fm][s].filter(keep); }); });
    const ctx = { V, D, f, canRaw, stories: null, c6: null };
    ctx.getStories = () => ctx.stories || (ctx.stories = RCA.story.build(V));
    ctx.getC6 = () => ctx.c6 || (ctx.c6 = RCA.story.buildC6(V, (D.C2 && D.C2.calon) || []));
    const sections = [['C2', 'Ringkasan sampel (C2)', () => anlC2(D.C2, f)], ['C1', 'C1 Profil dan pendalaman', () => anlC1(ctx)], ['C3', 'C3 Telaah catatan pelayanan', () => anlC3(ctx)],
      ['C4', 'C4 Penilaian fasilitas dan 14 CP', () => anlC4(ctx)], ['C5', 'C5 Verifikasi data sentinel', () => anlC5(ctx)], ['C6', 'C6 Telaah kematian', () => anlC6(ctx)],
      ['C7', 'C7 Wawancara dan diskusi', () => anlC7(ctx)], ['Lintas formulir', 'Keterkaitan antarformulir per fasyankes', () => anlCross(V, D.C2, f)]];
    const nav = h('div', { class: 'tabs no-print', role: 'tablist' });
    if (f.sec === undefined) f.sec = 2;
    sections.forEach(([t], i) => nav.appendChild(h('button', { role: 'tab', 'aria-selected': f.sec === i ? 'true' : 'false', onclick: () => { f.sec = i; DB.analysis(main); } }, t)));
    nav.appendChild(h('button', { role: 'tab', 'aria-selected': f.sec === 'x' ? 'true' : 'false', onclick: () => { f.sec = 'x'; DB.analysis(main); } }, 'Analisis tambahan'));
    box.appendChild(nav);
    const layout = h('div', { class: 'anl-layout' });
    const left = h('div', { class: 'anl-main' });
    layout.appendChild(left); layout.appendChild(panelInit(layout));
    box.appendChild(layout);
    if (f.sec === 'x') { left.appendChild(custom(V, D)); return; }
    const [, title, fn] = sections[f.sec] || sections[2];
    const sec = h('section', { class: 'anl' }, h('h2', null, title));
    try { sec.appendChild(fn()); } catch (e) { console.error(e); sec.appendChild(h('div', { class: 'notice err' }, 'Gagal menghitung: ' + e.message)); }
    left.appendChild(sec);
  };

  /* ================= C2 ================= */
  function anlC2(c2, f) {
    const sel = (c2.selected || []).filter(s => (!f.prov || RCA.reg.kk(s.kk).prov === f.prov) && (!f.fac || s.fac === f.fac));
    const wrap = h('div', { class: 'stack' });
    const facs = RCA.state.regions.fac.filter(x => (!f.prov || RCA.reg.kk(x.kk).prov === f.prov) && (!f.fac || x.code === f.fac));
    const rows = facs.map(fc => {
      const s = sel.filter(x => x.fac === fc.code);
      const c = fr => { const a = s.filter(x => x.frame === fr); return a.length + ' (' + a.filter(x => /acak|sensus/i.test(x.pilihan)).length + 'a/' + a.filter(x => /purposif/i.test(x.pilihan)).length + 'p)'; };
      return [fc.code, c('A'), c('B'), c('CP3'), s.length + '/18', s.filter(x => x.telaah === 'Selesai').length, s.filter(x => x.telaah === 'Tidak berhasil').length, new Set(s.map(x => x.pid)).size];
    });
    wrap.appendChild(h('p', null, 'Terpilih per kerangka: jumlah (acak/sensus a, purposif p). Target inti 6 per kerangka (3 acak + 3 purposif), 18 per fasyankes. Unit ≠ dokumen ≠ pasien unik.'));
    wrap.appendChild(kpis([['Unit terpilih', sel.length], ['Target inti', facs.length * 18], ['Pasien unik', new Set(sel.map(x => x.pid)).size], ['Telaah selesai (C2b)', sel.filter(x => x.telaah === 'Selesai').length], ['Tidak berhasil', sel.filter(x => x.telaah === 'Tidak berhasil').length]]));
    wrap.appendChild(tbl(['Fasyankes', 'A', 'B', 'CP3', 'Total/target', 'Selesai', 'Tidak berhasil', 'Pasien unik'], rows, { num: true }));
    return wrap;
  }

  /* ================= C3: apa & mengapa per unit ================= */
  const STEPS = { A: ['Status HIV', 'Mulai OAT', 'Mulai ARV', 'ARV berlanjut', 'Luaran TB', 'Retensi HIV', 'Kesinambungan HIV', 'Rujukan', 'Penelusuran', 'Data'],
    B: ['Skrining TB', 'Diagnostik TB', 'Kelayakan TPT', 'Mulai TPT', 'Luaran TPT', 'Kesinambungan HIV', 'Rujukan', 'Penelusuran', 'Data'], CP3: ['Tes HIV', 'Pencatatan status HIV'] };
  const FRN = { A: 'Unit A · episode TB-HIV', B: 'Unit B · riwayat ARV dan TPT', CP3: 'CP3 · penetapan status HIV' };
  const grp = list => { const a = list.filter(s => s.kelompok !== 'Purposif').length; return list.length + ' unit (' + a + ' acak/sensus · ' + (list.length - a) + ' purposif)'; };
  const ap = L => L.length ? L.length + ' (' + L.filter(s => s.kelompok !== 'Purposif').length + 'a/' + L.filter(s => s.kelompok === 'Purposif').length + 'p)' : '0';
  function anlC3(ctx) {
    const all = ctx.getStories();
    if (!all.length) return empty('C3');
    const wrap = h('div', { class: 'stack' });
    const withGap = all.filter(s => s.gaps.length), explained = withGap.filter(s => s.why.some(w => w.jenis === 'penelaah' || w.jenis === 'tercatat'));
    wrap.appendChild(kpis([['Unit ditelaah', all.length, all.filter(s => s.frame === 'A').length + ' A · ' + all.filter(s => s.frame === 'B').length + ' B · ' + all.filter(s => s.frame === 'CP3').length + ' CP3'],
      ['Unit dengan titik putus', withGap.length, grp(withGap).replace(/^\d+ unit /, '')], ['Titik putus tercatat', withGap.reduce((a, s) => a + s.gaps.length, 0)],
      ['Sudah dijelaskan penelaah', nN(explained.length, withGap.length)], ['Perlu pendalaman', withGap.length - explained.length, 'kesenjangan tanpa penjelasan']]));
    wrap.appendChild(h('p', { class: 'small muted' }, 'Angka menggambarkan pola dalam sampel. Unit acak/sensus dan purposif dihitung bersama di grafik, tetapi jumlah masing-masing ditampilkan di tiap batang. Kesenjangan memakai aturan yang sama dengan formulir C3 dan rekap CP.'));

    // ---------- 1. APA YANG TERJADI
    wrap.appendChild(h('h3', { class: 'q' }, h('span', null, '1'), 'Apa yang terjadi: di mana pelayanan terputus'));
    const show = (title, list, sub, hl) => () => [title, grp(list) + (sub ? ' · ' + sub : ''), storyList(list, { highlight: hl })];
    wrap.appendChild(h('p', { class: 'small muted' }, 'Angka di kanan: jumlah unit (a = acak/sensus, p = purposif). Ketiga grafik kerangka memakai skala yang sama.'));
    const maxStep = Math.max(1, ...['A', 'B', 'CP3'].flatMap(fr => STEPS[fr].map(st => all.filter(s => s.frame === fr && s.gaps.some(g => g.langkah === st)).length)));
    ['A', 'B', 'CP3'].forEach(fr => {
      const U = all.filter(s => s.frame === fr); if (!U.length) return;
      wrap.appendChild(h('h4', null, FRN[fr] + ' · ' + U.length + ' unit'));
      wrap.appendChild(pickBars(STEPS[fr].map(st => { const L = U.filter(s => s.gaps.some(g => g.langkah === st)); return { label: st, n: L.length, txt: ap(L), pick: show(FRN[fr] + ' · ' + st, L, '', g => g.langkah === st) }; }), { empty: 'Tidak ada titik putus.', max: maxStep }));
    });
    const JENIS = ['Tidak dilakukan', 'Terlambat', 'Tidak tercatat', 'Masalah data', 'Belum dapat dipastikan', 'Terputus', 'Hasil buruk', 'Meninggal', 'Pasien menolak', 'Tertunda', 'Tidak selesai', 'Tidak sempat', 'Belum kembali'];
    wrap.appendChild(h('h4', null, 'Jenis kesenjangan'));
    wrap.appendChild(h('p', { class: 'small muted' }, '"Tidak dilakukan" = ada bukti pelayanan tidak diberikan (St TL); "Tidak tercatat" = tidak ditemukan keterangan setelah penelusuran (St TC), bisa masalah pencatatan; "Masalah data" = sistem berbeda dari sumber.'));
    wrap.appendChild(pickBars(JENIS.map(j => { const L = all.filter(s => s.gaps.some(g => g.jenis === j)); return { label: j, n: L.length, txt: ap(L), pick: show('Jenis kesenjangan · ' + j, L, '', g => g.jenis === j) }; }).filter(x => x.n)));

    // rekap CP dengan sel yang dapat diketuk
    const A = (ctx.V.C3 && ctx.V.C3.C3A || []).map(r => Object.assign({ _fac: r.fac }, r.data)), B = (ctx.V.C3 && ctx.V.C3.C3B || []).map(r => Object.assign({ _fac: r.fac }, r.data)), Cc = (ctx.V.C3 && ctx.V.C3.C3CP3 || []).map(r => Object.assign({ _fac: r.fac }, r.data));
    const rk = RCA.c3Rekap(A, B, Cc);
    const CPS = ['CP2', 'CP3', 'CP4', 'CP5', 'CP6', 'CP7', 'CP8', 'CP9', 'CP10', 'CP11', 'CP12', 'CP13', 'CP14', 'R6'];
    wrap.appendChild(h('h4', null, 'Rekap CP (n kesenjangan / N dapat dinilai) · ketuk angka untuk melihat unit'));
    wrap.appendChild(tbl(['CP', 'Acak/sensus', 'Purposif', 'BD/belum cukup', 'Unit dengan titik putus di CP ini'], CPS.map(cp => {
      const o = rk[cp] || { acak_n: 0, acak_N: 0, purp_n: 0, purp_N: 0, bd: 0 };
      const L = all.filter(s => s.gaps.some(g => g.cp === cp));
      return [cp, nN(o.acak_n, o.acak_N), nN(o.purp_n, o.purp_N), o.bd, L.length ? pickCell(grp(L), show(cp + ' · unit dengan titik putus', L, '', g => g.cp === cp)) : '–'];
    }).filter(r => r[4] !== '–' || r[1] !== '–'), { num: true }));

    // fasyankes × langkah
    const facs = [...new Set(all.map(s => s.fac))].sort();
    const steps = [...new Set([].concat(STEPS.A, STEPS.B, STEPS.CP3))].filter(st => all.some(s => s.gaps.some(g => g.langkah === st)));
    if (facs.length && steps.length) {
      wrap.appendChild(h('h4', null, 'Titik putus per fasyankes (jumlah unit)'));
      const mx = Math.max(1, ...facs.flatMap(fc => steps.map(st => all.filter(s => s.fac === fc && s.gaps.some(g => g.langkah === st)).length)));
      wrap.appendChild(h('div', { class: 'table-wrap no-cards' }, h('table', { class: 't heat' }, h('thead', null, h('tr', null, h('th', null, 'Fasyankes'), steps.map(st => h('th', null, st)))),
        h('tbody', null, facs.map(fc => h('tr', null, h('th', null, fc), steps.map(st => { const L = all.filter(s => s.fac === fc && s.gaps.some(g => g.langkah === st));
          return h('td', { class: 'c', style: L.length ? { background: 'color-mix(in srgb, var(--s-kembali) ' + Math.round(12 + L.length / mx * 48) + '%, var(--surface))' } : null }, L.length ? pickCell(String(L.length), show(fc + ' · ' + st, L, '', g => g.langkah === st), 'num') : ''); })))))));
    }
    // selang waktu: klik → unit beserta nilainya
    const iv = [['Terduga TB → diagnosis TB', 'A', RCA.AUTO.hari_terduga_dx, null], ['Diagnosis TB → mulai OAT', 'A', RCA.AUTO.hari_dx_oat, null], ['Mulai OAT → mulai ARV', 'A', RCA.AUTO.hari_oat_arv, 14],
      ['Mulai ARV → skrining TB', 'B', RCA.AUTO.hari_arv_skr, null], ['Kelayakan → mulai TPT', 'B', RCA.AUTO.hari_layak_tpt, 30], ['Diagnosis TB → tes HIV (CP3)', 'CP3', RCA.AUTO.hari_dx_tes, 14]];
    wrap.appendChild(h('h4', null, 'Selang waktu (hari) · ketuk untuk melihat unit, diurutkan dari yang terlama'));
    wrap.appendChild(tbl(['Selang', 'Median', 'Terlama', 'n', 'Unit'], iv.map(([l, fr, fn, lim]) => {
      const L = all.filter(s => s.frame === fr).map(s => ({ s, x: fn(s.rec.data) })).filter(o => o.x !== '').sort((a, b) => b.x - a.x);
      return [l + (lim ? ' (batas ' + lim + ')' : ''), median(L.map(o => o.x)), L.length ? L[0].x : '–', L.length,
        L.length ? pickCell('Lihat ' + L.length, () => [l, L.map(o => o.s.unit + ': ' + o.x + ' hari').slice(0, 6).join(' · ') + (L.length > 6 ? ' …' : ''), storyList(L.map(o => o.s), { note: 'Urutan: selang terlama di atas. ' + L.map(o => o.s.unit + ' ' + o.x + ' h').join(', ') })]) : '–'];
    }), { num: true }));

    // ---------- 2. MENGAPA
    wrap.appendChild(h('h3', { class: 'q' }, h('span', null, '2'), 'Mengapa ini terjadi'));
    wrap.appendChild(h('p', { class: 'small muted' }, 'Faktor berasal dari (a) penilaian fasilitas C4 untuk CP yang sama di fasyankes itu, (b) penilaian klinis C6 bila pasien juga kasus kematian, dan (c) klasifikasi kata kunci otomatis dari penjelasan penelaah dan alasan tercatat. Faktor yang hanya berasal dari kata kunci ditandai sebagai perlu dikonfirmasi; buka unit untuk membaca teks aslinya.'));
    const FK = RCA.story.FAKTOR;
    wrap.appendChild(pickBars(FK.map(fk => { const L = withGap.filter(s => s.faktor.some(x => x.f === fk)); const firm = L.filter(s => s.faktor.some(x => x.f === fk && x.asal.some(a => a !== 'kata kunci'))).length;
      return { label: fk, n: L.length, txt: L.length ? L.length + ' · ' + firm + ' dinilai' : '0', pick: show('Faktor · ' + fk, L, firm + ' unit dengan faktor dari penilai C4/C6 atau aturan; sisanya dari kata kunci') }; })));
    wrap.appendChild(h('p', { class: 'small muted' }, 'Angka di kanan: jumlah unit · di antaranya yang faktornya ditetapkan penilai (C4/C6) atau aturan ketidaksesuaian sistem–sumber; sisanya dari kata kunci dan perlu dikonfirmasi.'));
    // matriks langkah × faktor
    const fUsed = FK.filter(fk => withGap.some(s => s.faktor.some(x => x.f === fk)));
    if (steps.length && fUsed.length) {
      wrap.appendChild(h('h4', null, 'Titik putus × faktor penyebab (jumlah unit) · ketuk sel'));
      const mx2 = Math.max(1, ...steps.flatMap(st => fUsed.map(fk => withGap.filter(s => s.gaps.some(g => g.langkah === st) && s.faktor.some(x => x.f === fk)).length)));
      wrap.appendChild(h('div', { class: 'table-wrap no-cards' }, h('table', { class: 't heat' }, h('thead', null, h('tr', null, h('th', null, 'Titik putus'), fUsed.map(fk => h('th', { title: fk }, fk.split(' ')[0] === 'Faktor' ? 'Pasien' : fk.split(' ')[0] === 'Keparahan' ? 'Keparahan' : fk.split(' ')[0])))),
        h('tbody', null, steps.map(st => h('tr', null, h('th', null, st), fUsed.map(fk => { const L = withGap.filter(s => s.gaps.some(g => g.langkah === st) && s.faktor.some(x => x.f === fk));
          return h('td', { class: 'c', style: L.length ? { background: 'color-mix(in srgb, var(--primary) ' + Math.round(10 + L.length / mx2 * 45) + '%, var(--surface))' } : null }, L.length ? pickCell(String(L.length), show(st + ' × ' + fk, L, '', g => g.langkah === st), 'num') : ''); })))))));
      wrap.appendChild(h('p', { class: 'small muted' }, 'Kolom: F1 pelayanan · F2 tenaga · F3 sistem informasi · F4 diagnostik · F5 obat · F6 pembiayaan · F7 tata kelola · Pasien/komunitas · Keparahan penyakit.'));
    }
    const noWhy = withGap.filter(s => !explained.includes(s));
    wrap.appendChild(h('h4', null, 'Penjelasan yang belum ada'));
    wrap.appendChild(pickBars([{ label: 'Titik putus tanpa penjelasan penelaah/alasan tercatat', n: noWhy.length, txt: ap(noWhy), pick: show('Perlu pendalaman', noWhy, 'isi P22 "Mekanisme yang ditemukan penelaah"') }]));

    // ---------- 3. CERITA PER UNIT
    wrap.appendChild(h('h3', { class: 'q' }, h('span', null, '3'), 'Cerita setiap unit (pasien)'));
    wrap.appendChild(unitBrowser(all));
    return wrap;
  }
  /** daftar cerita dengan filter; ketuk → panel */
  function unitBrowser(all, opts) {
    opts = opts || {};
    const f = filt._anlU = filt._anlU || {};
    const box = h('div', { class: 'stack' });
    if (!RCA.can.raw()) { box.appendChild(noRaw()); return box; }
    const q = h('input', { type: 'search', placeholder: 'Cari kode unit, pasien, atau kata dalam cerita', value: f.q || '' });
    const fr = h('select', { 'aria-label': 'Kerangka' }); [['', 'Semua kerangka'], ['A', 'Unit A'], ['B', 'Unit B'], ['CP3', 'CP3'], ['C6', 'Kasus C6']].filter(([v]) => !v || all.some(s => s.frame === v)).forEach(([v, l]) => fr.appendChild(h('option', { value: v, selected: f.fr === v }, l)));
    const kel = h('select', { 'aria-label': 'Kelompok' }); [['', 'Acak dan purposif'], ['Acak/sensus', 'Acak/sensus'], ['Purposif', 'Purposif']].forEach(([v, l]) => kel.appendChild(h('option', { value: v, selected: f.kel === v }, l)));
    const gap = h('select', { 'aria-label': 'Kesenjangan' }); [['', 'Semua unit'], ['ya', 'Ada titik putus'], ['tidak', 'Tanpa titik putus'], ['nowhy', 'Titik putus tanpa penjelasan']].forEach(([v, l]) => gap.appendChild(h('option', { value: v, selected: f.gap === v }, l)));
    const list = h('div', { class: 'storylist' });
    const draw = () => {
      f.q = q.value; f.fr = fr.value; f.kel = kel.value; f.gap = gap.value;
      const t = f.q.trim().toLowerCase();
      const L = all.filter(s => (!f.fr || s.frame === f.fr) && (!f.kel || s.kelompok === f.kel || (f.kel === 'Acak/sensus' && s.kelompok !== 'Purposif')) &&
        (!f.gap || (f.gap === 'ya' ? s.gaps.length : f.gap === 'tidak' ? !s.gaps.length : s.gaps.length && !s.why.some(w => w.jenis === 'penelaah' || w.jenis === 'tercatat'))) &&
        (!t || [s.unit, s.pasien, s.ringkas, s.why.map(w => w.teks).join(' ')].join(' ').toLowerCase().includes(t)));
      list.innerHTML = '';
      list.appendChild(h('p', { class: 'small muted' }, L.length + ' dari ' + all.length + ' unit'));
      L.slice(0, 300).forEach(s => {
        const b = h('button', { class: 'storyrow pick', type: 'button', 'aria-pressed': 'false' },
          h('div', { class: 'sr-h' }, h('b', null, s.unit), h('span', { class: 'muted small' }, ' ' + [s.form === 'C6' ? 'C6' : subLabel(s.sub), s.fac, s.kelompok].join(' · ')), h('span', { class: 'st st-' + (s.status || 'Belum') }, s.status)),
          h('p', null, s.ringkas.length > 260 ? s.ringkas.slice(0, 259) + '…' : s.ringkas),
          s.gaps.length ? h('div', { class: 'chips' }, s.gaps.map(g => chip(g.cp + ' ' + g.jenis.toLowerCase(), jenisCls(g.jenis))), s.faktor.slice(0, 4).map(x => chip(x.f.replace(/ .*/, '') === 'Faktor' ? 'Pasien' : x.f.split(' ')[0], 'fk' + (x.asal.some(a => a !== 'kata kunci') ? ' firm' : ''), x.f))) : null);
        b.addEventListener('click', () => panelShow(s.unit, [s.form === 'C6' ? 'Kasus kematian' : subLabel(s.sub), s.fac, s.kelompok].join(' · '), storyList([s]), b));
        list.appendChild(b);
      });
    };
    [q, fr, kel, gap].forEach(x => x.addEventListener(x === q ? 'input' : 'change', draw));
    box.appendChild(h('div', { class: 'filters' }, q, fr, kel, gap));
    box.appendChild(list); draw();
    return box;
  }

  /* ================= C4 ================= */
  function anlC4(ctx) {
    const recs = (ctx.V.C4 && ctx.V.C4.C4) || [];
    if (!recs.length) return empty('C4');
    const sec = S.forms.C4.sub[0].sections.find(s => s.id === 'matriks_cp'); const CPS = sec.rows.map(r => r.k);
    const cls = v => /terverifikasi/i.test(v) ? 'c-ok' : /sebagian/i.test(v) ? 'c-part' : /tidak terlaksana/i.test(v) ? 'c-no' : /Tidak berlaku/.test(v) ? 'c-na' : v ? 'c-unk' : '';
    const abbr = v => /terverifikasi/i.test(v) ? 'Ya' : /sebagian/i.test(v) ? 'Seb' : /tidak terlaksana/i.test(v) ? 'Tdk' : /Tidak berlaku/.test(v) ? 'TBL' : /Belum/.test(v) ? '?' : '·';
    const all = ctx.getStories();
    const cols = sec.cols.filter(c => c.t !== 'auto');
    const cpDetail = (r, cp) => () => {
      const row = (r.data.matriks_cp || {})[cp] || {}; const rl = sec.rows.find(x => x.k === cp);
      const L = all.filter(s => s.fac === r.unit && s.gaps.some(g => g.cp === cp));
      const node = h('div', { class: 'stack' },
        h('h4', null, 'Isian matriks CP (data mentah C4)'),
        tbl(['Isian', 'Nilai'], cols.filter(c => RCA.calc.has(row[c.k]) || c.t === 'ro').map(c => [c.l, c.t === 'ro' ? ((rl.v || {})[c.k] || '') : (Array.isArray(row[c.k]) ? row[c.k].join('; ') : row[c.k])]).filter(x => RCA.calc.has(x[1])), { cls: 'rawt', wrapCls: 'no-cards' }),
        RCA.can.raw() ? h('a', { class: 'btn small', href: '#/edit/C4/C4/' + encodeURIComponent(r.unit) }, 'Buka formulir C4 ' + r.unit) : null,
        h('h4', null, 'Unit C3 di fasyankes ini dengan titik putus ' + cp + ' (' + L.length + ')'),
        L.length ? storyList(L, { highlight: g => g.cp === cp }) : h('p', { class: 'muted' }, 'Tidak ada unit C3 (dalam data yang dianalisis) dengan titik putus ' + cp + ' di ' + r.unit + '.'));
      return [r.unit + ' · ' + cp, (row.klasifikasi || 'belum diklasifikasi') + ' · ' + (rl ? rl.l : ''), node];
    };
    const wrap = h('div', { class: 'stack' });
    wrap.appendChild(h('h3', { class: 'q' }, h('span', null, '1'), 'Apa yang terjadi: klasifikasi 14 CP per fasyankes'));
    wrap.appendChild(h('div', { class: 'legend' }, [['c-ok', 'Terlaksana dan terverifikasi'], ['c-part', 'Sebagian atau terlambat'], ['c-no', 'Dipastikan tidak terlaksana'], ['c-unk', 'Belum dapat dipastikan']].map(([c, l]) => h('span', null, h('i', { class: c }), l))));
    wrap.appendChild(h('p', { class: 'small muted' }, 'Ketuk sel untuk melihat isian matriks CP (bukti M1–M3, masalah, dugaan, faktor) dan unit C3 di fasyankes itu yang terputus pada CP yang sama.'));
    wrap.appendChild(h('div', { class: 'table-wrap no-cards' }, h('table', { class: 't heat' }, h('thead', null, h('tr', null, h('th', null, 'Fasyankes'), CPS.map(c => h('th', null, c)))),
      h('tbody', null, recs.map(r => { const m = r.data.matriks_cp || {}; return h('tr', null, h('th', null, r.unit), CPS.map(c => { const v = (m[c] || {}).klasifikasi || ''; return h('td', { class: 'c ' + cls(v), title: v }, pickCell(abbr(v), cpDetail(r, c), 'num', c + ': ' + (v || 'belum diklasifikasi'))); })); })))));
    const gapsBy = {}; recs.forEach(r => Object.entries(r.data.matriks_cp || {}).forEach(([cp, row]) => { if (/sebagian|tidak terlaksana/i.test(row.klasifikasi || '')) (gapsBy[cp] = gapsBy[cp] || []).push({ r, cp, row }); }));
    wrap.appendChild(h('h4', null, 'CP dengan kesenjangan (jumlah fasyankes)'));
    const listCP = (items, title) => () => [title, items.length + ' fasyankes', h('div', { class: 'stack' }, items.map(({ r, cp }) => { const [t, s, node] = cpDetail(r, cp)(); return h('details', { class: 'storycard', open: items.length === 1 }, h('summary', null, h('b', null, t), ' ', h('span', { class: 'muted small' }, s)), node); }))];
    wrap.appendChild(pickBars(CPS.map(cp => ({ label: cp + ' ' + (sec.rows.find(x => x.k === cp).l.replace(/^\S+ /, '')), n: (gapsBy[cp] || []).length, pick: listCP(gapsBy[cp] || [], cp + ' · fasyankes dengan kesenjangan') })).filter(x => x.n)));
    wrap.appendChild(h('h3', { class: 'q' }, h('span', null, '2'), 'Mengapa: faktor sistem yang dikaitkan penilai'));
    const fk = {}; recs.forEach(r => Object.entries(r.data.matriks_cp || {}).forEach(([cp, row]) => (row.faktor || []).forEach(x => { (fk[x] = fk[x] || []).push({ r, cp, row }); })));
    wrap.appendChild(pickBars(RCA.story.FAKTOR.slice(0, 7).map(x => ({ label: x, n: (fk[x] || []).length, txt: (fk[x] || []).length + ' CP', pick: listCP(fk[x] || [], 'Faktor · ' + x) })), { empty: 'Belum ada faktor sistem diisi di matriks CP.' }));
    const dug = []; recs.forEach(r => (r.data.dugaan || []).forEach(x => dug.push([r.unit, x.dugaan_penyebab_awal || '', x.cp_terkait || '', x.hasil_akhir || '', x.bukti_penentu || ''])));
    if (dug.length) { wrap.appendChild(h('h4', null, 'Uji dugaan penyebab dari C1')); const by = {}; dug.forEach(x => { const k = x[3] || 'Belum diuji'; (by[k] = by[k] || []).push(x); });
      wrap.appendChild(pickBars(Object.keys(by).map(k => ({ label: k, n: by[k].length, pick: () => ['Dugaan C1 · ' + k, by[k].length + ' dugaan', rawRows('', ['Fasyankes', 'Dugaan', 'CP', 'Hasil', 'Bukti penentu'], by[k])] })))); }
    return wrap;
  }

  /* ================= C5 ================= */
  function anlC5(ctx) {
    const V = ctx.V; if (!V.C5) return empty('C5');
    const ids = {}; (V.C5.C5ID || []).forEach(r => { ids[r.unit] = r.data; });
    const rows = [], byStatus = {}, byJenis = {};
    const IND = [['5', 'C5_5', 'TB/HIV-5'], ['6', 'C5_6', 'TB/HIV-6'], ['41a', 'C5_41a', 'TB/HIV-4.1a']];
    IND.forEach(([ind, sub, name]) => (V.C5[sub] || []).forEach(r => {
      const id = ids[r.unit] || {}; const c = RCA.c5.ctx(ind, id); const cocok = r.data.cocok || []; const rc = RCA.c5.recap(cocok, c, id); const calc = RCA.c5.rows(cocok, c);
      rows.push([r.unit, name, c.met || '–', c.model || '–', rc.rows, rc.D_sis + '/' + rc.N_sis, rc.D_src + '/' + rc.N_src, rc.FV_D ? rc.FV_D.toFixed(2) : '–', rc.FV_N ? rc.FV_N.toFixed(2) : '–', rc.alasan || 'Sah']);
      cocok.forEach((x, i) => { const k = name + ' · ' + calc[i].status; (byStatus[k] = byStatus[k] || []).push({ r, sub, x, o: calc[i], name }); if (x.jenis) { const j = name + ' · ' + x.jenis; (byJenis[j] = byJenis[j] || []).push({ r, sub, x, o: calc[i], name }); } });
    }));
    if (!rows.length) return empty('C5');
    const all = ctx.getStories();
    const sch = sub => RCA.forms.subSchema(sub).sections.find(s => s.id === 'cocok').cols.filter(c => c.t !== 'auto');
    const detail = (title, items) => () => {
      const sub = items[0].sub, cols = sch(sub).filter(c => items.some(it => RCA.calc.has(it.x[c.k])));
      const linked = all.filter(s => items.some(it => it.x.kode_unit_c3 === s.unit));
      return [title, items.length + ' baris pencocokan', h('div', { class: 'stack' },
        h('p', { class: 'small muted' }, 'Data mentah baris pencocokan (sistem vs sumber) dengan hitungan otomatis D/N.'),
        tbl(['Sentinel', 'D/N sistem', 'D/N sumber'].concat(cols.map(c => c.l)), items.map(it => [it.r.unit, it.o.D_sis + '/' + it.o.N_sis, (it.o.D_src === '' ? '–' : it.o.D_src) + '/' + (it.o.N_src === '' ? '–' : it.o.N_src)].concat(cols.map(c => Array.isArray(it.x[c.k]) ? it.x[c.k].join('; ') : (it.x[c.k] || '')))), { cls: 'rawt', wrapCls: 'no-cards' }),
        RCA.can.raw() ? h('div', { class: 'row' }, [...new Set(items.map(it => it.r.unit + '|' + it.sub))].map(k => { const [u, s] = k.split('|'); return h('a', { class: 'btn small', href: '#/edit/C5/' + s + '/' + encodeURIComponent(u) }, 'Buka ' + s + ' ' + u); })) : null,
        linked.length ? h('h4', null, 'Unit C3 yang sama (' + linked.length + ')') : null, linked.length ? storyList(linked) : null)];
    };
    const wrap = h('div', { class: 'stack' });
    wrap.appendChild(h('h3', { class: 'q' }, h('span', null, '1'), 'Apa yang terjadi: kecocokan data sistem dengan sumber'));
    wrap.appendChild(h('p', { class: 'muted small' }, 'FV = hitung ulang ÷ dilaporkan; batas 0,90–1,10; hanya untuk model A, sensus periode efektif, dan seluruh sumber selesai diperiksa.'));
    wrap.appendChild(tbl(['Sentinel', 'Indikator', 'Metode', 'Model', 'Baris', 'D/N sistem', 'D/N sumber', 'FV penyebut', 'FV pembilang', 'Kesahihan'], rows, { num: true }));
    wrap.appendChild(h('h4', null, 'Status pencocokan per indikator · ketuk untuk baris mentah'));
    wrap.appendChild(pickBars(Object.keys(byStatus).sort().map(k => ({ label: k, n: byStatus[k].length, pick: detail(k, byStatus[k]) }))));
    wrap.appendChild(h('h3', { class: 'q' }, h('span', null, '2'), 'Mengapa: jenis ketidaksesuaian yang ditetapkan'));
    wrap.appendChild(pickBars(Object.keys(byJenis).sort().map(k => ({ label: k, n: byJenis[k].length, pick: detail(k, byJenis[k]) })), { empty: 'Belum ada jenis ketidaksesuaian yang ditetapkan.' }));
    return wrap;
  }

  /* ================= C6 ================= */
  function anlC6(ctx) {
    const cases = ctx.getC6();
    if (!cases.length) return empty('C6');
    const wrap = h('div', { class: 'stack' });
    const B = cases.filter(s => s.recs.B), withLow = cases.filter(s => s.gaps.some(g => /^T\d/.test(g.cp)));
    wrap.appendChild(h('p', { class: 'muted small' }, 'Sampel purposif; tidak dipakai untuk menghitung angka mortalitas atau proporsi kematian yang dapat dicegah.'));
    wrap.appendChild(kpis([['Kasus dianalisis', cases.length], ['Penilaian pertama', B.length], ['Fase bermutu kurang', withLow.length, 'kasus dengan skor 1–2'],
      ['Peluang perbaikan (P1 = Ya)', B.filter(s => ((s.recs.B || {}).data || {}).peluang === 'Ya').length], ['Dibahas panel', cases.filter(s => s.recs.P).length]]));
    const show = (t, L, hl) => () => [t, L.length + ' kasus', storyList(L, { highlight: hl })];
    wrap.appendChild(h('h3', { class: 'q' }, h('span', null, '1'), 'Apa yang terjadi'));
    wrap.appendChild(h('h4', null, 'Waktu kematian sejak mulai OAT'));
    wrap.appendChild(pickBars(['Sebelum OAT', '0–14 hari', '15–30 hari', '31–90 hari', '91–180 hari', 'Lebih dari 180 hari', 'Waktu OAT tidak diketahui', 'Tanggal tidak diketahui'].map(k => { const L = cases.filter(s => s.kategori === k); return { label: k, n: L.length, pick: show('Kematian · ' + k, L, g => g.cp === 'CP13') }; })));
    wrap.appendChild(h('h4', null, 'Fase dengan mutu kurang (skor 1–2, penilaian pertama)'));
    const FASE = { T1: 'T1 Akses dan diagnosis', T2: 'T2 Awal terapi', T3: 'T3 Pemantauan', T4: 'T4 Rujukan', T5: 'T5 Penanganan saat memburuk' };
    wrap.appendChild(pickBars(Object.keys(FASE).map(t => { const L = cases.filter(s => s.gaps.some(g => g.cp === t)); return { label: FASE[t], n: L.length, pick: show(FASE[t] + ' · mutu kurang', L, g => g.cp === t) }; })));
    wrap.appendChild(h('h4', null, 'Tiga keterlambatan'));
    wrap.appendChild(pickBars([['D1', 'Keterlambatan 1 mencari pelayanan'], ['D2', 'Keterlambatan 2 mencapai layanan tepat'], ['D3', 'Keterlambatan 3 tata laksana di fasyankes']].map(([k, l]) => { const L = cases.filter(s => s.gaps.some(g => g.cp === k)); return { label: l, n: L.length, pick: show(l, L, g => g.cp === k) }; })));
    const T = ['T1', 'T2', 'T3', 'T4', 'T5'], Bd = {}, Cd = {};
    cases.forEach(s => { if (s.recs.B) Bd[s.unit] = s.recs.B.data; if (s.recs.C) Cd[s.unit] = s.recs.C.data; });
    wrap.appendChild(h('h4', null, 'Kesepakatan penilai pertama dan kedua'));
    wrap.appendChild(tbl(['Fase', 'n', 'Mutu kurang (1–2)', 'Median', 'Pasangan', 'Sepakat tepat', 'Sepakat ±1', 'Kappa dikotomi'], T.map(t => {
      const s1 = Object.values(Bd).map(b => ((b.B1 || {})[t] || {}).skor).filter(v => /^[1-5]$/.test(v));
      const pairs = Object.keys(Cd).map(u => [(((Bd[u] || {}).B1 || {})[t] || {}).skor, ((Cd[u].C1 || {})[t] || {}).skor]).filter(p => /^[1-5]$/.test(p[0]) && /^[1-5]$/.test(p[1]));
      const k = RCA.kappa(pairs);
      return [t, s1.length, nN(s1.filter(v => v <= 2).length, s1.length), median(s1), pairs.length, nN(pairs.filter(p => p[0] === p[1]).length, pairs.length), nN(pairs.filter(p => Math.abs(p[0] - p[1]) <= 1).length, pairs.length), k.kappa === null ? (pairs.length < 5 ? 'n terlalu kecil' : '–') : k.kappa.toFixed(2)];
    }), { num: true }));
    wrap.appendChild(h('h3', { class: 'q' }, h('span', null, '2'), 'Mengapa: faktor penyumbang'));
    wrap.appendChild(h('p', { class: 'small muted' }, 'Faktor dari B4 (penilai pertama) dan lembar panel; ditambah klasifikasi kata kunci dari teks masalah dan sebab (perlu dikonfirmasi).'));
    wrap.appendChild(pickBars(RCA.story.FAKTOR.map(fk => { const L = cases.filter(s => s.faktor.some(x => x.f === fk)); const firm = L.filter(s => s.faktor.some(x => x.f === fk && x.asal.some(a => a !== 'kata kunci'))).length;
      return { label: fk, n: L.length, txt: L.length ? L.length + ' · ' + firm + ' dinilai' : '0', pick: show('Faktor · ' + fk, L) }; })));
    wrap.appendChild(h('h3', { class: 'q' }, h('span', null, '3'), 'Cerita setiap kasus'));
    wrap.appendChild(unitBrowser(cases));
    return wrap;
  }

  /* ================= C7 ================= */
  function anlC7(ctx) {
    const S7 = (ctx.V.C7 && ctx.V.C7.C7S) || [], K7 = (ctx.V.C7 && ctx.V.C7.C7K) || [];
    const wrap = h('div', { class: 'stack' });
    const T = S.c7.target;
    wrap.appendChild(tbl(['Provinsi', 'Target', 'Wawancara', 'Diskusi', 'Peserta', 'Semua bersedia'], Object.keys(T).map(p => {
      const s = S7.filter(r => r.unit.startsWith(p + '-'));
      return [p, T[p], s.filter(r => /-W/.test(r.unit)).length, s.filter(r => /-F/.test(r.unit)).length, s.reduce((a, r) => a + (Number(r.data.jumlah) || 0), 0), s.filter(r => r.data.bersedia === 'Ya').length];
    }), { num: true }));
    if (K7.length) {
      const cols = S.forms.C7.sub[1].sections[0].fields.filter(f => f.t === 'select');
      wrap.appendChild(h('h4', null, 'Cakupan perspektif per kab/kota'));
      wrap.appendChild(h('div', { class: 'table-wrap no-cards' }, h('table', { class: 't heat' }, h('thead', null, h('tr', null, h('th', null, 'Kab/kota'), cols.map(c => h('th', null, c.l)))),
        h('tbody', null, K7.map(r => h('tr', null, h('th', null, r.unit), cols.map(c => { const v = r.data[c.k] || ''; return h('td', { class: 'c ' + (v === 'Ya' ? 'c-ok' : v === 'Sebagian' ? 'c-part' : v === 'Tidak' ? 'c-no' : '') }, v); })))))));
    }
    const tema = {}; S7.forEach(r => (r.data.tema || []).forEach(t => { if (t.tema) (tema[t.tema] = tema[t.tema] || []).push({ r, t }); }));
    wrap.appendChild(h('h3', { class: 'q' }, h('span', null, '2'), 'Mengapa menurut informan: tema berkode · ketuk untuk kutipan dan sesi'));
    const temaPick = k => () => {
      const node = h('div', { class: 'stack' },
        tbl(['Sesi', 'CP', 'Kutipan', 'Catatan'], tema[k].map(({ r, t }) => [RCA.can.raw() ? h('a', { href: '#/edit/C7/C7S/' + encodeURIComponent(r.unit) }, r.unit) : r.unit, t.cp || '', t.kutipan || '', t.catatan || '']), { cls: 'rawt', wrapCls: 'no-cards' }));
      if (RCA.can.raw()) [...new Set(tema[k].map(x => x.r))].forEach(r => node.appendChild(h('details', { class: 'storycard' }, h('summary', null, h('b', null, r.unit), ' ', h('span', { class: 'muted small' }, r.data.sasaran || '')), rawRecord(r, 'C7S'))));
      return [k, tema[k].length + ' kutipan', node];
    };
    const temaKeys = Object.keys(tema).sort((a, b) => tema[b].length - tema[a].length).slice(0, 30);
    wrap.appendChild(pickBars(temaKeys.map(k => ({ label: k, n: tema[k].length, pick: temaPick(k) })), { empty: 'Belum ada tema berkode.' }));
    return wrap;
  }

  /* ================= C1 ================= */
  function anlC1(ctx) {
    const recs = (ctx.V.C1 && ctx.V.C1.C1) || [];
    if (!recs.length) return empty('C1');
    const wrap = h('div', { class: 'stack' });
    wrap.appendChild(tbl(['Kab/kota', 'Kedudukan', 'Indikator', 'Dikonfirmasi', 'Dikoreksi', 'Belum pasti', 'Dugaan', 'Didukung', 'Dibantah', 'Fokus disepakati'], recs.map(r => { const ind = r.data.indikator || [], du = r.data.dugaan || [];
      return [RCA.reg.kkName(r.kk), r.data.kedudukan || '', ind.length, ind.filter(x => x.konfirmasi === 'Dikonfirmasi').length, ind.filter(x => x.konfirmasi === 'Dikoreksi').length, ind.filter(x => x.konfirmasi === 'Belum dapat dipastikan').length,
        du.length, du.filter(x => x.status === 'Didukung').length, du.filter(x => x.status === 'Dibantah').length, (r.data.fokus_sepakat || []).length]; }), { num: true }));
    const by = {}; recs.forEach(r => (r.data.dugaan || []).forEach(x => { const k = x.status || 'Belum diuji'; (by[k] = by[k] || []).push([RCA.reg.kkName(r.kk), x.dugaan || '', x.cp || '', x.bukti || '', x.fokus || '']); }));
    wrap.appendChild(h('h3', { class: 'q' }, h('span', null, '2'), 'Dugaan penyebab awal dan hasil ujinya'));
    wrap.appendChild(pickBars(Object.keys(by).map(k => ({ label: k, n: by[k].length, pick: () => ['Dugaan · ' + k, by[k].length + ' dugaan', rawRows('', ['Kab/kota', 'Dugaan', 'CP', 'Bukti diperlukan', 'Fokus penelusuran'], by[k])] }))));
    return wrap;
  }

  /* ================= lintas formulir & tambahan ================= */
  function anlCross(V, c2, f) {
    const facs = RCA.state.regions.fac.filter(x => (!f.prov || RCA.reg.kk(x.kk).prov === f.prov) && (!f.fac || x.code === f.fac));
    const cnt = (fm, sub, fac) => ((V[fm] || {})[sub] || []).filter(r => r.fac === fac).length;
    const rows = facs.map(fc => {
      const c4 = ((V.C4 || {}).C4 || []).find(r => r.unit === fc.code);
      const gaps = c4 ? Object.values(c4.data.matriks_cp || {}).filter(r => /sebagian|tidak terlaksana/i.test(r.klasifikasi || '')).length : '–';
      const sel = (c2.selected || []).filter(s => s.fac === fc.code).length;
      return [fc.code + (fc.sentinel === 'Ya' ? ' (sentinel)' : ''), sel, cnt('C3', 'C3A', fc.code) + cnt('C3', 'C3B', fc.code) + cnt('C3', 'C3CP3', fc.code), c4 ? c4.status : '–', gaps,
        fc.sentinel === 'Ya' ? ['C5_5', 'C5_6', 'C5_41a'].map(s => cnt('C5', s, fc.code)).reduce((a, b) => a + b, 0) + '/3' : 'TBL', cnt('C6', 'C6A', fc.code)];
    });
    return h('div', { class: 'stack' }, h('p', { class: 'muted' }, 'Satu baris per fasyankes. Kode penghubung yang sama di C3/C5/C6 tidak menambah jumlah pasien; cerita unit C3 menautkan kasus C6 dan baris C5 untuk pasien yang sama.'),
      tbl(['Fasyankes', 'Unit C2', 'Unit C3', 'C4', 'CP dengan kesenjangan', 'C5 indikator', 'Kasus C6'], rows, { num: true }));
  }
  function custom(V, D) {
    const wrap = h('div', { class: 'stack' });
    wrap.appendChild(h('p', null, 'Tempat analisis tambahan sesuai kebutuhan tim. Setiap analisis ditambahkan di berkas js/analysis-custom.js tanpa mengubah bagian lain aplikasi.'));
    (window.RCA_ANALYSES || []).forEach(a => {
      const card = h('section', { class: a.render ? 'card' : 'placeholder' }, h('h3', null, a.title), a.description ? h('p', { class: 'muted' }, a.description) : null);
      if (a.render) { try { const out = a.render(V, D, RCA); if (out) card.appendChild(out); } catch (e) { card.appendChild(h('div', { class: 'notice err' }, e.message)); } }
      else card.appendChild(h('p', null, 'Belum didefinisikan: ' + (a.todo || 'tambahkan fungsi render.')));
      wrap.appendChild(card);
    });
    return wrap;
  }
  RCA.anlPanel = { show: panelShow, close: panelClose, storyList, rawRecord };
})();
