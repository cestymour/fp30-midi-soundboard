/* ================================================================
   bluetoothMIDI.test.ts — Emballage des messages en paquets BLE MIDI,
   connexion, reconnexion automatique (faux piano Bluetooth)
================================================================ */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { BluetoothMIDI, buildBleMidiPackets, errorCode } from './bluetoothMIDI.ts';
import type { BluetoothStatus } from './bluetoothMIDI.ts';

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

describe('errorCode (erreurs Web Bluetooth)', () => {
  const error = (name: string, message = '') => Object.assign(new Error(message), { name });

  it.each([
    [error('NotFoundError', 'User cancelled the requestDevice() chooser.'), null],
    [error('NotFoundError', 'Bluetooth adapter not available.'), 'adapterOff'],
    [error('NotAllowedError'), 'denied'],
    [error('SecurityError'), 'denied'],
    [error('NetworkError', 'GATT Server is disconnected.'), 'failed'],
    [new Error('boom'), 'failed'],
    [undefined, 'failed'],
  ])('%o → %s', (err, code) => {
    expect(errorCode(err)).toBe(code);
  });
});

// ─── Faux piano ─────────────────────────────────────────────────────────

class FakeCharacteristic extends EventTarget {
  written: number[][] = [];
  startNotifications = vi.fn(async () => this);
  stopNotifications  = vi.fn(async () => this);
  writeValueWithoutResponse = vi.fn(async (data: Uint8Array) => { this.written.push(Array.from(data)); });
  writeValueWithResponse    = vi.fn(async () => {});
}

class FakeDevice extends EventTarget {
  id = 'fp30x';
  name = 'FP-30X';
  characteristic = new FakeCharacteristic();
  /** Nombre d'échecs à venir de gatt.connect() */
  failConnects = 0;
  /** Si défini, gatt.connect() reste en attente jusqu'à l'appel de release() */
  hold: { release: () => void } | null = null;
  getPrimaryServiceError: Error | null = null;
  gatt = {
    connected: false,
    connect: vi.fn(async () => {
      if (this.hold) await new Promise<void>(resolve => { this.hold!.release = resolve; });
      if (this.failConnects > 0) {
        this.failConnects--;
        throw Object.assign(new Error('Connection failed for unknown reason.'), { name: 'NetworkError' });
      }
      this.gatt.connected = true;
      return {
        getPrimaryService: async () => {
          if (this.getPrimaryServiceError) throw this.getPrimaryServiceError;
          return { getCharacteristic: async () => this.characteristic };
        },
      };
    }),
    disconnect: vi.fn(() => { this.gatt.connected = false; }),
  };
  /** Coupure non demandée (piano éteint) */
  drop(): void {
    this.gatt.connected = false;
    this.dispatchEvent(new Event('gattserverdisconnected'));
  }
}

let device: FakeDevice;
let requestDevice: ReturnType<typeof vi.fn>;
let statuses: BluetoothStatus[];
let storage: Map<string, string>;

function makeBt(): BluetoothMIDI {
  statuses = [];
  return new BluetoothMIDI({ onStatusChange: status => statuses.push(status) });
}

/** Laisse passer les promesses en attente (sans faire avancer les minuteries) */
const flush = async () => { for (let i = 0; i < 20; i++) await Promise.resolve(); };

