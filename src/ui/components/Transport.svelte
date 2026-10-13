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
