/* ================================================================
   icons/index.ts — Dessins SVG des tuiles
   Un fichier `<nom>.svg` par dessin ; une tuile l'affiche à la place de son emoji
   avec `svg: '<nom>'` dans la configuration. Les dessins sont intégrés au
   JavaScript à la build : ils sont disponibles hors ligne sans passer par le
   cache des images. viewBox 0 0 64 64 pour tous. Règles de dessin : docs/sons.md.
================================================================ */

function byName(files: Record<string, string>): Readonly<Record<string, string>> {
  return Object.fromEntries(
    Object.entries(files).map(([path, svg]) => [path.slice(path.lastIndexOf('/') + 1, -4), svg]),
  );
}

/** Dessins par nom (nom du fichier sans `.svg`) */
export const TILE_ICONS = byName(
  import.meta.glob<string>('./*.svg', { query: '?raw', import: 'default', eager: true }),
);
