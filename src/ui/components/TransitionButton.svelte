<!--
  TransitionButton.svelte — Bouton de la musique de transition, dans le coin haut gauche de
  l'en-tête (pendant du bouton Paramètres), visible sur tous les onglets.
  Popup fermée : il l'ouvre (jamais de lancement en un clic depuis l'en-tête : un clic raté
  pendant une impro ne doit rien lancer). Popup ouverte : il devient un bouton play, qui
  lance le moment marquant prévu ; un double clic ouvre donc la popup et lance la musique.
  Musique en cours : bouton stop, avec la progression en fond ; il arrête la musique et
  laisse la popup ouverte.
-->
<script lang="ts">
  import { STATE } from '../../state.svelte.ts';
  import { isTransitionCurrent, launchTransition, stopTransition } from '../../audio/transition.ts';
  import { transport } from '../transport.svelte.ts';
  import { openTransitionPopup, transitionPopup } from '../transition.svelte.ts';

  const isCurrent = $derived(isTransitionCurrent());
  const isPlaying = $derived(isCurrent && !STATE.isPaused);

  /**
   * Un clic qui suit de moins de ce délai un lancement ou un arrêt depuis ce bouton est ignoré :
   * sinon, popup ouverte, un double clic lancerait la musique puis l'arrêterait aussitôt (et un
   * double clic sur stop la relancerait). L'ouverture de la popup n'est pas concernée.
   */
  const DOUBLE_TAP_GUARD_MS = 600;
  let lastToggle = 0;

  function handleClick(): void {
    if (!isCurrent && !transitionPopup.isOpen) {
      openTransitionPopup();
      return;
    }
    const now = performance.now();
    if (now - lastToggle < DOUBLE_TAP_GUARD_MS) return;
    lastToggle = now;
    if (isCurrent) stopTransition();
    else void launchTransition();
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
  <span class="transition-fill" aria-hidden="true"></span>
  {#if isCurrent}
    <span class="icon-stop" aria-hidden="true"></span>
  {:else if transitionPopup.isOpen}
    <span class="icon-play" aria-hidden="true"></span>
  {:else}
    <span class="transition-icon" aria-hidden="true">🎉</span>
  {/if}
</button>

<style>
  #transition-btn {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    width: var(--header-h);
    min-width: var(--header-h);
    height: 100%;
    flex-shrink: 0;
    overflow: hidden;
    border: none;
    border-right: 1px solid var(--border);
    background: color-mix(in srgb, var(--transition-accent) 8%, transparent);
    color: var(--transition-accent);
    cursor: pointer;
    user-select: none;
    -webkit-user-select: none;
    transition: color 0.15s, background 0.15s;
  }

  #transition-btn:focus-visible {
    outline: 2px solid var(--transition-accent);
    outline-offset: -2px;
  }

  #transition-btn:hover {
    background: color-mix(in srgb, var(--transition-accent) 18%, transparent);
  }
  /* Popup ouverte : fond noir, comme le bouton des paramètres sous sa popup */
  #transition-btn.is-open {
    background: #000;
  }
  #transition-btn:active {
    background: color-mix(in srgb, var(--transition-accent) 28%, transparent);
  }

  .transition-icon {
    position: relative;
    font-size: 24px;
    line-height: 1;
  }

  /* Progression de la musique : remplissage du bouton, de bas en haut */
  .transition-fill {
    position: absolute;
    left: 0; right: 0; bottom: 0;
    height: var(--transition-progress, 0%);
    background: color-mix(in srgb, var(--transition-accent) 35%, transparent);
    pointer-events: none;
  }

  #transition-btn.is-current {
    color: var(--text-primary);
    box-shadow: inset 0 -2px 0 var(--transition-accent);
  }
  #transition-btn.is-playing {
    animation: transition-glow 1s ease-in-out infinite;
  }

  @keyframes transition-glow {
    0%, 100% { box-shadow: inset 0 -2px 0 var(--transition-accent), inset 0 0 14px color-mix(in srgb, var(--transition-accent) 60%, transparent); }
    50%      { box-shadow: inset 0 -2px 0 var(--transition-accent); }
  }

  /* Carré stop et triangle play en CSS pur (évite les emojis Android) */
  .icon-stop {
    position: relative;
    width: 18px;
    height: 18px;
    background: currentColor;
    border-radius: 2px;
  }
  .icon-play {
    position: relative;
    width: 0;
    height: 0;
    margin-left: 4px;
    border-style: solid;
    border-width: 10px 0 10px 17px;
    border-color: transparent transparent transparent currentColor;
  }
</style>
