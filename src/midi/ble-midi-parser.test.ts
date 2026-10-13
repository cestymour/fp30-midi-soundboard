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
