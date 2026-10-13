/* ================================================================
   state.js — État global partagé (MIDI, audio, popups)
   Importé par tous les modules qui le lisent ou l'écrivent.
================================================================ */

export const STATE = {
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
