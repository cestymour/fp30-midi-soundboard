<!--
  AudioPanel.svelte — Panneau d'un onglet audio : barre de contrôles et grille de sons.
  Onglets musiques : transport, effets, arrêt d'urgence, volume des musiques.
  Onglets sons : bouton qui coupe les sons, arrêt d'urgence, volume des sons.
-->
<script lang="ts">
  import type { AudioTab, Category, AudioItem } from '../../types.ts';
  import { STATE } from '../../state.svelte.ts';
  import { hasCurrentSound, setMusicVolume } from '../../audio/playback.ts';
  import { setSoundVolume } from '../../audio/sounds.ts';
  import { TAB_ACCENTS } from '../../config/tabs.ts';
  import { audioFxOverlay, fxToolbar } from '../fx-overlays.svelte.ts';
  import Transport from './Transport.svelte';
  import SoundButton from './SoundButton.svelte';
  import CategoryTitle from './CategoryTitle.svelte';
  import Panel from './Panel.svelte';
  import FxToolbar from './FxToolbar.svelte';
  import EmergencyStopButton from './EmergencyStopButton.svelte';
  import VolumeControl from './VolumeControl.svelte';
  import StopSoundsButton from './StopSoundsButton.svelte';
  import { colorChannels } from '../color-channels.ts';

  let { tab, index }: { tab: AudioTab; index: number } = $props();

  const isSounds  = $derived(tab.kind === 'sounds');
  const hasSound  = $derived(hasCurrentSound());
  const isPlaying = $derived(isSounds ? STATE.soundVoices > 0 : hasSound && !STATE.isPaused);
  const isPaused  = $derived(!isSounds && hasSound && STATE.isPaused);
  const volumePct = $derived(Math.round((isSounds ? STATE.soundVolume : STATE.musicVolume) * 100));

  /** Catégories réparties en colonnes (onglets avec `cols`) */
  const columns = $derived.by((): Category<AudioItem>[][] => {
    if (!tab.cols || tab.cols <= 1) return [];
    // Répartition donnée par l'onglet : colSizes[i] catégories dans la colonne i
    if (tab.colSizes) {
      let next = 0;
      return tab.colSizes.map(size => tab.categories.slice(next, next += size));
    }
    const colCount     = tab.cols;
    const blocksPerCol = Math.ceil(tab.categories.length / colCount);
    const cols: Category<AudioItem>[][] = Array.from({ length: colCount }, () => []);
    tab.categories.forEach((cat, catIdx) => cols[Math.floor(catIdx / blocksPerCol)].push(cat));
    return cols;
  });

  function handleVolume(raw: number): void {
    if (isSounds) {
      setSoundVolume(raw / 100);
      return;
    }
    setMusicVolume(raw / 100);
    if (audioFxOverlay.isOpen) audioFxOverlay.sync();
  }
</script>

<Panel type="audio" kind={tab.kind} {index} accent={TAB_ACCENTS[tab.kind]} {isPlaying} {isPaused}>
  {#snippet left()}
    {#if isSounds}
      <StopSoundsButton />
    {:else}
      <Transport />
      <FxToolbar
        kind="audio" openTitle="Mixer audio" resetTitle="Réinitialiser les effets audio"
        isOpen={audioFxOverlay.isOpen} anyFx={fxToolbar.anyAudioFx}
        onopen={() => audioFxOverlay.open()} onreset={() => audioFxOverlay.reset()}
      />
    {/if}
  {/snippet}
  {#snippet right()}
    <VolumeControl
      sliderClass={isSounds ? 'audio-vol sounds-vol' : 'audio-vol'} max={100} value={volumePct} volPct={volumePct + '%'}
      valueText={volumePct + '%'} onvolume={handleVolume}
    />
    <EmergencyStopButton extraClass="audio-stop-btn" />
  {/snippet}

  {#if tab.gridType === 'fixed'}
    <div class="audio-grid fixed-grid">
      {#each tab.categories as cat (cat.id)}
        {#each cat.items as item (item.id)}
          <SoundButton {item} kind={tab.kind} />
        {/each}
      {/each}
    </div>
  {:else if tab.cols && tab.cols > 1}
    <div class="audio-grid audio-grid-cols">
      {#each columns as col, colIdx (colIdx)}
        <div class="audio-col">
          {#each col as cat (cat.id)}
            {@const catRgb = tab.catCols ? colorChannels(cat.color) : undefined}
            <div
              class="audio-cat-block"
              style:--cat-accent={tab.catCols ? cat.color : undefined}
              style:--cat-accent-r={catRgb?.r}
              style:--cat-accent-g={catRgb?.g}
              style:--cat-accent-b={catRgb?.b}
              style:--cat-accent-a={catRgb ? 1 : undefined}
            >
              <CategoryTitle {cat} />
              <div
                class="audio-cat-grid"
                data-cols={tab.catCols}
                style:grid-template-columns={tab.catCols ? `repeat(${tab.catCols}, 1fr)` : undefined}
              >
                {#each cat.items as item (item.id)}
                  <SoundButton {item} kind={tab.kind} />
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
          <SoundButton {item} kind={tab.kind} />
        {/each}
      {/each}
    </div>
  {/if}
</Panel>

<style>
  /* Les styles des boutons eux-mêmes (y compris dans la grille fixe)
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

  /* Écran trop petit pour les boutons (classe posée par equalizeAudioButtons) :
     la grille défile, les colonnes prennent la hauteur de leur contenu */
  .audio-grid-cols:global(.scrollable) {
    overflow-y: auto;
    overscroll-behavior: contain;
    align-items: flex-start;
  }

  .audio-cat-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: var(--gap-inner);
  }

  /* ═══════════════════════════════════════════════════════
    GRILLE FIXE (Animaux, Bruits, Ambiances) — 4×8 paysage, 8×4 portrait (transposé)
  ════════════════════════════════════════════════════════ */
  :global(.panel) .audio-grid.fixed-grid {
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
    :global(.panel) .audio-grid.fixed-grid {
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
