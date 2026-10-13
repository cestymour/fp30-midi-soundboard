<!--
  TabNav.svelte — Onglets (MIDI puis audio)
-->
<script lang="ts">
  import { activateTab, getAllTabs, layout } from '../layout.svelte.ts';

  const tabs = getAllTabs();
</script>

<nav id="tab-nav">
  {#each tabs as tab, idx (tab.id)}
    <button
      class="tab-btn"
      class:active={layout.activeTab === idx}
      data-tab={idx}
      data-type={tab.type}
      style:--tab-accent={tab.accent}
      onclick={() => activateTab(idx)}
    >
      <span class="tab-icon">{tab.icon}</span>
      <span class="tab-label">{tab.label}</span>
    </button>
  {/each}
</nav>
