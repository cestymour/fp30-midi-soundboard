/* ================================================================
   transport.ts — Interface de lecture audio : boutons de sons,
   barre de transport (lecture/pause, seek, temps), curseurs de
   volume. Suit la lecture via playbackEvents (audio/playback.ts).
================================================================ */

import type { AudioItem } from '../types.ts';
import { STATE } from '../state.ts';
import { hasCurrentSound, playbackEvents, seekToRatio } from '../audio/playback.ts';
import { formatTime, getPlaybackProgress } from '../audio/timing.ts';
import { audioFxOverlay } from './fx-overlays.ts';

// ═══════════════════════════════════════════════════════
// BOUTONS DE SONS
// ═══════════════════════════════════════════════════════

/** Bouton de chaque son, pour refléter l'état de lecture */
const soundButtons = new Map<AudioItem, HTMLButtonElement>();

export function registerSoundButton(item: AudioItem, btn: HTMLButtonElement): void {
  soundButtons.set(item, btn);
}

function getCurrentSoundButton(): HTMLButtonElement | null {
  return STATE.currentSoundItem ? soundButtons.get(STATE.currentSoundItem) ?? null : null;
}

// ═══════════════════════════════════════════════════════
// TRANSPORT BAR — Play/Pause + Seek + Time
// ═══════════════════════════════════════════════════════

/**
 * Mise à jour légère — appelée dans la boucle RAF (60fps).
 * Met à jour le temps, la barre de seek et la progression du bouton.
 */
function updateSeekUI(): void {
  const audio = STATE.currentAudio;
  const item  = STATE.currentSoundItem;
  const btn   = getCurrentSoundButton();
  if (!audio || !item || !btn) return;

  const { elapsed, totalDuration, pct } = getPlaybackProgress(item, audio.currentTime, audio.duration);

  // Met à jour la barre de progression sur le bouton lui-même
  btn.style.setProperty('--progress', pct.toFixed(2) + '%');

  // Met à jour toutes les barres de transport
  document.querySelectorAll('.transport-seek').forEach(bar => {
    bar.querySelector<HTMLElement>('.transport-seek-fill')!.style.width  = pct + '%';
    bar.querySelector<HTMLElement>('.transport-seek-handle')!.style.left = pct + '%';
  });

  // Met à jour les affichages de temps
  document.querySelectorAll('.transport-time').forEach(el => {
    el.textContent = `${formatTime(elapsed)} / ${formatTime(totalDuration)}`;
  });
}

/**
 * Mise à jour complète de l'UI — appelée uniquement sur changement d'état
 * (play, stop, pause, emergency stop).
 */
function updateTransportUI(): void {
  const hasSound = hasCurrentSound();

  // ── Bouton play/pause et état du "handle" ──
  document.querySelectorAll<HTMLButtonElement>('.transport-play-pause').forEach(b => {
    if (!hasSound) {
      b.innerHTML = '<span class="icon-play"></span>';
      b.disabled = true;
      b.classList.remove('is-playing', 'is-paused');
    } else if (STATE.isPaused) {
      b.innerHTML = '<span class="icon-play"></span>';
      b.disabled = false;
      b.classList.remove('is-playing');
      b.classList.add('is-paused');
    } else {
      b.innerHTML = '<span class="icon-pause"></span>';
      b.disabled = false;
      b.classList.add('is-playing');
      b.classList.remove('is-paused');
    }
  });

  document.querySelectorAll('.transport-seek-handle').forEach(handle => {
    handle.classList.toggle('pulsing', hasSound && !STATE.isPaused);
  });

  // ── Reset des barres et temps si rien ne joue ──
  if (!hasSound) {
    document.querySelectorAll('.transport-seek').forEach(bar => {
      bar.querySelector<HTMLElement>('.transport-seek-fill')!.style.width = '0%';
      bar.querySelector<HTMLElement>('.transport-seek-handle')!.style.left = '0%';
    });
    document.querySelectorAll('.transport-time').forEach(el => {
      el.textContent = '–:–– / –:––';
    });
    // S'assure que le bouton qui jouait est bien remis à zéro
    const playingBtn = document.querySelector<HTMLElement>('.sound-btn.playing, .sound-btn.paused');
    if (playingBtn) playingBtn.style.setProperty('--progress', '0%');
  }

  // ── État global du panneau audio ──
  document.querySelectorAll('.panel-audio').forEach(p => {
    p.classList.remove('is-playing', 'is-paused');
    if (hasSound) {
      if (STATE.isPaused) {
        p.classList.add('is-paused');
      } else {
        p.classList.add('is-playing');
      }
    }
  });
}

