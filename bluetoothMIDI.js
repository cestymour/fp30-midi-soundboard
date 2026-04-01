// bluetoothMIDI.js — Connexion Bluetooth MIDI (vanilla JS, sans React)
// Dépend de ble-midi-parser.bundle.js chargé avant ce script (expose window.BleMidiParser).

const MIDI_SERVICE_UUID        = '03b80e5a-ede8-4b33-a751-6ce34ec4c700';
const MIDI_CHARACTERISTIC_UUID = '7772e5db-3868-4112-a1a9-f2669d106bf3';
const MAX_RETRIES              = 3;

class BluetoothMIDI {
  #status        = 'idle';
  #error         = null;
  #device        = null;
  #server        = null;
  #characteristic= null;
  #attemptId     = 0;
  #onGattDisconn = null;
  #onCharChange  = null;
  #onNoteOn      = null;
  #onNoteOff     = null;
  #onStatusChange= null;
  #onError       = null;

  constructor({ onNoteOn, onNoteOff, onStatusChange, onError } = {}) {
    this.#onNoteOn       = onNoteOn       ?? null;
    this.#onNoteOff      = onNoteOff      ?? null;
    this.#onStatusChange = onStatusChange ?? null;
    this.#onError        = onError        ?? null;
    if (!navigator.bluetooth) this.#setStatus('unsupported');
  }

  get status() { return this.#status; }
  get error()  { return this.#error; }

  /**
   * Envoie des octets MIDI via la caractéristique BLE.
   * Le format BLE MIDI impose : [header, timestamp, ...midiBytes]
   * header    = 0x80 (bit7=1, bit6=1, timestamp high = 0)
   * timestamp = 0x80 (bit7=1, timestamp low = 0)
   */
  send(midiBytes) {
    if (!this.#characteristic || this.#status !== 'connected') return;
    const packet = new Uint8Array([0x80, 0x80, ...midiBytes]);
    console.log('MIDI OUT (BT):', Array.from(midiBytes));
    const char = this.#characteristic;
    if (typeof char.writeValueWithoutResponse === 'function') {
      char.writeValueWithoutResponse(packet)
        .catch(err => {
          console.warn('writeValueWithoutResponse échoué, fallback writeValueWithResponse:', err);
          char.writeValueWithResponse(packet).catch(e => console.error('writeValueWithResponse échoué:', e));
        });
    } else if (typeof char.writeValue === 'function') {
      char.writeValue(packet).catch(e => console.error('writeValue échoué:', e));
    } else {
      console.error('Aucune méthode write disponible sur la caractéristique BLE');
    }
  }

  // ─── Connexion ───────────────────────────────────────────────────────────

  async connect() {
    if (!navigator.bluetooth) {
      this.#setStatus('unsupported', 'Web Bluetooth non supporté par ce navigateur.');
      return;
    }
    await this.#cleanup();
    this.#setStatus('scanning', null);
    let attemptId = 0;
    try {
      const device = await navigator.bluetooth.requestDevice({
        filters:          [{ services: [MIDI_SERVICE_UUID] }],
        optionalServices: [MIDI_SERVICE_UUID],
      });
      this.#device = device;
      this.#characteristic = null;
      attemptId = ++this.#attemptId;

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
          const server = await device.gatt.connect();
          this.#server = server;
          const service = await server.getPrimaryService(MIDI_SERVICE_UUID);
          const characteristic = await service.getCharacteristic(MIDI_CHARACTERISTIC_UUID);
          this.#characteristic = characteristic;
          await characteristic.startNotifications();

          const handler = (event) => {
            const value = event?.target?.value;
            if (!value) return;
            const packet = new Uint8Array(value.buffer, value.byteOffset, value.byteLength);
            let info;
            try { info = window.BleMidiParser.parsePacket(packet); } catch { return; }
            if (!info?.events?.length) return;
            for (const ev of info.events) {
              const status = ev.midiStatus, one = ev.midiOne, two = ev.midiTwo;
              if (typeof status !== 'number' || typeof one !== 'number' || typeof two !== 'number') continue;
              console.log('MIDI IN (BT):', [status, one, two]);
              const msgType = status & 0xf0;
              if (msgType === 0x90 && two > 0)                              this.#onNoteOn?.(one);
              else if (msgType === 0x80 || (msgType === 0x90 && two === 0)) this.#onNoteOff?.(one);
            }
          };
          this.#onCharChange = handler;
          characteristic.addEventListener('characteristicvaluechanged', handler);
          if (attemptId !== this.#attemptId) return;
          this.#setStatus('connected', null);
          break;
        } catch (err) {
          if (attemptId !== this.#attemptId) return;
          const msg = err?.message ?? '';
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
      if (attemptId !== 0 && attemptId !== this.#attemptId) return;
      if (err.name === 'NotFoundError') {
        this.#setStatus('idle', null);
      } else {
        this.#setStatus('error', err.message || 'Erreur de connexion Bluetooth.');
        this.#onError?.(this.#error);
      }
    }
  }

  disconnect() {
    this.#cleanup();
    this.#setStatus('idle', null);
  }

  async #cleanup() {
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

  #removeCharListener() {
    if (this.#characteristic && this.#onCharChange)
      try { this.#characteristic.removeEventListener('characteristicvaluechanged', this.#onCharChange); } catch {}
    this.#onCharChange = null;
  }

  #setStatus(status, error = null) {
    this.#status = status;
    this.#error  = error;
    this.#onStatusChange?.(status, error);
  }
}
