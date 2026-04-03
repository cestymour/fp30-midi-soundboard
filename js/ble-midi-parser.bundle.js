(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
var DEFAULT_SERVICE_NAME = exports.DEFAULT_SERVICE_NAME = 'skratchdot-ble-midi';
var MIDI_SERVICE_UID = exports.MIDI_SERVICE_UID = '03B80E5A-EDE8-4B33-A751-6CE34EC4C700'.toLowerCase();
var MIDI_IO_CHARACTERISTIC_UID = exports.MIDI_IO_CHARACTERISTIC_UID = '7772E5DB-3868-4112-A1A9-F2669D106BF3'.toLowerCase();
var SYSEX_START = exports.SYSEX_START = 0xf0;
var SYSEX_END = exports.SYSEX_END = 0xf7;
},{}],2:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _parsePacket = require('./packets/parse-packet');

Object.defineProperty(exports, 'parsePacket', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_parsePacket).default;
  }
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
},{"./packets/parse-packet":11}],3:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _getTimestampHigh = require('../util/get-timestamp-high');

var _getTimestampHigh2 = _interopRequireDefault(_getTimestampHigh);

var _isBitOn = require('../util/is-bit-on');

var _isBitOn2 = _interopRequireDefault(_isBitOn);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Info = function Info(packet) {
  _classCallCheck(this, Info);

  var header = packet[0];
  this.packet = packet;
  this.events = [];
  this.isHeaderValid = (0, _isBitOn2.default)(header, 7);
  this.index = 1;
  this.timestampHigh = (0, _getTimestampHigh2.default)(header);
  this.timestampLow = -1;
  this.timestamp = -1;
  this.midiStatus = -1;
};

exports.default = Info;
},{"../util/get-timestamp-high":14,"../util/is-bit-on":17}],4:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _messageMidi = require('./message-midi');

var _messageMidi2 = _interopRequireDefault(_messageMidi);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var MessageMidiFull = function (_MessageMidi) {
  _inherits(MessageMidiFull, _MessageMidi);

  function MessageMidiFull(timestamp, midiStatus, midiOne, midiTwo) {
    _classCallCheck(this, MessageMidiFull);

    return _possibleConstructorReturn(this, (MessageMidiFull.__proto__ || Object.getPrototypeOf(MessageMidiFull)).call(this, 'fullMidiMessage', timestamp, midiStatus, midiOne, midiTwo));
  }

  return MessageMidiFull;
}(_messageMidi2.default);

exports.default = MessageMidiFull;
},{"./message-midi":7}],5:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _messageMidi = require('./message-midi');

var _messageMidi2 = _interopRequireDefault(_messageMidi);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var MessageMidiRunning = function (_MessageMidi) {
  _inherits(MessageMidiRunning, _MessageMidi);

  function MessageMidiRunning(timestamp, midiStatus, midiOne, midiTwo) {
    _classCallCheck(this, MessageMidiRunning);

    return _possibleConstructorReturn(this, (MessageMidiRunning.__proto__ || Object.getPrototypeOf(MessageMidiRunning)).call(this, 'runningMidiMessage', timestamp, midiStatus, midiOne, midiTwo));
  }

  return MessageMidiRunning;
}(_messageMidi2.default);

exports.default = MessageMidiRunning;
},{"./message-midi":7}],6:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _message = require('./message');

var _message2 = _interopRequireDefault(_message);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var MessageMidiSysex = function (_Message) {
  _inherits(MessageMidiSysex, _Message);

  function MessageMidiSysex(isStart, isEnd, data) {
    _classCallCheck(this, MessageMidiSysex);

    var _this = _possibleConstructorReturn(this, (MessageMidiSysex.__proto__ || Object.getPrototypeOf(MessageMidiSysex)).call(this, 'sysex'));

    _this.isStart = isStart;
    _this.isEnd = isEnd;
    _this.data = data;
    return _this;
  }

  return MessageMidiSysex;
}(_message2.default);

exports.default = MessageMidiSysex;
},{"./message":9}],7:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _message = require('./message');

var _message2 = _interopRequireDefault(_message);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var MessageMidi = function (_Message) {
  _inherits(MessageMidi, _Message);

  function MessageMidi(type, timestamp, midiStatus, midiOne, midiTwo) {
    _classCallCheck(this, MessageMidi);

    var _this = _possibleConstructorReturn(this, (MessageMidi.__proto__ || Object.getPrototypeOf(MessageMidi)).call(this, type));

    _this.timestamp = timestamp;
    _this.midiStatus = midiStatus;
    _this.midiOne = midiOne;
    _this.midiTwo = midiTwo;
    return _this;
  }

  return MessageMidi;
}(_message2.default);

exports.default = MessageMidi;
},{"./message":9}],8:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _message = require('./message');

var _message2 = _interopRequireDefault(_message);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var MessageUnknown = function (_Message) {
  _inherits(MessageUnknown, _Message);

  function MessageUnknown(skipIndex, skipData) {
    _classCallCheck(this, MessageUnknown);

    var _this = _possibleConstructorReturn(this, (MessageUnknown.__proto__ || Object.getPrototypeOf(MessageUnknown)).call(this, 'unknown'));

    _this.skipIndex = skipIndex;
    _this.skipData = skipData;
    return _this;
  }

  return MessageUnknown;
}(_message2.default);

exports.default = MessageUnknown;
},{"./message":9}],9:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Message = function Message(type) {
  _classCallCheck(this, Message);

  this.type = type;
};

exports.default = Message;
},{}],10:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _messageMidiFull = require('./message-midi-full');

var _messageMidiFull2 = _interopRequireDefault(_messageMidiFull);

var _getTimestamp = require('../util/get-timestamp');