beforeEach(() => {
  device = new FakeDevice();
  requestDevice = vi.fn(async () => device);
  storage = new Map();
  vi.stubGlobal('navigator', { bluetooth: { requestDevice, getDevices: async () => [device] } });
  vi.stubGlobal('localStorage', {
    getItem: (k: string) => storage.get(k) ?? null,
    setItem: (k: string, v: string) => { storage.set(k, v); },
  });
  vi.spyOn(console, 'log').mockImplementation(() => {});
  vi.spyOn(console, 'warn').mockImplementation(() => {});
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('connexion', () => {
  it('sélecteur puis connexion ; le piano est mémorisé pour le prochain lancement', async () => {
    const bt = makeBt();
    await bt.connect();
    expect(statuses).toEqual(['scanning', 'connecting', 'connected']);
    expect(bt.knownDeviceName).toBe('FP-30X');
    expect(storage.get('fp30-soundboard.bluetoothDevice')).toBe('fp30x');
  });

  it('sélecteur fermé sans choisir : retour au repos, sans erreur', async () => {
    requestDevice.mockRejectedValueOnce(Object.assign(new Error('User cancelled'), { name: 'NotFoundError' }));
    const bt = makeBt();
    await bt.connect();
    expect(bt.status).toBe('idle');
    expect(bt.error).toBeNull();
  });

  it('envoie un SysEx en un paquet BLE MIDI', async () => {
    const bt = makeBt();
    await bt.connect();
    bt.send([0xF0, 0x41, 0x10, 0xF7]);
    await flush();
    expect(device.characteristic.written).toEqual([[0x80, 0x80, 0xF0, 0x41, 0x10, 0x80, 0xF7]]);
  });

  it('reconnect() : se reconnecte au piano connu sans rouvrir le sélecteur', async () => {
    const bt = makeBt();
    await bt.connect();
    bt.disconnect();
    expect(device.gatt.connected).toBe(false);
    await bt.reconnect();
    expect(bt.status).toBe('connected');
    expect(requestDevice).toHaveBeenCalledTimes(1);
  });

  it('le nom du piano est mémorisé aussi, pour le proposer quand getDevices manque', async () => {
    const bt = makeBt();
    await bt.connect();
    expect(storage.get('fp30-soundboard.bluetoothDeviceName')).toBe('FP-30X');
  });

  it('restore() sans getDevices (Edge) : piano proposé sous son nom, sans connexion automatique', async () => {
    vi.stubGlobal('navigator', { bluetooth: { requestDevice } });
    storage.set('fp30-soundboard.bluetoothDevice', 'fp30x');
    storage.set('fp30-soundboard.bluetoothDeviceName', 'FP-30X');
    const bt = makeBt();

    expect(await bt.restore()).toBe(true);
    expect(bt.knownDeviceName).toBe('FP-30X');
    expect(statuses).toEqual([]);
    expect(device.gatt.connected).toBe(false);

    // Choisi dans la liste : sélecteur limité à ce piano
    await bt.reconnect();
    expect(requestDevice).toHaveBeenCalledTimes(1);
    expect(requestDevice.mock.calls[0][0].filters).toEqual([{ name: 'FP-30X', services: [expect.any(String)] }]);
    expect(bt.status).toBe('connected');
  });

  it('restore() sans getDevices ni piano mémorisé : rien à proposer', async () => {
    vi.stubGlobal('navigator', { bluetooth: { requestDevice } });
    const bt = makeBt();
    expect(await bt.restore()).toBe(false);
    expect(bt.knownDeviceName).toBeNull();
  });

  it('« Autre appareil » : sélecteur complet, même si un piano est mémorisé par son nom', async () => {
    vi.stubGlobal('navigator', { bluetooth: { requestDevice } });
    storage.set('fp30-soundboard.bluetoothDeviceName', 'FP-30X');
    const bt = makeBt();
    await bt.restore();

    await bt.connect();
    expect(requestDevice.mock.calls[0][0].filters).toEqual([{ services: [expect.any(String)] }]);
  });

  it('restore() retrouve le dernier piano au lancement (getDevices)', async () => {
    storage.set('fp30-soundboard.bluetoothDevice', 'fp30x');
    const bt = makeBt();
    expect(await bt.restore()).toBe(true);
    expect(bt.knownDeviceName).toBe('FP-30X');
    await bt.reconnect();
    expect(bt.status).toBe('connected');
    expect(requestDevice).not.toHaveBeenCalled();
  });
});

describe('connexion annulée ou ratée', () => {
  it('déconnexion pendant la connexion : la tentative abandonne et referme le lien (bugs n° 15 et 16)', async () => {
    const bt = makeBt();
    device.hold = { release: () => {} };
    const pending = bt.connect();
    await flush();
    expect(bt.status).toBe('connecting');
    bt.disconnect();
    device.hold.release();
    device.hold = null;
    await pending;
    expect(bt.status).toBe('idle');
    expect(device.gatt.connected).toBe(false);
  });

  it('échec après l\'ouverture du lien (service absent) : erreur, et le lien est refermé (bug n° 16)', async () => {
    device.getPrimaryServiceError = new Error('No Services matching UUID found in Device.');
    const bt = makeBt();
    await bt.connect();
    expect(bt.status).toBe('error');
    expect(bt.error).toBe('failed');
    expect(device.gatt.connected).toBe(false);
  });
});

describe('reconnexion automatique', () => {
  it('coupure non demandée : reconnexion seule au piano', async () => {
    const bt = makeBt();
    await bt.connect();
    device.drop();
    await flush();
    expect(statuses.slice(-2)).toEqual(['reconnecting', 'connected']);
    expect(bt.status).toBe('connected');
  });

  it('piano injoignable : nouveaux essais pendant 20 s, puis « perdu », le piano restant connu', async () => {
    vi.useFakeTimers();
    const bt = makeBt();
    await bt.connect();
    device.failConnects = Infinity;
    device.drop();
    await flush();
    expect(bt.status).toBe('reconnecting');
    for (let i = 0; i < 12; i++) {
      await vi.advanceTimersByTimeAsync(2000);
    }
    expect(bt.status).toBe('lost');
    expect(device.gatt.connect.mock.calls.length).toBeGreaterThan(5);
    expect(bt.knownDeviceName).toBe('FP-30X');

    device.failConnects = 0;
    await bt.reconnect();
    expect(bt.status).toBe('connected');
  });

  it('déconnexion demandée : pas de reconnexion automatique', async () => {
    const bt = makeBt();
    await bt.connect();
    bt.disconnect();
    device.drop();
    await flush();
    expect(bt.status).toBe('idle');
  });
});
