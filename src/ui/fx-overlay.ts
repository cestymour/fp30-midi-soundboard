/* ================================================================
   fx-overlay.ts — Popup d'effets grand format, commune au piano
   (CC MIDI) et à l'audio (moteur Web Audio)
   La logique des presets est dans fx/fx-presets.ts ; ce module ne
   gère que le DOM. Ce qui diffère entre MIDI et audio est passé
   dans FxOverlayConfig (voir ui/fx-overlays.ts).
================================================================ */

import type { FxControl, FxPreset } from '../types.ts';
import {
  buildControlNeutralTargetValues, buildPresetTargetValues, buildResetTargetValues,
  inferActiveFxPresetKey, isAnyFxControlModified, isFxControlModified, isFxControlNeutral,
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
  afterSync?:    (settings: Settings, overlay: FxOverlay<Key, Settings>) => void;
  /** Rafraîchit les boutons Effets / Reset des barres de panneau */
  refreshToolbar: () => void;
}

export class FxOverlay<Key extends string, Settings> {
  readonly config: FxOverlayConfig<Key, Settings>;
  isOpen = false;

  overlay: HTMLDivElement | null = null;
  presetButtons = new Map<string, HTMLButtonElement>();
  sliderInputs  = new Map<Key, HTMLInputElement>();
  sliderRails   = new Map<Key, HTMLElement>();
  valueLabels   = new Map<Key, HTMLElement>();
  controlCards  = new Map<Key, HTMLElement>();
  activePresetKey: string | null = null;
  presetAnimation: FxAnimation | null = null;
  railResizeObserver: ResizeObserver | null = null;

  constructor(config: FxOverlayConfig<Key, Settings>) {
    this.config = config;
  }

  get controls(): FxControl<Key, Settings>[] {
    return this.config.controls;
  }

  // ================================================================
  // BUILD
  // ================================================================

