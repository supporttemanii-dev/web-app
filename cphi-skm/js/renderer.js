/* renderer.js — menampilkan form survei untuk diisi (enumerator / responden / kiosk) */
const Renderer = (() => {
  const EMO = ['😞', '😐', '🙂', '😄'];

  function pages(form) {
    const out = []; let cur = { judul: '', qs: [] };
    (form.pertanyaan || []).forEach(q => {
      if (q.tipe === 'halaman') { if (cur.qs.length || cur.judul) out.push(cur); cur = { judul: q.label, qs: [] }; }
      else cur.qs.push(q);
    });
    if (cur.qs.length) out.push(cur);
    return out.filter(p => p.qs.length);
  }

  function qHtml(q, data) {
    const v = data[q.id];
    const req = q.wajib ? ' <span class="req">*</span>' : '';
    if (q.tipe === 'catatan') return `<div class="q note" data-qid="${q.id}">${esc(q.label)}${q.hint ? `<div class="q-hint">${esc(q.hint)}</div>` : ''}</div>`;
    let body = '';
    const opsi = q.opsi || [];
    switch (q.tipe) {
      case 'paragraf': body = `<textarea class="inp" data-in="${q.id}" placeholder="${esc(q.placeholder || 'Tulis jawaban…')}">${esc(v || '')}</textarea>`; break;
      case 'teks': case 'email': case 'telepon': case 'angka': case 'desimal': case 'tanggal': case 'waktu': case 'tanggalwaktu': {
        const t = { teks: 'text', email: 'email', telepon: 'tel', angka: 'number', desimal: 'number', tanggal: 'date', waktu: 'time', tanggalwaktu: 'datetime-local' }[q.tipe];
        const extra = q.tipe === 'desimal' ? 'step="any" inputmode="decimal"' : q.tipe === 'angka' ? 'step="1" inputmode="numeric"' : '';
        const mm = (q.min !== undefined && q.min !== '' ? `min="${esc(q.min)}"` : '') + (q.max !== undefined && q.max !== '' && t === 'number' ? ` max="${esc(q.max)}"` : '');
        body = `<input class="inp" type="${t}" ${extra} ${mm} data-in="${q.id}" value="${esc(v || '')}" placeholder="${esc(q.placeholder || '')}">`;
        break;
      }
      case 'pilihan': case 'ya_tidak': {
        const list = q.tipe === 'ya_tidak' ? [{ v: '1', l: 'Ya' }, { v: '0', l: 'Tidak' }] : opsi.concat(q.lainnya ? [{ v: 'lainnya', l: 'Lainnya…' }] : []);
        body = list.map(o => `<label class="opt ${String(v) === String(o.v) ? 'on' : ''}" data-one="${q.id}" data-v="${esc(o.v)}"><span class="dot"></span><span>${esc(o.l)}</span></label>`).join('');
        if (q.lainnya) body += `<input class="inp mt ${v === 'lainnya' ? '' : 'hidden'}" data-in="${q.id}_lain" data-lain="${q.id}" value="${esc(data[q.id + '_lain'] || '')}" placeholder="Sebutkan…">`;
        break;
      }
      case 'kotakcentang': {
        const arr = Array.isArray(v) ? v.map(String) : [];
        body = opsi.map(o => `<label class="opt multi ${arr.includes(String(o.v)) ? 'on' : ''}" data-multi="${q.id}" data-v="${esc(o.v)}"><span class="dot"></span><span>${esc(o.l)}</span></label>`).join('');
        break;
      }
      case 'dropdown': body = `<select class="inp" data-in="${q.id}"><option value="">— Pilih —</option>${opsi.map(o => `<option value="${esc(o.v)}" ${String(v) === String(o.v) ? 'selected' : ''}>${esc(o.l)}</option>`).join('')}</select>`; break;
      case 'skala_ikm':
        body = `<div class="ikm-scale">${opsi.map((o, i) => `<div class="ik ${String(v) === String(o.v) ? 'on' : ''}" data-one="${q.id}" data-v="${esc(o.v)}" role="button" tabindex="0"><div class="em">${EMO[i] || '•'}</div><div class="tx">${esc(o.l)}</div></div>`).join('')}</div>`;
        break;
      case 'rating': {
        const mx = parseInt(q.max, 10) || 5;
        body = `<div class="stars">${Array.from({ length: mx }, (_, i) => `<button type="button" class="${(parseInt(v, 10) || 0) > i ? 'on' : ''}" data-one="${q.id}" data-v="${i + 1}" aria-label="${i + 1} bintang">★</button>`).join('')}</div>`;
        break;
      }
      case 'skala_linear': {
        const a = parseInt(q.min, 10); const mn = isNaN(a) ? 1 : a; const mx = parseInt(q.max, 10) || 10;
        body = `<div class="lin">${Array.from({ length: mx - mn + 1 }, (_, i) => mn + i).map(n => `<button type="button" class="${String(v) === String(n) ? 'on' : ''}" data-one="${q.id}" data-v="${n}">${n}</button>`).join('')}</div><div class="lin-lbl"><span>${esc(q.lbl_min || '')}</span><span>${esc(q.lbl_max || '')}</span></div>`;
        break;
      }
      case 'matriks': {
        const val = (v && typeof v === 'object') ? v : {};
        body = `<div style="overflow:auto"><table class="mtx"><tr><th></th>${opsi.map(o => `<th>${esc(o.l)}</th>`).join('')}</tr>${(q.baris || []).map(b => `<tr><td>${esc(b.l)}</td>${opsi.map(o => `<td><input type="radio" name="${q.id}__${esc(b.v)}" data-mtx="${q.id}" data-row="${esc(b.v)}" value="${esc(o.v)}" ${String(val[b.v]) === String(o.v) ? 'checked' : ''}></td>`).join('')}</tr>`).join('')}</table></div>`;
        break;
      }
      case 'lokasi': body = `<button type="button" class="btn ghost" data-gps="${q.id}">📍 Ambil lokasi saat ini</button><div class="help" data-gpsv="${q.id}">${esc(v || 'Belum diambil')}</div>`; break;
      case 'foto': body = `<label class="btn ghost">📷 Ambil / pilih foto<input type="file" accept="image/*" capture="environment" data-photo="${q.id}" hidden></label>${v ? `<img class="photo-prev" src="${esc(v)}" data-pv="${q.id}">` : `<img class="photo-prev hidden" data-pv="${q.id}">`}`; break;
      case 'tandatangan': body = `<canvas class="sigpad" data-sig="${q.id}"></canvas><div class="row mt"><button type="button" class="btn line sm" data-sigclr="${q.id}">Hapus tanda tangan</button><span class="help">Tanda tangani di kotak</span></div>`; break;
      default: body = `<input class="inp" data-in="${q.id}" value="${esc(v || '')}">`;
    }
    return `<div class="q" data-qid="${q.id}"><div class="q-lbl">${esc(q.label)}${req}</div>${q.hint ? `<div class="q-hint">${esc(q.hint)}</div>` : ''}<div class="q-body">${body}</div><div class="err hidden" data-err="${q.id}"></div></div>`;
  }

  async function resizeImage(file, max = 1280) {
    const url = URL.createObjectURL(file);
    const img = await new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = url; });
    const s = Math.min(1, max / Math.max(img.width, img.height));
    const c = document.createElement('canvas'); c.width = Math.round(img.width * s); c.height = Math.round(img.height * s);
    c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
    URL.revokeObjectURL(url);
    return c.toDataURL('image/jpeg', 0.72);
  }

  /**
   * opts: { form, faskes:[], units:[], faskes_id, unit_id, mode, settings, onSubmit(item) -> Promise, onDone, kiosk, preview }
   */
  function mount(el, opts) {
    const form = opts.form;
    const pg = pages(form);
    const st = { step: -1, data: {}, faskes_id: opts.faskes_id || '', unit_id: opts.unit_id || '', setuju: false };
    if (opts.faskes.length === 1 && !st.faskes_id) st.faskes_id = opts.faskes[0].id;

    function unitsOf(fid) { return opts.units.filter(u => u.faskes_id === fid); }

    function head(sub) {
      const pct = st.step < 0 ? 0 : Math.round((st.step + 1) / (pg.length + 1) * 100);
      return `<div class="survey-head"><div class="wrap narrow"><div class="row" style="align-items:flex-start">${opts.kiosk || opts.mode !== 'enumerator' ? UI.logo(opts.settings) : ''}<div class="grow"><h2>${esc(form.judul)}</h2><p>${esc(sub || '')}</p></div>${opts.onClose ? `<button class="ibtn" style="color:#fff" data-close>${I('x')}</button>` : ''}</div><div class="progress"><i style="width:${pct}%"></i></div></div></div>`;
    }

    function renderIntro() {
      const fk = opts.faskes;
      const fixedF = !!opts.faskes_id;
      const fixedU = !!opts.unit_id;
      const units = st.faskes_id ? unitsOf(st.faskes_id) : [];
      el.innerHTML = head(opts.settings && opts.settings.instansi) + `<div class="wrap narrow mt">
        <div class="q">${form.deskripsi ? `<p style="margin:0 0 6px">${esc(form.deskripsi)}</p>` : ''}
          ${opts.mode === 'enumerator' ? `<span class="chip info">Mode Enumerator</span>` : opts.kiosk ? `<span class="chip">Mode Kiosk</span>` : ''}
          ${opts.preview ? `<span class="chip warn">Pratinjau — tidak disimpan</span>` : ''}
        </div>
        <div class="q"><div class="q-lbl">Fasilitas kesehatan <span class="req">*</span></div><div class="q-body">
          ${fixedF ? `<b>${esc((fk.find(f => f.id === st.faskes_id) || {}).nama || '-')}</b>` : `<select class="inp" id="r-fk">${UI.opts(fk, st.faskes_id, 'id', 'nama', '— Pilih fasilitas —')}</select>`}
        </div></div>
        ${(form.unit_wajib || units.length) ? `<div class="q"><div class="q-lbl">Unit layanan yang dikunjungi ${form.unit_wajib ? '<span class="req">*</span>' : ''}</div><div class="q-body">
          ${fixedU ? `<b>${esc((opts.units.find(u => u.id === st.unit_id) || {}).nama || '-')}</b>` : `<select class="inp" id="r-un" ${!st.faskes_id ? 'disabled' : ''}>${UI.opts(units, st.unit_id, 'id', 'nama', st.faskes_id ? '— Pilih unit —' : 'Pilih fasilitas dahulu')}</select>`}
        </div></div>` : ''}
        ${form.persetujuan ? `<div class="q"><label class="opt multi ${st.setuju ? 'on' : ''}" id="r-ok" style="margin:0"><span class="dot"></span><span style="font-size:13.5px">${esc(form.persetujuan)}</span></label></div>` : ''}
        <div class="err hidden" id="r-err"></div>
        <div class="survey-nav"><button class="btn lg block" id="r-start">Mulai isi survei ${I('chev')}</button></div>
      </div>`;
      const fsel = $('#r-fk', el);
      if (fsel) fsel.onchange = () => { st.faskes_id = fsel.value; st.unit_id = ''; renderIntro(); };
      const usel = $('#r-un', el);
      if (usel) usel.onchange = () => { st.unit_id = usel.value; };
      const ok = $('#r-ok', el);
      if (ok) ok.onclick = () => { st.setuju = !st.setuju; ok.classList.toggle('on', st.setuju); };
      $('#r-start', el).onclick = () => {
        const e = $('#r-err', el);
        let msg = '';
        if (!st.faskes_id) msg = 'Pilih fasilitas kesehatan';
        else if (form.unit_wajib && !st.unit_id && unitsOf(st.faskes_id).length) msg = 'Pilih unit layanan';
        else if (form.persetujuan && !st.setuju) msg = 'Centang persetujuan untuk melanjutkan';
        if (msg) { e.textContent = msg; e.classList.remove('hidden'); return; }
        st.step = 0; renderPage();
      };
      bindClose();
    }

    function bindClose() { const c = $('[data-close]', el); if (c) c.onclick = () => opts.onClose(); }

    function refreshVisibility() {
      $$('[data-qid]', el).forEach(w => {
        const q = form.pertanyaan.find(x => x.id === w.dataset.qid);
        if (q) w.classList.toggle('hidden', !Core.evalLogika(q.logika, st.data));
      });
    }

    function setErr(qid, msg) {
      const e = $(`[data-err="${qid}"]`, el); const w = $(`[data-qid="${qid}"]`, el);
      if (!e) return;
      e.textContent = msg || ''; e.classList.toggle('hidden', !msg); w.classList.toggle('has-err', !!msg);
    }

    function renderPage() {
      const p = pg[st.step];
      const last = st.step === pg.length - 1;
      el.innerHTML = head(p.judul || ('Bagian ' + (st.step + 1) + ' dari ' + pg.length)) + `<div class="wrap narrow mt">
        ${p.qs.map(q => qHtml(q, st.data)).join('')}
        <div class="survey-nav"><button class="btn line lg" id="r-prev">${I('back')} Kembali</button><button class="btn lg grow" id="r-next">${last ? 'Kirim jawaban ' + I('check') : 'Lanjut ' + I('chev')}</button></div>
      </div>`;
      window.scrollTo(0, 0);
      refreshVisibility();
      bind(p);
      bindClose();
      $('#r-prev', el).onclick = () => { if (st.step === 0) { st.step = -1; renderIntro(); } else { st.step--; renderPage(); } };
      $('#r-next', el).onclick = async () => {
        const errs = Core.validate(form, st.data);
        let first = null;
        p.qs.forEach(q => { const m = errs[q.id]; setErr(q.id, m); if (m && !first) first = q.id; });
        if (first) { $(`[data-qid="${first}"]`, el).scrollIntoView({ behavior: 'smooth', block: 'center' }); return; }
        if (!last) { st.step++; renderPage(); return; }
        const btn = $('#r-next', el); btn.disabled = true; btn.textContent = 'Mengirim…';
        // buang jawaban pertanyaan yang tersembunyi oleh logika
        const clean = {};
        form.pertanyaan.forEach(q => { if (!Core.NON_INPUT[q.tipe] && Core.evalLogika(q.logika, st.data) && st.data[q.id] !== undefined) { clean[q.id] = st.data[q.id]; if (st.data[q.id + '_lain']) clean[q.id + '_lain'] = st.data[q.id + '_lain']; } });
        try {
          await opts.onSubmit({ form_id: form.id, faskes_id: st.faskes_id, unit_id: st.unit_id, mode: opts.mode, data: clean });
          renderThanks();
        } catch (e) { UI.toast(e.message, 'bad'); btn.disabled = false; btn.textContent = 'Kirim ulang'; }
      };
    }

    function renderThanks() {
      let sec = 8;
      el.innerHTML = head('Selesai') + `<div class="wrap narrow"><div class="thanks"><div class="big">💚</div><h2>Terima kasih!</h2><p class="muted">Jawaban Anda sangat berarti untuk peningkatan mutu pelayanan kesehatan.</p>
        ${opts.kiosk ? `<p class="muted small">Kembali ke awal dalam <b id="r-cd">${sec}</b> detik…</p>` : ''}
        <div class="row mt2" style="justify-content:center">${opts.mode === 'enumerator' || opts.kiosk ? `<button class="btn lg" id="r-again">${I('plus')} Isi responden berikutnya</button>` : ''}${opts.onDone ? `<button class="btn line lg" id="r-done">Selesai</button>` : ''}</div></div></div>`;
      const again = () => { st.step = -1; st.data = {}; st.setuju = false; if (!opts.unit_id && opts.mode !== 'enumerator') st.unit_id = ''; renderIntro(); };
      const a = $('#r-again', el); if (a) a.onclick = () => { clearInterval(t); again(); };
      const d = $('#r-done', el); if (d) d.onclick = () => { clearInterval(t); opts.onDone(); };
      let t = null;
      if (opts.kiosk) t = setInterval(() => { sec--; const c = $('#r-cd'); if (c) c.textContent = sec; if (sec <= 0) { clearInterval(t); if (document.body.contains(el)) again(); } }, 1000);
      bindClose();
    }

    function bind(p) {
      const changed = (qid) => { setErr(qid, ''); refreshVisibility(); };
      $$('[data-in]', el).forEach(inp => {
        const ev = inp.tagName === 'SELECT' ? 'change' : 'input';
        inp.addEventListener(ev, () => {
          const q = form.pertanyaan.find(x => x.id === inp.dataset.in);
          let v = inp.value;
          if (q && (q.tipe === 'angka' || q.tipe === 'desimal') && v !== '') v = Number(v);
          st.data[inp.dataset.in] = v;
          changed(inp.dataset.lain || inp.dataset.in);
        });
      });
      $$('[data-one]', el).forEach(o => {
        const pick = () => {
          const qid = o.dataset.one;
          st.data[qid] = o.dataset.v;
          $$(`[data-one="${qid}"]`, el).forEach(x => {
            const on = x.dataset.v === o.dataset.v;
            if (x.closest('.stars')) x.classList.toggle('on', parseInt(x.dataset.v, 10) <= parseInt(o.dataset.v, 10));
            else x.classList.toggle('on', on);
          });
          const lain = $(`[data-lain="${qid}"]`, el);
          if (lain) lain.classList.toggle('hidden', o.dataset.v !== 'lainnya');
          changed(qid);
        };
        o.addEventListener('click', e => { e.preventDefault(); pick(); });
        o.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick(); } });
      });
      $$('[data-multi]', el).forEach(o => o.addEventListener('click', e => {
        e.preventDefault();
        const qid = o.dataset.multi;
        const arr = Array.isArray(st.data[qid]) ? st.data[qid].slice() : [];
        const i = arr.indexOf(o.dataset.v);
        if (i >= 0) arr.splice(i, 1); else arr.push(o.dataset.v);
        st.data[qid] = arr; o.classList.toggle('on', i < 0); changed(qid);
      }));
      $$('[data-mtx]', el).forEach(r => r.addEventListener('change', () => {
        const qid = r.dataset.mtx; const o = Object.assign({}, st.data[qid] || {}); o[r.dataset.row] = r.value; st.data[qid] = o; changed(qid);
      }));
      $$('[data-gps]', el).forEach(b => b.onclick = () => {
        const qid = b.dataset.gps; const out = $(`[data-gpsv="${qid}"]`, el);
        if (!navigator.geolocation) { out.textContent = 'Perangkat tidak mendukung GPS'; return; }
        out.textContent = 'Mengambil lokasi…';
        navigator.geolocation.getCurrentPosition(pos => {
          const v = pos.coords.latitude.toFixed(6) + ',' + pos.coords.longitude.toFixed(6) + ' (±' + Math.round(pos.coords.accuracy) + ' m)';
          st.data[qid] = v; out.textContent = v; changed(qid);
        }, err => { out.textContent = 'Gagal: ' + err.message; }, { enableHighAccuracy: true, timeout: 15000 });
      });
      $$('[data-photo]', el).forEach(inp => inp.onchange = async () => {
        if (!inp.files[0]) return;
        const qid = inp.dataset.photo;
        const url = await resizeImage(inp.files[0]);
        st.data[qid] = url; const pv = $(`[data-pv="${qid}"]`, el); pv.src = url; pv.classList.remove('hidden'); changed(qid);
      });
      $$('[data-sig]', el).forEach(c => {
        const qid = c.dataset.sig;
        const ctx = c.getContext('2d');
        const fit = () => { const r = c.getBoundingClientRect(); c.width = r.width * 2; c.height = r.height * 2; ctx.scale(2, 2); ctx.lineWidth = 2.2; ctx.lineCap = 'round'; ctx.strokeStyle = '#0f172a'; if (st.data[qid]) { const im = new Image(); im.onload = () => ctx.drawImage(im, 0, 0, r.width, r.height); im.src = st.data[qid]; } };
        requestAnimationFrame(fit);
        let draw = false;
        const pt = e => { const r = c.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
        c.addEventListener('pointerdown', e => { draw = true; c.setPointerCapture(e.pointerId); const [x, y] = pt(e); ctx.beginPath(); ctx.moveTo(x, y); });
        c.addEventListener('pointermove', e => { if (!draw) return; const [x, y] = pt(e); ctx.lineTo(x, y); ctx.stroke(); });
        c.addEventListener('pointerup', () => { draw = false; st.data[qid] = c.toDataURL('image/png'); changed(qid); });
        const clr = $(`[data-sigclr="${qid}"]`, el);
        clr.onclick = () => { ctx.clearRect(0, 0, c.width, c.height); delete st.data[qid]; };
      });
    }

    if (opts.startAtPage) { st.step = 0; renderPage(); } else renderIntro();
  }

  return { mount, pages };
})();
