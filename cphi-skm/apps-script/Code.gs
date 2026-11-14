/**
 * SKM Kesehatan — Backend Google Apps Script
 * ------------------------------------------------------------
 * File proyek Apps Script:
 *   Code.gs  -> file ini
 *   Core.gs  -> salin isi js/core.js (logika IKM & validasi bersama)
 *
 * Langkah singkat (lihat README.md untuk detail):
 *   1. Isi CLIENT_ID di bawah dengan OAuth Client ID (Google Cloud Console).
 *   2. Jalankan fungsi setup() sekali dari editor (izinkan akses).
 *   3. Deploy > New deployment > Web app
 *        Execute as: Me   |   Who has access: Anyone
 *   4. Salin URL Web App ke js/config.js (API_URL).
 */

const CLIENT_ID = 'GANTI_DENGAN_OAUTH_CLIENT_ID.apps.googleusercontent.com';
const TOKEN_DAYS = 14;            // masa berlaku sesi (hari) — mendukung mode offline enumerator
const PROPS = PropertiesService.getScriptProperties();

/* ===================== SETUP ===================== */
function setup() {
  let folderId = PROPS.getProperty('FOLDER_ID');
  let folder = folderId ? DriveApp.getFolderById(folderId) : DriveApp.createFolder('SKM Kesehatan - Data');
  PROPS.setProperty('FOLDER_ID', folder.getId());

  let masterId = PROPS.getProperty('MASTER_ID');
  let ss;
  if (masterId) ss = SpreadsheetApp.openById(masterId);
  else {
    ss = SpreadsheetApp.create('SKM Kesehatan - Master');
    DriveApp.getFileById(ss.getId()).moveTo(folder);
    PROPS.setProperty('MASTER_ID', ss.getId());
  }
  Object.keys(Core.TABLES).forEach(t => ensureSheet_(ss, t, Core.TABLES[t]));
  ensureSheet_(ss, 'audit', ['ts', 'email', 'aksi', 'detail']);
  const def = ss.getSheetByName('Sheet1'); if (def && ss.getSheets().length > 1) ss.deleteSheet(def);

  if (!PROPS.getProperty('SECRET')) PROPS.setProperty('SECRET', Utilities.getUuid() + Utilities.getUuid());

  const me = Session.getEffectiveUser().getEmail();
  if (!findRow_('users', 'email', me)) {
    upsert_('users', { email: me, nama: 'Super Admin', role: 'superadmin', faskes_ids: '[]', aktif: true, dibuat: new Date().toISOString() }, 'email');
  }
  const defaults = {
    app_nama: 'SKM Sehat', instansi: 'Dinas Kesehatan Kabupaten/Kota', alamat: 'Jl. ...', kota: 'Kota',
    telepon: '', email: '', website: '', logo: 'icons/logo.svg', warna: '#0f766e', kepala_dinas: '', nip_kepala_dinas: ''
  };
  Object.keys(defaults).forEach(k => { if (!findRow_('settings', 'key', k)) upsert_('settings', { key: k, value: defaults[k] }, 'key'); });
  Logger.log('Setup selesai. Master: ' + ss.getUrl());
  Logger.log('Super Admin: ' + me);
}

function ensureSheet_(ss, name, cols) {
  let sh = ss.getSheetByName(name);
  if (!sh) sh = ss.insertSheet(name);
  if (sh.getLastRow() === 0) {
    sh.appendRow(cols);
    sh.setFrozenRows(1);
    sh.getRange(1, 1, 1, cols.length).setFontWeight('bold').setBackground('#e6f4f1');
  }
  return sh;
}
function master_() { return SpreadsheetApp.openById(PROPS.getProperty('MASTER_ID')); }

/* ===================== HTTP ===================== */
function doGet(e) {
  const p = e.parameter || {};
  if (!p.action) return json_({ ok: true, app: 'SKM Kesehatan API', time: new Date().toISOString() });
  return handle_(p);
}
function doPost(e) {
  let body = {};
  try { body = JSON.parse(e.postData.contents || '{}'); } catch (err) { return json_({ ok: false, error: 'JSON tidak valid' }); }
  return handle_(body);
}
function json_(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }

