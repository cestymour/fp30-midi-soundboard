/* ================================================================
   transition.config.ts — Musiques de transition (bouton de l'en-tête)
   Une seule sert tout le spectacle : elle se choisit avant le début,
   dans la popup du bouton. Premier lancement depuis `start` (0 par
   défaut), lancements suivants depuis `restart`.
   Les id suivent les règles des tuiles (slug stable, unique).
   Pour l'instant, des musiques déjà présentes dans les onglets :
   `start` reprend le réglage de leur tuile, `restart` est à régler
   à l'oreille (il vaut `start` en attendant).
================================================================ */

import type { TransitionMusic } from '../types.ts';

export const TRANSITION_MUSICS: TransitionMusic[] = [
  { id: 'i-feel-good',     name: 'I Feel Good (James Brown)',      file: 'sounds/musiques/i_feel_good.mp3',                                  restart: 0 },
  { id: 'dancing-queen',   name: 'Dancing Queen (ABBA)',           file: 'sounds/musiques/dancing_queen.mp3',              start: 2,         restart: 2 },
  { id: 'pump-it',         name: 'Pump It (Taxi)',                 file: 'sounds/films/taxi_pump_it.mp3',                                    restart: 0 },
  { id: 'eye-of-the-tiger', name: 'Eye of the Tiger (Rocky)',      file: 'sounds/films/rocky_eye_of_the_tiger_survivor.mp3', start: 0.2,     restart: 0.2 },
  { id: 'still-dre',       name: 'Still D.R.E. (Dr. Dre)',         file: 'sounds/musiques/still_dre.mp3',                                    restart: 0 },
  { id: 'peter-gunn',      name: 'Peter Gunn (Henry Mancini)',     file: 'sounds/musiques/peter_gunn.mp3',                 start: 4.5,       restart: 4.5 },
  { id: 'can-can',         name: 'French cancan (Offenbach)',      file: 'sounds/musiques/can_can_offenbach.mp3',          start: 42,        restart: 42 },
  { id: 'guillaume-tell',  name: 'Guillaume Tell, galop (Rossini)', file: 'sounds/musiques/guillaume_tell_finale.mp3',     start: 0.2,       restart: 0.2 },
  { id: 'benny-hill',      name: 'Benny Hill',                     file: 'sounds/films/benny_hill_theme.mp3',              start: 3.2,       restart: 3.2 },
  { id: 'mario',           name: 'Super Mario Bros',               file: 'sounds/musiques/super_mario_bros_theme.mp3',                       restart: 0 },
];
