/**
 * ============================================================
 *  CBT UAS HIV/AIDS & IMS — BACKEND (Google Apps Script)
 * ============================================================
 *  Pasang di: Google Spreadsheet > Ekstensi > Apps Script
 *  File: Code.gs (ini) + Soal.gs (bank soal & kunci)
 *  Jalankan fungsi setup() satu kali, lalu Deploy sebagai Web App.
 * ============================================================
 */

const SH = { CONFIG: 'Config', MHS: 'Mahasiswa', SOAL: 'Soal', PESERTA: 'Peserta', LOG: 'Log_Pelanggaran' };
const P_HEAD = ['NIM', 'Nama', 'Status', 'Token', 'Mulai', 'Selesai', 'Urutan', 'Jawaban', 'Ragu', 'Posisi',
  'Terakhir Aktif', 'Benar', 'Salah', 'Kosong', 'Nilai', 'Pelanggaran', 'Cara Kumpul', 'Perangkat'];
const C = {}; P_HEAD.forEach(function (h, i) { C[h] = i + 1; });
const TZ = 'Asia/Makassar';
const CACHE_TTL = 21600; // 6 jam

const DEFAULT_CONFIG = [
  ['NAMA_UJIAN', 'UAS HIV/AIDS dan IMS', 'Judul yang tampil di aplikasi'],
  ['KODE_AKSES', 'HIV2026', 'Kode yang dibagikan dosen saat ujian dimulai (ganti sebelum ujian!)'],
  ['PASSWORD_DOSEN', 'ganti-password-ini', 'Password untuk dashboard dosen (WAJIB diganti)'],
  ['MULAI', '2026-11-17T08:10:00+08:00', 'Waktu mulai (format ISO, +08:00 = WITA)'],
  ['SELESAI', '2026-11-17T09:40:00+08:00', 'Waktu selesai (format ISO, +08:00 = WITA)'],
  ['LOGIN_DIBUKA_MENIT_SEBELUM', '30', 'Mahasiswa boleh login & menunggu di ruang tunggu X menit sebelum mulai'],
  ['TOLERANSI_KUMPUL_DETIK', '120', 'Toleransi jaringan untuk pengiriman jawaban setelah waktu habis'],
  ['ACAK_SOAL', 'YA', 'YA/TIDAK'],
  ['ACAK_OPSI', 'YA', 'YA/TIDAK'],
  ['TAMPILKAN_PERINGKAT', 'YA', 'YA/TIDAK — peringkat ditampilkan setelah mahasiswa mengumpulkan'],
  ['MODE_UJI', 'TIDAK', 'YA = jadwal diabaikan (untuk uji coba). Kembalikan ke TIDAK sebelum ujian!']
];

/* =============================== SETUP =============================== */

function onOpen() {
  SpreadsheetApp.getUi().createMenu('CBT')
    .addItem('1. Setup awal (buat sheet & isi soal)', 'setup')
    .addItem('2. Muat ulang soal dari Soal.gs (menimpa sheet Soal)', 'muatSoal')
    .addItem('3. Terapkan hasil edit langsung di sheet Soal', 'segarkanSoal')
    .addSeparator()
    .addItem('Hapus data peserta & log (setelah uji coba)', 'resetSemuaPeserta')
    .addToUi();
}

function setup() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  ss.setSpreadsheetTimeZone(TZ);

  // Config
  let sh = getOrCreate_(SH.CONFIG);
  if (sh.getLastRow() < 2) {
    sh.getRange('A:C').setNumberFormat('@');
    sh.getRange(1, 1, 1, 3).setValues([['KUNCI', 'NILAI', 'KETERANGAN']]).setFontWeight('bold');
    sh.getRange(2, 1, DEFAULT_CONFIG.length, 3).setValues(DEFAULT_CONFIG);
    sh.autoResizeColumns(1, 3);
  }

  // Mahasiswa
  sh = getOrCreate_(SH.MHS);
  if (sh.getLastRow() < 1) {
    sh.getRange('A:A').setNumberFormat('@');
    sh.getRange(1, 1, 1, 3).setValues([['NIM', 'Nama', 'Kelas']]).setFontWeight('bold');
    sh.getRange(2, 1, 2, 3).setValues([['000000001', 'Mahasiswa Uji Coba 1', 'A'], ['000000002', 'Mahasiswa Uji Coba 2', 'A']]);
  }

  // Peserta
  sh = getOrCreate_(SH.PESERTA);
  if (sh.getLastRow() < 1) {
    sh.getRange('A:A').setNumberFormat('@');
    sh.getRange(1, 1, 1, P_HEAD.length).setValues([P_HEAD]).setFontWeight('bold');
    sh.setFrozenRows(1);
  }

  // Log
  sh = getOrCreate_(SH.LOG);
  if (sh.getLastRow() < 1) {
    sh.getRange('B:B').setNumberFormat('@');
    sh.getRange(1, 1, 1, 6).setValues([['Waktu', 'NIM', 'Nama', 'Jenis', 'Detail', 'Posisi Soal']]).setFontWeight('bold');
    sh.setFrozenRows(1);
  }

  muatSoal();
  try { SpreadsheetApp.getUi().alert('Setup selesai. Isi sheet "Mahasiswa" dan ubah KODE_AKSES & PASSWORD_DOSEN di sheet "Config".'); } catch (e) {}
}

