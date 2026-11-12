/* ================================================================
   icons/index.ts — Dessins SVG des tuiles
   Un fichier `<nom>.svg` par dessin ; une tuile l'affiche à la place de son emoji
   avec `svg: '<nom>'` dans la configuration. Les dessins sont intégrés au
   JavaScript à la build : ils sont disponibles hors ligne sans passer par le
   cache des images.
   ESSAI : deux styles comparés (voir src/ui/icon-mode.svelte.ts) :
   - ce dossier : dessin détaillé de l'objet, en couleurs ;
   - simple/ : silhouette pleine d'une seule couleur (`currentColor`, la couleur
     de la catégorie), qui évoque la situation plutôt que l'instrument.
   viewBox 0 0 64 64 pour les deux.
================================================================ */

function byName(files: Record<string, string>): Readonly<Record<string, string>> {
  return Object.fromEntries(
    Object.entries(files).map(([path, svg]) => [path.slice(path.lastIndexOf('/') + 1, -4), svg]),
  );
}

/** Dessins détaillés par nom (nom du fichier sans `.svg`) */
export const TILE_ICONS = byName(
  import.meta.glob<string>('./*.svg', { query: '?raw', import: 'default', eager: true }),
);

/** Silhouettes simples, mêmes noms */
export const TILE_ICONS_SIMPLE = byName(
  import.meta.glob<string>('./simple/*.svg', { query: '?raw', import: 'default', eager: true }),
);
