/*
const AUDIO_FX_PRESETS = [
  { key: 'reset',     icon: '\u21BA', text: 'Reset',         values: null },
  { key: 'bass',      icon: '↘️',    text: 'Bass',           values: { bass: 15, mid: -10, treble: -15, lowPass: 9000 } },
  { key: 'mid',       icon: '➡️',    text: 'Mid',            values: { bass: -15, mid: 10, treble: -12, lowPass: 20000, highPass: 0 } },
  { key: 'high',      icon: '↗️',    text: 'High',           values: { bass: -15, mid: -10, treble: 15, highPass: 350, lowPass: 20000 } },
  { key: 'radio',     icon: '📻',    text: 'Radio',          values: { bass: -15, mid: 12, treble: -9, highPass: 2000 } },
  { key: 'earphones', icon: '🎧',    text: 'Ecouteurs',      values: { bass: -15, mid: -12, treble: 10, highPass: 4000 } },


 { key: 'cave',      icon: '🕳️',    text: 'Cave',           values: { reverb: 88, delay: 55, lowPass: 4000, bass: 10, treble: -6, highPass: 0 } },
  { key: 'drown',     icon: '🌊',    text: 'Sous l\'eau',    values: { lowPass: 700, highPass: 200, reverb: 88, delay: 20, bass: 12, treble: -10 } },
  { key: 'underwater', icon: '🫧',   text: 'Sous l\'eau',      values: { bass: 3, mid: -9, treble: -15, speed: 90, lowPass: 600, reverb: 70 } },

  { key: 'rush',      icon: '⚡',    text: 'Rush',           values: { reverb: 25, treble: 8, highPass: 0, lowPass: 20000, delay: 18, bass: -2 } },
  { key: 'drag',      icon: '🐌',    text: 'Lourd',          values: { reverb: 75, lowPass: 5000, delay: 40, bass: 8, treble: -3, highPass: 0 } },
  { key: 'siren',     icon: '🚨',    text: 'Sirène',         values: { reverb: 0, delay: 100, highPass: 0, lowPass: 20000, bass: -2, treble: 2 } },

  { key: 'club',       icon: '🪩',   text: 'Le Club (Voisin)', values: { bass: 12, mid: -12, treble: -15, lowPass: 900, reverb: 40 } },
  { key: 'cathedral',  icon: '⛪',   text: 'Cathédrale',       values: { treble: 6, speed: 90, reverb: 100, delay: 40 } },
  { key: 'cyberpunk',  icon: '🤖',   text: 'Cyberpunk',        values: { bass: 9, mid: 6, treble: 12, highPass: 1500, reverb: 20, delay: 50 } },
  { key: 'liminal',    icon: '🌌',   text: 'Espace Liminal',   values: { mid: 9, speed: 80, lowPass: 4200, highPass: 2000, reverb: 90 } },
  { key: 'lofi',       icon: '💿',   text: 'Vinyle Lo-Fi',     values: { bass: -3, mid: 3, treble: -6, speed: 95, lowPass: 6200, reverb: 20 } },
  { key: 'void',       icon: '🌑',   text: 'Le Néant',         values: { bass: -15, mid: -15, speed: 70, reverb: 100, delay: 80 } },

  { key: 'radio',     icon: '📻',    text: 'Radio',          values: { highPass: 2000, lowPass: 5000, bass: -15, treble: 8, reverb: 5 } },
  { key: 'telephone', icon: '📞',    text: 'Téléphone',      values: { lowPass: 2800, highPass: 1000, bass: -15, treble: -12, mid: 2 } },
 
];
*/
const AUDIO_FX_PRESETS = [
  { key: 'reset',      icon: '\u21BA', text: 'Reset',            values: null },
  { key: 'bass',       icon: '↘️',    text: 'Bass',              values: { bass:  15, mid: -10, treble: -15, lowPass:  9000 } },
  { key: 'mid',        icon: '➡️',    text: 'Mid',               values: { bass: -15, mid:  10, treble: -12, lowPass: 20000, highPass:    0 } },
  { key: 'high',       icon: '↗️',    text: 'High',              values: { bass: -15, mid: -10, treble:  15, lowPass: 20000, highPass:  350 } },
  { key: 'earphones',  icon: '🎧',    text: 'Ecouteurs',         values: { bass: -15, mid: -12, treble:  10,                 highPass: 4000 } },
  { key: 'radio',      icon: '📻',    text: 'Radio',             values: { bass: -15, mid:  12, treble:  -9,                 highPass: 2000 } },
  { key: 'cave',       icon: '🕳️',    text: 'Cave',              values: { bass:  10,           treble:  -6, lowPass:  4000, highPass:    0, reverb:  80, delay:  30 } },
  { key: 'drown',      icon: '🌊',    text: 'Sous l\'eau',       values: { bass:  12,           treble: -10, lowPass:   600, highPass:  200, reverb:  80, delay:  20, speed: 95 } },
  { key: 'club',       icon: '🧱',    text: 'Voisin',            values: { bass:  12, mid: -12, treble: -15, lowPass:   900,                 reverb:  40 } },
  { key: 'church',     icon: '⛪',    text: 'Église',            values: {                                   lowPass: 10000, highPass:  100, reverb: 100, delay:  40 } },
  //{ key: 'liminal',    icon: '🌌',    text: 'Espace Liminal',    values: {            mid:   9,              lowPass:  4200, highPass: 2000, reverb:  90,             speed: 80 } },
  //{ key: 'void',       icon: '🌑',    text: 'Le Néant',          values: { bass: -15, mid: -15,                                              reverb: 100, delay:  40, speed: 70 } },
];