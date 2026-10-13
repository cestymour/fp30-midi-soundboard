<!--
  SoundButton.svelte — Bouton d'un son : lecture / arrêt, progression, image ou emoji
-->
<script lang="ts">
  import type { AudioItem } from '../../types.ts';
  import { STATE } from '../../state.svelte.ts';
  import { playSound, stopSound } from '../../audio/playback.ts';
  import { getSoundButtonState } from '../transport.svelte.ts';

  let { item }: { item: AudioItem } = $props();

  const buttonState = $derived(getSoundButtonState(item));
  const isPlaying   = $derived(item === STATE.currentSoundItem);

  /** Détecte si une chaîne est un chemin vers une image */
  function isImagePath(str: string | undefined): boolean {
    return !!str && /\.(png|jpg|jpeg|gif|svg|webp)$/i.test(str);
  }

  /** Image de couverture : `img`, ou `icon` si c'est un chemin d'image */
  const imageSrc = $derived(item.img ?? (isImagePath(item.icon) ? item.icon : undefined));

  const baseClass = $derived(
    'sound-btn' + (item.catClass ? ' ' + item.catClass : '') + (imageSrc ? ' sound-btn--img' : ''),
  );

  function handleClick(): void {
    if (item === STATE.currentSoundItem) {
      // Ce bouton est actif → stop (ou restart si en pause)
      if (STATE.isPaused) {
        // En pause → restart depuis le début
        stopSound(false);
        playSound(item);
      } else {
        // En lecture → stop
        stopSound(true);
      }
    } else {
      // Autre bouton → stop l'ancien, play le nouveau
      stopSound(true);
      playSound(item);
    }
  }
</script>

<button
  class={baseClass}
  class:playing={isPlaying}
  class:missing={buttonState.missing}
  data-audio={item.file}
  data-label={item.name}
  data-start={String(item.start ?? 0)}
  data-end={String(item.end ?? '')}
  style:--progress={buttonState.progress}
  style:--progress-transition={buttonState.transition}
  title={item.title ?? item.name}
  onclick={handleClick}
>{#if imageSrc}<span class="btn-icon"><img src={imageSrc} alt={item.name} /></span>{:else}<span class="btn-icon">{item.icon ?? '▶'}</span>{/if}<span class="btn-label">{item.name}</span></button>
