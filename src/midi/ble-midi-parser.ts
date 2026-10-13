/* ================================================================
   ble-midi-parser.ts — Décodage des paquets BLE MIDI entrants
   Inspiré de la partie « packets » du paquet npm ble-midi 0.0.1
   (https://github.com/skratchdot/ble-midi, MIT, © skratchdot). Le
   paquet npm n'est pas utilisable dans le navigateur (dépendances
   natives noble/bleno/midi), d'où ce module.
   Différences avec l'original (bug n° 8, docs/bugs.md) :
   - chaque statut a sa longueur de données (Program Change : 1 octet,
     temps réel : 0) ; l'original en lisait toujours 2, ce qui décalait
     la lecture du reste du paquet ;
   - le running status survit à un message temps réel et passe d'un
     paquet au suivant (paramètre `runningStatus` de parsePacket).
================================================================ */

const SYSEX_START = 0xf0;
const SYSEX_END   = 0xf7;

// ── Utilitaires ──
const isBitOn          = (byte: number, num: number): boolean => (byte & Math.pow(2, num)) > 0;
const getTimestampHigh = (byte: number): number => 0x3f & byte;
const getTimestampLow  = (byte: number): number => 0x7f & byte;
// 6 bits de poids fort (header) + 7 bits de poids faible (timestamp) = 13 bits
const getTimestamp     = (high: number, low: number): number => ((high & 0x3f) << 7) | (low & 0x7f);

/** Nombre d'octets de données qui suivent un octet de statut */
export function getDataLength(status: number): number {
  const type = status & 0xf0;
  if (type === 0xc0 || type === 0xd0) return 1;      // Program Change, Channel Pressure
  if (type !== 0xf0) return 2;                       // autres messages de canal
  if (status === 0xf1 || status === 0xf3) return 1;  // MTC Quarter Frame, Song Select
  if (status === 0xf2) return 2;                     // Song Position
  return 0;                                          // Tune Request, temps réel (F8-FF)
}

// ── Messages ──
export type MessageType = 'fullMidiMessage' | 'runningMidiMessage' | 'sysex' | 'unknown';

class Message {
  type: MessageType;

  constructor(type: MessageType) {
    this.type = type;
  }
}

/**
 * Message MIDI décodé. Les octets de données valent `undefined` quand le
 * message n'en a pas (`midiTwo` d'un Program Change, les deux pour un
 * message temps réel) ou quand le paquet est tronqué.
 */
export class MessageMidi extends Message {
  timestamp:  number;
  midiStatus: number;
  midiOne:    number | undefined;
  midiTwo:    number | undefined;

  constructor(type: MessageType, timestamp: number, midiStatus: number, midiOne: number | undefined, midiTwo: number | undefined) {
    super(type);
    this.timestamp  = timestamp;
    this.midiStatus = midiStatus;
    this.midiOne    = midiOne;
    this.midiTwo    = midiTwo;
  }
}

class MessageMidiFull extends MessageMidi {
  constructor(timestamp: number, midiStatus: number, midiOne: number | undefined, midiTwo: number | undefined) {
    super('fullMidiMessage', timestamp, midiStatus, midiOne, midiTwo);
  }
}

class MessageMidiRunning extends MessageMidi {
  constructor(timestamp: number, midiStatus: number, midiOne: number | undefined, midiTwo: number | undefined) {
    super('runningMidiMessage', timestamp, midiStatus, midiOne, midiTwo);
  }
}

export class MessageMidiSysex extends Message {
  isStart: boolean;
  isEnd:   boolean;
  data:    Uint8Array;

  constructor(isStart: boolean, isEnd: boolean, data: Uint8Array) {
    super('sysex');
    this.isStart = isStart;
    this.isEnd   = isEnd;
    this.data    = data;
  }
}

export class MessageUnknown extends Message {
  skipIndex: number;
  skipData:  Uint8Array;

  constructor(skipIndex: number, skipData: Uint8Array) {
    super('unknown');
    this.skipIndex = skipIndex;
    this.skipData  = skipData;
  }
}

export type BleMidiEvent = MessageMidi | MessageMidiSysex | MessageUnknown;

