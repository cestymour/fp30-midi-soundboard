/* ================================================================
   audio.ts - Moteur audio Web Audio API (MP3 / OGG / WAV)
================================================================ */

import { STATE } from '../state.ts';
import { updateSeekUI, updateTransportUI } from '../app.ts';
import { syncAudioFXPopupFromEngine } from '../fx/audio-fx-ui.ts';

// ================================================================
// UTILITAIRES
// ================================================================

export function syncAudioSliders(pct: number): void {
  document.querySelectorAll<HTMLInputElement>('.audio-vol').forEach(s => {
    if (parseInt(s.value, 10) === pct) return;
    s.value = String(pct);
    s.style.setProperty('--vol-pct', pct + '%');
    s.closest('.panel-controls')!.querySelector('.vol-value')!.textContent = pct + '%';
  });
}

// ================================================================
// MOTEUR WEB AUDIO
// ================================================================

/** Réglages du moteur audio (volume + effets) */
export interface AudioEngineState {
  volume: number;
  bassGain: number;
  midGain: number;
  trebleGain: number;
  lowPassFrequency: number;
  highPassFrequency: number;
  playbackRate: number;
  distortionAmount: number;
  compressorThreshold: number;
  compressorKnee: number;
  compressorRatio: number;
  compressorAttack: number;
  compressorRelease: number;
  compressorMakeup: number;
  delayTime: number;
  delayFeedback: number;
  delayMix: number;
  reverbMix: number;
}

type EffectSettings = Omit<AudioEngineState, 'volume'>;

class AudioEngine {
  defaultState: AudioEngineState;
  state: AudioEngineState;
  context: AudioContext | null;
  tracks: Set<MediaElementTrack>;
  canUseMediaElementSource: boolean;

  // Nœuds du graphe Web Audio : créés par ensureContext(), au premier son joué
  masterGain!: GainNode;
  bassFilter!: BiquadFilterNode;
  midFilter!: BiquadFilterNode;
  trebleFilter!: BiquadFilterNode;
  lowPass!: BiquadFilterNode;
  highPass!: BiquadFilterNode;
  compressor!: DynamicsCompressorNode;
  compressorMakeup!: GainNode;
  distortion!: WaveShaperNode;
  distortionDryGain!: GainNode;
  distortionWetGain!: GainNode;
  postEffectsInput!: GainNode;
  delayNode!: DelayNode;
  delayFeedback!: GainNode;
  delayWet!: GainNode;
  reverbPreDelay!: DelayNode;
  reverb!: ConvolverNode;
  reverbWet!: GainNode;
  dryGain!: GainNode;

  constructor() {
    this.defaultState = {
      volume: 1,
      bassGain: 0,
      midGain: 0,
      trebleGain: 0,
      // Aligné sur la popup FX : “plein pot” = 20 kHz (transparent pour l’oreille) ; curseur 20 kHz = neutre
      lowPassFrequency: 20000,
      // 0 = pas de filtrage haut (équivalent “large bande”)
      highPassFrequency: 0,
      playbackRate: 1,
      distortionAmount: 0,
      compressorThreshold: -24,
      compressorKnee: 30,
      compressorRatio: 1,
      compressorAttack: 0.003,
      compressorRelease: 0.25,
      compressorMakeup: 1,
      delayTime: 0.25,
      delayFeedback: 0.25,
      delayMix: 0,
      reverbMix: 0,
    };

    this.context = null;
    this.tracks = new Set();

    this.state = { ...this.defaultState };

    this.canUseMediaElementSource = window.location.protocol !== 'file:';
  }

  ensureContext(): AudioContext {
    if (this.context) return this.context;

    // webkitAudioContext : anciens navigateurs WebKit, absent des types DOM
    const AudioCtx: typeof AudioContext | undefined =
      window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) throw new Error('Web Audio API non supportee.');

    const ctx = new AudioCtx();
    this.context = ctx;

