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
import { playbackEvents, playSound, setAudioVolume, stopSound, togglePlayPause } from './playback.ts';

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

describe('reprise après pause (bug n° 10)', () => {
  /** Met le son en pause, puis rend la prochaine reprise (play()) pilotable à la main */
  async function pausedWithPendingPlay(): Promise<{ a: Track; resolve: () => void; reject: () => void }> {
    const a = await play(A);
    vi.advanceTimersByTime(1000);
    togglePlayPause();
    vi.advanceTimersByTime(1000);
    expect(STATE.isPaused).toBe(true);

    let resolve!: () => void;
    let reject!: () => void;
    a.play = () => new Promise<Track>((ok, ko) => {
      resolve = () => { a.paused = false; ok(a); };
      reject = () => ko(new Error('play() refusé'));
    });
    return { a, resolve: () => resolve(), reject: () => reject() };
  }

  it('STOP avant la fin de play() : ni erreur, ni reprise', async () => {
    const { resolve } = await pausedWithPendingPlay();
    const events: string[] = [];
    const off = playbackEvents.on(e => events.push(e.type));

    togglePlayPause();
    stopSound(false);
    resolve();
    await vi.runAllTimersAsync();
    off();

    expect(events).toEqual(['stop']);
    expect(STATE.currentAudio).toBeNull();
    expect(STATE.isPaused).toBe(false);
  });

  it('autre son lancé avant la fin de play() : la reprise ne touche pas au nouveau son', async () => {
    const { resolve } = await pausedWithPendingPlay();

    togglePlayPause();
    const b = await play(B);
    vi.advanceTimersByTime(1000);
    const events: string[] = [];
    const off = playbackEvents.on(e => events.push(e.type));
    resolve();
    await vi.runAllTimersAsync();
    off();

    expect(events).not.toContain('resume');
    expect(STATE.currentAudio).toBe(b);
    expect(b.volume).toBe(STATE.audioVolume);
  });

  it('play() refusé : le son reste en pause, sans promesse rejetée non gérée', async () => {
    const { a, reject } = await pausedWithPendingPlay();
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

    togglePlayPause();
    reject();
    await vi.runAllTimersAsync();

    expect(STATE.currentAudio).toBe(a);
    expect(STATE.isPaused).toBe(true);
    expect(warn).toHaveBeenCalled();
  });
});

describe('volume pendant un fondu (bug n° 11)', () => {
  it("volume baissé pendant le fondu d'entrée : le son reste au volume choisi", async () => {
    STATE.audioVolume = 0.8;
    const a = await play(A);
    vi.advanceTimersByTime(100);

    setAudioVolume(0.2);
    vi.advanceTimersByTime(1000);

    expect(a.volume).toBe(0.2);
    expect(a.disposed).toBe(false);
  });

  it('volume déplacé pendant le fondu de pause : le son finit quand même en pause, au silence', async () => {
    STATE.audioVolume = 0.8;
    const a = await play(A);
    vi.advanceTimersByTime(1000);

    togglePlayPause();
    vi.advanceTimersByTime(50);
    setAudioVolume(0.5);
    vi.advanceTimersByTime(1000);

    expect(STATE.isPaused).toBe(true);
    expect(a.paused).toBe(true);
    expect(a.volume).toBe(0);
  });

  it("volume déplacé pendant le fondu de sortie d'un STOP : la piste est libérée", async () => {
    const a = await play(A);
    vi.advanceTimersByTime(1000);

    stopSound(true);
    vi.advanceTimersByTime(100);
    setAudioVolume(0.5);
    vi.advanceTimersByTime(1000);

    expect(a.disposed).toBe(true);
  });
});
