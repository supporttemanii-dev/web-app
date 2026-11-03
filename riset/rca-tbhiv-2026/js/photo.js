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
  function pixelate(ctx, x, y, w, hgt) {
    const b = Math.max(10, Math.round(Math.max(w, hgt) / 14));
    const data = ctx.getImageData(x, y, w, hgt);
    for (let yy = 0; yy < hgt; yy += b) for (let xx = 0; xx < w; xx += b) {
      let r = 0, g = 0, bl = 0, n = 0;
      for (let j = yy; j < Math.min(yy + b, hgt); j++) for (let i = xx; i < Math.min(xx + b, w); i++) { const p = (j * w + i) * 4; r += data.data[p]; g += data.data[p + 1]; bl += data.data[p + 2]; n++; }
      ctx.fillStyle = `rgb(${r / n | 0},${g / n | 0},${bl / n | 0})`; ctx.fillRect(x + xx, y + yy, b, b);
    }
  }

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

  /** buka editor; hasil {b64, caption} atau null. meta = {src, taken_at, geo} untuk cap foto */
  photo.edit = async function (file, meta) {
    const img = await loadImage(file);
    let canvas = toCanvas(img);
    const history = [];
    const view = h('canvas');
    let mode = 'blur', drag = null;
    const draw = () => { view.width = canvas.width; view.height = canvas.height; view.getContext('2d').drawImage(canvas, 0, 0); };
    draw();
    const pos = e => { const r = view.getBoundingClientRect(); return { x: (e.clientX - r.left) * view.width / r.width, y: (e.clientY - r.top) * view.height / r.height }; };
    view.addEventListener('pointerdown', e => { view.setPointerCapture(e.pointerId); drag = { a: pos(e) }; });
    view.addEventListener('pointermove', e => {
      if (!drag) return; drag.b = pos(e); draw();
      const ctx = view.getContext('2d'); const x = Math.min(drag.a.x, drag.b.x), y = Math.min(drag.a.y, drag.b.y);
      ctx.strokeStyle = mode === 'crop' ? '#7fe0cf' : '#ffb020'; ctx.lineWidth = Math.max(3, view.width / 300); ctx.setLineDash([12, 8]);
      ctx.strokeRect(x, y, Math.abs(drag.b.x - drag.a.x), Math.abs(drag.b.y - drag.a.y));
    });
    view.addEventListener('pointerup', () => {
      if (!drag || !drag.b) { drag = null; return; }
      const x = Math.max(0, Math.round(Math.min(drag.a.x, drag.b.x))), y = Math.max(0, Math.round(Math.min(drag.a.y, drag.b.y)));
      const w = Math.min(canvas.width - x, Math.round(Math.abs(drag.b.x - drag.a.x))), hh = Math.min(canvas.height - y, Math.round(Math.abs(drag.b.y - drag.a.y)));
      drag = null;
      if (w < 8 || hh < 8) { draw(); return; }
      const snap = document.createElement('canvas'); snap.width = canvas.width; snap.height = canvas.height; snap.getContext('2d').drawImage(canvas, 0, 0); history.push(snap);
      if (mode === 'blur') pixelate(canvas.getContext('2d'), x, y, w, hh);
      else { const c = document.createElement('canvas'); c.width = w; c.height = hh; c.getContext('2d').drawImage(canvas, x, y, w, hh, 0, 0, w, hh); canvas = c; }
      draw();
    });
    const bBlur = h('button', { class: 'btn small', type: 'button', 'aria-pressed': 'true' }, 'Tutup/blur area');
    const bCrop = h('button', { class: 'btn small', type: 'button', 'aria-pressed': 'false' }, 'Potong');
    const setMode = m => { mode = m; bBlur.setAttribute('aria-pressed', m === 'blur'); bCrop.setAttribute('aria-pressed', m === 'crop'); };
    bBlur.onclick = () => setMode('blur'); bCrop.onclick = () => setMode('crop');
    const bUndo = h('button', { class: 'btn small', type: 'button', onclick: () => { if (history.length) { canvas = history.pop(); draw(); } } }, 'Urungkan');
    const bRot = h('button', { class: 'btn small', type: 'button', onclick: () => {
      const c = document.createElement('canvas'); c.width = canvas.height; c.height = canvas.width; const x = c.getContext('2d');
      x.translate(c.width, 0); x.rotate(Math.PI / 2); x.drawImage(canvas, 0, 0); history.push(canvas); canvas = c; draw(); } }, 'Putar 90°');
    const cap = h('input', { type: 'text', placeholder: 'Keterangan singkat (contoh: Register TB hal. 12, baris unit A007)' });
    const cb = h('input', { type: 'checkbox', id: 'noid' });
    const size = h('small', { class: 'muted' });
    const body = h('div', { class: 'ped' },
      h('div', { class: 'notice warn' }, h('b', null, 'Pastikan nama, NIK, nomor RM, alamat, nomor telepon, dan wajah tidak terlihat. '), 'Pilih "Tutup/blur area" lalu seret kotak di atas bagian tersebut. Gunakan "Potong" untuk menyisakan bagian yang diperlukan saja.'),
      h('div', { class: 'tools' }, bBlur, bCrop, bUndo, bRot), view,
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

  /** keterangan sumber/waktu/lokasi di bawah foto; presisi hanya untuk Koordinator/Super Admin */
  photo.metaLine = function (item, precise) {
    const g = precise || item.geo;
    const parts = [item.src === 'kamera' ? '📷 Kamera' : item.src === 'galeri' ? '🖼 Galeri' : '', item.taken_at ? stampTime(item.taken_at) : '',
      g ? '📍 ' + (precise ? g.lat.toFixed(5) + ', ' + g.lng.toFixed(5) + (g.acc ? ' ±' + g.acc + ' m' : '') : (+g.lat).toFixed(2) + ', ' + (+g.lng).toFixed(2) + ' ±1 km') : (item.src ? 'tanpa lokasi' : '')].filter(Boolean);
    return parts.join(' · ');
  };
  async function thumb(item, precise) {
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
      if (b64) { const im = h('img', { alt: item.caption || 'Foto pendukung', src: 'data:image/jpeg;base64,' + b64 }); im.onclick = () => RCA.modal(item.caption || 'Foto', h('div', null, h('img', { src: im.src, style: { width: '100%' }, alt: '' }), ml ? h('p', { class: 'small muted' }, ml) : null), null, { wide: true }); fig.replaceChild(im, slot); }
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
    (async () => { const pg = await photo.preciseGeo(items.map(x => x.id)); for (const it of items) list.appendChild(await thumb(it, pg[it.id])); })();
    return h('div', { class: 'pgallery' }, h('h5', null, (title || 'Foto pendukung') + ' (' + items.length + ')'), list);
  };

  photo.section = function (ed) {
    const wrap = h('div', { class: 'stack' });
    const list = h('div', { class: 'photos' });
    const items = ed.data.foto = ed.data.foto || [];
    const refresh = async () => {
      list.innerHTML = '';
      const pg = await photo.preciseGeo(items.map(x => x.id));
      for (let i = 0; i < items.length; i++) {
        const f = await thumb(items[i], pg[items[i].id]);
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