    this.masterGain = ctx.createGain();
    this.bassFilter = ctx.createBiquadFilter();
    this.midFilter = ctx.createBiquadFilter();
    this.trebleFilter = ctx.createBiquadFilter();
    this.lowPass = ctx.createBiquadFilter();
    this.highPass = ctx.createBiquadFilter();
    this.compressor = ctx.createDynamicsCompressor();
    this.compressorMakeup = ctx.createGain();
    this.distortion = ctx.createWaveShaper();
    this.distortionDryGain = ctx.createGain();
    this.distortionWetGain = ctx.createGain();
    this.postEffectsInput = ctx.createGain();
    this.delayNode = ctx.createDelay(5);
    this.delayFeedback = ctx.createGain();
    this.delayWet = ctx.createGain();
    this.reverbPreDelay = ctx.createDelay(1);
    this.reverb = ctx.createConvolver();
    this.reverbWet = ctx.createGain();
    this.dryGain = ctx.createGain();

    this.bassFilter.type = 'lowshelf';
    this.bassFilter.frequency.value = 200;
    this.midFilter.type = 'peaking';
    this.midFilter.frequency.value = 1000;
    this.midFilter.Q.value = 1;
    this.trebleFilter.type = 'highshelf';
    this.trebleFilter.frequency.value = 3000;
    this.lowPass.type = 'lowpass';
    this.highPass.type = 'highpass';
    this.distortion.oversample = '4x';

    this.bassFilter.connect(this.midFilter);
    this.midFilter.connect(this.trebleFilter);
    this.trebleFilter.connect(this.lowPass);
    this.lowPass.connect(this.highPass);
    this.highPass.connect(this.compressor);
    this.compressor.connect(this.compressorMakeup);
    this.compressorMakeup.connect(this.distortionDryGain);
    this.compressorMakeup.connect(this.distortion);
    this.distortion.connect(this.distortionWetGain);

    this.distortionDryGain.connect(this.postEffectsInput);
    this.distortionWetGain.connect(this.postEffectsInput);

    this.postEffectsInput.connect(this.dryGain);
    this.dryGain.connect(this.masterGain);

    this.postEffectsInput.connect(this.delayNode);
    this.delayNode.connect(this.delayFeedback);
    this.delayFeedback.connect(this.delayNode);
    this.delayNode.connect(this.delayWet);
    this.delayWet.connect(this.masterGain);

    this.postEffectsInput.connect(this.reverbPreDelay);
    this.reverbPreDelay.connect(this.reverb);
    this.reverb.connect(this.reverbWet);
    this.reverbWet.connect(this.masterGain);

    this.masterGain.connect(ctx.destination);
    this.reverb.buffer = this.createImpulseResponse(ctx, 4.8, 3.8);
    this.reverbPreDelay.delayTime.value = 0.035;

