/* ================================================================
   main.ts — Point d'entrée : styles, initialisation de l'app
             et enregistrement du Service Worker
================================================================ */

import './css/style.css';
import './css/style.fx.css';
import { init } from './app.ts';

init();

// Service Worker : uniquement sur la version construite (pas en dev)
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js')
      .then(reg => console.log('[PWA] Service Worker enregistré :', reg.scope))
      .catch(err => console.warn('[PWA] Échec enregistrement SW :', err));
  });
}
