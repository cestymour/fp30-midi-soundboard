import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AUDIO_CACHE, IMAGES_CACHE } from './cache-names.ts';
import { getAudioTabs, getTransitionMusics } from './config/tabs.ts';
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
        match: async (request: { url: string }) => store.get(request.url),
        delete: async (request: { url: string }) => store.delete(request.url),
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
  it('liste chaque son de la configuration une fois (onglets et musiques de transition), en adresse complète encodée comme <audio src>', () => {
    const { sounds, images } = listOfflineFiles(BASE);
    const files = [
      ...getAudioTabs().flatMap(t => t.categories.flatMap(c => c.items.map(i => i.file))),
      ...getTransitionMusics().map(music => music.file),
    ];

    expect(sounds.length).toBe(new Set(files).size);
    expect(sounds.every(url => url.startsWith(BASE + 'sounds/'))).toBe(true);
    expect(sounds.some(url => url.includes(' '))).toBe(false);
    expect(images.every(url => url.startsWith(BASE + 'images/'))).toBe(true);
  });

  it("ajoute l'empreinte de chaque fichier à son adresse (bug n° 14)", () => {
    const file = getAudioTabs()[0].categories[0].items[0].file;
    const music = getTransitionMusics()[0].file;
    const { sounds } = listOfflineFiles(BASE, { [file]: 'abc123', [music]: 'def456' });

    expect(sounds).toContain(new URL(file, BASE).href + '?v=abc123');
    expect(sounds).toContain(new URL(music, BASE).href + '?v=def456');
    // Sans empreinte connue (dev), l'adresse reste celle de la config
    expect(sounds.filter(url => url.includes('?v=')).length).toBe(2);
  });
});

describe('downloadAllForOffline', () => {
  const files = {
    sounds: [BASE + 'sounds/a.mp3', BASE + 'sounds/b.mp3', BASE + 'sounds/manquant.mp3'],
    images: [BASE + 'images/a.jpg'],
  };

  it('ne télécharge que ce qui manque, et signale les fichiers introuvables', async () => {
    await (await caches.open(AUDIO_CACHE)).put(BASE + 'sounds/a.mp3', new Response('a'));
    const fetchMock = vi.fn(async (url: string) => new Response('x', { status: url.includes('manquant') ? 404 : 200 }));
    vi.stubGlobal('fetch', fetchMock);
    const progress: string[] = [];

    const { failed } = await downloadAllForOffline((done, total) => progress.push(`${done}/${total}`), files);

    expect(fetchMock.mock.calls.map(c => c[0])).toEqual([BASE + 'sounds/b.mp3', BASE + 'sounds/manquant.mp3', BASE + 'images/a.jpg']);
    expect(failed).toEqual([BASE + 'sounds/manquant.mp3']);
    expect(progress).toEqual(['1/3', '2/3', '3/3']);
    expect(await getOfflineStatus(files)).toEqual({ sounds: { cached: 2, total: 3, obsolete: 0 }, images: { cached: 1, total: 1, obsolete: 0 } });
    expect(stores.get(IMAGES_CACHE)!.has(BASE + 'images/a.jpg')).toBe(true);
  });

  it('réseau coupé : rien en cache, tous les fichiers signalés', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => { throw new TypeError('Failed to fetch'); }));

    const { failed } = await downloadAllForOffline(() => {}, files);

    expect(failed.length).toBe(4);
    expect(await getOfflineStatus(files)).toEqual({ sounds: { cached: 0, total: 3, obsolete: 0 }, images: { cached: 0, total: 1, obsolete: 0 } });
  });
});

describe('nettoyage des caches (bug n° 27)', () => {
  const files = {
    sounds: [BASE + 'sounds/a.mp3?v=2', BASE + 'sounds/b.mp3?v=1'],
    images: [BASE + 'images/a.jpg?v=1'],
  };

  /** Caches avec une ancienne version de a.mp3, un son retiré et une ancienne image */
  async function fillWithObsolete(): Promise<void> {
    const audio = await caches.open(AUDIO_CACHE);
    await audio.put(BASE + 'sounds/a.mp3?v=1', new Response('ancien a', { headers: { 'content-length': '1000' } }));
    await audio.put(BASE + 'sounds/retire.mp3', new Response('12345'));
    await audio.put(BASE + 'sounds/b.mp3?v=1', new Response('b'));
    const images = await caches.open(IMAGES_CACHE);
    await images.put(BASE + 'images/a.jpg', new Response('img', { headers: { 'content-length': '200' } }));
  }

  it("compte les entrées obsolètes dans l'état hors ligne", async () => {
    await fillWithObsolete();

    expect(await getOfflineStatus(files)).toEqual({
      sounds: { cached: 1, total: 2, obsolete: 2 },
      images: { cached: 0, total: 1, obsolete: 1 },
    });
  });

  it("efface seulement l'obsolète, après avoir téléchargé ce qui manque, et compte la place libérée", async () => {
    await fillWithObsolete();
    vi.stubGlobal('fetch', vi.fn(async () => new Response('nouveau', { status: 200 })));

    const { failed, freed } = await downloadAllForOffline(() => {}, files);

    expect(failed).toEqual([]);
    expect(freed).toBe(1000 + 5 + 200);
    expect([...stores.get(AUDIO_CACHE)!.keys()].sort()).toEqual(files.sounds);
    expect([...stores.get(IMAGES_CACHE)!.keys()]).toEqual(files.images);
    expect(await getOfflineStatus(files)).toEqual({
      sounds: { cached: 2, total: 2, obsolete: 0 },
      images: { cached: 1, total: 1, obsolete: 0 },
    });
  });

  it("n'efface rien si un téléchargement échoue : l'ancienne version reste jouable hors ligne", async () => {
    await fillWithObsolete();
    vi.stubGlobal('fetch', vi.fn(async (url: string) => new Response('', { status: url.includes('images/') ? 404 : 200 })));

    const { failed, freed } = await downloadAllForOffline(() => {}, files);

    expect(failed).toEqual([BASE + 'images/a.jpg?v=1']);
    expect(freed).toBe(0);
    expect(stores.get(AUDIO_CACHE)!.has(BASE + 'sounds/a.mp3?v=1')).toBe(true);
    expect(stores.get(AUDIO_CACHE)!.has(BASE + 'sounds/retire.mp3')).toBe(true);
    expect(stores.get(IMAGES_CACHE)!.has(BASE + 'images/a.jpg')).toBe(true);
  });
});
