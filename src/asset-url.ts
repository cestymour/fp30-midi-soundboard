/* ================================================================
   asset-url.ts — Adresse d'un son ou d'une image, avec son empreinte.

   À la build, chaque fichier de public/sounds/ et public/images/ reçoit
   une empreinte de son contenu (tools/asset-hashes.ts, injectée dans
   __ASSET_HASHES__). Toute lecture d'un son ou d'une image passe par
   assetUrl(), qui ajoute `?v=<empreinte>` : un fichier remplacé sous le
   même nom change d'adresse, et le cache du Service Worker (rangé par
   adresse) le télécharge à nouveau. En dev, pas d'empreinte : l'adresse
   reste le chemin de la config.
================================================================ */

/** Lue une fois : remplacée par un littéral à la build, elle serait sinon recréée à chaque appel */
const ASSET_HASHES: Record<string, string> = __ASSET_HASHES__;

export function assetUrl(path: string, hashes: Record<string, string> = ASSET_HASHES): string {
  const hash = hashes[path];
  return hash ? `${path}?v=${hash}` : path;
}