var _getTimestamp2 = _interopRequireDefault(_getTimestamp);

var _getTimestampLow = require('../util/get-timestamp-low');

var _getTimestampLow2 = _interopRequireDefault(_getTimestampLow);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = function (info) {
  // timestamp
  info.timestampLow = (0, _getTimestampLow2.default)(info.packet[info.index++]);
  info.timestamp = (0, _getTimestamp2.default)(info.timestampHigh, info.timestampLow);
  // status
  info.midiStatus = info.packet[info.index++];
  var midiOne = info.packet[info.index++];
  var midiTwo = info.packet[info.index++];
  info.events.push(new _messageMidiFull2.default(info.timestamp, info.midiStatus, midiOne, midiTwo));
};
},{"../util/get-timestamp":16,"../util/get-timestamp-low":15,"./message-midi-full":4}],11:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _info = require('./info');

var _info2 = _interopRequireDefault(_info);

var _messageUnknown = require('./message-unknown');

var _messageUnknown2 = _interopRequireDefault(_messageUnknown);

var _constants = require('../constants');

var _isBitOn = require('../util/is-bit-on');

var _isBitOn2 = _interopRequireDefault(_isBitOn);

var _parseFullMidiMessage = require('./parse-full-midi-message');

var _parseFullMidiMessage2 = _interopRequireDefault(_parseFullMidiMessage);

var _parseRunningStatusMidiMessage = require('./parse-running-status-midi-message');

var _parseRunningStatusMidiMessage2 = _interopRequireDefault(_parseRunningStatusMidiMessage);

var _parseSysex = require('./parse-sysex');

var _parseSysex2 = _interopRequireDefault(_parseSysex);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = function (packet) {
  var info = new _info2.default(packet);
  if (info.isHeaderValid) {
    if (packet.length >= 2 && !(0, _isBitOn2.default)(packet[info.index], 7)) {
      (0, _parseSysex2.default)(info, false);
    }
    while (info.index < packet.length) {
      var byte1 = packet[info.index];
      var byte2 = packet[info.index + 1];
      var hasTimestamp = (0, _isBitOn2.default)(byte1, 7);
      var hasStatus = (0, _isBitOn2.default)(byte2, 7);
      if (hasTimestamp && hasStatus && byte2 === _constants.SYSEX_START) {
        (0, _parseSysex2.default)(info, true);
      } else if (hasTimestamp && hasStatus) {
        (0, _parseFullMidiMessage2.default)(info);
      } else if (!hasStatus) {
        (0, _parseRunningStatusMidiMessage2.default)(info, hasTimestamp);
      } else {
        info.events.push(new _messageUnknown2.default(info.index, packet.slice(info.index)));
        info.index = packet.length;
      }
    }
  }
  return info;
};
},{"../constants":1,"../util/is-bit-on":17,"./info":3,"./message-unknown":8,"./parse-full-midi-message":10,"./parse-running-status-midi-message":12,"./parse-sysex":13}],12:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _messageMidiRunning = require('./message-midi-running');

var _messageMidiRunning2 = _interopRequireDefault(_messageMidiRunning);

var _getTimestamp = require('../util/get-timestamp');

var _getTimestamp2 = _interopRequireDefault(_getTimestamp);

var _getTimestampLow = require('../util/get-timestamp-low');

var _getTimestampLow2 = _interopRequireDefault(_getTimestampLow);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = function (info, hasTimestamp) {
  // timestamp
  if (hasTimestamp) {
    info.timestampLow = (0, _getTimestampLow2.default)(info.packet[info.index++]);
    info.timestamp = (0, _getTimestamp2.default)(info.timestampHigh, info.timestampLow);
  }
  var midiOne = info.packet[info.index++];
  var midiTwo = info.packet[info.index++];
  info.events.push(new _messageMidiRunning2.default(info.timestamp, info.midiStatus, midiOne, midiTwo));
};
},{"../util/get-timestamp":16,"../util/get-timestamp-low":15,"./message-midi-running":5}],13:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _messageMidiSysex = require('./message-midi-sysex');

var _messageMidiSysex2 = _interopRequireDefault(_messageMidiSysex);

var _constants = require('../constants');

var _isBitOn = require('../util/is-bit-on');

var _isBitOn2 = _interopRequireDefault(_isBitOn);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = function (info, isStart) {
  var isEnd = false;
  if (isStart) {
    info.index += 2;
  }
  var data = info.packet.slice(info.index);
  var len = data.length;
  if (len >= 2 && (0, _isBitOn2.default)(data[len - 2], 7) && data[len - 1] === _constants.SYSEX_END) {
    isEnd = true;
    data = data.slice(0, len - 2);
  }
  info.events.push(new _messageMidiSysex2.default(isStart, isEnd, data));
  // stop parsing
  info.index = info.packet.length;
};
},{"../constants":1,"../util/is-bit-on":17,"./message-midi-sysex":6}],14:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (byte) {
  return 0x3f & byte;
};
},{}],15:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (byte) {
  return 0x7f & byte;
};
},{}],16:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (high, low) {
  return parseInt([(high & 32) >> 5, (high & 16) >> 4, (high & 8) >> 3, (high & 4) >> 2, (high & 2) >> 1, (high & 1) >> 0, (low & 64) >> 6, (low & 32) >> 5, (low & 16) >> 4, (low & 8) >> 3, (low & 4) >> 2, (low & 2) >> 1, (low & 1) >> 0].join(''), 2);
};
},{}],17:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (byte, num) {
  return (byte & Math.pow(2, num)) > 0;
};
},{}],18:[function(require,module,exports){
const { parsePacket } = require('/home/claude/package/lib/index.js');
window.BleMidiParser = { parsePacket };

},{"/home/claude/package/lib/index.js":2}]},{},[18]);
