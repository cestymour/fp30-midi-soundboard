/* ================================================================
   layout.svelte.ts — Onglet actif, orientation, hauteur des boutons
   L'égalisation des hauteurs reste un calcul JS sur les tailles
   affichées : le rendu ne serait pas strictement identique en CSS pur.
================================================================ */

import { flushSync } from 'svelte';
import { getAudioTabs, getMidiTabs } from '../config/tabs.ts';
import type { AudioTab, MidiTab } from '../types.ts';
import { audioFxOverlay, midiFxOverlay, refreshFxToolbarButtons } from './fx-overlays.svelte.ts';

export type TabWithType = (MidiTab & { type: 'midi' }) | (AudioTab & { type: 'audio' });

/** Onglets MIDI puis audio, dans l'ordre d'affichage */
export function getAllTabs(): TabWithType[] {
  return [
    ...getMidiTabs().map(tab => ({ ...tab, type: 'midi' as const })),
    ...getAudioTabs().map(tab => ({ ...tab, type: 'audio' as const })),
  ];
}

const portraitQuery = window.matchMedia('(orientation: portrait)');

export const layout = $state({
  activeTab:  0,
  /** En portrait, les grilles MIDI passent sur 2 colonnes */
  isPortrait: portraitQuery.matches,
});

// ═══════════════════════════════════════════════════════
// NAVIGATION ONGLETS
// ═══════════════════════════════════════════════════════

export function activateTab(idx: number): void {
  if (midiFxOverlay.isOpen)  midiFxOverlay.close();
  if (audioFxOverlay.isOpen) audioFxOverlay.close();

  layout.activeTab = idx;

  refreshFxToolbarButtons();

  requestAnimationFrame(() => {
    const activeTab = getAllTabs()[layout.activeTab];
    if (activeTab?.type === 'midi') {
      equalizeMidiButtons();
    } else if (activeTab?.type === 'audio') {
      equalizeAudioButtons();
    }
  });
}

/** Suit les changements d'orientation (réorganisation des grilles MIDI) */
export function watchOrientation(): void {
  portraitQuery.addEventListener('change', () => {
    layout.isPortrait = portraitQuery.matches;
    // La grille doit être réorganisée avant de recalculer la hauteur des boutons
    flushSync();
    equalizeMidiButtons();
  });
}

// ═══════════════════════════════════════════════════════
// HAUTEUR DES BOUTONS
// ═══════════════════════════════════════════════════════

/**
 * Calcule et applique une hauteur uniforme aux boutons d'un panneau en colonnes.
 */
interface EqualizeConfig {
  panelSelector:    string;
  gridSelector:     string;
  guardSelector:    string | null;
  colSelector:      string;
  btnGridSelector:  string;
  catBlockSelector: string;
  colsPerRow:       number;
}

function equalizeColumnButtons(cfg: EqualizeConfig): void {
  document.querySelectorAll(cfg.panelSelector).forEach(panel => {
    const grid = panel.querySelector(cfg.gridSelector);
    if (!grid) return;
    if (cfg.guardSelector && !grid.querySelector(cfg.guardSelector)) return;

    const gridH = grid.clientHeight;
    if (!gridH) return;

    const gapPx    = parseInt(getComputedStyle(grid).gap) || 8;
    const gapInner = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--gap-inner')) || 5;

    // Détecter automatiquement le nombre de rangées visuelles via CSS grid
    const gridStyle = getComputedStyle(grid);
    const gridTemplateRows = gridStyle.gridTemplateRows;
    let visualRowCount = 1;

    if (grid.classList.contains('audio-grid-cols') && gridTemplateRows && gridTemplateRows !== 'none') {
      visualRowCount = gridTemplateRows.split(' ').filter(v => v && v !== '0px').length;
    }

    const availableGridH = (gridH - (visualRowCount - 1) * gapPx) / visualRowCount;

    grid.querySelectorAll<HTMLElement>(cfg.colSelector).forEach(col => {
      let totalRows = 0;
      col.querySelectorAll(cfg.btnGridSelector).forEach(btnGrid => {
        totalRows += Math.ceil(btnGrid.children.length / cfg.colsPerRow);
      });

      const catCount   = col.querySelectorAll(cfg.catBlockSelector).length;
      const firstTitle = col.querySelector<HTMLElement>('.cat-title');
      const titleH     = firstTitle ? firstTitle.offsetHeight : 20;

      const usedByTitles = catCount * (titleH + gapInner);
      const usedByGaps   = (catCount - 1) * gapPx;
      const available    = availableGridH - usedByTitles - usedByGaps;

      const gapsInGrid = (totalRows - 1) * gapInner;
      const btnH       = Math.floor((available - gapsInGrid) / totalRows);

      col.style.setProperty('--btn-h', Math.max(40, btnH) + 'px');
    });
  });
}

export function equalizeMidiButtons(): void {
  equalizeColumnButtons({
    panelSelector:    '.panel.panel-midi.active',
    gridSelector:     '.midi-grid',
    guardSelector:    null,
    colSelector:      '.midi-col',
    btnGridSelector:  '.btn-grid',
    catBlockSelector: '.cat-block',
    colsPerRow:       2,
  });
}

export function equalizeAudioButtons(): void {
  equalizeColumnButtons({
    panelSelector:    '.panel.panel-audio.active',
    gridSelector:     '.audio-grid',
    guardSelector:    '.audio-col',
    colSelector:      '.audio-col',
    btnGridSelector:  '.audio-cat-grid',
    catBlockSelector: '.audio-cat-block',
    colsPerRow:       3,
  });
}

/** Recalcule la hauteur des boutons à chaque changement de taille des panneaux */
export function observePanelsResize(panels: HTMLElement): () => void {
  const resizeObserver = new ResizeObserver(() => {
    equalizeMidiButtons();
    equalizeAudioButtons();
  });
  resizeObserver.observe(panels);
  return () => resizeObserver.disconnect();
}
