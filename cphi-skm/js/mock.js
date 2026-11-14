/* mock.js — server tiruan untuk MODE DEMO (API_URL kosong). Meniru Code.gs, data di localStorage. */
const Mock = (() => {
  const KEY = 'skm_demo_db_v3';
  const DEMO_PW = 'demo1234';
  function h(pw, salt) { let x = 2166136261; const s = salt + '|' + pw; for (let r = 0; r < 3; r++) for (let i = 0; i < s.length; i++) { x ^= s.charCodeAt(i) + r; x = Math.imul(x, 16777619); } return 'demo$' + (x >>> 0).toString(16); } // hanya untuk demo
  let db = null;

  function load() {
    if (db) return db;
    try { db = JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (e) { db = null; }
    if (!db) { db = seed(); save(); }
    return db;
  }
  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(db)); }
    catch (e) { console.warn('Penyimpanan demo penuh', e); }
  }
  function reset() { localStorage.removeItem(KEY); db = null; load(); }

  function rnd(a) { return a[Math.floor(Math.random() * a.length)]; }
  function wpick(weights) { // weights index 0..n-1
    const s = weights.reduce((a, b) => a + b, 0); let r = Math.random() * s;
    for (let i = 0; i < weights.length; i++) { r -= weights[i]; if (r <= 0) return i; }
    return weights.length - 1;
  }

  function seed() {
    const d = { users: [], faskes: [], units: [], forms: [], periods: [], settings: [], responses: {} };
    d.settings = Object.entries({
      app_nama: 'SKM Sehat', instansi: 'Dinas Kesehatan Kabupaten Contoh', alamat: 'Jl. Kesehatan No. 1, Kabupaten Contoh',
      kota: 'Kabupaten Contoh', telepon: '(0000) 123456', email: 'dinkes@contoh.go.id', website: 'dinkes.contoh.go.id',
      logo: 'icons/logo.png', logo_ikon: 'icons/logo-icon.png', logo_mitra: 'icons/logo-mitra.png', warna: '#0572b5', warna_2: '#00b8e4', kepala_dinas: 'dr. Nama Kepala Dinas, M.Kes', nip_kepala_dinas: '19700101 199803 1 001'
    }).map(([key, value]) => ({ key, value }));

    const fk = [
      ['PKM-01', 'Puskesmas Sehat Sentosa', 'Puskesmas'], ['PKM-02', 'Puskesmas Bahagia', 'Puskesmas'],
      ['PKM-03', 'Puskesmas Tanjung Harapan', 'Puskesmas'], ['RS-01', 'RSUD Kabupaten Contoh', 'Rumah Sakit'],
      ['RS-02', 'RS Pratama Mandiri', 'Rumah Sakit']
    ];
    fk.forEach((x, i) => d.faskes.push({ id: 'fk_' + (i + 1), kode: x[0], nama: x[1], jenis: x[2], alamat: 'Alamat ' + x[1], telepon: '', kepala: 'Kepala ' + x[1], nip_kepala: '', logo: '', aktif: true }));
    const unitPkm = ['Pendaftaran', 'Poli Umum', 'Poli KIA/KB', 'Poli Gigi', 'Laboratorium', 'Farmasi'];
    const unitRs = ['Pendaftaran', 'IGD', 'Rawat Jalan', 'Rawat Inap', 'Laboratorium', 'Radiologi', 'Farmasi'];
    let u = 1;
    d.faskes.forEach(f => (f.jenis === 'Puskesmas' ? unitPkm : unitRs).forEach(n => d.units.push({ id: 'un_' + (u++), faskes_id: f.id, nama: n, aktif: true })));

    const U = (email, nama, role, fk, status, extra) => Object.assign({ email, nama, role, faskes_ids: fk, aktif: status === 'disetujui', status, telepon: '', catatan: '', salt: email, pass_hash: h(DEMO_PW, email), harus_ganti: false, dibuat: new Date().toISOString() }, extra || {});
    d.users = [
      U('superadmin@demo.id', 'Super Admin Dinkes', 'superadmin', [], 'disetujui'),
      U('koordinator@demo.id', 'Koordinator Survei', 'koordinator', [], 'disetujui'),
      U('datamanager@demo.id', 'Data Manager', 'datamanager', [], 'disetujui'),
      U('enumerator@demo.id', 'Enumerator Lapangan', 'enumerator', ['fk_1', 'fk_4'], 'disetujui'),
      U('siti.perawat@demo.id', 'Siti Aminah', 'enumerator', ['fk_2'], 'menunggu', { telepon: '0812xxxx1111', catatan: 'Perawat Puskesmas Bahagia, petugas survei triwulan IV.' }),
      U('budi.rsud@demo.id', 'Budi Santoso', 'datamanager', ['fk_4'], 'menunggu', { telepon: '0813xxxx2222', catatan: 'Staf mutu RSUD.' })
    ];
    d.periods = [
      { id: 'pr_1', nama: 'Semester I 2026', mulai: '2026-01-01', selesai: '2026-06-30', spreadsheet_id: 'demo', aktif: false },
      { id: 'pr_2', nama: 'Semester II 2026', mulai: '2026-07-01', selesai: '2026-12-31', spreadsheet_id: 'demo', aktif: true }
    ];
    const f = Core.templateStandar();
    f.id = 'fm_skm'; f.status = 'aktif'; f.periode_id = 'pr_2'; f.dashboard_publik = true; f.populasi = 12000;
    d.forms.push({ id: f.id, judul: f.judul, status: f.status, tipe: f.tipe, periode_id: f.periode_id, dashboard_publik: true, schema: f, dibuat_oleh: 'koordinator@demo.id', diubah: new Date().toISOString() });

    // respons contoh
    const rows = [];
    const now = new Date();
    const start = new Date('2026-07-01T08:00:00');
    const span = Math.max(1, now - start);
    const fkBias = { fk_1: [1, 3, 14, 9], fk_2: [1, 4, 13, 6], fk_3: [2, 6, 12, 4], fk_4: [1, 4, 12, 8], fk_5: [1, 2, 11, 10] };
    for (let i = 0; i < 320; i++) {
      const fac = rnd(d.faskes);
      const unit = rnd(d.units.filter(x => x.faskes_id === fac.id));
      const ts = new Date(start.getTime() + Math.random() * span);
      ts.setHours(7 + Math.floor(Math.random() * 7));
      const data = {
        umur: 18 + Math.floor(Math.random() * 55), jk: String(wpick([45, 55]) + 1), pendidikan: String(wpick([2, 10, 14, 32, 10, 24, 8]) + 1),
        pekerjaan: String(wpick([10, 18, 20, 12, 8, 22, 6, 4]) + 1), bayar: String(wpick([38, 30, 22, 5, 5]) + 1)
      };
      Core.UNSUR.forEach((un, k) => {
        let w = fkBias[fac.id].slice();
        if (un.kode === 'U3') w = [w[0] + 1, w[1] + 4, w[2], Math.max(1, w[3] - 3)];
        if (un.kode === 'U4') w = [0.5, 1, 6, 16];
        if (un.kode === 'U9') w = [w[0] + 1, w[1] + 2, w[2], w[3]];
        data['u' + (k + 1)] = String(wpick(w) + 1);
      });
      if (Math.random() < 0.35) data.saran = rnd(['Antrean pendaftaran mohon dipercepat.', 'Petugas sudah ramah, pertahankan.', 'Ruang tunggu kurang kursi dan agak panas.', 'Toilet perlu lebih bersih.', 'Informasi jadwal dokter tolong dipasang jelas.', 'Pelayanan cepat dan baik, terima kasih.', 'Parkir sempit, perlu ditata.', 'Obat kadang kosong di farmasi.', 'Sediakan antrean online.', 'Dokter menjelaskan dengan sabar.']);
      rows.push({ id: 'r_' + i, client_uuid: 'seed_' + i, ts: ts.toISOString(), form_id: f.id, periode_id: 'pr_2', faskes_id: fac.id, unit_id: unit.id, mode: rnd(['responden', 'enumerator', 'kiosk']), petugas: '', status: rnd(['baru', 'valid', 'valid']), data });
    }
    rows.sort((a, b) => a.ts < b.ts ? -1 : 1);
    d.responses[f.id] = rows;
    return d;
  }

  const KEYS = { users: 'email', settings: 'key' };
  const keyOf = t => KEYS[t] || 'id';

  function userFromToken(token) {
    if (!token || token.indexOf('demo.') !== 0) return null;
    const email = token.slice(5);
    const u = load().users.find(x => x.email === email && x.aktif && x.status === 'disetujui');
    return u ? pub(u) : null;
  }
  function pub(u) { const o = Object.assign({}, u); delete o.pass_hash; delete o.salt; return o; }
  function cekPw(pw) { pw = String(pw || ''); if (pw.length < 8) fail('Password minimal 8 karakter'); if (!/[A-Za-z]/.test(pw) || !/[0-9]/.test(pw)) fail('Password harus mengandung huruf dan angka'); }
  function fail(msg, auth) { const e = new Error(msg); if (auth === false) e.auth = false; throw e; }
  function formOf(id) {
    const row = load().forms.find(f => f.id === id);
    if (!row) fail('Form tidak ditemukan');
    return Object.assign({}, row.schema, { id: row.id, status: row.status, periode_id: row.periode_id, dashboard_publik: !!row.dashboard_publik });
  }
  function canSeeFaskes(user, fid) {
    if (!user || ['superadmin', 'koordinator'].includes(user.role)) return true;
    return !(user.faskes_ids || []).length || user.faskes_ids.includes(fid);
  }
  function pubSettings() { const s = {}; load().settings.forEach(r => s[r.key] = r.value); return s; }

  const PUBLIC = { ping: 1, login: 1, register: 1, publicFaskes: 1, publicSettings: 1, publicForms: 1, publicForm: 1, publicDashboard: 1, submit: 1, demoUsers: 1 };

  const H = {
    ping: () => ({ pong: true }),
    demoUsers: () => load().users.filter(u => u.status === 'disetujui' && u.email.endsWith('@demo.id')).map(u => ({ email: u.email, nama: u.nama, role: u.role })),
    register: (r) => {
      const email = String(r.email || '').trim().toLowerCase();
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) fail('Email tidak valid');
      if (!String(r.nama || '').trim()) fail('Nama wajib diisi');
      cekPw(r.password);
      const ex = load().users.find(u => u.email === email);
      if (ex && ex.status !== 'ditolak') fail(ex.status === 'menunggu' ? 'Email ini sudah mendaftar dan sedang menunggu persetujuan' : 'Email sudah terdaftar. Silakan masuk.');
      if (ex) load().users = load().users.filter(u => u.email !== email);
      load().users.push({ email, nama: r.nama.trim(), role: Core.ROLE_DAFTAR.includes(r.role) ? r.role : 'enumerator', faskes_ids: r.faskes_ids || [], aktif: false, status: 'menunggu', telepon: r.telepon || '', catatan: r.catatan || '', salt: email, pass_hash: h(r.password, email), harus_ganti: false, dibuat: new Date().toISOString() });
      save(); return { status: 'menunggu' };
    },
    login: (r) => {
      const email = String(r.email || '').trim().toLowerCase();
      const u = load().users.find(x => x.email === email);
      if (!u || h(r.password || '', u.salt) !== u.pass_hash) fail('Email atau password salah');
      if (u.status === 'menunggu') fail('Akun Anda masih menunggu persetujuan Super Admin');
      if (u.status === 'ditolak') fail('Pendaftaran akun ini ditolak. Hubungi Super Admin.');
      if (!u.aktif) fail('Akun dinonaktifkan. Hubungi Super Admin.');
      return { token: 'demo.' + u.email, user: pub(u), settings: pubSettings() };
    },
    gantiPassword: (r, user) => {
      const u = load().users.find(x => x.email === user.email);
      if (h(r.lama || '', u.salt) !== u.pass_hash) fail('Password lama salah');
      cekPw(r.baru); if (r.baru === r.lama) fail('Password baru harus berbeda');
      u.pass_hash = h(r.baru, u.salt); u.harus_ganti = false; save(); return { ok: true };
    },
    approveUser: (r, user) => {
      if (user.role !== 'superadmin') fail('Tidak diizinkan');
      const u = load().users.find(x => x.email === r.email); if (!u) fail('Pengguna tidak ditemukan');
      u.status = r.setuju ? 'disetujui' : 'ditolak'; u.aktif = !!r.setuju; u.disetujui_oleh = user.email;
      if (r.setuju) { if (!Core.ROLES[r.role]) fail('Peran tidak valid'); u.role = r.role; u.faskes_ids = r.faskes_ids || []; }
      save(); return { email: u.email, status: u.status };
    },
    resetPassword: (r, user) => {
      if (user.role !== 'superadmin') fail('Tidak diizinkan');
      cekPw(r.password);
      const u = load().users.find(x => x.email === r.email); if (!u) fail('Pengguna tidak ditemukan');
      u.pass_hash = h(r.password, u.salt); u.harus_ganti = true; save(); return { ok: true };
    },
    me: (r, user) => ({ user, settings: pubSettings() }),
    publicSettings: () => pubSettings(),
    publicFaskes: () => load().faskes.filter(f => f.aktif !== false).map(f => ({ id: f.id, nama: f.nama })),
    publicForms: () => load().forms.map(r => formOf(r.id)).filter(f => (f.status === 'aktif' && (f.mode_input || []).some(m => m !== 'enumerator')) || f.dashboard_publik)
      .map(f => ({ id: f.id, judul: f.judul, responden: f.status === 'aktif' && (f.mode_input || []).includes('responden'), dashboard: !!f.dashboard_publik })),
    list: (r, user) => {
      const t = r.table;
      if (!Core.READ[t] || !Core.can(user.role, Core.READ[t])) fail('Tidak diizinkan membaca ' + t);
      let rows = JSON.parse(JSON.stringify(load()[t]));
      if (t === 'users') rows = rows.map(pub);
      if (t === 'forms') {
        rows = rows.map(x => formOf(x.id));
        if (user.role === 'enumerator') rows = rows.filter(f => f.status === 'aktif' && (f.mode_input || []).includes('enumerator'));
      }
      if (t === 'faskes') rows = rows.filter(x => canSeeFaskes(user, x.id));
      if (t === 'units') rows = rows.filter(x => canSeeFaskes(user, x.faskes_id));
      return rows;
    },
    bootstrap: (r, user) => {
      const o = {};
      ['faskes', 'units', 'forms', 'periods', 'settings'].forEach(t => o[t] = H.list({ table: t }, user));
      if (user.role === 'superadmin') o.users = H.list({ table: 'users' }, user);
      return o;
    },
    save: (r, user) => {
      const t = r.table;
      if (!Core.WRITE[t] || !Core.can(user.role, Core.WRITE[t])) fail('Tidak diizinkan mengubah ' + t);
      const key = keyOf(t);
      const row = r.row || {};
      if (!row[key]) row[key] = Core.uid(t.slice(0, 2) + '_');
      if (t === 'users') {
        row.email = String(row.email).trim().toLowerCase(); if (!Core.ROLES[row.role]) fail('Peran tidak valid');
        const pw = row.password; delete row.password; delete row.pass_hash; delete row.salt; delete row.harus_ganti;
        if (!load().users.some(u => u.email === row.email)) { cekPw(pw); Object.assign(row, { salt: row.email, pass_hash: h(pw, row.email), harus_ganti: true, status: 'disetujui', disetujui_oleh: user.email, dibuat: new Date().toISOString() }); }
      }
      let store = load()[t];
      if (t === 'forms') {
        const f = row.schema || row; f.id = row.id;
        const out = { id: row.id, judul: f.judul, status: f.status || 'draft', tipe: f.tipe || 'custom', periode_id: f.periode_id || '', dashboard_publik: !!f.dashboard_publik, schema: f, dibuat_oleh: user.email, diubah: new Date().toISOString() };
        const i = store.findIndex(x => x.id === row.id);
        if (i >= 0) store[i] = out; else store.push(out);
        save();
        return formOf(row.id);
      }
      if (t === 'periods' && !row.spreadsheet_id) row.spreadsheet_id = 'demo_' + row.id;
      const i = store.findIndex(x => String(x[key]) === String(row[key]));
      if (i >= 0) store[i] = Object.assign(store[i], row); else store.push(row);
      save();
      return t === 'users' ? pub(store.find(x => x.email === row.email)) : row;
    },
    saveSettings: (r, user) => {
      if (user.role !== 'superadmin') fail('Tidak diizinkan');
      Object.keys(r.values || {}).forEach(k => { const x = load().settings.find(y => y.key === k); if (x) x.value = r.values[k]; else load().settings.push({ key: k, value: r.values[k] }); });
      save(); return pubSettings();
    },
    remove: (r, user) => {
      const t = r.table;
      if (!Core.WRITE[t] || !Core.can(user.role, Core.WRITE[t])) fail('Tidak diizinkan menghapus ' + t);
      if (t === 'users' && r.id === user.email) fail('Tidak bisa menghapus akun sendiri');
      const key = keyOf(t);
      load()[t] = load()[t].filter(x => String(x[key]) !== String(r.id));
      save();
      return { removed: r.id };
    },
    publicForm: (r) => {
      const f = formOf(r.form_id);
      if (f.status !== 'aktif') fail('Survei belum dibuka atau sudah ditutup');
      if (!(f.mode_input || []).some(m => m !== 'enumerator')) fail('Survei ini hanya diisi oleh petugas');
      let faskes = load().faskes.filter(x => x.aktif !== false);
      if (f.faskes_ids && f.faskes_ids.length) faskes = faskes.filter(x => f.faskes_ids.includes(x.id));
      const ids = faskes.map(x => x.id);
      let units = load().units.filter(u => ids.includes(u.faskes_id));
      if (f.unit_ids && f.unit_ids.length) units = units.filter(u => f.unit_ids.includes(u.id));
      return { form: f, faskes, units, settings: pubSettings() };
    },
    submit: (r, user) => {
      const res = { ok: [], dupe: [], err: {} };
      (r.items || []).forEach(it => {
        const id = it.client_uuid;
        let form;
        try { form = formOf(it.form_id); } catch (e) { res.err[id] = e.message; return; }
        const list = load().responses[form.id] || (load().responses[form.id] = []);
        if (list.some(x => x.client_uuid === id)) { res.dupe.push(id); return; }
        const impor = it.mode === 'impor';
        if (impor) { if (!user || !Core.can(user.role, Core.RESP.impor)) { res.err[id] = 'Impor tidak diizinkan untuk peran ini'; return; } }
        else if (it.mode === 'enumerator') { if (!user) { res.err[id] = 'Perlu login petugas'; return; } }
        else if (form.status !== 'aktif' || !(form.mode_input || []).includes(it.mode)) { res.err[id] = 'Survei tidak menerima mode ' + it.mode; return; }
        const errs = Core.validate(form, it.data || {}, { abaikanWajib: impor });
        if (Object.keys(errs).length) { res.err[id] = 'Validasi: ' + Object.keys(errs).join(', '); return; }
        list.push({ id: Core.uid('r_'), client_uuid: id, ts: it.ts, form_id: form.id, periode_id: form.periode_id, faskes_id: it.faskes_id, unit_id: it.unit_id, mode: it.mode, petugas: user ? user.email : '', status: impor ? 'valid' : 'baru', data: it.data });
        res.ok.push(id);
      });
      save();
      return res;
    },
    responses: (r, user) => {
      if (!Core.can(user.role, Core.RESP.read)) fail('Tidak diizinkan');
      const form = formOf(r.form_id); const f = r.filter || {};
      let rows = JSON.parse(JSON.stringify(load().responses[form.id] || [])).filter(x => {
        const d = String(x.ts).slice(0, 10);
        if (f.dari && d < f.dari) return false;
        if (f.sampai && d > f.sampai) return false;
        if (f.faskes_id && x.faskes_id !== f.faskes_id) return false;
        if (f.unit_id && x.unit_id !== f.unit_id) return false;
        if (f.status && x.status !== f.status) return false;
        return canSeeFaskes(user, x.faskes_id);
      });
      if (!['superadmin', 'datamanager'].includes(user.role)) {
        const pii = (form.pertanyaan || []).filter(q => q.pii).map(q => q.id);
        rows.forEach(x => pii.forEach(k => { if (x.data[k] !== undefined) x.data[k] = '•••'; }));
      }
      return rows;
    },
    updateResponse: (r, user) => {
      if (!Core.can(user.role, Core.RESP.edit)) fail('Tidak diizinkan');
      const x = (load().responses[r.form_id] || []).find(y => y.id === r.id);
      if (!x) fail('Respons tidak ditemukan');
      if (r.status) x.status = r.status;
      if (r.data) x.data = r.data;
      save(); return { id: r.id };
    },
    deleteResponse: (r, user) => {
      if (!Core.can(user.role, Core.RESP.edit)) fail('Tidak diizinkan');
      load().responses[r.form_id] = (load().responses[r.form_id] || []).filter(y => y.id !== r.id);
      save(); return { removed: r.id };
    },
    aggregate: (r, user) => {
      const form = formOf(r.form_id);
      const rows = (load().responses[form.id] || []).filter(x => canSeeFaskes(user, x.faskes_id));
      return Core.aggregate(form, rows, r.filter || {}, {});
    },
    publicDashboard: (r) => {
      const form = formOf(r.form_id);
      if (!form.dashboard_publik) fail('Dashboard survei ini tidak dibuka untuk publik');
      const agg = Core.aggregate(form, load().responses[form.id] || [], r.filter || {}, { publik: true });
      const pub = JSON.parse(JSON.stringify(form)); pub.pertanyaan = pub.pertanyaan.filter(q => !q.pii); delete pub.persetujuan;
      return { form: pub, agg, faskes: load().faskes, units: load().units, settings: pubSettings() };
    },
    uploadPublic: (r) => ({ url: r.dataUrl })
  };

  function handle(req) {
    const fn = H[req.action];
    if (!fn) fail('Aksi tidak dikenal: ' + req.action);
    const user = userFromToken(req.token);
    if (!PUBLIC[req.action] && !user) fail('Sesi berakhir, silakan masuk ulang', false);
    return fn(req, user);
  }
  return { handle, reset };
})();
