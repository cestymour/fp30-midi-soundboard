/* ================================================================
   fx-animation.ts — Animation des curseurs d'effets vers des cibles
   (presets, reset, retour d'un contrôle au neutre)
================================================================ */

import type { FxControl } from '../types.ts';
import { easeOutCubic, interpolateFxValues } from './fx-presets.ts';
import type { FxCurrentValues, FxValues } from './fx-presets.ts';

export interface FxAnimation {
  cancel(): void;
}

/**
 * Interpole les valeurs à chaque frame (requestAnimationFrame) :
 * `onFrame` reçoit les valeurs alignées sur le pas de chaque contrôle,
 * `onEnd` est appelé une fois la durée écoulée (pas en cas d'annulation).
 */
export function animateFxValues<Key extends string>(
  controls: FxControl<Key, never>[],
  startValues: FxCurrentValues<Key>,
  targetValues: FxValues<Key>,
  durationMs: number,
  onFrame: (values: FxValues<Key>) => void,
  onEnd: () => void,
): FxAnimation {
  let frame: number | null = null;
  const startTime = performance.now();

  const animate = (now: number) => {
    const elapsed = now - startTime;
    const t       = Math.min(1, elapsed / durationMs);
    onFrame(interpolateFxValues(controls, startValues, targetValues, easeOutCubic(t)));

    if (t < 1) {
      frame = requestAnimationFrame(animate);
      return;
    }

    frame = null;
    onEnd();
  };

  frame = requestAnimationFrame(animate);

  return {
    cancel() {
      if (frame !== null) cancelAnimationFrame(frame);
      frame = null;
    },
  };
}
