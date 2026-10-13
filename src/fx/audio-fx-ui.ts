/* ================================================================
   audio-fx-ui.ts - Popup FX audio grand format
================================================================ */

import type { AudioFxKey, FxControl, FxPreset } from '../types.ts';
import type { AudioEngineState } from '../audio/audio.ts';
import { STATE } from '../state.ts';
import { AUDIO_FX_PRESETS } from '../config/audio-fx.config.ts';
import { AudioEngineAPI } from '../audio/audio.ts';
import { isMidiFXAnyControlModified } from './midi-fx-ui.ts';

type AudioFxControl = FxControl<AudioFxKey, AudioEngineState>;

const AUDIO_FX_CONTROLS: AudioFxControl[] = [
  {
    key: 'bass',
    label: 'BASS',
    shortLabel: 'Bass',
    group: 'eq',
    min: -15,
    max: 15,
    step: 1,
    neutral: 0,
    read: settings => settings.bassGain,
    apply: value => AudioEngineAPI.setBassGain(value),
    formatValue: value => `${value > 0 ? '+' : ''}${Math.round(value)} dB`,
  },
  {
    key: 'mid',
    label: 'MID',
    shortLabel: 'Mid',
    group: 'eq',
    min: -15,
    max: 15,
    step: 1,
    neutral: 0,
    read: settings => settings.midGain,
    apply: value => AudioEngineAPI.setMidGain(value),
    formatValue: value => `${value > 0 ? '+' : ''}${Math.round(value)} dB`,
  },
  {
    key: 'treble',
    label: 'HIGH',
    shortLabel: 'Treble',
    group: 'eq',
    min: -15,
    max: 15,
    step: 1,
    neutral: 0,
    read: settings => settings.trebleGain,
    apply: value => AudioEngineAPI.setTrebleGain(value),
    formatValue: value => `${value > 0 ? '+' : ''}${Math.round(value)} dB`,
  },
  {
    key: 'lowPass',
    label: 'LPF',
    shortLabel: 'Low-pass',
    group: 'filters',
    min: 400,
    max: 20000,
    step: 100,
    neutral: 20000,
    // Anciennes versions utilisaient 22050 Hz (affichage 22,1 kHz) : on normalise pour coller au neutre UI
    read: settings => Math.min(20000, settings.lowPassFrequency),
    apply: value => AudioEngineAPI.setLowPassFrequency(value),
    formatValue: value => value >= 1000 ? `${(value / 1000).toFixed(1)} kHz` : `${Math.round(value)} Hz`,
  },
  {
    key: 'highPass',
    label: 'HPF',
    shortLabel: 'High-pass',
    group: 'filters',
    min: 0,
    max: 5000,
    step: 10,
    neutral: 0,
    read: settings => settings.highPassFrequency,
    apply: value => AudioEngineAPI.setHighPassFrequency(value),
    formatValue: value => {
      if (value <= 0) return '0 Hz';
      return value >= 1000 ? `${(value / 1000).toFixed(1)} kHz` : `${Math.round(value)} Hz`;
    },
  },
  {
    key: 'reverb',
    label: 'REV',
    shortLabel: 'Reverb',
    group: 'reverb',
    min: 0,
    max: 100,
    step: 1,
    neutral: 0,
    read: settings => Math.round(settings.reverbMix * 100),
    apply: value => AudioEngineAPI.setReverbMix(value / 100),
    formatValue: value => `${Math.round(value)}%`,
  },
  {
    key: 'delay',
    label: 'DLY',
    shortLabel: 'Delay',
    group: 'delay',
    min: 0,
    max: 100,
    step: 1,
    neutral: 0,
    read: settings => Math.round(settings.delayMix * 100),
    apply: value => {
      const mix = value / 100;
      AudioEngineAPI.setDelay({
        mix,
        time: mix > 0 ? 0.28 : 0.25,
        feedback: mix > 0 ? 0.35 : 0.25,
      });
    },
    formatValue: value => `${Math.round(value)}%`,
  },
  {
    key: 'speed',
    label: 'SPD',
    shortLabel: 'Speed',
    group: 'speed',
    min: 50,
    max: 200,
    step: 5,
    neutral: 100,
    read: settings => Math.round(settings.playbackRate * 100),
    apply: value => AudioEngineAPI.setPlaybackRate(value / 100),
    formatValue: value => `${(value / 100).toFixed(2)}x`,
  },
];


