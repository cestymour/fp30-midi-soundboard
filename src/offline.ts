/* ================================================================
   offline.ts — Hors ligne : stockage persistant, et téléchargement
   de tous les sons et images avant le spectacle.

   Sans téléchargement, un son n'est mis en cache qu'à sa première
   lecture : un son oublié n'est pas disponible hors ligne. Les fichiers
   vont dans les caches du Service Worker (cache-names.ts), sous la même
   adresse que celle que demande l'élément <audio> : il les sert ensuite
   sans le réseau. Les fichiers déjà en cache ne sont pas retéléchargés.

   Les adresses portent l'empreinte du fichier (asset-url.ts) : les
   entrées du cache qui ne correspondent plus à aucune adresse de la
   config (fichier retiré, renommé ou remplacé) sont obsolètes, et le
   téléchargement les efface une fois tout le reste téléchargé.
================================================================ */

import { getAudioTabs, getSoundImage, getTransitionMusics } from './config/tabs.ts';
import { AUDIO_CACHE, IMAGES_CACHE } from './cache-names.ts';
import { assetUrl } from './asset-url.ts';

export interface OfflineFiles {
  /** Adresses complètes, sans doublon */
  sounds: string[];
  images: string[];
}

/**
 * Sons et images de tous les onglets audio et musiques de transition, en adresses complètes
 * (résolues comme `<audio src>`, empreinte comprise)
 */
export function listOfflineFiles(base: string = document.baseURI, hashes?: Record<string, string>): OfflineFiles {
  const resolve = (path: string): string => new URL(assetUrl(path, hashes), base).href;
  const sounds = new Set<string>();
  const images = new Set<string>();
  for (const tab of getAudioTabs()) {
    for (const category of tab.categories) {
      for (const item of category.items) {
        if (item.file) sounds.add(resolve(item.file));
        const image = getSoundImage(item);
        if (image) images.add(resolve(image));
      }
    }
  }
  for (const music of getTransitionMusics()) sounds.add(resolve(music.file));
  return { sounds: [...sounds], images: [...images] };
}

export interface CacheCount {
  cached: number;
  total: number;
  /** Entrées du cache absentes de la liste : à effacer */
  obsolete: number;
}

/** Nombre de fichiers de la liste déjà présents dans le cache, et d'entrées obsolètes */
export async function countCached(urls: string[], cacheName: string): Promise<CacheCount> {
  const cache = await caches.open(cacheName);
  const keys = (await cache.keys()).map(request => request.url);
  const keySet = new Set(keys);
  const wanted = new Set(urls);
  return {
    cached: urls.filter(url => keySet.has(url)).length,
    total: urls.length,
    obsolete: keys.filter(url => !wanted.has(url)).length,
  };
}

export interface OfflineStatus {
  sounds: CacheCount;
  images: CacheCount;
}

export async function getOfflineStatus(files: OfflineFiles = listOfflineFiles()): Promise<OfflineStatus> {
  return {
    sounds: await countCached(files.sounds, AUDIO_CACHE),
    images: await countCached(files.images, IMAGES_CACHE),
  };
}

/**
 * Télécharge, un par un, les fichiers absents du cache. `onProgress` est appelé
 * après chaque fichier. Renvoie les adresses qui n'ont pas pu être téléchargées.
 */
export async function downloadMissing(
  urls: string[], cacheName: string, onProgress: (done: number, total: number) => void = () => {},
): Promise<string[]> {
  const cache = await caches.open(cacheName);
  const keys = new Set((await cache.keys()).map(request => request.url));
  const missing = urls.filter(url => !keys.has(url));
  const failed: string[] = [];
  for (const [index, url] of missing.entries()) {
    try {
      // Fichier entier (pas de Range), comme le Service Worker le met en cache
      const response = await fetch(url);
      if (response.status === 200) await cache.put(url, response);
      else failed.push(url);
    } catch {
      failed.push(url);
    }
    onProgress(index + 1, missing.length);
  }
  return failed;
}

/** Taille d'une réponse en cache, en octets (en-tête Content-Length, sinon lue) */
async function responseSize(response: Response | undefined): Promise<number> {
  if (!response) return 0;
  const length = Number(response.headers.get('content-length'));
  if (length > 0) return length;
  try {
    return (await response.blob()).size;
  } catch {
    return 0;
  }
}

/** Efface du cache les entrées absentes de `urls`. Renvoie la place libérée, en octets */
export async function removeObsolete(urls: string[], cacheName: string): Promise<number> {
  const cache = await caches.open(cacheName);
  const wanted = new Set(urls);
  let freed = 0;
  for (const request of await cache.keys()) {
    if (wanted.has(request.url)) continue;
    freed += await responseSize(await cache.match(request));
    await cache.delete(request);
  }
  return freed;
}

export interface DownloadResult {
  /** Adresses qui n'ont pas pu être téléchargées */
  failed: string[];
  /** Place libérée par le nettoyage, en octets (0 si rien n'a été effacé) */
  freed: number;
}

/**
 * Télécharge tous les sons puis toutes les images manquants, puis efface les entrées
 * obsolètes des deux caches (bug n° 27). Le nettoyage n'a lieu que si tous les
 * téléchargements ont réussi : jusque-là, l'ancienne version d'un fichier remplacé
 * reste en cache, et le Service Worker la sert hors ligne à la place de la nouvelle.
 */
export async function downloadAllForOffline(
  onProgress: (done: number, total: number) => void = () => {},
  files: OfflineFiles = listOfflineFiles(),
): Promise<DownloadResult> {
  const sounds = await countCached(files.sounds, AUDIO_CACHE);
  const images = await countCached(files.images, IMAGES_CACHE);
  const soundsMissing = sounds.total - sounds.cached;
  const total = soundsMissing + images.total - images.cached;
  const failedSounds = await downloadMissing(files.sounds, AUDIO_CACHE, done => onProgress(done, total));
  const failedImages = await downloadMissing(files.images, IMAGES_CACHE, done => onProgress(soundsMissing + done, total));
  const failed = [...failedSounds, ...failedImages];
  if (failed.length > 0) return { failed, freed: 0 };
  const freed = await removeObsolete(files.sounds, AUDIO_CACHE) + await removeObsolete(files.images, IMAGES_CACHE);
  return { failed, freed };
}

/**
 * Demande un stockage persistant : sans lui, Chrome peut effacer les caches (les
 * sons) s'il manque de place. Chrome répond seul, sans question à l'utilisateur
 * (accordé par exemple pour une application installée). null : non disponible.
 */
export async function requestPersistentStorage(): Promise<boolean | null> {
  if (!navigator.storage?.persist) return null;
  try {
    if (await navigator.storage.persisted()) return true;
    return await navigator.storage.persist();
  } catch {
    return null;
  }
}

/** Stockage déjà persistant ? null : non disponible */
export async function isStoragePersisted(): Promise<boolean | null> {
  if (!navigator.storage?.persisted) return null;
  try {
    return await navigator.storage.persisted();
  } catch {
    return null;
  }
}
