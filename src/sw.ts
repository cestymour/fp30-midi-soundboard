/* ================================================================
   sw.ts — Service Worker (Workbox, construit par vite-plugin-pwa)
   Stratégie :
   - Fichiers app (HTML, CSS, JS, icônes, manifest) : precache
     Workbox, liste et révisions générées au build
   - Fichiers audio (sounds/) : Cache First dans un cache stable
     (non versionné), mis en cache au premier accès
   - Images (images/) : Cache First, mises en cache au premier accès
   - Polices : embarquées dans l'application (precache)
================================================================ */

import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { CacheFirst } from 'workbox-strategies';
import { CacheableResponsePlugin } from 'workbox-cacheable-response';
import { RangeRequestsPlugin } from 'workbox-range-requests';
import { clientsClaim } from 'workbox-core';
import type { WorkboxPlugin } from 'workbox-core/types';
import type { PrecacheEntry } from 'workbox-precaching';
import { AUDIO_CACHE, IMAGES_CACHE } from './cache-names.ts';

declare const self: ServiceWorkerGlobalScope & {
  /** Liste des fichiers à précacher, injectée au build par vite-plugin-pwa */
  __WB_MANIFEST: (PrecacheEntry | string)[];
};

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
const fetchWholeFilePlugin: WorkboxPlugin = {
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
// ANCIENS CACHES DES POLICES GOOGLE (jusqu'à la 1.8.0)
// ═══════════════════════════════════════════════════════

// Les polices sont désormais dans le precache : les caches Google Fonts ne servent plus
self.addEventListener('activate', event => {
  event.waitUntil(Promise.all(['impro-fonts-css', 'impro-fonts'].map(name => caches.delete(name))));
});
