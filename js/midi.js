/* ================================================================
   midi.js — Gestion MIDI (USB + Bluetooth)
   Dépend de : bluetoothMIDI.js, ble-midi-parser.bundle.js
   Variables globales lues/écrites : STATE (défini dans app.js)
================================================================ */

// ═══════════════════════════════════════════════════════
// ENVOI MIDI
// ═══════════════════════════════════════════════════════

function sendMidi(bytes) {
  if (STATE.midiOutput) {
    STATE.midiOutput.send(bytes);
  } else if (STATE.bt?.status === 'connected') {
    STATE.bt.send(bytes);
  } else {
    console.warn('Pas de connexion MIDI active');
  }
}

function sendInstrumentPatch(item) {
  sendMidi([0xB0 | STATE.MIDI_CHANNEL, 0x00, item.msb]);
  sendMidi([0xB0 | STATE.MIDI_CHANNEL, 0x20, item.lsb]);
  sendMidi([0xC0 | STATE.MIDI_CHANNEL, item.pc - 1]);
}

function sendVolume(val) {
  sendMidi([0xB0 | STATE.MIDI_CHANNEL, 0x07, val]);
}

function sendEmergencyStop() {
  for (let ch = 0; ch < 16; ch++) {
    sendMidi([0xB0 | ch, 123, 0]); // All Notes Off
    sendMidi([0xB0 | ch, 121, 0]); // Reset All Controllers
  }
}

// ═══════════════════════════════════════════════════════
// SÉLECTION INSTRUMENT
// ═══════════════════════════════════════════════════════

function selectInstrument(btn, item) {
  if (STATE.activeInstBtn) STATE.activeInstBtn.classList.remove('active');
  STATE.activeInstBtn = btn;
  btn.classList.add('active');
  sendInstrumentPatch(item);
}

// ═══════════════════════════════════════════════════════
// UI — Synchronisation badges et selects
// ═══════════════════════════════════════════════════════

function updateAllMidiBadges() {
  document.querySelectorAll('.midi-badge').forEach(badge => {
    if (STATE.currentConnectionType === 'usb') {
      badge.textContent = '● USB';
      badge.className   = 'midi-badge usb';
    } else if (STATE.currentConnectionType === 'bt') {
      badge.textContent = '● BT';
      badge.className   = 'midi-badge bt';
    } else {
      badge.textContent = 'Non connecté';
      badge.className   = 'midi-badge';
    }
  });
}

function updateAllMidiSelects(val) {
  document.querySelectorAll('.midi-select').forEach(s => { s.value = val; });
}

function syncMidiSliders(val) {
  document.querySelectorAll('.midi-vol').forEach(s => {
    if (parseInt(s.value) === val) return;
    s.value = val;
    s.style.setProperty('--vol-pct', (val / 127 * 100).toFixed(1) + '%');
    s.closest('.panel-controls').querySelector('.vol-value').textContent = val;
  });
}

// ═══════════════════════════════════════════════════════
// BLUETOOTH MIDI
// ═══════════════════════════════════════════════════════

function initBluetooth() {
  STATE.bt = new BluetoothMIDI({
    onStatusChange: (status) => {
      if (status === 'connected') {
        STATE.midiOutput = null;
        STATE.currentConnectionType = 'bt';
        updateAllMidiSelects('__bluetooth__');
        updateAllMidiBadges();
        sendVolume(STATE.midiVolume);
      } else if (status === 'idle' || status === 'error') {
        if (STATE.isSwitchingToUsb) return;
        if (STATE.currentConnectionType === 'bt') {
          STATE.currentConnectionType = null;
          updateAllMidiBadges();
        }
        if (STATE.midiOutput) {
          updateAllMidiSelects(STATE.midiOutput.id);
        } else {
          updateAllMidiSelects('__none__');
        }
      }
    },
  });
}

// ═══════════════════════════════════════════════════════
// WEB MIDI (USB)
// ═══════════════════════════════════════════════════════

function initWebMidi() {
  navigator.requestMIDIAccess({ sysex: false }).then(access => {
    STATE.midiAccess = access;
    populateMidiSelects(true);
    access.onstatechange = () => populateMidiSelects(false);
  }, () => {
    STATE.currentConnectionType = null;
    updateAllMidiBadges();
  });
}

