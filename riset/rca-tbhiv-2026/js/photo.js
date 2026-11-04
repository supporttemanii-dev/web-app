/* RCA TB-HIV 2026 · foto pendukung: kompres, potong, tutup (blur), konfirmasi tanpa identitas, antre saat offline */
(function () {
  'use strict';
  const RCA = window.RCA, h = RCA.h;
  const MAX = 1600, QUALITY = 0.72;
  const photo = RCA.photo = {};

  function loadImage(file) {
    return new Promise((res, rej) => { const img = new Image(); img.onload = () => res(img); img.onerror = rej; img.src = URL.createObjectURL(file); });
  }
  function toCanvas(img) {
    const s = Math.min(1, MAX / Math.max(img.naturalWidth, img.naturalHeight));
    const c = document.createElement('canvas'); c.width = Math.round(img.naturalWidth * s); c.height = Math.round(img.naturalHeight * s);
    c.getContext('2d').drawImage(img, 0, 0, c.width, c.height); return c;
  }
  /** mozaik (blur) pada kotak; b = ukuran blok, diselaraskan ke kisi agar sapuan kuas menyatu */
  function pixelate(ctx, x, y, w, hgt, b) {
    const W = ctx.canvas.width, H = ctx.canvas.height;
    b = b || Math.max(10, Math.round(Math.max(w, hgt) / 14));
    const x0 = Math.max(0, Math.floor(x / b) * b), y0 = Math.max(0, Math.floor(y / b) * b);
    const x1 = Math.min(W, Math.ceil((x + w) / b) * b), y1 = Math.min(H, Math.ceil((y + hgt) / b) * b);
    if (x1 <= x0 || y1 <= y0) return;
    const data = ctx.getImageData(x0, y0, x1 - x0, y1 - y0), dw = x1 - x0, dh = y1 - y0;
    for (let yy = 0; yy < dh; yy += b) for (let xx = 0; xx < dw; xx += b) {
      let r = 0, g = 0, bl = 0, n = 0;
      for (let j = yy; j < Math.min(yy + b, dh); j++) for (let i = xx; i < Math.min(xx + b, dw); i++) { const p = (j * dw + i) * 4; r += data.data[p]; g += data.data[p + 1]; bl += data.data[p + 2]; n++; }
      ctx.fillStyle = `rgb(${r / n | 0},${g / n | 0},${bl / n | 0})`; ctx.fillRect(x0 + xx, y0 + yy, Math.min(b, dw - xx), Math.min(b, dh - yy));
    }
  }
  photo._pixelate = pixelate;

  /* ---------------- area gambar yang dapat diperbesar: tombol −/+, roda tetikus (Ctrl), cubit dua jari, geser */
  function zoomPane(canvas, opts) {
    opts = opts || {};
    const pane = h('div', { class: 'zpane' }), z = { k: 1, max: opts.max || 8, pane, canvas };
    pane.appendChild(canvas);
    const fitW = () => Math.max(40, Math.min(canvas.width, pane.clientWidth || canvas.width));
    const label = h('span', { class: 'zlabel', 'aria-live': 'polite' }, '100%');
    z.apply = (k, cx, cy) => {
      const old = canvas.getBoundingClientRect().width || fitW();
      k = Math.max(1, Math.min(z.max, k)); z.k = k;
      const nw = fitW() * k; canvas.style.width = nw + 'px'; canvas.style.height = 'auto';
      if (cx === undefined) { cx = pane.clientWidth / 2; cy = pane.clientHeight / 2; }
      const ratio = nw / old;
      pane.scrollLeft = (pane.scrollLeft + cx) * ratio - cx; pane.scrollTop = (pane.scrollTop + cy) * ratio - cy;
      label.textContent = Math.round(k * 100) + '%';
      pane.classList.toggle('zoomed', k > 1.01);
      opts.onZoom && opts.onZoom(k);
    };
    z.fit = () => { z.k = 1; canvas.style.width = fitW() + 'px'; pane.scrollLeft = 0; pane.scrollTop = 0; label.textContent = '100%'; pane.classList.remove('zoomed'); };
    z.bar = h('div', { class: 'zbar' },
      h('button', { class: 'btn small', type: 'button', 'aria-label': 'Perkecil', onclick: () => z.apply(z.k / 1.4) }, '−'), label,
      h('button', { class: 'btn small', type: 'button', 'aria-label': 'Perbesar', onclick: () => z.apply(z.k * 1.4) }, '+'),
      h('button', { class: 'btn small ghost', type: 'button', onclick: () => z.fit() }, 'Pas layar'));
    pane.addEventListener('wheel', e => { if (!e.ctrlKey && !opts.wheel) return; e.preventDefault(); const r = pane.getBoundingClientRect(); z.apply(z.k * (e.deltaY < 0 ? 1.15 : 1 / 1.15), e.clientX - r.left, e.clientY - r.top); }, { passive: false });
    // cubit/geser dua jari (layar sentuh)
    const pts = new Map(); let pinch = null;
    z.pointers = pts;
    z.onDown = e => { pts.set(e.pointerId, { x: e.clientX, y: e.clientY }); if (pts.size === 2) { const [a, b] = [...pts.values()]; pinch = { d: Math.hypot(a.x - b.x, a.y - b.y), k: z.k, mx: (a.x + b.x) / 2, my: (a.y + b.y) / 2 }; } };
    z.onMove = e => {
      if (!pts.has(e.pointerId)) return false; pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (pts.size === 2 && pinch) {
        const [a, b] = [...pts.values()], d = Math.hypot(a.x - b.x, a.y - b.y), mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2, r = pane.getBoundingClientRect();
        pane.scrollLeft -= mx - pinch.mx; pane.scrollTop -= my - pinch.my; pinch.mx = mx; pinch.my = my;
        z.apply(pinch.k * d / pinch.d, mx - r.left, my - r.top); return true;
      }
      return false;
    };
    z.onUp = e => { pts.delete(e.pointerId); if (pts.size < 2) pinch = null; };
    z.pinching = () => pts.size >= 2;
    requestAnimationFrame(() => z.fit());
    return z;
  }
  photo.zoomPane = zoomPane;

  /* ---------------- EXIF: waktu ambil dan GPS dari berkas JPEG (sebelum dikompres; kanvas menghapus EXIF) */
  photo.readExif = async function (file) {
    try {
      const buf = await file.slice(0, 256 * 1024).arrayBuffer(), v = new DataView(buf);
      if (v.getUint16(0) !== 0xFFD8) return {};
      let o = 2;
      while (o + 4 < v.byteLength) {
        const mk = v.getUint16(o), len = v.getUint16(o + 2);
        if (mk === 0xFFE1 && v.getUint32(o + 4) === 0x45786966) return parseTiff(v, o + 10);
        if ((mk & 0xFF00) !== 0xFF00) break;
        o += 2 + len;
      }
    } catch (e) { }
    return {};
  };
  function parseTiff(v, t) {
    const le = v.getUint16(t) === 0x4949, u16 = o => v.getUint16(o, le), u32 = o => v.getUint32(o, le);
    const ifd = off => { const out = {}; const n = u16(t + off); for (let i = 0; i < n; i++) { const e = t + off + 2 + i * 12; out[u16(e)] = { type: u16(e + 2), count: u32(e + 4), at: e + 8 }; } return out; };
    const val = x => {
      if (!x) return undefined;
      const size = { 1: 1, 2: 1, 3: 2, 4: 4, 5: 8 }[x.type] || 1, ptr = size * x.count > 4 ? t + u32(x.at) : x.at;
      if (x.type === 2) { let s = ''; for (let i = 0; i < x.count - 1; i++) s += String.fromCharCode(v.getUint8(ptr + i)); return s.trim(); }
      if (x.type === 3) return u16(ptr);
      if (x.type === 4) return u32(ptr);
      if (x.type === 5) { const a = []; for (let i = 0; i < x.count; i++) { const d = u32(ptr + i * 8 + 4); a.push(d ? u32(ptr + i * 8) / d : 0); } return a; }
      return undefined;
    };
    const out = {};
    const i0 = ifd(u32(t + 4));
    if (i0[0x8769]) { const ex = ifd(val(i0[0x8769])); out.dt = val(ex[0x9003]) || val(ex[0x9004]); out.tz = val(ex[0x9011]); }
    if (!out.dt) out.dt = val(i0[0x0132]);
    if (i0[0x8825]) {
      const g = ifd(val(i0[0x8825]));
      const dms = a => a && a.length === 3 ? a[0] + a[1] / 60 + a[2] / 3600 : NaN;
      let lat = dms(val(g[2])), lng = dms(val(g[4]));
      if (/S/i.test(val(g[1]) || '')) lat = -lat; if (/W/i.test(val(g[3]) || '')) lng = -lng;
      if (isFinite(lat) && isFinite(lng) && (lat || lng)) out.geo = { lat, lng, src: 'exif' };
    }
    if (out.dt) { const m = /^(\d{4}):(\d{2}):(\d{2}) (\d{2}):(\d{2}):(\d{2})/.exec(out.dt); out.iso = m ? m[1] + '-' + m[2] + '-' + m[3] + 'T' + m[4] + ':' + m[5] + ':' + m[6] + (out.tz && /^[+-]\d{2}:\d{2}$/.test(out.tz) ? out.tz : '') : ''; }
    return out;
  }
  /** lokasi perangkat saat ini (izin diminta peramban); null bila ditolak/tidak tersedia */
  photo.locate = function () {
    return new Promise(res => {
      if (!navigator.geolocation) return res({ err: 'Perangkat tidak mendukung lokasi' });
      let done = false; const fin = x => { if (!done) { done = true; res(x); } };
      setTimeout(() => fin({ err: 'Lokasi tidak didapat dalam 20 detik' }), 20000);
      navigator.geolocation.getCurrentPosition(p => fin({ lat: p.coords.latitude, lng: p.coords.longitude, acc: p.coords.accuracy, src: 'perangkat' }),
        e => fin({ err: e.code === 1 ? 'Izin lokasi ditolak' : 'Lokasi tidak tersedia' }), { enableHighAccuracy: true, timeout: 18000, maximumAge: 60000 });
    });
  };
  const two = n => String(n).padStart(2, '0');
  const stampTime = iso => { const d = new Date(iso); if (isNaN(d)) return ''; const tz = -d.getTimezoneOffset() / 60; return two(d.getDate()) + '/' + two(d.getMonth() + 1) + '/' + d.getFullYear() + ' ' + two(d.getHours()) + ':' + two(d.getMinutes()) + ' ' + ({ 7: 'WIB', 8: 'WITA', 9: 'WIT' }[tz] || 'UTC' + (tz >= 0 ? '+' : '') + tz); };
  photo.stampTime = stampTime;
  /** teks cap: sumber · waktu · koordinat dibulatkan (±1 km) */
  photo.stampText = function (meta) {
    const g = meta.geo;
    return [meta.src === 'kamera' ? 'Kamera' : 'Galeri', meta.taken_at ? (meta.src === 'kamera' ? '' : 'diambil ') + stampTime(meta.taken_at) + (meta.taken_src === 'berkas' ? ' (waktu berkas)' : '') : 'waktu tidak diketahui',
      g ? g.lat.toFixed(2) + ', ' + g.lng.toFixed(2) + ' (±1 km)' : 'lokasi tidak tersedia'].join(' · ');
  };
  function stamp(canvas, text) {
    const c = document.createElement('canvas'); const fs = Math.max(14, Math.round(canvas.width / 48)), band = Math.round(fs * 1.9);
    c.width = canvas.width; c.height = canvas.height + band;
    const x = c.getContext('2d'); x.drawImage(canvas, 0, 0);
    x.fillStyle = '#0d1a1c'; x.fillRect(0, canvas.height, c.width, band);
    x.fillStyle = '#ffffff'; x.font = '600 ' + fs + 'px system-ui, sans-serif'; x.textBaseline = 'middle';
    x.fillText(text, Math.round(fs * 0.6), canvas.height + band / 2, c.width - fs * 1.2);
    return c;
  }

  /** buka editor; hasil {b64, caption} atau null. meta = {src, taken_at, geo} untuk cap foto.
      Perbesar dulu (−/+ atau cubit dua jari), lalu tutup bagian beridentitas dengan kotak blur atau kuas blur. */
  photo.edit = async function (file, meta) {
    const img = await loadImage(file);
    let canvas = toCanvas(img);
    const history = [];
    const view = h('canvas', { class: 'pedcanvas' });
    let mode = 'blur', drag = null, stroke = null;
    const draw = () => { if (view.width !== canvas.width || view.height !== canvas.height) { view.width = canvas.width; view.height = canvas.height; } view.getContext('2d').drawImage(canvas, 0, 0); };
    draw();
    const Z = zoomPane(view, { max: 10 });
    const snapshot = () => { const c = document.createElement('canvas'); c.width = canvas.width; c.height = canvas.height; c.getContext('2d').drawImage(canvas, 0, 0); history.push(c); if (history.length > 30) history.shift(); };
    const pos = e => { const r = view.getBoundingClientRect(); return { x: (e.clientX - r.left) * view.width / r.width, y: (e.clientY - r.top) * view.height / r.height }; };
    const scale = () => view.width / (view.getBoundingClientRect().width || view.width);   // piksel gambar per piksel layar
    const brushR = () => Math.max(6, Math.round(Number(brush.value) * scale()));
    const blockB = () => Math.max(6, Math.round(Math.max(canvas.width, canvas.height) / 110));
    const dab = (x, y) => { const r = brushR(); pixelate(canvas.getContext('2d'), x - r, y - r, r * 2, r * 2, blockB()); };
    let panFrom = null;
    view.addEventListener('pointerdown', e => {
      Z.onDown(e);
      if (Z.pinching()) { drag = null; if (stroke) { stroke = null; draw(); } return; }
      if (mode === 'pan') { panFrom = { x: e.clientX, y: e.clientY, sl: Z.pane.scrollLeft, st: Z.pane.scrollTop }; view.setPointerCapture(e.pointerId); return; }
      view.setPointerCapture(e.pointerId);
      if (mode === 'brush') { snapshot(); stroke = pos(e); dab(stroke.x, stroke.y); draw(); return; }
      drag = { a: pos(e) };
    });
    view.addEventListener('pointermove', e => {
      if (Z.onMove(e)) return;
      if (panFrom) { Z.pane.scrollLeft = panFrom.sl - (e.clientX - panFrom.x); Z.pane.scrollTop = panFrom.st - (e.clientY - panFrom.y); return; }
      if (stroke) {
        const p = pos(e), d = Math.hypot(p.x - stroke.x, p.y - stroke.y), step = Math.max(2, brushR() / 2);
        for (let t = step; t <= d; t += step) dab(stroke.x + (p.x - stroke.x) * t / d, stroke.y + (p.y - stroke.y) * t / d);
        if (d >= step) stroke = p; draw(); return;
      }
      if (!drag) return; drag.b = pos(e); draw();
      const ctx = view.getContext('2d'); const x = Math.min(drag.a.x, drag.b.x), y = Math.min(drag.a.y, drag.b.y);
      ctx.strokeStyle = mode === 'crop' ? '#7fe0cf' : '#ffb020'; ctx.lineWidth = Math.max(2, 3 * scale()); ctx.setLineDash([12 * scale(), 8 * scale()]);
      ctx.strokeRect(x, y, Math.abs(drag.b.x - drag.a.x), Math.abs(drag.b.y - drag.a.y));
    });
    const end = e => {
      Z.onUp(e); panFrom = null;
      if (stroke) { stroke = null; draw(); return; }
      if (!drag || !drag.b) { drag = null; draw(); return; }
      const x = Math.max(0, Math.round(Math.min(drag.a.x, drag.b.x))), y = Math.max(0, Math.round(Math.min(drag.a.y, drag.b.y)));
      const w = Math.min(canvas.width - x, Math.round(Math.abs(drag.b.x - drag.a.x))), hh = Math.min(canvas.height - y, Math.round(Math.abs(drag.b.y - drag.a.y)));
      drag = null;
      if (w < 4 || hh < 4) { draw(); return; }
      snapshot();
      if (mode === 'blur') pixelate(canvas.getContext('2d'), x, y, w, hh, Math.max(blockB(), Math.round(Math.max(w, hh) / 14)));
      else { const c = document.createElement('canvas'); c.width = w; c.height = hh; c.getContext('2d').drawImage(canvas, x, y, w, hh, 0, 0, w, hh); canvas = c; requestAnimationFrame(() => Z.fit()); }
      draw();
    };
    view.addEventListener('pointerup', end); view.addEventListener('pointercancel', end);
    const mk = (m, label, title) => h('button', { class: 'btn small', type: 'button', 'aria-pressed': m === mode ? 'true' : 'false', title, 'data-mode': m, onclick: () => setMode(m) }, label);
    const btns = [mk('pan', '✋ Geser', 'Geser gambar yang diperbesar'), mk('blur', '▭ Kotak blur', 'Seret kotak di atas bagian beridentitas'), mk('brush', '🖌 Kuas blur', 'Sapukan pada bagian beridentitas'), mk('crop', '✂ Potong', 'Seret kotak bagian yang disimpan')];
    const brush = h('input', { type: 'range', min: 6, max: 60, value: 18, 'aria-label': 'Ukuran kuas' });
    const brushBox = h('label', { class: 'row brushsz', hidden: true }, h('small', null, 'Ukuran kuas'), brush);
    const setMode = m => { mode = m; btns.forEach(b => b.setAttribute('aria-pressed', b.getAttribute('data-mode') === m ? 'true' : 'false')); brushBox.hidden = m !== 'brush'; view.style.touchAction = m === 'pan' ? 'pan-x pan-y' : 'none'; view.style.cursor = m === 'pan' ? 'grab' : 'crosshair'; };
    setMode('blur');
    const bUndo = h('button', { class: 'btn small', type: 'button', onclick: () => { if (history.length) { canvas = history.pop(); draw(); requestAnimationFrame(() => Z.apply(Z.k)); } } }, '↶ Urungkan');
    const bRot = h('button', { class: 'btn small', type: 'button', onclick: () => {
      const c = document.createElement('canvas'); c.width = canvas.height; c.height = canvas.width; const x = c.getContext('2d');
      x.translate(c.width, 0); x.rotate(Math.PI / 2); x.drawImage(canvas, 0, 0); history.push(canvas); canvas = c; draw(); requestAnimationFrame(() => Z.fit()); } }, '⟳ Putar 90°');
    const cap = h('input', { type: 'text', placeholder: 'Keterangan singkat (contoh: Register TB hal. 12, baris unit A007)' });
    const cb = h('input', { type: 'checkbox', id: 'noid' });
    const size = h('small', { class: 'muted' });
    const body = h('div', { class: 'ped' },
      h('div', { class: 'notice warn' }, h('b', null, 'Pastikan nama, NIK, nomor RM, alamat, nomor telepon, dan wajah tidak terlihat. '), 'Perbesar dulu dengan tombol + (atau cubit dua jari), lalu pilih "Kotak blur" atau "Kuas blur" pada bagian tersebut. Pakai "Geser" untuk berpindah bagian saat diperbesar.'),
      h('div', { class: 'tools' }, btns, brushBox, bUndo, bRot), Z.bar, Z.pane,
      meta ? h('div', { class: 'stampinfo' }, h('b', null, 'Cap pada foto: '), photo.stampText(meta), meta.geoErr ? h('small', { class: 'muted' }, ' · ' + meta.geoErr) : null) : null,
      cap,
      h('label', { style: { display: 'flex', gap: '10px', alignItems: 'flex-start', fontWeight: 700 } }, cb, 'Saya sudah memastikan nama/NIK/nomor RM dan identitas lain tidak terlihat pada foto ini.'), size);
    const res = await RCA.modal('Siapkan foto', body, [{ label: 'Batal', value: null }, { label: 'Simpan foto', cls: 'primary', value: 'ok', validate: () => {
      if (!cb.checked) { RCA.toast('Centang konfirmasi bahwa identitas tidak terlihat', 'err'); cb.focus(); return false; } return true; } }], { wide: true, sticky: true });
    URL.revokeObjectURL(img.src);
    if (res !== 'ok') return null;
    if (meta) canvas = stamp(canvas, photo.stampText(meta));
    const b64 = canvas.toDataURL('image/jpeg', QUALITY).split(',')[1];
    return { b64, caption: cap.value, kb: Math.round(b64.length * 0.75 / 1024) };
  };

  /* ---------------- penampil foto: geser kiri/kanan, panah keyboard, usap, perbesar */
  async function b64Of(item) {
    if (item.pending) return (await RCA.idb.get('photos', item.pending) || {}).b64 || null;
    const c = await RCA.idb.get('photos', 'id|' + item.id); if (c) return c.b64;
    if (!RCA.state.online) return null;
    try { const r = await RCA.api('photo.get', { id: item.id }); RCA.idb.set('photos', 'id|' + item.id, { b64: r.b64 }); return r.b64; } catch (e) { return null; }
  }
  photo.b64Of = b64Of;
  photo.viewer = function (items, start, precise) {
    items = items.filter(x => x && (x.id || x.pending)); if (!items.length) return;
    let i = Math.max(0, Math.min(items.length - 1, start || 0)), Z = null;
    const stage = h('div', { class: 'pv-stage' }), cap = h('div', { class: 'pv-cap' }), count = h('span', { class: 'pv-count' });
    const prev = h('button', { class: 'pv-nav prev', type: 'button', 'aria-label': 'Foto sebelumnya', onclick: () => go(-1) }, '‹');
    const next = h('button', { class: 'pv-nav next', type: 'button', 'aria-label': 'Foto berikutnya', onclick: () => go(1) }, '›');
    const zbar = h('div', { class: 'pv-zbar' });
    const strip = h('div', { class: 'pv-strip' });
    const show = async () => {
      const it = items[i]; count.textContent = (i + 1) + ' / ' + items.length;
      prev.disabled = i === 0; next.disabled = i === items.length - 1;
      cap.innerHTML = ''; cap.appendChild(h('b', null, it.caption || it.name || 'Foto')); const ml = photo.metaLine(it, precise && precise[it.id]); if (ml) cap.appendChild(h('small', { class: 'pmeta' }, ml));
      [...strip.children].forEach((t, k) => t.classList.toggle('on', k === i));
      const want = i;
      stage.innerHTML = ''; stage.appendChild(h('div', { class: 'muted pv-load' }, 'memuat…')); zbar.innerHTML = '';
      const b64 = await b64Of(it); if (want !== i) return;
      if (!b64) { stage.innerHTML = ''; stage.appendChild(h('p', { class: 'muted pv-load' }, 'Foto tidak tersedia offline.')); return; }
      const im = new Image(); im.src = 'data:image/jpeg;base64,' + b64; await im.decode().catch(() => {});
      const c = h('canvas', { class: 'pv-canvas' }); c.width = im.naturalWidth; c.height = im.naturalHeight; c.getContext('2d').drawImage(im, 0, 0);
      stage.innerHTML = ''; Z = zoomPane(c, { max: 8, wheel: true }); stage.appendChild(Z.pane); zbar.appendChild(Z.bar);
      // usap kiri/kanan saat tidak diperbesar; seret untuk menggeser saat diperbesar; ketuk dua kali = perbesar/pas
      let sw = null, pan = null, lastTap = 0;
      c.addEventListener('pointerdown', e => { Z.onDown(e); if (Z.pinching()) { sw = pan = null; return; } c.setPointerCapture(e.pointerId); if (Z.k > 1.01) pan = { x: e.clientX, y: e.clientY, sl: Z.pane.scrollLeft, st: Z.pane.scrollTop }; else sw = { x: e.clientX, y: e.clientY, t: Date.now() }; });
      c.addEventListener('pointermove', e => { if (Z.onMove(e)) return; if (pan) { Z.pane.scrollLeft = pan.sl - (e.clientX - pan.x); Z.pane.scrollTop = pan.st - (e.clientY - pan.y); } });
      const up = e => {
        Z.onUp(e);
        if (sw) { const dx = e.clientX - sw.x, dy = e.clientY - sw.y; if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.3) go(dx < 0 ? 1 : -1);
          else if (Math.abs(dx) < 8 && Math.abs(dy) < 8) { const now = Date.now(); if (now - lastTap < 320) { const r = Z.pane.getBoundingClientRect(); Z.apply(Z.k > 1.01 ? 1 : 2.5, e.clientX - r.left, e.clientY - r.top); } lastTap = now; } }
        else if (pan && Math.abs(e.clientX - pan.x) < 8 && Math.abs(e.clientY - pan.y) < 8) { const now = Date.now(); if (now - lastTap < 320) Z.fit(); lastTap = now; }
        sw = pan = null;
      };
      c.addEventListener('pointerup', up); c.addEventListener('pointercancel', up);
      c.style.touchAction = 'none';
    };
    const go = d => { const n = i + d; if (n < 0 || n >= items.length) return; i = n; show(); };
    items.forEach((it, k) => { const t = h('button', { type: 'button', class: 'pv-th', 'aria-label': 'Foto ' + (k + 1), onclick: () => { i = k; show(); } }); strip.appendChild(t);
      b64Of(it).then(b => { if (b) t.style.backgroundImage = 'url(data:image/jpeg;base64,' + b + ')'; }); });
    const onKey = e => { if (e.key === 'ArrowRight') go(1); else if (e.key === 'ArrowLeft') go(-1); else if (e.key === '+' || e.key === '=') Z && Z.apply(Z.k * 1.4); else if (e.key === '-') Z && Z.apply(Z.k / 1.4); };
    document.addEventListener('keydown', onKey);
    const body = h('div', { class: 'pviewer' }, h('div', { class: 'pv-top' }, count, zbar), h('div', { class: 'pv-main' }, prev, stage, next), cap, items.length > 1 ? strip : null,
      h('p', { class: 'muted small pv-hint' }, items.length > 1 ? 'Usap atau tekan ‹ › untuk foto lain. Ketuk dua kali, cubit, atau tombol + untuk memperbesar.' : 'Ketuk dua kali, cubit, atau tombol + untuk memperbesar.'));
    show();
    return RCA.modal('Foto pendukung', body, [{ label: 'Tutup', value: null }], { wide: true }).then(v => { document.removeEventListener('keydown', onKey); return v; });
  };

  /** keterangan sumber/waktu/lokasi di bawah foto; presisi hanya untuk Koordinator/Super Admin */
  photo.metaLine = function (item, precise) {
    const g = precise || item.geo;
    const parts = [item.src === 'kamera' ? '📷 Kamera' : item.src === 'galeri' ? '🖼 Galeri' : '', item.taken_at ? stampTime(item.taken_at) : '',
      g ? '📍 ' + (precise ? g.lat.toFixed(5) + ', ' + g.lng.toFixed(5) + (g.acc ? ' ±' + g.acc + ' m' : '') : (+g.lat).toFixed(2) + ', ' + (+g.lng).toFixed(2) + ' ±1 km') : (item.src ? 'tanpa lokasi' : '')].filter(Boolean);
    return parts.join(' · ');
  };
  async function thumb(item, precise, group) {
    const ml = photo.metaLine(item, precise);
    const fig = h('figure', null, h('div', { style: { height: '110px', display: 'grid', placeItems: 'center' } }, h('small', { class: 'muted' }, 'memuat…')),
      h('figcaption', null, (item.caption || item.name || '') + (item.pending ? ' · menunggu unggah' : ''), ml ? h('small', { class: 'pmeta' }, ml) : null,
        precise ? h('a', { class: 'small', href: 'https://www.openstreetmap.org/?mlat=' + precise.lat + '&mlon=' + precise.lng + '#map=17/' + precise.lat + '/' + precise.lng, target: '_blank', rel: 'noopener' }, 'Lihat di peta') : null));
    (async () => {
      let b64 = null;
      if (item.pending) b64 = (await RCA.idb.get('photos', item.pending) || {}).b64;
      else {
        const c = await RCA.idb.get('photos', 'id|' + item.id);
        if (c) b64 = c.b64;
        else if (RCA.state.online) { try { const r = await RCA.api('photo.get', { id: item.id }); b64 = r.b64; RCA.idb.set('photos', 'id|' + item.id, { b64 }); } catch (e) {} }
      }
      const slot = fig.firstChild;
      if (b64) {
        const im = h('img', { alt: item.caption || 'Foto pendukung', src: 'data:image/jpeg;base64,' + b64, tabindex: 0, role: 'button' });
        const open = () => { const g = group || { items: [item], precise: precise ? { [item.id]: precise } : {} }; photo.viewer(g.items, Math.max(0, g.items.indexOf(item)), g.precise); };
        im.onclick = open; im.onkeydown = e => { if (e.key === 'Enter') open(); };
        fig.replaceChild(im, slot);
      }
      else slot.firstChild.textContent = 'tidak tersedia offline';
    })();
    return fig;
  }

  photo.thumb = thumb;
  /** koordinat presisi untuk Koordinator/Super Admin (cache per sesi) */
  const geoCache = {};
  photo.preciseGeo = async function (ids) {
    if (!RCA.can.review() || !RCA.state.online) return {};
    const need = ids.filter(id => id && !(id in geoCache));
    if (need.length) { try { const r = await RCA.api('photo.geo', { ids: need }); need.forEach(id => { geoCache[id] = null; }); r.forEach(x => { geoCache[x.id] = { lat: x.lat, lng: x.lng, acc: x.acc }; }); } catch (e) { } }
    const o = {}; ids.forEach(id => { if (geoCache[id]) o[id] = geoCache[id]; }); return o;
  };
  /** galeri baca-saja untuk dasbor (Pembaca tidak melihat foto) */
  photo.gallery = function (items, title) {
    items = (items || []).filter(x => x && (x.id || x.pending));
    if (!items.length || !RCA.can.raw()) return null;
    const list = h('div', { class: 'photos' });
    (async () => { const pg = await photo.preciseGeo(items.map(x => x.id)); const g = { items, precise: pg }; for (const it of items) list.appendChild(await thumb(it, pg[it.id], g)); })();
    return h('div', { class: 'pgallery' }, h('h5', null, (title || 'Foto pendukung') + ' (' + items.length + ')'), list);
  };

  photo.section = function (ed) {
    const wrap = h('div', { class: 'stack' });
    const list = h('div', { class: 'photos' });
    const items = ed.data.foto = ed.data.foto || [];
    const refresh = async () => {
      list.innerHTML = '';
      const pg = await photo.preciseGeo(items.map(x => x.id));
      const g = { items, precise: pg };
      for (let i = 0; i < items.length; i++) {
        const f = await thumb(items[i], pg[items[i].id], g);
        if (!ed.readOnly) f.appendChild(h('button', { class: 'linkbtn', type: 'button', onclick: async () => {
          if (await RCA.confirm('Hapus foto', 'Lepaskan foto ini dari unit? (Berkas di Drive tetap disimpan untuk audit.)', 'Hapus', 'danger')) { items.splice(i, 1); ed.changed(); refresh(); }
        } }, 'Hapus'));
        list.appendChild(f);
      }
      if (!items.length) list.appendChild(h('p', { class: 'muted' }, 'Belum ada foto.'));
    };
    refresh();
    wrap.appendChild(list);
    if (!ed.readOnly) {
      let geoP = null, geoAt = 0;
      const cam = h('input', { type: 'file', accept: 'image/*', capture: 'environment', hidden: true });
      const gal = h('input', { type: 'file', accept: 'image/*', multiple: true, hidden: true });
      const addOne = async (file, fromCam) => {
        const ex = await photo.readExif(file);
        const fresh = Math.abs(Date.now() - (file.lastModified || 0)) < 3 * 60000;
        const meta = { src: fromCam && fresh ? 'kamera' : 'galeri' };
        if (meta.src === 'kamera') {
          meta.taken_at = ex.iso ? new Date(ex.iso).toISOString() : new Date(file.lastModified || Date.now()).toISOString(); meta.taken_src = ex.iso ? 'exif' : 'perangkat';
          const loc = geoP ? await geoP : await photo.locate();
          if (loc && !loc.err) meta.geo = loc; else if (ex.geo) meta.geo = ex.geo; else meta.geoErr = (loc && loc.err) || 'Lokasi tidak tersedia';
        } else {
          if (ex.iso) { meta.taken_at = new Date(ex.iso).toISOString(); meta.taken_src = 'exif'; } else if (file.lastModified) { meta.taken_at = new Date(file.lastModified).toISOString(); meta.taken_src = 'berkas'; }
          if (ex.geo) meta.geo = ex.geo; else meta.geoErr = 'Foto galeri tanpa data lokasi (EXIF)';
        }
        const rounded = meta.geo ? { lat: Math.round(meta.geo.lat * 100) / 100, lng: Math.round(meta.geo.lng * 100) / 100 } : null;
        const res = await photo.edit(file, Object.assign({}, meta, { geo: rounded })); if (!res) return;
        const send = { src: meta.src, taken_at: meta.taken_at || '', taken_src: meta.taken_src || '', geo: meta.geo ? { lat: meta.geo.lat, lng: meta.geo.lng, acc: meta.geo.acc, src: meta.geo.src } : null };
        const item = { _id: RCA.collab ? RCA.collab.uid() : 'f' + Date.now(), caption: res.caption, ts: new Date().toISOString(), by: RCA.state.user.name, src: meta.src, taken_at: meta.taken_at || '', taken_src: meta.taken_src || '' };
        if (rounded) item.geo = Object.assign({ acc: meta.geo.acc ? Math.round(meta.geo.acc) : '', src: meta.geo.src, rounded: true }, rounded);
        if (RCA.state.online) {
          try { const r = await RCA.api('photo.upload', { form: ed.form, sub: ed.sub, unit: ed.unit, b64: res.b64, caption: res.caption, confirmNoId: true, meta: send }); Object.assign(item, r); RCA.idb.set('photos', 'id|' + r.id, { b64: res.b64 }); RCA.toast('Foto diunggah (' + res.kb + ' KB)', 'ok'); }
          catch (e) { item.pending = 'p|' + Date.now(); await RCA.idb.set('photos', item.pending, { b64: res.b64, caption: res.caption, meta: send }); RCA.toast('Foto disimpan di perangkat; diunggah saat online', 'err'); }
        } else { item.pending = 'p|' + Date.now(); await RCA.idb.set('photos', item.pending, { b64: res.b64, caption: res.caption, meta: send }); RCA.toast('Offline: foto disimpan di perangkat dan diunggah nanti'); }
        items.push(item); ed.changed(); refresh();
      };
      cam.addEventListener('change', async () => { const f = cam.files[0]; cam.value = ''; if (f) await addOne(f, true); geoP = null; });
      gal.addEventListener('change', async () => { const fs = [...gal.files]; gal.value = ''; for (const f of fs) await addOne(f, false); });
      const startCam = () => { if (!geoP || Date.now() - geoAt > 60000) { geoP = photo.locate(); geoAt = Date.now(); } cam.click(); };
      wrap.appendChild(h('div', { class: 'row phbtns' }, cam, gal,
        h('button', { class: 'btn small primary', type: 'button', onclick: startCam }, '📷 Ambil foto (kamera)'),
        h('button', { class: 'btn small', type: 'button', onclick: () => gal.click() }, '🖼 Unggah dari galeri'),
        h('small', { class: 'muted' }, 'Foto kamera diberi cap waktu dan lokasi (izinkan akses lokasi). Foto galeri memakai waktu/lokasi asli bila tersimpan di berkas. Lokasi tepat hanya terlihat koordinator; pengguna lain melihat lokasi dibulatkan ±1 km.')));
    }
    return wrap;
  };

  /** unggah foto yang tertunda sebelum menyimpan rekaman */
  photo.flushPending = async function (ed) {
    const items = ed.data.foto || [];
    for (const it of items) {
      if (!it.pending) continue;
      const p = await RCA.idb.get('photos', it.pending); if (!p) { delete it.pending; continue; }
      const r = await RCA.api('photo.upload', { form: ed.form, sub: ed.sub, unit: ed.unit, b64: p.b64, caption: p.caption, confirmNoId: true, meta: p.meta || null });
      await RCA.idb.set('photos', 'id|' + r.id, { b64: p.b64 }); await RCA.idb.del('photos', it.pending);
      delete it.pending; Object.assign(it, r);
    }
  };
})();
