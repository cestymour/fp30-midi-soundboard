/* ================================================================
   fx-overlay.svelte.ts — État et comportement d'une popup d'effets
   grand format, commune au piano (CC MIDI) et à l'audio.
   Le rendu est dans FxOverlay.svelte ; la logique des presets est
   dans fx/fx-presets.ts. Ce qui diffère entre MIDI et audio est passé
   dans FxOverlayConfig (voir ui/fx-overlays.svelte.ts).
================================================================ */

import type { FxControl, FxPreset } from '../types.ts';
import {
  buildControlNeutralTargetValues, buildPresetTargetValues, buildResetTargetValues,
  inferActiveFxPresetKey, isAnyFxControlModified, isFxControlNeutral,
} from '../fx/fx-presets.ts';
import type { FxCurrentValues, FxValues } from '../fx/fx-presets.ts';
import { animateFxValues } from '../fx/fx-animation.ts';
import type { FxAnimation } from '../fx/fx-animation.ts';

/** Noms des attributs data-* de la popup (différents entre MIDI et audio) */
export interface FxOverlayAttributes {
  preset:    string;
  control:   string;
  valueFor:  string;
  railFor:   string;
  sliderFor: string;
  resetOne:  string;
}

export interface FxOverlayConfig<Key extends string, Settings> {
  overlayId:     string;
  ariaLabel:     string;
  attributes:    FxOverlayAttributes;
  controls:      FxControl<Key, Settings>[];
  presets:       FxPreset<Key>[];
  /** Panneau actif et grille que la popup vient recouvrir */
  panelSelector: string;
  gridSelector:  string;
  /** État courant des effets, lu à chaque synchronisation de la popup */
  readSettings:  () => Settings;
  /** Applique une valeur (curseur déplacé ou animation) */
  applyValue:    (control: FxControl<Key, Settings>, value: number) => void;
  /** Ajustement propre à une popup après synchronisation */
  afterSync?:    (settings: Settings, overlay: FxOverlayController<Key, Settings>) => void;
  /** Rafraîchit les boutons Effets / Reset des barres de panneau */
  refreshToolbar: () => void;
}

/** Position de la popup, posée sur la grille du panneau actif à l'ouverture */
export interface FxOverlayLayout {
  top:    string;
  left:   string;
  width:  string;
  height: string;
  accent: string | null;
}

export class FxOverlayController<Key extends string, Settings> {
  readonly config: FxOverlayConfig<Key, Settings>;

  isOpen = $state(false);
  /** Faux tant que la popup n'est pas montée : les curseurs n'existent pas encore */
  isBuilt = $state(false);
  /** Position des curseurs */
  values: FxValues<Key> = $state({} as FxValues<Key>);
  activePresetKey = $state<string | null>(null);
  layout = $state<FxOverlayLayout | null>(null);
  /** Position verticale du repère du neutre sur chaque rail (en %) */
  neutralMarks: Partial<Record<Key, string>> = $state({});

  /** Éléments mesurés pour placer les repères du neutre (renseignés par le composant) */
  rails:  Partial<Record<Key, HTMLElement>> = {};
  inputs: Partial<Record<Key, HTMLInputElement>> = {};
  presetAnimation: FxAnimation | null = null;

  constructor(config: FxOverlayConfig<Key, Settings>) {
    this.config = config;
    config.controls.forEach(control => {
      this.values[control.key] = control.neutral;
    });
  }

  get controls(): FxControl<Key, Settings>[] {
    return this.config.controls;
  }

  /** Appelé une fois la popup montée */
  build(): void {
    if (this.isBuilt) return;
    this.isBuilt = true;
    this.sync();
    requestAnimationFrame(() => {
      requestAnimationFrame(() => this.updateAllNeutralRailMarks());
    });
  }

  // ================================================================
  // LAYOUT
  // ================================================================

  /** Place la popup exactement sur la grille du panneau actif */
  updateLayout(): void {
    if (!this.isBuilt) return;

    // Mesure de la grille affichée : seul accès direct au DOM, pour la position
    const activePanel = document.querySelector<HTMLElement>(this.config.panelSelector);
    const grid = activePanel?.querySelector(this.config.gridSelector);
    if (!grid) {
      this.close();
      return;
    }

    const rect = grid.getBoundingClientRect();
    const accent = activePanel!.style.getPropertyValue('--panel-accent').trim();
    this.layout = {
      top:    `${rect.top}px`,
      left:   `${rect.left}px`,
      width:  `${rect.width}px`,
      height: `${rect.height}px`,
      accent: accent || null,
    };

    requestAnimationFrame(() => this.updateAllNeutralRailMarks());
  }

  // ================================================================
  // OPEN / CLOSE
  // ================================================================

  /** Ouvre la popup, ou la ferme si elle est déjà ouverte */
  open(): void {
    if (!this.isBuilt) return;
    if (this.isOpen) {
      this.close();
      return;
    }

    this.sync();
    this.updateLayout();
    this.isOpen = true;
    this.config.refreshToolbar();

    requestAnimationFrame(() => {
      requestAnimationFrame(() => this.updateAllNeutralRailMarks());
    });
  }

  close(): void {
    if (!this.isBuilt) return;
    this.isOpen = false;
    this.config.refreshToolbar();
  }

