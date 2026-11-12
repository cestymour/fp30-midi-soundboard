/* ================================================================
   icons/index.ts — Dessins SVG des tuiles
   Un fichier `<nom>.svg` par dessin dans ce dossier ; une tuile l'affiche à la
   place de son emoji avec `svg: '<nom>'` dans la configuration. Les dessins sont
   intégrés au JavaScript à la build : ils sont disponibles hors ligne sans
   passer par le cache des images.
   Style commun : viewBox 0 0 64 64, aplats de couleur sans contour, sujet vu
   de profil tourné vers la gauche, lisible sur le fond sombre des tuiles.
================================================================ */

const FILES = import.meta.glob<string>('./*.svg', { query: '?raw', import: 'default', eager: true });

/** Dessins par nom (nom du fichier sans `.svg`) */
export const TILE_ICONS: Readonly<Record<string, string>> = Object.fromEntries(
  Object.entries(FILES).map(([path, svg]) => [path.slice(2, -4), svg]),
);
