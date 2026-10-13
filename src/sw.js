/* ================================================================
   sw.js — Service Worker (Workbox, construit par vite-plugin-pwa)
   Stratégie :
   - Fichiers app (HTML, CSS, JS, icônes, manifest) : precache
     Workbox, liste et révisions générées au build
   - Fichiers audio (sounds/) : Cache First dans un cache stable
     (non versionné), mis en cache au premier accès
   - Images (images/) : Cache First, mises en cache au premier accès
   - Polices Google Fonts : mises en cache pour le hors ligne
================================================================ */

import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { CacheFirst, StaleWhileRevalidate } from 'workbox-strategies';
import { CacheableResponsePlugin } from 'workbox-cacheable-response';
import { RangeRequestsPlugin } from 'workbox-range-requests';
import { clientsClaim } from 'workbox-core';

const AUDIO_CACHE  = 'impro-audio';
const IMAGES_CACHE = 'impro-images';

// Préfixes des caches de l'ancien sw.js (versions ≤ 1.6.x, avant la refonte)
const LEGACY_APP_CACHE_PREFIX   = 'impro-app-';
const LEGACY_AUDIO_CACHE_PREFIX = 'impro-audio-';

// Activation immédiate sans attendre la fermeture des onglets
self.skipWaiting();
clientsClaim();

// ═══════════════════════════════════════════════════════
// FICHIERS APP — precache
// ═══════════════════════════════════════════════════════
cleanupOutdatedCaches();
precacheAndRoute(self.__WB_MANIFEST);

// ═══════════════════════════════════════════════════════
// FICHIERS AUDIO — Cache First
// ═══════════════════════════════════════════════════════

/**
 * Les éléments <audio> font des requêtes Range, auxquelles le serveur
 * répond en 206 (réponse partielle, impossible à mettre en cache).
 * Au premier accès on télécharge donc le fichier entier (réponse 200),
 * qui est mis en cache ; RangeRequestsPlugin découpe ensuite les plages
 * demandées dans la réponse en cache.
 */
const fetchWholeFilePlugin = {
  requestWillFetch: async ({ request }) => new Request(request.url, {
    credentials: request.credentials,
  }),
};

registerRoute(
  ({ url }) => url.pathname.includes('/sounds/'),
  new CacheFirst({
    cacheName: AUDIO_CACHE,
    plugins: [
      fetchWholeFilePlugin,
      new CacheableResponsePlugin({ statuses: [200] }),
      new RangeRequestsPlugin(),
    ],
  }),
);

// ═══════════════════════════════════════════════════════
// IMAGES — Cache First
// ═══════════════════════════════════════════════════════
registerRoute(
  ({ url }) => url.pathname.includes('/images/'),
  new CacheFirst({
    cacheName: IMAGES_CACHE,
    plugins: [new CacheableResponsePlugin({ statuses: [200] })],
  }),
);

// ═══════════════════════════════════════════════════════
// POLICES GOOGLE FONTS
// ═══════════════════════════════════════════════════════

// Feuille de style : servie depuis le cache, rafraîchie en arrière-plan
registerRoute(
  ({ url }) => url.origin === 'https://fonts.googleapis.com',
  new StaleWhileRevalidate({
    cacheName: 'impro-fonts-css',
    // 0 = réponse opaque (la balise <link> ne fait pas de requête CORS)
    plugins: [new CacheableResponsePlugin({ statuses: [0, 200] })],
  }),
);

// Fichiers de polices : immuables, Cache First
registerRoute(
  ({ url }) => url.origin === 'https://fonts.gstatic.com',
  new CacheFirst({
    cacheName: 'impro-fonts',
    plugins: [new CacheableResponsePlugin({ statuses: [0, 200] })],
  }),
);

// ═══════════════════════════════════════════════════════
// MIGRATION — caches de l'ancien Service Worker
// ═══════════════════════════════════════════════════════

/**
 * Recopie les sons déjà en cache par l'ancien SW dans le nouveau cache
 * audio (évite de retélécharger ~100 Mo), puis supprime les anciens caches.
 */
async function migrateLegacyCaches() {
  const keys = await caches.keys();

  const legacyAudioCaches = keys.filter(key => key.startsWith(LEGACY_AUDIO_CACHE_PREFIX));
  if (legacyAudioCaches.length) {
    const audioCache = await caches.open(AUDIO_CACHE);
    for (const key of legacyAudioCaches) {
      const legacyCache = await caches.open(key);
      for (const request of await legacyCache.keys()) {
        if (await audioCache.match(request)) continue;
        const response = await legacyCache.match(request);
        if (response?.status === 200) await audioCache.put(request, response);
      }
    }
  }

  await Promise.all(
    keys
      .filter(key => key.startsWith(LEGACY_APP_CACHE_PREFIX) || key.startsWith(LEGACY_AUDIO_CACHE_PREFIX))
      .map(key => {
        console.log('[SW] Suppression ancien cache :', key);
        return caches.delete(key);
      })
  );
}

self.addEventListener('activate', event => {
  event.waitUntil(migrateLegacyCaches());
});
