const AUDIO_TABS = [

  // ════════════════════════════════════════════════════════
  // ONGLET 0 — Nature
  // ════════════════════════════════════════════════════════
  {
    label: 'Nature',
    icon: '🌿',
    accent: '#4cffaa',
    categories: [

      {
        label: 'Nature & Eau', icon: '🌊', color: '#4cffaa',
        items: [
          { name: 'Forêt',            icon: '🌲', file: 'sounds/foret-oiseau.wav' },
          { name: 'Pluie',            icon: '🌧️', file: 'sounds/pluie.wav' },
          { name: 'Orage',            icon: '⛈️', file: 'sounds/orage.mp3' },
          { name: 'Vent',             icon: '💨', file: 'sounds/vent.mp3' },
          { name: 'Rivière',          icon: '🏞️', file: 'sounds/riviere.mp3' },
          { name: 'Océan',            icon: '🌊', file: 'sounds/ocean.wav' },
          { name: 'Tonnerre',         icon: '🌩️', file: 'sounds/tonnerre.mp3' },
        ]
      },

      {
        label: 'Faune', icon: '🐾', color: '#ffdd55',
        items: [
          { name: 'Cigales',          icon: '🦗', file: 'sounds/nuit-criquet.wav' },
          { name: 'Oiseaux',          icon: '🐦', file: 'sounds/oiseaux.mp3' },
          { name: 'Feu',              icon: '🔥', file: 'sounds/feu_cheminee.ogg' },
        ]
      },

    ]
  },

  // ════════════════════════════════════════════════════════
  // ONGLET 1 — Ambiances
  // ════════════════════════════════════════════════════════
  {
    label: 'Ambiances',
    icon: '🏙️',
    accent: '#88ccff',
    categories: [

      {
        label: 'Lieux', icon: '📍', color: '#88ccff',
        items: [
          { name: 'Café',             icon: '☕', file: 'sounds/discussion_foule.ogg', start: 12.6 },
          { name: 'Bureau',           icon: '🖥️', file: 'sounds/bureau.wav' },
          { name: 'Bibliothèque',     icon: '📚', file: 'sounds/bibliotheque.mp3' },
          { name: 'Marché',           icon: '🛒', file: 'sounds/marche.mp3' },
          { name: 'Restaurant',       icon: '🍽️', file: 'sounds/discussion_foule.ogg' },
          { name: 'Nuit urbaine',     icon: '🌃', file: 'sounds/nuit_ville.mp3' },
        ]
      },

      {
        label: 'Transport', icon: '🚇', color: '#55aaff',
        items: [
          { name: 'Métro',            icon: '🚇', file: 'sounds/metro.wav' },
          { name: 'Train',            icon: '🚂', file: 'sounds/train.wav' },
        ]
      },

    ]
  },

  // ════════════════════════════════════════════════════════
  // ONGLET 2 — Effets
  // ════════════════════════════════════════════════════════
  {
    label: 'Effets',
    icon: '⚡',
    accent: '#dd66ff',
    categories: [

      {
        label: 'Notifications', icon: '🔔', color: '#dd66ff',
        items: [
          { name: 'Click',            icon: '🖱️', file: 'sounds/click.mp3' },
          { name: 'Notif',            icon: '🔔', file: 'sounds/notification.wav' },
          { name: 'Alarme',           icon: '🚨', file: 'sounds/alarme.mp3' },
          { name: 'Succès',           icon: '✅', file: 'sounds/success.wav' },
          { name: 'Erreur',           icon: '❌', file: 'sounds/erreur.mp3' },
        ]
      },

      {
        label: 'Action', icon: '💥', color: '#ff66aa',
        items: [
          { name: 'Laser',            icon: '🔴', file: 'sounds/laser.wav' },
          { name: 'Explosion',        icon: '💥', file: 'sounds/explosion.mp3' },
          { name: 'Feux d\'artifices', icon: '🎆', file: 'sounds/feux_artifices.mp3' },
          { name: 'Glitch',           icon: '📡', file: 'sounds/glitch.wav' },
          { name: 'Machine à café',   icon: '☕', file: 'sounds/bruit_machine_cafe.mp3' },
        ]
      },

    ]
  },

  // ════════════════════════════════════════════════════════
  // ONGLET 3 — Musique
  // ════════════════════════════════════════════════════════
  {
    label: 'Musique',
    icon: '🎵',
    accent: '#ffcc55',
    categories: [

      {
        label: 'Instruments', icon: '🎸', color: '#ffcc55',
        items: [
          { name: 'Batterie',         icon: '🥁', file: 'sounds/drums.mp3' },
          { name: 'Basse',            icon: '🎸', file: 'sounds/basse.wav' },
          { name: 'Piano',            icon: '🎹', file: 'sounds/piano.mp3' },
          { name: 'Violon',           icon: '🎻', file: 'sounds/violon.wav' },
          { name: 'Trompette',        icon: '🎺', file: 'sounds/trompette.mp3' },
          { name: 'Synthwave',        icon: '🎛️', file: 'sounds/synthwave.wav' },
        ]
      },

    ]
  },

];
