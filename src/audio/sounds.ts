/* ================================================================
   sounds.ts — Sons des onglets sons (Animaux, Bruits) : chaque clic
   lance une nouvelle voix, qui se superpose à la musique et aux
   autres sons. Pas de fondu, pas d'effets, pas de pause.

   Le fichier est décodé une fois en AudioBuffer, au premier clic
   (lu par fetch, donc dans le cache hors ligne via le Service
   Worker), puis gardé en mémoire dans la limite d'un budget : au-
   delà, on oublie les sons joués il y a le plus longtemps. Chaque
   clic crée un AudioBufferSourceNode, branché sur la sortie des sons
   du moteur (après les effets, directement sur le limiteur).

   Au plus 8 voix à la fois : la 9e prend la place de la plus
   ancienne, coupée net (rampe de quelques millisecondes, sans
   claquement). Aucun accès au DOM : l'interface suit `soundEvents`.
================================================================ */

import type { AudioItem } from '../types.ts';
import { STATE } from '../state.svelte.ts';
import { createEmitter } from '../events.ts';
import { AudioEngineAPI } from './audio-engine.ts';
import { getPlaybackRange } from './timing.ts';

/** Nombre de voix simultanées au plus */
export const MAX_SOUND_VOICES = 8;
/** Mémoire gardée pour les sons décodés (un son décodé n'est plus compressé : ~0,35 Mo/s en stéréo) */
export const SOUND_BUFFER_BUDGET_BYTES = 50 * 1024 * 1024;
/** Durée de la rampe d'arrêt, en secondes : coupe net, sans claquement */
const STOP_RAMP_S = 0.008;

export type SoundEvent =
  /** Une voix démarre ; `duration` : durée jouée, en secondes */
  | { type: 'start'; item: AudioItem; duration: number }
  /** Une voix s'arrête (fin du son ou arrêt) ; `remaining` : voix de ce son encore en cours */
  | { type: 'end'; item: AudioItem; remaining: number }
  /** À chaque frame tant qu'une voix joue */
  | { type: 'progress' }
  /** Fichier introuvable ou illisible */
  | { type: 'missing'; item: AudioItem };

export const soundEvents = createEmitter<SoundEvent>();

interface Voice {
  item:      AudioItem;
  source:    AudioBufferSourceNode;
  gain:      GainNode;
  /** Instant du départ, en temps du contexte audio */
  startedAt: number;
  /** Durée jouée, en secondes */
  duration:  number;
}

/** Voix en cours, de la plus ancienne à la plus récente */
const voices: Voice[] = [];

// ================================================================
// SONS DÉCODÉS
// ================================================================

/** Sons décodés, du moins récemment joué au plus récent (ordre d'insertion de la Map) */
const buffers = new Map<string, AudioBuffer>();
let bufferBytes = 0;
/** Décodages en cours : deux clics rapides sur le même son ne décodent qu'une fois */
const pendingBuffers = new Map<string, Promise<AudioBuffer>>();

function bufferSize(buffer: AudioBuffer): number {
  return buffer.length * buffer.numberOfChannels * 4;
}

function rememberBuffer(file: string, buffer: AudioBuffer): void {
  buffers.set(file, buffer);
  bufferBytes += bufferSize(buffer);
  // Au-delà du budget, on oublie les sons joués il y a le plus longtemps (jamais le dernier)
  for (const [oldFile, oldBuffer] of buffers) {
    if (bufferBytes <= SOUND_BUFFER_BUDGET_BYTES || oldFile === file) break;
    buffers.delete(oldFile);
    bufferBytes -= bufferSize(oldBuffer);
  }
}

async function decodeFile(file: string, context: AudioContext): Promise<AudioBuffer> {
  const response = await fetch(file);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const data = await response.arrayBuffer();
  return context.decodeAudioData(data);
}

/** Son décodé : en mémoire, ou lu et décodé (une seule fois même si plusieurs clics l'attendent) */
function getBuffer(file: string, context: AudioContext): Promise<AudioBuffer> {
  const cached = buffers.get(file);
  if (cached) {
    // Joué à l'instant : passe en fin de liste, oublié en dernier
    buffers.delete(file);
    buffers.set(file, cached);
    return Promise.resolve(cached);
  }
  let pending = pendingBuffers.get(file);
  if (!pending) {
    pending = decodeFile(file, context)
      .then(buffer => {
        rememberBuffer(file, buffer);
        return buffer;
      })
      .finally(() => pendingBuffers.delete(file));
    pendingBuffers.set(file, pending);
  }
  return pending;
}

// ================================================================
// VOIX
// ================================================================

