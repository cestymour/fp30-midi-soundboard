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
  import Panel from './Panel.svelte';
  import FxToolbar from './FxToolbar.svelte';
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

  function handleVolume(raw: number): void {
    setMidiVolume(raw);
  }
</script>

<Panel type="midi" {index} accent={tab.accent}>
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
  {/snippet}
  {#snippet right()}
    <FxToolbar
      kind="midi" openTitle="Effets piano" resetTitle="Réinitialiser les effets piano"
      isOpen={midiFxOverlay.isOpen} anyFx={fxToolbar.anyFx}
      onopen={() => midiFxOverlay.open()} onreset={resetAllFXEffects}
    />
    <EmergencyStopButton />
    <VolumeControl
      sliderClass="midi-vol" max={127} value={STATE.midiVolume}
      volPct={(STATE.midiVolume / 127 * 100).toFixed(1) + '%'}
      valueText={String(STATE.midiVolume)} onvolume={handleVolume}
    />
  {/snippet}

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
  .midi-badge.err { color: #ff4444; border-color: #ff4444; }

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

  .btn-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: var(--gap-inner);
  }

  /* ═══════════════════════════════════════════════════════
      BOUTONS INSTRUMENT (même base que les boutons de sons)
  ════════════════════════════════════════════════════════ */
  /* ── Focus accessible (clavier uniquement) ── */
  .inst-btn:focus-visible {
    outline: 2px solid var(--current-accent);
    outline-offset: -2px;
  }

  .inst-btn {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: var(--gap-inner);
    padding: 10px 8px;
    border-radius: var(--radius);
    border: 1px solid var(--border);
    background: var(--bg-card);
    color: var(--text-secondary);
    font-family: var(--font-display);
    font-weight: 700;
    letter-spacing: 0.05em;
    cursor: pointer;
    transition: border-color 0.15s, color 0.15s, background 0.15s,
                box-shadow 0.15s, transform 0.08s;
    user-select: none;
    text-align: center;
    min-height: 0;
    height: var(--btn-h, 80px);
    position: relative;
    overflow: hidden;
    isolation: isolate;
    container-type: size;
  }

  .inst-btn:hover {
    border-color: var(--border-glow);
    color: var(--text-primary);
    background: var(--bg-card-hover);
  }

  .inst-btn:active { transform: scale(0.93); }

  .btn-icon {
    font-size: clamp(16px, 45cqh, 44px);
    line-height: 1;
    position: relative;
    z-index: 2;
    flex-shrink: 1;
  }
  .btn-label {
    font-size: clamp(7px, 18cqh, 14px);
    font-weight: 600;
    color: var(--text-secondary);
    text-align: center;
    line-height: 1.1;
    word-break: break-word;
    position: relative;
    z-index: 2;
    flex-shrink: 0;
  }
  .inst-btn:hover .btn-label { color: var(--text-primary); }

  /* ── État actif ── */
  .inst-btn.active {
    background: color-mix(in srgb, var(--panel-accent) 15%, var(--bg-card));
    border-color: var(--panel-accent);
    box-shadow: 0 0 10px color-mix(in srgb, var(--panel-accent) 35%, transparent);
    animation: active-pulse 2s ease-in-out infinite alternate;
  }
  .inst-btn.active .btn-label {
    color: var(--panel-accent);
    font-weight: 700;
  }
  .inst-btn.active .btn-icon {
    filter: drop-shadow(0 0 4px var(--panel-accent));
  }

  .inst-btn.active:hover {
    background: color-mix(in srgb, var(--panel-accent) 28%, var(--bg-card));
    box-shadow: 0 0 16px color-mix(in srgb, var(--panel-accent) 50%, transparent);
  }

  @keyframes active-pulse {
    from { box-shadow: 0 0 6px  color-mix(in srgb, var(--panel-accent) 25%, transparent); }
    to   { box-shadow: 0 0 16px color-mix(in srgb, var(--panel-accent) 50%, transparent); }
  }

  /* ── Mobile ── */
  @media (max-width: 600px) {
    .midi-select { max-width: 130px; font-size: 10px; }
    .midi-badge  { min-width: 70px; font-size: 10px; }
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
