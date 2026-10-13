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
