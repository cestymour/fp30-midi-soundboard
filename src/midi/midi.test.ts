/* ================================================================
   midi.test.ts — Octets MIDI envoyés au piano
================================================================ */

import { afterEach, describe, expect, it, vi } from 'vitest';
import { STATE } from '../state.svelte.ts';
import { MIDI_TABS } from '../config/midi.config.ts';
import { MIDI_FX_CONTROLS, applyMidiFxValue } from '../fx/midi-fx.ts';
import {
  ROLAND_ADDRESS, buildInstrumentPatchMessages, buildRolandDt1, sendAmbience, sendEmergencyStopMidi,
  sendInstrumentPatch, sendVolume,
} from './midi.ts';

afterEach(() => {
  STATE.midiOutput = null;
  STATE.midiAccess = null;
  STATE.bt = null;
  STATE.MIDI_CHANNEL = 3;
  vi.restoreAllMocks();
});

/** Fausse sortie USB qui enregistre les messages envoyés */
function mockUsbOutput(): number[][] {
  const sent: number[][] = [];
  STATE.midiOutput = { send: (bytes: number[]) => { sent.push([...bytes]); } } as unknown as MIDIOutput;
  return sent;
}

describe('sélection d\'instrument', () => {
  it('Bank Select MSB (CC0), LSB (CC32) puis Program Change en 0-based', () => {
    expect(buildInstrumentPatchMessages({ pc: 1, msb: 0, lsb: 68 }, 0)).toEqual([
      [0xB0, 0x00, 0],
      [0xB0, 0x20, 68],
      [0xC0, 0],
    ]);
  });

  it('utilise le canal MIDI', () => {
    expect(buildInstrumentPatchMessages({ pc: 47, msb: 121, lsb: 0 }, 3)).toEqual([
      [0xB3, 0x00, 121],
      [0xB3, 0x20, 0],
      [0xC3, 46],
    ]);
  });

  it('canal 4 par défaut : celui du son du clavier du FP-30X', () => {
    expect(STATE.MIDI_CHANNEL).toBe(3);
  });

  it('envoie le patch sur la sortie USB', () => {
    const sent = mockUsbOutput();
    sendInstrumentPatch({ id: 'harpe', name: 'Harpe', icon: '', pc: 47, msb: 121, lsb: 0 });
    expect(sent).toEqual([[0xB3, 0x00, 121], [0xB3, 0x20, 0], [0xC3, 46]]);
  });

  it('les patchs de la configuration sont des valeurs MIDI valides', () => {
    for (const tab of MIDI_TABS) {
      for (const item of tab.categories.flatMap(c => c.items)) {
        expect(item.pc, item.id).toBeGreaterThanOrEqual(1);
        expect(item.pc, item.id).toBeLessThanOrEqual(128);
        expect(item.msb, item.id).toBeGreaterThanOrEqual(0);
        expect(item.msb, item.id).toBeLessThanOrEqual(127);
        expect(item.lsb, item.id).toBeGreaterThanOrEqual(0);
        expect(item.lsb, item.id).toBeLessThanOrEqual(127);
      }
    }
  });
});

describe('routage USB / Bluetooth', () => {
  it('envoie en Bluetooth quand il n\'y a pas de sortie USB', () => {
    const send = vi.fn();
    STATE.bt = { status: 'connected', send } as unknown as typeof STATE.bt;
    sendVolume(100);
    expect(send).toHaveBeenCalledWith([0xB3, 0x07, 100]);
  });

  it('préfère la sortie USB au Bluetooth', () => {
    const sent = mockUsbOutput();
    const send = vi.fn();
    STATE.bt = { status: 'connected', send } as unknown as typeof STATE.bt;
    sendVolume(64);
    expect(sent).toEqual([[0xB3, 0x07, 64]]);
    expect(send).not.toHaveBeenCalled();
  });

  it('sans connexion, n\'envoie rien et prévient dans la console', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    sendVolume(64);
    expect(warn).toHaveBeenCalledWith('Pas de connexion MIDI active');
  });
});

describe('arrêt d\'urgence', () => {
  it('canal du clavier d\'abord, avec All Sound Off ; puis All Notes Off et Reset All Controllers partout', () => {
    const sent = mockUsbOutput();
    sendEmergencyStopMidi();
    expect(sent.slice(0, 3)).toEqual([[0xB3, 120, 0], [0xB3, 123, 0], [0xB3, 121, 0]]);
    expect(sent).toHaveLength(3 + 15 * 2);
    for (let ch = 0; ch < 16; ch++) {
      expect(sent, `canal ${ch + 1}`).toContainEqual([0xB0 | ch, 123, 0]);
      expect(sent, `canal ${ch + 1}`).toContainEqual([0xB0 | ch, 121, 0]);
    }
  });
});

describe('SysEx Roland', () => {
  it('DT1 Ambiance : adresse, valeur et somme de contrôle (message vérifié sur le FP-30X)', () => {
    expect(buildRolandDt1(ROLAND_ADDRESS.ambience, [10])).toEqual([
      0xF0, 0x41, 0x10, 0x00, 0x00, 0x00, 0x28, 0x12, 0x01, 0x00, 0x02, 0x1A, 10, 0x59, 0xF7,
    ]);
  });

  it('DT1 contrôle à distance', () => {
    expect(buildRolandDt1(ROLAND_ADDRESS.remoteControl, [1])).toEqual([
      0xF0, 0x41, 0x10, 0x00, 0x00, 0x00, 0x28, 0x12, 0x01, 0x00, 0x03, 0x06, 0x01, 0x75, 0xF7,
    ]);
  });

  it('la somme des octets d\'adresse, de valeur et de contrôle est un multiple de 128', () => {
    for (let value = 0; value <= 10; value++) {
      const msg = buildRolandDt1(ROLAND_ADDRESS.ambience, [value]);
      const sum = msg.slice(8, -1).reduce((a, b) => a + b, 0);
      expect(sum % 128).toBe(0);
    }
  });

  it('Ambiance bornée de 0 à 10', () => {
    const send = vi.fn();
    STATE.bt = { status: 'connected', send } as unknown as typeof STATE.bt;
    sendAmbience(14);
    sendAmbience(-3);
    expect(send.mock.calls[0][0][12]).toBe(10);
    expect(send.mock.calls[1][0][12]).toBe(0);
  });

  it('en USB, envoyé seulement si l\'accès Web MIDI autorise le SysEx', () => {
    const sent = mockUsbOutput();
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    STATE.midiAccess = { sysexEnabled: false } as MIDIAccess;
    sendAmbience(5);
    expect(sent).toEqual([]);
    expect(warn).toHaveBeenCalled();
    STATE.midiAccess = { sysexEnabled: true } as MIDIAccess;
    sendAmbience(5);
    expect(sent).toHaveLength(1);
    expect(sent[0][0]).toBe(0xF0);
  });
});

describe('effets piano', () => {
  it('la réverbération règle l\'Ambiance du piano (SysEx), les autres effets envoient un CC sur le canal 4', () => {
    const send = vi.fn();
    STATE.bt = { status: 'connected', send } as unknown as typeof STATE.bt;
    applyMidiFxValue(MIDI_FX_CONTROLS.find(c => c.key === 'reverb')!, 6);
    applyMidiFxValue(MIDI_FX_CONTROLS.find(c => c.key === 'chorus')!, 40);
    expect(send.mock.calls[0][0]).toEqual(buildRolandDt1(ROLAND_ADDRESS.ambience, [6]));
    expect(send.mock.calls[1][0]).toEqual([0xB3, 93, 40]);
  });
});
