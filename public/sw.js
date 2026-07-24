// Service Worker for Curious Bharat PWA
const CACHE_NAME = 'curious-bharat-pwa-v2';

const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json'
];

// Install Event - Pre-cache essential app shell assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE).catch(() => {});
    }).then(() => self.skipWaiting())
  );
});

// Activate Event - Clean up stale caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event - Stale-while-revalidate for static files, Network-first for API requests
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Skip caching non-GET requests or browser extension/chrome-extension requests
  if (event.request.method !== 'GET' || !url.protocol.startsWith('http')) {
    return;
  }

  // API requests: Network first with graceful fallback
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches.match(event.request).then((response) => {
          if (response) return response;
          return new Response(JSON.stringify({ offline: true, error: "Network unavailable" }), {
            headers: { 'Content-Type': 'application/json' }
          });
        });
      })
    );
    return;
  }

  // Navigation or static asset requests: Cache first, update from network in background
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          return networkResponse;
        })
        .catch(() => cachedResponse);

      return cachedResponse || fetchPromise;
    })
  );
});
