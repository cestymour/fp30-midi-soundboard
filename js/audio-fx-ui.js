/* ================================================================
   audio-fx-ui.js - Popup FX audio grand format
   Depend de : audio.js (AudioEngineAPI), app.js (STATE)
================================================================ */

const AUDIO_FX_CONTROLS = [
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

const AUDIO_FX_PRESETS = [
  { key: 'reset', label: '🔄 Reset', values: null },
  { key: 'bass', label: '🔊 Bass', values: { bass: 15, mid: -10, treble: -15, lowPass: 9000 } },
  { key: 'mid', label: '🎚️ Mid', values: { bass: -15, mid: 10, treble: -12, lowPass: 20000, highPass: 0 } },
  { key: 'high', label: '✨ High', values: { bass: -15, mid: -10, treble: 15, highPass: 350, lowPass: 20000 } },
  { key: 'radio', label: '📻 Radio', values: { highPass: 2000, lowPass: 5000, bass: -15, treble: 8, reverb: 5 } },
  { key: 'telephone', label: '📞 Téléphone', values: { lowPass: 2800, highPass: 1000, bass: -15, treble: -12, mid: 2 } },
  { key: 'cave', label: '🕳️ Cave', values: { reverb: 88, delay: 55, lowPass: 4000, bass: 10, treble: -6, highPass: 0 } },
  { key: 'drown', label: '🌊 Sous l\'eau', values: { lowPass: 700, highPass: 200, reverb: 88, delay: 70, bass: 12, treble: -10 } },
  { key: 'rush', label: '⚡ Rush', values: { reverb: 25, treble: 8, highPass: 0, lowPass: 20000, delay: 18, bass: -2 } },
  { key: 'drag', label: '🐌 Lourd', values: { reverb: 75, lowPass: 5000, delay: 40, bass: 8, treble: -3, highPass: 0 } },
  { key: 'siren', label: '🚨 Sirène', values: { reverb: 0, delay: 100, highPass: 0, lowPass: 20000, bass: -2, treble: 2 } },
];

const AUDIO_FX_UI = {
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

function buildAudioFXPopup() {
  if (AUDIO_FX_UI.overlay) return;

  const overlay = document.createElement('div');
  overlay.id = 'audio-fx-overlay';
  overlay.setAttribute('aria-hidden', 'true');

  const presetButtonsHTML = AUDIO_FX_PRESETS.map(preset => `
    <button class="fx-preset-btn" type="button" data-preset="${preset.key}">${preset.label}</button>
  `).join('');

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
    <section class="fx-popup" role="dialog" aria-modal="true" aria-labelledby="audio-fx-title">
      <header class="fx-popup__header">
        <div class="fx-popup__titles">
          <div class="fx-popup__eyebrow">Sound Design</div>
          <h2 id="audio-fx-title">Effets en direct</h2>
        </div>
        <div class="fx-track">
          <span class="fx-track__label">Track</span>
          <strong class="fx-track__name">Aucune lecture</strong>
        </div>
        <button class="fx-top-btn is-close" id="audio-fx-close-btn" type="button" title="Fermer">
          <span class="fx-close-btn__x" aria-hidden="true">✕</span>
          <span class="fx-close-btn__label">Fermer</span>
        </button>
      </header>

      <div class="fx-presets">${presetButtonsHTML}</div>

      <div class="fx-popup__body">
        <div class="fx-grid">${controlsHTML}</div>
      </div>
    </section>
  `;

  document.getElementById('app').appendChild(overlay);

  AUDIO_FX_UI.overlay = overlay;
  AUDIO_FX_UI.trackEl = overlay.querySelector('.fx-track__name');

  // ── Fermeture ──
  overlay.querySelector('.fx-overlay__backdrop').addEventListener('click', closeAudioFXPopup);
  overlay.querySelector('#audio-fx-close-btn').addEventListener('click', closeAudioFXPopup);

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && STATE.audioFxPopupOpen) closeAudioFXPopup();
  });

  window.addEventListener('resize', () => {
    if (STATE.audioFxPopupOpen) updateAudioFXPopupLayout();
  });

  // ── Presets ──
  AUDIO_FX_PRESETS.forEach(preset => {
    const button = overlay.querySelector(`[data-preset="${preset.key}"]`);
    AUDIO_FX_UI.presetButtons.set(preset.key, button);
    button.addEventListener('click', () => applyAudioFXPreset(preset.key));
  });

  // ── Sliders ──
  AUDIO_FX_CONTROLS.forEach(control => {
    const input      = overlay.querySelector(`[data-slider-for="${control.key}"]`);
    const rail       = overlay.querySelector(`[data-rail-for="${control.key}"]`);
    const valueLabel = overlay.querySelector(`[data-value-for="${control.key}"]`);
    const card       = overlay.querySelector(`[data-control="${control.key}"]`);

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
      AUDIO_FX_UI.activePresetKey = null;
      refreshAudioFXPresetButtons();
      refreshAudioFXToolbarButtons();
    });

    const oneReset = card.querySelector(`[data-audio-fx-reset-one="${control.key}"]`);
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
    if (rail) AUDIO_FX_UI.railResizeObserver.observe(rail);
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

function updateAudioFXPopupLayout() {
  if (!AUDIO_FX_UI.overlay) return;

  const activePanel = document.querySelector('.panel.panel-audio.active');
  const grid = activePanel?.querySelector('.audio-grid');
  if (!grid) {
    closeAudioFXPopup();
    return;
  }

  const rect = grid.getBoundingClientRect();
  AUDIO_FX_UI.overlay.style.top    = `${rect.top}px`;
  AUDIO_FX_UI.overlay.style.left   = `${rect.left}px`;
  AUDIO_FX_UI.overlay.style.width  = `${rect.width}px`;
  AUDIO_FX_UI.overlay.style.height = `${rect.height}px`;

  requestAnimationFrame(() => {
    AUDIO_FX_CONTROLS.forEach(c => updateAudioFXNeutralRailMarks(c.key));
  });
}

// ================================================================
// OPEN / CLOSE
// ================================================================

function openAudioFXPopup() {
  if (!AUDIO_FX_UI.overlay) return;
  if (STATE.audioFxPopupOpen) {
    closeAudioFXPopup();
    return;
  }

  syncAudioFXPopupFromEngine();
  updateAudioFXPopupLayout();
  STATE.audioFxPopupOpen = true;
  AUDIO_FX_UI.overlay.classList.add('is-open');
  AUDIO_FX_UI.overlay.setAttribute('aria-hidden', 'false');
  refreshAudioFXToolbarButtons();

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      AUDIO_FX_CONTROLS.forEach(c => updateAudioFXNeutralRailMarks(c.key));
    });
  });
}

function closeAudioFXPopup() {
  if (!AUDIO_FX_UI.overlay) return;
  STATE.audioFxPopupOpen = false;
  AUDIO_FX_UI.overlay.classList.remove('is-open');
  AUDIO_FX_UI.overlay.setAttribute('aria-hidden', 'true');
  refreshAudioFXToolbarButtons();
}

// ================================================================
// SYNC
// ================================================================

function syncAudioFXPopupFromEngine() {
  if (!AUDIO_FX_UI.overlay) return;

  const settings = AudioEngineAPI.getCurrentSettings();
  AUDIO_FX_CONTROLS.forEach(control => {
    const value = control.read(settings);
    const input = AUDIO_FX_UI.sliderInputs.get(control.key);
    if (!input) return;
    input.value = value;
    updateAudioFXValueLabel(control.key, value);
    updateAudioFXSliderVisual(control.key, value);
    updateAudioFXNeutralRailMarks(control.key);
    updateAudioFXControlState(control.key, value);
  });

  if (settings.lowPassFrequency > 20000) {
    setAudioFXControlValue('lowPass', 20000, true);
  }

  AUDIO_FX_UI.trackEl.textContent = STATE.currentSoundBtn?.title || 'Aucune lecture';

  AUDIO_FX_UI.activePresetKey = null;
  refreshAudioFXPresetButtons();
  refreshAudioFXToolbarButtons();
}

// ================================================================
// HELPERS UI
// ================================================================

function updateAudioFXValueLabel(controlKey, value) {
  const control = AUDIO_FX_CONTROLS.find(c => c.key === controlKey);
  const label   = AUDIO_FX_UI.valueLabels.get(controlKey);
  if (!control || !label) return;
  label.textContent = control.formatValue(value);
}

function updateAudioFXSliderVisual(controlKey, value) {
  const control = AUDIO_FX_CONTROLS.find(c => c.key === controlKey);
  const input   = AUDIO_FX_UI.sliderInputs.get(controlKey);
  if (!control || !input) return;

  const range = control.max - control.min;
  const pct   = range <= 0 ? 0 : ((value - control.min) / range) * 100;
  input.style.setProperty('--vol-pct', `${Math.max(0, Math.min(100, pct))}%`);
}

function updateAudioFXNeutralRailMarks(controlKey) {
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

function updateAudioFXControlState(controlKey, value) {
  const control = AUDIO_FX_CONTROLS.find(c => c.key === controlKey);
  const card    = AUDIO_FX_UI.controlCards.get(controlKey);
  const input   = AUDIO_FX_UI.sliderInputs.get(controlKey);
  if (!control || !card || !input) return;

  const isModified = Math.abs(value - control.neutral) > 0.0001;
  card.classList.toggle('is-modified', isModified);
  input.classList.toggle('is-modified', isModified);

  const oneReset = card.querySelector('[data-audio-fx-reset-one]');
  if (oneReset) {
    oneReset.disabled = !isModified;
    oneReset.classList.toggle('is-disabled', !isModified);
  }
}

// ================================================================
// VALEURS
// ================================================================

function getAudioFXControlValue(controlKey) {
  const input = AUDIO_FX_UI.sliderInputs.get(controlKey);
  return input ? parseFloat(input.value) : null;
}

function isAudioFXControlNeutral(controlKey) {
  const control = AUDIO_FX_CONTROLS.find(c => c.key === controlKey);
  const value   = getAudioFXControlValue(controlKey);
  if (!control || value === null) return true;
  return Math.abs(value - control.neutral) < 0.0001;
}

function setAudioFXControlValue(controlKey, value, apply = true) {
  const control = AUDIO_FX_CONTROLS.find(c => c.key === controlKey);
  const input   = AUDIO_FX_UI.sliderInputs.get(controlKey);
  if (!control || !input) return;

  input.value = value;
  updateAudioFXValueLabel(controlKey, value);
  updateAudioFXSliderVisual(controlKey, value);
  updateAudioFXNeutralRailMarks(controlKey);
  if (apply) {
    control.apply(parseFloat(value));
  }
}

// ================================================================
// PRESETS
// ================================================================

function refreshAudioFXPresetButtons() {
  AUDIO_FX_PRESETS.forEach(preset => {
    const button = AUDIO_FX_UI.presetButtons.get(preset.key);
    if (!button) return;
    button.classList.toggle('is-active', preset.key === AUDIO_FX_UI.activePresetKey);
  });
}

function clampAudioFXValue(control, value) {
  const clamped = Math.max(control.min, Math.min(control.max, value));
  const step    = Number(control.step) || 1;
  const stepped = Math.round((clamped - control.min) / step) * step + control.min;
  return Math.max(control.min, Math.min(control.max, stepped));
}

function buildPresetTargetValues(preset) {
  const targetValues = {};
  const values = preset.values == null ? {} : preset.values;
  AUDIO_FX_CONTROLS.forEach(control => {
    const rawValue = Object.prototype.hasOwnProperty.call(values, control.key)
      ? values[control.key]
      : control.neutral;
    targetValues[control.key] = clampAudioFXValue(control, rawValue);
  });
  return targetValues;
}

function applyAudioFXPreset(presetKey) {
  if (presetKey === 'reset') {
    resetAudioFXEffects();
    return;
  }

  const preset = AUDIO_FX_PRESETS.find(p => p.key === presetKey);
  if (!preset) return;
  const targetValues = buildPresetTargetValues(preset);
  AUDIO_FX_UI.activePresetKey = presetKey;
  refreshAudioFXPresetButtons();
  animateAudioFXToValues(targetValues, 320);
}

// ================================================================
// ANIMATION
// ================================================================

function animateAudioFXControlToNeutral(controlKey) {
  const control = AUDIO_FX_CONTROLS.find(c => c.key === controlKey);
  if (!control || isAudioFXControlNeutral(controlKey)) return;

  const targetValues = {};
  AUDIO_FX_CONTROLS.forEach(c => {
    const v = getAudioFXControlValue(c.key);
    targetValues[c.key] = v === null || Number.isNaN(v) ? c.neutral : v;
  });
  targetValues[controlKey] = clampAudioFXValue(control, control.neutral);

  AUDIO_FX_UI.activePresetKey = null;
  refreshAudioFXPresetButtons();
  animateAudioFXToValues(targetValues, 320);
}

function animateAudioFXToValues(targetValues, durationMs = 300) {
  if (AUDIO_FX_UI.presetAnimationFrame) {
    cancelAnimationFrame(AUDIO_FX_UI.presetAnimationFrame);
    AUDIO_FX_UI.presetAnimationFrame = null;
  }

  const startValues = {};
  AUDIO_FX_CONTROLS.forEach(control => {
    startValues[control.key] = getAudioFXControlValue(control.key);
  });

  const startTime = performance.now();

  const animate = now => {
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
    refreshAudioFXToolbarButtons();
  };

  AUDIO_FX_UI.presetAnimationFrame = requestAnimationFrame(animate);
}

// ================================================================
// RESET
// ================================================================

function isAudioFXAnyControlModified() {
  return AUDIO_FX_CONTROLS.some(control => !isAudioFXControlNeutral(control.key));
}

function resetAudioFXEffects() {
  if (typeof AudioEngineAPI === 'undefined') return;
  AudioEngineAPI.resetEffects();
  syncAudioFXPopupFromEngine();
  AUDIO_FX_UI.activePresetKey = 'reset';
  refreshAudioFXPresetButtons();
  refreshAudioFXToolbarButtons();
}

// ================================================================
// TOOLBAR BUTTONS
// ================================================================

function refreshAudioFXToolbarButtons() {
  const hasEffects = isAudioFXAnyControlModified() ||
    (typeof AudioEngineAPI !== 'undefined' && AudioEngineAPI.hasActiveEffects());

  document.querySelectorAll('.audio-fx-reset-btn').forEach(button => {
    button.classList.toggle('is-active', hasEffects);
  });

  document.querySelectorAll('.audio-fx-open-btn').forEach(button => {
    button.classList.toggle('is-active', STATE.audioFxPopupOpen);
  });
}