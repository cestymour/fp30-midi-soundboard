/* ================================================================
   midi-ui.svelte.ts — État d'affichage MIDI : listes de connexion
   (une par panneau MIDI) et instrument actif.
   Mis à jour par midiConnectionEvents (midi/connection.ts).
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

class InstrumentsState {
  /** Dernier instrument choisi (un seul actif, tous panneaux confondus) ; sans proxy, comparé par identité */
  active = $state.raw<MidiItem | null>(null);
}

export const instruments = new InstrumentsState();

export function selectInstrument(item: MidiItem): void {
  instruments.active = item;
  sendInstrumentPatch(item);
}

// ═══════════════════════════════════════════════════════
// LISTES DE CONNEXION
// ═══════════════════════════════════════════════════════

export interface MidiSelectOption {
  value: string;
  label: string;
}

export const midiSelects = $state({
  /** Options affichées ; seule l'option « aucune » tant que Web MIDI n'a pas répondu */
  options: [{ value: MIDI_SELECT_NONE, label: '— Connexion MIDI —' }] as MidiSelectOption[],
  /** Valeur de chaque liste, par panneau MIDI ('' : valeur absente des options, rien de sélectionné) */
  values: [] as string[],
});

/** Valeur effectivement prise par une liste (comme select.value = val) */
function toSelectValue(val: string): string {
  return midiSelects.options.some(o => o.value === val) ? val : '';
}

/** Réserve la liste d'un panneau MIDI ; renvoie son index */
export function registerMidiSelect(): number {
  midiSelects.values.push(MIDI_SELECT_NONE);
  return midiSelects.values.length - 1;
}

function updateAllMidiSelects(val: string): void {
  midiSelects.values = midiSelects.values.map(() => toSelectValue(val));
}

/** Reconstruit les options (sorties USB, Bluetooth) et restaure la sélection de chaque liste */
function populateMidiSelects(isFirstLoad = false): void {
  const options: MidiSelectOption[] = [{ value: MIDI_SELECT_NONE, label: '— Connexion MIDI —' }];
  if (isBluetoothAvailable()) {
    options.push({ value: MIDI_SELECT_BLUETOOTH, label: 'ᛒ Bluetooth MIDI' });
  }
  getUsbOutputs().forEach(out => {
    options.push({ value: out.id, label: '🎹 ' + out.name });
  });
  midiSelects.options = options;

  midiSelects.values = midiSelects.values.map((prev, selIdx) => {
    // Restaurer la valeur sélectionnée
    if (STATE.currentConnectionType === 'bt') {
      return toSelectValue(MIDI_SELECT_BLUETOOTH);
    } else if (STATE.currentConnectionType === 'usb' && STATE.midiOutput) {
      return toSelectValue(STATE.midiOutput.id);
    } else if (isFirstLoad && selIdx === 0) {
      const pianoOpt = options.find(
        o => o.value !== MIDI_SELECT_NONE
          && o.value !== MIDI_SELECT_BLUETOOTH
          && o.label.toLowerCase().includes('piano')
      );
      // Le piano est seulement affiché, pas connecté : l'ancien code déclenchait un
      // événement change sans bubbles, jamais reçu (docs/bugs.md n° 3)
      return pianoOpt ? pianoOpt.value : MIDI_SELECT_NONE;
    }
    return toSelectValue(prev || MIDI_SELECT_NONE);
  });
}

/** Met l'interface à jour à chaque changement des sorties MIDI ou de la connexion */
export function bindMidiConnectionUI(): void {
  midiConnectionEvents.on(event => {
    // Le badge suit STATE.currentConnectionType directement (événement 'status')
    if (event.type === 'selection') updateAllMidiSelects(event.value);
    else if (event.type === 'outputs') populateMidiSelects(event.isFirstLoad);
  });
}
