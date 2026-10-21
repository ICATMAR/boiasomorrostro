// App-shell cache for the installed Wind app. Live data (buoy readings,
// forecasts) is fetched cross-origin from icatmar.cat/csic.es and is
// intentionally left uncached here - only the static shell is precached, so
// the app still opens (with stale/no data) when the phone is offline.
//
// The shell is served network-first: every open gets the latest deployed
// index.html/wind.js/style.css, and the cache is only a fallback for offline.
// The server sends max-age=1 year for .js/.css, so all requests use
// cache: 'no-cache' to revalidate against the server (cheap 304 via ETag)
// instead of trusting the browser's HTTP cache.
const CACHE_NAME = 'wind-shell-v2';
const SHELL_URLS = [
  './',
  './index.html',
  './style.css',
  './wind.js',
  './manifest.webmanifest',
  './icons/icon-192.png',
  './icons/icon-512.png',
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(SHELL_URLS.map(u => new Request(u, { cache: 'reload' }))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(names => Promise.all(
        names.filter(name => name !== CACHE_NAME).map(name => caches.delete(name))
      ))
      .then(() => self.clients.claim())
  );
});

// Resolved once against the SW's own scope, so this works whether the app is
// served from GitHub Pages (/boiasomorrostro/wind/) or a local dev server.
const SHELL_PATHS = new Set(SHELL_URLS.map(u => new URL(u, self.registration.scope).pathname));

// Only the precached shell goes through here; everything else (API calls,
// other pages) goes straight to the network as normal.
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;
  if (!SHELL_PATHS.has(url.pathname) && event.request.mode !== 'navigate') return;

  event.respondWith(
    fetch(event.request, { cache: 'no-cache' })
      .then(response => {
        if (response.ok) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
        }
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