const PUBLIC_ACTIONS = { ping: 1, login: 1, publicSettings: 1, publicForms: 1, publicForm: 1, publicDashboard: 1, submit: 1 };

function handle_(req) {
  try {
    const fn = API[req.action];
    if (!fn) throw new Error('Aksi tidak dikenal: ' + req.action);
    let user = null;
    if (req.token) user = verifyToken_(req.token);
    if (!PUBLIC_ACTIONS[req.action] && !user) return json_({ ok: false, error: 'Sesi berakhir, silakan masuk ulang', auth: false });
    const data = fn(req, user);
    return json_({ ok: true, data: data });
  } catch (err) {
    return json_({ ok: false, error: String(err.message || err) });
  }
}

/* ===================== AUTH ===================== */
function b64u_(s) { return Utilities.base64EncodeWebSafe(s).replace(/=+$/, ''); }
function sign_(payload) {
  const sig = Utilities.computeHmacSha256Signature(payload, PROPS.getProperty('SECRET'));
  return b64u_(sig);
}
function issueToken_(user) {
  const payload = b64u_(JSON.stringify({ e: user.email, x: Date.now() + TOKEN_DAYS * 864e5 }));
  return payload + '.' + sign_(payload);
}
function verifyToken_(token) {
  const parts = String(token).split('.');
  if (parts.length !== 2 || sign_(parts[0]) !== parts[1]) return null;
  let p;
  try { p = JSON.parse(Utilities.newBlob(Utilities.base64DecodeWebSafe(parts[0] + '==='.slice((parts[0].length + 3) % 4))).getDataAsString()); }
  catch (e) { return null; }
  if (!p.x || p.x < Date.now()) return null;
  const cache = CacheService.getScriptCache();
  const ck = 'u_' + p.e;
  let u = cache.get(ck);
  if (u) u = JSON.parse(u);
  else {
    u = findRow_('users', 'email', p.e);
    if (u) cache.put(ck, JSON.stringify(u), 300);
  }
  if (!u || !truthy_(u.aktif)) return null;
  u.faskes_ids = parseJ_(u.faskes_ids, []);
  return u;
}
function truthy_(v) { return v === true || v === 'TRUE' || v === 'true' || v === 1 || v === '1'; }
function parseJ_(v, d) { if (v === '' || v === null || v === undefined) return d; if (typeof v !== 'string') return v; try { return JSON.parse(v); } catch (e) { return d; } }

/* ===================== DATA HELPERS ===================== */
function readTable_(name) {
  const sh = master_().getSheetByName(name);
  const vals = sh.getDataRange().getValues();
  const head = vals.shift();
  return vals.filter(r => r.join('') !== '').map(r => {
    const o = {};
    head.forEach((h, i) => { o[h] = r[i] instanceof Date ? r[i].toISOString() : r[i]; });
    return o;
  });
}
function findRow_(name, key, val) { return readTable_(name).filter(r => String(r[key]) === String(val))[0] || null; }

function upsert_(name, obj, key) {
  key = key || 'id';
  const sh = master_().getSheetByName(name);
  const cols = Core.TABLES[name];
  const vals = sh.getDataRange().getValues();
  const ki = vals[0].indexOf(key);
  const row = cols.map(c => {
    let v = obj[c];
    if (v === undefined) v = '';
    if (typeof v === 'object' && v !== null) v = JSON.stringify(v);
    return v;
  });
  for (let i = 1; i < vals.length; i++) {
    if (String(vals[i][ki]) === String(obj[key])) {
      // pertahankan kolom yang tidak dikirim
      cols.forEach((c, j) => { if (obj[c] === undefined) row[j] = vals[i][j]; });
      sh.getRange(i + 1, 1, 1, cols.length).setValues([row]);
      return obj;
    }
  }
  sh.appendRow(row);
  return obj;
}
function removeRow_(name, key, val) {
  const sh = master_().getSheetByName(name);
  const vals = sh.getDataRange().getValues();
  const ki = vals[0].indexOf(key);
  for (let i = vals.length - 1; i >= 1; i--) if (String(vals[i][ki]) === String(val)) sh.deleteRow(i + 1);
}
function audit_(user, aksi, detail) {
  try { master_().getSheetByName('audit').appendRow([new Date(), user ? user.email : 'publik', aksi, String(detail || '').slice(0, 500)]); } catch (e) { }
}
function keyOf_(table) { return table === 'users' ? 'email' : table === 'settings' ? 'key' : 'id'; }

