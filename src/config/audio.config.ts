import type { AudioTab } from '../types.ts';

export const AUDIO_TABS: AudioTab[] = [
  // ════════════════════════════════════════════════════════
  // ONGLET — Animaux (grille 4×8)
  // ════════════════════════════════════════════════════════
  {
    id: 'animaux',
    label: 'Animaux',
    icon: '🐾',
    kind: 'sounds',
    gridType: 'animals',
    categories: [
      {
        id: 'tous-les-animaux',
        label: 'Tous les animaux',
        icon: '🔊',
        color: '#88ccff',
        items: [
          // ── Ligne 1 ──
          { id: 'cheval-hiii',       name: 'Cheval : Hiii',       icon: '🐴',   file: 'sounds/animaux/cheval_hennissement.mp3',                   end: 1.9, catClass: 'animaux-ferme',      title: 'Cheval Hennissement' },
          { id: 'cheval-souffle',    name: 'Cheval : Souffle',    icon: '🐎',   file: 'sounds/animaux/cheval_souffle.ogg',                                  catClass: 'animaux-ferme',      title: 'Cheval Souffle' },
       // { id: 'galop-cheval',      name: 'Galop Cheval',        icon: '🐎',   file: 'sounds/animaux/cheval_galop.ogg',                                   catClass: 'animaux-ferme',      title: 'Cheval Galop' },
          { id: 'poule-cot-cot',     name: 'Poule : Cot-cot',     icon: '🐔',   file: 'sounds/animaux/poule_gloussement.mp3',                               catClass: 'animaux-ferme',      title: 'Poule Gloussement' },
          { id: 'coq-cocorico',      name: 'Coq : Cocorico',      icon: '🐓',   file: 'sounds/animaux/coq_cocorico.ogg',                start: 0.17,        catClass: 'animaux-ferme',      title: 'Coq Cocorico' },
          { id: 'oiseau-cui-cui',    name: 'Oiseau : Cui-cui',    icon: '🐦',   file: 'sounds/animaux/chant_des_oiseaux.mp3',                               catClass: 'animaux-oiseau',     title: 'Chant des oiseaux Gazouillement' },
          { id: 'pigeon-rou-rou',    name: 'Pigeon : Rou-rou',    icon: '🕊️',   file: 'sounds/animaux/pigeon_roucoulement.mp3',                  end: 7.65, catClass: 'animaux-oiseau',     title: 'Pigeon Roucoulement' },
          { id: 'lion-tigre-roarrr', name: 'Lion/tigre : Roarrr', icon: '🦁',   file: 'sounds/animaux/lion_tigre_rugissement.mp3',                          catClass: 'animaux-savane',     title: 'Lion/tigre Rugissement' },
          { id: 'hyene-hi-hi',       name: 'Hyène : Hi-hi',       icon: '🐆',   file: 'sounds/animaux/hyene_rire.mp3',                                      catClass: 'animaux-savane',     title: 'Hyène Rire' },

          // ── Ligne 2 ──
          { id: 'vache-meuh',        name: 'Vache : Meuh',        icon: '🐮',   file: 'sounds/animaux/vache_meuglement.ogg',            start: 0.5,         catClass: 'animaux-ferme',      title: 'Vache Meuglement' },
          { id: 'ane-i-an',          name: 'Âne : I-An',          icon: '🫏',   file: 'sounds/animaux/ane_braiement.mp3',                                   catClass: 'animaux-ferme',      title: 'Âne Braiement' },
          { id: 'dindon-glouglou',   name: 'Dindon : Glouglou',   icon: '🦃',   file: 'sounds/animaux/dindon_glouglou.mp3',                                 catClass: 'animaux-ferme',      title: 'Dindon Glouglou' },
          { id: 'canard-coin-coin',  name: 'Canard : Coin-coin',  icon: '🦆',   file: 'sounds/animaux/canard_cancanement.mp3',                              catClass: 'animaux-ferme',      title: 'Canard Cancanement' },
          { id: 'corbeau-croa-croa', name: 'Corbeau : Croa-croa', icon: '🐦‍⬛',   file: 'sounds/animaux/corbeau_croassement.mp3',                   end: 2.9, catClass: 'animaux-oiseau',     title: 'Corbeau Croassement' },
          { id: 'aigle-cri-percant', name: 'Aigle : Cri perçant', icon: '🦅',   file: 'sounds/animaux/aigle_faucon_cri_percant.mp3',                        catClass: 'animaux-oiseau',     title: 'Aigle / Faucon Cri perçant' },
          { id: 'elephant',          name: 'Éléphant',            icon: '🐘',   file: 'sounds/animaux/elephant_barrissement.mp3',       start: 0.5, end: 6, catClass: 'animaux-savane',     title: 'Éléphant Barrissement' },
          { id: 'singe-ouh-ouh',     name: 'Singe : Ouh-ouh',     icon: '🐒',   file: 'sounds/animaux/singe_cris.mp3',                  start: 0.4,         catClass: 'animaux-savane',     title: 'Singe Cris' },

          // ── Ligne 3 ──
          { id: 'chat-miaou',        name: 'Chat : Miaou',        icon: '🐱',   file: 'sounds/animaux/chat_miaulement.mp3', start: 0.1,                     catClass: 'animaux-domestique', title: 'Chat Miaulement' },
          { id: 'chat-ronron',       name: 'Chat : Ronron',       icon: '🐈',   file: 'sounds/animaux/chat_ronronnement.ogg',                               catClass: 'animaux-domestique', title: 'Chat Ronronnement' },
          { id: 'mouton-beee',       name: 'Mouton : Bêêê',       icon: '🐑',   file: 'sounds/animaux/mouton_chevre_belement.ogg',                          catClass: 'animaux-ferme',      title: 'Mouton/Chèvre Bêlement' },
          { id: 'cochon-groin',      name: 'Cochon : Groin',      icon: '🐷',   file: 'sounds/animaux/cochon_grognement.mp3',                    end: 8.65, catClass: 'animaux-ferme',      title: 'Cochon Grognement / Couinement' },
          { id: 'chouette-hou-hou',  name: 'Chouette : Hou-hou',  icon: '🦉',   file: 'sounds/animaux/chouette_hibou_hululements.mp3', start: 0.1, end: 2.6, catClass: 'animaux-oiseau',     title: 'Chouette / Hibou Hululements' },
          { id: 'mouettes',          name: 'Mouette : Kriaa',     icon: '🦤',   file: 'sounds/animaux/mouettes.mp3',                                        catClass: 'animaux-oiseau',     title: 'Mouette Piaulement' },
          { id: 'serpent-sssss',     name: 'Serpent : Sssss',     icon: '🐍',   file: 'sounds/animaux/serpent_sifflement.mp3',      start: 0.17,            catClass: 'animaux-savane',     title: 'Serpent Sifflement' },
          { id: 'grenouille-coaa',   name: 'Grenouille : Coââ',   icon: '🐸',   file: 'sounds/animaux/grenouille_coassement.mp3',                           catClass: 'animaux-aquatique',  title: 'Grenouille Coassement' },

          // ── Ligne 4 ──
          { id: 'chien-ouaf',        name: 'Chien : Ouaf',        icon: '🐶',   file: 'sounds/animaux/chien_aboiement.mp3',                                 catClass: 'animaux-domestique', title: 'Chien Aboiement' },
          { id: 'chien-grrr',        name: 'Chien : Grrr',        icon: '🐕',   file: 'sounds/animaux/chien_grognement.mp3',                                catClass: 'animaux-domestique', title: 'Chien Grognement' },
          { id: 'loup-aouuuuh',      name: 'Loup : Aouuuuh',      icon: '🐺',   file: 'sounds/animaux/loup_hurlement.mp3',          start: 0.11, end: 5.1,  catClass: 'animaux-foret',      title: 'Loup Hurlement' },
          { id: 'ours-grrr',         name: 'Ours : Grrr',         icon: '🐻',   file: 'sounds/animaux/ours_grognement.mp3',                                 catClass: 'animaux-foret',      title: 'Ours Grognement' },
          { id: 'abeille-bzzzz',     name: 'Abeille : Bzzzz',     icon: '🐝',   file: 'sounds/animaux/moustique_bourdonnement.mp3',                         catClass: 'animaux-insecte',    title: 'Abeille / Mouche / Moustique Bourdonnement' },
          { id: 'grillon-zzzzz',     name: 'Grillons',            icon: '🦗',   file: 'sounds/animaux/grillon_gresillement.mp3',                            catClass: 'animaux-insecte',    title: 'Grillon Grésillement' },
          { id: 'dauphin-i-i-i-i',   name: 'Dauphin : I i i i',   icon: '🐬',   file: 'sounds/animaux/dauphin_sifflements.mp3',                             catClass: 'animaux-aquatique',  title: 'Dauphin Clics et sifflements' },
          { id: 'baleine-chant',     name: 'Baleine : Chant',     icon: '🐋',   file: 'sounds/animaux/baleine_chant.mp3',           start: 0.21,  end: 3.2, catClass: 'animaux-aquatique',  title: 'Baleine Chant' },
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
    kind: 'sounds',
    gridType: 'animals',
    categories: [
      {
        id: 'tous-les-bruits', label: 'Tous les bruits', icon: '🔊', color: '#dd66ff',
        items: [
          // ── Bureau et technologie ──
          { id: 'clavier',                 name: 'Clavier',              icon: '⌨️', file: 'sounds/bruits/bruit_clavier_ordinateur.mp3' },
          { id: 'machine-a-ecrire',        name: 'Machine à écrire',     icon: '📝', file: 'sounds/bruits/machine_a_ecrire.ogg',         start: 0.15 },
          { id: 'modem-56k',               name: 'Modem 56k',            icon: '📠', file: 'sounds/bruits/connexion_modem_56k.mp3' },
          { id: 'erreur-windows',          name: 'Erreur Windows',       icon: '🖥️', file: 'sounds/bruits/erreur_windows_xp.mp3',        start: 0.2 },
          { id: 'notification',            name: 'Notification',         icon: '🔔', file: 'sounds/bruits/bruit_notification.mp3',       start: 0.8 },
          { id: 'bip-morse',               name: 'Bip morse',            icon: '📡', file: 'sounds/bruits/bip_code_morse.mp3' },
          { id: 'appareil-photo',          name: 'Appareil photo',       icon: '📷', file: 'sounds/bruits/bruit_appareil_photo.mp3',     start: 0.15, end: 0.7 },
          { id: 'machine-a-cafe',          name: 'Machine à café',       icon: '☕', file: 'sounds/bruits/bruit_machine_cafe.mp3' },

          // ── Téléphone, sonnettes et annonces ──
          { id: 'sonnerie-portable',       name: 'Sonnerie portable',    icon: '📱', file: 'sounds/bruits/sonnerie_portable.mp3',        start: 0.3,  end: 30.35 },
          { id: 'vibreur',                 name: 'Vibreur',              icon: '📳', file: 'sounds/bruits/vibreur_telephone.mp3' },
          { id: 'tonalite-appel',          name: 'Tonalité d\'appel',    icon: '📞', file: 'sounds/bruits/tonalite_appel.mp3',           start: 5.1,  end: 12.75 },
          { id: 'tonalite-raccroche',      name: 'Raccroché',            icon: '☎️', file: 'sounds/bruits/tonalite_raccroche.mp3' },
          { id: 'sonnette-porte',          name: 'Sonnette',             icon: '🛎️', file: 'sounds/bruits/sonnette_porte.mp3',                        end: 2.7 },
          { id: 'sonnette-velo',           name: 'Sonnette vélo',        icon: '🚲', file: 'sounds/bruits/sonnette_velo.mp3',            start: 1.1,  end: 4.8 },
          { id: 'annonce-sncf',            name: 'Annonce SNCF',         icon: '📢', file: 'sounds/bruits/annonce_sncf.mp3',                          end: 2.3 },
          { id: 'foule-amen',              name: 'Foule : Amen',         icon: '🙏', file: 'sounds/bruits/bruit_foule_amen.mp3' },

          // ── Gags, bébés et petits plaisirs ──
          { id: 'roulement-tambour',       name: 'Roulement de tambour', icon: '🥁', file: 'sounds/bruits/roulement_de_tambour.mp3' },
          { id: 'batterie-blague',         name: 'Ba-dum-tss',           icon: '🎭', file: 'sounds/bruits/batterie_blague.mp3',                       end: 2.45 },
          { id: 'buzzer-bonne-reponse',    name: 'Bonne réponse',        icon: '✅', file: 'sounds/bruits/buzzer_bonne_reponse.mp3' },
          { id: 'buzzer-mauvaise-reponse', name: 'Mauvaise réponse',     icon: '❌', file: 'sounds/bruits/buzzer_mauvaise_reponse.mp3',  start: 0.6 },
          { id: 'bebe-pleure',             name: 'Bébé pleure',          icon: '😭', file: 'sounds/bruits/bebe_pleure.mp3' },
          { id: 'bebe-rit',                name: 'Bébé rit',             icon: '👶', file: 'sounds/bruits/bebe_rit.mp3' },
          { id: 'verre-d-eau',             name: 'Verre d\'eau',         icon: '🥛', file: 'sounds/bruits/remplissage_verre_d_eau.mp3' },
          { id: 'briquet',                 name: 'Briquet',              icon: '🚬', file: 'sounds/bruits/bruit_briquet_cigarette.mp3' },

          // ── Feu, lames et outils ──
          { id: 'prend-feu',               name: 'Prend feu',            icon: '🔥', file: 'sounds/bruits/bruit_prend_feu.ogg' },
          { id: 'epees',                   name: 'Épées',                icon: '⚔️', file: 'sounds/bruits/epee_contre_epee.mp3',                      end: 3.95 },
          { id: 'couteau',                 name: 'Meurtre au couteau',   icon: '🔪', file: 'sounds/bruits/meurtre_au_couteau.mp3',                    end: 1.15 },
          { id: 'scie-a-metaux',           name: 'Scie à métaux',        icon: '🪛', file: 'sounds/bruits/scie_a_metaux.mp3' },
          { id: 'scie-egoine',             name: 'Scie égoïne',          icon: '🪚', file: 'sounds/bruits/scie_egoine.mp3' },

          // ── Ajouts récents ──
          { id: 'klaxon',                  name: 'Klaxon',               icon: '🚗', file: 'sounds/bruits/klaxon_voiture.mp3' },
          { id: 'tic-tac-bombe',           name: 'Tic-tac bombe',        icon: '💣', file: 'sounds/bruits/tic_tac_bombe.ogg' },
          { id: 'tronconneuse',            name: 'Tronçonneuse',         icon: '🪚', file: 'sounds/bruits/bruit_tronconneuse.ogg' },
       // { id: 'perceuse',                name: 'Perceuse',             icon: '🔧', file: 'sounds/bruits/bruit_perceuse.mp3' },
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
    kind: 'music',
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
          { id: 'noel',               name: 'Noël',               icon: '🎅', file: 'sounds/ambiances/noel.mp3', start: 1.5, title: 'Jingle Bells' },

          // ── Mer et nature ──
          { id: 'plage',              name: 'Plage',              icon: '🏖️', file: 'sounds/ambiances/plage_vacanciers.mp3' },
          { id: 'mer',                name: 'Mer',                icon: '🌊', file: 'sounds/ambiances/mer_vagues.mp3' },
          { id: 'vague-mouettes',     name: 'Vagues et mouettes', icon: '⚓', file: 'sounds/ambiances/vague_mouette.ogg' },
          { id: 'foret',              name: 'Forêt oiseaux',      icon: '🌲', file: 'sounds/ambiances/foret_oiseau.mp3' },
          { id: 'mare',               name: 'Mare',               icon: '🐸', file: 'sounds/ambiances/mare_grenouilles.mp3' },
          { id: 'troupeau',           name: 'Troupeau',           icon: '🐄', file: 'sounds/ambiances/troupeau_cloche.mp3' },
          { id: 'cigale-tszzzz',      name: 'Cigales',            icon: '🦗', file: 'sounds/ambiances/cigales_chant.mp3', title: 'Cigale Chant' },
          { id: 'vent',               name: 'Vent',               icon: '💨', file: 'sounds/ambiances/vent.mp3' },
          { id: 'orage',              name: 'Orage',              icon: '⛈️', file: 'sounds/ambiances/pluie_tonnerre.mp3' },
          { id: 'feu',                name: 'Feu de cheminée',    icon: '🔥', file: 'sounds/ambiances/feu_cheminee.ogg' },
          { id: 'grotte',             name: 'Grotte',             icon: '💧', file: 'sounds/ambiances/grotte_goutte.mp3' },
          { id: 'nuit-campagne',      name: 'Nuit à la campagne', icon: '🌙', file: 'sounds/ambiances/nuit_campagne.mp3' },

          // ── Peur ──
          { id: 'nuit-angoissante',   name: 'Nuit angoissante',   icon: '🌑', file: 'sounds/ambiances/ambiance_nuit_peur.mp3' },
          { id: 'zombies',            name: 'Zombies',            icon: '🧟', file: 'sounds/ambiances/ambiance_bruit_zombie.mp3' },
        ]
      }
    ]
  },

  // ════════════════════════════════════════════════════════
  // ONGLET — Musiques (musiques cultes, hors films ; 4 colonnes comme Films, avec un sous-titre
  // à la place de l'image)
  // ════════════════════════════════════════════════════════
  // Une famille = une catégorie visible (titre, emoji et couleur ; les tuiles prennent la couleur
  // de leur famille, classe musique-tuile). Les familles comiques et dramatiques ne se mélangent pas.
  // Sur la tuile : en gros, ce qui identifie la musique pour le commun des gens (`name`) ; en petit,
  // ce qu'elle fait entendre ou la situation (`subtitle`).
  // 11 familles sur 4 colonnes, dans l'ordre ci-dessous. colSizes fixe le nombre de familles par colonne
  // (sinon ceil(11 / 4) = 3 par colonne, soit 3, 3, 3, 2) : à mettre à jour si on ajoute ou retire une famille.
  // Une tuile retirée reste en commentaire tant que son mp3 est dans public/sounds/musiques/ ; sans mp3,
  // on supprime la ligne (l'id reste dans l'historique git, à ne pas réutiliser).
  // Pour annoncer une musique dont le mp3 n'est pas encore là : ajouter la classe musique-manquant à
  // catClass (tuile en pointillés rouges, un clic ne joue rien), puis la retirer quand le fichier arrive.
  {
    id: 'musique',
    label: 'Musiques',
    icon: '🎵',
    kind: 'music',
    cols: 4,
    catCols: 2,
    colSizes: [3, 3, 2, 3],
    categories: [
      // ── Colonne 1 : dramatique ──
      {
        id: 'epique', label: 'Épique', icon: '🔥', color: '#ff6a4d',
        items: [
          { id: 'zarathoustra',     name: 'Zarathoustra',       subtitle: '« 2001 », révélation',         icon: '🌅', file: 'sounds/musiques/ainsi_parlait_zarathoustra.mp3',         start: 57, catClass: 'musique-tuile', title: 'Ainsi parlait Zarathoustra (Strauss)' },
          { id: 'walkyries',        name: 'Walkyries',          subtitle: 'Wagner, charge des hélicos',   icon: '🚁', file: 'sounds/musiques/chevauchee_des_walkyries.mp3',           start: 130.5, catClass: 'musique-tuile', title: 'La Chevauchée des Walkyries (Wagner)' },
          { id: 'o-fortuna',        name: 'O Fortuna',          subtitle: 'chœur apocalyptique',          icon: '😱', file: 'sounds/musiques/o_fortuna_carmina_burana.mp3',           start: 1.2, end:315, catClass: 'musique-tuile', title: 'O Fortuna (Carmina Burana, Orff)' },
        ]
      },
      {
        id: 'sombre', label: 'Sombre, menace', icon: '🦇', color: '#c0405a',
        items: [
          { id: 'danse-chevaliers', name: 'Danse des chevaliers', subtitle: 'Prokofiev, le puissant arrive', icon: '👑', file: 'sounds/musiques/danse_des_chevaliers_prokofiev.mp3',  start: 9.2, catClass: 'musique-tuile', title: 'Roméo et Juliette, Danse des chevaliers (Prokofiev)' },
          { id: 'dies-irae',        name: 'Dies irae',          subtitle: 'Verdi, colère divine',         icon: '⚡', file: 'sounds/musiques/dies_irae_verdi.mp3',                    start: 7.4, catClass: 'musique-tuile', title: 'Requiem, Dies irae (Verdi)' },
          { id: 'toccata-bach',     name: 'Toccata de Bach',    subtitle: 'orgue de Dracula',             icon: '🦇', file: 'sounds/musiques/toccata_fugue_bach.mp3',                 start: 1.5, catClass: 'musique-tuile', title: 'Toccata et fugue en ré mineur (Bach), les 68 premières secondes' },
          { id: 'lacrimosa',        name: 'Lacrimosa',          subtitle: 'Requiem de Mozart, deuil',     icon: '🕯️', file: 'sounds/musiques/lacrimosa_mozart.mp3',                   start: 1, end: 233, catClass: 'musique-tuile', title: 'Requiem, Lacrimosa (Mozart)' },
        ]
      },
      {
        id: 'guerre', label: 'Guerre', icon: '🪖', color: '#a8b85a',
        items: [
          { id: 'bomb-run',         name: 'Soldat en marche',   subtitle: 'Bomb Run (Docteur Folamour)',  icon: '🫡', file: 'sounds/musiques/bomb_run_dr_folamour.mp3',               start: 54.5, catClass: 'musique-tuile', title: 'Bomb Run (Docteur Folamour)' },
          { id: 'fortunate-son',    name: 'Vietnam',            subtitle: 'Fortunate Son',                icon: '😎', file: 'sounds/musiques/fortunate_son.mp3',                      start: 4, catClass: 'musique-tuile', title: 'Fortunate Son (Creedence Clearwater Revival)' },
        ]
      },
      // ── Colonne 2 : comique ──
      {
        id: 'cirque', label: 'Cirque, cabaret', icon: '🤡', color: '#ff9a1f',
        items: [
          { id: 'gladiators',       name: 'Entrée du cirque',   subtitle: 'clowns, fanfare',              icon: '🎪', file: 'sounds/musiques/entry_of_the_gladiators.mp3',            start: 13.7, end:175, catClass: 'musique-tuile', title: 'Entry of the Gladiators (Fučík)' },
          { id: 'can-can',          name: 'French cancan',      subtitle: 'Offenbach, fête folle',        icon: '💃', file: 'sounds/musiques/can_can_offenbach.mp3',                  start: 42, catClass: 'musique-tuile', title: 'Can-can (Orphée aux Enfers, Offenbach)' },
        ]
      },
      {
        id: 'burlesque', label: 'Burlesque, agitation', icon: '🏃', color: '#ffd23f',
        items: [
          { id: 'guillaume-tell',   name: 'Galop burlesque',    subtitle: 'tout finira bien (Guillaume Tell)', icon: '🏇', file: 'sounds/musiques/guillaume_tell_finale.mp3',         start: 0.2, catClass: 'musique-tuile', title: 'Ouverture de Guillaume Tell, finale (Rossini)' },
       // { id: 'danse-sabre',      name: 'Danse du sabre',     subtitle: 'frénésie, tout s\'emballe',    icon: '🤹', file: 'sounds/musiques/danse_du_sabre.mp3',                                 catClass: 'musique-tuile', title: 'Danse du sabre (Khatchatourian)' },
          { id: 'danse-hongroise',  name: 'Danse hongroise',    subtitle: 'Brahms, Chaplin barbier',      icon: '🪒', file: 'sounds/musiques/danse_hongroise_brahms.mp3',             start: 3.7, catClass: 'musique-tuile', title: 'Danse hongroise n° 5 (Brahms)' },
          { id: 'roi-montagne',     name: 'Roi de la montagne', subtitle: 'pas feutrés qui s\'emballent', icon: '🤫', file: 'sounds/musiques/dans_l_antre_du_roi_de_la_montagne.mp3', start: 72.5, catClass: 'musique-tuile', title: 'Dans l\'antre du roi de la montagne (Grieg)' },
       // { id: 'radetzky',         name: 'Marche de Radetzky', subtitle: 'parade pompeuse, on tape des mains', icon: '🎺', file: 'sounds/musiques/marche_de_radetzky.mp3',           start: 4.3, catClass: 'musique-tuile', title: 'Marche de Radetzky (Johann Strauss père)' },
        ]
      },
      {
        id: 'demarche', label: 'Démarches', icon: '👣', color: '#d9a066',
        items: [
          { id: 'peter-gunn',       name: 'Filature',           subtitle: 'riff de guitare, Peter Gunn',  icon: '🕵️', file: 'sounds/musiques/peter_gunn.mp3',                         start: 4.5, catClass: 'musique-tuile', title: 'Peter Gunn (Henry Mancini)' },
          { id: 'still-dre',        name: 'Dr. Dre',            subtitle: 'démarche de caïd, banlieue',   icon: '🏙️', file: 'sounds/musiques/still_dre.mp3',                                   catClass: 'musique-tuile', title: 'Still D.R.E. (Dr. Dre)' },
          { id: 'baby-elephant',    name: 'Baby Elephant Walk', subtitle: 'Mancini, démarche pataude',    icon: '🐘', file: 'sounds/musiques/baby_elephant_walk.mp3',             start: 6.8, catClass: 'musique-tuile', title: 'Baby Elephant Walk (Henry Mancini)' },
          { id: 'soul-bossa-nova',  name: 'Soul Bossa Nova',    subtitle: 'Austin Powers, espion kitsch', icon: '🕶️', file: 'sounds/musiques/soul_bossa_nova.mp3',                start: 8.5, catClass: 'musique-tuile', title: 'Soul Bossa Nova (Quincy Jones)' },
        ]
      },
      // ── Colonne 3 : tubes, douceur ──
      {
        id: 'pop-rock', label: 'Tubes pop, rock, rap', icon: '🎤', color: '#ff5fa8',
        items: [
          { id: 'hat-on',           name: 'Strip-tease',        subtitle: 'Joe Cocker',                   icon: '🎩', file: 'sounds/musiques/you_can_leave_your_hat_on.mp3',          start: 1, catClass: 'musique-tuile', title: 'You Can Leave Your Hat On (Joe Cocker)' },
          { id: 'careless-whisper', name: 'Careless Whisper',   subtitle: 'saxo de séduction',            icon: '😏', file: 'sounds/musiques/careless_whisper.mp3',                             catClass: 'musique-tuile', title: 'Careless Whisper (George Michael)' },
          { id: 'pretty-woman',     name: 'Pretty Woman',       subtitle: 'Roy Orbison, essayage/défilé', icon: '😍', file: 'sounds/musiques/oh_pretty_woman.mp3',                             catClass: 'musique-tuile', title: 'Oh, Pretty Woman (Roy Orbison)' },
          { id: 'all-by-myself',    name: 'All by Myself',      subtitle: 'Céline Dion, seul et triste',  icon: '😭', file: 'sounds/musiques/all_by_myself.mp3',                      start: 26, catClass: 'musique-tuile', title: 'All by Myself (Céline Dion)' },
          { id: 'dancing-queen',    name: 'Dancing Queen',      subtitle: 'ABBA, piste de danse',         icon: '🪩', file: 'sounds/musiques/dancing_queen.mp3',                  start: 2, catClass: 'musique-tuile', title: 'Dancing Queen (ABBA)' },
          { id: 'i-feel-good',      name: 'I Feel Good',        subtitle: 'James Brown, pêche d\'enfer',  icon: '🕺', file: 'sounds/musiques/i_feel_good.mp3',                              catClass: 'musique-tuile', title: 'I Got You (I Feel Good) (James Brown)' },
       // { id: 'champions',        name: 'We Are the Champions', subtitle: 'Queen, victoire',            icon: '🏆', file: 'sounds/musiques/we_are_the_champions.mp3',               start: 28, catClass: 'musique-tuile', title: 'We Are the Champions (Queen)' },
        ]
      },
      {
        id: 'jazz-lounge', label: 'Lounge, bossa nova', icon: '🍹', color: '#3fcfe0',
        items: [
          { id: 'ipanema',          name: 'Bar lounge',         subtitle: 'bossa nova, Ipanema',          icon: '🍹', file: 'sounds/musiques/girl_from_ipanema.mp3',                            catClass: 'musique-tuile', title: 'The Girl from Ipanema' },
          { id: 'ascenseur',        name: 'Ascenseur',          subtitle: 'attente gênée',                icon: '🛗', file: 'sounds/musiques/musique_ascenseur.mp3',               start: 0.2,             catClass: 'musique-tuile', title: 'Musique d\'ascenseur' },
        ]
      },
      // ── Colonne 4 : élégance, lieux et univers ──
      {
        id: 'classique-elegant', label: 'Élégance classique', icon: '🎻', color: '#b48cff',
        items: [
          { id: 'danube-bleu',      name: 'Bal viennois',       subtitle: 'valse, Beau Danube bleu',      icon: '🩰', file: 'sounds/musiques/beau_danube_bleu.mp3',                   start: 1.3, catClass: 'musique-tuile', title: 'Le Beau Danube bleu (Strauss II)' },
          { id: 'duo-des-fleurs',   name: 'Duo des fleurs',     subtitle: 'Lakmé, grâce et envol',        icon: '🌸', file: 'sounds/musiques/duo_des_fleurs_lakme.mp3',               start: 2, catClass: 'musique-tuile', title: 'Lakmé, Duo des fleurs (Delibes), de 1:04 à 2:28' },
        ]
      },
      {
        id: 'douceur', label: 'Douceur, sérénité', icon: '🌤️', color: '#3fd98a',
        items: [
          { id: 'peer-gynt',        name: 'Réveil',             subtitle: 'flûte du matin, Peer Gynt',    icon: '🌄', file: 'sounds/musiques/peer_gynt_morning_mood.mp3',             start: 2.2, catClass: 'musique-tuile', title: 'Peer Gynt, Morning Mood (Grieg)' },
          { id: 'wonderful-world',  name: 'Wonderful World',    subtitle: 'Armstrong, tendresse',         icon: '🌍', file: 'sounds/musiques/what_a_wonderful_world.mp3',             start: 0.5, catClass: 'musique-tuile', title: 'What a Wonderful World (Louis Armstrong)' },
        ]
      },
      {
        id: 'jeux-references', label: 'Jeux, télé, saloon', icon: '🎮', color: '#6f8fff',
        items: [
          { id: 'qui-veut-gagner',  name: 'Qui veut gagner…',   subtitle: 'jeu télé, suspense',           icon: '💰', file: 'sounds/musiques/qui_veut_gagner_des_millions.mp3',                 catClass: 'musique-tuile', title: 'Qui veut gagner des millions (générique)' },
          { id: 'mario',            name: 'Mario',              subtitle: 'jeu vidéo, sauts',             icon: '🍄', file: 'sounds/musiques/super_mario_bros_theme.mp3',                       catClass: 'musique-tuile', title: 'Super Mario Bros (Koji Kondo)' },
          { id: 'tetris',           name: 'Tetris',             subtitle: 'jeu vidéo russe',              icon: '🧱', file: 'sounds/musiques/tetris_theme.mp3',                                 catClass: 'musique-tuile', title: 'Thème de Tetris' },
          { id: 'maple-leaf-rag',   name: 'Saloon',             subtitle: 'piano ragtime',                icon: '🤠', file: 'sounds/musiques/maple_leaf_rag.mp3',                     start: 2, catClass: 'musique-tuile', title: 'Maple Leaf Rag (Scott Joplin)' },
        ]
      },
    ]
  },

  // ════════════════════════════════════════════════════════
  // ONGLET — Musique de films
  // ════════════════════════════════════════════════════════
  {
    id: 'films',
    label: 'Films',
    icon: '🎬',
    kind: 'music',
    cols: 4,
    categories: [
      {
        id: 'horreur', label: 'Horreur', icon: '😱', color: '#ff6666',
        items: [
          { id: 'saw',                name: 'Ambiance tendu',       img: 'images/films/saw.jpg',                file: 'sounds/films/saw_theme.mp3',                                            start: 21.2,            title: 'Saw' },
          { id: 'jaws',               name: 'Danger proche',        img: 'images/films/jaws.jpg',               file: 'sounds/films/les_dents_de_la_mer_theme.mp3',                            start: 9.5,             title: 'Les Dents de la Mer' },
          { id: 'psycho',             name: 'Au secours Ahhh !',    img: 'images/films/psycho.jpg',             file: 'sounds/films/psycho_shower_scene.mp3',                                  start: 0.1,             title: 'Psycho (Scène Douche)' },
        ]
      },
      {
        id: 'drame', label: 'Drame', icon: '💔', color: '#8888cc',
        items: [
          { id: 'requiem',            name: 'Descente enfer',       img: 'images/films/requiem.jpg',            file: 'sounds/films/requiem_for_a_dream_theme.mp3',                            start: 38.9,            title: 'Requiem for a Dream' },
          { id: 'platoon',            name: 'Sacrifice Guerre',     img: 'images/films/platoon.jpg',            file: 'sounds/films/platoon_theme.mp3',                                        start: 285.5, end: 509, title: 'Platoon' },
          { id: 'professionel',       name: 'Adieu Poignant',       img: 'images/films/professionel.jpg',       file: 'sounds/films/le_professionnel_chi_mai_ennio_morricone.mp3',             start: 39.6,            title: 'Le Professionnel (Chi Mai)' },
        ]
      },
      {
        id: 'tragedie', label: 'Tragédie', icon: '🥀', color: '#aa88aa',
        items: [
          { id: 'dark-vador',         name: 'Menace Imposante',     img: 'images/films/dark-vador.jpg',         file: 'sounds/films/star_wars_dark_vador_theme.mp3',                           start: 9.5,             title: 'Star Wars (Thème de Dark Vador)' },
          { id: 'star-wars-duel',     name: 'Combat Épique',        img: 'images/films/star-wars-duel.jpg',     file: 'sounds/films/star_wars_duel_of_the_fates.mp3',                          start: 60.0,            title: 'Star Wars (Duel of the Fates)' },
          { id: 'le-parrain',         name: 'Mafia Respect',        img: 'images/films/le_parrain.jpg',         file: 'sounds/films/le_parrain_love_theme.mp3',                                start: 0.4,             title: 'Le Parrain (Love Theme)' },
        ]
      },
      {
        id: 'western', label: 'Western', icon: '🤠', color: '#cc8844',
        items: [
          { id: 'bon-brute-truand',   name: 'Duel',                 img: 'images/films/bon-brute-truand.jpg',   file: 'sounds/films/le_bon_la_brute_et_le_truand_theme.mp3',                   start: 5.0,             title: 'Le Bon la Brute et le Truand' },
          { id: 'guimbarde',          name: 'Chasse à l\'homme',    img: 'images/films/guimbarde.jpg',          file: 'sounds/films/pour_quelques_dollars_de_plus_theme.mp3',                  start: 26.7,            title: 'Pour quelques dollars de plus' },
          { id: 'harmonica',          name: 'Vengeance Duel Lent',  img: 'images/films/harmonica.jpg',          file: 'sounds/films/il_etait_une_fois_dans_l_ouest_l_homme_a_l_harmonica.mp3', start: 7,               title: 'Il était une fois dans l\'Ouest (L\'homme à l\'harmonica)' },
        ]
      },
      {
        id: 'espionnage-action', label: 'Espionnage / Action', icon: '🕵️‍♀️', color: '#6688aa',
        items: [
          { id: 'mission-impossible', name: 'Mission Infiltration', img: 'images/films/mission-impossible.jpg', file: 'sounds/films/mission_impossible_main_theme2.mp3',                       start: 2.8,             title: 'Mission Impossible' },
          { id: 'james-bond',         name: '007 Agent secret',     img: 'images/films/james-bond.jpg',         file: 'sounds/films/james_bond_theme.mp3',                                     start: 7.0,             title: 'James Bond' },
          { id: 'matrix',             name: 'Grave badass',         img: 'images/films/matrix.jpg',             file: 'sounds/films/matrix_clubbed_to_death.mp3',                              start: 8.25,            title: 'Matrix (Clubbed to Death)' },
        ]
      },
      {
        id: 'policier', label: 'Policier', icon: '🔎', color: '#88aacc',
        items: [
          { id: 'sherlock',           name: 'Déduction Énigme',     img: 'images/films/sherlock.jpg',           file: 'sounds/films/sherlock_holmes_theme.mp3',                                start: 22.2,            title: 'Sherlock Holmes' },
          { id: 'experts',            name: 'Scène Crime',          img: 'images/films/experts.jpg',            file: 'sounds/films/les_experts_generique.mp3',                                start: 4.0,             title: 'Les Experts (Who Are You)' },
          { id: 'x-files',            name: 'Mystère Inexpliqué',   img: 'images/films/x-files.jpg',            file: 'sounds/films/the_x_files_theme.mp3',                                    start: 0.1,             title: 'X-Files' },
        ]
      },
      {
        id: 'epopee-fantastique', label: 'Épopée / Fantastique', icon: '✨', color: '#ffdd88',
        items: [
          { id: 'superman',           name: 'Héros Sauvetage',      img: 'images/films/superman.jpg',           file: 'sounds/films/superman_theme_john_williams.mp3',                         start: 38.6,            title: 'Superman' },
          { id: 'star-wars',          name: 'Aventure Grandiose',   img: 'images/films/star-wars.jpg',          file: 'sounds/films/star_wars_main_theme.mp3',                                 start: 7.8,             title: 'Star Wars' },
          { id: 'potter',             name: 'Magie Émerveillement', img: 'images/films/potter.jpg',             file: 'sounds/films/harry_potter_theme.mp3',                                   start: 43.0,            title: 'Harry Potter' },
        ]
      },
      {
        id: 'aventure', label: 'Aventure', icon: '🗺️', color: '#88bb66',
        items: [
          { id: 'indiana-jones',      name: 'Aventure Trépidante',  img: 'images/films/indiana-jones.jpg',      file: 'sounds/films/indiana_jones_theme_john_williams.mp3',                    start: 6.8,             title: 'Indiana Jones' },
          { id: 'pirate',             name: 'Pirate Aventure',      img: 'images/films/pirate.jpg',             file: 'sounds/films/pirate_des_caraibes_theme.mp3',                                                    title: 'Pirates des Caraïbes' },
          { id: '1492',               name: 'Corsaire Voyage',      img: 'images/films/1492.jpg',               file: 'sounds/films/1492_conquest_of_paradise_vangelis.mp3',                   start: 15.5,            title: '1492 (Vangelis)' },
        ]
      },
      {
        id: 'action-poursuite', label: 'Action / Poursuite', icon: '💥', color: '#ff8844',
        items: [
          { id: 'kill-bill',          name: 'Préparation Duel',     img: 'images/films/kill-bill.jpg',          file: 'sounds/films/kill_bill_battle_without_honor_or_humanity.mp3',           start: 1.3,             title: 'Kill Bill' },
          { id: 'kill-bill-hornet',   name: 'Course Poursuite',     img: 'images/films/kill-bill-hornet.jpg',   file: 'sounds/films/kill_bill_the_green_hornet.mp3',                           start: 0.2,             title: 'Kill Bill (The Green Hornet)' },
          { id: 'taxi',               name: 'Course Poursuite',     img: 'images/films/taxi.jpg',               file: 'sounds/films/taxi_pump_it.mp3',                                                                 title: 'Taxi (Pump It)' },
        ]
      },
      {
        id: 'sport', label: 'Sport', icon: '🏆', color: '#ffaa44',
        items: [
          { id: 'rocky-eye-tiger',    name: 'Motivation Combat',    img: 'images/films/rocky-eye-tiger.jpg',    file: 'sounds/films/rocky_eye_of_the_tiger_survivor.mp3',                      start: 0.2,             title: 'Rocky (Eye of the Tiger)' },
          { id: 'rocky-fly-now',      name: 'Victoire Triomphe',    img: 'images/films/rocky-fly-now.jpg',      file: 'sounds/films/rocky_gonna_fly_now_bill_conti.mp3',                       start: 1.2,             title: 'Rocky (Gonna Fly Now)' },
          { id: 'chariots-de-feu',    name: 'Ralenti Dépassement',  img: 'images/films/chariots-de-feu.jpg',    file: 'sounds/films/les_chariots_de_feu_vangelis.mp3',                         start: 28.5,            title: 'Les Chariots de Feu' },
        ]
      },
      {
        id: 'romance', label: 'Romance', icon: '❤️', color: '#ff99bb',
        items: [
          { id: 'dirty-dancing',      name: 'Dirty Dancing',        img: 'images/films/Dirty-dancing.jpg',      file: 'sounds/films/dirty_dancing_the_time_of_my_life.mp3',                    start: 2.0,             title: 'Dirty Dancing (The Time of My Life)' },
          { id: 'titanic',            name: 'Amour Éternel',        img: 'images/films/titanic.jpg',            file: 'sounds/films/titanic_my_heart_will_go_on_celine_dion.mp3',              start: 195.2,           title: 'Titanic (My Heart Will Go On)' },
          { id: 'love-actually',      name: 'Amour Léger',          img: 'images/films/love-actually.jpg',      file: 'sounds/films/love_actually_craig_armstrong.mp3',                        start: 319.0,           title: 'Love Actually' },
        ]
      },
      {
        id: 'comedie', label: 'Comédie', icon: '😂', color: '#ffcc66',
        items: [
          { id: 'curb-your',          name: 'Malaise Absurde',      img: 'images/films/curb-your.jpg',          file: 'sounds/films/curb_your_enthusiasm_theme.mp3',                           start: 0.5,             title: 'Curb Your Enthusiasm' },
          { id: 'pink-panthere',      name: 'Enquête Maladroite',   img: 'images/films/pink-panthere.jpg',      file: 'sounds/films/the_pink_panther_theme.mp3',                               start: 6.3,             title: 'The Pink Panther' },
          { id: 'benny',              name: 'Poursuite Burlesque',  img: 'images/films/benny.jpg',              file: 'sounds/films/benny_hill_theme.mp3',                                     start: 3.2,             title: 'Benny Hill' },
        ]
      },
    ]
  },

];
