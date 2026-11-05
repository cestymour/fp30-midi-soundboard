/* ================================================================
   connection.test.ts — Choix de connexion : un choix plus récent
   l'emporte sur une connexion Bluetooth encore en cours (bug n° 15)
================================================================ */

import { afterEach, describe, expect, it, vi } from 'vitest';
import { STATE } from '../state.svelte.ts';
import { MIDI_SELECT_BLUETOOTH, MIDI_SELECT_NONE, initWebMidi, selectMidiConnection } from './connection.ts';
import { ROLAND_ADDRESS, buildRolandDt1 } from './midi.ts';
import { bindMidiConnectionUI, instruments } from '../ui/midi-ui.svelte.ts';

bindMidiConnectionUI();

afterEach(() => {
  vi.unstubAllGlobals();
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

describe('câble USB débranché puis rebranché', () => {
  function fakeAccess() {
    const piano = { id: 'usb-1', name: 'Roland Digital Piano', state: 'connected', send: vi.fn() };
    const access = {
      outputs: new Map([[piano.id, piano]]),
      sysexEnabled: true,
      onstatechange: null as null | (() => void),
    };
    vi.stubGlobal('navigator', { requestMIDIAccess: vi.fn(async () => access) });
    const flush = async () => { for (let i = 0; i < 10; i++) await Promise.resolve(); };
    return { piano, access, flush };
  }

  it('débranché : plus de sortie, badge « Non connecté » ; rebranché : reconnexion automatique', async () => {
    const { piano, access, flush } = fakeAccess();
    initWebMidi();
    await flush();
    expect(STATE.currentConnectionType).toBe('usb');

    piano.state = 'disconnected';
    access.onstatechange!();
    expect(STATE.currentConnectionType).toBeNull();
    expect(STATE.midiOutput).toBeNull();

    piano.state = 'connected';
    piano.send.mockClear();
    access.onstatechange!();
    await flush();
    expect(STATE.currentConnectionType).toBe('usb');
    expect(STATE.midiOutput).toBe(piano);
    expect(piano.send.mock.calls[0][0]).toEqual(buildRolandDt1(ROLAND_ADDRESS.remoteControl, [1]));
  });

  it('un autre changement de ports ne reconnecte pas un piano laissé de côté', async () => {
    const { access, flush } = fakeAccess();
    initWebMidi();
    await flush();
    await selectMidiConnection(MIDI_SELECT_NONE);
    access.onstatechange!(); // par exemple : un autre appareil branché
    await flush();
    expect(STATE.currentConnectionType).toBeNull();
  });
});
