/* ================================================================
   wake-lock.ts — Empêche la mise en veille de l'écran
================================================================ */

import { STATE } from './state.svelte.ts';

async function requestWakeLock(): Promise<void> {
  if (!('wakeLock' in navigator)) return;
  try {
    const sentinel = await navigator.wakeLock.request('screen');
    // Libéré par le navigateur (page en arrière-plan) : plus affiché comme actif (bug n° 12)
    sentinel.addEventListener('release', () => {
      if (STATE.wakeLock === sentinel) STATE.wakeLock = null;
    });
    STATE.wakeLock = sentinel;
    console.log('[WakeLock] Actif ✅');
  } catch (err) {
    console.warn('[WakeLock] Échec :', (err as Error).message);
  }
}

/** Demande le Wake Lock, et le redemande à chaque retour au premier plan */
export function initWakeLock(): void {
  requestWakeLock();
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      requestWakeLock();
    }
  });
}
