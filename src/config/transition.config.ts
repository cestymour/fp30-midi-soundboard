/* ================================================================
   transition.config.ts — Musiques de transition (bouton de l'en-tête)
   Une seule sert tout le spectacle : elle se choisit avant le début,
   dans la popup du bouton. Moments marquants : `start` (moment 0,
   début du spectacle ; 0 par défaut), puis `restarts` (moments 1, 2…,
   joués à tour de rôle après chaque impro).
   Fichiers dans public/sounds/transitions/, nommés « auteur_titre.mp3 », et liste
   triée par auteur.
   Les id suivent les règles des tuiles (slug stable, unique).
================================================================ */

import type { TransitionMusic } from '../types.ts';

export const TRANSITION_MUSICS: TransitionMusic[] = [
  { id: 'sing-sing-sing',    name: '🥁 Benny Goodman - Sing, Sing, Sing',          file: 'sounds/transitions/benny_goodman_sing_sing_sing.mp3',     start: 19,   restarts: [132, 229, 273] },
  { id: 'rasputin',          name: '🪕 Boney M. - Rasputin',                       file: 'sounds/transitions/boney_m_rasputin.mp3',                 start: 0,    restarts: [36, 66, 81, 106] },
  { id: 'down-the-road',     name: '🎹 C2C - Down the Road',                       file: 'sounds/transitions/c2c_down_the_road.mp3',                start: 18,   restarts: [35, 52, 69, 91.5] },
  { id: 'beatophone',        name: '🎷 Caravan Palace - Beatophone',               file: 'sounds/transitions/caravan_palace_beatophone.mp3',        start: 10.6, restarts: [69.8, 124, 151] },
  { id: 'lone-digger',       name: '🎻 Caravan Palace - Lone Digger',              file: 'sounds/transitions/caravan_palace_lone_digger.mp3',       start: 3.8,  restarts: [49, 94, 120] },
  { id: 'rockafeller-skank', name: '🎸 Fatboy Slim - The Rockafeller Skank',       file: 'sounds/transitions/fatboy_slim_rockafeller_skank.mp3',    start: 0,    restarts: [47, 87.8, 258.5, 334] },
  { id: 'this-girl',         name: "🎺 Kungs vs Cookin' on 3 Burners - This Girl", file: 'sounds/transitions/kungs_this_girl.mp3',                  start: 44,   restarts: [62, 70, 150] },
  { id: 'all-night',         name: '🎺 Parov Stelar - All Night',                  file: 'sounds/transitions/parov_stelar_all_night.mp3',           start: 9.7,  restarts: [50, 90.3] },
  { id: 'mojo-radio-gang',   name: '🎷 Parov Stelar - The Mojo Radio Gang',        file: 'sounds/transitions/parov_stelar_the_mojo_radio_gang.mp3', start: 30,   restarts: [50.5, 67.4, 95.5, 135] },
  { id: 'booty-swing',       name: '🎺 Parov Stelar - Booty Swing',                file: 'sounds/transitions/parov_stelar_booty_swing.mp3',         start: 4,    restarts: [50.8, 85, 152.8] },
  { id: 'catgroove',         name: '🎷 Parov Stelar - Catgroove',                  file: 'sounds/transitions/parov_stelar_catgroove.mp3',           start: 9.5,  restarts: [44, 73.5, 164.2] },
];