    this.applyState();
    return ctx;
  }

  async resume(): Promise<void> {
    const ctx = this.ensureContext();
    if (ctx.state === 'suspended') {
      await ctx.resume();
    }
  }

  createImpulseResponse(ctx: AudioContext, duration: number, decay: number): AudioBuffer {
    const sampleCount = Math.max(1, Math.floor(ctx.sampleRate * duration));
    const buffer = ctx.createBuffer(2, sampleCount, ctx.sampleRate);

    for (let channel = 0; channel < buffer.numberOfChannels; channel++) {
      const data = buffer.getChannelData(channel);
      for (let i = 0; i < sampleCount; i++) {
        const t = i / sampleCount;
        data[i] = (Math.random() * 2 - 1) * Math.pow(1 - t, decay);
      }
    }

    return buffer;
  }

  makeDistortionCurve(amount: number): Float32Array<ArrayBuffer> {
    const samples = 44100;
    const curve = new Float32Array(samples);
    const normalizedAmount = Math.max(0, Math.min(100, amount)) / 100;
    const drive = 1 + normalizedAmount * 12;
    const normalizer = Math.tanh(drive);

    for (let i = 0; i < samples; i++) {
      const x = (i * 2) / samples - 1;
      curve[i] = normalizedAmount === 0
        ? x
        : Math.tanh(drive * x) / normalizer;
    }

    return curve;
  }

  getDistortionMix(amount: number): number {
    const normalizedAmount = Math.max(0, Math.min(100, amount)) / 100;
    if (normalizedAmount <= 0) return 0;
    return Math.min(0.68, 0.08 + normalizedAmount * 0.6);
  }

  getReverbWetGain(mix: number): number {
    const normalizedMix = Math.max(0, Math.min(1, mix));
    if (normalizedMix === 0) return 0;
    // Courbe un peu plus douce en haut pour limiter grésillements / surcharge à 100 %
    return Math.pow(normalizedMix, 0.78) * 1.38;
  }

  applyState(): void {
    if (!this.context) return;

    this.masterGain.gain.value = this.state.volume;
    this.bassFilter.gain.value = this.state.bassGain;
    this.midFilter.gain.value = this.state.midGain;
    this.trebleFilter.gain.value = this.state.trebleGain;
    this.lowPass.frequency.value = Math.max(10, this.state.lowPassFrequency);
    this.highPass.frequency.value = Math.max(0, this.state.highPassFrequency);
    this.compressor.threshold.value = this.state.compressorThreshold;
    this.compressor.knee.value = this.state.compressorKnee;
    this.compressor.ratio.value = this.state.compressorRatio;
    this.compressor.attack.value = this.state.compressorAttack;
    this.compressor.release.value = this.state.compressorRelease;
    this.compressorMakeup.gain.value = this.state.compressorMakeup;
    this.distortion.curve = this.makeDistortionCurve(this.state.distortionAmount);
    this.distortionDryGain.gain.value = 1 - this.getDistortionMix(this.state.distortionAmount);
    this.distortionWetGain.gain.value = this.getDistortionMix(this.state.distortionAmount);
    this.delayNode.delayTime.value = Math.max(0, this.state.delayTime);
    this.delayFeedback.gain.value = Math.max(0, Math.min(0.95, this.state.delayFeedback));
    this.delayWet.gain.value = Math.max(0, Math.min(1, this.state.delayMix));
    this.reverbWet.gain.value = this.getReverbWetGain(this.state.reverbMix);
    this.dryGain.gain.value = 1;
  }

  setMasterVolume(value: number): void {
    this.state.volume = Math.max(0, Math.min(1, value));
    if (this.canUseMediaElementSource && this.masterGain && this.context) {
      this.masterGain.gain.cancelScheduledValues(this.context.currentTime);
      this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, this.context.currentTime);
      this.masterGain.gain.linearRampToValueAtTime(this.state.volume, this.context.currentTime + 0.02);
    }
    this.tracks.forEach(track => {
      track.audio.volume = this.state.volume;
    });
  }

  setLowPassFrequency(value: number): void {
    // Plage alignée sur l’UI (min 10 Hz côté Web Audio, max 20 kHz dans la popup)
    const v = Math.max(10, Math.min(20000, value));
    this.state.lowPassFrequency = v;
    if (this.lowPass) this.lowPass.frequency.value = v;
  }

  setHighPassFrequency(value: number): void {
    this.state.highPassFrequency = value;
    if (this.highPass) this.highPass.frequency.value = Math.max(0, value);
  }

  setEQ({ bass, mid, treble }: { bass?: number; mid?: number; treble?: number } = {}): void {
    if (typeof bass === 'number') {
      this.state.bassGain = bass;
      if (this.bassFilter) this.bassFilter.gain.value = bass;
    }
    if (typeof mid === 'number') {
      this.state.midGain = mid;
      if (this.midFilter) this.midFilter.gain.value = mid;
    }
    if (typeof treble === 'number') {
      this.state.trebleGain = treble;
      if (this.trebleFilter) this.trebleFilter.gain.value = treble;
    }
  }

  setBassGain(value: number): void {
    this.setEQ({ bass: value });
  }

  setMidGain(value: number): void {
    this.setEQ({ mid: value });
  }

  setTrebleGain(value: number): void {
    this.setEQ({ treble: value });
  }

  setPlaybackRate(value: number): void {
    this.state.playbackRate = Math.max(0.25, Math.min(4, value));
    this.tracks.forEach(track => {
      track.playbackRate = this.state.playbackRate;
    });
  }

  setDistortionAmount(value: number): void {
    this.state.distortionAmount = Math.max(0, value);
    if (this.distortion) {
      this.distortion.curve = this.makeDistortionCurve(this.state.distortionAmount);
      this.distortionDryGain.gain.value = 1 - this.getDistortionMix(this.state.distortionAmount);
      this.distortionWetGain.gain.value = this.getDistortionMix(this.state.distortionAmount);
    }
  }

  setCompressor({ threshold, knee, ratio, attack, release }: {
    threshold?: number; knee?: number; ratio?: number; attack?: number; release?: number;
  } = {}): void {
    if (typeof ratio === 'number') {
      this.state.compressorRatio = ratio;
      const normalizedRatio = Math.max(0, Math.min(1, (ratio - 1) / 19));
      this.state.compressorThreshold = -12 - normalizedRatio * 24;
      this.state.compressorKnee = 18 + normalizedRatio * 12;
      this.state.compressorAttack = 0.003 + normalizedRatio * 0.009;
      this.state.compressorRelease = 0.16 + normalizedRatio * 0.24;
      this.state.compressorMakeup = 1 + normalizedRatio * 0.75;
    }
    if (typeof threshold === 'number') {
      this.state.compressorThreshold = threshold;
      if (this.compressor) this.compressor.threshold.value = threshold;
    }
    if (typeof knee === 'number') {
      this.state.compressorKnee = knee;
      if (this.compressor) this.compressor.knee.value = knee;
    }
    if (typeof ratio === 'number') {
      if (this.compressor) this.compressor.ratio.value = ratio;
    }
    if (typeof attack === 'number') {
      this.state.compressorAttack = attack;
      if (this.compressor) this.compressor.attack.value = attack;
    }
    if (typeof release === 'number') {
      this.state.compressorRelease = release;
      if (this.compressor) this.compressor.release.value = release;
    }
    if (this.compressor) {
      this.compressor.threshold.value = this.state.compressorThreshold;
      this.compressor.knee.value = this.state.compressorKnee;
      this.compressor.ratio.value = this.state.compressorRatio;
      this.compressor.attack.value = this.state.compressorAttack;
      this.compressor.release.value = this.state.compressorRelease;
    }
    if (this.compressorMakeup) {
      this.compressorMakeup.gain.value = this.state.compressorMakeup;
    }
  }

  setDelay({ time, feedback, mix }: { time?: number; feedback?: number; mix?: number } = {}): void {
    if (typeof time === 'number') {
      this.state.delayTime = time;
      if (this.delayNode) this.delayNode.delayTime.value = Math.max(0, time);
    }
    if (typeof feedback === 'number') {
      this.state.delayFeedback = feedback;
      if (this.delayFeedback) this.delayFeedback.gain.value = Math.max(0, Math.min(0.95, feedback));
    }
    if (typeof mix === 'number') {
      this.state.delayMix = mix;
      if (this.delayWet) this.delayWet.gain.value = Math.max(0, Math.min(1, mix));
    }
  }

  setReverbMix(value: number): void {
    this.state.reverbMix = value;
    if (this.reverbWet) this.reverbWet.gain.value = this.getReverbWetGain(value);
  }

  getCurrentSettings(): AudioEngineState {
    return { ...this.state };
  }

  getDefaultSettings(): AudioEngineState {
    return { ...this.defaultState };
  }

  getEffectSettings(): EffectSettings {
    const { volume, ...effectSettings } = this.state;
    return { ...effectSettings };
  }

  hasActiveEffects(): boolean {
    const effectSettings = this.getEffectSettings();
    const { volume, ...defaultEffects } = this.defaultState;
    return (Object.keys(defaultEffects) as (keyof EffectSettings)[])
      .some(key => Math.abs(effectSettings[key] - defaultEffects[key]) > 0.0001);
  }

  resetSettings(): void {
    this.state = { ...this.defaultState };
    if (this.context) {
      this.applyState();
    }
    this.tracks.forEach(track => {
      track.audio.volume = this.state.volume;
      track.playbackRate = this.state.playbackRate;
    });
  }

  resetEffects(): void {
    const currentVolume = this.state.volume;
    this.state = { ...this.defaultState, volume: currentVolume };
    if (this.context) {
      this.applyState();
    }
    this.tracks.forEach(track => {
      track.audio.volume = currentVolume;
      track.playbackRate = this.state.playbackRate;
    });
  }

  restoreEffectSettings(settings: Partial<AudioEngineState> | null | undefined): void {
    if (!settings) return;
    this.setEQ({
      bass: settings.bassGain ?? this.defaultState.bassGain,
      mid: settings.midGain ?? this.defaultState.midGain,
      treble: settings.trebleGain ?? this.defaultState.trebleGain,
    });
    this.setLowPassFrequency(settings.lowPassFrequency ?? this.defaultState.lowPassFrequency);
    this.setHighPassFrequency(settings.highPassFrequency ?? this.defaultState.highPassFrequency);
    this.setPlaybackRate(settings.playbackRate ?? this.defaultState.playbackRate);
    this.setDistortionAmount(settings.distortionAmount ?? this.defaultState.distortionAmount);
    this.setCompressor({
      threshold: settings.compressorThreshold ?? this.defaultState.compressorThreshold,
      knee: settings.compressorKnee ?? this.defaultState.compressorKnee,
      ratio: settings.compressorRatio ?? this.defaultState.compressorRatio,
      attack: settings.compressorAttack ?? this.defaultState.compressorAttack,
      release: settings.compressorRelease ?? this.defaultState.compressorRelease,
    });
    this.state.compressorMakeup = settings.compressorMakeup ?? this.defaultState.compressorMakeup;
    if (this.compressorMakeup) {
      this.compressorMakeup.gain.value = this.state.compressorMakeup;
    }
    this.setDelay({
      time: settings.delayTime ?? this.defaultState.delayTime,
      feedback: settings.delayFeedback ?? this.defaultState.delayFeedback,
      mix: settings.delayMix ?? this.defaultState.delayMix,
    });
    this.setReverbMix(settings.reverbMix ?? this.defaultState.reverbMix);
  }

  createTrack(src: string): MediaElementTrack {
    this.ensureContext();
    const track = new MediaElementTrack(this, src);
    this.tracks.add(track);
    return track;
  }

  unregisterTrack(track: MediaElementTrack): void {
    this.tracks.delete(track);
  }
}

