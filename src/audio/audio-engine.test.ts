import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Le module crée le moteur à l'import, qui lit window.location
vi.hoisted(() => {
  (globalThis as { window?: unknown }).window ??= { location: { protocol: 'http:' } };
});

import { MediaElementTrack } from './audio-engine.ts';

type AudioEngine = ConstructorParameters<typeof MediaElementTrack>[0];

/** Élément <audio> factice : les événements de chargement sont déclenchés à la main */
class FakeAudio extends EventTarget {
  src: string;
  preload = '';
  readyState = 0;
  duration = NaN;
  currentTime = 0;
  volume = 1;
  paused = true;
  playbackRate = 1;
  defaultPlaybackRate = 1;
  loads = 0;
  constructor(src = '') { super(); this.src = src; }
  load(): void { this.loads++; }
  async play(): Promise<void> { this.paused = false; }
  pause(): void { this.paused = true; }
  removeAttribute(name: string): void { if (name === 'src') this.src = ''; }
}

/** Moteur réduit à ce dont la piste a besoin (pas de graphe Web Audio) */
function fakeEngine(): AudioEngine {
  return {
    canUseMediaElementSource: false,
    state: { playbackRate: 1 },
    resume: async () => {},
    unregisterTrack: () => {},
  } as unknown as AudioEngine;
}

function makeTrack(): { track: MediaElementTrack; audio: FakeAudio } {
  const track = new MediaElementTrack(fakeEngine(), 'sounds/a.mp3');
  return { track, audio: track.audio as unknown as FakeAudio };
}

beforeEach(() => {
  vi.stubGlobal('Audio', FakeAudio);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('MediaElementTrack.load (bug n° 20)', () => {
  it('attend que le fichier soit prêt', async () => {
    const { track, audio } = makeTrack();
    let loaded = false;
    const done = track.load().then(() => { loaded = true; });

    await Promise.resolve();
    expect(loaded).toBe(false);

    audio.readyState = 4;
    audio.dispatchEvent(new Event('canplaythrough'));
    await done;
    expect(loaded).toBe(true);
  });

  it('fichier introuvable : la promesse de load() est rejetée, et le fichier demandé une seule fois', async () => {
    const { track, audio } = makeTrack();
    const done = track.load();
    audio.dispatchEvent(new Event('error'));

    await expect(done).rejects.toThrow('Impossible de charger');
    expect(audio.loads).toBe(1);
  });

  it('piste libérée pendant le chargement : load() rend la main sans attendre le fichier', async () => {
    const { track } = makeTrack();
    const done = track.load();
    track.dispose();
    await expect(done).resolves.toBe(track);
  });
});

describe('MediaElementTrack.dispose (bug n° 22)', () => {
  it("vide la source de l'élément <audio>, pour libérer son décodeur", () => {
    const { track, audio } = makeTrack();
    track.dispose();
    expect(audio.src).toBe('');
    expect(audio.loads).toBe(1);
    expect(audio.paused).toBe(true);
  });
});
