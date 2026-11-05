/* ================================================================
   bluetoothMIDI.test.ts — Emballage des messages en paquets BLE MIDI
================================================================ */

import { describe, expect, it } from 'vitest';
import { buildBleMidiPackets } from './bluetoothMIDI.ts';

const asArrays = (packets: Uint8Array[]) => packets.map(p => Array.from(p));

describe('buildBleMidiPackets', () => {
  it('message court : en-tête et horodatage, puis le message', () => {
    expect(asArrays(buildBleMidiPackets([0xB3, 7, 100]))).toEqual([[0x80, 0x80, 0xB3, 7, 100]]);
  });

  it('SysEx court : un seul paquet, F7 précédé de son horodatage (paquet vérifié sur le FP-30X)', () => {
    const dt1 = [0xF0, 0x41, 0x10, 0x00, 0x00, 0x00, 0x28, 0x12, 0x01, 0x00, 0x02, 0x1A, 10, 0x59, 0xF7];
    expect(asArrays(buildBleMidiPackets(dt1))).toEqual([
      [0x80, 0x80, 0xF0, 0x41, 0x10, 0x00, 0x00, 0x00, 0x28, 0x12, 0x01, 0x00, 0x02, 0x1A, 10, 0x59, 0x80, 0xF7],
    ]);
  });

  it('SysEx long : paquets de continuation sans horodatage, aucun paquet au-delà de la taille', () => {
    const data = Array.from({ length: 30 }, (_, i) => i);
    const packets = asArrays(buildBleMidiPackets([0xF0, ...data, 0xF7], 20));
    expect(packets.every(p => p.length <= 20)).toBe(true);
    expect(packets[0].slice(0, 3)).toEqual([0x80, 0x80, 0xF0]);
    expect(packets.slice(1).every(p => p[0] === 0x80)).toBe(true);
    expect(packets.at(-1)!.slice(-2)).toEqual([0x80, 0xF7]);
    // Les données se retrouvent dans l'ordre, sans perte
    const body = [packets[0].slice(3), ...packets.slice(1).map(p => p.slice(1))].flat().slice(0, -2);
    expect(body).toEqual(data);
  });

  it('SysEx dont le F7 ne tient plus dans le paquet : F7 seul dans un dernier paquet', () => {
    const data = Array.from({ length: 17 }, (_, i) => i); // 3 + 17 = 20 octets : paquet plein
    const packets = asArrays(buildBleMidiPackets([0xF0, ...data, 0xF7], 20));
    expect(packets).toHaveLength(2);
    expect(packets[0]).toHaveLength(20);
    expect(packets[1]).toEqual([0x80, 0x80, 0xF7]);
  });
});