function muatSoal() {
  const sh = getOrCreate_(SH.SOAL);
  sh.clear();
  const head = ['ID', 'Topik', 'Soal', 'A', 'B', 'C', 'D', 'E', 'Kunci'];
  const rows = SOAL_DATA.map(function (q) { return [q.id, q.topik, q.stem].concat(q.opsi).concat([q.kunci]); });
  sh.getRange(1, 1, 1, head.length).setValues([head]).setFontWeight('bold');
  sh.getRange(2, 1, rows.length, head.length).setValues(rows).setWrap(true);
  sh.setFrozenRows(1);
  CacheService.getScriptCache().remove('soal_all');
}

function segarkanSoal() {
  CacheService.getScriptCache().remove('soal_all');
  try { SpreadsheetApp.getUi().alert('Perubahan pada sheet Soal telah diterapkan.'); } catch (e) {}
}

function resetSemuaPeserta() {
  const ui = SpreadsheetApp.getUi();
  if (ui.alert('Hapus SEMUA data peserta dan log pelanggaran?', ui.ButtonSet.YES_NO) !== ui.Button.YES) return;
  [SH.PESERTA, SH.LOG].forEach(function (n) {
    const sh = getOrCreate_(n);
    if (sh.getLastRow() > 1) sh.deleteRows(2, sh.getLastRow() - 1);
  });
  const mhs = readMhs_();
  const cache = CacheService.getScriptCache();
  const keys = [];
  mhs.forEach(function (m) { ['tok_', 'hb_', 'done_', 'row_', 'vc_'].forEach(function (p) { keys.push(p + m.nim); }); });
  for (let i = 0; i < keys.length; i += 500) cache.removeAll(keys.slice(i, i + 500));
  cache.remove('rank');
  ui.alert('Data peserta & log telah dihapus.');
}

function getOrCreate_(name) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  return ss.getSheetByName(name) || ss.insertSheet(name);
}

/* =============================== ROUTER =============================== */

function doGet() {
  return out_({ ok: true, msg: 'CBT API aktif', serverNow: Date.now() });
}

function doPost(e) {
  _cfg = null;
  let d = {};
  try { d = JSON.parse(e.postData.contents || '{}'); } catch (err) { return out_({ ok: false, msg: 'Format permintaan salah.' }); }
  try {
    const fn = {
      info: apiInfo_, login: apiLogin_, questions: apiQuestions_, heartbeat: apiHeartbeat_,
      violation: apiViolation_, submit: apiSubmit_, ranking: apiRanking_,
      dosenDashboard: dosenDashboard_, dosenFinalize: dosenFinalize_, dosenReset: dosenReset_, dosenExport: dosenExport_
    }[d.action];
    if (!fn) return out_({ ok: false, msg: 'Aksi tidak dikenal.' });
    return out_(fn(d));
  } catch (err) {
    return out_({ ok: false, msg: 'Kesalahan server: ' + err.message });
  }
}

function out_(o) {
  if (o && o.serverNow === undefined) o.serverNow = Date.now();
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}
function ok_(o) { o = o || {}; o.ok = true; return o; }
function err_(msg, code, extra) { const o = extra || {}; o.ok = false; o.msg = msg; o.code = code || 'ERR'; return o; }

/* =============================== HELPERS =============================== */

