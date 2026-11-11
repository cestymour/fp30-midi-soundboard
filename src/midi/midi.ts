/* ================================================================
   midi.ts — Envoi MIDI : routage USB / Bluetooth, patch, volume,
             arrêt d'urgence. Aucun accès au DOM.
================================================================ */

import { STATE } from '../state.svelte.ts';
import type { MidiItem } from '../types.ts';

// ═══════════════════════════════════════════════════════
// ENVOI MIDI
// ═══════════════════════════════════════════════════════

/**
 * Envoie vers la sortie USB si elle existe, sinon vers le Bluetooth connecté.
 * Un SysEx (`F0 … F7`) part par le même chemin : en Bluetooth, `BluetoothMIDI.send()`
 * l'emballe au format BLE MIDI ; en USB, Web MIDI ne le transmet que si l'accès
 * a été accordé avec `sysex: true` (voir `initWebMidi()`).
 */
export function sendMidi(bytes: number[]): void {
  if (STATE.midiOutput) {
    if (bytes[0] === 0xF0 && !STATE.midiAccess?.sysexEnabled) {
      console.warn('SysEx non autorisé en USB (accès Web MIDI sans sysex) : message ignoré');
      return;
    }
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
  buildInstrumentPatchMessages(item, STATE.midiChannel).forEach(sendMidi);
}

export function sendVolume(val: number): void {
  sendMidi([0xB0 | STATE.midiChannel, 0x07, val]);
}

/** Volume MIDI (CC7, 0-127) : mémorisé puis envoyé au piano */
export function setMidiVolume(val: number): void {
  STATE.midiVolume = val;
  sendVolume(STATE.midiVolume);
}

// ═══════════════════════════════════════════════════════
// SYSEX ROLAND (réglages généraux du piano)
// ═══════════════════════════════════════════════════════
// Non documentés par Roland : format et adresses décodés sur le FP-30 par
// le projet fp30remote, vérifiés sur le FP-30X (voir docs/fp30x-midi.md).

/** Adresses DT1 (4 octets) */
export const ROLAND_ADDRESS = {
  /** 1 : contrôle à distance actif. Sans lui, le piano ignore les réglages envoyés ; il le perd à l'extinction */
  remoteControl: [0x01, 0x00, 0x03, 0x06],
  /** Ambiance (réverbération du son du clavier), 0 à 10 */
  ambience:      [0x01, 0x00, 0x02, 0x1A],
} as const;

/** Message DT1 (écriture d'un réglage) : `F0 41 10 00 00 00 28 12 <adresse> <valeurs> <somme> F7` */
export function buildRolandDt1(address: readonly number[], data: readonly number[]): number[] {
  const body = [...address, ...data];
  const sum = body.reduce((total, byte) => total + byte, 0);
  const checksum = (0x80 - (sum % 0x80)) & 0x7F;
  return [0xF0, 0x41, 0x10, 0x00, 0x00, 0x00, 0x28, 0x12, ...body, checksum, 0xF7];
}

/** À envoyer à chaque connexion, avant tout réglage en SysEx */
export function sendRolandRemoteControl(): void {
  sendMidi(buildRolandDt1(ROLAND_ADDRESS.remoteControl, [0x01]));
}

/** Ambiance du piano (0 à 10) : c'est elle qui donne la réverbération du son du clavier, pas le CC91 */
export function sendAmbience(value: number): void {
  const level = Math.max(0, Math.min(10, Math.round(value)));
  sendMidi(buildRolandDt1(ROLAND_ADDRESS.ambience, [level]));
}

/**
 * Arrêt d'urgence. Canal du clavier d'abord, avec All Sound Off (CC120) : il coupe tout
 * de suite, queues de réverbération comprises, alors qu'All Notes Off laisse sonner les
 * notes tenues par la pédale. Puis All Notes Off et Reset All Controllers sur les autres canaux.
 */
export function sendEmergencyStopMidi(): void {
  const main = STATE.midiChannel;
  sendMidi([0xB0 | main, 120, 0]); // All Sound Off
  sendMidi([0xB0 | main, 123, 0]); // All Notes Off
  sendMidi([0xB0 | main, 121, 0]); // Reset All Controllers
  for (let ch = 0; ch < 16; ch++) {
    if (ch === main) continue;
    sendMidi([0xB0 | ch, 123, 0]);
    sendMidi([0xB0 | ch, 121, 0]);
  }
}
