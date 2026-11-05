<!--
  AboutPopup.svelte — Popup « À propos » : version, état du Service Worker
  et du Wake Lock, hors ligne (stockage, téléchargement de tous les sons),
  plein écran, mise à jour de l'application
-->
<script lang="ts">
  import { STATE } from '../../state.svelte.ts';
  import { updateAndReload } from '../../app-update.ts';
  import { downloadAllForOffline, getOfflineStatus, isStoragePersisted, requestPersistentStorage } from '../../offline.ts';
  import type { OfflineStatus } from '../../offline.ts';

  let isOpen  = $state(false);
  /** Affichage en ligne : absent avant la première ouverture (masqué par le CSS) */
  let display = $state<string | undefined>(undefined);
  let swStatus = $state('Service Worker : vérification...');
  let wlStatus = $state('Wake Lock : vérification...');
  /** Mise à jour demandée et pas encore terminée */
  let updating     = $state(false);
  let updateStatus = $state('');

  // Plein écran : utile dans un onglet Chrome, qui garde sinon sa barre d'adresse
  const canFullscreen = document.fullscreenEnabled;
  let isFullscreen    = $state(!!document.fullscreenElement);

  async function toggleFullscreen(): Promise<void> {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await document.documentElement.requestFullscreen({ navigationUI: 'hide' });
    } catch (err) {
      console.warn('[Plein écran] Refusé :', err);
    }
  }

  // Hors ligne
  let storageStatus  = $state('Stockage : vérification...');
  let offline        = $state<OfflineStatus | null>(null);
  /** Progression du téléchargement en cours (null : aucun) */
  let download       = $state<{ done: number; total: number } | null>(null);
  let downloadResult = $state('');
  const allCached = $derived(!!offline
    && offline.sounds.cached === offline.sounds.total
    && offline.images.cached === offline.images.total);

  async function refreshOffline(): Promise<void> {
    const persisted = await isStoragePersisted();
    storageStatus = persisted === null ? 'Stockage : non disponible'
      : persisted ? 'Stockage : protégé ✓'
      : "Stockage : non protégé (Chrome peut l'effacer s'il manque de place)";
    try {
      offline = await getOfflineStatus();
    } catch {
      offline = null; // Cache API indisponible
    }
  }

  async function downloadAll(): Promise<void> {
    downloadResult = '';
    download = { done: 0, total: 0 };
    let failed: string[];
    try {
      failed = await downloadAllForOffline((done, total) => { download = { done, total }; });
    } catch {
      failed = [];
      downloadResult = 'Téléchargement impossible.';
    }
    download = null;
    if (!downloadResult) {
      downloadResult = failed.length === 0 ? 'Tout est disponible hors ligne ✓'
        : failed.length === 1 ? "1 fichier n'a pas pu être téléchargé (réseau ?)."
        : `${failed.length} fichiers n'ont pas pu être téléchargés (réseau ?).`;
    }
    await requestPersistentStorage();
    await refreshOffline();
  }

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

    if (!updating) updateStatus = '';
    if (!download) downloadResult = '';
    void refreshOffline();

    isOpen  = true;
    display = 'flex';
  }

  function close(): void {
    isOpen  = false;
    display = 'none';
  }

  /** Installe la dernière version publiée puis recharge ; les sons restent en cache */
  async function updateApp(): Promise<void> {
    updating = true;
    updateStatus = 'Recherche de la dernière version…';
    const result = await updateAndReload();
    if (result === 'reloading') return;
    updating = false;
    updateStatus = result === 'offline'
      ? "Hors ligne : mise à jour impossible. L'application reste utilisable."
      : "La nouvelle version n'a pas pu s'installer. Réessayer plus tard.";
  }
</script>

