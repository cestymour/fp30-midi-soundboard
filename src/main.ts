/* ================================================================
   main.ts — Point d'entrée : styles, interface (Svelte), moteurs,
             Wake Lock et enregistrement du Service Worker
================================================================ */

// Polices embarquées dans l'application (precache du Service Worker, donc disponibles
// hors ligne dès le premier lancement) : mêmes graisses qu'avant chez Google Fonts
import '@fontsource/rajdhani/500.css';
import '@fontsource/rajdhani/700.css';
import '@fontsource/ibm-plex-mono/400.css';
import '@fontsource/ibm-plex-mono/600.css';
import './css/global.css';
import { mount } from 'svelte';
import App from './App.svelte';
import { initBluetooth, initWebMidi } from './midi/connection.ts';
import { bindMidiConnectionUI } from './ui/midi-ui.svelte.ts';
import { bindPlaybackUI } from './ui/transport.svelte.ts';
import { initWakeLock } from './wake-lock.ts';
import { requestPersistentStorage } from './offline.ts';

// L'interface suit les moteurs MIDI et audio
bindMidiConnectionUI();
bindPlaybackUI();

mount(App, { target: document.getElementById('app')! });

initWakeLock();
// Sons en cache protégés de l'effacement automatique par Chrome, si le navigateur l'accorde
void requestPersistentStorage().then(granted => console.log('[Stockage] Persistant :', granted));

try { initBluetooth(); } catch (e) { console.warn('[BT] Init échoué :', e); }
try { initWebMidi();   } catch (e) { console.warn('[MIDI] Init échoué :', e); }

// Service Worker : uniquement sur la version construite (pas en dev)
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js')
      .then(reg => console.log('[PWA] Service Worker enregistré :', reg.scope))
      .catch(err => console.warn('[PWA] Échec enregistrement SW :', err));
  });
}
