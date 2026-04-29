/* ================================================================
   midi-fx-ui.js - Popup FX piano grand format
   Dépend de : midi.js (sendMidi), app.js (STATE)
   Envoie des CC MIDI standard au Roland FP-30X via sendMidi()
================================================================ */

const MIDI_FX_CONTROLS = [
  {
    key: 'reverb',
    label: 'REV',
    shortLabel: 'Reverb',
    group: 'reverb',
    min: 0,
    max: 127,
    step: 1,
    neutral: 0,
    read: settings => settings.reverb,
    apply: value => sendMidi([0xB0 | STATE.MIDI_CHANNEL, 91, Math.round(value)]),
    formatValue: value => Math.round(value),
  },
  {
    key: 'chorus',
    label: 'CHO',
    shortLabel: 'Chorus',
    group: 'chorus',
    min: 0,
    max: 127,
    step: 1,
    neutral: 0,
    read: settings => settings.chorus,
    apply: value => sendMidi([0xB0 | STATE.MIDI_CHANNEL, 93, Math.round(value)]),
    formatValue: value => Math.round(value),
  },
  {
    key: 'cutoff',
    label: 'CUT',
    shortLabel: 'Cutoff',
    group: 'filter',
    min: 0,
    max: 127,
    step: 1,
    neutral: 64,
    read: settings => settings.cutoff,
    apply: value => sendMidi([0xB0 | STATE.MIDI_CHANNEL, 74, Math.round(value)]),
    formatValue: value => Math.round(value),
  },
  {
    key: 'resonance',
    label: 'RES',
    shortLabel: 'Resonance',
    group: 'filter',
    min: 0,
    max: 127,
    step: 1,
    neutral: 64,
    read: settings => settings.resonance,
    apply: value => sendMidi([0xB0 | STATE.MIDI_CHANNEL, 71, Math.round(value)]),
    formatValue: value => Math.round(value),
  },
  {
    key: 'attack',
    label: 'ATK',
    shortLabel: 'Attack',
    group: 'envelope',
    min: 0,
    max: 127,
    step: 1,
    neutral: 64,
    read: settings => settings.attack,
    apply: value => sendMidi([0xB0 | STATE.MIDI_CHANNEL, 73, Math.round(value)]),
    formatValue: value => Math.round(value),
  },
  {
    key: 'release',
    label: 'REL',
    shortLabel: 'Release',
    group: 'envelope',
    min: 0,
    max: 127,
    step: 1,
    neutral: 64,
    read: settings => settings.release,
    apply: value => sendMidi([0xB0 | STATE.MIDI_CHANNEL, 72, Math.round(value)]),
    formatValue: value => Math.round(value),
  },
  {
    key: 'decay',
    label: 'DEC',
    shortLabel: 'Decay',
    group: 'envelope',
    min: 0,
    max: 127,
    step: 1,
    neutral: 64,
    read: settings => settings.decay,
    apply: value => sendMidi([0xB0 | STATE.MIDI_CHANNEL, 75, Math.round(value)]),
    formatValue: value => Math.round(value),
  },
];


// ─── État interne de la popup piano ───────────────────────────────
const MIDI_FX_UI = {
  overlay:              null,
  channelEl:            null,
  presetButtons:        new Map(),
  sliderInputs:         new Map(),
  sliderRails:          new Map(),
  valueLabels:          new Map(),
  controlCards:         new Map(),
  activePresetKey:      null,
  presetAnimationFrame: null,
  railResizeObserver:   null,
};

// ─── État courant des CC piano (source de vérité côté JS) ─────────
const MIDI_FX_STATE = {
  reverb:    0,
  chorus:    0,
  cutoff:    64,
  resonance: 64,
  attack:    64,
  release:   64,
  decay:     64,
};

// ================================================================
// BUILD
// ================================================================

