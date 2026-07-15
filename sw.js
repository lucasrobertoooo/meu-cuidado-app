const SHELL = 'meucuidado-shell-v1';
const ASSETS = ['./', './index.html', './manifest.json',
  './creature/char-egg.png','./creature/char-1.png','./creature/char-2.png','./creature/char-3.png','./creature/char-4.png','./creature/char-5.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(SHELL).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== SHELL).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const u = new URL(e.request.url);
  if (u.hostname === 'api.github.com') return; // snapshot sempre pela rede
  if (u.origin === location.origin) {
    e.respondWith(caches.match(e.request).then(r => r || fetch(e.request).then(res => { const cp = res.clone(); caches.open(SHELL).then(c => c.put(e.request, cp)); return res; }).catch(() => r)));
  }
});
