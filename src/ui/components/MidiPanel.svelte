<!--
  MidiPanel.svelte — Panneau d'un onglet MIDI : barre de contrôles
  (connexion, effets, stop, volume) et grille d'instruments.
  En portrait, la grille passe sur 2 colonnes (les autres sont masquées).
-->
<script lang="ts">
  import type { MidiItem, MidiTab, Category } from '../../types.ts';
  import { STATE } from '../../state.svelte.ts';
  import { setMidiVolume } from '../../midi/midi.ts';
  import { selectMidiConnection } from '../../midi/connection.ts';
  import { instruments, midiSelects, registerMidiSelect, selectInstrument } from '../midi-ui.svelte.ts';
  import { fxToolbar, midiFxOverlay, resetAllFXEffects } from '../fx-overlays.svelte.ts';
  import { layout } from '../layout.svelte.ts';
  import CategoryTitle from './CategoryTitle.svelte';
  import PanelUtilityButton from './PanelUtilityButton.svelte';
  import EmergencyStopButton from './EmergencyStopButton.svelte';
  import VolumeControl from './VolumeControl.svelte';

  let { tab, index }: { tab: MidiTab; index: number } = $props();

  /** Liste de connexion de ce panneau */
  const selectIndex = registerMidiSelect();

  const BADGES = {
    usb:  { text: '● USB', className: 'midi-badge usb' },
    bt:   { text: '● BT',  className: 'midi-badge bt' },
    none: { text: 'Non connecté', className: 'midi-badge' },
  };
  const badge = $derived(BADGES[STATE.currentConnectionType ?? 'none']);

  // ── Grille : colonnes de la config, 2 en portrait ──
  const colCount     = $derived(tab.cols ?? 5);
  const visibleCols  = $derived(layout.isPortrait ? 2 : colCount);
  const columns = $derived.by((): Category<MidiItem>[][] => {
    const blocksPerCol = Math.ceil(tab.categories.length / visibleCols);
    const cols: Category<MidiItem>[][] = Array.from({ length: colCount }, () => []);
    tab.categories.forEach((cat, catIdx) => cols[Math.floor(catIdx / blocksPerCol)].push(cat));
    return cols;
  });

  function handleVolume(raw: number): number {
    setMidiVolume(raw);
    return STATE.midiVolume;
  }
</script>

<section
  class="panel panel-midi"
  class:active={layout.activeTab === index}
  data-panel={index}
  data-type="midi"
  style:--panel-accent={tab.accent}
>
  <div class="panel-controls">
    <div class="controls-left">
      <div class="midi-connect">
        <select
          class="midi-select"
          value={midiSelects.values[selectIndex]}
          onchange={event => selectMidiConnection(event.currentTarget.value)}
        >
          {#each midiSelects.options as option (option.value)}
            <option value={option.value}>{option.label}</option>
          {/each}
        </select>
        <span class={badge.className}>{badge.text}</span>
      </div>
    </div>
    <div class="controls-right">
      <div class="fx-btn-group">
        <PanelUtilityButton
          className="midi-fx-open-btn" title="Effets piano" icon="🎚️" label="Effets"
          active={midiFxOverlay.isOpen} onclick={() => midiFxOverlay.open()}
        />
        <PanelUtilityButton
          className="midi-fx-reset-btn" title="Réinitialiser les effets piano" icon={'↺'} label="Reset"
          active={fxToolbar.anyFx} onclick={resetAllFXEffects}
        />
      </div>
      <EmergencyStopButton />
      <VolumeControl
        sliderClass="midi-vol" max={127} value={STATE.midiVolume}
        volPct={(STATE.midiVolume / 127 * 100).toFixed(1) + '%'}
        valueText={String(STATE.midiVolume)} onvolume={handleVolume}
      />
    </div>
  </div>

  <div class="midi-grid">
    {#each columns as col, colIdx (colIdx)}
      <div class="midi-col" style:display={colIdx < visibleCols ? undefined : 'none'}>
        {#each col as cat (cat.id)}
          <div class="cat-block">
            <CategoryTitle {cat} />
            <div class="btn-grid">
              {#each cat.items as item (item.id)}
                <button
                  class="inst-btn"
                  class:active={instruments.active === item}
                  title={item.title ?? item.name}
                  onclick={() => selectInstrument(item)}
                >
                  <span class="btn-icon">{item.icon}</span>
                  <span class="btn-label">{item.name}</span>
                </button>
              {/each}
            </div>
          </div>
        {/each}
      </div>
    {/each}
  </div>
</section>
