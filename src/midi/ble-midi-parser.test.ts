/* ================================================================
   ble-midi-parser.test.ts — Décodage des paquets BLE MIDI
================================================================ */

import { describe, expect, it } from 'vitest';
import { parsePacket } from './ble-midi-parser.ts';
import type { MessageMidi, MessageMidiSysex } from './ble-midi-parser.ts';

const packet = (...bytes: number[]) => new Uint8Array(bytes);

describe('parsePacket', () => {
  it('message MIDI complet (header, timestamp, status, 2 octets)', () => {
    const info = parsePacket(packet(0x80, 0x81, 0x90, 60, 100));
    expect(info.events).toHaveLength(1);
    const ev = info.events[0] as MessageMidi;
    expect(ev.type).toBe('fullMidiMessage');
    expect([ev.midiStatus, ev.midiOne, ev.midiTwo]).toEqual([0x90, 60, 100]);
    expect(ev.timestamp).toBe(1);
  });

  it('running status : le status du message précédent est réutilisé', () => {
    const info = parsePacket(packet(0x80, 0x80, 0x90, 60, 100, 62, 90));
    expect(info.events.map(e => e.type)).toEqual(['fullMidiMessage', 'runningMidiMessage']);
    const second = info.events[1] as MessageMidi;
    expect([second.midiStatus, second.midiOne, second.midiTwo]).toEqual([0x90, 62, 90]);
  });

  it('plusieurs messages complets dans un même paquet', () => {
    const info = parsePacket(packet(0x80, 0x80, 0x90, 60, 100, 0x81, 0x80, 60, 0));
    expect(info.events.map(e => (e as MessageMidi).midiStatus)).toEqual([0x90, 0x80]);
  });

  it('sysex complet', () => {
    const info = parsePacket(packet(0x80, 0x80, 0xF0, 0x41, 0x10, 0x80, 0xF7));
    const ev = info.events[0] as MessageMidiSysex;
    expect(ev.type).toBe('sysex');
    expect(ev.isStart).toBe(true);
    expect(ev.isEnd).toBe(true);
    expect(Array.from(ev.data)).toEqual([0x41, 0x10]);
  });

  it('header invalide (bit 7 à 0) : aucun événement', () => {
    expect(parsePacket(packet(0x00, 0x80, 0x90, 60, 100)).events).toEqual([]);
  });
});

// Bug n° 8 (docs/bugs.md) : l'ancien parseur lisait toujours 2 octets de données
describe('parsePacket : longueur des messages et running status', () => {
  const bytes = (ev: unknown) => {
    const { midiStatus, midiOne, midiTwo } = ev as MessageMidi;
    return [midiStatus, midiOne, midiTwo];
  };

  it('Program Change (1 octet) suivi d\'un Note On', () => {
    const info = parsePacket(packet(0x80, 0x80, 0xC0, 5, 0x80, 0x90, 60, 100));
    expect(info.events.map(bytes)).toEqual([[0xC0, 5, undefined], [0x90, 60, 100]]);
  });

  it('Active Sensing (0 octet) ne fait pas perdre le Note Off qui suit', () => {
    const info = parsePacket(packet(0x80, 0x80, 0x80, 60, 64, 0x80, 0xFE, 0x80, 62, 64));
    expect(info.events.map(bytes)).toEqual([[0x80, 60, 64], [0xFE, undefined, undefined], [0x80, 62, 64]]);
  });

  it('accord relâché : plusieurs Note Off en running status, avec et sans timestamp', () => {
    const info = parsePacket(packet(0x80, 0x80, 0x90, 60, 0, 0x81, 62, 0, 64, 0));
    expect(info.events.map(bytes)).toEqual([[0x90, 60, 0], [0x90, 62, 0], [0x90, 64, 0]]);
  });

  it('le running status passe au paquet suivant', () => {
    const first  = parsePacket(packet(0x80, 0x80, 0x90, 60, 100));
    expect(first.runningStatus).toBe(0x90);
    const second = parsePacket(packet(0x80, 0x80, 60, 0, 62, 0), first.runningStatus);
    expect(second.events.map(bytes)).toEqual([[0x90, 60, 0], [0x90, 62, 0]]);
  });

  it('sans running status connu, des données seules sont ignorées', () => {
    const info = parsePacket(packet(0x80, 0x80, 60, 0));
    expect(info.events.map(e => e.type)).toEqual(['unknown']);
  });

  it('un message système commun annule le running status', () => {
    const info = parsePacket(packet(0x80, 0x80, 0x90, 60, 100, 0x80, 0xF6, 0x80, 62, 0));
    expect(info.events.map(e => e.type)).toEqual(['fullMidiMessage', 'fullMidiMessage', 'unknown']);
  });
});
