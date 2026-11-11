/* ================================================================
   transition.svelte.ts — Popup de la musique de transition
   Le bouton de l'en-tête l'ouvre ; c'est elle qui lance la musique
   (pas de lancement en un clic depuis l'en-tête : un clic raté
   pendant une impro ne doit rien lancer). Elle reste ouverte quand
   la musique de transition s'arrête ; elle se referme quand une
   musique des onglets part.
================================================================ */

import { playbackEvents } from '../audio/playback.ts';
import { isTransitionMusic } from '../audio/transition.ts';

export const transitionPopup = $state({ isOpen: false });

export function openTransitionPopup(): void {
  transitionPopup.isOpen = true;
}

export function closeTransitionPopup(): void {
  transitionPopup.isOpen = false;
}

/** Ferme la popup quand une musique des onglets part (la progression n'a plus rien à montrer) */
export function bindTransitionUI(): void {
  playbackEvents.on(event => {
    if (event.type === 'play' && !isTransitionMusic(event.item)) closeTransitionPopup();
  });
}
