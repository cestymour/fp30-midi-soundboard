/* ================================================================
   midi-fx.ts — Contrôles d'effets piano
   Envoie des CC MIDI standard au Roland FP-30X via sendMidi(), sauf la
   réverbération, qui règle l'Ambiance du piano en SysEx Roland.
   L'état est ce que l'app a envoyé en dernier : il n'est jamais
   relu depuis le piano.
================================================================ */

import type { MidiFxKey, FxControl } from '../types.ts';
import { STATE } from '../state.svelte.ts';
import { sendAmbience, sendMidi } from '../midi/midi.ts';

export type MidiFxControl = FxControl<MidiFxKey, MidiFxState>;
export type MidiFxState = Record<MidiFxKey, number>;

export const MIDI_FX_CONTROLS: MidiFxControl[] = [
  {
    key: 'reverb',
    shortLabel: 'Reverb',
    group: 'reverb',
    // Ambiance du piano (SysEx Roland, 0 à 10, 1 par défaut sur le piano) : sur le
    // canal 4, le son du clavier ignore le CC91 (voir docs/fp30x-midi.md)
    min: 0,
    max: 10,
    step: 1,
    neutral: 1,
    read: settings => settings.reverb,
    apply: value => sendAmbience(value),
    formatValue: value => Math.round(value),
  },
  {
    key: 'chorus',
    shortLabel: 'Chorus',
    group: 'chorus',
    min: 0,
    max: 127,
    step: 1,
    neutral: 0,
    read: settings => settings.chorus,
    apply: value => sendMidi([0xB0 | STATE.midiChannel, 93, Math.round(value)]),
    formatValue: value => Math.round(value),
  },
  {
    key: 'cutoff',
    shortLabel: 'Cutoff',
    group: 'filter',
    min: 0,
    max: 127,
    step: 1,
    neutral: 64,
    read: settings => settings.cutoff,
    apply: value => sendMidi([0xB0 | STATE.midiChannel, 74, Math.round(value)]),
    formatValue: value => Math.round(value),
  },
  {
    key: 'resonance',
    shortLabel: 'Resonance',
    group: 'filter',
    min: 0,
    max: 127,
    step: 1,
    neutral: 64,
    read: settings => settings.resonance,
    apply: value => sendMidi([0xB0 | STATE.midiChannel, 71, Math.round(value)]),
    formatValue: value => Math.round(value),
  },
  {
    key: 'attack',
    shortLabel: 'Attack',
    group: 'envelope',
    min: 0,
    max: 127,
    step: 1,
    neutral: 64,
    read: settings => settings.attack,
    apply: value => sendMidi([0xB0 | STATE.midiChannel, 73, Math.round(value)]),
    formatValue: value => Math.round(value),
  },
  {
    key: 'release',
    shortLabel: 'Release',
    group: 'envelope',
    min: 0,
    max: 127,
    step: 1,
    neutral: 64,
    read: settings => settings.release,
    apply: value => sendMidi([0xB0 | STATE.midiChannel, 72, Math.round(value)]),
    formatValue: value => Math.round(value),
  },
  {
    key: 'decay',
    shortLabel: 'Decay',
    group: 'envelope',
    min: 0,
    max: 127,
    step: 1,
    neutral: 64,
    read: settings => settings.decay,
    apply: value => sendMidi([0xB0 | STATE.midiChannel, 75, Math.round(value)]),
    formatValue: value => Math.round(value),
  },
];

// ─── État courant des CC piano (source de vérité côté JS) ─────────
export const MIDI_FX_STATE: MidiFxState = {
  reverb:    1,
  chorus:    0,
  cutoff:    64,
  resonance: 64,
  attack:    64,
  release:   64,
  decay:     64,
};

/** Renvoie tous les effets tels que l'application les a envoyés en dernier (à la connexion du piano) */
export function sendAllMidiFx(): void {
  MIDI_FX_CONTROLS.forEach(control => control.apply(MIDI_FX_STATE[control.key]));
}

/** Envoie une valeur (arrondie) au piano et la mémorise comme état courant */
export function applyMidiFxValue(control: MidiFxControl, value: number): void {
  const rounded = Math.round(value);
  MIDI_FX_STATE[control.key] = rounded;
  control.apply(rounded);
}
