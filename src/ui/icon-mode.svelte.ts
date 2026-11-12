/* ================================================================
   icon-mode.svelte.ts — ESSAI TEMPORAIRE : choix de l'affichage des icônes de tuile
   (emoji, dessin détaillé, dessin simple), pour comparer sur la tablette.
   Le choix est gardé dans localStorage. À retirer une fois le style choisi.
================================================================ */

export type IconMode = 'emoji' | 'detail' | 'simple';

const STORAGE_KEY = 'essai-icones';

function readSaved(): IconMode {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'emoji' || saved === 'detail' || saved === 'simple') return saved;
  } catch { /* localStorage indisponible : valeur par défaut */ }
  return 'simple';
}

export const iconMode = $state<{ value: IconMode }>({ value: readSaved() });

export function setIconMode(mode: IconMode): void {
  iconMode.value = mode;
  try { localStorage.setItem(STORAGE_KEY, mode); } catch { /* sans effet */ }
}
