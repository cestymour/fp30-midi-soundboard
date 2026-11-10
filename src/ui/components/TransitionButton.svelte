<!--
  TransitionButton.svelte — Bouton de la musique de transition, dans le coin haut gauche de
  l'en-tête (pendant du bouton Paramètres), visible sur tous les onglets.
  Musique à l'arrêt : il ouvre la popup, d'où on la lance (jamais de lancement en un clic
  depuis l'en-tête : un clic raté pendant une impro ne doit rien lancer).
  Musique en cours : il devient un bouton stop, avec la progression en fond.
-->
<script lang="ts">
  import { STATE } from '../../state.svelte.ts';
  import { isTransitionCurrent, stopTransition } from '../../audio/transition.ts';
  import { transport } from '../transport.svelte.ts';
  import { closeTransitionPopup, openTransitionPopup, transitionPopup } from '../transition.svelte.ts';

  const isCurrent = $derived(isTransitionCurrent());
  const isPlaying = $derived(isCurrent && !STATE.isPaused);

  function handleClick(): void {
    if (isCurrent) stopTransition();
    else if (transitionPopup.isOpen) closeTransitionPopup();
    else openTransitionPopup();
  }
</script>

<button
  id="transition-btn"
  class:is-current={isCurrent}
  class:is-playing={isPlaying}
  class:is-open={transitionPopup.isOpen}
  title={isCurrent ? 'Arrêter la musique de transition' : 'Musique de transition'}
  aria-label={isCurrent ? 'Arrêter la musique de transition' : 'Musique de transition'}
  style:--transition-progress={isCurrent ? transport.seekPct ?? '0%' : '0%'}
  onclick={handleClick}
  oncontextmenu={e => e.preventDefault()}
>
  <span class="transition-fill" aria-hidden="true"></span>
  {#if isCurrent}
    <span class="icon-stop" aria-hidden="true"></span>
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

  #transition-btn:hover,
  #transition-btn.is-open {
    background: color-mix(in srgb, var(--transition-accent) 18%, transparent);
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

  /* Carré stop en CSS pur (évite les emojis Android) */
  .icon-stop {
    position: relative;
    width: 18px;
    height: 18px;
    background: currentColor;
    border-radius: 2px;
  }
</style>
