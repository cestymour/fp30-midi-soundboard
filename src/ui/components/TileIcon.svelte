<!--
  TileIcon.svelte — Icône d'une tuile ou d'un onglet : le dessin SVG `svg` s'il est donné, sinon l'emoji.
  Le dessin fait 1em de côté : il suit la taille de police de son conteneur, comme l'emoji
  (et disparaît avec lui quand un état de lecture met cette taille à 0).
-->
<script lang="ts">
  import { TILE_ICONS } from '../../icons/index.ts';

  let { svg, emoji }: { svg?: string; emoji: string } = $props();

  const drawing = $derived(svg ? TILE_ICONS[svg] : undefined);
</script>

<!-- Dessins du dépôt (src/icons/), jamais une saisie de l'utilisateur -->
{#if drawing}<span class="tile-svg">{@html drawing}</span>{:else}{emoji}{/if}

<style>
  .tile-svg {
    display: block;
    width: 1em;
    height: 1em;
  }
  .tile-svg :global(svg) {
    display: block;
    width: 100%;
    height: 100%;
  }
</style>
