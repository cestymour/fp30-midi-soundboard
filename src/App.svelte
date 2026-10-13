<!--
  App.svelte — Racine de l'interface : onglets, panneaux, popups
-->
<script lang="ts">
  import { onMount } from 'svelte';
  import { equalizeMidiButtons, getAllTabs, observePanelsResize, watchOrientation } from './ui/layout.svelte.ts';
  import { audioFxOverlay, midiFxOverlay } from './ui/fx-overlays.svelte.ts';
  import TabNav from './ui/components/TabNav.svelte';
  import MidiPanel from './ui/components/MidiPanel.svelte';
  import AudioPanel from './ui/components/AudioPanel.svelte';
  import AboutPopup from './ui/components/AboutPopup.svelte';
  import FxOverlay from './ui/FxOverlay.svelte';

  const tabs = getAllTabs();

  let panels: HTMLElement;
  let aboutPopup: AboutPopup;

  onMount(() => {
    // Hauteur des boutons : au premier affichage, puis à chaque redimensionnement
    requestAnimationFrame(() => equalizeMidiButtons());
    watchOrientation();
    return observePanelsResize(panels);
  });
</script>

<header id="header">
  <TabNav />
  <button id="settings-btn" title="Paramètres" onclick={() => aboutPopup.open()} oncontextmenu={e => e.preventDefault()}>⚙</button>
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

<AboutPopup bind:this={aboutPopup} />
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
    display: flex;
    align-items: center;
    justify-content: center;
    width: var(--header-h);
    min-width: var(--header-h);
    height: 100%;
    border: none;
    border-left: 1px solid var(--border);
    background: transparent;
    color: var(--text-muted);
    font-size: 30px;
    cursor: pointer;
    flex-shrink: 0;
    transition: color 0.15s, background 0.15s;
    user-select: none;
    -webkit-user-select: none;
  }

  /* ── Focus accessible (clavier uniquement) ── */
  #settings-btn:focus-visible {
    outline: 2px solid var(--current-accent);
    outline-offset: -2px;
  }

  #settings-btn:hover {
    color: var(--text-secondary);
    background: rgba(255, 255, 255, 0.03);
  }

  #settings-btn:active {
    color: var(--text-primary);
    background: rgba(255, 255, 255, 0.06);
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
