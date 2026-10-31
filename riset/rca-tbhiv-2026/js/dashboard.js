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
      ['C3', 'C4', 'C5', 'C6'].includes(form) ? mk('fac', 'Semua fasyankes', RCA.state.regions.fac.filter(x => (!f.kk || x.kk === f.kk) && (!f.prov || RCA.reg.kk(x.kk).prov === f.prov)).map(x => [x.code, x.code + ' · ' + x.name])) : null,
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
        board.appendChild(h('section', { class: 'board-group' }, h('h3', null, groupLabel(form, k, us[0]), h('small', { class: 'muted' }, us.filter(u => u.status === 'Valid').length + ' valid · ' + us.filter(u => u.status === 'Dikirim').length + ' dikirim · ' + us.length + ' unit')),
          h('div', { class: 'tiles' }, us.map(u => tile(form, u)))));
      });
      box.appendChild(board);
    };
    draw();
  };
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

  /* ================================================================ Dashboard Analisis */
  const hbars = (items, max) => { max = max || Math.max(1, ...items.map(x => x[1])); return h('div', { class: 'hbars' }, items.map(([l, v, txt]) => h('div', { class: 'hbar' }, h('span', null, l), h('span', { class: 'track' }, h('i', { style: { width: (v / max * 100) + '%' } })), h('span', { class: 'v' }, txt !== undefined ? txt : v)))); };
  const tbl = (head, rows, opts) => h('div', { class: 'table-wrap' }, h('table', { class: 't ' + ((opts && opts.cls) || '') }, h('thead', null, h('tr', null, head.map((x, i) => h('th', { class: i && (opts && opts.num) ? 'n' : '' }, x)))), h('tbody', null, rows.map(r => h('tr', null, r.map((v, i) => v && v.nodeType ? h('td', null, v) : h('td', { class: i && (opts && opts.num) ? 'n' : '' }, v === undefined || v === null ? '' : v)))))));
  const nN = (n, N) => N ? n + '/' + N + ' (' + Math.round(n / N * 100) + '%)' : '–';
  const median = a => { const x = a.filter(v => v !== '' && !isNaN(v)).map(Number).sort((p, q) => p - q); if (!x.length) return '–'; const m = Math.floor(x.length / 2); return x.length % 2 ? x[m] : (x[m - 1] + x[m]) / 2; };
  RCA.anl = { hbars, tbl, nN, median };

  DB.analysis = async function (main) {
    main.innerHTML = '';
    main.appendChild(h('div', { class: 'page-head' }, h('div', { class: 'grow' }, h('h1', null, 'Dashboard Analisis'),
      h('p', null, 'Hanya data berstatus Valid. Angka sampel menggambarkan pola dalam sampel, bukan prevalensi fasyankes atau estimasi nasional; acak/sensus dan purposif disajikan terpisah.')),
      h('div', { class: 'row no-print' }, h('button', { class: 'btn', onclick: () => window.print() }, 'Cetak'))));
    const box = h('div', null, h('p', { class: 'muted' }, 'Menghitung…')); main.appendChild(box);
    let D;
    try { D = await RCA.api('analysis.data', {}); RCA.idb.set('cache', 'analysis', D); }
    catch (e) { if (e.code === 'OFFLINE') D = await RCA.idb.get('cache', 'analysis'); if (!D) { box.innerHTML = ''; box.appendChild(h('div', { class: 'notice err' }, e.message)); return; } }
    box.innerHTML = '';
    const f = filt._anl = filt._anl || {};
    const provSel = h('select', { 'aria-label': 'Provinsi' }); provSel.appendChild(h('option', { value: '' }, 'Semua provinsi')); RCA.state.regions.prov.forEach(p => provSel.appendChild(h('option', { value: p.code, selected: f.prov === p.code }, p.name)));
    provSel.addEventListener('change', () => { f.prov = provSel.value; DB.analysis(main); });
    box.appendChild(h('div', { class: 'filters no-print' }, provSel));
    const keep = r => !f.prov || r.prov === f.prov;
    const V = {}; Object.keys(D).forEach(fm => { if (fm === 'C2') return; V[fm] = {}; Object.keys(D[fm]).forEach(s => { V[fm][s] = D[fm][s].filter(keep); }); });
    const sections = [
      ['Ringkasan sampel (C2)', () => anlC2(D.C2, f)], ['C1 Profil dan pendalaman', () => anlC1(V.C1)], ['C3 Telaah catatan pelayanan', () => anlC3(V.C3)],
      ['C4 Penilaian fasilitas dan 14 CP', () => anlC4(V.C4)], ['C5 Verifikasi data sentinel', () => anlC5(V.C5)], ['C6 Telaah kematian', () => anlC6(V.C6)],
      ['C7 Wawancara dan diskusi', () => anlC7(V.C7, D.C2)], ['Keterkaitan antarformulir per fasyankes', () => anlCross(V, D.C2, f)]];
    const nav = h('div', { class: 'tabs no-print', role: 'tablist' });
    sections.forEach(([t], i) => nav.appendChild(h('button', { role: 'tab', 'aria-selected': (f.sec || 0) === i ? 'true' : 'false', onclick: () => { f.sec = i; DB.analysis(main); } }, t.split(' ')[0] === 'Keterkaitan' ? 'Lintas formulir' : t.split(' ')[0])));
    nav.appendChild(h('button', { role: 'tab', 'aria-selected': f.sec === 'x' ? 'true' : 'false', onclick: () => { f.sec = 'x'; DB.analysis(main); } }, 'Analisis tambahan'));
    box.appendChild(nav);
    if (f.sec === 'x') { box.appendChild(custom(V, D)); return; }
    const [title, fn] = sections[f.sec || 0];
    const sec = h('section', { class: 'anl' }, h('h2', null, title));
    try { sec.appendChild(fn()); } catch (e) { sec.appendChild(h('div', { class: 'notice err' }, 'Gagal menghitung: ' + e.message)); }
    box.appendChild(sec);
  };

  function anlC2(c2, f) {
    const sel = (c2.selected || []).filter(s => !f.prov || RCA.reg.kk(s.kk).prov === f.prov);
    const wrap = h('div', { class: 'stack' });
    const facs = RCA.state.regions.fac.filter(x => !f.prov || RCA.reg.kk(x.kk).prov === f.prov);
    const rows = facs.map(fc => {
      const s = sel.filter(x => x.fac === fc.code);
      const c = fr => { const a = s.filter(x => x.frame === fr); return a.length + ' (' + a.filter(x => /acak|sensus/i.test(x.pilihan)).length + 'a/' + a.filter(x => /purposif/i.test(x.pilihan)).length + 'p)'; };
      return [fc.code, c('A'), c('B'), c('CP3'), s.length + '/18', s.filter(x => x.telaah === 'Selesai').length, s.filter(x => x.telaah === 'Tidak berhasil').length, new Set(s.map(x => x.pid)).size];
    });
    wrap.appendChild(h('p', null, 'Terpilih per kerangka: jumlah (acak/sensus a, purposif p). Target inti 6 per kerangka (3 acak + 3 purposif), 18 per fasyankes, 432 pada 24 fasyankes. Unit ≠ dokumen ≠ pasien unik.'));
    wrap.appendChild(h('div', { class: 'kpis' }, [['Unit terpilih', sel.length], ['Target inti', facs.length * 18], ['Pasien unik', new Set(sel.map(x => x.pid)).size], ['Telaah selesai (C2b)', sel.filter(x => x.telaah === 'Selesai').length], ['Tidak berhasil', sel.filter(x => x.telaah === 'Tidak berhasil').length]].map(([l, v]) => h('div', { class: 'kpi' }, h('b', null, v), h('span', null, l)))));
    wrap.appendChild(tbl(['Fasyankes', 'A', 'B', 'CP3', 'Total/target', 'Selesai', 'Tidak berhasil', 'Pasien unik'], rows, { num: true }));
    return wrap;
  }
  function anlC1(V) {
    const recs = (V && V.C1) || [];
    if (!recs.length) return empty('C1');
    const rows = recs.map(r => { const ind = r.data.indikator || [], du = r.data.dugaan || [];
      return [RCA.reg.kkName(r.kk), r.data.kedudukan || '', ind.length, ind.filter(x => x.konfirmasi === 'Dikonfirmasi').length, ind.filter(x => x.konfirmasi === 'Dikoreksi').length, ind.filter(x => x.konfirmasi === 'Belum dapat dipastikan').length,
        du.length, du.filter(x => x.status === 'Didukung').length, du.filter(x => x.status === 'Dibantah').length, (r.data.fokus_sepakat || []).length]; });
    return h('div', { class: 'stack' }, tbl(['Kab/kota', 'Kedudukan', 'Indikator', 'Dikonfirmasi', 'Dikoreksi', 'Belum pasti', 'Dugaan', 'Didukung', 'Dibantah', 'Fokus disepakati'], rows, { num: true }));
  }
  function anlC3(V) {
    if (!V) return empty('C3');
    const A = (V.C3A || []).map(r => Object.assign({ _fac: r.fac }, r.data)), B = (V.C3B || []).map(r => Object.assign({ _fac: r.fac }, r.data)), C = (V.C3CP3 || []).map(r => Object.assign({ _fac: r.fac }, r.data));
    if (!A.length && !B.length && !C.length) return empty('C3');
    const wrap = h('div', { class: 'stack' });
    wrap.appendChild(h('div', { class: 'kpis' }, [['Unit A valid', A.length], ['Unit B valid', B.length], ['Episode CP3 valid', C.length], ['Akses tidak dapat ditelaah', A.concat(B).filter(d => d.U09 === 'Tidak dapat ditelaah').length]].map(([l, v]) => h('div', { class: 'kpi' }, h('b', null, v), h('span', null, l)))));
    const rk = RCA.c3Rekap(A, B, C);
    const CPS = ['CP2', 'CP3', 'CP5', 'CP6', 'CP7', 'CP8', 'CP10', 'CP11', 'CP12', 'CP14', 'R6'];
    wrap.appendChild(h('h3', null, 'Rekap CP (n kesenjangan / N dapat dinilai)'));
    wrap.appendChild(tbl(['CP', 'Acak/sensus', 'Purposif', 'BD / belum cukup'], CPS.map(cp => { const o = rk[cp] || { acak_n: 0, acak_N: 0, purp_n: 0, purp_N: 0, bd: 0 }; return [cp, nN(o.acak_n, o.acak_N), nN(o.purp_n, o.purp_N), o.bd]; }), { num: true }));
    const facs = [...new Set(A.concat(B, C).map(d => d._fac))].sort();
    wrap.appendChild(h('h3', null, 'Kesenjangan pada unit acak/sensus per fasyankes'));
    wrap.appendChild(tbl(['Fasyankes'].concat(CPS), facs.map(fc => { const r = RCA.c3Rekap(A.filter(d => d._fac === fc), B.filter(d => d._fac === fc), C.filter(d => d._fac === fc)); return [fc].concat(CPS.map(cp => r[cp] ? nN(r[cp].acak_n, r[cp].acak_N) : '–')); }), { num: true }));
    wrap.appendChild(h('h3', null, 'Selang waktu (median hari)'));
    wrap.appendChild(tbl(['Selang', 'Median', 'n'], [
      ['Terduga TB → diagnosis TB (A)', median(A.map(RCA.AUTO.hari_terduga_dx)), A.filter(d => RCA.AUTO.hari_terduga_dx(d) !== '').length],
      ['Diagnosis TB → mulai OAT (A)', median(A.map(RCA.AUTO.hari_dx_oat)), A.filter(d => RCA.AUTO.hari_dx_oat(d) !== '').length],
      ['Mulai OAT → mulai ARV (A)', median(A.map(RCA.AUTO.hari_oat_arv)), A.filter(d => RCA.AUTO.hari_oat_arv(d) !== '').length],
      ['Mulai ARV → skrining TB (B)', median(B.map(RCA.AUTO.hari_arv_skr)), B.filter(d => RCA.AUTO.hari_arv_skr(d) !== '').length],
      ['Kelayakan → mulai TPT (B)', median(B.map(RCA.AUTO.hari_layak_tpt)), B.filter(d => RCA.AUTO.hari_layak_tpt(d) !== '').length]], { num: true }));
    const mek = {}; C.forEach(d => { const m = RCA.AUTO.cp3_mek(d) || 'Kosong'; mek[m] = (mek[m] || 0) + 1; });
    wrap.appendChild(h('h3', null, 'CP3: sebaran mekanisme penetapan status HIV'));
    wrap.appendChild(hbars(Object.entries(mek).sort((a, b) => b[1] - a[1])));
    const pem = {}; A.forEach(d => RCA.AUTO.pemicu_A(d).split('; ').filter(Boolean).forEach(p => { const k = p.replace(/Luaran .*/, 'Luaran tidak berhasil/belum diketahui'); pem[k] = (pem[k] || 0) + 1; }));
    B.forEach(d => RCA.AUTO.pemicu_B(d).split('; ').filter(Boolean).forEach(p => { pem[p] = (pem[p] || 0) + 1; }));
    wrap.appendChild(h('h3', null, 'Pemicu pendalaman yang muncul (unit A dan B)'));
    wrap.appendChild(hbars(Object.entries(pem).sort((a, b) => b[1] - a[1])));
    return wrap;
  }
  function anlC4(V) {
    const recs = (V && V.C4) || [];
    if (!recs.length) return empty('C4');
    const CPS = S.forms.C4.sub[0].sections.find(s => s.id === 'matriks_cp').rows.map(r => r.k);
    const cls = v => /terverifikasi/i.test(v) ? 'c-ok' : /sebagian/i.test(v) ? 'c-part' : /tidak terlaksana/i.test(v) ? 'c-no' : /Tidak berlaku/.test(v) ? 'c-na' : v ? 'c-unk' : '';
    const abbr = v => /terverifikasi/i.test(v) ? 'Ya' : /sebagian/i.test(v) ? 'Seb' : /tidak terlaksana/i.test(v) ? 'Tdk' : /Tidak berlaku/.test(v) ? 'TBL' : /Belum/.test(v) ? '?' : '';
    const wrap = h('div', { class: 'stack' });
    wrap.appendChild(h('div', { class: 'legend' }, [['c-ok', 'Terlaksana dan terverifikasi'], ['c-part', 'Sebagian atau terlambat'], ['c-no', 'Dipastikan tidak terlaksana'], ['c-unk', 'Belum dapat dipastikan']].map(([c, l]) => h('span', null, h('i', { class: c }), l))));
    wrap.appendChild(h('div', { class: 'table-wrap' }, h('table', { class: 't heat' }, h('thead', null, h('tr', null, h('th', null, 'Fasyankes'), CPS.map(c => h('th', null, c)))),
      h('tbody', null, recs.map(r => { const m = r.data.matriks_cp || {}; return h('tr', null, h('td', null, r.unit), CPS.map(c => { const v = (m[c] || {}).klasifikasi || ''; return h('td', { class: 'c ' + cls(v), title: v }, abbr(v)); })); })))));
    const fk = {}; recs.forEach(r => Object.values(r.data.matriks_cp || {}).forEach(row => (row.faktor || []).forEach(x => { fk[x] = (fk[x] || 0) + 1; })));
    wrap.appendChild(h('h3', null, 'Faktor sistem yang dikaitkan dengan temuan CP'));
    wrap.appendChild(Object.keys(fk).length ? hbars(Object.entries(fk).sort()) : h('p', { class: 'muted' }, 'Belum ada.'));
    return wrap;
  }
  function anlC5(V) {
    if (!V) return empty('C5');
    const ids = {}; (V.C5ID || []).forEach(r => { ids[r.unit] = r.data; });
    const rows = [];
    [['5', 'C5_5', 'TB/HIV-5'], ['6', 'C5_6', 'TB/HIV-6'], ['41a', 'C5_41a', 'TB/HIV-4.1a']].forEach(([ind, sub, name]) => (V[sub] || []).forEach(r => {
      const id = ids[r.unit] || {}; const c = RCA.c5.ctx(ind, id); const rc = RCA.c5.recap(r.data.cocok || [], c, id);
      rows.push([r.unit, name, c.met || '–', c.model || '–', rc.rows, rc.D_sis + '/' + rc.N_sis, rc.D_src + '/' + rc.N_src, (rc.lapD !== null ? rc.lapD : '–') + '/' + (rc.lapN !== null ? rc.lapN : '–'),
        rc.FV_D ? rc.FV_D.toFixed(2) : '–', rc.FV_N ? rc.FV_N.toFixed(2) : '–', rc.alasan || 'Sah', Object.entries(rc.jenis).map(([k, v]) => k + ': ' + v).join('; ')]);
    }));
    if (!rows.length) return empty('C5');
    return h('div', { class: 'stack' }, h('p', { class: 'muted' }, 'FV = hitung ulang ÷ dilaporkan, terpisah untuk penyebut dan pembilang; batas 0,90–1,10. FV hanya untuk model A, sensus periode efektif, dan seluruh sumber selesai diperiksa. Tidak dipakai untuk mengestimasi kesalahan nasional.'),
      tbl(['Sentinel', 'Indikator', 'Metode', 'Model', 'Baris', 'D/N sistem', 'D/N sumber', 'D/N dilaporkan', 'FV penyebut', 'FV pembilang', 'Kesahihan', 'Jenis ketidaksesuaian'], rows, { num: true }));
  }
  function anlC6(V) {
    if (!V) return empty('C6');
    const A = {}, B = {}, C = {}, P = {};
    (V.C6A || []).forEach(r => { A[r.unit] = r.data; }); (V.C6B || []).forEach(r => { B[r.unit] = r.data; }); (V.C6C || []).forEach(r => { C[r.unit] = r.data; }); (V.C6P || []).forEach(r => { P[r.unit] = r.data; });
    const cases = Object.keys(A);
    if (!cases.length && !Object.keys(B).length) return empty('C6');
    const wrap = h('div', { class: 'stack' });
    const kat = {}; cases.forEach(u => { const k = RCA.AUTO.c6_kategori(A[u]); kat[k] = (kat[k] || 0) + 1; });
    wrap.appendChild(h('p', { class: 'muted' }, 'Sampel purposif (hingga 60 kasus); tidak dipakai untuk menghitung angka mortalitas atau proporsi kematian yang dapat dicegah.'));
    wrap.appendChild(h('div', { class: 'kpis' }, [['Kasus (Bagian A valid)', cases.length], ['Penilaian pertama', Object.keys(B).length], ['Penilaian kedua', Object.keys(C).length],
      ['Peluang perbaikan (P1 = Ya)', Object.values(B).filter(b => b.peluang === 'Ya').length], ['Dibahas panel', Object.keys(P).length]].map(([l, v]) => h('div', { class: 'kpi' }, h('b', null, v), h('span', null, l)))));
    wrap.appendChild(h('h3', null, 'Kategori waktu kematian sejak mulai OAT'));
    wrap.appendChild(hbars(['Sebelum OAT', '0–14 hari', '15–30 hari', '31–90 hari', '91–180 hari', 'Lebih dari 180 hari', 'Waktu OAT tidak diketahui', 'Tanggal tidak diketahui'].map(k => [k, kat[k] || 0])));
    const T = ['T1', 'T2', 'T3', 'T4', 'T5'];
    wrap.appendChild(h('h3', null, 'Skor mutu per fase (penilaian pertama) dan kesepakatan antarpenelaah'));
    wrap.appendChild(tbl(['Fase', 'n', 'Mutu kurang (1–2)', 'Median', 'Pasangan', 'Sepakat tepat', 'Sepakat ±1', 'Kappa dikotomi'], T.map(t => {
      const s1 = Object.values(B).map(b => ((b.B1 || {})[t] || {}).skor).filter(v => /^[1-5]$/.test(v));
      const pairs = Object.keys(C).map(u => [(((B[u] || {}).B1 || {})[t] || {}).skor, ((C[u].C1 || {})[t] || {}).skor]).filter(p => /^[1-5]$/.test(p[0]) && /^[1-5]$/.test(p[1]));
      const k = RCA.kappa(pairs);
      return [t, s1.length, nN(s1.filter(v => v <= 2).length, s1.length), median(s1), pairs.length, nN(pairs.filter(p => p[0] === p[1]).length, pairs.length), nN(pairs.filter(p => Math.abs(p[0] - p[1]) <= 1).length, pairs.length), k.kappa === null ? (pairs.length < 5 ? 'n terlalu kecil' : '–') : k.kappa.toFixed(2)];
    }), { num: true }));
    const dl = [['d1', 'Keterlambatan 1 mencari pelayanan'], ['d2', 'Keterlambatan 2 mencapai layanan tepat'], ['d3', 'Keterlambatan 3 tata laksana di fasyankes']];
    wrap.appendChild(h('h3', null, 'Tiga keterlambatan (penilaian pertama)'));
    wrap.appendChild(hbars(dl.map(([k, l]) => [l, Object.values(B).filter(b => ((b.B2 || {})[k] || {}).nilai === 'Ada').length])));
    const fk = {}; Object.values(B).forEach(b => (b.B4 || []).forEach(x => (x.faktor || []).forEach(f => { fk[f] = (fk[f] || 0) + 1; })));
    Object.values(P).forEach(p => (p.faktor || []).forEach(x => { if (x.faktor_sistem) fk[x.faktor_sistem] = (fk[x.faktor_sistem] || 0) + 1; }));
    wrap.appendChild(h('h3', null, 'Faktor sistem pada masalah yang teridentifikasi'));
    wrap.appendChild(Object.keys(fk).length ? hbars(Object.entries(fk).sort()) : h('p', { class: 'muted' }, 'Belum ada.'));
    return wrap;
  }
  function anlC7(V, c2) {
    const S7 = (V && V.C7S) || [], K7 = (V && V.C7K) || [];
    const wrap = h('div', { class: 'stack' });
    const T = S.c7.target;
    wrap.appendChild(tbl(['Provinsi', 'Target', 'Wawancara valid', 'Diskusi valid', 'Peserta', 'Semua bersedia'], Object.keys(T).map(p => {
      const s = S7.filter(r => r.unit.startsWith(p + '-'));
      return [p, T[p], s.filter(r => /-W/.test(r.unit)).length, s.filter(r => /-F/.test(r.unit)).length, s.reduce((a, r) => a + (Number(r.data.jumlah) || 0), 0), s.filter(r => r.data.bersedia === 'Ya').length];
    }), { num: true }));
    if (K7.length) {
      const cols = S.forms.C7.sub[1].sections[0].fields.filter(f => f.t === 'select');
      wrap.appendChild(h('h3', null, 'Cakupan perspektif per kab/kota'));
      wrap.appendChild(h('div', { class: 'table-wrap' }, h('table', { class: 't heat' }, h('thead', null, h('tr', null, h('th', null, 'Kab/kota'), cols.map(c => h('th', null, c.l)))),
        h('tbody', null, K7.map(r => h('tr', null, h('td', null, r.unit), cols.map(c => { const v = r.data[c.k] || ''; return h('td', { class: 'c ' + (v === 'Ya' ? 'c-ok' : v === 'Sebagian' ? 'c-part' : v === 'Tidak' ? 'c-no' : '') }, v); })))))));
    }
    const tema = {}; S7.forEach(r => (r.data.tema || []).forEach(t => { if (t.tema) tema[t.tema] = (tema[t.tema] || 0) + 1; }));
    wrap.appendChild(h('h3', null, 'Tema berkode yang muncul'));
    wrap.appendChild(Object.keys(tema).length ? hbars(Object.entries(tema).sort((a, b) => b[1] - a[1]).slice(0, 25)) : h('p', { class: 'muted' }, 'Belum ada tema valid.'));
    return wrap;
  }
  function anlCross(V, c2, f) {
    const facs = RCA.state.regions.fac.filter(x => !f.prov || RCA.reg.kk(x.kk).prov === f.prov);
    const cnt = (fm, sub, fac) => ((V[fm] || {})[sub] || []).filter(r => r.fac === fac).length;
    const rows = facs.map(fc => {
      const c4 = ((V.C4 || {}).C4 || []).find(r => r.unit === fc.code);
      const gaps = c4 ? Object.values(c4.data.matriks_cp || {}).filter(r => /sebagian|tidak terlaksana/i.test(r.klasifikasi || '')).length : '–';
      const sel = (c2.selected || []).filter(s => s.fac === fc.code).length;
      return [fc.code + (fc.sentinel === 'Ya' ? ' (sentinel)' : ''), sel, cnt('C3', 'C3A', fc.code) + cnt('C3', 'C3B', fc.code) + cnt('C3', 'C3CP3', fc.code), c4 ? 'Valid' : '–', gaps,
        fc.sentinel === 'Ya' ? ['C5_5', 'C5_6', 'C5_41a'].map(s => cnt('C5', s, fc.code)).reduce((a, b) => a + b, 0) + '/3' : 'TBL', cnt('C6', 'C6A', fc.code)];
    });
    return h('div', { class: 'stack' }, h('p', { class: 'muted' }, 'Satu baris per fasyankes: unit C2 terpilih, unit C3 valid, status C4 dan jumlah CP dengan kesenjangan, kelengkapan C5 (sentinel), serta kasus C6. Kode penghubung yang sama di C3/C5/C6 tidak menambah jumlah pasien.'),
      tbl(['Fasyankes', 'Unit C2', 'Unit C3 valid', 'C4', 'CP dengan kesenjangan', 'C5 indikator valid', 'Kasus C6'], rows, { num: true }));
  }
  function empty(f) { return h('div', { class: 'placeholder' }, 'Belum ada data Valid untuk ' + f + '. Data muncul di sini setelah koordinator menandai isian sebagai Valid.'); }
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
})();