<!-- Suivi du plein écran, y compris quand on le quitte par le geste ou la touche Retour -->
<svelte:document onfullscreenchange={() => { isFullscreen = !!document.fullscreenElement; }} />

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
    <div id="about-offline">
      <span id="about-storage-status">{storageStatus}</span>
      {#if offline}
        <br>
        <span id="about-offline-count">Hors ligne : {offline.sounds.cached} / {offline.sounds.total} sons, {offline.images.cached} / {offline.images.total} images</span>
      {/if}
      {#if download}
        <div class="about-offline-msg" role="status">Téléchargement… {download.done} / {download.total}</div>
      {:else if downloadResult}
        <div class="about-offline-msg" role="status">{downloadResult}</div>
      {/if}
      {#if offline && !allCached}
        <button id="about-download-btn" onclick={downloadAll} disabled={!!download}>⬇ Télécharger tous les sons</button>
      {/if}
    </div>
    <div id="about-credit">by cestymour</div>
    <div id="about-actions">
      {#if canFullscreen}
        <button id="about-fullscreen-btn" class:is-active={isFullscreen} aria-pressed={isFullscreen} onclick={toggleFullscreen}>
          <!-- Icône dessinée (SVG) : les symboles Unicode de plein écran manquent aux polices d'Android -->
          <svg class="about-fullscreen-icon" viewBox="0 0 16 16" aria-hidden="true">
            {#if isFullscreen}
              <!-- Coins tournés vers l'intérieur : sortir -->
              <path d="M6 1v5H1M10 1v5h5M6 15v-5H1M10 15v-5h5" />
            {:else}
              <!-- Coins tournés vers l'extérieur : agrandir -->
              <path d="M1 6V1h5M15 6V1h-5M1 10v5h5M15 10v5h-5" />
            {/if}
          </svg>
          {isFullscreen ? 'Quitter le plein écran' : 'Plein écran'}
        </button>
      {/if}
      {#if updateStatus}<div id="about-update-status" role="status">{updateStatus}</div>{/if}
      <button id="about-reload-btn" onclick={updateApp} disabled={updating}>⟳ Mettre à jour l'application</button>
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
    /* Plus haute que l'écran (téléphone en paysage) : on la fait défiler, Fermer reste accessible */
    max-height: calc(100vh - 16px);
    max-height: calc(100dvh - 16px);
    overflow-y: auto;
    box-sizing: border-box;
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

  #about-offline {
    display: flex;
    flex-direction: column;
    gap: 8px;
    font-size: 11px;
    color: var(--text-muted);
    padding: 10px 12px;
    background: var(--bg-base);
    border: 1px solid var(--border);
    border-radius: var(--radius);
  }

  #about-offline br {
    display: none;
  }

  .about-offline-msg {
    color: var(--text-secondary);
  }

  #about-download-btn {
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 0.08em;
    padding: 10px 16px;
    border-radius: var(--radius);
    cursor: pointer;
    text-align: center;
    background: transparent;
    border: 1px solid var(--current-accent);
    color: var(--current-accent);
    transition: background 0.15s, box-shadow 0.15s;
  }
  #about-download-btn:hover {
    background: color-mix(in srgb, var(--current-accent) 15%, transparent);
  }
  #about-download-btn:focus-visible {
    outline: 2px solid var(--current-accent);
    outline-offset: -2px;
  }
  #about-download-btn:disabled {
    opacity: 0.5;
    cursor: wait;
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
  #about-fullscreen-btn:focus-visible,
  #about-close-btn:focus-visible {
    outline: 2px solid var(--current-accent);
    outline-offset: -2px;
  }

  #about-reload-btn,
  #about-fullscreen-btn,
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
  #about-reload-btn:disabled {
    opacity: 0.5;
    cursor: wait;
  }

  #about-update-status {
    font-size: 11px;
    color: var(--text-secondary);
    text-align: center;
  }

  #about-fullscreen-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    background: transparent;
    border: 1px solid var(--border);
    color: var(--text-secondary);
  }
  #about-fullscreen-btn:hover {
    border-color: var(--current-accent);
    color: var(--text-primary);
  }
  .about-fullscreen-icon {
    width: 14px;
    height: 14px;
    flex-shrink: 0;
    fill: none;
    stroke: currentColor;
    stroke-width: 2;
    stroke-linecap: round;
    stroke-linejoin: round;
  }

  #about-fullscreen-btn.is-active {
    border-color: var(--current-accent);
    color: var(--current-accent);
    background: color-mix(in srgb, var(--current-accent) 12%, transparent);
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

  /* Téléphone en paysage : popup plus compacte */
  @media (orientation: landscape) and (max-height: 500px) {
    #about-card {
      padding: 14px 20px;
      gap: 10px;
    }
  }
</style>
