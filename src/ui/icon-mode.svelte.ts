/* ================================================================
   icon-mode.svelte.ts — ESSAI TEMPORAIRE : choix de l'affichage des icônes de tuile
   (emoji, dessin détaillé, silhouette simple, V4 : niveau de détail d'un emoji), pour comparer sur la tablette.
   Le choix est gardé dans localStorage. À retirer une fois le style choisi.
================================================================ */

export type IconMode = 'emoji' | 'detail' | 'simple' | 'v4';

const STORAGE_KEY = 'essai-icones';

function readSaved(): IconMode {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'emoji' || saved === 'detail' || saved === 'simple' || saved === 'v4') return saved;
  } catch { /* localStorage indisponible : valeur par défaut */ }
  return 'v4';
}

export const iconMode = $state<{ value: IconMode }>({ value: readSaved() });

export function setIconMode(mode: IconMode): void {
  iconMode.value = mode;
  try { localStorage.setItem(STORAGE_KEY, mode); } catch { /* sans effet */ }
}
