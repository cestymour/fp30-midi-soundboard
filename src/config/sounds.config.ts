import type { AudioTab } from '../types.ts';

/** Onglets sons (`kind: 'sounds'`) : sons courts, joués par-dessus tout le reste */
export const SOUND_TABS: AudioTab[] = [
  // ════════════════════════════════════════════════════════
  // ONGLET — Animaux (grille 4×8)
  // ════════════════════════════════════════════════════════
  {
    id: 'animaux',
    label: 'Animaux',
    icon: '🐮',
    svg: 'onglet-animaux',
    kind: 'sounds',
    gridType: 'fixed',
    categories: [
      {
        id: 'tous-les-animaux',
        label: 'Tous les animaux',
        icon: '🔊',
        color: '#88ccff',
        items: [
          // Disposition en blocs (paysage, 8 colonnes ; en portrait la grille est transposée) :
          //   F F F F O O S S    F : ferme, O : oiseaux, S : savane et jungle,
          //   F F F F O O S S    D : chats et chiens, B : forêt (loup, ours),
          //   D D F F O O S A    I : insectes, A : animaux aquatiques. Une couleur par thème
          //   D D B B I I A A    (`color`, palette dans Tile.svelte) : F vert, O bleu, S jaune,
          //                      D rose, B violet, I orange, A cyan.
          // ── Ligne 1 ──
          { id: 'cheval-hiii',       name: 'Cheval : Hiii',       icon: '🐴',   file: 'sounds/animaux/cheval_hennissement_v2.mp3',                   end: 1.9, color: 'vert',                  title: 'Cheval Hennissement' },
          { id: 'cheval-souffle',    name: 'Cheval : Souffle',    icon: '🐎',   file: 'sounds/animaux/cheval_souffle_v2.mp3',                                  color: 'vert',                  title: 'Cheval Souffle' },
       // { id: 'galop-cheval',      name: 'Galop Cheval',        icon: '🐎',   file: 'sounds/animaux/cheval_galop_v2.mp3',                                   color: 'vert',                  title: 'Cheval Galop' },
          { id: 'poule-cot-cot',     name: 'Poule : Cot-cot',     icon: '🐔',   file: 'sounds/animaux/poule_gloussement_v2.mp3',                               color: 'vert',                  title: 'Poule Gloussement' },
          { id: 'coq-cocorico',      name: 'Coq : Cocorico',      icon: '🐓',   file: 'sounds/animaux/coq_cocorico_v2.mp3',                start: 0.17,        color: 'vert',                  title: 'Coq Cocorico' },
          { id: 'oiseau-cui-cui',    name: 'Oiseau : Cui-cui',    icon: '🐦',   file: 'sounds/animaux/chant_des_oiseaux_v2.mp3',                               color: 'bleu',                  title: 'Chant des oiseaux Gazouillement' },
          { id: 'pigeon-rou-rou',    name: 'Pigeon : Rou-rou',    icon: '🕊️', svg: 'pigeon',   file: 'sounds/animaux/pigeon_roucoulement_v2.mp3',                  end: 7.65, color: 'bleu',                  title: 'Pigeon Roucoulement' },
          { id: 'lion-tigre-roarrr', name: 'Lion/tigre : Roarrr', icon: '🦁',   file: 'sounds/animaux/lion_tigre_rugissement_v2.mp3',                          color: 'jaune',                 title: 'Lion/tigre Rugissement' },
          { id: 'hyene-hi-hi',       name: 'Hyène : Hi-hi',       icon: '🐆', svg: 'hyene',   file: 'sounds/animaux/hyene_rire_v2.mp3',                                      color: 'jaune',                 title: 'Hyène Rire' },

          // ── Ligne 2 ──
          { id: 'vache-meuh',        name: 'Vache : Meuh',        icon: '🐮',   file: 'sounds/animaux/vache_meuglement_v2.mp3',            start: 0.5,         color: 'vert',                  title: 'Vache Meuglement' },
          { id: 'ane-i-an',          name: 'Âne : I-An',          icon: '🫏', svg: 'ane',   file: 'sounds/animaux/ane_braiement_v2.mp3',                                   color: 'vert',                  title: 'Âne Braiement' },
          { id: 'dindon-glouglou',   name: 'Dindon : Glouglou',   icon: '🦃',   file: 'sounds/animaux/dindon_glouglou_v2.mp3',                                 color: 'vert',                  title: 'Dindon Glouglou' },
          { id: 'canard-coin-coin',  name: 'Canard : Coin-coin',  icon: '🦆',   file: 'sounds/animaux/canard_cancanement_v2.mp3',                              color: 'vert',                  title: 'Canard Cancanement' },
          { id: 'corbeau-croa-croa', name: 'Corbeau : Croa-croa', icon: '🐦‍⬛',   file: 'sounds/animaux/corbeau_croassement_v2.mp3',                   end: 2.9, color: 'bleu',                  title: 'Corbeau Croassement' },
          { id: 'aigle-cri-percant', name: 'Aigle : Cri perçant', icon: '🦅',   file: 'sounds/animaux/aigle_faucon_cri_percant_v2.mp3',                        color: 'bleu',                  title: 'Aigle / Faucon Cri perçant' },
          { id: 'elephant',          name: 'Éléphant',            icon: '🐘',   file: 'sounds/animaux/elephant_barrissement_v2.mp3',       start: 0.5, end: 6, color: 'jaune',                 title: 'Éléphant Barrissement' },
          { id: 'singe-ouh-ouh',     name: 'Singe : Ouh-ouh',     icon: '🐒',   file: 'sounds/animaux/singe_cris_v2.mp3',                  start: 0.4,         color: 'jaune',                 title: 'Singe Cris' },

          // ── Ligne 3 ──
          { id: 'chat-miaou',        name: 'Chat : Miaou',        icon: '🐱',   file: 'sounds/animaux/chat_miaulement_v2.mp3', start: 0.1,                     color: 'rose',                  title: 'Chat Miaulement' },
          { id: 'chat-ronron',       name: 'Chat : Ronron',       icon: '🐈', svg: 'chat-ronron',   file: 'sounds/animaux/chat_ronronnement_v2.mp3',                               color: 'rose',                  title: 'Chat Ronronnement' },
          { id: 'mouton-beee',       name: 'Mouton : Bêêê',       icon: '🐑',   file: 'sounds/animaux/mouton_chevre_belement_v2.mp3',                          color: 'vert',                  title: 'Mouton/Chèvre Bêlement' },
          { id: 'cochon-groin',      name: 'Cochon : Groin',      icon: '🐷',   file: 'sounds/animaux/cochon_grognement_v2.mp3',                    end: 8.65, color: 'vert',                  title: 'Cochon Grognement / Couinement' },
          { id: 'chouette-hou-hou',  name: 'Chouette : Hou-hou',  icon: '🦉',   file: 'sounds/animaux/chouette_hibou_hululements_v2.mp3', start: 0.1, end: 2.6, color: 'bleu',                  title: 'Chouette / Hibou Hululements' },
          { id: 'mouettes',          name: 'Mouette : Kriaa',     icon: '🦤', svg: 'mouette',   file: 'sounds/animaux/mouettes_v2.mp3',                                        color: 'bleu',                  title: 'Mouette Piaulement' },
          { id: 'serpent-sssss',     name: 'Serpent : Sssss',     icon: '🐍',   file: 'sounds/animaux/serpent_sifflement_v2.mp3',      start: 0.17,            color: 'jaune',                 title: 'Serpent Sifflement' },
          { id: 'grenouille-coaa',   name: 'Grenouille : Coââ',   icon: '🐸',   file: 'sounds/animaux/grenouille_coassement_v2.mp3',                           color: 'cyan',                  title: 'Grenouille Coassement' },

          // ── Ligne 4 ──
          { id: 'chien-ouaf',        name: 'Chien : Ouaf',        icon: '🐶',   file: 'sounds/animaux/chien_aboiement_v2.mp3',                                 color: 'rose',                  title: 'Chien Aboiement' },
          { id: 'chien-grrr',        name: 'Chien : Grrr',        icon: '🐕',   file: 'sounds/animaux/chien_grognement_v2.mp3',                                color: 'rose',                  title: 'Chien Grognement' },
          { id: 'loup-aouuuuh',      name: 'Loup : Aouuuuh',      icon: '🐺',   file: 'sounds/animaux/loup_hurlement_v2.mp3',          start: 0.11, end: 5.1,  color: 'violet',                title: 'Loup Hurlement' },
          { id: 'ours-grrr',         name: 'Ours : Grrr',         icon: '🐻',   file: 'sounds/animaux/ours_grognement_v2.mp3',                                 color: 'violet',                title: 'Ours Grognement' },
          { id: 'grillon-zzzzz',     name: 'Grillons',            icon: '🦗',   file: 'sounds/animaux/grillon_gresillement_v2.mp3',                            color: 'orange',                title: 'Grillon Grésillement' },
          { id: 'abeille-bzzzz',     name: 'Moustique : Bzzzz',   icon: '🐝', svg: 'moustique', file: 'sounds/animaux/moustique_bourdonnement_v2.mp3',                         color: 'orange',                title: 'Moustique / Mouche / Abeille Bourdonnement' },
          { id: 'dauphin-i-i-i-i',   name: 'Dauphin : I i i i',   icon: '🐬',   file: 'sounds/animaux/dauphin_sifflements_v2.mp3',                             color: 'cyan',                  title: 'Dauphin Clics et sifflements' },
          { id: 'baleine-chant',     name: 'Baleine : Chant',     icon: '🐋',   file: 'sounds/animaux/baleine_chant_v2.mp3',           start: 0.21,  end: 3.2, color: 'cyan',                  title: 'Baleine Chant' },
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
    // svg: 'onglet-bruits',
    kind: 'sounds',
    gridType: 'fixed',
    categories: [
      {
        id: 'tous-les-bruits', label: 'Tous les bruits', icon: '🔊', color: '#dd66ff',
        items: [
          // Disposition en blocs (paysage, 8 colonnes ; en portrait la grille est transposée) :
          //   M M M B B T T T    M : maison, B : bureau et informatique, T : téléphone,
          //   M M B B B T T T    R : rue et cérémonies, S : spectacle et jeux,
          //   R R S S D D D D    D : danger et outils. Une couleur par thème (`color`,
          //   R R S S D D D D    palette dans Tile.svelte) : M vert, B cyan, T violet, R bleu,
          //                      S jaune, D rose.
          // ── Ligne 1 ──
          { id: 'bebe-rit',                name: 'Bébé rit',             icon: '👶', file: 'sounds/bruits/bebe_rit.mp3', color: 'vert' },
          { id: 'verre-d-eau',             name: 'Verre d\'eau',         icon: '🥛', svg: 'verre-d-eau', file: 'sounds/bruits/remplissage_verre_d_eau.mp3', color: 'vert' },
          { id: 'machine-a-cafe',          name: 'Machine à café',       icon: '☕', svg: 'machine-a-cafe', file: 'sounds/bruits/bruit_machine_cafe.mp3', color: 'vert' },
          { id: 'machine-a-ecrire',        name: 'Machine à écrire',     icon: '📝', svg: 'machine-a-ecrire', file: 'sounds/bruits/machine_a_ecrire.ogg',         start: 0.15, color: 'cyan' },
          { id: 'modem-56k',               name: 'Modem 56k',            icon: '📠', file: 'sounds/bruits/connexion_modem_56k.mp3', color: 'cyan' },
          { id: 'tonalite-appel',          name: 'Tonalité d\'appel',    icon: '📞', file: 'sounds/bruits/tonalite_appel.mp3',           start: 5.1,  end: 12.75, color: 'violet' },
          { id: 'tonalite-raccroche',      name: 'Raccroché',            icon: '☎️', file: 'sounds/bruits/tonalite_raccroche.mp3', color: 'violet' },
          { id: 'sonnerie-portable',       name: 'Sonnerie portable',    icon: '📱', file: 'sounds/bruits/sonnerie_portable.mp3',        start: 0.3,  end: 30.35, color: 'violet' },

          // ── Ligne 2 ──
          { id: 'bebe-pleure',             name: 'Bébé pleure',          icon: '😭', file: 'sounds/bruits/bebe_pleure.mp3', color: 'vert' },
          { id: 'sonnette-porte',          name: 'Sonnette',             icon: '🛎️', /* svg: 'sonnette', */ file: 'sounds/bruits/sonnette_porte.mp3',                        end: 2.7, color: 'vert' },
          { id: 'bip-morse',               name: 'Bip morse',            icon: '📡', file: 'sounds/bruits/bip_code_morse.mp3', color: 'cyan' },
          { id: 'erreur-windows',          name: 'Erreur Windows',       icon: '🖥️', svg: 'erreur-windows', file: 'sounds/bruits/erreur_windows_xp.mp3',        start: 0.2, color: 'cyan' },
          { id: 'clavier',                 name: 'Clavier',              icon: '⌨️', file: 'sounds/bruits/bruit_clavier_ordinateur.mp3', color: 'cyan' },
          { id: 'notification',            name: 'Notification',         icon: '🔔', file: 'sounds/bruits/bruit_notification.mp3',       start: 0.8, color: 'violet' },
          { id: 'appareil-photo',          name: 'Appareil photo',       icon: '📷', file: 'sounds/bruits/bruit_appareil_photo.mp3',     start: 0.15, end: 0.7, color: 'violet' },
          { id: 'vibreur',                 name: 'Vibreur',              icon: '📳', file: 'sounds/bruits/vibreur_telephone.mp3', color: 'violet' },

          // ── Ligne 3 ──
          { id: 'klaxon',                  name: 'Klaxon',               icon: '🚗', file: 'sounds/bruits/klaxon_voiture.mp3', color: 'bleu' },
          { id: 'sonnette-velo',           name: 'Sonnette vélo',        icon: '🚲', file: 'sounds/bruits/sonnette_velo.mp3',            start: 1.1,  end: 4.8, color: 'bleu' },
          { id: 'buzzer-bonne-reponse',    name: 'Bonne réponse',        icon: '✅', file: 'sounds/bruits/buzzer_bonne_reponse.mp3', color: 'jaune' },
          { id: 'buzzer-mauvaise-reponse', name: 'Mauvaise réponse',     icon: '❌', file: 'sounds/bruits/buzzer_mauvaise_reponse.mp3',  start: 0.6, color: 'jaune' },
          { id: 'tronconneuse',            name: 'Tronçonneuse',         icon: '🪚', svg: 'tronconneuse', file: 'sounds/bruits/bruit_tronconneuse.ogg', color: 'rose' },
          { id: 'briquet',                 name: 'Briquet',              icon: '🚬', svg: 'briquet', file: 'sounds/bruits/bruit_briquet_cigarette.mp3', color: 'rose' },
          { id: 'prend-feu',               name: 'Prend feu',            icon: '🔥', file: 'sounds/bruits/bruit_prend_feu.ogg', color: 'rose' },
          { id: 'tic-tac-bombe',           name: 'Tic-tac bombe',        icon: '💣', file: 'sounds/bruits/tic_tac_bombe.ogg', color: 'rose' },

          // ── Ligne 4 ──
          { id: 'annonce-sncf',            name: 'Annonce SNCF',         icon: '📢', file: 'sounds/bruits/annonce_sncf.mp3',                          end: 2.3, color: 'bleu' },
          { id: 'foule-amen',              name: 'Foule : Amen',         icon: '🙏', file: 'sounds/bruits/bruit_foule_amen.mp3', color: 'bleu' },
          { id: 'roulement-tambour',       name: 'Roulement de tambour', icon: '🥁', file: 'sounds/bruits/roulement_de_tambour.mp3', color: 'jaune' },
          { id: 'batterie-blague',         name: 'Ba-dum-tss',           icon: '🎭', svg: 'ba-dum-tss', file: 'sounds/bruits/batterie_blague.mp3',                       end: 2.45, color: 'jaune' },
          { id: 'scie-egoine',             name: 'Scie égoïne',          icon: '🪚', file: 'sounds/bruits/scie_egoine.mp3', color: 'rose' },
          { id: 'scie-a-metaux',           name: 'Scie à métaux',        icon: '🪛', svg: 'scie-a-metaux', file: 'sounds/bruits/scie_a_metaux.mp3', color: 'rose' },
       // { id: 'perceuse',                name: 'Perceuse',             icon: '🔧', file: 'sounds/bruits/bruit_perceuse.mp3', color: 'rose' },
          { id: 'epees',                   name: 'Épées',                icon: '⚔️', file: 'sounds/bruits/epee_contre_epee.mp3',                      end: 3.95, color: 'rose' },
          { id: 'couteau',                 name: 'Meurtre au couteau',   icon: '🔪', file: 'sounds/bruits/meurtre_au_couteau.mp3',                    end: 1.15, color: 'rose' },
        ]
      }
    ]
  },

];
