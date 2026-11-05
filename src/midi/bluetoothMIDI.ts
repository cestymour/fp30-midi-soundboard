// bluetoothMIDI.ts — Connexion Bluetooth MIDI (vanilla JS, sans React)

import { parsePacket } from './ble-midi-parser.ts';
import type { MessageMidi } from './ble-midi-parser.ts';

/**
 * - idle : pas de connexion (ou déconnexion demandée)
 * - scanning : sélecteur d'appareils du navigateur ouvert
 * - connecting : ouverture du lien avec le piano
 * - reconnecting : coupure non demandée, reconnexion automatique en cours
 * - lost : reconnexion automatique abandonnée
 * - error : échec de connexion (voir `error`)
 */
export type BluetoothStatus =
  'idle' | 'unsupported' | 'scanning' | 'connecting' | 'connected' | 'reconnecting' | 'lost' | 'error';

/**
 * - adapterOff : Bluetooth de la tablette désactivé ou absent
 * - denied : accès au Bluetooth refusé (paramètres du site)
 * - failed : connexion au piano impossible (souvent : déjà connecté à un autre appareil)
 */
export type BluetoothErrorCode = 'adapterOff' | 'denied' | 'failed';

export interface BluetoothMIDIOptions {
  onNoteOn?:         (note: number) => void;
  onNoteOff?:        (note: number) => void;
  onStatusChange?:   (status: BluetoothStatus, error: BluetoothErrorCode | null) => void;
}

const MIDI_SERVICE_UUID        = '03b80e5a-ede8-4b33-a751-6ce34ec4c700';
const MIDI_CHARACTERISTIC_UUID = '7772e5db-3868-4112-a1a9-f2669d106bf3';
/** Essais d'ouverture du lien GATT (« GATT Server is disconnected » arrive parfois juste après connect) */
const OPEN_RETRIES             = 3;
/** Reconnexion automatique après une coupure : durée totale, puis pause entre deux essais */
const RECONNECT_WINDOW_MS      = 20000;
const RECONNECT_DELAY_MS       = 2000;
/** Piano retrouvé au lancement (getDevices) : attente maximale de son annonce Bluetooth */
const ADVERTISEMENT_TIMEOUT_MS = 10000;
/** Identifiant du dernier piano choisi, pour le retrouver au lancement suivant */
const LAST_DEVICE_STORAGE_KEY  = 'fp30-soundboard.bluetoothDevice';

const wait = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms));

/**
 * Classe une erreur Web Bluetooth. `null` : sélecteur fermé sans choisir
 * (pas une erreur à afficher).
 */
export function errorCode(err: unknown): BluetoothErrorCode | null {
  const e = err as { name?: string; message?: string } | null | undefined;
  const message = e?.message ?? '';
  if (e?.name === 'NotFoundError') return /adapter/i.test(message) ? 'adapterOff' : null;
  if (e?.name === 'NotAllowedError' || e?.name === 'SecurityError') return 'denied';
  return 'failed';
}

/** Coupe le lien GATT d'un appareil s'il est ouvert (sans erreur s'il est déjà coupé) */
function disconnectGatt(device: BluetoothDevice | null): void {
  try {
    if (device?.gatt?.connected) device.gatt.disconnect();
  } catch {
    // déjà déconnecté
  }
}
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

/**
 * Connexion Bluetooth MIDI au piano, inspirée du contrôleur de chord-finder-midi
 * (`src/useBluetoothMIDI.js`).
 *
 * Chaque action (choix d'un piano, reconnexion, déconnexion) incrémente `#attempt` :
 * une opération asynchrone plus ancienne le voit et abandonne sans toucher à l'état.
 * `#target` est le piano auquel on veut être connecté : une ouverture de lien
 * périmée ne referme le lien GATT que si ce piano n'est plus voulu, et un échec
 * le referme toujours, pour ne jamais laisser le piano connecté sans personne pour
 * l'écouter (il n'accepte qu'une connexion BLE MIDI à la fois).
 *
 * Le dernier piano reste connu (`knownDeviceName`) après une coupure ou une
 * déconnexion : `reconnect()` s'y reconnecte sans repasser par le sélecteur, ce
 * qui ne demande pas de geste de l'utilisateur.
 */