/* Skema form bisa melebihi batas 50.000 karakter/sel -> simpan di Drive */
function putSchema_(form) {
  const s = JSON.stringify(form);
  if (s.length < 45000) return s;
  const folder = DriveApp.getFolderById(PROPS.getProperty('FOLDER_ID'));
  const name = 'schema_' + form.id + '.json';
  const it = folder.getFilesByName(name);
  if (it.hasNext()) { const f = it.next(); f.setContent(s); return 'drive:' + f.getId(); }
  return 'drive:' + folder.createFile(name, s, MimeType.PLAIN_TEXT).getId();
}
function getSchema_(row) {
  let s = row.schema;
  if (typeof s === 'string' && s.indexOf('drive:') === 0) s = DriveApp.getFileById(s.slice(6)).getBlob().getDataAsString();
  const f = parseJ_(s, {});
  f.id = row.id; f.status = row.status; f.periode_id = row.periode_id; f.dashboard_publik = truthy_(row.dashboard_publik);
  return f;
}
function getForm_(id) {
  const row = findRow_('forms', 'id', id);
  if (!row) throw new Error('Form tidak ditemukan');
  return getSchema_(row);
}
function settingsObj_() { const o = {}; readTable_('settings').forEach(r => o[r.key] = r.value); return o; }
function publicSettings_() {
  const s = settingsObj_();
  return { app_nama: s.app_nama, instansi: s.instansi, logo: s.logo, warna: s.warna, alamat: s.alamat, kota: s.kota };
}

/* Spreadsheet respons dipecah per periode survei */
function respSheet_(form) {
  let ss = master_();
  if (form.periode_id) {
    const p = findRow_('periods', 'id', form.periode_id);
    if (p && p.spreadsheet_id) ss = SpreadsheetApp.openById(p.spreadsheet_id);
  }
  const name = 'R_' + form.id;
  let sh = ss.getSheetByName(name);
  const qcols = (form.pertanyaan || []).filter(q => !Core.NON_INPUT[q.tipe]).map(q => q.id);
  if (!sh) {
    sh = ss.insertSheet(name);
    sh.appendRow(Core.RESP_COLS.concat(qcols));
    sh.setFrozenRows(1);
    sh.getRange(1, 1, 1, Core.RESP_COLS.length + qcols.length).setFontWeight('bold').setBackground('#e6f4f1');
  } else {
    // tambahkan kolom pertanyaan baru bila form diperbarui
    const head = sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0];
    const add = qcols.filter(c => head.indexOf(c) < 0);
    if (add.length) sh.getRange(1, head.length + 1, 1, add.length).setValues([add]).setFontWeight('bold');
  }
  return sh;
}
function readResponses_(form) {
  const sh = respSheet_(form);
  const vals = sh.getDataRange().getValues();
  const head = vals.shift();
  const n = Core.RESP_COLS.length;
  return vals.filter(r => r[0] !== '').map((r, i) => {
    const o = { _row: i + 2 };
    for (let j = 0; j < n; j++) o[head[j]] = r[j] instanceof Date ? r[j].toISOString() : r[j];
    o.data = parseJ_(o.data, {});
    return o;
  });
}
function flatVal_(v) {
  if (v === undefined || v === null) return '';
  if (Array.isArray(v)) return v.join(', ');
  if (typeof v === 'object') return JSON.stringify(v);
  return v;
}
function canSeeFaskes_(user, fid) {
  if (!user || user.role === 'superadmin' || user.role === 'koordinator') return true;
  const ids = user.faskes_ids || [];
  return !ids.length || ids.indexOf(fid) >= 0;
}
function maskPii_(form, rows, user) {
  if (user && (user.role === 'superadmin' || user.role === 'datamanager')) return rows;
  const pii = (form.pertanyaan || []).filter(q => q.pii).map(q => q.id);
  if (!pii.length) return rows;
  rows.forEach(r => pii.forEach(k => { if (r.data[k] !== undefined) r.data[k] = '•••'; }));
  return rows;
}
/* Simpan gambar (foto/tanda tangan) ke Drive, ganti nilainya dengan URL */
function saveMedia_(data, form) {
  let folder = null;
  Object.keys(data).forEach(k => {
    const v = data[k];
    if (typeof v === 'string' && v.indexOf('data:image/') === 0) {
      if (!folder) {
        const root = DriveApp.getFolderById(PROPS.getProperty('FOLDER_ID'));
        const it = root.getFoldersByName('Lampiran');
        folder = it.hasNext() ? it.next() : root.createFolder('Lampiran');
      }
      const m = v.match(/^data:(image\/\w+);base64,(.*)$/);
      if (!m) return;
      const blob = Utilities.newBlob(Utilities.base64Decode(m[2]), m[1], form.id + '_' + k + '_' + Date.now() + '.' + m[1].split('/')[1]);
      data[k] = folder.createFile(blob).getUrl();
    }
  });
  return data;
}

