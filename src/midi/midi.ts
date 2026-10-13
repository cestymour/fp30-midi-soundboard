/* ================================================================
   midi.ts — Envoi MIDI : routage USB / Bluetooth, patch, volume,
             arrêt d'urgence. Aucun accès au DOM.
================================================================ */

import { STATE } from '../state.ts';
import type { MidiItem } from '../types.ts';

// ═══════════════════════════════════════════════════════
// ENVOI MIDI
// ═══════════════════════════════════════════════════════

/** Envoie vers la sortie USB si elle existe, sinon vers le Bluetooth connecté */
export function sendMidi(bytes: number[]): void {
  if (STATE.midiOutput) {
    STATE.midiOutput.send(bytes);
  } else if (STATE.bt?.status === 'connected') {
    STATE.bt.send(bytes);
  } else {
    console.warn('Pas de connexion MIDI active');
  }
}

/**
 * Messages de sélection d'un instrument : Bank Select MSB (CC0),
 * Bank Select LSB (CC32), puis Program Change (`pc` 1-based → 0-based).
 */
export function buildInstrumentPatchMessages(item: Pick<MidiItem, 'pc' | 'msb' | 'lsb'>, channel: number): number[][] {
  return [
    [0xB0 | channel, 0x00, item.msb],
    [0xB0 | channel, 0x20, item.lsb],
    [0xC0 | channel, item.pc - 1],
  ];
}

export function sendInstrumentPatch(item: MidiItem): void {
  buildInstrumentPatchMessages(item, STATE.MIDI_CHANNEL).forEach(sendMidi);
}

export function sendVolume(val: number): void {
  sendMidi([0xB0 | STATE.MIDI_CHANNEL, 0x07, val]);
}

/** Volume MIDI (CC7, 0-127) : mémorisé puis envoyé au piano */
export function setMidiVolume(val: number): void {
  STATE.midiVolume = val;
  sendVolume(STATE.midiVolume);
}

export function sendEmergencyStopMidi(): void {
  for (let ch = 0; ch < 16; ch++) {
    sendMidi([0xB0 | ch, 123, 0]); // All Notes Off
    sendMidi([0xB0 | ch, 121, 0]); // Reset All Controllers
  }
}
