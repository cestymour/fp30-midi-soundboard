/* ================================================================
   timing.ts — Calculs de temps de lecture (fonctions pures)
   Plage jouée d'un son (`start` / `end`), progression, seek,
   affichage M:SS.
================================================================ */

import type { AudioItem } from '../types.ts';

/** Début et fin de lecture configurés pour un son (fin null : jusqu'à la fin du fichier) */
export function getPlaybackRange(item: Pick<AudioItem, 'start' | 'end'>): { startOffset: number; endOffset: number | null } {
  return {
    startOffset: item.start ?? 0,
    endOffset:   item.end ?? null,
  };
}

/** Fin effective et durée jouable, la durée du fichier servant de fin par défaut (0 si inconnue) */
export function getPlaybackWindow(
  item: Pick<AudioItem, 'start' | 'end'>, duration: number,
): { startOffset: number; effectiveEnd: number; totalDuration: number } {
  const { startOffset, endOffset } = getPlaybackRange(item);
  const effectiveEnd = endOffset ?? (isFinite(duration) ? duration : 0);
  return { startOffset, effectiveEnd, totalDuration: effectiveEnd - startOffset };
}

/** Temps écoulé depuis le début de la plage, durée totale et pourcentage (0-100) */
export function getPlaybackProgress(
  item: Pick<AudioItem, 'start' | 'end'>, currentTime: number, duration: number,
): { elapsed: number; totalDuration: number; pct: number } {
  const { startOffset, totalDuration } = getPlaybackWindow(item, duration);
  const elapsed = Math.max(0, currentTime - startOffset);
  const pct     = totalDuration > 0 ? Math.min(100, (elapsed / totalDuration) * 100) : 0;
  return { elapsed, totalDuration, pct };
}

/** Position en secondes pour un seek à `ratio` (0-1) de la plage jouée */
export function getSeekTime(item: Pick<AudioItem, 'start' | 'end'>, duration: number, ratio: number): number {
  const { startOffset, effectiveEnd, totalDuration } = getPlaybackWindow(item, duration);
  const newTime = startOffset + ratio * totalDuration;
  return Math.max(startOffset, Math.min(newTime, effectiveEnd));
}

/** Formate des secondes en M:SS */
export function formatTime(sec: number): string {
  if (!isFinite(sec) || sec < 0) return '–:––';
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

/** Écart au-delà duquel l'horloge lissée se recale d'un coup (seek, reprise, saut) */
const SMOOTH_RESYNC_S = 0.25;
/** Part de l'écart rattrapée à chaque lecture (une par image) */
const SMOOTH_GAIN = 0.1;

/**
 * Horloge de lecture lissée, pour l'affichage de la progression (bug n° 29).
 * L'horloge audio (`AudioContext.currentTime`, `<audio>.currentTime`) avance par paquets,
 * au rythme des tampons audio : lue à chaque image, elle avance deux fois plus ou pas du tout.
 * Celle-ci avance au rythme régulier de `now` (`performance.now()`, en ms) et rattrape
 * doucement l'horloge audio ; elle ne recule que pour un écart de plus de 0,25 s (seek).
 */
export class SmoothClock {
  #time: number | null = null;
  #at = 0;

  /** Temps lissé (s), à partir du temps audio (s), de `now` (ms) et de la vitesse de lecture */
  read(audioTime: number, now: number, rate = 1): number {
    if (this.#time === null || !isFinite(audioTime)) return this.#set(audioTime, now);
    const predicted = this.#time + ((now - this.#at) / 1000) * rate;
    const error = audioTime - predicted;
    if (Math.abs(error) > SMOOTH_RESYNC_S) return this.#set(audioTime, now);
    return this.#set(Math.max(this.#time, predicted + error * SMOOTH_GAIN), now);
  }

  /** Oublie l'état : la prochaine lecture repart du temps audio (nouveau son, pause) */
  reset(): void {
    this.#time = null;
  }

  #set(time: number, now: number): number {
    this.#time = time;
    this.#at = now;
    return time;
  }
}
