/* admin.js — menu pengelolaan: form, data, dashboard, laporan, master, bagikan, embed, pengaturan */
const Admin = (() => {
  const M = () => Master.data;

  /* ---- filter bersama ---- */
  function filterBar(st, opt = {}) {
    const forms = M().forms;
    const fks = Master.myFaskes();
    const units = st.faskes_id ? Master.unitsOf(st.faskes_id) : [];
    return `<div class="card" style="padding:12px"><div class="field" style="margin-bottom:8px"><select class="inp" data-flt="form_id">${UI.opts(forms, st.form_id, 'id', 'judul')}</select></div>
      <div class="filters">
        <select class="inp" data-flt="faskes_id">${UI.opts(fks, st.faskes_id, 'id', 'nama', 'Semua fasilitas')}</select>
        <select class="inp" data-flt="unit_id" ${units.length ? '' : 'disabled'}>${UI.opts(units, st.unit_id, 'id', 'nama', 'Semua unit')}</select>
        <input type="date" class="inp" data-flt="dari" value="${esc(st.dari || '')}" title="Dari tanggal">
        <input type="date" class="inp" data-flt="sampai" value="${esc(st.sampai || '')}" title="Sampai tanggal">
        ${opt.status ? `<select class="inp" data-flt="status">${UI.opts([{ id: 'baru', nama: 'Baru' }, { id: 'valid', nama: 'Valid' }, { id: 'ditolak', nama: 'Ditolak' }], st.status, 'id', 'nama', 'Semua status')}</select>` : `<button class="btn line sm" data-flt-reset>Reset</button>`}
      </div></div>`;
  }
  function bindFilter(root, st, onChange) {
    $$('[data-flt]', root).forEach(el => el.onchange = () => {
      st[el.dataset.flt] = el.value;
      if (el.dataset.flt === 'faskes_id') st.unit_id = '';
      if (el.dataset.flt === 'form_id') { const p = Master.period((Master.form(el.value) || {}).periode_id); st.dari = p ? p.mulai : ''; st.sampai = p ? p.selesai : ''; }
      onChange();
    });
    const r = $('[data-flt-reset]', root); if (r) r.onclick = () => { st.faskes_id = ''; st.unit_id = ''; st.dari = ''; st.sampai = ''; onChange(); };
  }
  function initState(q) {
    const forms = M().forms;
    const f = forms.find(x => x.id === q.form) || forms.find(x => x.status === 'aktif') || forms[0];
    const st = { form_id: f ? f.id : '', faskes_id: q.fk || '', unit_id: '', dari: '', sampai: '', status: '' };
    if (!Session.is('superadmin', 'koordinator') && Master.myFaskes().length === 1) st.faskes_id = Master.myFaskes()[0].id;
    return st;
  }
  const flt = st => ({ faskes_id: st.faskes_id, unit_id: st.unit_id, dari: st.dari, sampai: st.sampai, status: st.status });

  /* ================= FORM BUILDER ================= */
  async function forms(parts, q) {
    await Master.load();
    if (parts[1]) {
      let form;
      if (parts[1] === 'new') {
        form = q.tpl === 'standar' ? Core.templateStandar() : { judul: '', deskripsi: '', tipe: 'custom', faskes_mode: 'banyak', faskes_ids: [], unit_wajib: true, unit_ids: [], mode_input: ['enumerator', 'responden', 'kiosk'], dashboard_publik: false, status: 'draft', persetujuan: Core.templateStandar().persetujuan, pertanyaan: [] };
        const ap = M().periods.find(p => truthy(p.aktif)); if (ap) form.periode_id = ap.id;
      } else {
        form = Master.form(parts[1]);
        if (!form) throw new Error('Form tidak ditemukan');
      }
      App.view('<div id="bld"></div>', false);
      Builder.mount($('#bld'), form, {
        onSave: async saved => { await Master.load(true); if (parts[1] === 'new') history.replaceState(null, '', '#/forms/' + saved.id); }
      });
      return;
    }
    const list = M().forms;
    App.view(UI.topbar('Form Builder', { right: `<button class="ibtn" id="fm-new">${I('plus')}</button>` }) + `<div class="wrap narrow mt">
      <div class="row" style="gap:8px"><a class="btn ghost grow" href="#/forms/new?tpl=standar">${I('star')} Instrumen Standar</a><a class="btn grow" href="#/forms/new">${I('plus')} Instrumen Baru</a></div>
      <div class="list mt">${list.length ? list.map(f => `<div class="li" data-id="${f.id}"><div class="li-ico ${f.tipe === 'standar' ? 'c7' : 'c4'}">${I(f.tipe === 'standar' ? 'star' : 'build')}</div>
        <div class="grow"><div class="li-t">${esc(f.judul)}</div><div class="li-s">${f.pertanyaan.filter(x => !Core.NON_INPUT[x.tipe]).length} pertanyaan · ${esc((Master.period(f.periode_id) || {}).nama || 'tanpa periode')} · ${f.faskes_ids && f.faskes_ids.length ? f.faskes_ids.length + ' fasilitas' : 'semua fasilitas'}</div></div>
        <span class="chip ${f.status === 'aktif' ? 'ok' : f.status === 'ditutup' ? 'gray' : 'warn'}">${esc(f.status)}</span></div>`).join('') : UI.empty('Belum ada form. Mulai dari instrumen standar atau buat baru.', 'build')}</div></div>`);
    $('#fm-new').onclick = () => location.hash = '#/forms/new';
    $$('[data-id]').forEach(li => li.onclick = () => formMenu(Master.form(li.dataset.id)));
  }
  function truthy(v) { return v === true || v === 'TRUE' || v === 'true' || v === 1; }

  function formMenu(f) {
    const item = (act, ico, t, c) => `<div class="li" data-act="${act}"><div class="li-ico ${c}">${I(ico)}</div><div class="grow li-t">${t}</div></div>`;
    const s = UI.sheet(`<div class="list">${item('edit', 'edit', 'Edit pertanyaan & pengaturan', 'c4')}${item('status', 'check', f.status === 'aktif' ? 'Tutup survei' : 'Aktifkan survei', 'c6')}${item('share', 'qr', 'Bagikan (QR / tautan / WA)', 'c9')}${item('dash', 'pie', 'Lihat dashboard', 'c2')}${item('dup', 'copy', 'Duplikat form', 'c8')}${item('del', 'trash', 'Hapus form', 'c10')}</div>`, { title: f.judul });
    $$('[data-act]', s).forEach(x => x.onclick = async () => {
      const a = x.dataset.act; s.remove();
      if (a === 'edit') location.hash = '#/forms/' + f.id;
      if (a === 'share') location.hash = '#/bagikan?form=' + f.id;
      if (a === 'dash') location.hash = '#/dashboard?form=' + f.id;
      if (a === 'status') { const nf = Object.assign({}, f, { status: f.status === 'aktif' ? 'ditutup' : 'aktif' }); await API.call('save', { table: 'forms', row: { id: f.id, schema: nf } }); await Master.load(true); UI.toast('Status: ' + nf.status, 'ok'); App.route(); }
      if (a === 'dup') { const nf = JSON.parse(JSON.stringify(f)); delete nf.id; nf.judul += ' (salinan)'; nf.status = 'draft'; await API.call('save', { table: 'forms', row: { schema: nf } }); await Master.load(true); UI.toast('Form diduplikat', 'ok'); App.route(); }
      if (a === 'del') { if (!(await UI.confirm('Hapus form "' + f.judul + '"? Data respons di spreadsheet tidak ikut terhapus.', 'Hapus', true))) return; await API.call('remove', { table: 'forms', id: f.id }); await Master.load(true); App.route(); }
    });
  }

  /* ================= DATA RESPONS ================= */
  async function data(parts, q) {
    await Master.load();
    const st = initState(q);
    let rows = [], search = '';
    const draw = async () => {
      App.view(UI.topbar('Data Respons', { right: `<a class="ibtn" href="#/impor?form=${st.form_id}" title="Impor data">${I('upl')}</a><button class="ibtn" id="d-exp" title="Ekspor">${I('dl')}</button>` }) + `<div class="wrap mt">${filterBar(st, { status: true })}
        <div class="row mt"><input class="inp grow" id="d-q" placeholder="Cari jawaban, petugas, ID…" value="${esc(search)}"></div><div id="d-body" class="mt">${UI.loader()}</div></div>`);
      bindFilter($('#app'), st, draw);
      $('#d-exp').onclick = () => exportData(st, rows);
      if (!st.form_id) { $('#d-body').innerHTML = UI.empty('Belum ada form.'); return; }
      try { rows = await API.call('responses', { form_id: st.form_id, filter: flt(st) }); }
      catch (e) { $('#d-body').innerHTML = UI.empty(e.message, 'x'); return; }
      const body = () => table(st, rows, search);
      body();
      $('#d-q').oninput = e => { search = e.target.value; body(); };
    };
    draw();
  }
  function table(st, rows, search) {
    const form = Master.form(st.form_id);
    const qs = form.pertanyaan.filter(x => !Core.NON_INPUT[x.tipe]).slice(0, 6);
    const s = search.toLowerCase();
    const list = rows.filter(r => !s || JSON.stringify(r).toLowerCase().includes(s)).sort((a, b) => a.ts < b.ts ? 1 : -1);
    const cnt = { baru: 0, valid: 0, ditolak: 0 }; rows.forEach(r => cnt[r.status] = (cnt[r.status] || 0) + 1);
    $('#d-body').innerHTML = `<div class="row wrap" style="margin-bottom:10px"><span class="chip">${list.length} data</span><span class="chip warn">Baru ${cnt.baru || 0}</span><span class="chip ok">Valid ${cnt.valid || 0}</span><span class="chip bad">Ditolak ${cnt.ditolak || 0}</span></div>
      ${list.length ? `<div class="tbl-wrap" style="max-height:65vh"><table class="tbl"><tr><th>Waktu</th><th>Fasilitas</th><th>Unit</th><th>Mode</th><th>Status</th>${qs.map(x => `<th>${esc(x.id)}</th>`).join('')}</tr>
      ${list.slice(0, 500).map(r => `<tr data-r="${r.id}" style="cursor:pointer"><td>${fmt.dt(r.ts)}</td><td>${esc(Master.faskesName(r.faskes_id))}</td><td>${esc(Master.unitName(r.unit_id))}</td><td>${esc(r.mode)}</td><td><span class="chip ${r.status === 'valid' ? 'ok' : r.status === 'ditolak' ? 'bad' : 'warn'}">${esc(r.status)}</span></td>${qs.map(x => `<td>${esc(short(x, r.data[x.id]))}</td>`).join('')}</tr>`).join('')}</table></div>
      ${list.length > 500 ? '<p class="small muted">Menampilkan 500 data terbaru. Gunakan filter atau ekspor untuk data lengkap.</p>' : ''}` : UI.empty('Tidak ada data untuk filter ini.', 'table')}`;
    $$('[data-r]').forEach(tr => tr.onclick = () => detail(form, rows.find(r => r.id === tr.dataset.r), () => table(st, rows, search)));
  }
  function short(q, v) {
    if (v === undefined || v === null) return '';
    if (Array.isArray(v)) return v.map(x => Dash.optLabel(q, x)).join(', ');
    if (typeof v === 'object') return '…';
    if (String(v).startsWith('data:') || String(v).startsWith('http')) return '[berkas]';
    const s = q.opsi && q.tipe !== 'skala_ikm' ? Dash.optLabel(q, v) : String(v);
    return s.length > 40 ? s.slice(0, 40) + '…' : s;
  }
  function detail(form, r, refresh) {
    const canEdit = Session.is('superadmin', 'datamanager');
    const val = (q, v) => {
      if (v === undefined || v === '') return '<span class="muted">—</span>';
      if (typeof v === 'string' && (v.startsWith('data:image') )) return `<img src="${esc(v)}" style="max-width:100%;max-height:160px;border-radius:8px">`;
      if (typeof v === 'string' && v.startsWith('http')) return `<a href="${esc(v)}" target="_blank">Buka berkas</a>`;
      if (q.tipe === 'matriks') return Object.keys(v).map(k => esc(((q.baris || []).find(b => b.v === k) || {}).l || k) + ': ' + esc(Dash.optLabel(q, v[k]))).join('<br>');
      if (Array.isArray(v)) return v.map(x => esc(Dash.optLabel(q, x))).join(', ');
      return esc(q.opsi || q.tipe === 'ya_tidak' ? (q.tipe === 'skala_ikm' ? v + ' — ' + Dash.optLabel(q, v) : Dash.optLabel(q, v)) : v);
    };
    const s = UI.sheet(`<div class="small muted">${esc(r.id)} · ${fmt.dt(r.ts)} · ${esc(r.mode)}${r.petugas ? ' · ' + esc(r.petugas) : ''}</div>
      <div class="small mt"><b>${esc(Master.faskesName(r.faskes_id))}</b>${r.unit_id ? ' · ' + esc(Master.unitName(r.unit_id)) : ''}</div>
      <div class="mt">${form.pertanyaan.filter(q => !Core.NON_INPUT[q.tipe]).map(q => `<div style="padding:8px 0;border-bottom:1px solid var(--line)"><div class="small muted">${esc(q.label)}</div><div style="font-weight:600">${val(q, r.data[q.id])}</div></div>`).join('')}</div>
      ${canEdit ? `<div class="row mt"><button class="btn grow" data-st="valid">${I('check')} Valid</button><button class="btn danger grow" data-st="ditolak">${I('x')} Tolak</button></div>
      <div class="row mt"><button class="btn line grow" id="dt-edit">${I('edit')} Edit jawaban</button><button class="btn line" id="dt-del" style="color:var(--bad)">${I('trash')}</button></div>` : ''}`, { title: 'Detail respons' });
    if (!canEdit) return;
    $$('[data-st]', s).forEach(b => b.onclick = async () => { await API.call('updateResponse', { form_id: form.id, id: r.id, status: b.dataset.st }); r.status = b.dataset.st; s.remove(); UI.toast('Status diperbarui', 'ok'); refresh(); });
    $('#dt-del', s).onclick = async () => { if (!(await UI.confirm('Hapus respons ini secara permanen?', 'Hapus', true))) return; await API.call('deleteResponse', { form_id: form.id, id: r.id }); s.remove(); UI.toast('Respons dihapus'); App.route(); };
    $('#dt-edit', s).onclick = () => {
      s.remove();
      const qs = form.pertanyaan.filter(q => !Core.NON_INPUT[q.tipe] && !['foto', 'tandatangan', 'matriks', 'kotakcentang', 'lokasi'].includes(q.tipe));
      const e = UI.sheet(`${qs.map(q => `<div class="field"><label>${esc(q.label)}</label>${q.opsi || q.tipe === 'ya_tidak' ? `<select class="inp" data-e="${q.id}">${UI.opts(q.tipe === 'ya_tidak' ? [{ v: '1', l: 'Ya' }, { v: '0', l: 'Tidak' }] : q.opsi, r.data[q.id], 'v', 'l', '—')}</select>` : `<input class="inp" data-e="${q.id}" value="${esc(r.data[q.id] ?? '')}">`}</div>`).join('')}
        <button class="btn block" id="e-save">Simpan perubahan</button>`, { title: 'Edit jawaban' });
      $('#e-save', e).onclick = async () => {
        const d = Object.assign({}, r.data);
        $$('[data-e]', e).forEach(i => { const q = form.pertanyaan.find(x => x.id === i.dataset.e); d[i.dataset.e] = (q.tipe === 'angka' || q.tipe === 'desimal') && i.value !== '' ? Number(i.value) : i.value; });
        await API.call('updateResponse', { form_id: form.id, id: r.id, data: d }); r.data = d; e.remove(); UI.toast('Jawaban diperbarui', 'ok'); refresh();
      };
    };
  }
  async function exportData(st, rows) {
    if (!rows.length) { UI.toast('Tidak ada data'); return; }
    const form = Master.form(st.form_id);
    const s = UI.sheet(`<div class="list"><div class="li" data-x="xlsx"><div class="li-ico c6">${I('table')}</div><div class="grow li-t">Excel (.xlsx)</div></div><div class="li" data-x="csv"><div class="li-ico c8">${I('doc')}</div><div class="grow li-t">CSV</div></div><div class="li" data-x="json"><div class="li-ico c9">${I('code')}</div><div class="grow li-t">JSON (cadangan)</div></div></div>`, { title: 'Ekspor ' + rows.length + ' data' });
    $$('[data-x]', s).forEach(b => b.onclick = async () => {
      s.remove();
      const flat = Report.flatRows(form, rows, { faskes: M().faskes, units: M().units });
      const name = 'data-' + form.judul.replace(/\W+/g, '_').slice(0, 40) + '-' + fmt.today();
      if (b.dataset.x === 'xlsx') { await Lib.xlsx(); const wb = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(flat), 'Data'); XLSX.writeFile(wb, name + '.xlsx'); }
      if (b.dataset.x === 'csv') { const keys = Object.keys(flat[0]); const csv = [keys.join(',')].concat(flat.map(o => keys.map(k => '"' + String(o[k] ?? '').replace(/"/g, '""') + '"').join(','))).join('\n'); UI.download(name + '.csv', new Blob(['﻿' + csv], { type: 'text/csv' })); }
      if (b.dataset.x === 'json') UI.download(name + '.json', new Blob([JSON.stringify(rows, null, 2)], { type: 'application/json' }));
    });
  }

  /* ================= DASHBOARD ================= */
  async function dashboard(parts, q) {
    await Master.load();
    const st = initState(q);
    const p = Master.period((Master.form(st.form_id) || {}).periode_id);
    if (p && !q.all) { st.dari = p.mulai; st.sampai = p.selesai; }
    const draw = async () => {
      const form = Master.form(st.form_id);
      App.view(UI.topbar('Dashboard', { noBack: true, right: form && form.dashboard_publik ? `<a class="ibtn" href="#/pd/${form.id}" title="Versi publik">${I('globe')}</a>` : '' }) + `<div class="wrap mt">${filterBar(st)}<div id="db" class="mt">${UI.loader('Menghitung IKM…')}</div></div>`);
      bindFilter($('#app'), st, draw);
      if (!form) { $('#db').innerHTML = UI.empty('Belum ada form.'); return; }
      try {
        const agg = await API.call('aggregate', { form_id: form.id, filter: flt(st) });
        await Dash.render($('#db'), { form, agg, faskes: M().faskes, units: M().units, publik: false });
      } catch (e) { $('#db').innerHTML = UI.empty(e.message, 'x'); }
    };
    draw();
  }

  /* ================= LAPORAN ================= */
  function range(kind, val, year) {
    const y = parseInt(year, 10) || new Date().getFullYear();
    const pad = n => String(n).padStart(2, '0');
    const last = (yy, m) => new Date(yy, m, 0).getDate();
    if (kind === 'bulan') { const m = parseInt(val, 10); return [`${y}-${pad(m)}-01`, `${y}-${pad(m)}-${last(y, m)}`, new Date(y, m - 1, 1).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })]; }
    if (kind === 'triwulan') { const t = parseInt(val, 10); const a = (t - 1) * 3 + 1, b = a + 2; return [`${y}-${pad(a)}-01`, `${y}-${pad(b)}-${last(y, b)}`, `Triwulan ${['I', 'II', 'III', 'IV'][t - 1]} Tahun ${y}`]; }
    if (kind === 'semester') { const s = parseInt(val, 10); return s === 1 ? [`${y}-01-01`, `${y}-06-30`, `Semester I Tahun ${y}`] : [`${y}-07-01`, `${y}-12-31`, `Semester II Tahun ${y}`]; }
    if (kind === 'tahun') return [`${y}-01-01`, `${y}-12-31`, `Tahun ${y}`];
    return null;
  }
  async function laporan(parts, q) {
    await Master.load();
    const S = M().settings;
    const st = initState(q);
    const yr = new Date().getFullYear();
    const meta = { jenis: 'periode', val: '1', tahun: yr, nomor: '', tanggal: fmt.today(), kota: S.kota || '', jabatan: 'Kepala ' + (S.instansi || ''), penandatangan: S.kepala_dinas || '', nip: S.nip_kepala_dinas || '', populasi: '' };
    let built = null, aggCache = null;
    const draw = () => {
      const form = Master.form(st.form_id);
      App.view(UI.topbar('Laporan SKM') + `<div class="wrap mt"><div class="grid2"><div>
        <div class="card"><h3>1. Data survei</h3>
          <div class="field"><label>Survei</label><select class="inp" id="lp-form">${UI.opts(M().forms, st.form_id, 'id', 'judul')}</select></div>
          <div class="field"><label>Cakupan</label><select class="inp" id="lp-fk">${UI.opts(Master.myFaskes(), st.faskes_id, 'id', 'nama', Session.is('superadmin', 'koordinator') ? 'Semua fasilitas (laporan Dinas)' : 'Semua fasilitas saya')}</select></div>
          <div class="field"><label>Periode laporan</label><select class="inp" id="lp-jenis">${[['periode', 'Sesuai periode survei'], ['bulan', 'Bulanan'], ['triwulan', 'Triwulan'], ['semester', 'Semester'], ['tahun', 'Tahunan'], ['custom', 'Rentang tanggal bebas']].map(o => `<option value="${o[0]}" ${meta.jenis === o[0] ? 'selected' : ''}>${o[1]}</option>`).join('')}</select></div>
          <div class="row" id="lp-pv">${periodInputs()}</div>
        </div>
        <div class="card"><h3>2. Identitas laporan</h3>
          <div class="field"><label>Nomor laporan (opsional)</label><input class="inp" data-m="nomor" value="${esc(meta.nomor)}"></div>
          <div class="row"><div class="field grow"><label>Kota</label><input class="inp" data-m="kota" value="${esc(meta.kota)}"></div><div class="field grow"><label>Tanggal</label><input type="date" class="inp" data-m="tanggal" value="${esc(meta.tanggal)}"></div></div>
          <div class="field"><label>Jabatan penanda tangan</label><input class="inp" data-m="jabatan" value="${esc(meta.jabatan)}"></div>
          <div class="field"><label>Nama penanda tangan</label><input class="inp" data-m="penandatangan" value="${esc(meta.penandatangan)}"></div>
          <div class="field"><label>NIP</label><input class="inp" data-m="nip" value="${esc(meta.nip)}"></div>
          <div class="field"><label>Populasi (untuk sampel Krejcie-Morgan)</label><input type="number" class="inp" data-m="populasi" value="${esc(meta.populasi || (form && form.populasi) || '')}"></div>
          <button class="btn lg block" id="lp-go">${I('doc')} Buat laporan</button>
        </div></div>
        <div><div class="card" id="lp-act" style="${built ? '' : 'display:none'}"><h3>3. Unduh / cetak</h3><div class="row wrap">
          <button class="btn" data-x="pdf">${I('dl')} PDF</button><button class="btn" style="background:#2563eb" data-x="doc">${I('dl')} Word</button><button class="btn" style="background:#16a34a" data-x="xlsx">${I('dl')} Excel</button><button class="btn line" data-x="print">${I('print')} Cetak</button></div>
          <p class="help">File Word (.docx) bisa diedit di Microsoft Word, WPS, LibreOffice, atau Google Docs.</p></div>
          <div class="report-stage mt" id="lp-stage">${built ? '' : `<div class="empty" style="background:#fff;margin:0 16px;border-radius:12px">${I('doc')}<p>Atur pilihan lalu tekan <b>Buat laporan</b> untuk melihat pratinjau A4.</p></div>`}</div></div>
      </div></div>`);
      $('#lp-form').onchange = e => { st.form_id = e.target.value; built = null; draw(); };
      $('#lp-fk').onchange = e => { st.faskes_id = e.target.value; };
      $('#lp-jenis').onchange = e => { meta.jenis = e.target.value; $('#lp-pv').innerHTML = periodInputs(); bindPv(); };
      $$('[data-m]').forEach(i => i.oninput = () => meta[i.dataset.m] = i.value);
      bindPv();
      $('#lp-go').onclick = generate;
      $$('[data-x]').forEach(b => b.onclick = () => exportRep(b.dataset.x));
      if (built) showPreview();
    };
    function periodInputs() {
      const j = meta.jenis;
      const yearSel = `<div class="field grow"><label>Tahun</label><input type="number" class="inp" data-p="tahun" value="${meta.tahun}"></div>`;
      if (j === 'bulan') return `<div class="field grow"><label>Bulan</label><select class="inp" data-p="val">${Array.from({ length: 12 }, (_, i) => `<option value="${i + 1}" ${String(meta.val) === String(i + 1) ? 'selected' : ''}>${new Date(2000, i, 1).toLocaleDateString('id-ID', { month: 'long' })}</option>`).join('')}</select></div>` + yearSel;
      if (j === 'triwulan') return `<div class="field grow"><label>Triwulan</label><select class="inp" data-p="val">${[1, 2, 3, 4].map(i => `<option value="${i}" ${String(meta.val) === String(i) ? 'selected' : ''}>Triwulan ${['I', 'II', 'III', 'IV'][i - 1]}</option>`).join('')}</select></div>` + yearSel;
      if (j === 'semester') return `<div class="field grow"><label>Semester</label><select class="inp" data-p="val"><option value="1" ${meta.val == 1 ? 'selected' : ''}>Semester I</option><option value="2" ${meta.val == 2 ? 'selected' : ''}>Semester II</option></select></div>` + yearSel;
      if (j === 'tahun') return yearSel;
      if (j === 'custom') return `<div class="field grow"><label>Dari</label><input type="date" class="inp" data-p="dari" value="${esc(meta.dari || '')}"></div><div class="field grow"><label>Sampai</label><input type="date" class="inp" data-p="sampai" value="${esc(meta.sampai || '')}"></div>`;
      const p = Master.period((Master.form(st.form_id) || {}).periode_id);
      return `<div class="help" style="margin:-4px 0 10px">${p ? esc(p.nama) + ' (' + fmt.date(p.mulai) + ' – ' + fmt.date(p.selesai) + ')' : 'Form belum memiliki periode — semua data dipakai.'}</div>`;
    }
    function bindPv() { $$('[data-p]').forEach(i => i.onchange = () => meta[i.dataset.p] = i.value); }
    async function generate() {
      const form = Master.form(st.form_id);
      if (!form) return;
      let dari = '', sampai = '', label = '';
      if (meta.jenis === 'periode') { const p = Master.period(form.periode_id); if (p) { dari = p.mulai; sampai = p.selesai; label = p.nama; } }
      else if (meta.jenis === 'custom') { dari = meta.dari || ''; sampai = meta.sampai || ''; label = fmt.date(dari) + ' s.d. ' + fmt.date(sampai); }
      else { const r = range(meta.jenis, meta.val, meta.tahun); dari = r[0]; sampai = r[1]; label = r[2]; }
      const stage = $('#lp-stage'); stage.innerHTML = UI.loader('Menyusun laporan…');
      try {
        const filter = { faskes_id: st.faskes_id, dari, sampai };
        aggCache = await API.call('aggregate', { form_id: form.id, filter });
        if (!aggCache.total) { stage.innerHTML = `<div class="empty" style="background:#fff;margin:0 16px;border-radius:12px">${I('x')}<p>Tidak ada respons pada periode ini.</p></div>`; return; }
        const m = Object.assign({}, meta, { faskes_id: st.faskes_id, dari, sampai, periode: label, populasi: meta.populasi || form.populasi });
        built = await Report.build({ form, agg: aggCache, settings: Object.assign({}, M().settings), faskes: M().faskes, units: M().units, meta: m });
        built.ctx = { form, agg: aggCache, faskes: M().faskes, units: M().units, meta: m, filter };
        $('#lp-act').style.display = '';
        showPreview();
        if (window.innerWidth < 860) $('#lp-act').scrollIntoView({ behavior: 'smooth' });
      } catch (e) { stage.innerHTML = UI.empty(e.message, 'x'); }
    }
    function showPreview() {
      const stage = $('#lp-stage');
      stage.innerHTML = `<div id="print-area"><div class="a4" id="lp-doc">${built.html}</div></div>`;
      const fit = () => { const w = stage.clientWidth - 16; const doc = $('#lp-doc'); const full = doc.offsetWidth; if (full > w) { const s = w / full; doc.style.transform = `scale(${s})`; doc.style.transformOrigin = 'top left'; $('#print-area').style.height = doc.offsetHeight * s + 'px'; doc.style.marginLeft = '8px'; } };
      requestAnimationFrame(fit);
    }
    async function exportRep(kind) {
      if (!built) return;
      const c = built.ctx;
      const name = 'Laporan_SKM_' + (c.meta.faskes_id ? Master.faskesName(c.meta.faskes_id) : (M().settings.instansi || 'Dinkes')).replace(/\W+/g, '_') + '_' + String(c.meta.periode).replace(/\W+/g, '_');
      const doc = $('#lp-doc');
      const plain = doc.cloneNode(true); plain.style.transform = ''; plain.style.marginLeft = '';
      try {
        UI.toast('Menyiapkan ' + kind.toUpperCase() + '…');
        if (kind === 'pdf') await Report.toPDF(plain, name);
        if (kind === 'doc') await Report.toWord(plain, name);
        if (kind === 'print') { doc.style.transform = ''; window.print(); showPreview(); }
        if (kind === 'xlsx') {
          let rows = [];
          try { rows = await API.call('responses', { form_id: c.form.id, filter: c.filter }); } catch (e) { }
          await Report.toExcel(c, built, rows, name);
        }
      } catch (e) { UI.toast('Gagal: ' + e.message, 'bad'); }
    }
    draw();
  }

  /* ================= PERIODE ================= */
  async function periode() {
    await Master.load(true);
    const list = M().periods.slice().sort((a, b) => a.mulai < b.mulai ? 1 : -1);
    App.view(UI.topbar('Periode Survei', { right: `<button class="ibtn" id="p-add">${I('plus')}</button>` }) + `<div class="wrap narrow mt">
      <div class="card small" style="background:var(--pri-soft);box-shadow:none">Setiap periode memiliki spreadsheet respons sendiri di Google Drive agar data tidak menumpuk (mis. per semester/tahun).</div>
      <div class="list mt">${list.length ? list.map(p => `<div class="li" data-id="${p.id}"><div class="li-ico c10">${I('cal')}</div><div class="grow"><div class="li-t">${esc(p.nama)}</div><div class="li-s">${fmt.date(p.mulai)} – ${fmt.date(p.selesai)}</div></div>${truthy(p.aktif) ? '<span class="chip ok">aktif</span>' : ''}</div>`).join('') : UI.empty('Belum ada periode.', 'cal')}</div></div>`);
    const edit = (p = {}) => {
      const s = UI.sheet(`<div class="field"><label>Nama periode</label><input class="inp" id="pe-n" value="${esc(p.nama || '')}" placeholder="mis. Semester I 2027"></div>
        <div class="row"><div class="field grow"><label>Mulai</label><input type="date" class="inp" id="pe-a" value="${esc(String(p.mulai || '').slice(0, 10))}"></div><div class="field grow"><label>Selesai</label><input type="date" class="inp" id="pe-b" value="${esc(String(p.selesai || '').slice(0, 10))}"></div></div>
        <label class="switch"><span>Periode aktif (default untuk form baru)</span><input type="checkbox" id="pe-on" ${truthy(p.aktif) ? 'checked' : ''}></label>
        ${p.spreadsheet_id && !DEMO ? `<a class="btn line block" target="_blank" href="https://docs.google.com/spreadsheets/d/${esc(p.spreadsheet_id)}">${I('table')} Buka spreadsheet respons</a>` : ''}
        <div class="row mt">${p.id ? `<button class="btn danger" id="pe-del">${I('trash')}</button>` : ''}<button class="btn grow" id="pe-ok">Simpan</button></div>`, { title: p.id ? 'Edit periode' : 'Periode baru' });
      $('#pe-ok', s).onclick = async () => {
        const row = Object.assign({}, p, { nama: $('#pe-n', s).value, mulai: $('#pe-a', s).value, selesai: $('#pe-b', s).value, aktif: $('#pe-on', s).checked });
        if (!row.nama || !row.mulai || !row.selesai) { UI.toast('Lengkapi nama dan tanggal', 'bad'); return; }
        await API.call('save', { table: 'periods', row }); s.remove(); UI.toast('Periode tersimpan', 'ok'); periode();
      };
      const d = $('#pe-del', s); if (d) d.onclick = async () => { if (await UI.confirm('Hapus periode ini? Spreadsheet respons di Drive tidak ikut terhapus.', 'Hapus', true)) { await API.call('remove', { table: 'periods', id: p.id }); s.remove(); periode(); } };
    };
    $('#p-add').onclick = () => edit();
    $$('[data-id]').forEach(li => li.onclick = () => edit(M().periods.find(p => p.id === li.dataset.id)));
  }

  /* ================= FASKES & UNIT ================= */
  async function faskes() {
    await Master.load(true);
    const list = M().faskes;
    App.view(UI.topbar('Faskes & Unit', { right: `<button class="ibtn" id="f-add">${I('plus')}</button>` }) + `<div class="wrap narrow mt">
      <div class="list">${list.length ? list.map(f => `<div class="li" data-id="${f.id}"><div class="li-ico ${f.jenis === 'Rumah Sakit' ? 'c2' : 'c6'}">${I('hosp')}</div><div class="grow"><div class="li-t">${esc(f.nama)}</div><div class="li-s">${esc(f.jenis)} · ${esc(f.kode || '')} · ${M().units.filter(u => u.faskes_id === f.id).length} unit</div></div>${I('chev', 'chev')}</div>`).join('') : UI.empty('Belum ada fasilitas.', 'hosp')}</div></div>`);
    $('#f-add').onclick = () => editF({ jenis: 'Puskesmas', aktif: true });
    $$('[data-id]').forEach(li => li.onclick = () => editF(M().faskes.find(f => f.id === li.dataset.id)));
    function editF(f) {
      const units = f.id ? M().units.filter(u => u.faskes_id === f.id) : [];
      const s = UI.sheet(`<div class="field"><label>Nama fasilitas</label><input class="inp" data-k="nama" value="${esc(f.nama || '')}"></div>
        <div class="row"><div class="field grow"><label>Jenis</label><select class="inp" data-k="jenis">${['Puskesmas', 'Rumah Sakit', 'Klinik', 'Labkesda', 'Lainnya'].map(j => `<option ${f.jenis === j ? 'selected' : ''}>${j}</option>`).join('')}</select></div><div class="field" style="width:120px"><label>Kode</label><input class="inp" data-k="kode" value="${esc(f.kode || '')}"></div></div>
        <div class="field"><label>Alamat</label><input class="inp" data-k="alamat" value="${esc(f.alamat || '')}"></div>
        <div class="field"><label>Telepon</label><input class="inp" data-k="telepon" value="${esc(f.telepon || '')}"></div>
        <div class="row"><div class="field grow"><label>Nama kepala</label><input class="inp" data-k="kepala" value="${esc(f.kepala || '')}"></div><div class="field grow"><label>NIP kepala</label><input class="inp" data-k="nip_kepala" value="${esc(f.nip_kepala || '')}"></div></div>
        <label class="switch"><span>Aktif</span><input type="checkbox" id="fk-on" ${f.aktif !== false && f.aktif !== 'FALSE' ? 'checked' : ''}></label>
        <div class="row mt">${f.id ? `<button class="btn danger" id="fk-del">${I('trash')}</button>` : ''}<button class="btn grow" id="fk-ok">Simpan fasilitas</button></div>
        ${f.id ? `<div class="sec-title"><h3>Unit layanan (${units.length})</h3></div><div class="list" style="box-shadow:none;border:1px solid var(--line)">${units.map(u => `<div class="li" style="cursor:default"><div class="grow">${esc(u.nama)}</div><button class="ibtn" data-ud="${u.id}">${I('trash')}</button></div>`).join('') || '<div class="li muted">Belum ada unit</div>'}</div>
        <div class="row mt"><input class="inp grow" id="un-n" placeholder="Nama unit, mis. Poli Umum"><button class="btn" id="un-add">${I('plus')}</button></div>
        <button class="btn sm line mt" id="un-tpl">Isi unit standar ${f.jenis === 'Rumah Sakit' ? 'RS' : 'Puskesmas'}</button>` : ''}`, { title: f.id ? f.nama : 'Fasilitas baru' });
      $('#fk-ok', s).onclick = async () => {
        const row = Object.assign({}, f); $$('[data-k]', s).forEach(i => row[i.dataset.k] = i.value); row.aktif = $('#fk-on', s).checked;
        if (!row.nama) { UI.toast('Nama wajib diisi', 'bad'); return; }
        const saved = await API.call('save', { table: 'faskes', row }); await Master.load(true); s.remove(); UI.toast('Tersimpan', 'ok');
        if (!f.id) editF(M().faskes.find(x => x.id === saved.id) || saved); else faskes();
      };
      const del = $('#fk-del', s); if (del) del.onclick = async () => { if (await UI.confirm('Hapus fasilitas ini?', 'Hapus', true)) { await API.call('remove', { table: 'faskes', id: f.id }); s.remove(); faskes(); } };
      if (!f.id) return;
      const addUnit = async nm => { await API.call('save', { table: 'units', row: { faskes_id: f.id, nama: nm, aktif: true } }); };
      $('#un-add', s).onclick = async () => { const n = $('#un-n', s).value.trim(); if (!n) return; await addUnit(n); await Master.load(true); s.remove(); editF(f); };
      $('#un-tpl', s).onclick = async () => {
        const list = f.jenis === 'Rumah Sakit' ? ['Pendaftaran', 'IGD', 'Rawat Jalan', 'Rawat Inap', 'ICU', 'Kamar Bersalin', 'Laboratorium', 'Radiologi', 'Farmasi', 'Kasir'] : ['Pendaftaran', 'Poli Umum', 'Poli KIA/KB', 'Poli Gigi', 'Poli Lansia', 'MTBS', 'Imunisasi', 'Laboratorium', 'Farmasi', 'UGD'];
        const exist = units.map(u => u.nama.toLowerCase());
        for (const n of list) if (!exist.includes(n.toLowerCase())) await addUnit(n);
        await Master.load(true); s.remove(); editF(f);
      };
      $$('[data-ud]', s).forEach(b => b.onclick = async () => { await API.call('remove', { table: 'units', id: b.dataset.ud }); await Master.load(true); s.remove(); editF(f); });
    }
  }

  /* ================= PENGGUNA ================= */
  async function pengguna() {
    await Master.load(true);
    const list = M().users || [];
    App.view(UI.topbar('Pengguna', { right: `<button class="ibtn" id="u-add">${I('plus')}</button>` }) + `<div class="wrap narrow mt">
      <div class="card small" style="background:var(--pri-soft);box-shadow:none">Daftarkan email Google petugas. Mereka masuk dengan tombol "Masuk dengan Google". Responden tidak perlu didaftarkan.</div>
      <div class="list mt">${list.map(u => `<div class="li" data-e="${esc(u.email)}"><div class="li-ico c5">${I('user')}</div><div class="grow"><div class="li-t">${esc(u.nama || u.email)}</div><div class="li-s">${esc(u.email)} · ${esc(Core.ROLES[u.role] || u.role)}</div></div>${truthy(u.aktif) ? '' : '<span class="chip gray">nonaktif</span>'}</div>`).join('')}</div></div>`);
    const edit = (u = { role: 'enumerator', aktif: true, faskes_ids: [] }) => {
      const sel = new Set(u.faskes_ids || []);
      const s = UI.sheet(`<div class="field"><label>Email Google</label><input class="inp" type="email" id="ue-e" value="${esc(u.email || '')}" ${u.email ? 'disabled' : ''}></div>
        <div class="field"><label>Nama</label><input class="inp" id="ue-n" value="${esc(u.nama || '')}"></div>
        <div class="field"><label>Peran</label><select class="inp" id="ue-r">${Object.keys(Core.ROLES).map(r => `<option value="${r}" ${u.role === r ? 'selected' : ''}>${Core.ROLES[r]}</option>`).join('')}</select></div>
        <div class="field"><label>Fasilitas yang ditugaskan</label><div class="help" style="margin:-2px 0 6px">Kosongkan = semua fasilitas. Berlaku untuk Data Manager & Enumerator.</div>
          ${M().faskes.map(f => `<label class="opt multi ${sel.has(f.id) ? 'on' : ''}" data-f="${f.id}"><span class="dot"></span><span>${esc(f.nama)}</span></label>`).join('')}</div>
        <label class="switch"><span>Akun aktif</span><input type="checkbox" id="ue-on" ${truthy(u.aktif) ? 'checked' : ''}></label>
        <div class="row mt">${u.email ? `<button class="btn danger" id="ue-del">${I('trash')}</button>` : ''}<button class="btn grow" id="ue-ok">Simpan</button></div>`, { title: u.email ? 'Edit pengguna' : 'Pengguna baru' });
      $$('[data-f]', s).forEach(o => o.onclick = e => { e.preventDefault(); const id = o.dataset.f; sel.has(id) ? sel.delete(id) : sel.add(id); o.classList.toggle('on'); });
      $('#ue-ok', s).onclick = async () => {
        const row = { email: u.email || $('#ue-e', s).value.trim(), nama: $('#ue-n', s).value, role: $('#ue-r', s).value, faskes_ids: Array.from(sel), aktif: $('#ue-on', s).checked };
        if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(row.email)) { UI.toast('Email tidak valid', 'bad'); return; }
        await API.call('save', { table: 'users', row }); s.remove(); UI.toast('Pengguna tersimpan', 'ok'); pengguna();
      };
      const d = $('#ue-del', s); if (d) d.onclick = async () => { if (await UI.confirm('Hapus akses ' + u.email + '?', 'Hapus', true)) { await API.call('remove', { table: 'users', id: u.email }); s.remove(); pengguna(); } };
    };
    $('#u-add').onclick = () => edit();
    $$('[data-e]').forEach(li => li.onclick = () => edit(list.find(u => u.email === li.dataset.e)));
  }

  /* ================= QR & TAUTAN ================= */
  async function bagikan(parts, q) {
    await Master.load();
    const forms = M().forms.filter(f => (f.mode_input || []).some(m => m !== 'enumerator'));
    const st = { form_id: q.form && forms.some(f => f.id === q.form) ? q.form : (forms[0] || {}).id, fk: '', u: '' };
    const draw = async () => {
      const form = Master.form(st.form_id);
      App.view(UI.topbar('QR & Tautan') + `<div class="wrap narrow mt">${!forms.length ? `<div class="card">${UI.empty('Belum ada form yang mengizinkan pengisian responden/kiosk.')}</div>` : `
        <div class="card"><div class="field"><label>Survei</label><select class="inp" id="s-f">${UI.opts(forms, st.form_id, 'id', 'judul')}</select></div>
        <div class="field"><label>Kunci fasilitas (opsional)</label><select class="inp" id="s-fk">${UI.opts(Master.faskesForForm(form), st.fk, 'id', 'nama', '— Responden memilih —')}</select></div>
        <div class="field"><label>Kunci unit (opsional)</label><select class="inp" id="s-u" ${st.fk ? '' : 'disabled'}>${UI.opts(st.fk ? Master.unitsForForm(form, st.fk) : [], st.u, 'id', 'nama', '— Responden memilih —')}</select></div>
        ${form.status !== 'aktif' ? '<div class="err">Status form masih ' + esc(form.status) + '. Aktifkan agar tautan bisa diisi.</div>' : ''}</div>
        <div class="card center"><div class="qr-box" id="s-qr"></div><div class="small muted mt" style="word-break:break-all" id="s-link"></div>
          <div class="row wrap mt" style="justify-content:center"><button class="btn sm" id="s-copy">${I('copy')} Salin</button><button class="btn sm" style="background:#16a34a" id="s-wa">${I('wa')} WhatsApp</button><button class="btn sm line" id="s-png">${I('dl')} Unduh QR</button><button class="btn sm line" id="s-poster">${I('print')} Poster</button></div></div>
        <div class="card"><h3>Tautan kiosk</h3><div class="small muted" style="word-break:break-all" id="s-kiosk"></div><button class="btn sm line mt" id="s-kcopy">${I('copy')} Salin tautan kiosk</button></div>`}</div>`);
      if (!forms.length) return;
      const p = new URLSearchParams(); if (st.fk) p.set('fk', st.fk); if (st.u) p.set('u', st.u);
      const link = App.base + '#/f/' + st.form_id + (p.toString() ? '?' + p : '');
      const klink = App.base + '#/kiosk/' + st.form_id + (p.toString() ? '?' + p : '');
      $('#s-link').textContent = link; $('#s-kiosk').textContent = klink;
      $('#s-f').onchange = e => { st.form_id = e.target.value; st.fk = ''; st.u = ''; draw(); };
      $('#s-fk').onchange = e => { st.fk = e.target.value; st.u = ''; draw(); };
      $('#s-u').onchange = e => { st.u = e.target.value; draw(); };
      $('#s-copy').onclick = () => UI.copy(link);
      $('#s-kcopy').onclick = () => UI.copy(klink);
      const where = st.fk ? Master.faskesName(st.fk) : (M().settings.instansi || '');
      $('#s-wa').onclick = () => window.open('https://wa.me/?text=' + encodeURIComponent(`Bapak/Ibu yang kami hormati, mohon kesediaannya mengisi *${form.judul}* ${where ? 'di ' + where : ''} (±3 menit). Jawaban Anda membantu kami meningkatkan pelayanan.\n\n${link}\n\nTerima kasih 🙏`), '_blank');
      try {
        await Lib.qr();
        $('#s-qr').innerHTML = '';
        new QRCode($('#s-qr'), { text: link, width: 440, height: 440, correctLevel: QRCode.CorrectLevel.M });
      } catch (e) { $('#s-qr').innerHTML = `<p class="err">${esc(e.message)}</p>`; }
      const qrUrl = () => { const c = $('#s-qr canvas'); const i = $('#s-qr img'); return c ? c.toDataURL('image/png') : (i ? i.src : ''); };
      $('#s-png').onclick = async () => { const b = await (await fetch(qrUrl())).blob(); UI.download('QR-' + form.judul.replace(/\W+/g, '_').slice(0, 30) + '.png', b); };
      $('#s-poster').onclick = () => {
        const S = M().settings; const w = window.open('', '_blank');
        w.document.write(`<html><head><title>Poster QR</title><style>body{font-family:system-ui,sans-serif;text-align:center;margin:0;padding:40px;color:#0f172a}.b{border:6px solid ${S.warna || '#0f766e'};border-radius:28px;padding:36px;max-width:620px;margin:auto}h1{color:${S.warna || '#0f766e'};font-size:34px;margin:10px 0}img.q{width:360px;height:360px}p{font-size:18px}</style></head><body><div class="b">
          <img src="${esc(new URL(S.logo || 'icons/logo.svg', App.base).href)}" style="height:80px"><h1>Bagaimana pelayanan kami hari ini?</h1><p>Pindai QR code di bawah untuk mengisi<br><b>${esc(form.judul)}</b></p><img class="q" src="${qrUrl()}"><p><b>${esc(where)}</b><br>Hanya ±3 menit · Jawaban Anda dirahasiakan</p></div><script>setTimeout(()=>print(),600)<\/script></body></html>`);
        w.document.close();
      };
    };
    draw();
  }

  /* ================= EMBED DASHBOARD ================= */
  async function embed(parts, q) {
    await Master.load();
    const st = { form_id: q.form || (M().forms.find(f => f.dashboard_publik) || M().forms[0] || {}).id, fk: '', h: 900 };
    const draw = () => {
      const form = Master.form(st.form_id);
      if (!form) { App.view(UI.topbar('Embed Dashboard') + `<div class="wrap mt"><div class="card">${UI.empty('Belum ada form.')}</div></div>`); return; }
      const url = App.base + 'embed.html?form=' + form.id + (st.fk ? '&fk=' + st.fk : '');
      const code = `<iframe src="${url}" width="100%" height="${st.h}" style="border:0;border-radius:12px;max-width:1100px" loading="lazy" title="Hasil Survei Kepuasan Masyarakat"></iframe>`;
      App.view(UI.topbar('Embed Dashboard') + `<div class="wrap narrow mt"><div class="card">
        <div class="field"><label>Survei</label><select class="inp" id="e-f">${UI.opts(M().forms, st.form_id, 'id', 'judul')}</select></div>
        <label class="switch"><span><b>Dashboard publik</b><br><span class="small muted">Hanya data agregat yang ditampilkan; data pribadi & saran tertulis tidak ikut.</span></span><input type="checkbox" id="e-pub" ${form.dashboard_publik ? 'checked' : ''} ${Session.is(...ADM) ? '' : 'disabled'}></label>
        <div class="row"><div class="field grow"><label>Tampilkan fasilitas</label><select class="inp" id="e-fk">${UI.opts(Master.faskesForForm(form), st.fk, 'id', 'nama', 'Semua (bisa dipilih pengunjung)')}</select></div><div class="field" style="width:110px"><label>Tinggi (px)</label><input type="number" class="inp" id="e-h" value="${st.h}"></div></div></div>
        ${form.dashboard_publik ? `<div class="card"><h3>Kode embed (iframe)</h3><code class="snip">${esc(code)}</code><div class="row wrap mt"><button class="btn sm" id="e-copy">${I('copy')} Salin kode</button><button class="btn sm line" id="e-lcopy">${I('copy')} Salin tautan</button><a class="btn sm line" href="${esc(url)}" target="_blank">${I('eye')} Pratinjau</a></div>
          <p class="help">Tempel di WordPress (blok HTML khusus), Google Sites (Sematkan > Kode), atau situs resmi Pemda.</p></div>` : `<div class="card">${UI.empty('Aktifkan dashboard publik untuk mendapatkan kode embed.', 'lock')}</div>`}</div>`);
      $('#e-f').onchange = e => { st.form_id = e.target.value; draw(); };
      $('#e-fk').onchange = e => { st.fk = e.target.value; draw(); };
      $('#e-h').onchange = e => { st.h = e.target.value; draw(); };
      $('#e-pub').onchange = async e => { const nf = Object.assign({}, form, { dashboard_publik: e.target.checked }); await API.call('save', { table: 'forms', row: { id: form.id, schema: nf } }); await Master.load(true); UI.toast(e.target.checked ? 'Dashboard publik aktif' : 'Dashboard publik dimatikan', 'ok'); draw(); };
      const c = $('#e-copy'); if (c) { c.onclick = () => UI.copy(code); $('#e-lcopy').onclick = () => UI.copy(url); }
    };
    draw();
  }

  /* ================= PENGATURAN ================= */
  async function pengaturan() {
    await Master.load(true);
    const S = Object.assign({}, M().settings);
    const F = [['app_nama', 'Nama aplikasi'], ['instansi', 'Nama instansi (Dinas Kesehatan)'], ['alamat', 'Alamat'], ['kota', 'Kabupaten/Kota'], ['telepon', 'Telepon'], ['email', 'Email'], ['website', 'Website'], ['kepala_dinas', 'Nama Kepala Dinas'], ['nip_kepala_dinas', 'NIP Kepala Dinas']];
    App.view(UI.topbar('Pengaturan') + `<div class="wrap narrow mt">
      <div class="card"><h3>Identitas & kop laporan</h3>${F.map(f => `<div class="field"><label>${f[1]}</label><input class="inp" data-s="${f[0]}" value="${esc(S[f[0]] || '')}"></div>`).join('')}</div>
      <div class="card"><h3>Tampilan</h3>
        <div class="row"><div class="brand-logo" style="width:64px;height:64px;border:1px solid var(--line)"><img id="st-logo" src="${esc(S.logo || 'icons/logo.svg')}"></div>
          <div class="grow"><label class="btn sm ghost">${I('up')} Unggah logo<input type="file" accept="image/*" id="st-file" hidden></label><div class="help">PNG/SVG transparan, persegi. Atau isi URL di bawah.</div></div></div>
        <div class="field mt"><label>URL logo</label><input class="inp" data-s="logo" id="st-lurl" value="${esc(S.logo || '')}"></div>
        <div class="field"><label>Warna utama</label><div class="row"><input type="color" id="st-c" value="${esc(S.warna || '#0f766e')}" style="width:56px;height:44px;border:0;background:none"><input class="inp grow" data-s="warna" id="st-ct" value="${esc(S.warna || '#0f766e')}"></div>
          <div class="row wrap mt">${['#0f766e', '#047857', '#0369a1', '#1d4ed8', '#7c3aed', '#be123c', '#c2410c', '#15803d'].map(c => `<button class="ibtn" data-c="${c}" style="background:${c};width:32px;height:32px;border-radius:50%"></button>`).join('')}</div></div>
      </div>
      <button class="btn lg block" id="st-save">${I('check')} Simpan pengaturan</button>
      ${DEMO ? `<button class="btn danger block mt" id="st-reset">${I('trash')} Reset data demo</button>` : ''}</div>`);
    $$('[data-s]').forEach(i => i.oninput = () => { S[i.dataset.s] = i.value; if (i.dataset.s === 'warna') Theme.apply(S); if (i.dataset.s === 'logo') $('#st-logo').src = i.value; });
    $('#st-c').oninput = e => { S.warna = e.target.value; $('#st-ct').value = e.target.value; Theme.apply(S); };
    $$('[data-c]').forEach(b => b.onclick = () => { S.warna = b.dataset.c; $('#st-c').value = b.dataset.c; $('#st-ct').value = b.dataset.c; Theme.apply(S); });
    $('#st-file').onchange = async e => {
      const f = e.target.files[0]; if (!f) return;
      if (f.size > 1.5e6) { UI.toast('Maksimal 1,5 MB', 'bad'); return; }
      const dataUrl = await new Promise(r => { const fr = new FileReader(); fr.onload = () => r(fr.result); fr.readAsDataURL(f); });
      try { UI.toast('Mengunggah…'); const r = await API.call('uploadPublic', { dataUrl, name: 'logo-' + f.name }); S.logo = r.url; $('#st-logo').src = r.url; $('#st-lurl').value = r.url; UI.toast('Logo diunggah, tekan Simpan', 'ok'); }
      catch (er) { UI.toast(er.message, 'bad'); }
    };
    $('#st-save').onclick = async () => {
      await API.call('saveSettings', { values: S });
      App.pubSettings = Object.assign({}, App.pubSettings, S);
      await Master.load(true); UI.toast('Pengaturan tersimpan', 'ok');
    };
    const rs = $('#st-reset'); if (rs) rs.onclick = async () => { if (await UI.confirm('Kembalikan semua data demo ke kondisi awal?', 'Reset', true)) { Mock.reset(); await Store.clear('queue'); Master.loaded = false; location.reload(); } };
  }

  return { forms, data, dashboard, laporan, periode, faskes, pengguna, bagikan, embed, pengaturan };
})();
