/* ================================================================
   sw.ts — Service Worker (Workbox, construit par vite-plugin-pwa)
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
import type { WorkboxPlugin } from 'workbox-core/types';
import type { PrecacheEntry } from 'workbox-precaching';

declare const self: ServiceWorkerGlobalScope & {
  /** Liste des fichiers à précacher, injectée au build par vite-plugin-pwa */
  __WB_MANIFEST: (PrecacheEntry | string)[];
};

const AUDIO_CACHE  = 'impro-audio';
const IMAGES_CACHE = 'impro-images';

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
