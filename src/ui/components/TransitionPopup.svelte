<!--
  TransitionPopup.svelte — Popup de la musique de transition, par-dessus les onglets
  (l'en-tête reste visible, donc le bouton pour l'arrêter aussi) : choix de la musique du
  spectacle, gros bouton de lancement (qui coupe tout ce qui jouait, comme l'arrêt
  d'urgence), progression, point de départ du prochain lancement, volume.
-->
<script lang="ts">
  import { STATE } from '../../state.svelte.ts';
  import { getTransitionMusics } from '../../config/tabs.ts';
  import { getPlaybackWindow, formatTime } from '../../audio/timing.ts';
  import {
    getSelectedTransitionMusic, isTransitionCurrent, resetTransitionStart,
    launchTransition, selectTransitionMusic, setTransitionVolume, stopTransition, willRestart,
  } from '../../audio/transition.ts';
  import { transport } from '../transport.svelte.ts';
  import { closeTransitionPopup, transitionPopup } from '../transition.svelte.ts';

  /** Arrête la musique et ferme la popup */
  function stop(): void {
    stopTransition();
    closeTransitionPopup();
  }
  import VolumeControl from './VolumeControl.svelte';

  const musics    = getTransitionMusics();
  const music     = $derived(getSelectedTransitionMusic());
  const isCurrent = $derived(isTransitionCurrent());
  // Recalculé à chaque ouverture et à chaque lancement (le délai de reprise dépend de l'heure)
  const restart   = $derived(transitionPopup.isOpen && willRestart());
  const nextStart = $derived(restart ? music.restart : (music.start ?? 0));
  const volumePct = $derived(Math.round(STATE.transitionVolume * 100));

  /** Position du point de reprise sur la barre de progression (connue une fois le fichier chargé) */
  const restartPct = $derived.by((): string | undefined => {
    void transport.seekPct;
    const duration = STATE.currentAudio?.duration ?? NaN;
    if (!isCurrent || !isFinite(duration)) return undefined;
    const { startOffset, totalDuration } = getPlaybackWindow(music, duration);
    if (totalDuration <= 0) return undefined;
    return Math.max(0, Math.min(100, (music.restart - startOffset) / totalDuration * 100)) + '%';
  });
</script>

{#if transitionPopup.isOpen}
  <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions (fermeture par le bouton ✕) -->
  <div id="transition-overlay" onclick={event => { if (event.target === event.currentTarget) closeTransitionPopup(); }}>
    <div id="transition-card" role="dialog" aria-label="Musique de transition">
      <div class="transition-head">
        <span class="transition-title">Musique de transition</span>
        <button class="transition-close" title="Fermer (la musique continue)" onclick={closeTransitionPopup}>✕</button>
      </div>

      <label class="transition-field">
        <span class="transition-caption">Musique du spectacle</span>
        <select value={music.id} onchange={event => selectTransitionMusic(event.currentTarget.value)}>
          {#each musics as option (option.id)}
            <option value={option.id}>{option.name}</option>
          {/each}
        </select>
      </label>

      <div class="transition-progress" class:is-current={isCurrent}>
        <div class="transition-bar">
          <div class="transition-bar-fill" style:width={isCurrent ? transport.seekPct : '0%'}></div>
          {#if restartPct}<div class="transition-bar-restart" style:left={restartPct} title="Point de reprise"></div>{/if}
        </div>
        <span class="transition-time">{isCurrent ? transport.timeText : 'À l\'arrêt'}</span>
      </div>

      <button class="transition-main" class:is-current={isCurrent} onclick={() => { if (isCurrent) stop(); else void launchTransition(); }}>
        {#if isCurrent}
          <span class="icon-stop" aria-hidden="true"></span> Arrêter
        {:else if restart}
          <span class="icon-play" aria-hidden="true"></span> Relancer à la reprise ({formatTime(nextStart)})
        {:else}
          <span class="icon-play" aria-hidden="true"></span> Lancer depuis le début
        {/if}
      </button>

      {#if !isCurrent}
        <div class="transition-next">
          {#if restart}
            <span>Prochain lancement : reprise à {formatTime(music.restart)}</span>
            <button class="transition-secondary" onclick={resetTransitionStart}>↺ Repartir du début</button>
          {:else}
            <span>Prochain lancement : depuis le début{music.start ? ` (${formatTime(music.start)})` : ''}, puis reprise à {formatTime(music.restart)}</span>
            <!-- Secours : « Repartir du début » cliqué par erreur, on peut quand même reprendre à la reprise -->
            <button class="transition-secondary" onclick={() => void launchTransition(Date.now(), 'restart')}>▶ Relancer à la reprise ({formatTime(music.restart)})</button>
          {/if}
        </div>
      {/if}

      <VolumeControl
        sliderClass="transition-vol" max={100} value={volumePct} volPct={volumePct + '%'}
        valueText={volumePct + '%'} onvolume={raw => setTransitionVolume(raw / 100)}
      />
    </div>
  </div>
{/if}

<style>
  #transition-overlay {
    position: fixed;
    top: var(--header-h);
    left: 0; right: 0; bottom: 0;
    z-index: 150;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 16px;
    background: rgba(0, 0, 0, 0.6);
  }

  #transition-card {
    /* Curseur de volume (.vol-slider) à la couleur de la transition */
    --panel-accent: var(--transition-accent);
    display: flex;
    flex-direction: column;
    gap: 16px;
    width: 100%;
    max-width: 480px;
    max-height: 100%;
    overflow-y: auto;
    padding: 20px 24px;
    background: var(--bg-surface);
    border: 1px solid var(--transition-accent);
    border-radius: calc(var(--radius) * 2);
    box-shadow: 0 0 40px rgba(0, 0, 0, 0.6),
                0 0 40px color-mix(in srgb, var(--transition-accent) 20%, transparent);
    font-family: var(--font-mono);
    color: var(--text-primary);
  }

  .transition-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
  }

  .transition-title {
    font-family: var(--font-display);
    font-size: 16px;
    font-weight: 700;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--transition-accent);
  }

  .transition-close {
    width: 40px;
    height: 40px;
    border: 1px solid var(--border);
    border-radius: var(--radius);
    background: var(--bg-card);
    color: var(--text-secondary);
    font-size: 16px;
    cursor: pointer;
  }

  .transition-field {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .transition-caption {
    font-size: 11px;
    color: var(--text-muted);
    letter-spacing: 0.06em;
  }

  select {
    height: 44px;
    padding: 0 10px;
    border: 1px solid var(--border-glow);
    border-radius: var(--radius);
    background: var(--bg-card);
    color: var(--text-primary);
    font-family: var(--font-display);
    font-size: 16px;
    font-weight: 700;
  }

  .transition-progress {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .transition-bar {
    position: relative;
    flex: 1;
    height: 14px;
    background: var(--border);
    border: 1px solid var(--border-glow);
    border-radius: 7px;
    overflow: hidden;
  }

  .transition-bar-fill {
    position: absolute;
    left: 0; top: 0; bottom: 0;
    background: var(--transition-accent);
  }

  /* Repère du point de reprise */
  .transition-bar-restart {
    position: absolute;
    top: 0; bottom: 0;
    width: 2px;
    margin-left: -1px;
    background: var(--text-primary);
  }

  .transition-time {
    min-width: 90px;
    text-align: right;
    font-size: 12px;
    color: var(--text-muted);
    white-space: nowrap;
  }
  .transition-progress.is-current .transition-time {
    color: var(--transition-accent);
  }

  .transition-main {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    min-height: 56px;
    border: 1px solid var(--transition-accent);
    border-radius: var(--radius);
    background: color-mix(in srgb, var(--transition-accent) 15%, var(--bg-card));
    color: var(--transition-accent);
    font-family: var(--font-display);
    font-size: 18px;
    font-weight: 700;
    letter-spacing: 0.06em;
    cursor: pointer;
  }
  .transition-main:active {
    transform: scale(0.98);
  }
  .transition-main.is-current {
    background: var(--transition-accent);
    color: var(--bg-base);
  }

  .transition-next {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 8px;
    font-size: 11px;
    color: var(--text-secondary);
  }

  .transition-secondary {
    padding: 8px 12px;
    border: 1px solid var(--border-glow);
    border-radius: var(--radius);
    background: transparent;
    color: var(--text-secondary);
    font-family: var(--font-mono);
    font-size: 11px;
    cursor: pointer;
  }

  .transition-close:focus-visible,
  .transition-main:focus-visible,
  .transition-secondary:focus-visible,
  select:focus-visible {
    outline: 2px solid var(--transition-accent);
    outline-offset: -2px;
  }

  /* ── Icônes en CSS pur (évite les emojis Android) ── */
  .icon-play,
  .icon-stop {
    position: relative;
    flex-shrink: 0;
    width: 16px;
    height: 16px;
  }
  .icon-play::after {
    content: '';
    position: absolute;
    top: 0; left: 2px;
    border-style: solid;
    border-width: 8px 0 8px 14px;
    border-color: transparent transparent transparent currentColor;
  }
  .icon-stop::after {
    content: '';
    position: absolute;
    inset: 1px;
    background: currentColor;
    border-radius: 2px;
  }
</style>
