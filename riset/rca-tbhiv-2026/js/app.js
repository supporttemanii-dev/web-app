/* RCA TB-HIV 2026 · aplikasi: masuk/daftar, navigasi, beranda, admin, tampilan, bantuan, detak kunci, sinkron */
(function () {
  'use strict';
  const RCA = window.RCA, h = RCA.h, S = RCA.S;
  const main = RCA.$('#main');
  RCA.state.unitCache = {};

  /* ================================================================ sesi */
  function saveSession() { try { localStorage.setItem('rca.session', JSON.stringify({ token: RCA.state.token, user: RCA.state.user })); } catch (e) {} }
  function loadSession() { try { const s = JSON.parse(localStorage.getItem('rca.session') || 'null'); if (s && s.token) { RCA.state.token = s.token; RCA.state.user = s.user; } } catch (e) {} }
  RCA.onAuthLost = msg => { RCA.state.token = null; RCA.state.user = null; localStorage.removeItem('rca.session'); RCA.toast(msg || 'Sesi berakhir', 'err'); showAuth(); };

  async function bootstrap() {
    try {
      const b = await RCA.api('bootstrap');
      Object.assign(RCA.state, { user: b.user, regions: b.regions, users: b.users, notif: b.notif, perluasan: b.perluasan, lockMin: b.lockMin || 5 });
      saveSession(); RCA.idb.set('cache', 'bootstrap', b);
    } catch (e) {
      if (e.code !== 'OFFLINE') throw e;
      const b = await RCA.idb.get('cache', 'bootstrap');
      if (!b) throw e;
      Object.assign(RCA.state, { regions: b.regions, users: b.users, notif: [], lockMin: b.lockMin || 5 });
      RCA.toast('Offline: memakai data tersimpan di perangkat', 'err');
    }
  }

  /* ================================================================ masuk / daftar */
  function showAuth(mode) {
    RCA.$('#sidenav').hidden = true; RCA.$('.shell').classList.add('nonav'); RCA.$('#menuBtn').hidden = true; RCA.$('#notifBtn').hidden = true; RCA.$('#syncPill').hidden = true;
    main.innerHTML = '';
    if (!RCA.apiReady()) {
      main.appendChild(h('div', { class: 'card', style: { maxWidth: '720px', margin: '6vh auto' } }, h('h1', null, 'Server belum dihubungkan'),
        h('p', null, 'Isi API_URL di berkas config.js dengan URL Web App Google Apps Script (berakhiran /exec), lalu muat ulang halaman. Lihat README bagian Deploy.')));
      return;
    }
    const isReg = mode === 'register';
    const side = h('div', { class: 'side' }, h('h1', null, 'RCA TB-HIV 2026'),
      h('p', null, 'Pengumpulan data lapangan telaah akar masalah layanan TB-HIV di 12 kab/kota dan 24 fasyankes.'),
      h('ol', null, h('li', null, 'Sebelum kunjungan: koordinator menyiapkan profil C1 dan memilih sampel C2.'),
        h('li', null, 'Saat kunjungan: enumerator mengisi C3–C7 dan mencocokkan data aplikasi dengan register dan rekam medis.'),
        h('li', null, 'Koordinator memeriksa isian; data Valid masuk Dashboard Analisis.')),
      h('p', { style: { marginTop: '18px', fontSize: '.9rem' } }, 'Aplikasi hanya memakai kode. Jangan memasukkan nama, NIK, nomor rekam medis, alamat, atau nomor telepon pasien.'),
      h('div', { class: 'ledger', 'aria-hidden': 'true', html: '<svg width="260" height="220" viewBox="0 0 260 220"><g fill="none" stroke="#fff" stroke-width="3"><rect x="10" y="10" width="240" height="200" rx="8"/><path d="M10 50h240M10 90h240M10 130h240M10 170h240M70 10v200"/></g></svg>' }));
    const msg = h('div', { role: 'alert' });
    const email = h('input', { type: 'email', id: 'em', autocomplete: 'username', required: true, inputmode: 'email' });
    const pin = h('input', { type: 'password', id: 'pin', class: 'pinbox', inputmode: 'numeric', pattern: '\\d{6}', maxlength: 6, autocomplete: isReg ? 'new-password' : 'current-password', required: true });
    const form = h('form', { novalidate: true });
    form.appendChild(h('h2', null, isReg ? 'Daftar akun' : 'Masuk'));
    form.appendChild(msg);
    let name, code, inst, phone, role, pin2;
    if (isReg) {
      name = h('input', { id: 'nm', required: true, autocomplete: 'name' }); code = h('input', { id: 'cd', maxlength: 12, placeholder: 'contoh FA1, K2, PK1' });
      inst = h('input', { id: 'in', autocomplete: 'organization' }); phone = h('input', { id: 'ph', type: 'tel', autocomplete: 'tel' });
      role = h('select', { id: 'rl' }, h('option', { value: 'Enumerator' }, 'Enumerator (pengisi formulir)'), h('option', { value: 'Koordinator' }, 'Koordinator'), h('option', { value: 'Pembaca' }, 'Pembaca (dashboard agregat)'));
      pin2 = h('input', { type: 'password', id: 'pin2', class: 'pinbox', inputmode: 'numeric', maxlength: 6, autocomplete: 'new-password' });
      [['nm', 'Nama lengkap', name], ['em', 'Email', email], ['cd', 'Kode petugas (dipakai di formulir, mis. kode penelaah)', code], ['in', 'Institusi', inst], ['ph', 'Nomor HP (opsional)', phone], ['rl', 'Peran yang diminta', role], ['pin', 'Buat PIN 6 angka', pin], ['pin2', 'Ulangi PIN', pin2]]
        .forEach(([id, l, el]) => form.appendChild(h('div', null, h('label', { class: 'lbl', for: id }, l), el)));
      form.appendChild(h('p', { class: 'muted' }, 'Akun aktif setelah disetujui Super Admin. Super Admin terdaftar cukup mendaftar dengan emailnya untuk menetapkan PIN.'));
    } else {
      form.appendChild(h('div', null, h('label', { class: 'lbl', for: 'em' }, 'Email'), email));
      form.appendChild(h('div', null, h('label', { class: 'lbl', for: 'pin' }, 'PIN (6 angka)'), pin));
    }
    const btn = h('button', { class: 'btn primary', type: 'submit' }, isReg ? 'Kirim pendaftaran' : 'Masuk');
    form.appendChild(btn);
    form.appendChild(h('p', null, isReg ? 'Sudah punya akun? ' : 'Belum punya akun? ', h('button', { type: 'button', class: 'linkbtn', onclick: () => showAuth(isReg ? 'login' : 'register') }, isReg ? 'Masuk' : 'Daftar')));
    form.addEventListener('submit', async e => {
      e.preventDefault(); msg.innerHTML = '';
      const err = t => { msg.appendChild(h('div', { class: 'notice err' }, t)); };
      if (!/^\d{6}$/.test(pin.value)) return err('PIN harus 6 angka.');
      if (isReg && pin.value !== pin2.value) return err('Ulangan PIN tidak sama.');
      btn.disabled = true;
      try {
        if (isReg) {
          const r = await RCA.api('register', { email: email.value, pin: pin.value, name: name.value, code: code.value, institution: inst.value, phone: phone.value, role: role.value });
          msg.appendChild(h('div', { class: 'notice ok' }, r.message)); form.querySelectorAll('input').forEach(i => { if (i !== email) i.value = ''; });
        } else {
          const r = await RCA.api('login', { email: email.value, pin: pin.value, agent: navigator.userAgent.slice(0, 100) }, { noAuthRedirect: true });
          RCA.state.token = r.token; RCA.state.user = r.user; saveSession();
          await start();
        }
      } catch (ex) { err(ex.message); }
      btn.disabled = false;
    });
    main.appendChild(h('div', { class: 'auth' }, side, form));
    setTimeout(() => (isReg ? name : email).focus(), 50);
  }

  /* ================================================================ navigasi */
  function renderNav() {
    const nav = RCA.$('#sidenav'); nav.hidden = false; nav.innerHTML = ''; RCA.$('.shell').classList.remove('nonav');
    const u = RCA.state.user;
    const link = (href, code, label) => h('a', { href, 'data-href': href }, code ? h('span', { class: 'code' }, code) : null, h('span', null, label));
    nav.appendChild(link('#/', '', 'Beranda'));
    if (RCA.can.raw()) {
      nav.appendChild(h('div', { class: 'grp' }, 'Sebelum kunjungan'));
      nav.appendChild(link('#/form/C1', 'C1', 'Profil awal dan pendalaman'));
      nav.appendChild(link('#/c2', 'C2', 'Daftar sampel dan kode bukti'));
      nav.appendChild(h('div', { class: 'grp' }, 'Saat kunjungan'));
      [['C3', 'Telaah catatan pelayanan'], ['C4', 'Penilaian fasilitas dan 14 CP'], ['C5', 'Verifikasi data sentinel'], ['C6', 'Telaah kematian'], ['C7', 'Wawancara dan diskusi']]
        .forEach(([c, l]) => nav.appendChild(link('#/form/' + c, c, l)));
    }
    nav.appendChild(h('div', { class: 'grp' }, 'Dashboard'));
    if (RCA.can.raw()) nav.appendChild(link('#/progress/C3', '', 'Dashboard Progress'));
    nav.appendChild(link('#/analysis', '', 'Dashboard Analisis'));
    nav.appendChild(link('#/report', '', 'Dashboard Laporan'));
    nav.appendChild(h('div', { class: 'grp' }, 'Lainnya'));
    if (RCA.can.admin() || RCA.can.review()) nav.appendChild(link('#/admin', '', RCA.can.admin() ? 'Admin dan persetujuan akun' : 'Fasyankes dan log'));
    nav.appendChild(link('#/help', '', 'Panduan singkat'));
    nav.appendChild(link('#/prefs', '', 'Tampilan dan akun'));
    nav.appendChild(h('div', { class: 'me' }, h('b', null, u.name), h('br'), h('small', null, u.role + (u.code ? ' · ' + u.code : '')), h('br'),
      h('button', { class: 'linkbtn', onclick: logout }, 'Keluar')));
    markNav();
  }
  function markNav() {
    const hsh = location.hash || '#/';
    RCA.$$('#sidenav a').forEach(a => { const href = a.getAttribute('data-href'); a.classList.toggle('active', href === '#/' ? hsh === '#/' || hsh === '' : hsh.startsWith(href) || (href.startsWith('#/form/') && hsh.startsWith('#/edit/' + href.slice(7) + '/')) || (href.startsWith('#/progress') && hsh.startsWith('#/progress'))); });
  }
  async function logout() {
    if (!await RCA.confirm('Keluar', 'Keluar dari aplikasi? Isian yang belum tersinkron tetap tersimpan di perangkat ini.', 'Keluar')) return;
    await RCA.forms.closeEditor();
    try { await RCA.api('logout'); } catch (e) {}
    RCA.state.token = null; RCA.state.user = null; localStorage.removeItem('rca.session'); showAuth();
  }
  RCA.$('#menuBtn').addEventListener('click', () => RCA.$('#sidenav').classList.toggle('open'));
  RCA.$('#prefsBtn').addEventListener('click', () => { location.hash = '#/prefs'; });
  RCA.$('#notifBtn').addEventListener('click', showNotif);

  /* ================================================================ router */
  async function route() {
    if (!RCA.state.token) return;
    RCA.$('#sidenav').classList.remove('open');
    await RCA.forms.closeEditor();
    const p = (location.hash || '#/').slice(2).split('/').map(decodeURIComponent);
    markNav();
    window.scrollTo(0, 0);
    try {
      if (!p[0]) return home();
      if (p[0] === 'form' && p[1] === 'C2') return RCA.c2.render(main);
      if (p[0] === 'form') return RCA.dash.formList(main, p[1]);
      if (p[0] === 'edit') return RCA.forms.openEditor(main, p[1], p[2], p.slice(3).join('/'));
      if (p[0] === 'c2') return RCA.c2.render(main, { tab: p[1] });
      if (p[0] === 'progress') return RCA.dash.progress(main, p[1]);
      if (p[0] === 'analysis') return RCA.dash.analysis(main);
      if (p[0] === 'report') return RCA.report.page(main);
      if (p[0] === 'admin') return admin(p[1]);
      if (p[0] === 'prefs') return prefsPage();
      if (p[0] === 'help') return help();
      home();
    } catch (e) { main.innerHTML = ''; main.appendChild(h('div', { class: 'notice err' }, e.message)); }
  }
  window.addEventListener('hashchange', route);
  window.addEventListener('beforeunload', e => { const ed = RCA.state.editor; if (ed && ed.dirty && !ed.readOnly && !RCA.state.online) { e.preventDefault(); e.returnValue = ''; } });

  /* ================================================================ beranda */
  async function home() {
    const u = RCA.state.user;
    main.innerHTML = '';
    main.appendChild(h('div', { class: 'page-head' }, h('div', { class: 'grow' }, h('h1', null, 'Selamat bekerja, ' + u.name.split(' ')[0]),
      h('p', null, u.role === 'Pembaca' ? 'Anda dapat melihat Dashboard Analisis berisi data agregat tanpa identitas.' : 'Pilih formulir, buka unit, isi, lalu kirim. Isian tersimpan otomatis di perangkat dan disinkronkan ke server.'))));
    if (u.role === 'Pembaca') { main.appendChild(h('a', { class: 'btn primary', href: '#/analysis' }, 'Buka Dashboard Analisis')); return; }
    const ret = []; const grid = h('div', { class: 'grid' });
    const forms = ['C1', 'C3', 'C4', 'C5', 'C6', 'C7'];
    const cards = {};
    [['C1', 'Sebelum kunjungan'], ['C2', 'Sebelum kunjungan'], ['C3', 'Saat kunjungan'], ['C4', 'Saat kunjungan'], ['C5', 'Saat kunjungan'], ['C6', 'Saat kunjungan'], ['C7', 'Saat kunjungan']].forEach(([f, ph]) => {
      const stat = h('div', { class: 'muted' }, f === 'C2' ? 'Kerangka, undian, calon C6, daftar sentinel, sesi C7' : 'memuat…');
      const bar = h('div', { style: { marginTop: '10px' } });
      cards[f] = { stat, bar };
      grid.appendChild(h('a', { class: 'card', href: f === 'C2' ? '#/c2' : '#/form/' + f, style: { textDecoration: 'none', color: 'inherit' } },
        h('small', { class: 'muted' }, ph), h('h3', { style: { marginTop: '4px' } }, S.forms[f].title), stat, bar));
    });
    const notifBox = h('div');
    main.appendChild(notifBox);
    main.appendChild(grid);
    renderHomeNotif(notifBox);
    await Promise.all(forms.map(async f => {
      try {
        const us = await RCA.dash.loadUnits(f);
        const c = s => us.filter(x => x.status === s).length;
        cards[f].stat.textContent = us.length + ' unit · ' + c('Valid') + ' valid · ' + c('Dikirim') + ' dikirim · ' + c('Draf') + ' draf' + (c('Dikembalikan') ? ' · ' + c('Dikembalikan') + ' dikembalikan' : '');
        const n = us.length || 1;
        cards[f].bar.appendChild(h('div', { class: 'stackbar' }, ['Draf', 'Dikirim', 'Dikembalikan', 'Valid'].map(s => h('i', { style: { width: (c(s) / n * 100) + '%', background: 'var(--s-' + { Draf: 'draf', Dikirim: 'dikirim', Dikembalikan: 'kembali', Valid: 'valid' }[s] + ')' } }))));
        us.filter(x => x.status === 'Dikembalikan').forEach(x => ret.push([f, x]));
      } catch (e) { cards[f].stat.textContent = e.code === 'OFFLINE' ? 'offline' : e.message; }
    }));
    const drafts = (await RCA.idb.all('drafts')).filter(d => d.val && d.val.dirty && d.val.email === u.email);
    if (drafts.length || ret.length) notifBox.prepend(h('div', { class: 'stack', style: { marginBottom: '16px' } },
      drafts.length ? h('div', { class: 'notice warn' }, h('b', null, drafts.length + ' isian di perangkat ini belum tersinkron: '), drafts.map(d => { const [f, s, un] = d.key.split('|'); return h('a', { href: '#/edit/' + f + '/' + s + '/' + encodeURIComponent(un), style: { marginRight: '10px' } }, s + ' ' + un); })) : null,
      ret.length ? h('div', { class: 'notice err' }, h('b', null, ret.length + ' unit dikembalikan koordinator: '), ret.map(([f, x]) => h('a', { href: '#/edit/' + f + '/' + x.sub + '/' + encodeURIComponent(x.unit), style: { marginRight: '10px' } }, x.unit))) : null));
  }
  function renderHomeNotif(box) {
    const n = RCA.state.notif || [];
    if (!n.length) return;
    box.appendChild(h('div', { class: 'card', style: { marginBottom: '16px' } }, h('h3', null, 'Notifikasi (' + n.length + ')'),
      h('ul', null, n.slice(-5).reverse().map(x => h('li', null, x.unit ? h('a', { href: '#/edit/' + x.form + '/' + x.sub + '/' + encodeURIComponent(x.unit) }, x.unit) : null, ' ', x.msg, h('small', { class: 'muted' }, ' · ' + (x.from_name || '') + ' ' + RCA.ago(x.created))))),
      h('button', { class: 'btn small', onclick: async () => { await RCA.api('notif.read', { all: true }); RCA.state.notif = []; updateBadge(); box.innerHTML = ''; } }, 'Tandai semua dibaca')));
  }
  function updateBadge() {
    const n = (RCA.state.notif || []).length, b = RCA.$('#notifCount');
    b.hidden = !n; b.textContent = n > 9 ? '9+' : n;
  }
  function showNotif() {
    const n = RCA.state.notif || [];
    RCA.modal('Notifikasi', n.length ? h('ul', null, n.slice().reverse().map(x => h('li', { style: { marginBottom: '8px' } }, x.unit ? h('a', { href: '#/edit/' + x.form + '/' + x.sub + '/' + encodeURIComponent(x.unit), onclick: () => { RCA.$('#modalRoot').innerHTML = ''; } }, x.form + ' ' + x.unit) : null, ' ', x.msg, h('br'), h('small', { class: 'muted' }, (x.from_name || '') + ' · ' + RCA.fmtDT(x.created))))) : h('p', null, 'Tidak ada notifikasi baru.'),
      [{ label: 'Tutup', value: null }, { label: 'Tandai semua dibaca', cls: 'primary', value: 'read' }]).then(async v => { if (v === 'read') { await RCA.api('notif.read', { all: true }); RCA.state.notif = []; updateBadge(); } });
  }

  /* ================================================================ sinkron & detak */
  RCA.renderSyncPill = async function () {
    const pill = RCA.$('#syncPill'); if (!RCA.state.token) return;
    pill.hidden = false;
    const drafts = (await RCA.idb.all('drafts')).filter(d => d.val && d.val.dirty);
    pill.className = 'pill' + (RCA.state.online ? '' : ' off');
    pill.innerHTML = '';
    pill.appendChild(h('span', { class: 'dot' })); pill.appendChild(document.createTextNode(RCA.state.online ? (drafts.length ? drafts.length + ' belum tersinkron' : 'Online · tersinkron') : 'Offline · ' + drafts.length + ' di perangkat'));
  };
  async function syncAllDrafts() {
    const drafts = (await RCA.idb.all('drafts')).filter(d => d.val && d.val.dirty && d.val.email === RCA.state.user.email);
    const ed = RCA.state.editor;
    for (const d of drafts) {
      if (ed && d.key === ed.key) { if (!ed.readOnly) await ed.saveServer(false); continue; }
      const [form, sub, ...rest] = d.key.split('|'); const unit = rest.join('|');
      try {
        const r = await RCA.api('rec.save', { form, sub, unit, data: d.val.data, baseVersion: d.val.baseVersion });
        if (r.conflict) { await RCA.idb.del('drafts', d.key); RCA.toast(unit + ': disimpan sebagai versi cadangan (' + r.message + ')', 'err', 9000); }
        else { await RCA.idb.set('drafts', d.key, Object.assign({}, d.val, { dirty: false, baseVersion: r.rec.version })); RCA.api('rec.unlock', { form, sub, unit }).catch(() => {}); }
      } catch (e) { if (e.code === 'OFFLINE') break; }
    }
    RCA.renderSyncPill();
  }
  RCA.onReconnect = () => { if (RCA.state.token) setTimeout(syncAllDrafts, 800); };
  let warned = false;
  async function beat() {
    if (!RCA.state.token) return;
    const ed = RCA.state.editor;
    const keys = Array.from(RCA.state.heldLocks);
    const active = Date.now() - RCA.state.lastActivity < 60000;
    try {
      const r = await RCA.api('heartbeat', { keys, active });
      Object.entries(r.locks || {}).forEach(([k, v]) => {
        if (v.startsWith('taken:')) { RCA.state.heldLocks.delete(k); if (ed && ed.key === k) ed.onLockLost(v.slice(6)); }
        if (v === 'reacquired' && ed && ed.key === k) RCA.toast('Koneksi kembali: kunci unit dipulihkan untuk Anda', 'ok');
      });
      const before = (RCA.state.notif || []).length;
      RCA.state.notif = r.notif || []; updateBadge();
      if (RCA.state.notif.length > before) RCA.toast('Notifikasi baru: ' + RCA.state.notif[RCA.state.notif.length - 1].msg, null, 7000);
    } catch (e) { /* offline ditangani setOnline */ }
  }
  setInterval(beat, 60000);
  setInterval(() => {
    const ed = RCA.state.editor;
    if (!ed || ed.readOnly || !ed.held) { warned = false; return; }
    const idle = Date.now() - RCA.state.lastActivity;
    const lim = RCA.state.lockMin * 60000;
    if (idle > lim - 60000 && idle < lim && !warned) { warned = true; RCA.toast('Kunci unit akan lepas dalam 1 menit karena tidak ada aktivitas. Ketuk layar untuk tetap mengerjakan.', 'err', 20000); }
    if (idle < 30000) warned = false;
  }, 15000);

  /* ================================================================ admin */
  async function admin(tab) {
    tab = tab || (RCA.can.admin() ? 'users' : 'fac');
    main.innerHTML = '';
    main.appendChild(h('div', { class: 'page-head' }, h('div', { class: 'grow' }, h('h1', null, RCA.can.admin() ? 'Admin' : 'Fasyankes dan log'), h('p', null, 'Persetujuan akun, peran, fasyankes dan sentinel, serta log aktivitas.'))));
    const tabs = (RCA.can.admin() ? [['users', 'Akun dan persetujuan']] : []).concat([['fac', 'Fasyankes dan sentinel'], ['audit', 'Log aktivitas']]);
    main.appendChild(h('div', { class: 'tabs', role: 'tablist' }, tabs.map(([k, l]) => h('button', { role: 'tab', 'aria-selected': tab === k ? 'true' : 'false', onclick: () => { location.hash = '#/admin/' + k; } }, l))));
    const box = h('div'); main.appendChild(box);
    try {
      if (tab === 'users') {
        const users = await RCA.api('users.list');
        const order = { Menunggu: 0, 'Menunggu PIN': 1, Aktif: 2, Nonaktif: 3, Ditolak: 4 };
        users.sort((a, b) => (order[a.status] - order[b.status]) || String(a.created).localeCompare(String(b.created)));
        const pend = users.filter(u => u.status === 'Menunggu').length;
        box.appendChild(h('div', { class: pend ? 'notice warn' : 'notice', style: { marginBottom: '12px' } }, pend ? pend + ' permintaan akun menunggu persetujuan.' : 'Tidak ada permintaan baru.'));
        box.appendChild(h('div', { class: 'table-wrap' }, h('table', { class: 't' }, h('thead', null, h('tr', null, ['Nama', 'Email', 'Kode', 'Institusi', 'Peran diminta', 'Peran', 'Status', 'Daftar', 'Aksi'].map(x => h('th', null, x)))),
          h('tbody', null, users.map(u => {
            const roleSel = h('select', { 'aria-label': 'Peran ' + u.email }); ['', 'SuperAdmin', 'Koordinator', 'Enumerator', 'Pembaca'].forEach(r => roleSel.appendChild(h('option', { value: r, selected: (u.role || u.role_req) === r }, r || '—')));
            const act = (payload, label) => h('button', { class: 'btn small', onclick: async () => { try { await RCA.api('users.update', Object.assign({ email: u.email }, payload)); RCA.toast(label + ': ' + u.name, 'ok'); admin('users'); } catch (e) { RCA.toast(e.message, 'err'); } } }, label);
            return h('tr', null, h('td', null, u.name), h('td', null, u.email), h('td', null, u.code), h('td', null, u.institution), h('td', null, u.role_req), h('td', null, roleSel),
              h('td', null, h('span', { class: 'st ' + (u.status === 'Aktif' ? 'st-Valid' : u.status === 'Menunggu' ? 'st-Draf' : 'st-Belum') }, u.status)), h('td', null, RCA.fmtD(u.created)),
              h('td', null, h('div', { class: 'row' },
                u.status !== 'Aktif' ? h('button', { class: 'btn small ok', onclick: async () => { try { await RCA.api('users.update', { email: u.email, status: 'Aktif', role: roleSel.value || u.role_req }); RCA.toast('Disetujui: ' + u.name, 'ok'); admin('users'); } catch (e) { RCA.toast(e.message, 'err'); } } }, 'Setujui') : h('button', { class: 'btn small', onclick: async () => { try { await RCA.api('users.update', { email: u.email, role: roleSel.value }); RCA.toast('Peran diperbarui', 'ok'); } catch (e) { RCA.toast(e.message, 'err'); } } }, 'Simpan peran'),
                u.status === 'Menunggu' ? act({ status: 'Ditolak' }, 'Tolak') : null,
                u.status === 'Aktif' && u.email !== RCA.state.user.email ? act({ status: 'Nonaktif' }, 'Nonaktifkan') : null,
                h('button', { class: 'btn small ghost', onclick: async () => { const c = await RCA.prompt('Kode petugas', 'Kode untuk ' + u.name, { value: u.code }); if (c === null) return; await RCA.api('users.update', { email: u.email, code: c }); admin('users'); } }, 'Kode'),
                u.status === 'Aktif' ? h('button', { class: 'btn small ghost', onclick: async () => { if (!await RCA.confirm('Atur ulang PIN', 'Buat PIN sementara untuk ' + u.name + '? Sesi aktifnya akan diakhiri.', 'Atur ulang')) return; const r = await RCA.api('users.resetPin', { email: u.email }); RCA.modal('PIN sementara', h('div', null, h('p', null, 'Sampaikan PIN ini secara langsung kepada ' + u.name + ', lalu minta ia menggantinya di menu Tampilan dan akun.'), h('p', { style: { fontSize: '2rem', letterSpacing: '.3em' } }, h('b', null, r.pin)))); } }, 'Reset PIN') : null)));
          })))));
      }
      if (tab === 'fac') {
        const R = RCA.state.regions;
        box.appendChild(h('p', null, 'Nama fasyankes bersifat opsional; tanpa nama, aplikasi memakai kode (contoh BLL-RS = rumah sakit Buleleng). Sentinel C5: tepat satu per provinsi, termasuk dalam 24 fasyankes. Perluasan sampel A/B ditetapkan per provinsi sebelum undian.'));
        box.appendChild(h('div', { class: 'table-wrap', style: { marginBottom: '14px' } }, h('table', { class: 't' }, h('thead', null, h('tr', null, ['Provinsi', 'Perluasan A/B', 'Sentinel'].map(x => h('th', null, x)))),
          h('tbody', null, R.prov.map(p => { const s = R.fac.filter(f => f.sentinel === 'Ya' && RCA.reg.kk(f.kk).prov === p.code); const per = (RCA.state.perluasan || {})[p.code] || 'Tidak';
            return h('tr', null, h('td', null, p.name), h('td', null, per, ' ', h('button', { class: 'linkbtn', onclick: async () => { RCA.state.perluasan = await RCA.api('config.perluasan', { prov: p.code, value: per !== 'Ya' }); admin('fac'); } }, 'ubah')),
              h('td', null, s.length === 1 ? s[0].code : h('span', { style: { color: 'var(--s-kembali)' } }, s.length ? s.map(x => x.code).join(', ') + ' (lebih dari satu)' : 'belum ditetapkan'))); })))));
        box.appendChild(h('div', { class: 'table-wrap' }, h('table', { class: 't' }, h('thead', null, h('tr', null, ['Kode', 'Kab/kota', 'Jenis', 'Nama', 'Sentinel', ''].map(x => h('th', null, x)))),
          h('tbody', null, R.fac.map(f => {
            const nm = h('input', { value: f.name || '', placeholder: 'opsional', 'aria-label': 'Nama ' + f.code });
            const sn = h('input', { type: 'checkbox', checked: f.sentinel === 'Ya', 'aria-label': 'Sentinel ' + f.code });
            return h('tr', null, h('td', null, h('b', null, f.code)), h('td', null, RCA.reg.kkName(f.kk)), h('td', null, f.type), h('td', { style: { minWidth: '240px' } }, nm), h('td', null, sn),
              h('td', null, h('button', { class: 'btn small', onclick: async () => { try { RCA.state.regions = await RCA.api('fac.update', { code: f.code, name: nm.value, sentinel: sn.checked }); RCA.toast('Tersimpan', 'ok'); admin('fac'); } catch (e) { RCA.toast(e.message, 'err'); } } }, 'Simpan')));
          })))));
      }
      if (tab === 'audit') {
        const log = await RCA.api('audit.list', { limit: 400 });
        box.appendChild(h('div', { class: 'row', style: { marginBottom: '10px' } }, RCA.can.admin() ? h('button', { class: 'btn small', onclick: () => RCA.dash.exportForm('MASTER') }, 'Ekspor akun dan log') : null));
        box.appendChild(h('div', { class: 'table-wrap', style: { maxHeight: '70vh' } }, h('table', { class: 't' }, h('thead', null, h('tr', null, ['Waktu', 'Pengguna', 'Aksi', 'Target', 'Rincian'].map(x => h('th', null, x)))),
          h('tbody', null, log.map(l => h('tr', null, h('td', null, RCA.fmtDT(l.ts)), h('td', null, l.email), h('td', null, l.action), h('td', null, l.target), h('td', null, h('small', null, l.detail))))))));
      }
    } catch (e) { box.appendChild(h('div', { class: 'notice err' }, e.message)); }
  }

  /* ================================================================ tampilan & akun */
  async function prefsPage() {
    const p = RCA.prefs;
    main.innerHTML = '';
    main.appendChild(h('div', { class: 'page-head' }, h('div', { class: 'grow' }, h('h1', null, 'Tampilan dan akun'), h('p', null, 'Atur ukuran huruf, kontras, dan tema sesuai kenyamanan. Pengaturan tersimpan di perangkat ini.'))));
    const radio = (name, opts, cur, on) => h('div', { class: 'multi', role: 'radiogroup' }, opts.map(([v, l]) => { const r = h('input', { type: 'radio', name, value: v, checked: (cur || opts[0][0]) === v }); r.addEventListener('change', () => on(v)); return h('label', null, r, l); }));
    const set = (k, v) => { p[k] = v; RCA.applyPrefs(); };
    const font = h('input', { type: 'range', min: '0.9', max: '1.4', step: '0.05', value: p.font || 1, 'aria-label': 'Ukuran huruf' });
    const fv = h('b', null, Math.round((p.font || 1) * 100) + '%');
    font.addEventListener('input', () => { set('font', font.value); fv.textContent = Math.round(font.value * 100) + '%'; });
    main.appendChild(h('div', { class: 'card stack', style: { maxWidth: '760px' } },
      h('div', null, h('div', { class: 'lbl' }, 'Ukuran huruf ', fv), font),
      h('div', null, h('div', { class: 'lbl' }, 'Tema'), radio('theme', [['auto', 'Ikuti perangkat'], ['light', 'Terang'], ['dark', 'Gelap']], p.theme, v => set('theme', v))),
      h('div', null, h('div', { class: 'lbl' }, 'Kontras'), radio('contrast', [['normal', 'Normal'], ['high', 'Tinggi']], p.contrast, v => set('contrast', v))),
      h('div', null, h('div', { class: 'lbl' }, 'Jarak baris'), radio('spacing', [['normal', 'Normal'], ['relaxed', 'Lega']], p.spacing, v => set('spacing', v))),
      h('div', null, h('div', { class: 'lbl' }, 'Animasi'), radio('motion', [['normal', 'Normal'], ['reduce', 'Kurangi']], p.motion, v => set('motion', v)))));
    if (!RCA.state.token) return;
    const o = h('input', { type: 'password', inputmode: 'numeric', maxlength: 6, class: 'pinbox' }), n1 = h('input', { type: 'password', inputmode: 'numeric', maxlength: 6, class: 'pinbox' }), n2 = h('input', { type: 'password', inputmode: 'numeric', maxlength: 6, class: 'pinbox' });
    main.appendChild(h('div', { class: 'card stack', style: { maxWidth: '760px', marginTop: '16px' } }, h('h2', null, 'Ganti PIN'),
      h('div', { class: 'fgrid' }, h('div', null, h('label', { class: 'lbl' }, 'PIN lama'), o), h('div', null, h('label', { class: 'lbl' }, 'PIN baru'), n1), h('div', null, h('label', { class: 'lbl' }, 'Ulangi PIN baru'), n2)),
      h('div', null, h('button', { class: 'btn primary', onclick: async () => { if (n1.value !== n2.value) return RCA.toast('PIN baru tidak sama', 'err'); try { await RCA.api('users.changePin', { old: o.value, pin: n1.value }); RCA.toast('PIN diganti', 'ok'); o.value = n1.value = n2.value = ''; } catch (e) { RCA.toast(e.message, 'err'); } } }, 'Ganti PIN'))));
    const drafts = await RCA.idb.all('drafts'), dirty = drafts.filter(d => d.val && d.val.dirty);
    main.appendChild(h('div', { class: 'card stack', style: { maxWidth: '760px', marginTop: '16px' } }, h('h2', null, 'Data di perangkat ini'),
      h('p', null, drafts.length + ' draf tersimpan, ' + dirty.length + ' belum tersinkron.'),
      h('div', { class: 'row' }, h('button', { class: 'btn', onclick: () => syncAllDrafts().then(() => RCA.toast('Sinkron selesai', 'ok')) }, 'Sinkronkan sekarang'),
        h('button', { class: 'btn danger', onclick: async () => {
          if (dirty.length && !await RCA.confirm('Ada isian belum tersinkron', dirty.length + ' isian belum terkirim ke server dan akan hilang. Tetap hapus?', 'Hapus semua', 'danger')) return;
          if (!dirty.length && !await RCA.confirm('Hapus data lokal', 'Hapus draf, cache, dan foto yang tersimpan di perangkat ini?', 'Hapus', 'danger')) return;
          await RCA.idb.clear('drafts'); await RCA.idb.clear('cache'); await RCA.idb.clear('photos'); RCA.toast('Data lokal dihapus', 'ok'); prefsPage();
        } }, 'Hapus data lokal'))));
  }

  /* ================================================================ panduan */
  function help() {
    main.innerHTML = '';
    const sec = (t, ...c) => h('section', { class: 'card stack', style: { marginBottom: '14px', maxWidth: '900px' } }, h('h2', null, t), ...c);
    main.appendChild(h('div', { class: 'page-head' }, h('div', { class: 'grow' }, h('h1', null, 'Panduan singkat'), h('p', null, 'Ringkasan aturan pengisian. Acuan lengkap: Protokol V13, Panduan Acuan Klinis dan Aturan Pengisian, serta Peta Kerja Lapangan.'))));
    main.appendChild(sec('Alur kerja',
      h('ol', null, h('li', null, 'Koordinator: C1 per kab/kota (unggah templat atau isi langsung), lalu C2: unggah kerangka C2a per fasyankes, jalankan undian, pilih purposif dengan alasan, siapkan calon C6, daftar sistem sentinel C5, dan sesi C7.'),
        h('li', null, 'Kirim daftar kode unit terpilih ke fasyankes (C2 › Lembar penghubung) sekurang-kurangnya 3 hari kerja sebelum kunjungan.'),
        h('li', null, 'Enumerator membuka unit, mencocokkan dengan register/rekam medis, mengisi, lalu menekan Kirim ke database.'),
        h('li', null, 'Koordinator memeriksa di Dashboard Progress: Kembalikan dengan catatan, atau Tandai Valid. Data Valid masuk Dashboard Analisis.'))));
    main.appendChild(sec('Status bukti (St)', h('dl', { class: 'kv' },
      h('dt', null, 'Y'), h('dd', null, 'Tercatat atau ada bukti dilakukan.'), h('dt', null, 'TL'), h('dd', null, 'Ada bukti tidak dilakukan, ditolak, atau ditunda (tulis alasan).'),
      h('dt', null, 'TC'), h('dd', null, 'Tidak ditemukan keterangan pada sumber relevan yang sudah diperiksa.'), h('dt', null, 'TBL'), h('dd', null, 'Tidak berlaku.'),
      h('dt', null, 'BD'), h('dd', null, 'Belum dapat dinilai: sumber belum diakses, bukti bertentangan, atau pengamatan belum cukup. Bila dokumen ada di fasilitas lain dan belum diakses, gunakan BD, bukan TL.')),
      h('p', null, 'Kode sumber: W keterangan petugas; RM rekam medis; TB; HIV; LAB; FAR; TPT; RUJ; KOM; SITB; SIHA; LAIN. Beri nomor bila lebih dari satu (RM1, RM2) dan daftarkan di bagian Sumber. Jangan memakai tanggal entri sistem sebagai tanggal kejadian.')));
    main.appendChild(sec('Kunci unit dan kerja bersama',
      h('p', null, 'Saat Anda membuka unit, unit dikunci untuk Anda dan nama Anda tampil di papan register. Kunci lepas otomatis setelah ' + RCA.state.lockMin + ' menit tanpa aktivitas; peringatan muncul 1 menit sebelumnya. Bila koneksi kembali dan belum ada yang mengambil unit, kunci kembali kepada Anda. Bila sudah diambil orang lain, isian Anda disimpan sebagai versi cadangan untuk diputuskan koordinator.')));
    main.appendChild(sec('Bekerja saat sinyal lemah',
      h('p', null, 'Setiap perubahan langsung tersimpan di perangkat (penyimpanan browser) dan disinkronkan ke server setiap ±25 detik. Saat offline muncul pita kuning; lanjutkan mengisi, jangan menghapus data browser atau berganti perangkat. Tombol Kirim final memerlukan koneksi.')));
    main.appendChild(sec('Kode anonim dan pencocokan dengan NIK/no. RM',
      h('p', null, 'Aplikasi hanya memakai kode. Berkas penghubung (C2a-P untuk pasien, C7-P untuk peserta) disimpan petugas berwenang di fasyankes/tim kualitatif. Setiap unit C3 menampilkan kode pasien, kode lokal, tanggal kunci, jenis kelamin, dan umur untuk membantu memastikan berkas yang benar. Kasus yang sama di C3, C5, dan C6 memakai kode penghubung yang sama dan tidak dihitung sebagai pasien berbeda.')));
    main.appendChild(sec('Foto pendukung',
      h('p', null, 'Opsional. Foto dikompres otomatis. Sebelum mengunggah, tutup (blur) nama, NIK, nomor RM, alamat, nomor telepon, dan wajah, atau potong bagian yang diperlukan saja. Konfirmasi wajib dicentang. Foto disimpan di folder Drive privat dan hanya terlihat oleh pengguna yang masuk.')));
  }

  /* ================================================================ C1: templat unggah/unduh */
  RCA.c1io = {
    open: async function () {
      const sch = S.forms.C1.sub[0];
      const inp = h('input', { type: 'file', accept: '.xlsx', hidden: true });
      inp.addEventListener('change', async () => { const f = inp.files[0]; inp.value = ''; if (f) await RCA.c1io.import(f); });
      document.body.appendChild(inp);
      const r = await RCA.modal('Templat C1', h('div', null, h('p', null, 'Unduh templat Excel C1 (satu baris per kab/kota di lembar Profil, dan satu lembar per tabel). Isi lalu unggah kembali; isian menimpa bagian yang sama pada profil kab/kota yang belum Valid.'),
        h('p', { class: 'muted' }, 'Baris 1 = kunci kolom (jangan diubah), baris 2 = keterangan, data mulai baris 3. Kolom kode_kk wajib (DLS, MDN, JTI, JPS, IDM, BGR, SDA, SBY, BLL, BDG, KJP, KBJ).')),
        [{ label: 'Tutup', value: null }, { label: 'Unggah templat terisi', value: 'up' }, { label: 'Unduh templat', cls: 'primary', value: 'down' }]);
      if (r === 'down') RCA.c1io.template(sch);
      if (r === 'up') inp.click();
    },
    template: function (sch) {
      if (!RCA.needXLSX()) return;
      const wb = XLSX.utils.book_new();
      const prof = sch.sections.filter(s => s.type === 'fields').flatMap(s => s.fields).filter(f => f.t !== 'auto' && f.pre !== 'province_name');
      const rows = [['kode_kk'].concat(prof.map(f => f.k)), ['Kode kab/kota'].concat(prof.map(f => f.l + (f.o ? ' [' + f.o.join(' / ') + ']' : '')))].concat(RCA.state.regions.kk.map(k => [k.code]));
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(rows), 'Profil');
      sch.sections.filter(s => s.type === 'table').forEach(s => XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([['kode_kk'].concat(s.cols.map(c => c.k)), ['Kode kab/kota'].concat(s.cols.map(c => c.l + (c.o ? ' [' + c.o.join(' / ') + ']' : '')))]), s.k.slice(0, 31)));
      XLSX.writeFile(wb, 'Templat_C1_Profil_Pendalaman.xlsx');
    },
    import: async function (file) {
      if (!RCA.needXLSX()) return;
      const sch = S.forms.C1.sub[0];
      const wb = XLSX.read(await file.arrayBuffer(), { cellDates: true });
      const byKK = {};
      const norm = v => v instanceof Date ? new Date(v.getTime() - v.getTimezoneOffset() * 60000).toISOString().slice(0, 10) : (v === undefined ? '' : String(v).trim());
      const read = name => { const ws = wb.Sheets[name]; if (!ws) return []; const a = XLSX.utils.sheet_to_json(ws, { header: 1, raw: true, defval: '' }); const keys = (a[0] || []).map(String); return a.slice(2).filter(r => r.some(v => v !== '')).map(r => { const o = {}; keys.forEach((k, i) => { const v = norm(r[i]); if (v !== '') o[k] = v; }); return o; }); };
      read('Profil').forEach(r => { if (!r.kode_kk) return; const kk = r.kode_kk.toUpperCase(); delete r.kode_kk; if (Object.keys(r).length) byKK[kk] = Object.assign(byKK[kk] || {}, r); });
      sch.sections.filter(s => s.type === 'table').forEach(s => read(s.k.slice(0, 31)).forEach(r => { if (!r.kode_kk) return; const kk = r.kode_kk.toUpperCase(); delete r.kode_kk; byKK[kk] = byKK[kk] || {}; (byKK[kk][s.k] = byKK[kk][s.k] || []).push(r); }));
      if (!Object.keys(byKK).length) return RCA.toast('Tidak ada data yang terbaca dari templat', 'err');
      if (!await RCA.confirm('Impor C1', 'Perbarui profil untuk: ' + Object.keys(byKK).join(', ') + '? Tabel yang ada di templat menggantikan tabel yang sama di aplikasi.', 'Impor')) return;
      try { const res = await RCA.api('c1.import', { byKK }); RCA.modal('Hasil impor C1', h('ul', null, res.map(x => h('li', null, x)))); RCA.dash.formList(main, 'C1'); } catch (e) { RCA.toast(e.message, 'err'); }
    }
  };

  /* ================================================================ start */
  async function start() {
    main.innerHTML = ''; main.appendChild(h('div', { class: 'boot' }, 'Menyiapkan data…'));
    try { await bootstrap(); }
    catch (e) { if (e.code === 'AUTH') return; main.innerHTML = ''; main.appendChild(h('div', { class: 'notice err' }, e.message)); return; }
    RCA.$('#menuBtn').hidden = false; RCA.$('#notifBtn').hidden = false;
    renderNav(); updateBadge(); RCA.renderSyncPill();
    if (RCA.state.online) syncAllDrafts();
    route();
  }

  if ('serviceWorker' in navigator && location.protocol === 'https:') navigator.serviceWorker.register('sw.js').catch(() => {});
  loadSession();
  if (RCA.state.token) start(); else if (location.hash === '#/prefs') prefsPage(); else showAuth();
})();
