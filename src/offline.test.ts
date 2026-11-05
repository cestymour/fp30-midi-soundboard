import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AUDIO_CACHE, IMAGES_CACHE } from './cache-names.ts';
import { getAudioTabs } from './config/tabs.ts';
import { downloadAllForOffline, getOfflineStatus, listOfflineFiles } from './offline.ts';

const BASE = 'https://cestymour.github.io/fp30-midi-soundboard/';

/** Caches factices : une Map d'adresses par nom de cache */
function fakeCaches(): Map<string, Map<string, unknown>> {
  const stores = new Map<string, Map<string, unknown>>();
  vi.stubGlobal('caches', {
    open: async (name: string) => {
      if (!stores.has(name)) stores.set(name, new Map());
      const store = stores.get(name)!;
      return {
        keys: async () => [...store.keys()].map(url => ({ url })),
        put: async (url: string, response: unknown) => { store.set(url, response); },
      };
    },
  });
  return stores;
}

let stores: Map<string, Map<string, unknown>>;

beforeEach(() => {
  stores = fakeCaches();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('listOfflineFiles', () => {
  it('liste chaque son de la configuration une fois, en adresse complète encodée comme <audio src>', () => {
    const { sounds, images } = listOfflineFiles(BASE);
    const files = getAudioTabs().flatMap(t => t.categories.flatMap(c => c.items.map(i => i.file)));

    expect(sounds.length).toBe(new Set(files).size);
    expect(sounds.every(url => url.startsWith(BASE + 'sounds/'))).toBe(true);
    expect(sounds.some(url => url.includes(' '))).toBe(false);
    expect(images.every(url => url.startsWith(BASE + 'images/'))).toBe(true);
  });
});

describe('downloadAllForOffline', () => {
  const files = {
    sounds: [BASE + 'sounds/a.mp3', BASE + 'sounds/b.mp3', BASE + 'sounds/manquant.mp3'],
    images: [BASE + 'images/a.jpg'],
  };

  it('ne télécharge que ce qui manque, et signale les fichiers introuvables', async () => {
    await (await caches.open(AUDIO_CACHE)).put(BASE + 'sounds/a.mp3', {} as Response);
    const fetchMock = vi.fn(async (url: string) => ({ status: url.includes('manquant') ? 404 : 200 }));
    vi.stubGlobal('fetch', fetchMock);
    const progress: string[] = [];

    const failed = await downloadAllForOffline((done, total) => progress.push(`${done}/${total}`), files);

    expect(fetchMock.mock.calls.map(c => c[0])).toEqual([BASE + 'sounds/b.mp3', BASE + 'sounds/manquant.mp3', BASE + 'images/a.jpg']);
    expect(failed).toEqual([BASE + 'sounds/manquant.mp3']);
    expect(progress).toEqual(['1/3', '2/3', '3/3']);
    expect(await getOfflineStatus(files)).toEqual({ sounds: { cached: 2, total: 3 }, images: { cached: 1, total: 1 } });
    expect(stores.get(IMAGES_CACHE)!.has(BASE + 'images/a.jpg')).toBe(true);
  });

  it('réseau coupé : rien en cache, tous les fichiers signalés', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => { throw new TypeError('Failed to fetch'); }));

    const failed = await downloadAllForOffline(() => {}, files);

    expect(failed.length).toBe(4);
    expect(await getOfflineStatus(files)).toEqual({ sounds: { cached: 0, total: 3 }, images: { cached: 0, total: 1 } });
  });
});
