<!--
  TransitionPopup.svelte — Popup de la musique de transition, par-dessus les onglets
  (l'en-tête reste visible, donc le bouton pour l'arrêter aussi) : choix de la musique du
  spectacle, progression (avec un repère par moment marquant), une ligne de boutons, un par
  moment marquant (0 : début du spectacle, puis 1, 2, 3…), volume, bouton « Clarté Studio »
  (le préréglage des effets audio, appliqué à la transition seule). Le moment prévu est en
  couleur et plus large ; c'est aussi lui que lance le bouton de l'en-tête. Lancer coupe tout
  ce qui jouait, comme l'arrêt d'urgence. En lecture, la ligne devient un gros « Arrêter ».
  La popup garde toujours la même taille.
-->
<script lang="ts">
  import { STATE } from '../../state.svelte.ts';
  import { getTransitionMusics } from '../../config/tabs.ts';
  import { getPlaybackWindow, formatTime } from '../../audio/timing.ts';
  import {
    getMomentTime, getNextMoment, getSelectedTransitionMusic, isTransitionCurrent,
    launchTransition, selectTransitionMusic, setTransitionClarity, setTransitionResetVolume, setTransitionVolume, stopTransition,
  } from '../../audio/transition.ts';
  import { transport } from '../transport.svelte.ts';
  import { closeTransitionPopup, transitionPopup } from '../transition.svelte.ts';
  import VolumeControl from './VolumeControl.svelte';
  import { AUDIO_FX_PRESETS } from '../../config/audio-fx.config.ts';

  /** Libellé du bouton, repris du préréglage des effets audio */
  const clarityPreset = AUDIO_FX_PRESETS.find(preset => preset.key === 'crystal');

  const musics    = getTransitionMusics();
  const music     = $derived(getSelectedTransitionMusic());
  const isCurrent = $derived(isTransitionCurrent());
  /** Moments marquants de la musique : 0, 1, 2… */
  const moments   = $derived(Array.from({ length: 1 + music.restarts.length }, (_, moment) => moment));
  // Recalculé à chaque ouverture et à chaque lancement (le retour au 0 dépend de l'heure)
  const nextMoment = $derived(transitionPopup.isOpen ? getNextMoment() : 0);
  const volumePct = $derived(Math.round(STATE.transitionVolume * 100));

  /** Durées des fichiers connues à l'arrêt (métadonnées lues une fois par musique, depuis le cache hors ligne) */
  let knownDurations = $state<Record<string, number>>({});
  $effect(() => {
    const target = music;
    if (!transitionPopup.isOpen || knownDurations[target.id] !== undefined) return;
    const probe = new Audio();
    probe.preload = 'metadata';
    probe.onloadedmetadata = () => {
      if (isFinite(probe.duration)) knownDurations[target.id] = probe.duration;
    };
    probe.src = target.file;
    return () => { probe.onloadedmetadata = null; probe.removeAttribute('src'); probe.load(); };
  });

  /** Repères des moments 0, 1, 2… sur la barre de progression, en lecture comme à l'arrêt */
  const markers = $derived.by((): string[] => {
    void transport.seekPct;
    const playing = isCurrent ? STATE.currentAudio?.duration : undefined;
    const duration = playing !== undefined && isFinite(playing) ? playing : knownDurations[music.id] ?? NaN;
    if (!isFinite(duration)) return [];
    const { startOffset, totalDuration } = getPlaybackWindow({ ...music, start: 0 }, duration);
    if (totalDuration <= 0) return [];
    return [music.start ?? 0, ...music.restarts].map(time => Math.max(0, Math.min(100, (time - startOffset) / totalDuration * 100)) + '%');
  });
</script>

