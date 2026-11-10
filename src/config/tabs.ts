/* ================================================================
   tabs.ts — Accès à la configuration des onglets
   Les composants ne lisent jamais MIDI_TABS / AUDIO_TABS directement :
   c'est le seul endroit à modifier pour appliquer un jour des
   préférences utilisateur (tuiles masquées, ordre), repérées par leur id.
   Pour l'instant, la configuration est renvoyée telle quelle.
================================================================ */

import type { AudioItem, AudioTab, MidiTab, TabKind } from '../types.ts';
import { MIDI_TABS } from './midi.config.ts';
import { AUDIO_TABS } from './audio.config.ts';

/**
 * Couleur d'accent par type d'onglet (onglet, cadre et barre du panneau) : elle dit ce que
 * pilote la barre du haut (piano, sons ou musique).
 */
export const TAB_ACCENTS: Record<TabKind, string> = {
  midi:   '#d946ef',
  sounds: '#4ade80',
  music:  '#ffcc55',
};

export function getMidiTabs(): MidiTab[] {
  return MIDI_TABS;
}

export function getAudioTabs(): AudioTab[] {
  return AUDIO_TABS;
}

/** Image de couverture d'un son : `img`, ou `icon` si c'est un chemin d'image */
export function getSoundImage(item: AudioItem): string | undefined {
  if (item.img) return item.img;
  return item.icon && /\.(png|jpg|jpeg|gif|svg|webp)$/i.test(item.icon) ? item.icon : undefined;
}
