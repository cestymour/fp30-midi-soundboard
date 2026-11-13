<!--
  TransitionButton.svelte — Bouton de la musique de transition, dans le coin haut gauche de
  l'en-tête (pendant du bouton Paramètres), visible sur tous les onglets.
  Popup fermée : il l'ouvre (jamais de lancement en un clic depuis l'en-tête : un clic raté
  pendant une impro ne doit rien lancer). Popup ouverte : il devient un bouton play, qui
  lance le moment marquant prévu ; un double clic ouvre donc la popup et lance la musique.
  Musique en cours : bouton stop, avec la progression en fond ; il arrête la musique et
  ferme la popup (le bouton « Arrêter » de la popup, lui, la laisse ouverte).
  Tout le carré est cliquable ; la pastille dessinée dedans le distingue des onglets.
-->
<script lang="ts">
  import { STATE } from '../../state.svelte.ts';
  import { isTransitionCurrent, launchTransition, stopTransition } from '../../audio/transition.ts';
  import { transport } from '../transport.svelte.ts';
  import { closeTransitionPopup, openTransitionPopup, transitionPopup } from '../transition.svelte.ts';

  const isCurrent = $derived(isTransitionCurrent());
  const isPlaying = $derived(isCurrent && !STATE.isPaused);

  /**
   * Un clic qui suit de moins de ce délai un lancement ou un arrêt depuis ce bouton est ignoré :
   * sinon, popup ouverte, un double clic lancerait la musique puis l'arrêterait aussitôt (et un
   * double clic sur stop fermerait la popup puis la rouvrirait). L'ouverture de la popup ne
   * compte pas comme un lancement : un double clic sur ♫ ouvre la popup puis lance la musique.
   */
  const DOUBLE_TAP_GUARD_MS = 600;
  let lastToggle = 0;

  function handleClick(): void {
    const now = performance.now();
    if (now - lastToggle < DOUBLE_TAP_GUARD_MS) return;
    if (!isCurrent && !transitionPopup.isOpen) {
      openTransitionPopup();
      return;
    }
    lastToggle = now;
    if (isCurrent) {
      stopTransition();
      closeTransitionPopup();
    } else {
      void launchTransition();
    }
  }

  const label = $derived(isCurrent ? 'Arrêter la musique de transition'
    : transitionPopup.isOpen ? 'Lancer la musique de transition'
    : 'Musique de transition');
</script>

<button
  id="transition-btn"
  class:is-current={isCurrent}
  class:is-playing={isPlaying}
  class:is-open={transitionPopup.isOpen}
  title={label}
  aria-label={label}
  style:--transition-progress={isCurrent ? transport.seekPct ?? '0%' : '0%'}
  onclick={handleClick}
  oncontextmenu={e => e.preventDefault()}
>
  <span class="corner-pill">
    <span class="transition-fill" aria-hidden="true"></span>
    {#if isCurrent}
      <span class="icon-stop" aria-hidden="true"></span>
    {:else if transitionPopup.isOpen}
      <span class="icon-play" aria-hidden="true"></span>
    {:else}
      <span class="transition-icon" aria-hidden="true">♫︎</span>
    {/if}
  </span>
</button>

<style>
  #transition-btn {
    position: relative;
    width: var(--header-h);
    min-width: var(--header-h);
    height: 100%;
    flex-shrink: 0;
    padding: 0;
    border: none;
    background: transparent;
    color: var(--transition-accent);
    cursor: pointer;
    user-select: none;
    -webkit-user-select: none;
  }
  /* Pastille à la couleur de la popup de transition */
  #transition-btn .corner-pill {
    border-color: color-mix(in srgb, var(--transition-accent) 55%, transparent);
    background: color-mix(in srgb, var(--transition-accent) 15%, transparent);
  }

  #transition-btn:focus-visible {
    outline: 2px solid var(--transition-accent);
    outline-offset: -2px;
  }

  #transition-btn:hover .corner-pill {
    background: color-mix(in srgb, var(--transition-accent) 25%, transparent);
  }
  /* Popup ouverte : seul bouton au-dessus du voile de la popup (#transition-overlay,
     z-index 150), qui couvre le reste de l'en-tête */
  #transition-btn.is-open {
    z-index: 151;
  }
  #transition-btn:active .corner-pill {
    background: color-mix(in srgb, var(--transition-accent) 35%, transparent);
  }

  .transition-icon {
    position: relative;
  }

  /* Progression de la musique : remplissage de la pastille, de bas en haut. Pleine hauteur, décalé
     vers le bas (la pastille découpe ce qui dépasse) : il glisse par transform sur son propre calque,
     sans redessiner l'en-tête à chaque image (bug n° 29). Caché quand la musique ne joue pas. */
  .transition-fill {
    position: absolute;
    left: 0; right: 0; bottom: 0;
    height: 100%;
    transform: translateY(calc(100% - var(--transition-progress, 0%)));
    background: color-mix(in srgb, var(--transition-accent) 35%, transparent);
    pointer-events: none;
    visibility: hidden;
  }
  #transition-btn.is-current .transition-fill {
    visibility: visible;
    will-change: transform;
  }

  #transition-btn.is-current .corner-pill {
    border-color: var(--transition-accent);
  }
  #transition-btn.is-playing .corner-pill {
    animation: transition-glow 1s ease-in-out infinite;
  }

  @keyframes transition-glow {
    0%, 100% { box-shadow: inset 0 0 14px color-mix(in srgb, var(--transition-accent) 60%, transparent); }
    50%      { box-shadow: none; }
  }

  /* Carré stop et triangle play en CSS pur (évite les emojis Android) */
  .icon-stop {
    position: relative;
    width: 12px;
    height: 12px;
    background: currentColor;
    border-radius: 2px;
  }
  .icon-play {
    position: relative;
    width: 0;
    height: 0;
    margin-left: 3px;
    border-style: solid;
    border-width: 9px 0 9px 15px;
    border-color: transparent transparent transparent currentColor;
  }
</style>
