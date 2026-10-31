/* RCA TB-HIV 2026 · daftar unit (papan register), Dashboard Progress, tabel isian, ekspor, Dashboard Analisis */
(function () {
  'use strict';
  const RCA = window.RCA, h = RCA.h, S = RCA.S;
  const DB = RCA.dash = {};
  const STATUSES = ['Belum', 'Draf', 'Dikirim', 'Dikembalikan', 'Valid'];
  const SCOL = { Belum: 'var(--s-belum)', Draf: 'var(--s-draf)', Dikirim: 'var(--s-dikirim)', Dikembalikan: 'var(--s-kembali)', Valid: 'var(--s-valid)' };
  const filt = RCA.state.filters = RCA.state.filters || {};

  async function loadUnits(form) {
    try { const u = await RCA.api('units.list', { form }); RCA.state.unitCache[form] = u; RCA.idb.set('cache', 'units|' + form, u); return u; }
    catch (e) { if (e.code === 'OFFLINE') { const c = await RCA.idb.get('cache', 'units|' + form); if (c) { RCA.state.unitCache[form] = c; return c; } } throw e; }
  }
  DB.loadUnits = loadUnits;

  function lockState(l) {
    if (!l) return null;
    if (l.active && !l.name) return { cls: 'live', txt: 'Sedang dikerjakan' };
    const m = (Date.now() - new Date(l.last_act || l.since)) / 60000, beat = (Date.now() - new Date(l.last_beat || l.since)) / 60000;
    if (m < 2 && beat < 2) return { cls: 'live', txt: 'Aktif · ' + l.name };
    return { cls: 'idle', txt: 'Tidak aktif ' + Math.round(m) + ' menit · ' + l.name + (beat >= 2 ? ' · kemungkinan offline' : '') };
  }
  const groupKey = (form, u) => form === 'C1' || u.sub === 'C7K' ? u.prov : form === 'C7' ? (u.meta && u.meta.prov7) || u.prov : form === 'C4' || form === 'C6' ? u.kk : u.fac;
  const groupLabel = (form, k, u) => {
    if (form === 'C1' || u.sub === 'C7K' || form === 'C7') return (RCA.reg.prov(k).name || k || 'Nasional');
    if (form === 'C4' || form === 'C6') return RCA.reg.kkName(k);
    return k + ' · ' + RCA.reg.facName(k);
  };

  function filterBar(form, units, onChange) {
    const f = filt[form] = filt[form] || {};
    const mk = (k, label, opts) => { const s = h('select', { 'aria-label': label }); s.appendChild(h('option', { value: '' }, label)); opts.forEach(([v, l]) => s.appendChild(h('option', { value: v, selected: f[k] === v }, l))); s.addEventListener('change', () => { f[k] = s.value; onChange(); }); return s; };
    const subs = [...new Set(units.map(u => u.sub))];
    const q = h('input', { type: 'search', placeholder: 'Cari kode unit', value: f.q || '' }); q.addEventListener('input', () => { f.q = q.value; onChange(); });
    return h('div', { class: 'filters no-print' },
      mk('prov', 'Semua provinsi', RCA.state.regions.prov.map(p => [p.code, p.name])),
      mk('kk', 'Semua kab/kota', RCA.state.regions.kk.filter(k => !f.prov || k.prov === f.prov).map(k => [k.code, k.name])),
      ['C3', 'C4', 'C5', 'C6'].includes(form) ? mk('fac', 'Semua fasyankes', RCA.state.regions.fac.filter(x => (!f.kk || x.kk === f.kk) && (!f.prov || RCA.reg.kk(x.kk).prov === f.prov)).map(x => [x.code, RCA.reg.facLabel(x)])) : null,
      subs.length > 1 ? mk('sub', 'Semua sub-formulir', subs.map(s => [s, (RCA.forms.subSchema(s) || {}).title || s])) : null,
      mk('status', 'Semua status', STATUSES.map(s => [s, s]).concat([['_lock', 'Sedang dikerjakan']])), q);
  }
  function applyFilter(form, units) {
    const f = filt[form] || {};
    return units.filter(u => (!f.prov || u.prov === f.prov) && (!f.kk || u.kk === f.kk) && (!f.fac || u.fac === f.fac) && (!f.sub || u.sub === f.sub) &&
      (!f.status || (f.status === '_lock' ? !!u.lock : u.status === f.status)) && (!f.q || u.unit.toLowerCase().includes(f.q.toLowerCase())));
  }

  function tile(form, u) {
    const ls = lockState(u.lock);
    const prog = u.status === 'Valid' || u.status === 'Dikirim' ? 100 : Number((u.rec && u.rec.progress) || 0);
    const subT = (RCA.forms.subSchema(u.sub) || {}).title || u.sub;
    const t = h('button', { class: 'tile', 'data-st': u.status, type: 'button', title: (u.label || u.unit) + ' · ' + u.status + (ls ? ' · ' + ls.txt : ''),
      onclick: () => { if (RCA.can.raw()) location.hash = '#/edit/' + form + '/' + u.sub + '/' + encodeURIComponent(u.unit); } },
      h('span', { class: 'u' }, u.unit), h('span', { class: 's' }, (S.forms[form].sub.length > 1 ? subT.split('·')[0].trim() + ' · ' : '') + u.status + (u.rec && u.rec.updated_name ? ' · ' + u.rec.updated_name : '')),
      u.meta && u.meta.pilihan ? h('span', { class: 's' }, u.meta.pilihan) : null,
      u.sub === 'C6C' && u.meta.second ? h('span', { class: 's' }, u.meta.second) : null,
      h('span', { class: 'bar', 'aria-hidden': 'true' }, h('i', { style: { width: prog + '%' } })));
    if (ls) t.appendChild(h('span', { class: 'who ' + ls.cls, title: ls.txt, 'aria-label': ls.txt }, RCA.initials(u.lock.name || '•')));
    return t;
  }
  function legend() {
    return h('div', { class: 'legend' }, STATUSES.map(s => h('span', null, h('i', { style: { background: SCOL[s] } }), s)),
      h('span', null, h('i', { style: { background: 'var(--primary)', borderRadius: '50%' } }), 'inisial = sedang dikerjakan'), h('span', null, h('i', { style: { background: 'var(--s-draf)', borderRadius: '50%' } }), 'tidak aktif/offline'));
  }
  function statusBar(units) {
    const n = units.length || 1;
    return h('div', null, h('div', { class: 'stackbar', role: 'img', 'aria-label': STATUSES.map(s => s + ' ' + units.filter(u => u.status === s).length).join(', ') },
      STATUSES.map(s => h('i', { style: { width: (units.filter(u => u.status === s).length / n * 100) + '%', background: SCOL[s] } }))));
  }
  function kpis(units) {
    return h('div', { class: 'kpis' }, h('div', { class: 'kpi' }, h('b', null, units.length), h('span', null, 'Unit')),
      STATUSES.map(s => h('div', { class: 'kpi' }, h('b', { style: { color: SCOL[s] } }, units.filter(u => u.status === s).length), h('span', null, s))),
      h('div', { class: 'kpi' }, h('b', null, units.filter(u => u.lock).length), h('span', null, 'Sedang dikerjakan')));
  }

  /* ---------------- daftar unit per formulir (papan register) */
  DB.formList = async function (main, form) {
    main.innerHTML = '';
    const F = S.forms[form];
    main.appendChild(h('div', { class: 'page-head' }, h('div', { class: 'grow' }, h('h1', null, F.title), h('p', null, formHelp(form))),
      h('div', { class: 'row no-print' }, h('a', { class: 'btn', href: '#/progress/' + form }, 'Progress dan tabel isian'), form === 'C1' && RCA.can.review() ? h('button', { class: 'btn', onclick: () => RCA.c1io.open() }, 'Unggah/unduh templat C1') : null)));
    const box = h('div', null, h('p', { class: 'muted' }, 'Memuat unit…'));
    main.appendChild(box);
    let units;
    try { units = await loadUnits(form); } catch (e) { box.innerHTML = ''; box.appendChild(h('div', { class: 'notice err' }, e.message)); return; }
    const draw = () => {
      box.innerHTML = '';
      const list = applyFilter(form, units);
      box.appendChild(filterBar(form, units, draw));
      box.appendChild(h('div', { class: 'stack' }, statusBar(list), legend()));
      const mine = list.filter(u => u.lock && u.lock.email === RCA.state.user.email);
      const ret = list.filter(u => u.status === 'Dikembalikan');
      if (ret.length) box.appendChild(h('div', { class: 'notice err', style: { margin: '12px 0' } }, h('b', null, ret.length + ' unit dikembalikan untuk dicek: '), ret.map(u => h('a', { href: '#/edit/' + form + '/' + u.sub + '/' + encodeURIComponent(u.unit), style: { marginRight: '10px' } }, u.unit))));
      if (mine.length) box.appendChild(h('div', { class: 'notice', style: { margin: '12px 0' } }, 'Anda sedang memegang: ', mine.map(u => h('a', { href: '#/edit/' + form + '/' + u.sub + '/' + encodeURIComponent(u.unit), style: { marginRight: '10px' } }, u.unit))));
      if (!units.length) { box.appendChild(h('div', { class: 'notice', style: { marginTop: '12px' } }, emptyMsg(form))); return; }
      const groups = {};
      list.forEach(u => { const k = groupKey(form, u) || '-'; (groups[k] = groups[k] || []).push(u); });
      const board = h('div', { class: 'board', style: { marginTop: '14px' } });
      Object.keys(groups).sort().forEach(k => {
        const us = groups[k];
        const sec = h('section', { class: 'board-group' }, h('h3', null, groupLabel(form, k, us[0]), h('small', { class: 'muted' }, us.filter(u => u.status === 'Valid').length + ' valid · ' + us.filter(u => u.status === 'Dikirim').length + ' dikirim · ' + us.length + ' unit')),
          h('div', { class: 'tiles' }, us.map(u => tile(form, u))));
        if (form === 'C5') { const slot = h('div', { class: 'c5rows', 'data-fac': k }); sec.appendChild(slot); }
        board.appendChild(sec);
      });
      box.appendChild(board);
      if (form === 'C5') c5RowLists(board);
    };
    draw();
  };
  /* ---------------- C5: daftar baris pencocokan per indikator (seperti daftar unit A, B, CP3 di C3) */
  const C5IND = [['C5_5', 'TB/HIV-5', 'CP3'], ['C5_6', 'TB/HIV-6', 'A'], ['C5_41a', 'TB/HIV-4.1a', 'B']];
  let c5Cache = null;
  async function c5RowLists(board) {
    const slots = RCA.$$('.c5rows', board); if (!slots.length) return;
    slots.forEach(sl => { sl.innerHTML = ''; sl.appendChild(h('p', { class: 'muted' }, 'Memuat daftar baris…')); });
    let T;
    try { T = c5Cache = await RCA.api('rec.table', { form: 'C5' }); }
    catch (e) { if (c5Cache) T = c5Cache; else { slots.forEach(sl => { sl.innerHTML = ''; sl.appendChild(h('p', { class: 'muted' }, 'Daftar baris tidak dapat dimuat: ' + e.message)); }); return; } }
    const byUnit = (sub, fac) => (T[sub] || []).find(r => r.unit === fac);
    const q = ((filt.C5 || {}).q || '').toLowerCase();
    slots.forEach(sl => {
      const fac = sl.getAttribute('data-fac'); sl.innerHTML = '';
      const idRec = byUnit('C5ID', fac); const idData = (idRec && idRec.data) || {};
      C5IND.forEach(([sub, label, frame]) => {
        const rec = byUnit(sub, fac); const rows = ((rec && rec.data) || {}).cocok || [];
        const ind = (RCA.forms.subSchema(sub) || {}).ind;
        let calc = []; try { calc = RCA.c5.rows(rows, RCA.c5.ctx(ind, idData)); } catch (e) { calc = []; }
        const n = { Sesuai: 0, Belum: 0, Beda: 0 };
        const items = rows.map((r, i) => {
          const st = (calc[i] || {}).status || 'Sumber belum diperiksa';
          const cat = st === 'Sesuai' ? 'Sesuai' : st === 'Sumber belum diperiksa' ? 'Belum' : 'Beda'; n[cat]++;
          return { r, i, st, cat, terpilih: (calc[i] || {}).terpilih };
        }).filter(x => !q || [x.r.kode_baris, x.r.kode_pasien, x.r.kode_unit_c3].join(' ').toLowerCase().includes(q));
        const head = h('h4', { class: 'c5rows-h' }, label + ' · ' + rows.length + ' baris',
          h('small', { class: 'muted' }, ' kerangka C2a ' + frame + ' · ' + n.Sesuai + ' sesuai · ' + n.Beda + ' beda · ' + n.Belum + ' belum diperiksa'));
        const box = h('details', { class: 'c5rows-box', open: rows.length > 0 && rows.length <= 60 }, h('summary', null, head));
        if (!rows.length) box.appendChild(h('p', { class: 'muted' }, 'Belum ada baris. Koordinator: C2 › fasyankes ini › Sentinel C5 › “Isi dari kerangka C2a”.'));
        else box.appendChild(h('div', { class: 'tiles' }, items.map(x => h('button', {
          class: 'tile', type: 'button', 'data-st': x.cat === 'Sesuai' ? 'Valid' : x.cat === 'Beda' ? 'Dikembalikan' : 'Belum', title: x.r.kode_baris + ' · ' + x.st,
          onclick: () => { if (!RCA.can.raw()) return; RCA.state.openRow = { sub, unit: fac, kb: x.r.kode_baris, i: x.i }; location.hash = '#/edit/C5/' + sub + '/' + encodeURIComponent(fac); } },
          h('span', { class: 'u' }, x.r.kode_baris || '#' + (x.i + 1)),
          h('span', { class: 's' }, [x.r.kode_pasien, x.r.asal].filter(Boolean).join(' · ')),
          h('span', { class: 's' }, (x.cat === 'Belum' ? 'Belum diperiksa' : x.st) + (x.r.kode_unit_c3 ? ' · C3 ' + x.r.kode_unit_c3 : '')),
          h('span', { class: 'bar', 'aria-hidden': 'true' }, h('i', { style: { width: x.cat === 'Belum' ? '0%' : '100%' } }))))));
        sl.appendChild(box);
      });
    });
  }

  function formHelp(form) {
    return {
      C1: 'Satu profil per kab/kota. Konfirmasi angka, dugaan penyebab awal (2–4), kandidat fasyankes dan sentinel, kesiapan lapangan, dan hasil pendalaman.',
      C3: 'Satu lembar per unit telaah dari C2: episode TB-HIV (A), riwayat ARV/TPT (B), dan episode TB untuk CP3. Target inti 18 unit per fasyankes.',
      C4: 'Satu ringkasan per fasyankes dengan 14 CP dan R6. Memakai sampel C3 yang sama, tanpa sampel pelayanan tambahan.',
      C5: 'Enam sentinel, satu per provinsi. Identitas dan metode, lalu pencocokan dua arah untuk TB/HIV-5, TB/HIV-6, dan TB/HIV-4.1a.',
      C6: 'Satu kasus per kode. Bagian A kronologi, Bagian B penilaian pertama, C6-C penilaian kedua tersamar, dan lembar panel.',
      C7: 'Satu lembar per sesi wawancara atau diskusi kelompok, ditambah cakupan perspektif per kab/kota.'
    }[form] || '';
  }
  function emptyMsg(form) {
    return {
      C3: 'Belum ada unit. Koordinator mengunggah kerangka C2a dan menjalankan undian di menu C2; unit terpilih muncul di sini.',
      C5: 'Belum ada sentinel. Tetapkan sentinel (satu per provinsi) di menu Admin › Fasyankes.',
      C6: 'Belum ada kasus terpilih. Koordinator menambahkan calon di C2 › Calon kematian C6.'
    }[form] || 'Belum ada unit.';
  }

  /* ---------------- Dashboard Progress */
  DB.progress = async function (main, form) {
    form = form || 'C3';
    main.innerHTML = '';
    main.appendChild(h('div', { class: 'page-head' }, h('div', { class: 'grow' }, h('h1', null, 'Dashboard Progress'), h('p', null, 'Siapa mengerjakan apa, sejauh mana, dan isian yang perlu diperiksa. Data Valid masuk Dashboard Analisis.'))));
    const tb = h('div', { class: 'tabs', role: 'tablist' });
    ['C1', 'C3', 'C4', 'C5', 'C6', 'C7'].forEach(f => tb.appendChild(h('button', { role: 'tab', 'aria-selected': f === form ? 'true' : 'false', onclick: () => { location.hash = '#/progress/' + f; } }, f)));
    main.appendChild(tb);
    const box = h('div', null, h('p', { class: 'muted' }, 'Memuat…')); main.appendChild(box);
    let units;
    try { units = await loadUnits(form); } catch (e) { box.innerHTML = ''; box.appendChild(h('div', { class: 'notice err' }, e.message)); return; }
    const draw = () => {
      box.innerHTML = '';
      const list = applyFilter(form, units);
      box.appendChild(filterBar(form, units, draw));
      box.appendChild(kpis(list)); box.appendChild(h('div', { style: { margin: '10px 0' } }, statusBar(list)));
      // per kelompok
      const groups = {}; list.forEach(u => { const k = groupKey(form, u) || '-'; (groups[k] = groups[k] || []).push(u); });
      box.appendChild(h('h2', { style: { marginTop: '18px' } }, 'Rekap per ' + (form === 'C3' || form === 'C5' ? 'fasyankes' : form === 'C4' || form === 'C6' ? 'kab/kota' : 'provinsi')));
      box.appendChild(h('div', { class: 'table-wrap' }, h('table', { class: 't' }, h('thead', null, h('tr', null, h('th', null, 'Kelompok'), STATUSES.map(s => h('th', { class: 'n' }, s)), h('th', { class: 'n' }, 'Total'), h('th', null, 'Kemajuan'))),
        h('tbody', null, Object.keys(groups).sort().map(k => { const us = groups[k]; return h('tr', null, h('td', null, groupLabel(form, k, us[0])), STATUSES.map(s => h('td', { class: 'n' }, us.filter(u => u.status === s).length || '')), h('td', { class: 'n' }, us.length), h('td', { style: { minWidth: '140px' } }, statusBar(us))); })))));
      // sedang dikerjakan
      const live = list.filter(u => u.lock);
      box.appendChild(h('h2', { style: { marginTop: '18px' } }, 'Sedang dikerjakan (' + live.length + ')'));
      box.appendChild(live.length ? h('div', { class: 'table-wrap' }, h('table', { class: 't' }, h('thead', null, h('tr', null, ['Unit', 'Sub', 'Petugas', 'Mulai', 'Keadaan'].map(x => h('th', null, x)))),
        h('tbody', null, live.map(u => { const ls = lockState(u.lock); return h('tr', null, h('td', null, h('a', { href: '#/edit/' + form + '/' + u.sub + '/' + encodeURIComponent(u.unit) }, u.unit)), h('td', null, u.sub), h('td', null, u.lock.name || ''), h('td', null, RCA.fmtDT(u.lock.since)), h('td', null, ls.txt)); })))) : h('p', { class: 'muted' }, 'Tidak ada unit yang sedang dibuka.'));
      // antrean pemeriksaan
      const q = list.filter(u => u.status === 'Dikirim');
      box.appendChild(h('h2', { style: { marginTop: '18px' } }, 'Menunggu pemeriksaan koordinator (' + q.length + ')'));
      box.appendChild(q.length ? h('div', { class: 'tiles' }, q.map(u => tile(form, u))) : h('p', { class: 'muted' }, 'Tidak ada antrean.'));
      // tabel isian
      if (RCA.can.raw()) {
        const subs = S.forms[form].sub.map(s => s.id);
        box.appendChild(h('h2', { style: { marginTop: '18px' } }, 'Tabel isian per sub-formulir'));
        box.appendChild(h('p', { class: 'muted' }, 'Menampilkan semua variabel isian. Gunakan untuk memeriksa anomali, lalu buka unit untuk mengembalikan atau memvalidasi.'));
        box.appendChild(h('div', { class: 'row' }, subs.map(s => h('button', { class: 'btn small', onclick: () => DB.dataTable(form, s) }, (RCA.forms.subSchema(s).title || s))),
          RCA.can.review() ? h('button', { class: 'btn small primary', onclick: () => DB.exportForm(form) }, 'Ekspor Excel ' + form) : null,
          RCA.can.review() && form === 'C3' ? h('button', { class: 'btn small', onclick: () => DB.exportForm('C2') }, 'Ekspor Excel C2') : null));
      }
      if (RCA.can.review()) conflicts(box);
    };
    draw();
  };
  async function conflicts(box) {
    let list = [];
    try { list = await RCA.api('conflict.list'); } catch (e) { return; }
    if (!list.length) return;
    box.appendChild(h('h2', { style: { marginTop: '18px' } }, 'Versi cadangan yang perlu diputuskan (' + list.length + ')'));
    box.appendChild(h('div', { class: 'table-wrap' }, h('table', { class: 't' }, h('thead', null, h('tr', null, ['Waktu', 'Unit', 'Dari', 'Alasan', 'Aksi'].map(x => h('th', null, x)))),
      h('tbody', null, list.map(c => h('tr', null, h('td', null, RCA.fmtDT(c.ts)), h('td', null, c.form + ' ' + c.sub + ' ' + c.unit), h('td', null, c.name), h('td', null, c.reason),
        h('td', null, h('button', { class: 'btn small', onclick: () => resolveConflict(c) }, 'Bandingkan'))))))));
  }
  async function resolveConflict(c) {
    const [cf, cur] = await Promise.all([RCA.api('conflict.get', { id: c.id }), RCA.api('rec.get', { form: c.form, sub: c.sub, unit: c.unit })]);
    const a = flat(cf.data), b = flat((cur.rec && cur.rec.data) || {});
    const keys = [...new Set(Object.keys(a).concat(Object.keys(b)))].filter(k => String(a[k] || '') !== String(b[k] || ''));
    const res = await RCA.modal('Bandingkan versi · ' + c.unit, h('div', null, h('p', null, keys.length + ' isian berbeda. Kiri: versi server saat ini. Kanan: versi cadangan dari ' + c.name + '.'),
      h('div', { class: 'table-wrap' }, h('table', { class: 't' }, h('thead', null, h('tr', null, h('th', null, 'Variabel'), h('th', null, 'Server'), h('th', null, 'Cadangan'))),
        h('tbody', null, keys.slice(0, 300).map(k => h('tr', null, h('td', null, k), h('td', null, String(b[k] === undefined ? '' : b[k])), h('td', null, String(a[k] === undefined ? '' : a[k])))))))),
      [{ label: 'Tutup', value: null }, { label: 'Abaikan cadangan', value: 'skip' }, { label: 'Pakai versi cadangan', cls: 'primary', value: 'use' }], { wide: true });
    if (!res) return;
    await RCA.api('conflict.resolve', { id: c.id, use: res === 'use' }); RCA.toast('Konflik diselesaikan', 'ok'); DB.progress(RCA.$('#main'), c.form);
  }

  /* ---------------- flatten untuk tabel & ekspor */
  function flat(data, prefix) {
    const o = {};
    Object.keys(data || {}).forEach(k => {
      const v = data[k];
      if (k === 'foto') { o.foto = (v || []).length; return; }
      if (Array.isArray(v)) { if (v.length && typeof v[0] === 'object') o['[' + k + ']'] = v.length + ' baris'; else o[k] = v.join('; '); }
      else if (v && typeof v === 'object') Object.keys(v).forEach(rk => { const rv = v[rk]; if (rv && typeof rv === 'object') Object.keys(rv).forEach(ck => { const cv = rv[ck]; if (cv !== '' && cv !== undefined) o[k + '.' + rk + '.' + ck] = Array.isArray(cv) ? cv.join('; ') : cv; }); });
      else o[k] = v;
    });
    return o;
  }
  DB.flat = flat;
  function orderedKeys(sub, rows) {
    const sch = RCA.forms.subSchema(sub), keys = [];
    sch.sections.forEach(s => {
      if (s.type === 'fields') s.fields.forEach(f => { keys.push(f.k); if (f.st) keys.push(f.k + '__st', f.k + '__src'); });
      if (s.type === 'matrix') s.rows.forEach(r => s.cols.forEach(c => { if (c.t !== 'ro' && c.t !== 'auto') keys.push(s.k + '.' + r.k + '.' + c.k); }));
      if (s.type === 'table') keys.push('[' + s.k + ']');
    });
    const seen = new Set(keys); rows.forEach(r => Object.keys(r).forEach(k => { if (!seen.has(k)) { seen.add(k); keys.push(k); } }));
    return keys;
  }
  function autoCols(sub, d) {
    const sch = RCA.forms.subSchema(sub), o = {};
    sch.sections.forEach(s => (s.fields || []).forEach(f => { if (f.t === 'auto' && RCA.AUTO[f.fn]) { try { o[f.k] = RCA.AUTO[f.fn](d); } catch (e) {} } }));
    return o;
  }
  DB.dataTable = async function (form, sub) {
    const t = await RCA.api('rec.table', { form, sub });
    const rows = (t[sub] || []).map(r => Object.assign({ unit: r.unit, status: r.status, fasyankes: r.fac, kab_kota: r.kk, versi: r.version, diubah: r.updated_name, waktu: r.updated_at }, flat(r.data), autoCols(sub, r.data)));
    const keys = ['unit', 'status', 'fasyankes', 'kab_kota', 'versi', 'diubah', 'waktu'].concat(orderedKeys(sub, rows).filter(k => !['unit', 'status'].includes(k)));
    const used = keys.filter(k => rows.some(r => r[k] !== undefined && r[k] !== ''));
    const q = h('input', { type: 'search', placeholder: 'Saring baris (kode, status, nilai)…' });
    const tbody = h('tbody');
    const drawRows = () => { tbody.innerHTML = ''; rows.filter(r => !q.value || JSON.stringify(r).toLowerCase().includes(q.value.toLowerCase())).forEach(r => tbody.appendChild(h('tr', null, used.map((k, i) => h('td', { title: String(r[k] === undefined ? '' : r[k]) }, i === 0 ? h('a', { href: '#/edit/' + form + '/' + sub + '/' + encodeURIComponent(r.unit), onclick: () => RCA.$('#modalRoot').innerHTML = '' }, r.unit) : (r[k] === undefined ? '' : String(r[k]))))))); };
    q.addEventListener('input', drawRows); drawRows();
    RCA.modal('Tabel isian · ' + (RCA.forms.subSchema(sub).title || sub) + ' (' + rows.length + ' rekaman, ' + used.length + ' kolom terisi)', h('div', { class: 'stack' }, q,
      h('div', { class: 'table-wrap', style: { maxHeight: '65vh' } }, h('table', { class: 't wide' }, h('thead', null, h('tr', null, used.map(k => h('th', null, k)))), tbody))),
      RCA.can.review() ? [{ label: 'Tutup', value: null }, { label: 'Unduh Excel', cls: 'primary', value: () => { if (!RCA.needXLSX()) return; const wb = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(rows, { header: used }), sub.slice(0, 31)); XLSX.writeFile(wb, form + '_' + sub + '_' + RCA.today() + '.xlsx'); } }] : null, { wide: true });
  };
  DB.exportForm = async function (form) {
    if (!RCA.needXLSX()) return;
    RCA.toast('Menyiapkan ekspor ' + form + '…');
    try {
      const d = await RCA.api('export.form', { form });
      const wb = XLSX.utils.book_new();
      const add = (name, arr) => { if (!arr || !arr.length) arr = [{ keterangan: 'kosong' }]; XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(arr), name.replace(/[\\/?*[\]:]/g, '_').slice(0, 31)); };
      if (form === 'C2') Object.keys(d).forEach(k => add(k, d[k].map(x => { const o = Object.assign({}, x); if (o.petunjuk) { Object.assign(o, { tgl_kunci: o.petunjuk.tgl, jk: o.petunjuk.jk, umur: o.petunjuk.umur }); delete o.petunjuk; } return o; })));
      else Object.keys(d).forEach(sub => {
        const recs = d[sub];
        const rows = recs.map(r => Object.assign({ unit: r.unit, status: r.status, fasyankes: r.fac, kab_kota: r.kk, provinsi: r.prov, versi: r.version, pemilik: r.owner_name, diubah_oleh: r.updated_name, diubah: r.updated_at, dikirim: r.submitted_at, divalidasi: r.validated_at, catatan_kembali: r.return_note }, flat(r.data), autoCols(sub, r.data)));
        add(sub, rows);
        const sch = RCA.forms.subSchema(sub);
        sch.sections.filter(s => s.type === 'table').forEach(s => {
          const trows = []; recs.forEach(r => {
            const rows = r.data[s.k] || [];
            let calc = null;
            if (s.big) { const id = ((d.C5ID || []).find(x => x.unit === r.unit) || {}).data || {}; calc = RCA.c5.rows(rows, RCA.c5.ctx(sch.ind, id)); }
            rows.forEach((x, i) => {
              const o = Object.assign({ unit: r.unit, status: r.status, baris: i + 1 }, flat(x));
              if (calc) Object.assign(o, { auto_D_sis: calc[i].D_sis, auto_D_src: calc[i].D_src, auto_N_sis: calc[i].N_sis, auto_N_src: calc[i].N_src, auto_status: calc[i].status, auto_terpilih: calc[i].terpilih, auto_lengkap: calc[i].lengkap });
              trows.push(o);
            });
          });
          if (trows.length) add(sub + '_' + s.k, trows);
        });
      });
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([['Ekspor RCA TB-HIV 2026'], ['Formulir', form], ['Waktu', new Date().toISOString()], ['Oleh', RCA.state.user.email], ['Catatan', 'Data berkode, tanpa identitas. Simpan dengan akses terbatas (Protokol V13 Bagian 17).']]), 'Info');
      XLSX.writeFile(wb, 'RCA_TBHIV_' + form + '_' + RCA.today() + '.xlsx');
    } catch (e) { RCA.toast(e.message, 'err'); }
  };

  /* Dashboard Analisis dipindahkan ke js/analysis.js */
})();
