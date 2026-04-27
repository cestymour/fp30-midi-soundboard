const AUDIO_FX_PRESETS = [
  { key: 'reset',     icon: '\u21BA', text: 'Reset',       values: null },
  { key: 'bass',      icon: '🔊',    text: 'Bass',        values: { bass: 15, mid: -10, treble: -15, lowPass: 9000 } },
  { key: 'mid',       icon: '🎚️',   text: 'Mid',         values: { bass: -15, mid: 10, treble: -12, lowPass: 20000, highPass: 0 } },
  { key: 'high',      icon: '✨',    text: 'High',        values: { bass: -15, mid: -10, treble: 15, highPass: 350, lowPass: 20000 } },
  { key: 'radio',     icon: '📻',    text: 'Radio',       values: { highPass: 2000, lowPass: 5000, bass: -15, treble: 8, reverb: 5 } },
  { key: 'telephone', icon: '📞',    text: 'Téléphone',   values: { lowPass: 2800, highPass: 1000, bass: -15, treble: -12, mid: 2 } },
  { key: 'cave',      icon: '🕳️',   text: 'Cave',        values: { reverb: 88, delay: 55, lowPass: 4000, bass: 10, treble: -6, highPass: 0 } },
  { key: 'drown',     icon: '🌊',    text: 'Sous l\'eau', values: { lowPass: 700, highPass: 200, reverb: 88, delay: 70, bass: 12, treble: -10 } },
  { key: 'rush',      icon: '⚡',    text: 'Rush',        values: { reverb: 25, treble: 8, highPass: 0, lowPass: 20000, delay: 18, bass: -2 } },
  { key: 'drag',      icon: '🐌',    text: 'Lourd',       values: { reverb: 75, lowPass: 5000, delay: 40, bass: 8, treble: -3, highPass: 0 } },
  { key: 'siren',     icon: '🚨',    text: 'Sirène',      values: { reverb: 0, delay: 100, highPass: 0, lowPass: 20000, bass: -2, treble: 2 } },
];
