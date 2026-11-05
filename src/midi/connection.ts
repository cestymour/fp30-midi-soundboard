/* ================================================================
   connection.ts — Connexion MIDI : USB (Web MIDI) et Bluetooth (BLE)
   Aucun accès au DOM : l'interface suit l'état de connexion via
   `midiConnectionEvents`.
================================================================ */

import { STATE } from '../state.svelte.ts';
import { createEmitter } from '../events.ts';
import { BluetoothMIDI } from './bluetoothMIDI.ts';
import type { BluetoothStatus } from './bluetoothMIDI.ts';
import { sendRolandRemoteControl, sendVolume } from './midi.ts';

/** Valeurs spéciales de la liste de connexion (les sorties USB y figurent par leur id) */
export const MIDI_SELECT_NONE      = '__none__';
/** Bluetooth : reconnexion au piano connu sans sélecteur, sinon ouverture du sélecteur */
export const MIDI_SELECT_BLUETOOTH = '__bluetooth__';
/** Bluetooth, autre appareil : ouvre toujours le sélecteur (proposé quand un piano est connu) */
export const MIDI_SELECT_BLUETOOTH_OTHER = '__bluetooth_other__';

export type MidiConnectionEvent =
  /** STATE.currentConnectionType ou STATE.btStatus a pu changer (badge) */
  | { type: 'status' }
  /** Valeur à afficher dans toutes les listes de connexion */
  | { type: 'selection'; value: string }
  /** La liste des sorties a changé (accès Web MIDI, branchement USB, piano Bluetooth connu ou retrouvé) */
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
    onStatusChange: (status, error) => {
      STATE.btStatus = status;
      STATE.btError  = error;
      if (status === 'connected') {
        STATE.midiOutput = null;
        STATE.currentConnectionType = 'bt';
        midiConnectionEvents.emit({ type: 'outputs' }); // nom du piano connu dans les listes
        emitSelection(MIDI_SELECT_BLUETOOTH);
        midiConnectionEvents.emit({ type: 'status' });
        sendRolandRemoteControl();
        sendVolume(STATE.midiVolume);
      } else if (status === 'reconnecting' || status === 'connecting' || status === 'scanning') {
        // Badge « ◌ BT… » ; pendant une reconnexion automatique, la connexion reste « bt »
        midiConnectionEvents.emit({ type: 'status' });
      } else if (status === 'idle' || status === 'error' || status === 'lost') {
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
        midiConnectionEvents.emit({ type: 'status' });
      }
    },
  });
  // Dernier piano retrouvé (si le navigateur le permet) : proposé dans les listes,
  // pour s'y reconnecter sans sélecteur
  void STATE.bt.restore().then(found => {
    if (found) midiConnectionEvents.emit({ type: 'outputs' });
  });
}

// ═══════════════════════════════════════════════════════
// WEB MIDI (USB)
// ═══════════════════════════════════════════════════════

/**
 * Accès Web MIDI avec SysEx (réglages Roland, comme l'Ambiance : voir midi.ts).
 * Chrome demande l'autorisation une fois. Si elle est refusée, l'USB marche
 * quand même, sans les réglages en SysEx (prévenu dans la console).
 */
function requestMidiAccess(): Promise<MIDIAccess> {
  return navigator.requestMIDIAccess({ sysex: true }).catch((err: Error) => {
    console.warn('Accès Web MIDI avec SysEx refusé, nouvel essai sans SysEx (réverbération inactive en USB) :', err?.message);
    return navigator.requestMIDIAccess({ sysex: false });
  });
}

export function initWebMidi(): void {
  requestMidiAccess().then(access => {
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

// ═══════════════════════════════════════════════════════
// CHANGEMENT DE CONNEXION (choix dans la liste MIDI)
// ═══════════════════════════════════════════════════════

/** `val` : MIDI_SELECT_NONE, MIDI_SELECT_BLUETOOTH(_OTHER) ou l'id d'une sortie USB */
export async function selectMidiConnection(val: string): Promise<void> {
  const pickAnotherDevice = val === MIDI_SELECT_BLUETOOTH_OTHER;
  if (pickAnotherDevice) val = MIDI_SELECT_BLUETOOTH;
  emitSelection(val);

  if (val === MIDI_SELECT_NONE) {
    if (STATE.bt?.status === 'connected') STATE.bt.disconnect();
    STATE.midiOutput = null;
    STATE.currentConnectionType = null;
    midiConnectionEvents.emit({ type: 'status' });

  } else if (val === MIDI_SELECT_BLUETOOTH) {
    const prevOutput = STATE.midiOutput;
    const prevId     = prevOutput?.id ?? null;
    STATE.midiOutput = null;

    if (STATE.bt?.status !== 'connected' || pickAnotherDevice) {
      await (pickAnotherDevice ? STATE.bt!.connect() : STATE.bt!.reconnect());
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
    STATE.midiOutput = null;

    STATE.midiAccess!.outputs.forEach(out => {
      if (out.id === val) STATE.midiOutput = out;
    });

    STATE.currentConnectionType = STATE.midiOutput ? 'usb' : null;
    STATE.isSwitchingToUsb = false;
    midiConnectionEvents.emit({ type: 'status' });
    if (STATE.midiOutput) {
      sendRolandRemoteControl();
      sendVolume(STATE.midiVolume);
    }
  }
}
