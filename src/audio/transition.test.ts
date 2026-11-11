import { beforeEach, describe, expect, it, vi } from 'vitest';

const { playSound, stopSound, setTransitionVolume, stopAllSounds, sendEmergencyStopMidi } = vi.hoisted(() => ({
  playSound: vi.fn(async () => {}),
  stopSound: vi.fn(),
  setTransitionVolume: vi.fn(),
  stopAllSounds: vi.fn(),
  sendEmergencyStopMidi: vi.fn(),
}));

vi.mock('./playback.ts', () => ({ playSound, stopSound }));
vi.mock('./sounds.ts', () => ({ stopAllSounds }));
vi.mock('../midi/midi.ts', () => ({ sendEmergencyStopMidi }));
vi.mock('./audio-engine.ts', () => ({ AudioEngineAPI: { setTransitionVolume } }));
vi.mock('../config/tabs.ts', () => ({
  getTransitionMusics: () => MUSICS,
}));

import type { TransitionMusic } from '../types.ts';
import { STATE } from '../state.svelte.ts';
import {
  RESTART_WINDOW_MS, getNextMoment, getSelectedTransitionMusic, initTransition, launchTransition,
  selectTransitionMusic, stopTransition,
} from './transition.ts';

const MUSICS: TransitionMusic[] = [
  { id: 'a', name: 'A', file: 'sounds/a.mp3', start: 2, restarts: [40, 70, 100] },
  { id: 'b', name: 'B', file: 'sounds/b.mp3', restarts: [25] },
];

/** localStorage en mémoire */
function stubStorage(initial: Record<string, string> = {}): Map<string, string> {
  const store = new Map(Object.entries(initial));
  vi.stubGlobal('localStorage', {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => { store.set(key, value); },
  });
  return store;
}

const T0 = 1_000_000_000_000;

/** Position de départ du dernier lancement */
function lastStartAt(): number {
  const calls = playSound.mock.calls as unknown as [TransitionMusic, { startAt: number }][];
  return calls[calls.length - 1][1].startAt;
}

beforeEach(() => {
  vi.unstubAllGlobals();
  playSound.mockClear();
  stopSound.mockClear();
  setTransitionVolume.mockClear();
  stopAllSounds.mockClear();
  sendEmergencyStopMidi.mockClear();
  STATE.currentSoundItem = null;
  stubStorage();
  initTransition();
});

describe('moments marquants', () => {
  it('ordre : 0 au début du spectacle, puis 1, 2, 3, 1, 2, 3…', async () => {
    const starts: number[] = [];
    for (let i = 0; i < 8; i++) {
      await launchTransition(T0 + i * 60_000);
      starts.push(lastStartAt());
    }
    expect(starts).toEqual([2, 40, 70, 100, 40, 70, 100, 40]);
    expect(playSound).toHaveBeenLastCalledWith(MUSICS[0], { route: 'transition', startAt: 40 });
  });

  it('un seul moment après le 0 : 0, 1, 1, 1…', async () => {
    selectTransitionMusic('b');
    const starts: number[] = [];
    for (let i = 0; i < 4; i++) {
      await launchTransition(T0 + i * 60_000);
      starts.push(lastStartAt());
    }
    expect(starts).toEqual([0, 25, 25, 25]);
  });

  it("un moment joué hors de l'ordre : le prévu devient son suivant", async () => {
    await launchTransition(T0);           // 0
    await launchTransition(T0 + 1000, 3); // 3 au lieu de 1
    expect(lastStartAt()).toBe(100);
    expect(getNextMoment(T0 + 2000)).toBe(1);
    await launchTransition(T0 + 3000, 1);
    expect(getNextMoment(T0 + 4000)).toBe(2);
  });

  it('rejouer le 0 en plein spectacle : le prévu redevient le 1', async () => {
    await launchTransition(T0);
    await launchTransition(T0 + 1000);    // 1
    await launchTransition(T0 + 2000, 0);
    expect(lastStartAt()).toBe(2);
    expect(getNextMoment(T0 + 3000)).toBe(1);
  });

  it('longtemps après le dernier lancement (spectacle suivant), on revient au 0', async () => {
    await launchTransition(T0);
    await launchTransition(T0 + 1000);
    expect(getNextMoment(T0 + 1000 + RESTART_WINDOW_MS - 1)).toBe(2);
    expect(getNextMoment(T0 + 1000 + RESTART_WINDOW_MS)).toBe(0);
  });

  it('changer de musique ramène au 0', async () => {
    await launchTransition(T0);
    await launchTransition(T0 + 1000);
    selectTransitionMusic('b');
    expect(getNextMoment(T0 + 2000)).toBe(0);
    selectTransitionMusic('a');
    expect(getNextMoment(T0 + 2000)).toBe(0);
  });
});

describe('lancement et arrêt', () => {
  it("le lancement coupe tout, comme l'arrêt d'urgence : sons et piano (la musique est coupée par playSound)", async () => {
    await launchTransition(T0);
    expect(stopAllSounds).toHaveBeenCalledTimes(1);
    expect(sendEmergencyStopMidi).toHaveBeenCalledTimes(1);
    expect(playSound).toHaveBeenCalledTimes(1);
  });

  it("l'arrêt coupe la musique de transition en fondu, et rien d'autre", () => {
    STATE.currentSoundItem = MUSICS[0];
    stopTransition();
    expect(stopSound).toHaveBeenCalledWith(true);
  });

  it("l'arrêt ne coupe pas une musique des onglets", () => {
    STATE.currentSoundItem = { id: 'x', name: 'X', file: 'sounds/x.mp3' };
    stopTransition();
    expect(stopSound).not.toHaveBeenCalled();
  });

  it('changer de musique pendant la lecture lance la nouvelle, depuis son moment 0', () => {
    STATE.currentSoundItem = MUSICS[0];
    selectTransitionMusic('b');
    expect(playSound).toHaveBeenLastCalledWith(MUSICS[1], { route: 'transition', startAt: 0 });
  });
});

describe('mémorisation', () => {
  it('garde le choix, le dernier lancement, le dernier moment et le volume après un rechargement', async () => {
    const store = stubStorage();
    await launchTransition(T0);
    await launchTransition(T0 + 1000); // 1

    STATE.transitionMusicId = null;
    STATE.transitionLastLaunch = null;
    STATE.transitionLastMoment = 0;
    stubStorage(Object.fromEntries(store));
    initTransition();

    expect(getSelectedTransitionMusic()).toBe(MUSICS[0]);
    expect(getNextMoment(T0 + 2000)).toBe(2);
  });

  it('une musique retirée de la liste : la première est choisie', () => {
    stubStorage({ 'fp30-soundboard.transition': JSON.stringify({ musicId: 'disparue', lastLaunch: null, volume: 0.5 }) });
    initTransition();
    expect(getSelectedTransitionMusic()).toBe(MUSICS[0]);
    expect(STATE.transitionVolume).toBe(0.5);
    expect(setTransitionVolume).toHaveBeenLastCalledWith(0.5);
  });

  it('stockage illisible ou indisponible : valeurs par défaut', () => {
    vi.stubGlobal('localStorage', { getItem: () => { throw new Error('bloqué'); }, setItem: () => { throw new Error('bloqué'); } });
    initTransition();
    expect(getSelectedTransitionMusic()).toBe(MUSICS[0]);
    expect(STATE.transitionVolume).toBe(1);
    expect(() => selectTransitionMusic('b')).not.toThrow();
  });
});
