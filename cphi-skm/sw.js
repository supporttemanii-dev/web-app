/* Service worker — cache aplikasi agar bisa dibuka & dipakai offline */
const VER = 'skm-v1.2.0';
const SHELL = [
  './', 'index.html', 'embed.html', 'manifest.json', 'css/app.css',
  'js/config.js', 'js/core.js', 'js/store.js', 'js/ui.js', 'js/mock.js', 'js/api.js', 'js/renderer.js',
  'js/builder.js', 'js/dashboard.js', 'js/report.js', 'js/admin.js', 'js/importer.js', 'js/app.js',
  'icons/logo.svg', 'icons/icon-192.png', 'icons/icon-512.png'
];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(VER).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VER).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  // Jangan cache panggilan API Apps Script & login Google
  if (url.hostname.includes('script.google') || url.hostname.includes('googleusercontent') || url.hostname.includes('accounts.google')) return;
  const isCdn = /cdn\.jsdelivr\.net|fonts\.(googleapis|gstatic)\.com/.test(url.hostname);
  if (url.origin === location.origin) {
    // network-first untuk file aplikasi (agar update cepat), fallback cache saat offline
    e.respondWith(fetch(req).then(res => { const cp = res.clone(); caches.open(VER).then(c => c.put(req, cp)); return res; })
      .catch(() => caches.match(req).then(r => r || caches.match('index.html'))));
  } else if (isCdn) {
    // cache-first untuk pustaka CDN (Chart.js, SheetJS, html2pdf, QR, font)
    e.respondWith(caches.match(req).then(r => r || fetch(req).then(res => { const cp = res.clone(); caches.open(VER).then(c => c.put(req, cp)); return res; })));
  }
});