  // ================================================================
  // SYNC
  // ================================================================

  /** Recale les curseurs sur l'état courant des effets */
  sync(): void {
    if (!this.isBuilt) return;

    const settings = this.config.readSettings();
    this.controls.forEach(control => {
      this.values[control.key] = control.read(settings);
      this.updateNeutralRailMarks(control.key);
    });

    this.config.afterSync?.(settings, this);

    this.refreshPresetHighlightFromControls();
    this.config.refreshToolbar();
  }

  // ================================================================
  // REPÈRES DU NEUTRE
  // ================================================================

  /** Positionne les repères du neutre sur le rail (curseur vertical par rotation CSS) */
  updateNeutralRailMarks(controlKey: Key): void {
    const control = this.findControl(controlKey);
    const rail    = this.rails[controlKey];
    const input   = this.inputs[controlKey];
    if (!control || !rail || !input) return;

    const range    = control.max - control.min;
    const t        = range <= 0 ? 0.5 : (control.neutral - control.min) / range;
    const tClamped = Math.max(0, Math.min(1, t));

    const H = rail.clientHeight;
    const L = input.offsetWidth || parseFloat(getComputedStyle(input).width) || 210;
    if (H <= 0) {
      this.neutralMarks[controlKey] = '50%';
      return;
    }

    const yTrackTop = (H - L) / 2;
    const yFromTop  = yTrackTop + (1 - tClamped) * L;
    const yInRail   = Math.max(0, Math.min(H, yFromTop));
    const pctTop    = (yInRail / H) * 100;
    this.neutralMarks[controlKey] = `${pctTop}%`;
  }

  updateAllNeutralRailMarks(): void {
    this.controls.forEach(c => this.updateNeutralRailMarks(c.key));
  }

  // ================================================================
  // VALEURS
  // ================================================================

  findControl(controlKey: Key): FxControl<Key, Settings> | undefined {
    return this.controls.find(c => c.key === controlKey);
  }

  getControlValue(controlKey: Key): number | null {
    return this.isBuilt ? this.values[controlKey] : null;
  }

  /** Valeurs actuelles des curseurs (null si la popup n'est pas encore montée) */
  getCurrentValues(): FxCurrentValues<Key> {
    const values = {} as FxCurrentValues<Key>;
    this.controls.forEach(control => {
      values[control.key] = this.getControlValue(control.key);
    });
    return values;
  }

  /** Curseur déplacé à la main */
  handleSliderInput(control: FxControl<Key, Settings>, value: number): void {
    this.config.applyValue(control, value);
    this.values[control.key] = value;
    this.updateNeutralRailMarks(control.key);
    this.refreshPresetHighlightFromControls();
    this.config.refreshToolbar();
  }

  setControlValue(controlKey: Key, value: number, apply = true): void {
    const control = this.findControl(controlKey);
    if (!control || !this.isBuilt) return;

    this.values[controlKey] = value;
    this.updateNeutralRailMarks(controlKey);
    if (apply) {
      this.config.applyValue(control, value);
    }
  }

  isAnyControlModified(): boolean {
    return isAnyFxControlModified(this.controls, this.getCurrentValues());
  }

  // ================================================================
  // PRESETS
  // ================================================================

  /** Surbrillance déduite des curseurs : revient après changement d'onglet ou réouverture */
  refreshPresetHighlightFromControls(): void {
    this.activePresetKey = inferActiveFxPresetKey(this.controls, this.config.presets, this.getCurrentValues());
  }

  applyPreset(presetKey: string): void {
    if (presetKey === 'reset') {
      this.reset();
      return;
    }

    const preset = this.config.presets.find(p => p.key === presetKey);
    if (!preset) return;

    const targetValues = buildPresetTargetValues(this.controls, preset);
    this.activePresetKey = presetKey;
    this.animateToValues(targetValues, 320, { inferPresetAtEnd: true });
  }

  // ================================================================
  // ANIMATION
  // ================================================================

  animateControlToNeutral(controlKey: Key): void {
    const control = this.findControl(controlKey);
    if (!control || isFxControlNeutral(control, this.getControlValue(controlKey))) return;

    const targetValues = buildControlNeutralTargetValues(this.controls, this.getCurrentValues(), controlKey);

    this.activePresetKey = null;
    this.animateToValues(targetValues, 320, { inferPresetAtEnd: true });
  }

  animateToValues(
    targetValues: FxValues<Key>, durationMs = 300, options: { inferPresetAtEnd?: boolean } = {},
  ): void {
    const { inferPresetAtEnd = false } = options;

    this.presetAnimation?.cancel();
    this.presetAnimation = null;

    this.presetAnimation = animateFxValues(
      this.controls,
      this.getCurrentValues(),
      targetValues,
      durationMs,
      values => {
        this.controls.forEach(control => {
          this.setControlValue(control.key, values[control.key], true);
        });
      },
      () => {
        this.presetAnimation = null;
        if (inferPresetAtEnd) this.refreshPresetHighlightFromControls();
        this.config.refreshToolbar();
      },
    );
  }

  // ================================================================
  // RESET
  // ================================================================

  reset(): void {
    const targetValues = buildResetTargetValues(this.controls);
    this.activePresetKey = 'reset';
    this.animateToValues(targetValues, 320, { inferPresetAtEnd: true });
  }
}