{#if transitionPopup.isOpen}
  <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions (fermeture par le bouton ✕) -->
  <div id="transition-overlay" onclick={event => { if (event.target === event.currentTarget) closeTransitionPopup(); }}>
    <div id="transition-card" role="dialog" aria-label="Musique de transition">
      <div class="transition-head">
        <span class="transition-title">Musique de transition</span>
        <button class="transition-close" title="Fermer (la musique continue)" onclick={closeTransitionPopup}>✕</button>
      </div>

      <label class="transition-field">
        <span class="transition-caption">Musique du spectacle</span>
        <select value={music.id} onchange={event => selectTransitionMusic(event.currentTarget.value)}>
          {#each musics as option (option.id)}
            <option value={option.id}>{option.name}</option>
          {/each}
        </select>
      </label>

      <div class="transition-progress" class:is-current={isCurrent}>
        <div class="transition-bar">
          <div class="transition-bar-fill" style:width={isCurrent ? transport.seekPct : '0%'}></div>
          {#each markers as left, index (index)}<div class="transition-bar-marker" style:left={left}></div>{/each}
        </div>
        <span class="transition-time">{isCurrent ? transport.timeText : 'À l\'arrêt'}</span>
      </div>

      <!-- Hauteur fixe : en lecture, le gros « Arrêter » prend exactement la place de la ligne -->
      <div class="transition-moments">
        {#if isCurrent}
          <button class="transition-main is-current" onclick={stopTransition}>
            <span class="icon-stop" aria-hidden="true"></span> Arrêter
          </button>
        {:else}
          {#each moments as moment (moment)}
            <button
              class="transition-moment"
              class:is-next={moment === nextMoment}
              title={moment === 0 ? `Début du spectacle (${formatTime(getMomentTime(music, 0))})` : `Moment ${moment} (${formatTime(getMomentTime(music, moment))})`}
              onclick={() => void launchTransition(Date.now(), moment)}
            >
              <span class="transition-moment-number">
                {#if moment === nextMoment}<span class="icon-play" aria-hidden="true"></span>{/if}{moment}
              </span>
              <span class="transition-moment-time">{formatTime(getMomentTime(music, moment))}</span>
            </button>
          {/each}
        {/if}
      </div>

      <div class="transition-next">
        {#if isCurrent}
          En lecture : moment {STATE.transitionLastMoment}{STATE.transitionLastMoment === 0 ? ' (début du spectacle)' : ''}
        {:else if nextMoment === 0}
          Prévu : 0, début du spectacle ; ensuite {music.restarts.map((_, index) => index + 1).join(', ')} à tour de rôle
        {:else}
          Prévu : moment {nextMoment} ({formatTime(getMomentTime(music, nextMoment))})
        {/if}
      </div>

      <VolumeControl
        sliderClass="transition-vol" max={100} value={volumePct} volPct={volumePct + '%'}
        valueText={volumePct + '%'} onvolume={raw => setTransitionVolume(raw / 100)}
      />

      <div class="transition-options">
        <label class="transition-switch">
          <input
            type="checkbox" role="switch"
            checked={STATE.transitionResetVolume}
            onchange={e => setTransitionResetVolume(e.currentTarget.checked)}
          />
          <span class="transition-switch-track" aria-hidden="true"></span>
          <span class="transition-switch-text">Volume remis à 100 % à chaque ouverture</span>
        </label>

        <button
          class="transition-clarity"
          class:is-active={STATE.transitionClarity}
          aria-pressed={STATE.transitionClarity}
          title={STATE.transitionClarity ? 'Couper Clarté Studio sur la transition' : 'Appliquer Clarté Studio à la transition'}
          onclick={() => setTransitionClarity(!STATE.transitionClarity)}
        >
          <span aria-hidden="true">{clarityPreset?.icon ?? '✨'}</span> {clarityPreset?.text ?? 'Clarté Studio'}
        </button>
      </div>
    </div>
  </div>
{/if}

<style>
  #transition-overlay {
    position: fixed;
    top: var(--header-h);
    left: 0; right: 0; bottom: 0;
    z-index: 150;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 16px;
    background: rgba(0, 0, 0, 0.6);
  }

  #transition-card {
    /* Curseur de volume (.vol-slider) à la couleur de la transition */
    --panel-accent: var(--transition-accent);
    display: flex;
    flex-direction: column;
    gap: 16px;
    width: 100%;
    max-width: 480px;
    max-height: 100%;
    overflow-y: auto;
    padding: 20px 24px;
    background: var(--bg-surface);
    border: 1px solid var(--transition-accent);
    border-radius: calc(var(--radius) * 2);
    box-shadow: 0 0 40px rgba(0, 0, 0, 0.6),
                0 0 40px color-mix(in srgb, var(--transition-accent) 20%, transparent);
    font-family: var(--font-mono);
    color: var(--text-primary);
  }

  .transition-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
  }

  .transition-title {
    font-family: var(--font-display);
    font-size: 16px;
    font-weight: 700;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--transition-accent);
  }

  .transition-close {
    width: 40px;
    height: 40px;
    border: 1px solid var(--border);
    border-radius: var(--radius);
    background: var(--bg-card);
    color: var(--text-secondary);
    font-size: 16px;
    cursor: pointer;
  }

  .transition-field {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  /* Interrupteur du volume et bouton Clarté Studio, sur une même ligne */
  .transition-options {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  /* Bouton Clarté Studio : allumé quand le préréglage est appliqué à la transition */
  .transition-clarity {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    gap: 6px;
    height: 44px;
    padding: 0 14px;
    border: 1px solid var(--border-glow);
    border-radius: var(--radius);
    background: var(--bg-card);
    color: var(--text-secondary);
    font-family: var(--font-display);
    font-size: 15px;
    font-weight: 700;
    white-space: nowrap;
    cursor: pointer;
  }
  .transition-clarity.is-active {
    border-color: var(--transition-accent);
    background: color-mix(in srgb, var(--transition-accent) 22%, var(--bg-card));
    color: var(--transition-accent);
  }
  .transition-clarity:active {
    transform: scale(0.97);
  }
  .transition-clarity:focus-visible {
    outline: 2px solid var(--transition-accent);
    outline-offset: -2px;
  }

  /* Interrupteur : volume remis à 100 % à chaque ouverture, ou gardé comme avant */
  .transition-switch {
    flex: 1;
    min-width: 0;
    position: relative;
    display: flex;
    align-items: center;
    gap: 12px;
    min-height: 44px;
    cursor: pointer;
    user-select: none;
    -webkit-user-select: none;
  }
  .transition-switch input {
    position: absolute;
    opacity: 0;
    width: 0;
    height: 0;
  }
  .transition-switch-track {
    position: relative;
    flex-shrink: 0;
    width: 48px;
    height: 26px;
    border: 1px solid var(--border-glow);
    border-radius: 13px;
    background: var(--bg-card);
    transition: background 0.15s, border-color 0.15s;
  }
  .transition-switch-track::after {
    content: '';
    position: absolute;
    top: 2px; left: 2px;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: var(--text-muted);
    transition: transform 0.15s, background 0.15s;
  }
  .transition-switch input:checked + .transition-switch-track {
    border-color: var(--transition-accent);
    background: color-mix(in srgb, var(--transition-accent) 30%, var(--bg-card));
  }
  .transition-switch input:checked + .transition-switch-track::after {
    transform: translateX(22px);
    background: var(--transition-accent);
  }
  .transition-switch input:focus-visible + .transition-switch-track {
    outline: 2px solid var(--transition-accent);
    outline-offset: 2px;
  }
  .transition-switch-text {
    font-size: 12px;
    color: var(--text-secondary);
  }

  .transition-caption {
    font-size: 11px;
    color: var(--text-muted);
    letter-spacing: 0.06em;
  }

  select {
    height: 44px;
    padding: 0 10px;
    border: 1px solid var(--border-glow);
    border-radius: var(--radius);
    background: var(--bg-card);
    color: var(--text-primary);
    font-family: var(--font-display);
    font-size: 16px;
    font-weight: 700;
  }

  .transition-progress {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .transition-bar {
    position: relative;
    flex: 1;
    height: 14px;
    background: var(--border);
    border: 1px solid var(--border-glow);
    border-radius: 7px;
    overflow: hidden;
  }

  .transition-bar-fill {
    position: absolute;
    left: 0; top: 0; bottom: 0;
    background: var(--transition-accent);
  }

  /* Repères des moments marquants 0, 1, 2… */
  .transition-bar-marker {
    position: absolute;
    top: 0; bottom: 0;
    width: 2px;
    margin-left: -1px;
    background: var(--text-primary);
  }

  .transition-time {
    width: 90px;
    flex-shrink: 0;
    text-align: right;
    font-size: 12px;
    color: var(--text-muted);
    white-space: nowrap;
  }
  .transition-progress.is-current .transition-time {
    color: var(--transition-accent);
  }

  /* Ligne des moments marquants, ou gros « Arrêter » à la même place */
  .transition-moments {
    display: flex;
    gap: 8px;
    height: 64px;
  }

  .transition-main {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    white-space: nowrap;
    overflow: hidden;
    border: 1px solid var(--transition-accent);
    border-radius: var(--radius);
    background: var(--transition-accent);
    color: var(--bg-base);
    font-family: var(--font-display);
    font-size: 18px;
    font-weight: 700;
    letter-spacing: 0.06em;
    cursor: pointer;
  }

  .transition-moment {
    flex: 1 1 0;
    min-width: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 2px;
    border: 1px solid var(--border-glow);
    border-radius: var(--radius);
    background: var(--bg-card);
    color: var(--text-secondary);
    font-family: var(--font-display);
    cursor: pointer;
  }

  /* Le moment prévu : en couleur, et plus large pour être touché sans viser */
  .transition-moment.is-next {
    flex-grow: 3;
    border-color: var(--transition-accent);
    background: color-mix(in srgb, var(--transition-accent) 22%, var(--bg-card));
    color: var(--transition-accent);
  }

  .transition-main:active,
  .transition-moment:active {
    transform: scale(0.97);
  }

  .transition-moment-number {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 22px;
    font-weight: 700;
    line-height: 1;
  }

  .transition-moment-time {
    font-family: var(--font-mono);
    font-size: 11px;
    color: var(--text-muted);
  }
  .transition-moment.is-next .transition-moment-time {
    color: var(--text-secondary);
  }

  /* Une seule ligne : la légende change sans changer la taille de la popup */
  .transition-next {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: 11px;
    color: var(--text-secondary);
  }

  .transition-close:focus-visible,
  .transition-main:focus-visible,
  .transition-moment:focus-visible,
  select:focus-visible {
    outline: 2px solid var(--transition-accent);
    outline-offset: -2px;
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
</style>