let _cfg = null;
function cfg_() {
  if (_cfg) return _cfg;
  const vals = getOrCreate_(SH.CONFIG).getDataRange().getValues();
  const c = {};
  vals.slice(1).forEach(function (r) { if (r[0]) c[String(r[0]).trim()] = r[1]; });
  const toDate = function (v) { return v instanceof Date ? v : new Date(String(v).trim()); };
  c.start = toDate(c.MULAI);
  c.end = toDate(c.SELESAI);
  c.uji = String(c.MODE_UJI).toUpperCase() === 'YA';
  c.openBefore = (Number(c.LOGIN_DIBUKA_MENIT_SEBELUM) || 30) * 60000;
  c.grace = (Number(c.TOLERANSI_KUMPUL_DETIK) || 120) * 1000;
  c.acakSoal = String(c.ACAK_SOAL).toUpperCase() !== 'TIDAK';
  c.acakOpsi = String(c.ACAK_OPSI).toUpperCase() !== 'TIDAK';
  c.peringkat = String(c.TAMPILKAN_PERINGKAT).toUpperCase() !== 'TIDAK';
  _cfg = c;
  return c;
}

function fmt_(d, pola) { return d ? Utilities.formatDate(new Date(d), TZ, pola || 'dd/MM/yyyy HH:mm:ss') : ''; }
function norm_(s) { return String(s == null ? '' : s).trim().toUpperCase(); }
function cache_() { return CacheService.getScriptCache(); }

function readMhs_() {
  const v = getOrCreate_(SH.MHS).getDataRange().getValues();
  return v.slice(1).filter(function (r) { return String(r[0]).trim(); })
    .map(function (r) { return { nim: String(r[0]).trim(), nama: String(r[1]).trim(), kelas: String(r[2] || '').trim() }; });
}

function soal_() {
  const cached = cache_().get('soal_all');
  if (cached) return JSON.parse(cached);
  const v = getOrCreate_(SH.SOAL).getDataRange().getValues().slice(1).filter(function (r) { return r[0] !== ''; });
  const list = v.map(function (r) {
    return { id: Number(r[0]), topik: String(r[1]), stem: String(r[2]), opsi: { A: String(r[3]), B: String(r[4]), C: String(r[5]), D: String(r[6]), E: String(r[7]) }, kunci: norm_(r[8]) };
  });
  try { cache_().put('soal_all', JSON.stringify(list), CACHE_TTL); } catch (e) {}
  return list;
}

/** Cari baris peserta. Mengembalikan {row, v(array nilai)} atau null. */
function findPeserta_(nim) {
  const sh = getOrCreate_(SH.PESERTA);
  const cRow = Number(cache_().get('row_' + nim));
  if (cRow > 1 && cRow <= sh.getLastRow()) {
    const v = sh.getRange(cRow, 1, 1, P_HEAD.length).getValues()[0];
    if (String(v[0]).trim() === nim) return { row: cRow, v: v };
  }
  const last = sh.getLastRow();
  if (last < 2) return null;
  const nims = sh.getRange(2, 1, last - 1, 1).getValues();
  for (let i = 0; i < nims.length; i++) {
    if (String(nims[i][0]).trim() === nim) {
      const row = i + 2;
      cache_().put('row_' + nim, String(row), CACHE_TTL);
      return { row: row, v: sh.getRange(row, 1, 1, P_HEAD.length).getValues()[0] };
    }
  }
  return null;
}

function setCells_(row, obj) {
  const sh = getOrCreate_(SH.PESERTA);
  Object.keys(obj).forEach(function (k) { sh.getRange(row, C[k]).setValue(obj[k]); });
}

/** Validasi token sesi. Mengembalikan error object bila tidak valid, atau null bila valid. */
function checkToken_(d) {
  const nim = String(d.nim || '').trim();
  if (!nim || !d.token) return err_('Sesi tidak valid. Silakan login ulang.', 'SESI');
  const t = cache_().get('tok_' + nim);
  if (t) return t === d.token ? null : err_('Akun Anda sedang dipakai di perangkat/tab lain. Sesi ini dihentikan.', 'SESI_GANDA');
  const p = findPeserta_(nim);
  if (p && String(p.v[C.Token - 1]) === d.token) { cache_().put('tok_' + nim, d.token, CACHE_TTL); return null; }
  return err_('Akun Anda sedang dipakai di perangkat/tab lain. Sesi ini dihentikan.', 'SESI_GANDA');
}