export class MediaElementTrack {
  engine: AudioEngine;
  src: string;
  audio: HTMLAudioElement;
  sourceNode: MediaElementAudioSourceNode | null;
  outputGain: GainNode | null;
  /** Fin de lecture en secondes (null : jusqu'à la fin du fichier) */
  segmentEnd: number | null;
  onended: (() => void) | null;
  onerror: ((error: Error) => void) | null;
  _loadPromise: Promise<MediaElementTrack> | null;

  constructor(engine: AudioEngine, src: string) {
    this.engine = engine;
    this.src = src;
    this.audio = new Audio(src);
    this.audio.preload = 'auto';
    this.sourceNode = null;
    this.outputGain = null;
    this.segmentEnd = null;
    this.onended = null;
    this.onerror = null;
    this._loadPromise = null;

    this.handleEnded = this.handleEnded.bind(this);
    this.handleError = this.handleError.bind(this);

    this.audio.addEventListener('ended', this.handleEnded);
    this.audio.addEventListener('error', this.handleError);
  }

  get duration(): number {
    const rawDuration = this.audio.duration;
    if (!isFinite(rawDuration)) return NaN;
    return this.segmentEnd !== null ? Math.min(this.segmentEnd, rawDuration) : rawDuration;
  }

  get currentTime(): number {
    return this.audio.currentTime || 0;
  }

