/* ================================================================
   transition.ts — Musique de transition (bouton de l'en-tête)
   Entre deux impros, une musique rythmée relance l'énergie du public.
   La même sert tout le spectacle, choisie avant le début.

   C'est une musique comme les autres (playback.ts), qui passe par sa
   propre sortie, sans effets audio, avec son propre volume. La lancer
   coupe tout ce qui jouait, comme l'arrêt d'urgence : musique, sons et
   piano. Une musique des onglets la coupe, elle aussi.

   Moments marquants : le 0 (`start`) ouvre le spectacle, les suivants
   (`restarts`, numérotés à partir de 1) servent après chaque impro, à
   tour de rôle : 0, 1, 2, 3, 1, 2, 3, 1… pour ne pas rejouer toujours
   le même passage. Le moment prévu est le suivant de celui joué en
   dernier, même joué hors de l'ordre. On revient au 0 quand on change
   de musique, ou quand le dernier lancement date de plus de
   RESTART_WINDOW_MS (le spectacle suivant ; un rechargement en plein
   spectacle, lui, ne change rien).

   Choix, dernier lancement, dernier moment joué, volume et réglage « volume remis
   à 100 % à l'ouverture de la popup » sont gardés
   dans localStorage. Aucun accès au DOM.
================================================================ */

import type { AudioItem, TransitionMusic } from '../types.ts';
import { STATE } from '../state.svelte.ts';
import { getTransitionMusics } from '../config/tabs.ts';
import { AudioEngineAPI } from './audio-engine.ts';
import { playSound, stopSound } from './playback.ts';
import { stopAllSounds } from './sounds.ts';
import { sendEmergencyStopMidi } from '../midi/midi.ts';

const STORAGE_KEY = 'fp30-soundboard.transition';

/** Au-delà de ce délai depuis le dernier lancement, on repart du moment 0 (nouveau spectacle) */
export const RESTART_WINDOW_MS = 6 * 60 * 60 * 1000;

interface StoredTransition {
  musicId: string | null;
  lastLaunch: number | null;
  lastMoment: number;
  volume: number;
  resetVolume: boolean;
}

function save(): void {
  const stored: StoredTransition = {
    musicId: STATE.transitionMusicId,
    lastLaunch: STATE.transitionLastLaunch,
    lastMoment: STATE.transitionLastMoment,
    volume: STATE.transitionVolume,
    resetVolume: STATE.transitionResetVolume,
  };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
  } catch {
    // Stockage indisponible : le choix vaut jusqu'au rechargement
  }
}

/** Relit le choix, le dernier lancement, le dernier moment joué et le volume (au démarrage) */
export function initTransition(): void {
  let stored: Partial<StoredTransition> = {};
  try {
    stored = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}') as Partial<StoredTransition>;
  } catch {
    stored = {};
  }
  STATE.transitionMusicId    = typeof stored.musicId === 'string' ? stored.musicId : null;
  STATE.transitionLastLaunch = typeof stored.lastLaunch === 'number' ? stored.lastLaunch : null;
  STATE.transitionLastMoment = typeof stored.lastMoment === 'number' ? stored.lastMoment : 0;
  STATE.transitionVolume     = typeof stored.volume === 'number' ? Math.max(0, Math.min(1, stored.volume)) : 1;
  STATE.transitionResetVolume = stored.resetVolume === true;
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

/** Nombre de moments marquants de la musique (le 0 compris) */
export function getMomentCount(music: TransitionMusic = getSelectedTransitionMusic()): number {
  return 1 + music.restarts.length;
}

/** Position du moment marquant `moment` (0 : début du spectacle), en secondes */
export function getMomentTime(music: TransitionMusic, moment: number): number {
  return moment === 0 ? (music.start ?? 0) : music.restarts[moment - 1];
}

/**
 * Moment prévu pour le prochain lancement : 0 au début du spectacle (aucun lancement depuis
 * RESTART_WINDOW_MS), sinon le suivant de celui joué en dernier, dans l'ordre 1, 2, 3, 1…
 */
export function getNextMoment(now: number = Date.now()): number {
  const music = getSelectedTransitionMusic();
  const last = STATE.transitionLastLaunch;
  const count = music.restarts.length;
  if (last === null || now - last < 0 || now - last >= RESTART_WINDOW_MS || count === 0) return 0;
  const played = STATE.transitionLastMoment;
  return played >= 1 && played < count ? played + 1 : 1;
}

/**
 * Lance la musique choisie depuis le moment marquant `moment` (par défaut : le moment prévu).
 * Coupe d'abord tout ce qui jouait, comme l'arrêt d'urgence : sons et piano ; la musique
 * en cours, elle, est coupée net par playSound.
 */
export function launchTransition(now: number = Date.now(), moment: number = getNextMoment(now)): Promise<void> {
  const music = getSelectedTransitionMusic();
  const chosen = Math.max(0, Math.min(music.restarts.length, Math.round(moment)));
  STATE.transitionLastLaunch = now;
  STATE.transitionLastMoment = chosen;
  save();
  stopAllSounds();
  sendEmergencyStopMidi();
  return playSound(music, { route: 'transition', startAt: getMomentTime(music, chosen) });
}

/** Arrête la musique de transition (court fondu) ; ne fait rien si elle ne joue pas */
export function stopTransition(): void {
  if (isTransitionCurrent()) stopSound(true);
}

/**
 * Choisit la musique du spectacle : on revient au moment 0. Si une musique de transition
 * joue, la nouvelle la remplace tout de suite, depuis son moment 0.
 */
export function selectTransitionMusic(id: string): void {
  if (!getTransitionMusics().some(music => music.id === id)) return;
  STATE.transitionMusicId = id;
  STATE.transitionLastLaunch = null;
  STATE.transitionLastMoment = 0;
  save();
  if (isTransitionCurrent()) void launchTransition(Date.now(), 0);
}

/** Réglage : remettre le volume à 100 % à chaque ouverture de la popup (sinon il reste comme avant) */
export function setTransitionResetVolume(enabled: boolean): void {
  STATE.transitionResetVolume = enabled;
  save();
}

/** À l'ouverture de la popup : remet le volume à 100 % si le réglage est activé */
export function applyTransitionVolumeOnOpen(): void {
  if (STATE.transitionResetVolume && STATE.transitionVolume !== 1) setTransitionVolume(1);
}

/** Volume de la musique de transition (0-1) */
export function setTransitionVolume(volume: number): void {
  STATE.transitionVolume = Math.max(0, Math.min(1, volume));
  AudioEngineAPI.setTransitionVolume(STATE.transitionVolume);
  save();
}
