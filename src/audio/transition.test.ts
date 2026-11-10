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
  RESTART_WINDOW_MS, getSelectedTransitionMusic, initTransition, launchTransition,
  resetTransitionStart, selectTransitionMusic, stopTransition, willRestart,
} from './transition.ts';

const MUSICS: TransitionMusic[] = [
  { id: 'a', name: 'A', file: 'sounds/a.mp3', start: 2, restart: 40 },
  { id: 'b', name: 'B', file: 'sounds/b.mp3', restart: 25 },
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

beforeEach(() => {
  vi.unstubAllGlobals();
  playSound.mockClear();
  stopSound.mockClear();
  stopAllSounds.mockClear();
  sendEmergencyStopMidi.mockClear();
  setTransitionVolume.mockClear();
  STATE.currentSoundItem = null;
  stubStorage();
  initTransition();
});

describe('point de départ', () => {
  it('le premier lancement part du début (`start`), les suivants du point de reprise', async () => {
    await launchTransition(T0);
    expect(playSound).toHaveBeenLastCalledWith(MUSICS[0], { route: 'transition', startAt: 2 });

    await launchTransition(T0 + 60_000);
    expect(playSound).toHaveBeenLastCalledWith(MUSICS[0], { route: 'transition', startAt: 40 });
  });

  it('sans `start`, le premier lancement part de 0', async () => {
    selectTransitionMusic('b');
    await launchTransition(T0);
    expect(playSound).toHaveBeenLastCalledWith(MUSICS[1], { route: 'transition', startAt: 0 });
  });

  it('longtemps après le dernier lancement (spectacle suivant), on repart du début', async () => {
    await launchTransition(T0);
    expect(willRestart(T0 + RESTART_WINDOW_MS - 1)).toBe(true);
    expect(willRestart(T0 + RESTART_WINDOW_MS)).toBe(false);
  });

  it('« repartir du début » et changer de musique remettent le départ au début', async () => {
    await launchTransition(T0);
    resetTransitionStart();
    expect(willRestart(T0 + 1000)).toBe(false);

    await launchTransition(T0);
    selectTransitionMusic('b');
    expect(willRestart(T0 + 1000)).toBe(false);
  });
});

describe('lancement et arrêt', () => {
  it('le lancement coupe tout, comme l\'arrêt d\'urgence : sons et piano (la musique est coupée par playSound)', async () => {
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

  it('changer de musique pendant la lecture lance la nouvelle, depuis son début', () => {
    STATE.currentSoundItem = MUSICS[0];
    selectTransitionMusic('b');
    expect(playSound).toHaveBeenLastCalledWith(MUSICS[1], { route: 'transition', startAt: 0 });
  });
});

describe('mémorisation', () => {
  it('garde le choix, le dernier lancement et le volume après un rechargement', async () => {
    const store = stubStorage();
    selectTransitionMusic('b');
    await launchTransition(T0);

    STATE.transitionMusicId = null;
    STATE.transitionLastLaunch = null;
    stubStorage(Object.fromEntries(store));
    initTransition();

    expect(getSelectedTransitionMusic()).toBe(MUSICS[1]);
    expect(willRestart(T0 + 1000)).toBe(true);
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