function shuffle_(a) {
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); const t = a[i]; a[i] = a[j]; a[j] = t; }
  return a;
}

function parseJSON_(s, def) { try { return s ? JSON.parse(s) : def; } catch (e) { return def; } }

function latestAnswers_(nim, p) {
  const hb = parseJSON_(cache_().get('hb_' + nim), null);
  if (hb && hb.ans) return { ans: hb.ans, ragu: hb.ragu || [], pos: hb.pos || 0 };
  return { ans: parseJSON_(p.v[C.Jawaban - 1], {}), ragu: parseJSON_(p.v[C.Ragu - 1], []), pos: Number(p.v[C.Posisi - 1]) || 0 };
}

function grade_(ans) {
  const soal = soal_();
  let benar = 0, salah = 0, kosong = 0;
  soal.forEach(function (q) {
    const a = ans ? ans[q.id] : null;
    if (!a) kosong++; else if (norm_(a) === q.kunci) benar++; else salah++;
  });
  const nilai = Math.round((benar / soal.length) * 10000) / 100;
  return { benar: benar, salah: salah, kosong: kosong, nilai: nilai, total: soal.length };
}

function finalizeRow_(p, ans, ragu, cara) {
  const g = grade_(ans);
  const nim = String(p.v[0]).trim();
  setCells_(p.row, {
    'Status': 'SELESAI', 'Selesai': new Date(), 'Jawaban': JSON.stringify(ans || {}), 'Ragu': JSON.stringify(ragu || []),
    'Benar': g.benar, 'Salah': g.salah, 'Kosong': g.kosong, 'Nilai': g.nilai, 'Cara Kumpul': cara
  });
  cache_().put('done_' + nim, '1', CACHE_TTL);
  cache_().remove('rank');
  return g;
}

/* =============================== API MAHASISWA =============================== */

function apiInfo_() {
  const c = cfg_();
  return ok_({ nama: c.NAMA_UJIAN, start: c.start.getTime(), end: c.end.getTime(), uji: c.uji, total: soal_().length });
}

function apiLogin_(d) {
  const c = cfg_();
  const now = Date.now();
  if (norm_(d.kode) !== norm_(c.KODE_AKSES)) return err_('Kode akses salah. Tanyakan kepada dosen/pengawas.', 'KODE');
  const nim = String(d.nim || '').trim();
  const m = readMhs_().filter(function (x) { return x.nim === nim; })[0];
  if (!m) return err_('NIM tidak terdaftar sebagai peserta ujian. Hubungi pengawas.', 'NIM');
  if (!c.uji) {
    if (now < c.start.getTime() - c.openBefore) return err_('Login baru dibuka pukul ' + fmt_(c.start.getTime() - c.openBefore, 'HH:mm') + ' WITA.', 'BELUM');
    if (now > c.end.getTime()) return err_('Waktu ujian telah berakhir.', 'TUTUP');
  }

  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    let p = findPeserta_(nim);
    if (p && p.v[C.Status - 1] === 'SELESAI') {
      return ok_({ done: true, nim: nim, nama: m.nama, token: String(p.v[C.Token - 1]), nilai: p.v[C.Nilai - 1],
        benar: p.v[C.Benar - 1], salah: p.v[C.Salah - 1], kosong: p.v[C.Kosong - 1], total: soal_().length,
        examName: c.NAMA_UJIAN, peringkat: c.peringkat });
    }
    const token = Utilities.getUuid();
    const ua = String(d.ua || '').slice(0, 200);
    if (!p) {
      const sh = getOrCreate_(SH.PESERTA);
      const row = new Array(P_HEAD.length).fill('');
      row[C.NIM - 1] = nim; row[C.Nama - 1] = m.nama; row[C.Status - 1] = 'MENUNGGU'; row[C.Token - 1] = token;
      row[C.Pelanggaran - 1] = 0; row[C.Perangkat - 1] = ua; row[C['Terakhir Aktif'] - 1] = new Date();
      sh.appendRow(row);
      cache_().put('row_' + nim, String(sh.getLastRow()), CACHE_TTL);
    } else {
      const wasActive = p.v[C.Status - 1] === 'MENGERJAKAN';
      setCells_(p.row, { 'Token': token, 'Perangkat': ua, 'Terakhir Aktif': new Date() });
      if (wasActive) logViolation_(nim, m.nama, 'LOGIN_ULANG', 'Login ulang saat ujian berlangsung (muat ulang/perangkat lain)', '', p);
    }
    cache_().put('tok_' + nim, token, CACHE_TTL);
    return ok_({ token: token, nim: nim, nama: m.nama, kelas: m.kelas, start: c.start.getTime(), end: c.end.getTime(),
      uji: c.uji, examName: c.NAMA_UJIAN, total: soal_().length, peringkat: c.peringkat });
  } finally { lock.releaseLock(); }
}

