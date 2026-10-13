/* ================================================================
   playback.ts — Lecture des sons : play, stop, pause, seek, fondus
   et boucle de progression. Aucun accès au DOM : l'interface suit
   la lecture via `playbackEvents`.
================================================================ */

import type { AudioItem } from '../types.ts';
import { STATE } from '../state.svelte.ts';
import { createEmitter } from '../events.ts';
import { AudioEngineAPI } from './audio-engine.ts';
import type { MediaElementTrack } from './audio-engine.ts';
import { getPlayableDuration, getPlaybackRange, getSeekTime } from './timing.ts';

export type PlaybackEvent =
  /** Un son démarre (avant même la fin de son chargement) */
  | { type: 'play'; item: AudioItem }
  /** Lecture arrêtée ; `item` : le son qui jouait (null si aucun) */
  | { type: 'stop'; item: AudioItem | null }
  | { type: 'pause' }
  | { type: 'resume' }
  /** Boucle de progression lancée ; durée jouable null si encore inconnue */
  | { type: 'progress-start'; item: AudioItem; playableDuration: number | null }
  /** À chaque frame pendant la lecture, et après un seek */
  | { type: 'progress' }
  /** Fichier introuvable ou illisible */
  | { type: 'missing'; item: AudioItem };

export const playbackEvents = createEmitter<PlaybackEvent>();

/** Un son est chargé (en lecture ou en pause) */
export function hasCurrentSound(): boolean {
  return !!(STATE.currentAudio && STATE.currentSoundItem);
}

// ================================================================
// FONDU
// ================================================================

let _fadeTimer: ReturnType<typeof setInterval> | null = null;
let _fadingAudio: MediaElementTrack | null = null;

function cancelFade(): void {
  if (_fadeTimer) {
    clearInterval(_fadeTimer);
    _fadeTimer = null;
  }
  if (_fadingAudio) {
    // Fondu de sortie interrompu (son arrêté puis autre son lancé aussitôt) :
    // la piste est libérée comme à la fin du fondu. La piste courante, elle,
    // reste en place (stopSound et playSound la libèrent eux-mêmes).
    if (_fadingAudio !== STATE.currentAudio) _fadingAudio.dispose();
    _fadingAudio = null;
  }
}

function fadeAudio(
  audio: MediaElementTrack, from: number, to: number, ms: number, onDone: (() => void) | null,
): void {
  // Un seul fondu à la fois : celui en cours s'arrête là (sans son callback)
  cancelFade();

  if (from === to || ms <= 0) {
    audio.volume = Math.min(1, Math.max(0, to));
    onDone?.();
    return;
  }

  const steps = 20;
  const interval = ms / steps;
  const delta = (to - from) / steps;
  let current = from;

  const timer = setInterval(() => {
    current += delta;
    audio.volume = Math.min(1, Math.max(0, current));

    if ((delta < 0 && current <= to) || (delta > 0 && current >= to)) {
      clearInterval(timer);
      _fadeTimer = null;
      _fadingAudio = null;
      onDone?.();
    }
  }, interval);

  _fadeTimer = timer;
  _fadingAudio = audio;
}

// ================================================================
// PROGRESSION
// ================================================================

function startProgressLoop(
  audio: MediaElementTrack, item: AudioItem, startOffset: number, endOffset: number | null,
): void {
  if (STATE.progressRAF) cancelAnimationFrame(STATE.progressRAF);

  playbackEvents.emit({
    type: 'progress-start',
    item,
    playableDuration: getPlayableDuration(startOffset, endOffset, audio.duration),
  });

  function tick(): void {
    if (!STATE.currentAudio || !STATE.currentSoundItem) return;

    if (endOffset !== null && audio.currentTime >= endOffset) {
      stopSound(false);
      return;
    }

    playbackEvents.emit({ type: 'progress' });

    STATE.progressRAF = requestAnimationFrame(tick);
  }

  STATE.progressRAF = requestAnimationFrame(tick);
}

function stopProgressLoop(): void {
  if (STATE.progressRAF) {
    cancelAnimationFrame(STATE.progressRAF);
    STATE.progressRAF = null;
  }
}

