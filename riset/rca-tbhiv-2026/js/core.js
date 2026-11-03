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
      else if (k === 'style' && typeof v === 'object') Object.keys(v).forEach(sk => { if (sk.startsWith('--')) el.style.setProperty(sk, v[sk]); else el.style[sk] = v[sk]; });
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
    return t;
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
      if (/^Aksi tidak dikenal/.test(j.error || '')) throw new ApiError('Server (Apps Script) masih versi lama sehingga fitur ini belum tersedia. Super Admin perlu mengganti Code.gs, menjalankan setup, lalu Deploy › Manage deployments › Edit › Version: New version.', 'OLDSERVER');
      throw new ApiError(j.error || 'Terjadi kesalahan', j.code);
    }
    RCA.swrAfterWrite && RCA.swrAfterWrite(action);
    return j.data;
  };

  /* ---------------- tampil cepat dari cache, perbarui di belakang (stale-while-revalidate)
     Halaman langsung menampilkan data terakhir yang tersimpan di perangkat, lalu menggambar ulang
     secara diam-diam bila data server berbeda. */
  const READ = new Set(['bootstrap', 'units.list', 'rec.get', 'rec.table', 'analysis.data', 'c2.get', 'c2.overview', 'c6.calon', 'heartbeat', 'ping', 'photo.get', 'photo.geo',
    'rec.history', 'audit.list', 'users.list', 'conflict.list', 'conflict.get', 'export.form', 'migrate.preview', 'rec.lock', 'rec.unlock', 'notif.read', 'tour.save']);
  const REC_WRITE = new Set(['rec.save', 'rec.review', 'task.assign', 'task.handover', 'photo.upload', 'conflict.resolve']);
  const memc = {}, inflight = {};
  const swrKey = (action, payload) => 'swr|' + ((RCA.state.user || {}).email || '') + '|' + action + '|' + JSON.stringify(payload || {});
  /** dipanggil setelah aksi tulis berhasil: isian → data daftar/dashboard dianggap usang; aksi lain → cache dibuang */
  RCA.swrAfterWrite = function (action) {
    if (READ.has(action)) return;
    Object.keys(memc).forEach(k => { if (REC_WRITE.has(action)) memc[k].t = 0; else delete memc[k]; });
    if (!REC_WRITE.has(action)) RCA.idb.all('cache').then(L => L.forEach(x => { if (String(x.key).startsWith('swr|')) RCA.idb.del('cache', x.key); }));
  };
  /**
   * opts.onFresh(data): bila diberikan, data cache langsung dikembalikan dan onFresh dipanggil saat data server berbeda.
   * opts.maxAge (ms): cache yang lebih muda dari ini dipakai tanpa bertanya ke server (default 5 detik).
   */
  RCA.swr = async function (action, payload, opts) {
    opts = opts || {};
    const ck = swrKey(action, payload);
    const fetchFresh = () => {
      if (inflight[ck]) return inflight[ck];
      const p = RCA.api(action, payload).then(d => { memc[ck] = { d, t: Date.now() }; RCA.idb.set('cache', ck, { d, t: Date.now() }); return d; });
      inflight[ck] = p; p.then(() => { delete inflight[ck]; }, () => { delete inflight[ck]; });
      return p;
    };
    let hit = memc[ck];
    if (!hit) { const c = await RCA.idb.get('cache', ck); if (c && c.d !== undefined) hit = memc[ck] = { d: c.d, t: 0 }; }
    if (hit && hit.t && Date.now() - hit.t < (opts.maxAge === undefined ? 5000 : opts.maxAge)) return hit.d;
    if (hit && opts.onFresh) {
      const old = JSON.stringify(hit.d);
      fetchFresh().then(d => { if (JSON.stringify(d) !== old) opts.onFresh(d); }).catch(() => {});
      return hit.d;
    }
    try { return await fetchFresh(); }
    catch (e) { if (e.code === 'OFFLINE' && hit) return hit.d; throw e; }
  };
  /** gambar ulang halaman dengan data baru tanpa mengganggu pengguna yang sedang mengetik/membuka dialog */
  RCA.softRefresh = function (root, fn) {
    if (!root || !root.isConnected) return;
    const busy = () => { const a = document.activeElement; return (a && root.contains(a) && /INPUT|TEXTAREA|SELECT/.test(a.tagName)) || !!document.querySelector('#modalRoot .modal') || !!document.querySelector('.anl-panel:not([hidden])'); };
    const run = () => { if (!root.isConnected) return; const y = window.scrollY; fn(); requestAnimationFrame(() => window.scrollTo(0, y)); };
    if (!busy()) return run();
    const t = setInterval(() => { if (!root.isConnected) return clearInterval(t); if (!busy()) { clearInterval(t); run(); } }, 1500);
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
  /** Normalisasi tanggal dari Excel/teks ke 'yyyy-mm-dd'. Teks dibaca sebagai HH/BB/TTTT (format instrumen). */
  RCA.isoDate = function (v) {
    if (v === null || v === undefined || v === '') return '';
    const z = n => String(n).padStart(2, '0');
    if (v instanceof Date) { const d = new Date(v.getTime() + 12 * 3600000); return d.getFullYear() + '-' + z(d.getMonth() + 1) + '-' + z(d.getDate()); }
    if (typeof v === 'number' && window.XLSX && v > 20000 && v < 80000) { const p = XLSX.SSF.parse_date_code(v); return p.y + '-' + z(p.m) + '-' + z(p.d); }
    const s = String(v).replace(/\u00a0/g, ' ').trim(); let m;
    if ((m = s.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})/))) return m[1] + '-' + z(m[2]) + '-' + z(m[3]);
    if ((m = s.match(/^(\d{1,2})\s*[-/.]\s*(\d{1,2})\s*[-/.]\s*(\d{2}|\d{4})(?:\s+\d{1,2}[:.]\d{2}(?:[:.]\d{2})?)?$/))) return (m[3].length === 2 ? '20' + m[3] : m[3]) + '-' + z(m[2]) + '-' + z(m[1]);
    // "12 Mar 2025", "12 Maret 2025", "12-Mar-25"
    const BLN = { jan: 1, feb: 2, peb: 2, mar: 3, apr: 4, mei: 5, may: 5, jun: 6, jul: 7, agu: 8, agt: 8, aug: 8, sep: 9, okt: 10, oct: 10, nov: 11, nop: 11, des: 12, dec: 12 };
    if ((m = s.match(/^(\d{1,2})[\s\-/.]+([A-Za-z]{3,9})[\s\-/.,]+(\d{2}|\d{4})$/)) && BLN[m[2].slice(0, 3).toLowerCase()]) return (m[3].length === 2 ? '20' + m[3] : m[3]) + '-' + z(BLN[m[2].slice(0, 3).toLowerCase()]) + '-' + z(m[1]);
    // nomor seri Excel yang tersimpan sebagai teks
    if (/^\d{5}(\.\d+)?$/.test(s) && window.XLSX) { const n = Math.floor(+s); if (n > 20000 && n < 80000) { const p = XLSX.SSF.parse_date_code(n); return p.y + '-' + z(p.m) + '-' + z(p.d); } }
    return s;
  };
  /** Tabel berisi tombol/isian ditampilkan sebagai kartu bertumpuk di layar HP (lihat CSS table.t.cards). */
  RCA.cardify = function (root) {
    (root || document).querySelectorAll('table.t:not([data-cardified])').forEach(t => {
      t.setAttribute('data-cardified', '1');
      if (t.closest('.no-cards')) return;
      const ths = [...t.querySelectorAll('thead th')].map(th => th.textContent.trim());
      const interactive = t.querySelector('tbody input, tbody select, tbody textarea, tbody button, tbody .btn');
      if (!interactive || !ths.length) return;
      t.classList.add('cards');
      const label = () => t.querySelectorAll('tbody tr').forEach(tr => [...tr.children].forEach((td, i) => { if (ths[i] && !td.hasAttribute('data-label')) td.setAttribute('data-label', ths[i]); }));
      label();
      const tb = t.tBodies[0]; if (tb) new MutationObserver(label).observe(tb, { childList: true });
    });
  };
  (function watchTables() {
    let q = 0;
    const run = () => { q = 0; RCA.cardify(document); };
    const start = () => new MutationObserver(() => { if (!q) q = requestAnimationFrame(run); }).observe(document.body, { childList: true, subtree: true });
    if (document.body) start(); else document.addEventListener('DOMContentLoaded', start);
  })();
  RCA.needXLSX = function () { if (!window.XLSX) { RCA.toast('Pustaka Excel belum termuat. Coba lagi sebentar.', 'err'); return false; } return true; };
})();
