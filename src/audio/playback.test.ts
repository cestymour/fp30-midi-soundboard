import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { AudioItem } from '../types.ts';

// Pistes factices à la place des éléments <audio> et du graphe Web Audio
const { FakeTrack, liveTracks } = vi.hoisted(() => {
  const liveTracks = new Set<unknown>();
  class FakeTrack {
    volume = 1;
    currentTime = 0;
    duration = 10;
    paused = true;
    disposed = false;
    onended: (() => void) | null = null;
    constructor(public src: string) { liveTracks.add(this); }
    setPlaybackRange(): void {}
    async load(): Promise<this> { return this; }
    async play(): Promise<this> { this.paused = false; return this; }
    pause(): void { this.paused = true; }
    stop(): void { this.paused = true; this.currentTime = 0; }
    dispose(): void { this.stop(); this.disposed = true; liveTracks.delete(this); }
  }
  return { FakeTrack, liveTracks };
});

vi.mock('./audio-engine.ts', () => ({
  AudioEngineAPI: { createTrack: (src: string) => new FakeTrack(src) },
}));

import { STATE } from '../state.svelte.ts';
import { playSound, stopSound, togglePlayPause } from './playback.ts';

type Track = InstanceType<typeof FakeTrack>;

const A: AudioItem = { id: 'a', name: 'A', file: 'sounds/a.mp3' };
const B: AudioItem = { id: 'b', name: 'B', file: 'sounds/b.mp3' };

/** Lance un son et attend la fin de son chargement */
async function play(item: AudioItem): Promise<Track> {
  const done = playSound(item);
  const track = STATE.currentAudio as unknown as Track;
  await done;
  return track;
}

beforeEach(() => {
  vi.useFakeTimers();
  vi.stubGlobal('requestAnimationFrame', () => 1);
  vi.stubGlobal('cancelAnimationFrame', () => {});
});

afterEach(() => {
  stopSound(false);
  vi.runOnlyPendingTimers();
  vi.useRealTimers();
  vi.unstubAllGlobals();
  liveTracks.clear();
});

describe('changement de son', () => {
  it("libère l'ancienne piste quand un autre son est lancé pendant son fondu de sortie", async () => {
    const a = await play(A);
    vi.advanceTimersByTime(1000);

    stopSound(true);
    const b = await play(B);

    expect(a.disposed).toBe(true);
    expect([...liveTracks]).toEqual([b]);
  });

  it('libère la piste à la fin du fondu de sortie', async () => {
    const a = await play(A);
    stopSound(true);
    vi.advanceTimersByTime(1000);

    expect(a.disposed).toBe(true);
    expect(liveTracks.size).toBe(0);
  });
});

describe('fondus simultanés', () => {
  it('une pause pendant le fondu d\'entrée met bien le son en pause', async () => {
    const a = await play(A);
    vi.advanceTimersByTime(100);
    a.currentTime = 3;

    togglePlayPause();
    vi.advanceTimersByTime(1000);

    expect(STATE.isPaused).toBe(true);
    expect(a.paused).toBe(true);
    expect(a.volume).toBe(0);
    expect(a.currentTime).toBe(3);
    expect(a.disposed).toBe(false);
  });

  it('deux clics rapides sur pause : le son reste en pause, au volume 0', async () => {
    const a = await play(A);
    vi.advanceTimersByTime(1000);

    togglePlayPause();
    vi.advanceTimersByTime(50);
    togglePlayPause();
    vi.advanceTimersByTime(1000);

    expect(STATE.isPaused).toBe(true);
    expect(a.paused).toBe(true);
    expect(a.volume).toBe(0);
  });
});
