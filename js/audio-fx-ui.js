/* ================================================================
   audio-fx-ui.js - Popup FX audio grand format
   Depend de : audio.js (AudioEngineAPI), app.js (STATE)
================================================================ */

const AUDIO_FX_GROUPS = [
  { key: 'eq', label: 'EQ', controls: ['bass', 'mid', 'treble'] },
  { key: 'filters', label: 'Filtres', controls: ['lowPass', 'highPass'] },
  { key: 'speed', label: 'Speed', controls: ['speed'] },
  { key: 'drive', label: 'Drive', controls: ['drive'] },
  { key: 'compressor', label: 'Comp', controls: ['compressor'] },
  { key: 'delay', label: 'Delay', controls: ['delay'] },
  { key: 'reverb', label: 'Reverb', controls: ['reverb'] },
];

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
    read: settings => settings.lowPassFrequency,
    apply: value => AudioEngineAPI.setLowPassFrequency(value),
    formatValue: value => value >= 1000 ? `${(value / 1000).toFixed(1)} kHz` : `${Math.round(value)} Hz`,
  },
  {
    key: 'highPass',
    label: 'HPF',
    shortLabel: 'High-pass',
    group: 'filters',
    min: 20,
    max: 5000,
    step: 10,
    neutral: 20,
    read: settings => settings.highPassFrequency,
    apply: value => AudioEngineAPI.setHighPassFrequency(value),
    formatValue: value => value >= 1000 ? `${(value / 1000).toFixed(1)} kHz` : `${Math.round(value)} Hz`,
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
  {
    key: 'drive',
    label: 'DRV',
    shortLabel: 'Drive',
    group: 'drive',
    min: 0,
    max: 100,
    step: 1,
    neutral: 0,
    read: settings => settings.distortionAmount,
    apply: value => AudioEngineAPI.setDistortionAmount(value),
    formatValue: value => `${Math.round(value)}%`,
  },
  {
    key: 'compressor',
    label: 'COMP',
    shortLabel: 'Comp',
    group: 'compressor',
    min: 1,
    max: 20,
    step: 0.5,
    neutral: 1,
    read: settings => settings.compressorRatio,
    apply: value => AudioEngineAPI.setCompressor({ ratio: value }),
    formatValue: value => `${Number(value).toFixed(1)}:1`,
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
];

const AUDIO_FX_UI = {
  overlay: null,
  trackEl: null,
  subtitleEl: null,
  groupButtons: new Map(),
  sliderInputs: new Map(),
  valueLabels: new Map(),
  groupMemory: new Map(),
};

function buildAudioFXPopup() {
  if (AUDIO_FX_UI.overlay) return;

  const overlay = document.createElement('div');
  overlay.id = 'audio-fx-overlay';
  overlay.setAttribute('aria-hidden', 'true');

  const groupButtonsHTML = AUDIO_FX_GROUPS.map(group => `
    <button class="audio-fx-group-btn" type="button" data-group="${group.key}">${group.label}</button>
  `).join('');

  const controlsHTML = AUDIO_FX_CONTROLS.map(control => `
    <div class="audio-fx-control" data-control="${control.key}">
      <div class="audio-fx-control__head">
        <span class="audio-fx-control__tag">${control.label}</span>
        <span class="audio-fx-control__value" data-value-for="${control.key}">--</span>
      </div>
      <div class="audio-fx-slider-wrap">
        <div class="audio-fx-slider-rail">
          <input
            class="vol-slider audio-fx-slider"
            data-slider-for="${control.key}"
            type="range"
            min="${control.min}"
            max="${control.max}"
            step="${control.step}"
            value="${control.neutral}"
          />
        </div>
      </div>
      <div class="audio-fx-control__foot">${control.shortLabel}</div>
    </div>
  `).join('');

  overlay.innerHTML = `
    <div class="audio-fx-overlay__backdrop"></div>
    <section class="audio-fx-popup" role="dialog" aria-modal="true" aria-labelledby="audio-fx-title">
      <header class="audio-fx-popup__header">
        <div class="audio-fx-popup__titles">
          <div class="audio-fx-popup__eyebrow">Audio Mixer</div>
          <h2 id="audio-fx-title">Popup FX</h2>
          <p class="audio-fx-popup__subtitle">Réglages temps réel sur la piste courante</p>
        </div>
        <div class="audio-fx-popup__meta">
          <div class="audio-fx-track">
            <span class="audio-fx-track__label">Track</span>
            <strong class="audio-fx-track__name">Aucune lecture</strong>
          </div>
          <button class="audio-fx-top-btn is-close" id="audio-fx-close-btn" type="button">Fermer</button>
        </div>
      </header>

      <div class="audio-fx-groups">${groupButtonsHTML}</div>

      <div class="audio-fx-popup__body">
        <div class="audio-fx-grid">${controlsHTML}</div>
      </div>
    </section>
  `;

  document.getElementById('app').appendChild(overlay);

  AUDIO_FX_UI.overlay = overlay;
  AUDIO_FX_UI.trackEl = overlay.querySelector('.audio-fx-track__name');
  AUDIO_FX_UI.subtitleEl = overlay.querySelector('.audio-fx-popup__subtitle');

  overlay.querySelector('.audio-fx-overlay__backdrop').addEventListener('click', closeAudioFXPopup);
  overlay.querySelector('#audio-fx-close-btn').addEventListener('click', closeAudioFXPopup);

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && STATE.audioFxPopupOpen) {
      closeAudioFXPopup();
    }
  });

  window.addEventListener('resize', () => {
    if (STATE.audioFxPopupOpen) {
      updateAudioFXPopupLayout();
    }
  });

  AUDIO_FX_GROUPS.forEach(group => {
    const button = overlay.querySelector(`[data-group="${group.key}"]`);
    AUDIO_FX_UI.groupButtons.set(group.key, button);
    button.addEventListener('click', () => toggleAudioFXGroup(group.key));
  });

  AUDIO_FX_CONTROLS.forEach(control => {
    const input = overlay.querySelector(`[data-slider-for="${control.key}"]`);
    const valueLabel = overlay.querySelector(`[data-value-for="${control.key}"]`);

    AUDIO_FX_UI.sliderInputs.set(control.key, input);
    AUDIO_FX_UI.valueLabels.set(control.key, valueLabel);

    input.addEventListener('input', () => {
      const value = parseFloat(input.value);
      control.apply(value);
      updateAudioFXValueLabel(control.key, value);
      updateAudioFXSliderVisual(control.key, value);
      refreshAudioFXGroupButtons();
      refreshAudioFXToolbarButtons();
    });
  });

  syncAudioFXPopupFromEngine();
}

