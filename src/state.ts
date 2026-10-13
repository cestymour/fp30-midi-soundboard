/* ================================================================
   state.ts — État global partagé (MIDI, audio, popups)
   Importé par tous les modules qui le lisent ou l'écrivent.
================================================================ */

import type { BluetoothMIDI } from './midi/bluetoothMIDI.ts';
import type { MediaElementTrack } from './audio/audio.ts';

export interface AppState {
  // ── MIDI ──
  MIDI_CHANNEL:          number;
  bt:                    BluetoothMIDI | null;
  midiOutput:            MIDIOutput | null;
  midiInput:             MIDIInput | null;
  midiAccess:            MIDIAccess | null;
  midiVolume:            number;
  activeInstBtn:         HTMLButtonElement | null;
  currentConnectionType: 'usb' | 'bt' | null;
  isSwitchingToUsb:      boolean;

  // ── Audio ──
  currentAudio:          MediaElementTrack | null;
  currentSoundBtn:       HTMLButtonElement | null;
  progressRAF:           number | null;
  audioVolume:           number;
  isPaused:              boolean;
  midiFxPopupOpen:       boolean;
  audioFxPopupOpen:      boolean;

  // ── Divers ──
  wakeLock:              WakeLockSentinel | null;
}

export const STATE: AppState = {
  // ── MIDI ──
  MIDI_CHANNEL:          0,
  bt:                    null,   // instance BluetoothMIDI, initialisée dans midi.js
  midiOutput:            null,
  midiInput:             null,
  midiAccess:            null,
  midiVolume:            100,
  activeInstBtn:         null,
  currentConnectionType: null,   // 'usb' | 'bt' | null
  isSwitchingToUsb:      false,

  // ── Audio ──
  currentAudio:          null,
  currentSoundBtn:       null,
  progressRAF:           null,
  audioVolume:           1,
  isPaused:              false,
  midiFxPopupOpen:       false,
  audioFxPopupOpen:      false,

  // ── Divers ──
  wakeLock:              null,   // WakeLockSentinel, initialisé dans app.js
};
