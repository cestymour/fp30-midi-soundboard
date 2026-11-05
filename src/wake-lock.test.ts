import { afterEach, describe, expect, it, vi } from 'vitest';
import { STATE } from './state.svelte.ts';
import { initWakeLock } from './wake-lock.ts';

class FakeSentinel extends EventTarget {
  released = false;
  release(): void {
    this.released = true;
    this.dispatchEvent(new Event('release'));
  }
}

afterEach(() => {
  vi.unstubAllGlobals();
  STATE.wakeLock = null;
});

describe('Wake Lock (bug n° 12)', () => {
  it('verrou libéré par le navigateur, nouvelle demande refusée : plus affiché comme actif', async () => {
    const first = new FakeSentinel();
    const request = vi.fn()
      .mockResolvedValueOnce(first)
      .mockRejectedValueOnce(new Error('NotAllowedError'));
    const doc = Object.assign(new EventTarget(), { visibilityState: 'visible' });
    vi.stubGlobal('navigator', { wakeLock: { request } });
    vi.stubGlobal('document', doc);
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});

    initWakeLock();
    await vi.waitFor(() => expect(STATE.wakeLock).toBe(first));

    // Page en arrière-plan : le navigateur libère le verrou ; au retour, la demande échoue
    first.release();
    doc.dispatchEvent(new Event('visibilitychange'));
    await vi.waitFor(() => expect(request).toHaveBeenCalledTimes(2));

    expect(STATE.wakeLock).toBeNull();
  });
});
