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
    key: 'volume',
    label: 'VOL',
    shortLabel: 'Volume',
    group: 'global',
    min: 0,
    max: 100,
    step: 1,
    neutral: 100,
    read: settings => Math.round(settings.volume * 100),
    apply: value => {
      const normalized = value / 100;
      STATE.audioVolume = normalized;
      AudioEngineAPI.setMasterVolume(normalized);
      syncAudioSliders(Math.round(value));
    },
    formatValue: value => `${Math.round(value)}%`,
  },
  {
    key: 'bass',
    label: 'BASS',
    shortLabel: 'Bass',
    group: 'eq',
    min: -20,
    max: 20,
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
    min: -20,
    max: 20,
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
    min: -20,
    max: 20,
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
    min: 200,
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
    formatValue: value => `${Math.round(value)}`,
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
  bypassActive: false,
  bypassSnapshot: null,
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
        <input
          class="audio-fx-slider"
          data-slider-for="${control.key}"
          type="range"
          min="${control.min}"
          max="${control.max}"
          step="${control.step}"
          value="${control.neutral}"
        />
      </div>
      <div class="audio-fx-control__foot">${control.shortLabel}</div>
    </div>
  `).join('');

  overlay.innerHTML = `
    <div class="audio-fx-overlay__backdrop"></div>
    <section class="audio-fx-popup" role="dialog" aria-modal="true" aria-labelledby="audio-fx-title">
      <header class="audio-fx-popup__header">
        <div class="audio-fx-popup__titles">
          <div class="audio-fx-popup__eyebrow">Audio Lab</div>
          <h2 id="audio-fx-title">Effets audio</h2>
          <p class="audio-fx-popup__subtitle">Réglages temps réel sur la piste courante</p>
        </div>
        <div class="audio-fx-popup__meta">
          <div class="audio-fx-track">
            <span class="audio-fx-track__label">Track</span>
            <strong class="audio-fx-track__name">Aucune lecture</strong>
          </div>
          <div class="audio-fx-popup__actions">
            <button class="audio-fx-top-btn" id="audio-fx-bypass-btn" type="button">Bypass all</button>
            <button class="audio-fx-top-btn" id="audio-fx-reset-btn" type="button">Reset</button>
            <button class="audio-fx-top-btn is-close" id="audio-fx-close-btn" type="button">Fermer</button>
          </div>
        </div>
      </header>

      <div class="audio-fx-groups">${groupButtonsHTML}</div>

      <div class="audio-fx-popup__body">
        <div class="audio-fx-grid">${controlsHTML}</div>
      </div>

      <footer class="audio-fx-popup__footer">
        <div class="audio-fx-note">Popup indépendante du layout principal : aucun scroll ajouté, aucune grille compressée.</div>
        <div class="audio-fx-note">Les boutons EQ, Filtres, Delay ou Reverb servent à couper puis restaurer rapidement chaque groupe.</div>
      </footer>
    </section>
  `;

  document.getElementById('app').appendChild(overlay);

  AUDIO_FX_UI.overlay = overlay;
  AUDIO_FX_UI.trackEl = overlay.querySelector('.audio-fx-track__name');
  AUDIO_FX_UI.subtitleEl = overlay.querySelector('.audio-fx-popup__subtitle');

  overlay.querySelector('.audio-fx-overlay__backdrop').addEventListener('click', closeAudioFXPopup);
  overlay.querySelector('#audio-fx-close-btn').addEventListener('click', closeAudioFXPopup);
  overlay.querySelector('#audio-fx-reset-btn').addEventListener('click', resetAudioFXPopup);
  overlay.querySelector('#audio-fx-bypass-btn').addEventListener('click', toggleAudioFXBypass);

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && STATE.audioFxPopupOpen) {
      closeAudioFXPopup();
    }
  });

  AUDIO_FX_GROUPS.forEach(group => {
    const btn = overlay.querySelector(`[data-group="${group.key}"]`);
    AUDIO_FX_UI.groupButtons.set(group.key, btn);
    btn.addEventListener('click', () => toggleAudioFXGroup(group.key));
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
      refreshAudioFXGroupButtons();

      if (AUDIO_FX_UI.bypassActive) {
        AUDIO_FX_UI.bypassActive = false;
        AUDIO_FX_UI.bypassSnapshot = null;
        refreshAudioFXBypassButton();
      }
    });
  });

  syncAudioFXPopupFromEngine();
}

function openAudioFXPopup() {
  if (!AUDIO_FX_UI.overlay) return;
  syncAudioFXPopupFromEngine();
  STATE.audioFxPopupOpen = true;
  AUDIO_FX_UI.overlay.classList.add('is-open');
  AUDIO_FX_UI.overlay.setAttribute('aria-hidden', 'false');
}

function closeAudioFXPopup() {
  if (!AUDIO_FX_UI.overlay) return;
  STATE.audioFxPopupOpen = false;
  AUDIO_FX_UI.overlay.classList.remove('is-open');
  AUDIO_FX_UI.overlay.setAttribute('aria-hidden', 'true');
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
  });

  AUDIO_FX_UI.trackEl.textContent = STATE.currentSoundBtn?.dataset.label || 'Aucune lecture';
  AUDIO_FX_UI.subtitleEl.textContent = STATE.currentSoundBtn
    ? 'Réglages temps réel sur la piste en cours'
    : 'Prépare les réglages avant lecture ou ajuste pendant le morceau';

  refreshAudioFXGroupButtons();
  refreshAudioFXBypassButton();
}

function updateAudioFXValueLabel(controlKey, value) {
  const control = AUDIO_FX_CONTROLS.find(item => item.key === controlKey);
  const label = AUDIO_FX_UI.valueLabels.get(controlKey);
  if (!control || !label) return;
  label.textContent = control.formatValue(value);
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
  if (apply) control.apply(parseFloat(value));
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
}

function refreshAudioFXGroupButtons() {
  AUDIO_FX_GROUPS.forEach(group => {
    const button = AUDIO_FX_UI.groupButtons.get(group.key);
    if (!button) return;
    const isActive = group.controls.some(controlKey => !isAudioFXControlNeutral(controlKey));
    button.classList.toggle('is-active', isActive);
  });
}

function resetAudioFXPopup() {
  AudioEngineAPI.resetSettings();
  STATE.audioVolume = AudioEngineAPI.getCurrentSettings().volume;
  syncAudioSliders(Math.round(STATE.audioVolume * 100));
  AUDIO_FX_UI.bypassActive = false;
  AUDIO_FX_UI.bypassSnapshot = null;
  syncAudioFXPopupFromEngine();
}

function toggleAudioFXBypass() {
  if (!AUDIO_FX_UI.bypassActive) {
    AUDIO_FX_UI.bypassSnapshot = AudioEngineAPI.getCurrentSettings();
    AudioEngineAPI.resetSettings();
    STATE.audioVolume = AudioEngineAPI.getCurrentSettings().volume;
    syncAudioSliders(Math.round(STATE.audioVolume * 100));
    AUDIO_FX_UI.bypassActive = true;
  } else {
    const snapshot = AUDIO_FX_UI.bypassSnapshot;
    if (snapshot) {
      AudioEngineAPI.setMasterVolume(snapshot.volume);
      AudioEngineAPI.setEQ({
        bass: snapshot.bassGain,
        mid: snapshot.midGain,
        treble: snapshot.trebleGain,
      });
      AudioEngineAPI.setLowPassFrequency(snapshot.lowPassFrequency);
      AudioEngineAPI.setHighPassFrequency(snapshot.highPassFrequency);
      AudioEngineAPI.setPlaybackRate(snapshot.playbackRate);
      AudioEngineAPI.setDistortionAmount(snapshot.distortionAmount);
      AudioEngineAPI.setCompressor({
        threshold: snapshot.compressorThreshold,
        knee: snapshot.compressorKnee,
        ratio: snapshot.compressorRatio,
        attack: snapshot.compressorAttack,
        release: snapshot.compressorRelease,
      });
      AudioEngineAPI.setDelay({
        time: snapshot.delayTime,
        feedback: snapshot.delayFeedback,
        mix: snapshot.delayMix,
      });
      AudioEngineAPI.setReverbMix(snapshot.reverbMix);
      STATE.audioVolume = snapshot.volume;
      syncAudioSliders(Math.round(snapshot.volume * 100));
    }
    AUDIO_FX_UI.bypassActive = false;
    AUDIO_FX_UI.bypassSnapshot = null;
  }

  syncAudioFXPopupFromEngine();
}

function refreshAudioFXBypassButton() {
  const button = document.getElementById('audio-fx-bypass-btn');
  if (!button) return;
  button.classList.toggle('is-active', AUDIO_FX_UI.bypassActive);
  button.textContent = AUDIO_FX_UI.bypassActive ? 'Restore FX' : 'Bypass all';
}
