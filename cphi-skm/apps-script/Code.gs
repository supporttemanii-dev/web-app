/**
 * Survey Master by PUI-PT CPHI Universitas Udayana — Backend Google Apps Script
 * ------------------------------------------------------------
 * File proyek Apps Script:
 *   Code.gs  -> file ini
 *   Core.gs  -> salin isi js/core.js (logika IKM & validasi bersama)
 *
 * Langkah singkat (lihat README.md untuk detail):
 *   1. Isi ADMIN_EMAIL & ADMIN_PASSWORD_AWAL di bawah (akun Super Admin pertama).
 *   2. Jalankan fungsi setup() sekali dari editor (izinkan akses).
 *   3. Deploy > New deployment > Web app
 *        Execute as: Me   |   Who has access: Anyone
 *   4. Salin URL Web App ke js/config.js (API_URL).
 *   5. Masuk dengan akun Super Admin -> Anda akan diminta mengganti password.
 *
 * Akun petugas: setiap orang mendaftar sendiri (email + password) di aplikasi,
 * lalu Super Admin menyetujui/menolak di menu Pengguna.
 */

const ADMIN_EMAIL = '';                     // kosongkan = memakai email akun Google yang menjalankan setup()
const ADMIN_PASSWORD_AWAL = 'GantiSegera#2026'; // WAJIB diganti saat login pertama
const TOKEN_DAYS = 14;            // masa berlaku sesi (hari) — mendukung mode offline enumerator
const PROPS = PropertiesService.getScriptProperties();

/* ===================== SETUP ===================== */
function cekVersiCore_() {
  if (typeof Core === 'undefined') throw new Error('File Core.gs belum ada. Salin isi js/core.js ke file Core.gs.');
  if (Core.TABLES.users.indexOf('pass_hash') < 0 || !Core.ROLE_DAFTAR)
    throw new Error('Core.gs masih versi lama. Salin ulang isi js/core.js terbaru ke Core.gs, lalu jalankan setup() lagi.');
}

function setup() {
  cekVersiCore_();
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

  const me = String(ADMIN_EMAIL || Session.getEffectiveUser().getEmail()).trim().toLowerCase();
  const ex = findRow_('users', 'email', me);
  if (!ex || !ex.pass_hash) {
    const salt = Utilities.getUuid();
    upsert_('users', {
      email: me, nama: (ex && ex.nama) || 'Super Admin', role: 'superadmin', faskes_ids: '[]', aktif: true, status: 'disetujui',
      dibuat: (ex && ex.dibuat) || new Date().toISOString(), salt: salt, pass_hash: hashPw_(ADMIN_PASSWORD_AWAL, salt), harus_ganti: true, disetujui_oleh: 'setup'
    }, 'email');
  }
  const defaults = {
    app_nama: 'Survey Master by PUI-PT CPHI Universitas Udayana', instansi: 'Dinas Kesehatan Kabupaten/Kota', alamat: 'Jl. ...', kota: 'Kota',
    telepon: '', email: '', website: '', logo: 'icons/logo.png', logo_ikon: 'icons/logo-icon.png', logo_mitra: 'icons/logo-mitra.png', warna: '#0572b5', warna_2: '#00b8e4', kepala_dinas: '', nip_kepala_dinas: ''
  };
  Object.keys(defaults).forEach(k => { if (!findRow_('settings', 'key', k)) upsert_('settings', { key: k, value: defaults[k] }, 'key'); });
  const nm = findRow_('settings', 'key', 'app_nama');
  if (nm && nm.value === 'SKM Sehat') upsert_('settings', { key: 'app_nama', value: defaults.app_nama }, 'key'); // migrasi nama lama
  Logger.log('Setup selesai. Master: ' + ss.getUrl());
  if (ex && ex.pass_hash) Logger.log('Akun ' + me + ' sudah punya password; tidak diubah. Jalankan resetAdmin() bila lupa password.');
  else Logger.log('Super Admin: ' + me + ' | password awal: ' + ADMIN_PASSWORD_AWAL + ' (wajib diganti saat login pertama)');
}

/**
 * Atur ulang akun Super Admin: aktifkan, set password = ADMIN_PASSWORD_AWAL, buka kunci percobaan gagal.
 * Jalankan dari editor bila tidak bisa masuk.
 */