function populateMidiSelects(isFirstLoad = false) {
  const usbOutputs = [];
  if (STATE.midiAccess) STATE.midiAccess.outputs.forEach(o => usbOutputs.push(o));

  document.querySelectorAll('.midi-select').forEach((sel, selIdx) => {
    const prev = sel.value;
    sel.innerHTML = '';

    const noneOpt = document.createElement('option');
    noneOpt.value = '__none__';
    noneOpt.textContent = '— Connexion MIDI —';
    sel.appendChild(noneOpt);

    if (navigator.bluetooth) {
      const btOpt = document.createElement('option');
      btOpt.value = '__bluetooth__';
      btOpt.textContent = 'ᛒ Bluetooth MIDI';
      sel.appendChild(btOpt);
    }

    usbOutputs.forEach(out => {
      const opt = document.createElement('option');
      opt.value = out.id;
      opt.textContent = '🎹 ' + out.name;
      sel.appendChild(opt);
    });

    // Restaurer la valeur sélectionnée
    if (STATE.currentConnectionType === 'bt') {
      sel.value = '__bluetooth__';
    } else if (STATE.currentConnectionType === 'usb' && STATE.midiOutput) {
      sel.value = STATE.midiOutput.id;
    } else if (isFirstLoad && selIdx === 0) {
      const pianoOpt = Array.from(sel.options).find(
        o => o.value !== '__none__'
          && o.value !== '__bluetooth__'
          && o.textContent.toLowerCase().includes('piano')
      );
      if (pianoOpt) {
        sel.value = pianoOpt.value;
        sel.dispatchEvent(new Event('change'));
      } else {
        sel.value = '__none__';
      }
    } else {
      sel.value = prev || '__none__';
    }
  });
}

function disconnectMidiInput() {
  if (STATE.midiInput) {
    STATE.midiInput.onmidimessage = null;
    STATE.midiInput = null;
  }
}

// ═══════════════════════════════════════════════════════
// HANDLER — Changement de connexion (délégué depuis app.js)
// ═══════════════════════════════════════════════════════

async function handleMidiSelectChange(val) {
  updateAllMidiSelects(val);

  if (val === '__none__') {
    if (STATE.bt?.status === 'connected') STATE.bt.disconnect();
    disconnectMidiInput();
    STATE.midiOutput = null;
    STATE.currentConnectionType = null;
    updateAllMidiBadges();

  } else if (val === '__bluetooth__') {
    const prevOutput = STATE.midiOutput;
    const prevId     = prevOutput?.id ?? null;
    if (STATE.midiOutput) { disconnectMidiInput(); STATE.midiOutput = null; }

    if (STATE.bt?.status !== 'connected') {
      await STATE.bt.connect();
      if (STATE.bt?.status !== 'connected') {
        // Annulation utilisateur — restaurer USB si possible
        if (prevOutput && prevId) {
          STATE.midiOutput = prevOutput;
          STATE.currentConnectionType = 'usb';
          updateAllMidiSelects(prevId);
        } else {
          STATE.currentConnectionType = null;
          updateAllMidiSelects('__none__');
        }
        updateAllMidiBadges();
      }
    }

  } else {
    // Connexion USB
    STATE.isSwitchingToUsb = true;
    if (STATE.bt?.status === 'connected') STATE.bt.disconnect();
    disconnectMidiInput();
    STATE.midiOutput = null;

    STATE.midiAccess.outputs.forEach(out => {
      if (out.id === val) STATE.midiOutput = out;
    });
    STATE.midiAccess.inputs.forEach(inp => {
      if (inp.name === STATE.midiOutput?.name) STATE.midiInput = inp;
    });

    if (STATE.midiInput) {
      STATE.midiInput.onmidimessage = event => {
        if (STATE.midiOutput) STATE.midiOutput.send(event.data);
      };
    }

    STATE.currentConnectionType = STATE.midiOutput ? 'usb' : null;
    STATE.isSwitchingToUsb = false;
    updateAllMidiBadges();
    if (STATE.midiOutput) sendVolume(STATE.midiVolume);
  }
}
