/* ================================================================
   icon-mode.svelte.ts — ESSAI TEMPORAIRE : choix de l'affichage des icônes de tuile
   (emoji seuls, ou dessins SVG à la place de certains emojis), pour comparer sur la tablette.
   Le choix est gardé dans localStorage. À retirer une fois les dessins validés.
================================================================ */

export type IconMode = 'emoji' | 'svg';

const STORAGE_KEY = 'essai-icones';

function readSaved(): IconMode {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'emoji' || saved === 'svg') return saved;
  } catch { /* localStorage indisponible : valeur par défaut */ }
  return 'svg';
}

export const iconMode = $state<{ value: IconMode }>({ value: readSaved() });

export function setIconMode(mode: IconMode): void {
  iconMode.value = mode;
  try { localStorage.setItem(STORAGE_KEY, mode); } catch { /* sans effet */ }
}
