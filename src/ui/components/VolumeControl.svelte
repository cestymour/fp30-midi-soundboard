<!--
  VolumeControl.svelte — Curseur de volume d'un panneau (MIDI ou audio)
  La valeur est partagée entre panneaux ; l'icône ne change que sur le
  panneau où l'on a bougé le curseur (comportement d'origine).
-->
<script lang="ts">
  let { sliderClass, max, value, volPct, valueText, onvolume }: {
    sliderClass: string;
    max:         number;
    value:       number;
    /** Variable CSS --vol-pct du curseur */
    volPct:      string;
    valueText:   string;
    /** Applique la valeur du curseur ; renvoie la valeur à refléter dans l'icône (sur 0-max) */
    onvolume:    (raw: number) => number;
  } = $props();

  let icon = $state('🔊');

  /** Emoji de volume selon le pourcentage */
  function volumeIcon(val: number): string {
    const pct = val / max * 100;
    if (pct === 0)     return '🔇';
    else if (pct < 35) return '🔈';
    else if (pct < 70) return '🔉';
    else               return '🔊';
  }

  function handleInput(event: Event & { currentTarget: HTMLInputElement }): void {
    const iconValue = onvolume(parseInt(event.currentTarget.value, 10));
    icon = volumeIcon(iconValue);
  }
</script>

<div class="volume-wrap">
  <span class="vol-icon">{icon}</span>
  <input type="range" class="vol-slider {sliderClass}"
         min="0" {max} {value}
         style:--vol-pct={volPct}
         oninput={handleInput} />
  <span class="vol-value">{valueText}</span>
</div>
