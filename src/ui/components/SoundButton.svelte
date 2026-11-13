<!--
  SoundButton.svelte — Bouton d'un son ou d'une musique : lecture / arrêt, progression, image ou emoji.
  Onglets musiques : un clic lance la musique (et coupe la précédente), un 2e clic l'arrête ;
  pendant la lecture, un carré stop remplace l'image ou l'emoji.
  Onglets sons : chaque clic lance le son, par-dessus tout le reste (même par-dessus lui-même) ;
  pendant la lecture, une double flèche « repeat » remplace l'emoji.
-->
<script lang="ts">
  import type { AudioItem, AudioTabKind } from '../../types.ts';
  import { STATE } from '../../state.svelte.ts';
  import { playSound, stopSound } from '../../audio/playback.ts';
  import { playOneShot } from '../../audio/sounds.ts';
  import { getSoundButtonState } from '../transport.svelte.ts';
  import { getSoundImage } from '../../config/tabs.ts';
  import { assetUrl } from '../../asset-url.ts';
  import TileIcon from './TileIcon.svelte';

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

<button
  class={baseClass}
  class:oneshot={isOneShot}
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
>{#if imageSrc}<span class="btn-icon"><img src={imageSrc} alt={item.name} />{#if isOneShot && isPlaying}{@render repeatIcon()}{/if}</span>{:else if item.icon || !item.subtitle}<span class="btn-icon"><TileIcon svg={item.svg} emoji={item.icon ?? '▶'} />{#if isOneShot && isPlaying}{@render repeatIcon()}{/if}</span>{/if}<span class="btn-label">{item.name}</span>{#if item.subtitle}<span class="btn-sub">{item.subtitle}</span>{/if}</button>

<!-- Double flèche « repeat » (pictogramme Material « repeat ») : un clic relance le son par-dessus -->
{#snippet repeatIcon()}<svg class="repeat-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z" /></svg>{/snippet}

<style>
  /* Toutes les règles qui visent .sound-btn sont ici, dans l'ordre où la cascade les applique,
     y compris celles qui dépendent de la grille (:global(.audio-col), :global(.fixed-grid)). */

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
    padding: 6px;
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
    font-size: max(16px, 45cqh);
    line-height: 1;
    position: relative;
    z-index: 2;
    flex-shrink: 1;
  }
  /* Nom réglé sur la tuile la plus basse du panneau (--btn-h-min, posée par l'égalisation des
     hauteurs) : même taille dans toutes les colonnes. Plafonné par la largeur de la tuile (cqw),
     pour qu'un mot long (Applaudissements) tienne sur sa ligne */
  .btn-label {
    font-size: clamp(11px, min((var(--btn-h-min, 80px) - 14px) * 0.26, 17cqw), 20px);
    font-weight: 600;
    color: var(--text-primary);
    text-align: center;
    line-height: 1.1;
    word-break: break-word;
    /* Mot plus large que la tuile : coupé avec un trait d'union (lang="fr") */
    hyphens: auto;
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

  /* Légende assez grande pour se lire de loin : elle prend la bande que l'affiche
     (object-fit: contain) laisserait vide au-dessus et au-dessous */
  .sound-btn--img .btn-label {
    flex-shrink: 0;
    padding: 5px 4px;
    font-size: clamp(10px, 12.5cqw, 17px);
    letter-spacing: 0.02em;
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

  /* Remplissage de progression : pleine largeur, décalé vers la gauche (la tuile découpe ce qui
     dépasse). Il glisse par transform, sur son propre calque pendant la lecture : la carte graphique
     le déplace sans redessiner la tuile et son emoji à chaque image (bug n° 29). */
  .sound-btn::before {
    content: '';
    position: absolute;
    top: 0; left: 0;
    width: 100%;
    height: 100%;
    transform: translateX(calc(var(--progress, 0%) - 100%));
    background: color-mix(in srgb, var(--panel-accent) 25%, transparent);
    z-index: 1;
    border-radius: inherit;
    transition: transform var(--progress-transition, 0.25s) linear;
    pointer-events: none;
  }
  .sound-btn.playing::before { will-change: transform; }
  /* Tuile au repos : remplissage caché, sinon son bord, décalé hors de la tuile, déborde
     d'un pixel sur la bordure des tuiles posées à une position fractionnaire */
  .sound-btn:not(.playing)::before { visibility: hidden; }

  .sound-btn > * { position: relative; z-index: 2; }

  /* Styles du bouton en état PLAYING */
  .sound-btn.playing {
    color: var(--panel-accent);
    border-color: var(--panel-accent);
    animation: playing-glow 0.9s ease-in-out infinite alternate;
  }
  .sound-btn.playing .btn-label { color: var(--panel-accent); }

  /* Lueur pulsée en filter: drop-shadow (même flou qu'un box-shadow, la tuile est opaque) :
     la carte graphique l'anime sans redessiner la tuile à chaque image (bug n° 29) */
  @keyframes playing-glow {
    from { filter: drop-shadow(0 0 8px  color-mix(in srgb, var(--panel-accent) 25%, transparent)); }
    to   { filter: drop-shadow(0 0 22px color-mix(in srgb, var(--panel-accent) 55%, transparent)); }
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

  /* Onglets sons : la double flèche « repeat » (SVG) remplace le carré stop */
  .sound-btn.oneshot.playing .btn-icon::after { content: none; }
  /* L'emoji garde sa place (masqué) : le nom ne bouge pas sous la double flèche */
  .sound-btn.oneshot.playing .btn-icon { visibility: hidden; }
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
    GRILLE FIXE (Animaux, Bruits, Ambiances)
  ════════════════════════════════════════════════════════ */
  :global(.audio-grid.fixed-grid) .sound-btn {
    height: 100%;
    min-height: 0;
    padding: 4px 2px;
    container-type: size;
  }

  :global(.audio-grid.fixed-grid) .sound-btn .btn-icon {
    font-size: 45cqh;
    line-height: 1;
  }

  /* Grille fixe : toutes les tuiles ont la même taille, le nom se règle sur la tuile */
  :global(.audio-grid.fixed-grid) .sound-btn .btn-label {
    font-size: clamp(11px, min(24cqh, 17cqw), 20px);
    line-height: 1.1;
  }

  /* ═══════════════════════════════════════════════════════
    GRILLE FIXE — Couleurs par catégorie (classes CSS catClass)
  ════════════════════════════════════════════════════════ */

  .animaux-domestique { --cat-accent: #ff5cb0; }
  .animaux-ferme      { --cat-accent: #44aa00; }
  .animaux-foret      { --cat-accent: #7700ff; }
  .animaux-oiseau     { --cat-accent: #0066ff; }
  .animaux-insecte    { --cat-accent: #ff8000; }
  .animaux-savane     { --cat-accent: #cccc00; }
  .animaux-aquatique  { --cat-accent: #00ffee; }

  /* Onglet Ambiances : même grille, une couleur par thème */
  .ambiances-ville    { --cat-accent: #0066ff; }
  .ambiances-voix     { --cat-accent: #ff5cb0; }
  .ambiances-fete     { --cat-accent: #ff8000; }
  .ambiances-mer      { --cat-accent: #00ffee; }
  .ambiances-nature   { --cat-accent: #44aa00; }
  .ambiances-elements { --cat-accent: #cccc00; }
  .ambiances-nuit     { --cat-accent: #7700ff; }

  /* Onglet Bruits : même grille, une couleur par thème */
  .bruits-rue         { --cat-accent: #0066ff; }
  .bruits-spectacle   { --cat-accent: #cccc00; }
  .bruits-bureau      { --cat-accent: #00ffee; }
  .bruits-telephone   { --cat-accent: #7700ff; }
  .bruits-maison      { --cat-accent: #44aa00; }
  .bruits-danger      { --cat-accent: #ff5cb0; }

  :global(.fixed-grid) .sound-btn {
    border-color: color-mix(in srgb, var(--cat-accent, var(--border)) 35%, var(--border));
    background: color-mix(in srgb, var(--cat-accent, transparent) 8%, var(--bg-card));
  }

  :global(.fixed-grid) .sound-btn:hover {
    border-color: color-mix(in srgb, var(--cat-accent, var(--border-glow)) 65%, var(--border-glow));
    background: color-mix(in srgb, var(--cat-accent, transparent) 15%, var(--bg-card-hover));
  }

  :global(.fixed-grid) .sound-btn.playing {
    border-color: var(--cat-accent, var(--panel-accent));
    background: color-mix(in srgb, var(--cat-accent, transparent) 20%, var(--bg-card));
  }

  :global(.fixed-grid) .sound-btn.playing .btn-label {
    color: var(--cat-accent, var(--panel-accent));
  }

  @keyframes playing-glow-cat {
    from { filter: drop-shadow(0 0 6px  color-mix(in srgb, var(--cat-accent) 25%, transparent)); }
    to   { filter: drop-shadow(0 0 18px color-mix(in srgb, var(--cat-accent) 55%, transparent)); }
  }

  :global(.fixed-grid) .sound-btn.playing {
    animation: playing-glow-cat 0.9s ease-in-out infinite alternate;
  }

  :global(.fixed-grid) .sound-btn::before {
    background: color-mix(in srgb, var(--cat-accent, var(--panel-accent)) 30%, transparent);
  }

  :global(.fixed-grid) .sound-btn::after {
    background: color-mix(in srgb, var(--cat-accent, transparent) 8%, var(--bg-card));
  }

  :global(.fixed-grid) .sound-btn:hover::after {
    background: color-mix(in srgb, var(--cat-accent, transparent) 15%, var(--bg-card-hover));
  }

  :global(.fixed-grid) .sound-btn.playing::after {
    background: color-mix(in srgb, var(--cat-accent, transparent) 20%, var(--bg-card));
  }

  /* ═══════════════════════════════════════════════════════
    ONGLET MUSIQUES (mode colonnes, catCols) — classes posées par catClass
    musique-tuile    : tuile teintée de la couleur de sa famille (--cat-accent, posée
                       par AudioPanel sur la catégorie), nom en gros, sous-titre en petit
    musique-manquant : bordure rouge en pointillés et tuile estompée, le fichier mp3
                       n'est pas encore ajouté (la tuile garde la couleur de sa famille)
  ════════════════════════════════════════════════════════ */
  .sound-btn.musique-tuile {
    gap: 2px;
    padding: 4px 6px;
    border-color: color-mix(in srgb, var(--cat-accent) 60%, var(--border));
  }
  .sound-btn.musique-tuile::after {
    background: color-mix(in srgb, var(--cat-accent) 22%, var(--bg-card));
  }
  .sound-btn.musique-tuile.musique-manquant {
    border: 2px dashed #ff3b3b;
    opacity: 0.55;
  }
  .sound-btn.musique-tuile.playing {
    border-color: var(--cat-accent);
  }
  .sound-btn.musique-tuile.playing::after {
    background: color-mix(in srgb, var(--cat-accent) 32%, var(--bg-card));
  }
  .sound-btn.musique-tuile::before {
    background: color-mix(in srgb, var(--cat-accent) 35%, transparent);
  }

  .musique-tuile .btn-icon {
    font-size: max(14px, 30cqh);
  }
  /* En lecture, l'emoji garde sa place (masqué) : le carré stop s'affiche à sa place,
     sans faire remonter le nom et le sous-titre sous le carré */
  .sound-btn.musique-tuile.playing .btn-icon {
    font-size: max(14px, 30cqh);
    visibility: hidden;
  }
  .sound-btn.musique-tuile.playing .btn-icon::after {
    visibility: visible;
  }
  /* Les textes se règlent sur la tuile la plus basse du panneau (--btn-h-min, posée par
     equalizeAudioButtons) et non sur la tuile elle-même (cqh) : même taille dans toutes les
     colonnes, alors que la hauteur des tuiles change d'une colonne à l'autre */
  .musique-tuile .btn-label {
    font-size: clamp(12px, min(var(--btn-h-min, 80px) * 0.19, 11.5cqw), 21px);
    color: var(--text-primary);
  }
  /* Sans emoji (variante texte) : le nom prend la place */
  .musique-tuile:not(:has(.btn-icon)) .btn-label {
    font-size: clamp(13px, min(var(--btn-h-min, 80px) * 0.24, 13cqw), 24px);
  }
  .musique-tuile.playing .btn-label { color: var(--cat-accent); }

  .btn-sub {
    font-size: clamp(10px, min(var(--btn-h-min, 80px) * 0.15, 9cqw), 16px);
    font-weight: 600;
    letter-spacing: 0.02em;
    line-height: 1.1;
    color: color-mix(in srgb, var(--cat-accent, var(--text-primary)) 30%, var(--text-primary));
  }
</style>
