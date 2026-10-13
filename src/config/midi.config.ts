import type { MidiTab } from '../types.ts';

export const MIDI_TABS: MidiTab[] = [

  // ════════════════════════════════════════════════════════
  // ONGLET 0 — Instruments
  // ════════════════════════════════════════════════════════
  {
    id: 'instruments',
    label: 'Instruments',
    icon: '🎹',
    accent: '#d946ef',
    cols: 6,
    categories: [

      {
        id: 'romantique-amour', label: 'Romantique / Amour', icon: '🌹', color: '#ff8fab',
        items: [
          // { id: 'piano-gp1', name: 'Piano',            icon: '🎹', pc:1,   msb:0,   lsb:68,  title: 'Roland => Concert Piano(GP1)' },
          { id: 'piano', name: 'Piano',            icon: '🎹', pc:1,   msb:0,   lsb:0,   title: 'GM2 => Acoustic Grand Piano' },
          { id: 'harpe', name: 'Harpe',            icon: '🪉', pc:47,  msb:121, lsb:0,   title: 'GM2 => Harp' },
          // { id: 'violons', name: 'Violons',          icon: '🎻', pc:49,  msb:16,  lsb:64,  title: 'Roland => Chamber Str' },
          { id: 'violon-solo', name: 'Violon solo',      icon: '🎻', pc:41,  msb:121, lsb:0,   title: 'GM2 => Violin' },
          { id: 'accordeon', name: 'Accordéon',        icon: '🪗', pc:22,  msb:121, lsb:0,   title: 'GM2 => Accordion 1' },
        ]
      },

      {
        id: 'comedie-cartoon', label: 'Comédie / Cartoon', icon: '🎪', color: '#66ddcc',
        items: [
          { id: 'boite-a-musique', name: 'Boîte à musique',  icon: '🎠', pc:11,  msb:121, lsb:0,   title: 'GM2 => Music Box' },
          { id: 'celesta', name: 'Célesta',          icon: '✨', pc:9,   msb:121, lsb:0,   title: 'GM2 => Celesta' },
          { id: 'rhodes', name: 'Rhodes',           icon: '🎹', pc:5,   msb:16,  lsb:67,  title: 'Roland => E. Piano 1' },
          { id: 'voix-jazz', name: 'Voix jazz',        icon: '🗣️', pc:55,  msb:0,   lsb:65,  title: 'Roland => Jazz Scat' },
        ]
      },

      {
        id: 'sacre-mariage', label: 'Sacré / Mariage', icon: '⛪', color: '#ffe08a',
        items: [
          // { id: 'orgue', name: 'Orgue',            icon: '🎵', pc:20,  msb:8,   lsb:70,  title: 'Roland => Pipe Organ' },
          { id: 'orgue-d-eglise', name: "Orgue d'église",   icon: '⛪', pc:20,  msb:8,   lsb:69,  title: 'Roland => ChurchOrgan2' },
          { id: 'gospel', name: 'Gospel',           icon: '✝️', pc:17,  msb:0,   lsb:71,  title: 'Roland => Gospel Spin' },
          { id: 'cloches-tubulaires', name: 'Cloches tubulaires', icon: '🔔', pc:15, msb:121, lsb:0,  title: 'GM2 => TubularBells' },
          { id: 'clochettes-noel', name: 'Clochettes Noël',  icon: '🎄', pc:113, msb:121, lsb:0,   title: 'GM2 => Tinkle Bell' },
        ]
      },

      {
        id: 'jazz-annees-50-60', label: 'Jazz / Années 50-60', icon: '🎷', color: '#ffcc55',
        items: [
          { id: 'orgue-jazz', name: 'Orgue jazz',       icon: '🎼', pc:19,  msb:0,   lsb:69,  title: 'Roland => Combo Jz.Org' },
          { id: 'trompette', name: 'Trompette',        icon: '🎺', pc:57,  msb:121, lsb:0,   title: 'GM2 => Trumpet' },
          { id: 'basse', name: 'Basse',            icon: '🎸', pc:34,  msb:121, lsb:0,   title: 'GM2 => FingeredBass' },
          { id: 'saxo', name: 'Saxo',             icon: '🎷', pc:66,  msb:121, lsb:0,   title: 'GM2 => Alto Sax' },
        ]
      },

      {
        id: 'western-saloon', label: 'Western / Saloon', icon: '🤠', color: '#ffaa55',
        items: [
          { id: 'piano-saloon', name: 'Piano Saloon',     icon: '🤠', pc:4,   msb:121, lsb:0,   title: 'GM2 => Honky-tonk' },
          { id: 'harmonica', name: 'Harmonica',        icon: '🎵', pc:23,  msb:121, lsb:0,   title: 'GM2 => Harmonica' },
          { id: 'banjo', name: 'Banjo',            icon: '🪕', pc:106, msb:121, lsb:0,   title: 'GM2 => Banjo' },
          { id: 'guitare-jazz', name: 'Guitare jazz',     icon: '🎸', pc:27,  msb:121, lsb:0,   title: 'GM2 => Jazz Guitar' },
        ]
      },

      {
        id: 'percussions', label: 'Percussions', icon: '🥁', color: '#ffaa88',
        items: [
          { id: 'xylophone', name: 'Xylophone',        icon: '🥢', pc:12,  msb:0,   lsb:0,   title: 'Roland => Vibraphone' },
          { id: 'tom-melodique', name: 'Tom mélodique',    icon: '🪘', pc:118, msb:121, lsb:0,   title: 'GM2 => Melodic Tom1' },
          { id: 'percu', name: 'Percu 🥁🪘🪇🎶', icon: '🥁', pc:1,   msb:120, lsb:0,   title: 'Roland => STANDARD Set' },
          { id: 'grosse-caisse', name: 'Grosse caisse',    icon: '🥁', pc:117, msb:121, lsb:1,   title: 'GM2 => Concert BD' },
        ]
      },

      {
        id: 'royaume-medieval', label: 'Royaume / Médiéval', icon: '⚔️', color: '#88ddaa',
        items: [
          { id: 'clavecin', name: 'Clavecin',         icon: '👑', pc:7,   msb:0,   lsb:67,  title: 'Roland => Harpsichord' },
          { id: 'cuivres', name: 'Cuivres',          icon: '📯', pc:62,  msb:121, lsb:0,   title: 'GM2 => Brass 1' },
          { id: 'guitare', name: 'Guitare',          icon: '🎸', pc:25,  msb:121, lsb:0,   title: 'GM2 => Nylon-str.Gt' },
          { id: 'flute-medievale', name: 'Flûte médiévale',  icon: '🌿', pc:20,  msb:16,  lsb:66,  title: "Roland => Nason flt 8'" },
        ]
      },

      {
        id: 'futuriste-sf', label: 'Futuriste / SF', icon: '🚀', color: '#cc88ff',
        items: [
          { id: 'laser-synth', name: 'Laser / Synth',    icon: '🔆', pc:82,  msb:8,   lsb:67,  title: 'Roland => Super Saw' },
          { id: 'fantasia', name: 'Fantasia',         icon: '🚀', pc:89,  msb:0,   lsb:64,  title: 'Roland => D50 Fantasia' },
          { id: 'piano-electrique', name: 'Piano électrique', icon: '💎', pc:6,   msb:8,   lsb:68,  title: 'Roland => EP Belle' },
          { id: 'pluie-de-cristal', name: 'Pluie de cristal', icon: '❄️', pc:97,  msb:121, lsb:0,   title: 'GM2 => Ice Rain' },
        ]
      },

      {
        id: 'fantastique-feerique', label: 'Fantastique / Féérique', icon: '🧚', color: '#a8ffd8',
        items: [
          { id: 'flute', name: 'Flûte',            icon: '🪈', pc:74,  msb:121, lsb:0,   title: 'GM2 => Flute' },
          { id: 'flute-de-pan', name: 'Flûte de Pan',     icon: '🎋', pc:76,  msb:121, lsb:0,   title: 'GM2 => Pan Flute' },
          { id: 'kalimba', name: 'Kalimba',          icon: '🧝', pc:109, msb:121, lsb:0,   title: 'GM2 => Kalimba' },
          { id: 'saxo-soprano', name: 'Saxo soprano',     icon: '🎷', pc:65,  msb:121, lsb:0,   title: 'GM2 => Soprano Sax' },
        ]
      },

      {
        id: 'mystere-suspense', label: 'Mystère / Suspense', icon: '🌙', color: '#6688cc',
        items: [
          { id: 'pad-boreal', name: 'Pad boréal',       icon: '🌌', pc:98,  msb:0,   lsb:68,  title: 'Roland => Boreal Pad' },
          { id: 'pad-legendaire', name: 'Pad légendaire',   icon: '🌙', pc:93,  msb:0,   lsb:66,  title: 'Roland => Legend Pad' },
          { id: 'cordes-tron', name: 'Cordes Tron',      icon: '🔮', pc:51,  msb:0,   lsb:67,  title: 'Roland => Tron Strings' },
          { id: 'voix-celeste', name: 'Voix céleste',     icon: '👁️', pc:92,  msb:1,   lsb:64,  title: 'Roland => Voice of Hvn' },
        ]
      },
      
      {
        id: 'musique-du-monde', label: 'Musique du monde', icon: '🌍', color: '#ffd6a5',
        items: [
          // { id: 'yang-qin', name: 'Yang Qin',        icon: '🎌', pc:47,  msb:121, lsb:1,   title: 'GM2 => Yang Qin' },
          { id: 'shamisen', name: 'Shamisen',         icon: '🎌', pc:107, msb:121, lsb:0,   title: 'GM2 => Shamisen' },
          // { id: 'koto', name: 'Koto',            icon: '🎌', pc:108, msb:121, lsb:0,   title: 'GM2 => Koto' },
          { id: 'steelpan', name: 'Steelpan',         icon: '🌴', pc:115, msb:121, lsb:0,   title: 'GM2 => Steel Drums' },
          { id: 'sitar', name: 'Sitar',            icon: '🕌', pc:105, msb:121, lsb:1,   title: 'GM2 => Sitar 2' },
          { id: 'harpe-glissando', name: 'Harpe glissando',  icon: '🪉', pc:47,  msb:0,   lsb:70,  title: 'Roland => Harpiness' },
        ]
      },

      {
        id: 'horreur-angoisse', label: 'Horreur / Angoisse', icon: '👻', color: '#aa66ff',
        items: [
          { id: 'nappe-sombre', name: 'Nappe sombre',     icon: '🌀', pc:96,  msb:121, lsb:0,   title: 'GM2 => Sweep Pad' },
          { id: 'gobelins', name: 'Gobelins',         icon: '👹', pc:102, msb:121, lsb:0,   title: 'GM2 => Goblins' },
          { id: 'halo', name: 'Halo',             icon: '😱', pc:95,  msb:121, lsb:0,   title: 'GM2 => Halo Pad' },
          { id: 'chur', name: 'Chœur',            icon: '🎶', pc:53,  msb:8,   lsb:71,  title: 'Roland => Choir Aahs 1' },
        ]
      },
    ]
  },

  // ════════════════════════════════════════════════════════
  // ONGLET 1 — Sons MIDI
  // ════════════════════════════════════════════════════════
  {
    id: 'sons-midi',
    label: 'Sons MIDI',
    icon: '🔊',
    accent: '#a855f7',
    cols: 5,
    categories: [

      {
        id: 'nature-eau', label: 'Nature & Eau', icon: '🌿', color: '#4cffaa',
        items: [
          { id: 'mer', name: 'Mer',              icon: '🌊', pc:123, msb:121, lsb:0,   title: 'GM2 => Seashore' },
          { id: 'pluie', name: 'Pluie',            icon: '🌧️', pc:123, msb:121, lsb:1,   title: 'GM2 => Rain' },
          { id: 'tonnerre', name: 'Tonnerre',         icon: '⚡', pc:123, msb:121, lsb:2,   title: 'GM2 => Thunder' },
          { id: 'vent', name: 'Vent',             icon: '💨', pc:123, msb:121, lsb:3,   title: 'GM2 => Wind' },
          { id: 'ruisseau', name: 'Ruisseau',         icon: '🏞️', pc:123, msb:121, lsb:4,   title: 'GM2 => Stream' },
          { id: 'bulles', name: 'Bulles',           icon: '🫧', pc:123, msb:121, lsb:5,   title: 'GM2 => Bubble' },
        ]
      },

      {
        id: 'comedie-cartoon', label: 'Comédie / Cartoon', icon: '🎪', color: '#66ddcc',
        items: [
          { id: 'pas-de-loup', name: 'Pas de loup',      icon: '🎻', pc:46,  msb:121, lsb:0,   title: 'GM2 => Pizzicato Str' },
          { id: 'coup-de-theatre', name: 'Coup de théâtre',  icon: '🎭', pc:56,  msb:121, lsb:0,   title: 'GM2 => OrchestraHit' },
        ]
      },

      {
        id: 'humain', label: 'Humain', icon: '👥', color: '#ff66aa',
        items: [
          { id: 'rire', name: 'Rire',             icon: '😂', pc:127, msb:121, lsb:1,   title: 'GM2 => Laughing' },
          { id: 'cri', name: 'Cri',              icon: '😱', pc:127, msb:121, lsb:2,   title: 'GM2 => Screaming' },
          { id: 'cur', name: 'Cœur',             icon: '💓', pc:127, msb:121, lsb:4,   title: 'GM2 => Heart Beat' },
          { id: 'pas', name: 'Pas',              icon: '👣', pc:127, msb:121, lsb:5,   title: 'GM2 => Footsteps' },
          { id: 'claque-doigt', name: 'Claque doigt',     icon: '🫰', pc:116, msb:121, lsb:1,   title: 'GM2 => Castanets' },
          { id: 'applaudissements', name: 'Applaudissements', icon: '👏', pc:127, msb:121, lsb:0,   title: 'GM2 => Applause' },
        ]
      },

      {
        id: 'sons-quotidiens', label: 'Sons quotidiens', icon: '🚪', color: '#88ccff',
        items: [
          // { id: 'scratch', name: 'Scratch',          icon: '💿', pc:125, msb:121, lsb:4,   title: 'GM2 => Scratch' },
          { id: 'carillon-reve', name: 'Carillon (rêve)',  icon: '🎐', pc:125, msb:121, lsb:5,   title: 'GM2 => Wind Chimes' },
          { id: 'bloc-de-bois', name: 'Bloc de bois',     icon: '🪵', pc:116, msb:121, lsb:0,   title: 'GM2 => Woodblock' },
        ]
      },

      {
        id: 'animaux', label: 'Animaux', icon: '🐾', color: '#ffdd55',
        items: [
          { id: 'chien', name: 'Chien',            icon: '🐕', pc:124, msb:121, lsb:1,   title: 'GM2 => Dog' },
          { id: 'oiseaux', name: 'Oiseaux',          icon: '🐦', pc:124, msb:121, lsb:0,   title: 'GM2 => Bird 1' },
          { id: 'galop-cheval', name: 'Galop cheval',     icon: '🐴', pc:124, msb:121, lsb:2,   title: 'GM2 => Horse Gallop' },
          { id: 'cloche-de-vache', name: 'Cloche de vache',  icon: '🔔', pc:114, msb:121, lsb:0,   title: 'GM2 => Agogo' },
        ]
      },
      
      {
        id: 'sons-quotidiens-suite', label: 'Sons quotidiens (suite)', icon: '🚪', color: '#88ccff',
        items: [
          { id: 'telephone-vieux', name: 'Téléphone vieux',  icon: '☎️', pc:125, msb:121, lsb:0,   title: 'GM2 => Telephone 1' },
          { id: 'telephone-recent', name: 'Téléphone récent', icon: '📞', pc:125, msb:121, lsb:1,   title: 'GM2 => Telephone 2' },
          { id: 'grincement-porte', name: 'Grincement porte', icon: '🚪', pc:125, msb:121, lsb:2,   title: 'GM2 => DoorCreaking' },
          { id: 'claque', name: 'Claque !',         icon: '🚪', pc:125, msb:121, lsb:3,   title: 'GM2 => Door' },
        ]
      },

      {
        id: 'voiture', label: 'Voiture', icon: '🚗', color: '#ff9944',
        items: [
          { id: 'demarrage-voiture', name: 'Démarrage voiture', icon: '🔧', pc:126, msb:121, lsb:1,  title: 'GM2 => Car Engine' },
          { id: 'vroooom', name: 'Vroooom',          icon: '🚗', pc:126, msb:121, lsb:3,   title: 'GM2 => Car Pass' },
          { id: 'freinage', name: 'Freinage',         icon: '🛑', pc:126, msb:121, lsb:2,   title: 'GM2 => Car Stop' },
          { id: 'crash', name: 'Crash',            icon: '💥', pc:126, msb:121, lsb:4,   title: 'GM2 => Car Crash' },
        ]
      },

      {
        id: 'transport', label: 'Transport', icon: '✈️', color: '#ff9944',
        items: [
          { id: 'police', name: 'Police',           icon: '🚨', pc:126, msb:121, lsb:5,   title: 'GM2 => Siren' },
          { id: 'train', name: 'Train',            icon: '🚂', pc:126, msb:121, lsb:6,   title: 'GM2 => Train' },
          { id: 'avion', name: 'Avion',            icon: '✈️', pc:126, msb:121, lsb:7,   title: 'GM2 => Jetplane' },
          { id: 'helicoptere', name: 'Hélicoptère',      icon: '🚁', pc:126, msb:121, lsb:0,   title: 'GM2 => Helicopter' },
        ]
      },

      {
        id: 'sci-fi-espace', label: 'Sci-Fi / Espace', icon: '🛸', color: '#cc88ff',
        items: [
          { id: 'vaisseau-spatial', name: 'Vaisseau spatial', icon: '🛸', pc:126, msb:121, lsb:8,   title: 'GM2 => Starship' },
          { id: 'teleportation', name: 'Téléportation',    icon: '⚡', pc:126, msb:121, lsb:9,   title: 'GM2 => Burst Noise' },
          { id: 'disparition', name: 'Disparition',      icon: '🌀', pc:120, msb:121, lsb:0,   title: 'GM2 => Reverse Cymbal' },
          { id: 'pistolet-laser', name: 'Pistolet laser',   icon: '🔫', pc:128, msb:121, lsb:2,   title: 'GM2 => Laser Gun' },
        ]
      },

      {
        id: 'bagarre', label: 'Bagarre', icon: '⚔️', color: '#dd66ff',
        items: [
          { id: 'coup-de-feu', name: 'Coup de feu',      icon: '🔫', pc:128, msb:121, lsb:0,   title: 'GM2 => Gun Shot' },
          { id: 'mitraillette', name: 'Mitraillette',     icon: '🔫', pc:128, msb:121, lsb:1,   title: 'GM2 => Machine Gun' },
          { id: 'coup-de-poing', name: 'Coup de poing',    icon: '🥊', pc:127, msb:121, lsb:3,   title: 'GM2 => Punch' },
          { id: 'explosion', name: 'Explosion',        icon: '💣', pc:128, msb:121, lsb:3,   title: 'GM2 => Explosion' },
        ]
      },
    ]
  },

];
