/* ================================================================
   audio-fx.ts — Contrôles d'effets audio (moteur Web Audio)
   L'état est lu dans le moteur (AudioEngineAPI.getCurrentSettings()).
================================================================ */

import type { AudioFxKey, FxControl } from '../types.ts';
import { AudioEngineAPI } from '../audio/audio-engine.ts';
import type { AudioEngineState } from '../audio/audio-engine.ts';

export type AudioFxControl = FxControl<AudioFxKey, AudioEngineState>;

export const AUDIO_FX_CONTROLS: AudioFxControl[] = [
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

/** Applique une valeur au moteur audio */
export function applyAudioFxValue(control: AudioFxControl, value: number): void {
  control.apply(value);
}
