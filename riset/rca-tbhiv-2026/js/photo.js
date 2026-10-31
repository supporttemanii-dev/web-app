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

  /** buka editor; hasil {b64, caption} atau null */
  photo.edit = async function (file) {
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
      h('div', { class: 'tools' }, bBlur, bCrop, bUndo, bRot), view, cap,
      h('label', { style: { display: 'flex', gap: '10px', alignItems: 'flex-start', fontWeight: 700 } }, cb, 'Saya sudah memastikan nama/NIK/nomor RM dan identitas lain tidak terlihat pada foto ini.'), size);
    const res = await RCA.modal('Siapkan foto', body, [{ label: 'Batal', value: null }, { label: 'Simpan foto', cls: 'primary', value: 'ok', validate: () => {
      if (!cb.checked) { RCA.toast('Centang konfirmasi bahwa identitas tidak terlihat', 'err'); cb.focus(); return false; } return true; } }], { wide: true, sticky: true });
    URL.revokeObjectURL(img.src);
    if (res !== 'ok') return null;
    const b64 = canvas.toDataURL('image/jpeg', QUALITY).split(',')[1];
    return { b64, caption: cap.value, kb: Math.round(b64.length * 0.75 / 1024) };
  };

  async function thumb(item) {
    const fig = h('figure', null, h('div', { style: { height: '110px', display: 'grid', placeItems: 'center' } }, h('small', { class: 'muted' }, 'memuat…')), h('figcaption', null, (item.caption || item.name || '') + (item.pending ? ' · menunggu unggah' : '')));
    (async () => {
      let b64 = null;
      if (item.pending) b64 = (await RCA.idb.get('photos', item.pending) || {}).b64;
      else {
        const c = await RCA.idb.get('photos', 'id|' + item.id);
        if (c) b64 = c.b64;
        else if (RCA.state.online) { try { const r = await RCA.api('photo.get', { id: item.id }); b64 = r.b64; RCA.idb.set('photos', 'id|' + item.id, { b64 }); } catch (e) {} }
      }
      const slot = fig.firstChild;
      if (b64) { const im = h('img', { alt: item.caption || 'Foto pendukung', src: 'data:image/jpeg;base64,' + b64 }); im.onclick = () => RCA.modal(item.caption || 'Foto', h('img', { src: im.src, style: { width: '100%' }, alt: '' }), null, { wide: true }); fig.replaceChild(im, slot); }
      else slot.firstChild.textContent = 'tidak tersedia offline';
    })();
    return fig;
  }

  photo.section = function (ed) {
    const wrap = h('div', { class: 'stack' });
    const list = h('div', { class: 'photos' });
    const items = ed.data.foto = ed.data.foto || [];
    const refresh = async () => {
      list.innerHTML = '';
      for (let i = 0; i < items.length; i++) {
        const f = await thumb(items[i]);
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
      const inp = h('input', { type: 'file', accept: 'image/*', capture: 'environment', hidden: true });
      inp.addEventListener('change', async () => {
        const file = inp.files[0]; inp.value = ''; if (!file) return;
        const res = await photo.edit(file); if (!res) return;
        const meta = { caption: res.caption, ts: new Date().toISOString(), by: RCA.state.user.name };
        if (RCA.state.online) {
          try { const r = await RCA.api('photo.upload', { form: ed.form, sub: ed.sub, unit: ed.unit, b64: res.b64, caption: res.caption, confirmNoId: true }); Object.assign(meta, r); RCA.idb.set('photos', 'id|' + r.id, { b64: res.b64 }); RCA.toast('Foto diunggah (' + res.kb + ' KB)', 'ok'); }
          catch (e) { meta.pending = 'p|' + Date.now(); await RCA.idb.set('photos', meta.pending, { b64: res.b64, caption: res.caption }); RCA.toast('Foto disimpan di perangkat; diunggah saat online', 'err'); }
        } else { meta.pending = 'p|' + Date.now(); await RCA.idb.set('photos', meta.pending, { b64: res.b64, caption: res.caption }); RCA.toast('Offline: foto disimpan di perangkat dan diunggah nanti'); }
        items.push(meta); ed.changed(); refresh();
      });
      wrap.appendChild(h('div', { class: 'row' }, inp, h('button', { class: 'btn small', type: 'button', onclick: () => inp.click() }, '+ Ambil atau pilih foto'),
        h('small', { class: 'muted' }, 'Dikompres otomatis (sisi terpanjang 1.600 px, JPEG).')));
    }
    return wrap;
  };

  /** unggah foto yang tertunda sebelum menyimpan rekaman */
  photo.flushPending = async function (ed) {
    const items = ed.data.foto || [];
    for (const it of items) {
      if (!it.pending) continue;
      const p = await RCA.idb.get('photos', it.pending); if (!p) { delete it.pending; continue; }
      const r = await RCA.api('photo.upload', { form: ed.form, sub: ed.sub, unit: ed.unit, b64: p.b64, caption: p.caption, confirmNoId: true });
      await RCA.idb.set('photos', 'id|' + r.id, { b64: p.b64 }); await RCA.idb.del('photos', it.pending);
      delete it.pending; Object.assign(it, r);
    }
  };
})();
