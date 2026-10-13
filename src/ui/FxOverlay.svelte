<!--
  FxOverlay.svelte — Popup d'effets grand format (piano MIDI ou audio)
  Un seul composant pour les deux popups : tout ce qui diffère est dans
  le contrôleur (voir fx-overlay.svelte.ts et fx-overlays.svelte.ts).
-->
<script lang="ts" generics="Key extends string, Settings">
  import { onMount } from 'svelte';
  import { isFxControlModified } from '../fx/fx-presets.ts';
  import type { FxOverlayController } from './fx-overlay.svelte.ts';

  let { controller }: { controller: FxOverlayController<Key, Settings> } = $props();

  const config = $derived(controller.config);
  const attr   = $derived(config.attributes);

  /** Pourcentage de remplissage du curseur (variable CSS --vol-pct) */
  function sliderPct(min: number, max: number, value: number): string {
    const range = max - min;
    const pct   = range <= 0 ? 0 : ((value - min) / range) * 100;
    return `${Math.max(0, Math.min(100, pct))}%`;
  }

  function handleKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape' && controller.isOpen) controller.close();
  }

  function handleResize(): void {
    if (controller.isOpen) controller.updateLayout();
  }

  onMount(() => {
    // Les repères du neutre dépendent de la taille des rails
    const railResizeObserver = new ResizeObserver(() => controller.updateAllNeutralRailMarks());
    Object.values(controller.rails).forEach(rail => {
      if (rail) railResizeObserver.observe(rail as HTMLElement);
    });
    controller.build();
    return () => railResizeObserver.disconnect();
  });
</script>

<svelte:document onkeydown={handleKeydown} />
<svelte:window onresize={handleResize} />

<div
  id={config.overlayId}
  aria-hidden={controller.isOpen ? 'false' : 'true'}
  class:is-open={controller.isOpen}
  style:top={controller.layout?.top}
  style:left={controller.layout?.left}
  style:width={controller.layout?.width}
  style:height={controller.layout?.height}
  style:--panel-accent={controller.layout?.accent ?? undefined}
