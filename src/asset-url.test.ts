import { describe, expect, it } from 'vitest';
import { assetUrl } from './asset-url.ts';

describe('assetUrl', () => {
  it("ajoute l'empreinte connue du fichier", () => {
    expect(assetUrl('sounds/a.mp3', { 'sounds/a.mp3': '0123456789' })).toBe('sounds/a.mp3?v=0123456789');
  });

  it('laisse le chemin tel quel sans empreinte (dev, tests, fichier inconnu)', () => {
    expect(assetUrl('sounds/b.mp3', { 'sounds/a.mp3': '0123456789' })).toBe('sounds/b.mp3');
    expect(assetUrl('sounds/a.mp3')).toBe('sounds/a.mp3');
  });
});