  set currentTime(value: number) {
    const limit = this.duration;
    const nextTime = Math.max(0, Math.min(value || 0, isFinite(limit) ? limit : Infinity));
    this.audio.currentTime = nextTime;
  }

  get volume(): number {
    if (this.engine.canUseMediaElementSource) {
      return this.engine.getCurrentSettings().volume;
    }
    return this.audio.volume;
  }

  set volume(value: number) {
    const clamped = Math.max(0, Math.min(1, value));
    if (this.engine.canUseMediaElementSource) {
      this.engine.setMasterVolume(clamped);
    }
    this.audio.volume = clamped;
  }

  get playbackRate(): number {
    return this.audio.playbackRate;
  }

  set playbackRate(value: number) {
    const clamped = Math.max(0.25, Math.min(4, value));
    this.audio.playbackRate = clamped;
    this.audio.defaultPlaybackRate = clamped;
  }

  async load(): Promise<MediaElementTrack> {
    this.connectNodes();
    this.playbackRate = this.engine.state.playbackRate;

    if (this._loadPromise) return this._loadPromise;
    if (this.audio.readyState >= 1) return this;

    this._loadPromise = new Promise((resolve, reject) => {
      const cleanup = () => {
        this.audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
        this.audio.removeEventListener('canplaythrough', handleCanPlayThrough);
        this.audio.removeEventListener('error', handleError);
      };

      const handleLoadedMetadata = () => {
        if (this.segmentEnd === null && isFinite(this.audio.duration)) {
          this.segmentEnd = this.audio.duration;
        }
      };

      const handleCanPlayThrough = () => {
        cleanup();
        if (this.segmentEnd === null && isFinite(this.audio.duration)) {
          this.segmentEnd = this.audio.duration;
        }
        this._loadPromise = null;
        resolve(this);
      };

      const handleError = () => {
        cleanup();
        this._loadPromise = null;
        reject(new Error(`Impossible de charger ${this.src}`));
      };

      this.audio.addEventListener('loadedmetadata', handleLoadedMetadata);
      this.audio.addEventListener('canplaythrough', handleCanPlayThrough);
      this.audio.addEventListener('error', handleError, { once: true });
      this.audio.load();
    });

    return this;
  }

