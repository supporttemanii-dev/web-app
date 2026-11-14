/* builder.js — generator/pembuat form (mirip Google Form / Kobo / Clappia) */
const Builder = (() => {
  const T = Core.TYPES;
  const OPS = [['=', 'sama dengan'], ['!=', 'tidak sama dengan'], ['>', 'lebih dari'], ['<', 'kurang dari'], ['>=', '≥'], ['<=', '≤'], ['terisi', 'sudah diisi'], ['kosong', 'kosong']];

  function newQ(tipe, form) {
    let n = (form.pertanyaan || []).length + 1;
    let id = 'q' + n;
    while (form.pertanyaan.some(q => q.id === id)) id = 'q' + (++n);
    const q = { id, tipe, label: tipe === 'halaman' ? 'Bagian baru' : tipe === 'catatan' ? 'Teks keterangan' : 'Pertanyaan baru', wajib: !Core.NON_INPUT[tipe] };
    if (T[tipe].opsi) q.opsi = tipe === 'skala_ikm' ? Core.opsiList(['Tidak baik', 'Kurang baik', 'Baik', 'Sangat baik']) : Core.opsiList(['Opsi 1', 'Opsi 2']);
    if (tipe === 'skala_ikm') { q.ikm = true; q.kategori = 'unsur'; const k = form.pertanyaan.filter(x => x.ikm).length + 1; q.unsur = 'U' + k; q.unsur_nama = 'Unsur ' + k; }
    if (tipe === 'matriks') { q.baris = Core.opsiList(['Baris 1', 'Baris 2']); q.opsi = Core.opsiList(['Kurang', 'Cukup', 'Baik']); }
    if (tipe === 'rating') q.max = 5;
    if (tipe === 'skala_linear') { q.min = 0; q.max = 10; q.lbl_min = 'Sangat tidak mungkin'; q.lbl_max = 'Sangat mungkin'; }
    return q;
  }

  function mount(el, form, opts) {
    form = JSON.parse(JSON.stringify(form));
    form.pertanyaan = form.pertanyaan || [];
    let tab = 'q', open = -1, dirty = false;
    const M = Master.data;

    function render() {
      el.innerHTML = UI.topbar(form.id ? 'Edit Form' : 'Form Baru', { right: `<button class="btn sm" style="background:#fff;color:var(--pri)" id="b-save">${I('check')} Simpan</button>` }) +
        `<div class="wrap narrow mt"><div class="seg" id="b-tabs">
          <button data-t="q" class="${tab === 'q' ? 'on' : ''}">Pertanyaan (${form.pertanyaan.filter(q => !Core.NON_INPUT[q.tipe]).length})</button>
          <button data-t="s" class="${tab === 's' ? 'on' : ''}">Pengaturan</button>
          <button data-t="p" class="${tab === 'p' ? 'on' : ''}">Pratinjau</button></div>
          <div id="b-body" class="mt"></div></div>`;
      $$('#b-tabs button', el).forEach(b => b.onclick = () => { tab = b.dataset.t; render(); });
      $('#b-save', el).onclick = save;
      const body = $('#b-body', el);
      if (tab === 'q') renderQuestions(body);
      else if (tab === 's') renderSettings(body);
      else renderPreview(body);
    }

    async function save() {
      if (!form.judul) { UI.toast('Judul form wajib diisi', 'bad'); tab = 's'; render(); return; }
      const ids = form.pertanyaan.map(q => q.id);
      const dup = ids.find((x, i) => ids.indexOf(x) !== i);
      if (dup) { UI.toast('ID pertanyaan ganda: ' + dup, 'bad'); return; }
      const btn = $('#b-save', el); btn.disabled = true;
      try {
        const saved = await API.call('save', { table: 'forms', row: { id: form.id, schema: form } });
        form.id = saved.id; dirty = false;
        UI.toast('Form tersimpan', 'ok');
        if (opts && opts.onSave) opts.onSave(saved);
      } catch (e) { UI.toast(e.message, 'bad'); }
      btn.disabled = false;
    }

    /* ---------- Tab Pertanyaan ---------- */
    function renderQuestions(body) {
      body.innerHTML = `
        <div class="row wrap" style="margin-bottom:12px">
          <button class="btn sm ghost" id="b-tpl">${I('star')} Sisipkan 9 unsur SKM</button>
          <button class="btn sm line" id="b-exp">${I('dl')} Ekspor JSON</button>
          <label class="btn sm line">${I('up')} Impor JSON<input type="file" accept=".json" id="b-imp" hidden></label>
        </div>
        <div id="b-list">${form.pertanyaan.length ? form.pertanyaan.map((q, i) => qCard(q, i)).join('') : UI.empty('Belum ada pertanyaan. Tekan tombol + untuk menambah.', 'build')}</div>
        <button class="btn lg block mt" id="b-add">${I('plus')} Tambah pertanyaan</button>`;
      $('#b-add', body).onclick = () => palette(form.pertanyaan.length);
      $('#b-tpl', body).onclick = () => {
        const t = Core.templateStandar().pertanyaan.filter(q => q.ikm || q.id === 'h_unsur');
        const exist = new Set(form.pertanyaan.map(q => q.id));
        t.forEach(q => { if (!exist.has(q.id)) form.pertanyaan.push(q); });
        dirty = true; UI.toast('9 unsur SKM ditambahkan', 'ok'); render();
      };
      $('#b-exp', body).onclick = () => UI.download((form.judul || 'form').replace(/\W+/g, '_') + '.json', new Blob([JSON.stringify(form, null, 2)], { type: 'application/json' }));
      $('#b-imp', body).onchange = async e => {
        try {
          const j = JSON.parse(await e.target.files[0].text());
          if (!Array.isArray(j.pertanyaan)) throw new Error('Format tidak dikenali');
          const id = form.id; Object.assign(form, j); form.id = id; dirty = true; UI.toast('Form diimpor', 'ok'); render();
        } catch (er) { UI.toast('Gagal impor: ' + er.message, 'bad'); }
      };
      $$('.qcard', body).forEach(c => bindCard(c, parseInt(c.dataset.i, 10)));
    }

    function qCard(q, i) {
      const isOpen = open === i;
      const t = T[q.tipe] || { ico: '?', label: q.tipe };
      return `<div class="qcard ${isOpen ? 'open' : ''} ${q.tipe === 'halaman' ? 'page' : ''}" data-i="${i}">
        <div class="qc-head" data-toggle><div class="qc-type">${t.ico}</div><div class="grow"><div class="qc-lbl">${esc(q.label)}</div>
          <div class="small muted">${esc(t.label)} · <code>${esc(q.id)}</code>${q.wajib ? ' · wajib' : ''}${q.ikm ? ' · ' + esc(q.unsur || 'IKM') : ''}${q.logika && q.logika.q ? ' · bersyarat' : ''}${q.pii ? ' · data pribadi' : ''}</div></div>
          ${I(isOpen ? 'up' : 'down', 'chev')}</div>
        ${isOpen ? `<div class="qc-body">${editor(q, i)}</div>` : ''}
      </div>`;
    }

    function editor(q, i) {
      const t = T[q.tipe];
      let h = `<div class="field"><label>${q.tipe === 'halaman' ? 'Judul bagian' : 'Teks pertanyaan'}</label><textarea class="inp" rows="2" data-f="label">${esc(q.label)}</textarea></div>`;
      if (q.tipe === 'halaman') return h + tools(i);
      h += `<div class="field"><label>Petunjuk (opsional)</label><input class="inp" data-f="hint" value="${esc(q.hint || '')}"></div>`;
      if (q.tipe === 'catatan') return h + tools(i);
      h += `<div class="field"><label>ID variabel</label><input class="inp" data-f="id" value="${esc(q.id)}"><div class="help">Nama kolom di spreadsheet. Huruf kecil, angka, garis bawah.</div></div>
        <div class="field"><label>Jenis pertanyaan</label><select class="inp" data-f="tipe">${Object.keys(T).filter(k => k !== 'halaman' && k !== 'catatan').map(k => `<option value="${k}" ${k === q.tipe ? 'selected' : ''}>${T[k].label}</option>`).join('')}</select></div>
        <label class="switch"><span>Wajib diisi</span><input type="checkbox" data-b="wajib" ${q.wajib ? 'checked' : ''}></label>
        <label class="switch"><span>Data pribadi (disembunyikan dari publik & disamarkan)</span><input type="checkbox" data-b="pii" ${q.pii ? 'checked' : ''}></label>
        <div class="field"><label>Kategori (untuk laporan)</label><select class="inp" data-f="kategori">${[['', 'Lainnya'], ['profil', 'Profil responden'], ['unsur', 'Unsur pelayanan'], ['lain', 'Saran / umum']].map(o => `<option value="${o[0]}" ${(q.kategori || '') === o[0] ? 'selected' : ''}>${o[1]}</option>`).join('')}</select></div>`;
      if (q.tipe === 'skala_ikm') {
        h += `<label class="switch"><span>Hitung sebagai unsur IKM</span><input type="checkbox" data-b="ikm" ${q.ikm ? 'checked' : ''}></label>
          <div class="row"><div class="field" style="width:90px"><label>Kode</label><input class="inp" data-f="unsur" value="${esc(q.unsur || '')}"></div>
          <div class="field grow"><label>Nama unsur</label><input class="inp" data-f="unsur_nama" value="${esc(q.unsur_nama || '')}"></div></div>
          <div class="help" style="margin:-6px 0 10px">Nilai opsi harus 1–4 (1 = terendah). Bobot tiap unsur = 1/jumlah unsur.</div>`;
      }
      if (q.tipe === 'angka' || q.tipe === 'desimal') {
        h += `<div class="row"><div class="field grow"><label>Minimal</label><input class="inp" type="number" data-n="min" value="${esc(q.min ?? '')}"></div><div class="field grow"><label>Maksimal</label><input class="inp" type="number" data-n="max" value="${esc(q.max ?? '')}"></div></div>
          <label class="switch"><span>Ini umur responden (dikelompokkan di dashboard)</span><input type="checkbox" data-peran="umur" ${q.peran === 'umur' || q.id === 'umur' ? 'checked' : ''}></label>`;
      }
      if (q.tipe === 'teks' || q.tipe === 'paragraf') h += `<div class="field"><label>Maks. karakter (opsional)</label><input class="inp" type="number" data-n="max" value="${esc(q.max ?? '')}"></div>`;
      if (q.tipe === 'rating') h += `<div class="field"><label>Jumlah bintang</label><input class="inp" type="number" min="3" max="10" data-n="max" value="${esc(q.max || 5)}"></div>`;
      if (q.tipe === 'skala_linear') h += `<div class="row"><div class="field grow"><label>Dari</label><input class="inp" type="number" data-n="min" value="${esc(q.min ?? 1)}"></div><div class="field grow"><label>Sampai</label><input class="inp" type="number" data-n="max" value="${esc(q.max ?? 10)}"></div></div>
        <div class="row"><div class="field grow"><label>Label kiri</label><input class="inp" data-f="lbl_min" value="${esc(q.lbl_min || '')}"></div><div class="field grow"><label>Label kanan</label><input class="inp" data-f="lbl_max" value="${esc(q.lbl_max || '')}"></div></div>`;
      if (q.tipe === 'matriks') h += optEditor(q, 'baris', 'Baris (pernyataan)');
      if (t.opsi) h += optEditor(q, 'opsi', q.tipe === 'matriks' ? 'Kolom (pilihan)' : 'Pilihan jawaban');
      if (q.tipe === 'pilihan') h += `<label class="switch"><span>Tambah opsi "Lainnya" + isian</span><input type="checkbox" data-b="lainnya" ${q.lainnya ? 'checked' : ''}></label>`;
      h += logicEditor(q, i);
      return h + tools(i);
    }

    function optEditor(q, key, title) {
      const list = q[key] || [];
      return `<div class="field"><label>${title}</label>
        ${list.map((o, j) => `<div class="opt-row"><input class="inp val" data-ov="${key}:${j}" value="${esc(o.v)}" title="Nilai"><input class="inp grow" data-ol="${key}:${j}" value="${esc(o.l)}" placeholder="Label"><button class="ibtn" data-odel="${key}:${j}" title="Hapus">${I('x')}</button></div>`).join('')}
        <div class="row"><button class="btn sm ghost" data-oadd="${key}">${I('plus')} Opsi</button><button class="btn sm line" data-obulk="${key}">Tempel banyak</button></div>
        <div class="help">Kolom kiri = nilai yang disimpan, kanan = teks yang tampil.</div></div>`;
    }

    function logicEditor(q, i) {
      const prev = form.pertanyaan.slice(0, i).filter(x => !Core.NON_INPUT[x.tipe]);
      const lg = q.logika && q.logika.syarat ? q.logika : (q.logika && q.logika.q ? { gabung: 'dan', syarat: [q.logika] } : { gabung: 'dan', syarat: [] });
      return `<div class="field mt"><label>Logika tampil (skip logic)</label>
        ${lg.syarat.length ? '' : '<div class="help" style="margin-bottom:6px">Selalu tampil.</div>'}
        ${lg.syarat.map((c, k) => {
          const src = prev.find(x => x.id === c.q);
          const opsiSrc = src && (src.opsi || (src.tipe === 'ya_tidak' ? [{ v: '1', l: 'Ya' }, { v: '0', l: 'Tidak' }] : null));
          return `<div class="card" style="padding:10px;margin-bottom:6px;box-shadow:none;border:1px solid var(--line)">
            <select class="inp" data-lq="${k}" style="margin-bottom:6px">${UI.opts(prev.map(x => ({ id: x.id, nama: x.id + ' — ' + x.label.slice(0, 50) })), c.q, 'id', 'nama', '— pertanyaan —')}</select>
            <div class="row"><select class="inp" data-lo="${k}" style="width:44%">${OPS.map(o => `<option value="${o[0]}" ${c.op === o[0] ? 'selected' : ''}>${o[1]}</option>`).join('')}</select>
            ${['terisi', 'kosong'].includes(c.op) ? '<span class="grow"></span>' : opsiSrc ? `<select class="inp grow" data-lv="${k}">${UI.opts(opsiSrc, c.v, 'v', 'l', '— nilai —')}</select>` : `<input class="inp grow" data-lv="${k}" value="${esc(c.v ?? '')}" placeholder="nilai">`}
            <button class="ibtn" data-ldel="${k}">${I('x')}</button></div></div>`;
        }).join('')}
        ${lg.syarat.length > 1 ? `<div class="seg" style="margin-bottom:6px"><button data-lg="dan" class="${lg.gabung !== 'atau' ? 'on' : ''}">Semua syarat (DAN)</button><button data-lg="atau" class="${lg.gabung === 'atau' ? 'on' : ''}">Salah satu (ATAU)</button></div>` : ''}
        ${prev.length ? `<button class="btn sm line" data-ladd>${I('plus')} Tambah syarat</button>` : '<div class="help">Logika hanya bisa merujuk pertanyaan sebelumnya.</div>'}</div>`;
    }

    function tools(i) {
      return `<div class="qc-tools">
        <button class="btn sm line" data-act="up" ${i === 0 ? 'disabled' : ''}>${I('up')}</button>
        <button class="btn sm line" data-act="down" ${i === form.pertanyaan.length - 1 ? 'disabled' : ''}>${I('down')}</button>
        <button class="btn sm line" data-act="dup">${I('copy')} Duplikat</button>
        <button class="btn sm line" data-act="ins">${I('plus')} Sisip di bawah</button>
        <span class="grow"></span>
        <button class="btn sm danger" data-act="del">${I('trash')}</button></div>`;
    }

    function getLogic(q) {
      if (q.logika && q.logika.syarat) return q.logika;
      q.logika = { gabung: 'dan', syarat: q.logika && q.logika.q ? [q.logika] : [] };
      return q.logika;
    }
    function normLogic(q) {
      const lg = getLogic(q);
      lg.syarat = lg.syarat.filter(c => c.q || c.q === '');
      if (lg.syarat.length) { lg.q = lg.syarat[0].q; } else { delete q.logika; }
    }

    function bindCard(c, i) {
      const q = form.pertanyaan[i];
      $('[data-toggle]', c).onclick = () => { open = open === i ? -1 : i; render(); };
      if (open !== i) return;
      const rerender = () => { dirty = true; render(); };
      $$('[data-f]', c).forEach(inp => {
        const k = inp.dataset.f;
        const ev = inp.tagName === 'SELECT' ? 'change' : 'input';
        inp.addEventListener(ev, () => {
          dirty = true;
          if (k === 'id') { q.id = inp.value.trim().toLowerCase().replace(/[^a-z0-9_]/g, '_'); return; }
          if (k === 'tipe') {
            const nq = newQ(inp.value, form); nq.id = q.id; nq.label = q.label; nq.hint = q.hint; nq.wajib = q.wajib; nq.logika = q.logika;
            if (T[inp.value].opsi && q.opsi) nq.opsi = q.opsi;
            form.pertanyaan[i] = nq; render(); return;
          }
          q[k] = inp.value;
          if (k === 'label') $('.qc-lbl', c).textContent = inp.value;
        });
        if (k === 'id') inp.addEventListener('change', () => render());
      });
      $$('[data-b]', c).forEach(inp => inp.onchange = () => { q[inp.dataset.b] = inp.checked; rerender(); });
      $$('[data-n]', c).forEach(inp => inp.oninput = () => { dirty = true; q[inp.dataset.n] = inp.value === '' ? '' : Number(inp.value); });
      $$('[data-peran]', c).forEach(inp => inp.onchange = () => { q.peran = inp.checked ? 'umur' : ''; dirty = true; });
      $$('[data-ov]', c).forEach(inp => inp.oninput = () => { const [k, j] = inp.dataset.ov.split(':'); q[k][j].v = inp.value; dirty = true; });
      $$('[data-ol]', c).forEach(inp => inp.oninput = () => { const [k, j] = inp.dataset.ol.split(':'); q[k][j].l = inp.value; dirty = true; });
      $$('[data-odel]', c).forEach(b => b.onclick = () => { const [k, j] = b.dataset.odel.split(':'); q[k].splice(j, 1); rerender(); });
      $$('[data-oadd]', c).forEach(b => b.onclick = () => { const k = b.dataset.oadd; q[k] = q[k] || []; const n = q[k].length + 1; q[k].push({ v: String(n), l: (k === 'baris' ? 'Baris ' : 'Opsi ') + n }); rerender(); });
      $$('[data-obulk]', c).forEach(b => b.onclick = () => {
        const k = b.dataset.obulk;
        const s = UI.sheet(`<p class="small muted" style="margin-top:0">Satu opsi per baris. Format: <code>label</code> atau <code>nilai|label</code>.</p><textarea class="inp" rows="8" id="bulk">${esc((q[k] || []).map(o => o.v + '|' + o.l).join('\n'))}</textarea><button class="btn block mt" id="bulk-ok">Terapkan</button>`, { title: 'Tempel daftar opsi' });
        $('#bulk-ok', s).onclick = () => {
          q[k] = $('#bulk', s).value.split('\n').map(x => x.trim()).filter(Boolean).map((x, j) => { const p = x.split('|'); return p.length > 1 ? { v: p[0].trim(), l: p.slice(1).join('|').trim() } : { v: String(j + 1), l: x }; });
          s.remove(); rerender();
        };
      });
      // logika
      $$('[data-lq]', c).forEach(s => s.onchange = () => { const lg = getLogic(q); lg.syarat[s.dataset.lq].q = s.value; lg.syarat[s.dataset.lq].v = ''; normLogic(q); rerender(); });
      $$('[data-lo]', c).forEach(s => s.onchange = () => { const lg = getLogic(q); lg.syarat[s.dataset.lo].op = s.value; normLogic(q); rerender(); });
      $$('[data-lv]', c).forEach(s => s.addEventListener(s.tagName === 'SELECT' ? 'change' : 'input', () => { const lg = getLogic(q); lg.syarat[s.dataset.lv].v = s.value; normLogic(q); dirty = true; }));
      $$('[data-ldel]', c).forEach(b => b.onclick = () => { const lg = getLogic(q); lg.syarat.splice(b.dataset.ldel, 1); normLogic(q); rerender(); });
      $$('[data-lg]', c).forEach(b => b.onclick = () => { getLogic(q).gabung = b.dataset.lg; normLogic(q); rerender(); });
      const la = $('[data-ladd]', c);
      if (la) la.onclick = () => { const lg = getLogic(q); const prev = form.pertanyaan.slice(0, i).filter(x => !Core.NON_INPUT[x.tipe]); lg.syarat.push({ q: prev[prev.length - 1].id, op: '=', v: '' }); normLogic(q); rerender(); };
      // alat
      $$('[data-act]', c).forEach(b => b.onclick = async () => {
        const a = b.dataset.act; const P = form.pertanyaan;
        if (a === 'up' && i > 0) { [P[i - 1], P[i]] = [P[i], P[i - 1]]; open = i - 1; }
        if (a === 'down' && i < P.length - 1) { [P[i + 1], P[i]] = [P[i], P[i + 1]]; open = i + 1; }
        if (a === 'dup') { const cp = JSON.parse(JSON.stringify(q)); cp.id = q.id + '_2'; while (P.some(x => x.id === cp.id)) cp.id += '_'; P.splice(i + 1, 0, cp); open = i + 1; }
        if (a === 'ins') { palette(i + 1); return; }
        if (a === 'del') { if (!(await UI.confirm('Hapus pertanyaan ini?', 'Hapus', true))) return; P.splice(i, 1); open = -1; }
        rerender();
      });
    }

    function palette(at) {
      const groups = {};
      Object.keys(T).forEach(k => (groups[T[k].grup] = groups[T[k].grup] || []).push(k));
      const s = UI.sheet(`<div class="palette">${Object.keys(groups).map(g => `<div class="pg">${g}</div>` + groups[g].map(k => `<button data-k="${k}"><b>${T[k].ico}</b>${T[k].label}</button>`).join('')).join('')}</div>`, { title: 'Pilih jenis pertanyaan' });
      $$('[data-k]', s).forEach(b => b.onclick = () => {
        const q = newQ(b.dataset.k, form);
        form.pertanyaan.splice(at, 0, q);
        open = at; dirty = true; s.remove(); render();
        setTimeout(() => { const c = $(`.qcard[data-i="${at}"]`, el); if (c) c.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 50);
      });
    }

    /* ---------- Tab Pengaturan ---------- */
    function renderSettings(body) {
      const fk = M.faskes;
      const mode = form.faskes_mode || (form.faskes_ids && form.faskes_ids.length === 1 ? 'satu' : 'banyak');
      const selF = form.faskes_ids || [];
      const unitPool = M.units.filter(u => !selF.length || selF.includes(u.faskes_id));
      const n = Core.sampelKrejcie(form.populasi);
      body.innerHTML = `<div class="card">
        <div class="field"><label>Judul survei *</label><input class="inp" data-s="judul" value="${esc(form.judul || '')}"></div>
        <div class="field"><label>Deskripsi / pengantar</label><textarea class="inp" data-s="deskripsi">${esc(form.deskripsi || '')}</textarea></div>
        <div class="field"><label>Jenis instrumen</label><div class="seg" data-seg="tipe"><button data-v="standar" class="${form.tipe === 'standar' ? 'on' : ''}">Standar PermenPAN-RB</button><button data-v="custom" class="${form.tipe !== 'standar' ? 'on' : ''}">Instrumen baru</button></div></div>
        <div class="field"><label>Periode survei</label><select class="inp" data-s="periode_id">${UI.opts(M.periods, form.periode_id, 'id', 'nama', '— Pilih periode —')}</select><div class="help">Respons disimpan di spreadsheet terpisah per periode.</div></div>
        <div class="field"><label>Status</label><div class="seg" data-seg="status">${['draft', 'aktif', 'ditutup'].map(s => `<button data-v="${s}" class="${(form.status || 'draft') === s ? 'on' : ''}">${s[0].toUpperCase() + s.slice(1)}</button>`).join('')}</div></div>
      </div>
      <div class="card"><h3>Cakupan fasilitas</h3>
        <div class="seg" data-seg="faskes_mode"><button data-v="satu" class="${mode === 'satu' ? 'on' : ''}">1 instrumen – 1 fasilitas</button><button data-v="banyak" class="${mode === 'banyak' ? 'on' : ''}">1 instrumen – banyak fasilitas</button></div>
        <div class="help mt">${mode === 'satu' ? 'Pilih satu fasilitas.' : 'Centang fasilitas yang ikut. Kosongkan semua = seluruh fasilitas.'}</div>
        <div class="mt">${fk.map(f => `<label class="opt ${mode === 'banyak' ? 'multi' : ''} ${selF.includes(f.id) ? 'on' : ''}" data-fk="${f.id}"><span class="dot"></span><span class="grow">${esc(f.nama)}</span><span class="chip gray">${esc(f.jenis)}</span></label>`).join('') || '<p class="muted">Belum ada data fasilitas. Tambahkan di menu Faskes & Unit.</p>'}</div>
        <label class="switch mt"><span>Unit layanan wajib dipilih</span><input type="checkbox" data-sb="unit_wajib" ${form.unit_wajib ? 'checked' : ''}></label>
        <details><summary class="small" style="cursor:pointer;font-weight:650">Batasi unit layanan tertentu (${(form.unit_ids || []).length || 'semua'})</summary>
          <div class="mt">${unitPool.map(u => `<label class="opt multi ${(form.unit_ids || []).includes(u.id) ? 'on' : ''}" data-un="${u.id}"><span class="dot"></span><span class="grow">${esc(u.nama)}</span><span class="small muted">${esc(Master.faskesName(u.faskes_id))}</span></label>`).join('')}</div>
        </details>
      </div>
      <div class="card"><h3>Mode pengisian</h3>
        ${[['enumerator', 'Enumerator (petugas, mendukung offline)'], ['responden', 'Responden mandiri (link / QR / WhatsApp)'], ['kiosk', 'Kiosk / tablet di ruang tunggu']].map(m => `<label class="switch"><span>${m[1]}</span><input type="checkbox" data-mode="${m[0]}" ${(form.mode_input || []).includes(m[0]) ? 'checked' : ''}></label>`).join('')}
        <label class="switch"><span>Dashboard dapat diakses publik</span><input type="checkbox" data-sb="dashboard_publik" ${form.dashboard_publik ? 'checked' : ''}></label>
      </div>
      <div class="card"><h3>Persetujuan & sampel</h3>
        <div class="field"><label>Teks persetujuan (informed consent, UU PDP)</label><textarea class="inp" data-s="persetujuan">${esc(form.persetujuan || '')}</textarea><div class="help">Kosongkan jika tidak memakai persetujuan.</div></div>
        <div class="field"><label>Populasi (jumlah pengguna layanan per periode)</label><input class="inp" type="number" data-sn="populasi" value="${esc(form.populasi || '')}"><div class="help" id="b-sampel">Sampel minimum (Krejcie & Morgan): <b>${n ? fmt.n(n) + ' responden' : '-'}</b></div></div>
      </div>`;
      $$('[data-s]', body).forEach(i => i.addEventListener(i.tagName === 'SELECT' ? 'change' : 'input', () => { form[i.dataset.s] = i.value; dirty = true; }));
      $$('[data-sn]', body).forEach(i => i.oninput = () => { form[i.dataset.sn] = Number(i.value); const k = Core.sampelKrejcie(i.value); $('#b-sampel', body).innerHTML = 'Sampel minimum (Krejcie & Morgan): <b>' + (k ? fmt.n(k) + ' responden' : '-') + '</b>'; dirty = true; });
      $$('[data-sb]', body).forEach(i => i.onchange = () => { form[i.dataset.sb] = i.checked; dirty = true; });
      $$('[data-mode]', body).forEach(i => i.onchange = () => { const s = new Set(form.mode_input || []); i.checked ? s.add(i.dataset.mode) : s.delete(i.dataset.mode); form.mode_input = Array.from(s); dirty = true; });
      $$('[data-seg]', body).forEach(sg => $$('button', sg).forEach(b => b.onclick = () => {
        form[sg.dataset.seg] = b.dataset.v; dirty = true;
        if (sg.dataset.seg === 'faskes_mode' && b.dataset.v === 'satu') form.faskes_ids = (form.faskes_ids || []).slice(0, 1);
        renderSettings(body);
      }));
      $$('[data-fk]', body).forEach(o => o.onclick = e => {
        e.preventDefault(); const id = o.dataset.fk;
        let s = form.faskes_ids || [];
        if ((form.faskes_mode || mode) === 'satu') s = [id];
        else s = s.includes(id) ? s.filter(x => x !== id) : s.concat(id);
        form.faskes_ids = s; dirty = true; renderSettings(body);
      });
      $$('[data-un]', body).forEach(o => o.onclick = e => {
        e.preventDefault(); const id = o.dataset.un; const s = form.unit_ids || [];
        form.unit_ids = s.includes(id) ? s.filter(x => x !== id) : s.concat(id); dirty = true; o.classList.toggle('on');
      });
    }

    /* ---------- Tab Pratinjau ---------- */
    function renderPreview(body) {
      body.innerHTML = '<div id="b-prev" style="margin:0 -16px"></div>';
      const fk = form.faskes_ids && form.faskes_ids.length ? M.faskes.filter(f => form.faskes_ids.includes(f.id)) : M.faskes;
      Renderer.mount($('#b-prev', body), {
        form, faskes: fk, units: M.units, mode: 'responden', settings: M.settings, preview: true,
        onSubmit: async () => { UI.toast('Pratinjau: jawaban tidak disimpan'); }
      });
    }

    render();
    return { isDirty: () => dirty };
  }

  return { mount, newQ };
})();
