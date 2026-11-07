import type { AudioTab } from '../types.ts';

export const AUDIO_TABS: AudioTab[] = [
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
          { id: 'cheval-hiii',       name: 'Cheval : Hiii',       icon: '🐴',   file: 'sounds/animaux/cheval_hennissement.mp3',        end: 1.9,           catClass: 'animaux-ferme',      title: 'Cheval Hennissement' },
          { id: 'cheval-souffle',    name: 'Cheval : Souffle',    icon: '🐎',   file: 'sounds/animaux/cheval_souffle.ogg',                                 catClass: 'animaux-ferme',      title: 'Cheval Souffle' },
       // { id: 'galop-cheval',      name: 'Galop Cheval',        icon: '🐎',   file: 'sounds/animaux/cheval_galop.ogg',                                   catClass: 'animaux-ferme',      title: 'Cheval Galop' },
          { id: 'poule-cot-cot',     name: 'Poule : Cot-cot',     icon: '🐔',   file: 'sounds/animaux/poule_gloussement.mp3',                              catClass: 'animaux-ferme',      title: 'Poule Gloussement' },
          { id: 'coq-cocorico',      name: 'Coq : Cocorico',      icon: '🐓',   file: 'sounds/animaux/coq_cocorico.ogg',                                   catClass: 'animaux-ferme',      title: 'Coq Cocorico' },
          { id: 'oiseau-cui-cui',    name: 'Oiseau : Cui-cui',    icon: '🐦',   file: 'sounds/animaux/chant_des_oiseaux.mp3',                              catClass: 'animaux-oiseau',     title: 'Chant des oiseaux Gazouillement' },
          { id: 'pigeon-rou-rou',    name: 'Pigeon : Rou-rou',    icon: '🕊️',  file: 'sounds/animaux/pigeon_roucoulement.mp3',                            catClass: 'animaux-oiseau',     title: 'Pigeon Roucoulement' },
          { id: 'lion-tigre-roarrr', name: 'Lion/tigre : Roarrr', icon: '🦁',   file: 'sounds/animaux/lion_tigre_rugissement.mp3',                         catClass: 'animaux-savane',     title: 'Lion/tigre Rugissement' },
          { id: 'hyene-hi-hi',       name: 'Hyène : Hi-hi',       icon: '🐆',   file: 'sounds/animaux/hyene_rire.mp3',                                     catClass: 'animaux-savane',     title: 'Hyène Rire' },

          // ── Ligne 2 ──
          { id: 'vache-meuh',        name: 'Vache : Meuh',        icon: '🐮',   file: 'sounds/animaux/vache_meuglement.ogg',           start: 0.5,         catClass: 'animaux-ferme',      title: 'Vache Meuglement' },
          { id: 'ane-i-an',          name: 'Âne : I-An',          icon: '🫏',   file: 'sounds/animaux/ane_braiement.mp3',                                  catClass: 'animaux-ferme',      title: 'Âne Braiement' },
          { id: 'dindon-glouglou',   name: 'Dindon : Glouglou',   icon: '🦃',   file: 'sounds/animaux/dindon_glouglou.mp3',                                catClass: 'animaux-ferme',      title: 'Dindon Glouglou' },
          { id: 'canard-coin-coin',  name: 'Canard : Coin-coin',  icon: '🦆',   file: 'sounds/animaux/canard_cancanement.mp3',                             catClass: 'animaux-ferme',      title: 'Canard Cancanement' },
          { id: 'corbeau-croa-croa', name: 'Corbeau : Croa-croa', icon: '🐦‍⬛', file: 'sounds/animaux/corbeau_croassement.mp3',                            catClass: 'animaux-oiseau',     title: 'Corbeau Croassement' },
          { id: 'aigle-cri-percant', name: 'Aigle : Cri perçant', icon: '🦅',   file: 'sounds/animaux/aigle_faucon_cri_percant.mp3',                       catClass: 'animaux-oiseau',     title: 'Aigle / Faucon Cri perçant' },
          { id: 'elephant',          name: 'Éléphant',            icon: '🐘',   file: 'sounds/animaux/elephant_barrissement.mp3',      start: 0.5, end: 6, catClass: 'animaux-savane',     title: 'Éléphant Barrissement' },
          { id: 'singe-ouh-ouh',     name: 'Singe : Ouh-ouh',     icon: '🐒',   file: 'sounds/animaux/singe_cris.mp3',                                     catClass: 'animaux-savane',     title: 'Singe Cris' },

          // ── Ligne 3 ──
          { id: 'chat-miaou',        name: 'Chat : Miaou',        icon: '🐱',   file: 'sounds/animaux/chat_miaulement.mp3',                                catClass: 'animaux-domestique', title: 'Chat Miaulement' },
          { id: 'chat-ronron',       name: 'Chat : Ronron',       icon: '🐈',   file: 'sounds/animaux/chat_ronronnement.ogg',                              catClass: 'animaux-domestique', title: 'Chat Ronronnement' },
          { id: 'mouton-beee',       name: 'Mouton : Bêêê',       icon: '🐑',   file: 'sounds/animaux/mouton_chevre_belement.ogg',                         catClass: 'animaux-ferme',      title: 'Mouton/Chèvre Bêlement' },
          { id: 'cochon-groin',      name: 'Cochon : Groin',      icon: '🐷',   file: 'sounds/animaux/cochon_grognement.mp3',                              catClass: 'animaux-ferme',      title: 'Cochon Grognement / Couinement' },
          { id: 'chouette-hou-hou',  name: 'Chouette : Hou-hou',  icon: '🦉',   file: 'sounds/animaux/chouette_hibou_hululements.mp3', end: 2.6,           catClass: 'animaux-oiseau',     title: 'Chouette / Hibou Hululements' },
          { id: 'grillon-zzzzz',     name: 'Grillon : Zzzzz',     icon: '🦗',   file: 'sounds/animaux/grillon_gresillement.mp3',                           catClass: 'animaux-insecte',    title: 'Grillon Grésillement' },
          { id: 'serpent-sssss',     name: 'Serpent : Sssss',     icon: '🐍',   file: 'sounds/animaux/serpent_sifflement.mp3',                             catClass: 'animaux-savane',     title: 'Serpent Sifflement' },
          { id: 'grenouille-coaa',   name: 'Grenouille : Coââ',   icon: '🐸',   file: 'sounds/animaux/grenouille_coassement.mp3',                          catClass: 'animaux-aquatique',  title: 'Grenouille Coassement' },

          // ── Ligne 4 ──
          { id: 'chien-ouaf',        name: 'Chien : Ouaf',        icon: '🐶',   file: 'sounds/animaux/chien_aboiement.mp3',                                catClass: 'animaux-domestique', title: 'Chien Aboiement' },
          { id: 'chien-grrr',        name: 'Chien : Grrr',        icon: '🐕',   file: 'sounds/animaux/chien_grognement.mp3',                               catClass: 'animaux-domestique', title: 'Chien Grognement' },
          { id: 'loup-aouuuuh',      name: 'Loup : Aouuuuh',      icon: '🐺',   file: 'sounds/animaux/loup_hurlement.mp3',             end: 5.1,           catClass: 'animaux-foret',      title: 'Loup Hurlement' },
          { id: 'ours-grrr',         name: 'Ours : Grrr',         icon: '🐻',   file: 'sounds/animaux/ours_grognement.mp3',                                catClass: 'animaux-foret',      title: 'Ours Grognement' },
          { id: 'cigale-tszzzz',     name: 'Cigale : Tszzzz',     icon: '🦗',   file: 'sounds/animaux/cigales_chant.mp3',                                  catClass: 'animaux-insecte',    title: 'Cigale Chant' },
          { id: 'abeille-bzzzz',     name: 'Abeille : Bzzzz',     icon: '🐝',   file: 'sounds/animaux/moustique_bourdonnement.mp3',                        catClass: 'animaux-insecte',    title: 'Abeille / Mouche / Moustique Bourdonnement' },
          { id: 'dauphin-i-i-i-i',   name: 'Dauphin : I i i i',   icon: '🐬',   file: 'sounds/animaux/dauphin_sifflements.mp3',                            catClass: 'animaux-aquatique',  title: 'Dauphin Clics et sifflements' },
          { id: 'baleine-chant',     name: 'Baleine : Chant',     icon: '🐋',   file: 'sounds/animaux/baleine_chant.mp3',              end: 3.2,           catClass: 'animaux-aquatique',  title: 'Baleine Chant' },
        ]
      }
    ]
  },

  // ════════════════════════════════════════════════════════
  // ONGLET — Bruits (même grille que les Animaux)
  // ════════════════════════════════════════════════════════
  {
    id: 'effets',
    label: 'Bruits',
    icon: '⚡',
    accent: '#dd66ff',
    gridType: 'animals',
    categories: [
      {
        id: 'tous-les-bruits', label: 'Tous les bruits', icon: '🔊', color: '#dd66ff',
        items: [
          // ── Bureau et technologie ──
          { id: 'clavier',                 name: 'Clavier',              icon: '⌨️', file: 'sounds/bruits/bruit-clavier-ordinateur.mp3' },
          { id: 'machine-a-ecrire',        name: 'Machine à écrire',     icon: '📝', file: 'sounds/bruits/machine_a_ecrire.ogg' },
          { id: 'modem-56k',               name: 'Modem 56k',            icon: '📠', file: 'sounds/bruits/connexion-modem-56k.mp3' },
          { id: 'erreur-windows',          name: 'Erreur Windows',       icon: '🖥️', file: 'sounds/bruits/erreur_windows_xp.mp3',        start: 0.2,            noFade: true},
          { id: 'notification',            name: 'Notification',         icon: '🔔', file: 'sounds/bruits/bruit_notification.mp3',       start: 0.8,            noFade: true},
          { id: 'bip-morse',               name: 'Bip morse',            icon: '📡', file: 'sounds/bruits/bip_code_morse.mp3',                                  noFade: true},
          { id: 'appareil-photo',          name: 'Appareil photo',       icon: '📷', file: 'sounds/bruits/bruit_appareil_photo.mp3',     start: 0.15, end: 0.7, noFade: true },
          { id: 'machine-a-cafe',          name: 'Machine à café',       icon: '☕', file: 'sounds/bruits/bruit_machine_cafe.mp3' },

          // ── Téléphone, sonnettes et annonces ──
          { id: 'sonnerie-portable',       name: 'Sonnerie portable',    icon: '📱', file: 'sounds/bruits/sonnerie_portable.mp3',        start: 0.3 },
          { id: 'vibreur',                 name: 'Vibreur',              icon: '📳', file: 'sounds/bruits/vibreur_telephone.mp3' },
          { id: 'tonalite-appel',          name: 'Tonalité d\'appel',    icon: '📞', file: 'sounds/bruits/tonalite_appel.mp3',           start: 5.1,            noFade: true },
          { id: 'tonalite-raccroche',      name: 'Raccroché',            icon: '☎️', file: 'sounds/bruits/tonalite_raccroche.mp3',                              noFade: true },
          { id: 'sonnette-porte',          name: 'Sonnette',             icon: '🛎️', file: 'sounds/bruits/sonnette_porte.mp3',                                  noFade: true },
          { id: 'sonnette-velo',           name: 'Sonnette vélo',        icon: '🚲', file: 'sounds/bruits/sonnette_velo.mp3',            start: 1.1,            noFade: true },
          { id: 'annonce-sncf',            name: 'Annonce SNCF',         icon: '📢', file: 'sounds/bruits/annonce_sncf.mp3' },
          { id: 'foule-amen',              name: 'Foule : Amen',         icon: '🙏', file: 'sounds/bruits/bruit_foule_amen.mp3' },

          // ── Gags, bébés et petits plaisirs ──
          { id: 'roulement-tambour',       name: 'Roulement de tambour', icon: '🥁', file: 'sounds/bruits/roulement_de_tambour.mp3' },
          { id: 'batterie-blague',         name: 'Ba-dum-tss',           icon: '🎭', file: 'sounds/bruits/batterie_blague.mp3',                                 noFade: true },
          { id: 'buzzer-bonne-reponse',    name: 'Bonne réponse',        icon: '✅', file: 'sounds/bruits/buzzer_bonne_reponse.mp3',                            noFade: true },
          { id: 'buzzer-mauvaise-reponse', name: 'Mauvaise réponse',     icon: '❌', file: 'sounds/bruits/buzzer_mauvaise_reponse.mp3',  start: 0.6,            noFade: true },
          { id: 'bebe-pleure',             name: 'Bébé pleure',          icon: '😭', file: 'sounds/bruits/bebe_pleure.mp3' },
          { id: 'bebe-rit',                name: 'Bébé rit',             icon: '👶', file: 'sounds/bruits/bebe_rit.mp3' },
          { id: 'verre-d-eau',             name: 'Verre d\'eau',         icon: '🥛', file: 'sounds/bruits/remplissage_verre_d_eau.mp3' },
          { id: 'briquet',                 name: 'Briquet',              icon: '🚬', file: 'sounds/bruits/bruit_briquet_cirgarette.mp3',                        noFade: true },

          // ── Feu, lames et outils ──
          { id: 'prend-feu',               name: 'Prend feu',            icon: '🔥', file: 'sounds/bruits/bruit_prend_feu.ogg' },
          { id: 'epees',                   name: 'Épées',                icon: '⚔️', file: 'sounds/bruits/epee_contre_epee.mp3',                                noFade: true },
          { id: 'couteau',                 name: 'Meurtre au couteau',   icon: '🔪', file: 'sounds/bruits/meurtre_au_couteau.mp3',                              noFade: true },
          { id: 'scie-a-metaux',           name: 'Scie à métaux',        icon: '🪛', file: 'sounds/bruits/scie_a_metaux.mp3' },
          { id: 'scie-egoine',             name: 'Scie égoïne',          icon: '🪚', file: 'sounds/bruits/scie_egoine.mp3' },

          // ── Ajouts récents ──
          { id: 'klaxon',                  name: 'Klaxon',               icon: '🚗', file: 'sounds/bruits/klaxon-voiture.mp3' },
          { id: 'tic-tac-bombe',           name: 'Tic-tac bombe',        icon: '💣', file: 'sounds/bruits/tic-tac-bombe.mp3' },
          { id: 'tronconneuse',            name: 'Tronçonneuse',         icon: '🪚', file: 'sounds/bruits/bruit_tronconneuse.ogg' },
          //{ id: 'perceuse',                name: 'Perceuse',             icon: '🔧', file: 'sounds/bruits/bruit-perceuse.mp3' },
        ]
      }
    ]
  },

  // ════════════════════════════════════════════════════════
  // ONGLET — Ambiances (même grille que les Animaux)
  // ════════════════════════════════════════════════════════
  {
    id: 'ambiances',
    label: 'Ambiances',
    icon: '🏙️',
    accent: '#88ccff',
    gridType: 'animals',
    categories: [
      {
        id: 'toutes-les-ambiances', label: 'Toutes les ambiances', icon: '🔊', color: '#88ccff',
        items: [
          // ── Ville et lieux publics ──
          { id: 'ville',              name: 'Ville',              icon: '🏙️', file: 'sounds/ambiances/ville_voiture.mp3' },
          { id: 'travaux',            name: 'Travaux',            icon: '🚧', file: 'sounds/ambiances/travaux_urbains.ogg' },
          { id: 'manifestation',      name: 'Manifestation',      icon: '✊', file: 'sounds/ambiances/manifestation.mp3' },
          { id: 'gare',               name: 'Gare',               icon: '🚉', file: 'sounds/ambiances/hall_gare.mp3' },
          { id: 'cafe',               name: 'Café',               icon: '☕', file: 'sounds/ambiances/discussion_foule.ogg', start: 12.6 },
          { id: 'restaurant',         name: 'Restaurant',         icon: '🍽️', file: 'sounds/ambiances/discussions_restaurant.ogg' },
          { id: 'discussions-dehors', name: 'Discussions dehors', icon: '🗣️', file: 'sounds/ambiances/discussions_exterieures.mp3' },
          { id: 'discussions-dedans', name: 'Discussions dedans', icon: '🏠', file: 'sounds/ambiances/discussions_interieur.mp3' },
          { id: 'arcade',             name: 'Salle d\'arcade',    icon: '🕹️', file: 'sounds/ambiances/salle_jeux_arcade.ogg' },
          { id: 'recreation',         name: 'Récréation',         icon: '🏫', file: 'sounds/ambiances/recreation_maternelle.mp3' },
          { id: 'maternite',          name: 'Maternité',          icon: '👶', file: 'sounds/ambiances/maternite_pleurs_bebe.mp3' },
          { id: 'feux-d-artifices',   name: 'Feux d\'artifices',  icon: '🎆', file: 'sounds/ambiances/feux_artifices.mp3' },

          // ── Mer et nature ──
          { id: 'plage',              name: 'Plage',              icon: '🏖️', file: 'sounds/ambiances/plage_vacanciers.mp3' },
          { id: 'mer',                name: 'Mer',                icon: '🌊', file: 'sounds/ambiances/mer_vagues.mp3' },
          { id: 'vague-mouettes',     name: 'Vagues et mouettes', icon: '⚓', file: 'sounds/ambiances/vague_mouette.ogg' },
          { id: 'mouettes',           name: 'Mouettes',           icon: '🕊️', file: 'sounds/ambiances/mouettes.mp3' },
          { id: 'foret',              name: 'Forêt oiseaux',      icon: '🌲', file: 'sounds/ambiances/foret_oiseau.mp3' },
          { id: 'mare',               name: 'Mare',               icon: '🐸', file: 'sounds/ambiances/mare_grenouilles.mp3' },
          { id: 'troupeau',           name: 'Troupeau',           icon: '🐄', file: 'sounds/ambiances/troupeau_cloche.mp3' },
          { id: 'nuit-campagne',      name: 'Nuit à la campagne', icon: '🌙', file: 'sounds/ambiances/nuit_campagne.mp3' },
          { id: 'vent',               name: 'Vent',               icon: '💨', file: 'sounds/ambiances/vent.mp3' },
          { id: 'orage',              name: 'Orage',              icon: '⛈️', file: 'sounds/ambiances/pluie_tonnerre.mp3' },
          { id: 'feu',                name: 'Feu de cheminée',    icon: '🔥', file: 'sounds/ambiances/feu_cheminee.ogg' },

          // ── Peur ──
          { id: 'grotte',             name: 'Grotte',             icon: '💧', file: 'sounds/ambiances/grotte_goutte.mp3' },
          { id: 'nuit-angoissante',   name: 'Nuit angoissante',   icon: '🌑', file: 'sounds/ambiances/ambiance_nuit_peur.mp3' },
          { id: 'zombies',            name: 'Zombies',            icon: '🧟', file: 'sounds/ambiances/ambiance_bruit_zombie.mp3' },
        ]
      }
    ]
  },

  // ════════════════════════════════════════════════════════
  // ONGLET — Musiques (musiques cultes, hors films ; même grille que les Animaux)
  // ════════════════════════════════════════════════════════
  {
    id: 'musique',
    label: 'Musiques',
    icon: '🎵',
    accent: '#ffcc55',
    gridType: 'animals',
    categories: [
      {
        id: 'toutes-les-musiques', label: 'Toutes les musiques', icon: '🔊', color: '#ffcc55',
        items: [
          { id: 'ascenseur', name: 'Ascenseur', icon: '🛗', file: 'sounds/musiques/musique_ascenseur.mp3' },
        ]
      }
    ]
  },

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
          { id: 'saw',                name: 'Ambiance tendu',       img: 'images/films/saw.jpg',                file: 'sounds/films/(Saw) Theme.mp3',                                               start: 21.2,            title: 'Saw' },
          { id: 'jaws',               name: 'Danger proche',        img: 'images/films/jaws.jpg',               file: 'sounds/films/(Les Dents De La Mer) Theme.mp3',                               start: 9.5,             title: 'Les Dents de la Mer' },
          { id: 'psycho',             name: 'Au secours Ahhh !',    img: 'images/films/psycho.jpg',             file: 'sounds/films/(Psycho) Shower Scene.mp3',                                     start: 0.1,             title: 'Psycho (Scène Douche)' },
        ]
      },
      {
        id: 'drame', label: 'Drame', icon: '💔', color: '#8888cc',
        items: [
          { id: 'requiem',            name: 'Descente enfer',       img: 'images/films/requiem.jpg',            file: 'sounds/films/(Requiem for a Dream) Theme.mp3',                               start: 38.9,            title: 'Requiem for a Dream' },
          { id: 'platoon',            name: 'Sacrifice Guerre',     img: 'images/films/platoon.jpg',            file: 'sounds/films/(Platoon) Theme.mp3',                                           end: 509, start: 285.5, title: 'Platoon' },
          { id: 'professionel',       name: 'Adieu Poignant',       img: 'images/films/professionel.jpg',       file: 'sounds/films/(Le Professionnel) Chi Mai - Ennio Morricone.mp3',              start: 39.6,            title: 'Le Professionnel (Chi Mai)' },
        ]
      },
      {
        id: 'tragedie', label: 'Tragédie', icon: '🥀', color: '#aa88aa',
        items: [
          { id: 'dark-vador',         name: 'Menace Imposante',     img: 'images/films/dark-vador.jpg',         file: 'sounds/films/(Star Wars) Dark Vador Theme.mp3',                              start: 9.5,             title: 'Star Wars (Thème de Dark Vador)' },
          { id: 'star-wars-duel',     name: 'Combat Épique',        img: 'images/films/star-wars-duel.jpg',     file: 'sounds/films/(Star Wars) Duel of the Fates.mp3',                             start: 60.0,            title: 'Star Wars (Duel of the Fates)' },
          { id: 'le-parrain',         name: 'Mafia Respect',        img: 'images/films/le_parrain.jpg',         file: 'sounds/films/(Le parrain) Love Theme.mp3',                                   start: 0.4,             title: 'Le Parrain (Love Theme)' },
        ]
      },
      {
        id: 'western', label: 'Western', icon: '🤠', color: '#cc8844',
        items: [
          { id: 'bon-brute-truand',   name: 'Duel ',                img: 'images/films/bon-brute-truand.jpg',   file: 'sounds/films/(Le Bon la Brute et le Truand) Theme.mp3',                      start: 5.0,             title: 'Le Bon la Brute et le Truand' },
          { id: 'guimbarde',          name: 'Chasse à l\'homme',    img: 'images/films/guimbarde.jpg',          file: 'sounds/films/(Pour quelques dollars de plus) Theme.mp3',                     start: 26.7,            title: 'Pour quelques dollars de plus' },
          { id: 'harmonica',          name: 'Vengeance Duel Lent',  img: 'images/films/harmonica.jpg',          file: 'sounds/films/(Il était une fois dans l\'ouest) L\'homme à l\'harmonica.mp3', start: 7,               title: 'Il était une fois dans l\'Ouest (L\'homme à l\'harmonica)' },
        ]
      },
      {
        id: 'espionnage-action', label: 'Espionnage / Action', icon: '🕵️‍♀️', color: '#6688aa',
        items: [
          { id: 'mission-impossible', name: 'Mission Infilration',  img: 'images/films/mission-impossible.jpg', file: 'sounds/films/(Mission Impossible) Main Theme2.mp3',                          start: 2.8,             title: 'Mission Impossible' },
          { id: 'james-bond',         name: '007 Agent secret',     img: 'images/films/james-bond.jpg',         file: 'sounds/films/(James Bond) Theme.mp3',                                        start: 7.0,             title: 'James Bond' },
          { id: 'matrix',             name: 'Grave badass',         img: 'images/films/matrix.jpg',             file: 'sounds/films/(Matrix) Clubbed to Death.mp3',                                 start: 8.25,            title: 'Matrix (Clubbed to Death)' },
        ]
      },
      {
        id: 'policier', label: 'Policier', icon: '🔎', color: '#88aacc',
        items: [
          { id: 'sherlock',           name: 'Déduction Énigme',     img: 'images/films/sherlock.jpg',           file: 'sounds/films/(Sherlock Holmes) Theme.mp3',                                   start: 22.2,            title: 'Sherlock Holmes' },
          { id: 'experts',            name: 'Scène Crime',          img: 'images/films/experts.jpg',            file: 'sounds/films/(Les Experts) generique.mp3',                                   start: 4.0,             title: 'Les Experts (Who Are You)' },
          { id: 'x-files',            name: 'Mystère Inexpliqué',   img: 'images/films/x-files.jpg',            file: 'sounds/films/(The x files) Theme.mp3',                                       start: 0.1,             title: 'X-Files' },
        ]
      },
      {
        id: 'epopee-fantastique', label: 'Épopée / Fantastique', icon: '✨', color: '#ffdd88',
        items: [
          { id: 'superman',           name: 'Héros Sauvetage',      img: 'images/films/superman.jpg',           file: 'sounds/films/(Superman) Theme - John Williams.mp3',                          start: 38.6,            title: 'Superman' },
          { id: 'star-wars',          name: 'Aventure Grandiose',   img: 'images/films/star-wars.jpg',          file: 'sounds/films/(Star Wars) Main Theme.mp3',                                    start: 7.8,             title: 'Star Wars' },
          { id: 'potter',             name: 'Magie Émerveillement', img: 'images/films/potter.jpg',             file: 'sounds/films/(Harry Potter) Theme.mp3',                                      start: 43.0,            title: 'Harry Potter' },
        ]
      },
      {
        id: 'aventure', label: 'Aventure', icon: '🗺️', color: '#88bb66',
        items: [
          { id: 'indiana-jones',      name: 'Aventure Trépidante',  img: 'images/films/indiana-jones.jpg',      file: 'sounds/films/(Indiana Jones) Theme - John Williams.mp3',                     start: 6.8,             title: 'Indiana Jones' },
          { id: 'pirate',             name: 'Pirate Aventure',      img: 'images/films/pirate.jpg',             file: 'sounds/films/(Pirate des Caraibes) Theme.mp3',                                                       title: 'Pirates des Caraïbes' },
          { id: '1492',               name: 'Corsaire Voyage',      img: 'images/films/1492.jpg',               file: 'sounds/films/(1492 Conquest of Paradise) Vangelis.mp3',                      start: 15.5,            title: '1492 (Vangelis)' },
        ]
      },
      {
        id: 'action-poursuite', label: 'Action / Poursuite', icon: '💥', color: '#ff8844',
        items: [
          { id: 'kill-bill',          name: 'Préparation Duel',     img: 'images/films/kill-bill.jpg',          file: 'sounds/films/(Kill Bill) Battle Without Honor Or Humanity.mp3',              start: 1.3,             title: 'Kill Bill' }, // Attention, présence de voix de scène dans la musique TODO:: changer la musique
          { id: 'kill-bill-hornet',   name: 'Course Poursuite',     img: 'images/films/kill-bill-hornet.jpg',   file: 'sounds/films/(Kill Bill) The Green Hornet.mp3',                              start: 0.2,             title: 'Kill Bill (The Green Hornet)' },
          { id: 'taxi',               name: 'Course Poursuite',     img: 'images/films/taxi.jpg',               file: 'sounds/films/(Taxi) Pump It.mp3',                                                                    title: 'Taxi (Pump It)' },
        ]
      },
      {
        id: 'sport', label: 'Sport', icon: '🏆', color: '#ffaa44',
        items: [
          { id: 'rocky-eye-tiger',    name: 'Motivation Combat',    img: 'images/films/rocky-eye-tiger.jpg',    file: 'sounds/films/(Rocky) Eye Of The Tiger - Survivor.mp3',                       start: 0.2,             title: 'Rocky (Eye of the Tiger)' },
          { id: 'rocky-fly-now',      name: 'Victoire Triomphe',    img: 'images/films/rocky-fly-now.jpg',      file: 'sounds/films/(Rocky) Gonna Fly Now - Bill Conti.mp3',                        start: 1.2,             title: 'Rocky (Gonna Fly Now)' },
          { id: 'chariots-de-feu',    name: 'Ralenti Dépassement',  img: 'images/films/chariots-de-feu.jpg',    file: 'sounds/films/(Les chariots de feu) Vangelis.mp3',                            start: 28.5,            title: 'Les Chariots de Feu' }, // TODO:: Changer, prendre cette vidéo à la palce : https://www.youtube.com/watch?v=1eYGl8PNjlU&list=RD1eYGl8PNjlU
        ]
      },
      {
        id: 'romance', label: 'Romance', icon: '❤️', color: '#ff99bb',
        items: [
          { id: 'dirty-dancing',      name: 'Dirty Dancing',        img: 'images/films/Dirty-dancing.jpg',      file: 'sounds/films/(Dirty Dancing) The Time Of My Life.mp3',                       start: 2.0,             title: 'Dirty Dancing (The Time of My Life)' },
          { id: 'titanic',            name: 'Amour Éternel',        img: 'images/films/titanic.jpg',            file: 'sounds/films/(Titanic) My Heart Will Go On - Celine Dion.mp3',               start: 195.2,           title: 'Titanic (My Heart Will Go On)' },
          { id: 'love-actually',      name: 'Amour Léger',          img: 'images/films/love-actually.jpg',      file: 'sounds/films/(Love Actually) - Craig Armstrong.mp3',                         start: 319.0,           title: 'Love Actually' },
        ]
      },
      {
        id: 'comedie', label: 'Comédie', icon: '😂', color: '#ffcc66',
        items: [
          { id: 'curb-your',          name: 'Malaise Absurde',      img: 'images/films/curb-your.jpg',          file: 'sounds/films/(Curb Your Enthusiasm) Theme.mp3',                              start: 0.5,             title: 'Curb Your Enthusiasm' },
          { id: 'pink-panthere',      name: 'Enquête Maladroite',   img: 'images/films/pink-panthere.jpg',      file: 'sounds/films/(The Pink Panther) Theme.mp3',                                  start: 6.3,             title: 'The Pink Panther' },
          { id: 'benny',              name: 'Poursuite Burlesque',  img: 'images/films/benny.jpg',              file: 'sounds/films/(Benny Hill) Theme.mp3',                                        start: 3.2,             title: 'Benny Hill' },
        ]
      },
    ]
  },

];
