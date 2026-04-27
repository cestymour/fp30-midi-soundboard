const MIDI_FX_PRESETS = [
  { key: 'reset',     icon: '\u21BA', text: 'Reset',       values: null },
  { key: 'hall',      icon: '🏛️',   text: 'Salle',       values: { reverb: 80,  chorus: 0,  cutoff: 74, resonance: 60, attack:  64, release:  90, decay: 64 } },
  { key: 'cathedral', icon: '⛪',    text: 'Cathédrale',  values: { reverb: 120, chorus: 20, cutoff: 80, resonance: 55, attack:  64, release: 115, decay: 64 } },
  { key: 'studio',    icon: '🎙️',   text: 'Studio',      values: { reverb: 15,  chorus: 0,  cutoff: 64, resonance: 64, attack:  64, release:  55, decay: 64 } },
  { key: 'bright',    icon: '✨',    text: 'Brillant',    values: { reverb: 30,  chorus: 0,  cutoff: 90, resonance: 70, attack:  50, release:  64, decay: 60 } },
  { key: 'dark',      icon: '🌑',    text: 'Sombre',      values: { reverb: 40,  chorus: 0,  cutoff: 35, resonance: 55, attack:  75, release:  80, decay: 70 } },
  { key: 'pad',       icon: '🌊',    text: 'Pad',         values: { reverb: 95,  chorus: 45, cutoff: 72, resonance: 58, attack: 100, release: 110, decay: 64 } },
  { key: 'pluck',     icon: '🎸',    text: 'Pluck',       values: { reverb: 20,  chorus: 0,  cutoff: 85, resonance: 75, attack:  30, release:  35, decay: 40 } },
  { key: 'vintage',   icon: '📻',    text: 'Vintage',     values: { reverb: 50,  chorus: 60, cutoff: 55, resonance: 60, attack:  64, release:  75, decay: 64 } },
];
