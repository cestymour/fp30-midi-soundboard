const COLUMNS = [

  // ════════════════════════════════════════
  // COL 0 (index 0) — Instruments classiques
  // ════════════════════════════════════════
  { col: 0, categories: [
    {
      label: '🎹 Classique', color: 'var(--cat-classic)',
      instruments: [
        { name: 'Piano',             icon: '🎹', pc:1,   msb:0,   lsb:68,  title: 'Roland => Concert Piano(GP1)' },
        { name: 'Harpe',             icon: '🪉', pc:47,  msb:121, lsb:0,   title: 'GM2 => Harp' },
        { name: 'Chœur',             icon: '🎶', pc:53,  msb:8,   lsb:71,  title: 'Roland => Choir Aahs 1' },
      ]
    },
    {
      label: '⛪ Sacré / Mariage', color: 'var(--cat-sacre)',
      instruments: [
        //{ name: 'Orgue',             icon: '🎵', pc:20,  msb:8,   lsb:70,  title: 'Roland => Pipe Organ' },
        { name: "Orgue d'église",    icon: '⛪', pc:20,  msb:8,   lsb:69,  title: 'Roland => ChurchOrgan2' },
        { name: 'Gospel',            icon: '✝️', pc:17,  msb:0,   lsb:71,  title: 'Roland => Gospel Spin' },
        { name: 'Cloches tubulaires',icon: '🔔', pc:15,  msb:121, lsb:0,   title: 'GM2 => TubularBells' },
        { name: 'Clochettes Noël',   icon: '🎄', pc:113, msb:121, lsb:0,   title: 'GM2 => Tinkle Bell' },
      ]
    },
    {
      label: '🤠 Western / Saloon', color: 'var(--cat-western)',
      instruments: [
        { name: 'Piano Saloon',      icon: '🤠', pc:4,   msb:121, lsb:0,   title: 'GM2 => Honky-tonk' },
        { name: 'Harmonica',         icon: '🎵', pc:23,  msb:121, lsb:0,   title: 'GM2 => Harmonica' },
        { name: 'Banjo',             icon: '🪕', pc:106, msb:121, lsb:0,   title: 'GM2 => Banjo' },
      ]
    },
    {
      label: '⚔️ Royaume / Médiéval', color: 'var(--cat-medieval)',
      instruments: [
        { name: 'Clavecin',          icon: '👑', pc:7,   msb:0,   lsb:67,  title: 'Roland => Harpsichord' },
        { name: 'Cuivres',           icon: '📯', pc:62,  msb:121, lsb:0,   title: 'GM2 => Brass 1' },
        { name: 'Guitare',           icon: '🎸', pc:25,  msb:121, lsb:0,   title: 'GM2 => Nylon-str.Gt' },
      ]
	},
    {
      label: '🧚 Fantastique / Féérique', color: 'var(--cat-fantastique)',
      instruments: [
        { name: 'Flûte',             icon: '🪈', pc:74,  msb:121, lsb:0,   title: 'GM2 => Flute' },
        //{ name: 'Flûte médiévale',   icon: '🌿', pc:20,  msb:16,  lsb:66,  title: "Roland => Nason flt 8'" },
        { name: 'Flûte de Pan',      icon: '🎋', pc:76,  msb:121, lsb:0,   title: 'GM2 => Pan Flute' },
        { name: 'Kalimba',           icon: '🧝', pc:109, msb:121, lsb:0,   title: 'GM2 => Kalimba' },
        { name: 'Harpe glissando',   icon: '🪉', pc:47,  msb:0,   lsb:70,  title: 'Roland => Harpiness' },
      ]
    },
    {
      label: '🌍 Musique du monde', color: 'var(--cat-monde)',
      instruments: [
        //{ name: 'Yang Qin',          icon: '🎌', pc:47,  msb:121, lsb:1,   title: 'GM2 => Yang Qin' },
        { name: 'Shamisen',          icon: '🎌', pc:107, msb:121, lsb:0,   title: 'GM2 => Shamisen' },
        //{ name: 'Koto',              icon: '🎌', pc:108, msb:121, lsb:0,   title: 'GM2 => Koto' },
        { name: 'Steelpan',          icon: '🌴', pc:115, msb:121, lsb:0,   title: 'GM2 => Steel Drums' },
        { name: 'Sitar',             icon: '🕌', pc:105, msb:121, lsb:1,   title: 'GM2 => Sitar 2' },
      ]
    },
  ]},

  // ════════════════════════════════════════
  // COL 1 (index 1) — Instruments dramatiques
  // ════════════════════════════════════════
  { col: 1, categories: [
    {
      label: '🌹 Romantique / Amour', color: 'var(--cat-romantique)',
      instruments: [
        { name: 'Violons',           icon: '🎻', pc:49,  msb:16,  lsb:64,  title: 'Roland => Chamber Str' },
        { name: 'Violon solo',       icon: '🎻', pc:41,  msb:121, lsb:0,   title: 'GM2 => Violin' },
        { name: 'Accordéon',         icon: '🪗', pc:22,  msb:121, lsb:0,   title: 'GM2 => Accordion 1' },
        //{ name: 'Célesta',           icon: '✨', pc:9,   msb:121, lsb:0,   title: 'GM2 => Celesta' },
        //{ name: 'Saxo soprano',      icon: '🎷', pc:65,  msb:121, lsb:0,   title: 'GM2 => Soprano Sax' },
      ]
    },
    {
      label: '🚀 Futuriste / SF', color: 'var(--cat-futur)',
      instruments: [
        { name: 'Laser / Synth',     icon: '🔆', pc:82,  msb:8,   lsb:67,  title: 'Roland => Super Saw' },
        { name: 'Fantasia',          icon: '🚀', pc:89,  msb:0,   lsb:64,  title: 'Roland => D50 Fantasia' },
        { name: 'Piano électrique',  icon: '💎', pc:6,   msb:8,   lsb:68,  title: 'Roland => EP Belle' },
        { name: 'Pluie de cristal',  icon: '❄️', pc:97,  msb:121, lsb:0,   title: 'GM2 => Ice Rain' },
      ]
    },
    {
      label: '🌙 Mystère / Suspense', color: 'var(--cat-mystere)',
      instruments: [
        { name: 'Pad boréal',        icon: '🌌', pc:98,  msb:0,   lsb:68,  title: 'Roland => Boreal Pad' },
        { name: 'Pad légendaire',    icon: '🌙', pc:93,  msb:0,   lsb:66,  title: 'Roland => Legend Pad' },
        { name: 'Cordes Tron',       icon: '🔮', pc:51,  msb:0,   lsb:67,  title: 'Roland => Tron Strings' },
        { name: 'Voix céleste',      icon: '👁️', pc:92,  msb:1,   lsb:64,  title: 'Roland => Voice of Hvn' },
      ]
    },
    {
      label: '👻 Horreur / Angoisse', color: 'var(--cat-horreur)',
      instruments: [
        { name: 'Nappe sombre',      icon: '🌀', pc:96,  msb:121, lsb:0,   title: 'GM2 => Sweep Pad' },
        { name: 'Gobelins',          icon: '👹', pc:102, msb:121, lsb:0,   title: 'GM2 => Goblins' },
        { name: 'Halo',              icon: '😱', pc:95,  msb:121, lsb:0,   title: 'GM2 => Halo Pad' },
      ]
    },
    {
      label: '🎷 Jazz / Années 50-60', color: 'var(--cat-jazz)',
      instruments: [
        { name: 'Voix jazz',         icon: '🗣️', pc:55,  msb:0,   lsb:65,  title: 'Roland => Jazz Scat' },
        { name: 'Rhodes',            icon: '🎹', pc:5,   msb:16,  lsb:67,  title: 'Roland => E. Piano 1' },
        { name: 'Orgue jazz',        icon: '🎼', pc:19,  msb:0,   lsb:69,  title: 'Roland => Combo Jz.Org' },
        { name: 'Guitare jazz',      icon: '🎸', pc:27,  msb:121, lsb:0,   title: 'GM2 => Jazz Guitar' },
        { name: 'Trompette',         icon: '🎺', pc:57,  msb:121, lsb:0,   title: 'GM2 => Trumpet' },
        { name: 'Basse',             icon: '🎸', pc:34,  msb:121, lsb:0,   title: 'GM2 => FingeredBass' },
        { name: 'Saxo',              icon: '🎷', pc:66,  msb:121, lsb:0,   title: 'GM2 => Alto Sax' },
      ]
    },
  ]},

  // ════════════════════════════════════════
  // COL 2 (index 2) — Sons / Bruits (gauche)
  // ════════════════════════════════════════
  { col: 2, categories: [
    {
      label: '🎪 Comédie / Cartoon', color: 'var(--cat-comedie)',
      instruments: [
        { name: 'Xylophone',         icon: '🥢', pc:12,  msb:0,   lsb:0,   title: 'Roland => Vibraphone' },
        { name: 'Boîte à musique',   icon: '🎠', pc:11,  msb:121, lsb:0,   title: 'GM2 => Music Box' },
        { name: 'Pas de loup',       icon: '🎻', pc:46,  msb:121, lsb:0,   title: 'GM2 => Pizzicato Str' },
        { name: 'Coup de théâtre',   icon: '🎭', pc:56,  msb:121, lsb:0,   title: 'GM2 => OrchestraHit' },
      ]
    },
    {
      label: '🌿 Nature & Ambiances', color: 'var(--cat-nature)',
      instruments: [
        { name: 'Mer',               icon: '🌊', pc:123, msb:121, lsb:0,   title: 'GM2 => Seashore' },
        { name: 'Pluie',             icon: '🌧️', pc:123, msb:121, lsb:1,   title: 'GM2 => Rain' },
        { name: 'Tonnerre',          icon: '⚡', pc:123, msb:121, lsb:2,   title: 'GM2 => Thunder' },
        { name: 'Vent',              icon: '💨', pc:123, msb:121, lsb:3,   title: 'GM2 => Wind' },
        { name: 'Ruisseau',          icon: '🏞️', pc:123, msb:121, lsb:4,   title: 'GM2 => Stream' },
        { name: 'Bulles',            icon: '🫧', pc:123, msb:121, lsb:5,   title: 'GM2 => Bubble' },
      ]
    },
    {
      label: '🐾 Animaux', color: 'var(--cat-animal)',
      instruments: [
        { name: 'Chien',             icon: '🐕', pc:124, msb:121, lsb:1,   title: 'GM2 => Dog' },
        { name: 'Oiseaux',           icon: '🐦', pc:124, msb:121, lsb:0,   title: 'GM2 => Bird 1' },
        { name: 'Galop cheval',      icon: '🐴', pc:124, msb:121, lsb:2,   title: 'GM2 => Horse Gallop' },
        { name: 'Cloche de vache',   icon: '🔔', pc:114, msb:121, lsb:0,   title: 'GM2 => Agogo' },
      ]
    },
    {
      label: '🚪 Sons quotidiens', color: 'var(--cat-quotidien)',
      instruments: [
        { name: 'Téléphone vieux',   icon: '☎️', pc:125, msb:121, lsb:0,   title: 'GM2 => Telephone 1' },
        { name: 'Téléphone récent',  icon: '📞', pc:125, msb:121, lsb:1,   title: 'GM2 => Telephone 2' },
        { name: 'Grincement porte',  icon: '🚪', pc:125, msb:121, lsb:2,   title: 'GM2 => DoorCreaking' },
        { name: 'Claque !',          icon: '🚪', pc:125, msb:121, lsb:3,   title: 'GM2 => Door' },
        { name: 'Scratch',           icon: '💿', pc:125, msb:121, lsb:4,   title: 'GM2 => Scratch' },
        { name: 'Carillon (rêve)',   icon: '🎐', pc:125, msb:121, lsb:5,   title: 'GM2 => Wind Chimes' },
        { name: 'Bloc de bois',      icon: '🪵', pc:116, msb:121, lsb:0,   title: 'GM2 => Woodblock' },
        { name: 'Pas',               icon: '👣', pc:127, msb:121, lsb:5,   title: 'GM2 => Footsteps' },
      ]
    },
  ]},

  // ════════════════════════════════════════
  // COL 3 (index 3) — Sons / Bruits (droite)
  // ════════════════════════════════════════
  { col: 3, soundsCol: true, categories: [
    {
      label: '🚗 Véhicules', color: 'var(--cat-vehicle)',
      instruments: [
        { name: 'Démarrage voiture', icon: '🔧', pc:126, msb:121, lsb:1,   title: 'GM2 => Car Engine' },
        { name: 'Voiture',           icon: '🚗', pc:126, msb:121, lsb:3,   title: 'GM2 => Car Pass' },
        { name: 'Freinage',          icon: '🛑', pc:126, msb:121, lsb:2,   title: 'GM2 => Car Stop' },
        { name: 'Crash',             icon: '💥', pc:126, msb:121, lsb:4,   title: 'GM2 => Car Crash' },
        { name: 'Sirène',            icon: '🚨', pc:126, msb:121, lsb:5,   title: 'GM2 => Siren' },
        { name: 'Train',             icon: '🚂', pc:126, msb:121, lsb:6,   title: 'GM2 => Train' },
        { name: 'Avion',             icon: '✈️', pc:126, msb:121, lsb:7,   title: 'GM2 => Jetplane' },
        { name: 'Hélicoptère',       icon: '🚁', pc:126, msb:121, lsb:0,   title: 'GM2 => Helicopter' },
        { name: 'Vaisseau spatial',  icon: '🛸', pc:126, msb:121, lsb:8,   title: 'GM2 => Starship' },
        { name: 'Téléportation',     icon: '⚡', pc:126, msb:121, lsb:9,   title: 'GM2 => Burst Noise' },
        { name: 'Disparition',       icon: '🌀', pc:120, msb:121, lsb:0,   title: 'GM2 => Reverse Cymbal' },
      ]
    },
    {
      label: '👥 Humain', color: 'var(--cat-humain)',
      instruments: [
        //{ name: 'Applaudissements',  icon: '👏', pc:127, msb:121, lsb:0,   title: 'GM2 => Applause' },
        { name: 'Rire',              icon: '😂', pc:127, msb:121, lsb:1,   title: 'GM2 => Laughing' },
        { name: 'Cri',               icon: '😱', pc:127, msb:121, lsb:2,   title: 'GM2 => Screaming' },
        { name: 'Coup de poing',     icon: '🥊', pc:127, msb:121, lsb:3,   title: 'GM2 => Punch' },
        { name: 'Cœur',              icon: '💓', pc:127, msb:121, lsb:4,   title: 'GM2 => Heart Beat' },
      ]
    },
    {
      label: '🔫 Effets spéciaux', color: 'var(--cat-sfx)',
      instruments: [
        { name: 'Coup de feu',       icon: '🔫', pc:128, msb:121, lsb:0,   title: 'GM2 => Gun Shot' },
        { name: 'Mitraillette',      icon: '🔫', pc:128, msb:121, lsb:1,   title: 'GM2 => Machine Gun' },
        { name: 'Pistolet laser',    icon: '🔫', pc:128, msb:121, lsb:2,   title: 'GM2 => Laser Gun' },
        { name: 'Explosion',         icon: '💣', pc:128, msb:121, lsb:3,   title: 'GM2 => Explosion' },
      ]
    },
    {
      label: '🥁 Percussions', color: 'var(--cat-perc)',
      instruments: [
        { name: 'Percussions',       icon: '🥁', pc:1,   msb:120, lsb:0,   title: 'Roland => STANDARD Set' },
        { name: 'Castagnettes',      icon: '🫰', pc:116, msb:121, lsb:1,   title: 'GM2 => Castanets' },
        { name: 'Grosse caisse',     icon: '🥁', pc:117, msb:121, lsb:1,   title: 'GM2 => Concert BD' },
        { name: 'Tom mélodique',     icon: '🪘', pc:118, msb:121, lsb:0,   title: 'GM2 => Melodic Tom1' },
      ]
    },
  ]},
];
