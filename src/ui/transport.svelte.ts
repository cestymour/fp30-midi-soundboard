/* ================================================================
   transport.svelte.ts — État d'affichage de la lecture audio :
   progression de chaque bouton de son, barre de transport (temps,
   remplissage). Mis à jour par playbackEvents (audio/playback.ts).
================================================================ */

import type { AudioItem } from '../types.ts';
import { STATE } from '../state.svelte.ts';
import { hasCurrentSound, playbackEvents } from '../audio/playback.ts';
import { formatTime, getPlaybackProgress } from '../audio/timing.ts';
import { audioFxOverlay } from './fx-overlays.svelte.ts';

// ═══════════════════════════════════════════════════════
// BOUTONS DE SONS
// ═══════════════════════════════════════════════════════

export class SoundButtonState {
  /** Variable CSS --progress (non remise à zéro à l'arrêt : voir docs/bugs.md n° 5) */
  progress   = $state('0%');
  /** Variable CSS --progress-transition, selon la durée du son */
  transition = $state<string | undefined>(undefined);
  /** Fichier introuvable ou illisible au dernier essai */
  missing    = $state(false);
}

const soundButtonStates = new Map<AudioItem, SoundButtonState>();

/** État d'affichage du bouton d'un son (créé au premier accès) */
export function getSoundButtonState(item: AudioItem): SoundButtonState {
  let state = soundButtonStates.get(item);
  if (!state) {
    state = new SoundButtonState();
    soundButtonStates.set(item, state);
  }
  return state;
}

// ═══════════════════════════════════════════════════════
// TRANSPORT BAR — Play/Pause + Seek + Time
// ═══════════════════════════════════════════════════════

const EMPTY_TIME = '–:–– / –:––';

/** Barres de transport (une par panneau audio, toutes identiques) */
export const transport = $state({
  /** Remplissage et position de la poignée (non définis avant le premier son) */
  seekPct:  undefined as string | undefined,
  timeText: EMPTY_TIME,
});

/**
 * Mise à jour légère — appelée dans la boucle RAF (60fps).
 * Met à jour le temps, la barre de seek et la progression du bouton.
 */
function updateSeekUI(): void {
  const audio = STATE.currentAudio;
  const item  = STATE.currentSoundItem;
  if (!audio || !item) return;

  const { elapsed, totalDuration, pct } = getPlaybackProgress(item, audio.currentTime, audio.duration);

  getSoundButtonState(item).progress = pct.toFixed(2) + '%';
  transport.seekPct  = pct + '%';
  transport.timeText = `${formatTime(elapsed)} / ${formatTime(totalDuration)}`;
}

/** Remet les barres et le temps à zéro quand plus rien ne joue */
function resetTransportIfIdle(): void {
  if (hasCurrentSound()) return;
  transport.seekPct  = '0%';
  transport.timeText = EMPTY_TIME;
}

/** Durée de transition de la barre de progression du bouton, selon la durée du son */
function getProgressTransition(playableDuration: number | null): string | undefined {
  if (playableDuration === null) return undefined;
  if (playableDuration < 3)  return '0.05s';
  if (playableDuration < 10) return '0.15s';
  return '0.30s';
}

/** Répercute les événements de lecture sur les boutons, la barre de transport et la popup FX */
export function bindPlaybackUI(): void {
  playbackEvents.on(event => {
    switch (event.type) {
      case 'play':
        getSoundButtonState(event.item).missing = false;
        if (audioFxOverlay.isOpen) audioFxOverlay.sync();
        break;
      case 'stop':
        resetTransportIfIdle();
        if (audioFxOverlay.isOpen) audioFxOverlay.sync();
        break;
      case 'progress-start': {
        const transition = getProgressTransition(event.playableDuration);
        if (transition) getSoundButtonState(event.item).transition = transition;
        break;
      }
      case 'progress':
        updateSeekUI();
        break;
      case 'missing':
        getSoundButtonState(event.item).missing = true;
        break;
    }
  });
}
