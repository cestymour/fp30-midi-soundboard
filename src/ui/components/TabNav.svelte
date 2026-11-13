<!--
  TabNav.svelte — Onglets (MIDI puis audio)
  Les onglets tiennent toujours sur la largeur, sans défilement (un clic suffit pour
  changer d'onglet) : libellés complets, puis marges réduites (« compact »), puis
  emoji seuls (« icons »). Le seuil dépend de la largeur réelle des libellés et de
  la police : il est mesuré en JS, sur la barre affichée.
-->
<script lang="ts">
  import { flushSync, onMount } from 'svelte';
  import { colorChannels } from '../color-channels.ts';
  import { activateTab, getAllTabs, getTabAccent, getTabKind, layout } from '../layout.svelte.ts';
  import TileIcon from './TileIcon.svelte';

  type TabNavMode = 'full' | 'compact' | 'icons';

  const tabs = getAllTabs();

  let nav: HTMLElement;
  let mode = $state<TabNavMode>('full');

  /** Mode le plus lisible dont les onglets tiennent sans déborder de la barre */
  function fitTabs(): void {
    for (const candidate of ['full', 'compact', 'icons'] as const) {
      flushSync(() => { mode = candidate; });
      if (nav.scrollWidth <= nav.clientWidth) return;
    }
  }

  onMount(() => {
    // La barre a une largeur imposée par l'en-tête (flex: 1, défilement) : changer
    // de mode ne change pas sa taille, l'observateur ne se relance pas lui-même.
    const observer = new ResizeObserver(fitTabs);
    observer.observe(nav);
    // Les libellés s'élargissent quand la police Rajdhani arrive
    void document.fonts?.ready.then(fitTabs);
    return () => observer.disconnect();
  });
</script>

<nav id="tab-nav" bind:this={nav} class:compact={mode === 'compact'} class:icons={mode === 'icons'}>
  {#each tabs as tab, idx (tab.id)}
    {@const accent = getTabAccent(tab)}
    {@const rgb = colorChannels(accent)}
    <button
      class="tab-btn"
      class:active={layout.activeTab === idx}
      data-tab={idx}
      data-type={tab.type}
      data-kind={getTabKind(tab)}
      style:--tab-accent={accent}
      style:--tab-accent-r={rgb?.r}
      style:--tab-accent-g={rgb?.g}
      style:--tab-accent-b={rgb?.b}
      title={tab.label}
      onclick={() => activateTab(idx)}
    >
      <span class="tab-icon"><TileIcon svg={tab.svg} emoji={tab.icon} /></span>
      <span class="tab-label">{tab.label}</span>
    </button>
  {/each}
</nav>

<style>
  #tab-nav {
    flex: 1;
    display: flex;
    align-items: stretch;
    overflow-x: auto;
    overflow-y: hidden;
    scrollbar-width: none;
  }
  #tab-nav::-webkit-scrollbar { display: none; }

  /* ── Focus accessible (clavier uniquement) ── */
  .tab-btn:focus-visible {
    outline: 2px solid var(--current-accent);
    outline-offset: -2px;
  }

  .tab-btn {
    flex: 1 0 auto;
    min-width: 90px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    padding: 0 12px;
    border: none;
    border-right: 1px solid var(--border);
    background: transparent;
    color: var(--text-secondary);
    font-family: var(--font-display);
    font-size: 13px;
    font-weight: 700;
    letter-spacing: 0.08em;
    cursor: pointer;
    transition: color 0.15s, background 0.15s;
    position: relative;
    white-space: nowrap;
  }
  .tab-btn:last-child { border-right: none; }

  .tab-btn:hover {
    color: var(--text-secondary);
    background: rgba(255, 255, 255, 0.14);
  }
  /* Onglet actif : fond teinté et texte dans la couleur de son type (MIDI, sons, musiques) */
  .tab-btn.active {
    color: var(--tab-accent);
    background: color-mix(in srgb, var(--tab-accent) 28%, transparent);
  }

  .tab-btn[data-type="midi"] {
    background:
      repeating-linear-gradient(
        to right,
        rgba(255, 255, 255, 0.08) 0px,
        rgba(255, 255, 255, 0.08) 15px,
        rgba(0, 0, 0, 0.12) 15px,
        rgba(0, 0, 0, 0.12) 26px
      )
      top / 100% 50% no-repeat,
      linear-gradient(
        to top,
        rgba(255, 255, 255, 0.08) 0%,
        rgba(255, 255, 255, 0.08) 50%,
        transparent 50%
      );
    color: var(--text-secondary);
  }

  .tab-btn[data-type="midi"]:hover {
    background:
      repeating-linear-gradient(
        to right,
        rgba(255, 255, 255, 0.14) 0px,
        rgba(255, 255, 255, 0.14) 15px,
        rgba(0, 0, 0, 0.08) 15px,
        rgba(0, 0, 0, 0.08) 26px
      )
      top / 100% 50% no-repeat,
      linear-gradient(
        to top,
        rgba(255, 255, 255, 0.14) 0%,
        rgba(255, 255, 255, 0.14) 50%,
        transparent 50%
      );
    color: var(--text-primary);
  }

  /* Même teinte posée sur le motif de touches */
  .tab-btn[data-type="midi"].active {
    background:
      linear-gradient(
        color-mix(in srgb, var(--tab-accent) 28%, transparent),
        color-mix(in srgb, var(--tab-accent) 28%, transparent)
      ),
      repeating-linear-gradient(
        to right,
        rgba(255, 255, 255, 0.18) 0px,
        rgba(255, 255, 255, 0.18) 15px,
        rgba(0, 0, 0, 0.06) 15px,
        rgba(0, 0, 0, 0.06) 26px
      )
      top / 100% 50% no-repeat,
      linear-gradient(
        to top,
        rgba(255, 255, 255, 0.18) 0%,
        rgba(255, 255, 255, 0.18) 50%,
        transparent 50%
      );
    color: var(--tab-accent);
  }

  .tab-btn.active::after {
    content: '';
    position: absolute;
    bottom: -2px; left: 0; right: 0;
    height: 4px;
    background: var(--tab-accent);
    box-shadow: 0 0 12px var(--tab-accent);
  }

  .tab-icon  { font-size: 20px; line-height: 1; }
  .tab-label { font-size: 12px; }

  /* ── Desktop large ── */
  @media (min-width: 1024px) {
    .tab-label { font-size: 13px; }
  }

  /* ── Tablette portrait ── */
  @media (max-width: 1024px) and (orientation: portrait) {
    .tab-label { font-size: 11px; }
    /* Marges réduites : place pour le bouton de la musique de transition */
    .tab-btn { min-width: 70px; padding: 0 6px; gap: 4px; }
  }

  /* ── Libellés trop larges : marges réduites (mode posé par le script) ── */
  #tab-nav.compact .tab-btn { min-width: 0; padding: 0 6px; gap: 4px; }

  /* ── Toujours trop larges : emoji seuls, onglets de même largeur ── */
  #tab-nav.icons .tab-btn { flex: 1 1 0; min-width: 40px; padding: 0 4px; }
  #tab-nav.icons .tab-label { display: none; }
</style>
