<!--
  StopSoundsButton.svelte — Onglets sons : coupe net tous les sons en cours, quel que soit
  l'onglet son d'où ils viennent. La musique continue. Allumé tant qu'un son joue.
-->
<script lang="ts">
  import { STATE } from '../../state.svelte.ts';
  import { stopAllSounds } from '../../audio/sounds.ts';

  const isPlaying = $derived(STATE.soundVoices > 0);
</script>

<button
  class="stop-sounds-btn"
  class:is-playing={isPlaying}
  title="Couper tous les sons (la musique continue)"
  onclick={stopAllSounds}
>
  <span class="icon-stop" aria-hidden="true"></span>
  <span class="stop-sounds-btn__label">Couper les sons</span>
</button>

<style>
  /* ── Focus accessible (clavier uniquement) ── */
  .stop-sounds-btn:focus-visible {
    outline: 2px solid var(--current-accent);
    outline-offset: -2px;
  }

  /* Même allure que le bouton lecture / pause des onglets musiques */
  .stop-sounds-btn {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    height: 44px;
    min-width: 44px;
    padding: 0 14px;
    border-radius: var(--radius);
    border: 1px solid var(--border);
    background: var(--bg-card);
    color: var(--text-muted);
    font-family: var(--font-display);
    font-size: 13px;
    font-weight: 700;
    letter-spacing: 0.08em;
    white-space: nowrap;
    cursor: pointer;
    transition: border-color 0.15s, color 0.15s, background 0.15s, box-shadow 0.15s;
    flex-shrink: 0;
  }

  .stop-sounds-btn:hover {
    border-color: var(--panel-accent);
    color: var(--panel-accent);
    background: color-mix(in srgb, var(--panel-accent) 10%, var(--bg-card));
  }

  .stop-sounds-btn:active {
    transform: scale(0.93);
  }

  .stop-sounds-btn.is-playing {
    border-color: var(--panel-accent);
    color: var(--panel-accent);
    box-shadow: 0 0 8px color-mix(in srgb, var(--panel-accent) 30%, transparent);
  }

  /* Carré stop en CSS pur (évite les emojis Android) */
  .icon-stop {
    display: block;
    width: 14px;
    height: 14px;
    background: currentColor;
    border-radius: 2px;
    flex-shrink: 0;
  }

  /* Largeur étroite : le carré seul, quelle que soit l'orientation
     (la règle est dans Panel.svelte, avec celle du bouton STOP) */
</style>
