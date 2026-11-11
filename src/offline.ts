/* ================================================================
   offline.ts — Hors ligne : stockage persistant, et téléchargement
   de tous les sons et images avant le spectacle.

   Sans téléchargement, un son n'est mis en cache qu'à sa première
   lecture : un son oublié n'est pas disponible hors ligne. Les fichiers
   vont dans les caches du Service Worker (cache-names.ts), sous la même
   adresse que celle que demande l'élément <audio> : il les sert ensuite
   sans le réseau. Les fichiers déjà en cache ne sont pas retéléchargés.
================================================================ */

import { getAudioTabs, getSoundImage, getTransitionMusics } from './config/tabs.ts';
import { AUDIO_CACHE, IMAGES_CACHE } from './cache-names.ts';

export interface OfflineFiles {
  /** Adresses complètes, sans doublon */
  sounds: string[];
  images: string[];
}

/** Sons et images de tous les onglets audio et musiques de transition, en adresses complètes (résolues comme `<audio src>`) */
export function listOfflineFiles(base: string = document.baseURI): OfflineFiles {
  const sounds = new Set<string>();
  const images = new Set<string>();
  for (const tab of getAudioTabs()) {
    for (const category of tab.categories) {
      for (const item of category.items) {
        if (item.file) sounds.add(new URL(item.file, base).href);
        const image = getSoundImage(item);
        if (image) images.add(new URL(image, base).href);
      }
    }
  }
  for (const music of getTransitionMusics()) sounds.add(new URL(music.file, base).href);
  return { sounds: [...sounds], images: [...images] };
}

export interface CacheCount {
  cached: number;
  total: number;
}

/** Nombre de fichiers de la liste déjà présents dans le cache */
export async function countCached(urls: string[], cacheName: string): Promise<CacheCount> {
  const cache = await caches.open(cacheName);
  const keys = new Set((await cache.keys()).map(request => request.url));
  return { cached: urls.filter(url => keys.has(url)).length, total: urls.length };
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

/** Télécharge tous les sons puis toutes les images manquants */
export async function downloadAllForOffline(
  onProgress: (done: number, total: number) => void = () => {},
  files: OfflineFiles = listOfflineFiles(),
): Promise<string[]> {
  const sounds = await countCached(files.sounds, AUDIO_CACHE);
  const images = await countCached(files.images, IMAGES_CACHE);
  const soundsMissing = sounds.total - sounds.cached;
  const total = soundsMissing + images.total - images.cached;
  const failedSounds = await downloadMissing(files.sounds, AUDIO_CACHE, done => onProgress(done, total));
  const failedImages = await downloadMissing(files.images, IMAGES_CACHE, done => onProgress(soundsMissing + done, total));
  return [...failedSounds, ...failedImages];
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
