/* ================================================================
   midi-fx.ts — Contrôles d'effets piano (Control Changes MIDI)
   Envoie des CC MIDI standard au Roland FP-30X via sendMidi().
   L'état est ce que l'app a envoyé en dernier : il n'est jamais
   relu depuis le piano.
================================================================ */

import type { MidiFxKey, FxControl } from '../types.ts';
import { STATE } from '../state.ts';
import { sendMidi } from '../midi/midi.ts';

export type MidiFxControl = FxControl<MidiFxKey, MidiFxState>;
export type MidiFxState = Record<MidiFxKey, number>;

export const MIDI_FX_CONTROLS: MidiFxControl[] = [
  {
    key: 'reverb',
    label: 'REV',
    shortLabel: 'Reverb',
    group: 'reverb',
    min: 0,
    max: 127,
    step: 1,
    neutral: 0,
    read: settings => settings.reverb,
    apply: value => sendMidi([0xB0 | STATE.MIDI_CHANNEL, 91, Math.round(value)]),
    formatValue: value => Math.round(value),
  },
  {
    key: 'chorus',
    label: 'CHO',
    shortLabel: 'Chorus',
    group: 'chorus',
    min: 0,
    max: 127,
    step: 1,
    neutral: 0,
    read: settings => settings.chorus,
    apply: value => sendMidi([0xB0 | STATE.MIDI_CHANNEL, 93, Math.round(value)]),
    formatValue: value => Math.round(value),
  },
  {
    key: 'cutoff',
    label: 'CUT',
    shortLabel: 'Cutoff',
    group: 'filter',
    min: 0,
    max: 127,
    step: 1,
    neutral: 64,
    read: settings => settings.cutoff,
    apply: value => sendMidi([0xB0 | STATE.MIDI_CHANNEL, 74, Math.round(value)]),
    formatValue: value => Math.round(value),
  },
  {
    key: 'resonance',
    label: 'RES',
    shortLabel: 'Resonance',
    group: 'filter',
    min: 0,
    max: 127,
    step: 1,
    neutral: 64,
    read: settings => settings.resonance,
    apply: value => sendMidi([0xB0 | STATE.MIDI_CHANNEL, 71, Math.round(value)]),
    formatValue: value => Math.round(value),
  },
  {
    key: 'attack',
    label: 'ATK',
    shortLabel: 'Attack',
    group: 'envelope',
    min: 0,
    max: 127,
    step: 1,
    neutral: 64,
    read: settings => settings.attack,
    apply: value => sendMidi([0xB0 | STATE.MIDI_CHANNEL, 73, Math.round(value)]),
    formatValue: value => Math.round(value),
  },
  {
    key: 'release',
    label: 'REL',
    shortLabel: 'Release',
    group: 'envelope',
    min: 0,
    max: 127,
    step: 1,
    neutral: 64,
    read: settings => settings.release,
    apply: value => sendMidi([0xB0 | STATE.MIDI_CHANNEL, 72, Math.round(value)]),
    formatValue: value => Math.round(value),
  },
  {
    key: 'decay',
    label: 'DEC',
    shortLabel: 'Decay',
    group: 'envelope',
    min: 0,
    max: 127,
    step: 1,
    neutral: 64,
    read: settings => settings.decay,
    apply: value => sendMidi([0xB0 | STATE.MIDI_CHANNEL, 75, Math.round(value)]),
    formatValue: value => Math.round(value),
  },
];

// ─── État courant des CC piano (source de vérité côté JS) ─────────
export const MIDI_FX_STATE: MidiFxState = {
  reverb:    0,
  chorus:    0,
  cutoff:    64,
  resonance: 64,
  attack:    64,
  release:   64,
  decay:     64,
};

/** Envoie une valeur (arrondie) au piano et la mémorise comme état courant */
export function applyMidiFxValue(control: MidiFxControl, value: number): void {
  const rounded = Math.round(value);
  MIDI_FX_STATE[control.key] = rounded;
  control.apply(rounded);
}
