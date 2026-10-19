// PocketVR service worker: cache-first. First launch online caches the app + libraries + hand model; later launches work offline.
const CACHE = 'pocketvr-v3-5';
const LOCAL = ['./', './index.html', './manifest.json', './icon-192.png', './icon-512.png'];
const HOSTS = ['cdnjs.cloudflare.com', 'cdn.jsdelivr.net', 'storage.googleapis.com'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(LOCAL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const r = e.request, u = new URL(r.url);
  if (r.method !== 'GET' || !(u.origin === location.origin || HOSTS.includes(u.hostname))) return;
  e.respondWith(caches.match(r, {ignoreSearch: u.origin === location.origin}).then(hit => {
    if (hit) return hit;
    return fetch(r).then(res => {
      if (res && (res.ok || res.type === 'opaque')){ const cp = res.clone(); caches.open(CACHE).then(c => c.put(r, cp)); }
      return res;
    }).catch(() => caches.match('./index.html'));
  }));
});
