/* Service worker: menyimpan berkas aplikasi agar dapat dibuka saat sinyal lemah. Data tetap lewat API. */
const CACHE = 'rca-tbhiv-v1';
const FILES = ['./', 'index.html', 'config.js', 'css/app.css', 'icon.svg', 'manifest.webmanifest', 'vendor/xlsx.full.min.js',
  'js/schema.js', 'js/core.js', 'js/autocalc.js', 'js/forms.js', 'js/photo.js', 'js/c2.js', 'js/dashboard.js', 'js/analysis-custom.js', 'js/app.js'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET' || u.origin !== location.origin) return;
  // jaringan dulu (agar pembaruan cepat terlihat), cadangan dari cache bila offline
  e.respondWith(fetch(e.request).then(r => { const c = r.clone(); caches.open(CACHE).then(x => x.put(e.request, c)); return r; }).catch(() => caches.match(e.request, { ignoreSearch: true })));
});
