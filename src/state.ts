/* ================================================================
   state.ts — État global partagé (MIDI, audio)
   Importé par tous les modules qui le lisent ou l'écrivent.
   Ne contient que de l'état métier : aucune référence au DOM.
================================================================ */

import type { BluetoothMIDI } from './midi/bluetoothMIDI.ts';
import type { MediaElementTrack } from './audio/audio-engine.ts';
import type { AudioItem } from './types.ts';

export interface AppState {
  // ── MIDI ──
  MIDI_CHANNEL:          number;
  bt:                    BluetoothMIDI | null;
  midiOutput:            MIDIOutput | null;
  midiInput:             MIDIInput | null;
  midiAccess:            MIDIAccess | null;
  midiVolume:            number;
  currentConnectionType: 'usb' | 'bt' | null;
  isSwitchingToUsb:      boolean;

  // ── Audio ──
  currentAudio:          MediaElementTrack | null;
  /** Son en cours (en lecture ou en pause) */
  currentSoundItem:      AudioItem | null;
  progressRAF:           number | null;
  audioVolume:           number;
  isPaused:              boolean;

  // ── Divers ──
  wakeLock:              WakeLockSentinel | null;
}

export const STATE: AppState = {
  // ── MIDI ──
  MIDI_CHANNEL:          0,
  bt:                    null,   // instance BluetoothMIDI, initialisée dans midi/connection.ts
  midiOutput:            null,
  midiInput:             null,
  midiAccess:            null,
  midiVolume:            100,
  currentConnectionType: null,   // 'usb' | 'bt' | null
  isSwitchingToUsb:      false,

  // ── Audio ──
  currentAudio:          null,
  currentSoundItem:      null,
  progressRAF:           null,
  audioVolume:           1,
  isPaused:              false,

  // ── Divers ──
  wakeLock:              null,   // WakeLockSentinel, initialisé dans app.js
};
