/* ================================================================
   ble-midi-parser.js — Décodage des paquets BLE MIDI entrants
   Portage en module ES de la partie « packets » du paquet npm
   ble-midi 0.0.1 (https://github.com/skratchdot/ble-midi,
   MIT, © skratchdot). Le paquet npm n'est pas utilisable dans le
   navigateur (dépendances natives noble/bleno/midi), d'où cette copie.
   Comportement identique à l'ancien js/ble-midi-parser.bundle.js.
================================================================ */

const SYSEX_START = 0xf0;
const SYSEX_END   = 0xf7;

// ── Utilitaires ──
const isBitOn          = (byte, num) => (byte & Math.pow(2, num)) > 0;
const getTimestampHigh = byte => 0x3f & byte;
const getTimestampLow  = byte => 0x7f & byte;
// 6 bits de poids fort (header) + 7 bits de poids faible (timestamp) = 13 bits
const getTimestamp     = (high, low) => ((high & 0x3f) << 7) | (low & 0x7f);

// ── Messages ──
class Message {
  constructor(type) {
    this.type = type;
  }
}

class MessageMidi extends Message {
  constructor(type, timestamp, midiStatus, midiOne, midiTwo) {
    super(type);
    this.timestamp  = timestamp;
    this.midiStatus = midiStatus;
    this.midiOne    = midiOne;
    this.midiTwo    = midiTwo;
  }
}

class MessageMidiFull extends MessageMidi {
  constructor(timestamp, midiStatus, midiOne, midiTwo) {
    super('fullMidiMessage', timestamp, midiStatus, midiOne, midiTwo);
  }
}

class MessageMidiRunning extends MessageMidi {
  constructor(timestamp, midiStatus, midiOne, midiTwo) {
    super('runningMidiMessage', timestamp, midiStatus, midiOne, midiTwo);
  }
}

class MessageMidiSysex extends Message {
  constructor(isStart, isEnd, data) {
    super('sysex');
    this.isStart = isStart;
    this.isEnd   = isEnd;
    this.data    = data;
  }
}

class MessageUnknown extends Message {
  constructor(skipIndex, skipData) {
    super('unknown');
    this.skipIndex = skipIndex;
    this.skipData  = skipData;
  }
}

// ── État de parsing d'un paquet ──
class Info {
  constructor(packet) {
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
function parseFullMidiMessage(info) {
  info.timestampLow = getTimestampLow(info.packet[info.index++]);
  info.timestamp    = getTimestamp(info.timestampHigh, info.timestampLow);
  info.midiStatus   = info.packet[info.index++];
  const midiOne = info.packet[info.index++];
  const midiTwo = info.packet[info.index++];
  info.events.push(new MessageMidiFull(info.timestamp, info.midiStatus, midiOne, midiTwo));
}

function parseRunningStatusMidiMessage(info, hasTimestamp) {
  if (hasTimestamp) {
    info.timestampLow = getTimestampLow(info.packet[info.index++]);
    info.timestamp    = getTimestamp(info.timestampHigh, info.timestampLow);
  }
  const midiOne = info.packet[info.index++];
  const midiTwo = info.packet[info.index++];
  info.events.push(new MessageMidiRunning(info.timestamp, info.midiStatus, midiOne, midiTwo));
}

function parseSysex(info, isStart) {
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
 * @param {Uint8Array} packet
 * @returns {Info} — `events` contient les messages décodés
 */
export function parsePacket(packet) {
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
