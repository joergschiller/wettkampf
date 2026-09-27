// Service Worker für Offline-Nutzung.
// App-Shell und PDF.js werden beim Installieren gecacht, Preset-PDFs beim ersten Abruf.
// Bei neuen Dateien/Änderungen CACHE hochzählen.
const CACHE = 'schwimmplan-v12';

const PRECACHE = [
  './',
  'index.html',
  'manifest.webmanifest',
  'icons/icon.svg',
  'icons/icon-192.png',
  'icons/icon-512.png',
  'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js',
];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(c => c.addAll(PRECACHE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

async function networkFirst(request) {
  const cache = await caches.open(CACHE);
  try {
    const response = await fetch(request);
    if (response.ok) cache.put(request, response.clone());
    return response;
  } catch (err) {
    const cached = await cache.match(request, { ignoreSearch: true });
    if (cached) return cached;
    throw err;
  }
}

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (response.ok) (await caches.open(CACHE)).put(request, response.clone());
  return response;
}

self.addEventListener('fetch', event => {
  const { request } = event;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);

  // Seite und Preset-PDFs: immer aktuell, offline aus dem Cache
  if (request.mode === 'navigate' || (url.origin === location.origin && url.pathname.endsWith('.pdf'))) {
    event.respondWith(networkFirst(request));
    return;
  }
  // Alles andere (Icons, Manifest, PDF.js vom CDN): Cache zuerst
  if (url.origin === location.origin || url.hostname === 'cdnjs.cloudflare.com') {
    event.respondWith(cacheFirst(request));
  }
});