function resetAdmin() {
  cekVersiCore_();
  if (!PROPS.getProperty('MASTER_ID')) throw new Error('Jalankan setup() terlebih dahulu');
  const me = String(ADMIN_EMAIL || Session.getEffectiveUser().getEmail()).trim().toLowerCase();
  const ex = findRow_('users', 'email', me);
  const salt = Utilities.getUuid();
  upsert_('users', {
    email: me, nama: (ex && ex.nama) || 'Super Admin', role: 'superadmin', faskes_ids: (ex && ex.faskes_ids) || '[]', aktif: true, status: 'disetujui',
    dibuat: (ex && ex.dibuat) || new Date().toISOString(), salt: salt, pass_hash: hashPw_(ADMIN_PASSWORD_AWAL, salt), harus_ganti: true, disetujui_oleh: 'resetAdmin'
  }, 'email');
  CacheService.getScriptCache().removeAll(['fail_' + me, 'u_' + me]);
  Logger.log('Akun Super Admin diatur ulang: ' + me + ' | password: ' + ADMIN_PASSWORD_AWAL);
  cekAkun();
}

/**
 * DEMO: siapkan Puskesmas Kota Maju + 8 unit + periode Semester II 2026 + form Instrumen Standar (aktif, dashboard publik).
 * Setelah itu impor file Data_Dummy_SKM_Puskesmas_Kota_Maju_534.xlsx lewat menu Impor Data.
 */
function siapkanDemoKotaMaju() {
  cekVersiCore_();
  let fk = readTable_('faskes').filter(f => f.nama === 'Puskesmas Kota Maju')[0];
  if (!fk) {
    fk = { id: Core.uid('fa_'), kode: 'PKM-KM01', nama: 'Puskesmas Kota Maju', jenis: 'Puskesmas', alamat: 'Jl. Merdeka No. 10, Kota Maju', telepon: '', kepala: 'dr. Kepala Puskesmas Kota Maju', nip_kepala: '', logo: '', aktif: true };
    upsert_('faskes', fk, 'id');
  }
  const ada = readTable_('units').filter(u => u.faskes_id === fk.id).map(u => u.nama);
  ['Pendaftaran', 'Poli Umum', 'Poli KIA/KB', 'Poli Gigi', 'Poli Lansia', 'Laboratorium', 'Farmasi', 'UGD'].forEach(n => {
    if (ada.indexOf(n) < 0) upsert_('units', { id: Core.uid('un_'), faskes_id: fk.id, nama: n, aktif: true }, 'id');
  });
  let pr = readTable_('periods').filter(p => p.nama === 'Semester II 2026')[0];
  if (!pr) {
    const ss = SpreadsheetApp.create('SKM Respons - Semester II 2026');
    DriveApp.getFileById(ss.getId()).moveTo(DriveApp.getFolderById(PROPS.getProperty('FOLDER_ID')));
    pr = { id: Core.uid('pe_'), nama: 'Semester II 2026', mulai: '2026-07-01', selesai: '2026-12-31', spreadsheet_id: ss.getId(), aktif: true };
    upsert_('periods', pr, 'id');
  }
  let form = readTable_('forms').filter(f => f.judul === 'SKM Puskesmas Kota Maju — Semester II 2026')[0];
  if (!form) {
    const f = Core.templateStandar();
    f.id = Core.uid('fo_'); f.judul = 'SKM Puskesmas Kota Maju — Semester II 2026'; f.status = 'aktif'; f.periode_id = pr.id;
    f.dashboard_publik = true; f.faskes_mode = 'satu'; f.faskes_ids = [fk.id]; f.populasi = 18500;
    upsert_('forms', { id: f.id, judul: f.judul, status: 'aktif', tipe: 'standar', periode_id: pr.id, dashboard_publik: true, schema: putSchema_(f), dibuat_oleh: 'demo', diubah: new Date().toISOString() }, 'id');
    form = f;
  }
  Logger.log('Siap. Fasilitas: ' + fk.nama + ' | Periode: ' + pr.nama + ' | Form: ' + form.judul + ' (' + form.id + ')');
  Logger.log('Langkah berikut: buka aplikasi > Impor Data > pilih form di atas > unggah Data_Dummy_SKM_Puskesmas_Kota_Maju_534.xlsx');
}

/** Diagnosis: tampilkan kondisi akun & uji password di Log eksekusi */
function cekAkun() {
  cekVersiCore_();
  const me = String(ADMIN_EMAIL || Session.getEffectiveUser().getEmail()).trim().toLowerCase();
  const sh = master_().getSheetByName('users');
  Logger.log('Header sheet users: ' + sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0].join(', '));
  Logger.log('Semua email terdaftar: ' + readTable_('users').map(u => u.email + ' [' + (u.role || '-') + ', status=' + (u.status || '-') + ', aktif=' + u.aktif + ']').join(' | '));
  const u = findRow_('users', 'email', me);
  if (!u) { Logger.log('❌ Email ' + me + ' TIDAK ada di sheet users.'); return; }
  Logger.log('Akun ' + me + ': role=' + u.role + ', status=' + u.status + ', aktif=' + u.aktif + ', punya password=' + !!u.pass_hash);
  Logger.log(u.pass_hash && hashPw_(ADMIN_PASSWORD_AWAL, u.salt) === u.pass_hash
    ? '✅ Password "' + ADMIN_PASSWORD_AWAL + '" COCOK — login seharusnya berhasil.'
    : '❌ Password "' + ADMIN_PASSWORD_AWAL + '" TIDAK cocok (password sudah diganti atau setup dijalankan dengan password lain). Jalankan resetAdmin().');
  Logger.log('Kunci percobaan gagal: ' + (CacheService.getScriptCache().get('fail_' + me) || 0) + ' kali (terkunci jika ≥ 5).');
}

