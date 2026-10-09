// sw.js

const CACHE_NAME = 'local-ai-starter-v4';
const ASSETS = [
  './',
  './index.html',
  './style.css',
  './app.js',
  './config.json',
  './logo.svg',
  './manifest.json',
  './personas/assistant.json',
  './personas/language-tutor.json',
  './personas/travel-guide.json',
  './personas/coding-helper.json',
  './personas/interviewer.json',
  './personas/math-tutor.json'
];

// Install Event - Pre-cache assets
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Caching App Shell and configurations');
      return cache.addAll(ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// Activate Event - Clean old caches
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[Service Worker] Removing old cache:', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event - Network-First Strategy for static assets
self.addEventListener('fetch', (e) => {
  // Never intercept non-GET requests (e.g. POST for Fish Audio TTS)
  if (e.request.method !== 'GET') return;

  const url = new URL(e.request.url);

  // Ignore heavy model blobs and external cloud APIs
  if (url.pathname.endsWith('.litertlm') || 
      url.hostname.includes('huggingface.co') || 
      url.hostname.includes('fish.audio') || 
      url.pathname.startsWith('/api/')) {
    return;
  }

  e.respondWith(
    caches.open(CACHE_NAME).then((cache) => {
      return fetch(e.request).then((networkResponse) => {
        if (networkResponse.ok && e.request.method === 'GET') {
          cache.put(e.request, networkResponse.clone());
        }
        return networkResponse;
      }).catch(() => {
        // Offline: serve the last cached copy
        return cache.match(e.request);
      });
    })
  );
});