  setPlaybackRange(startOffset: number, endOffset: number | null): void {
    this.audio.currentTime = Math.max(0, startOffset || 0);
    this.segmentEnd = endOffset !== null && isFinite(endOffset)
      ? Math.max(this.audio.currentTime, endOffset)
      : null;
  }

  async play(): Promise<MediaElementTrack> {
    await this.engine.resume();
    await this.load();
    if (isFinite(this.duration) && this.audio.currentTime >= this.duration) {
      this.audio.currentTime = 0;
    }
    await this.audio.play();
    return this;
  }

  pause(): void {
    this.audio.pause();
  }

  stop(): void {
    this.audio.pause();
    this.audio.currentTime = 0;
  }

  dispose(): void {
    this.stop();
    this.audio.removeEventListener('ended', this.handleEnded);
    this.audio.removeEventListener('error', this.handleError);
    if (this.outputGain) {
      try { this.outputGain.disconnect(); } catch (_) {}
      this.outputGain = null;
    }
    if (this.sourceNode) {
      try { this.sourceNode.disconnect(); } catch (_) {}
      this.sourceNode = null;
    }
    this.engine.unregisterTrack(this);
  }

  connectNodes(): void {
    if (!this.engine.canUseMediaElementSource || this.sourceNode) return;

    // load() est toujours appelé après createTrack(), qui crée le contexte
    const context = this.engine.context!;
    this.sourceNode = context.createMediaElementSource(this.audio);
    this.outputGain = context.createGain();
    this.sourceNode.connect(this.outputGain);
    this.outputGain.connect(this.engine.bassFilter);
  }

  handleEnded(): void {
    this.onended?.();
  }

  handleError(): void {
    this.onerror?.(new Error(`Impossible de charger ${this.src}`));
  }
}

const AUDIO_ENGINE = new AudioEngine();

export const AudioEngineAPI = {
  init: () => AUDIO_ENGINE.ensureContext(),
  resume: () => AUDIO_ENGINE.resume(),
  load: (src: string) => AUDIO_ENGINE.createTrack(src).load(),
  createTrack: (src: string) => AUDIO_ENGINE.createTrack(src),
  setMasterVolume: (value: number) => AUDIO_ENGINE.setMasterVolume(value),
  setBassGain: (value: number) => AUDIO_ENGINE.setBassGain(value),
  setMidGain: (value: number) => AUDIO_ENGINE.setMidGain(value),
  setTrebleGain: (value: number) => AUDIO_ENGINE.setTrebleGain(value),
  setLowPassFrequency: (value: number) => AUDIO_ENGINE.setLowPassFrequency(value),
  setHighPassFrequency: (value: number) => AUDIO_ENGINE.setHighPassFrequency(value),
  setEQ: (options: Parameters<AudioEngine['setEQ']>[0]) => AUDIO_ENGINE.setEQ(options),
  setPlaybackRate: (value: number) => AUDIO_ENGINE.setPlaybackRate(value),
  setDistortionAmount: (value: number) => AUDIO_ENGINE.setDistortionAmount(value),
  setCompressor: (options: Parameters<AudioEngine['setCompressor']>[0]) => AUDIO_ENGINE.setCompressor(options),
  setDelay: (options: Parameters<AudioEngine['setDelay']>[0]) => AUDIO_ENGINE.setDelay(options),
  setReverbMix: (value: number) => AUDIO_ENGINE.setReverbMix(value),
  getCurrentSettings: () => AUDIO_ENGINE.getCurrentSettings(),
  getDefaultSettings: () => AUDIO_ENGINE.getDefaultSettings(),
  getEffectSettings: () => AUDIO_ENGINE.getEffectSettings(),
  hasActiveEffects: () => AUDIO_ENGINE.hasActiveEffects(),
  resetSettings: () => AUDIO_ENGINE.resetSettings(),
  resetEffects: () => AUDIO_ENGINE.resetEffects(),
  restoreEffectSettings: (settings: Partial<AudioEngineState> | null | undefined) => AUDIO_ENGINE.restoreEffectSettings(settings),
};

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
    _fadingAudio.pause();
    _fadingAudio.currentTime = 0;
    _fadingAudio = null;
  }
}

