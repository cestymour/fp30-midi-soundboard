/* ================================================================
   ble-midi-parser.ts — Décodage des paquets BLE MIDI entrants
   Portage en module ES de la partie « packets » du paquet npm
   ble-midi 0.0.1 (https://github.com/skratchdot/ble-midi,
   MIT, © skratchdot). Le paquet npm n'est pas utilisable dans le
   navigateur (dépendances natives noble/bleno/midi), d'où cette copie.
   Comportement identique à l'ancien js/ble-midi-parser.bundle.js.
================================================================ */

const SYSEX_START = 0xf0;
const SYSEX_END   = 0xf7;

// ── Utilitaires ──
const isBitOn          = (byte: number, num: number): boolean => (byte & Math.pow(2, num)) > 0;
const getTimestampHigh = (byte: number): number => 0x3f & byte;
const getTimestampLow  = (byte: number): number => 0x7f & byte;
// 6 bits de poids fort (header) + 7 bits de poids faible (timestamp) = 13 bits
const getTimestamp     = (high: number, low: number): number => ((high & 0x3f) << 7) | (low & 0x7f);

// ── Messages ──
export type MessageType = 'fullMidiMessage' | 'runningMidiMessage' | 'sysex' | 'unknown';

class Message {
  type: MessageType;

  constructor(type: MessageType) {
    this.type = type;
  }
}

/**
 * Message MIDI décodé. Les octets valent `undefined` si le paquet est
 * tronqué (le parseur lit au-delà de la fin sans vérifier).
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
  midiStatus:    number;

  constructor(packet: Uint8Array) {
    const header = packet[0];
    this.packet        = packet;
    this.events        = [];
    this.isHeaderValid = isBitOn(header, 7);
    this.index         = 1;
    this.timestampHigh = getTimestampHigh(header);
    this.timestampLow  = -1;
    this.timestamp     = -1;
    this.midiStatus    = -1;
  }
}

// ── Parsers ──
function parseFullMidiMessage(info: Info): void {
  info.timestampLow = getTimestampLow(info.packet[info.index++]);
  info.timestamp    = getTimestamp(info.timestampHigh, info.timestampLow);
  info.midiStatus   = info.packet[info.index++];
  const midiOne = info.packet[info.index++];
  const midiTwo = info.packet[info.index++];
  info.events.push(new MessageMidiFull(info.timestamp, info.midiStatus, midiOne, midiTwo));
}

function parseRunningStatusMidiMessage(info: Info, hasTimestamp: boolean): void {
  if (hasTimestamp) {
    info.timestampLow = getTimestampLow(info.packet[info.index++]);
    info.timestamp    = getTimestamp(info.timestampHigh, info.timestampLow);
  }
  const midiOne = info.packet[info.index++];
  const midiTwo = info.packet[info.index++];
  info.events.push(new MessageMidiRunning(info.timestamp, info.midiStatus, midiOne, midiTwo));
}

function parseSysex(info: Info, isStart: boolean): void {
  let isEnd = false;
  if (isStart) {
    info.index += 2;
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
 * `events` contient les messages décodés.
 */
export function parsePacket(packet: Uint8Array): Info {
  const info = new Info(packet);
  if (info.isHeaderValid) {
    if (packet.length >= 2 && !isBitOn(packet[info.index], 7)) {
      parseSysex(info, false);
    }
    while (info.index < packet.length) {
      const byte1 = packet[info.index];
      const byte2 = packet[info.index + 1];
      const hasTimestamp = isBitOn(byte1, 7);
      const hasStatus    = isBitOn(byte2, 7);
      if (hasTimestamp && hasStatus && byte2 === SYSEX_START) {
        parseSysex(info, true);
      } else if (hasTimestamp && hasStatus) {
        parseFullMidiMessage(info);
      } else if (!hasStatus) {
        parseRunningStatusMidiMessage(info, hasTimestamp);
      } else {
        info.events.push(new MessageUnknown(info.index, packet.slice(info.index)));
        info.index = packet.length;
      }
    }
  }
  return info;
}