// ================================================================
// STOP
// ================================================================

export function stopSound(fade = false): void {
  cancelFade();
  stopProgressLoop();

  const stoppedItem = STATE.currentSoundItem;
  STATE.currentSoundItem = null;

  STATE.isPaused = false;

  if (STATE.currentAudio) {
    if (fade) {
      const audioToFade = STATE.currentAudio;
      STATE.currentAudio = null;
      fadeAudio(audioToFade, audioToFade.volume, 0, 400, () => {
        audioToFade.dispose();
      });
    } else {
      STATE.currentAudio.dispose();
      STATE.currentAudio = null;
    }
  }

  playbackEvents.emit({ type: 'stop', item: stoppedItem });
}

export function emergencyStopAudio(): void {
  stopSound(true);
}

// ================================================================
// PLAY
// ================================================================

let _playRequestId = 0;

export async function playSound(item: AudioItem): Promise<void> {
  const src = item.file;
  if (!src) return;

  const requestId = ++_playRequestId;

  cancelFade();

  if (STATE.currentAudio) {
    STATE.currentAudio.dispose();
    STATE.currentAudio = null;
  }

  const { startOffset, endOffset } = getPlaybackRange(item);

  const audio = AudioEngineAPI.createTrack(src);
  audio.setPlaybackRange(startOffset, endOffset);
  audio.volume = 0;

  STATE.currentAudio = audio;
  STATE.currentSoundItem = item;
  STATE.isPaused = false;

  playbackEvents.emit({ type: 'play', item });

  audio.onended = () => {
    if (STATE.currentAudio === audio) {
      stopSound(false);
    }
  };

  try {
    await audio.load();

    if (_playRequestId !== requestId || STATE.currentAudio !== audio) return;

    await audio.play();

    if (_playRequestId !== requestId || STATE.currentAudio !== audio) {
      audio.dispose();
      return;
    }

    fadeAudio(audio, 0, STATE.audioVolume, 300, null);
    startProgressLoop(audio, item, startOffset, endOffset);
  } catch (err) {
    console.warn('Fichier introuvable ou illisible :', src, err);
    playbackEvents.emit({ type: 'missing', item });
    if (STATE.currentAudio === audio) {
      stopSound();
    }
  }
}

// ================================================================
// PAUSE / REPRISE, SEEK, VOLUME
// ================================================================

/** Bascule lecture / pause, avec un court fondu */
export function togglePlayPause(): void {
  if (!STATE.currentAudio || !STATE.currentSoundItem) return;

  if (STATE.isPaused) {
    // Resume avec fade in
    STATE.currentAudio.volume = 0;
    STATE.currentAudio.play().then(() => {
      // Relus après la reprise de lecture, comme dans la version d'origine
      const audio = STATE.currentAudio!;
      const item  = STATE.currentSoundItem!;
      STATE.isPaused = false;
      fadeAudio(audio, 0, STATE.audioVolume, 150, null);
      const { startOffset, endOffset } = getPlaybackRange(item);
      startProgressLoop(audio, item, startOffset, endOffset);
      playbackEvents.emit({ type: 'resume' });
    });
  } else {
    // Pause avec fade out
    stopProgressLoop();
    const audio = STATE.currentAudio;
    fadeAudio(audio, audio.volume, 0, 150, () => {
      audio.pause();
      STATE.isPaused = true;
      playbackEvents.emit({ type: 'pause' });
    });
  }
}

/** Déplace la lecture à `ratio` (0-1) de la plage jouée du son courant */
export function seekToRatio(ratio: number): void {
  const audio = STATE.currentAudio;
  const item  = STATE.currentSoundItem;
  if (!audio || !item) return;
  audio.currentTime = getSeekTime(item, audio.duration, ratio);
  playbackEvents.emit({ type: 'progress' });
}

/** Volume de lecture des sons (0-1) */
export function setAudioVolume(volume: number): void {
  STATE.audioVolume = volume;
  if (STATE.currentAudio) STATE.currentAudio.volume = STATE.audioVolume;
}