interface AudioFxPopupUI {
  overlay:              HTMLDivElement | null;
  trackEl:              Element | null;
  presetButtons:        Map<string, HTMLButtonElement>;
  sliderInputs:         Map<AudioFxKey, HTMLInputElement>;
  sliderRails:          Map<AudioFxKey, HTMLElement>;
  valueLabels:          Map<AudioFxKey, HTMLElement>;
  controlCards:         Map<AudioFxKey, HTMLElement>;
  activePresetKey:      string | null;
  presetAnimationFrame: number | null;
  railResizeObserver:   ResizeObserver | null;
}

const AUDIO_FX_UI: AudioFxPopupUI = {
  overlay:              null,
  trackEl:              null,
  presetButtons:        new Map(),
  sliderInputs:         new Map(),
  sliderRails:          new Map(),
  valueLabels:          new Map(),
  controlCards:         new Map(),
  activePresetKey:      null,
  presetAnimationFrame: null,
  railResizeObserver:   null,
};

// ================================================================
// BUILD
// ================================================================

export function buildAudioFXPopup(): void {
  if (AUDIO_FX_UI.overlay) return;

  const overlay = document.createElement('div');
  overlay.id = 'audio-fx-overlay';
  overlay.setAttribute('aria-hidden', 'true');

  const presetButtonsHTML = AUDIO_FX_PRESETS.map(preset => {
    const resetCls = preset.key === 'reset' ? ' fx-preset-btn--reset' : '';
    const iconHtml = preset.icon
      ? `<span class="fx-preset-btn__icon" aria-hidden="true">${preset.icon}</span>`
      : '';
    return `
    <button class="fx-preset-btn${resetCls}" type="button" data-preset="${preset.key}">${iconHtml}<span class="fx-preset-btn__text">${preset.text}</span></button>
  `;
  }).join('');

  const controlsHTML = AUDIO_FX_CONTROLS.map(control => `
    <div class="fx-control" data-control="${control.key}">
      <div class="fx-control__head">
        <span class="fx-control__tag">${control.label}</span>
        <span class="fx-control__value" data-value-for="${control.key}">--</span>
      </div>
      <div class="fx-slider-wrap">
        <div class="fx-slider-rail" data-rail-for="${control.key}">
          <span class="fx-neutral-tick fx-neutral-tick--left"  aria-hidden="true"></span>
          <span class="fx-neutral-tick fx-neutral-tick--right" aria-hidden="true"></span>
          <input
            class="vol-slider fx-slider"
            data-slider-for="${control.key}"
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
          data-audio-fx-reset-one="${control.key}"
          title="Valeur par défaut (${control.shortLabel})"
          aria-label="Remettre ${control.shortLabel} à la valeur par défaut"
        >↺</button>
      </div>
    </div>
  `).join('');

  overlay.innerHTML = `
    <div class="fx-overlay__backdrop"></div>
    <section class="fx-popup" role="dialog" aria-modal="true" aria-label="Effets audio">
      <header class="fx-popup__header">
        <!-- Piste / morceau : réactiver si besoin (voir syncAudioFXPopupFromEngine + .fx-track dans style.fx.css)
        <div class="fx-track">
          <span class="fx-track__label">Track</span>
          <strong class="fx-track__name">Aucune lecture</strong>
        </div>
        -->
        <div class="fx-presets">${presetButtonsHTML}</div>
      </header>

      <div class="fx-popup__body">
        <div class="fx-grid">${controlsHTML}</div>
      </div>
    </section>
  `;

  document.getElementById('app')!.appendChild(overlay);

  AUDIO_FX_UI.overlay = overlay;
  AUDIO_FX_UI.trackEl = overlay.querySelector('.fx-track__name');

  // ── Fermeture ──
  overlay.querySelector('.fx-overlay__backdrop')!.addEventListener('click', closeAudioFXPopup);
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && STATE.audioFxPopupOpen) closeAudioFXPopup();
  });

  window.addEventListener('resize', () => {
    if (STATE.audioFxPopupOpen) updateAudioFXPopupLayout();
  });

  // ── Presets ──
  AUDIO_FX_PRESETS.forEach(preset => {
    const button = overlay.querySelector<HTMLButtonElement>(`[data-preset="${preset.key}"]`)!;
    AUDIO_FX_UI.presetButtons.set(preset.key, button);
    button.addEventListener('click', () => applyAudioFXPreset(preset.key));
  });

  // ── Sliders ──
  AUDIO_FX_CONTROLS.forEach(control => {
    const input      = overlay.querySelector<HTMLInputElement>(`[data-slider-for="${control.key}"]`)!;
    const rail       = overlay.querySelector<HTMLElement>(`[data-rail-for="${control.key}"]`)!;
    const valueLabel = overlay.querySelector<HTMLElement>(`[data-value-for="${control.key}"]`)!;
    const card       = overlay.querySelector<HTMLElement>(`[data-control="${control.key}"]`)!;

    AUDIO_FX_UI.sliderInputs.set(control.key, input);
    AUDIO_FX_UI.sliderRails.set(control.key, rail);
    AUDIO_FX_UI.valueLabels.set(control.key, valueLabel);
    AUDIO_FX_UI.controlCards.set(control.key, card);

    input.addEventListener('input', () => {
      const value = parseFloat(input.value);
      control.apply(value);
      updateAudioFXValueLabel(control.key, value);
      updateAudioFXSliderVisual(control.key, value);
      updateAudioFXNeutralRailMarks(control.key);
      updateAudioFXControlState(control.key, value);
      refreshAudioFXPresetHighlightFromControls();
      refreshAudioFXToolbarButtons();
    });

    const oneReset = card.querySelector<HTMLButtonElement>(`[data-audio-fx-reset-one="${control.key}"]`);
    if (oneReset) {
      oneReset.addEventListener('click', event => {
        event.preventDefault();
        event.stopPropagation();
        animateAudioFXControlToNeutral(control.key);
      });
    }
  });

  // ── ResizeObserver pour les rails ──
  if (!AUDIO_FX_UI.railResizeObserver) {
    AUDIO_FX_UI.railResizeObserver = new ResizeObserver(() => {
      if (!AUDIO_FX_UI.overlay) return;
      AUDIO_FX_CONTROLS.forEach(c => updateAudioFXNeutralRailMarks(c.key));
    });
  }
  AUDIO_FX_UI.sliderRails.forEach(rail => {
    if (rail) AUDIO_FX_UI.railResizeObserver!.observe(rail);
  });

  syncAudioFXPopupFromEngine();
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      AUDIO_FX_CONTROLS.forEach(c => updateAudioFXNeutralRailMarks(c.key));
    });
  });
}

