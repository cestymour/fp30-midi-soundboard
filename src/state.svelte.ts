/* ================================================================
   state.svelte.ts — État global partagé (MIDI, audio), en runes
   Importé par les moteurs, qui le lisent et l'écrivent, et par les
   composants, qui se mettent à jour quand il change.
   Ne contient que de l'état métier : aucune référence au DOM.
   Les objets (connexions, piste, son en cours) sont en $state.raw :
   ils sont stockés tels quels, sans proxy, pour que les comparaisons
   d'identité (son en cours === son du bouton) restent valables.
================================================================ */

import type { BluetoothMIDI } from './midi/bluetoothMIDI.ts';
import type { MediaElementTrack } from './audio/audio-engine.ts';
import type { AudioItem } from './types.ts';

class AppState {
  // ── MIDI ──
  MIDI_CHANNEL          = $state(0);
  /** Instance BluetoothMIDI, initialisée dans midi/connection.ts */
  bt                    = $state.raw<BluetoothMIDI | null>(null);
  midiOutput            = $state.raw<MIDIOutput | null>(null);
  midiInput             = $state.raw<MIDIInput | null>(null);
  midiAccess            = $state.raw<MIDIAccess | null>(null);
  midiVolume            = $state(100);
  currentConnectionType = $state<'usb' | 'bt' | null>(null);
  isSwitchingToUsb      = false;

  // ── Audio ──
  currentAudio          = $state.raw<MediaElementTrack | null>(null);
  /** Son en cours (en lecture ou en pause) */
  currentSoundItem      = $state.raw<AudioItem | null>(null);
  progressRAF: number | null = null;
  audioVolume           = $state(1);
  isPaused              = $state(false);

  // ── Divers ──
  wakeLock              = $state.raw<WakeLockSentinel | null>(null);
}

export type { AppState };

export const STATE = new AppState();