function updateAudioFXPopupLayout() {
  if (!AUDIO_FX_UI.overlay) return;

  const activePanel = document.querySelector('.panel.panel-audio.active');
  const grid = activePanel?.querySelector('.audio-grid');
  if (!grid) {
    closeAudioFXPopup();
    return;
  }

  const rect = grid.getBoundingClientRect();
  AUDIO_FX_UI.overlay.style.top = `${rect.top}px`;
  AUDIO_FX_UI.overlay.style.left = `${rect.left}px`;
  AUDIO_FX_UI.overlay.style.width = `${rect.width}px`;
  AUDIO_FX_UI.overlay.style.height = `${rect.height}px`;
}

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
}

function closeAudioFXPopup() {
  if (!AUDIO_FX_UI.overlay) return;
  STATE.audioFxPopupOpen = false;
  AUDIO_FX_UI.overlay.classList.remove('is-open');
  AUDIO_FX_UI.overlay.setAttribute('aria-hidden', 'true');
  refreshAudioFXToolbarButtons();
}

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
  });

  AUDIO_FX_UI.trackEl.textContent = STATE.currentSoundBtn?.dataset.label || 'Aucune lecture';
  AUDIO_FX_UI.subtitleEl.textContent = STATE.currentSoundBtn
    ? 'Réglages temps réel sur la piste en cours'
    : 'Prépare les effets avant lecture ou ajuste pendant le morceau';

  refreshAudioFXGroupButtons();
  refreshAudioFXToolbarButtons();
}

function updateAudioFXValueLabel(controlKey, value) {
  const control = AUDIO_FX_CONTROLS.find(item => item.key === controlKey);
  const label = AUDIO_FX_UI.valueLabels.get(controlKey);
  if (!control || !label) return;
  label.textContent = control.formatValue(value);
}

