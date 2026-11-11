/* ================================================================
   app-update.ts — Mise à jour de l'application à la demande
   (bouton de la popup À propos)

   Une nouvelle version publiée est installée par le Service Worker au
   lancement, en arrière-plan, et ne s'affiche qu'au lancement suivant.
   Ce bouton évite d'attendre : il demande au Service Worker de chercher
   la nouvelle version, attend qu'elle soit installée, puis recharge.
   Aucun cache n'est vidé (les sons restent disponibles hors ligne) et le
   Service Worker n'est jamais désinscrit : hors ligne, rien n'est rechargé,
   et l'application reste utilisable (bug n° 7).
================================================================ */

export type AppUpdateResult =
  /** Rechargement lancé (sur la nouvelle version s'il y en a une) */
  | 'reloading'
  /** Le site ne répond pas (hors ligne) : rien n'est rechargé */
  | 'offline'
  /** La nouvelle version n'a pas pu s'installer : rien n'est rechargé */
  | 'failed';

/** Attend qu'un Service Worker en cours d'installation soit actif (false s'il est abandonné) */
function waitUntilActivated(worker: ServiceWorker): Promise<boolean> {
  return new Promise(resolve => {
    const check = () => {
      if (worker.state === 'activated') resolve(true);
      else if (worker.state === 'redundant') resolve(false);
    };
    worker.addEventListener('statechange', check);
    check();
  });
}

export async function updateAndReload(reload: () => void = () => location.reload()): Promise<AppUpdateResult> {
  const registration = 'serviceWorker' in navigator
    ? await navigator.serviceWorker.getRegistration()
    : undefined;
  // Pas de Service Worker (serveur de développement) : simple rechargement
  if (!registration) {
    reload();
    return 'reloading';
  }

  try {
    // Relit sw.js sur le site, sans le cache HTTP : rejeté si le site ne répond pas
    await registration.update();
  } catch {
    return 'offline';
  }

  // Nouvelle version trouvée : elle s'active seule (skipWaiting dans sw.ts) une fois
  // tous ses fichiers téléchargés. Sinon, la version active est déjà la dernière, même
  // si la page affichée est plus ancienne : le rechargement suffit.
  const incoming = registration.installing ?? registration.waiting;
  if (incoming && !(await waitUntilActivated(incoming))) return 'failed';

  reload();
  return 'reloading';
}