function apiQuestions_(d) {
  const bad = checkToken_(d); if (bad) return bad;
  const c = cfg_();
  const now = Date.now();
  if (!c.uji && now < c.start.getTime()) return err_('Ujian belum dimulai.', 'TUNGGU', { start: c.start.getTime() });
  if (!c.uji && now > c.end.getTime() + c.grace) return err_('Waktu ujian telah berakhir.', 'TUTUP');
  const nim = String(d.nim).trim();
  const soal = soal_();

  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  let p, urutan;
  try {
    p = findPeserta_(nim);
    if (!p) return err_('Data peserta tidak ditemukan. Silakan login ulang.', 'SESI');
    if (p.v[C.Status - 1] === 'SELESAI') return err_('Anda sudah mengumpulkan jawaban.', 'SELESAI');
    urutan = parseJSON_(p.v[C.Urutan - 1], null);
    if (!urutan) {
      const ids = soal.map(function (q) { return q.id; });
      urutan = { q: c.acakSoal ? shuffle_(ids.slice()) : ids, o: {} };
      soal.forEach(function (q) { urutan.o[q.id] = c.acakOpsi ? shuffle_(['A', 'B', 'C', 'D', 'E']) : ['A', 'B', 'C', 'D', 'E']; });
      setCells_(p.row, { 'Urutan': JSON.stringify(urutan), 'Status': 'MENGERJAKAN', 'Mulai': new Date(), 'Terakhir Aktif': new Date() });
    } else if (p.v[C.Status - 1] !== 'MENGERJAKAN') {
      setCells_(p.row, { 'Status': 'MENGERJAKAN' });
    }
  } finally { lock.releaseLock(); }

  const byId = {}; soal.forEach(function (q) { byId[q.id] = q; });
  const list = urutan.q.filter(function (id) { return byId[id]; }).map(function (id) {
    const q = byId[id];
    return { id: id, stem: q.stem, opsi: urutan.o[id].map(function (k) { return { k: k, t: q.opsi[k] }; }) };
  });
  const saved = latestAnswers_(nim, p);
  return ok_({ questions: list, answers: saved.ans, ragu: saved.ragu, pos: saved.pos, end: c.end.getTime(), uji: c.uji });
}

function apiHeartbeat_(d) {
  const nim = String(d.nim || '').trim();
  if (cache_().get('done_' + nim)) return ok_({ done: true });
  const bad = checkToken_(d); if (bad) return bad;
  const c = cfg_();
  const hb = { t: Date.now(), pos: Number(d.pos) || 0, qid: d.qid || '', ans: d.answers || {}, ragu: d.ragu || [],
    n: Object.keys(d.answers || {}).length, vis: d.vis || 'ok' };
  cache_().put('hb_' + nim, JSON.stringify(hb), CACHE_TTL);

  if (d.persist) {
    const lock = LockService.getScriptLock();
    if (lock.tryLock(4000)) {
      try {
        const p = findPeserta_(nim);
        if (p && p.v[C.Status - 1] !== 'SELESAI') {
          setCells_(p.row, { 'Jawaban': JSON.stringify(hb.ans), 'Ragu': JSON.stringify(hb.ragu), 'Posisi': hb.pos, 'Terakhir Aktif': new Date() });
        }
      } finally { lock.releaseLock(); }
    }
  }
  return ok_({ end: c.end.getTime() });
}

function logViolation_(nim, nama, jenis, detail, pos, p) {
  getOrCreate_(SH.LOG).appendRow([new Date(), nim, nama, jenis, String(detail || '').slice(0, 300), pos === '' ? '' : Number(pos) + 1]);
  if (/^INFO/.test(jenis)) return Number(p ? p.v[C.Pelanggaran - 1] : 0) || 0;
  p = p || findPeserta_(nim);
  if (!p) return 0;
  const n = (Number(getOrCreate_(SH.PESERTA).getRange(p.row, C.Pelanggaran).getValue()) || 0) + 1;
  setCells_(p.row, { 'Pelanggaran': n });
  cache_().put('vc_' + nim, String(n), CACHE_TTL);
  return n;
}