export class BluetoothMIDI {
  #status: BluetoothStatus = 'idle';
  #error: BluetoothErrorCode | null = null;
  #attempt = 0;
  /** Dernier piano choisi (gardé après une coupure pour s'y reconnecter) */
  #device: BluetoothDevice | null = null;
  /** Piano voulu (null après une déconnexion demandée, ou pendant le sélecteur) */
  #target: BluetoothDevice | null = null;
  /** Piano retrouvé par getDevices, pas encore connecté depuis le lancement */
  #restored: BluetoothDevice | null = null;
  #characteristic: BluetoothRemoteGATTCharacteristic | null = null;
  #onCharChange: ((event: Event) => void) | null = null;
  #stopWatching: (() => void) | null = null;
  /** Numéro de l'action dont la boucle de reconnexion tourne */
  #reconnecting: number | null = null;
  #onNoteOn: ((note: number) => void) | null = null;
  #onNoteOff: ((note: number) => void) | null = null;
  #onStatusChange: ((status: BluetoothStatus, error: BluetoothErrorCode | null) => void) | null = null;
  /** Une seule écriture GATT à la fois sur cette caractéristique (sinon « already in progress »). */
  #writeQueue: Promise<void> = Promise.resolve();
  /** Running status du dernier paquet reçu : un paquet peut commencer sans statut */
  #runningStatus = -1;

  constructor({ onNoteOn, onNoteOff, onStatusChange }: BluetoothMIDIOptions = {}) {
    this.#onNoteOn       = onNoteOn       ?? null;
    this.#onNoteOff      = onNoteOff      ?? null;
    this.#onStatusChange = onStatusChange ?? null;
    if (!navigator.bluetooth) this.#setStatus('unsupported');
  }

