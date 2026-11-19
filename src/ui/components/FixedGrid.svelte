<!--
  FixedGrid.svelte — Grille fixe de 32 cases qui remplit le panneau : 4×8 en paysage, transposée
  en 8×4 en portrait. Sert à tout onglet en `gridType: 'fixed'`, quel que soit son type
  (Animaux, Bruits, Ambiances…). Les styles des tuiles dans cette grille sont dans Tile.svelte.
-->
<script lang="ts">
  import type { Snippet } from 'svelte';

  /** class : classes en plus de fixed-grid (audio-grid dans les onglets audio) */
  let { class: className = '', children }: { class?: string; children: Snippet } = $props();
</script>

<div class={[className, 'fixed-grid']}>{@render children()}</div>

<style>
  :global(.panel) .fixed-grid {
    display: grid;
    grid-template-columns: repeat(8, 1fr);
    grid-template-rows: repeat(4, 1fr);
    gap: var(--gap-inner);

    flex: 1;
    min-height: 0;
    height: 100%;
    align-content: stretch;
    align-items: stretch;
  }

  /* ── Portrait — tous écrans ── */
  @media (orientation: portrait) {
    :global(.panel) .fixed-grid {
      grid-template-columns: repeat(4, 1fr);
      grid-template-rows: repeat(8, 1fr);
      grid-auto-flow: column;
    }
  }
</style>
