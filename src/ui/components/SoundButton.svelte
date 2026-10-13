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

<style>
  /* Toutes les règles qui visent .sound-btn sont ici, dans leur ordre d'origine,
     y compris celles qui dépendent de la grille (:global(.audio-col), :global(.animals-grid)).
     La classe paused n'est jamais posée (voir docs/bugs.md n° 5) : ses règles sont
     gardées en :global(.paused). */

  /* ── Focus accessible (clavier uniquement) ── */
  .sound-btn:focus-visible {
    outline: 2px solid var(--current-accent);
    outline-offset: -2px;
  }

  /* ═══════════════════════════════════════════════════════
      BOUTONS — base commune avec les boutons instrument
  ════════════════════════════════════════════════════════ */
  .sound-btn {
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

  .sound-btn:hover {
    border-color: var(--border-glow);
    color: var(--text-primary);
    background: var(--bg-card-hover);
  }

  .sound-btn:active { transform: scale(0.93); }

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
  .sound-btn:hover .btn-label { color: var(--text-primary); }

  .btn-icon img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 4px;
    display: block;
  }

  /* ═══════════════════════════════════════════════════════
      BOUTONS AUDIO avec IMAGE
  ════════════════════════════════════════════════════════ */
  .sound-btn--img {
    padding: 0;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    gap: 0;
  }

  .sound-btn--img .btn-icon {
    flex: 1;
    width: 100%;
    min-height: 0;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0;
    background: var(--bg-card);
  }

  .sound-btn--img .btn-icon img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    display: block;
    border-radius: 0;
  }

  .sound-btn--img .btn-label {
    flex-shrink: 0;
    padding: 6px 8px;
    font-size: clamp(9px, 1vw, 11px);
    line-height: 1.2;
    background: var(--bg-card);
    border-top: 1px solid var(--border);
    color: var(--text-secondary);
    text-align: center;
  }

  .sound-btn--img:hover .btn-label {
    background: var(--bg-card-hover);
    color: var(--text-primary);
  }

  .sound-btn--img.playing {
    border-color: var(--panel-accent);
    box-shadow: 0 0 20px color-mix(in srgb, var(--panel-accent) 50%, transparent);
  }

  .sound-btn--img.playing .btn-label {
    background: color-mix(in srgb, var(--panel-accent) 15%, var(--bg-card));
    color: var(--panel-accent);
    border-top-color: var(--panel-accent);
  }

  .sound-btn--img:hover .btn-icon img {
    transform: scale(1.05);
    transition: transform 0.3s ease;
  }

  .sound-btn--img:global(.paused) {
    border-color: var(--panel-accent);
    box-shadow: none;
    opacity: 0.9;
  }

  .sound-btn--img:global(.paused) .btn-label {
    background: color-mix(in srgb, var(--panel-accent) 10%, var(--bg-card));
    color: var(--panel-accent);
    border-top-color: var(--panel-accent);
  }

  /* ═══════════════════════════════════════════════════════
    BOUTON AUDIO — progression + état playing
  ════════════════════════════════════════════════════════ */
  .sound-btn::after {
    content: '';
    position: absolute;
    inset: 0;
    background: var(--bg-card);
    z-index: 0;
    border-radius: inherit;
    transition: background 0.15s;
  }
  .sound-btn:hover::after     { background: var(--bg-card-hover); }
  .sound-btn.playing::after   {
    background: color-mix(in srgb, var(--panel-accent) 10%, var(--bg-card));
  }

  .sound-btn::before {
    content: '';
    position: absolute;
    top: 0; left: 0;
    width: var(--progress, 0%);
    height: 100%;
    background: color-mix(in srgb, var(--panel-accent) 25%, transparent);
    z-index: 1;
    border-radius: inherit;
    transition: width var(--progress-transition, 0.25s) linear;
    pointer-events: none;
  }

  .sound-btn > * { position: relative; z-index: 2; }

  /* Styles du bouton en état PLAYING */
  .sound-btn.playing {
    color: var(--panel-accent);
    border-color: var(--panel-accent);
    animation: playing-glow 0.9s ease-in-out infinite alternate;
  }
  .sound-btn.playing .btn-label { color: var(--panel-accent); }

  @keyframes playing-glow {
    from { box-shadow: 0 0 8px  color-mix(in srgb, var(--panel-accent) 25%, transparent); }
    to   { box-shadow: 0 0 22px color-mix(in srgb, var(--panel-accent) 55%, transparent); }
  }

  .sound-btn.playing .btn-icon { font-size: 0; }
  .sound-btn.playing .btn-icon::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    display: block;
    width: clamp(22px, 3vw, 32px);
    height: clamp(22px, 3vw, 32px);
    background: currentColor;
    border-radius: 3px;
    box-shadow: 0 0 8px rgba(0, 0, 0, 0.8),
                0 0 16px var(--panel-accent);
    z-index: 3;
  }


  /* ═══════════════════════════════════════════════════════
      BOUTON AUDIO — état PAUSE
  ════════════════════════════════════════════════════════ */
  .sound-btn:global(.paused) {
    color: var(--panel-accent);
    border-color: var(--panel-accent);
    animation: none; /* Pas d'animation glow en pause */
    opacity: 0.9;
  }
  .sound-btn:global(.paused) .btn-label { color: var(--panel-accent); }

  .sound-btn:global(.paused) .btn-icon { font-size: 0; }
  .sound-btn:global(.paused) .btn-icon::after {
    content: '↺';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, calc(-50% + 1px));
    display: block;
    line-height: 1;
    color: var(--panel-accent);
    -webkit-text-stroke: 2px var(--panel-accent);
    text-shadow:
      -1px -1px 2px rgba(0, 0, 0, 0.7),
        1px -1px 2px rgba(0, 0, 0, 0.7),
      -1px  1px 2px rgba(0, 0, 0, 0.7),
        1px  1px 2px rgba(0, 0, 0, 0.7),
        0    0   6px rgba(0, 0, 0, 0.6),
        0    0  12px rgba(0, 0, 0, 0.4);
    z-index: 3;
    font-size: clamp(24px, 3vw, 36px);
  }

  .sound-btn.missing {
    opacity: 0.35;
    text-decoration: line-through;
    pointer-events: none;
    cursor: default;
  }

  /* ═══════════════════════════════════════════════════════
    PANNEAU AUDIO — mode colonnes (Films)
  ════════════════════════════════════════════════════════ */
  :global(.audio-col) .sound-btn {
    height: var(--btn-h, 80px);
  }

  /* ═══════════════════════════════════════════════════════
    GRILLE ANIMAUX
  ════════════════════════════════════════════════════════ */
  :global(.audio-grid.animals-grid) .sound-btn {
    height: 100%;
    min-height: 0;
    padding: 4px 2px;
    container-type: size;
  }

  :global(.audio-grid.animals-grid) .sound-btn .btn-icon {
    font-size: 45cqh;
    line-height: 1;
  }

  :global(.audio-grid.animals-grid) .sound-btn .btn-label {
    font-size: clamp(7px, 18cqh, 14px);
    line-height: 1.1;
  }

  /* ═══════════════════════════════════════════════════════
    GRILLE ANIMAUX — Couleurs par catégorie (classes CSS)
  ════════════════════════════════════════════════════════ */

  .animaux-domestique { --cat-accent: #ff00ff; }
  .animaux-ferme      { --cat-accent: #44aa00; }
  .animaux-foret      { --cat-accent: #7700ff; }
  .animaux-oiseau     { --cat-accent: #0066ff; }
  .animaux-insecte    { --cat-accent: #ff8000; }
  .animaux-savane     { --cat-accent: #cccc00; }
  .animaux-aquatique  { --cat-accent: #00ffee; }

  :global(.animals-grid) .sound-btn {
    border-color: color-mix(in srgb, var(--cat-accent, var(--border)) 35%, var(--border));
    background: color-mix(in srgb, var(--cat-accent, transparent) 8%, var(--bg-card));
  }

  :global(.animals-grid) .sound-btn:hover {
    border-color: color-mix(in srgb, var(--cat-accent, var(--border-glow)) 65%, var(--border-glow));
    background: color-mix(in srgb, var(--cat-accent, transparent) 15%, var(--bg-card-hover));
  }

  :global(.animals-grid) .sound-btn.playing {
    border-color: var(--cat-accent, var(--panel-accent));
    background: color-mix(in srgb, var(--cat-accent, transparent) 20%, var(--bg-card));
    box-shadow: 0 0 12px color-mix(in srgb, var(--cat-accent, var(--panel-accent)) 40%, transparent);
  }

  :global(.animals-grid) .sound-btn.playing .btn-label {
    color: var(--cat-accent, var(--panel-accent));
  }

  @keyframes playing-glow-cat {
    from { box-shadow: 0 0 6px  color-mix(in srgb, var(--cat-accent) 25%, transparent); }
    to   { box-shadow: 0 0 18px color-mix(in srgb, var(--cat-accent) 55%, transparent); }
  }

  :global(.animals-grid) .sound-btn.playing {
    animation: playing-glow-cat 0.9s ease-in-out infinite alternate;
  }

  :global(.animals-grid) .sound-btn::before {
    background: color-mix(in srgb, var(--cat-accent, var(--panel-accent)) 30%, transparent);
  }

  :global(.animals-grid) .sound-btn::after {
    background: color-mix(in srgb, var(--cat-accent, transparent) 8%, var(--bg-card));
  }

  :global(.animals-grid) .sound-btn:hover::after {
    background: color-mix(in srgb, var(--cat-accent, transparent) 15%, var(--bg-card-hover));
  }

  :global(.animals-grid) .sound-btn.playing::after {
    background: color-mix(in srgb, var(--cat-accent, transparent) 20%, var(--bg-card));
  }
</style>