function apiViolation_(d) {
  const bad = checkToken_(d); if (bad) return bad;
  const nim = String(d.nim).trim();
  const lock = LockService.getScriptLock();
  lock.waitLock(15000);
  try {
    const p = findPeserta_(nim);
    if (!p) return err_('Peserta tidak ditemukan.', 'SESI');
    const n = logViolation_(nim, String(p.v[C.Nama - 1]), String(d.jenis || 'LAINNYA').slice(0, 40), d.detail, d.pos === undefined ? '' : d.pos, p);
    return ok_({ count: n });
  } finally { lock.releaseLock(); }
}

function apiSubmit_(d) {
  const nim = String(d.nim || '').trim();
  const bad = checkToken_(d);
  if (bad && !cache_().get('done_' + nim)) return bad;
  const c = cfg_();
  const lock = LockService.getScriptLock();
  lock.waitLock(25000);
  try {
    const p = findPeserta_(nim);
    if (!p) return err_('Peserta tidak ditemukan.', 'SESI');
    if (p.v[C.Status - 1] === 'SELESAI') {
      return ok_({ already: true, nilai: p.v[C.Nilai - 1], benar: p.v[C.Benar - 1], salah: p.v[C.Salah - 1], kosong: p.v[C.Kosong - 1], total: soal_().length, peringkat: c.peringkat });
    }
    if (d.reason === 'CEK') return err_('Jawaban belum dikumpulkan.', 'BELUM_SELESAI');
    let ans = d.answers || {}, ragu = d.ragu || [];
    let cara = d.reason === 'WAKTU_HABIS' ? 'WAKTU HABIS (otomatis)' : 'DIKUMPULKAN MAHASISWA';
    if (!c.uji && Date.now() > c.end.getTime() + c.grace) {
      // Terlambat: pakai jawaban autosave terakhir yang diterima server sebelum waktu habis
      const s = latestAnswers_(nim, p);
      ans = s.ans; ragu = s.ragu;
      cara = 'TERLAMBAT (dinilai dari autosave)';
    }
    const g = finalizeRow_(p, ans, ragu, cara);
    g.peringkat = c.peringkat;
    return ok_(g);
  } finally { lock.releaseLock(); }
}

function apiRanking_(d) {
  const bad = checkToken_(d);
  const nim = String(d.nim || '').trim();
  if (bad && !cache_().get('done_' + nim)) return bad;
  const c = cfg_();
  if (!c.peringkat) return ok_({ hidden: true });
  let r = parseJSON_(cache_().get('rank'), null);
  if (!r) {
    const v = getOrCreate_(SH.PESERTA).getDataRange().getValues().slice(1);
    const done = v.filter(function (x) { return x[C.Status - 1] === 'SELESAI'; }).map(function (x) {
      return { nim: String(x[0]), nama: String(x[1]), nilai: Number(x[C.Nilai - 1]) || 0, t: x[C.Selesai - 1] ? new Date(x[C.Selesai - 1]).getTime() : 0 };
    });
    done.sort(function (a, b) { return b.nilai - a.nilai || a.t - b.t; });
    let lastNilai = null, lastRank = 0;
    done.forEach(function (x, i) { if (x.nilai !== lastNilai) { lastRank = i + 1; lastNilai = x.nilai; } x.rank = lastRank; delete x.t; });
    const total = readMhs_().length;
    const sum = done.reduce(function (s, x) { return s + x.nilai; }, 0);
    r = { list: done, total: total, selesai: done.length, rata: done.length ? Math.round(sum / done.length * 100) / 100 : 0 };
    cache_().put('rank', JSON.stringify(r), 20);
  }
  return ok_(r);
}

/* =============================== API DOSEN =============================== */

function checkDosen_(d) {
  if (String(d.password || '') !== String(cfg_().PASSWORD_DOSEN)) return err_('Password dosen salah.', 'AUTH');
  return null;
}

