/**
 * core.js — Logika bersama (dipakai di browser DAN di Google Apps Script).
 * Salin isi file ini apa adanya ke file "Core.gs" di proyek Apps Script.
 * Jangan memakai objek browser (window/document) di file ini.
 */
var Core = (function () {
  'use strict';

  /* ---------- Peran & izin ---------- */
  var ROLES = {
    superadmin: 'Super Admin',
    koordinator: 'Project Koordinator',
    datamanager: 'Data Manager',
    enumerator: 'Enumerator'
  };

  // Siapa boleh MENULIS ke tabel master
  var WRITE = {
    users: ['superadmin'],
    faskes: ['superadmin', 'koordinator'],
    units: ['superadmin', 'koordinator'],
    forms: ['superadmin', 'koordinator'],
    periods: ['superadmin', 'koordinator'],
    settings: ['superadmin']
  };
  // Siapa boleh MEMBACA tabel master (selain yang dikecualikan publik)
  var READ = {
    users: ['superadmin'],
    faskes: ['superadmin', 'koordinator', 'datamanager', 'enumerator'],
    units: ['superadmin', 'koordinator', 'datamanager', 'enumerator'],
    forms: ['superadmin', 'koordinator', 'datamanager', 'enumerator'],
    periods: ['superadmin', 'koordinator', 'datamanager', 'enumerator'],
    settings: ['superadmin', 'koordinator', 'datamanager', 'enumerator']
  };
  var RESP = {
    read: ['superadmin', 'koordinator', 'datamanager'],
    edit: ['superadmin', 'datamanager'],
    submit: ['superadmin', 'koordinator', 'datamanager', 'enumerator'],
    impor: ['superadmin', 'koordinator', 'datamanager']
  };

  var TABLES = {
    users: ['email', 'nama', 'role', 'faskes_ids', 'aktif', 'dibuat'],
    faskes: ['id', 'kode', 'nama', 'jenis', 'alamat', 'telepon', 'kepala', 'nip_kepala', 'logo', 'aktif'],
    units: ['id', 'faskes_id', 'nama', 'aktif'],
    forms: ['id', 'judul', 'status', 'tipe', 'periode_id', 'dashboard_publik', 'schema', 'dibuat_oleh', 'diubah'],
    periods: ['id', 'nama', 'mulai', 'selesai', 'spreadsheet_id', 'aktif'],
    settings: ['key', 'value']
  };
  var RESP_COLS = ['id', 'client_uuid', 'ts', 'form_id', 'periode_id', 'faskes_id', 'unit_id', 'mode', 'petugas', 'status', 'data'];

  function can(role, list) { return list.indexOf(role) >= 0; }

  /* ---------- Util ---------- */
  function uid(prefix) {
    var s = '';
    var chars = 'abcdefghijkmnpqrstuvwxyz23456789';
    for (var i = 0; i < 8; i++) s += chars.charAt(Math.floor(Math.random() * chars.length));
    return (prefix || '') + Date.now().toString(36) + s;
  }
  function round(x, d) { var p = Math.pow(10, d || 2); return Math.round((x || 0) * p) / p; }

  /* ---------- Tipe pertanyaan ---------- */
  var TYPES = {
    teks: { label: 'Jawaban singkat', ico: 'Aa', grup: 'Teks' },
    paragraf: { label: 'Paragraf', ico: '¶', grup: 'Teks' },
    email: { label: 'Email', ico: '@', grup: 'Teks' },
    telepon: { label: 'Nomor telepon', ico: '☎', grup: 'Teks' },
    angka: { label: 'Bilangan bulat', ico: '123', grup: 'Angka' },
    desimal: { label: 'Desimal', ico: '1.5', grup: 'Angka' },
    pilihan: { label: 'Pilihan ganda (satu)', ico: '◉', grup: 'Pilihan', opsi: true },
    kotakcentang: { label: 'Kotak centang (banyak)', ico: '☑', grup: 'Pilihan', opsi: true },
    dropdown: { label: 'Dropdown', ico: '▾', grup: 'Pilihan', opsi: true },
    ya_tidak: { label: 'Ya / Tidak', ico: '±', grup: 'Pilihan' },
    skala_ikm: { label: 'Skala SKM 1–4 (unsur IKM)', ico: '★4', grup: 'Skala', opsi: true },
    rating: { label: 'Rating bintang', ico: '★', grup: 'Skala' },
    skala_linear: { label: 'Skala linear / NPS', ico: '⇿', grup: 'Skala' },
    matriks: { label: 'Matriks / kisi pilihan', ico: '▦', grup: 'Skala', opsi: true },
    tanggal: { label: 'Tanggal', ico: '📅', grup: 'Waktu' },
    waktu: { label: 'Jam', ico: '⏰', grup: 'Waktu' },
    tanggalwaktu: { label: 'Tanggal & jam', ico: '🗓', grup: 'Waktu' },
    lokasi: { label: 'Lokasi GPS', ico: '📍', grup: 'Media' },
    foto: { label: 'Foto / kamera', ico: '📷', grup: 'Media' },
    tandatangan: { label: 'Tanda tangan', ico: '✍', grup: 'Media' },
    catatan: { label: 'Teks keterangan', ico: 'ℹ', grup: 'Tata letak' },
    halaman: { label: 'Pemisah halaman', ico: '⎘', grup: 'Tata letak' }
  };
  var NON_INPUT = { catatan: 1, halaman: 1 };

  /* ---------- Instrumen standar PermenPAN-RB 14/2017 ---------- */
  var UNSUR = [
    { kode: 'U1', nama: 'Persyaratan', tanya: 'Bagaimana pendapat Saudara tentang kesesuaian persyaratan pelayanan dengan jenis pelayanannya?', opsi: ['Tidak sesuai', 'Kurang sesuai', 'Sesuai', 'Sangat sesuai'] },
    { kode: 'U2', nama: 'Sistem, Mekanisme, dan Prosedur', tanya: 'Bagaimana pemahaman Saudara tentang kemudahan prosedur pelayanan di unit ini?', opsi: ['Tidak mudah', 'Kurang mudah', 'Mudah', 'Sangat mudah'] },
    { kode: 'U3', nama: 'Waktu Penyelesaian', tanya: 'Bagaimana pendapat Saudara tentang kecepatan waktu dalam memberikan pelayanan?', opsi: ['Tidak cepat', 'Kurang cepat', 'Cepat', 'Sangat cepat'] },
    { kode: 'U4', nama: 'Biaya/Tarif', tanya: 'Bagaimana pendapat Saudara tentang kewajaran biaya/tarif dalam pelayanan?', opsi: ['Sangat mahal', 'Cukup mahal', 'Murah', 'Gratis'] },
    { kode: 'U5', nama: 'Produk Spesifikasi Jenis Pelayanan', tanya: 'Bagaimana pendapat Saudara tentang kesesuaian produk pelayanan antara yang tercantum dalam standar pelayanan dengan hasil yang diberikan?', opsi: ['Tidak sesuai', 'Kurang sesuai', 'Sesuai', 'Sangat sesuai'] },
    { kode: 'U6', nama: 'Kompetensi Pelaksana', tanya: 'Bagaimana pendapat Saudara tentang kompetensi/kemampuan petugas dalam pelayanan?', opsi: ['Tidak kompeten', 'Kurang kompeten', 'Kompeten', 'Sangat kompeten'] },
    { kode: 'U7', nama: 'Perilaku Pelaksana', tanya: 'Bagaimana pendapat Saudara tentang perilaku petugas dalam pelayanan terkait kesopanan dan keramahan?', opsi: ['Tidak sopan dan ramah', 'Kurang sopan dan ramah', 'Sopan dan ramah', 'Sangat sopan dan ramah'] },
    { kode: 'U8', nama: 'Penanganan Pengaduan, Saran dan Masukan', tanya: 'Bagaimana pendapat Saudara tentang penanganan pengaduan pengguna layanan?', opsi: ['Tidak ada', 'Ada tetapi tidak berfungsi', 'Berfungsi kurang maksimal', 'Dikelola dengan baik'] },
    { kode: 'U9', nama: 'Sarana dan Prasarana', tanya: 'Bagaimana pendapat Saudara tentang kualitas sarana dan prasarana?', opsi: ['Buruk', 'Cukup', 'Baik', 'Sangat baik'] }
  ];

  function opsiList(arr) {
    return arr.map(function (l, i) { return { v: String(i + 1), l: l }; });
  }

  function templateStandar() {
    var q = [];
    q.push({ id: 'h_profil', tipe: 'halaman', label: 'Profil Responden' });
    q.push({ id: 'umur', tipe: 'angka', label: 'Umur (tahun)', wajib: true, min: 10, max: 110, kategori: 'profil' });
    q.push({ id: 'jk', tipe: 'pilihan', label: 'Jenis kelamin', wajib: true, kategori: 'profil', opsi: opsiList(['Laki-laki', 'Perempuan']) });
    q.push({ id: 'pendidikan', tipe: 'pilihan', label: 'Pendidikan terakhir', wajib: true, kategori: 'profil', opsi: opsiList(['Tidak sekolah', 'SD', 'SMP', 'SMA/SMK', 'D1–D3', 'D4/S1', 'S2 ke atas']) });
    q.push({ id: 'pekerjaan', tipe: 'pilihan', label: 'Pekerjaan utama', wajib: true, kategori: 'profil', opsi: opsiList(['PNS/TNI/Polri', 'Pegawai swasta', 'Wiraswasta', 'Petani/Nelayan', 'Pelajar/Mahasiswa', 'Ibu rumah tangga', 'Tidak bekerja', 'Lainnya']) });
    q.push({ id: 'bayar', tipe: 'pilihan', label: 'Jenis pembayaran', wajib: true, kategori: 'profil', opsi: opsiList(['BPJS Kesehatan (PBI)', 'BPJS Kesehatan (Non-PBI)', 'Umum/Mandiri', 'Asuransi lain', 'Jamkesda']) });
    q.push({ id: 'h_unsur', tipe: 'halaman', label: 'Penilaian Pelayanan' });
    q.push({ id: 'info_unsur', tipe: 'catatan', label: 'Berikan penilaian berdasarkan pengalaman Saudara saat menerima layanan hari ini.' });
    UNSUR.forEach(function (u) {
      q.push({ id: u.kode.toLowerCase(), tipe: 'skala_ikm', label: u.tanya, wajib: true, ikm: true, unsur: u.kode, unsur_nama: u.nama, kategori: 'unsur', opsi: opsiList(u.opsi) });
    });
    q.push({ id: 'h_saran', tipe: 'halaman', label: 'Saran & Masukan' });
    q.push({ id: 'saran', tipe: 'paragraf', label: 'Saran dan masukan untuk perbaikan pelayanan', wajib: false, kategori: 'lain' });
    return {
      judul: 'Survei Kepuasan Masyarakat Layanan Kesehatan',
      deskripsi: 'Survei ini bertujuan mengukur kepuasan Saudara terhadap pelayanan kami. Jawaban bersifat rahasia dan hanya digunakan untuk perbaikan layanan.',
      tipe: 'standar',
      faskes_mode: 'banyak',
      faskes_ids: [],
      unit_wajib: true,
      unit_ids: [],
      mode_input: ['enumerator', 'responden', 'kiosk'],
      dashboard_publik: false,
      status: 'draft',
      persetujuan: 'Saya bersedia mengisi survei ini secara sukarela. Data saya dilindungi sesuai UU No. 27 Tahun 2022 tentang Pelindungan Data Pribadi dan hanya digunakan untuk keperluan evaluasi pelayanan.',
      populasi: 0,
      pertanyaan: q
    };
  }

  /* ---------- Logika tampil (skip logic) ---------- */
  function evalLogika(logika, data) {
    if (!logika || !logika.q) return true;
    var conds = logika.syarat || [logika];
    var gabung = logika.gabung || 'dan';
    var res = conds.map(function (c) { return evalCond(c, data); });
    return gabung === 'atau' ? res.some(Boolean) : res.every(Boolean);
  }
  function evalCond(c, data) {
    var v = data[c.q];
    var t = c.v;
    var arr = Array.isArray(v) ? v.map(String) : (v === undefined || v === null || v === '' ? [] : [String(v)]);
    switch (c.op) {
      case '=': return arr.indexOf(String(t)) >= 0;
      case '!=': return arr.indexOf(String(t)) < 0;
      case '>': return arr.length && parseFloat(arr[0]) > parseFloat(t);
      case '<': return arr.length && parseFloat(arr[0]) < parseFloat(t);
      case '>=': return arr.length && parseFloat(arr[0]) >= parseFloat(t);
      case '<=': return arr.length && parseFloat(arr[0]) <= parseFloat(t);
      case 'terisi': return arr.length > 0;
      case 'kosong': return arr.length === 0;
      default: return true;
    }
  }

  /* ---------- Validasi jawaban (dipakai klien & server) ---------- */
  function validate(schema, data, opts) {
    opts = opts || {};
    var errs = {};
    (schema.pertanyaan || []).forEach(function (q) {
      if (NON_INPUT[q.tipe]) return;
      if (!evalLogika(q.logika, data)) return;
      var v = data[q.id];
      var empty = v === undefined || v === null || v === '' || (Array.isArray(v) && !v.length) ||
        (q.tipe === 'matriks' && (typeof v !== 'object' || Object.keys(v || {}).length < (q.baris || []).length));
      if (q.wajib && empty && !opts.abaikanWajib) { errs[q.id] = 'Wajib diisi'; return; }
      if (empty) return;
      if ((q.tipe === 'angka' || q.tipe === 'desimal')) {
        var n = parseFloat(v);
        if (isNaN(n)) errs[q.id] = 'Harus berupa angka';
        else if (q.tipe === 'angka' && Math.round(n) !== n) errs[q.id] = 'Harus bilangan bulat';
        else if (q.min !== undefined && q.min !== '' && n < q.min) errs[q.id] = 'Minimal ' + q.min;
        else if (q.max !== undefined && q.max !== '' && n > q.max) errs[q.id] = 'Maksimal ' + q.max;
      }
      if (q.tipe === 'email' && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v)) errs[q.id] = 'Format email tidak valid';
      if (q.tipe === 'telepon' && !/^[+0-9 \-]{8,16}$/.test(v)) errs[q.id] = 'Nomor telepon tidak valid';
      if ((q.tipe === 'teks' || q.tipe === 'paragraf') && q.max && String(v).length > q.max) errs[q.id] = 'Maksimal ' + q.max + ' karakter';
    });
    return errs;
  }

  /* ---------- Agregasi (untuk dashboard & dashboard publik) ---------- */
  var AGG_TYPES = { pilihan: 1, kotakcentang: 1, dropdown: 1, ya_tidak: 1, skala_ikm: 1, rating: 1, skala_linear: 1, angka: 1, desimal: 1, matriks: 1 };

  var NUMERIC = { skala_ikm: 1, rating: 1, skala_linear: 1, angka: 1, desimal: 1 };
  function emptyGroup() { return { n: 0, q: {} }; }

  function addToGroup(G, schema, data) {
    G.n++;
    (schema.pertanyaan || []).forEach(function (q) {
      if (!AGG_TYPES[q.tipe]) return;
      var v = data[q.id];
      if (v === undefined || v === null || v === '') return;
      var s = G.q[q.id] || (G.q[q.id] = { n: 0, s: 0, c: {} });
      if (q.tipe === 'matriks') {
        s.n++;
        Object.keys(v || {}).forEach(function (row) {
          var k = row + '::' + v[row];
          s.c[k] = (s.c[k] || 0) + 1;
        });
        return;
      }
      var vals = Array.isArray(v) ? v : [v];
      s.n++;
      vals.forEach(function (x) { s.c[String(x)] = (s.c[String(x)] || 0) + 1; });
      var num = parseFloat(vals[0]);
      if (!isNaN(num) && NUMERIC[q.tipe]) s.s += num;
    });
  }

  function ageBand(u) {
    u = parseInt(u, 10);
    if (isNaN(u)) return null;
    if (u < 20) return '< 20';
    if (u < 30) return '20–29';
    if (u < 40) return '30–39';
    if (u < 50) return '40–49';
    if (u < 60) return '50–59';
    return '≥ 60';
  }

  /**
   * rows: array respons kanonis. filter: {dari, sampai, faskes_id, unit_id, status}
   * opts.publik = true → buang teks bebas & pertanyaan PII.
   */
  function aggregate(schema, rows, filter, opts) {
    filter = filter || {}; opts = opts || {};
    var out = { total: 0, all: emptyGroup(), faskes: {}, unit: {}, harian: {}, umur: {}, teks: {} };
    var textQ = (schema.pertanyaan || []).filter(function (q) { return (q.tipe === 'paragraf' || q.tipe === 'teks') && !q.pii && q.kategori !== 'profil'; });
    rows.forEach(function (r) {
      if (filter.status && r.status !== filter.status) return;
      if (!filter.status && r.status === 'ditolak') return;
      var day = String(r.ts).slice(0, 10);
      if (filter.dari && day < filter.dari) return;
      if (filter.sampai && day > filter.sampai) return;
      if (filter.faskes_id && r.faskes_id !== filter.faskes_id) return;
      if (filter.unit_id && r.unit_id !== filter.unit_id) return;
      var d = typeof r.data === 'string' ? JSON.parse(r.data || '{}') : (r.data || {});
      out.total++;
      addToGroup(out.all, schema, d);
      var fk = r.faskes_id || '-';
      addToGroup(out.faskes[fk] || (out.faskes[fk] = emptyGroup()), schema, d);
      var un = r.unit_id || '-';
      addToGroup(out.unit[un] || (out.unit[un] = emptyGroup()), schema, d);
      out.harian[day] = (out.harian[day] || 0) + 1;
      var umurQ = (schema.pertanyaan || []).filter(function (q) { return q.id === 'umur' || q.peran === 'umur'; })[0];
      if (umurQ) { var b = ageBand(d[umurQ.id]); if (b) out.umur[b] = (out.umur[b] || 0) + 1; }
      if (!opts.publik) {
        textQ.forEach(function (q) {
          var t = d[q.id];
          if (t && String(t).trim().length > 2) {
            var arr = out.teks[q.id] || (out.teks[q.id] = []);
            if (arr.length < 300) arr.push({ t: String(t), fk: r.faskes_id, u: r.unit_id, ts: r.ts });
          }
        });
      }
    });
    if (opts.publik) {
      var pii = {};
      (schema.pertanyaan || []).forEach(function (q) { if (q.pii) pii[q.id] = 1; });
      [out.all].concat(objVals(out.faskes), objVals(out.unit)).forEach(function (G) {
        Object.keys(pii).forEach(function (k) { delete G.q[k]; });
      });
      out.teks = {};
    }
    return out;
  }
  function objVals(o) { return Object.keys(o).map(function (k) { return o[k]; }); }

  /* ---------- Perhitungan IKM (PermenPAN-RB 14/2017) ---------- */
  function unsurQuestions(schema) {
    return (schema.pertanyaan || []).filter(function (q) { return q.tipe === 'skala_ikm' && q.ikm; });
  }
  function mutuIKM(konv) {
    if (konv >= 88.31) return { mutu: 'A', kinerja: 'Sangat Baik' };
    if (konv >= 76.61) return { mutu: 'B', kinerja: 'Baik' };
    if (konv >= 65.00) return { mutu: 'C', kinerja: 'Kurang Baik' };
    if (konv >= 25) return { mutu: 'D', kinerja: 'Tidak Baik' };
    return { mutu: '-', kinerja: '-' };
  }
  function mutuUnsur(nrr) {
    if (nrr >= 3.5324) return { mutu: 'A', kinerja: 'Sangat Baik' };
    if (nrr >= 3.0644) return { mutu: 'B', kinerja: 'Baik' };
    if (nrr >= 2.60) return { mutu: 'C', kinerja: 'Kurang Baik' };
    if (nrr >= 1) return { mutu: 'D', kinerja: 'Tidak Baik' };
    return { mutu: '-', kinerja: '-' };
  }
  function ikm(schema, G) {
    var uq = unsurQuestions(schema);
    var k = uq.length;
    if (!k || !G || !G.n) return { n: G ? G.n : 0, k: k, unsur: [], ikm: 0, konversi: 0, mutu: '-', kinerja: '-' };
    var bobot = 1 / k;
    var unsur = uq.map(function (q) {
      var s = G.q[q.id] || { n: 0, s: 0, c: {} };
      var nrr = s.n ? s.s / s.n : 0;
      var m = mutuUnsur(nrr);
      return {
        id: q.id, kode: q.unsur || q.id.toUpperCase(), nama: q.unsur_nama || q.label, n: s.n, jumlah: s.s,
        nrr: nrr, tertimbang: nrr * bobot, konversi: nrr * 25, mutu: m.mutu, kinerja: m.kinerja, c: s.c
      };
    });
    var idx = unsur.reduce(function (a, u) { return a + u.tertimbang; }, 0);
    var konv = idx * 25;
    var m = mutuIKM(konv);
    return { n: G.n, k: k, bobot: bobot, unsur: unsur, ikm: idx, konversi: konv, mutu: m.mutu, kinerja: m.kinerja };
  }

  /* Sampel minimum Krejcie & Morgan (1970): X²=3,841; P=0,5; d=0,05 */
  function sampelKrejcie(N) {
    N = parseInt(N, 10);
    if (!N || N < 1) return 0;
    var x2 = 3.841, P = 0.5, d = 0.05;
    return Math.ceil((x2 * N * P * (1 - P)) / (d * d * (N - 1) + x2 * P * (1 - P)));
  }

  return {
    ROLES: ROLES, WRITE: WRITE, READ: READ, RESP: RESP, TABLES: TABLES, RESP_COLS: RESP_COLS,
    TYPES: TYPES, NON_INPUT: NON_INPUT, UNSUR: UNSUR,
    can: can, uid: uid, round: round, templateStandar: templateStandar, opsiList: opsiList,
    evalLogika: evalLogika, validate: validate, aggregate: aggregate, ikm: ikm,
    mutuIKM: mutuIKM, mutuUnsur: mutuUnsur, unsurQuestions: unsurQuestions, sampelKrejcie: sampelKrejcie
  };
})();

if (typeof module !== 'undefined') module.exports = Core;
