<!--
  Panel.svelte — Cadre commun des panneaux MIDI et audio : barre de
  contrôles (zone gauche, zone droite) puis contenu (grille).
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { layout } from '../layout.svelte.ts';

  let { type, index, accent, isPlaying = false, isPaused = false, left, right, children }: {
    type:       'midi' | 'audio';
    index:      number;
    accent:     string;
    /** Panneau audio : un son est en lecture / en pause */
    isPlaying?: boolean;
    isPaused?:  boolean;
    left:       Snippet;
    right:      Snippet;
    children:   Snippet;
  } = $props();
</script>

<section
  class="panel panel-{type}"
  class:active={layout.activeTab === index}
  class:is-playing={isPlaying}
  class:is-paused={isPaused}
  data-panel={index}
  data-type={type}
  style:--panel-accent={accent}
>
  <div class="panel-controls">
    <div class="controls-left">
      {@render left()}
    </div>
    <div class="controls-right">
      {@render right()}
    </div>
  </div>

  {@render children()}
</section>

<style>
  .panel {
    display: none;
    flex-direction: column;
    width: 100%; height: 100%;
    padding: var(--gap);
    gap: var(--gap);
  }
  .panel.active { display: flex; }

  /* ═══════════════════════════════════════════════════════
    PANEL CONTROLS
  ════════════════════════════════════════════════════════ */
  .panel-controls {
    display: flex;
    align-items: center;
    height: var(--controls-h);
    min-height: var(--controls-h);
    background: color-mix(in srgb, var(--panel-accent, var(--current-accent)) 5%, var(--bg-surface));
    border: 1px solid color-mix(in srgb, var(--panel-accent, var(--current-accent)) 20%, var(--border));
    border-radius: var(--radius);
    padding: 0 12px;
    flex-shrink: 0;
    gap: 12px;
    box-shadow: 0 0 14px color-mix(in srgb, var(--panel-accent, var(--current-accent)) 14%, transparent);
  }

  /* ── Zone gauche (max 50%) ── */
  .controls-left {
    display: flex;
    align-items: center;
    gap: 8px;
    flex: 1 1 0;
    min-width: 0;
    max-width: 50%;
  }

  /* ── Zone droite (exactement 50%) ── */
  .controls-right {
    display: flex;
    align-items: center;
    gap: 8px;
    flex: 0 0 50%;
    min-width: 0;
    justify-content: flex-end;
  }

  /* ── Portrait — tous écrans ── */
  @media (orientation: portrait) {
    .panel-controls {
      flex-wrap: wrap;
      align-items: center;
      padding: 6px 10px;
      gap: 6px;
      height: auto;
      min-height: unset;
      position: relative;
      padding-bottom: 56px;
    }

    .controls-left {
      flex: 1 1 auto;
      min-width: 0;
      max-width: none;
      order: 1;
    }

    .controls-right {
      flex: 0 0 auto;
      max-width: none;
      order: 2;
    }

    /* Volume positionné en absolu sur toute la largeur */
    .controls-right :global(.volume-wrap) {
      position: absolute;
      left: 10px;
      right: 10px;
      bottom: 6px;
      width: calc(100% - 20px);
      max-width: none;
      height: 44px;
    }
  }
</style>