function ensureSheet_(ss, name, cols) {
  let sh = ss.getSheetByName(name);
  if (!sh) sh = ss.insertSheet(name);
  if (sh.getLastRow() === 0) {
    sh.appendRow(cols);
    sh.setFrozenRows(1);
    sh.getRange(1, 1, 1, cols.length).setFontWeight('bold').setBackground('#e6f4f1');
  } else {
    // migrasi: tambahkan kolom baru yang belum ada di header
    const head = sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0];
    if (cols.some((c, i) => head[i] !== c)) sh.getRange(1, 1, 1, cols.length).setValues([cols]).setFontWeight('bold').setBackground('#e6f4f1');
  }
  return sh;
}
function master_() { return SpreadsheetApp.openById(PROPS.getProperty('MASTER_ID')); }

/* ===================== HTTP ===================== */
function doGet(e) {
  const p = e.parameter || {};
  if (!p.action) return json_({ ok: true, app: 'Survey Master API', time: new Date().toISOString() });
  return handle_(p);
}
function doPost(e) {
  let body = {};
  try { body = JSON.parse(e.postData.contents || '{}'); } catch (err) { return json_({ ok: false, error: 'JSON tidak valid' }); }
  return handle_(body);
}
function json_(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }

const PUBLIC_ACTIONS = { ping: 1, login: 1, register: 1, publicFaskes: 1, publicSettings: 1, publicForms: 1, publicForm: 1, publicDashboard: 1, submit: 1 };

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
  if (!u || !truthy_(u.aktif) || (u.status && u.status !== 'disetujui')) return null;
  return publicUser_(u);
}
/* Hash password: SHA-256 berulang + salt per pengguna + pepper rahasia (Script Properties) */
function hashPw_(pw, salt) {
  let h = salt + '|' + pw + '|' + PROPS.getProperty('SECRET');
  for (let i = 0; i < 400; i++) {
    h = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, h + i, Utilities.Charset.UTF_8)
      .map(b => ('0' + (b & 255).toString(16)).slice(-2)).join('');
  }
  return h;
}
function publicUser_(u) {
  const o = Object.assign({}, u);
  delete o.pass_hash; delete o.salt;
  o.faskes_ids = parseJ_(o.faskes_ids, []);
  o.harus_ganti = truthy_(o.harus_ganti);
  return o;
}
function cekPassword_(pw) {
  pw = String(pw || '');
  if (pw.length < 8) throw new Error('Password minimal 8 karakter');
  if (!/[A-Za-z]/.test(pw) || !/[0-9]/.test(pw)) throw new Error('Password harus mengandung huruf dan angka');
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
  return { app_nama: s.app_nama, instansi: s.instansi, logo: s.logo, logo_ikon: s.logo_ikon, logo_mitra: s.logo_mitra, warna: s.warna, warna_2: s.warna_2, alamat: s.alamat, kota: s.kota };
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

  /* Pendaftaran akun petugas (menunggu persetujuan Super Admin) */
  register: (req) => {
    const email = String(req.email || '').trim().toLowerCase();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) throw new Error('Email tidak valid');
    if (!String(req.nama || '').trim()) throw new Error('Nama wajib diisi');
    cekPassword_(req.password);
    const role = Core.ROLE_DAFTAR.indexOf(req.role) >= 0 ? req.role : 'enumerator';
    const lock = LockService.getScriptLock(); lock.waitLock(20000);
    try {
      const ex = findRow_('users', 'email', email);
      if (ex && ex.status !== 'ditolak') throw new Error(ex.status === 'menunggu' ? 'Email ini sudah mendaftar dan sedang menunggu persetujuan' : 'Email sudah terdaftar. Silakan masuk.');
      const salt = Utilities.getUuid();
      upsert_('users', {
        email: email, nama: String(req.nama).trim(), role: role, faskes_ids: JSON.stringify(req.faskes_ids || []), aktif: false, status: 'menunggu',
        telepon: String(req.telepon || ''), catatan: String(req.catatan || '').slice(0, 500), salt: salt, pass_hash: hashPw_(req.password, salt),
        harus_ganti: false, dibuat: new Date().toISOString(), disetujui_oleh: ''
      }, 'email');
    } finally { lock.releaseLock(); }
    audit_({ email: email }, 'daftar', role);
    return { status: 'menunggu' };
  },

  login: (req) => {
    const email = String(req.email || '').trim().toLowerCase();
    const cache = CacheService.getScriptCache();
    const fk = 'fail_' + email;
    const fails = parseInt(cache.get(fk) || '0', 10);
    if (fails >= 5) throw new Error('Terlalu banyak percobaan gagal. Coba lagi dalam 15 menit.');
    const u = findRow_('users', 'email', email);
    if (u && !u.pass_hash) throw new Error('Akun ini belum memiliki password. Super Admin: jalankan resetAdmin() di Apps Script.');
    if (!u || hashPw_(req.password || '', u.salt) !== u.pass_hash) {
      cache.put(fk, String(fails + 1), 900);
      throw new Error('Email atau password salah');
    }
    cache.remove(fk);
    if (u.status === 'menunggu') throw new Error('Akun Anda masih menunggu persetujuan Super Admin');
    if (u.status === 'ditolak') throw new Error('Pendaftaran akun ini ditolak. Hubungi Super Admin.');
    if (!truthy_(u.aktif)) throw new Error('Akun dinonaktifkan. Hubungi Super Admin.');
    const pu = publicUser_(u);
    audit_(pu, 'login', '');
    return { token: issueToken_(pu), user: pu, settings: settingsObj_() };
  },

  gantiPassword: (req, user) => {
    const u = findRow_('users', 'email', user.email);
    if (hashPw_(req.lama || '', u.salt) !== u.pass_hash) throw new Error('Password lama salah');
    cekPassword_(req.baru);
    if (req.baru === req.lama) throw new Error('Password baru harus berbeda');
    const salt = Utilities.getUuid();
    upsert_('users', { email: user.email, salt: salt, pass_hash: hashPw_(req.baru, salt), harus_ganti: false }, 'email');
    CacheService.getScriptCache().remove('u_' + user.email);
    audit_(user, 'ganti password', '');
    return { ok: true };
  },

  /* Super Admin: setujui / tolak pendaftaran */
  approveUser: (req, user) => {
    if (user.role !== 'superadmin') throw new Error('Tidak diizinkan');
    const u = findRow_('users', 'email', req.email);
    if (!u) throw new Error('Pengguna tidak ditemukan');
    const ok = !!req.setuju;
    const row = { email: u.email, status: ok ? 'disetujui' : 'ditolak', aktif: ok, disetujui_oleh: user.email };
    if (ok) {
      if (!Core.ROLES[req.role]) throw new Error('Peran tidak valid');
      row.role = req.role; row.faskes_ids = JSON.stringify(req.faskes_ids || []);
    }
    upsert_('users', row, 'email');
    CacheService.getScriptCache().remove('u_' + u.email);
    audit_(user, ok ? 'setujui akun' : 'tolak akun', u.email);
    return { email: u.email, status: row.status };
  },

  /* Super Admin: atur ulang password (password sementara) */
  resetPassword: (req, user) => {
    if (user.role !== 'superadmin') throw new Error('Tidak diizinkan');
    cekPassword_(req.password);
    const u = findRow_('users', 'email', req.email);
    if (!u) throw new Error('Pengguna tidak ditemukan');
    const salt = Utilities.getUuid();
    upsert_('users', { email: u.email, salt: salt, pass_hash: hashPw_(req.password, salt), harus_ganti: true }, 'email');
    CacheService.getScriptCache().remove('u_' + u.email);
    audit_(user, 'reset password', u.email);
    return { ok: true };
  },

  me: (req, user) => ({ user: user, settings: settingsObj_() }),

  publicSettings: () => publicSettings_(),

  /* Daftar fasilitas untuk formulir pendaftaran petugas */
  publicFaskes: () => readTable_('faskes').filter(f => f.aktif !== false && f.aktif !== 'FALSE').map(f => ({ id: f.id, nama: f.nama })),

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
    if (t === 'users') rows = rows.map(publicUser_);
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
      const pw = row.password;
      delete row.password; delete row.pass_hash; delete row.salt; delete row.harus_ganti;
      if (!findRow_('users', 'email', row.email)) {
        // akun dibuat langsung oleh Super Admin → otomatis disetujui, wajib ganti password saat login pertama
        cekPassword_(pw);
        row.salt = Utilities.getUuid(); row.pass_hash = hashPw_(pw, row.salt); row.harus_ganti = true;
        row.status = 'disetujui'; row.disetujui_oleh = user.email; row.dibuat = new Date().toISOString();
      }
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
    return t === 'users' ? publicUser_(row) : row;
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
