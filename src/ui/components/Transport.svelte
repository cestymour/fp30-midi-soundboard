<!--
  Transport.svelte — Barre de transport : lecture/pause, seek (clic et glisser), temps
-->
<script lang="ts">
  import { onMount } from 'svelte';
  import { STATE } from '../../state.svelte.ts';
  import { hasCurrentSound, seekToRatio, togglePlayPause } from '../../audio/playback.ts';
  import { transport } from '../transport.svelte.ts';

  const hasSound  = $derived(hasCurrentSound());
  const isPlaying = $derived(hasSound && !STATE.isPaused);

  let seekBar: HTMLDivElement;

  /** Position (0-1) d'un événement souris / tactile sur la barre de seek */
  function getSeekRatioFromEvent(e: MouseEvent | TouchEvent): number {
    const rect = seekBar.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    return Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
  }

  /** Applique le seek */
  function applySeek(e: MouseEvent | TouchEvent): void {
    if (!hasCurrentSound()) return;
    seekToRatio(getSeekRatioFromEvent(e));
  }

  // Drag sur la barre de seek : écouteurs posés à la main pour garder les options
  // d'origine (touchstart non passif, pour pouvoir empêcher le défilement)
  onMount(() => {
    let isDragging = false;

    const startDrag = (e: MouseEvent | TouchEvent) => {
      if (!hasCurrentSound()) return;
      isDragging = true;
      document.body.classList.add('is-seeking');
      applySeek(e);
      if (e.cancelable) e.preventDefault();
    };

    const doDrag = (e: MouseEvent | TouchEvent) => {
      if (!isDragging) return;
      applySeek(e);
    };

    const endDrag = () => {
      if (!isDragging) return;
      isDragging = false;
      document.body.classList.remove('is-seeking');
    };

    // -- Mouse events --
    seekBar.addEventListener('mousedown', startDrag);
    document.addEventListener('mousemove', doDrag);
    document.addEventListener('mouseup', endDrag);

    // -- Touch events --
    seekBar.addEventListener('touchstart', startDrag, { passive: false });
    document.addEventListener('touchmove', doDrag, { passive: true });
    document.addEventListener('touchend', endDrag);
    document.addEventListener('touchcancel', endDrag);

    return () => {
      document.removeEventListener('mousemove', doDrag);
      document.removeEventListener('mouseup', endDrag);
      document.removeEventListener('touchmove', doDrag);
      document.removeEventListener('touchend', endDrag);
      document.removeEventListener('touchcancel', endDrag);
    };
  });
</script>