  build(): void {
    if (this.overlay) return;
    const { attributes: attr, controls, presets } = this.config;

    const overlay = document.createElement('div');
    overlay.id = this.config.overlayId;
    overlay.setAttribute('aria-hidden', 'true');

    const presetButtonsHTML = presets.map(preset => {
      const resetCls = preset.key === 'reset' ? ' fx-preset-btn--reset' : '';
      const iconHtml = preset.icon
        ? `<span class="fx-preset-btn__icon" aria-hidden="true">${preset.icon}</span>`
        : '';
      return `
    <button class="fx-preset-btn${resetCls}" type="button" ${attr.preset}="${preset.key}">${iconHtml}<span class="fx-preset-btn__text">${preset.text}</span></button>
  `;
    }).join('');

    const controlsHTML = controls.map(control => `
    <div class="fx-control" ${attr.control}="${control.key}">
      <div class="fx-control__head">
        <span class="fx-control__tag">${control.label}</span>
        <span class="fx-control__value" ${attr.valueFor}="${control.key}">--</span>
      </div>
      <div class="fx-slider-wrap">
        <div class="fx-slider-rail" ${attr.railFor}="${control.key}">
          <span class="fx-neutral-tick fx-neutral-tick--left"  aria-hidden="true"></span>
          <span class="fx-neutral-tick fx-neutral-tick--right" aria-hidden="true"></span>
          <input
            class="vol-slider fx-slider"
            ${attr.sliderFor}="${control.key}"
            type="range"
            min="${control.min}"
            max="${control.max}"
            step="${control.step}"
            value="${control.neutral}"
          />
        </div>
      </div>
      <div class="fx-control__foot">
        <span class="fx-control__name">${control.shortLabel}</span>
        <button
          type="button"
          class="fx-one-reset"
          ${attr.resetOne}="${control.key}"
          title="Valeur par défaut (${control.shortLabel})"
          aria-label="Remettre ${control.shortLabel} à la valeur par défaut"
        >↺</button>
      </div>
    </div>
  `).join('');

    overlay.innerHTML = `
    <div class="fx-overlay__backdrop"></div>
    <section class="fx-popup" role="dialog" aria-modal="true" aria-label="${this.config.ariaLabel}">
      <header class="fx-popup__header">
        <div class="fx-presets">${presetButtonsHTML}</div>
      </header>

      <div class="fx-popup__body">
        <div class="fx-grid">${controlsHTML}</div>
      </div>
    </section>
  `;

    document.getElementById('app')!.appendChild(overlay);
    this.overlay = overlay;

    // ── Fermeture ──
    overlay.querySelector('.fx-overlay__backdrop')!.addEventListener('click', () => this.close());
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && this.isOpen) this.close();
    });

    window.addEventListener('resize', () => {
      if (this.isOpen) this.updateLayout();
    });

    // ── Presets ──
    presets.forEach(preset => {
      const button = overlay.querySelector<HTMLButtonElement>(`[${attr.preset}="${preset.key}"]`)!;
      this.presetButtons.set(preset.key, button);
      button.addEventListener('click', () => this.applyPreset(preset.key));
    });

    // ── Sliders ──
    controls.forEach(control => {
      const input      = overlay.querySelector<HTMLInputElement>(`[${attr.sliderFor}="${control.key}"]`)!;
      const rail       = overlay.querySelector<HTMLElement>(`[${attr.railFor}="${control.key}"]`)!;
      const valueLabel = overlay.querySelector<HTMLElement>(`[${attr.valueFor}="${control.key}"]`)!;
      const card       = overlay.querySelector<HTMLElement>(`[${attr.control}="${control.key}"]`)!;

      this.sliderInputs.set(control.key, input);
      this.sliderRails.set(control.key, rail);
      this.valueLabels.set(control.key, valueLabel);
      this.controlCards.set(control.key, card);

      input.addEventListener('input', () => {
        const value = parseFloat(input.value);
        this.config.applyValue(control, value);
        this.updateValueLabel(control.key, value);
        this.updateSliderVisual(control.key, value);
        this.updateNeutralRailMarks(control.key);
        this.updateControlState(control.key, value);
        this.refreshPresetHighlightFromControls();
        this.config.refreshToolbar();
      });

      const oneReset = card.querySelector<HTMLButtonElement>(`[${attr.resetOne}="${control.key}"]`);
      if (oneReset) {
        oneReset.addEventListener('click', event => {
          event.preventDefault();
          event.stopPropagation();
          this.animateControlToNeutral(control.key);
        });
      }
    });

    // ── ResizeObserver pour les rails ──
    if (!this.railResizeObserver) {
      this.railResizeObserver = new ResizeObserver(() => {
        if (!this.overlay) return;
        this.updateAllNeutralRailMarks();
      });
    }
    this.sliderRails.forEach(rail => {
      if (rail) this.railResizeObserver!.observe(rail);
    });

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
    if (!this.overlay) return;

    const activePanel = document.querySelector<HTMLElement>(this.config.panelSelector);
    const grid = activePanel?.querySelector(this.config.gridSelector);
    if (!grid) {
      this.close();
      return;
    }

    const rect = grid.getBoundingClientRect();
    const overlay = this.overlay;
    overlay.style.top    = `${rect.top}px`;
    overlay.style.left   = `${rect.left}px`;
    overlay.style.width  = `${rect.width}px`;
    overlay.style.height = `${rect.height}px`;

    const accent = activePanel!.style.getPropertyValue('--panel-accent').trim();
    if (accent) {
      overlay.style.setProperty('--panel-accent', accent);
    } else {
      overlay.style.removeProperty('--panel-accent');
    }

    requestAnimationFrame(() => this.updateAllNeutralRailMarks());
  }

  // ================================================================
  // OPEN / CLOSE
  // ================================================================

  /** Ouvre la popup, ou la ferme si elle est déjà ouverte */
  open(): void {
    if (!this.overlay) return;
    if (this.isOpen) {
      this.close();
      return;
    }

    this.sync();
    this.updateLayout();
    this.isOpen = true;
    this.overlay.classList.add('is-open');
    this.overlay.setAttribute('aria-hidden', 'false');
    this.config.refreshToolbar();

    requestAnimationFrame(() => {
      requestAnimationFrame(() => this.updateAllNeutralRailMarks());
    });
  }

  close(): void {
    if (!this.overlay) return;
    this.isOpen = false;
    this.overlay.classList.remove('is-open');
    this.overlay.setAttribute('aria-hidden', 'true');
    this.config.refreshToolbar();
  }

  // ================================================================
  // SYNC
  // ================================================================

  /** Recale les curseurs sur l'état courant des effets */
  sync(): void {
    if (!this.overlay) return;

    const settings = this.config.readSettings();
    this.controls.forEach(control => {
      const value = control.read(settings);
      const input = this.sliderInputs.get(control.key);
      if (!input) return;
      input.value = String(value);
      this.updateValueLabel(control.key, value);
      this.updateSliderVisual(control.key, value);
      this.updateNeutralRailMarks(control.key);
      this.updateControlState(control.key, value);
    });

    this.config.afterSync?.(settings, this);

    this.refreshPresetHighlightFromControls();
    this.config.refreshToolbar();
  }

  // ================================================================
  // HELPERS UI
  // ================================================================

  updateValueLabel(controlKey: Key, value: number): void {
    const control = this.findControl(controlKey);
    const label   = this.valueLabels.get(controlKey);
    if (!control || !label) return;
    label.textContent = String(control.formatValue(value));
  }

  updateSliderVisual(controlKey: Key, value: number): void {
    const control = this.findControl(controlKey);
    const input   = this.sliderInputs.get(controlKey);
    if (!control || !input) return;

    const range = control.max - control.min;
    const pct   = range <= 0 ? 0 : ((value - control.min) / range) * 100;
    input.style.setProperty('--vol-pct', `${Math.max(0, Math.min(100, pct))}%`);
  }

  /** Positionne les repères du neutre sur le rail (curseur vertical par rotation CSS) */
  updateNeutralRailMarks(controlKey: Key): void {
    const control = this.findControl(controlKey);
    const rail    = this.sliderRails.get(controlKey);
    const input   = this.sliderInputs.get(controlKey);
    if (!control || !rail || !input) return;

    const range    = control.max - control.min;
    const t        = range <= 0 ? 0.5 : (control.neutral - control.min) / range;
    const tClamped = Math.max(0, Math.min(1, t));

    const H = rail.clientHeight;
    const L = input.offsetWidth || parseFloat(getComputedStyle(input).width) || 210;
    if (H <= 0) {
      rail.style.setProperty('--neutral-from-top-pct', '50%');
      return;
    }

    const yTrackTop = (H - L) / 2;
    const yFromTop  = yTrackTop + (1 - tClamped) * L;
    const yInRail   = Math.max(0, Math.min(H, yFromTop));
    const pctTop    = (yInRail / H) * 100;
    rail.style.setProperty('--neutral-from-top-pct', `${pctTop}%`);
  }

  updateAllNeutralRailMarks(): void {
    this.controls.forEach(c => this.updateNeutralRailMarks(c.key));
  }

  updateControlState(controlKey: Key, value: number): void {
    const control = this.findControl(controlKey);
    const card    = this.controlCards.get(controlKey);
    const input   = this.sliderInputs.get(controlKey);
    if (!control || !card || !input) return;

    const isModified = isFxControlModified(control, value);
    card.classList.toggle('is-modified', isModified);
    input.classList.toggle('is-modified', isModified);

    const oneReset = card.querySelector<HTMLButtonElement>(`[${this.config.attributes.resetOne}]`);
    if (oneReset) {
      oneReset.disabled = !isModified;
      oneReset.classList.toggle('is-disabled', !isModified);
    }
  }

  // ================================================================
  // VALEURS
  // ================================================================

  findControl(controlKey: Key): FxControl<Key, Settings> | undefined {
    return this.controls.find(c => c.key === controlKey);
  }

  getControlValue(controlKey: Key): number | null {
    const input = this.sliderInputs.get(controlKey);
    return input ? parseFloat(input.value) : null;
  }

  /** Valeurs actuelles des curseurs (null si la popup n'est pas encore construite) */
  getCurrentValues(): FxCurrentValues<Key> {
    const values = {} as FxCurrentValues<Key>;
    this.controls.forEach(control => {
      values[control.key] = this.getControlValue(control.key);
    });
    return values;
  }

  setControlValue(controlKey: Key, value: number, apply = true): void {
    const control = this.findControl(controlKey);
    const input   = this.sliderInputs.get(controlKey);
    if (!control || !input) return;

    input.value = String(value);
    this.updateValueLabel(controlKey, value);
    this.updateSliderVisual(controlKey, value);
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

  refreshPresetButtons(): void {
    this.config.presets.forEach(preset => {
      const button = this.presetButtons.get(preset.key);
      if (!button) return;
      button.classList.toggle('is-active', preset.key === this.activePresetKey);
    });
  }

  /** Surbrillance déduite des curseurs : revient après changement d'onglet ou réouverture */
  refreshPresetHighlightFromControls(): void {
    this.activePresetKey = inferActiveFxPresetKey(this.controls, this.config.presets, this.getCurrentValues());
    this.refreshPresetButtons();
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
    this.refreshPresetButtons();
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
    this.refreshPresetButtons();
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
          const stepped = values[control.key];
          this.setControlValue(control.key, stepped, true);
          this.updateControlState(control.key, stepped);
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
    this.refreshPresetButtons();
    this.animateToValues(targetValues, 320, { inferPresetAtEnd: true });
  }
}
