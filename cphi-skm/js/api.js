/* api.js — komunikasi ke Apps Script, sesi login, cache master, sinkronisasi offline */
const DEMO = !window.CONFIG.API_URL;

const Session = {
  get token() { return localStorage.getItem('skm_token') || ''; },
  get user() { try { return JSON.parse(localStorage.getItem('skm_user') || 'null'); } catch (e) { return null; } },
  set(token, user) { localStorage.setItem('skm_token', token); localStorage.setItem('skm_user', JSON.stringify(user)); },
  clear() { localStorage.removeItem('skm_token'); localStorage.removeItem('skm_user'); },
  role() { return this.user ? this.user.role : null; },
  is(...roles) { return !!this.user && roles.includes(this.user.role); },
  expire() { this.clear(); UI.toast('Sesi berakhir, silakan masuk kembali', 'bad'); location.hash = '#/login'; }
};

const API = {
  async call(action, payload = {}) {
    const body = Object.assign({ action, token: Session.token }, payload);
    if (DEMO) {
      await new Promise(r => setTimeout(r, 120));
      try { return Mock.handle(JSON.parse(JSON.stringify(body))); }
      catch (e) { if (e.auth === false) Session.expire(); throw e; }
    }
    if (!navigator.onLine) throw new Error('Tidak ada koneksi internet');
    const res = await fetch(window.CONFIG.API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' }, // hindari preflight CORS
      body: JSON.stringify(body),
      redirect: 'follow'
    });
    const j = await res.json();
    if (!j.ok) {
      if (j.auth === false) Session.expire();
      throw new Error(j.error || 'Terjadi kesalahan server');
    }
    return j.data;
  }
};

/* ---------- Cache data master (untuk offline) ---------- */
const Master = {
  data: { faskes: [], units: [], forms: [], periods: [], settings: {}, users: [] },
  loaded: false,
  async load(force) {
    if (this.loaded && !force) return this.data;
    try {
      const d = await API.call('bootstrap');
      d.settings = toObj(d.settings);
      this.data = Object.assign({ users: [] }, d);
      await Store.put('cache', this.data, 'master_' + (Session.user && Session.user.email));
    } catch (e) {
      const c = await Store.get('cache', 'master_' + (Session.user && Session.user.email));
      if (c) { this.data = c; UI.toast('Mode offline: memakai data tersimpan'); }
      else throw e;
    }
    this.loaded = true;
    Theme.apply(this.data.settings);
    return this.data;
  },
  faskes(id) { return this.data.faskes.find(f => f.id === id); },
  faskesName(id) { const f = this.faskes(id); return f ? f.nama : (id || '-'); },
  unitName(id) { const u = this.data.units.find(u => u.id === id); return u ? u.nama : (id || '-'); },
  unitsOf(fid) { return this.data.units.filter(u => u.faskes_id === fid && u.aktif !== false && u.aktif !== 'FALSE'); },
  form(id) { return this.data.forms.find(f => f.id === id); },
  period(id) { return this.data.periods.find(p => p.id === id); },
  myFaskes() {
    const u = Session.user; const ids = (u && u.faskes_ids) || [];
    const list = this.data.faskes.filter(f => f.aktif !== false && f.aktif !== 'FALSE');
    return ids.length && !Session.is('superadmin', 'koordinator') ? list.filter(f => ids.includes(f.id)) : list;
  },
  faskesForForm(form) {
    let list = this.myFaskes();
    if (form.faskes_ids && form.faskes_ids.length) list = list.filter(f => form.faskes_ids.includes(f.id));
    return list;
  },
  unitsForForm(form, fid) {
    let u = this.unitsOf(fid);
    if (form.unit_ids && form.unit_ids.length) u = u.filter(x => form.unit_ids.includes(x.id));
    return u;
  }
};
function toObj(rows) {
  if (!Array.isArray(rows)) return rows || {};
  const o = {}; rows.forEach(r => o[r.key] = r.value); return o;
}

/* ---------- Antrean offline & sinkronisasi ---------- */
const Sync = {
  busy: false,
  async enqueue(item) {
    item.client_uuid = item.client_uuid || (crypto.randomUUID ? crypto.randomUUID() : Core.uid('c_'));
    item.ts = item.ts || new Date().toISOString();
    item.status_kirim = 'menunggu';
    await Store.put('queue', item);
    this.badge();
    this.push();
    return item.client_uuid;
  },
  async pending() { return (await Store.all('queue')) || []; },
  async badge() {
    const n = await Store.count('queue');
    document.querySelectorAll('[data-qbadge]').forEach(el => { el.textContent = n; el.classList.toggle('hidden', !n); });
    return n;
  },
  async push(manual) {
    if (this.busy) return;
    if (!DEMO && !navigator.onLine) { if (manual) UI.toast('Masih offline — data tetap aman di perangkat'); return; }
    const items = await this.pending();
    if (!items.length) { if (manual) UI.toast('Tidak ada data dalam antrean'); return; }
    this.busy = true;
    try {
      const batch = items.slice(0, 25).map(({ status_kirim, error, ...rest }) => rest);
      const res = await API.call('submit', { items: batch });
      for (const id of res.ok.concat(res.dupe)) await Store.del('queue', id);
      for (const id of Object.keys(res.err || {})) {
        const it = items.find(i => i.client_uuid === id);
        if (it) { it.status_kirim = 'gagal'; it.error = res.err[id]; await Store.put('queue', it); }
      }
      if (manual || res.ok.length) UI.toast(res.ok.length + ' data terkirim' + (Object.keys(res.err).length ? ', ' + Object.keys(res.err).length + ' gagal' : ''), Object.keys(res.err).length ? 'bad' : 'ok');
      if (items.length > 25 && res.ok.length) { this.busy = false; return this.push(manual); }
    } catch (e) {
      if (manual) UI.toast('Gagal sinkron: ' + e.message, 'bad');
    } finally {
      this.busy = false;
      this.badge();
    }
  }
};
window.addEventListener('online', () => { UI.netbar(); Sync.push(); });
window.addEventListener('offline', () => UI.netbar());

/* ---------- Tema dari pengaturan ---------- */
const Theme = {
  apply(s) {
    if (!s) return;
    const c = s.warna || '#0f766e';
    const r = document.documentElement.style;
    r.setProperty('--pri', c);
    r.setProperty('--pri-2', shade(c, 0.28));
    r.setProperty('--pri-soft', mix(c, '#ffffff', 0.88));
    const meta = document.querySelector('meta[name=theme-color]'); if (meta) meta.content = c;
    if (s.app_nama) document.title = s.app_nama;
  }
};
function hexToRgb(h) { h = h.replace('#', ''); if (h.length === 3) h = h.split('').map(x => x + x).join(''); const n = parseInt(h, 16); return [n >> 16 & 255, n >> 8 & 255, n & 255]; }
function rgbToHex(a) { return '#' + a.map(x => Math.max(0, Math.min(255, Math.round(x))).toString(16).padStart(2, '0')).join(''); }
function mix(a, b, t) { const x = hexToRgb(a), y = hexToRgb(b); return rgbToHex(x.map((v, i) => v + (y[i] - v) * t)); }
function shade(c, t) { return mix(c, '#ffffff', t); }
