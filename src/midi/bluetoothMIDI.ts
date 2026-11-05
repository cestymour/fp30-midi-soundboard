// bluetoothMIDI.ts — Connexion Bluetooth MIDI (vanilla JS, sans React)

import { parsePacket } from './ble-midi-parser.ts';
import type { MessageMidi } from './ble-midi-parser.ts';

export type BluetoothStatus = 'idle' | 'unsupported' | 'scanning' | 'connecting' | 'connected' | 'error';

export interface BluetoothMIDIOptions {
  onNoteOn?:         (note: number) => void;
  onNoteOff?:        (note: number) => void;
  onStatusChange?:   (status: BluetoothStatus, error: string | null) => void;
  onError?:          (error: string | null) => void;
}

const MIDI_SERVICE_UUID        = '03b80e5a-ede8-4b33-a751-6ce34ec4c700';
const MIDI_CHARACTERISTIC_UUID = '7772e5db-3868-4112-a1a9-f2669d106bf3';
const MAX_RETRIES              = 3;
/** Taille d'un paquet BLE MIDI sans négociation de MTU (MTU 23 - 3 octets d'en-tête ATT) */
const BLE_PACKET_SIZE          = 20;

/**
 * Emballe un message MIDI en paquets BLE MIDI.
 * - message court : `[en-tête, horodatage, …octets]`, un seul paquet ;
 * - SysEx (`F0 … F7`) : `[en-tête, horodatage, F0, …données]`, puis des paquets de
 *   continuation `[en-tête, …données]` si le message dépasse `packetSize`. Le `F7`
 *   final est précédé de son propre horodatage, comme l'exige la norme BLE MIDI.
 * Horodatage à 0 : en-tête 0x80, horodatage 0x80.
 */
export function buildBleMidiPackets(bytes: readonly number[], packetSize = BLE_PACKET_SIZE): Uint8Array<ArrayBuffer>[] {
  const HEADER = 0x80;
  const TIMESTAMP = 0x80;
  if (bytes[0] !== 0xF0) return [new Uint8Array([HEADER, TIMESTAMP, ...bytes])];

  const data = bytes.slice(1, bytes[bytes.length - 1] === 0xF7 ? -1 : undefined);
  const packets: number[][] = [];
  let packet = [HEADER, TIMESTAMP, 0xF0];
  for (const byte of data) {
    if (packet.length >= packetSize) {
      packets.push(packet);
      packet = [HEADER];
    }
    packet.push(byte);
  }
  if (packet.length + 2 > packetSize) {
    packets.push(packet);
    packet = [HEADER];
  }
  packet.push(TIMESTAMP, 0xF7);
  packets.push(packet);
  return packets.map(p => new Uint8Array(p));
}

export class BluetoothMIDI {
  #status: BluetoothStatus = 'idle';
  #error: string | null = null;
  #device: BluetoothDevice | null = null;
  #server: BluetoothRemoteGATTServer | null = null;
  #characteristic: BluetoothRemoteGATTCharacteristic | null = null;
  #attemptId     = 0;
  #onGattDisconn: (() => void) | null = null;
  #onCharChange: ((event: Event) => void) | null = null;
  #onNoteOn: ((note: number) => void) | null = null;
  #onNoteOff: ((note: number) => void) | null = null;
  #onStatusChange: ((status: BluetoothStatus, error: string | null) => void) | null = null;
  #onError: ((error: string | null) => void) | null = null;
  /** Une seule écriture GATT à la fois sur cette caractéristique (sinon « already in progress »). */
  #writeQueue: Promise<void> = Promise.resolve();
  /** Running status du dernier paquet reçu : un paquet peut commencer sans statut */
  #runningStatus = -1;

  constructor({ onNoteOn, onNoteOff, onStatusChange, onError }: BluetoothMIDIOptions = {}) {
    this.#onNoteOn       = onNoteOn       ?? null;
    this.#onNoteOff      = onNoteOff      ?? null;
    this.#onStatusChange = onStatusChange ?? null;
    this.#onError        = onError        ?? null;
    if (!navigator.bluetooth) this.#setStatus('unsupported');
  }

