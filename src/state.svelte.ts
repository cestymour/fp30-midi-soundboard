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
  /**
   * Canal 4 (0-based : 3) : sur le FP-30X, c'est le canal du son du clavier lui-même.
   * Un patch envoyé ici change ce que jouent les touches : pas de Local Off ni de
   * renvoi des notes au piano (voir docs/fp30x-midi.md).
   */
  MIDI_CHANNEL          = $state(3);
  /** Instance BluetoothMIDI, initialisée dans midi/connection.ts */
  bt                    = $state.raw<BluetoothMIDI | null>(null);
  midiOutput            = $state.raw<MIDIOutput | null>(null);
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
