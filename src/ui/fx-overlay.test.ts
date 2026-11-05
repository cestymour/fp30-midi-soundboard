/* ================================================================
   fx-overlay.test.ts — Animation des curseurs d'une popup d'effets :
   positions fluides, valeurs envoyées seulement quand elles changent
================================================================ */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { FxControl, FxPreset } from '../types.ts';
import { FxOverlayController } from './fx-overlay.svelte.ts';

type Key = 'rev' | 'cut';
type Settings = Record<Key, number>;

function control(key: Key, min: number, max: number, neutral: number): FxControl<Key, Settings> {
  return {
    key, shortLabel: key, group: key, min, max, step: 1, neutral,
    read: settings => settings[key], apply: () => {}, formatValue: v => v,
  };
}

const CONTROLS = [control('rev', 0, 10, 1), control('cut', 0, 127, 64)];
const PRESETS: FxPreset<Key>[] = [
  { key: 'reset', text: 'Reset', values: null },
  { key: 'big',   text: 'Grand', values: { rev: 9 } },
];

// requestAnimationFrame piloté à la main : chaque appel à frame(t) exécute les rappels en attente
let callbacks: FrameRequestCallback[] = [];
function frame(time: number): void {
  const pending = callbacks;
  callbacks = [];
  pending.forEach(cb => cb(time));
}

beforeEach(() => {
  callbacks = [];
  vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => { callbacks.push(cb); return callbacks.length; });
  vi.stubGlobal('cancelAnimationFrame', () => {});
  vi.spyOn(performance, 'now').mockReturnValue(0);
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

function makeOverlay() {
  const state: Settings = { rev: 1, cut: 64 };
  const applied: [Key, number][] = [];
  const overlay = new FxOverlayController<Key, Settings>({
    overlayId: 'test', ariaLabel: 'test',
    attributes: { preset: 'p', control: 'c', railFor: 'r', sliderFor: 's', resetOne: 'o' },
    controls: CONTROLS, presets: PRESETS, panelSelector: '', gridSelector: '',
    readSettings: () => state,
    applyValue: (c, value) => { state[c.key] = value; applied.push([c.key, value]); },
    refreshToolbar: () => {},
  });
  overlay.build();
  frame(0); frame(0); // repères du neutre (sans rail : sans effet)
  return { overlay, applied };
}

describe('animation d\'un preset', () => {
  it('le curseur passe par des positions entre deux crans, la valeur envoyée reste sur un cran', () => {
    const { overlay, applied } = makeOverlay();
    overlay.applyPreset('big');
    expect(overlay.isAnimating).toBe(true);

    const positions: number[] = [];
    for (let t = 16; t <= 400; t += 16) {
      frame(t);
      positions.push(overlay.values.rev);
    }
    expect(positions.some(p => !Number.isInteger(p))).toBe(true);
    expect(overlay.values.rev).toBe(9);
    expect(overlay.isAnimating).toBe(false);
    expect(overlay.activePresetKey).toBe('big');
    expect(applied.every(([, v]) => Number.isInteger(v))).toBe(true);
  });

  it('n\'envoie une valeur que si elle change, et jamais un contrôle qui ne bouge pas', () => {
    const { overlay, applied } = makeOverlay();
    overlay.applyPreset('big');
    for (let t = 16; t <= 400; t += 16) frame(t);

    const sentRev = applied.filter(([k]) => k === 'rev').map(([, v]) => v);
    expect(sentRev.at(-1)).toBe(9);
    expect(new Set(sentRev).size).toBe(sentRev.length); // aucun envoi répété
    expect(sentRev.length).toBeLessThanOrEqual(8);       // au plus un envoi par cran, de 2 à 9
    expect(applied.some(([k]) => k === 'cut')).toBe(false);
  });

  it('Reset quand tout est déjà au neutre : ni animation ni envoi', () => {
    const { overlay, applied } = makeOverlay();
    overlay.reset();
    expect(overlay.isAnimating).toBe(false);
    expect(callbacks).toHaveLength(0);
    expect(applied).toEqual([]);
    expect(overlay.activePresetKey).toBe('reset');
  });
});
