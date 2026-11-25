// KBW Expense Tracker service worker: app shell cached for offline, network-first so updates arrive fast.
const CACHE = 'kbw-shell-v1';
const SHELL = ['./', 'index.html', 'manifest.webmanifest', 'icon-192.png', 'apple-touch-icon.png'];
const CDN = ['cdnjs.cloudflare.com', 'fonts.googleapis.com', 'fonts.gstatic.com'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  const same = url.origin === self.location.origin;
  if (!same && !CDN.includes(url.hostname)) return;   // never touch GitHub, Google APIs or Drive
  if (same) {
    // network first, fall back to cache when offline
    e.respondWith(fetch(req).then(r => { if (r.ok) { const c = r.clone(); caches.open(CACHE).then(ch => ch.put(req, c)); } return r; }).catch(() => caches.match(req).then(m => m || caches.match('index.html'))));
  } else {
    // libraries and fonts: cache first
    e.respondWith(caches.match(req).then(m => m || fetch(req).then(r => { const c = r.clone(); caches.open(CACHE).then(ch => ch.put(req, c)); return r; })));
  }
});
