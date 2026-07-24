/**
 * DinePOS AI - Offline POS & KDS Service Worker
 * Caches core shell routes and static assets for seamless offline resilience.
 */
const CACHE_NAME = 'dinepos-v1-cache';
const STATIC_ASSETS = [
  '/',
  '/pos',
  '/kds',
  '/menu',
  '/login',
  '/manifest.json',
  '/icon.svg',
  '/images/wagyu_ribeye.png',
  '/images/mushroom_risotto.png'
];

// Install Event - Pre-cache critical static shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Pre-caching offline POS shell assets');
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn('[SW] Pre-cache warning (some assets missed):', err);
      });
    }).then(() => self.skipWaiting())
  );
});

// Activate Event - Clean up stale caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('[SW] Deleting legacy cache:', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event - Network first with Cache fallback for navigation & static assets
self.addEventListener('fetch', (event) => {
  // Only handle http and https requests (ignore chrome-extension://, devtools://, etc.)
  if (!event.request.url.startsWith('http://') && !event.request.url.startsWith('https://')) {
    return;
  }

  // Ignore non-GET requests or backend API requests (API calls handle offline fallback internally)
  if (event.request.method !== 'GET' || event.request.url.includes('/api/')) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        // Clone and cache successful GET responses
        if (networkResponse && networkResponse.status === 200 && (networkResponse.type === 'basic' || networkResponse.type === 'cors')) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache).catch(() => {
              // Ignore cache write errors gracefully (e.g. extension requests, storage quota)
            });
          }).catch(() => {});
        }
        return networkResponse;
      })
      .catch(() => {
        // Network failed (offline) -> serve from cache
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          // If HTML page request and not in cache, fallback to offline shell
          if (event.request.headers.get('accept')?.includes('text/html')) {
            return caches.match('/pos');
          }
        });
      })
  );
});
