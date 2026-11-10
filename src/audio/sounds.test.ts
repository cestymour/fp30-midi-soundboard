import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { AudioItem } from '../types.ts';

// Contexte Web Audio factice : sources, gains et décodage
const { context, sources, decodeAudioData, setSoundsVolume } = vi.hoisted(() => {
  class FakeParam {
    value = 1;
    cancelScheduledValues(): void {}
    setValueAtTime(value: number): void { this.value = value; }
    linearRampToValueAtTime(value: number): void { this.value = value; }
  }
  class FakeSource {
    buffer: unknown = null;
    onended: (() => void) | null = null;
    started: { offset: number; duration: number } | null = null;
    stopped = false;
    connect(): void {}
    disconnect(): void {}
    start(_when: number, offset: number, duration: number): void { this.started = { offset, duration }; }
    stop(): void { this.stopped = true; }
    /** Fin de lecture (ou fin de la rampe d'arrêt) */
    end(): void { this.onended?.(); }
  }
  const sources: FakeSource[] = [];
  /** Taille d'un son décodé : 2 s en stéréo, ou 30 Mo pour les fichiers « gros » */
  const decodeAudioData = vi.fn(async (data: { file: string }) => {
    const length = data.file.includes('gros') ? 30 * 1024 * 1024 / 8 : 88200;
    return { duration: 2, length, numberOfChannels: 2 };
  });
  const context = {
    currentTime: 0,
    createBufferSource: () => { const source = new FakeSource(); sources.push(source); return source; },
    createGain: () => ({ gain: new FakeParam(), connect() {}, disconnect() {} }),
    decodeAudioData,
  };
  return { context, sources, decodeAudioData, setSoundsVolume: vi.fn() };
});

vi.mock('./audio-engine.ts', () => ({
  AudioEngineAPI: {
    getSoundsOutput: () => ({ context, input: {} }),
    resume: async () => {},
    setSoundsVolume,
  },
}));

import { STATE } from '../state.svelte.ts';
import {
  MAX_SOUND_VOICES, getSoundProgress, playOneShot, setSoundVolume, soundEvents, stopAllSounds,
} from './sounds.ts';
import type { SoundEvent } from './sounds.ts';

let nextId = 0;
/** Son au fichier unique (le cache des sons décodés survit d'un test à l'autre) */
function makeItem(extra: Partial<AudioItem> = {}): AudioItem {
  nextId++;
  return { id: `s${nextId}`, name: `S${nextId}`, file: `sounds/s${nextId}.mp3`, ...extra };
}

let events: SoundEvent[] = [];
let unsubscribe: () => void;

beforeEach(() => {
  vi.stubGlobal('requestAnimationFrame', () => 1);
  vi.stubGlobal('fetch', async (file: string) => (
    file.includes('absent')
      ? { ok: false, status: 404 }
      : { ok: true, arrayBuffer: async () => ({ file }) }
  ));
  events = [];
  unsubscribe = soundEvents.on(event => { if (event.type !== 'progress') events.push(event); });
  context.currentTime = 0;
  decodeAudioData.mockClear();
});

afterEach(() => {
  stopAllSounds();
  sources.forEach(source => source.end());
  sources.length = 0;
  unsubscribe();
  vi.unstubAllGlobals();
});

