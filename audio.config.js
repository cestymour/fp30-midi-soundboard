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

  // ════════════════════════════════════════════════════════
  // ONGLET 4 — Musique de films
  // ════════════════════════════════════════════════════════
  {
    label: 'Films',
    icon: '🎬',
    accent: '#ffcc55',
    cols: 3,
    categories: [
      {
        label: 'Horreur', icon: '😱', color: '#ff6666',
        items: [
          { name: 'Piège Mortel',         img: 'images/films/saw.jpg',             file: 'sounds/films/(Saw) Theme.mp3',                                      start: 21.2, title: 'Saw' },
          { name: 'Menace Cachée',        img: 'images/films/jaws.jpg',            file: 'sounds/films/(Les Dents De La Mer) Theme.mp3',                      start:  9.5, title: 'Les Dents de la Mer' },
          { name: 'Tension Folie',        img: 'images/films/psycho.jpg',          file: 'sounds/films/(Psycho) Shower Scene.mp3',                            start:  0.1, title: 'Psycho (Scène Douche)' },
        ]
      },
      {
        label: 'Drame', icon: '💔', color: '#8888cc',
        items: [
          { name: 'Spirale Infernale',    img: 'images/films/requiem.jpg',         file: 'sounds/films/(Requiem for a Dream) Theme.mp3',                      start: 38.9, title: 'Requiem for a Dream' },
          { name: 'Sacrifice Guerre',     img: 'images/films/platoon.jpg',         file: 'sounds/films/(Platoon) Theme.mp3',                                  start:285.5, title: 'Platoon' },
          { name: 'Adieu Poignant',       img: 'images/films/professionel.jpg',    file: 'sounds/films/(Le Professionnel) Chi Mai - Ennio Morricone.mp3',     start: 39.6, title: 'Le Professionnel (Chi Mai)' },
        ]
      },
      {
        label: 'Tragédie', icon: '🥀', color: '#aa88aa',
        items: [
          { name: 'Menace Imposante',     img: 'images/films/dark-vador.jpg',      file: 'sounds/films/(Star Wars) Dark Vador Theme.mp3',                     start:  9.5, title: 'Star Wars (Thème de Dark Vador)' },
          { name: 'Combat Épique',        img: 'images/films/star-wars-duel.jpg',  file: 'sounds/films/(Star Wars) Duel of the Fates.mp3',                    start: 60.0, title: 'Star Wars (Duel of the Fates)' },
          { name: 'Amour Tragique',       img: 'images/films/le_parrain.jpg',      file: 'sounds/films/(Le parrain) Love Theme.mp3',                          start:  0.4, title: 'Le Parrain (Love Theme)' },
        ]
      },
      {
        label: 'Western', icon: '🤠', color: '#cc8844',
        items: [
          { name: 'Duel Western',         img: 'images/films/bon-brute-truand.jpg',file: 'sounds/films/(Le Bon la Brute et le Truand) Theme.mp3',             start: 5.0, title: 'Le Bon la Brute et le Truand' },
          { name: 'Chasse à l\'Homme',    img: 'images/films/guimbarde.jpg',       file: 'sounds/films/(Pour quelques dollars de plus) Theme.mp3',            start: 26.7, title: 'Pour quelques dollars de plus' },
          { name: 'Vengeance Western',    img: 'images/films/harmonica.jpg',       file: 'sounds/films/(Il était une fois dans l\'ouest) L\'homme à l\'harmonica.mp3', start: 7, title: 'Il était une fois dans l\'Ouest (L\'homme à l\'harmonica)' },
        ]
      },
      {
        label: 'Espionnage / Action', icon: '🕵️‍♀️', color: '#6688aa',
        items: [
          { name: 'Infiltration Mission', img: 'images/films/mission-impossible.jpg', file: 'sounds/films/(Mission Impossible) Main Theme.mp3',                            title: 'Mission Impossible' }, // Changer de version ?
          { name: 'Action Sophistiquée',  img: 'images/films/james-bond.jpg',      file: 'sounds/films/(James Bond) Theme.mp3',                               start:  7.0, title: 'James Bond' },
          { name: 'Tension Virtuelle',    img: 'images/films/matrix.jpg',          file: 'sounds/films/(Matrix) Clubbed to Death.mp3',                        start:  8.25,title: 'Matrix (Clubbed to Death)' },
        ]
      },
      {
        label: 'Action / Poursuite', icon: '💥', color: '#ff8844',
        items: [
          { name: 'Duel Intensité',       img: 'images/films/kill-bill.jpg',       file: 'sounds/films/(Kill Bill) Theme.mp3',                                start:  5.0, title: 'Kill Bill' }, // Attention, présence de voix de scène dans la musique TODO:: changer la musique
          { name: 'Vengeance Stylisée',   img: 'images/films/kill-bill-hornet.jpg',file: 'sounds/films/(Kill Bill) The Green Hornet.mp3',                     start:  0.2, title: 'Kill Bill (The Green Hornet)' },
          { name: 'Poursuite Frénétique', img: 'images/films/taxi.jpg',            file: 'sounds/films/(Taxi) Pump It.mp3',                                                title: 'Taxi (Pump It)' },
        ]
      },
      {
        label: 'Épopée / Fantastique', icon: '✨', color: '#ffdd88',
        items: [
          { name: 'Héroïsme Sauvetage',   img: 'images/films/superman.jpg',        file: 'sounds/films/(Superman) Theme - John Williams.mp3',                 start: 38.6, title: 'Superman' },
          { name: 'Aventure Grandiose',   img: 'images/films/star-wars.jpg',       file: 'sounds/films/(Star Wars) Main Theme.mp3',                           start:  7.8, title: 'Star Wars' },
          { name: 'Magie Émerveillement', img: 'images/films/potter.jpg',          file: 'sounds/films/(Harry Potter) Theme.mp3',                             start: 43.0, title: 'Harry Potter' },
        ]
      },
      {
        label: 'Aventure', icon: '🗺️', color: '#88bb66',
        items: [
          { name: 'Aventure Trépidante',  img: 'images/films/indiana-jones.jpg',   file: 'sounds/films/(Indiana Jones) Theme - John Williams.mp3',            start:  6.8, title: 'Indiana Jones' },
          { name: 'Liberté Maritime',     img: 'images/films/pirate.jpg',          file: 'sounds/films/(Pirate des Caraibes) Theme.mp3',                                   title: 'Pirates des Caraïbes' },
          { name: 'Découverte Voyage',    img: 'images/films/1492.jpg',            file: 'sounds/films/(1492 Conquest of Paradise) Vangelis.mp3',             start: 15.5, title: '1492 (Vangelis)' },
        ]
      },
      {
        label: 'Policier', icon: '🔎', color: '#88aacc',
        items: [
          { name: 'Déduction Énigme',     img: 'images/films/sherlock.jpg',        file: 'sounds/films/(Sherlock Holmes) Theme.mp3',                          start: 22.2, title: 'Sherlock Holmes' },
          { name: 'Scène Crime',          img: 'images/films/experts.jpg',         file: 'sounds/films/(Les Experts) generique.mp3',                          start:  4.0, title: 'Les Experts (Who Are You)' },
          { name: 'Mystère Inexpliqué',   img: 'images/films/x-files.jpg',         file: 'sounds/films/(The x files) Theme.mp3',                              start:  0.1, title: 'X-Files' },
        ]
      },
      {
        label: 'Sport', icon: '🏆', color: '#ffaa44',
        items: [
          { name: 'Motivation Combat',    img: 'images/films/rocky-eye-tiger.jpg', file: 'sounds/films/(Rocky) Eye Of The Tiger - Survivor.mp3',              start:  0.2, title: 'Rocky (Eye of the Tiger)' },
          { name: 'Victoire Triomphe',    img: 'images/films/rocky-fly-now.jpg',   file: 'sounds/films/(Rocky) Gonna Fly Now - Bill Conti.mp3',               start:  1.2, title: 'Rocky (Gonna Fly Now)' },
          { name: 'Dépassement Sportif',  img: 'images/films/chariots-de-feu.jpg', file: 'sounds/films/(Les chariots de feu) Vangelis.mp3',                   start: 28.5, title: 'Les Chariots de Feu' }, // TODO:: Changer, prendre cette vidéo à la palce : https://www.youtube.com/watch?v=1eYGl8PNjlU&list=RD1eYGl8PNjlU
        ]
      },
      {
        label: 'Romance', icon: '❤️', color: '#ff99bb',
        items: [
          { name: 'Climax Romantique',    img: 'images/films/Dirty-dancing.jpg',   file: 'sounds/films/(Dirty Dancing) The Time Of My Life.mp3',              start:  2.0, title: 'Dirty Dancing (The Time of My Life)' },
          { name: 'Amour Éternel',        img: 'images/films/titanic.jpg',         file: 'sounds/films/(Titanic) My Heart Will Go On - Celine Dion.mp3',      start:195.2, title: 'Titanic (My Heart Will Go On)' },
          { name: 'Amour Léger',          img: 'images/films/love-actually.jpg',   file: 'sounds/films/(Love Actually) - Craig Armstrong.mp3',                start:319.0, title: 'Love Actually' },
        ]
      },
      {
        label: 'Comédie', icon: '😂', color: '#ffcc66',
        items: [
          { name: 'Malaise Absurde',      img: 'images/films/curb-your.jpg',       file: 'sounds/films/(Curb Your Enthusiasm) Theme.mp3',                     start:  0.5, title: 'Curb Your Enthusiasm' },
          { name: 'Enquête Maladroite',   img: 'images/films/pink-panthere.jpg',   file: 'sounds/films/(The Pink Panther) Theme.mp3',                         start:  6.3, title: 'The Pink Panther' },
          { name: 'Poursuite Burlesque',  img: 'images/films/benny.jpg',           file: 'sounds/films/(Benny Hill) Theme.mp3',                               start:  3.2, title: 'Benny Hill' },
        ]
      },
    ]
  },

];