  get status(): BluetoothStatus { return this.#status; }
  get error(): string | null    { return this.#error; }

  /**
   * Envoie un message MIDI (SysEx compris) via la caractéristique BLE,
   * emballé par `buildBleMidiPackets()` : une écriture GATT par paquet.
   */
  send(midiBytes: number[]): void {
    if (!this.#characteristic || this.#status !== 'connected') return;
    console.log('MIDI OUT (BT):', Array.from(midiBytes));
    for (const packet of buildBleMidiPackets(midiBytes)) this.#write(packet);
  }

  #write(packet: Uint8Array<ArrayBuffer>): void {
    const char = this.#characteristic!;
    this.#writeQueue = this.#writeQueue
      .then(() => {
        if (!this.#characteristic) return;
        if (typeof char.writeValueWithoutResponse === 'function') {
          return char.writeValueWithoutResponse(packet).catch((err: Error) => {
            console.warn('writeValueWithoutResponse échoué, fallback writeValueWithResponse:', err.message);
            return char.writeValueWithResponse(packet);
          });
        }
        if (typeof char.writeValueWithResponse === 'function')
          return char.writeValueWithResponse(packet);
        if (typeof char.writeValue === 'function') return char.writeValue(packet);
        console.error('Aucune méthode write disponible sur la caractéristique BLE');
      })
      .catch((e: Error) => console.error('MIDI OUT (BT) échoué:', e.message));
  }

  // ─── Connexion ───────────────────────────────────────────────────────────

  async connect(): Promise<void> {
    if (!navigator.bluetooth) {
      this.#setStatus('unsupported', 'Web Bluetooth non supporté par ce navigateur.');
      return;
    }
    await this.#cleanup();
    this.#setStatus('scanning', null);
    const attemptId = ++this.#attemptId; // snapshot local, immuable pour cette tentative
    try {
      const device = await navigator.bluetooth.requestDevice({
        filters:          [{ services: [MIDI_SERVICE_UUID] }],
        optionalServices: [MIDI_SERVICE_UUID],
      });
      this.#device = device;
      this.#characteristic = null;

      const onGattDisconnected = () => {
        if (attemptId !== this.#attemptId) return;
        this.#removeCharListener();
        this.#characteristic = null;
        this.#server = null;
        this.#setStatus('idle', null);
      };
      this.#onGattDisconn = onGattDisconnected;
      device.addEventListener('gattserverdisconnected', onGattDisconnected);

      for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
        if (attemptId !== this.#attemptId) return;
        try {
          this.#setStatus('connecting', null);
          const server = await device.gatt!.connect();
          this.#server = server;
          const service = await server.getPrimaryService(MIDI_SERVICE_UUID);
          const characteristic = await service.getCharacteristic(MIDI_CHARACTERISTIC_UUID);
          this.#characteristic = characteristic;
          await characteristic.startNotifications();

          this.#runningStatus = -1;
          const handler = (event: Event) => {
            const value = (event?.target as BluetoothRemoteGATTCharacteristic | null)?.value;
            if (!value) return;
            const packet = new Uint8Array(value.buffer, value.byteOffset, value.byteLength);
            let info;
            try { info = parsePacket(packet, this.#runningStatus); } catch { return; }
            this.#runningStatus = info.runningStatus;
            if (!info?.events?.length) return;
            for (const ev of info.events) {
              // Les champs MIDI sont absents des messages 'sysex' et 'unknown' : écartés par les tests typeof
              const { midiStatus: status, midiOne: one, midiTwo: two } = ev as Partial<MessageMidi>;
              if (typeof status !== 'number' || typeof one !== 'number') continue;
              const msgType = status & 0xf0;
              const hasTwo = typeof two === 'number';
              if (!hasTwo && msgType !== 0xc0 && msgType !== 0xd0) continue;
              console.log('MIDI IN (BT):', hasTwo ? [status, one, two] : [status, one]);
              if (hasTwo) {
                if (msgType === 0x90 && two! > 0)                              this.#onNoteOn?.(one);
                else if (msgType === 0x80 || (msgType === 0x90 && two === 0)) this.#onNoteOff?.(one);
              }
            }
          };
          this.#onCharChange = handler;
          characteristic.addEventListener('characteristicvaluechanged', handler);
          if (attemptId !== this.#attemptId) return;
          this.#setStatus('connected', null);
          break;
        } catch (err) {
          if (attemptId !== this.#attemptId) return;
          const msg = (err as Error | undefined)?.message ?? '';
          const isGattError = msg.includes('GATT Server is disconnected')
                           || msg.includes('Cannot retrieve services')
                           || msg.includes('disconnected');
          if (isGattError && attempt < MAX_RETRIES - 1) {
            await new Promise(r => setTimeout(r, 250 * (attempt + 1)));
            continue;
          }
          throw err;
        }
      }
    } catch (err) {
      // On vérifie uniquement que cette tentative est toujours la courante
      if (attemptId !== this.#attemptId) return;
      const error = err as Error;
      if (error.name === 'NotFoundError') {
        this.#setStatus('idle', null);
      } else {
        this.#setStatus('error', error.message || 'Erreur de connexion Bluetooth.');
        this.#onError?.(this.#error);
      }
    }
  }

  disconnect(): void {
    this.#cleanup();
    this.#setStatus('idle', null);
  }

  async #cleanup(): Promise<void> {
    this.#writeQueue = Promise.resolve();
    if (this.#device && this.#onGattDisconn)
      this.#device.removeEventListener('gattserverdisconnected', this.#onGattDisconn);
    this.#onGattDisconn = null;
    this.#removeCharListener();
    if (this.#characteristic) try { await this.#characteristic.stopNotifications().catch(() => {}); } catch {}
    this.#characteristic = null;
    if (this.#server?.connected) try { this.#server.disconnect(); } catch {}
    this.#server = null;
    this.#device = null;
  }

  #removeCharListener(): void {
    if (this.#characteristic && this.#onCharChange)
      try { this.#characteristic.removeEventListener('characteristicvaluechanged', this.#onCharChange); } catch {}
    this.#onCharChange = null;
  }

  #setStatus(status: BluetoothStatus, error: string | null = null): void {
    this.#status = status;
    this.#error  = error;
    this.#onStatusChange?.(status, error);
  }
}
