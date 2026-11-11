/* ================================================================
   transition.config.ts — Musiques de transition (bouton de l'en-tête)
   Une seule sert tout le spectacle : elle se choisit avant le début,
   dans la popup du bouton. Premier lancement depuis `start` (0 par
   défaut), lancements suivants depuis `restart`.
   Fichiers dans public/sounds/transitions/.
   Les id suivent les règles des tuiles (slug stable, unique).
================================================================ */

import type { TransitionMusic } from '../types.ts';

export const TRANSITION_MUSICS: TransitionMusic[] = [
  { id: 'all-night',       name: 'All Night (Parov Stelar)',           file: 'sounds/transitions/all_night_parov_stelar.mp3',           start: 9,  restart: 50 },
  { id: 'mojo-radio-gang', name: 'The Mojo Radio Gang (Parov Stelar)', file: 'sounds/transitions/the_mojo_radio_gang_parov_stelar.mp3', start: 30, restart: 53 },
  { id: 'rasputin',        name: 'Rasputin (Boney M.)',                file: 'sounds/transitions/rasputin_boney_m.mp3',                 start: 0,  restart: 36 },
];