  get status(): BluetoothStatus { return this.#status; }
  get error(): BluetoothErrorCode | null { return this.#error; }
  /** Nom du dernier piano choisi ou retrouvé au lancement (null si aucun) */
  get knownDeviceName(): string | null { return this.#device ? (this.#device.name || 'Piano') : null; }

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
        if (this.#characteristic !== char) return;
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

  // ─── Actions ─────────────────────────────────────────────────────────────

  /** Ouvre le sélecteur du navigateur (geste de l'utilisateur requis) et se connecte au piano choisi */
  async connect(): Promise<void> {
    if (!navigator.bluetooth) {
      this.#setStatus('unsupported');
      return;
    }
    const attempt = ++this.#attempt;
    this.#target = null; // aucun piano voulu tant que le sélecteur est ouvert
    this.#setStatus('scanning');
    let device: BluetoothDevice;
    try {
      device = await navigator.bluetooth.requestDevice({
        filters:          [{ services: [MIDI_SERVICE_UUID] }],
        optionalServices: [MIDI_SERVICE_UUID],
      });
    } catch (err) {
      if (attempt !== this.#attempt) return;
      const code = errorCode(err);
      this.#setStatus(code ? 'error' : 'idle', code);
      return;
    }
    if (attempt !== this.#attempt) return;
    this.#detach();
    this.#device = device;
    try {
      localStorage.setItem(LAST_DEVICE_STORAGE_KEY, device.id);
    } catch {
      // stockage indisponible : pas de piano retrouvé au prochain lancement
    }
    await this.#connectTo(device, attempt);
  }

  /** Se reconnecte au dernier piano, sans repasser par le sélecteur (sinon, ouvre le sélecteur) */
  async reconnect(): Promise<void> {
    if (!this.#device) return this.connect();
    const attempt = ++this.#attempt;
    this.#detach();
    await this.#connectTo(this.#device, attempt);
  }

  /** Déconnexion demandée : annule aussi une connexion en cours (bug n° 15). Le piano reste connu */
  disconnect(): void {
    ++this.#attempt;
    this.#target = null;
    this.#detach();
    this.#setStatus('idle');
  }

  /**
   * Retrouve le dernier piano autorisé, si le navigateur le permet (getDevices).
   * Renvoie true si un piano est retrouvé : `reconnect()` peut alors s'y connecter
   * sans sélecteur.
   */
  async restore(): Promise<boolean> {
    if (!navigator.bluetooth?.getDevices) return false;
    let id: string | null;
    try {
      id = localStorage.getItem(LAST_DEVICE_STORAGE_KEY);
    } catch {
      return false;
    }
    if (!id) return false;
    try {
      const device = (await navigator.bluetooth.getDevices()).find(d => d.id === id);
      if (!device || this.#device) return false;
      this.#restored = device;
      this.#device = device;
      return true;
    } catch {
      return false; // fonction présente mais non autorisée
    }
  }

  // ─── Lien GATT ───────────────────────────────────────────────────────────

  async #connectTo(device: BluetoothDevice, attempt: number): Promise<void> {
    this.#target = device;
    this.#setStatus('connecting');
    try {
      let opened: boolean;
      try {
        opened = await this.#openLink(device, attempt);
      } catch (err) {
        // Piano retrouvé au lancement : il refuse souvent gatt.connect() tant que le
        // navigateur ne l'a pas vu émettre. On attend qu'il se signale, puis un seul essai.
        if (device !== this.#restored || attempt !== this.#attempt) throw err;
        if (!(await this.#waitForAdvertisement(device, attempt))) throw err;
        if (attempt !== this.#attempt) return;
        opened = await this.#openLink(device, attempt);
      }
      if (!opened) return;
      if (this.#restored === device) this.#restored = null;
      this.#watchDisconnect(device, attempt);
      this.#setStatus('connected');
    } catch (err) {
      if (attempt !== this.#attempt) return;
      console.warn('Bluetooth MIDI :', err);
      this.#setStatus('error', errorCode(err) ?? 'failed');
    }
  }

  /** Ouvre le lien GATT et s'abonne aux notifications. Renvoie false si une action plus récente a pris la main */
  async #openLink(device: BluetoothDevice, attempt: number): Promise<boolean> {
    for (let i = 0; ; i++) {
      try {
        const server = await device.gatt!.connect();
        const service = await server.getPrimaryService(MIDI_SERVICE_UUID);
        const characteristic = await service.getCharacteristic(MIDI_CHARACTERISTIC_UUID);
        await characteristic.startNotifications();
        if (attempt !== this.#attempt) {
          // Action plus récente : ne pas laisser un lien ouvert sans personne pour l'écouter,
          // sauf si la nouvelle action vise ce même piano (bug n° 16)
          if (this.#target !== device) disconnectGatt(device);
          return false;
        }
        this.#runningStatus = -1;
        const listener = (event: Event) => this.#handleNotification(event);
        characteristic.addEventListener('characteristicvaluechanged', listener);
        this.#characteristic = characteristic;
        this.#onCharChange = listener;
        this.#writeQueue = Promise.resolve();
        return true;
      } catch (err) {
        if (attempt !== this.#attempt) {
          if (this.#target !== device) disconnectGatt(device);
          return false;
        }
        if (i < OPEN_RETRIES - 1 && /disconnected|Cannot retrieve services/i.test((err as Error)?.message ?? '')) {
          await wait(250 * (i + 1));
          continue;
        }
        // GATT a pu s'ouvrir avant l'échec (service absent, notifications refusées) :
        // le refermer, sinon le piano reste pris par la tablette (bug n° 16)
        disconnectGatt(device);
        throw err;
      }
    }
  }

  /** Coupure non demandée (piano éteint, trop loin) : on réessaie seul pendant un moment */
  async #autoReconnect(device: BluetoothDevice, attempt: number): Promise<void> {
    // Une seule boucle par action ; celle d'une action périmée (qui attend encore) ne bloque pas
    if (this.#reconnecting === attempt) return;
    this.#reconnecting = attempt;
    this.#releaseLink();
    this.#setStatus('reconnecting');
    const deadline = Date.now() + RECONNECT_WINDOW_MS;
    try {
      while (attempt === this.#attempt) {
        try {
          if (await this.#openLink(device, attempt)) this.#setStatus('connected');
          return;
        } catch {
          // piano pas encore joignable
        }
        if (Date.now() >= deadline) break;
        await wait(RECONNECT_DELAY_MS);
      }
      if (attempt === this.#attempt) this.#setStatus('lost');
    } finally {
      if (this.#reconnecting === attempt) this.#reconnecting = null;
    }
  }

  #watchDisconnect(device: BluetoothDevice, attempt: number): void {
    this.#stopWatching?.();
    const onDisconnected = () => {
      if (attempt === this.#attempt) void this.#autoReconnect(device, attempt);
    };
    device.addEventListener('gattserverdisconnected', onDisconnected);
    this.#stopWatching = () => device.removeEventListener('gattserverdisconnected', onDisconnected);
  }

  /**
   * Attend une annonce Bluetooth du piano (watchAdvertisements). Un appareil retrouvé
   * par getDevices refuse souvent gatt.connect() tant que le navigateur ne l'a pas vu
   * émettre depuis le lancement. Renvoie true si une annonce arrive à temps.
   */
  #waitForAdvertisement(device: BluetoothDevice, attempt: number): Promise<boolean> {
    return new Promise(resolve => {
      if (typeof device.watchAdvertisements !== 'function') {
        resolve(false);
        return;
      }
      const abort = new AbortController();
      let done = false;
      const finish = (received: boolean) => {
        if (done) return;
        done = true;
        clearTimeout(timer);
        clearInterval(check);
        device.removeEventListener('advertisementreceived', onAdvertisement);
        abort.abort(); // arrête l'écoute des annonces
        resolve(received);
      };
      const onAdvertisement = () => finish(true);
      const timer = setTimeout(() => finish(false), ADVERTISEMENT_TIMEOUT_MS);
      // Une action plus récente (déconnexion, autre piano) arrête l'attente
      const check = setInterval(() => {
        if (attempt !== this.#attempt) finish(false);
      }, 250);
      device.addEventListener('advertisementreceived', onAdvertisement);
      try {
        device.watchAdvertisements({ signal: abort.signal }).catch(() => finish(false));
      } catch {
        finish(false);
      }
    });
  }

  /** Arrête d'écouter les notifications du lien courant */
  #releaseLink(): void {
    const char = this.#characteristic;
    const listener = this.#onCharChange;
    this.#characteristic = null;
    this.#onCharChange = null;
    this.#writeQueue = Promise.resolve();
    if (!char) return;
    if (listener) char.removeEventListener('characteristicvaluechanged', listener);
    try {
      char.stopNotifications().catch(() => {});
    } catch {
      // déjà déconnecté
    }
  }

  /** Coupe tout lien avec le piano courant (sans l'oublier) */
  #detach(): void {
    this.#stopWatching?.();
    this.#stopWatching = null;
    this.#releaseLink();
    disconnectGatt(this.#device);
  }

  // ─── Réception (journal de la console seulement) ────────────────────────

  #handleNotification(event: Event): void {
    const value = (event?.target as BluetoothRemoteGATTCharacteristic | null)?.value;
    if (!value) return;
    const packet = new Uint8Array(value.buffer, value.byteOffset, value.byteLength);
    let info;
    try { info = parsePacket(packet, this.#runningStatus); } catch { return; }
    this.#runningStatus = info.runningStatus;
    for (const ev of info.events ?? []) {
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
  }

  #setStatus(status: BluetoothStatus, error: BluetoothErrorCode | null = null): void {
    this.#status = status;
    this.#error  = error;
    this.#onStatusChange?.(status, error);
  }
}
