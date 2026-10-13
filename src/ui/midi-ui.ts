/* ================================================================
   midi-ui.ts — Interface MIDI : badges et listes de connexion,
                curseurs de volume, bouton d'instrument actif
================================================================ */

import type { MidiItem } from '../types.ts';
import { STATE } from '../state.svelte.ts';
import { sendInstrumentPatch } from '../midi/midi.ts';
import {
  MIDI_SELECT_BLUETOOTH, MIDI_SELECT_NONE, getUsbOutputs, isBluetoothAvailable, midiConnectionEvents,
} from '../midi/connection.ts';

// ═══════════════════════════════════════════════════════
// SÉLECTION INSTRUMENT
// ═══════════════════════════════════════════════════════

let activeInstBtn: HTMLButtonElement | null = null;

export function selectInstrument(btn: HTMLButtonElement, item: MidiItem): void {
  if (activeInstBtn) activeInstBtn.classList.remove('active');
  activeInstBtn = btn;
  btn.classList.add('active');
  sendInstrumentPatch(item);
}

// ═══════════════════════════════════════════════════════
// Synchronisation badges, selects et curseurs
// ═══════════════════════════════════════════════════════

function updateAllMidiBadges(): void {
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

function updateAllMidiSelects(val: string): void {
  document.querySelectorAll<HTMLSelectElement>('.midi-select').forEach(s => { s.value = val; });
}

export function syncMidiSliders(val: number): void {
  document.querySelectorAll<HTMLInputElement>('.midi-vol').forEach(s => {
    if (parseInt(s.value) === val) return;
    s.value = String(val);
    s.style.setProperty('--vol-pct', (val / 127 * 100).toFixed(1) + '%');
    s.closest('.panel-controls')!.querySelector('.vol-value')!.textContent = String(val);
  });
}

function populateMidiSelects(isFirstLoad = false): void {
  const usbOutputs = getUsbOutputs();

  document.querySelectorAll<HTMLSelectElement>('.midi-select').forEach((sel, selIdx) => {
    const prev = sel.value;
    sel.innerHTML = '';

    const noneOpt = document.createElement('option');
    noneOpt.value = MIDI_SELECT_NONE;
    noneOpt.textContent = '— Connexion MIDI —';
    sel.appendChild(noneOpt);

    if (isBluetoothAvailable()) {
      const btOpt = document.createElement('option');
      btOpt.value = MIDI_SELECT_BLUETOOTH;
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
      sel.value = MIDI_SELECT_BLUETOOTH;
    } else if (STATE.currentConnectionType === 'usb' && STATE.midiOutput) {
      sel.value = STATE.midiOutput.id;
    } else if (isFirstLoad && selIdx === 0) {
      const pianoOpt = Array.from(sel.options).find(
        o => o.value !== MIDI_SELECT_NONE
          && o.value !== MIDI_SELECT_BLUETOOTH
          && o.textContent!.toLowerCase().includes('piano')
      );
      if (pianoOpt) {
        sel.value = pianoOpt.value;
        // Événement sans bubbles : l'écouteur délégué sur #panels ne le reçoit pas (docs/bugs.md n° 3)
        sel.dispatchEvent(new Event('change'));
      } else {
        sel.value = MIDI_SELECT_NONE;
      }
    } else {
      sel.value = prev || MIDI_SELECT_NONE;
    }
  });
}

/** Met l'interface à jour à chaque changement de l'état de connexion MIDI */
export function bindMidiConnectionUI(): void {
  midiConnectionEvents.on(event => {
    if (event.type === 'status') updateAllMidiBadges();
    else if (event.type === 'selection') updateAllMidiSelects(event.value);
    else populateMidiSelects(event.isFirstLoad);
  });
}