export function fadeAudio(
  audio: MediaElementTrack, from: number, to: number, ms: number, onDone: (() => void) | null,
): ReturnType<typeof setInterval> | null {
  if (from === to || ms <= 0) {
    audio.volume = Math.min(1, Math.max(0, to));
    onDone?.();
    return null;
  }

  const steps = 20;
  const interval = ms / steps;
  const delta = (to - from) / steps;
  let current = from;

  _fadeTimer = setInterval(() => {
    current += delta;
    audio.volume = Math.min(1, Math.max(0, current));

    if ((delta < 0 && current <= to) || (delta > 0 && current >= to)) {
      clearInterval(_fadeTimer ?? undefined);
      _fadeTimer = null;
      _fadingAudio = null;
      onDone?.();
    }
  }, interval);

  _fadingAudio = audio;
  return _fadeTimer;
}

// ================================================================
// PROGRESSION
// ================================================================

export function startProgressLoop(
  audio: MediaElementTrack, btn: HTMLButtonElement, startOffset: number, endOffset: number | null,
): void {
  if (STATE.progressRAF) cancelAnimationFrame(STATE.progressRAF);

  const dur = audio.duration;
  const effectiveEnd = endOffset !== null ? endOffset : (dur && isFinite(dur) ? dur : null);
  const playableDuration = effectiveEnd !== null ? effectiveEnd - startOffset : null;

  if (playableDuration !== null) {
    if (playableDuration < 3)       btn.style.setProperty('--progress-transition', '0.05s');
    else if (playableDuration < 10) btn.style.setProperty('--progress-transition', '0.15s');
    else                            btn.style.setProperty('--progress-transition', '0.30s');
  }

  function tick(): void {
    if (!STATE.currentAudio || !STATE.currentSoundBtn) return;

    if (endOffset !== null && audio.currentTime >= endOffset) {
      stopSound(false);
      return;
    }
    
    // Appel de la fonction légère de mise à jour de l'UI
    updateSeekUI();

    STATE.progressRAF = requestAnimationFrame(tick);
  }

  STATE.progressRAF = requestAnimationFrame(tick);
}

export function stopProgressLoop(): void {
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

  if (STATE.currentSoundBtn) {
    STATE.currentSoundBtn.classList.remove('playing', 'paused');
    STATE.currentSoundBtn = null;
  }

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

  // Mise à jour de l'UI lourde après avoir tout arrêté
  updateTransportUI();
  if (STATE.audioFxPopupOpen) syncAudioFXPopupFromEngine();
}

export function emergencyStopAudio(): void {
  stopSound(true);
}

// ================================================================
// PLAY
// ================================================================

let _playRequestId = 0;

export async function playSound(btn: HTMLButtonElement): Promise<void> {
  const src = btn.dataset.audio;
  if (!src) return;

  const requestId = ++_playRequestId;

  cancelFade();

  if (STATE.currentAudio) {
    STATE.currentAudio.dispose();
    STATE.currentAudio = null;
  }

  const startOffset = parseFloat(btn.dataset.start || '0') || 0;
  const endRaw = btn.dataset.end;
  const endOffset = endRaw ? parseFloat(endRaw) : null;

  const audio = AUDIO_ENGINE.createTrack(src);
  audio.setPlaybackRange(startOffset, endOffset);
  audio.volume = 0;

  STATE.currentAudio = audio;
  STATE.currentSoundBtn = btn;
  STATE.isPaused = false;

  btn.classList.remove('paused', 'missing');
  btn.classList.add('playing');

  // Appel de l'UI "lourde" une seule fois au lancement
  updateTransportUI();
  if (STATE.audioFxPopupOpen) syncAudioFXPopupFromEngine();

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
    startProgressLoop(audio, btn, startOffset, endOffset);
  } catch (err) {
    console.warn('Fichier introuvable ou illisible :', src, err);
    btn.classList.add('missing');
    if (STATE.currentAudio === audio) {
      stopSound();
    }
  }
}