// ================================================================
// LAYOUT
// ================================================================

function updateAudioFXPopupLayout(): void {
  if (!AUDIO_FX_UI.overlay) return;

  const activePanel = document.querySelector<HTMLElement>('.panel.panel-audio.active');
  const grid = activePanel?.querySelector('.audio-grid');
  if (!grid) {
    closeAudioFXPopup();
    return;
  }

  const rect = grid.getBoundingClientRect();
  const overlay = AUDIO_FX_UI.overlay;
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

  requestAnimationFrame(() => {
    AUDIO_FX_CONTROLS.forEach(c => updateAudioFXNeutralRailMarks(c.key));
  });
}

// ================================================================
// OPEN / CLOSE
// ================================================================

export function openAudioFXPopup(): void {
  if (!AUDIO_FX_UI.overlay) return;
  if (STATE.audioFxPopupOpen) {
    closeAudioFXPopup();
    return;
  }

  syncAudioFXPopupFromEngine();
  updateAudioFXPopupLayout();
  STATE.audioFxPopupOpen = true;
  AUDIO_FX_UI.overlay!.classList.add('is-open');
  AUDIO_FX_UI.overlay!.setAttribute('aria-hidden', 'false');
  refreshAudioFXToolbarButtons();

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      AUDIO_FX_CONTROLS.forEach(c => updateAudioFXNeutralRailMarks(c.key));
    });
  });
}

