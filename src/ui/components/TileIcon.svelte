<!--
  TileIcon.svelte — Icône d'une tuile : le dessin SVG `svg` s'il est donné, sinon l'emoji.
  Le dessin fait 1em de côté : il suit la taille de police de `.btn-icon`, comme l'emoji
  (et disparaît avec lui quand un état de lecture met cette taille à 0).
  ESSAI : le style affiché (emoji, détaillé, simple, V4) suit iconMode. La silhouette simple
  prend la couleur `--tile-icon-color` (couleur de la catégorie), posée par la tuile.
-->
<script lang="ts">
  import { TILE_ICONS, TILE_ICONS_SIMPLE, TILE_ICONS_V4 } from '../../icons/index.ts';
  import { iconMode } from '../icon-mode.svelte.ts';

  let { svg, emoji }: { svg?: string; emoji: string } = $props();

  const drawing = $derived(
    !svg || iconMode.value === 'emoji' ? undefined
      : iconMode.value === 'simple' ? TILE_ICONS_SIMPLE[svg]
      : iconMode.value === 'v4' ? TILE_ICONS_V4[svg] : TILE_ICONS[svg],
  );
</script>

<!-- Dessins du dépôt (src/icons/), jamais une saisie de l'utilisateur -->
{#if drawing}<span class="tile-svg">{@html drawing}</span>{:else}{emoji}{/if}

<style>
  .tile-svg {
    display: block;
    width: 1em;
    height: 1em;
    color: var(--tile-icon-color, var(--text-primary));
  }
  .tile-svg :global(svg) {
    display: block;
    width: 100%;
    height: 100%;
  }
</style>
