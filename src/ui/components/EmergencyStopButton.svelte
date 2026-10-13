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

<style>
  /* ── Focus accessible (clavier uniquement) ── */
  .emergency-stop-btn:focus-visible {
    outline: 2px solid var(--current-accent);
    outline-offset: -2px;
  }

  .emergency-stop-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 7px;
    box-sizing: border-box;
    min-height: 44px;
    background: color-mix(in srgb, var(--color-danger) 8%, var(--bg-card));
    border: 1px solid var(--color-danger);
    border-radius: var(--radius);
    color: var(--color-danger);
    font-family: var(--font-mono);
    font-size: 13px;
    font-weight: 600;
    letter-spacing: 0.1em;
    padding: 8px 14px;
    cursor: pointer;
    transition: background 0.15s, box-shadow 0.15s, color 0.15s;
    flex-shrink: 0;
    white-space: nowrap;
    line-height: 1;
  }

  .emergency-stop-btn:hover {
    background: color-mix(in srgb, var(--color-danger) 15%, transparent);
    box-shadow: 0 0 10px color-mix(in srgb, var(--color-danger) 35%, transparent);
  }

  .emergency-stop-btn:active {
    background: color-mix(in srgb, var(--color-danger) 30%, transparent);
    transform: scale(0.93);
  }

  .emergency-stop-btn__label {
    font-family: var(--font-mono);
    letter-spacing: 0.1em;
  }

  /* Masquer le libellé STOP si peu de largeur (paysage étroit) */
  @media (orientation: portrait), (max-width: 900px) {
    .emergency-stop-btn__label {
      display: none;
    }

    .emergency-stop-btn {
      padding: 0 10px;
      min-width: 44px;
      min-height: 44px;
      height: 44px;
      box-sizing: border-box;
    }
  }

  /* En portrait, la toolbar peut wrapper : on réaffiche le libellé STOP */
  @media (orientation: portrait) {
    .emergency-stop-btn__label {
      display: inline;
    }

    .emergency-stop-btn {
      min-width: unset;
      padding: 8px 14px;
    }
  }

  /* ── Portrait — tous écrans ── */
  @media (orientation: portrait) {
    .emergency-stop-btn {
      min-height: 44px;
      height: 44px;
      padding: 0 10px;
      box-sizing: border-box;
    }
  }
</style>
