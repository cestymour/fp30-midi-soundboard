/* ================================================================
   events.ts — Émetteur d'événements minimal et typé
   Permet aux moteurs (MIDI, audio) de prévenir l'interface d'un
   changement d'état sans dépendre du DOM.
================================================================ */

export type Listener<Event> = (event: Event) => void;

export interface Emitter<Event> {
  /** Abonne un écouteur ; renvoie la fonction de désabonnement */
  on(listener: Listener<Event>): () => void;
  emit(event: Event): void;
}

export function createEmitter<Event>(): Emitter<Event> {
  const listeners = new Set<Listener<Event>>();
  return {
    on(listener) {
      listeners.add(listener);
      return () => { listeners.delete(listener); };
    },
    emit(event) {
      listeners.forEach(listener => listener(event));
    },
  };
}