function buildMidiFXPopup() {
  if (MIDI_FX_UI.overlay) return;

  const overlay = document.createElement('div');
  overlay.id = 'midi-fx-overlay';
  overlay.setAttribute('aria-hidden', 'true');

  const presetButtonsHTML = MIDI_FX_PRESETS.map(preset => {
    const resetCls = preset.key === 'reset' ? ' fx-preset-btn--reset' : '';
    const iconHtml = preset.icon
      ? `<span class="fx-preset-btn__icon" aria-hidden="true">${preset.icon}</span>`
      : '';
    return `
    <button class="fx-preset-btn${resetCls}" type="button" data-midi-preset="${preset.key}">${iconHtml}<span class="fx-preset-btn__text">${preset.text}</span></button>
  `;
  }).join('');

  const controlsHTML = MIDI_FX_CONTROLS.map(control => `
    <div class="fx-control" data-midi-control="${control.key}">
      <div class="fx-control__head">
        <span class="fx-control__tag">${control.label}</span>
        <span class="fx-control__value" data-midi-value-for="${control.key}">--</span>
      </div>
      <div class="fx-slider-wrap">
        <div class="fx-slider-rail" data-midi-rail-for="${control.key}">
          <span class="fx-neutral-tick fx-neutral-tick--left"  aria-hidden="true"></span>
          <span class="fx-neutral-tick fx-neutral-tick--right" aria-hidden="true"></span>
          <input
            class="vol-slider fx-slider"
            data-midi-slider-for="${control.key}"
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
          data-midi-fx-reset-one="${control.key}"
          title="Valeur par défaut (${control.shortLabel})"
          aria-label="Remettre ${control.shortLabel} à la valeur par défaut"
        >↺</button>
      </div>
    </div>
  `).join('');

  overlay.innerHTML = `
    <div class="fx-overlay__backdrop"></div>
    <section class="fx-popup" role="dialog" aria-modal="true" aria-label="Effets piano MIDI">
      <header class="fx-popup__header">
        <!-- Canal / contexte : réactiver si besoin (voir syncMidiFXPopupFromState + .fx-track dans style.fx.css)
        <div class="fx-track">
          <span class="fx-track__label">CC → Roland FP-30X</span>
          <strong class="fx-track__name">Canal ${STATE.MIDI_CHANNEL + 1}</strong>
        </div>
        -->
        <div class="fx-presets">${presetButtonsHTML}</div>
      </header>

      <div class="fx-popup__body">
        <div class="fx-grid">${controlsHTML}</div>
      </div>
    </section>
  `;

  document.getElementById('app').appendChild(overlay);
  MIDI_FX_UI.overlay   = overlay;
  MIDI_FX_UI.channelEl = overlay.querySelector('.fx-track__name');

  // ── Fermeture ──
  overlay.querySelector('.fx-overlay__backdrop').addEventListener('click', closeMidiFXPopup);
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && STATE.midiFxPopupOpen) closeMidiFXPopup();
  });

  window.addEventListener('resize', () => {
    if (STATE.midiFxPopupOpen) updateMidiFXPopupLayout();
  });

  // ── Presets ──
  MIDI_FX_PRESETS.forEach(preset => {
    const button = overlay.querySelector(`[data-midi-preset="${preset.key}"]`);
    MIDI_FX_UI.presetButtons.set(preset.key, button);
    button.addEventListener('click', () => applyMidiFXPreset(preset.key));
  });

  // ── Sliders ──
  MIDI_FX_CONTROLS.forEach(control => {
    const input      = overlay.querySelector(`[data-midi-slider-for="${control.key}"]`);
    const rail       = overlay.querySelector(`[data-midi-rail-for="${control.key}"]`);
    const valueLabel = overlay.querySelector(`[data-midi-value-for="${control.key}"]`);
    const card       = overlay.querySelector(`[data-midi-control="${control.key}"]`);

    MIDI_FX_UI.sliderInputs.set(control.key, input);
    MIDI_FX_UI.sliderRails.set(control.key, rail);
    MIDI_FX_UI.valueLabels.set(control.key, valueLabel);
    MIDI_FX_UI.controlCards.set(control.key, card);

    input.addEventListener('input', () => {
      const value = parseFloat(input.value);
      MIDI_FX_STATE[control.key] = value;
      control.apply(value);
      updateMidiFXValueLabel(control.key, value);
      updateMidiFXSliderVisual(control.key, value);
      updateMidiFXNeutralRailMarks(control.key);
      updateMidiFXControlState(control.key, value);
      MIDI_FX_UI.activePresetKey = null;
      refreshMidiFXPresetButtons();
      refreshMidiFXToolbarButtons();
    });

    const oneReset = card.querySelector(`[data-midi-fx-reset-one="${control.key}"]`);
    if (oneReset) {
      oneReset.addEventListener('click', event => {
        event.preventDefault();
        event.stopPropagation();
        animateMidiFXControlToNeutral(control.key);
      });
    }
  });

  // ── ResizeObserver pour les rails ──
  if (!MIDI_FX_UI.railResizeObserver) {
    MIDI_FX_UI.railResizeObserver = new ResizeObserver(() => {
      if (!MIDI_FX_UI.overlay) return;
      MIDI_FX_CONTROLS.forEach(c => updateMidiFXNeutralRailMarks(c.key));
    });
  }
  MIDI_FX_UI.sliderRails.forEach(rail => {
    if (rail) MIDI_FX_UI.railResizeObserver.observe(rail);
  });

  syncMidiFXPopupFromState();
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      MIDI_FX_CONTROLS.forEach(c => updateMidiFXNeutralRailMarks(c.key));
    });
  });
}

