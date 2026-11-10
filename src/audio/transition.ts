/* ================================================================
   transition.ts — Musique de transition (bouton de l'en-tête)
   Entre deux impros, une musique rythmée relance l'énergie du public.
   La même sert tout le spectacle, choisie avant le début.

   C'est une musique comme les autres (playback.ts), qui passe par sa
   propre sortie, sans effets audio, avec son propre volume. La lancer
   coupe tout ce qui jouait, comme l'arrêt d'urgence : musique, sons et
   piano. Une musique des onglets la coupe, elle aussi.

   Premier lancement : depuis le début (`start`). Lancements suivants :
   depuis le point de reprise de la musique (`restart`), tant que le
   dernier lancement date de moins de RESTART_WINDOW_MS (un rechargement
   en plein spectacle ne fait pas repartir du début ; le spectacle
   suivant, si). Changer de musique fait repartir du début.

   Choix, dernier lancement et volume sont gardés dans localStorage.
   Aucun accès au DOM.
================================================================ */

import type { AudioItem, TransitionMusic } from '../types.ts';
import { STATE } from '../state.svelte.ts';
import { getTransitionMusics } from '../config/tabs.ts';
import { AudioEngineAPI } from './audio-engine.ts';
import { playSound, stopSound } from './playback.ts';
import { stopAllSounds } from './sounds.ts';
import { sendEmergencyStopMidi } from '../midi/midi.ts';

const STORAGE_KEY = 'fp30-soundboard.transition';

/** Au-delà de ce délai depuis le dernier lancement, le suivant repart du début (nouveau spectacle) */
export const RESTART_WINDOW_MS = 6 * 60 * 60 * 1000;

interface StoredTransition {
  musicId: string | null;
  lastLaunch: number | null;
  volume: number;
}

function save(): void {
  const stored: StoredTransition = {
    musicId: STATE.transitionMusicId,
    lastLaunch: STATE.transitionLastLaunch,
    volume: STATE.transitionVolume,
  };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
  } catch {
    // Stockage indisponible : le choix vaut jusqu'au rechargement
  }
}

/** Relit le choix, le dernier lancement et le volume enregistrés (au démarrage) */
export function initTransition(): void {
  let stored: Partial<StoredTransition> = {};
  try {
    stored = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}') as Partial<StoredTransition>;
  } catch {
    stored = {};
  }
  STATE.transitionMusicId    = typeof stored.musicId === 'string' ? stored.musicId : null;
  STATE.transitionLastLaunch = typeof stored.lastLaunch === 'number' ? stored.lastLaunch : null;
  STATE.transitionVolume     = typeof stored.volume === 'number' ? Math.max(0, Math.min(1, stored.volume)) : 1;
  AudioEngineAPI.setTransitionVolume(STATE.transitionVolume);
}

/** Musique choisie (la première de la liste si aucune, ou si elle n'existe plus) */
export function getSelectedTransitionMusic(): TransitionMusic {
  const musics = getTransitionMusics();
  return musics.find(music => music.id === STATE.transitionMusicId) ?? musics[0];
}

/** Ce son est une musique de transition */
export function isTransitionMusic(item: AudioItem | null): boolean {
  return !!item && getTransitionMusics().some(music => music === item);
}

/** La musique en cours (en lecture ou en pause) est une musique de transition */
export function isTransitionCurrent(): boolean {
  return isTransitionMusic(STATE.currentSoundItem);
}

/** Le prochain lancement part du point de reprise (sinon : du début) */
export function willRestart(now: number = Date.now()): boolean {
  const last = STATE.transitionLastLaunch;
  return last !== null && now - last >= 0 && now - last < RESTART_WINDOW_MS;
}

/** Position de départ du prochain lancement, en secondes */
export function getNextStartTime(now: number = Date.now()): number {
  const music = getSelectedTransitionMusic();
  return willRestart(now) ? music.restart : (music.start ?? 0);
}

/**
 * Lance la musique choisie : du début la première fois, puis depuis son point de reprise.
 * Coupe d'abord tout ce qui jouait, comme l'arrêt d'urgence : sons et piano ; la musique
 * en cours, elle, est coupée net par playSound.
 */
export function launchTransition(now: number = Date.now()): Promise<void> {
  const music = getSelectedTransitionMusic();
  const startAt = getNextStartTime(now);
  STATE.transitionLastLaunch = now;
  save();
  stopAllSounds();
  sendEmergencyStopMidi();
  return playSound(music, { route: 'transition', startAt });
}

/** Arrête la musique de transition (court fondu) ; ne fait rien si elle ne joue pas */
export function stopTransition(): void {
  if (isTransitionCurrent()) stopSound(true);
}

/**
 * Choisit la musique du spectacle. Le prochain lancement repart du début ;
 * si une musique de transition joue, la nouvelle la remplace tout de suite.
 */
export function selectTransitionMusic(id: string): void {
  if (!getTransitionMusics().some(music => music.id === id)) return;
  STATE.transitionMusicId = id;
  STATE.transitionLastLaunch = null;
  save();
  if (isTransitionCurrent()) void launchTransition();
}

/** Le prochain lancement repartira du début (avant un nouveau spectacle, après un essai) */
export function resetTransitionStart(): void {
  STATE.transitionLastLaunch = null;
  save();
}

/** Volume de la musique de transition (0-1) */
export function setTransitionVolume(volume: number): void {
  STATE.transitionVolume = Math.max(0, Math.min(1, volume));
  AudioEngineAPI.setTransitionVolume(STATE.transitionVolume);
  save();
}
