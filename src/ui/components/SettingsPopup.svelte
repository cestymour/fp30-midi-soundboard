<!--
  SettingsPopup.svelte — Popup « Paramètres » (bouton ⚙ de l'en-tête), de haut en bas :
  - Écran : le bouton Plein écran, mis en avant, et « Écran toujours allumé » (Wake Lock) ;
  - Hors ligne : sons et images en cache, stockage protégé, Service Worker,
    et « Télécharger tous les sons » tant qu'il en manque ou qu'il reste
    d'anciens fichiers à effacer (« Libérer la place des anciens fichiers » s'il ne manque rien) ;
  - Application : version et « Mettre à jour l'application » ;
  - nom de l'application et crédit ; le bouton ✕ ferme, en haut à droite.
  Chaque état est une ligne « libellé — valeur » avec une pastille : vert (prêt),
  orange (à vérifier avant un spectacle), gris (non disponible sur cet appareil).
-->
<script lang="ts">
  import { STATE } from '../../state.svelte.ts';
  import { updateAndReload } from '../../app-update.ts';
  import { downloadAllForOffline, getOfflineStatus, isStoragePersisted, requestPersistentStorage } from '../../offline.ts';
  import type { OfflineStatus } from '../../offline.ts';

  type Tone = 'ok' | 'warn' | 'off';
  interface Status { value: string; tone: Tone }

  const CHECKING: Status = { value: '…', tone: 'off' };

  let isOpen  = $state(false);
  /** Affichage en ligne : absent avant la première ouverture (masqué par le CSS) */
  let display = $state<string | undefined>(undefined);

  // ── Écran ──
  // Plein écran : utile dans un onglet Chrome, qui garde sinon sa barre d'adresse
  const canFullscreen = document.fullscreenEnabled;
  let isFullscreen    = $state(!!document.fullscreenElement);
  let wakeLock        = $state<Status>(CHECKING);

  async function toggleFullscreen(): Promise<void> {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await document.documentElement.requestFullscreen({ navigationUI: 'hide' });
    } catch (err) {
      console.warn('[Plein écran] Refusé :', err);
    }
  }

  // ── Hors ligne ──
  let serviceWorker  = $state<Status>(CHECKING);
  let storage        = $state<Status>(CHECKING);
  let offline        = $state<OfflineStatus | null>(null);
  /** Cache API indisponible : pas de compte des fichiers */
  let offlineUnknown = $state(false);
  /** Progression du téléchargement en cours (null : aucun) */
  let download       = $state<{ done: number; total: number } | null>(null);
  let downloadResult = $state('');

  const sounds = $derived(countStatus(offline?.sounds));
  const images = $derived(countStatus(offline?.images));
  const allCached = $derived(!!offline
    && offline.sounds.cached === offline.sounds.total
    && offline.images.cached === offline.images.total);
  /** Entrées des caches qui ne servent plus (fichier retiré, renommé ou remplacé) */
  const obsolete = $derived(offline ? offline.sounds.obsolete + offline.images.obsolete : 0);

  /** Taille à la française : « 12,3 Mo », ou en Ko sous 1 Mo (« 30 Ko », jamais « 0,0 Mo ») */
  function formatSize(bytes: number): string {
    if (bytes < 1e6) return Math.max(1, Math.round(bytes / 1e3)) + ' Ko';
    return (bytes / 1e6).toFixed(1).replace('.', ',') + ' Mo';
  }

  function countStatus(count: { cached: number; total: number } | undefined): Status {
    if (count) return { value: `${count.cached} / ${count.total}`, tone: count.cached === count.total ? 'ok' : 'warn' };
    return offlineUnknown ? { value: 'non disponible', tone: 'off' } : CHECKING;
  }

  async function refreshOffline(): Promise<void> {
    const persisted = await isStoragePersisted();
    storage = persisted === null ? { value: 'non disponible', tone: 'off' }
      : persisted ? { value: 'protégé', tone: 'ok' }
      : { value: 'non protégé', tone: 'warn' };
    try {
      offline = await getOfflineStatus();
      offlineUnknown = false;
    } catch {
      offline = null;
      offlineUnknown = true;
    }
  }

  async function downloadAll(): Promise<void> {
    downloadResult = '';
    download = { done: 0, total: 0 };
    let failed: string[] = [];
    let freed = 0;
    try {
      ({ failed, freed } = await downloadAllForOffline((done, total) => { download = { done, total }; }));
    } catch {
      downloadResult = 'Téléchargement impossible.';
    }
    download = null;
    if (!downloadResult) {
      downloadResult = failed.length === 0 ? 'Tout est disponible hors ligne.'
        : failed.length === 1 ? "1 fichier n'a pas pu être téléchargé (réseau ?)."
        : `${failed.length} fichiers n'ont pas pu être téléchargés (réseau ?).`;
      if (freed > 0) downloadResult += ` ${formatSize(freed)} libérés.`;
    }
    await requestPersistentStorage();
    await refreshOffline();
  }

  // ── Application ──
  /** Mise à jour demandée et pas encore terminée */
  let updating     = $state(false);
  let updateStatus = $state('');

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

  // ── Ouverture, fermeture ──
  export function open(): void {
    serviceWorker = 'serviceWorker' in navigator && navigator.serviceWorker.controller
      ? { value: 'actif', tone: 'ok' }
      : { value: 'inactif', tone: 'warn' };

    wakeLock = !('wakeLock' in navigator) ? { value: 'non pris en charge', tone: 'off' }
      : STATE.wakeLock ? { value: 'oui', tone: 'ok' }
      : { value: 'non', tone: 'warn' };

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
</script>

{#snippet statusRow(label: string, status: Status, id: string)}
  <div class="settings-row" {id}>
    <span class="settings-label">{label}</span>
    <span class="settings-value" data-tone={status.tone}>
      <span class="settings-dot" aria-hidden="true"></span>{status.value}
    </span>
  </div>
{/snippet}

<!-- Suivi du plein écran, y compris quand on le quitte par le geste ou la touche Retour -->
<svelte:document onfullscreenchange={() => { isFullscreen = !!document.fullscreenElement; }} />

<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions (fermeture par le bouton ✕) -->
<div
  id="settings-overlay"
  aria-hidden={isOpen ? 'false' : 'true'}
  style:display
  onclick={event => { if (event.target === event.currentTarget) close(); }}
>
  <div id="settings-card" role="dialog" aria-labelledby="settings-title">
    <div id="settings-head">
      <h2 id="settings-title">Paramètres</h2>
      <button id="settings-close-btn" title="Fermer" aria-label="Fermer" onclick={close}>✕</button>
    </div>

    <!-- ── Écran ── -->
    <section class="settings-section">
      <h3 class="settings-heading">Écran</h3>
      {#if canFullscreen}
        <button id="settings-fullscreen-btn" class:is-active={isFullscreen} aria-pressed={isFullscreen} onclick={toggleFullscreen}>
          <!-- Icône dessinée (SVG) : les symboles Unicode de plein écran manquent aux polices d'Android -->
          <svg class="settings-fullscreen-icon" viewBox="0 0 16 16" aria-hidden="true">
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
      <div class="settings-rows">
        {@render statusRow('Écran toujours allumé', wakeLock, 'settings-wakelock')}
      </div>
    </section>

    <!-- ── Hors ligne ── -->
    <section class="settings-section">
      <h3 class="settings-heading">Hors ligne</h3>
      <div class="settings-rows">
        {@render statusRow('Sons', sounds, 'settings-sounds')}
        {@render statusRow('Images', images, 'settings-images')}
        {@render statusRow('Stockage', storage, 'settings-storage')}
        {@render statusRow('Service Worker', serviceWorker, 'settings-sw')}
      </div>
      {#if storage.tone === 'warn'}
        <p class="settings-note">Stockage non protégé : Chrome peut effacer les sons s'il manque de place.</p>
      {/if}
      {#if download}
        <p class="settings-message" role="status">Téléchargement… {download.done} / {download.total}</p>
      {:else if downloadResult}
        <p class="settings-message" role="status">{downloadResult}</p>
      {/if}
      {#if offline && (!allCached || obsolete > 0)}
        <button id="settings-download-btn" class="settings-btn" onclick={downloadAll} disabled={!!download}>
          {allCached ? '♻ Libérer la place des anciens fichiers' : '⬇ Télécharger tous les sons'}
        </button>
      {/if}
    </section>

    <!-- ── Application ── -->
    <section class="settings-section">
      <h3 class="settings-heading">Application</h3>
      <div class="settings-rows">
        <div class="settings-row" id="settings-version">
          <span class="settings-label">Version</span>
          <span class="settings-value">{__APP_VERSION__}</span>
        </div>
      </div>
      {#if updateStatus}<p class="settings-message" role="status">{updateStatus}</p>{/if}
      <button id="settings-update-btn" class="settings-btn" onclick={updateApp} disabled={updating}>
        ⟳ Mettre à jour l'application
      </button>
    </section>

    <footer id="settings-footer">
      <span class="settings-app-name">[IMPRO] Soundboard</span>
      <span>pour piano Roland FP-30X · par cestymour</span>
    </footer>
  </div>
</div>

<style>
  #settings-overlay {
    display: none;
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.75);
    z-index: 200;
    align-items: center;
    justify-content: center;
    backdrop-filter: blur(4px);
  }

  #settings-card {
    background: var(--bg-surface);
    border: 1px solid var(--border-glow);
    border-radius: calc(var(--radius) * 2);
    padding: 20px 24px;
    display: flex;
    flex-direction: column;
    gap: 18px;
    width: 400px;
    max-width: calc(100vw - 16px);
    /* Plus haute que l'écran (téléphone en paysage) : on la fait défiler */
    max-height: calc(100vh - 16px);
    max-height: calc(100dvh - 16px);
    overflow-y: auto;
    box-shadow: 0 0 40px rgba(0, 0, 0, 0.6),
                0 0 80px color-mix(in srgb, var(--current-accent) 10%, transparent);
    font-family: var(--font-display);
    color: var(--text-primary);
  }

  /* Titre et bouton ✕, comme la popup de la musique de transition */
  #settings-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
  }

  #settings-title {
    font-size: 22px;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--current-accent);
  }

  /* ── Sections ── */
  .settings-section {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .settings-heading {
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    color: var(--text-muted);
  }

  .settings-rows {
    background: var(--bg-base);
    border: 1px solid var(--border);
    border-radius: var(--radius);
  }

  .settings-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 7px 12px;
    font-size: 15px;
  }
  .settings-row + .settings-row {
    border-top: 1px solid var(--border);
  }

  .settings-label {
    color: var(--text-secondary);
    font-weight: 600;
  }

  .settings-value {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    font-family: var(--font-mono);
    font-size: 12px;
    color: var(--text-primary);
    white-space: nowrap;
  }

  /* Pastille d'état : vert prêt, orange à vérifier, gris non disponible */
  .settings-dot {
    display: none;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    flex-shrink: 0;
  }
  .settings-value[data-tone] .settings-dot { display: inline-block; }
  .settings-value[data-tone='ok'] .settings-dot   { background: #3ddc84; }
  .settings-value[data-tone='warn']               { color: #ffb547; }
  .settings-value[data-tone='warn'] .settings-dot { background: #ffb547; }
  .settings-value[data-tone='off']                { color: var(--text-muted); }
  .settings-value[data-tone='off'] .settings-dot  { background: var(--text-muted); }

  .settings-note,
  .settings-message {
    font-size: 13px;
    line-height: 1.3;
  }
  .settings-note    { color: #ffb547; }
  .settings-message { color: var(--text-secondary); }

  /* ── Boutons ── */
  #settings-fullscreen-btn,
  .settings-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    border-radius: var(--radius);
    font-family: var(--font-display);
    font-weight: 700;
    letter-spacing: 0.06em;
    cursor: pointer;
    transition: background 0.15s, border-color 0.15s, color 0.15s, box-shadow 0.15s;
  }
  #settings-fullscreen-btn:focus-visible,
  .settings-btn:focus-visible,
  #settings-close-btn:focus-visible {
    outline: 2px solid var(--text-primary);
    outline-offset: 2px;
  }

  /* Plein écran : le bouton principal, plein, en couleur d'accent */
  #settings-fullscreen-btn {
    min-height: 56px;
    padding: 12px 16px;
    font-size: 20px;
    text-transform: uppercase;
    background: var(--current-accent);
    border: 1px solid var(--current-accent);
    color: var(--bg-base);
    box-shadow: 0 0 18px color-mix(in srgb, var(--current-accent) 35%, transparent);
  }
  #settings-fullscreen-btn:hover {
    box-shadow: 0 0 26px color-mix(in srgb, var(--current-accent) 55%, transparent);
  }
  #settings-fullscreen-btn:active {
    filter: brightness(0.85);
  }
  /* Déjà en plein écran : le bouton pour en sortir reste visible mais passe au contour */
  #settings-fullscreen-btn.is-active {
    background: color-mix(in srgb, var(--current-accent) 12%, transparent);
    color: var(--current-accent);
    box-shadow: none;
  }

  .settings-fullscreen-icon {
    width: 20px;
    height: 20px;
    flex-shrink: 0;
    fill: none;
    stroke: currentColor;
    stroke-width: 2;
    stroke-linecap: round;
    stroke-linejoin: round;
  }

  /* Boutons secondaires : contour en couleur d'accent */
  .settings-btn {
    min-height: 42px;
    padding: 8px 16px;
    font-size: 15px;
    background: transparent;
    border: 1px solid var(--current-accent);
    color: var(--current-accent);
  }
  .settings-btn:hover {
    background: color-mix(in srgb, var(--current-accent) 15%, transparent);
  }
  .settings-btn:active {
    background: color-mix(in srgb, var(--current-accent) 25%, transparent);
  }
  .settings-btn:disabled {
    opacity: 0.5;
    cursor: wait;
  }

  /* ── Pied ── */
  #settings-footer {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
    padding-top: 14px;
    border-top: 1px solid var(--border);
    font-family: var(--font-mono);
    font-size: 11px;
    color: var(--text-muted);
    text-align: center;
  }
  .settings-app-name {
    font-weight: 600;
    letter-spacing: 0.15em;
    color: var(--text-secondary);
  }

  #settings-close-btn {
    flex-shrink: 0;
    width: 40px;
    height: 40px;
    border: 1px solid var(--border);
    border-radius: var(--radius);
    background: var(--bg-card);
    color: var(--text-secondary);
    font-size: 16px;
    cursor: pointer;
  }
  #settings-close-btn:hover {
    color: var(--text-primary);
  }

  /* Téléphone en paysage : popup plus compacte */
  @media (orientation: landscape) and (max-height: 500px) {
    #settings-card {
      padding: 14px 20px;
      gap: 12px;
    }
    #settings-fullscreen-btn {
      min-height: 46px;
    }
  }
</style>
