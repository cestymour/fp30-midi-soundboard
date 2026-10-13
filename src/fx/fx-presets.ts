/* ================================================================
   fx-presets.ts — Logique commune des popups d'effets (MIDI et audio)
   Fonctions pures, paramétrées par le tableau de contrôles :
   - les `values` d'un preset ne listent que les contrôles qu'il
     modifie, les autres reviennent à leur `neutral` (pas à leur
     position actuelle) ;
   - `values: null` est le preset de reset ;
   - le preset actif est déduit des valeurs courantes des curseurs.
================================================================ */

import type { FxControl, FxPreset } from '../types.ts';

/** Valeur cible de chaque contrôle */
export type FxValues<Key extends string> = Record<Key, number>;

/** Valeur courante de chaque curseur (null : curseur absent) */
export type FxCurrentValues<Key extends string> = Record<Key, number | null>;

/** Seul `key` et les bornes sont utiles ici : accepte les contrôles MIDI comme audio */
type AnyFxControl<Key extends string> = FxControl<Key, never>;

/** Ramène une valeur dans les bornes du contrôle, alignée sur son pas */
export function clampFxValue<Key extends string>(control: AnyFxControl<Key>, value: number): number {
  const clamped = Math.max(control.min, Math.min(control.max, value));
  const step    = Number(control.step) || 1;
  const stepped = Math.round((clamped - control.min) / step) * step + control.min;
  return Math.max(control.min, Math.min(control.max, stepped));
}

/** Valeurs cibles d'un preset : valeurs listées, `neutral` pour les autres */
export function buildPresetTargetValues<Key extends string>(
  controls: AnyFxControl<Key>[], preset: Pick<FxPreset<Key>, 'values'>,
): FxValues<Key> {
  const targetValues = {} as FxValues<Key>;
  const values: Partial<Record<Key, number>> = preset.values == null ? {} : preset.values;
  controls.forEach(control => {
    const rawValue = Object.prototype.hasOwnProperty.call(values, control.key)
      ? values[control.key]!
      : control.neutral;
    targetValues[control.key] = clampFxValue(control, rawValue);
  });
  return targetValues;
}

/** Valeurs cibles du reset : tous les contrôles à leur `neutral` */
export function buildResetTargetValues<Key extends string>(controls: AnyFxControl<Key>[]): FxValues<Key> {
  return buildPresetTargetValues(controls, { values: {} });
}

/** Les curseurs sont-ils exactement sur les valeurs cibles (après clamp) ? */
export function fxTargetsMatchCurrent<Key extends string>(
  controls: AnyFxControl<Key>[], targetValues: FxValues<Key>, currentValues: FxCurrentValues<Key>,
): boolean {
  for (const c of controls) {
    const cur = currentValues[c.key];
    const tgt = targetValues[c.key];
    if (cur === null || Number.isNaN(cur)) return false;
    if (Math.abs(clampFxValue(c, cur) - tgt) > 1e-5) return false;
  }
  return true;
}

/** Premier preset dont les cibles correspondent aux curseurs, sinon null */
export function inferActiveFxPresetKey<Key extends string>(
  controls: AnyFxControl<Key>[], presets: FxPreset<Key>[], currentValues: FxCurrentValues<Key>,
): string | null {
  for (let i = 0; i < presets.length; i++) {
    const preset = presets[i];
    const targetValues = buildPresetTargetValues(controls, preset);
    if (fxTargetsMatchCurrent(controls, targetValues, currentValues)) return preset.key;
  }
  return null;
}

/** Curseur à sa valeur neutre (un curseur absent compte comme neutre) */
export function isFxControlNeutral<Key extends string>(control: AnyFxControl<Key>, value: number | null): boolean {
  if (value === null) return true;
  return Math.abs(value - control.neutral) < 0.0001;
}

/** Curseur écarté de sa valeur neutre (état visuel de la carte) */
export function isFxControlModified<Key extends string>(control: AnyFxControl<Key>, value: number): boolean {
  return Math.abs(value - control.neutral) > 0.0001;
}

export function isAnyFxControlModified<Key extends string>(
  controls: AnyFxControl<Key>[], currentValues: FxCurrentValues<Key>,
): boolean {
  return controls.some(control => !isFxControlNeutral(control, currentValues[control.key]));
}

/** Cibles pour ramener un seul contrôle à son neutre, les autres restant en place */
export function buildControlNeutralTargetValues<Key extends string>(
  controls: AnyFxControl<Key>[], currentValues: FxCurrentValues<Key>, controlKey: Key,
): FxValues<Key> {
  const targetValues = {} as FxValues<Key>;
  controls.forEach(c => {
    const v = currentValues[c.key];
    targetValues[c.key] = v === null || Number.isNaN(v) ? c.neutral : v;
  });
  const control = controls.find(c => c.key === controlKey)!;
  targetValues[controlKey] = clampFxValue(control, control.neutral);
  return targetValues;
}

/** Courbe d'animation des curseurs (ease-out cubique) */
export function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

/** Valeurs intermédiaires d'une animation, alignées sur le pas de chaque contrôle */
export function interpolateFxValues<Key extends string>(
  controls: AnyFxControl<Key>[], startValues: FxCurrentValues<Key>, targetValues: FxValues<Key>, eased: number,
): FxValues<Key> {
  const values = {} as FxValues<Key>;
  controls.forEach(control => {
    const start        = startValues[control.key] ?? control.neutral;
    const end          = targetValues[control.key];
    const interpolated = start + (end - start) * eased;
    values[control.key] = clampFxValue(control, interpolated);
  });
  return values;
}
