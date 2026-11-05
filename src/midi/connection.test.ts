/* ================================================================
   connection.test.ts — Choix de connexion : un choix plus récent
   l'emporte sur une connexion Bluetooth encore en cours (bug n° 15)
================================================================ */

import { afterEach, describe, expect, it, vi } from 'vitest';
import { STATE } from '../state.svelte.ts';
import { MIDI_SELECT_BLUETOOTH, MIDI_SELECT_NONE, selectMidiConnection } from './connection.ts';
import { ROLAND_ADDRESS, buildRolandDt1 } from './midi.ts';
import { bindMidiConnectionUI, instruments } from '../ui/midi-ui.svelte.ts';

bindMidiConnectionUI();

afterEach(() => {
  STATE.bt = null;
  STATE.midiOutput = null;
  STATE.midiAccess = null;
  STATE.currentConnectionType = null;
  instruments.active = null;
  vi.restoreAllMocks();
});

/** Faux Bluetooth dont la connexion reste en cours jusqu'à finish() */
function pendingBluetooth() {
  let finish = () => {};
  const bt = {
    status: 'idle',
    knownDeviceName: 'FP-30X',
    reconnect: vi.fn(() => {
      bt.status = 'connecting';
      return new Promise<void>(resolve => { finish = resolve; });
    }),
    connect: vi.fn(),
    disconnect: vi.fn(() => { bt.status = 'idle'; }),
    send: vi.fn(),
  };
  STATE.bt = bt as unknown as typeof STATE.bt;
  return { bt, finish: () => finish() };
}

function usbAccess() {
  const output = { id: 'usb-1', name: 'Roland Digital Piano', send: vi.fn() };
  STATE.midiAccess = { outputs: new Map([[output.id, output]]), sysexEnabled: true } as unknown as MIDIAccess;
  return output;
}

describe('selectMidiConnection', () => {
  it('Bluetooth avec un piano connu : reconnexion sans sélecteur', async () => {
    const { bt, finish } = pendingBluetooth();
    const done = selectMidiConnection(MIDI_SELECT_BLUETOOTH);
    finish();
    await done;
    expect(bt.reconnect).toHaveBeenCalled();
    expect(bt.connect).not.toHaveBeenCalled();
  });

  it('USB choisi pendant une connexion Bluetooth : la connexion est annulée et l\'USB reste choisi', async () => {
    const { bt, finish } = pendingBluetooth();
    const output = usbAccess();
    const bluetooth = selectMidiConnection(MIDI_SELECT_BLUETOOTH);
    await selectMidiConnection(output.id);
    expect(bt.disconnect).toHaveBeenCalled();
    finish();
    await bluetooth;
    expect(STATE.currentConnectionType).toBe('usb');
    expect(STATE.midiOutput).toBe(output);
  });

  it('« aucune connexion » pendant une connexion Bluetooth : la connexion est annulée', async () => {
    const { bt, finish } = pendingBluetooth();
    const bluetooth = selectMidiConnection(MIDI_SELECT_BLUETOOTH);
    await selectMidiConnection(MIDI_SELECT_NONE);
    expect(bt.disconnect).toHaveBeenCalled();
    finish();
    await bluetooth;
    expect(STATE.currentConnectionType).toBeNull();
  });
});

describe('état renvoyé au piano à la connexion (bug n° 13)', () => {
  it('contrôle à distance, volume, puis l\'instrument surligné et les effets', async () => {
    const output = usbAccess();
    instruments.active = { id: 'harpe', name: 'Harpe', icon: '', pc: 47, msb: 121, lsb: 0 };
    STATE.midiVolume = 90;
    await selectMidiConnection(output.id);
    const sent = output.send.mock.calls.map(([bytes]) => Array.from(bytes as number[]));
    expect(sent[0]).toEqual(buildRolandDt1(ROLAND_ADDRESS.remoteControl, [1]));
    expect(sent[1]).toEqual([0xB3, 0x07, 90]);
    expect(sent.slice(2, 5)).toEqual([[0xB3, 0x00, 121], [0xB3, 0x20, 0], [0xC3, 46]]);
    expect(sent).toContainEqual(buildRolandDt1(ROLAND_ADDRESS.ambience, [1]));
    expect(sent).toContainEqual([0xB3, 93, 0]);
    expect(sent).toHaveLength(5 + 7);
  });
});
