<!--
  AudioPanel.svelte — Panneau d'un onglet audio : barre de contrôles
  (transport, effets, stop, volume) et grille de sons
-->
<script lang="ts">
  import type { AudioTab, Category, AudioItem } from '../../types.ts';
  import { STATE } from '../../state.svelte.ts';
  import { hasCurrentSound, setAudioVolume } from '../../audio/playback.ts';
  import { audioFxOverlay, fxToolbar, resetAllFXEffects } from '../fx-overlays.svelte.ts';
  import { layout } from '../layout.svelte.ts';
  import Transport from './Transport.svelte';
  import SoundButton from './SoundButton.svelte';
  import CategoryTitle from './CategoryTitle.svelte';
  import PanelUtilityButton from './PanelUtilityButton.svelte';
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

<section
  class="panel panel-audio"
  class:active={layout.activeTab === index}
  class:is-playing={hasSound && !STATE.isPaused}
  class:is-paused={hasSound && STATE.isPaused}
  data-panel={index}
  data-type="audio"
  style:--panel-accent={tab.accent}
>
  <div class="panel-controls">
    <div class="controls-left">
      <Transport />
    </div>
    <div class="controls-right">
      <div class="fx-btn-group">
        <PanelUtilityButton
          className="audio-fx-open-btn" title="Mixer audio" icon="🎚️" label="Effets"
          active={audioFxOverlay.isOpen} onclick={() => audioFxOverlay.open()}
        />
        <PanelUtilityButton
          className="audio-fx-reset-btn" title="Réinitialiser les effets audio" icon={'↺'} label="Reset"
          active={fxToolbar.anyFx} onclick={resetAllFXEffects}
        />
      </div>
      <EmergencyStopButton extraClass="audio-stop-btn" />
      <VolumeControl
        sliderClass="audio-vol" max={100} value={volumePct} volPct={volumePct + '%'}
        valueText={volumePct + '%'} onvolume={handleVolume}
      />
    </div>
  </div>

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
</section>
