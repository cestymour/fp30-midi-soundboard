/* ================================================================
   transition.config.ts — Musiques de transition (bouton de l'en-tête)
   Une seule sert tout le spectacle : elle se choisit avant le début,
   dans la popup du bouton. Moments marquants : `start` (moment 0,
   début du spectacle ; 0 par défaut), puis `restarts` (moments 1, 2…,
   joués à tour de rôle après chaque impro).
   Fichiers dans public/sounds/transitions/.
   Les id suivent les règles des tuiles (slug stable, unique).
================================================================ */

import type { TransitionMusic } from '../types.ts';

export const TRANSITION_MUSICS: TransitionMusic[] = [
  { id: 'all-night',         name: 'All Night (Parov Stelar)',                  file: 'sounds/transitions/all_night_parov_stelar.mp3',           start: 9,  restarts: [50] },
  { id: 'mojo-radio-gang',   name: 'The Mojo Radio Gang (Parov Stelar)',        file: 'sounds/transitions/the_mojo_radio_gang_parov_stelar.mp3', start: 30, restarts: [53] },
  { id: 'rasputin',          name: 'Rasputin (Boney M.)',                       file: 'sounds/transitions/rasputin_boney_m.mp3',                 start: 0,  restarts: [36] },
  { id: 'beatophone',        name: 'Beatophone (Caravan Palace)',               file: 'sounds/transitions/beatophone_caravan_palace.mp3',        start: 5,  restarts: [10, 15, 20] },
  { id: 'this-girl',         name: "This Girl (Kungs vs Cookin' on 3 Burners)", file: 'sounds/transitions/this_girl_kungs.mp3',                  start: 5,  restarts: [10, 15, 20] },
  { id: 'booty-swing',       name: 'Booty Swing (Parov Stelar)',                file: 'sounds/transitions/booty_swing_parov_stelar.mp3',         start: 5,  restarts: [10, 15, 20] },
  { id: 'catgroove',         name: 'Catgroove (Parov Stelar)',                  file: 'sounds/transitions/catgroove_parov_stelar.mp3',           start: 5,  restarts: [10, 15, 20] },
  { id: 'rockafeller-skank', name: 'The Rockafeller Skank (Fatboy Slim)',       file: 'sounds/transitions/rockafeller_skank_fatboy_slim.mp3',    start: 5,  restarts: [10, 15, 20] },
  { id: 'down-the-road',      name: 'Down the Road (C2C)',                        file: 'sounds/transitions/down_the_road_c2c.mp3',                start: 5,  restarts: [10, 15, 20] },
];
