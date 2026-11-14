/* app.js — router, beranda (menu kotak), login, pengisian survei, antrean offline, halaman publik */
const ALL = ['superadmin', 'koordinator', 'datamanager', 'enumerator'];
const ADM = ['superadmin', 'koordinator'];
const ANL = ['superadmin', 'koordinator', 'datamanager'];

const TILES = [
  { id: 'isi', label: 'Isi Survei', ico: 'clip', c: 'c1', href: '#/isi', roles: ALL },
  { id: 'antrean', label: 'Antrean Offline', ico: 'sync', c: 'c8', href: '#/antrean', roles: ALL, badge: true },
  { id: 'kiosk', label: 'Mode Kiosk', ico: 'tablet', c: 'c5', href: '#/kiosk-setup', roles: ALL },
  { id: 'dash', label: 'Dashboard', ico: 'pie', c: 'c2', href: '#/dashboard', roles: ANL },
  { id: 'lap', label: 'Laporan SKM', ico: 'doc', c: 'c3', href: '#/laporan', roles: ANL },
  { id: 'data', label: 'Data Respons', ico: 'table', c: 'c6', href: '#/data', roles: ANL },
  { id: 'impor', label: 'Impor Data', ico: 'upl', c: 'c7', href: '#/impor', roles: ANL },
  { id: 'forms', label: 'Form Builder', ico: 'build', c: 'c4', href: '#/forms', roles: ADM },
  { id: 'std', label: 'Instrumen Standar', ico: 'star', c: 'c7', href: '#/forms/new?tpl=standar', roles: ADM },
  { id: 'share', label: 'QR & Tautan', ico: 'qr', c: 'c9', href: '#/bagikan', roles: ADM },
  { id: 'embed', label: 'Embed Dashboard', ico: 'code', c: 'c2', href: '#/embed', roles: ADM },
  { id: 'periode', label: 'Periode Survei', ico: 'cal', c: 'c10', href: '#/periode', roles: ADM },
  { id: 'faskes', label: 'Faskes & Unit', ico: 'hosp', c: 'c6', href: '#/faskes', roles: ADM },
  { id: 'users', label: 'Pengguna', ico: 'users', c: 'c5', href: '#/pengguna', roles: ['superadmin'] },
  { id: 'set', label: 'Pengaturan', ico: 'gear', c: 'c9', href: '#/pengaturan', roles: ['superadmin'] },
  { id: 'help', label: 'Bantuan', ico: 'help', c: 'c8', href: '#/bantuan', roles: ALL }
];

