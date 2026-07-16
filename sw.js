const SHELL = 'meucuidado-shell-v8';
const ASSETS = ['./', './index.html', './manifest.json',
  './icon-192.png','./icon-512.png','./apple-touch-icon.png',
  './creature/char-egg.png','./creature/char-1.png','./creature/char-2.png','./creature/char-3.png','./creature/char-4.png','./creature/char-5.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(SHELL).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== SHELL).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('push', e => {
  let d = { title: '💊 Meu Cuidado', body: 'Hora de se cuidar.' };
  try { if (e.data) d = e.data.json(); } catch (_) { try { d.body = e.data.text(); } catch (__) {} }
  e.waitUntil(self.registration.showNotification(d.title || '💊 Meu Cuidado', {
    body: d.body || '', icon: 'icon-192.png', badge: 'icon-192.png',
    tag: d.tag || 'mc-push', renotify: true, vibrate: [90, 40, 90], data: { url: d.url || './' }
  }));
});
self.addEventListener('notificationclick', e => {
  e.notification.close();
  const url = (e.notification.data && e.notification.data.url) || './';
  e.waitUntil((async () => {
    const all = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    for (const c of all) { if ('focus' in c) return c.focus(); }
    if (self.clients.openWindow) return self.clients.openWindow(url);
  })());
});
self.addEventListener('fetch', e => {
  const u = new URL(e.request.url);
  if (u.hostname === 'api.github.com') return; // snapshot sempre pela rede
  if (u.origin === location.origin) {
    e.respondWith(caches.match(e.request).then(r => r || fetch(e.request).then(res => { const cp = res.clone(); caches.open(SHELL).then(c => c.put(e.request, cp)); return res; }).catch(() => r)));
  }
});