// ================================================================
// LAYOUT
// ================================================================

function updateMidiFXPopupLayout() {
  if (!MIDI_FX_UI.overlay) return;

  const activePanel = document.querySelector('.panel.panel-midi.active');
  const grid = activePanel?.querySelector('.midi-grid');
  if (!grid) {
    closeMidiFXPopup();
    return;
  }

  const rect = grid.getBoundingClientRect();
  MIDI_FX_UI.overlay.style.top    = `${rect.top}px`;
  MIDI_FX_UI.overlay.style.left   = `${rect.left}px`;
  MIDI_FX_UI.overlay.style.width  = `${rect.width}px`;
  MIDI_FX_UI.overlay.style.height = `${rect.height}px`;

  const accent = activePanel.style.getPropertyValue('--panel-accent').trim();
  if (accent) {
    MIDI_FX_UI.overlay.style.setProperty('--panel-accent', accent);
  } else {
    MIDI_FX_UI.overlay.style.removeProperty('--panel-accent');
  }

  requestAnimationFrame(() => {
    MIDI_FX_CONTROLS.forEach(c => updateMidiFXNeutralRailMarks(c.key));
  });
}

// ================================================================
// OPEN / CLOSE
// ================================================================

function openMidiFXPopup() {
  if (!MIDI_FX_UI.overlay) return;
  if (STATE.midiFxPopupOpen) {
    closeMidiFXPopup();
    return;
  }

  syncMidiFXPopupFromState();
  updateMidiFXPopupLayout();
  STATE.midiFxPopupOpen = true;
  MIDI_FX_UI.overlay.classList.add('is-open');
  MIDI_FX_UI.overlay.setAttribute('aria-hidden', 'false');
  refreshMidiFXToolbarButtons();

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      MIDI_FX_CONTROLS.forEach(c => updateMidiFXNeutralRailMarks(c.key));
    });
  });
}

function closeMidiFXPopup() {
  if (!MIDI_FX_UI.overlay) return;
  STATE.midiFxPopupOpen = false;
  MIDI_FX_UI.overlay.classList.remove('is-open');
  MIDI_FX_UI.overlay.setAttribute('aria-hidden', 'true');
  refreshMidiFXToolbarButtons();
}

// ================================================================
// SYNC
// ================================================================

function syncMidiFXPopupFromState() {
  if (!MIDI_FX_UI.overlay) return;

  if (MIDI_FX_UI.channelEl) {
    MIDI_FX_UI.channelEl.textContent = `Canal ${STATE.MIDI_CHANNEL + 1}`;
  }

  MIDI_FX_CONTROLS.forEach(control => {
    const value = control.read(MIDI_FX_STATE);
    const input = MIDI_FX_UI.sliderInputs.get(control.key);
    if (!input) return;
    input.value = value;
    updateMidiFXValueLabel(control.key, value);
    updateMidiFXSliderVisual(control.key, value);
    updateMidiFXNeutralRailMarks(control.key);
    updateMidiFXControlState(control.key, value);
  });

  MIDI_FX_UI.activePresetKey = null;
  refreshMidiFXPresetButtons();
  refreshMidiFXToolbarButtons();
}

