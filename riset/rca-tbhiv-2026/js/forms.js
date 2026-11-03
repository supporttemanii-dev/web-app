/* RCA TB-HIV 2026 · perender formulir berbasis skema + editor unit (kunci, simpan lokal, sinkron, kirim, tinjau) */
(function () {
  'use strict';
  const RCA = window.RCA, h = RCA.h, S = RCA.S;
  const forms = RCA.forms = {};
  const SUBMAP = {};
  Object.keys(S.forms).forEach(f => (S.forms[f].sub || []).forEach(s => { SUBMAP[s.id] = { form: f, sub: s }; }));
  forms.subSchema = id => SUBMAP[id] && SUBMAP[id].sub;
  forms.formOf = id => SUBMAP[id] && SUBMAP[id].form;
  const has = RCA.calc.has;

  const REQUIRED = {
    C3A: ['U01', 'U06', 'U07', 'U09', 'Z05'], C3B: ['U01', 'U06', 'U07', 'U09', 'Z05'], C3CP3: ['R_B', 'R_F', 'R_H', 'R_O', 'R_P'],
    C1: ['kedudukan'], C6A: ['kecukupan'], C6B: ['peluang'], C6C: ['peluang', 'pernyataan'], C7S: ['tanggal'],
    C5ID: ['met_5', 'met_6', 'met_41a']
  };

  /* ================================================================ wajib / perlu / opsional */
  // wajib  = harus terisi sebelum Kirim (tanda *; merah bila kosong)
  // perlu  = isian utama instrumen; sebaiknya diisi atau diberi status bukti (coklat bila kosong)
  // opsional = catatan/tambahan; tidak dihitung kurang (abu-abu bila kosong)
  // opsional: catatan/tambahan, dan isian bersyarat ("bila …", "jika …") yang hanya diisi bila keadaannya berlaku
  const OPT_RE = /catatan|lainnya|\blain\b|opsional|\bbila\b|\bjika\b|\bapabila\b|pengganti|lokator|keterangan tambahan/i;
  function needOf(f, sub) {
    if (f.t === 'auto' || f.t === 'ro') return 'auto';
    if (f.req || (REQUIRED[sub] || []).includes(f.k)) return 'wajib';
    if (f.opt || OPT_RE.test(f.l)) return 'opsional';
    return 'perlu';
  }
  forms.needOf = needOf;
  /** terisi: nilai ada, atau status bukti (St) sudah dipilih (mis. TBL/BD) */
  const filledOf = (f, get) => !!(has(get(f.k)) || (f.st && has(get(f.k + '__st'))));
  /** hitung isian kosong per tingkat untuk satu bagian */
  function secStatus(sec, ed) {
    const d = ed.data, out = { wajib: 0, perlu: 0, opsional: 0, isi: 0, total: 0, rows: 0 };
    const tally = (cols, get) => cols.forEach(f => { const n = needOf(f, ed.sub); if (n === 'auto') return; out.total++; if (filledOf(f, get)) out.isi++; else out[n]++; });
    if (sec.type === 'fields') tally(sec.fields, k => d[k]);
    else if (sec.type === 'matrix') { const m = d[sec.k] || {}; sec.rows.forEach(r => tally(sec.cols, k => (m[r.k] || {})[k])); }
    else if (sec.type === 'table' && !sec.big) { (d[sec.k] || []).forEach(r => { out.rows++; tally(sec.cols, k => r[k]); }); }
    else if (sec.type === 'table') out.rows = (d[sec.k] || []).length;
    return out;
  }
  forms.secStatus = secStatus;

  /* ================================================================ input widgets */
  function optionList(sel, opts, value, placeholder) {
    sel.appendChild(h('option', { value: '' }, placeholder || '— pilih —'));
    (opts || []).forEach(o => sel.appendChild(h('option', { value: o, selected: String(value) === String(o) }, o)));
    if (has(value) && !(opts || []).map(String).includes(String(value))) sel.appendChild(h('option', { value, selected: true }, value + ' (nilai lama)'));
  }
  function widget(f, value, onChange, ro, id) {
    let el;
    const t = f.t;
    if (t === 'select') { el = h('select', { id, disabled: ro }); optionList(el, f.o, value); el.addEventListener('change', () => onChange(el.value)); }
    else if (t === 'multi') {
      const vals = Array.isArray(value) ? value : (has(value) ? String(value).split('; ') : []);
      el = h('div', { class: 'multi', role: 'group', id });
      (f.o || []).forEach(o => {
        const cb = h('input', { type: 'checkbox', value: o, checked: vals.includes(o), disabled: ro });
        cb.addEventListener('change', () => onChange(Array.from(el.querySelectorAll('input:checked')).map(x => x.value)));
        el.appendChild(h('label', null, cb, o));
      });
    }
    else if (t === 'textarea' || (RCA.voice && RCA.voice.wants(f))) {
      // isian panjang (alasan, keterangan, uraian): dapat didikte dengan suara dan dirapikan
      const ta = h('textarea', { id, rows: t === 'textarea' ? 3 : 2, disabled: ro }); ta.value = value || ''; ta.addEventListener('input', () => onChange(ta.value));
      el = !ro && RCA.voice ? RCA.voice.wrap(ta) : ta;
    }
    else if (t === 'date') { el = h('input', { id, type: 'date', disabled: ro, min: '2015-01-01', max: '2027-12-31' }); el.value = value || ''; el.addEventListener('change', () => onChange(el.value)); el.addEventListener('input', () => onChange(el.value)); }
    else if (t === 'number') { el = h('input', { id, type: 'number', inputmode: 'decimal', step: 'any', disabled: ro }); el.value = value === undefined ? '' : value; el.addEventListener('input', () => onChange(el.value === '' ? '' : el.value)); }
    else { el = h('input', { id, type: 'text', disabled: ro, autocomplete: 'off' }); el.value = value || ''; el.addEventListener('input', () => onChange(el.value)); }
    return el;
  }
  forms.widget = widget;
  let uid = 0;
  const nid = () => 'f' + (++uid);

  function fieldBlock(f, get, set, ed, ctxText, path) {
    const id = nid();
    const ro = ed.readOnly;
    const wrap = h('div', { class: 'f' + (f.t === 'textarea' || f.t === 'multi' || f.st || f.t === 'auto' && /cek|pemicu/.test(f.fn) ? ' full' : '') + (f.pre ? ' prefilled' : '') });
    if (path !== null && f.t !== 'auto') wrap.setAttribute('data-path', path || f.k);
    const code = (f.l.match(/^([A-Z]\d+[a-z]?)\s/) || [])[1];
    const tip = RCA.help.forField(f, ctxText);
    const need = needOf(f, ed.sub);
    if (need !== 'auto') wrap.classList.add('need-' + need);
    const lab = h('div', { class: 'lblrow' }, h('label', { class: 'lbl', for: id }, code ? [h('span', { class: 'code' }, code), ' ', f.l.slice(code.length + 1)] : f.l,
      need === 'wajib' ? h('span', { class: 'req', title: 'Wajib diisi sebelum dikirim' }, ' *', h('span', { class: 'sr' }, ' wajib')) : null,
      need === 'opsional' ? h('span', { class: 'opt', title: 'Opsional: boleh dikosongkan' }, 'opsional') : null),
      path !== null && f.t !== 'auto' ? RCA.collab.byChip(ed, path ? [path] : [f.k, f.k + '__st', f.k + '__src'], wrap) : null, tip.btn);
    wrap.appendChild(lab); wrap.appendChild(tip.box);
    if (f.t === 'auto') {
      const box = h('div', { class: 'auto', id, 'aria-live': 'polite' });
      wrap.appendChild(box);
      ed.autos.push(() => {
        let v = ''; try { v = RCA.AUTO[f.fn] ? RCA.AUTO[f.fn](ed.data, ed) : ''; } catch (e) { v = ''; }
        box.textContent = v === '' || v === undefined ? '–' : (typeof v === 'number' ? v + ' hari' : v);
        if (/^hari_/.test(f.fn) && v !== '') box.textContent = v + ' hari';
        box.classList.toggle('flag', /cek_|pemicu_/.test(f.fn) ? !!v : /^Ya$|Kesenjangan|Terlambat|Pencatatan|Pelayanan/.test(String(v)));
      });
      return wrap;
    }
    if (f.st) {
      const g = h('div', { class: 'stsrc' });
      g.appendChild(h('div', { class: 'stv' }, widget(f, get(f.k), v => set(f.k, v), ro, id)));
      const sid = nid(), cid = nid();
      const sel = h('select', { id: sid, disabled: ro }); optionList(sel, f.so || ['Y', 'TL', 'TC', 'TBL', 'BD'], get(f.k + '__st'), '—');
      sel.addEventListener('change', () => set(f.k + '__st', sel.value));
      const src = h('input', { id: cid, type: 'text', placeholder: 'RM1, TB1…', disabled: ro, list: 'srcCodes', autocapitalize: 'characters' }); src.value = get(f.k + '__src') || '';
      src.addEventListener('input', () => set(f.k + '__src', src.value.toUpperCase()));
      g.appendChild(h('div', { class: 'sts' }, h('label', { class: 'mini', for: sid }, 'Status bukti (St)'), sel));
      g.appendChild(h('div', { class: 'src' }, h('label', { class: 'mini', for: cid }, 'Kode sumber'), src));
      wrap.appendChild(g);
    } else wrap.appendChild(widget(f, get(f.k), v => set(f.k, v), ro, id));
    if (need !== 'auto') {
      const upd = () => { const ok = filledOf(f, get); wrap.classList.toggle('is-filled', ok); wrap.classList.toggle('is-empty', !ok); };
      upd(); (ed.counters = ed.counters || []).push(upd);
    }
    return wrap;
  }

  /* ================================================================ sections */
  function secCount(sec, data) {
    if (sec.type === 'fields') { const fs = sec.fields.filter(f => f.t !== 'auto'); return fs.filter(f => has(data[f.k])).length + '/' + fs.length; }
    if (sec.type === 'table') return ((data[sec.k] || []).length) + ' baris';
    if (sec.type === 'matrix') { const m = data[sec.k] || {}; return sec.rows.filter(r => m[r.k] && Object.values(m[r.k]).some(has)).length + '/' + sec.rows.length; }
    if (sec.type === 'photos') return ((data.foto || []).length) + ' foto';
    return '';
  }
  function renderSection(sec, ed) {
    const d = h('details', { class: 'sec', open: !sec.collapsed || ed.openAll, 'data-sec': sec.id });
    const cnt = h('span', { class: 'cnt' }, secCount(sec, ed.data));
    const badge = h('span', { class: 'sbadge' });
    const ttl = h('span', { class: 'stitle' }, sec.title);
    d.appendChild(h('summary', null, ttl, h('span', { class: 'sright' }, badge, cnt)));
    const updBadge = () => {
      const st = secStatus(sec, ed);
      let cls = '', txt = '';
      if (sec.type === 'photos' || (sec.type === 'table' && sec.big)) { cls = 'neutral'; txt = ''; }
      else if (sec.type === 'table' && !st.rows) { cls = 'neutral'; txt = 'belum ada baris'; }
      else if (st.wajib) { cls = 'bad'; txt = st.wajib + ' wajib belum diisi' + (st.perlu ? ' · ' + st.perlu + ' lainnya' : ''); }
      else if (st.perlu) { cls = 'warn'; txt = st.perlu + ' belum diisi'; }
      else if (st.total) { cls = 'ok'; txt = '✓ Lengkap'; }
      badge.textContent = txt; badge.className = 'sbadge ' + cls; badge.hidden = !txt;
      d.classList.remove('s-ok', 's-warn', 's-bad', 's-neutral'); if (cls) d.classList.add('s-' + cls);
    };
    ed.counters.push(() => { cnt.textContent = secCount(sec, ed.data); updBadge(); });
    updBadge();
    const body = h('div', { class: 'sec-body' });
    if (sec.note) body.appendChild(h('p', { class: 'sec-note' }, sec.note));
    d.appendChild(body);
    if (sec.when) {
      const upd = () => { const v = ed.data[sec.when.k]; const show = v === sec.when.eq || (ed.data[sec.k] || []).length > 0; d.hidden = !show; };
      ed.visibility.push(upd);
    }
    const fill = () => {
      body.querySelectorAll(':scope > :not(.sec-note)').forEach(n => n.remove());
      if (sec.type === 'fields') {
        const g = h('div', { class: 'fgrid' });
        sec.fields.forEach(f => g.appendChild(fieldBlock(f, k => ed.data[k], (k, v) => ed.set(k, v), ed)));
        body.appendChild(g);
      } else if (sec.type === 'table') body.appendChild(sec.big ? bigTable(sec, ed) : table(sec, ed, fill));
      else if (sec.type === 'matrix') body.appendChild(matrix(sec, ed));
      else if (sec.type === 'photos') body.appendChild(RCA.photo.section(ed));
    };
    fill();
    return d;
  }

  function rowSummary(sec, r) {
    return sec.cols.filter(c => c.t !== 'auto').slice(0, 3).map(c => r[c.k]).filter(has).map(v => Array.isArray(v) ? v.join(', ') : v).join(' · ') || '(kosong)';
  }
  function table(sec, ed, refill) {
    const wrap = h('div');
    const rows = ed.data[sec.k] = ed.data[sec.k] || [];
    rows.forEach((r, i) => {
      if (!r._id) r._id = RCA.collab.uid();
      const rp = 't:' + sec.k + ':' + r._id;
      const sum = h('span', { class: 'sum' }, rowSummary(sec, r));
      const det = h('details', { class: 'trow', open: !has(Object.entries(r).filter(([k, v]) => k !== '_id' && has(v))[0]), 'data-path': rp });
      det.appendChild(h('summary', null, h('b', null, '#' + (i + 1)), sum, RCA.collab.byChip(ed, [rp]),
        ed.readOnly ? null : h('button', { class: 'btn small ghost danger', type: 'button', 'aria-label': 'Hapus baris ' + (i + 1), onclick: async e => {
          e.preventDefault(); if (await RCA.confirm('Hapus baris', 'Hapus baris #' + (i + 1) + ' dari ' + sec.title + '?', 'Hapus', 'danger')) { rows.splice(i, 1); ed.changed(); refill(); }
        } }, 'Hapus')));
      const g = h('div', { class: 'fgrid tbody' });
      sec.cols.forEach(c => g.appendChild(fieldBlock(c, k => r[k], (k, v) => { r[k] = v; sum.textContent = rowSummary(sec, r); ed.changed(); }, ed, undefined, rp + ':' + c.k)));
      det.appendChild(g); wrap.appendChild(det);
    });
    if (!rows.length) wrap.appendChild(h('p', { class: 'muted' }, 'Belum ada baris.'));
    if (!ed.readOnly && !(sec.max && rows.length >= sec.max)) wrap.appendChild(h('div', { class: 'row' },
      h('button', { class: 'btn small', type: 'button', onclick: () => { rows.push({ _id: RCA.collab.uid() }); ed.changed(); refill(); } }, '+ Tambah baris'),
      sec.prefill === 'c1_dugaan' ? h('button', { class: 'btn small', type: 'button', onclick: () => {
        const src = (ed.related.C1 && ed.related.C1.dugaan) || [];
        if (!src.length) return RCA.toast('Dugaan C1 untuk kab/kota ini belum tersedia', 'err');
        src.slice(0, 4).forEach(x => { if (!rows.some(r => r.dugaan_penyebab_awal === x.dugaan)) rows.push({ _id: RCA.collab.uid(), dugaan_penyebab_awal: x.dugaan, cp_terkait: x.cp, bukti_yang_akan_dicari: x.bukti }); });
        ed.changed(); refill();
      } }, 'Ambil dari C1') : null));
    return wrap;
  }

  function bigTable(sec, ed) {
    const wrap = h('div', { class: 'stack' });
    const rows = ed.data[sec.k] = ed.data[sec.k] || [];
    const ind = ed.schema.ind;
    const ctx = () => RCA.c5.ctx(ind, ed.related.C5ID || {});
    const q = h('input', { type: 'search', placeholder: 'Cari kode baris / kode unit C3' });
    const fs = h('select', null); optionList(fs, ['Sumber belum diperiksa', 'Sesuai', 'Hanya di sistem: entri tanpa bukti sumber?', 'Hanya di sumber: belum tercatat atau terlambat?', 'Beda penyebut: periksa tanggal, tipe, atau status', 'Beda pembilang: pelayanan ada di sumber, tidak di sistem', 'Beda pembilang: di sistem tanpa bukti sumber'], '', 'Semua status');
    const list = h('div', { class: 'biglist table-wrap' });
    const recap = h('div', { class: 'kpis' });
    let page = 0;
    const draw = () => {
      const c = ctx(); const calc = RCA.c5.rows(rows, c);
      const rc = RCA.c5.recap(rows, c, ed.related.C5ID || {});
      recap.innerHTML = '';
      [['Baris', rc.rows], ['Terpilih diperiksa', rc.terpilih], ['Sumber belum diperiksa', rc.belum], ['D/N sistem', rc.D_sis + ' / ' + rc.N_sis], ['D/N sumber', rc.D_src + ' / ' + rc.N_src],
       ['FV pembilang', rc.FV_N ? rc.FV_N.toFixed(2) : '–'], ['FV penyebut', rc.FV_D ? rc.FV_D.toFixed(2) : '–']].forEach(([l, v]) => recap.appendChild(h('div', { class: 'kpi' }, h('b', null, v), h('span', null, l))));
      if (rc.alasan) recap.appendChild(h('div', { class: 'kpi', style: { gridColumn: '1/-1' } }, h('span', null, 'Kesahihan hitung ulang: ' + rc.alasan)));
      list.innerHTML = '';
      const term = q.value.trim().toLowerCase();
      const idx = rows.map((r, i) => i).filter(i => (!term || [rows[i].kode_baris, rows[i].kode_unit_c3].join(' ').toLowerCase().includes(term)) && (!fs.value || calc[i].status === fs.value));
      const pg = idx.slice(page * 50, page * 50 + 50);
      pg.forEach(i => {
        const r = rows[i], o = calc[i]; if (!r._id) r._id = RCA.collab.uid();
        list.appendChild(h('div', { class: 'item', role: 'button', tabindex: 0, onclick: () => editRow(i), onkeydown: e => { if (e.key === 'Enter') editRow(i); } },
          h('b', null, '#' + (i + 1)),
          h('div', { 'data-path': 't:' + sec.k + ':' + r._id }, h('div', null, h('b', null, r.kode_baris || '(tanpa kode)'), ' · ', r.asal || '', r.kode_unit_c3 ? ' · C3 ' + r.kode_unit_c3 : '', RCA.collab.byChip(ed, ['t:' + sec.k + ':' + r._id])),
            h('small', null, o.status + ' · terpilih: ' + o.terpilih)),
          h('span', { class: 'st ' + (o.status === 'Sesuai' ? 'st-Valid' : o.status === 'Sumber belum diperiksa' ? 'st-Belum' : 'st-Dikembalikan') }, o.status === 'Sesuai' ? 'Sesuai' : o.status === 'Sumber belum diperiksa' ? 'Belum' : 'Beda')));
      });
      if (!idx.length) list.appendChild(h('p', { class: 'muted', style: { padding: '10px' } }, rows.length ? 'Tidak ada baris yang cocok dengan filter.' : 'Belum ada baris. Koordinator dapat mengunggah daftar ekspor SITB/SIHA di menu C2 › Sentinel C5, atau tambahkan baris telusur register.'));
      pager.innerHTML = '';
      const pages = Math.ceil(idx.length / 50);
      if (pages > 1) for (let p = 0; p < pages; p++) pager.appendChild(h('button', { class: 'btn small' + (p === page ? ' primary' : ''), type: 'button', onclick: () => { page = p; draw(); } }, String(p + 1)));
      setTimeout(() => RCA.collab.drawFocus(ed), 0);
    };
    const pager = h('div', { class: 'row' });
    const editRow = async i => {
      const r = JSON.parse(JSON.stringify(rows[i])), orig = JSON.parse(JSON.stringify(rows[i])), rid = rows[i]._id;
      const g = h('div', { class: 'fgrid' });
      const autosBox = h('div', { class: 'notice' });
      const refreshAutos = () => { const o = RCA.c5.rows(rows.map((x, j) => j === i ? r : x), ctx())[i]; autosBox.textContent = `D sistem ${o.D_sis} · D sumber ${o.D_src === '' ? '–' : o.D_src} · N sistem ${o.N_sis} · N sumber ${o.N_src === '' ? '–' : o.N_src} · ${o.status} · terpilih: ${o.terpilih} · sumber lengkap: ${o.lengkap}`; };
      const fake = Object.assign({}, ed, { autos: [], counters: [] });
      sec.cols.filter(c => c.t !== 'auto').forEach(c => g.appendChild(fieldBlock(c, k => r[k], (k, v) => { r[k] = v; refreshAutos(); fake.counters.forEach(f => f()); }, fake, undefined, 't:' + sec.k + ':' + r._id + ':' + c.k)));
      refreshAutos();
      setTimeout(() => RCA.collab.drawFocus(ed), 80);
      const res = await RCA.modal('Baris #' + (i + 1) + ' · ' + (r.kode_baris || ''), h('div', { class: 'stack' }, autosBox, g),
        ed.readOnly ? [{ label: 'Tutup', value: null }] : [{ label: 'Hapus baris', cls: 'danger', value: 'del' }, { label: 'Batal', value: null }, { label: 'Simpan baris', cls: 'primary', value: 'save' }], { wide: true });
      if (res === 'save') {
        // terapkan hanya kolom yang diubah di jendela ini, agar isian pengisi lain yang masuk selama jendela terbuka tidak tertimpa
        const cur = rows.find(x => x && x._id === rid);
        if (cur) Object.keys(Object.assign({}, orig, r)).forEach(k => { if (RCA.collab.canon(r[k]) !== RCA.collab.canon(orig[k])) { if (r[k] === undefined || r[k] === '') delete cur[k]; else cur[k] = r[k]; } });
        ed.changed(); draw();
      }
      if (res === 'del' && await RCA.confirm('Hapus baris', 'Hapus baris ini?', 'Hapus', 'danger')) { { const j = rows.findIndex(x => x && x._id === rid); if (j >= 0) rows.splice(j, 1); } ed.changed(); draw(); }
    };
    q.addEventListener('input', () => { page = 0; draw(); }); fs.addEventListener('change', () => { page = 0; draw(); });
    wrap.appendChild(recap);
    wrap.appendChild(h('div', { class: 'filters' }, q, fs));
    wrap.appendChild(list); wrap.appendChild(pager);
    if (!ed.readOnly) wrap.appendChild(h('button', { class: 'btn small', type: 'button', onclick: () => { rows.push({ _id: RCA.collab.uid(), asal: 'Telusur register', ada_sistem: 'Tidak' }); ed.changed(); draw(); editRow(rows.length - 1); } }, '+ Tambah baris (telusur register / arah 2)'));
    ed.redrawBig = draw;
    draw();
    // dibuka dari daftar baris di halaman C5: langsung buka baris yang diketuk
    const want = RCA.state.openRow;
    if (want && want.sub === ed.sub && want.unit === ed.unit) {
      RCA.state.openRow = null;
      let i = rows.findIndex(r => r.kode_baris && r.kode_baris === want.kb); if (i < 0) i = want.i;
      if (rows[i]) setTimeout(() => { wrap.scrollIntoView({ block: 'start' }); editRow(i); }, 250);
    }
    return wrap;
  }

  function matrix(sec, ed) {
    const wrap = h('div');
    const m = ed.data[sec.k] = ed.data[sec.k] || {};
    if (sec.c3fill && !ed.readOnly) {
      wrap.appendChild(h('div', { class: 'row', style: { marginBottom: '10px' } },
        h('button', { class: 'btn small', type: 'button', onclick: () => fillC3(sec, ed) }, 'Isi n/N dari C3 fasyankes ini'),
        h('small', { class: 'muted' }, 'Memakai unit C3 berstatus Dikirim/Valid. Unit purposif tidak menentukan klasifikasi.')));
    }
    sec.rows.forEach(r => {
      const rv = m[r.k] = m[r.k] || {};
      if (r.pre && !Object.keys(rv).length && !ed.readOnly) Object.assign(rv, r.pre);
      const tag = h('span', { class: 'tag' });
      const updTag = () => {
        const cols = sec.cols.filter(c => needOf(c, ed.sub) !== 'auto'), get = k => rv[k];
        const n = cols.filter(c => filledOf(c, get)).length, miss = cols.filter(c => !filledOf(c, get) && needOf(c, ed.sub) !== 'opsional');
        const wj = miss.some(c => needOf(c, ed.sub) === 'wajib');
        tag.textContent = n + '/' + cols.length; tag.className = 'tag ' + (!miss.length ? 'ok' : wj ? 'bad' : n ? 'warn' : 'empty');
        det.classList.toggle('m-ok', !miss.length);
      };
      const det = h('details', { class: 'mcard', open: sec.rows.length <= 6 });
      det.appendChild(h('summary', null, r.l, tag));
      const body = h('div', { class: 'mbody' });
      if (r.info) body.appendChild(h('details', null, h('summary', { class: 'muted' }, 'Acuan: pertanyaan RCA dan yang diperiksa'),
        h('div', { class: 'ro' }, r.info.q + '\n\n' + r.info.cek + (r.info.cat ? '\n\nCatatan: ' + r.info.cat : ''))));
      const g = h('div', { class: 'fgrid' });
      sec.cols.forEach(c => {
        if (c.t === 'ro') { const v = (r.v || {})[c.k]; if (v) g.appendChild(h('div', { class: 'f' }, h('div', { class: 'lbl' }, c.l), h('div', { class: 'ro' }, v))); return; }
        if (c.t === 'auto') {
          const box = h('div', { class: 'auto' });
          const tp = RCA.help.forField(c);
          g.appendChild(h('div', { class: 'f' }, h('div', { class: 'lblrow' }, h('div', { class: 'lbl' }, c.l), tp.btn), tp.box, box));
          ed.autos.push(() => { const v = RCA.AUTO[c.fn] ? RCA.AUTO[c.fn](rv) : ''; box.textContent = v || '–'; box.classList.toggle('flag', /sebagian|Belum/.test(v)); });
          return;
        }
        g.appendChild(fieldBlock(c, k => rv[k], (k, v) => { rv[k] = v; updTag(); ed.changed(); }, ed, r.l, 'm:' + sec.k + ':' + r.k + ':' + c.k));
      });
      body.appendChild(g); det.appendChild(body); wrap.appendChild(det); updTag();
    });
    return wrap;
  }

  function fillC3(sec, ed) {
    const C3 = ed.related.C3 || {};
    const data = s => (C3[s] || []).map(x => x.data);
    const rk = RCA.c3Rekap(data('C3A'), data('C3B'), data('C3CP3'));
    const m = ed.data[sec.k];
    let n = 0;
    Object.keys(rk).forEach(cp => {
      if (!m[cp]) return;
      const o = rk[cp];
      Object.assign(m[cp], { c3_acak_N: o.acak_N, c3_acak_n: o.acak_n, c3_purp_N: o.purp_N, c3_purp_n: o.purp_n, c3_bd: o.bd, kode_unit_contoh: m[cp].kode_unit_contoh || o.units.slice(0, 3).join(', ') });
      n++;
    });
    ed.changed(); ed.rerender();
    RCA.toast(n ? 'Angka C3 diisi untuk ' + n + ' CP (' + ['C3A', 'C3B', 'C3CP3'].map(s => (C3[s] || []).length).reduce((a, b) => a + b, 0) + ' unit).' : 'Belum ada unit C3 terkirim/valid untuk fasyankes ini.', n ? 'ok' : 'err');
  }

  /* ================================================================ progress & validation */
  forms.progress = function (sch, data) {
    let tot = 0, done = 0;
    sch.sections.forEach(s => {
      if (s.collapsed) return;
      if (s.type === 'fields') s.fields.forEach(f => { if (f.t === 'auto') return; tot++; if (has(data[f.k])) done++; });
      if (s.type === 'matrix') s.rows.forEach(r => { tot++; const v = (data[s.k] || {})[r.k]; if (v && Object.keys(v).some(k => !(r.pre || {})[k] && has(v[k]))) done++; });
      if (s.type === 'table' && !s.when) { tot++; if ((data[s.k] || []).length) done++; }
    });
    return tot ? Math.round(done / tot * 100) : 0;
  };
  function missingRequired(ed) {
    const req = (REQUIRED[ed.sub] || []).slice();
    ed.schema.sections.forEach(sec => (sec.fields || []).forEach(f => { if (f.req && !req.includes(f.k)) req.push(f.k); }));
    const out = req.filter(k => !has(ed.data[k]));
    if (ed.sub === 'C6B' || ed.sub === 'C6C') {
      const mk = ed.sub === 'C6B' ? 'B1' : 'C1'; const mm = ed.data[mk] || {};
      ['T1', 'T2', 'T3', 'T4', 'T5'].forEach(t => { if (!has((mm[t] || {}).skor)) out.push(mk + ' ' + t + ' skor'); else if (!has((mm[t] || {}).alasan)) out.push(mk + ' ' + t + ' alasan'); });
    }
    return out;
  }

  /* ================================================================ prefill */
  function prefillCtx(ed) {
    const u = RCA.state.user, rel = ed.related || {}, unitInfo = rel.unit || {}, cal = rel.calon || {};
    const meta = (RCA.state.unitCache[ed.form] || []).find(x => x.unit === ed.unit && x.sub === ed.sub) || {};
    const facCode = ed.form === 'C4' || ed.form === 'C5' ? ed.unit : (unitInfo.fac || cal.fasyankes || meta.fac || '');
    const fac = RCA.reg.fac(facCode);
    const kk = fac.kk || meta.kk || (ed.form === 'C1' ? ed.unit : '');
    const prov = RCA.reg.prov(RCA.reg.kk(kk).prov);
    return {
      unit_code: ed.unit, patient_code: unitInfo.kode_pasien || cal.kode_pasien || '', selection: unitInfo.pilihan || '', reason: unitInfo.alasan || '',
      period: unitInfo.periode || '', hiv_status: unitInfo.hiv_status || '', tb_dx_date: unitInfo.tb_dx || '', user_code: u.code || '', today: RCA.today(),
      facility_code: facCode, kk_code: kk || (meta.meta && meta.meta.kk7) || '', sentinel_yn: fac.sentinel === 'Ya' ? 'Ya' : (fac.code ? 'Tidak' : ''),
      province_name: prov.name || '', region_text: (prov.name || '') + ' / ' + RCA.reg.kkName(kk), c3_link: cal.kode_unit_c3 || '',
      target: (meta.meta && meta.meta.target) || ''
    };
  }
  function applyPrefill(ed) {
    const c = prefillCtx(ed);
    ed.schema.sections.forEach(s => { if (s.type === 'fields') s.fields.forEach(f => { if (f.pre && !has(ed.data[f.k]) && has(c[f.pre])) ed.data[f.k] = c[f.pre]; }); });
    if (ed.schema.id === 'C5ID') { if (!ed.data.tw_awal) ed.data.tw_awal = S.params.c5['Awal triwulan verifikasi']; if (!ed.data.tw_akhir) ed.data.tw_akhir = S.params.c5['Akhir triwulan verifikasi']; if (!ed.data.tpt_akhir) ed.data.tpt_akhir = S.params.c5['Akhir jendela mulai TPT untuk pembilang TB/HIV-4.1a']; }
  }

  /* ================================================================ related panels */
  function relatedPanel(ed) {
    const r = ed.related || {}, out = [];
    if (RCA.migrateUI) { const lp = RCA.migrateUI.legacyPanel(ed); if (lp) out.push(lp); }
    if (ed.form === 'C3' && r.unit) {
      const u = r.unit;
      out.push(h('div', { class: 'relpanel' }, h('h3', null, 'Petunjuk mencari dokumen di fasyankes'),
        h('p', { class: 'muted' }, 'Cocokkan kode pasien dan kode lokal ini dengan Berkas Penghubung (C2a-P) yang dipegang petugas berwenang. Jangan menulis nama, NIK, atau nomor RM di aplikasi.'),
        h('dl', { class: 'kv' },
          h('dt', null, 'Kode unit'), h('dd', null, h('b', null, u.kode_unit)),
          h('dt', null, 'Kode pasien (C2a-P)'), h('dd', null, h('b', null, u.kode_pasien || '–')),
          h('dt', null, 'Kode episode/riwayat lokal'), h('dd', null, u.kode_lokal),
          h('dt', null, 'Pilihan · alasan'), h('dd', null, u.pilihan + (u.alasan ? ' · ' + u.alasan : '')),
          u.petunjuk ? [h('dt', null, 'Tanggal kunci'), h('dd', null, RCA.fmtD(u.petunjuk.tgl) || '–'), h('dt', null, 'Jenis kelamin · umur'), h('dd', null, (u.petunjuk.jk || '–') + ' · ' + (u.petunjuk.umur || '–') + ' th'),
            h('dt', null, 'Sumber baris'), h('dd', null, u.petunjuk.sumber || '–')] : null)));
    }
    if (ed.form === 'C6' && r.C3) {
      const d = r.C3.data, keys = ['A01', 'A08', 'A10', 'A11', 'A13', 'U13', 'T06', 'B01', 'B13'].filter(k => has(d[k]));
      out.push(h('div', { class: 'relpanel' }, h('h3', null, 'Fakta dari C3 (kasus yang sama: ' + (r.calon && r.calon.kode_unit_c3) + ')'),
        h('p', { class: 'muted' }, 'Pakai kembali fakta ini; pasien tidak dihitung dua kali.'),
        h('dl', { class: 'kv' }, keys.map(k => [h('dt', null, k), h('dd', null, d[k] + (d[k + '__st'] ? ' (' + d[k + '__st'] + ', ' + (d[k + '__src'] || '') + ')' : ''))]))));
    }
    if (ed.form === 'C6' && (ed.sub === 'C6B' || ed.sub === 'C6C' || ed.sub === 'C6P') && r.C6A) {
      const a = r.C6A, kr = (a.kronologi || []).slice().sort((x, y) => String(x.tgl).localeCompare(String(y.tgl)));
      out.push(h('details', { class: 'relpanel', open: ed.sub !== 'C6P' }, h('summary', null, h('b', null, 'Kronologi Bagian A (' + kr.length + ' kejadian) · kecukupan: ' + (a.kecukupan || '–'))),
        h('div', { class: 'table-wrap', style: { marginTop: '8px' } }, h('table', { class: 't' }, h('thead', null, h('tr', null, ['Tanggal', 'Fas', 'Tahap', 'Kejadian', 'Sumber', 'St'].map(x => h('th', null, x)))),
          h('tbody', null, kr.map(k => h('tr', null, h('td', null, k.tgl || ''), h('td', null, k.fas || ''), h('td', null, k.tahap || ''), h('td', null, k.kejadian || ''), h('td', null, k.sumber || ''), h('td', null, k.status || ''))))))));
    }
    if (ed.sub === 'C6P') {
      const b = r.C6B || {}, c = r.C6C || {};
      const rows = ['T1', 'T2', 'T3', 'T4', 'T5'].map(t => { const x = ((b.B1 || {})[t] || {}).skor, y = ((c.C1 || {})[t] || {}).skor; return h('tr', null, h('td', null, t), h('td', { class: 'n' }, x || '–'), h('td', { class: 'n' }, y || '–'), h('td', { class: 'n' }, /^\d$/.test(x) && /^\d$/.test(y) ? Math.abs(x - y) : '–')); });
      out.push(h('div', { class: 'relpanel' }, h('h3', null, 'Perbandingan penilaian pertama dan kedua'),
        h('table', { class: 't' }, h('thead', null, h('tr', null, h('th', null, 'Fase'), h('th', { class: 'n' }, 'P1'), h('th', { class: 'n' }, 'P2'), h('th', { class: 'n' }, 'Selisih'))), h('tbody', null, rows)),
        h('p', null, 'Peluang perbaikan: P1 ', h('b', null, b.peluang || '–'), ' · P2 ', h('b', null, c.peluang || '–'))));
    }
    if (ed.form === 'C5') out.push(RCA.help.indicatorPanel(ed.sub === 'C5ID' ? null : ({ C5_5: 'TB/HIV-5', C5_6: 'TB/HIV-6', C5_41a: 'TB/HIV-4.1a' })[ed.sub], ed.sub === 'C5ID'));
    if (ed.form === 'C5' && ed.sub !== 'C5ID') {
      const id = r.C5ID || {}, c = RCA.c5.ctx(ed.schema.ind, id);
      out.push(h('div', { class: c.met ? 'relpanel' : 'notice warn' }, h('b', null, 'Metode: ' + (c.met || 'belum ditetapkan di sub-formulir Identitas')), ' · periode efektif ' + RCA.fmtD(c.s) + ' – ' + RCA.fmtD(c.e) + ' · model ' + (c.model || '–')));
    }
    if (ed.form === 'C4' && r.C1 && (r.C1.dugaan || []).length) {
      out.push(h('details', { class: 'relpanel' }, h('summary', null, h('b', null, 'Dugaan penyebab awal C1 (' + r.C1.dugaan.length + ')')),
        h('ol', null, r.C1.dugaan.map(x => h('li', null, x.dugaan + (x.cp ? ' (' + x.cp + ')' : ''))))));
    }
    return out;
  }

  /* ================================================================ editor */
  forms.openEditor = async function (main, form, sub, unit) {
    const sch = forms.subSchema(sub);
    if (!sch) { main.textContent = 'Sub-formulir tidak dikenal'; return; }
    const CB = RCA.collab;
    const key = form + '|' + sub + '|' + unit;
    const ed = { form, sub, unit, schema: sch, key, data: {}, base: {}, baseVersion: 0, rec: null, related: {}, readOnly: true, dirty: false, autos: [], counters: [], visibility: [], byEls: [],
      lock: null, held: false, presence: [], tugas: null, deny: '', localPaths: new Set() };
    RCA.state.editor = ed;
    main.innerHTML = '';
    main.appendChild(h('p', { class: 'muted' }, 'Memuat ' + sub + ' ' + unit + '…'));
    let server = null, offline = false, fromCache = false;
    const canFillHere = RCA.can.fill() && !(sch.coordOnly && !RCA.can.review());
    // satu panggilan: ambil rekaman + catat kehadiran (server lama: rec.lock terpisah)
    const fetchP = RCA.state.online === false ? null : RCA.api('rec.get', { form, sub, unit, open: canFillHere });
    if (fetchP) fetchP.catch(() => {});
    const cachedRec = await RCA.idb.get('cache', 'rec|' + key);
    if (cachedRec && fetchP && RCA.state.online) {
      // buka langsung dari salinan di perangkat; versi server diperiksa di belakang
      server = cachedRec; fromCache = true; fetchP.catch(() => {});
    } else {
      try { if (!fetchP) throw new RCA.ApiError('offline', 'OFFLINE'); server = await fetchP; RCA.idb.set('cache', 'rec|' + key, server); }
      catch (e) {
        if (e.code === 'OFFLINE') { offline = true; server = cachedRec; }
        else { main.innerHTML = ''; main.appendChild(h('div', { class: 'notice err' }, e.message)); main.appendChild(h('p', null, h('a', { href: '#/form/' + form }, 'Kembali ke daftar'))); return; }
      }
    }
    ed.rec = server && server.rec; ed.related = (server && server.related) || {};
    ed.presence = (server && server.presence) || []; ed.tugas = server && server.tugas; ed.deny = (server && server.canEdit) || '';
    const sv = ed.rec ? ed.rec.version : 0;
    const srvData = ed.rec ? JSON.parse(JSON.stringify(ed.rec.data || {})) : {};
    CB.ensureIds(sch, srvData);
    ed.data = srvData; ed.base = CB.flat(sch, JSON.parse(JSON.stringify(srvData))); ed.baseVersion = sv;
    const draft = await RCA.idb.get('drafts', key);
    if (draft && draft.dirty && draft.email === RCA.state.user.email) {
      if (draft.base) {
        // draf format baru: gabungkan perubahan lokal dengan perubahan orang lain di server
        const dd = JSON.parse(JSON.stringify(draft.data)); CB.ensureIds(sch, dd);
        const dflat = CB.flat(sch, dd), local = CB.diff(dflat, draft.base), sflat = CB.flat(sch, srvData);
        const remote = CB.diff(sflat, draft.base).filter(p => !local.includes(p));
        remote.forEach(p => CB.apply(dd, p, sflat[p] === undefined ? null : sflat[p]));
        dd._by = srvData._by; if (srvData._lama) dd._lama = srvData._lama; if (srvData._impor) dd._impor = srvData._impor;
        const base = Object.assign({}, sflat); local.forEach(p => { if (draft.base[p] === undefined) delete base[p]; else base[p] = draft.base[p]; });
        ed.data = dd; ed.base = base; ed.dirty = local.length > 0;
      } else if (draft.baseVersion >= sv) { ed.data = draft.data; CB.ensureIds(sch, ed.data); ed.data._by = srvData._by; ed.dirty = true; }
      else {
        const pick = await RCA.modal('Ada dua versi isian', h('div', null,
          h('p', null, 'Perangkat ini menyimpan isian versi lama aplikasi yang belum terkirim (' + RCA.fmtDT(draft.savedAt) + '), dan server sudah diperbarui oleh ' + (ed.rec.updated_name || 'pengguna lain') + '.'),
          h('p', null, 'Pilih versi yang dipakai. Bila memilih versi perangkat, isian dikirim sebagai versi cadangan untuk diputuskan koordinator.')),
          [{ label: 'Pakai versi server', value: 'server' }, { label: 'Pakai versi perangkat', value: 'local', cls: 'primary' }], { sticky: true });
        if (pick === 'local') { ed.data = draft.data; ed.dirty = true; ed.forceConflict = true; }
        else await RCA.idb.del('drafts', key);
      }
    }
    const status = ed.rec ? ed.rec.status : 'Belum';
    if (canFillHere && fromCache) { ed.readOnly = !!ed.deny; ed.held = !ed.deny; RCA.state.heldLocks.add(key); }
    else if (fromCache) RCA.state.heldLocks.add(key);
    else if (canFillHere) {
      if (offline) { if (!ed.deny && ['Belum', 'Draf', 'Dikembalikan'].includes(status)) { ed.readOnly = false; ed.offlineEdit = true; } }
      else {
        try {
          if (server && server.opened) { if (!ed.deny) { ed.readOnly = false; ed.held = true; } }
          else {
            const lk = await RCA.api('rec.lock', { form, sub, unit });
            ed.presence = lk.presence || ed.presence; ed.tugas = lk.tugas; ed.deny = lk.deny || '';
            if (lk.ok) { ed.readOnly = false; ed.held = true; }
          }
          RCA.state.heldLocks.add(key);
        } catch (e) { RCA.toast(e.message, 'err'); }
      }
    } else if (!offline) RCA.state.heldLocks.add(key);
    if (!ed.readOnly) applyPrefill(ed);
    ed.localPaths = new Set(CB.diff(CB.flat(sch, ed.data), ed.base));

    // ---- methods
    let localTimer = null, srvTimer = null;
    ed.set = (k, v) => { ed.data[k] = v; ed.changed(); };
    ed.changed = () => {
      ed.dirty = true;
      ed.autos.forEach(f => f()); ed.counters.forEach(f => f()); ed.visibility.forEach(f => f());
      setSave('Menyimpan di perangkat…');
      clearTimeout(localTimer);
      localTimer = setTimeout(saveLocal, 300);
      // kirim ke server 2,5 detik setelah berhenti mengetik (tidak perlu menekan Simpan)
      clearTimeout(srvTimer);
      srvTimer = setTimeout(() => { if (RCA.state.editor === ed && ed.dirty && RCA.state.online && !ed.readOnly && !ed.offlineEdit && ed.held) ed.saveServer(false); }, 2500);
    };
    async function saveLocal() {
      ed.localPaths = new Set(CB.diff(CB.flat(sch, ed.data), ed.base)); CB.refreshBy(ed);
      await RCA.idb.set('drafts', key, { data: ed.data, base: ed.base, baseVersion: ed.baseVersion, savedAt: new Date().toISOString(), dirty: ed.dirty, email: RCA.state.user.email, form, sub, unit });
      setSave(RCA.state.online ? 'Tersimpan di perangkat · menunggu sinkron' : 'Tersimpan di perangkat (offline)');
    }
    /** gabungkan rekaman server ke editor; snap = isian lokal yang terakhir dikirim/diketahui */
    function mergeServer(rec, snap, keep) {
      const S0 = JSON.parse(JSON.stringify(rec.data || {})); CB.ensureIds(sch, S0);
      const sflat = CB.flat(sch, S0), now = CB.flat(sch, ed.data);
      const localNew = new Set(CB.diff(now, snap));
      (keep || []).forEach(p => localNew.add(p));
      const remote = CB.diff(sflat, snap).filter(p => !localNew.has(p));
      remote.forEach(p => CB.apply(ed.data, p, sflat[p] === undefined ? null : sflat[p]));
      ed.data._by = S0._by || {}; if (S0._lama) ed.data._lama = S0._lama; if (S0._impor) ed.data._impor = S0._impor;
      const base = sflat; ed.base = base;
      ed.rec = rec; ed.baseVersion = rec.version;
      ed.localPaths = new Set(CB.diff(CB.flat(sch, ed.data), ed.base));
      ed.dirty = ed.localPaths.size > 0;
      return remote;
    }
    /** simpan berurutan: panggilan bersamaan (detak, tombol, interval) menunggu yang sebelumnya selesai */
    let saveChain = Promise.resolve();
    ed.saveServer = function (submit, force) {
      const run = saveChain.then(() => doSave(submit, force));
      saveChain = run.catch(() => {});
      return run;
    };
    async function doSave(submit, force) {
      if (ed.readOnly) return false;
      clearTimeout(localTimer); await saveLocal();
      setSave('Menyinkronkan…');
      try {
        await RCA.photo.flushPending(ed);
        const now = CB.flat(sch, ed.data), snap = JSON.parse(JSON.stringify(now));
        let res;
        if (ed.forceConflict) res = await RCA.api('rec.save', { form, sub, unit, data: ed.data, baseVersion: -1, submit: false });
        else {
          const patch = {}, base = {};
          CB.diff(now, ed.base).forEach(p => { patch[p] = now[p] === undefined ? null : now[p]; base[p] = ed.base[p] === undefined ? null : ed.base[p]; });
          res = await RCA.api('rec.save', { form, sub, unit, patch, base, force: force || [], submit: !!submit, progress: forms.progress(sch, ed.data) });
        }
        if (res.conflict || res.denied) {
          ed.readOnly = true; ed.dirty = false; ed.deny = res.denied || ''; await RCA.idb.del('drafts', key);
          await RCA.modal(res.denied ? 'Isian tidak dapat disimpan ke formulir' : 'Isian disimpan sebagai versi cadangan', h('div', null, h('p', null, res.denied || res.message),
            res.backup ? h('p', null, 'Perubahan Anda tidak hilang: disimpan sebagai versi cadangan untuk dipilih koordinator.') : null), [{ label: 'Mengerti', cls: 'primary', value: true }]);
          ed.reload(); return false;
        }
        const remote = res.rec ? mergeServer(res.rec, snap, (res.conflicts || []).map(c => c.path).filter(() => false)) : [];
        ed.forceConflict = false;
        await RCA.idb.set('drafts', key, { data: ed.data, base: ed.base, baseVersion: ed.baseVersion, savedAt: new Date().toISOString(), dirty: ed.dirty, email: RCA.state.user.email, form, sub, unit });
        setSave('Tersinkron ke server ' + new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + (res.applied ? ' · ' + res.applied + ' isian' : ''));
        if (res.conflicts && res.conflicts.length) {
          if (RCA.state.editor !== ed) { RCA.toast(unit + ': ' + res.conflicts.length + ' isian bertabrakan dengan pengisi lain. Buka unit lagi untuk memilih nilainya.', 'err', 9000); return false; }
          softRender(true);
          const forced = await CB.resolveConflicts(ed, res.conflicts);
          if (forced.length) return doSave(submit, forced);
          if (submit) RCA.toast('Isian bertabrakan sudah diselesaikan. Tekan Kirim lagi.', null, 6000);
          return !submit;
        }
        if (remote.length) { RCA.toast(remote.length + ' isian diperbarui dari pengisi lain', null, 4000); softRender(); }
        else CB.refreshBy(ed), ed.drawPresence && ed.drawPresence();
        if (submit) { RCA.state.heldLocks.delete(key); await RCA.idb.del('drafts', key); }
        return true;
      } catch (e) {
        setSave(e.code === 'OFFLINE' ? 'Offline: tersimpan di perangkat' : 'Gagal sinkron: ' + e.message);
        if (e.code !== 'OFFLINE') RCA.toast(e.message, 'err');
        return false;
      }
    }
    /** ambil perubahan pengisi lain (dipanggil detak bila versi server bertambah) */
    ed.pull = async function () {
      if (ed.pulling) return; ed.pulling = true;
      try {
        if (ed.dirty && !ed.readOnly) { await ed.saveServer(false); return; }
        const g = await RCA.api('rec.get', { form, sub, unit });
        ed.presence = g.presence || []; ed.tugas = g.tugas;
        const was = ed.readOnly, wasDeny = ed.deny; ed.deny = g.canEdit || '';
        if (!g.rec) return;
        // pembanding = isian server yang terakhir diketahui; perubahan lokal yang diketik selama menunggu tetap dipertahankan
        const remote = mergeServer(g.rec, Object.assign({}, ed.base));
        if (!was && ed.deny) { ed.readOnly = true; RCA.toast('Mode baca: ' + ed.deny, 'err', 8000); softRender(true); return; }
        if (was && !ed.deny && wasDeny && RCA.can.fill()) { const lk = await RCA.api('rec.lock', { form, sub, unit }); if (lk.ok) { ed.readOnly = false; ed.held = true; RCA.toast('Anda sekarang dapat mengisi unit ini', 'ok'); softRender(true); return; } }
        if (remote.length) { RCA.toast(remote.length + ' isian diperbarui dari pengisi lain', null, 4000); softRender(); } else ed.drawPresence && ed.drawPresence();
      } catch (e) { /* diam: dicoba lagi pada detak berikutnya */ }
      finally { ed.pulling = false; }
    };
    ed.reload = () => forms.openEditor(main, form, sub, unit);
    ed.rerender = () => render();
    /** gambar ulang tanpa mengganggu isian yang sedang diketik */
    let pending = false;
    function softRender(now) {
      if (RCA.state.editor !== ed) return;
      const a = document.activeElement;
      if (!now && a && main.contains(a) && /INPUT|TEXTAREA|SELECT/.test(a.tagName)) {
        if (!pending) { pending = true; main.addEventListener('focusout', function f() { setTimeout(() => { const b = document.activeElement; if (b && main.contains(b) && /INPUT|TEXTAREA|SELECT/.test(b.tagName)) return; main.removeEventListener('focusout', f); pending = false; keepView(render); }, 300); }); }
        return;
      }
      keepView(render);
    }
    function keepView(fn) {
      const open = [...main.querySelectorAll('details.sec')].map(d => d.open), y = window.scrollY;
      fn();
      main.querySelectorAll('details.sec').forEach((d, i) => { if (open[i] !== undefined) d.open = open[i]; });
      window.scrollTo(0, y);
    }

    let saveEl, lastSave = '';
    const setSave = t => { lastSave = t; if (saveEl) saveEl.textContent = t; RCA.renderSyncPill(); };

    function render() {
      ed.autos = []; ed.counters = []; ed.visibility = []; ed.byEls = [];
      main.innerHTML = '';
      const st = ed.rec ? ed.rec.status : 'Belum';
      const title = (sch.title || sub);
      saveEl = h('span', { class: 'saveinfo', 'aria-live': 'polite' }, lastSave && !ed.dirty ? lastSave : ed.dirty ? 'Ada perubahan di perangkat' : (ed.rec ? 'Versi server ' + ed.rec.version + ' · ' + RCA.fmtDT(ed.rec.updated_at) : 'Belum ada isian'));
      main.appendChild(h('div', { class: 'editor-head' },
        h('div', { class: 'row' }, h('div', null, h('small', null, h('a', { href: '#/form/' + form }, S.forms[form].title), ' › ', title), h('h1', null, unit)),
          h('div', { class: 'row' }, h('span', { class: 'st st-' + st }, st), saveEl)),
        CB.presenceBar(ed)));
      if (ed.rec && ed.rec.return_note && st === 'Dikembalikan') main.appendChild(h('div', { class: 'notice err', style: { marginBottom: '12px' } }, h('b', null, 'Catatan koordinator: '), ed.rec.return_note));
      if (ed.readOnly && ed.deny && RCA.can.fill()) {
        main.appendChild(h('div', { class: 'notice warn', style: { marginBottom: '12px' } }, h('b', null, 'Mode baca. '), ed.deny,
          RCA.can.review() && st !== 'Valid' ? h('div', { style: { marginTop: '8px' } }, h('button', { class: 'btn small', type: 'button', onclick: assign }, 'Atur penugasan')) : null));
      } else if (ed.readOnly && RCA.can.fill() && st !== 'Belum') {
        main.appendChild(h('div', { class: 'notice', style: { marginBottom: '12px' } }, st === 'Valid' ? 'Rekaman sudah Valid dan terkunci. Koordinator dapat membukanya kembali.' : st === 'Dikirim' ? 'Rekaman sudah dikirim dan menunggu pemeriksaan koordinator.' : 'Mode baca.'));
      } else if (!ed.readOnly && (ed.presence || []).some(p => p.email !== RCA.state.user.email)) {
        main.appendChild(h('div', { class: 'notice', style: { marginBottom: '12px' } }, 'Formulir ini dapat diisi bersama. Isian yang Anda ubah tersimpan atas nama Anda; isian pengisi lain diperbarui otomatis. Bila dua orang mengubah isian yang sama, Anda diminta memilih nilainya.'));
      }
      if (ed.offlineEdit) main.appendChild(h('div', { class: 'notice warn', style: { marginBottom: '12px' } }, 'Anda membuka unit ini saat offline. Isian disimpan di perangkat dan digabungkan dengan isian pengisi lain saat koneksi kembali.'));
      relatedPanel(ed).forEach(x => main.appendChild(x));
      const tools = h('div', { class: 'row edtools', style: { marginBottom: '10px' } },
        h('button', { class: 'btn small ghost', type: 'button', onclick: () => main.querySelectorAll('details.sec').forEach(d => d.open = true) }, h('span', { class: 'hide-sm' }, 'Buka semua bagian'), h('span', { class: 'show-sm' }, 'Buka semua')),
        h('button', { class: 'btn small ghost', type: 'button', onclick: () => main.querySelectorAll('details.sec').forEach(d => d.open = false) }, h('span', { class: 'hide-sm' }, 'Tutup semua bagian'), h('span', { class: 'show-sm' }, 'Tutup semua')),
        h('button', { class: 'btn small ghost', type: 'button', 'aria-pressed': 'false', onclick: e => { const on = e.currentTarget.getAttribute('aria-pressed') !== 'true'; e.currentTarget.setAttribute('aria-pressed', String(on)); e.currentTarget.textContent = on ? 'Sembunyikan semua petunjuk' : 'Tampilkan semua petunjuk'; RCA.help.toggleAll(main, on); } }, 'Tampilkan semua petunjuk'),
        h('span', { class: 'muted small edhint' }, 'Tekan ? untuk penjelasan. ✓ Nama = pengisi; ● = perubahan Anda belum tersinkron.'));
      const legend = h('div', { class: 'needlegend', role: 'note' },
        h('span', { class: 'lg filled' }, 'Sudah diisi'), h('span', { class: 'lg wajib' }, 'Wajib, belum diisi (*)'),
        h('span', { class: 'lg perlu' }, 'Belum diisi'), h('span', { class: 'lg opsional' }, 'Opsional'),
        h('label', { class: 'onlyempty' }, h('input', { type: 'checkbox', checked: !!ed.onlyEmpty, onchange: e => { ed.onlyEmpty = e.target.checked; main.classList.toggle('only-empty', ed.onlyEmpty); } }), ' Tampilkan hanya yang belum diisi'));
      main.classList.toggle('only-empty', !!ed.onlyEmpty);
      main.appendChild(tools); main.appendChild(legend);
      sch.sections.forEach(sec => main.appendChild(renderSection(sec, ed)));
      main.appendChild(h('datalist', { id: 'srcCodes' }, ['W', 'RM1', 'RM2', 'TB1', 'HIV1', 'HIV2', 'LAB1', 'FAR1', 'TPT1', 'RUJ1', 'KOM1', 'SITB', 'SIHA'].map(x => h('option', { value: x }))));
      ed.autos.forEach(f => f()); ed.visibility.forEach(f => f());
      main.appendChild(footer());
      RCA.collab.drawFocus(ed);
    }

    function footer() {
      const st = ed.rec ? ed.rec.status : 'Belum';
      const fb = h('div', { class: 'footerbar' });
      const left = h('div', { class: 'left' }, h('a', { class: 'btn', href: '#/form/' + form }, h('span', { class: 'hide-sm' }, 'Kembali ke daftar'), h('span', { class: 'show-sm' }, 'Kembali')),
        ed.rec ? h('button', { class: 'btn ghost', type: 'button', onclick: () => showHistory() }, 'Riwayat') : null);
      fb.appendChild(left);
      const more = [];
      more.push({ label: 'Cek isian', fn: () => RCA.collab.checkModal(ed, missingRequired(ed), 'cek') });
      if (!ed.readOnly) more.push({ label: 'Ajak mengisi / serahkan', fn: handover });
      if (RCA.can.review() && st !== 'Valid') more.push({ label: 'Penugasan', fn: assign });
      if (ed.rec) more.push({ label: 'Riwayat', fn: showHistory, sm: true });
      const menuBtn = h('button', { class: 'btn', type: 'button', 'aria-haspopup': 'true', 'aria-expanded': 'false' }, h('span', { class: 'hide-sm' }, 'Lainnya'), h('span', { class: 'show-sm' }, '⋯'));
      const menu = h('div', { class: 'popmenu', hidden: true, role: 'menu' }, more.map(m => h('button', { type: 'button', role: 'menuitem', class: m.sm ? 'show-sm-block' : '', onclick: () => { menu.hidden = true; menuBtn.setAttribute('aria-expanded', 'false'); m.fn(); } }, m.label)));
      menuBtn.addEventListener('click', e => { e.stopPropagation(); menu.hidden = !menu.hidden; menuBtn.setAttribute('aria-expanded', String(!menu.hidden)); });
      const closeMenu = () => { if (!document.body.contains(menu)) return document.removeEventListener('click', closeMenu); menu.hidden = true; menuBtn.setAttribute('aria-expanded', 'false'); };
      document.addEventListener('click', closeMenu);
      fb.appendChild(h('div', { class: 'popwrap' }, menuBtn, menu));
      if (!ed.readOnly) {
        fb.appendChild(h('button', { class: 'btn', type: 'button', onclick: async () => { if (await ed.saveServer(false)) RCA.toast('Tersimpan ke server', 'ok'); } }, 'Simpan'));
        fb.appendChild(h('button', { class: 'btn primary', type: 'button', onclick: submit }, st === 'Dikembalikan' ? 'Kirim ulang' : [h('span', { class: 'hide-sm' }, 'Cek & kirim'), h('span', { class: 'show-sm' }, 'Kirim')]));
      }
      if (RCA.can.review() && st === 'Dikirim') {
        fb.appendChild(h('button', { class: 'btn danger', type: 'button', onclick: () => review('return') }, h('span', { class: 'hide-sm' }, 'Kembalikan untuk dicek'), h('span', { class: 'show-sm' }, 'Kembalikan')));
        fb.appendChild(h('button', { class: 'btn ok', type: 'button', onclick: () => review('validate') }, 'Tandai Valid'));
      }
      if (RCA.can.review() && st === 'Valid') fb.appendChild(h('button', { class: 'btn', type: 'button', onclick: () => review('reopen') }, 'Buka kembali'));
      return fb;
    }
    async function handover() {
      try { const r = await RCA.collab.handover(ed); if (!r) return; ed.tugas = r.tugas; await ed.pull(); softRender(true); }
      catch (e) { RCA.toast(e.message, 'err'); }
    }
    async function assign() {
      try { const r = await RCA.collab.assign([{ form, sub, unit }], ed.tugas); if (r) { const g = await RCA.api('rec.get', { form, sub, unit }); ed.tugas = g.tugas; ed.presence = g.presence; softRender(true); } }
      catch (e) { RCA.toast(e.message, 'err'); }
    }
    async function submit() {
      if (!RCA.state.online) return RCA.toast('Kirim final memerlukan koneksi internet. Isian aman di perangkat.', 'err');
      if (ed.dirty) { const ok = await ed.saveServer(false); if (!ok) return; }
      const go = await RCA.collab.checkModal(ed, missingRequired(ed), 'kirim');
      if (!go) return;
      if (await ed.saveServer(true)) { if ((ed.rec || {}).status === 'Dikirim') { RCA.toast('Terkirim. Terima kasih.', 'ok'); location.hash = '#/form/' + form; } }
    }
    async function review(decision) {
      let note = '';
      if (decision === 'return' || decision === 'reopen') {
        note = await RCA.prompt(decision === 'return' ? 'Kembalikan untuk dicek ulang' : 'Buka kembali rekaman Valid', 'Catatan untuk enumerator (apa yang perlu dicek atau diperbaiki)', { multiline: true, required: true, ok: decision === 'return' ? 'Kembalikan' : 'Buka kembali' });
        if (!note) return;
      } else if (!await RCA.confirm('Tandai Valid', 'Rekaman ' + unit + ' dinyatakan benar dan lengkap, lalu masuk Dashboard Analisis.', 'Tandai Valid', 'ok')) return;
      try { ed.rec = await RCA.api('rec.review', { form, sub, unit, decision, note }); RCA.toast(decision === 'validate' ? 'Ditandai Valid' : 'Dikembalikan ke enumerator', 'ok'); ed.reload(); }
      catch (e) { RCA.toast(e.message, 'err'); }
    }
    async function showHistory() {
      try {
        const hs = await RCA.api('rec.history', { form, sub, unit });
        RCA.modal('Riwayat ' + unit, h('div', { class: 'table-wrap' }, h('table', { class: 't' }, h('thead', null, h('tr', null, ['Waktu', 'Pengguna', 'Aksi', 'Status', 'Versi', 'Catatan'].map(x => h('th', null, x)))),
          h('tbody', null, hs.map(x => h('tr', null, h('td', null, RCA.fmtDT(x.ts)), h('td', null, x.email), h('td', null, x.action), h('td', null, x.status), h('td', { class: 'n' }, x.version), h('td', null, x.note)))))), null, { wide: true });
      } catch (e) { RCA.toast(e.message, 'err'); }
    }

    render();
    // posisi pengisian: isian yang sedang difokus dikirim lewat detak agar pengisi lain melihat penandanya
    const fieldPath = t => { const el = t && t.closest && t.closest('[data-path]'); return el && (main.contains(el) || el.closest('.modal')) ? el.getAttribute('data-path') : ''; };
    const onIn = e => { if (RCA.state.editor !== ed || ed.readOnly) return; const p = fieldPath(e.target); if (p && p !== ed.myFocus) { ed.myFocus = p; RCA.beatSoon && RCA.beatSoon(); } };
    const onOut = () => setTimeout(() => { if (RCA.state.editor !== ed) return; const p = fieldPath(document.activeElement); if (p !== ed.myFocus) { ed.myFocus = p; RCA.beatSoon && RCA.beatSoon(); } }, 400);
    document.addEventListener('focusin', onIn); document.addEventListener('focusout', onOut);
    ed.cleanup = () => { document.removeEventListener('focusin', onIn); document.removeEventListener('focusout', onOut); };
    // sinkron berkala
    clearInterval(RCA.state.syncTimer);
    RCA.state.syncTimer = setInterval(() => { if (RCA.state.editor === ed && ed.dirty && RCA.state.online && !ed.readOnly && !ed.offlineEdit) ed.saveServer(false); }, 20000);
    if (fromCache) confirmServer(); else if (ed.dirty && !ed.readOnly && RCA.state.online && ed.held) ed.saveServer(false);
    /** dibuka dari salinan perangkat: cocokkan dengan server (isian orang lain, status, hak isi) tanpa menghapus ketikan */
    async function confirmServer() {
      let g;
      try { g = await fetchP; } catch (e) {
        if (RCA.state.editor !== ed) return;
        if (e.code === 'OFFLINE') { ed.offlineEdit = true; setSave('Offline: memakai salinan di perangkat'); return; }
        ed.readOnly = true; RCA.toast(e.message, 'err', 8000); softRender(true); return;
      }
      RCA.idb.set('cache', 'rec|' + key, g);
      if (RCA.state.editor !== ed) return;
      ed.presence = g.presence || []; ed.tugas = g.tugas; ed.related = g.related || ed.related;
      const wasRO = ed.readOnly; ed.deny = g.canEdit || '';
      if (canFillHere && !g.opened && !ed.deny) {
        try { const lk = await RCA.api('rec.lock', { form, sub, unit }); ed.presence = lk.presence || ed.presence; ed.deny = lk.deny || ''; } catch (e) { }
      }
      if (canFillHere) { ed.readOnly = !!ed.deny; ed.held = !ed.deny; }
      let remote = [];
      if (g.rec && (!ed.rec || g.rec.version !== ed.rec.version)) remote = mergeServer(g.rec, Object.assign({}, ed.base));
      if (wasRO !== ed.readOnly || remote.length) { if (!wasRO && ed.readOnly && ed.deny) RCA.toast('Mode baca: ' + ed.deny, 'err', 8000); softRender(true); }
      else { CB.refreshBy(ed); ed.drawPresence && ed.drawPresence(); }
      if (ed.dirty && !ed.readOnly && ed.held) ed.saveServer(false);
    }
  };

  forms.closeEditor = async function () {
    const ed = RCA.state.editor;
    if (!ed) return;
    RCA.state.editor = null;
    if (ed.cleanup) ed.cleanup();
    RCA.$('#main').classList.remove('only-empty');
    clearInterval(RCA.state.syncTimer);
    if (!ed.readOnly && ed.dirty && RCA.state.online) await ed.saveServer(false);
    RCA.state.heldLocks.delete(ed.key);
    if (RCA.state.online) RCA.api('rec.unlock', { form: ed.form, sub: ed.sub, unit: ed.unit }).catch(() => {});
  };
})();
