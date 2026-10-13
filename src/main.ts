/* ================================================================
   main.ts — Point d'entrée : styles, interface (Svelte), moteurs,
             Wake Lock et enregistrement du Service Worker
================================================================ */

import './css/style.css';
import './css/style.fx.css';
import { mount } from 'svelte';
import App from './App.svelte';
import { initBluetooth, initWebMidi } from './midi/connection.ts';
import { bindMidiConnectionUI } from './ui/midi-ui.svelte.ts';
import { bindPlaybackUI } from './ui/transport.svelte.ts';
import { initWakeLock } from './wake-lock.ts';

// L'interface suit les moteurs MIDI et audio
bindMidiConnectionUI();
bindPlaybackUI();

mount(App, { target: document.getElementById('app')! });

initWakeLock();

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