export function closeAudioFXPopup(): void {
  if (!AUDIO_FX_UI.overlay) return;
  STATE.audioFxPopupOpen = false;
  AUDIO_FX_UI.overlay.classList.remove('is-open');
  AUDIO_FX_UI.overlay.setAttribute('aria-hidden', 'true');
  refreshAudioFXToolbarButtons();
}

// ================================================================
// SYNC
// ================================================================

export function syncAudioFXPopupFromEngine(): void {
  if (!AUDIO_FX_UI.overlay) return;

  const settings = AudioEngineAPI.getCurrentSettings();
  AUDIO_FX_CONTROLS.forEach(control => {
    const value = control.read(settings);
    const input = AUDIO_FX_UI.sliderInputs.get(control.key);
    if (!input) return;
    input.value = String(value);
    updateAudioFXValueLabel(control.key, value);
    updateAudioFXSliderVisual(control.key, value);
    updateAudioFXNeutralRailMarks(control.key);
    updateAudioFXControlState(control.key, value);
  });

  if (settings.lowPassFrequency > 20000) {
    setAudioFXControlValue('lowPass', 20000, true);
  }

  if (AUDIO_FX_UI.trackEl) {
    AUDIO_FX_UI.trackEl.textContent = STATE.currentSoundBtn?.title || 'Aucune lecture';
  }

  refreshAudioFXPresetHighlightFromControls();
  refreshAudioFXToolbarButtons();
}

// ================================================================
// HELPERS UI
// ================================================================

function updateAudioFXValueLabel(controlKey: AudioFxKey, value: number): void {
  const control = AUDIO_FX_CONTROLS.find(c => c.key === controlKey);
  const label   = AUDIO_FX_UI.valueLabels.get(controlKey);
  if (!control || !label) return;
  label.textContent = String(control.formatValue(value));
}

function updateAudioFXSliderVisual(controlKey: AudioFxKey, value: number): void {
  const control = AUDIO_FX_CONTROLS.find(c => c.key === controlKey);
  const input   = AUDIO_FX_UI.sliderInputs.get(controlKey);
  if (!control || !input) return;

  const range = control.max - control.min;
  const pct   = range <= 0 ? 0 : ((value - control.min) / range) * 100;
  input.style.setProperty('--vol-pct', `${Math.max(0, Math.min(100, pct))}%`);
}

