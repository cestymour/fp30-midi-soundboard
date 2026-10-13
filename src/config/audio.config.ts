import type { AudioTab } from '../types.ts';

export const AUDIO_TABS: AudioTab[] = [
/*
  // ════════════════════════════════════════════════════════
  // ONGLET — Nature
  // ════════════════════════════════════════════════════════
  {
    id: 'nature',
    label: 'Nature',
    icon: '🌿',
    accent: '#4cffaa',
    categories: [

      {
        id: 'nature-eau', label: 'Nature & Eau', icon: '🌊', color: '#4cffaa',
        items: [
          { id: 'foret', name: 'Forêt',            icon: '🌲', file: 'sounds/foret-oiseau.wav' },
          { id: 'pluie', name: 'Pluie',            icon: '🌧️', file: 'sounds/pluie.wav' },
          { id: 'orage', name: 'Orage',            icon: '⛈️', file: 'sounds/orage.mp3' },
          { id: 'vent', name: 'Vent',             icon: '💨', file: 'sounds/vent.mp3' },
          { id: 'riviere', name: 'Rivière',          icon: '🏞️', file: 'sounds/riviere.mp3' },
          { id: 'ocean', name: 'Océan',            icon: '🌊', file: 'sounds/ocean.wav' },
          { id: 'tonnerre', name: 'Tonnerre',         icon: '🌩️', file: 'sounds/tonnerre.mp3' },
        ]
      },

      {
        id: 'faune', label: 'Faune', icon: '🐾', color: '#ffdd55',
        items: [
          { id: 'cigales', name: 'Cigales',          icon: '🦗', file: 'sounds/nuit-criquet.wav' },
          { id: 'oiseaux', name: 'Oiseaux',          icon: '🐦', file: 'sounds/oiseaux.mp3' },
          { id: 'feu', name: 'Feu',              icon: '🔥', file: 'sounds/feu_cheminee.ogg' },
        ]
      },

    ]
  },
*/
  // ════════════════════════════════════════════════════════
  // ONGLET — Animaux (grille 4×8)
  // ════════════════════════════════════════════════════════
  {
    id: 'animaux',
    label: 'Animaux',
    icon: '🐾',
    accent: '#4ade80',
    gridType: 'animals',
    categories: [
      {
        id: 'tous-les-animaux',
        label: 'Tous les animaux',
        icon: '🔊',
        color: '#88ccff',
        items: [
          // ── Ligne 1 ──
          { id: 'cheval-hiii', name: 'Cheval : Hiii',         icon: '🐴', file: 'sounds/animaux/cheval_hennissement.mp3',    end:1.9,    catClass: 'animaux-ferme',      title: 'Cheval Hennissement' },
          { id: 'cheval-souffle', name: 'Cheval : Souffle',      icon: '🐎', file: 'sounds/animaux/cheval_souffle.ogg',                     catClass: 'animaux-ferme',      title: 'Cheval Souffle' },
          //{ id: 'galop-cheval', name: 'Galop Cheval',          icon: '🐎', file: 'sounds/animaux/cheval_galop.ogg',                       catClass: 'animaux-ferme',      title: 'Cheval Galop' },
          { id: 'poule-cot-cot', name: 'Poule : Cot-cot',       icon: '🐔', file: 'sounds/animaux/poule_gloussement.mp3',                  catClass: 'animaux-ferme',      title: 'Poule Gloussement' },
          { id: 'coq-cocorico', name: 'Coq : Cocorico',        icon: '🐓', file: 'sounds/animaux/coq_cocorico.ogg',                       catClass: 'animaux-ferme',      title: 'Coq Cocorico' },
          { id: 'oiseau-cui-cui', name: 'Oiseau : Cui-cui',      icon: '🐦', file: 'sounds/animaux/chant_des_oiseaux.mp3',                  catClass: 'animaux-oiseau',     title: 'Chant des oiseaux Gazouillement' },
          { id: 'pigeon-rou-rou', name: 'Pigeon : Rou-rou',      icon: '🕊️', file: 'sounds/animaux/pigeon_roucoulement.mp3',                catClass: 'animaux-oiseau',     title: 'Pigeon Roucoulement' },
          { id: 'lion-tigre-roarrr', name: 'Lion/tigre : Roarrr',   icon: '🦁', file: 'sounds/animaux/lion_tigre_rugissement.mp3',             catClass: 'animaux-savane',     title: 'Lion/tigre Rugissement' },
          { id: 'hyene-hi-hi', name: 'Hyène : Hi-hi',         icon: '🐆', file: 'sounds/animaux/hyene_rire.mp3',                         catClass: 'animaux-savane',     title: 'Hyène Rire' },

          // ── Ligne 2 ──
          { id: 'vache-meuh', name: 'Vache : Meuh',          icon: '🐮', file: 'sounds/animaux/vache_meuglement.ogg',      start: 0.5,  catClass: 'animaux-ferme',      title: 'Vache Meuglement' },
          { id: 'ane-i-an', name: 'Âne : I-An',            icon: '🫏', file: 'sounds/animaux/ane_braiement.mp3',                      catClass: 'animaux-ferme',      title: 'Âne Braiement' },
          { id: 'dindon-glouglou', name: 'Dindon : Glouglou',     icon: '🦃', file: 'sounds/animaux/dindon_glouglou.mp3',                    catClass: 'animaux-ferme',      title: 'Dindon Glouglou' },
          { id: 'canard-coin-coin', name: 'Canard : Coin-coin',    icon: '🦆', file: 'sounds/animaux/canard_cancanement.mp3',                 catClass: 'animaux-ferme',      title: 'Canard Cancanement' },
          { id: 'corbeau-croa-croa', name: 'Corbeau : Croa-croa',   icon: '🐦‍⬛', file: 'sounds/animaux/corbeau_croassement.mp3',                catClass: 'animaux-oiseau',     title: 'Corbeau Croassement' },
          { id: 'aigle-cri-percant', name: 'Aigle : Cri perçant',   icon: '🦅', file: 'sounds/animaux/aigle_faucon_cri_percant.mp3',           catClass: 'animaux-oiseau',     title: 'Aigle / Faucon Cri perçant' },
          { id: 'elephant', name: 'Éléphant',              icon: '🐘', file: 'sounds/animaux/elephant_barrissement.mp3', start: 0.5, end: 6, catClass: 'animaux-savane',     title: 'Éléphant Barrissement' },
          { id: 'singe-ouh-ouh', name: 'Singe : Ouh-ouh',       icon: '🐒', file: 'sounds/animaux/singe_cris.mp3',                         catClass: 'animaux-savane',     title: 'Singe Cris' },

          // ── Ligne 3 ──
          { id: 'chat-miaou', name: 'Chat : Miaou',          icon: '🐱', file: 'sounds/animaux/chat_miaulement.mp3',                    catClass: 'animaux-domestique', title: 'Chat Miaulement' },
          { id: 'chat-ronron', name: 'Chat : Ronron',         icon: '🐈', file: 'sounds/animaux/chat_ronronnement.ogg',                  catClass: 'animaux-domestique', title: 'Chat Ronronnement' },
          { id: 'mouton-beee', name: 'Mouton : Bêêê',         icon: '🐑', file: 'sounds/animaux/mouton_chevre_belement.ogg',             catClass: 'animaux-ferme',      title: 'Mouton/Chèvre Bêlement' },
          { id: 'cochon-groin', name: 'Cochon : Groin',        icon: '🐷', file: 'sounds/animaux/cochon_grognement.mp3',                  catClass: 'animaux-ferme',      title: 'Cochon Grognement / Couinement' },
          { id: 'chouette-hou-hou', name: 'Chouette : Hou-hou',    icon: '🦉', file: 'sounds/animaux/chouette_hibou_hululements.mp3',end:2.6, catClass: 'animaux-oiseau',     title: 'Chouette / Hibou Hululements' },
          { id: 'grillon-zzzzz', name: 'Grillon : Zzzzz',       icon: '🦗', file: 'sounds/animaux/grillon_gresillement.mp3',               catClass: 'animaux-insecte',    title: 'Grillon Grésillement' },
          { id: 'serpent-sssss', name: 'Serpent : Sssss',       icon: '🐍', file: 'sounds/animaux/serpent_sifflement.mp3',                 catClass: 'animaux-savane',     title: 'Serpent Sifflement' },
          { id: 'grenouille-coaa', name: 'Grenouille : Coââ',     icon: '🐸', file: 'sounds/animaux/grenouille_coassement.mp3',              catClass: 'animaux-aquatique',  title: 'Grenouille Coassement' },

          // ── Ligne 4 ──
          { id: 'chien-ouaf', name: 'Chien : Ouaf',          icon: '🐶', file: 'sounds/animaux/chien_aboiement.mp3',                    catClass: 'animaux-domestique', title: 'Chien Aboiement' },
          { id: 'chien-grrr', name: 'Chien : Grrr',          icon: '🐕', file: 'sounds/animaux/chien_grognement.mp3',                   catClass: 'animaux-domestique', title: 'Chien Grognement' },
          { id: 'loup-aouuuuh', name: 'Loup : Aouuuuh',        icon: '🐺', file: 'sounds/animaux/loup_hurlement.mp3',            end:5.1, catClass: 'animaux-foret',      title: 'Loup Hurlement' },
          { id: 'ours-grrr', name: 'Ours : Grrr',           icon: '🐻', file: 'sounds/animaux/ours_grognement.mp3',                    catClass: 'animaux-foret',      title: 'Ours Grognement' },
          { id: 'cigale-tszzzz', name: 'Cigale : Tszzzz',       icon: '🦗', file: 'sounds/animaux/cigale_chant.mp3',                       catClass: 'animaux-insecte',    title: 'Cigale Chant' },
          { id: 'abeille-bzzzz', name: 'Abeille : Bzzzz',       icon: '🐝', file: 'sounds/animaux/moustique_bourdonnement.mp3',            catClass: 'animaux-insecte',    title: 'Abeille / Mouche / Moustique Bourdonnement' },
          { id: 'dauphin-i-i-i-i', name: 'Dauphin : I i i i',     icon: '🐬', file: 'sounds/animaux/dauphin_sifflements.mp3',                catClass: 'animaux-aquatique',  title: 'Dauphin Clics et sifflements' },
          { id: 'baleine-chant', name: 'Baleine : Chant',       icon: '🐋', file: 'sounds/animaux/baleine_chant.mp3',             end:3.2, catClass: 'animaux-aquatique',  title: 'Baleine Chant' },
        ]
      }
    ]
  },
/*
  // ════════════════════════════════════════════════════════
  // ONGLET — Ambiances
  // ════════════════════════════════════════════════════════
  {
    id: 'ambiances',
    label: 'Ambiances',
    icon: '🏙️',
    accent: '#88ccff',
    categories: [

      {
        id: 'lieux', label: 'Lieux', icon: '📍', color: '#88ccff',
        items: [
          { id: 'cafe', name: 'Café',             icon: '☕', file: 'sounds/discussion_foule.ogg', start: 12.6 },
          { id: 'bureau', name: 'Bureau',           icon: '🖥️', file: 'sounds/bureau.wav' },
          { id: 'bibliotheque', name: 'Bibliothèque',     icon: '📚', file: 'sounds/bibliotheque.mp3' },
          { id: 'marche', name: 'Marché',           icon: '🛒', file: 'sounds/marche.mp3' },
          { id: 'restaurant', name: 'Restaurant',       icon: '🍽️', file: 'sounds/discussion_foule.ogg' },
          { id: 'nuit-urbaine', name: 'Nuit urbaine',     icon: '🌃', file: 'sounds/nuit_ville.mp3' },
        ]
      },

      {
        id: 'transport', label: 'Transport', icon: '🚇', color: '#55aaff',
        items: [
          { id: 'metro', name: 'Métro',            icon: '🚇', file: 'sounds/metro.wav' },
          { id: 'train', name: 'Train',            icon: '🚂', file: 'sounds/train.wav' },
        ]
      },

    ]
  },

  // ════════════════════════════════════════════════════════
  // ONGLET — Effets
  // ════════════════════════════════════════════════════════
  {
    id: 'effets',
    label: 'Effets',
    icon: '⚡',
    accent: '#dd66ff',
    categories: [

      {
        id: 'notifications', label: 'Notifications', icon: '🔔', color: '#dd66ff',
        items: [
          { id: 'click', name: 'Click',            icon: '🖱️', file: 'sounds/click.mp3' },
          { id: 'notif', name: 'Notif',            icon: '🔔', file: 'sounds/notification.wav' },
          { id: 'alarme', name: 'Alarme',           icon: '🚨', file: 'sounds/alarme.mp3' },
          { id: 'succes', name: 'Succès',           icon: '✅', file: 'sounds/success.wav' },
          { id: 'erreur', name: 'Erreur',           icon: '❌', file: 'sounds/erreur.mp3' },
        ]
      },

      {
        id: 'action', label: 'Action', icon: '💥', color: '#ff66aa',
        items: [
          { id: 'laser', name: 'Laser',            icon: '🔴', file: 'sounds/laser.wav' },
          { id: 'explosion', name: 'Explosion',        icon: '💥', file: 'sounds/explosion.mp3' },
          { id: 'feux-d-artifices', name: 'Feux d\'artifices', icon: '🎆', file: 'sounds/feux_artifices.mp3' },
          { id: 'glitch', name: 'Glitch',           icon: '📡', file: 'sounds/glitch.wav' },
          { id: 'machine-a-cafe', name: 'Machine à café',   icon: '☕', file: 'sounds/bruit_machine_cafe.mp3' },
        ]
      },

    ]
  },

  // ════════════════════════════════════════════════════════
  // ONGLET — Musique
  // ════════════════════════════════════════════════════════
  {
    id: 'musique',
    label: 'Musique',
    icon: '🎵',
    accent: '#ffcc55',
    categories: [

      {
        id: 'instruments', label: 'Instruments', icon: '🎸', color: '#ffcc55',
        items: [
          { id: 'batterie', name: 'Batterie',         icon: '🥁', file: 'sounds/drums.mp3' },
          { id: 'basse', name: 'Basse',            icon: '🎸', file: 'sounds/basse.wav' },
          { id: 'piano', name: 'Piano',            icon: '🎹', file: 'sounds/piano.mp3' },
          { id: 'violon', name: 'Violon',           icon: '🎻', file: 'sounds/violon.wav' },
          { id: 'trompette', name: 'Trompette',        icon: '🎺', file: 'sounds/trompette.mp3' },
          { id: 'synthwave', name: 'Synthwave',        icon: '🎛️', file: 'sounds/synthwave.wav' },
        ]
      },

    ]
  },
  */

  // ════════════════════════════════════════════════════════
  // ONGLET — Musique de films
  // ════════════════════════════════════════════════════════
  {
    id: 'films',
    label: 'Films',
    icon: '🎬',
    accent: '#00bbaa',
    cols: 4,
    categories: [
      {
        id: 'horreur', label: 'Horreur', icon: '😱', color: '#ff6666',
        items: [
          { id: 'saw', name: 'Ambiance tendu',      img: 'images/films/saw.jpg',             file: 'sounds/films/(Saw) Theme.mp3',                                      start: 21.2, title: 'Saw' },
          { id: 'jaws', name: 'Danger proche',       img: 'images/films/jaws.jpg',            file: 'sounds/films/(Les Dents De La Mer) Theme.mp3',                      start:  9.5, title: 'Les Dents de la Mer' },
          { id: 'psycho', name: 'Au secours Ahhh !',   img: 'images/films/psycho.jpg',          file: 'sounds/films/(Psycho) Shower Scene.mp3',                            start:  0.1, title: 'Psycho (Scène Douche)' },
        ]
      },
      {
        id: 'drame', label: 'Drame', icon: '💔', color: '#8888cc',
        items: [
          { id: 'requiem', name: 'Descente enfer',      img: 'images/films/requiem.jpg',         file: 'sounds/films/(Requiem for a Dream) Theme.mp3',                      start: 38.9, title: 'Requiem for a Dream' },
          { id: 'platoon', name: 'Sacrifice Guerre',     img: 'images/films/platoon.jpg',         file: 'sounds/films/(Platoon) Theme.mp3',                      end : 509,  start:285.5, title: 'Platoon' },
          { id: 'professionel', name: 'Adieu Poignant',       img: 'images/films/professionel.jpg',    file: 'sounds/films/(Le Professionnel) Chi Mai - Ennio Morricone.mp3',     start: 39.6, title: 'Le Professionnel (Chi Mai)' },
        ]
      },
      {
        id: 'tragedie', label: 'Tragédie', icon: '🥀', color: '#aa88aa',
        items: [
          { id: 'dark-vador', name: 'Menace Imposante',     img: 'images/films/dark-vador.jpg',      file: 'sounds/films/(Star Wars) Dark Vador Theme.mp3',                     start:  9.5, title: 'Star Wars (Thème de Dark Vador)' },
          { id: 'star-wars-duel', name: 'Combat Épique',        img: 'images/films/star-wars-duel.jpg',  file: 'sounds/films/(Star Wars) Duel of the Fates.mp3',                    start: 60.0, title: 'Star Wars (Duel of the Fates)' },
          { id: 'le-parrain', name: 'Mafia Respect',        img: 'images/films/le_parrain.jpg',      file: 'sounds/films/(Le parrain) Love Theme.mp3',                          start:  0.4, title: 'Le Parrain (Love Theme)' },
        ]
      },
      {
        id: 'western', label: 'Western', icon: '🤠', color: '#cc8844',
        items: [
          { id: 'bon-brute-truand', name: 'Duel ',                img: 'images/films/bon-brute-truand.jpg',file: 'sounds/films/(Le Bon la Brute et le Truand) Theme.mp3',             start: 5.0, title: 'Le Bon la Brute et le Truand' },
          { id: 'guimbarde', name: 'Chasse à l\'homme',    img: 'images/films/guimbarde.jpg',       file: 'sounds/films/(Pour quelques dollars de plus) Theme.mp3',            start: 26.7, title: 'Pour quelques dollars de plus' },
          { id: 'harmonica', name: 'Vengeance Duel Lent',  img: 'images/films/harmonica.jpg',       file: 'sounds/films/(Il était une fois dans l\'ouest) L\'homme à l\'harmonica.mp3', start: 7, title: 'Il était une fois dans l\'Ouest (L\'homme à l\'harmonica)' },
        ]
      },
      {
        id: 'espionnage-action', label: 'Espionnage / Action', icon: '🕵️‍♀️', color: '#6688aa',
        items: [
          { id: 'mission-impossible', name: 'Mission Infilration',  img: 'images/films/mission-impossible.jpg', file: 'sounds/films/(Mission Impossible) Main Theme2.mp3',              start:  2.8, title: 'Mission Impossible' },
          { id: 'james-bond', name: '007 Agent secret',     img: 'images/films/james-bond.jpg',      file: 'sounds/films/(James Bond) Theme.mp3',                               start:  7.0, title: 'James Bond' },
          { id: 'matrix', name: 'Grave badass',         img: 'images/films/matrix.jpg',          file: 'sounds/films/(Matrix) Clubbed to Death.mp3',                        start:  8.25,title: 'Matrix (Clubbed to Death)' },
        ]
      },
      {
        id: 'policier', label: 'Policier', icon: '🔎', color: '#88aacc',
        items: [
          { id: 'sherlock', name: 'Déduction Énigme',     img: 'images/films/sherlock.jpg',        file: 'sounds/films/(Sherlock Holmes) Theme.mp3',                          start: 22.2, title: 'Sherlock Holmes' },
          { id: 'experts', name: 'Scène Crime',          img: 'images/films/experts.jpg',         file: 'sounds/films/(Les Experts) generique.mp3',                          start:  4.0, title: 'Les Experts (Who Are You)' },
          { id: 'x-files', name: 'Mystère Inexpliqué',   img: 'images/films/x-files.jpg',         file: 'sounds/films/(The x files) Theme.mp3',                              start:  0.1, title: 'X-Files' },
        ]
      },
      {
        id: 'epopee-fantastique', label: 'Épopée / Fantastique', icon: '✨', color: '#ffdd88',
        items: [
          { id: 'superman', name: 'Héros Sauvetage',      img: 'images/films/superman.jpg',        file: 'sounds/films/(Superman) Theme - John Williams.mp3',                 start: 38.6, title: 'Superman' },
          { id: 'star-wars', name: 'Aventure Grandiose',   img: 'images/films/star-wars.jpg',       file: 'sounds/films/(Star Wars) Main Theme.mp3',                           start:  7.8, title: 'Star Wars' },
          { id: 'potter', name: 'Magie Émerveillement', img: 'images/films/potter.jpg',          file: 'sounds/films/(Harry Potter) Theme.mp3',                             start: 43.0, title: 'Harry Potter' },
        ]
      },
      {
        id: 'aventure', label: 'Aventure', icon: '🗺️', color: '#88bb66',
        items: [
          { id: 'indiana-jones', name: 'Aventure Trépidante',  img: 'images/films/indiana-jones.jpg',   file: 'sounds/films/(Indiana Jones) Theme - John Williams.mp3',            start:  6.8, title: 'Indiana Jones' },
          { id: 'pirate', name: 'Pirate Aventure',      img: 'images/films/pirate.jpg',          file: 'sounds/films/(Pirate des Caraibes) Theme.mp3',                                   title: 'Pirates des Caraïbes' },
          { id: '1492', name: 'Corsaire Voyage',      img: 'images/films/1492.jpg',            file: 'sounds/films/(1492 Conquest of Paradise) Vangelis.mp3',             start: 15.5, title: '1492 (Vangelis)' },
        ]
      },
      {
        id: 'action-poursuite', label: 'Action / Poursuite', icon: '💥', color: '#ff8844',
        items: [
          { id: 'kill-bill', name: 'Préparation Duel',     img: 'images/films/kill-bill.jpg',       file: 'sounds/films/(Kill Bill) Battle Without Honor Or Humanity.mp3',     start:  1.3, title: 'Kill Bill' }, // Attention, présence de voix de scène dans la musique TODO:: changer la musique
          { id: 'kill-bill-hornet', name: 'Course Poursuite',     img: 'images/films/kill-bill-hornet.jpg',file: 'sounds/films/(Kill Bill) The Green Hornet.mp3',                     start:  0.2, title: 'Kill Bill (The Green Hornet)' },
          { id: 'taxi', name: 'Course Poursuite',     img: 'images/films/taxi.jpg',            file: 'sounds/films/(Taxi) Pump It.mp3',                                                title: 'Taxi (Pump It)' },
        ]
      },
      {
        id: 'sport', label: 'Sport', icon: '🏆', color: '#ffaa44',
        items: [
          { id: 'rocky-eye-tiger', name: 'Motivation Combat',    img: 'images/films/rocky-eye-tiger.jpg', file: 'sounds/films/(Rocky) Eye Of The Tiger - Survivor.mp3',              start:  0.2, title: 'Rocky (Eye of the Tiger)' },
          { id: 'rocky-fly-now', name: 'Victoire Triomphe',    img: 'images/films/rocky-fly-now.jpg',   file: 'sounds/films/(Rocky) Gonna Fly Now - Bill Conti.mp3',               start:  1.2, title: 'Rocky (Gonna Fly Now)' },
          { id: 'chariots-de-feu', name: 'Ralenti Dépassement',  img: 'images/films/chariots-de-feu.jpg', file: 'sounds/films/(Les chariots de feu) Vangelis.mp3',                   start: 28.5, title: 'Les Chariots de Feu' }, // TODO:: Changer, prendre cette vidéo à la palce : https://www.youtube.com/watch?v=1eYGl8PNjlU&list=RD1eYGl8PNjlU
        ]
      },
      {
        id: 'romance', label: 'Romance', icon: '❤️', color: '#ff99bb',
        items: [
          { id: 'dirty-dancing', name: 'Dirty Dancing',        img: 'images/films/Dirty-dancing.jpg',   file: 'sounds/films/(Dirty Dancing) The Time Of My Life.mp3',              start:  2.0, title: 'Dirty Dancing (The Time of My Life)' },
          { id: 'titanic', name: 'Amour Éternel',        img: 'images/films/titanic.jpg',         file: 'sounds/films/(Titanic) My Heart Will Go On - Celine Dion.mp3',      start:195.2, title: 'Titanic (My Heart Will Go On)' },
          { id: 'love-actually', name: 'Amour Léger',          img: 'images/films/love-actually.jpg',   file: 'sounds/films/(Love Actually) - Craig Armstrong.mp3',                start:319.0, title: 'Love Actually' },
        ]
      },
      {
        id: 'comedie', label: 'Comédie', icon: '😂', color: '#ffcc66',
        items: [
          { id: 'curb-your', name: 'Malaise Absurde',      img: 'images/films/curb-your.jpg',       file: 'sounds/films/(Curb Your Enthusiasm) Theme.mp3',                     start:  0.5, title: 'Curb Your Enthusiasm' },
          { id: 'pink-panthere', name: 'Enquête Maladroite',   img: 'images/films/pink-panthere.jpg',   file: 'sounds/films/(The Pink Panther) Theme.mp3',                         start:  6.3, title: 'The Pink Panther' },
          { id: 'benny', name: 'Poursuite Burlesque',  img: 'images/films/benny.jpg',           file: 'sounds/films/(Benny Hill) Theme.mp3',                               start:  3.2, title: 'Benny Hill' },
        ]
      },
    ]
  },

];
