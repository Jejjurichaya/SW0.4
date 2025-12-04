// service-worker.js - FIXED FOR OFFLINE

const CACHE_NAME = 'swasthya-v2';
const DATA_CACHE = 'swasthya-data-v2';

// Files to pre-cache
const FILES = [
  '/',
  '/index.html',
  '/offline.html',
  '/app.js',
  '/style.css',
  '/manifest.json',
  '/data/symptoms.json',
  '/icons/icon-192.png',  // ✅ FIXED path
  '/icons/icon-512.png',  // ✅ FIXED path
  '/icons/alarm-beep.mp3'
];

// Install SW and cache files safely
self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache =>
      Promise.allSettled(
        FILES.map(file =>
          cache.add(file).catch(err => console.warn(`⚠ Failed to cache ${file}`, err))
        )
      )
    )
  );
});

// Activate SW and remove old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(key => key !== CACHE_NAME && key !== DATA_CACHE)
          .map(key => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

// Fetch handler - FIXED FOR OFFLINE
self.addEventListener('fetch', event => {
  const req = event.request;
  const url = new URL(req.url);

  // 🔥 FIXED: CACHE-FIRST for ALL navigation (shows offline.html immediately)
  if (req.mode === 'navigate') {
    event.respondWith(
      caches.match('/index.html')
        .then(cachedIndex => {
          if (cachedIndex) return cachedIndex;
          return caches.match('/offline.html');
        })
        .catch(() => caches.match('/offline.html'))
    );
    return;
  }

  // Data requests (symptoms, hospitals, nominatim)
  if (url.pathname.startsWith('/data') || url.pathname.includes('/nominatim')) {
    event.respondWith(
      caches.open(DATA_CACHE).then(cache =>
        fetch(req)
          .then(resp => {
            if (resp && resp.status === 200) cache.put(req.url, resp.clone());
            return resp;
          })
          .catch(() =>
            cache.match(req.url)
              .then(cached => cached || new Response('{}', { headers: { 'Content-Type': 'application/json' } }))
          )
      )
    );
    return;
  }

  // Static resources - cache first
  event.respondWith(
    caches.match(req).then(cached => {
      if (cached) return cached;
      
      return fetch(req).then(resp => {
        if (resp && resp.status === 200 && req.method === 'GET') {
          caches.open(CACHE_NAME).then(c => c.put(req, resp.clone()));
        }
        return resp;
      }).catch(() => {
        // Fallback for images
        if (req.destination === 'image') return caches.match('/icons/icon-192.png');
        // Fallback for other resources
        return caches.match('/offline.html');
      });
    })
  );
});
