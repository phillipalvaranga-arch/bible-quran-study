const C = 'bq-v2';
const F = ['./', 'index.html', 'style.css', 'data/topics.js', 'data/compare.js', 'views3.js', 'data/quran.json', 'data/bible.json', 'sync.js', 'core.js', 'views.js', 'views2.js', 'app.js', 'manifest.webmanifest',
  'icons/icon-192.png', 'icons/icon-512.png', 'icons/maskable-512.png', 'icons/apple-touch-icon.png', 'icons/favicon.png', 'icon.ico'];
self.addEventListener('install', (e) => { e.waitUntil(caches.open(C).then((c) => c.addAll(F))); self.skipWaiting(); });
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((k) => Promise.all(k.filter((x) => x !== C).map((x) => caches.delete(x)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  if (url.origin !== location.origin) return;
  if (/\.(png|ico|svg)$/.test(url.pathname) || /\/data\/(quran|bible)\.json$/.test(url.pathname)) {
    e.respondWith(caches.match(e.request).then((m) => m || fetch(e.request).then((r) => { const c = r.clone(); caches.open(C).then((x) => x.put(e.request, c)); return r; })));
    return;
  }
  e.respondWith(fetch(e.request).then((r) => { const copy = r.clone(); caches.open(C).then((c) => c.put(e.request, copy)); return r; })
    .catch(() => caches.match(e.request, { ignoreSearch: true }).then((m) => m || caches.match('./index.html'))));
});