function countVoices(item: AudioItem): number {
  return voices.filter(voice => voice.item === item).length;
}

/** Retire une voix de la liste et prévient l'interface (une seule fois par voix) */
function releaseVoice(voice: Voice): void {
  const index = voices.indexOf(voice);
  if (index < 0) return;
  voices.splice(index, 1);
  STATE.soundVoices = voices.length;
  soundEvents.emit({ type: 'end', item: voice.item, remaining: countVoices(voice.item) });
}

/** Coupe une voix net, avec une rampe de quelques millisecondes pour éviter un claquement */
function stopVoice(voice: Voice, context: AudioContext): void {
  const now = context.currentTime;
  const gain = voice.gain.gain;
  gain.cancelScheduledValues(now);
  gain.setValueAtTime(gain.value, now);
  gain.linearRampToValueAtTime(0, now + STOP_RAMP_S);
  try { voice.source.stop(now + STOP_RAMP_S); } catch (_) { /* déjà arrêtée */ }
  releaseVoice(voice);
}

function startVoice(item: AudioItem, buffer: AudioBuffer, context: AudioContext, output: AudioNode): void {
  // Plus de place : la voix la plus ancienne laisse la sienne, pour que le nouveau son parte toujours
  while (voices.length >= MAX_SOUND_VOICES) stopVoice(voices[0], context);

  const { startOffset, endOffset } = getPlaybackRange(item);
  const start    = Math.min(Math.max(0, startOffset), buffer.duration);
  const end      = endOffset !== null ? Math.min(endOffset, buffer.duration) : buffer.duration;
  const duration = Math.max(0, end - start);

  const source = context.createBufferSource();
  source.buffer = buffer;
  const gain = context.createGain();
  source.connect(gain);
  gain.connect(output);

  const voice: Voice = { item, source, gain, startedAt: context.currentTime, duration };
  source.onended = () => {
    releaseVoice(voice);
    try { source.disconnect(); gain.disconnect(); } catch (_) { /* déjà débranchée */ }
  };
  source.start(0, start, duration);

  voices.push(voice);
  STATE.soundVoices = voices.length;
  soundEvents.emit({ type: 'start', item, duration });
  startProgressLoop();
}

// ================================================================
// PROGRESSION
// ================================================================

let progressRAF: number | null = null;

function startProgressLoop(): void {
  if (progressRAF !== null) return;
  const tick = () => {
    if (voices.length === 0) {
      progressRAF = null;
      return;
    }
    soundEvents.emit({ type: 'progress' });
    progressRAF = requestAnimationFrame(tick);
  };
  progressRAF = requestAnimationFrame(tick);
}

/** Progression (0-1) de la voix la plus récente d'un son, null s'il ne joue pas */
export function getSoundProgress(item: AudioItem): number | null {
  for (let i = voices.length - 1; i >= 0; i--) {
    const voice = voices[i];
    if (voice.item !== item) continue;
    if (voice.duration <= 0) return 1;
    const { context } = AudioEngineAPI.getSoundsOutput();
    return Math.min(1, Math.max(0, (context.currentTime - voice.startedAt) / voice.duration));
  }
  return null;
}

// ================================================================
// API
// ================================================================

/** Arrêts demandés : un son encore en décodage au moment d'un arrêt ne part pas */
let stopGeneration = 0;

/**
 * Lance un son par-dessus tout le reste (musique et autres sons). Un son déjà en
 * cours n'est pas coupé : le nouveau clic le relance depuis le début, par-dessus.
 */
export async function playOneShot(item: AudioItem): Promise<void> {
  if (!item.file) return;
  const generation = stopGeneration;
  // Contexte audio réveillé tout de suite, pendant le geste de l'utilisateur
  const { context, input } = AudioEngineAPI.getSoundsOutput();
  void AudioEngineAPI.resume().catch(() => {});

  let buffer: AudioBuffer;
  try {
    buffer = await getBuffer(item.file, context);
  } catch (err) {
    console.warn('Fichier introuvable ou illisible :', item.file, err);
    soundEvents.emit({ type: 'missing', item });
    return;
  }
  if (generation !== stopGeneration) return;
  startVoice(item, buffer, context, input);
}

/** Coupe net tous les sons en cours (la musique continue), et ceux encore en décodage */
export function stopAllSounds(): void {
  stopGeneration++;
  if (voices.length === 0) return;
  const { context } = AudioEngineAPI.getSoundsOutput();
  for (const voice of [...voices]) stopVoice(voice, context);
}

/** Volume des sons (0-1), commun aux onglets sons */
export function setSoundVolume(volume: number): void {
  STATE.soundVolume = volume;
  AudioEngineAPI.setSoundsVolume(volume);
}
