<!--
  AboutPopup.svelte — Popup « À propos » : version, état du Service Worker
  et du Wake Lock, rechargement sans cache
-->
<script lang="ts">
  import { STATE } from '../../state.svelte.ts';

  let isOpen  = $state(false);
  /** Affichage en ligne : absent avant la première ouverture (masqué par le CSS) */
  let display = $state<string | undefined>(undefined);
  let swStatus = $state('Service Worker : vérification...');
  let wlStatus = $state('Wake Lock : vérification...');

  export function open(): void {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      swStatus = 'Service Worker : actif ✓';
    } else {
      swStatus = 'Service Worker : inactif';
    }

    if (!('wakeLock' in navigator)) {
      wlStatus = 'Wake Lock : non supporté';
    } else if (STATE.wakeLock) {
      wlStatus = 'Wake Lock : actif ✓';
    } else {
      wlStatus = 'Wake Lock : inactif';
    }

    isOpen  = true;
    display = 'flex';
  }

  function close(): void {
    isOpen  = false;
    display = 'none';
  }

  async function reloadWithoutCache(): Promise<void> {
    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      for (const reg of registrations) await reg.unregister();
    }
    location.reload();
  }
</script>

<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions (fermeture par le bouton Fermer) -->
<div
  id="about-overlay"
  aria-hidden={isOpen ? 'false' : 'true'}
  style:display
  onclick={event => { if (event.target === event.currentTarget) close(); }}
>
  <div id="about-card">
    <div id="about-title">[IMPRO] Soundboard</div>
    <div id="about-work">Work with 🎹 Piano Roland FP30X</div>
    <div id="about-version">v{__APP_VERSION__}</div>
    <div id="about-info">
      <span id="about-sw-status">{swStatus}</span>
      <br>
      <span id="about-wl-status">{wlStatus}</span>
    </div>
    <div id="about-credit">by cestymour</div>
    <div id="about-actions">
      <button id="about-reload-btn" onclick={reloadWithoutCache}>⟳ Vider le cache et recharger</button>
      <button id="about-close-btn" onclick={close}>Fermer</button>
    </div>
  </div>
</div>

<style>
  #about-overlay {
    display: none;
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.75);
    z-index: 200;
    align-items: center;
    justify-content: center;
    backdrop-filter: blur(4px);
  }

  #about-card {
    background: var(--bg-surface);
    border: 1px solid var(--border-glow);
    border-radius: calc(var(--radius) * 2);
    padding: 28px 32px;
    display: flex;
    flex-direction: column;
    gap: 16px;
    min-width: 280px;
    max-width: 400px;
    box-shadow: 0 0 40px rgba(0, 0, 0, 0.6),
                0 0 80px color-mix(in srgb, var(--current-accent) 10%, transparent);
    font-family: var(--font-mono);
  }

  #about-title {
    font-size: 14px;
    font-weight: 600;
    letter-spacing: 0.15em;
    color: var(--current-accent);
  }

  #about-version {
    font-size: 24px;
    font-weight: 600;
    color: var(--text-primary);
  }

  #about-info {
    font-size: 11px;
    color: var(--text-muted);
    padding: 10px 12px;
    background: var(--bg-base);
    border: 1px solid var(--border);
    border-radius: var(--radius);
  }

  #about-credit {
    font-size: 11px;
    color: var(--text-muted);
    letter-spacing: 0.1em;
  }

  #about-actions {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  /* ── Focus accessible (clavier uniquement) ── */
  #about-reload-btn:focus-visible,
  #about-close-btn:focus-visible {
    outline: 2px solid var(--current-accent);
    outline-offset: -2px;
  }

  #about-reload-btn,
  #about-close-btn {
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 0.08em;
    padding: 10px 16px;
    border-radius: var(--radius);
    cursor: pointer;
    transition: background 0.15s, box-shadow 0.15s;
    text-align: center;
  }

  #about-reload-btn {
    background: transparent;
    border: 1px solid var(--current-accent);
    color: var(--current-accent);
  }
  #about-reload-btn:hover {
    background: color-mix(in srgb, var(--current-accent) 15%, transparent);
    box-shadow: 0 0 10px color-mix(in srgb, var(--current-accent) 30%, transparent);
  }
  #about-reload-btn:active {
    background: color-mix(in srgb, var(--current-accent) 25%, transparent);
  }

  #about-close-btn {
    background: transparent;
    border: 1px solid var(--border);
    color: var(--text-muted);
  }
  #about-close-btn:hover {
    border-color: var(--border-glow);
    color: var(--text-secondary);
  }
</style>
