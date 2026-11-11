import type { FxPreset, MidiFxKey } from '../types.ts';

// reverb : Ambiance du piano, 0 à 10 (SysEx Roland, voir docs/fp30x-midi.md)
export const MIDI_FX_PRESETS: FxPreset<MidiFxKey>[] = [
  { key: 'reset',     icon: '\u21BA', text: 'Reset',       values: null },
  { key: 'hall',      icon: '🏛️',   text: 'Salle',       values: { reverb: 6, chorus:  0, cutoff: 74, resonance: 60, attack:  64, release:  90, decay: 64 } },
  { key: 'cathedral', icon: '⛪',    text: 'Cathédrale',  values: { reverb: 9, chorus: 20, cutoff: 80, resonance: 55, attack:  64, release: 115, decay: 64 } },
  // Studio : son sec et proche, comme un piano enregistré de près en cabine : pas de
  // réverbération, un peu plus de brillance, attaque franche, notes qui s'arrêtent net
  { key: 'studio',    icon: '🎙️',   text: 'Studio',      values: { reverb: 0, chorus:  0, cutoff: 78, resonance: 64, attack:  52, release:  38, decay: 56 } },
  { key: 'bright',    icon: '✨',    text: 'Brillant',    values: { reverb: 2, chorus:  0, cutoff: 90, resonance: 70, attack:  50, release:  64, decay: 60 } },
  { key: 'dark',      icon: '🌑',    text: 'Sombre',      values: { reverb: 3, chorus:  0, cutoff: 35, resonance: 55, attack:  75, release:  80, decay: 70 } },
  { key: 'pad',       icon: '🌊',    text: 'Pad',         values: { reverb: 7, chorus: 45, cutoff: 72, resonance: 58, attack: 100, release: 110, decay: 64 } },
  { key: 'pluck',     icon: '🎸',    text: 'Pluck',       values: { reverb: 2, chorus:  0, cutoff: 85, resonance: 75, attack:  30, release:  35, decay: 40 } },
  { key: 'vintage',   icon: '📻',    text: 'Vintage',     values: { reverb: 4, chorus: 60, cutoff: 55, resonance: 60, attack:  64, release:  75, decay: 64 } },
];
