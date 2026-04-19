// Simple Service Worker for PWA installation support
const CACHE_NAME = 'clinicflow-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('fetch', (event) => {
  // Pass-through for now, but required for PWA installability
  event.respondWith(fetch(event.request));
});