// ── État de parsing d'un paquet ──
class Info {
  packet:        Uint8Array;
  events:        BleMidiEvent[];
  isHeaderValid: boolean;
  index:         number;
  timestampHigh: number;
  timestampLow:  number;
  timestamp:     number;
  /** Statut repris par les messages sans statut (-1 : aucun) ; à repasser au paquet suivant */
  runningStatus: number;

  constructor(packet: Uint8Array, runningStatus: number) {
    const header = packet[0];
    this.packet        = packet;
    this.events        = [];
    this.isHeaderValid = isBitOn(header, 7);
    this.index         = 1;
    this.timestampHigh = getTimestampHigh(header);
    this.timestampLow  = -1;
    this.timestamp     = -1;
    this.runningStatus = runningStatus;
  }
}

// ── Parsers ──

/** Octet de données suivant (bit 7 à 0), ou undefined sans avancer s'il n'y en a pas */
function readDataByte(info: Info): number | undefined {
  const byte = info.packet[info.index];
  if (byte === undefined || isBitOn(byte, 7)) return undefined;
  info.index++;
  return byte;
}

/** Les octets de données d'un message, selon son statut */
function readData(info: Info, status: number): [number | undefined, number | undefined] {
  const length  = getDataLength(status);
  const midiOne = length >= 1 ? readDataByte(info) : undefined;
  const midiTwo = length >= 2 ? readDataByte(info) : undefined;
  return [midiOne, midiTwo];
}

/** Statut puis données ; l'octet de timestamp a déjà été lu */
function parseFullMidiMessage(info: Info): void {
  const status = info.packet[info.index++];
  const [midiOne, midiTwo] = readData(info, status);
  info.events.push(new MessageMidiFull(info.timestamp, status, midiOne, midiTwo));
  // Un message de canal devient le running status ; un message système
  // commun l'annule ; un message temps réel (F8-FF) le laisse en place
  if (status < 0xf0)       info.runningStatus = status;
  else if (status < 0xf8)  info.runningStatus = -1;
}

/** Données seules, avec le statut du message précédent */
function parseRunningStatusMidiMessage(info: Info): void {
  if (info.runningStatus < 0) {
    info.events.push(new MessageUnknown(info.index, info.packet.slice(info.index)));
    info.index = info.packet.length;
    return;
  }
  const [midiOne, midiTwo] = readData(info, info.runningStatus);
  info.events.push(new MessageMidiRunning(info.timestamp, info.runningStatus, midiOne, midiTwo));
}

function parseSysex(info: Info, isStart: boolean): void {
  let isEnd = false;
  if (isStart) {
    info.index += 1; // F0
  }
  let data = info.packet.slice(info.index);
  const len = data.length;
  if (len >= 2 && isBitOn(data[len - 2], 7) && data[len - 1] === SYSEX_END) {
    isEnd = true;
    data = data.slice(0, len - 2);
  }
  info.events.push(new MessageMidiSysex(isStart, isEnd, data));
  // Fin du parsing
  info.index = info.packet.length;
}

/**
 * Décode un paquet BLE MIDI.
 * `events` contient les messages décodés. `runningStatus` : celui du
 * paquet précédent (renvoyé dans `info.runningStatus` pour le suivant).
 */
export function parsePacket(packet: Uint8Array, runningStatus = -1): Info {
  const info = new Info(packet, runningStatus);
  if (!info.isHeaderValid) return info;

  // Octet de données juste après le header : suite d'un sysex du paquet précédent
  if (packet.length >= 2 && !isBitOn(packet[info.index], 7)) {
    parseSysex(info, false);
  }
  while (info.index < packet.length) {
    const byte = packet[info.index];
    if (!isBitOn(byte, 7)) {
      // Running status sans timestamp : données seules
      parseRunningStatusMidiMessage(info);
      continue;
    }
    // Octet de timestamp, suivi d'un statut ou de données (running status)
    info.timestampLow = getTimestampLow(byte);
    info.timestamp    = getTimestamp(info.timestampHigh, info.timestampLow);
    info.index++;
    if (info.index >= packet.length) break;

    const next = packet[info.index];
    if (next === SYSEX_START) {
      parseSysex(info, true);
    } else if (isBitOn(next, 7)) {
      parseFullMidiMessage(info);
    } else {
      parseRunningStatusMidiMessage(info);
    }
  }
  return info;
}
