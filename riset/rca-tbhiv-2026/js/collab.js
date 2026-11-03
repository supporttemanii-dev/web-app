/* RCA TB-HIV 2026 · kolaborasi: beberapa pengisi per formulir, atribusi per isian, kehadiran, tabrakan,
   serah terima dan penugasan, serta cek isian sebelum pengiriman. Dipakai oleh forms.js (editor). */
(function () {
  'use strict';
  const RCA = window.RCA, h = RCA.h;
  const CB = RCA.collab = {};
  const has = v => v !== undefined && v !== null && v !== '' && !(Array.isArray(v) && !v.length);

  /* ---------------- jalur isian (sama dengan server): "k" · "m:bagian:baris:kolom" · "t:bagian:idBaris" */
  CB.uid = () => 'n' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  const tableKeys = sch => new Set(sch.sections.filter(s => s.type === 'table').map(s => s.k).concat(['foto']));
  const matrixKeys = sch => new Set(sch.sections.filter(s => s.type === 'matrix').map(s => s.k));
  CB.ensureIds = function (sch, data) {
    tableKeys(sch).forEach(k => { if (Array.isArray(data[k])) data[k].forEach((r, i) => { if (r && typeof r === 'object' && !r._id) r._id = r.id || 'i' + i; }); });
  };
  CB.flat = function (sch, data) {
    const out = {}, T = tableKeys(sch), M = matrixKeys(sch);
    Object.keys(data || {}).forEach(k => {
      if (k.charAt(0) === '_') return;
      const v = data[k];
      if (T.has(k) && Array.isArray(v)) v.forEach((r, i) => { if (r && typeof r === 'object') out['t:' + k + ':' + (r._id || r.id || 'i' + i)] = r; });
      else if (M.has(k) && v && typeof v === 'object' && !Array.isArray(v)) Object.keys(v).forEach(rk => { const r = v[rk] || {}; Object.keys(r).forEach(ck => { out['m:' + k + ':' + rk + ':' + ck] = r[ck]; }); });
      else out[k] = v;
    });
    return out;
  };
  const canon = v => {
    if (!has(v)) return '';
    if (Array.isArray(v)) return JSON.stringify(v.map(canon));
    if (typeof v === 'object') { const o = {}; Object.keys(v).sort().forEach(k => { if (k !== '_id' && has(v[k])) o[k] = canon(v[k]); }); return Object.keys(o).length ? JSON.stringify(o) : ''; }
    return String(v);
  };
  CB.canon = canon;
  CB.diff = (a, b) => { const keys = new Set(Object.keys(a).concat(Object.keys(b))); return [...keys].filter(k => canon(a[k]) !== canon(b[k])); };
  const copy = v => v === undefined ? undefined : JSON.parse(JSON.stringify(v));
  /** terapkan nilai pada data di tempat (objek baris/matriks yang sudah ada dipertahankan agar isian di layar tetap terhubung) */
  CB.apply = function (d, p, v) {
    const a = p.split(':');
    if (a[0] === 'm' && a.length >= 4) {
      const sec = a[1], rk = a[2], ck = a.slice(3).join(':');
      if (!d[sec] || typeof d[sec] !== 'object' || Array.isArray(d[sec])) d[sec] = {};
      if (!d[sec][rk]) d[sec][rk] = {};
      if (!has(v)) delete d[sec][rk][ck]; else d[sec][rk][ck] = copy(v);
      return;
    }
    if (a[0] === 't' && a.length >= 3) {
      const id = a.slice(2).join(':');
      if (!Array.isArray(d[a[1]])) d[a[1]] = [];
      const arr = d[a[1]]; const i = arr.findIndex(r => r && (r._id === id || r.id === id));
      if (v === null || v === undefined) { if (i >= 0) arr.splice(i, 1); return; }
      const nv = copy(v); nv._id = nv._id || id;
      if (i >= 0) { const o = arr[i]; Object.keys(o).forEach(k => delete o[k]); Object.assign(o, nv); } else arr.push(nv);
      return;
    }
    if (!has(v)) delete d[p]; else d[p] = copy(v);
  };
  /** label manusiawi untuk jalur */
  CB.label = function (sch, p) {
    const a = p.split(':');
    const sec = a[0] === 'm' || a[0] === 't' ? sch.sections.find(s => s.k === a[1]) : null;
    if (a[0] === 'm' && sec) { const r = (sec.rows || []).find(x => x.k === a[2]); const c = (sec.cols || []).find(x => x.k === a.slice(3).join(':')); return (sec.title || a[1]) + ' › ' + (r ? r.l : a[2]) + ' › ' + (c ? c.l : a[3]); }
    if (a[0] === 't') {
      const base = (sec ? sec.title : a[1] === 'foto' ? 'Foto' : a[1]);
      if (a.length >= 4) { const arr = (RCA.state.editor && RCA.state.editor.data[a[1]]) || []; const i = arr.findIndex(r => r && r._id === a[2]); const c = sec && (sec.cols || []).find(x => x.k === a.slice(3).join(':')); return (sec && sec.big ? '' : base + ' › ') + 'Baris ' + (i >= 0 ? '#' + (i + 1) + (arr[i].kode_baris ? ' ' + arr[i].kode_baris : '') : '') + ' › ' + (c ? c.l : a.slice(3).join(':')); }
      return base + ' › satu baris';
    }
    const k = p.replace(/__(st|src)$/, ''), f = sch.sections.flatMap(s => s.fields || []).find(x => x.k === k);
    return (f ? f.l : k) + (/__st$/.test(p) ? ' (status bukti)' : /__src$/.test(p) ? ' (kode sumber)' : '');
  };
  const show = v => !has(v) ? '(kosong)' : Array.isArray(v) ? v.join('; ') : typeof v === 'object' ? Object.entries(v).filter(([k, x]) => k !== '_id' && has(x)).map(([k, x]) => k + ': ' + (Array.isArray(x) ? x.join(', ') : x)).join(' · ') : String(v);
  CB.show = show;

  /* ---------------- atribusi: siapa mengisi */
  CB.latest = function (ed, paths) {
    const by = (ed.data && ed.data._by) || {}; let best = null;
    paths.forEach(p => { const b = by[p]; if (b && (!best || String(b.t) > String(best.t))) best = b; });
    return best;
  };
  /** chip "✓ Nama" (hijau) atau "● belum tersinkron" untuk perubahan lokal; didaftarkan agar diperbarui setelah sinkron */
  /** nama-nama pengisi satu baris tabel (baris + tiap kolomnya), terbaru lebih dulu */
  CB.rowBy = function (ed, rp) {
    const by = (ed.data && ed.data._by) || {}, out = [];
    Object.keys(by).filter(q => q === rp || q.indexOf(rp + ':') === 0).map(q => by[q]).filter(Boolean)
      .sort((a, b) => String(b.t).localeCompare(String(a.t))).forEach(b => { if (!out.some(x => x.e === b.e)) out.push(b); });
    return out;
  };
  const nm = b => b.e === RCA.state.user.email ? 'Anda' : b.n;
  /** apakah jalur (termasuk sel "t:bagian:id:kolom") punya perubahan lokal yang belum tersinkron */
  const isLocal = (ed, p) => {
    if (!ed.localPaths) return false;
    if (ed.localPaths.has(p)) return true;
    const a = p.split(':');
    if (a[0] === 't' && a.length >= 4) {
      const rp = a.slice(0, 3).join(':'), col = a.slice(3).join(':');
      if (!ed.localPaths.has(rp)) return false;
      const row = (ed.data[a[1]] || []).find(r => r && r._id === a[2]) || {}, base = (ed.base || {})[rp] || {};
      return canon(row[col]) !== canon(base[col]);
    }
    return false;
  };
  CB.byChip = function (ed, paths, wrapEl) {
    const el = h('span', { class: 'bychip', 'aria-live': 'off' });
    const rowMode = paths.length === 1 && /^t:[^:]+:[^:]+$/.test(paths[0]);
    const upd = () => {
      const local = paths.some(p => isLocal(ed, p));
      const b = CB.latest(ed, paths);
      const names = rowMode ? CB.rowBy(ed, paths[0]) : [];
      el.className = 'bychip' + (local ? ' local' : b || names.length ? ' done' : '');
      el.textContent = local ? '● belum tersinkron' : names.length ? '✓ ' + names.map(nm).join(', ') : b ? '✓ ' + nm(b) : '';
      el.title = local ? 'Perubahan Anda tersimpan di perangkat dan akan dikirim saat sinkron' : names.length ? 'Diisi oleh ' + names.map(x => x.n).join(', ') : b ? 'Diisi oleh ' + b.n + ' · ' + RCA.fmtDT(b.t) : '';
      if (wrapEl) wrapEl.classList.toggle('has-by', !!b && !local);
    };
    (ed.byEls = ed.byEls || []).push(upd); upd();
    return el;
  };
  CB.refreshBy = ed => { (ed.byEls || []).forEach(f => f()); };
  /** ringkasan pengisi: [{n, jumlah}] */
  CB.contributors = function (ed) {
    const by = (ed.data && ed.data._by) || {}, c = {};
    const ks = Object.keys(by);
    ks.filter(p => !(/^t:[^:]+:[^:]+$/.test(p) && ks.some(q => q.indexOf(p + ':') === 0))).forEach(p => { const b = by[p]; if (b && b.n) c[b.n] = (c[b.n] || 0) + 1; });
    return Object.entries(c).sort((a, b) => b[1] - a[1]);
  };

  /* ---------------- kehadiran dan penugasan (baris di bawah judul editor) */
  CB.presenceBar = function (ed) {
    const box = h('div', { class: 'presence', 'aria-live': 'polite' });
    const draw = () => {
      box.innerHTML = '';
      const pres = (ed.presence || []).filter(p => p.email !== RCA.state.user.email);
      const contr = CB.contributors(ed);
      const tg = ed.tugas;
      if (pres.length) box.appendChild(h('span', { class: 'pr-live' }, h('b', null, 'Sedang membuka: '), pres.map(p => {
        const act = (Date.now() - new Date(p.last_act || p.since)) < 120000;
        const fp = CB.focusOf(p);
        return h('span', { class: 'avatar' + (act ? ' live' : ''), style: { '--fc': CB.color(p.email) }, title: p.name + (act ? ' · aktif' : ' · tidak aktif ' + RCA.ago(p.last_act)) + (fp ? ' · sedang mengisi ' + CB.label(ed.schema, fp) : '') },
          h('i', { class: 'dotc', 'aria-hidden': 'true' }), RCA.initials(p.name), h('span', { class: 'nm' }, p.name),
          fp ? h('button', { type: 'button', class: 'linkbtn fwhere', onclick: () => CB.jumpTo({ path: fp }) }, '✎ ' + CB.label(ed.schema, fp)) : null);
      })));
      if (tg && tg.assignees && tg.assignees.length) box.appendChild(h('span', null, h('b', null, 'Penanggung jawab: '), tg.assignees.map(a => a.name).join(', '), tg.exclusive ? h('small', { class: 'muted' }, ' (khusus)') : null, tg.by ? h('small', { class: 'muted' }, ' (oleh ' + tg.by + ')') : null));
      if (contr.length) box.appendChild(h('span', null, h('b', null, 'Pengisi: '), contr.map(([n, k]) => n + ' (' + k + ')').join(', ')));
      box.hidden = !box.childNodes.length;
    };
    ed.drawPresence = () => { draw(); CB.drawFocus(ed); }; draw();
    return box;
  };

  /* ---------------- penanda berkedip: siapa sedang mengisi isian mana */
  const PAL = ['#d9480f', '#7048e8', '#0c8599', '#c2255c', '#2f9e44', '#1971c2', '#e67700', '#5f3dc4'];
  CB.color = e => { let x = 0; String(e || '').split('').forEach(c => { x = (x * 31 + c.charCodeAt(0)) >>> 0; }); return PAL[x % PAL.length]; };
  /** jalur yang sedang diisi pengguna lain bila masih segar (detak < 90 detik) */
  CB.focusOf = p => p && p.focus && (Date.now() - new Date(p.last_beat || p.focus_at)) < 90000 ? p.focus : '';
  const findTarget = (root, path) => {
    const q = x => root.querySelector('[data-path="' + CSS.escape(x) + '"]');
    let el = q(path);
    if (!el && path.startsWith('t:')) el = q(path.split(':').slice(0, 3).join(':'));
    if (!el && path.startsWith('m:')) el = root.querySelector('[data-path^="' + CSS.escape(path.split(':').slice(0, 3).join(':')) + '"]');
    if (!el && /__(st|src)$/.test(path)) el = q(path.replace(/__(st|src)$/, ''));
    return el;
  };
  CB.drawFocus = function (ed) {
    const roots = [RCA.$('#main'), RCA.$('#modalRoot')].filter(Boolean);
    roots.forEach(r => {
      r.querySelectorAll('.fmark, .fsec, .fmarks').forEach(x => x.remove());
      r.querySelectorAll('.focused-by').forEach(x => { x.classList.remove('focused-by'); x.style.removeProperty('--fc'); });
    });
    if (RCA.state.editor !== ed) return;
    const me = RCA.state.user.email;
    (ed.presence || []).filter(p => p.email !== me).forEach(p => {
      const fp = CB.focusOf(p); if (!fp) return;
      const col = CB.color(p.email);
      let el = null; for (const r of roots) { el = findTarget(r, fp); if (el) break; }
      if (!el) return;
      el.classList.add('focused-by'); el.style.setProperty('--fc', col);
      let tags = el.querySelector(':scope > .fmarks');
      if (!tags) { tags = h('span', { class: 'fmarks' }); el.appendChild(tags); }
      tags.appendChild(h('span', { class: 'fmark', style: { '--fc': col }, title: p.name + ' sedang mengisi ' + CB.label(ed.schema, fp) }, '✎ ' + p.name.split(' ')[0]));
      // bagian yang tertutup: beri penanda di judul bagian
      const sec = el.closest('details.sec');
      if (sec) { const sum = sec.querySelector(':scope > summary'); if (sum) sum.appendChild(h('span', { class: 'fsec', style: { '--fc': col }, title: p.name + ' sedang mengisi bagian ini' }, '✎ ' + p.name.split(' ')[0])); }
    });
  };

  /* ---------------- tabrakan isian */
  const colLabel = (sch, p, k) => { const sec = sch.sections.find(x => x.k === p.split(':')[1]); const col = sec && (sec.cols || []).find(x => x.k === k); return col ? col.l : k; };
  const pick = (c, v) => { if (!c.cols || !v || typeof v !== 'object') return v; const o = {}; c.cols.forEach(k => { o[k] = v[k]; }); return o; };
  CB.resolveConflicts = async function (ed, conflicts) {
    const sch = ed.schema; const choice = {};
    const body = h('div', { class: 'stack' },
      h('p', null, 'Isian berikut sudah diubah orang lain sejak Anda membukanya. Nilai yang tersimpan saat ini tetap dipakai, kecuali Anda memilih nilai Anda.'),
      h('div', { class: 'cflist' }, conflicts.map((c, i) => {
        const name = 'cf' + i, keep = h('input', { type: 'radio', name, checked: true }), mine = h('input', { type: 'radio', name });
        keep.addEventListener('change', () => { choice[c.path] = 'theirs'; }); mine.addEventListener('change', () => { choice[c.path] = 'mine'; });
        return h('fieldset', { class: 'cf' }, h('legend', null, CB.label(sch, c.path) + (c.cols ? ' · kolom ' + c.cols.map(k => colLabel(sch, c.path, k)).join(', ') : '')),
          h('label', { class: 'cfopt' }, keep, h('span', null, h('b', null, 'Tersimpan'), c.by ? h('small', { class: 'muted' }, ' · ' + c.by.n + ' · ' + RCA.fmtDT(c.by.t)) : null, h('span', { class: 'v' }, show(pick(c, c.theirs))))),
          h('label', { class: 'cfopt' }, mine, h('span', null, h('b', null, 'Milik saya'), h('span', { class: 'v' }, show(pick(c, c.mine))))),
          c.cols ? h('small', { class: 'muted' }, 'Kolom lain pada baris ini sudah digabung otomatis.') : null);
      })));
    await RCA.modal('Isian bertabrakan (' + conflicts.length + ')', body, [{ label: 'Terapkan pilihan', cls: 'primary', value: true }], { wide: true, sticky: true });
    const force = conflicts.filter(c => choice[c.path] === 'mine');
    force.forEach(c => CB.apply(ed.data, c.path, c.mine));
    return force.map(c => c.path);
  };

  /* ---------------- pilih pengguna */
  function userPicker(opts) {
    const me = RCA.state.user.email;
    const users = (RCA.state.users || []).filter(u => u.email && u.email !== me && ['Enumerator', 'Koordinator', 'SuperAdmin'].includes(u.role) && (!opts.only || opts.only.includes(u.role)));
    users.sort((a, b) => (a.role === 'Enumerator' ? 0 : 1) - (b.role === 'Enumerator' ? 0 : 1) || a.name.localeCompare(b.name));
    const q = h('input', { type: 'search', placeholder: 'Cari nama atau kode' });
    const list = h('div', { class: 'upick', role: opts.multi ? 'group' : 'radiogroup' });
    const sel = new Set(opts.selected || []);
    const draw = () => {
      list.innerHTML = '';
      const t = q.value.toLowerCase();
      users.filter(u => !t || (u.name + ' ' + (u.code || '') + ' ' + u.email).toLowerCase().includes(t)).forEach(u => {
        const inp = h('input', { type: opts.multi ? 'checkbox' : 'radio', name: 'upick', value: u.email, checked: sel.has(u.email) });
        inp.addEventListener('change', () => { if (!opts.multi) sel.clear(); if (inp.checked) sel.add(u.email); else sel.delete(u.email); });
        list.appendChild(h('label', { class: 'uopt' }, inp, h('span', { class: 'avatar' }, RCA.initials(u.name)), h('span', null, h('b', null, u.name), h('small', { class: 'muted' }, ' ' + [u.code, u.role].filter(Boolean).join(' · ')))));
      });
      if (!list.childNodes.length) list.appendChild(h('p', { class: 'muted' }, 'Tidak ada pengguna yang cocok.'));
    };
    q.addEventListener('input', draw); draw();
    return { el: h('div', { class: 'stack' }, q, list), get: () => [...sel] };
  }

  /* ---------------- serah terima oleh pengisi */
  CB.handover = async function (ed) {
    const pk = userPicker({ multi: false });
    const keep = h('input', { type: 'checkbox', checked: true });
    const note = h('textarea', { rows: 3, placeholder: 'Contoh: bagian A dan T sudah selesai; lanjutkan P (pendalaman) dan tabel rujukan.' });
    const body = h('div', { class: 'stack' },
      h('p', null, 'Pilih pengguna yang diajak mengisi atau melanjutkan ' + ed.sub + ' ' + ed.unit + '. Penerima mendapat notifikasi. Formulir tetap dapat diisi bersama; isian yang sudah ada tetap tersimpan dengan nama pengisinya.'),
      pk.el, h('label', { class: 'row' }, keep, h('span', null, 'Saya tetap tercatat sebagai penanggung jawab (bersama penerima)')),
      h('label', { class: 'lbl' }, 'Pesan untuk penerima (bagian mana yang perlu dilanjutkan)'), note);
    const ok = await RCA.modal('Ajak mengisi / serahkan', body, [{ label: 'Batal', value: false }, { label: 'Serahkan', cls: 'primary', value: true, validate: () => { if (!pk.get().length) { RCA.toast('Pilih penerima', 'err'); return false; } return true; } }]);
    if (!ok) return null;
    if (ed.dirty && ed.saveServer) await ed.saveServer(false);
    const res = await RCA.api('task.handover', { form: ed.form, sub: ed.sub, unit: ed.unit, to: pk.get()[0], keepSelf: keep.checked, note: note.value.trim() });
    RCA.toast('Diserahkan kepada ' + res.assignees.filter(a => a.email !== RCA.state.user.email).map(a => a.name).join(', ') + '. Penerima mendapat notifikasi.', 'ok', 6000);
    return { tugas: res, keepSelf: keep.checked };
  };

  /* ---------------- penugasan oleh koordinator (satu atau banyak unit) */
  CB.assign = async function (items, current) {
    const cur = (current && current.assignees || []).map(a => a.email);
    const pk = userPicker({ multi: true, selected: items.length === 1 ? cur : [] });
    const mode = h('select', { 'aria-label': 'Cara penugasan' },
      h('option', { value: 'add' }, 'Tambahkan ke penugas yang ada (mengisi bersama)'),
      h('option', { value: 'replace' }, 'Ganti penugas (ambil alih dari pengisi sebelumnya)'),
      h('option', { value: 'clear' }, 'Hapus penugasan'));
    if (items.length === 1 && cur.length) mode.value = 'replace';
    const note = h('textarea', { rows: 2, placeholder: 'Pesan untuk yang ditugaskan (opsional)' });
    const excl = h('input', { type: 'checkbox', checked: items.length === 1 && !!(current && current.exclusive) });
    const body = h('div', { class: 'stack' },
      h('p', null, items.length === 1 ? 'Unit ' + items[0].sub + ' ' + items[0].unit + (cur.length ? ' saat ini ditugaskan kepada ' + current.assignees.map(a => a.name).join(', ') + '.' : ' saat ini terbuka untuk semua pengisi.') : items.length + ' unit dipilih.'),
      h('p', { class: 'small muted' }, 'Penerima tugas menjadi penanggung jawab dan mendapat notifikasi. Unit tetap dapat diisi bersama oleh pengisi lain, kecuali Anda mencentang "khusus penerima tugas". Isian yang sudah ada tetap tersimpan dengan nama pengisinya.'),
      mode, pk.el,
      h('label', { class: 'row' }, excl, h('span', null, h('b', null, 'Khusus penerima tugas'), ' — pengisi lain tidak dapat mengubah unit ini (untuk ambil alih penuh)')),
      note);
    const ok = await RCA.modal('Penugasan', body, [{ label: 'Batal', value: false }, { label: 'Simpan penugasan', cls: 'primary', value: true, validate: () => { if (mode.value !== 'clear' && !pk.get().length) { RCA.toast('Pilih minimal satu pengguna', 'err'); return false; } return true; } }], { wide: true });
    if (!ok) return null;
    const res = await RCA.api('task.assign', { items, emails: mode.value === 'clear' ? [] : pk.get(), mode: mode.value, note: note.value.trim(), exclusive: excl.checked && mode.value !== 'clear' });
    if (res.warnings && res.warnings.length) RCA.modal('Catatan penugasan', h('ul', null, res.warnings.map(w => h('li', null, w))));
    else RCA.toast('Penugasan disimpan untuk ' + res.items.length + ' unit. Yang ditugaskan mendapat notifikasi.', 'ok', 6000);
    return res;
  };

  /* ================= cek isian sebelum pengiriman ================= */
  const TODAY = () => RCA.today();
  /** daftar butir: {lvl:'wajib'|'anomali'|'kosong'|'info', sec, path, label, msg} */
  CB.preflight = function (ed, required) {
    const sch = ed.schema, d = ed.data, out = [];
    const add = (lvl, sec, path, label, msg) => out.push({ lvl, sec: sec ? sec.id : '', secTitle: sec ? sec.title : '', path, label, msg });
    const fieldOf = k => sch.sections.find(s => (s.fields || []).some(f => f.k === k));
    (required || []).forEach(m => { const k = m.split(' ')[0]; const s = fieldOf(k); const f = s && s.fields.find(x => x.k === k); add('wajib', s, k, f ? f.l : m, 'Isian wajib belum diisi'); });
    const visible = sec => !sec.when || d[sec.when.k] === sec.when.eq || (d[sec.k] || []).length > 0;
    const checkVal = (sec, path, f, v, where) => {
      if (!has(v)) return;
      if (f.t === 'select' && f.o && !f.o.map(String).includes(String(v))) add('anomali', sec, path, where, 'Nilai "' + v + '" tidak ada di pilihan formulir');
      if (f.t === 'multi' && f.o) (Array.isArray(v) ? v : [v]).forEach(x => { if (!f.o.includes(x)) add('anomali', sec, path, where, 'Pilihan "' + x + '" tidak dikenal'); });
      if (f.t === 'date') {
        if (!/^\d{4}-\d{2}-\d{2}$/.test(String(v))) add('anomali', sec, path, where, 'Tanggal "' + v + '" tidak berformat tanggal');
        else { const y = +String(v).slice(0, 4); if (y < 2000) add('anomali', sec, path, where, 'Tahun ' + y + ' tidak wajar'); if (String(v) > TODAY() && !/^U07|^Z07/.test(f.k)) add('anomali', sec, path, where, 'Tanggal di masa depan (' + RCA.fmtD(v) + ')'); }
      }
      if (f.t === 'number' && (isNaN(Number(v)) || Number(v) < 0)) add('anomali', sec, path, where, 'Angka tidak wajar: ' + v);
    };
    sch.sections.forEach(sec => {
      if (!visible(sec)) return;
      if (sec.type === 'fields') {
        const empties = [];
        sec.fields.forEach(f => {
          if (f.t === 'auto') return;
          const v = d[f.k];
          const need = RCA.forms.needOf ? RCA.forms.needOf(f, ed.sub) : 'perlu';
          if (!has(v) && !(f.st && has(d[f.k + '__st'])) && need === 'perlu' && !(required || []).includes(f.k)) empties.push(f);
          checkVal(sec, f.k, f, v, f.l);
          if (f.st) {
            const st = d[f.k + '__st'], src = d[f.k + '__src'];
            if (has(v) && !has(st)) add('anomali', sec, f.k, f.l, 'Isian ada tetapi status bukti (St) kosong');
            if (st === 'Y' && !has(v) && f.t !== 'textarea') add('anomali', sec, f.k, f.l, 'St = Y (tercatat) tetapi isiannya kosong');
            if (st === 'Y' && !has(src)) add('anomali', sec, f.k, f.l, 'St = Y tetapi kode sumber kosong');
            if (!has(v) && !has(st)) {/* kosong biasa */ }
          }
        });
        if (empties.length) add('kosong', sec, empties[0].k, sec.title, empties.length + ' isian kosong: ' + empties.slice(0, 8).map(f => (f.l.match(/^[A-Z]\d+[a-z]?/) || [f.l.slice(0, 40)])[0]).join(', ') + (empties.length > 8 ? ' …' : ''));
      } else if (sec.type === 'table') {
        const rows = d[sec.k] || [];
        rows.forEach((r, i) => {
          const filled = sec.cols.filter(c => c.t !== 'auto' && has(r[c.k]));
          if (!filled.length) add('anomali', sec, 't:' + sec.k + ':' + r._id, sec.title + ' · baris ' + (i + 1), 'Baris kosong (hapus atau isi)');
          sec.cols.forEach(c => checkVal(sec, 't:' + sec.k + ':' + r._id, c, r[c.k], sec.title + ' · baris ' + (i + 1) + ' · ' + c.l));
        });
        if (!rows.length && sec.when) add('kosong', sec, '', sec.title, 'Belum ada baris, padahal syarat bagian ini terpenuhi');
        if (sec.big && rows.length) {
          const c = RCA.c5.rows(rows, RCA.c5.ctx(sch.ind, ed.related.C5ID || {}));
          const belum = c.filter(o => o.status === 'Sumber belum diperiksa').length; if (belum) add('kosong', sec, '', sec.title, belum + ' baris: sumber belum diperiksa');
        }
      } else if (sec.type === 'matrix') {
        const m = d[sec.k] || {};
        const empty = sec.rows.filter(r => !m[r.k] || !sec.cols.some(c => c.t !== 'ro' && c.t !== 'auto' && has(m[r.k][c.k]) && !((r.pre || {})[c.k] === m[r.k][c.k])));
        if (empty.length) add('kosong', sec, 'm:' + sec.k + ':' + empty[0].k + ':', sec.title, empty.length + ' dari ' + sec.rows.length + ' baris belum diisi: ' + empty.slice(0, 6).map(r => r.l.split(' ')[0]).join(', ') + (empty.length > 6 ? ' …' : ''));
        sec.rows.forEach(r => sec.cols.forEach(c => { if (m[r.k]) checkVal(sec, 'm:' + sec.k + ':' + r.k + ':' + c.k, c, m[r.k][c.k], sec.title + ' · ' + r.l + ' · ' + c.l); }));
      }
    });
    // cek otomatis formulir (urutan tanggal, batas data, St/Sumber) dan pemicu pendalaman
    ['cek_A', 'cek_B'].forEach(fn => { if (sch.sections.some(s => (s.fields || []).some(f => f.fn === fn))) { const v = RCA.AUTO[fn](d); if (v) v.split('; ').filter(x => !/^St .* kosong$|^Sumber .* kosong$/.test(x)).forEach(x => add('anomali', null, (x.match(/[A-Z]\d{2}b?/) || [''])[0], 'Cek otomatis', x)); } });
    const pem = ['pemicu_A', 'pemicu_B'].map(fn => sch.sections.some(s => (s.fields || []).some(f => f.fn === fn)) ? RCA.AUTO[fn](d) : '').filter(Boolean)[0];
    if (pem && /purposif|melewati|belum|Luaran|Rujukan|Interupsi|Skrining|Kelayakan/.test(pem) && !has(d.Z06)) add('anomali', null, 'Z06', 'Pemicu pendalaman', pem + ' — isi Z06 dan bagian P bila pendalaman dilakukan');
    if (pem && has(d.Z06) && d.Z06 === 'Ya' && !has(d.P22)) add('kosong', null, 'P22', 'P22 Mekanisme yang ditemukan penelaah', 'Pendalaman dilakukan tetapi mekanisme (P22) belum diisi; penting untuk analisis "mengapa"');
    if ((d._lama || []).length) add('info', null, '', 'Data dari aplikasi lama', d._lama.length + ' isian lama tanpa padanan; tinjau di panel "Data dari aplikasi lama"');
    const others = (ed.presence || []).filter(p => p.email !== RCA.state.user.email && (Date.now() - new Date(p.last_act || p.since)) < 300000);
    if (others.length) add('info', null, '', 'Pengisi lain', others.map(p => p.name).join(', ') + ' sedang membuka formulir ini. Pastikan mereka sudah selesai sebelum mengirim.');
    if (ed.localPaths && ed.localPaths.size) add('info', null, '', 'Sinkron', ed.localPaths.size + ' perubahan belum tersinkron; akan disimpan saat dikirim');
    return out;
  };
  /** modal cek isian; mode 'kirim' menampilkan tombol Kirim. Mengembalikan true bila pengguna memilih kirim. */
  CB.checkModal = async function (ed, required, mode) {
    const items = CB.preflight(ed, required);
    const g = lvl => items.filter(x => x.lvl === lvl);
    const W = g('wajib'), A = g('anomali'), K = g('kosong'), I = g('info');
    let jump = null;
    const list = (arr, cls) => h('ul', { class: 'pf ' + cls }, arr.map(x => h('li', null,
      h('div', null, h('b', null, x.label), x.secTitle && x.secTitle !== x.label ? h('small', { class: 'muted' }, ' · ' + x.secTitle) : null, h('div', { class: 'small' }, x.msg)),
      x.path || x.sec ? h('button', { class: 'btn small', type: 'button', onclick: () => { jump = x; RCA.$('#modalRoot .modal-back') && RCA.$('#modalRoot').querySelector('.mf .btn').click(); } }, 'Lihat') : null)));
    const body = h('div', { class: 'stack' },
      h('div', { class: 'kpis' }, [['Wajib belum diisi', W.length, W.length ? 'bad' : 'ok'], ['Anomali', A.length, A.length ? 'warn' : 'ok'], ['Bagian ada yang kosong', K.length, K.length ? 'warn' : 'ok']].map(([l, v, c]) => h('div', { class: 'kpi pf-' + c }, h('b', null, v), h('span', null, l)))),
      W.length ? h('section', null, h('h3', null, 'Wajib diisi sebelum dikirim'), list(W, 'bad')) : null,
      A.length ? h('section', null, h('h3', null, 'Anomali: periksa kebenarannya'), list(A, 'warn')) : null,
      K.length ? h('section', null, h('h3', null, 'Isian kosong per bagian'), h('p', { class: 'small muted' }, 'Kosong tidak selalu salah (mis. bagian bersyarat atau tidak berlaku). Pastikan memang tidak ada datanya.'), list(K, 'info')) : null,
      I.length ? h('section', null, h('h3', null, 'Catatan'), list(I, 'info')) : null,
      !W.length && !A.length && !K.length ? h('div', { class: 'notice ok' }, 'Tidak ditemukan isian wajib yang kosong, anomali, atau bagian kosong.') : null);
    const btns = [{ label: mode === 'kirim' ? 'Perbaiki dulu' : 'Tutup', value: false }];
    if (mode === 'kirim') btns.push({ label: W.length ? 'Lengkapi isian wajib dulu' : (A.length ? 'Kirim (anomali sudah diperiksa)' : 'Kirim'), cls: 'primary', value: true, validate: () => { if (W.length) RCA.toast('Masih ada ' + W.length + ' isian wajib kosong. Tekan Lihat untuk menuju isiannya.', 'err', 6000); return !W.length; } });
    const res = await RCA.modal(mode === 'kirim' ? 'Cek sebelum kirim · ' + ed.unit : 'Cek isian · ' + ed.unit, body, btns, { wide: true });
    if (jump) CB.jumpTo(jump);
    return res === true && !W.length;
  };
  /** buka bagian dan sorot isian */
  CB.jumpTo = function (x) {
    const main = RCA.$('#main');
    let sec = x.sec ? main.querySelector('details.sec[data-sec="' + x.sec + '"]') : null;
    let el = x.path ? main.querySelector('[data-path="' + CSS.escape(x.path) + '"]') : null;
    if (!el && x.path && x.path.startsWith('m:')) el = main.querySelector('[data-path^="' + CSS.escape(x.path.split(':').slice(0, 3).join(':')) + '"]');
    if (!el && x.path && !x.path.includes(':')) el = main.querySelector('[data-path="' + CSS.escape(x.path) + '"]');
    if (!el && x.path && x.path.startsWith('t:')) el = main.querySelector('[data-path="' + CSS.escape(x.path.split(':').slice(0, 3).join(':')) + '"]');
    if (el && !sec) sec = el.closest('details.sec');
    if (sec) sec.open = true;
    if (el) { let p = el.parentElement; while (p) { if (p.tagName === 'DETAILS') p.open = true; p = p.parentElement; } }
    const target = el || sec; if (!target) return;
    setTimeout(() => {
      target.scrollIntoView({ block: 'center', behavior: 'smooth' });
      target.classList.add('flash'); setTimeout(() => target.classList.remove('flash'), 2400);
      const inp = el && el.querySelector('input,select,textarea'); if (inp && !inp.disabled) inp.focus({ preventScroll: true });
    }, 60);
  };
})();
