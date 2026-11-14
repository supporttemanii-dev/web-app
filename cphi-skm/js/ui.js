/* ui.js — ikon, helper DOM, toast, bottom sheet */
const I = (() => {
  const p = {
    home: '<path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
    clip: '<rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 4h6v3H9zM9 12h6M9 16h4"/>',
    chart: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
    pie: '<path d="M21 12A9 9 0 1 1 12 3v9z"/><path d="M15 3.5A9 9 0 0 1 20.5 9H15z"/>',
    sync: '<path d="M20 11a8 8 0 0 0-14.9-3M4 4v4h4M4 13a8 8 0 0 0 14.9 3M20 20v-4h-4"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
    users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0M16 4.5a3.5 3.5 0 0 1 0 7M18 14a6 6 0 0 1 3.5 6"/>',
    build: '<rect x="3" y="3" width="8" height="8" rx="2"/><rect x="13" y="3" width="8" height="8" rx="2"/><rect x="3" y="13" width="8" height="8" rx="2"/><path d="M17 13v8M13 17h8"/>',
    doc: '<path d="M14 3H6a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8z"/><path d="M14 3v5h5M8 13h8M8 17h6"/>',
    table: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 10h18M3 15h18M9 4v16"/>',
    cal: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
    hosp: '<path d="M4 21V7l8-4 8 4v14z"/><path d="M12 9v6M9 12h6M9 21v-3h6v3"/>',
    qr: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><path d="M14 14h3v3h-3zM20 14v1M14 20h1M17 17h4v4h-4z"/>',
    tablet: '<rect x="4" y="2" width="16" height="20" rx="3"/><path d="M11 18h2"/>',
    code: '<path d="m8 7-5 5 5 5M16 7l5 5-5 5M14 4l-4 16"/>',
    gear: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>',
    help: '<circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.6V14M12 17.5v.01"/>',
    star: '<path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1 6.2L12 17.3 6.5 20.2l1-6.2L3 9.6l6.2-.9z"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    back: '<path d="M15 5l-7 7 7 7"/>',
    chev: '<path d="m9 5 7 7-7 7"/>',
    x: '<path d="M6 6l12 12M18 6 6 18"/>',
    trash: '<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/>',
    edit: '<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="m13 7 4 4"/>',
    copy: '<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3"/>',
    up: '<path d="m6 15 6-6 6 6"/>',
    down: '<path d="m6 9 6 6 6-6"/>',
    eye: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
    out: '<path d="M15 4h4a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-4M10 17l5-5-5-5M15 12H3"/>',
    upl: '<path d="M12 16V4M7 9l5-5 5 5M4 20h16"/>',
    dl: '<path d="M12 4v11M7 10l5 5 5-5M4 20h16"/>',
    share: '<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.6 13.5 6.8 4M15.4 6.5l-6.8 4"/>',
    wa: '<path d="M4 20l1.3-4A8 8 0 1 1 8 18.7z"/><path d="M9 9c0 3 3 6 6 6l1-1.5-2-1-1 1c-1-.4-2-1.4-2.5-2.5l1-1-1-2z"/>',
    check: '<path d="m5 12 5 5L20 7"/>',
    globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/>',
    lock: '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
    wifi0: '<path d="M2 8.5a15 15 0 0 1 20 0M5 12a10 10 0 0 1 14 0M8.5 15.5a5 5 0 0 1 7 0M12 19h.01M3 3l18 18"/>',
    print: '<path d="M6 9V3h12v6M6 18H4a1 1 0 0 1-1-1v-6a1 1 0 0 1 1-1h16a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1h-2"/><rect x="6" y="14" width="12" height="7"/>',
    filter: '<path d="M3 5h18l-7 8v6l-4 2v-8z"/>',
    expand: '<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/>',
    heart: '<path d="M12 20s-7-4.4-9-9a5 5 0 0 1 9-3 5 5 0 0 1 9 3c-2 4.6-9 9-9 9z"/>'
  };
  return (n, cls) => `<svg class="${cls || ''}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">${p[n] || ''}</svg>`;
})();

const esc = s => String(s === undefined || s === null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const $ = (s, el) => (el || document).querySelector(s);
const $$ = (s, el) => Array.from((el || document).querySelectorAll(s));
const fmt = {
  n: (x, d = 0) => (x === undefined || x === null || isNaN(x)) ? '-' : Number(x).toLocaleString('id-ID', { minimumFractionDigits: d, maximumFractionDigits: d }),
  date: s => { if (!s) return '-'; const d = new Date(s); return isNaN(d) ? s : d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }); },
  dt: s => { if (!s) return '-'; const d = new Date(s); return isNaN(d) ? s : d.toLocaleString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }); },
  today: () => new Date().toISOString().slice(0, 10),
  pct: (a, b) => b ? fmt.n(a / b * 100, 1) + '%' : '0%'
};