function updateAudioFXNeutralRailMarks(controlKey: AudioFxKey): void {
  const control = AUDIO_FX_CONTROLS.find(c => c.key === controlKey);
  const rail    = AUDIO_FX_UI.sliderRails.get(controlKey);
  const input   = AUDIO_FX_UI.sliderInputs.get(controlKey);
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

function updateAudioFXControlState(controlKey: AudioFxKey, value: number): void {
  const control = AUDIO_FX_CONTROLS.find(c => c.key === controlKey);
  const card    = AUDIO_FX_UI.controlCards.get(controlKey);
  const input   = AUDIO_FX_UI.sliderInputs.get(controlKey);
  if (!control || !card || !input) return;

  const isModified = Math.abs(value - control.neutral) > 0.0001;
  card.classList.toggle('is-modified', isModified);
  input.classList.toggle('is-modified', isModified);

  const oneReset = card.querySelector<HTMLButtonElement>('[data-audio-fx-reset-one]');
  if (oneReset) {
    oneReset.disabled = !isModified;
    oneReset.classList.toggle('is-disabled', !isModified);
  }
}

// ================================================================
// VALEURS
// ================================================================

function getAudioFXControlValue(controlKey: AudioFxKey): number | null {
  const input = AUDIO_FX_UI.sliderInputs.get(controlKey);
  return input ? parseFloat(input.value) : null;
}

function isAudioFXControlNeutral(controlKey: AudioFxKey): boolean {
  const control = AUDIO_FX_CONTROLS.find(c => c.key === controlKey);
  const value   = getAudioFXControlValue(controlKey);
  if (!control || value === null) return true;
  return Math.abs(value - control.neutral) < 0.0001;
}

function setAudioFXControlValue(controlKey: AudioFxKey, value: number, apply = true): void {
  const control = AUDIO_FX_CONTROLS.find(c => c.key === controlKey);
  const input   = AUDIO_FX_UI.sliderInputs.get(controlKey);
  if (!control || !input) return;

  input.value = String(value);
  updateAudioFXValueLabel(controlKey, value);
  updateAudioFXSliderVisual(controlKey, value);
  updateAudioFXNeutralRailMarks(controlKey);
  if (apply) {
    control.apply(value);
  }
}

// ================================================================
// PRESETS
// ================================================================

function refreshAudioFXPresetButtons(): void {
  AUDIO_FX_PRESETS.forEach(preset => {
    const button = AUDIO_FX_UI.presetButtons.get(preset.key);
    if (!button) return;
    button.classList.toggle('is-active', preset.key === AUDIO_FX_UI.activePresetKey);
  });
}

function audioFxTargetsMatchCurrent(targetValues: Record<AudioFxKey, number>): boolean {
  for (const c of AUDIO_FX_CONTROLS) {
    const cur = getAudioFXControlValue(c.key);
    const tgt = targetValues[c.key];
    if (cur === null || Number.isNaN(cur)) return false;
    if (Math.abs(clampAudioFXValue(c, cur) - tgt) > 1e-5) return false;
  }
  return true;
}

function inferActiveAudioFxPresetKey(): string | null {
  for (let i = 0; i < AUDIO_FX_PRESETS.length; i++) {
    const preset = AUDIO_FX_PRESETS[i];
    const targetValues = buildPresetTargetValues(preset);
    if (audioFxTargetsMatchCurrent(targetValues)) return preset.key;
  }
  return null;
}

function refreshAudioFXPresetHighlightFromControls(): void {
  AUDIO_FX_UI.activePresetKey = inferActiveAudioFxPresetKey();
  refreshAudioFXPresetButtons();
}

function clampAudioFXValue(control: AudioFxControl, value: number): number {
  const clamped = Math.max(control.min, Math.min(control.max, value));
  const step    = Number(control.step) || 1;
  const stepped = Math.round((clamped - control.min) / step) * step + control.min;
  return Math.max(control.min, Math.min(control.max, stepped));
}

function buildPresetTargetValues(preset: Pick<FxPreset<AudioFxKey>, 'values'>): Record<AudioFxKey, number> {
  const targetValues = {} as Record<AudioFxKey, number>;
  const values: Partial<Record<AudioFxKey, number>> = preset.values == null ? {} : preset.values;
  AUDIO_FX_CONTROLS.forEach(control => {
    const rawValue = Object.prototype.hasOwnProperty.call(values, control.key)
      ? values[control.key]!
      : control.neutral;
    targetValues[control.key] = clampAudioFXValue(control, rawValue);
  });
  return targetValues;
}

function applyAudioFXPreset(presetKey: string): void {
  if (presetKey === 'reset') {
    resetAudioFXEffects();
    return;
  }

  const preset = AUDIO_FX_PRESETS.find(p => p.key === presetKey);
  if (!preset) return;
  const targetValues = buildPresetTargetValues(preset);
  AUDIO_FX_UI.activePresetKey = presetKey;
  refreshAudioFXPresetButtons();
  animateAudioFXToValues(targetValues, 320, { inferPresetAtEnd: true });
}

// ================================================================
// ANIMATION
// ================================================================

function animateAudioFXControlToNeutral(controlKey: AudioFxKey): void {
  const control = AUDIO_FX_CONTROLS.find(c => c.key === controlKey);
  if (!control || isAudioFXControlNeutral(controlKey)) return;

  const targetValues = {} as Record<AudioFxKey, number>;
  AUDIO_FX_CONTROLS.forEach(c => {
    const v = getAudioFXControlValue(c.key);
    targetValues[c.key] = v === null || Number.isNaN(v) ? c.neutral : v;
  });
  targetValues[controlKey] = clampAudioFXValue(control, control.neutral);

  AUDIO_FX_UI.activePresetKey = null;
  refreshAudioFXPresetButtons();
  animateAudioFXToValues(targetValues, 320, { inferPresetAtEnd: true });
}

function animateAudioFXToValues(
  targetValues: Record<AudioFxKey, number>, durationMs = 300, options: { inferPresetAtEnd?: boolean } = {},
): void {
  const { inferPresetAtEnd = false } = options;

  if (AUDIO_FX_UI.presetAnimationFrame) {
    cancelAnimationFrame(AUDIO_FX_UI.presetAnimationFrame);
    AUDIO_FX_UI.presetAnimationFrame = null;
  }

  const startValues = {} as Record<AudioFxKey, number | null>;
  AUDIO_FX_CONTROLS.forEach(control => {
    startValues[control.key] = getAudioFXControlValue(control.key);
  });

  const startTime = performance.now();

  const animate = (now: number) => {
    const elapsed = now - startTime;
    const t       = Math.min(1, elapsed / durationMs);
    const eased   = 1 - Math.pow(1 - t, 3);

    AUDIO_FX_CONTROLS.forEach(control => {
      const start        = startValues[control.key] ?? control.neutral;
      const end          = targetValues[control.key];
      const interpolated = start + (end - start) * eased;
      const stepped      = clampAudioFXValue(control, interpolated);
      setAudioFXControlValue(control.key, stepped, true);
      updateAudioFXControlState(control.key, stepped);
    });

    if (t < 1) {
      AUDIO_FX_UI.presetAnimationFrame = requestAnimationFrame(animate);
      return;
    }

    AUDIO_FX_UI.presetAnimationFrame = null;
    if (inferPresetAtEnd) refreshAudioFXPresetHighlightFromControls();
    refreshAudioFXToolbarButtons();
  };

  AUDIO_FX_UI.presetAnimationFrame = requestAnimationFrame(animate);
}

// ================================================================
// RESET
// ================================================================

export function isAudioFXAnyControlModified(): boolean {
  return AUDIO_FX_CONTROLS.some(control => !isAudioFXControlNeutral(control.key));
}

export function resetAudioFXEffects(): void {
  const targetValues = buildPresetTargetValues({ values: {} });
  AUDIO_FX_UI.activePresetKey = 'reset';
  refreshAudioFXPresetButtons();
  animateAudioFXToValues(targetValues, 320, { inferPresetAtEnd: true });
}

// ================================================================
// TOOLBAR BUTTONS
// ================================================================

export function refreshAudioFXToolbarButtons(): void {
  const hasAudio = isAudioFXAnyControlModified() || AudioEngineAPI.hasActiveEffects();
  const hasMidi = isMidiFXAnyControlModified();
  const anyFx = hasAudio || hasMidi;

  document.querySelectorAll('.audio-fx-reset-btn').forEach(button => {
    button.classList.toggle('is-active', anyFx);
  });

  document.querySelectorAll('.audio-fx-open-btn').forEach(button => {
    button.classList.toggle('is-active', STATE.audioFxPopupOpen);
  });

  document.querySelectorAll('.midi-fx-reset-btn').forEach(button => {
    button.classList.toggle('is-active', anyFx);
  });
}