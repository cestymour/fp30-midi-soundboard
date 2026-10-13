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

/** Durée jouable au lancement (null si la fin n'est pas encore connue) */
export function getPlayableDuration(startOffset: number, endOffset: number | null, duration: number): number | null {
  const effectiveEnd = endOffset !== null ? endOffset : (duration && isFinite(duration) ? duration : null);
  return effectiveEnd !== null ? effectiveEnd - startOffset : null;
}

/** Formate des secondes en M:SS */
export function formatTime(sec: number): string {
  if (!isFinite(sec) || sec < 0) return '–:––';
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}
