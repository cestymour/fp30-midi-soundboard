<!--
  FxToolbar.svelte — Groupe de boutons « Effets » (ouvre la popup) et
  « Reset » (remet tous les effets à zéro) de la barre d'un panneau.
-->
<script lang="ts">
  let { kind, openTitle, resetTitle, isOpen, anyFx, onopen, onreset }: {
    /** Préfixe des classes : midi-fx-… ou audio-fx-… */
    kind:       'midi' | 'audio';
    openTitle:  string;
    resetTitle: string;
    /** Popup d'effets ouverte */
    isOpen:     boolean;
    /** Au moins un effet actif (bouton Reset allumé) */
    anyFx:      boolean;
    onopen:     () => void;
    onreset:    () => void;
  } = $props();
</script>

<div class="fx-btn-group">
  <button type="button" class="{kind}-fx-open-btn" class:is-active={isOpen} title={openTitle} onclick={onopen}>
    <span class="{kind}-fx-open-btn__icon">🎚️</span>
    <span class="{kind}-fx-open-btn__label">Effets</span>
  </button>
  <button type="button" class="{kind}-fx-reset-btn" class:is-active={anyFx} title={resetTitle} onclick={onreset}>
    <span class="{kind}-fx-reset-btn__icon">↺</span>
    <span class="{kind}-fx-reset-btn__label">Reset</span>
  </button>
</div>

