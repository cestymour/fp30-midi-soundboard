<!--
  App.svelte — Racine de l'interface : onglets, bouton de la musique de transition, panneaux, popups (paramètres, transition, effets)
-->
<script lang="ts">
  import { onMount } from 'svelte';
  import { equalizeMidiButtons, getAllTabs, observePanelsResize, watchOrientation } from './ui/layout.svelte.ts';
  import { audioFxOverlay, midiFxOverlay } from './ui/fx-overlays.svelte.ts';
  import TabNav from './ui/components/TabNav.svelte';
  import MidiPanel from './ui/components/MidiPanel.svelte';
  import AudioPanel from './ui/components/AudioPanel.svelte';
  import SettingsPopup from './ui/components/SettingsPopup.svelte';
  import FxOverlay from './ui/FxOverlay.svelte';
  import TransitionButton from './ui/components/TransitionButton.svelte';
  import TransitionPopup from './ui/components/TransitionPopup.svelte';

  const tabs = getAllTabs();

  let panels: HTMLElement;
  let settingsPopup: SettingsPopup;

  onMount(() => {
    // Hauteur des boutons : au premier affichage, puis à chaque redimensionnement
    requestAnimationFrame(() => equalizeMidiButtons());
    watchOrientation();
    return observePanelsResize(panels);
  });
</script>

<header id="header">
  <TransitionButton />
  <TabNav />
  <button id="settings-btn" title="Paramètres" onclick={() => settingsPopup.open()} oncontextmenu={e => e.preventDefault()}>
    <span class="corner-pill">
      <!-- Engrenage dessiné : le caractère ⚙ est petit et peu lisible dans les polices du système -->
      <svg class="settings-gear" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M9.69 4.55 10.02 1.69 13.98 1.69 14.31 4.55 15.64 5.10 17.89 3.31 20.69 6.11 18.90 8.36 19.45 9.69 22.31 10.02 22.31 13.98 19.45 14.31 18.90 15.64 20.69 17.89 17.89 20.69 15.64 18.90 14.31 19.45 13.98 22.31 10.02 22.31 9.69 19.45 8.36 18.90 6.11 20.69 3.31 17.89 5.10 15.64 4.55 14.31 1.69 13.98 1.69 10.02 4.55 9.69 5.10 8.36 3.31 6.11 6.11 3.31 8.36 5.10Z" />
        <circle cx="12" cy="12" r="3.3" />
      </svg>
    </span>
  </button>
</header>

<main id="panels" bind:this={panels}>
  {#each tabs as tab, idx (tab.id)}
    {#if tab.type === 'midi'}
      <MidiPanel {tab} index={idx} />
    {:else}
      <AudioPanel {tab} index={idx} />
    {/if}
  {/each}
</main>

<TransitionPopup />
<SettingsPopup bind:this={settingsPopup} />
<FxOverlay controller={midiFxOverlay} />
<FxOverlay controller={audioFxOverlay} />

<style>
  /* ═══════════════════════════════════════════════════════
      HEADER — logo + onglets sur une seule ligne compacte
  ════════════════════════════════════════════════════════ */
  #header {
    height: var(--header-h);
    min-height: var(--header-h);
    display: flex;
    align-items: stretch;
    background: var(--bg-surface);
    border-bottom: 2px solid var(--border);
    z-index: 10;
  }

  #settings-btn {
    position: relative;
    width: var(--header-h);
    min-width: var(--header-h);
    height: 100%;
    padding: 0;
    border: none;
    background: transparent;
    color: var(--current-accent);
    cursor: pointer;
    flex-shrink: 0;
    user-select: none;
    -webkit-user-select: none;
  }
  /* Pastille à la couleur de la popup des paramètres */
  #settings-btn .corner-pill {
    border-color: color-mix(in srgb, var(--current-accent) 55%, transparent);
    background: color-mix(in srgb, var(--current-accent) 15%, transparent);
  }

  .settings-gear {
    width: 22px;
    height: 22px;
    fill: none;
    stroke: currentColor;
    stroke-width: 1.8;
    stroke-linejoin: round;
  }

  /* ── Focus accessible (clavier uniquement) ── */
  #settings-btn:focus-visible {
    outline: 2px solid var(--current-accent);
    outline-offset: -2px;
  }

  #settings-btn:hover .corner-pill {
    background: color-mix(in srgb, var(--current-accent) 25%, transparent);
  }

  #settings-btn:active .corner-pill {
    background: color-mix(in srgb, var(--current-accent) 35%, transparent);
  }

  /* ═══════════════════════════════════════════════════════
      PANELS
  ════════════════════════════════════════════════════════ */
  #panels {
    flex: 1;
    min-height: 0;
    position: relative;
  }
</style>