>
  <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions (fermeture au clavier par Échap) -->
  <div class="fx-overlay__backdrop" onclick={() => controller.close()}></div>
  <!-- svelte-ignore a11y_no_noninteractive_element_to_interactive_role (balisage d'origine conservé) -->
  <section class="fx-popup" role="dialog" aria-modal="true" aria-label={config.ariaLabel}>
    <header class="fx-popup__header">
      <div class="fx-presets">
        {#each config.presets as preset (preset.key)}
          <button
            class="fx-preset-btn"
            class:fx-preset-btn--reset={preset.key === 'reset'}
            class:is-active={preset.key === controller.activePresetKey}
            type="button"
            {...{ [attr.preset]: preset.key }}
            onclick={() => controller.applyPreset(preset.key)}
          >{#if preset.icon}<span class="fx-preset-btn__icon" aria-hidden="true">{preset.icon}</span>{/if}<span class="fx-preset-btn__text">{preset.text}</span></button>
        {/each}
      </div>
    </header>

    <div class="fx-popup__body">
      <div class="fx-grid">
        {#each config.controls as control (control.key)}
          {@const value = controller.values[control.key]}
          {@const isModified = controller.isBuilt && isFxControlModified(control, value)}
          <div class="fx-control" class:is-modified={isModified} {...{ [attr.control]: control.key }}>
            <div class="fx-control__head">
              <span class="fx-control__tag">{control.label}</span>
              <span class="fx-control__value" {...{ [attr.valueFor]: control.key }}>{controller.isBuilt ? control.formatValue(value) : '--'}</span>
            </div>
            <div class="fx-slider-wrap">
              <div
                class="fx-slider-rail"
                {...{ [attr.railFor]: control.key }}
                style:--neutral-from-top-pct={controller.neutralMarks[control.key]}
                bind:this={controller.rails[control.key]}
              >
                <span class="fx-neutral-tick fx-neutral-tick--left"  aria-hidden="true"></span>
                <span class="fx-neutral-tick fx-neutral-tick--right" aria-hidden="true"></span>
                <input
                  class="vol-slider fx-slider"
                  class:is-modified={isModified}
                  {...{ [attr.sliderFor]: control.key }}
                  type="range"
                  min={control.min}
                  max={control.max}
                  step={control.step}
                  value={value}
                  style:--vol-pct={controller.isBuilt ? sliderPct(control.min, control.max, value) : undefined}
                  bind:this={controller.inputs[control.key]}
                  oninput={event => controller.handleSliderInput(control, parseFloat(event.currentTarget.value))}
                />
              </div>
            </div>
            <div class="fx-control__foot">
              <span class="fx-control__name">{control.shortLabel}</span>
              <button
                type="button"
                class="fx-one-reset"
                class:is-disabled={controller.isBuilt && !isModified}
                disabled={controller.isBuilt && !isModified}
                {...{ [attr.resetOne]: control.key }}
                title="Valeur par défaut ({control.shortLabel})"
                aria-label="Remettre {control.shortLabel} à la valeur par défaut"
                onclick={event => {
                  event.preventDefault();
                  event.stopPropagation();
                  controller.animateControlToNeutral(control.key);
                }}
              >↺</button>
            </div>
          </div>
        {/each}
      </div>
    </div>
  </section>
</div>

<style>
  /* Popup d'effets (MIDI et audio). Les boutons de la barre du panneau sont dans components/FxToolbar.svelte,
     le curseur de base (.vol-slider) dans css/global.css. */

  /* ── Focus visible ──────────────────────────────────────────── */

  .fx-preset-btn:focus-visible,
  .fx-one-reset:focus-visible,
  .fx-slider:focus-visible {
    outline: 2px solid var(--current-accent);
    outline-offset: 2px;
  }

  /* ── Overlay ────────────────────────────────────────────────── */

  #audio-fx-overlay,
  #midi-fx-overlay {
    position: fixed;
    z-index: 120;
    display: none;
  }

  #audio-fx-overlay.is-open,
  #midi-fx-overlay.is-open {
    display: block;
  }

  .fx-overlay__backdrop {
    position: absolute;
    inset: 0;
    border-radius: 14px;
    background:
      radial-gradient(circle at top center, color-mix(in srgb, var(--current-accent) 14%, transparent), transparent 34%),
      rgba(7, 9, 12, 0.84);
    backdrop-filter: blur(8px);
  }

  /* ── Popup shell ────────────────────────────────────────────── */

  .fx-popup {
    position: absolute;
    inset: 0;
    display: grid;
    grid-template-rows: auto minmax(0, 1fr);
    gap: 10px;
    padding: 12px;
    border: 1px solid var(--panel-accent, var(--current-accent));
    border-radius: 14px;
    background:
      linear-gradient(180deg, rgba(255,255,255,0.025), transparent 15%),
      linear-gradient(180deg, rgba(16, 20, 27, 0.92), rgba(10, 13, 18, 0.94));
    box-shadow:
      0 0 12px color-mix(in srgb, var(--panel-accent, var(--current-accent)) 24%, transparent),
      0 24px 60px rgba(0, 0, 0, 0.42);
  }

  /* ── Header ─────────────────────────────────────────────────── */

  .fx-popup__header {
    min-width: 0;
  }

  /* Ancien bloc piste (Track / canal) : styles conservés si tu réactives le HTML */
  :global(.fx-track) {
    flex: 1 1 140px;
    min-width: 0;
    max-width: min(42vw, 280px);
    align-self: center;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 4px 10px;
    border: 1px solid color-mix(in srgb, var(--border) 80%, transparent);
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.012);
  }

  :global(.fx-track__label) {
    color: var(--text-muted);
    font-family: var(--font-mono);
    font-size: 10px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    opacity: 0.85;
  }

  :global(.fx-track__name) {
    color: var(--text-secondary);
    font-size: 12px;
    font-weight: 500;
    max-width: 220px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  /* ── Presets (tuiles) ───────────────────────────────────────── */

  .fx-presets {
    min-width: 0;
    max-width: 100%;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(88px, 1fr));
    align-content: flex-start;
    gap: 8px;
    overflow-x: hidden;
    overflow-y: auto;
    max-height: 196px;
    padding: 2px 4px 4px 2px;
    -webkit-overflow-scrolling: touch;
  }

  .fx-preset-btn {
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 4px;
    width: 100%;
    min-width: 0;
    min-height: 56px;
    height: auto;
    margin: 0;
    padding: 8px 6px 10px;
    border: 1px solid color-mix(in srgb, var(--border) 90%, var(--current-accent));
    border-radius: 12px;
    background:
      linear-gradient(165deg, rgba(255, 255, 255, 0.06) 0%, transparent 42%),
      linear-gradient(180deg, color-mix(in srgb, var(--bg-card) 88%, #0a0c10), var(--bg-card));
    color: var(--text-secondary);
    font-family: var(--font-display);
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 0.02em;
    line-height: 1.2;
    text-align: center;
    cursor: pointer;
    transition: transform 0.15s, border-color 0.15s, background 0.15s, box-shadow 0.15s, color 0.15s;
    box-shadow: 0 4px 14px rgba(0, 0, 0, 0.22), inset 0 1px 0 rgba(255, 255, 255, 0.05);
  }

  .fx-preset-btn:hover {
    color: var(--text-primary);
    border-color: color-mix(in srgb, var(--current-accent) 45%, var(--border));
    background:
      linear-gradient(165deg, color-mix(in srgb, var(--current-accent) 14%, transparent) 0%, transparent 50%),
      var(--bg-card);
    box-shadow:
      0 0 0 1px color-mix(in srgb, var(--current-accent) 18%, transparent),
      0 8px 20px rgba(0, 0, 0, 0.28),
      inset 0 1px 0 rgba(255, 255, 255, 0.06);
  }

  .fx-preset-btn:active {
    transform: scale(0.97);
  }

  .fx-preset-btn__icon {
    font-size: 20px;
    line-height: 1;
    flex-shrink: 0;
  }

  .fx-preset-btn__text {
    font-size: 11px;
    font-weight: 600;
    line-height: 1.15;
    text-align: center;
    max-width: 100%;
    word-break: break-word;
    hyphens: auto;
    color: inherit;
  }

  .fx-preset-btn--reset {
    font-family: var(--font-mono);
    color: var(--text-primary);
    border-color: color-mix(in srgb, var(--border) 85%, var(--text-muted));
    background:
      linear-gradient(180deg, rgba(255, 255, 255, 0.04), rgba(0, 0, 0, 0.2));
  }

  .fx-preset-btn--reset .fx-preset-btn__icon {
    font-size: 22px;
  }

  .fx-preset-btn--reset .fx-preset-btn__text {
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
  }

  .fx-preset-btn--reset:hover {
    color: var(--text-primary);
    border-color: color-mix(in srgb, var(--text-muted) 55%, var(--border));
  }

  .fx-preset-btn.is-active {
    color: var(--text-primary);
    border-color: color-mix(in srgb, #ffcc66 55%, var(--border));
    background:
      linear-gradient(165deg, color-mix(in srgb, #ffcc66 22%, transparent) 0%, transparent 55%),
      color-mix(in srgb, #ffcc66 12%, var(--bg-card));
    box-shadow:
      0 0 0 1px color-mix(in srgb, #ffcc66 35%, transparent),
      0 0 18px color-mix(in srgb, #ffcc66 22%, transparent),
      inset 0 1px 0 rgba(255, 255, 255, 0.07);
  }

  .fx-preset-btn.is-active .fx-preset-btn__text {
    color: var(--text-primary);
  }

  /* Reset : tuile active en bleu (défaut), les autres presets restent jaune (sélection) */
  .fx-preset-btn--reset.is-active {
    border-color: var(--current-accent);
    background:
      linear-gradient(165deg, color-mix(in srgb, var(--current-accent) 22%, transparent) 0%, transparent 55%),
      color-mix(in srgb, var(--current-accent) 12%, var(--bg-card));
    box-shadow:
      0 0 0 1px color-mix(in srgb, var(--current-accent) 35%, transparent),
      0 0 18px color-mix(in srgb, var(--current-accent) 22%, transparent),
      inset 0 1px 0 rgba(255, 255, 255, 0.07);
  }

  .fx-preset-btn--reset.is-active .fx-preset-btn__icon,
  .fx-preset-btn--reset.is-active .fx-preset-btn__text {
    color: var(--text-primary);
  }

  /* ── Body / grille ──────────────────────────────────────────── */

  .fx-popup__body {
    min-height: 0;
  }

  .fx-grid {
    display: grid;
    /* 8 colonnes en paysage ; 4 en portrait uniquement (voir @media orientation) */
    grid-template-columns: repeat(8, minmax(0, 1fr));
    gap: 8px;
    height: 100%;
  }

  @media (orientation: portrait) {
    .fx-grid {
      grid-template-columns: repeat(4, minmax(64px, 1fr));
    }
  }

  /* ── Contrôle individuel ────────────────────────────────────── */

  .fx-control {
    display: grid;
    grid-template-rows: auto minmax(0, 1fr) auto;
    gap: 10px;
    min-width: 0;
    min-height: 0;
    padding: 10px 6px;
    border: 1px solid var(--border);
    border-radius: 14px;
    overflow: hidden;
    background:
      linear-gradient(180deg, rgba(255,255,255,0.02), transparent 20%),
      var(--bg-card);
  }

  .fx-control__head {
    display: grid;
    gap: 6px;
    justify-items: center;
  }

  .fx-control__tag {
    color: var(--current-accent);
    font-family: var(--font-mono);
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.08em;
  }

  .fx-control__value {
    min-height: 30px;
    color: var(--text-primary);
    font-size: 12px;
    text-align: center;
    line-height: 1.05;
  }

  .fx-control__foot {
    position: relative;
    z-index: 2;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    min-height: 36px;
    padding: 0 2px;
    color: var(--text-secondary);
    font-size: 13px;
    background: var(--bg-card);
  }

  .fx-control__name {
    flex: 1;
    min-width: 0;
    text-align: center;
    line-height: 1.2;
  }

  /* ── Bouton reset individuel ────────────────────────────────── */

  .fx-one-reset {
    flex-shrink: 0;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    margin: 0;
    padding: 0;
    border-radius: 10px;
    border: 1px solid var(--border);
    background: rgba(255, 255, 255, 0.04);
    color: var(--text-secondary);
    font-size: 17px;
    line-height: 1;
    cursor: pointer;
    transition: color 0.15s, border-color 0.15s, background 0.15s, transform 0.12s;
  }

  .fx-one-reset:hover:not(:disabled) {
    color: var(--text-primary);
    border-color: var(--current-accent);
    background: color-mix(in srgb, var(--current-accent) 12%, var(--bg-card));
  }

  .fx-one-reset:active:not(:disabled) {
    transform: scale(0.94);
  }

  .fx-one-reset:disabled,
  .fx-one-reset.is-disabled {
    opacity: 0.35;
    cursor: not-allowed;
    pointer-events: none;
  }

  /* ── Slider vertical ────────────────────────────────────────── */

  .fx-slider-wrap {
    display: flex;
    align-items: stretch;
    justify-content: center;
    min-height: 0;
  }

  .fx-slider-rail {
    position: relative;
    container-type: size;
    container-name: fx-rail;
    /* Course verticale = largeur du <input> : 100cqh suit la hauteur dispo du rail */
    --fx-slider-span-min: 64px;
    --fx-slider-span-max: 380px;
    width: 48px;
    max-width: 100%;
    margin: 0 auto;
    height: 100%;
    /* Plancher : rester >= au span mini pour éviter de clipper la piste */
    min-height: 112px;
    overflow: hidden;
    --neutral-from-top-pct: 50%;
  }

  .fx-neutral-tick {
    position: absolute;
    z-index: 0;
    width: 11px;
    height: 2px;
    border-radius: 1px;
    background: color-mix(in srgb, var(--text-muted) 75%, var(--border));
    pointer-events: none;
    top: var(--neutral-from-top-pct, 50%);
    bottom: auto;
    transform: translateY(-50%);
    opacity: 0.9;
  }

  .fx-neutral-tick--left  { left: 0; }
  .fx-neutral-tick--right { right: 0; }

  .fx-slider.vol-slider {
    --fx-slider-accent: var(--current-accent);
    position: absolute;
    z-index: 1;
    top: 50%;
    left: 50%;
    /* Fallback navigateurs sans unités cq* sur width */
    width: clamp(var(--fx-slider-span-min), 28vmin, var(--fx-slider-span-max));
    height: 44px;
    margin: 0;
    padding: 0;
    border: none;
    outline: none;
    background: transparent;
    box-sizing: border-box;
    -webkit-appearance: none;
    appearance: none;
    transform: translate3d(-50%, -50%, 0) rotate(-90deg);
    transform-origin: center center;
    flex: none;
    touch-action: none;
  }

  @supports (width: 1cqh) {
    .fx-slider.vol-slider {
      width: clamp(var(--fx-slider-span-min), 100cqh, var(--fx-slider-span-max));
    }
  }

  .fx-slider.vol-slider::-webkit-slider-thumb {
    margin-top: -6px;
    border-color: var(--fx-slider-accent);
    box-shadow: 0 0 8px var(--fx-slider-accent);
  }

  .fx-slider.vol-slider::-moz-range-track,
  .fx-slider.vol-slider::-moz-range-progress,
  .fx-slider.vol-slider::-webkit-slider-runnable-track {
    height: 12px;
  }

  .fx-slider.vol-slider::-webkit-slider-runnable-track {
    background: linear-gradient(
      to right,
      var(--fx-slider-accent) 0%,
      var(--fx-slider-accent) var(--vol-pct, 75%),
      var(--border) var(--vol-pct, 75%),
      var(--border) 100%
    );
  }

  .fx-slider.vol-slider::-moz-range-progress {
    background: var(--fx-slider-accent);
  }

  .fx-slider.vol-slider::-moz-range-thumb {
    border-color: var(--fx-slider-accent);
    box-shadow: 0 0 8px var(--fx-slider-accent);
  }

  /* ── État modifié ────────────────────────────────────────────── */

  .fx-control.is-modified .fx-control__tag,
  .fx-control.is-modified .fx-control__value {
    color: #ffcc66;
  }

  .fx-slider.is-modified {
    --fx-slider-accent: #ffcc66;
  }

  /* ── Responsive ─────────────────────────────────────────────── */

  @media (max-width: 1200px) {
    .fx-slider-rail {
      min-height: 100px;
      --fx-slider-span-min: 58px;
      --fx-slider-span-max: 340px;
    }
  }

  @media (orientation: portrait), (max-width: 900px) {
    .fx-popup {
      padding: 10px;
      gap: 8px;
    }

    .fx-presets {
      max-height: 136px;
    }

    .fx-slider-rail {
      min-height: 84px;
      width: 46px;
      --fx-slider-span-min: 54px;
      --fx-slider-span-max: 300px;
    }

    .fx-slider.vol-slider {
      height: 40px;
    }

    .fx-slider.vol-slider::-webkit-slider-thumb {
      width: 20px;
      height: 20px;
      margin-top: -4px;
      border-width: 2px;
    }

    .fx-slider.vol-slider::-moz-range-thumb {
      width: 20px;
      height: 20px;
      border-width: 2px;
    }
  }

  @media (max-width: 600px) {
    .fx-presets {
      grid-template-columns: repeat(auto-fill, minmax(72px, 1fr));
    }
    .fx-slider-rail {
      min-height: 72px;
      width: 44px;
      --fx-slider-span-min: 50px;
      --fx-slider-span-max: 260px;
    }

    .fx-slider.vol-slider {
      height: 38px;
    }

    .fx-slider.vol-slider::-webkit-slider-thumb {
      width: 20px;
      height: 20px;
      margin-top: -4px;
      border-width: 2px;
    }

    .fx-slider.vol-slider::-moz-range-thumb {
      width: 20px;
      height: 20px;
      border-width: 2px;
    }

    .fx-control {
      padding: 8px 4px;
      gap: 8px;
    }

    .fx-control__foot {
      font-size: 11px;
      min-height: 32px;
    }

    .fx-one-reset {
      width: 32px;
      height: 32px;
      font-size: 15px;
    }
  }

  @media (orientation: landscape) {
    .fx-presets {
      gap: 6px;
      grid-template-columns: repeat(auto-fill, minmax(60px, 1fr));
    }

    .fx-preset-btn__text {
      align-self: stretch;
      width: 100%;
      min-width: 0;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      word-break: normal;
      hyphens: none;
    }
  }

  @media (orientation: landscape) and (max-width: 900px) {
    .fx-presets {
      max-height: 188px;
    }
  }

  @media (orientation: landscape) and (max-width: 520px) {
    .fx-presets {
      grid-template-columns: repeat(auto-fill, minmax(54px, 1fr));
    }
  }
</style>