/** Durée de transition de la barre de progression du bouton, selon la durée du son */
function setProgressTransition(btn: HTMLButtonElement, playableDuration: number | null): void {
  if (playableDuration === null) return;
  if (playableDuration < 3)       btn.style.setProperty('--progress-transition', '0.05s');
  else if (playableDuration < 10) btn.style.setProperty('--progress-transition', '0.15s');
  else                            btn.style.setProperty('--progress-transition', '0.30s');
}

/** Répercute les événements de lecture sur les boutons, la barre de transport et la popup FX */
export function bindPlaybackUI(): void {
  playbackEvents.on(event => {
    switch (event.type) {
      case 'play': {
        const btn = soundButtons.get(event.item);
        if (btn) {
          btn.classList.remove('paused', 'missing');
          btn.classList.add('playing');
        }
        // Appel de l'UI "lourde" une seule fois au lancement
        updateTransportUI();
        if (audioFxOverlay.isOpen) audioFxOverlay.sync();
        break;
      }
      case 'stop': {
        if (event.item) soundButtons.get(event.item)?.classList.remove('playing', 'paused');
        // Mise à jour de l'UI lourde après avoir tout arrêté
        updateTransportUI();
        if (audioFxOverlay.isOpen) audioFxOverlay.sync();
        break;
      }
      case 'pause':
      case 'resume':
        updateTransportUI();
        break;
      case 'progress-start': {
        const btn = soundButtons.get(event.item);
        if (btn) setProgressTransition(btn, event.playableDuration);
        break;
      }
      case 'progress':
        updateSeekUI();
        break;
      case 'missing':
        soundButtons.get(event.item)?.classList.add('missing');
        break;
    }
  });
}

// ═══════════════════════════════════════════════════════
// SEEK
// ═══════════════════════════════════════════════════════

/** Position (0-1) d'un événement souris / tactile sur la barre de seek */
function getSeekRatioFromEvent(e: MouseEvent | TouchEvent, bar: HTMLElement): number {
  const rect = bar.getBoundingClientRect();
  const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
  return Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
}

/** Applique le seek */
function applySeek(e: MouseEvent | TouchEvent, bar: HTMLElement): void {
  if (!hasCurrentSound()) return;
  seekToRatio(getSeekRatioFromEvent(e, bar));
}

/** Initialise le drag sur une barre de seek */
export function initSeekBarDrag(bar: HTMLElement): void {
  let isDragging = false;

  const startDrag = (e: MouseEvent | TouchEvent) => {
    if (!hasCurrentSound()) return;
    isDragging = true;
    document.body.classList.add('is-seeking');
    applySeek(e, bar);
    if (e.cancelable) e.preventDefault();
  };

  const doDrag = (e: MouseEvent | TouchEvent) => {
    if (!isDragging) return;
    applySeek(e, bar);
  };

  const endDrag = () => {
    if (!isDragging) return;
    isDragging = false;
    document.body.classList.remove('is-seeking');
  };

  // -- Mouse events --
  bar.addEventListener('mousedown', startDrag);
  document.addEventListener('mousemove', doDrag);
  document.addEventListener('mouseup', endDrag);

  // -- Touch events --
  bar.addEventListener('touchstart', startDrag, { passive: false });
  document.addEventListener('touchmove', doDrag, { passive: true });
  document.addEventListener('touchend', endDrag);
  document.addEventListener('touchcancel', endDrag);
}

// ═══════════════════════════════════════════════════════
// VOLUME
// ═══════════════════════════════════════════════════════

/** Aligne tous les curseurs de volume audio (un par panneau audio) */
export function syncAudioSliders(pct: number): void {
  document.querySelectorAll<HTMLInputElement>('.audio-vol').forEach(s => {
    if (parseInt(s.value, 10) === pct) return;
    s.value = String(pct);
    s.style.setProperty('--vol-pct', pct + '%');
    s.closest('.panel-controls')!.querySelector('.vol-value')!.textContent = pct + '%';
  });
}
