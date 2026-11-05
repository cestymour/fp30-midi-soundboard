/* ================================================================
   fx-overlays.svelte.ts — Les deux popups d'effets (piano MIDI et audio)
   et les boutons Effets / Reset des barres de panneau.
   Seul ce qui diffère entre les deux popups est ici.
================================================================ */

import { MIDI_FX_PRESETS } from '../config/midi-fx.config.ts';
import { AUDIO_FX_PRESETS } from '../config/audio-fx.config.ts';
import { MIDI_FX_CONTROLS, MIDI_FX_STATE, applyMidiFxValue } from '../fx/midi-fx.ts';
import { AUDIO_FX_CONTROLS, applyAudioFxValue } from '../fx/audio-fx.ts';
import { AudioEngineAPI } from '../audio/audio-engine.ts';
import { FxOverlayController } from './fx-overlay.svelte.ts';

// ═══════════════════════════════════════════════════════
// POPUP EFFETS PIANO (CC MIDI)
// ═══════════════════════════════════════════════════════

export const midiFxOverlay = new FxOverlayController({
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

export const audioFxOverlay = new FxOverlayController({
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
 * Témoins des boutons Reset. Chaque panneau a le sien, et son Reset ne remet à zéro
 * que ses effets : piano dans les onglets MIDI, sons dans les onglets audio (bug n° 19).
 */
export const fxToolbar = $state({
  /** Un effet piano est actif : Reset des panneaux MIDI allumé */
  anyMidiFx: false,
  /** Un effet audio est actif : Reset des panneaux audio allumé */
  anyAudioFx: false,
});

/**
 * Recalcule l'état des boutons Reset (le moteur audio n'est pas réactif).
 * Les boutons Effets suivent directement l'ouverture de leur popup.
 */
export function refreshFxToolbarButtons(): void {
  fxToolbar.anyMidiFx  = midiFxOverlay.isAnyControlModified();
  fxToolbar.anyAudioFx = audioFxOverlay.isAnyControlModified() || AudioEngineAPI.hasActiveEffects();
}
