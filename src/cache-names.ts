/* ================================================================
   cache-names.ts — Noms des caches du Service Worker, partagés avec
   la page (téléchargement des sons pour le hors ligne, offline.ts).
   Ces noms ne changent pas d'une version à l'autre : les sons déjà
   téléchargés restent disponibles après une mise à jour.
================================================================ */

export const AUDIO_CACHE  = 'impro-audio';
export const IMAGES_CACHE = 'impro-images';