// ================================================================
// HELPERS UI
// ================================================================

function updateMidiFXValueLabel(controlKey, value) {
  const control = MIDI_FX_CONTROLS.find(c => c.key === controlKey);
  const label   = MIDI_FX_UI.valueLabels.get(controlKey);
  if (!control || !label) return;
  label.textContent = control.formatValue(value);
}

function updateMidiFXSliderVisual(controlKey, value) {
  const control = MIDI_FX_CONTROLS.find(c => c.key === controlKey);
  const input   = MIDI_FX_UI.sliderInputs.get(controlKey);
  if (!control || !input) return;

  const range = control.max - control.min;
  const pct   = range <= 0 ? 0 : ((value - control.min) / range) * 100;
  input.style.setProperty('--vol-pct', `${Math.max(0, Math.min(100, pct))}%`);
}

function updateMidiFXNeutralRailMarks(controlKey) {
  const control = MIDI_FX_CONTROLS.find(c => c.key === controlKey);
  const rail    = MIDI_FX_UI.sliderRails.get(controlKey);
  const input   = MIDI_FX_UI.sliderInputs.get(controlKey);
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

function updateMidiFXControlState(controlKey, value) {
  const control = MIDI_FX_CONTROLS.find(c => c.key === controlKey);
  const card    = MIDI_FX_UI.controlCards.get(controlKey);
  const input   = MIDI_FX_UI.sliderInputs.get(controlKey);
  if (!control || !card || !input) return;

  const isModified = Math.abs(value - control.neutral) > 0.0001;
  card.classList.toggle('is-modified', isModified);
  input.classList.toggle('is-modified', isModified);

  const oneReset = card.querySelector('[data-midi-fx-reset-one]');
  if (oneReset) {
    oneReset.disabled = !isModified;
    oneReset.classList.toggle('is-disabled', !isModified);
  }
}

// ================================================================
// VALEURS
// ================================================================

function getMidiFXControlValue(controlKey) {
  const input = MIDI_FX_UI.sliderInputs.get(controlKey);
  return input ? parseFloat(input.value) : null;
}

function isMidiFXControlNeutral(controlKey) {
  const control = MIDI_FX_CONTROLS.find(c => c.key === controlKey);
  const value   = getMidiFXControlValue(controlKey);
  if (!control || value === null) return true;
  return Math.abs(value - control.neutral) < 0.0001;
}

function setMidiFXControlValue(controlKey, value, apply = true) {
  const control = MIDI_FX_CONTROLS.find(c => c.key === controlKey);
  const input   = MIDI_FX_UI.sliderInputs.get(controlKey);
  if (!control || !input) return;

  input.value = value;
  updateMidiFXValueLabel(controlKey, value);
  updateMidiFXSliderVisual(controlKey, value);
  updateMidiFXNeutralRailMarks(controlKey);

  if (apply) {
    const rounded = Math.round(parseFloat(value));
    MIDI_FX_STATE[controlKey] = rounded;
    control.apply(rounded);
  }
}

// ================================================================
// PRESETS
// ================================================================

function refreshMidiFXPresetButtons() {
  MIDI_FX_PRESETS.forEach(preset => {
    const button = MIDI_FX_UI.presetButtons.get(preset.key);
    if (!button) return;
    button.classList.toggle('is-active', preset.key === MIDI_FX_UI.activePresetKey);
  });
}

function clampMidiFXValue(control, value) {
  const clamped = Math.max(control.min, Math.min(control.max, value));
  const step    = Number(control.step) || 1;
  const stepped = Math.round((clamped - control.min) / step) * step + control.min;
  return Math.max(control.min, Math.min(control.max, stepped));
}

function buildMidiFXPresetTargetValues(preset) {
  const targetValues = {};
  const values = preset.values == null ? {} : preset.values;
  MIDI_FX_CONTROLS.forEach(control => {
    const rawValue = Object.prototype.hasOwnProperty.call(values, control.key)
      ? values[control.key]
      : control.neutral;
    targetValues[control.key] = clampMidiFXValue(control, rawValue);
  });
  return targetValues;
}

function applyMidiFXPreset(presetKey) {
  if (presetKey === 'reset') {
    resetMidiFXEffects();
    return;
  }

  const preset = MIDI_FX_PRESETS.find(p => p.key === presetKey);
  if (!preset) return;

  const targetValues = buildMidiFXPresetTargetValues(preset);
  MIDI_FX_UI.activePresetKey = presetKey;
  refreshMidiFXPresetButtons();
  animateMidiFXToValues(targetValues, 320);
}

// ================================================================
// ANIMATION
// ================================================================

function animateMidiFXControlToNeutral(controlKey) {
  const control = MIDI_FX_CONTROLS.find(c => c.key === controlKey);
  if (!control || isMidiFXControlNeutral(controlKey)) return;

  const targetValues = {};
  MIDI_FX_CONTROLS.forEach(c => {
    const v = getMidiFXControlValue(c.key);
    targetValues[c.key] = v === null || Number.isNaN(v) ? c.neutral : v;
  });
  targetValues[controlKey] = clampMidiFXValue(control, control.neutral);

  MIDI_FX_UI.activePresetKey = null;
  refreshMidiFXPresetButtons();
  animateMidiFXToValues(targetValues, 320);
}

function animateMidiFXToValues(targetValues, durationMs = 300) {
  if (MIDI_FX_UI.presetAnimationFrame) {
    cancelAnimationFrame(MIDI_FX_UI.presetAnimationFrame);
    MIDI_FX_UI.presetAnimationFrame = null;
  }

  const startValues = {};
  MIDI_FX_CONTROLS.forEach(control => {
    startValues[control.key] = getMidiFXControlValue(control.key);
  });

  const startTime = performance.now();

  const animate = now => {
    const elapsed = now - startTime;
    const t       = Math.min(1, elapsed / durationMs);
    const eased   = 1 - Math.pow(1 - t, 3);

    MIDI_FX_CONTROLS.forEach(control => {
      const start        = startValues[control.key] ?? control.neutral;
      const end          = targetValues[control.key];
      const interpolated = start + (end - start) * eased;
      const stepped      = clampMidiFXValue(control, interpolated);
      setMidiFXControlValue(control.key, stepped, true);
      updateMidiFXControlState(control.key, stepped);
    });

    if (t < 1) {
      MIDI_FX_UI.presetAnimationFrame = requestAnimationFrame(animate);
      return;
    }

    MIDI_FX_UI.presetAnimationFrame = null;
    refreshMidiFXToolbarButtons();
  };

  MIDI_FX_UI.presetAnimationFrame = requestAnimationFrame(animate);
}

// ================================================================
// RESET
// ================================================================

function isMidiFXAnyControlModified() {
  return MIDI_FX_CONTROLS.some(control => !isMidiFXControlNeutral(control.key));
}

function resetMidiFXEffects() {
  const targetValues = buildMidiFXPresetTargetValues({ values: {} });
  MIDI_FX_UI.activePresetKey = 'reset';
  refreshMidiFXPresetButtons();
  animateMidiFXToValues(targetValues, 320);
}

// ================================================================
// TOOLBAR BUTTONS
// ================================================================

function refreshMidiFXToolbarButtons() {
  const hasMidi = isMidiFXAnyControlModified();
  const hasAudio = (typeof isAudioFXAnyControlModified === 'function' && isAudioFXAnyControlModified()) ||
    (typeof AudioEngineAPI !== 'undefined' && AudioEngineAPI.hasActiveEffects());
  const anyFx = hasMidi || hasAudio;

  document.querySelectorAll('.midi-fx-reset-btn').forEach(button => {
    button.classList.toggle('is-active', anyFx);
  });

  document.querySelectorAll('.midi-fx-open-btn').forEach(button => {
    button.classList.toggle('is-active', STATE.midiFxPopupOpen);
  });

  document.querySelectorAll('.audio-fx-reset-btn').forEach(button => {
    button.classList.toggle('is-active', anyFx);
  });
}