/* ===================== API ===================== */
const API = {
  ping: () => ({ pong: true, time: new Date().toISOString() }),

  login: (req) => {
    const r = UrlFetchApp.fetch('https://oauth2.googleapis.com/tokeninfo?id_token=' + encodeURIComponent(req.idToken), { muteHttpExceptions: true });
    if (r.getResponseCode() !== 200) throw new Error('Token Google tidak valid');
    const info = JSON.parse(r.getContentText());
    if (info.aud !== CLIENT_ID) throw new Error('Client ID tidak cocok');
    if (String(info.email_verified) !== 'true') throw new Error('Email belum terverifikasi');
    const u = findRow_('users', 'email', info.email);
    if (!u || !truthy_(u.aktif)) throw new Error('Akun ' + info.email + ' belum terdaftar/aktif. Hubungi Super Admin.');
    u.faskes_ids = parseJ_(u.faskes_ids, []);
    u.foto = info.picture || '';
    if (!u.nama) u.nama = info.name || u.email;
    audit_(u, 'login', '');
    return { token: issueToken_(u), user: u, settings: settingsObj_() };
  },

  me: (req, user) => ({ user: user, settings: settingsObj_() }),

  publicSettings: () => publicSettings_(),

  /* Daftar survei terbuka & dashboard publik (halaman depan) */
  publicForms: () => readTable_('forms').map(getSchema_)
    .filter(f => (f.status === 'aktif' && (f.mode_input || []).some(m => m !== 'enumerator')) || f.dashboard_publik)
    .map(f => ({ id: f.id, judul: f.judul, responden: f.status === 'aktif' && (f.mode_input || []).indexOf('responden') >= 0, dashboard: !!f.dashboard_publik })),

  /* Data master generik */
  list: (req, user) => {
    const t = req.table;
    if (!Core.READ[t] || !Core.can(user.role, Core.READ[t])) throw new Error('Tidak diizinkan membaca ' + t);
    let rows = readTable_(t);
    if (t === 'forms') {
      rows = rows.map(getSchema_);
      if (user.role === 'enumerator') rows = rows.filter(f => f.status === 'aktif' && (f.mode_input || []).indexOf('enumerator') >= 0);
    }
    if (t === 'faskes' || t === 'units') {
      rows = rows.filter(r => canSeeFaskes_(user, t === 'faskes' ? r.id : r.faskes_id));
    }
    if (t === 'users') rows.forEach(r => r.faskes_ids = parseJ_(r.faskes_ids, []));
    return rows;
  },

  /* Ambil semua master sekaligus (hemat kuota, dipakai saat sinkron) */
  bootstrap: (req, user) => {
    const out = {};
    ['faskes', 'units', 'forms', 'periods', 'settings'].forEach(t => out[t] = API.list({ table: t }, user));
    if (user.role === 'superadmin') out.users = API.list({ table: 'users' }, user);
    return out;
  },

  save: (req, user) => {
    const t = req.table;
    if (!Core.WRITE[t] || !Core.can(user.role, Core.WRITE[t])) throw new Error('Tidak diizinkan mengubah ' + t);
    const key = keyOf_(t);
    const row = req.row || {};
    if (!row[key]) row[key] = t === 'settings' ? row.key : Core.uid(t.slice(0, 2) + '_');
    if (t === 'users') {
      row.email = String(row.email).trim().toLowerCase();
      if (!Core.ROLES[row.role]) throw new Error('Peran tidak valid');
      if (!findRow_('users', 'email', row.email)) row.dibuat = new Date().toISOString();
      CacheService.getScriptCache().remove('u_' + row.email);
    }
    if (t === 'forms') {
      const f = row.schema || row;
      f.id = row.id;
      const out = {
        id: row.id, judul: f.judul, status: f.status || 'draft', tipe: f.tipe || 'custom', periode_id: f.periode_id || '',
        dashboard_publik: !!f.dashboard_publik, schema: putSchema_(f), dibuat_oleh: row.dibuat_oleh || user.email, diubah: new Date().toISOString()
      };
      const lock = LockService.getScriptLock(); lock.waitLock(20000);
      try { upsert_('forms', out, 'id'); } finally { lock.releaseLock(); }
      audit_(user, 'simpan form', f.judul);
      return getForm_(row.id);
    }
    if (t === 'periods' && !row.spreadsheet_id) {
      const ss = SpreadsheetApp.create('SKM Respons - ' + (row.nama || row.id));
      DriveApp.getFileById(ss.getId()).moveTo(DriveApp.getFolderById(PROPS.getProperty('FOLDER_ID')));
      row.spreadsheet_id = ss.getId();
    }
    const lock = LockService.getScriptLock(); lock.waitLock(20000);
    try { upsert_(t, row, key); } finally { lock.releaseLock(); }
    audit_(user, 'simpan ' + t, row[key]);
    return row;
  },

  saveSettings: (req, user) => {
    if (user.role !== 'superadmin') throw new Error('Tidak diizinkan');
    const lock = LockService.getScriptLock(); lock.waitLock(20000);
    try { Object.keys(req.values || {}).forEach(k => upsert_('settings', { key: k, value: req.values[k] }, 'key')); }
    finally { lock.releaseLock(); }
    audit_(user, 'simpan pengaturan', Object.keys(req.values || {}).join(','));
    return settingsObj_();
  },

  remove: (req, user) => {
    const t = req.table;
    if (!Core.WRITE[t] || !Core.can(user.role, Core.WRITE[t])) throw new Error('Tidak diizinkan menghapus ' + t);
    if (t === 'users' && req.id === user.email) throw new Error('Tidak bisa menghapus akun sendiri');
    removeRow_(t, keyOf_(t), req.id);
    audit_(user, 'hapus ' + t, req.id);
    return { removed: req.id };
  },

  /* Form untuk responden (tanpa login) */
  publicForm: (req) => {
    const f = getForm_(req.form_id);
    if (f.status !== 'aktif') throw new Error('Survei belum dibuka atau sudah ditutup');
    const allowed = (f.mode_input || []).filter(m => m !== 'enumerator');
    if (!allowed.length) throw new Error('Survei ini hanya diisi oleh petugas');
    let faskes = readTable_('faskes').filter(x => x.aktif !== false && x.aktif !== 'FALSE');
    if (f.faskes_ids && f.faskes_ids.length) faskes = faskes.filter(x => f.faskes_ids.indexOf(x.id) >= 0);
    const fids = faskes.map(x => x.id);
    let units = readTable_('units').filter(u => fids.indexOf(u.faskes_id) >= 0);
    if (f.unit_ids && f.unit_ids.length) units = units.filter(u => f.unit_ids.indexOf(u.id) >= 0);
    return { form: f, faskes: faskes.map(x => ({ id: x.id, nama: x.nama, jenis: x.jenis })), units: units.map(u => ({ id: u.id, faskes_id: u.faskes_id, nama: u.nama })), settings: publicSettings_() };
  },

  /* Kirim respons (satuan atau batch dari antrean offline) */
  submit: (req, user) => {
    const items = req.items || [];
    const res = { ok: [], dupe: [], err: {} };
    const byForm = {};
    items.forEach(it => (byForm[it.form_id] = byForm[it.form_id] || []).push(it));
    const lock = LockService.getScriptLock(); lock.waitLock(30000);
    try {
      Object.keys(byForm).forEach(fid => {
        let form;
        try { form = getForm_(fid); } catch (e) { byForm[fid].forEach(it => res.err[it.client_uuid] = e.message); return; }
        const sh = respSheet_(form);
        const head = sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0];
        const last = sh.getLastRow();
        const existing = {};
        if (last > 1) sh.getRange(2, 2, last - 1, 1).getValues().forEach(r => existing[r[0]] = 1);
        const rows = [];
        byForm[fid].forEach(it => {
          const id = it.client_uuid;
          if (existing[id]) { res.dupe.push(id); return; }
          const impor = it.mode === 'impor';
          if (impor) {
            if (!user || !Core.can(user.role, Core.RESP.impor)) { res.err[id] = 'Impor hanya untuk Super Admin, Koordinator, Data Manager'; return; }
          } else if (it.mode === 'enumerator') {
            if (!user || !Core.can(user.role, Core.RESP.submit)) { res.err[id] = 'Perlu login petugas'; return; }
          } else if (form.status !== 'aktif' || (form.mode_input || []).indexOf(it.mode) < 0) {
            res.err[id] = 'Survei tidak menerima mode ' + it.mode; return;
          }
          if (form.faskes_ids && form.faskes_ids.length && form.faskes_ids.indexOf(it.faskes_id) < 0) { res.err[id] = 'Fasilitas tidak termasuk survei ini'; return; }
          if (form.unit_wajib && !it.unit_id && !impor) { res.err[id] = 'Unit layanan wajib dipilih'; return; }
          const errs = Core.validate(form, it.data || {}, { abaikanWajib: impor });
          if (Object.keys(errs).length) { res.err[id] = 'Validasi: ' + Object.keys(errs).join(', '); return; }
          const data = saveMedia_(it.data || {}, form);
          const base = {
            id: Core.uid('r_'), client_uuid: id, ts: it.ts || new Date().toISOString(), form_id: fid, periode_id: form.periode_id || '',
            faskes_id: it.faskes_id || '', unit_id: it.unit_id || '', mode: it.mode, petugas: user ? user.email : '', status: impor ? 'valid' : 'baru', data: JSON.stringify(data)
          };
          rows.push(head.map(h => base[h] !== undefined ? base[h] : flatVal_(data[h])));
          existing[id] = 1;
          res.ok.push(id);
        });
        if (rows.length) sh.getRange(sh.getLastRow() + 1, 1, rows.length, head.length).setValues(rows);
      });
    } finally { lock.releaseLock(); }
    return res;
  },

  responses: (req, user) => {
    if (!Core.can(user.role, Core.RESP.read)) throw new Error('Tidak diizinkan');
    const form = getForm_(req.form_id);
    const f = req.filter || {};
    let rows = readResponses_(form).filter(r => {
      const d = String(r.ts).slice(0, 10);
      if (f.dari && d < f.dari) return false;
      if (f.sampai && d > f.sampai) return false;
      if (f.faskes_id && r.faskes_id !== f.faskes_id) return false;
      if (f.unit_id && r.unit_id !== f.unit_id) return false;
      if (f.status && r.status !== f.status) return false;
      return canSeeFaskes_(user, r.faskes_id);
    });
    return maskPii_(form, rows, user);
  },

  updateResponse: (req, user) => {
    if (!Core.can(user.role, Core.RESP.edit)) throw new Error('Tidak diizinkan');
    const form = getForm_(req.form_id);
    const sh = respSheet_(form);
    const head = sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0];
    const ids = sh.getRange(2, 1, Math.max(sh.getLastRow() - 1, 1), 1).getValues().map(r => r[0]);
    const idx = ids.indexOf(req.id);
    if (idx < 0) throw new Error('Respons tidak ditemukan');
    const rowNo = idx + 2;
    const cur = sh.getRange(rowNo, 1, 1, head.length).getValues()[0];
    if (req.status) cur[head.indexOf('status')] = req.status;
    if (req.data) {
      cur[head.indexOf('data')] = JSON.stringify(req.data);
      head.forEach((h, j) => { if (req.data[h] !== undefined) cur[j] = flatVal_(req.data[h]); });
    }
    sh.getRange(rowNo, 1, 1, head.length).setValues([cur]);
    audit_(user, 'ubah respons', req.id + ' ' + (req.status || 'data'));
    return { id: req.id };
  },

  deleteResponse: (req, user) => {
    if (!Core.can(user.role, Core.RESP.edit)) throw new Error('Tidak diizinkan');
    const form = getForm_(req.form_id);
    const sh = respSheet_(form);
    const ids = sh.getRange(2, 1, Math.max(sh.getLastRow() - 1, 1), 1).getValues().map(r => r[0]);
    const idx = ids.indexOf(req.id);
    if (idx >= 0) sh.deleteRow(idx + 2);
    audit_(user, 'hapus respons', req.id);
    return { removed: req.id };
  },

  aggregate: (req, user) => {
    const form = getForm_(req.form_id);
    let rows = readResponses_(form).filter(r => canSeeFaskes_(user, r.faskes_id));
    return Core.aggregate(form, rows, req.filter || {}, {});
  },

  /* Dashboard publik — hanya data agregat, tanpa data pribadi */
  publicDashboard: (req) => {
    const form = getForm_(req.form_id);
    if (!form.dashboard_publik) throw new Error('Dashboard survei ini tidak dibuka untuk publik');
    const agg = Core.aggregate(form, readResponses_(form), req.filter || {}, { publik: true });
    const pub = JSON.parse(JSON.stringify(form));
    pub.pertanyaan = (pub.pertanyaan || []).filter(q => !q.pii);
    delete pub.persetujuan;
    const faskes = readTable_('faskes').map(x => ({ id: x.id, nama: x.nama, jenis: x.jenis }));
    const units = readTable_('units').map(u => ({ id: u.id, faskes_id: u.faskes_id, nama: u.nama }));
    return { form: pub, agg: agg, faskes: faskes, units: units, settings: publicSettings_() };
  },

  /* Unggah logo/berkas publik (Super Admin) */
  uploadPublic: (req, user) => {
    if (user.role !== 'superadmin') throw new Error('Tidak diizinkan');
    const m = String(req.dataUrl).match(/^data:([\w\/+.-]+);base64,(.*)$/);
    if (!m) throw new Error('Berkas tidak valid');
    const folder = DriveApp.getFolderById(PROPS.getProperty('FOLDER_ID'));
    const f = folder.createFile(Utilities.newBlob(Utilities.base64Decode(m[2]), m[1], req.name || 'logo'));
    f.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    return { url: 'https://drive.google.com/thumbnail?id=' + f.getId() + '&sz=w600', id: f.getId() };
  }
};
