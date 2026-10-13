// bluetoothMIDI.ts — Connexion Bluetooth MIDI (vanilla JS, sans React)

import { parsePacket } from './ble-midi-parser.ts';
import type { BleMidiEvent, MessageMidi } from './ble-midi-parser.ts';

export type BluetoothStatus = 'idle' | 'unsupported' | 'scanning' | 'connecting' | 'connected' | 'error';

export interface BluetoothMIDIOptions {
  onNoteOn?:         (note: number) => void;
  onNoteOff?:        (note: number) => void;
  onStatusChange?:   (status: BluetoothStatus, error: string | null) => void;
  onError?:          (error: string | null) => void;
  loopbackIncoming?: boolean;
}

const MIDI_SERVICE_UUID        = '03b80e5a-ede8-4b33-a751-6ce34ec4c700';
const MIDI_CHARACTERISTIC_UUID = '7772e5db-3868-4112-a1a9-f2669d106bf3';
const MAX_RETRIES              = 3;

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
  /** Loopback : renvoyer le MIDI entrant vers le piano (comme midiOutput.send(event.data) en USB). */
  #loopbackIncoming = true;

  constructor({ onNoteOn, onNoteOff, onStatusChange, onError, loopbackIncoming = true }: BluetoothMIDIOptions = {}) {
    this.#onNoteOn       = onNoteOn       ?? null;
    this.#onNoteOff      = onNoteOff      ?? null;
    this.#onStatusChange = onStatusChange ?? null;
    this.#onError        = onError        ?? null;
    this.#loopbackIncoming = loopbackIncoming;
    if (!navigator.bluetooth) this.#setStatus('unsupported');
  }

  get status(): BluetoothStatus { return this.#status; }
  get error(): string | null    { return this.#error; }

  /**
   * Envoie des octets MIDI via la caractéristique BLE.
   * Format BLE MIDI : [header, timestamp, ...midiBytes]
   * header    = 0x80 (bit7=1, bit6=1, timestamp high = 0)
   * timestamp = 0x80 (bit7=1, timestamp low = 0)
   * opts.quiet : pas de log (loopback notes)
   */
  send(midiBytes: number[], opts: { quiet?: boolean } = {}): void {
    if (!this.#characteristic || this.#status !== 'connected') return;
    const packet = new Uint8Array([0x80, 0x80, ...midiBytes]);
    if (!opts.quiet) console.log('MIDI OUT (BT):', Array.from(midiBytes));
    const char = this.#characteristic;
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

  /** Reconstitue les octets MIDI bruts (comme event.data Web MIDI) pour le loopback. */
  #bytesForLoopback(ev: BleMidiEvent): number[] | null {
    if (ev?.type === 'sysex') return null;
    // Les champs MIDI sont absents des messages 'unknown' : écartés par les tests typeof ci-dessous
    const { midiStatus: status, midiOne: one, midiTwo: two } = ev as Partial<MessageMidi>;
    if (typeof status !== 'number' || typeof one !== 'number') return null;
    const hi = status & 0xf0;
    if (hi === 0xc0 || hi === 0xd0) return [status, one];
    if (hi >= 0x80 && hi <= 0xe0) {
      if (typeof two !== 'number') return null;
      return [status, one, two];
    }
    return null;
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

          const handler = (event: Event) => {
            const value = (event?.target as BluetoothRemoteGATTCharacteristic | null)?.value;
            if (!value) return;
            const packet = new Uint8Array(value.buffer, value.byteOffset, value.byteLength);
            let info;
            try { info = parsePacket(packet); } catch { return; }
            if (!info?.events?.length) return;
            for (const ev of info.events) {
              // Les champs MIDI sont absents des messages 'sysex' et 'unknown' : écartés par les tests typeof
              const { midiStatus: status, midiOne: one, midiTwo: two } = ev as Partial<MessageMidi>;
              if (this.#loopbackIncoming) {
                const lb = this.#bytesForLoopback(ev);
                if (lb) this.send(lb, { quiet: true });
              }
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
