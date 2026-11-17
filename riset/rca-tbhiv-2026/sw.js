/* Service worker: menyimpan berkas aplikasi agar dapat dibuka saat sinyal lemah. Data tetap lewat API. */
const CACHE = 'rca-tbhiv-v35';
const FILES = ['./', 'index.html', 'config.js', 'css/app.css', 'icon.svg', 'manifest.webmanifest', 'vendor/xlsx.full.min.js',
  'js/schema.js', 'js/core.js', 'js/autocalc.js', 'js/help.js', 'js/report-en.js', 'js/report-chart.js', 'js/report.js', 'js/migrate.js', 'js/migrate-ui.js', 'vendor/jspdf.umd.min.js', 'vendor/docx.min.js', 'vendor/jspdf.plugin.autotable.min.js', 'js/collab.js', 'js/voice.js', 'js/shared.js', 'js/forms.js', 'js/photo.js', 'js/c2.js', 'js/dashboard.js', 'js/rca-story.js', 'js/journey.js', 'js/dataset.js', 'js/analysis.js', 'js/mapping.js', 'js/compare.js', 'js/wilayah-geo.js', 'vendor/leaflet/leaflet.js', 'vendor/leaflet/leaflet.css', 'js/analysis-custom.js', 'js/tour.js', 'js/app.js'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET' || u.origin !== location.origin) return;
  // berkas aplikasi diambil dari cache perangkat (cepat, juga saat sinyal lemah); versi baru dipasang utuh
  // setiap kali nama CACHE di atas dinaikkan. Berkas lain: jaringan dulu, cadangan dari cache.
  // config.js selalu diambil dari jaringan dulu agar perubahan alamat server langsung berlaku
  if (/\/config\.js$/.test(u.pathname)) { e.respondWith(fetch(e.request).then(r => { if (r.ok) { const cp = r.clone(); caches.open(CACHE).then(c => c.put(e.request, cp)); } return r; }).catch(() => caches.match(e.request, { ignoreSearch: true }))); return; }
  e.respondWith(caches.open(CACHE).then(async c => {
    const hit = await c.match(e.request, { ignoreSearch: true });
    if (hit) return hit;
    try { const r = await fetch(e.request); if (r.ok) c.put(e.request, r.clone()); return r; }
    catch (err) { return caches.match(e.request, { ignoreSearch: true }); }
  }));
});
