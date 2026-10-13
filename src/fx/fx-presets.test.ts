/* ================================================================
   fx-presets.test.ts — Logique commune des presets d'effets
================================================================ */

import { describe, expect, it, vi } from 'vitest';
import type { FxControl, FxPreset } from '../types.ts';
import {
  buildControlNeutralTargetValues, buildPresetTargetValues, buildResetTargetValues, clampFxValue,
  easeOutCubic, inferActiveFxPresetKey, interpolateFxValues, isAnyFxControlModified, isFxControlNeutral,
} from './fx-presets.ts';
import type { FxCurrentValues } from './fx-presets.ts';
import { MIDI_FX_CONTROLS } from './midi-fx.ts';
import { MIDI_FX_PRESETS } from '../config/midi-fx.config.ts';
import { AUDIO_FX_PRESETS } from '../config/audio-fx.config.ts';

type Key = 'gain' | 'freq';

function control(key: Key, min: number, max: number, step: number, neutral: number): FxControl<Key, never> {
  return {
    key, label: key, shortLabel: key, group: key, min, max, step, neutral,
    read: () => neutral, apply: () => {}, formatValue: v => v,
  };
}

const CONTROLS = [control('gain', -15, 15, 1, 0), control('freq', 400, 20000, 100, 20000)];

const PRESETS: FxPreset<Key>[] = [
  { key: 'reset', text: 'Reset', values: null },
  { key: 'dark',  text: 'Sombre', values: { freq: 900 } },
  { key: 'loud',  text: 'Fort',   values: { gain: 6, freq: 20000 } },
];

const current = (gain: number | null, freq: number | null): FxCurrentValues<Key> => ({ gain, freq });

describe('clampFxValue', () => {
  it('borne la valeur entre min et max', () => {
    expect(clampFxValue(CONTROLS[0], 40)).toBe(15);
    expect(clampFxValue(CONTROLS[0], -40)).toBe(-15);
  });

  it('aligne la valeur sur le pas, compté depuis min', () => {
    expect(clampFxValue(CONTROLS[1], 449)).toBe(400);
    expect(clampFxValue(CONTROLS[1], 450)).toBe(500);
    expect(clampFxValue(CONTROLS[0], 2.4)).toBe(2);
  });
});

describe('buildPresetTargetValues', () => {
  it('les contrôles absents du preset reviennent à leur neutre, pas à leur position actuelle', () => {
    expect(buildPresetTargetValues(CONTROLS, PRESETS[1])).toEqual({ gain: 0, freq: 900 });
  });

  it('values: null (reset) ramène tout au neutre', () => {
    expect(buildPresetTargetValues(CONTROLS, PRESETS[0])).toEqual({ gain: 0, freq: 20000 });
    expect(buildResetTargetValues(CONTROLS)).toEqual({ gain: 0, freq: 20000 });
  });

  it('les valeurs hors bornes sont ramenées dans les bornes', () => {
    expect(buildPresetTargetValues(CONTROLS, { values: { gain: 99, freq: 10 } })).toEqual({ gain: 15, freq: 400 });
  });
});

describe('inferActiveFxPresetKey', () => {
  it('reconnaît le reset quand tous les curseurs sont au neutre', () => {
    expect(inferActiveFxPresetKey(CONTROLS, PRESETS, current(0, 20000))).toBe('reset');
  });

  it('reconnaît un preset partiel (contrôles non listés au neutre)', () => {
    expect(inferActiveFxPresetKey(CONTROLS, PRESETS, current(0, 900))).toBe('dark');
    expect(inferActiveFxPresetKey(CONTROLS, PRESETS, current(6, 20000))).toBe('loud');
  });

  it('aucun preset si un curseur a été déplacé à la main', () => {
    expect(inferActiveFxPresetKey(CONTROLS, PRESETS, current(1, 900))).toBeNull();
  });

  it('aucun preset tant que les curseurs ne sont pas construits', () => {
    expect(inferActiveFxPresetKey(CONTROLS, PRESETS, current(null, null))).toBeNull();
  });

  it('compare après alignement sur le pas', () => {
    expect(inferActiveFxPresetKey(CONTROLS, PRESETS, current(0, 920))).toBe('dark');
  });
});

describe('neutre et modifications', () => {
  it('un curseur absent compte comme neutre', () => {
    expect(isFxControlNeutral(CONTROLS[0], null)).toBe(true);
    expect(isFxControlNeutral(CONTROLS[0], 0)).toBe(true);
    expect(isFxControlNeutral(CONTROLS[0], 1)).toBe(false);
  });

  it('détecte un effet actif', () => {
    expect(isAnyFxControlModified(CONTROLS, current(0, 20000))).toBe(false);
    expect(isAnyFxControlModified(CONTROLS, current(0, 900))).toBe(true);
  });

  it('ramène un seul contrôle au neutre, les autres restent en place', () => {
    expect(buildControlNeutralTargetValues(CONTROLS, current(5, 900), 'freq')).toEqual({ gain: 5, freq: 20000 });
  });
});

describe('animation', () => {
  it('ease-out cubique de 0 à 1', () => {
    expect(easeOutCubic(0)).toBe(0);
    expect(easeOutCubic(1)).toBe(1);
    expect(easeOutCubic(0.5)).toBeCloseTo(0.875);
  });

  it('interpole en partant du neutre pour un curseur absent', () => {
    const target = { gain: 10, freq: 400 };
    expect(interpolateFxValues(CONTROLS, current(null, 20000), target, 0)).toEqual({ gain: 0, freq: 20000 });
    expect(interpolateFxValues(CONTROLS, current(null, 20000), target, 1)).toEqual(target);
    expect(interpolateFxValues(CONTROLS, current(0, 20000), target, 0.5)).toEqual({ gain: 5, freq: 10200 });
  });
});

describe('presets de la configuration', () => {
  it('presets MIDI : valeurs dans les bornes des contrôles', () => {
    for (const preset of MIDI_FX_PRESETS) {
      for (const [key, value] of Object.entries(preset.values ?? {})) {
        const c = MIDI_FX_CONTROLS.find(ctrl => ctrl.key === key)!;
        expect(value, `${preset.key}.${key}`).toBe(clampFxValue(c, value as number));
      }
    }
  });

  it('presets audio : valeurs dans les bornes des contrôles', async () => {
    // Le moteur audio lit window.location à sa création
    vi.stubGlobal('window', { location: { protocol: 'https:' } });
    const { AUDIO_FX_CONTROLS } = await import('./audio-fx.ts');
    for (const preset of AUDIO_FX_PRESETS) {
      for (const [key, value] of Object.entries(preset.values ?? {})) {
        const c = AUDIO_FX_CONTROLS.find(ctrl => ctrl.key === key)!;
        expect(value, `${preset.key}.${key}`).toBe(clampFxValue(c, value as number));
      }
    }
    vi.unstubAllGlobals();
  });

  it('chaque preset est reconnu comme actif quand ses valeurs sont appliquées', () => {
    for (const preset of MIDI_FX_PRESETS) {
      const values = buildPresetTargetValues(MIDI_FX_CONTROLS, preset);
      expect(inferActiveFxPresetKey(MIDI_FX_CONTROLS, MIDI_FX_PRESETS, values)).toBe(preset.key);
    }
  });
});
