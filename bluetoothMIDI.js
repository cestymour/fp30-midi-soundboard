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
  /** Une seule écriture GATT à la fois sur cette caractéristique (sinon « already in progress »). */
  #writeQueue    = Promise.resolve();
  /** Même idée que midiOutput.send(event.data) en USB : renvoyer le MIDI entrant vers le piano (FP-30). */
  #loopbackIncoming = true;

  constructor({ onNoteOn, onNoteOff, onStatusChange, onError, loopbackIncoming = true } = {}) {
    this.#onNoteOn       = onNoteOn       ?? null;
    this.#onNoteOff      = onNoteOff      ?? null;
    this.#onStatusChange = onStatusChange ?? null;
    this.#onError        = onError        ?? null;
    this.#loopbackIncoming = loopbackIncoming;
    if (!navigator.bluetooth) this.#setStatus('unsupported');
  }

  get status() { return this.#status; }
  get error()  { return this.#error; }

  /**
   * Envoie des octets MIDI via la caractéristique BLE.
   * Le format BLE MIDI impose : [header, timestamp, ...midiBytes]
   * header    = 0x80 (bit7=1, bit6=1, timestamp high = 0)
   * timestamp = 0x80 (bit7=1, timestamp low = 0)
   *
   * Banque + Program Change : utiliser sendBundled() — un seul paquet MMA multi-msg,
   * plus fiable que 3 écritures séquentielles pour le moteur du FP-30.
   */
  #encodeBleMidiMultiPacket(messageByteArrays) {
    const out = [];
    out.push(0x80);
    let t = 0;
    for (const msg of messageByteArrays) {
      out.push(0x80 | (t & 0x7f));
      t = (t + 1) & 0x7f;
      for (let i = 0; i < msg.length; i++) out.push(msg[i]);
    }
    return new Uint8Array(out);
  }

  /**
   * @param {number[]} midiBytes
   * @param {{ quiet?: boolean }} [opts] — quiet: pas de log (loopback notes)
   */
  send(midiBytes, opts = {}) {
    if (!this.#characteristic || this.#status !== 'connected') return;
    const packet = new Uint8Array([0x80, 0x80, ...midiBytes]);
    if (!opts.quiet) console.log('MIDI OUT (BT):', Array.from(midiBytes));
    const char = this.#characteristic;
    this.#writeQueue = this.#writeQueue
      .then(() => {
        if (!this.#characteristic) return;
        if (typeof char.writeValueWithoutResponse === 'function') {
          return char.writeValueWithoutResponse(packet).catch(err => {
            console.warn('writeValueWithoutResponse échoué, fallback writeValueWithResponse:', err.message);
            return char.writeValueWithResponse(packet);
          });
        }
        if (typeof char.writeValueWithResponse === 'function')
          return char.writeValueWithResponse(packet);
        if (typeof char.writeValue === 'function') return char.writeValue(packet);
        console.error('Aucune méthode write disponible sur la caractéristique BLE');
      })
      .catch(e => console.error('MIDI OUT (BT) échoué:', e.message));
  }

  /** Reconstitue les octets MIDI (comme event.data Web MIDI) pour le loopback. */
  #bytesForLoopback(ev) {
    if (ev?.type === 'sysex') return null;
    const status = ev.midiStatus, one = ev.midiOne, two = ev.midiTwo;
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
                if (msgType === 0x90 && two > 0)                              this.#onNoteOn?.(one);
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
