/* ================================================================
   transport.svelte.ts — État d'affichage de la lecture audio :
   progression de chaque bouton de son, barre de transport des
   musiques (temps, remplissage). Mis à jour par playbackEvents
   (musiques, audio/playback.ts) et soundEvents (sons, audio/sounds.ts).
================================================================ */

import type { AudioItem } from '../types.ts';
import { STATE } from '../state.svelte.ts';
import { hasCurrentSound, playbackEvents } from '../audio/playback.ts';
import { isTransitionCurrent } from '../audio/transition.ts';
import { getSoundProgress, soundEvents } from '../audio/sounds.ts';
import { SmoothClock, formatTime, getPlaybackProgress } from '../audio/timing.ts';
import { audioFxOverlay } from './fx-overlays.svelte.ts';

// ═══════════════════════════════════════════════════════
// BOUTONS DE SONS
// ═══════════════════════════════════════════════════════

export class SoundButtonState {
  /** Variable CSS --progress (remise à zéro à l'arrêt du son) */
  progress   = $state('0%');
  /** Fichier introuvable ou illisible au dernier essai */
  missing    = $state(false);
  /** Onglets sons : au moins une voix de ce son est en cours */
  playing    = $state(false);
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

/** Temps de la musique lissé pour l'affichage (bug n° 29) */
const musicClock = new SmoothClock();

/**
 * Mise à jour légère — appelée dans la boucle RAF (60fps).
 * Met à jour le temps, la barre de seek et la progression du bouton.
 */
function updateSeekUI(): void {
  const audio = STATE.currentAudio;
  const item  = STATE.currentSoundItem;
  if (!audio || !item) return;

  if (STATE.isPaused) musicClock.reset();
  const time = STATE.isPaused ? audio.currentTime : musicClock.read(audio.currentTime, performance.now(), audio.playbackRate);
  const { elapsed, totalDuration, pct } = getPlaybackProgress(isTransitionCurrent() ? { ...item, start: 0 } : item, time, audio.duration);

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

/** Sons en cours (onglets sons), pour suivre leur progression : durée et horloge lissée */
const playingSounds = new Map<AudioItem, { duration: number; clock: SmoothClock }>();

/** Répercute les événements des sons sur leurs boutons */
export function bindSoundsUI(): void {
  soundEvents.on(event => {
    switch (event.type) {
      case 'start': {
        const state = getSoundButtonState(event.item);
        state.missing = false;
        state.playing = true;
        // Son relancé par-dessus lui-même : la progression suit le dernier lancé
        state.progress = '0%';
        playingSounds.set(event.item, { duration: event.duration, clock: new SmoothClock() });
        break;
      }
      case 'end':
        if (event.remaining > 0) break;
        getSoundButtonState(event.item).playing = false;
        getSoundButtonState(event.item).progress = '0%';
        playingSounds.delete(event.item);
        break;
      case 'progress': {
        const now = performance.now();
        for (const [item, { duration, clock }] of playingSounds) {
          const ratio = getSoundProgress(item);
          if (ratio === null) continue;
          const smoothed = duration > 0 ? Math.min(1, clock.read(ratio * duration, now) / duration) : ratio;
          getSoundButtonState(item).progress = (smoothed * 100).toFixed(2) + '%';
        }
        break;
      }
      case 'missing':
        getSoundButtonState(event.item).missing = true;
        break;
    }
  });
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
        if (event.item) getSoundButtonState(event.item).progress = '0%';
        resetTransportIfIdle();
        if (audioFxOverlay.isOpen) audioFxOverlay.sync();
        break;
      case 'progress-start':
        musicClock.reset();
        break;
      case 'progress':
        updateSeekUI();
        break;
      case 'missing':
        getSoundButtonState(event.item).missing = true;
        break;
    }
  });
}
