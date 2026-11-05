import { afterEach, describe, expect, it, vi } from 'vitest';
import { updateAndReload } from './app-update.ts';

class FakeWorker extends EventTarget {
  constructor(public state: string) { super(); }
  moveTo(state: string): void {
    this.state = state;
    this.dispatchEvent(new Event('statechange'));
  }
}

function stubRegistration(registration: object | undefined): void {
  vi.stubGlobal('navigator', { serviceWorker: { getRegistration: async () => registration } });
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('updateAndReload (bug n° 7)', () => {
  it('hors ligne : ne recharge rien', async () => {
    const reload = vi.fn();
    stubRegistration({ update: async () => { throw new TypeError('Failed to fetch'); }, installing: null, waiting: null });

    expect(await updateAndReload(reload)).toBe('offline');
    expect(reload).not.toHaveBeenCalled();
  });

  it('déjà à jour : recharge tout de suite', async () => {
    const reload = vi.fn();
    stubRegistration({ update: async () => {}, installing: null, waiting: null });

    expect(await updateAndReload(reload)).toBe('reloading');
    expect(reload).toHaveBeenCalledOnce();
  });

  it('nouvelle version : recharge seulement une fois qu\'elle est active', async () => {
    const reload = vi.fn();
    const worker = new FakeWorker('installing');
    const registration = { installing: null as FakeWorker | null, waiting: null, update: async () => { registration.installing = worker; } };
    stubRegistration(registration);

    const result = updateAndReload(reload);
    await vi.waitFor(() => expect(registration.installing).toBe(worker));
    worker.moveTo('installed');
    expect(reload).not.toHaveBeenCalled();
    worker.moveTo('activated');

    expect(await result).toBe('reloading');
    expect(reload).toHaveBeenCalledOnce();
  });

  it('installation de la nouvelle version ratée : ne recharge rien', async () => {
    const reload = vi.fn();
    const worker = new FakeWorker('installing');
    const registration = { installing: null as FakeWorker | null, waiting: null, update: async () => { registration.installing = worker; } };
    stubRegistration(registration);

    const result = updateAndReload(reload);
    await vi.waitFor(() => expect(registration.installing).toBe(worker));
    worker.moveTo('redundant');

    expect(await result).toBe('failed');
    expect(reload).not.toHaveBeenCalled();
  });

  it('sans Service Worker (développement) : recharge', async () => {
    const reload = vi.fn();
    stubRegistration(undefined);

    expect(await updateAndReload(reload)).toBe('reloading');
    expect(reload).toHaveBeenCalledOnce();
  });
});
