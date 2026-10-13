<!--
  AudioPanel.svelte — Panneau d'un onglet audio : barre de contrôles
  (transport, effets, stop, volume) et grille de sons
-->
<script lang="ts">
  import type { AudioTab, Category, AudioItem } from '../../types.ts';
  import { STATE } from '../../state.svelte.ts';
  import { hasCurrentSound, setAudioVolume } from '../../audio/playback.ts';
  import { audioFxOverlay, fxToolbar, resetAllFXEffects } from '../fx-overlays.svelte.ts';
  import Transport from './Transport.svelte';
  import SoundButton from './SoundButton.svelte';
  import CategoryTitle from './CategoryTitle.svelte';
  import Panel from './Panel.svelte';
  import FxToolbar from './FxToolbar.svelte';
  import EmergencyStopButton from './EmergencyStopButton.svelte';
  import VolumeControl from './VolumeControl.svelte';

  let { tab, index }: { tab: AudioTab; index: number } = $props();

  const hasSound  = $derived(hasCurrentSound());
  const volumePct = $derived(Math.round(STATE.audioVolume * 100));

  /** Catégories réparties en colonnes (onglets avec `cols`) */
  const columns = $derived.by((): Category<AudioItem>[][] => {
    if (!tab.cols || tab.cols <= 1) return [];
    const colCount     = tab.cols;
    const blocksPerCol = Math.ceil(tab.categories.length / colCount);
    const cols: Category<AudioItem>[][] = Array.from({ length: colCount }, () => []);
    tab.categories.forEach((cat, catIdx) => cols[Math.floor(catIdx / blocksPerCol)].push(cat));
    return cols;
  });

  function handleVolume(raw: number): number {
    setAudioVolume(raw / 100);
    if (audioFxOverlay.isOpen) audioFxOverlay.sync();
    return Math.round(STATE.audioVolume * 100);
  }
</script>

<Panel type="audio" {index} accent={tab.accent} isPlaying={hasSound && !STATE.isPaused} isPaused={hasSound && STATE.isPaused}>
  {#snippet left()}
    <Transport />
  {/snippet}
  {#snippet right()}
    <FxToolbar
      kind="audio" openTitle="Mixer audio" resetTitle="Réinitialiser les effets audio"
      isOpen={audioFxOverlay.isOpen} anyFx={fxToolbar.anyFx}
      onopen={() => audioFxOverlay.open()} onreset={resetAllFXEffects}
    />
    <EmergencyStopButton extraClass="audio-stop-btn" />
    <VolumeControl
      sliderClass="audio-vol" max={100} value={volumePct} volPct={volumePct + '%'}
      valueText={volumePct + '%'} onvolume={handleVolume}
    />
  {/snippet}

  {#if tab.gridType === 'animals'}
    <div class="audio-grid animals-grid">
      {#each tab.categories as cat (cat.id)}
        {#each cat.items as item (item.id)}
          <SoundButton {item} />
        {/each}
      {/each}
    </div>
  {:else if tab.cols && tab.cols > 1}
    <div class="audio-grid audio-grid-cols">
      {#each columns as col, colIdx (colIdx)}
        <div class="audio-col">
          {#each col as cat (cat.id)}
            <div class="audio-cat-block">
              <CategoryTitle {cat} />
              <div class="audio-cat-grid">
                {#each cat.items as item (item.id)}
                  <SoundButton {item} />
                {/each}
              </div>
            </div>
          {/each}
        </div>
      {/each}
    </div>
  {:else}
    <div class="audio-grid">
      {#each tab.categories as cat (cat.id)}
        {#each cat.items as item (item.id)}
          <SoundButton {item} />
        {/each}
      {/each}
    </div>
  {/if}
</Panel>

<style>
  /* Les styles des boutons eux-mêmes (y compris dans la grille Animaux)
     sont dans SoundButton.svelte */

  /* ═══════════════════════════════════════════════════════
      COLONNES ET BLOCS CATÉGORIE
  ════════════════════════════════════════════════════════ */
  .audio-col {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: var(--gap);
    min-width: 0;
    overflow: hidden;
  }

  .audio-cat-block {
    display: flex;
    flex-direction: column;
    gap: var(--gap-inner);
    flex-shrink: 0;
  }

  /* ═══════════════════════════════════════════════════════
      PANNEAU AUDIO — grille
  ════════════════════════════════════════════════════════ */
  .audio-grid {
    flex: 1;
    min-height: 0;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(110px, 1fr));
    gap: var(--gap);
    align-content: start;
  }

  /* ═══════════════════════════════════════════════════════
    PANNEAU AUDIO — mode colonnes (Films)
  ════════════════════════════════════════════════════════ */
  .audio-grid-cols {
    display: flex;
    flex-direction: row;
    gap: var(--gap);
    overflow: hidden;
  }

  .audio-cat-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: var(--gap-inner);
  }

  /* ═══════════════════════════════════════════════════════
    GRILLE ANIMAUX — 4×8 paysage, 8×4 portrait (transposé)
  ════════════════════════════════════════════════════════ */
  :global(.panel) .audio-grid.animals-grid {
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

  /* ── Tablette portrait ── */
  @media (max-width: 1024px) and (orientation: portrait) {
    .audio-grid { grid-template-columns: repeat(auto-fit, minmax(100px, 1fr)); }
  }

  /* ── Mobile ── */
  @media (max-width: 600px) {
    .audio-grid { grid-template-columns: repeat(3, 1fr); }
  }

  /* ── Portrait — tous écrans ── */
  @media (orientation: portrait) {
    :global(.panel) .audio-grid.animals-grid {
      grid-template-columns: repeat(4, 1fr);
      grid-template-rows: repeat(8, 1fr);
      grid-auto-flow: column;
    }

    .audio-grid:not(.audio-grid-cols) .audio-cat-grid {
      grid-template-columns: repeat(2, 1fr);
    }

    /* Onglet Films : 2 colonnes en portrait */
    .audio-grid.audio-grid-cols {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      grid-template-rows: repeat(2, 1fr);
    }

    .audio-grid-cols .audio-col {
      width: 100%;
      min-height: 0;
    }
  }
</style>