describe('superposition', () => {
  it('deux sons différents jouent ensemble', async () => {
    await playOneShot(makeItem());
    await playOneShot(makeItem());
    expect(sources.map(source => source.stopped)).toEqual([false, false]);
    expect(STATE.soundVoices).toBe(2);
  });

  it('un 2e clic relance le son par-dessus le premier, sans le couper ni le redécoder', async () => {
    const item = makeItem();
    await playOneShot(item);
    await playOneShot(item);
    expect(sources).toHaveLength(2);
    expect(sources[0].stopped).toBe(false);
    expect(decodeAudioData).toHaveBeenCalledTimes(1);
  });

  it('deux clics rapides pendant le décodage ne décodent le fichier qu\'une fois', async () => {
    const item = makeItem();
    await Promise.all([playOneShot(item), playOneShot(item)]);
    expect(decodeAudioData).toHaveBeenCalledTimes(1);
    expect(sources).toHaveLength(2);
  });

  it('ne touche pas à la musique en cours', async () => {
    const music: AudioItem = { id: 'm', name: 'M', file: 'sounds/m.mp3' };
    STATE.currentSoundItem = music;
    await playOneShot(makeItem());
    expect(STATE.currentSoundItem).toBe(music);
    STATE.currentSoundItem = null;
  });

  it(`au-delà de ${MAX_SOUND_VOICES} sons, le plus ancien est coupé pour laisser partir le nouveau`, async () => {
    const items = Array.from({ length: MAX_SOUND_VOICES + 1 }, () => makeItem());
    for (const item of items) await playOneShot(item);
    expect(sources[0].stopped).toBe(true);
    expect(sources.slice(1).every(source => !source.stopped)).toBe(true);
    expect(STATE.soundVoices).toBe(MAX_SOUND_VOICES);
    expect(events).toContainEqual({ type: 'end', item: items[0], remaining: 0 });
  });
});

describe('plage jouée', () => {
  it('respecte `start` et `end`', async () => {
    await playOneShot(makeItem({ start: 0.5, end: 1.5 }));
    expect(sources[0].started).toEqual({ offset: 0.5, duration: 1 });
  });

  it('sans `end`, joue jusqu\'à la fin du fichier', async () => {
    await playOneShot(makeItem({ start: 0.5 }));
    expect(sources[0].started).toEqual({ offset: 0.5, duration: 1.5 });
  });
});

describe('fin et arrêt', () => {
  it('la fin d\'une voix donne le nombre de voix restantes du même son', async () => {
    const item = makeItem();
    await playOneShot(item);
    await playOneShot(item);
    sources[0].end();
    expect(events.at(-1)).toEqual({ type: 'end', item, remaining: 1 });
    sources[1].end();
    expect(events.at(-1)).toEqual({ type: 'end', item, remaining: 0 });
    expect(STATE.soundVoices).toBe(0);
  });

  it('stopAllSounds coupe tous les sons', async () => {
    await playOneShot(makeItem());
    await playOneShot(makeItem());
    stopAllSounds();
    expect(sources.every(source => source.stopped)).toBe(true);
    expect(STATE.soundVoices).toBe(0);
  });

  it('un son encore en décodage au moment de l\'arrêt ne part pas', async () => {
    let finishDecode!: () => void;
    decodeAudioData.mockImplementationOnce(() => new Promise(resolve => {
      finishDecode = () => resolve({ duration: 2, length: 88200, numberOfChannels: 2 });
    }));
    const playing = playOneShot(makeItem());
    await vi.waitFor(() => expect(finishDecode).toBeDefined());
    stopAllSounds();
    finishDecode();
    await playing;
    expect(sources).toHaveLength(0);
  });

  it('un fichier introuvable est signalé', async () => {
    const item = makeItem({ file: 'sounds/absent.mp3' });
    await playOneShot(item);
    expect(events).toEqual([{ type: 'missing', item }]);
    expect(sources).toHaveLength(0);
  });
});

describe('progression et volume', () => {
  it('suit la voix la plus récente du son', async () => {
    const item = makeItem();
    await playOneShot(item);
    context.currentTime = 1;
    await playOneShot(item);
    context.currentTime = 1.5;
    expect(getSoundProgress(item)).toBeCloseTo(0.25);
    expect(getSoundProgress(makeItem())).toBeNull();
  });

  it('le volume des sons est gardé et transmis au moteur', () => {
    setSoundVolume(0.4);
    expect(STATE.soundVolume).toBe(0.4);
    expect(setSoundsVolume).toHaveBeenCalledWith(0.4);
    setSoundVolume(1);
  });
});

describe('mémoire des sons décodés', () => {
  it('au-delà du budget, le son joué il y a le plus longtemps est oublié', async () => {
    const first  = makeItem({ file: 'sounds/gros-1.mp3' });
    const second = makeItem({ file: 'sounds/gros-2.mp3' });
    await playOneShot(first);
    await playOneShot(second);
    await playOneShot(second);
    expect(decodeAudioData).toHaveBeenCalledTimes(2);
    await playOneShot(first);
    expect(decodeAudioData).toHaveBeenCalledTimes(3);
  });
});
