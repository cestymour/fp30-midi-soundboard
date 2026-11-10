/* ================================================================
   transition.svelte.ts — Popup de la musique de transition
   Elle s'ouvre d'elle-même quand la musique de transition démarre
   (progression par-dessus les onglets) et se referme quand elle
   s'arrête. Ouverte à la main (▾ de l'en-tête, pour choisir la
   musique avant le spectacle), elle reste ouverte à l'arrêt.
================================================================ */

import { playbackEvents } from '../audio/playback.ts';
import { isTransitionMusic } from '../audio/transition.ts';

export const transitionPopup = $state({
  isOpen: false,
  /** Ouverte à la main : elle ne se referme pas à l'arrêt de la musique */
  pinned: false,
});

export function openTransitionPopup(): void {
  transitionPopup.isOpen = true;
  transitionPopup.pinned = true;
}

export function closeTransitionPopup(): void {
  transitionPopup.isOpen = false;
  transitionPopup.pinned = false;
}

/** Ouvre et ferme la popup au rythme de la musique de transition */
export function bindTransitionUI(): void {
  playbackEvents.on(event => {
    switch (event.type) {
      case 'play':
        if (isTransitionMusic(event.item)) transitionPopup.isOpen = true;
        // Une musique des onglets prend la place : la progression n'a plus rien à montrer
        else closeTransitionPopup();
        break;
      case 'stop':
        if (isTransitionMusic(event.item) && !transitionPopup.pinned) transitionPopup.isOpen = false;
        break;
    }
  });
}
