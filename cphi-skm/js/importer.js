/* importer.js — impor/migrasi data dari platform lain (Excel / CSV / Google Sheets / Kobo / Google Form / Clappia) */
const Importer = (() => {
  const norm = s => String(s ?? '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, ' ').trim();
  const BATCH = 150;

  /* ---------- konversi tanggal ---------- */
  function toISO(v) {
    if (v === undefined || v === null || v === '') return null;
    if (v instanceof Date && !isNaN(v)) return v.toISOString();
    if (typeof v === 'number') { // nomor seri Excel
      const d = new Date(Math.round((v - 25569) * 864e5)); return isNaN(d) ? null : d.toISOString();
    }
    const s = String(v).trim();
    let m = s.match(/^(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{2,4})(?:[ T,]+(\d{1,2})[:.](\d{2})(?:[:.](\d{2}))?)?/); // dd/mm/yyyy [hh:mm]
    if (m) {
      let y = +m[3]; if (y < 100) y += 2000;
      const d = new Date(y, +m[2] - 1, +m[1], +(m[4] || 9), +(m[5] || 0), +(m[6] || 0));
      return isNaN(d) ? null : d.toISOString();
    }
    const BULAN = { jan: 0, januari: 0, feb: 1, februari: 1, mar: 2, maret: 2, apr: 3, april: 3, mei: 4, may: 4, jun: 5, juni: 5, jul: 6, juli: 6, agu: 7, agt: 7, agustus: 7, aug: 7, sep: 8, september: 8, okt: 9, oktober: 9, oct: 9, nov: 10, november: 10, des: 11, desember: 11, dec: 11 };
    m = s.toLowerCase().match(/^(\d{1,2})\s+([a-z]+)\s+(\d{4})/);
    if (m && BULAN[m[2]] !== undefined) return new Date(+m[3], BULAN[m[2]], +m[1], 9).toISOString();
    const d = new Date(s);
    return isNaN(d) ? null : d.toISOString();
  }

  /* ---------- pencocokan kolom otomatis ---------- */
  const STOP = new Set(['dan', 'atau', 'yang', 'di', 'ke', 'dari', 'untuk', 'dengan', 'bagaimana', 'pendapat', 'saudara', 'tentang', 'dalam', 'pelayanan', 'layanan', 'the', 'of']);
  function autoCol(headers, cands, used) {
    const H = headers.map(h => norm(h).replace(/^(\d+|[a-z])\s+(?=\S)/, '').replace(/^u\d+\s+/, ''));  // buang penomoran "1." / "a." / "U1"
    const free = i => !used || !used.has(headers[i]);
    for (const c of cands) { const n = norm(c); const i = H.findIndex((h, k) => free(k) && (h === n || norm(headers[k]) === n)); if (i >= 0) return headers[i]; }
    for (const c of cands) { const n = norm(c); if (n.length < 3) continue; const i = H.findIndex((h, k) => free(k) && (h.includes(n) || (h.length > 6 && n.includes(h)))); if (i >= 0) return headers[i]; }
    // skor kesamaan kata
    let best = -1, bi = -1;
    const words = s => s.split(' ').filter(w => w.length >= 4 && !STOP.has(w));
    cands.forEach(c => { const cw = words(norm(c)); if (!cw.length) return; H.forEach((h, k) => { if (!free(k)) return; const hw = words(h); const sc = cw.filter(w => hw.some(x => x === w || (x.length > 5 && w.startsWith(x.slice(0, 5))))).length; if (sc > best) { best = sc; bi = k; } }); });
    return best >= 1 ? headers[bi] : '';
  }
  function autoMap(form, headers) {
    const map = {
      _ts: autoCol(headers, ['tanggal', 'ts', 'timestamp', 'waktu', 'submission time', '_submission_time', 'start', 'end', 'date', 'created at', 'tanggal survei', 'stempel waktu', 'cap waktu']),
      _fk: autoCol(headers, ['fasilitas', 'faskes', 'puskesmas', 'rumah sakit', 'nama fasilitas', 'faskes_id', 'unit kerja', 'instansi']),
      _un: autoCol(headers, ['unit', 'unit layanan', 'poli', 'ruangan', 'layanan', 'unit_id', 'jenis layanan'])
    };
    const used = new Set([map._ts, map._fk, map._un].filter(Boolean));
    const qs = form.pertanyaan.filter(q => !Core.NON_INPUT[q.tipe]);
    // 2 putaran: pencocokan ketat dulu untuk semua pertanyaan, lalu kemiripan kata untuk sisanya
    qs.forEach(q => {
      const c = [q.id, q.label, q.unsur || '', q.unsur_nama || ''].filter(Boolean);
      const H = headers.map(norm);
      const hit = c.map(x => H.indexOf(norm(x))).find(i => i >= 0 && !used.has(headers[i]));
      if (hit !== undefined) { map[q.id] = headers[hit]; used.add(headers[hit]); }
    });
    qs.forEach(q => {
      if (map[q.id]) return;
      const c = [q.id, q.label, q.unsur || '', q.unsur_nama || ''];
      if (q.id === 'jk') c.push('jenis kelamin', 'gender', 'sex');
      if (q.id === 'umur') c.push('usia', 'age');
      if (q.id === 'bayar') c.push('jenis pembayaran', 'pembiayaan', 'penjamin', 'cara bayar');
      if (q.id === 'saran') c.push('saran', 'masukan', 'komentar', 'kritik');
      // nama unsur lebih spesifik daripada kalimat pertanyaan → coba dulu
      const order = q.unsur_nama ? [q.unsur_nama].concat(c) : c;
      map[q.id] = autoCol(headers, order.filter(Boolean), used);
      if (map[q.id]) used.add(map[q.id]);
    });
    return map;
  }

  /* ---------- konversi nilai jawaban ---------- */
  function optionsOf(q) { return q.tipe === 'ya_tidak' ? [{ v: '1', l: 'Ya' }, { v: '0', l: 'Tidak' }] : (q.opsi || []); }
  function matchOpt(q, raw, manual) {
    const s = String(raw).trim();
    if (manual && manual[s] !== undefined) return manual[s] === '' ? undefined : manual[s];
    const ops = optionsOf(q);
    let o = ops.find(x => String(x.v) === s) || ops.find(x => norm(x.l) === norm(s));
    if (!o && q.tipe === 'ya_tidak') { const n = norm(s); if (['y', 'yes', 'iya', 'benar', 'true'].includes(n)) return '1'; if (['n', 'no', 'tidak', 'salah', 'false', 'bukan'].includes(n)) return '0'; }
    if (!o) { const n = norm(s); o = ops.find(x => norm(x.l).startsWith(n) && n.length > 2) || ops.find(x => n.startsWith(norm(x.l)) && norm(x.l).length > 2); }
    if (!o) { const n = norm(s); o = ops.find(x => String(x.l).split(/[\/(),]| atau /i).map(norm).filter(Boolean).includes(n)); } // "S1" ↔ "D4/S1"
    if (!o && /^[a-z]$/i.test(s)) { const c = ops.filter(x => norm(x.l).startsWith(s.toLowerCase())); if (c.length === 1) o = c[0]; } // "L"/"P"
    if (!o && /^\d+$/.test(s) && q.tipe === 'skala_ikm') { const k = parseInt(s, 10); if (k >= 1 && k <= ops.length) return String(k); }
    return o ? String(o.v) : null;
  }
  function convert(q, raw, manual, unmatched) {
    if (raw === undefined || raw === null || String(raw).trim() === '') return undefined;
    const add = v => { (unmatched[q.id] = unmatched[q.id] || {})[v] = ((unmatched[q.id] || {})[v] || 0) + 1; };
    switch (q.tipe) {
      case 'angka': case 'desimal': case 'rating': case 'skala_linear': {
        const n = parseFloat(String(raw).replace(',', '.'));
        return isNaN(n) ? undefined : (q.tipe === 'angka' ? Math.round(n) : n);
      }
      case 'pilihan': case 'dropdown': case 'ya_tidak': case 'skala_ikm': {
        const v = matchOpt(q, raw, manual[q.id]);
        if (v === null) { if (q.lainnya) return 'lainnya'; add(String(raw).trim()); return undefined; }
        return v;
      }
      case 'kotakcentang': {
        const parts = String(raw).split(/[;,|\n]+/).map(x => x.trim()).filter(Boolean);
        const out = [];
        parts.forEach(p => { const v = matchOpt(q, p, manual[q.id]); if (v === null) add(p); else if (v !== undefined) out.push(v); });
        return out.length ? out : undefined;
      }
      case 'tanggal': { const d = toISO(raw); return d ? d.slice(0, 10) : String(raw); }
      case 'tanggalwaktu': { const d = toISO(raw); return d ? d.slice(0, 16) : String(raw); }
      case 'matriks': { try { return typeof raw === 'object' ? raw : JSON.parse(raw); } catch (e) { return undefined; } }
      default: return raw instanceof Date ? raw.toISOString().slice(0, 10) : String(raw);
    }
  }

  function matchFaskes(raw, list) {
    const n = norm(raw); if (!n) return null;
    return list.find(f => norm(f.id) === n || norm(f.kode) === n || norm(f.nama) === n)
      || list.find(f => norm(f.nama).includes(n) || n.includes(norm(f.nama)));
  }
  function matchUnit(raw, units) {
    const n = norm(raw); if (!n) return null;
    return units.find(u => norm(u.id) === n || norm(u.nama) === n) || units.find(u => norm(u.nama).includes(n) || n.includes(norm(u.nama)));
  }

  function hash(s) { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return (h >>> 0).toString(36); }

  /* ---------- proses seluruh baris ---------- */
  function build(st) {
    const form = Master.form(st.form_id);
    const qs = form.pertanyaan.filter(q => !Core.NON_INPUT[q.tipe]);
    const fkList = Master.faskesForForm(form);
    const unmatched = {}, issues = { fk: {}, un: {}, ts: 0, val: 0 };
    const items = [];
    const sig = hash(st.fileName + '|' + st.sheet + '|' + st.rows.length);
    st.rows.forEach((r, i) => {
      let fk = st.fixFk ? Master.faskes(st.fixFk) : (st.map._fk ? matchFaskes(r[st.map._fk], fkList) : null);
      if (!fk) { const k = st.map._fk ? String(r[st.map._fk] ?? '(kosong)') : '(tidak dipetakan)'; issues.fk[k] = (issues.fk[k] || 0) + 1; return; }
      const units = Master.unitsForForm(form, fk.id);
      let un = null;
      if (st.fixUn) un = units.find(u => u.id === st.fixUn) || null;
      else if (st.map._un && r[st.map._un] !== undefined && r[st.map._un] !== '') { un = matchUnit(r[st.map._un], units); if (!un) { const k = fk.nama + ' › ' + r[st.map._un]; issues.un[k] = (issues.un[k] || 0) + 1; } }
      let ts = st.map._ts ? toISO(r[st.map._ts]) : null;
      if (!ts) { issues.ts++; ts = st.defTs ? new Date(st.defTs + 'T09:00:00').toISOString() : new Date().toISOString(); }
      const data = {};
      qs.forEach(q => { const col = st.map[q.id]; if (!col) return; const v = convert(q, r[col], st.manual, unmatched); if (v !== undefined) data[q.id] = v; });
      const errs = Core.validate(form, data, { abaikanWajib: true });
      Object.keys(errs).forEach(k => delete data[k]);
      if (Object.keys(errs).length) issues.val++;
      if (!Object.keys(data).length) return;
      items.push({ client_uuid: 'imp_' + sig + '_' + i, form_id: form.id, faskes_id: fk.id, unit_id: un ? un.id : '', mode: 'impor', ts, data });
    });
    return { items, unmatched, issues, form };
  }

  /* ---------- template ---------- */
  async function template(form) {
    await Lib.xlsx();
    const qs = form.pertanyaan.filter(q => !Core.NON_INPUT[q.tipe]);
    const fk = Master.faskesForForm(form);
    const head = ['tanggal', 'fasilitas', 'unit'].concat(qs.map(q => q.id));
    const ex = [fmt.today(), (fk[0] || {}).nama || '', ((Master.unitsOf((fk[0] || {}).id) || [])[0] || {}).nama || ''].concat(qs.map(q => optionsOf(q).length ? optionsOf(q)[optionsOf(q).length - 1].l : q.tipe === 'angka' ? 35 : ''));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([head, ex]), 'Data');
    const kode = [['Kolom', 'Pertanyaan', 'Jenis', 'Nilai yang diterima (kode = label)']];
    kode.push(['tanggal', 'Tanggal pengisian', 'tanggal', 'yyyy-mm-dd, dd/mm/yyyy, atau tanggal Excel']);
    kode.push(['fasilitas', 'Nama / kode fasilitas', 'teks', fk.map(f => f.nama + (f.kode ? ' (' + f.kode + ')' : '')).join('; ')]);
    kode.push(['unit', 'Nama unit layanan', 'teks', 'Sesuai daftar unit di menu Faskes & Unit']);
    qs.forEach(q => kode.push([q.id, q.label, Core.TYPES[q.tipe].label, optionsOf(q).map(o => o.v + ' = ' + o.l).join('; ') + (q.tipe === 'kotakcentang' ? ' (pisahkan dengan koma)' : '')]));
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(kode), 'Petunjuk Kode');
    XLSX.writeFile(wb, 'Template_Impor_' + form.judul.replace(/\W+/g, '_').slice(0, 40) + '.xlsx');
  }

  /* ---------- tampilan ---------- */
  async function view(parts, q) {
    await Master.load();
    const forms = Master.data.forms;
    const st = { form_id: q.form || (forms.find(f => f.status === 'aktif') || forms[0] || {}).id, step: 1, wb: null, sheet: '', headers: [], rows: [], fileName: '', map: {}, manual: {}, fixFk: '', fixUn: '', defTs: '' };

    const sel = (key, val, opts) => `<select class="inp" data-map="${key}">${`<option value="">— tidak diimpor —</option>`}${opts.map(h => `<option ${h === val ? 'selected' : ''}>${esc(h)}</option>`).join('')}</select>`;

    function draw() {
      const form = Master.form(st.form_id);
      let body = '';
      if (!form) body = `<div class="card">${UI.empty('Buat form terlebih dahulu di Form Builder.')}</div>`;
      else if (st.step === 1) body = `
        <div class="card"><h3>1. Pilih survei tujuan</h3>
          <select class="inp" id="im-form">${UI.opts(forms, st.form_id, 'id', 'judul')}</select>
          <p class="help">Data hasil impor akan bergabung dengan data survei ini dan langsung tampil di Dashboard, Data Respons, dan Laporan.</p>
          <button class="btn sm line mt" id="im-tpl">${I('dl')} Unduh template Excel</button></div>
        <div class="card"><h3>2. Unggah berkas</h3>
          <label class="btn lg block ghost" style="border:2px dashed var(--pri);padding:22px">${I('upl')} Pilih file Excel / CSV<input type="file" id="im-file" accept=".xlsx,.xls,.csv,.ods,.tsv" hidden></label>
          <p class="help">Mendukung ekspor dari Google Form/Sheets, KoboToolbox, Clappia, ODK, SurveyMonkey, aplikasi SKM lama, atau rekap manual Excel. Baris pertama harus berisi judul kolom. Jawaban boleh berupa kode (1–4) atau teks label ("Sangat sesuai").</p></div>`;
      else if (st.step === 2) body = mapStep(form);
      else if (st.step === 3) body = reviewStep();
      App.view(UI.topbar('Impor Data') + `<div class="wrap narrow mt">
        <div class="seg" style="margin-bottom:12px;pointer-events:none">${['Berkas', 'Pemetaan', 'Tinjau & impor'].map((t, i) => `<button class="${st.step === i + 1 ? 'on' : ''}">${i + 1}. ${t}</button>`).join('')}</div>${body}</div>`);
      bind();
    }

    function mapStep(form) {
      const H = st.headers;
      const qs = form.pertanyaan.filter(q => !Core.NON_INPUT[q.tipe]);
      const fks = Master.faskesForForm(form);
      const nMap = qs.filter(q => st.map[q.id]).length;
      return `<div class="card"><div class="row"><div class="li-ico c6" style="width:40px;height:40px;border-radius:12px;display:grid;place-items:center">${I('table')}</div><div class="grow"><b>${esc(st.fileName)}</b><div class="small muted">${fmt.n(st.rows.length)} baris · ${H.length} kolom</div></div><button class="btn sm line" id="im-back">Ganti</button></div>
          ${st.wb && st.wb.SheetNames.length > 1 ? `<div class="field mt"><label>Sheet</label><select class="inp" id="im-sheet">${st.wb.SheetNames.map(s => `<option ${s === st.sheet ? 'selected' : ''}>${esc(s)}</option>`).join('')}</select></div>` : ''}</div>
        <div class="card"><h3>Identitas data</h3>
          <div class="field"><label>Kolom tanggal</label>${sel('_ts', st.map._ts, H)}</div>
          ${!st.map._ts ? `<div class="field"><label>Tanggal untuk semua baris</label><input type="date" class="inp" id="im-defts" value="${esc(st.defTs)}"></div>` : ''}
          <div class="field"><label>Fasilitas</label><select class="inp" id="im-fixfk"><option value="">Ambil dari kolom file</option>${fks.map(f => `<option value="${f.id}" ${st.fixFk === f.id ? 'selected' : ''}>Semua baris: ${esc(f.nama)}</option>`).join('')}</select></div>
          ${!st.fixFk ? `<div class="field"><label>Kolom fasilitas</label>${sel('_fk', st.map._fk, H)}<div class="help">Dicocokkan dengan nama/kode di menu Faskes & Unit.</div></div>` : ''}
          ${st.fixFk ? `<div class="field"><label>Unit</label><select class="inp" id="im-fixun"><option value="">Ambil dari kolom file</option>${Master.unitsForForm(form, st.fixFk).map(u => `<option value="${u.id}" ${st.fixUn === u.id ? 'selected' : ''}>Semua baris: ${esc(u.nama)}</option>`).join('')}</select></div>` : ''}
          ${!st.fixUn ? `<div class="field"><label>Kolom unit layanan</label>${sel('_un', st.map._un, H)}</div>` : ''}</div>
        <div class="card"><h3>Pemetaan pertanyaan <span class="chip">${nMap}/${qs.length} terpetakan</span></h3>
          <p class="help" style="margin-top:0">Sudah dicocokkan otomatis berdasarkan ID/teks pertanyaan. Periksa dan ubah bila perlu.</p>
          ${qs.map(q => `<div class="field"><label>${q.ikm ? `<span class="chip" style="margin-right:4px">${esc(q.unsur)}</span>` : ''}${esc(q.label)}</label>${sel(q.id, st.map[q.id], H)}${st.map[q.id] ? `<div class="help">Contoh: ${esc(sample(st.map[q.id]))}</div>` : ''}</div>`).join('')}</div>
        <div class="survey-nav"><button class="btn lg block" id="im-next">Lanjut tinjau ${I('chev')}</button></div>`;
    }
    function sample(col) { const v = st.rows.map(r => r[col]).filter(x => x !== undefined && x !== '').slice(0, 3); return v.map(x => x instanceof Date ? fmt.date(x) : String(x).slice(0, 40)).join(' | ') || '(kosong)'; }

    let result = null;
    function reviewStep() {
      result = build(st);
      const form = result.form;
      const { items, unmatched, issues } = result;
      const skipFk = Object.values(issues.fk).reduce((a, b) => a + b, 0);
      const um = Object.keys(unmatched);
      const ikm = Core.ikm(form, Core.aggregate(form, items.map(x => Object.assign({ status: 'valid' }, x)), {}, {}).all);
      return `<div class="kpis"><div class="kpi"><div class="k-lbl">Siap diimpor</div><div class="k-val" style="color:var(--ok)">${fmt.n(items.length)}</div><div class="k-sub">dari ${fmt.n(st.rows.length)} baris</div></div>
        <div class="kpi"><div class="k-lbl">Dilewati</div><div class="k-val" style="color:${skipFk ? 'var(--bad)' : 'inherit'}">${fmt.n(st.rows.length - items.length)}</div><div class="k-sub">fasilitas tak dikenal/kosong</div></div>
        ${ikm.k ? `<div class="kpi"><div class="k-lbl">IKM data impor</div><div class="k-val">${fmt.n(ikm.konversi, 2)}</div><div class="k-sub">mutu ${ikm.mutu} · ${esc(ikm.kinerja)}</div></div>` : ''}
        <div class="kpi"><div class="k-lbl">Rentang tanggal</div><div style="font-weight:700;margin-top:6px;font-size:13px">${items.length ? fmt.date(items.reduce((a, b) => a < b.ts ? a : b.ts, items[0].ts)) + ' – ' + fmt.date(items.reduce((a, b) => a > b.ts ? a : b.ts, items[0].ts)) : '-'}</div></div></div>
        ${skipFk ? `<div class="card mt"><h3 style="color:var(--bad)">Fasilitas tidak dikenali</h3><p class="help" style="margin-top:0">Tambahkan fasilitasnya di menu Faskes & Unit, perbaiki nama di file, atau pilih "Semua baris" pada langkah pemetaan.</p>${Object.entries(issues.fk).slice(0, 15).map(([k, n]) => `<div class="row small" style="padding:4px 0"><span class="grow">${esc(k)}</span><span class="chip bad">${n} baris</span></div>`).join('')}</div>` : ''}
        ${Object.keys(issues.un).length ? `<div class="card mt"><h3>Unit tidak dikenali <span class="chip warn">disimpan tanpa unit</span></h3>${Object.entries(issues.un).slice(0, 10).map(([k, n]) => `<div class="row small" style="padding:4px 0"><span class="grow">${esc(k)}</span><span class="chip gray">${n}</span></div>`).join('')}</div>` : ''}
        ${issues.ts ? `<div class="card mt small">⚠️ ${issues.ts} baris tanpa tanggal valid → memakai ${st.defTs ? fmt.date(st.defTs) : 'tanggal hari ini'}.</div>` : ''}
        ${um.length ? `<div class="card mt"><h3>Samakan jawaban yang belum cocok</h3><p class="help" style="margin-top:0">Pilih padanan opsi untuk setiap nilai di file. Nilai yang tidak dipadankan dikosongkan.</p>
          ${um.map(qid => { const q = form.pertanyaan.find(x => x.id === qid); return `<div style="margin-bottom:12px"><div class="small" style="font-weight:700;margin-bottom:6px">${esc(q.label)}</div>${Object.entries(unmatched[qid]).slice(0, 30).map(([v, n]) => `<div class="row" style="margin-bottom:6px"><span class="grow small">"${esc(v)}" <span class="muted">(${n})</span></span><select class="inp" style="width:52%" data-man="${qid}" data-raw="${esc(v)}"><option value="">— kosongkan —</option>${optionsOf(q).map(o => `<option value="${esc(o.v)}">${esc(o.v)} · ${esc(o.l)}</option>`).join('')}</select></div>`).join('')}</div>`; }).join('')}
          <button class="btn sm ghost" id="im-reapply">${I('sync')} Terapkan padanan</button></div>` : ''}
        ${items.length ? `<div class="card mt"><h3>Pratinjau (5 baris pertama)</h3><div class="tbl-wrap" style="box-shadow:none;border:1px solid var(--line)"><table class="tbl"><tr><th>Tanggal</th><th>Fasilitas</th><th>Unit</th>${form.pertanyaan.filter(q => !Core.NON_INPUT[q.tipe]).slice(0, 8).map(q => `<th>${esc(q.id)}</th>`).join('')}</tr>
          ${items.slice(0, 5).map(it => `<tr><td>${fmt.date(it.ts)}</td><td>${esc(Master.faskesName(it.faskes_id))}</td><td>${esc(it.unit_id ? Master.unitName(it.unit_id) : '-')}</td>${form.pertanyaan.filter(q => !Core.NON_INPUT[q.tipe]).slice(0, 8).map(q => `<td>${esc(Array.isArray(it.data[q.id]) ? it.data[q.id].join(',') : it.data[q.id] ?? '')}</td>`).join('')}</tr>`).join('')}</table></div></div>` : ''}
        <div class="card mt small" style="background:var(--pri-soft);box-shadow:none">Data impor ditandai mode <b>impor</b> dan status <b>valid</b>. Impor ulang file yang sama tidak menggandakan data.</div>
        <div id="im-prog" class="mt"></div>
        <div class="survey-nav"><button class="btn line lg" id="im-back2">${I('back')} Pemetaan</button><button class="btn lg grow" id="im-go" ${items.length ? '' : 'disabled'}>${I('upl')} Impor ${fmt.n(items.length)} data</button></div>`;
    }

    async function loadFile(file) {
      await Lib.xlsx();
      const buf = await file.arrayBuffer();
      st.wb = XLSX.read(buf, { type: 'array', cellDates: true, codepage: 65001 });
      st.fileName = file.name;
      useSheet(st.wb.SheetNames[0]);
    }
    function useSheet(name) {
      st.sheet = name;
      const ws = st.wb.Sheets[name];
      const aoa = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '', raw: true });
      const hi = aoa.findIndex(r => r.filter(x => String(x).trim() !== '').length >= 2);
      const head = (aoa[hi] || []).map((h, i) => String(h).trim() || 'Kolom ' + (i + 1));
      const seen = {}; const H = head.map(h => { seen[h] = (seen[h] || 0) + 1; return seen[h] > 1 ? h + ' (' + seen[h] + ')' : h; });
      st.headers = H;
      st.rows = aoa.slice(hi + 1).filter(r => r.some(x => String(x).trim() !== '')).map(r => { const o = {}; H.forEach((h, i) => o[h] = r[i]); return o; });
      st.map = autoMap(Master.form(st.form_id), H);
      st.manual = {};
      st.step = 2; draw();
    }

    function bind() {
      const f = $('#im-form'); if (f) f.onchange = e => { st.form_id = e.target.value; draw(); };
      const t = $('#im-tpl'); if (t) t.onclick = () => template(Master.form(st.form_id));
      const fi = $('#im-file'); if (fi) fi.onchange = async e => { if (!e.target.files[0]) return; try { await loadFile(e.target.files[0]); } catch (er) { UI.toast('Gagal membaca file: ' + er.message, 'bad'); } };
      const sh = $('#im-sheet'); if (sh) sh.onchange = e => useSheet(e.target.value);
      $$('[data-map]').forEach(s => s.onchange = () => { st.map[s.dataset.map] = s.value; draw(); });
      const ff = $('#im-fixfk'); if (ff) ff.onchange = e => { st.fixFk = e.target.value; st.fixUn = ''; draw(); };
      const fu = $('#im-fixun'); if (fu) fu.onchange = e => { st.fixUn = e.target.value; draw(); };
      const dt = $('#im-defts'); if (dt) dt.onchange = e => { st.defTs = e.target.value; };
      const b = $('#im-back'); if (b) b.onclick = () => { st.step = 1; draw(); };
      const n = $('#im-next'); if (n) n.onclick = () => { st.step = 3; draw(); window.scrollTo(0, 0); };
      const b2 = $('#im-back2'); if (b2) b2.onclick = () => { st.step = 2; draw(); };
      const ra = $('#im-reapply'); if (ra) ra.onclick = () => {
        $$('[data-man]').forEach(s => { (st.manual[s.dataset.man] = st.manual[s.dataset.man] || {})[s.dataset.raw] = s.value; });
        draw();
      };
      const go = $('#im-go'); if (go) go.onclick = run;
    }

    async function run() {
      const items = result.items;
      if (!(await UI.confirm(`Impor ${items.length} data ke "${result.form.judul}"?`, 'Impor sekarang'))) return;
      const go = $('#im-go'); go.disabled = true; $('#im-back2').disabled = true;
      const prog = $('#im-prog');
      let ok = 0, dupe = 0; const err = {};
      for (let i = 0; i < items.length; i += BATCH) {
        prog.innerHTML = `<div class="card"><div class="small">Mengirim ${fmt.n(Math.min(i + BATCH, items.length))} / ${fmt.n(items.length)}…</div><div class="progress" style="background:var(--pri-soft)"><i style="width:${Math.round(i / items.length * 100)}%;background:var(--pri)"></i></div></div>`;
        try {
          const r = await API.call('submit', { items: items.slice(i, i + BATCH) });
          ok += r.ok.length; dupe += r.dupe.length; Object.assign(err, r.err);
        } catch (e) { UI.toast('Terhenti: ' + e.message, 'bad'); break; }
      }
      const ne = Object.keys(err).length;
      prog.innerHTML = `<div class="card"><h3>${ne ? '⚠️' : '✅'} Impor selesai</h3><p style="margin:0">${fmt.n(ok)} data baru masuk${dupe ? `, ${fmt.n(dupe)} sudah ada sebelumnya (dilewati)` : ''}${ne ? `, ${fmt.n(ne)} gagal` : ''}.</p>
        ${ne ? `<div class="small mt" style="max-height:160px;overflow:auto">${Object.entries(err).slice(0, 30).map(([k, v]) => `<div>Baris ${esc(k.split('_').pop() * 1 + 2)}: ${esc(v)}</div>`).join('')}</div>` : ''}
        <div class="row wrap mt"><a class="btn sm" href="#/dashboard?form=${result.form.id}&all=1">${I('pie')} Lihat dashboard</a><a class="btn sm line" href="#/laporan?form=${result.form.id}">${I('doc')} Buat laporan</a><a class="btn sm line" href="#/data?form=${result.form.id}">${I('table')} Data respons</a></div></div>`;
      $('#im-go').textContent = 'Selesai';
    }

    draw();
  }

  return { view, toISO, autoMap, convert, build };
})();
