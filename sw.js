var CACHE_NAME = 'wordmaster-v1';
var urlsToCache = [
  '/wordmaster/',
  '/wordmaster/index.html',
  '/wordmaster/icon.svg',
  '/wordmaster/manifest.json'
];

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(urlsToCache);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(names) {
      return Promise.all(
        names.filter(function(name) {
          return name !== CACHE_NAME;
        }).map(function(name) {
          return caches.delete(name);
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', function(event) {
  // For API calls to Supabase, always use network
  if (event.request.url.indexOf('supabase') !== -1) {
    event.respondWith(fetch(event.request));
    return;
  }

  // For other requests, try network first, fall back to cache
  event.respondWith(
    fetch(event.request).then(function(response) {
      // Clone and cache the response
      if (response && response.status === 200) {
        var responseClone = response.clone();
        caches.open(CACHE_NAME).then(function(cache) {
          cache.put(event.request, responseClone);
        });
      }
      return response;
    }).catch(function() {
      return caches.match(event.request);
    })
  );
});