function dosenDashboard_(d) {
  const bad = checkDosen_(d); if (bad) return bad;
  const c = cfg_();
  const mhs = readMhs_();
  const pv = getOrCreate_(SH.PESERTA).getDataRange().getValues().slice(1);
  const pmap = {}; pv.forEach(function (r) { pmap[String(r[0]).trim()] = r; });
  const keys = mhs.map(function (m) { return 'hb_' + m.nim; });
  const hbs = {};
  for (let i = 0; i < keys.length; i += 500) Object.assign(hbs, cache_().getAll(keys.slice(i, i + 500)));
  const now = Date.now();

  const students = mhs.map(function (m) {
    const r = pmap[m.nim];
    const hb = parseJSON_(hbs['hb_' + m.nim], null);
    const s = { nim: m.nim, nama: m.nama, kelas: m.kelas, status: r ? r[C.Status - 1] : 'BELUM LOGIN' };
    if (r) {
      const savedAns = parseJSON_(r[C.Jawaban - 1], {});
      s.mulai = r[C.Mulai - 1] ? new Date(r[C.Mulai - 1]).getTime() : null;
      s.selesai = r[C.Selesai - 1] ? new Date(r[C.Selesai - 1]).getTime() : null;
      s.viol = Number(r[C.Pelanggaran - 1]) || 0;
      s.nilai = r[C.Nilai - 1] === '' ? null : Number(r[C.Nilai - 1]);
      s.benar = r[C.Benar - 1];
      s.cara = r[C['Cara Kumpul'] - 1];
      s.lastSeen = hb ? hb.t : (r[C['Terakhir Aktif'] - 1] ? new Date(r[C['Terakhir Aktif'] - 1]).getTime() : null);
      s.pos = hb ? hb.pos : (Number(r[C.Posisi - 1]) || 0);
      s.qid = hb ? hb.qid : '';
      const fin = s.status === 'SELESAI';
      s.answered = fin || !hb ? Object.keys(savedAns).length : hb.n;
      s.ragu = fin || !hb ? parseJSON_(r[C.Ragu - 1], []).length : (hb.ragu || []).length;
      s.vis = hb ? hb.vis : '';
      s.online = !!(s.lastSeen && now - s.lastSeen < 45000);
      s.device = String(r[C.Perangkat - 1] || '');
    }
    return s;
  });

  const lsh = getOrCreate_(SH.LOG);
  const lLast = lsh.getLastRow();
  let logs = [];
  if (lLast > 1) {
    const start = Math.max(2, lLast - 499);
    logs = lsh.getRange(start, 1, lLast - start + 1, 6).getValues().reverse().map(function (r) {
      return { t: r[0] ? new Date(r[0]).getTime() : null, nim: String(r[1]), nama: String(r[2]), jenis: String(r[3]), detail: String(r[4]), pos: r[5] };
    });
  }
  return ok_({ examName: c.NAMA_UJIAN, start: c.start.getTime(), end: c.end.getTime(), uji: c.uji, kode: String(c.KODE_AKSES),
    total: soal_().length, students: students, logs: logs });
}

/** Kumpulkan paksa satu mahasiswa (nim) atau semua yang belum selesai (all:true), dinilai dari autosave. */
function dosenFinalize_(d) {
  const bad = checkDosen_(d); if (bad) return bad;
  const lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    const sh = getOrCreate_(SH.PESERTA);
    const v = sh.getDataRange().getValues();
    let n = 0;
    for (let i = 1; i < v.length; i++) {
      const nim = String(v[i][0]).trim();
      if (d.all ? v[i][C.Status - 1] !== 'MENGERJAKAN' : nim !== String(d.nim).trim()) continue;
      if (v[i][C.Status - 1] === 'SELESAI') continue;
      const p = { row: i + 1, v: v[i] };
      const s = latestAnswers_(nim, p);
      finalizeRow_(p, s.ans, s.ragu, d.all ? 'DIFINALISASI DOSEN (massal)' : 'DIKUMPULKAN PAKSA OLEH DOSEN');
      n++;
    }
    return ok_({ count: n });
  } finally { lock.releaseLock(); }
}

