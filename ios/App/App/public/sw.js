/* VibeSync — Service Worker mínimo y seguro.
 * - App shell cacheado (HTML, CSS, JS, íconos).
 * - Navegación: red primero, cache como respaldo offline.
 * - APIs y OAuth: SIEMPRE red (nunca cachear tokens ni búsquedas).
 */
const VERSION = 'vibesync-shell-v1';
const SHELL = ['/', '/legal.html', '/site.webmanifest', '/favicon.ico', '/android-chrome-192.png', '/android-chrome-512.png', '/apple-touch-icon.png'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(VERSION)
      .then((cache) => Promise.allSettled(SHELL.map((url) => cache.add(url))))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== VERSION).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith('/api/') || url.pathname === '/callback') return;

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(VERSION).then((cache) => cache.put('/', copy)).catch(() => {});
          return response;
        })
        .catch(() => caches.match(request).then((hit) => hit ?? caches.match('/'))),
    );
    return;
  }

  event.respondWith(
    caches.match(request).then((hit) => hit ?? fetch(request).then((response) => {
      if (response.ok && (response.type === 'basic' || response.type === 'default')) {
        const copy = response.clone();
        caches.open(VERSION).then((cache) => cache.put(request, copy)).catch(() => {});
      }
      return response;
    })),
  );
});
