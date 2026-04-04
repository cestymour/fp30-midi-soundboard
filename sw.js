/* ================================================================
   sw.js — Service Worker
   Stratégie :
   - Fichiers app (HTML, CSS, JS, config) : Cache First avec
     mise à jour en arrière-plan
   - Fichiers audio (sounds/) : Cache First dynamique — mis en
     cache à la volée au premier accès, servis depuis le cache
     ensuite
================================================================ */

importScripts('version.js'); // expose APP_VERSION

const APP_CACHE   = `impro-app-${APP_VERSION}`;
const AUDIO_CACHE = `impro-audio-${APP_VERSION}`;

// ── Fichiers app à précacher dès l'installation ──
const APP_ASSETS = [
  './index.html',
  './style.css',
  './manifest.json',
  './midi.config.js',
  './audio.config.js',
  './js/app.js',
  './js/midi.js',
  './js/audio.js',
  './js/bluetoothMIDI.js',
  './js/ble-midi-parser.bundle.js',
  './public/pwa-192x192.png',
  './public/pwa-512x512.png',
  './public/apple-touch-icon.png',
  './public/favicon.ico',
];

// ═══════════════════════════════════════════════════════
// INSTALLATION — précache les fichiers app
// ═══════════════════════════════════════════════════════
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(APP_CACHE).then(cache => {
      return cache.addAll(APP_ASSETS);
    })
  );
  // Force l'activation immédiate sans attendre la fermeture des onglets
  self.skipWaiting();
});

// ═══════════════════════════════════════════════════════
// ACTIVATION — nettoie les anciens caches
// ═══════════════════════════════════════════════════════
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== APP_CACHE && key !== AUDIO_CACHE)
          .map(key => {
            console.log('[SW] Suppression ancien cache :', key);
            return caches.delete(key);
          })
      )
    )
  );
  // Prend le contrôle immédiatement de tous les onglets ouverts
  self.clients.claim();
});

// ═══════════════════════════════════════════════════════
// FETCH — stratégie selon le type de ressource
// ═══════════════════════════════════════════════════════
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // ── Fichiers audio : Cache First dynamique ──
  if (url.pathname.includes('/sounds/')) {
    event.respondWith(handleAudio(event.request));
    return;
  }

  // ── Fichiers app : Cache First ──
  event.respondWith(handleApp(event.request));
});

// ── Cache First pour les fichiers app ──
async function handleApp(request) {
  const cached = await caches.match(request);
  if (cached) return cached;

  // Pas en cache → réseau puis mise en cache
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(APP_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    console.warn('[SW] Ressource app non disponible hors ligne :', request.url);
    return new Response('Ressource non disponible hors ligne', { status: 503 });
  }
}

// ── Cache First dynamique pour les fichiers audio ──
async function handleAudio(request) {
  const cached = await caches.match(request);
  if (cached) {
    console.log('[SW] Audio servi depuis le cache :', request.url);
    return cached;
  }

  // Premier accès → réseau puis mise en cache
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(AUDIO_CACHE);
      cache.put(request, response.clone());
      console.log('[SW] Audio mis en cache :', request.url);
    }
    return response;
  } catch {
    console.warn('[SW] Audio non disponible hors ligne :', request.url);
    return new Response('Fichier audio non disponible hors ligne', { status: 503 });
  }
}
