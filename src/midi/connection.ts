/* ================================================================
   connection.ts — Connexion MIDI : USB (Web MIDI) et Bluetooth (BLE)
   Aucun accès au DOM : l'interface suit l'état de connexion via
   `midiConnectionEvents`.
================================================================ */

import { STATE } from '../state.svelte.ts';
import { createEmitter } from '../events.ts';
import { BluetoothMIDI } from './bluetoothMIDI.ts';
import type { BluetoothStatus } from './bluetoothMIDI.ts';
import { sendVolume } from './midi.ts';

/** Valeurs spéciales de la liste de connexion (les sorties USB y figurent par leur id) */
export const MIDI_SELECT_NONE      = '__none__';
export const MIDI_SELECT_BLUETOOTH = '__bluetooth__';

export type MidiConnectionEvent =
  /** STATE.currentConnectionType a pu changer (badge USB / BT / non connecté) */
  | { type: 'status' }
  /** Valeur à afficher dans toutes les listes de connexion */
  | { type: 'selection'; value: string }
  /** La liste des sorties USB a changé (au premier accès Web MIDI, puis à chaque branchement) */
  | { type: 'outputs' };

export const midiConnectionEvents = createEmitter<MidiConnectionEvent>();

function emitSelection(value: string): void {
  midiConnectionEvents.emit({ type: 'selection', value });
}

/** Sorties USB disponibles */
export function getUsbOutputs(): MIDIOutput[] {
  const usbOutputs: MIDIOutput[] = [];
  if (STATE.midiAccess) STATE.midiAccess.outputs.forEach(o => usbOutputs.push(o));
  return usbOutputs;
}

/** Web Bluetooth disponible dans ce navigateur */
export function isBluetoothAvailable(): boolean {
  return !!navigator.bluetooth;
}

// ═══════════════════════════════════════════════════════
// BLUETOOTH MIDI
// ═══════════════════════════════════════════════════════

export function initBluetooth(): void {
  STATE.bt = new BluetoothMIDI({
    onStatusChange: (status) => {
      if (status === 'connected') {
        STATE.midiOutput = null;
        STATE.currentConnectionType = 'bt';
        emitSelection(MIDI_SELECT_BLUETOOTH);
        midiConnectionEvents.emit({ type: 'status' });
        sendVolume(STATE.midiVolume);
      } else if (status === 'idle' || status === 'error') {
        if (STATE.isSwitchingToUsb) return;
        if (STATE.currentConnectionType === 'bt') {
          STATE.currentConnectionType = null;
          midiConnectionEvents.emit({ type: 'status' });
        }
        if (STATE.midiOutput) {
          emitSelection(STATE.midiOutput.id);
        } else {
          emitSelection(MIDI_SELECT_NONE);
        }
      }
    },
  });
}

// ═══════════════════════════════════════════════════════
// WEB MIDI (USB)
// ═══════════════════════════════════════════════════════

export function initWebMidi(): void {
  navigator.requestMIDIAccess({ sysex: false }).then(access => {
    STATE.midiAccess = access;
    midiConnectionEvents.emit({ type: 'outputs' });
    autoConnectUsbPiano();
    access.onstatechange = () => midiConnectionEvents.emit({ type: 'outputs' });
  }, () => {
    STATE.currentConnectionType = null;
    midiConnectionEvents.emit({ type: 'status' });
  });
}

/** Au chargement : connexion USB au piano s'il est déjà branché (sortie dont le nom contient « piano ») */
function autoConnectUsbPiano(): void {
  if (STATE.currentConnectionType) return;
  const piano = getUsbOutputs().find(out => out.name?.toLowerCase().includes('piano'));
  if (piano) void selectMidiConnection(piano.id);
}

function disconnectMidiInput(): void {
  if (STATE.midiInput) {
    STATE.midiInput.onmidimessage = null;
    STATE.midiInput = null;
  }
}

// ═══════════════════════════════════════════════════════
// CHANGEMENT DE CONNEXION (choix dans la liste MIDI)
// ═══════════════════════════════════════════════════════

/** `val` : MIDI_SELECT_NONE, MIDI_SELECT_BLUETOOTH ou l'id d'une sortie USB */
export async function selectMidiConnection(val: string): Promise<void> {
  emitSelection(val);

  if (val === MIDI_SELECT_NONE) {
    if (STATE.bt?.status === 'connected') STATE.bt.disconnect();
    disconnectMidiInput();
    STATE.midiOutput = null;
    STATE.currentConnectionType = null;
    midiConnectionEvents.emit({ type: 'status' });

  } else if (val === MIDI_SELECT_BLUETOOTH) {
    const prevOutput = STATE.midiOutput;
    const prevId     = prevOutput?.id ?? null;
    if (STATE.midiOutput) { disconnectMidiInput(); STATE.midiOutput = null; }

    if (STATE.bt?.status !== 'connected') {
      await STATE.bt!.connect();
      // Le statut a changé pendant connect() : relu sans le rétrécissement de type d'avant l'await
      const statusAfterConnect = STATE.bt?.status as BluetoothStatus | undefined;
      if (statusAfterConnect !== 'connected') {
        // Annulation utilisateur — restaurer USB si possible
        if (prevOutput && prevId) {
          STATE.midiOutput = prevOutput;
          STATE.currentConnectionType = 'usb';
          emitSelection(prevId);
        } else {
          STATE.currentConnectionType = null;
          emitSelection(MIDI_SELECT_NONE);
        }
        midiConnectionEvents.emit({ type: 'status' });
      }
    }

  } else {
    // Connexion USB
    STATE.isSwitchingToUsb = true;
    if (STATE.bt?.status === 'connected') STATE.bt.disconnect();
    disconnectMidiInput();
    STATE.midiOutput = null;

    STATE.midiAccess!.outputs.forEach(out => {
      if (out.id === val) STATE.midiOutput = out;
    });
    STATE.midiAccess!.inputs.forEach(inp => {
      if (inp.name === STATE.midiOutput?.name) STATE.midiInput = inp;
    });

    if (STATE.midiInput) {
      STATE.midiInput.onmidimessage = event => {
        if (STATE.midiOutput) STATE.midiOutput.send(event.data!);
      };
    }

    STATE.currentConnectionType = STATE.midiOutput ? 'usb' : null;
    STATE.isSwitchingToUsb = false;
    midiConnectionEvents.emit({ type: 'status' });
    if (STATE.midiOutput) sendVolume(STATE.midiVolume);
  }
}
