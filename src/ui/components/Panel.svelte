<!--
  Panel.svelte — Cadre commun des panneaux MIDI et audio : barre de
  contrôles (zone gauche, zone droite) puis contenu (grille).
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { TabKind } from '../../types.ts';
  import { layout } from '../layout.svelte.ts';
  import { colorChannels } from '../color-channels.ts';

  let { type, kind, index, accent, isPlaying = false, isPaused = false, left, right, children }: {
    type:       'midi' | 'audio';
    /** Type d'onglet (MIDI, sons, musiques) */
    kind:       TabKind;
    index:      number;
    /** Couleur du type d'onglet (TAB_ACCENTS) */
    accent:     string;
    /** Panneau audio : une musique (ou, dans un onglet sons, un son) est en lecture / en pause */
    isPlaying?: boolean;
    isPaused?:  boolean;
    left:       Snippet;
    right:      Snippet;
    children:   Snippet;
  } = $props();

  const accentRgb = $derived(colorChannels(accent));
</script>

<section
  class="panel panel-{type}"
  class:active={layout.activeTab === index}
  class:is-playing={isPlaying}
  class:is-paused={isPaused}
  data-panel={index}
  data-type={type}
  data-kind={kind}
  style:--panel-accent={accent}
  style:--panel-accent-r={accentRgb?.r}
  style:--panel-accent-g={accentRgb?.g}
  style:--panel-accent-b={accentRgb?.b}
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
    }

    /* Deux lignes : transport (ou connexion) et effets, puis volume et stop */
    .controls-left {
      flex: 1 1 100%;
      min-width: 0;
      max-width: none;
      order: 1;
    }

    .controls-right {
      flex: 1 1 100%;
      max-width: none;
      order: 2;
    }

    /* Onglets sons : « Couper les sons », volume et stop sur une seule ligne */
    .panel[data-kind='sounds'] .controls-left {
      flex: 0 0 auto;
    }

    .panel[data-kind='sounds'] .controls-right {
      flex: 1 1 0;
    }
  }

  /* Onglets sons, largeur étroite (paysage ou portrait) : les boutons seuls, sans texte.
     Un seuil unique, pour que les libellés ne disparaissent pas puis ne reviennent pas
     quand l'orientation bascule. */
  @media (max-width: 600px) {
    .panel[data-kind='sounds'] :global(.stop-sounds-btn__label),
    .panel[data-kind='sounds'] :global(.emergency-stop-btn__label) {
      display: none;
    }

    .panel[data-kind='sounds'] :global(.stop-sounds-btn),
    .panel[data-kind='sounds'] :global(.emergency-stop-btn) {
      padding: 0;
      justify-content: center;
      width: 44px;
      min-width: 44px;
    }
  }
</style>
