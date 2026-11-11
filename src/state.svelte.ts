/* ================================================================
   state.svelte.ts — État global partagé (MIDI, audio), en runes
   Importé par les moteurs, qui le lisent et l'écrivent, et par les
   composants, qui se mettent à jour quand il change.
   Ne contient que de l'état métier : aucune référence au DOM.
   Les objets (connexions, piste, son en cours) sont en $state.raw :
   ils sont stockés tels quels, sans proxy, pour que les comparaisons
   d'identité (son en cours === son du bouton) restent valables.
================================================================ */

import type { BluetoothErrorCode, BluetoothMIDI, BluetoothStatus } from './midi/bluetoothMIDI.ts';
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
  /** Copie réactive de STATE.bt.status / error, pour le badge */
  btStatus              = $state<BluetoothStatus>('idle');
  btError               = $state<BluetoothErrorCode | null>(null);
  midiOutput            = $state.raw<MIDIOutput | null>(null);
  midiAccess            = $state.raw<MIDIAccess | null>(null);
  midiVolume            = $state(100);
  currentConnectionType = $state<'usb' | 'bt' | null>(null);
  isSwitchingToUsb      = false;

  // ── Musique (onglets musiques : une seule à la fois, audio/playback.ts) ──
  currentAudio          = $state.raw<MediaElementTrack | null>(null);
  /** Musique en cours (en lecture ou en pause) */
  currentSoundItem      = $state.raw<AudioItem | null>(null);
  progressRAF: number | null = null;
  /** Volume des musiques (0-1), commun aux onglets musiques */
  musicVolume           = $state(1);
  isPaused              = $state(false);

  // ── Sons (onglets sons : superposés, audio/sounds.ts) ──
  /** Nombre de sons en cours */
  soundVoices           = $state(0);
  /** Volume des sons (0-1), commun aux onglets sons */
  soundVolume           = $state(1);

  // ── Musique de transition (bouton de l'en-tête, audio/transition.ts) ──
  /** Id de la musique choisie pour le spectacle (TRANSITION_MUSICS) */
  transitionMusicId     = $state<string | null>(null);
  /** Dernier lancement (Date.now()), null : le prochain part du début */
  transitionLastLaunch  = $state<number | null>(null);
  /** Moment marquant joué en dernier (0 : début du spectacle, puis 1, 2…) */
  transitionLastMoment  = $state(0);
  /** Volume de la musique de transition (0-1), à part de celui des musiques */
  transitionVolume      = $state(1);
  /** Réglage : remettre le volume de la transition à 100 % à chaque ouverture de la popup */
  transitionResetVolume = $state(false);
  /** Préréglage « Clarté Studio » appliqué à la musique de transition */
  transitionClarity     = $state(false);

  // ── Divers ──
  wakeLock              = $state.raw<WakeLockSentinel | null>(null);
}

export type { AppState };

export const STATE = new AppState();
