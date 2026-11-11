import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { hashPublicAssets } from './asset-hashes.ts';

const dirs: string[] = [];

afterEach(() => {
  for (const dir of dirs.splice(0)) rmSync(dir, { recursive: true, force: true });
});

/** Dossier public factice : chemin relatif → contenu */
function makePublic(files: Record<string, string>): string {
  const dir = mkdtempSync(join(tmpdir(), 'asset-hashes-'));
  dirs.push(dir);
  for (const [path, content] of Object.entries(files)) {
    mkdirSync(dirname(join(dir, path)), { recursive: true });
    writeFileSync(join(dir, path), content);
  }
  return dir;
}

describe('hashPublicAssets', () => {
  it('donne une empreinte par fichier des sons et des images, sous-dossiers compris, par chemin avec des /', () => {
    const hashes = hashPublicAssets(makePublic({
      'sounds/a.mp3': 'son a',
      'sounds/transitions/t.mp3': 'transition',
      'images/films/f.jpg': 'affiche',
      'icon.png': 'hors des dossiers',
    }));

    expect(Object.keys(hashes).sort()).toEqual(['images/films/f.jpg', 'sounds/a.mp3', 'sounds/transitions/t.mp3']);
    expect(Object.values(hashes).every(hash => /^[0-9a-f]{10}$/.test(hash))).toBe(true);
  });

  it("dépend du contenu, pas du nom : un fichier modifié change d'empreinte", () => {
    const first  = hashPublicAssets(makePublic({ 'sounds/a.mp3': 'v1', 'sounds/b.mp3': 'v1', 'images/x.jpg': '' }));
    const second = hashPublicAssets(makePublic({ 'sounds/a.mp3': 'v2', 'sounds/b.mp3': 'v1', 'images/x.jpg': '' }));

    expect(first['sounds/a.mp3']).toBe(first['sounds/b.mp3']);
    expect(second['sounds/a.mp3']).not.toBe(first['sounds/a.mp3']);
    expect(second['sounds/b.mp3']).toBe(first['sounds/b.mp3']);
  });
});
