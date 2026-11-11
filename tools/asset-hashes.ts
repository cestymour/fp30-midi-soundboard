/* ================================================================
   asset-hashes.ts — Empreintes des sons et des images, calculées à la
   build (vite.config.ts) et injectées dans l'appli (__ASSET_HASHES__).

   L'appli ajoute `?v=<empreinte>` à l'adresse de chaque son et image
   (src/asset-url.ts) : un fichier modifié, même sous le même nom, a une
   autre adresse, et la tablette le télécharge au lieu de garder
   l'ancienne version de son cache.
================================================================ */

import { createHash } from 'node:crypto';
import { readFileSync, readdirSync } from 'node:fs';
import { join, relative } from 'node:path';

/** Longueur de l'empreinte (hexadécimal) : assez pour ne jamais confondre deux versions d'un fichier */
const HASH_LENGTH = 10;

function listFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    const path = join(dir, entry.name);
    return entry.isDirectory() ? listFiles(path) : [path];
  });
}

/**
 * Empreinte de chaque fichier des dossiers donnés de `publicDir`, par chemin
 * relatif à `publicDir` avec des `/` (« sounds/x.mp3 », comme dans la config).
 */
export function hashPublicAssets(publicDir: string, folders: string[] = ['sounds', 'images']): Record<string, string> {
  const hashes: Record<string, string> = {};
  for (const folder of folders) {
    for (const file of listFiles(join(publicDir, folder)).sort()) {
      const key = relative(publicDir, file).split('\\').join('/');
      hashes[key] = createHash('sha256').update(readFileSync(file)).digest('hex').slice(0, HASH_LENGTH);
    }
  }
  return hashes;
}