<style>
  /* Classes d'identité (ciblées par les tests de non-régression) :
       .audio-fx-open-btn / .audio-fx-reset-btn
       .midi-fx-open-btn  / .midi-fx-reset-btn */

  /* ── Split button : cadre Effets qui englobe Reset ──────────── */

  .fx-btn-group {
    display: inline-flex;
    align-items: stretch;
    border: 1px solid var(--border);
    border-radius: var(--radius);
    background: var(--bg-card);
    overflow: hidden;
    transition: border-color 0.15s, box-shadow 0.15s;
  }

  /* Hover sur l'une ou l'autre zone → bordure du groupe s'allume */
  .fx-btn-group:has(> *:hover) {
    border-color: var(--current-accent);
  }

  /* Actif : popup Effets ouverte → bordure accent panel */
  .fx-btn-group:has(.audio-fx-open-btn.is-active),
  .fx-btn-group:has(.midi-fx-open-btn.is-active) {
    border-color: var(--panel-accent);
    box-shadow: 0 0 12px color-mix(in srgb, var(--panel-accent) 24%, transparent);
  }

  /* ── Boutons toolbar ────────────────────────────────────────── */

  .audio-fx-open-btn,
  .audio-fx-reset-btn,
  .midi-fx-open-btn,
  .midi-fx-reset-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    height: 44px;
    padding: 0 12px;
    border-radius: var(--radius);
    border: 1px solid var(--border);
    background: var(--bg-card);
    color: var(--text-secondary);
    font-family: var(--font-display);
    cursor: pointer;
    transition: transform 0.15s, border-color 0.15s, background 0.15s, box-shadow 0.15s, color 0.15s;
  }

  /* À l'intérieur du groupe : le cadre visuel vient du groupe, pas des boutons */
  .fx-btn-group > .audio-fx-open-btn,
  .fx-btn-group > .audio-fx-reset-btn,
  .fx-btn-group > .midi-fx-open-btn,
  .fx-btn-group > .midi-fx-reset-btn {
    border: none;
    border-radius: 0;
    background: transparent;
    box-shadow: none;
  }

  /* Divider interne entre Effets et Reset */
  .fx-btn-group > *:last-child {
    border-left: 1px solid var(--border);
  }

  .audio-fx-open-btn:hover,
  .audio-fx-reset-btn:hover,
  .midi-fx-open-btn:hover,
  .midi-fx-reset-btn:hover {
    color: var(--text-primary);
    border-color: var(--current-accent);
  }

  /* Hover dans le groupe : juste colorer le texte + légère teinte de fond */
  .fx-btn-group > .audio-fx-open-btn:hover,
  .fx-btn-group > .audio-fx-reset-btn:hover,
  .fx-btn-group > .midi-fx-open-btn:hover,
  .fx-btn-group > .midi-fx-reset-btn:hover {
    color: var(--text-primary);
    border-color: transparent;
    background: color-mix(in srgb, var(--current-accent) 8%, transparent);
  }

  .fx-btn-group > .audio-fx-reset-btn.is-active:hover,
  .fx-btn-group > .midi-fx-reset-btn.is-active:hover {
    border: 1px solid color-mix(in srgb, #ffcc66 75%, var(--border));
    /*border-left-color: var(--border);*/
    background: color-mix(in srgb, #ffcc66 22%, transparent);
    box-shadow: inset 0 0 20px color-mix(in srgb, #ffcc66 18%, transparent);
  }

  .audio-fx-open-btn:active,
  .audio-fx-reset-btn:active,
  .midi-fx-open-btn:active,
  .midi-fx-reset-btn:active {
    transform: scale(0.96);
  }

  .audio-fx-open-btn__icon,
  .audio-fx-reset-btn__icon,
  .midi-fx-open-btn__icon,
  .midi-fx-reset-btn__icon {
    font-size: 18px;
    line-height: 1;
  }

  .audio-fx-open-btn__label,
  .audio-fx-reset-btn__label,
  .midi-fx-open-btn__label,
  .midi-fx-reset-btn__label {
    font-size: 13px;
    letter-spacing: 0.04em;
  }

  /* États actifs toolbar — open (accent de panel) */
  .audio-fx-open-btn.is-active,
  .midi-fx-open-btn.is-active {
    color: var(--text-primary);
    border-color: var(--panel-accent);
    background: color-mix(in srgb, var(--panel-accent) 14%, var(--bg-card));
    box-shadow: 0 0 12px color-mix(in srgb, var(--panel-accent) 24%, transparent);
  }

  /* Dans le groupe : le fond actif vient du bouton, mais sans border/shadow (géré par le groupe) */
  .fx-btn-group > .audio-fx-open-btn.is-active,
  .fx-btn-group > .midi-fx-open-btn.is-active {
    background: color-mix(in srgb, var(--panel-accent) 14%, transparent);
    box-shadow: none;
    border-color: transparent;
  }

  /* États actifs toolbar — reset (jaune) */
  .audio-fx-reset-btn.is-active,
  .midi-fx-reset-btn.is-active {
    color: var(--text-primary);
    border-color: color-mix(in srgb, #ffcc66 70%, var(--border));
    background: color-mix(in srgb, #ffcc66 16%, var(--bg-card));
    box-shadow: 0 0 12px color-mix(in srgb, #ffcc66 26%, transparent);
  }

  /* Dans le groupe : bordure jaune sur la zone Reset (séparateur gauche inchangé) */
  .fx-btn-group > .audio-fx-reset-btn.is-active,
  .fx-btn-group > .midi-fx-reset-btn.is-active {
    position: relative;
    z-index: 1;
    background: color-mix(in srgb, #ffcc66 16%, transparent);
    border: 1px solid color-mix(in srgb, #ffcc66 70%, var(--border));
    /*border-left-color: var(--border);*/
    border-radius: 0 var(--radius) var(--radius) 0;
    box-shadow: inset 0 0 18px color-mix(in srgb, #ffcc66 14%, transparent);
  }

  /* ── Focus visible ──────────────────────────────────────────── */

  .audio-fx-open-btn:focus-visible,
  .audio-fx-reset-btn:focus-visible,
  .midi-fx-open-btn:focus-visible,
  .midi-fx-reset-btn:focus-visible {
    outline: 2px solid var(--current-accent);
    outline-offset: 2px;
  }

  /* ── Responsive ─────────────────────────────────────────────── */

  @media (orientation: portrait), (max-width: 900px) {
    .audio-fx-open-btn__label,
    .audio-fx-reset-btn__label,
    .midi-fx-open-btn__label,
    .midi-fx-reset-btn__label {
      display: none;
    }

    .audio-fx-open-btn,
    .audio-fx-reset-btn,
    .midi-fx-open-btn,
    .midi-fx-reset-btn {
      min-width: 44px;
      padding: 0 8px;
    }
  }

  /* En portrait, la toolbar peut se mettre sur plusieurs lignes : on réaffiche les libellés */
  @media (orientation: portrait) {
    .audio-fx-open-btn__label,
    .audio-fx-reset-btn__label,
    .midi-fx-open-btn__label,
    .midi-fx-reset-btn__label {
      display: inline;
    }

    .audio-fx-open-btn,
    .audio-fx-reset-btn,
    .midi-fx-open-btn,
    .midi-fx-reset-btn {
      min-width: unset;
      padding: 0 12px;
    }
  }
</style>
