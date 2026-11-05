/* ================================================================
   connection.test.ts — Choix de connexion : un choix plus récent
   l'emporte sur une connexion Bluetooth encore en cours (bug n° 15)
================================================================ */

import { afterEach, describe, expect, it, vi } from 'vitest';
import { STATE } from '../state.svelte.ts';
import { MIDI_SELECT_BLUETOOTH, MIDI_SELECT_NONE, selectMidiConnection } from './connection.ts';

afterEach(() => {
  STATE.bt = null;
  STATE.midiOutput = null;
  STATE.midiAccess = null;
  STATE.currentConnectionType = null;
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
