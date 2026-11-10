/* ================================================================
   transition.svelte.ts — Popup de la musique de transition
   Le bouton de l'en-tête l'ouvre ; c'est elle qui lance la musique
   (pas de lancement en un clic depuis l'en-tête : un clic raté
   pendant une impro ne doit rien lancer). Elle se referme quand la
   musique de transition s'arrête, ou quand une autre musique part.
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

/** Ferme la popup quand la musique de transition s'arrête, ou qu'une musique des onglets part */
export function bindTransitionUI(): void {
  playbackEvents.on(event => {
    switch (event.type) {
      case 'play':
        if (!isTransitionMusic(event.item)) closeTransitionPopup();
        break;
      case 'stop':
        if (isTransitionMusic(event.item)) closeTransitionPopup();
        break;
    }
  });
}