const UI = {
  toast(msg, type) {
    $$('.toast').forEach(t => t.remove());
    const t = document.createElement('div');
    t.className = 'toast ' + (type || '');
    t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 3200);
  },
  loader(msg) { return `<div class="loader"><div class="spin"></div><div>${esc(msg || 'Memuat…')}</div></div>`; },
  empty(msg, ico) { return `<div class="empty">${I(ico || 'clip')}<p>${esc(msg)}</p></div>`; },
  sheet(html, opts = {}) {
    const o = document.createElement('div');
    o.className = 'overlay';
    o.innerHTML = `<div class="sheet" role="dialog"><div class="grab"></div>${opts.title ? `<h3>${esc(opts.title)}</h3>` : ''}<div class="sheet-body">${html}</div></div>`;
    const close = () => { o.remove(); if (opts.onClose) opts.onClose(); };
    o.addEventListener('click', e => { if (e.target === o) close(); });
    document.body.appendChild(o);
    o.close = close;
    return o;
  },
  confirm(msg, okText = 'Ya, lanjutkan', danger) {
    return new Promise(res => {
      const s = UI.sheet(`<p style="margin:0 0 16px">${esc(msg)}</p><div class="row"><button class="btn line grow" data-no>Batal</button><button class="btn grow ${danger ? 'danger' : ''}" data-ok>${esc(okText)}</button></div>`, { title: 'Konfirmasi', onClose: () => res(false) });
      $('[data-no]', s).onclick = () => { s.remove(); res(false); };
      $('[data-ok]', s).onclick = () => { s.remove(); res(true); };
    });
  },
  topbar(title, opts = {}) {
    return `<div class="topbar">${opts.noBack ? '' : `<button class="ibtn" onclick="App.back()" aria-label="Kembali">${I('back')}</button>`}<h1>${esc(title)}</h1>${opts.right || ''}</div>`;
  },
  netbar() {
    let b = $('#netbar');
    if (!navigator.onLine && !DEMO) {
      if (!b) { b = document.createElement('div'); b.id = 'netbar'; b.className = 'netbar'; document.body.prepend(b); }
      b.textContent = 'Offline — data survei disimpan di perangkat dan dikirim otomatis saat online';
    } else if (b) b.remove();
  },
  opts(list, val, valKey = 'id', lblKey = 'nama', empty) {
    return (empty !== undefined ? `<option value="">${esc(empty)}</option>` : '') + list.map(x => `<option value="${esc(x[valKey])}" ${String(x[valKey]) === String(val) ? 'selected' : ''}>${esc(x[lblKey])}</option>`).join('');
  },
  mutu(m) { return `<span class="mutu ${m && m !== '-' ? m : 'x'}">${esc(m || '-')}</span>`; },
  download(name, blob) {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = name;
    document.body.appendChild(a); a.click();
    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
  },
  async copy(text) {
    try { await navigator.clipboard.writeText(text); UI.toast('Disalin', 'ok'); }
    catch (e) { const t = document.createElement('textarea'); t.value = text; document.body.appendChild(t); t.select(); document.execCommand('copy'); t.remove(); UI.toast('Disalin', 'ok'); }
  },
  logo(s) { const src = (s && (s.logo_ikon || s.logo)) || 'icons/logo-icon.png'; return `<div class="brand-logo"><img src="${esc(src)}" alt="logo" onerror="this.src='icons/logo-icon.png'"></div>`; },
  /* Nama aplikasi: bagian setelah " by " ditampilkan sebagai subjudul */
  appName(s, tag = 'h1') { const n = (s && s.app_nama) || 'Survey Master by PUI-PT CPHI Universitas Udayana'; const i = n.indexOf(' by '); return i > 0 ? `<${tag}>${esc(n.slice(0, i))}</${tag}><div class="app-by">by ${esc(n.slice(i + 4))}</div>` : `<${tag}>${esc(n)}</${tag}>`; },
  appShort(s) { const n = (s && s.app_nama) || 'Survey Master'; const i = n.indexOf(' by '); return i > 0 ? n.slice(0, i) : n; },
  mitra(s, cls) { const src = (s && s.logo_mitra) || ''; return src ? `<div class="mitra ${cls || ''}"><img src="${esc(src)}" alt="Logo mitra" onerror="this.parentNode.remove()"></div>` : ''; }
};

/* Muat skrip pihak ketiga hanya saat dibutuhkan */
const Lib = {
  _p: {},
  load(src) {
    if (this._p[src]) return this._p[src];
    this._p[src] = new Promise((res, rej) => {
      const s = document.createElement('script'); s.src = src; s.onload = res; s.onerror = () => { delete this._p[src]; rej(new Error('Gagal memuat pustaka (cek koneksi)')); };
      document.head.appendChild(s);
    });
    return this._p[src];
  },
  chart: () => Lib.load('https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.js'),
  xlsx: () => Lib.load('https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js'),
  pdf: () => Lib.load('https://cdn.jsdelivr.net/npm/html2pdf.js@0.10.1/dist/html2pdf.bundle.min.js'),
  docx: () => Lib.load('https://cdn.jsdelivr.net/npm/docx@8.5.0/build/index.umd.js'),
  qr: () => Lib.load('https://cdn.jsdelivr.net/npm/qrcodejs@1.0.0/qrcode.min.js')
};
