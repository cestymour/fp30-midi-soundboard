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
  import { midiSelects, registerMidiSelect } from '../midi-ui.svelte.ts';
  import { fxToolbar, midiFxOverlay } from '../fx-overlays.svelte.ts';
  import { layout } from '../layout.svelte.ts';
  import { TAB_ACCENTS } from '../../config/tabs.ts';
  import CategoryTitle from './CategoryTitle.svelte';
  import Panel from './Panel.svelte';
  import FxToolbar from './FxToolbar.svelte';
  import EmergencyStopButton from './EmergencyStopButton.svelte';
  import VolumeControl from './VolumeControl.svelte';
  import InstrumentButton from './InstrumentButton.svelte';

  let { tab, index }: { tab: MidiTab; index: number } = $props();

  /** Liste de connexion de ce panneau */
  const selectIndex = registerMidiSelect();

  const BADGES = {
    usb:     { text: '● USB', className: 'midi-badge usb' },
    bt:      { text: '● BT',  className: 'midi-badge bt' },
    /** Connexion ou reconnexion automatique Bluetooth en cours */
    pending: { text: '◌ BT…', className: 'midi-badge bt' },
    none:    { text: '⚠ Non connecté', className: 'midi-badge off' },
    lost:    { text: 'BT perdu', className: 'midi-badge err' },
  };
  /** Échecs Bluetooth (un sélecteur fermé sans choisir n'en est pas un) */
  const BT_ERROR_BADGES = {
    adapterOff: { text: 'Bluetooth désactivé', className: 'midi-badge err' },
    denied:     { text: 'Bluetooth refusé', className: 'midi-badge err' },
    failed:     { text: 'Échec BT', className: 'midi-badge err' },
  };
  const badge = $derived.by(() => {
    if (STATE.currentConnectionType === 'usb') return BADGES.usb;
    const bt = STATE.btStatus;
    if (bt === 'connecting' || bt === 'reconnecting') return BADGES.pending;
    if (STATE.currentConnectionType === 'bt') return BADGES.bt;
    if (bt === 'lost') return BADGES.lost;
    if (bt === 'error' && STATE.btError) return BT_ERROR_BADGES[STATE.btError];
    return BADGES.none;
  });

  // ── Grille : colonnes de la config, 2 en portrait ──
  const colCount     = $derived(tab.cols ?? 5);
  const visibleCols  = $derived(layout.isPortrait ? 2 : colCount);
  const columns = $derived.by((): Category<MidiItem>[][] => {
    const blocksPerCol = Math.ceil(tab.categories.length / visibleCols);
    const cols: Category<MidiItem>[][] = Array.from({ length: colCount }, () => []);
    tab.categories.forEach((cat, catIdx) => cols[Math.floor(catIdx / blocksPerCol)].push(cat));
    return cols;
  });

  function handleVolume(raw: number): void {
    setMidiVolume(raw);
  }
</script>

<Panel type="midi" kind="midi" {index} accent={TAB_ACCENTS.midi}>
  {#snippet left()}
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
    <FxToolbar
      kind="midi" openTitle="Effets piano" resetTitle="Réinitialiser les effets piano"
      isOpen={midiFxOverlay.isOpen} anyFx={fxToolbar.anyMidiFx}
      onopen={() => midiFxOverlay.open()} onreset={() => midiFxOverlay.reset()}
    />
  {/snippet}
  {#snippet right()}
    <VolumeControl
      sliderClass="midi-vol" max={127} value={STATE.midiVolume}
      volPct={(STATE.midiVolume / 127 * 100).toFixed(1) + '%'}
      valueText={String(STATE.midiVolume)} onvolume={handleVolume}
    />
    <EmergencyStopButton />
  {/snippet}

  <div class="midi-grid">
    {#each columns as col, colIdx (colIdx)}
      <div class="midi-col" style:display={colIdx < visibleCols ? undefined : 'none'}>
        {#each col as cat (cat.id)}
          <div class="cat-block">
            <CategoryTitle {cat} />
            <div class="btn-grid">
              {#each cat.items as item (item.id)}
                <InstrumentButton {item} />
              {/each}
            </div>
          </div>
        {/each}
      </div>
    {/each}
  </div>
</Panel>

<style>
  /* ── Connexion MIDI ── */
  .midi-connect {
    display: flex;
    align-items: center;
    gap: 8px;
    min-width: 0;
    flex: 0 1 auto;
  }

  /* ── Focus accessible (clavier uniquement) ── */
  .midi-select:focus-visible {
    outline: 2px solid var(--current-accent);
    outline-offset: -2px;
  }

  .midi-select {
    font-family: var(--font-mono);
    font-size: 11px;
    background: var(--bg-base);
    color: var(--text-primary);
    border: 1px solid var(--border);
    padding: 6px 10px;
    border-radius: 4px;
    cursor: pointer;
    transition: border-color 0.12s;
    min-width: 0;
    flex-shrink: 1;
  }
  .midi-select:hover { border-color: var(--border-glow); }

  .midi-badge {
    font-family: var(--font-mono);
    font-size: 11px;
    padding: 4px 10px;
    border-radius: 20px;
    border: 1px solid var(--border);
    color: var(--text-muted);
    white-space: nowrap;
    flex-shrink: 0;
    min-width: 90px;
    text-align: center;
  }
  .midi-badge.usb { color: #4cffaa; border-color: #4cffaa; }
  .midi-badge.bt  { color: #55aaff; border-color: #55aaff; }
  /* Piano non connecté ou connexion en échec : l'état le plus grave sur scène,
     badge plein qui se voit de loin (orange sans connexion, rouge en échec) */
  .midi-badge.off,
  .midi-badge.err {
    font-weight: 700;
    font-size: 13px;
    color: #1a0a00;
  }
  .midi-badge.off { background: #ff9a1f; border-color: #ff9a1f; }
  .midi-badge.err { background: #ff4444; border-color: #ff4444; color: #fff; }

  /* ═══════════════════════════════════════════════════════
      COLONNES ET BLOCS CATÉGORIE
  ════════════════════════════════════════════════════════ */
  .midi-col {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: var(--gap);
    min-width: 0;
    overflow: hidden;
  }

  .cat-block {
    display: flex;
    flex-direction: column;
    gap: var(--gap-inner);
    flex-shrink: 0;
  }

  /* ═══════════════════════════════════════════════════════
      PANNEAU MIDI — colonnes indépendantes
  ════════════════════════════════════════════════════════ */
  .midi-grid {
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: row;
    gap: var(--gap);
    overflow: hidden;
  }

  /* Écran trop petit pour les boutons (classe posée par equalizeMidiButtons) :
     la grille défile, les colonnes prennent la hauteur de leur contenu */
  .midi-grid:global(.scrollable) {
    overflow-y: auto;
    overscroll-behavior: contain;
    align-items: flex-start;
  }

  .btn-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: var(--gap-inner);
  }

  /* Les styles des tuiles sont dans Tile.svelte */

  /* ── Mobile ── */
  @media (max-width: 600px) {
    .midi-select { max-width: 130px; font-size: 10px; }
    .midi-badge  { min-width: 70px; font-size: 10px; }
    .midi-badge.off,
    .midi-badge.err { font-size: 11px; }
  }

  /* ── Portrait — tous écrans ── */
  @media (orientation: portrait) {
    .midi-connect {
      flex: 1;
      min-width: 0;
      display: flex;
      align-items: center;
    }
  }
</style>
