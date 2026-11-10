<!--
  TransitionButton.svelte — Bouton « musique de transition » de l'en-tête, visible sur tous
  les onglets. Un clic lance la musique choisie (du début la première fois, puis depuis son
  point de reprise), un autre l'arrête en fondu. ▾ ouvre la popup sans lancer la musique
  (choix de la musique avant le spectacle).
-->
<script lang="ts">
  import { STATE } from '../../state.svelte.ts';
  import { getSelectedTransitionMusic, isTransitionCurrent, toggleTransition } from '../../audio/transition.ts';
  import { transport } from '../transport.svelte.ts';
  import { closeTransitionPopup, openTransitionPopup, transitionPopup } from '../transition.svelte.ts';

  const isCurrent = $derived(isTransitionCurrent());
  const isPlaying = $derived(isCurrent && !STATE.isPaused);
  const music     = $derived(getSelectedTransitionMusic());

  function toggleMenu(): void {
    if (transitionPopup.isOpen) closeTransitionPopup();
    else openTransitionPopup();
  }
</script>

<div id="transition-ctl" class:is-current={isCurrent} class:is-playing={isPlaying}>
  <button
    id="transition-btn"
    title={isCurrent ? 'Arrêter la musique de transition' : 'Lancer la musique de transition : ' + music.name}
    style:--transition-progress={isCurrent ? transport.seekPct ?? '0%' : '0%'}
    onclick={toggleTransition}
    oncontextmenu={e => e.preventDefault()}
  >
    <span class="transition-fill" aria-hidden="true"></span>
    <span class={isCurrent ? 'icon-stop' : 'icon-play'} aria-hidden="true"></span>
    <span class="transition-text">
      <span class="transition-label">Transition</span>
      <span class="transition-name">{music.name}</span>
    </span>
  </button>
  <button
    id="transition-menu-btn"
    title="Musique de transition : choix, progression, volume"
    aria-expanded={transitionPopup.isOpen}
    class:is-open={transitionPopup.isOpen}
    onclick={toggleMenu}
    oncontextmenu={e => e.preventDefault()}
  >▾</button>
</div>

<style>
  #transition-ctl {
    display: flex;
    align-items: stretch;
    flex-shrink: 0;
    border-left: 1px solid var(--border);
  }

  #transition-btn,
  #transition-menu-btn {
    position: relative;
    display: flex;
    align-items: center;
    border: none;
    background: transparent;
    color: var(--transition-accent);
    font-family: var(--font-display);
    cursor: pointer;
    user-select: none;
    -webkit-user-select: none;
    transition: color 0.15s, background 0.15s;
  }

  #transition-btn {
    gap: 8px;
    width: 190px;
    padding: 0 12px;
    overflow: hidden;
    background: color-mix(in srgb, var(--transition-accent) 8%, transparent);
  }

  #transition-menu-btn {
    justify-content: center;
    width: 36px;
    font-size: 18px;
    border-left: 1px solid var(--border);
    color: var(--text-muted);
  }

  #transition-btn:focus-visible,
  #transition-menu-btn:focus-visible {
    outline: 2px solid var(--transition-accent);
    outline-offset: -2px;
  }

  #transition-btn:hover {
    background: color-mix(in srgb, var(--transition-accent) 16%, transparent);
  }
  #transition-btn:active {
    background: color-mix(in srgb, var(--transition-accent) 26%, transparent);
  }
  #transition-menu-btn:hover,
  #transition-menu-btn.is-open {
    color: var(--transition-accent);
    background: rgba(255, 255, 255, 0.06);
  }

  /* Progression de la musique : remplissage du bouton */
  .transition-fill {
    position: absolute;
    left: 0; top: 0; bottom: 0;
    width: var(--transition-progress, 0%);
    background: color-mix(in srgb, var(--transition-accent) 30%, transparent);
    pointer-events: none;
  }

  #transition-ctl.is-current #transition-btn {
    color: var(--text-primary);
    box-shadow: inset 0 -2px 0 var(--transition-accent);
  }
  #transition-ctl.is-playing #transition-btn {
    animation: transition-glow 1s ease-in-out infinite;
  }

  @keyframes transition-glow {
    0%, 100% { box-shadow: inset 0 -2px 0 var(--transition-accent), inset 0 0 14px color-mix(in srgb, var(--transition-accent) 45%, transparent); }
    50%      { box-shadow: inset 0 -2px 0 var(--transition-accent); }
  }

  .transition-text {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    min-width: 0;
    line-height: 1.1;
  }

  .transition-label {
    font-size: 13px;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  .transition-name {
    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-family: var(--font-mono);
    font-size: 10px;
    color: var(--text-secondary);
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

  /* ── Paysage étroit : libellé seul, sans le nom de la musique ── */
  @media (max-width: 1100px) {
    #transition-btn { width: auto; }
    .transition-name { display: none; }
  }

  /* ── Portrait et mobile : icône seule, pour que tous les onglets restent visibles ── */
  @media (orientation: portrait), (max-width: 600px) {
    #transition-btn { padding: 0 14px; }
    .transition-text { display: none; }
    #transition-menu-btn { width: 30px; }
  }
</style>
