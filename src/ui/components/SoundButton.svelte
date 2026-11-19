<!--
  SoundButton.svelte — Bouton d'un son ou d'une musique : lecture / arrêt, progression, image ou emoji.
  Onglets musiques : un clic lance la musique (et coupe la précédente), un 2e clic l'arrête ;
  pendant la lecture, un carré stop remplace l'image ou l'emoji.
  Onglets sons : chaque clic lance le son, par-dessus tout le reste (même par-dessus lui-même) ;
  pendant la lecture, une double flèche « repeat » remplace l'emoji.
  Aspect et styles : Tile.svelte.
-->
<script lang="ts">
  import type { AudioItem, AudioTabKind } from '../../types.ts';
  import { STATE } from '../../state.svelte.ts';
  import { playSound, stopSound } from '../../audio/playback.ts';
  import { playOneShot } from '../../audio/sounds.ts';
  import { getSoundButtonState } from '../transport.svelte.ts';
  import { getSoundImage } from '../../config/tabs.ts';
  import { assetUrl } from '../../asset-url.ts';
  import Tile from './Tile.svelte';

  let { item, kind }: { item: AudioItem; kind: AudioTabKind } = $props();

  const isOneShot   = $derived(kind === 'sounds');
  const buttonState = $derived(getSoundButtonState(item));
  const isPlaying   = $derived(isOneShot ? buttonState.playing : item === STATE.currentSoundItem);

  /** Image de couverture : `img`, ou `icon` si c'est un chemin d'image */
  const imagePath = $derived(getSoundImage(item));
  const imageSrc  = $derived(imagePath && assetUrl(imagePath));

  const baseClass = $derived(
    'sound-btn' + (item.catClass ? ' ' + item.catClass : '') + (imageSrc ? ' sound-btn--img' : ''),
  );
  /** Une musique sans emoji mais avec un sous-titre n'a pas d'icône (variante texte) */
  const emoji = $derived(item.icon || !item.subtitle ? (item.icon ?? '▶') : undefined);

  function handleClick(): void {
    if (isOneShot) {
      // Son : relancé depuis le début par-dessus le précédent, sans le couper
      void playOneShot(item);
      return;
    }
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

<Tile
  class={baseClass}
  states={{ oneshot: isOneShot, playing: isPlaying, missing: buttonState.missing }}
  data-audio={item.file}
  data-label={item.name}
  data-start={String(item.start ?? 0)}
  data-end={String(item.end ?? '')}
  progress={buttonState.progress}
  title={item.title ?? item.name}
  onclick={handleClick}
  {imageSrc}
  svg={item.svg}
  {emoji}
  name={item.name}
  subtitle={item.subtitle}
  iconOverlay={isOneShot && isPlaying ? repeatIcon : undefined}
/>

<!-- Double flèche « repeat » (pictogramme Material « repeat ») : un clic relance le son par-dessus -->
{#snippet repeatIcon()}<svg class="repeat-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z" /></svg>{/snippet}

<style>
  /* Onglets sons : la double flèche « repeat » prend la place de l'emoji (masqué) pendant la lecture */
  .repeat-icon {
    visibility: visible;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    display: block;
    width: clamp(26px, 3.6vw, 38px);
    height: clamp(26px, 3.6vw, 38px);
    fill: currentColor;
    filter: drop-shadow(0 0 3px rgba(0, 0, 0, 0.9)) drop-shadow(0 0 8px var(--panel-accent));
    z-index: 3;
  }

</style>
