/* ================================================================
   fx-overlays.ts — Les deux popups d'effets (piano MIDI et audio)
   et les boutons Effets / Reset des barres de panneau.
   Seul ce qui diffère entre les deux popups est ici.
================================================================ */

import { MIDI_FX_PRESETS } from '../config/midi-fx.config.ts';
import { AUDIO_FX_PRESETS } from '../config/audio-fx.config.ts';
import { MIDI_FX_CONTROLS, MIDI_FX_STATE, applyMidiFxValue } from '../fx/midi-fx.ts';
import { AUDIO_FX_CONTROLS, applyAudioFxValue } from '../fx/audio-fx.ts';
import { AudioEngineAPI } from '../audio/audio-engine.ts';
import { FxOverlay } from './fx-overlay.ts';

// ═══════════════════════════════════════════════════════
// POPUP EFFETS PIANO (CC MIDI)
// ═══════════════════════════════════════════════════════

export const midiFxOverlay = new FxOverlay({
  overlayId: 'midi-fx-overlay',
  ariaLabel: 'Effets piano MIDI',
  attributes: {
    preset:    'data-midi-preset',
    control:   'data-midi-control',
    valueFor:  'data-midi-value-for',
    railFor:   'data-midi-rail-for',
    sliderFor: 'data-midi-slider-for',
    resetOne:  'data-midi-fx-reset-one',
  },
  controls:      MIDI_FX_CONTROLS,
  presets:       MIDI_FX_PRESETS,
  panelSelector: '.panel.panel-midi.active',
  gridSelector:  '.midi-grid',
  // État = ce que l'app a envoyé en dernier (jamais relu depuis le piano)
  readSettings:  () => MIDI_FX_STATE,
  applyValue:    applyMidiFxValue,
  refreshToolbar: () => refreshFxToolbarButtons(),
});

// ═══════════════════════════════════════════════════════
// POPUP EFFETS AUDIO
// ═══════════════════════════════════════════════════════

export const audioFxOverlay = new FxOverlay({
  overlayId: 'audio-fx-overlay',
  ariaLabel: 'Effets audio',
  attributes: {
    preset:    'data-preset',
    control:   'data-control',
    valueFor:  'data-value-for',
    railFor:   'data-rail-for',
    sliderFor: 'data-slider-for',
    resetOne:  'data-audio-fx-reset-one',
  },
  controls:      AUDIO_FX_CONTROLS,
  presets:       AUDIO_FX_PRESETS,
  panelSelector: '.panel.panel-audio.active',
  gridSelector:  '.audio-grid',
  readSettings:  () => AudioEngineAPI.getCurrentSettings(),
  applyValue:    applyAudioFxValue,
  afterSync: (settings, overlay) => {
    // Anciennes versions : passe-bas à 22 050 Hz, ramené au neutre de l'interface (20 kHz)
    if (settings.lowPassFrequency > 20000) {
      overlay.setControlValue('lowPass', 20000, true);
    }
  },
  refreshToolbar: () => refreshFxToolbarButtons(),
});

// ═══════════════════════════════════════════════════════
// BOUTONS DES BARRES DE PANNEAU
// ═══════════════════════════════════════════════════════

/**
 * Reset allumé dès qu'un effet (MIDI ou audio) est actif ;
 * bouton Effets allumé quand sa popup est ouverte.
 */
export function refreshFxToolbarButtons(): void {
  const hasMidi  = midiFxOverlay.isAnyControlModified();
  const hasAudio = audioFxOverlay.isAnyControlModified() || AudioEngineAPI.hasActiveEffects();
  const anyFx = hasMidi || hasAudio;

  document.querySelectorAll('.midi-fx-reset-btn, .audio-fx-reset-btn').forEach(button => {
    button.classList.toggle('is-active', anyFx);
  });

  document.querySelectorAll('.midi-fx-open-btn').forEach(button => {
    button.classList.toggle('is-active', midiFxOverlay.isOpen);
  });

  document.querySelectorAll('.audio-fx-open-btn').forEach(button => {
    button.classList.toggle('is-active', audioFxOverlay.isOpen);
  });
}

/** Reset total des effets — MIDI + Audio */
export function resetAllFXEffects(): void {
  midiFxOverlay.reset();
  audioFxOverlay.reset();
}
