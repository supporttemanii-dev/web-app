/* RCA TB-HIV 2026 · inti: konfigurasi, API, penyimpanan lokal, utilitas UI */
(function () {
  'use strict';
  const RCA = window.RCA = {};
  const CFG = window.RCA_CONFIG || {};
  RCA.S = window.RCA_SCHEMA;
  RCA.state = { token: null, user: null, regions: null, users: [], notif: [], online: navigator.onLine, heldLocks: new Set(), lastActivity: Date.now(), lockMin: 5 };

  /* ---------------- DOM helpers */
  function h(tag, attrs, ...kids) {
    const el = document.createElement(tag);
    if (attrs) for (const k in attrs) {
      const v = attrs[k];
      if (v === null || v === undefined || v === false) continue;
      if (k === 'class') el.className = v;
      else if (k === 'html') el.innerHTML = v;
      else if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2), v);
      else if (k === 'style' && typeof v === 'object') Object.assign(el.style, v);
      else if (v === true) el.setAttribute(k, '');
      else el.setAttribute(k, v);
    }
    kids.flat(Infinity).forEach(c => { if (c === null || c === undefined || c === false) return; el.appendChild(c.nodeType ? c : document.createTextNode(String(c))); });
    return el;
  }
  RCA.h = h;
  RCA.$ = (s, r) => (r || document).querySelector(s);
  RCA.$$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  RCA.esc = s => String(s === undefined || s === null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  RCA.toast = function (msg, kind, ms) {
    const t = h('div', { class: 'toast ' + (kind || ''), role: kind === 'err' ? 'alert' : 'status' }, msg);
    const box = RCA.$('#toasts'); box.appendChild(t);
    while (box.children.length > 3) box.firstChild.remove();
    setTimeout(() => t.remove(), ms || (kind === 'err' ? 6500 : 3500));
  };

  RCA.modal = function (title, body, buttons, opts) {
    opts = opts || {};
    return new Promise(resolve => {
      const root = RCA.$('#modalRoot');
      const prevFocus = document.activeElement;
      const close = v => { back.remove(); document.removeEventListener('keydown', onKey); if (prevFocus && prevFocus.focus) prevFocus.focus(); resolve(v); };
      const onKey = e => { if (e.key === 'Escape' && !opts.sticky) close(null); };
      const mf = h('div', { class: 'mf' });
      (buttons || [{ label: 'Tutup', value: null }]).forEach(b => {
        mf.appendChild(h('button', { class: 'btn ' + (b.cls || ''), type: 'button', onclick: async () => {
          if (b.validate) { const ok = await b.validate(); if (!ok) return; }
          close(b.value !== undefined ? (typeof b.value === 'function' ? b.value() : b.value) : b.label);
        } }, b.label));
      });
      const box = h('div', { class: 'modal ' + (opts.wide ? 'wide' : ''), role: 'dialog', 'aria-modal': 'true', 'aria-label': title },
        h('header', null, h('h2', null, title), opts.sticky ? null : h('button', { class: 'iconbtn', 'aria-label': 'Tutup', onclick: () => close(null) }, '✕')),
        h('div', { class: 'mb' }, body), mf);
      const back = h('div', { class: 'modal-back', onclick: e => { if (e.target === back && !opts.sticky) close(null); } }, box);
      root.appendChild(back);
      document.addEventListener('keydown', onKey);
      setTimeout(() => { const f = box.querySelector('input,select,textarea,.mf .btn.primary,.mf .btn'); if (f) f.focus(); }, 30);
    });
  };
  RCA.confirm = (title, msg, okLabel, cls) => RCA.modal(title, h('p', null, msg), [{ label: 'Batal', value: false }, { label: okLabel || 'Lanjutkan', value: true, cls: cls || 'primary' }]);
  RCA.prompt = (title, label, opts) => {
    opts = opts || {};
    const inp = opts.multiline ? h('textarea', { rows: 4 }) : h('input', { type: opts.type || 'text' });
    if (opts.value) inp.value = opts.value;
    return RCA.modal(title, h('div', null, h('label', { class: 'lbl' }, label), inp, opts.help ? h('p', { class: 'muted' }, opts.help) : null),
      [{ label: 'Batal', value: null }, { label: opts.ok || 'Simpan', cls: 'primary', value: () => inp.value, validate: () => { if (opts.required && !inp.value.trim()) { inp.focus(); return false; } return true; } }]);
  };

  /* ---------------- format */
  RCA.fmtDT = iso => { if (!iso) return ''; const d = new Date(iso); if (isNaN(d)) return iso; return d.toLocaleString('id-ID', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }); };
  RCA.fmtD = iso => { if (!iso) return ''; const d = new Date(iso); if (isNaN(d)) return iso; return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }); };
  RCA.ago = iso => { if (!iso) return ''; const m = Math.round((Date.now() - new Date(iso)) / 60000); if (m < 1) return 'baru saja'; if (m < 60) return m + ' menit lalu'; const hh = Math.round(m / 60); if (hh < 24) return hh + ' jam lalu'; return Math.round(hh / 24) + ' hari lalu'; };
  RCA.today = () => { const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
  RCA.initials = n => String(n || '?').split(/\s+/).filter(Boolean).slice(0, 2).map(x => x[0].toUpperCase()).join('');
  RCA.pct = (a, b) => b ? Math.round(a / b * 100) + '%' : '–';

  /* ---------------- preferences */
  RCA.prefs = (() => { try { return JSON.parse(localStorage.getItem('rca.prefs') || '{}'); } catch (e) { return {}; } })();
  RCA.applyPrefs = function () {
    const d = document.documentElement, p = RCA.prefs;
    if (p.theme && p.theme !== 'auto') d.setAttribute('data-theme', p.theme); else d.removeAttribute('data-theme');
    p.contrast === 'high' ? d.setAttribute('data-contrast', 'high') : d.removeAttribute('data-contrast');
    d.style.setProperty('--fs', p.font || 1);
    p.spacing === 'relaxed' ? d.setAttribute('data-spacing', 'relaxed') : d.removeAttribute('data-spacing');
    p.motion === 'reduce' ? d.setAttribute('data-motion', 'reduce') : d.removeAttribute('data-motion');
    try { localStorage.setItem('rca.prefs', JSON.stringify(p)); } catch (e) {}
  };

  /* ---------------- IndexedDB (cadangan lokal) */
  let dbp = null;
  function db() {
    if (dbp) return dbp;
    dbp = new Promise((res, rej) => {
      const r = indexedDB.open('rca-tbhiv-2026', 2);
      r.onupgradeneeded = () => {
        const d = r.result;
        if (!d.objectStoreNames.contains('drafts')) d.createObjectStore('drafts');
        if (!d.objectStoreNames.contains('cache')) d.createObjectStore('cache');
        if (!d.objectStoreNames.contains('photos')) d.createObjectStore('photos');
      };
      r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error);
    });
    return dbp;
  }
  RCA.idb = {
    async get(store, key) { try { const d = await db(); return await new Promise((res, rej) => { const q = d.transaction(store).objectStore(store).get(key); q.onsuccess = () => res(q.result); q.onerror = () => rej(q.error); }); } catch (e) { return undefined; } },
    async set(store, key, val) { try { const d = await db(); return await new Promise((res, rej) => { const t = d.transaction(store, 'readwrite'); t.objectStore(store).put(val, key); t.oncomplete = () => res(true); t.onerror = () => rej(t.error); }); } catch (e) { return false; } },
    async del(store, key) { try { const d = await db(); return await new Promise(res => { const t = d.transaction(store, 'readwrite'); t.objectStore(store).delete(key); t.oncomplete = () => res(true); }); } catch (e) { return false; } },
    async all(store) { try { const d = await db(); return await new Promise(res => { const out = []; const c = d.transaction(store).objectStore(store).openCursor(); c.onsuccess = () => { const cur = c.result; if (cur) { out.push({ key: cur.key, val: cur.value }); cur.continue(); } else res(out); }; }); } catch (e) { return []; } },
    async clear(store) { try { const d = await db(); return await new Promise(res => { const t = d.transaction(store, 'readwrite'); t.objectStore(store).clear(); t.oncomplete = () => res(true); }); } catch (e) { return false; } }
  };

  /* ---------------- API */
  class ApiError extends Error { constructor(m, code) { super(m); this.code = code; } }
  RCA.ApiError = ApiError;
  RCA.apiReady = () => !!(CFG.API_URL && /^https?:\/\//.test(CFG.API_URL));
  RCA.api = async function (action, payload, opts) {
    opts = opts || {};
    if (!RCA.apiReady()) throw new ApiError('Alamat server (API_URL) belum diisi di config.js', 'CONFIG');
    const body = Object.assign({ action, token: RCA.state.token }, payload || {});
    let res;
    const ctrl = new AbortController();
    const to = setTimeout(() => ctrl.abort(), opts.timeout || 45000);
    try {
      res = await fetch(CFG.API_URL, { method: 'POST', body: JSON.stringify(body), headers: { 'Content-Type': 'text/plain;charset=utf-8' }, redirect: 'follow', signal: ctrl.signal });
    } catch (e) {
      clearTimeout(to); RCA.setOnline(false);
      throw new ApiError('Tidak dapat terhubung ke server. Periksa koneksi internet.', 'OFFLINE');
    }
    clearTimeout(to);
    RCA.setOnline(true);
    let j;
    try { j = await res.json(); } catch (e) { throw new ApiError('Respons server tidak valid (' + res.status + '). Periksa deploy Apps Script.', 'BAD'); }
    if (!j.ok) {
      if (j.code === 'AUTH' && !opts.noAuthRedirect) { RCA.onAuthLost && RCA.onAuthLost(j.error); }
      throw new ApiError(j.error || 'Terjadi kesalahan', j.code);
    }
    return j.data;
  };

  /* ---------------- online/offline */
  RCA.setOnline = function (on) {
    if (RCA.state.online === on) return;
    RCA.state.online = on;
    const bar = RCA.$('#netbar');
    if (!on) {
      bar.className = 'netbar'; bar.hidden = false;
      bar.textContent = 'Anda sedang offline. Isian tetap tersimpan di perangkat ini; jangan hapus data browser atau berganti perangkat sampai tersinkron.';
    } else {
      bar.className = 'netbar ok'; bar.hidden = false; bar.textContent = 'Koneksi kembali. Menyinkronkan isian ke server…';
      setTimeout(() => { if (RCA.state.online) bar.hidden = true; }, 4000);
      RCA.onReconnect && RCA.onReconnect();
    }
    RCA.renderSyncPill && RCA.renderSyncPill();
  };
  window.addEventListener('online', () => RCA.api('ping').catch(() => {}));
  // saat offline, coba hubungi server setiap 20 detik untuk mendeteksi koneksi kembali
  setInterval(() => { if (!RCA.state.online && RCA.apiReady()) RCA.api('ping').catch(() => {}); }, 20000);
  window.addEventListener('offline', () => RCA.setOnline(false));

  /* aktivitas pengguna (dipakai untuk kunci 5 menit) */
  ['pointerdown', 'keydown', 'input', 'scroll', 'touchstart'].forEach(ev => document.addEventListener(ev, () => { RCA.state.lastActivity = Date.now(); }, { passive: true, capture: true }));

  /* ---------------- regions lookup */
  RCA.reg = {
    kk: c => (RCA.state.regions.kk.find(x => x.code === c) || {}),
    prov: c => (RCA.state.regions.prov.find(x => x.code === c) || {}),
    fac: c => (RCA.state.regions.fac.find(x => x.code === c) || {}),
    kkName: c => (RCA.reg.kk(c).name || c || ''),
    facName: c => { const f = RCA.reg.fac(c); return f.name || (f.type ? (f.type === 'RS' ? 'Rumah sakit' : f.type) + ' ' + RCA.reg.kkName(f.kk) : (c || '')); },
    facLabel: f => f.code + ' · ' + RCA.reg.facName(f.code)
  };

  RCA.can = {
    fill: () => ['Enumerator', 'Koordinator', 'SuperAdmin'].includes(RCA.state.user && RCA.state.user.role),
    review: () => ['Koordinator', 'SuperAdmin'].includes(RCA.state.user && RCA.state.user.role),
    admin: () => RCA.state.user && RCA.state.user.role === 'SuperAdmin',
    raw: () => RCA.state.user && RCA.state.user.role !== 'Pembaca'
  };

  RCA.download = function (name, blob) {
    const a = h('a', { href: URL.createObjectURL(blob), download: name });
    document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  };
  RCA.needXLSX = function () { if (!window.XLSX) { RCA.toast('Pustaka Excel belum termuat. Coba lagi sebentar.', 'err'); return false; } return true; };
})();
