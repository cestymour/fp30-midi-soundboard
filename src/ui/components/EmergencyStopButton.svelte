<!--
  EmergencyStopButton.svelte — Arrêt d'urgence (MIDI + audio), pictogramme hazard
-->
<script lang="ts">
  import { emergencyStopAudio } from '../../audio/playback.ts';
  import { sendEmergencyStopMidi } from '../../midi/midi.ts';

  let { extraClass }: { extraClass?: string } = $props();

  /** Identifiant propre à chaque bouton pour les motifs SVG */
  const uid = Math.random().toString(36).substring(2, 11);

  /** Arrêt d'urgence total — coupe MIDI + Audio */
  function emergencyStopAll(): void {
    emergencyStopAudio();
    sendEmergencyStopMidi();
  }
</script>

<button class={'emergency-stop-btn' + (extraClass ? ' ' + extraClass : '')} title="Stop" onclick={emergencyStopAll}>
  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 28 28" aria-hidden="true">
    <circle cx="14" cy="14" r="13" fill="none" stroke-width="0"/>
    <clipPath id="ring-clip-{uid}">
      <path d="M14 14 m-13 0 a13 13 0 1 1 26 0 a13 13 0 1 1 -26 0
              M14 14 m-9 0 a9 9 0 1 0 18 0 a9 9 0 1 0 -18 0"
            clip-rule="evenodd"/>
    </clipPath>
    <rect x="0" y="0" width="28" height="28" fill="url(#hazard-{uid})" clip-path="url(#ring-clip-{uid})"/>
    <defs>
      <pattern id="hazard-{uid}" x="0" y="0" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
        <rect width="4" height="8" fill="#f5c400"/>
        <rect x="4" width="4" height="8" fill="#111111"/>
      </pattern>
    </defs>
    <circle cx="14" cy="14" r="9" fill="#cc0000"/>
    <circle cx="11" cy="11" r="3.5" fill="rgba(255,255,255,0.18)"/>
  </svg>
  <span class="emergency-stop-btn__label">STOP</span>
</button>