/** Reset satu mahasiswa agar dapat mengulang dari awal (mis. kendala teknis). */
function dosenReset_(d) {
  const bad = checkDosen_(d); if (bad) return bad;
  const nim = String(d.nim || '').trim();
  const lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    const p = findPeserta_(nim);
    if (!p) return err_('Peserta belum pernah login.', 'NF');
    getOrCreate_(SH.PESERTA).deleteRow(p.row);
    const keys = [];
    readMhs_().forEach(function (m) { keys.push('row_' + m.nim); });
    cache_().removeAll(keys.concat(['tok_' + nim, 'hb_' + nim, 'done_' + nim, 'vc_' + nim, 'rank']));
    getOrCreate_(SH.LOG).appendRow([new Date(), nim, String(p.v[1]), 'INFO_RESET_DOSEN', 'Sesi direset oleh dosen', '']);
    return ok_({});
  } finally { lock.releaseLock(); }
}

function dosenExport_(d) {
  const bad = checkDosen_(d); if (bad) return bad;
  const c = cfg_();
  const soal = soal_();
  const mhs = readMhs_();
  const pv = getOrCreate_(SH.PESERTA).getDataRange().getValues().slice(1);
  const pmap = {}; pv.forEach(function (r) { pmap[String(r[0]).trim()] = r; });

  const rekap = [], jawaban = [];
  const stat = {}; soal.forEach(function (q) { stat[q.id] = { A: 0, B: 0, C: 0, D: 0, E: 0, kosong: 0, benar: 0, n: 0 }; });

  mhs.forEach(function (m, i) {
    const r = pmap[m.nim];
    const mulai = r && r[C.Mulai - 1] ? new Date(r[C.Mulai - 1]) : null;
    const selesai = r && r[C.Selesai - 1] ? new Date(r[C.Selesai - 1]) : null;
    rekap.push({
      'No': i + 1, 'NIM': m.nim, 'Nama': m.nama, 'Kelas': m.kelas,
      'Status': r ? r[C.Status - 1] : 'TIDAK HADIR',
      'Benar': r ? r[C.Benar - 1] : '', 'Salah': r ? r[C.Salah - 1] : '', 'Kosong': r ? r[C.Kosong - 1] : '',
      'Nilai': r && r[C.Nilai - 1] !== '' ? Number(r[C.Nilai - 1]) : '',
      'Jumlah Pelanggaran': r ? (Number(r[C.Pelanggaran - 1]) || 0) : '',
      'Mulai (WITA)': fmt_(mulai), 'Selesai (WITA)': fmt_(selesai),
      'Durasi (menit)': mulai && selesai ? Math.round((selesai - mulai) / 6000) / 10 : '',
      'Cara Kumpul': r ? r[C['Cara Kumpul'] - 1] : '', 'Perangkat': r ? r[C.Perangkat - 1] : ''
    });
    if (r && r[C.Status - 1] === 'SELESAI') {
      const ans = parseJSON_(r[C.Jawaban - 1], {});
      const row = { 'NIM': m.nim, 'Nama': m.nama };
      soal.forEach(function (q) {
        const a = norm_(ans[q.id]);
        row['S' + q.id] = a ? (a === q.kunci ? a : a.toLowerCase()) : '-';
        const s = stat[q.id]; s.n++;
        if (!a) s.kosong++; else { s[a] = (s[a] || 0) + 1; if (a === q.kunci) s.benar++; }
      });
      row['Nilai'] = Number(r[C.Nilai - 1]);
      jawaban.push(row);
    }
  });

  const butir = soal.map(function (q) {
    const s = stat[q.id];
    const p = s.n ? s.benar / s.n : 0;
    return { 'ID Soal': q.id, 'Topik': q.topik, 'Kunci': q.kunci, 'Peserta': s.n,
      'A': s.A, 'B': s.B, 'C': s.C, 'D': s.D, 'E': s.E, 'Kosong': s.kosong, 'Benar': s.benar,
      'Indeks Kesukaran (p)': Math.round(p * 100) / 100,
      'Kategori': !s.n ? '-' : (p > 0.7 ? 'Mudah' : (p >= 0.3 ? 'Sedang' : 'Sukar')) };
  });

  const lv = getOrCreate_(SH.LOG).getDataRange().getValues().slice(1);
  const logs = lv.map(function (r) { return { 'Waktu (WITA)': fmt_(r[0]), 'NIM': String(r[1]), 'Nama': r[2], 'Jenis': r[3], 'Detail': r[4], 'Posisi Soal': r[5] }; });

  return ok_({ examName: c.NAMA_UJIAN, rekap: rekap, jawaban: jawaban, butir: butir, logs: logs });
}