function updateAudioFXSliderVisual(controlKey, value) {
  const control = AUDIO_FX_CONTROLS.find(item => item.key === controlKey);
  const input = AUDIO_FX_UI.sliderInputs.get(controlKey);
  if (!control || !input) return;

  const range = control.max - control.min;
  const pct = range <= 0 ? 0 : ((value - control.min) / range) * 100;
  input.style.setProperty('--vol-pct', `${Math.max(0, Math.min(100, pct))}%`);
}

function getAudioFXControlValue(controlKey) {
  const input = AUDIO_FX_UI.sliderInputs.get(controlKey);
  return input ? parseFloat(input.value) : null;
}

function isAudioFXControlNeutral(controlKey) {
  const control = AUDIO_FX_CONTROLS.find(item => item.key === controlKey);
  const value = getAudioFXControlValue(controlKey);
  if (!control || value === null) return true;
  return Math.abs(value - control.neutral) < 0.0001;
}

function setAudioFXControlValue(controlKey, value, apply = true) {
  const control = AUDIO_FX_CONTROLS.find(item => item.key === controlKey);
  const input = AUDIO_FX_UI.sliderInputs.get(controlKey);
  if (!control || !input) return;

  input.value = value;
  updateAudioFXValueLabel(controlKey, value);
  updateAudioFXSliderVisual(controlKey, value);
  if (apply) {
    control.apply(parseFloat(value));
  }
}

function captureAudioFXGroupValues(groupKey) {
  const group = AUDIO_FX_GROUPS.find(item => item.key === groupKey);
  const snapshot = {};
  if (!group) return snapshot;
  group.controls.forEach(controlKey => {
    snapshot[controlKey] = getAudioFXControlValue(controlKey);
  });
  return snapshot;
}

function restoreAudioFXGroupValues(groupKey, snapshot) {
  const group = AUDIO_FX_GROUPS.find(item => item.key === groupKey);
  if (!group || !snapshot) return;
  group.controls.forEach(controlKey => {
    if (typeof snapshot[controlKey] === 'number') {
      setAudioFXControlValue(controlKey, snapshot[controlKey], true);
    }
  });
}

function setAudioFXGroupToNeutral(groupKey) {
  const group = AUDIO_FX_GROUPS.find(item => item.key === groupKey);
  if (!group) return;

  group.controls.forEach(controlKey => {
    const control = AUDIO_FX_CONTROLS.find(item => item.key === controlKey);
    if (control) {
      setAudioFXControlValue(controlKey, control.neutral, true);
    }
  });
}

function toggleAudioFXGroup(groupKey) {
  const group = AUDIO_FX_GROUPS.find(item => item.key === groupKey);
  if (!group) return;

  const isActive = group.controls.some(controlKey => !isAudioFXControlNeutral(controlKey));
  if (isActive) {
    AUDIO_FX_UI.groupMemory.set(groupKey, captureAudioFXGroupValues(groupKey));
    setAudioFXGroupToNeutral(groupKey);
  } else {
    restoreAudioFXGroupValues(groupKey, AUDIO_FX_UI.groupMemory.get(groupKey));
  }

  refreshAudioFXGroupButtons();
  refreshAudioFXToolbarButtons();
}

function refreshAudioFXGroupButtons() {
  AUDIO_FX_GROUPS.forEach(group => {
    const button = AUDIO_FX_UI.groupButtons.get(group.key);
    if (!button) return;
    const isActive = group.controls.some(controlKey => !isAudioFXControlNeutral(controlKey));
    button.classList.toggle('is-active', isActive);
  });
}

function refreshAudioFXToolbarButtons() {
  const hasEffects = typeof AudioEngineAPI !== 'undefined' && AudioEngineAPI.hasActiveEffects();

  document.querySelectorAll('.audio-fx-reset-btn').forEach(button => {
    button.classList.toggle('is-active', hasEffects);
  });

  document.querySelectorAll('.audio-fx-open-btn').forEach(button => {
    button.classList.toggle('is-active', STATE.audioFxPopupOpen);
  });
}

function resetAudioFXEffects() {
  if (typeof AudioEngineAPI === 'undefined') return;
  AUDIO_FX_UI.groupMemory.clear();
  AudioEngineAPI.resetEffects();
  syncAudioFXPopupFromEngine();
  refreshAudioFXToolbarButtons();
}
