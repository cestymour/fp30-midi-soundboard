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