const App = {
  base: location.origin + location.pathname.replace(/index\.html$/, ''),
  pubSettings: null,

  async start() {
    if ('serviceWorker' in navigator && location.protocol.startsWith('http')) navigator.serviceWorker.register('sw.js').catch(() => { });
    if (DEMO) { const b = document.createElement('div'); b.className = 'demo-bar'; b.textContent = 'MODE DEMO — data contoh tersimpan di browser ini. Isi API_URL di js/config.js untuk memakai Google Sheets.'; document.body.prepend(b); }
    UI.netbar();
    window.addEventListener('hashchange', () => this.route());
    try { this.pubSettings = await API.call('publicSettings'); Theme.apply(this.pubSettings); await Store.put('cache', this.pubSettings, 'pubSettings'); }
    catch (e) { this.pubSettings = (await Store.get('cache', 'pubSettings')) || {}; }
    this.route();
    Sync.badge(); Sync.push();
  },

  back() { if (history.length > 1) history.back(); else location.hash = '#/'; },

  parse() {
    const h = location.hash.replace(/^#\/?/, '');
    const [path, qs] = h.split('?');
    const parts = path.split('/').filter(Boolean);
    const q = Object.fromEntries(new URLSearchParams(qs || ''));
    return { parts, q };
  },

  async route() {
    Dash.destroy();
    document.body.classList.remove('kiosk', 'respond');
    const { parts, q } = this.parse();
    const r = parts[0] || '';
    const pub = { f: 1, kiosk: 1, pd: 1, login: 1 };
    if (!Session.user && !pub[r]) { return Views.landing(); }
    const map = {
      '': Views.home, login: Views.login, isi: Views.isi, f: Views.respond, kiosk: Views.kiosk, 'kiosk-setup': Views.kioskSetup,
      antrean: Views.antrean, profil: Views.profil, pd: Views.publicDash, bantuan: Views.bantuan,
      forms: Admin.forms, data: Admin.data, dashboard: Admin.dashboard, laporan: Admin.laporan, periode: Admin.periode,
      faskes: Admin.faskes, pengguna: Admin.pengguna, bagikan: Admin.bagikan, embed: Admin.embed, pengaturan: Admin.pengaturan, impor: Importer.view
    };
    const tile = TILES.find(t => t.href.replace('#/', '').split(/[/?]/)[0] === r);
    if (tile && Session.user && !tile.roles.includes(Session.role())) { UI.toast('Menu ini tidak tersedia untuk peran Anda', 'bad'); location.hash = '#/'; return; }
    const fn = map[r];
    if (!fn) { location.hash = '#/'; return; }
    window.scrollTo(0, 0);
    try { await fn.call(Views, parts, q); }
    catch (e) { console.error(e); this.view(UI.topbar('Terjadi kesalahan') + `<div class="wrap mt"><div class="card">${UI.empty(e.message, 'x')}<button class="btn block" onclick="App.route()">Coba lagi</button></div></div>`); }
  },

  view(html, nav = true) {
    $('#app').innerHTML = html + (nav && Session.user ? this.bnav() : '');
    Sync.badge();
  },

  bnav() {
    const r = this.parse().parts[0] || '';
    const dashHref = Session.is(...ANL) ? '#/dashboard' : '#/bantuan';
    const it = (href, ico, lbl, key) => `<a href="${href}" class="${r === key ? 'on' : ''}">${I(ico)}<span>${lbl}</span></a>`;
    return `<nav class="bnav">${it('#/', 'home', 'Beranda', '')}${Session.is(...ANL) ? it(dashHref, 'pie', 'Dashboard', 'dashboard') : it(dashHref, 'help', 'Bantuan', 'bantuan')}
      <a href="#/isi" class="fab"><span class="fab-in">${I('plus')}</span><span>Survei</span></a>
      <a href="#/antrean" class="${r === 'antrean' ? 'on' : ''}">${I('sync')}<span>Sinkron</span><span class="badge hidden" data-qbadge></span></a>
      ${it('#/profil', 'user', 'Profil', 'profil')}</nav>`;
  }
};

const Views = {
  /* ---------- Halaman depan (belum login) ---------- */
  async landing() {
    const s = App.pubSettings || {};
    App.view(`<div class="landing-hero"><div class="wrap">${UI.logo(s)}<h1>${esc(s.app_nama || 'SKM Sehat')}</h1><p>Survei Kepuasan Masyarakat Layanan Kesehatan<br>${esc(s.instansi || '')}</p></div></div>
      <div class="wrap narrow"><div class="landing-cards">
        <button class="lc" id="l-isi"><div class="t-ico c1">${I('clip')}</div><div><h3>Isi Survei</h3><p>Berikan penilaian atas layanan yang Anda terima</p></div></button>
        <button class="lc" onclick="location.hash='#/login'"><div class="t-ico c2">${I('lock')}</div><div><h3>Masuk Petugas</h3><p>Admin, koordinator, data manager & enumerator</p></div></button>
        <button class="lc" id="l-dash"><div class="t-ico c3">${I('pie')}</div><div><h3>Hasil Survei</h3><p>Lihat Indeks Kepuasan Masyarakat terbaru</p></div></button>
      </div>
      <p class="center small muted mt2">Data responden dilindungi sesuai UU No. 27 Tahun 2022 tentang Pelindungan Data Pribadi.</p></div>`, false);
    const pick = async (kind) => {
      let list = [];
      try { list = await API.call('publicForms'); } catch (e) { UI.toast(e.message, 'bad'); return; }
      list = list.filter(f => f[kind]);
      if (!list.length) { UI.toast(kind === 'responden' ? 'Belum ada survei yang dibuka' : 'Belum ada dashboard publik'); return; }
      if (list.length === 1) { location.hash = (kind === 'responden' ? '#/f/' : '#/pd/') + list[0].id; return; }
      const sh = UI.sheet(`<div class="list">${list.map(f => `<div class="li" data-id="${f.id}"><div class="li-ico c1">${I(kind === 'responden' ? 'clip' : 'pie')}</div><div class="grow li-t">${esc(f.judul)}</div>${I('chev', 'chev')}</div>`).join('')}</div>`, { title: 'Pilih survei' });
      $$('[data-id]', sh).forEach(x => x.onclick = () => { sh.remove(); location.hash = (kind === 'responden' ? '#/f/' : '#/pd/') + x.dataset.id; });
    };
    $('#l-isi').onclick = () => pick('responden');
    $('#l-dash').onclick = () => pick('dashboard');
  },

  /* ---------- Login ---------- */
  async login() {
    if (Session.user) { location.hash = '#/'; return; }
    const s = App.pubSettings || {};
    App.view(`<div class="landing-hero" style="padding-bottom:70px"><div class="wrap">${UI.logo(s)}<h1>Masuk Petugas</h1><p>${esc(s.app_nama || 'SKM Sehat')}</p></div></div>
      <div class="wrap narrow"><div class="card" style="margin-top:-46px">
        ${DEMO ? `<p class="muted small" style="margin-top:0">Mode demo: pilih peran untuk mencoba.</p><div class="list" id="demo-users">${UI.loader()}</div>` :
        `<p class="muted" style="margin-top:0">Gunakan akun Google yang telah didaftarkan oleh Super Admin.</p><div class="gsi-box" id="gsi">${UI.loader('Memuat Google Sign-In…')}</div><div class="err hidden" id="l-err"></div>`}
        <button class="btn line block mt" onclick="location.hash='#/'">${I('back')} Kembali</button></div></div>`, false);
    const done = (r) => { Session.set(r.token, r.user); Master.loaded = false; UI.toast('Selamat datang, ' + (r.user.nama || r.user.email), 'ok'); location.hash = '#/'; };
    if (DEMO) {
      const users = await API.call('demoUsers');
      $('#demo-users').innerHTML = users.map(u => `<div class="li" data-e="${u.email}"><div class="li-ico c1">${I('user')}</div><div class="grow"><div class="li-t">${esc(Core.ROLES[u.role])}</div><div class="li-s">${esc(u.email)}</div></div>${I('chev', 'chev')}</div>`).join('');
      $$('[data-e]').forEach(x => x.onclick = async () => done(await API.call('login', { demoEmail: x.dataset.e })));
      return;
    }
    try {
      await Lib.load('https://accounts.google.com/gsi/client');
      google.accounts.id.initialize({
        client_id: window.CONFIG.GOOGLE_CLIENT_ID,
        callback: async (resp) => {
          const err = $('#l-err');
          try { done(await API.call('login', { idToken: resp.credential })); }
          catch (e) { err.textContent = e.message; err.classList.remove('hidden'); }
        }
      });
      $('#gsi').innerHTML = '';
      google.accounts.id.renderButton($('#gsi'), { theme: 'filled_blue', size: 'large', shape: 'pill', text: 'signin_with', locale: 'id', width: 280 });
    } catch (e) { $('#gsi').innerHTML = `<p class="err">${esc(e.message)}</p>`; }
  },

  /* ---------- Beranda (super-app) ---------- */
  async home() {
    const u = Session.user;
    App.view(`<div class="hero"><div class="wrap"><div class="hero-top">${UI.logo(App.pubSettings)}<div class="grow"><div class="hello">Halo, selamat bertugas 👋</div><div class="name">${esc(u.nama || u.email)}</div></div>
      <a href="#/profil" class="avatar">${u.foto ? `<img src="${esc(u.foto)}">` : esc((u.nama || u.email)[0].toUpperCase())}</a></div></div></div>
      <div class="wrap"><div class="wallet" id="h-wallet">${UI.loader()}</div>
      <div class="sec-title"><h3>Menu</h3><span class="chip">${esc(Core.ROLES[u.role])}</span></div>
      <div class="tiles">${TILES.filter(t => t.roles.includes(u.role)).map(t => `<a class="tile" href="${t.href}"><div class="t-ico ${t.c}">${I(t.ico)}</div><div class="t-lbl">${t.label}</div>${t.badge ? '<span class="badge hidden" data-qbadge></span>' : ''}</a>`).join('')}</div>
      <div class="sec-title"><h3>Pintasan</h3></div>
      <div class="promo">
        <div class="p-card" style="background:linear-gradient(135deg,#0f766e,#14b8a6)" onclick="location.hash='#/isi'"><h4>Mulai survei</h4><p>Wawancarai responden, tetap bisa saat offline.</p>${I('clip', 'bgico')}</div>
        ${Session.is(...ANL) ? `<div class="p-card" style="background:linear-gradient(135deg,#1d4ed8,#38bdf8)" onclick="location.hash='#/laporan'"><h4>Laporan otomatis</h4><p>Bab I–V lengkap dengan kop & tanda tangan, ekspor PDF/Word/Excel.</p>${I('doc', 'bgico')}</div>` : ''}
        ${Session.is(...ADM) ? `<div class="p-card" style="background:linear-gradient(135deg,#be185d,#f472b6)" onclick="location.hash='#/bagikan'"><h4>Sebar QR code</h4><p>Cetak poster QR untuk ruang tunggu atau kirim via WhatsApp.</p>${I('qr', 'bgico')}</div>` : ''}
        <div class="p-card" style="background:linear-gradient(135deg,#6d28d9,#a78bfa)" onclick="location.hash='#/kiosk-setup'"><h4>Mode kiosk</h4><p>Tablet di ruang tunggu, kembali otomatis setelah selesai.</p>${I('tablet', 'bgico')}</div>
      </div><div style="height:12px"></div></div>`);
    try {
      const M = await Master.load();
      const aktif = M.forms.filter(f => f.status === 'aktif');
      const q = await Sync.badge();
      let ikmHtml = '';
      if (Session.is(...ANL) && aktif[0]) {
        try {
          const agg = await API.call('aggregate', { form_id: aktif[0].id, filter: {} });
          const r = Core.ikm(aktif[0], agg.all);
          ikmHtml = `<div class="w-full">${UI.mutu(r.mutu)}<div class="grow"><b>IKM ${fmt.n(r.konversi, 2)}</b> · ${esc(r.kinerja)}<div class="small muted">${esc(aktif[0].judul)} · ${fmt.n(agg.total)} responden</div></div><a href="#/dashboard?form=${aktif[0].id}" class="btn sm ghost">Detail</a></div>`;
        } catch (e) { }
      }
      $('#h-wallet').innerHTML = `<div class="w-item"><div class="w-val">${aktif.length}</div><div class="w-lbl">Survei aktif</div></div>
        <div class="w-item"><div class="w-val">${q}</div><div class="w-lbl">Antrean offline</div></div>
        <div class="w-item"><div class="w-val">${Master.myFaskes().length}</div><div class="w-lbl">Fasilitas</div></div>${ikmHtml}`;
    } catch (e) { $('#h-wallet').innerHTML = `<div class="w-full" style="grid-column:1/-1;border:0">${esc(e.message)}</div>`; }
  },

  /* ---------- Isi survei (enumerator) ---------- */
  async isi(parts, q) {
    const M = await Master.load();
    if (parts[1]) {
      const form = M.forms.find(f => f.id === parts[1]);
      if (!form) throw new Error('Form tidak tersedia di perangkat ini. Sinkronkan data master.');
      App.view('<div id="r"></div>', false);
      Renderer.mount($('#r'), {
        form, faskes: Master.faskesForForm(form), units: M.units.filter(u => !form.unit_ids || !form.unit_ids.length || form.unit_ids.includes(u.id)),
        faskes_id: q.fk, unit_id: q.u, mode: 'enumerator', settings: M.settings,
        onSubmit: async item => { await Sync.enqueue(item); },
        onDone: () => { location.hash = '#/'; }, onClose: () => App.back()
      });
      return;
    }
    const forms = M.forms.filter(f => f.status === 'aktif' && (Session.is('enumerator') ? (f.mode_input || []).includes('enumerator') : true));
    App.view(UI.topbar('Isi Survei', { right: `<button class="ibtn" id="i-ref" title="Perbarui">${I('sync')}</button>` }) + `<div class="wrap narrow mt">
      <div class="card" style="background:var(--pri-soft);box-shadow:none"><div class="row">${I('wifi0')}<div class="small">Form yang tampil sudah tersimpan di perangkat. Anda tetap bisa mengisi survei tanpa internet; data dikirim otomatis saat online.</div></div></div>
      <div class="list mt">${forms.length ? forms.map(f => `<a class="li" href="#/isi/${f.id}"><div class="li-ico c1">${I('clip')}</div><div class="grow"><div class="li-t">${esc(f.judul)}</div><div class="li-s">${f.pertanyaan.filter(x => !Core.NON_INPUT[x.tipe]).length} pertanyaan · ${esc((Master.period(f.periode_id) || {}).nama || 'tanpa periode')}</div></div>${I('chev', 'chev')}</a>`).join('') : UI.empty('Belum ada survei aktif untuk Anda.')}</div></div>`);
    $('#i-ref').onclick = async () => { await Master.load(true); UI.toast('Data master diperbarui', 'ok'); App.route(); };
  },

  /* ---------- Responden mandiri (link / QR / WA) ---------- */
  async respond(parts, q, kiosk) {
    document.body.classList.add(kiosk ? 'kiosk' : 'respond');
    App.view(UI.loader('Menyiapkan survei…'), false);
    const id = parts[1];
    let pf;
    try { pf = await API.call('publicForm', { form_id: id }); await Store.put('cache', pf, 'pf_' + id); }
    catch (e) { pf = await Store.get('cache', 'pf_' + id); if (!pf) throw e; }
    Theme.apply(pf.settings);
    App.view('<div id="r"></div>' + (kiosk ? `<button class="ibtn" id="k-fs" title="Layar penuh" style="position:fixed;right:10px;bottom:10px;background:#fff;box-shadow:var(--shadow);z-index:50">${I('expand')}</button>` : ''), false);
    const fs = $('#k-fs'); if (fs) fs.onclick = () => { if (!document.fullscreenElement) document.documentElement.requestFullscreen().catch(() => { }); else document.exitFullscreen(); };
    Renderer.mount($('#r'), {
      form: pf.form, faskes: pf.faskes, units: pf.units, faskes_id: q.fk, unit_id: q.u, mode: kiosk ? 'kiosk' : 'responden', settings: pf.settings, kiosk,
      onSubmit: async item => {
        item.client_uuid = crypto.randomUUID ? crypto.randomUUID() : Core.uid('c_');
        item.ts = new Date().toISOString();
        try {
          const r = await API.call('submit', { items: [item] });
          if (r.err && r.err[item.client_uuid]) throw new Error(r.err[item.client_uuid]);
        } catch (e) {
          if (/Validasi|tidak menerima|Fasilitas|wajib/.test(e.message)) throw e;
          await Store.put('queue', Object.assign(item, { status_kirim: 'menunggu' })); // offline: simpan, kirim nanti
        }
      }
    });
  },
  kiosk(parts, q) { return Views.respond(parts, q, true); },

  async kioskSetup() {
    const M = await Master.load();
    const forms = M.forms.filter(f => f.status === 'aktif' && (f.mode_input || []).includes('kiosk'));
    App.view(UI.topbar('Mode Kiosk') + `<div class="wrap narrow mt"><div class="card">
      <p class="muted" style="margin-top:0">Pasang tablet di ruang tunggu. Setelah responden selesai, layar kembali ke awal otomatis. Kunci fasilitas/unit agar responden tidak perlu memilih.</p>
      ${forms.length ? `<div class="field"><label>Survei</label><select class="inp" id="k-f">${UI.opts(forms, '', 'id', 'judul')}</select></div>
      <div class="field"><label>Kunci fasilitas</label><select class="inp" id="k-fk">${UI.opts(Master.myFaskes(), '', 'id', 'nama', '— Responden memilih sendiri —')}</select></div>
      <div class="field"><label>Kunci unit layanan</label><select class="inp" id="k-u" disabled><option value="">— Responden memilih sendiri —</option></select></div>
      <button class="btn lg block" id="k-go">${I('tablet')} Buka mode kiosk</button>
      <p class="help">Tip: gunakan fitur "Tambahkan ke layar utama" dan aktifkan pin layar (Android) agar tablet tetap di aplikasi.</p>` : UI.empty('Belum ada survei aktif yang mengizinkan mode kiosk. Aktifkan di Form Builder > Pengaturan.')}</div></div>`);
    if (!forms.length) return;
    $('#k-fk').onchange = () => { const u = Master.unitsOf($('#k-fk').value); $('#k-u').innerHTML = UI.opts(u, '', 'id', 'nama', '— Responden memilih sendiri —'); $('#k-u').disabled = !u.length; };
    $('#k-go').onclick = () => { const p = new URLSearchParams(); if ($('#k-fk').value) p.set('fk', $('#k-fk').value); if ($('#k-u').value) p.set('u', $('#k-u').value); location.hash = '#/kiosk/' + $('#k-f').value + (p.toString() ? '?' + p : ''); };
  },

  /* ---------- Antrean offline ---------- */
  async antrean() {
    const items = await Sync.pending();
    const M = Master.loaded ? Master.data : await Master.load().catch(() => Master.data);
    App.view(UI.topbar('Antrean Offline') + `<div class="wrap narrow mt">
      <div class="card"><div class="row"><div class="grow"><div class="k-lbl small muted">Belum terkirim</div><div style="font-size:28px;font-weight:800">${items.length}</div></div>
        <button class="btn" id="a-push" ${items.length ? '' : 'disabled'}>${I('sync')} Kirim sekarang</button></div>
        <div class="help">Status: ${DEMO ? 'mode demo' : navigator.onLine ? '🟢 online' : '🔴 offline'} · Data tersimpan aman di perangkat sampai berhasil dikirim.</div></div>
      <div class="list mt">${items.length ? items.sort((a, b) => a.ts < b.ts ? 1 : -1).map(it => `<div class="li"><div class="li-ico ${it.status_kirim === 'gagal' ? 'c10' : 'c3'}">${I(it.status_kirim === 'gagal' ? 'x' : 'clip')}</div>
        <div class="grow"><div class="li-t">${esc((Master.form(it.form_id) || {}).judul || it.form_id)}</div><div class="li-s">${esc(Master.faskesName(it.faskes_id))}${it.unit_id ? ' · ' + esc(Master.unitName(it.unit_id)) : ''} · ${fmt.dt(it.ts)}</div>
        ${it.error ? `<div class="err">${esc(it.error)}</div>` : ''}</div><button class="ibtn" data-del="${it.client_uuid}">${I('trash')}</button></div>`).join('') : UI.empty('Semua data sudah terkirim 🎉', 'check')}</div>
      ${items.length ? `<button class="btn line block mt" id="a-bak">${I('dl')} Unduh cadangan (JSON)</button>` : ''}</div>`);
    const p = $('#a-push'); if (p) p.onclick = async () => { p.disabled = true; await Sync.push(true); Views.antrean(); };
    const b = $('#a-bak'); if (b) b.onclick = () => UI.download('antrean-skm-' + fmt.today() + '.json', new Blob([JSON.stringify(items, null, 2)], { type: 'application/json' }));
    $$('[data-del]').forEach(x => x.onclick = async () => { if (await UI.confirm('Hapus data ini dari antrean? Data yang dihapus tidak bisa dikembalikan.', 'Hapus', true)) { await Store.del('queue', x.dataset.del); Views.antrean(); } });
  },

  /* ---------- Profil ---------- */
  async profil() {
    const u = Session.user;
    App.view(UI.topbar('Profil', { noBack: true }) + `<div class="wrap narrow mt">
      <div class="card center"><div class="avatar" style="width:72px;height:72px;margin:0 auto;background:var(--pri-soft);color:var(--pri);font-size:28px">${u.foto ? `<img src="${esc(u.foto)}">` : esc((u.nama || u.email)[0].toUpperCase())}</div>
        <h3 style="margin-top:10px">${esc(u.nama || '')}</h3><div class="muted">${esc(u.email)}</div><div class="mt"><span class="chip">${esc(Core.ROLES[u.role])}</span></div></div>
      <div class="list mt">
        <div class="li" id="p-sync"><div class="li-ico c8">${I('sync')}</div><div class="grow"><div class="li-t">Perbarui data master</div><div class="li-s">Form, fasilitas & unit untuk mode offline</div></div></div>
        <a class="li" href="#/antrean"><div class="li-ico c3">${I('clip')}</div><div class="grow li-t">Antrean offline</div><span class="badge hidden" data-qbadge></span></a>
        <a class="li" href="#/bantuan"><div class="li-ico c2">${I('help')}</div><div class="grow li-t">Bantuan</div></a>
        <div class="li" id="p-out"><div class="li-ico c10">${I('out')}</div><div class="grow li-t" style="color:var(--bad)">Keluar</div></div>
      </div><p class="center small muted mt">Versi ${esc(window.CONFIG.APP_VERSION)}${DEMO ? ' · demo' : ''}</p></div>`);
    $('#p-sync').onclick = async () => { await Master.load(true); UI.toast('Data master diperbarui', 'ok'); };
    $('#p-out').onclick = async () => {
      const n = await Store.count('queue');
      if (n && !(await UI.confirm(n + ' data belum terkirim. Data tetap tersimpan di perangkat ini. Tetap keluar?', 'Keluar'))) return;
      Session.clear(); Master.loaded = false; location.hash = '#/';
    };
  },

  /* ---------- Dashboard publik ---------- */
  async publicDash(parts, q) {
    App.view(UI.loader(), false);
    const id = parts[1];
    const st = { faskes_id: q.fk || '', dari: q.dari || '', sampai: q.sampai || '' };
    const d = await API.call('publicDashboard', { form_id: id, filter: st });
    Theme.apply(d.settings);
    const draw = async () => {
      const data = await API.call('publicDashboard', { form_id: id, filter: st });
      await Dash.render($('#pd-body'), { form: data.form, agg: data.agg, faskes: data.faskes, units: data.units, publik: true });
    };
    App.view(`<div class="hero" style="padding-bottom:28px"><div class="wrap"><div class="hero-top">${UI.logo(d.settings)}<div class="grow"><div class="hello">${esc(d.settings.instansi || '')}</div><div class="name">Hasil ${esc(d.form.judul)}</div></div>
      ${Session.user ? `<button class="ibtn" style="color:#fff" onclick="App.back()">${I('x')}</button>` : `<a class="ibtn" style="color:#fff" href="#/">${I('home')}</a>`}</div></div></div>
      <div class="wrap mt"><div class="filters"><select class="inp" id="pd-fk">${UI.opts(d.faskes.filter(f => d.agg.faskes[f.id]), st.faskes_id, 'id', 'nama', 'Semua fasilitas')}</select>
      <input type="date" class="inp" id="pd-dari" value="${st.dari}"><input type="date" class="inp" id="pd-sampai" value="${st.sampai}"></div>
      <div id="pd-body" class="mt"></div><p class="center small muted mt2">Diperbarui ${fmt.dt(new Date())} · ${esc(d.settings.app_nama || '')}</p></div>`, false);
    ['pd-fk', 'pd-dari', 'pd-sampai'].forEach(k => $('#' + k).onchange = () => { st.faskes_id = $('#pd-fk').value; st.dari = $('#pd-dari').value; st.sampai = $('#pd-sampai').value; draw(); });
    await Dash.render($('#pd-body'), { form: d.form, agg: d.agg, faskes: d.faskes, units: d.units, publik: true });
  },

  bantuan() {
    const step = (n, t, d) => `<div class="li" style="cursor:default;align-items:flex-start"><div class="li-ico c1" style="font-weight:800">${n}</div><div class="grow"><div class="li-t">${t}</div><div class="li-s">${d}</div></div></div>`;
    App.view(UI.topbar('Bantuan') + `<div class="wrap narrow mt">
      <div class="sec-title"><h3>Alur kerja</h3></div><div class="list">
        ${step(1, 'Siapkan data master', 'Super Admin/Koordinator mengisi Faskes & Unit, Periode Survei, dan mendaftarkan Pengguna (email Google + peran).')}
        ${step(2, 'Buat instrumen', 'Form Builder > Instrumen Standar (9 unsur PermenPAN-RB 14/2017) atau Instrumen Baru. Atur cakupan fasilitas, mode pengisian, lalu ubah status ke Aktif.')}
        ${step(3, 'Kumpulkan data', 'Enumerator: menu Isi Survei (bisa offline). Responden: sebar QR/tautan/WhatsApp. Kiosk: tablet di ruang tunggu.')}
        ${step(4, 'Sinkronkan', 'Data offline tersimpan di antrean dan terkirim otomatis saat online. Cek menu Sinkron.')}
        ${step('4b', 'Migrasi data lama', 'Menu Impor Data: unggah Excel/CSV dari Google Form, Kobo, Clappia, atau rekap manual. Kolom & jawaban dicocokkan otomatis, lalu data langsung masuk ke dashboard dan laporan.')}
        ${step(5, 'Validasi data', 'Data Manager memeriksa Data Respons: tandai Valid/Ditolak, perbaiki atau hapus data ganda.')}
        ${step(6, 'Analisis & laporan', 'Dashboard menampilkan IKM per unsur, fasilitas, dan unit. Menu Laporan menghasilkan dokumen Bab I–V siap tanda tangan (PDF/Word/Excel).')}
        ${step(7, 'Publikasikan', 'Aktifkan Dashboard Publik di pengaturan form, lalu salin kode embed untuk website resmi.')}
      </div>
      <div class="sec-title"><h3>Rumus IKM</h3></div><div class="card small">
        <p style="margin-top:0">NRR unsur = jumlah nilai ÷ jumlah responden yang menjawab.<br>NRR tertimbang = NRR × bobot (1/jumlah unsur; 9 unsur = 0,111).<br>IKM = Σ NRR tertimbang. Nilai konversi = IKM × 25.</p>
        <table class="tbl"><tr><th>Konversi</th><th>Mutu</th><th>Kinerja</th></tr><tr><td>88,31–100</td><td>A</td><td>Sangat Baik</td></tr><tr><td>76,61–88,30</td><td>B</td><td>Baik</td></tr><tr><td>65,00–76,60</td><td>C</td><td>Kurang Baik</td></tr><tr><td>25,00–64,99</td><td>D</td><td>Tidak Baik</td></tr></table></div>
      <div class="sec-title"><h3>Peran pengguna</h3></div><div class="card small">
        <p style="margin:0"><b>Super Admin</b> — semua menu, pengguna & pengaturan.<br><b>Project Koordinator</b> — form, periode, faskes, QR, embed, dashboard, laporan.<br><b>Data Manager</b> — validasi/edit data, dashboard, laporan, ekspor.<br><b>Enumerator</b> — isi survei (offline) untuk fasilitas yang ditugaskan.<br><b>Responden</b> — mengisi via tautan/QR/kiosk tanpa login.</p></div>
    </div>`);
  }
};

document.addEventListener('DOMContentLoaded', () => App.start());