<div class="transport-bar">
  <button
    class="transport-play-pause"
    class:is-playing={isPlaying}
    class:is-paused={hasSound && STATE.isPaused}
    disabled={!hasSound}
    onclick={togglePlayPause}
  >{#if isPlaying}<span class="icon-pause"></span>{:else}<span class="icon-play"></span>{/if}</button>
  <div class="transport-seek" bind:this={seekBar}>
    <div class="transport-seek-fill" style:width={transport.seekPct}></div>
    <div class="transport-seek-handle" class:pulsing={isPlaying} style:left={transport.seekPct}></div>
  </div>
  <span class="transport-time">{transport.timeText}</span>
</div>

<style>
  /* ═══════════════════════════════════════════════════════
    TRANSPORT BAR — Play/Pause + Seek + Time
  ════════════════════════════════════════════════════════ */
  .transport-bar {
    display: flex;
    align-items: center;
    gap: 10px;
    min-width: 0;
    flex: 1 1 auto;
  }

  /* ── Focus accessible (clavier uniquement) ── */
  .transport-play-pause:focus-visible {
    outline: 2px solid var(--current-accent);
    outline-offset: -2px;
  }

  /* ── Bouton Play/Pause ── */
  .transport-play-pause {
    width: 44px;
    height: 44px;
    min-width: 44px;
    border-radius: var(--radius);
    border: 1px solid var(--border);
    background: var(--bg-card);
    color: var(--text-muted);
    font-size: 18px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: border-color 0.15s, color 0.15s, background 0.15s, box-shadow 0.15s;
    flex-shrink: 0;
  }

  .transport-play-pause:hover:not(:disabled) {
    border-color: var(--panel-accent);
    color: var(--panel-accent);
    background: color-mix(in srgb, var(--panel-accent) 10%, var(--bg-card));
  }

  .transport-play-pause:active:not(:disabled) {
    transform: scale(0.93);
  }

  .transport-play-pause:disabled {
    opacity: 0.3;
    cursor: default;
  }

  .transport-play-pause.is-playing {
    border-color: var(--panel-accent);
    color: var(--panel-accent);
    box-shadow: 0 0 8px color-mix(in srgb, var(--panel-accent) 30%, transparent);
  }

  .transport-play-pause.is-paused {
    border-color: var(--text-muted);
    color: var(--text-secondary);
  }

  /* ── Icônes Play/Pause en CSS pur (évite les emojis Android) ── */
  .icon-play,
  .icon-pause {
    display: block;
    width: 16px;
    height: 16px;
    position: relative;
  }

  /* Triangle play */
  .icon-play::after {
    content: '';
    position: absolute;
    top: 0;
    left: 2px;
    width: 0;
    height: 0;
    border-style: solid;
    border-width: 8px 0 8px 14px;
    border-color: transparent transparent transparent currentColor;
  }

  /* Deux barres pause */
  .icon-pause::before,
  .icon-pause::after {
    content: '';
    position: absolute;
    top: 0;
    width: 4px;
    height: 16px;
    background: currentColor;
    border-radius: 1px;
  }
  .icon-pause::before { left: 1px; }
  .icon-pause::after  { right: 1px; }

  /* ── Barre de Seek ── */
  .transport-seek {
    flex: 1;
    height: 12px;
    min-width: 80px;
    background: var(--border);
    border: 1px solid var(--border-glow);
    border-radius: 6px;
    position: relative;
    cursor: pointer;
    overflow: visible;
  }

  .transport-seek-fill {
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    background: var(--panel-accent, var(--current-accent));
    border-radius: 6px 0 0 6px;
    pointer-events: none;
  }

  .transport-seek-handle {
    position: absolute;
    top: 50%;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: var(--text-primary);
    border: 3px solid var(--panel-accent, var(--current-accent));
    box-shadow: 0 0 6px var(--panel-accent, var(--current-accent));
    transform: translate(-50%, -50%);
    pointer-events: none;
    opacity: 0;
    transition: opacity 0.2s, transform 0.1s, box-shadow 0.3s;
  }

  /* Handle visible quand un son est actif */
  :global(.panel-audio.is-playing) .transport-seek-handle,
  :global(.panel-audio.is-paused) .transport-seek-handle {
    opacity: 1;
  }

  /* Handle pulsant en lecture */
  .transport-seek-handle.pulsing {
    animation: handle-pulse 1s ease-in-out infinite;
  }

  @keyframes handle-pulse {
    0%, 100% {
      box-shadow: 0 0 6px var(--panel-accent, var(--current-accent)),
                  0 0 14px var(--panel-accent, var(--current-accent));
    }
    50% {
      box-shadow: 0 0 2px transparent;
    }
  }

  /* Hover sur la barre */
  .transport-seek:hover .transport-seek-handle {
    transform: translate(-50%, -50%) scale(1.2);
  }

  /* ── Affichage du temps ── */
  .transport-time {
    font-family: var(--font-mono);
    font-size: 11px;
    color: var(--text-muted);
    white-space: nowrap;
    flex-shrink: 0;
    min-width: 90px;
    text-align: right;
    letter-spacing: 0.04em;
  }

  :global(.panel-audio.is-playing) .transport-time {
    color: var(--panel-accent);
  }

  :global(.panel-audio.is-paused) .transport-time {
    color: var(--text-secondary);
  }

  /* ── Portrait — tous écrans ── */
  @media (orientation: portrait) {
    .transport-bar {
      flex: 1;
      max-width: 100%;
      min-width: 0;
    }
  }
</style>
