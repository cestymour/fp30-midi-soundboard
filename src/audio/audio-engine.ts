/* ================================================================
   audio-engine.ts - Moteur audio Web Audio API (MP3 / OGG / WAV)
   Un seul graphe : EQ → filtres → compresseur → distorsion →
   delay / reverb → master → limiteur. Chaque musique est une
   MediaElementTrack branchée en entrée du graphe. Les sons (onglets
   sons, audio/sounds.ts) passent par une sortie à part, `soundsBus`,
   branchée directement sur le limiteur : ni effets ni volume des
   musiques. La musique de transition (audio/transition.ts) est une
   piste comme les autres, mais branchée sur `transitionBus`, lui
   aussi directement sur le limiteur, sans les effets des musiques ;
   elle a sa propre petite chaîne d'effets, coupée par défaut (bouton
   « Clarté Studio » de sa popup). Aucun accès au DOM.
================================================================ */

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

/**
 * Sortie d'une piste :
 * - `effects` : musiques des onglets, à travers les effets et le volume des musiques ;
 * - `transition` : musique de transition, sans effets (ni vitesse), avec son propre volume.
 */
export type TrackRoute = 'effects' | 'transition';

/**
 * Effets de la musique de transition (préréglage « Clarté Studio » des effets audio) :
 * égaliseur en dB, filtres en Hz, réverbération de 0 à 1. Null : sans effets.
 */
export interface TransitionEffects {
  bass: number;
  mid: number;
  treble: number;
  lowPass: number;
  highPass: number;
  reverb: number;
}

/** Limiteur de sortie : au-dessus de −2 dBFS, le niveau ne monte plus que de 1 dB pour 20 */
const LIMITER_THRESHOLD_DB = -2;
const LIMITER_RATIO        = 20;

/**
 * Gain qui annule le gain de compensation automatique du compresseur Web Audio
 * (« makeup gain » de la norme : (1 / gain à 0 dBFS)^0,6). Sans lui, tout le son
 * serait remonté d'environ 1 dB. Avec lui, sous le seuil, rien ne change.
 * Mesuré dans Chromium (OfflineAudioContext, sinus) : −30 dB en entrée → −30 dB
 * en sortie ; +20 dB en entrée → −0,6 dB en sortie.
 */
export function limiterTrimGain(thresholdDb: number, ratio: number): number {
  // Genou nul : à 0 dBFS en entrée, la sortie vaut seuil + (0 − seuil) / ratio
  const fullRangeGainDb = thresholdDb * (1 - 1 / ratio);
  return Math.pow(10, (fullRangeGainDb * 0.6) / 20);
}

class AudioEngine {
  defaultState: AudioEngineState;
  state: AudioEngineState;
  context: AudioContext | null;
  tracks: Set<MediaElementTrack>;
  canUseMediaElementSource: boolean;
  /** Volume des sons (0-1), gardé même avant la création du contexte */
  soundsVolume: number;
  /** Volume de la musique de transition (0-1), gardé même avant la création du contexte */
  transitionVolume: number;

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
  limiter!: DynamicsCompressorNode;
  limiterTrim!: GainNode;
  /** Entrée des sons des onglets sons : après les effets, directement sur le limiteur */
  soundsBus!: GainNode;
  /** Entrée de la musique de transition : sans effets, directement sur le limiteur */
  transitionBus!: GainNode;
  /** Sortie directe de la transition (1 sans effets, 0 avec) */
  transitionDry!: GainNode;
  /** Chaîne d'effets de la transition, à part de celle des musiques (1 avec effets, 0 sans) */
  transitionFxOut!: GainNode;
  /**
   * Sortie de la transition, après ses effets : ses fondus agissent ici, comme ceux des musiques
   * sur `masterGain`, pour qu'un arrêt coupe aussi la queue de réverbération
   */
  transitionOut!: GainNode;
  transitionBass!: BiquadFilterNode;
  transitionMid!: BiquadFilterNode;
  transitionTreble!: BiquadFilterNode;
  transitionLowPass!: BiquadFilterNode;
  transitionHighPass!: BiquadFilterNode;
  transitionReverb!: ConvolverNode;
  transitionReverbWet!: GainNode;
  /** Effets de la transition, gardés même avant la création du contexte */
  transitionEffects: TransitionEffects | null = null;

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
    this.soundsVolume = 1;
    this.transitionVolume = 1;

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

    // Limiteur en sortie : réverbération, delay et égaliseur s'ajoutent au son, et au-delà
    // de 0 dBFS la sortie écrêterait (grésillement, bug n° 21)
    this.limiter = ctx.createDynamicsCompressor();
    this.limiterTrim = ctx.createGain();
    this.limiter.threshold.value = LIMITER_THRESHOLD_DB;
    this.limiter.knee.value = 0;
    this.limiter.ratio.value = LIMITER_RATIO;
    this.limiter.attack.value = 0.003;
    this.limiter.release.value = 0.25;
    this.limiterTrim.gain.value = limiterTrimGain(LIMITER_THRESHOLD_DB, LIMITER_RATIO);
    this.masterGain.connect(this.limiter);
    this.limiter.connect(this.limiterTrim);
    this.limiterTrim.connect(ctx.destination);
    // Les sons s'empilent (jusqu'à 8 à la fois) : le limiteur évite qu'ils saturent
    this.soundsBus = ctx.createGain();
    this.soundsBus.gain.value = this.soundsVolume;
    this.soundsBus.connect(this.limiter);
    this.transitionBus = ctx.createGain();
    this.transitionBus.gain.value = this.transitionVolume;
    this.buildTransitionEffects(ctx);
    this.reverb.buffer = this.createImpulseResponse(ctx, 4.8, 3.8);
    this.transitionReverb.buffer = this.reverb.buffer;
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
    this.effectTracks().forEach(track => {
      track.audio.volume = this.state.volume;
    });
  }

  /** Volume des sons des onglets sons (0-1), indépendant de celui des musiques */
  setSoundsVolume(value: number): void {
    this.soundsVolume = Math.max(0, Math.min(1, value));
    if (this.soundsBus && this.context) this.rampGain(this.soundsBus, this.soundsVolume);
  }

  /** Volume de la musique de transition (0-1), indépendant de celui des musiques */
  setTransitionVolume(value: number): void {
    this.transitionVolume = Math.max(0, Math.min(1, value));
    if (this.transitionBus && this.context) this.rampGain(this.transitionBus, this.transitionVolume);
  }

  /**
   * Chaîne d'effets de la musique de transition : mêmes réglages d'égaliseur, de filtres et de
   * réverbération que les musiques, mais à part, pour ne pas toucher aux effets des onglets.
   * transitionBus → sortie directe, ou → égaliseur → filtres → (direct + réverbération) ; un seul
   * des deux gains est ouvert, et les deux passent par transitionOut (fondus) puis le limiteur.
   */
  buildTransitionEffects(ctx: AudioContext): void {
    this.transitionDry = ctx.createGain();
    this.transitionFxOut = ctx.createGain();
    this.transitionOut = ctx.createGain();
    this.transitionBass = ctx.createBiquadFilter();
    this.transitionMid = ctx.createBiquadFilter();
    this.transitionTreble = ctx.createBiquadFilter();
    this.transitionLowPass = ctx.createBiquadFilter();
    this.transitionHighPass = ctx.createBiquadFilter();
    this.transitionReverb = ctx.createConvolver();
    this.transitionReverbWet = ctx.createGain();
    const reverbPreDelay = ctx.createDelay(1);
    reverbPreDelay.delayTime.value = 0.035;

    this.transitionBass.type = 'lowshelf';
    this.transitionBass.frequency.value = 200;
    this.transitionMid.type = 'peaking';
    this.transitionMid.frequency.value = 1000;
    this.transitionMid.Q.value = 1;
    this.transitionTreble.type = 'highshelf';
    this.transitionTreble.frequency.value = 3000;
    this.transitionLowPass.type = 'lowpass';
    this.transitionHighPass.type = 'highpass';

    this.transitionBus.connect(this.transitionDry);
    this.transitionDry.connect(this.transitionOut);
    this.transitionBus.connect(this.transitionBass);
    this.transitionBass.connect(this.transitionMid);
    this.transitionMid.connect(this.transitionTreble);
    this.transitionTreble.connect(this.transitionLowPass);
    this.transitionLowPass.connect(this.transitionHighPass);
    this.transitionHighPass.connect(this.transitionFxOut);
    this.transitionHighPass.connect(reverbPreDelay);
    reverbPreDelay.connect(this.transitionReverb);
    this.transitionReverb.connect(this.transitionReverbWet);
    this.transitionReverbWet.connect(this.transitionFxOut);
    this.transitionFxOut.connect(this.transitionOut);
    this.transitionOut.connect(this.limiter);
    this.applyTransitionEffects(false);
  }

  /** Effets de la musique de transition (null : sans effets), appliqués tout de suite, sans clic */
  setTransitionEffects(effects: TransitionEffects | null): void {
    this.transitionEffects = effects;
    if (this.context && this.transitionDry) this.applyTransitionEffects(true);
  }

  applyTransitionEffects(ramp: boolean): void {
    const effects = this.transitionEffects;
    if (effects) {
      this.transitionBass.gain.value = effects.bass;
      this.transitionMid.gain.value = effects.mid;
      this.transitionTreble.gain.value = effects.treble;
      this.transitionLowPass.frequency.value = Math.max(10, Math.min(20000, effects.lowPass));
      this.transitionHighPass.frequency.value = Math.max(0, effects.highPass);
      this.transitionReverbWet.gain.value = this.getReverbWetGain(effects.reverb);
    }
    const dry = effects ? 0 : 1;
    if (ramp) {
      this.rampGain(this.transitionDry, dry);
      this.rampGain(this.transitionFxOut, 1 - dry);
    } else {
      this.transitionDry.gain.value = dry;
      this.transitionFxOut.gain.value = 1 - dry;
    }
  }

  /** Change un gain en 20 ms (sans clic) */
  rampGain(node: GainNode, value: number): void {
    const now = this.context!.currentTime;
    node.gain.cancelScheduledValues(now);
    node.gain.setValueAtTime(node.gain.value, now);
    node.gain.linearRampToValueAtTime(value, now + 0.02);
  }

  /** Pistes qui passent par les effets (pas la musique de transition) */
  effectTracks(): MediaElementTrack[] {
    return [...this.tracks].filter(track => track.route === 'effects');
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
    this.effectTracks().forEach(track => {
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
    this.effectTracks().forEach(track => {
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
    this.effectTracks().forEach(track => {
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

  createTrack(src: string, route: TrackRoute = 'effects'): MediaElementTrack {
    this.ensureContext();
    const track = new MediaElementTrack(this, src, route);
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
  route: TrackRoute;
  audio: HTMLAudioElement;
  sourceNode: MediaElementAudioSourceNode | null;
  outputGain: GainNode | null;
  /** Fin de lecture en secondes (null : jusqu'à la fin du fichier) */
  segmentEnd: number | null;
  onended: (() => void) | null;
  onerror: ((error: Error) => void) | null;
  _loadPromise: Promise<MediaElementTrack> | null;
  /** Termine le chargement en cours sans attendre le fichier (piste libérée) */
  _cancelLoad: (() => void) | null;
  /** Musique de transition : volume de la piste (fondus), appliqué sur `transitionOut`, après les effets */
  _ownVolume = 1;

  constructor(engine: AudioEngine, src: string, route: TrackRoute = 'effects') {
    this.engine = engine;
    this.src = src;
    this.route = route;
    this.audio = new Audio(src);
    this.audio.preload = 'auto';
    this.sourceNode = null;
    this.outputGain = null;
    this.segmentEnd = null;
    this.onended = null;
    this.onerror = null;
    this._loadPromise = null;
    this._cancelLoad = null;

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
    if (this.route === 'transition') return this._ownVolume;
    if (this.engine.canUseMediaElementSource) {
      return this.engine.getCurrentSettings().volume;
    }
    return this.audio.volume;
  }

  set volume(value: number) {
    const clamped = Math.max(0, Math.min(1, value));
    if (this.route === 'transition') {
      // Fondus de la musique de transition : sa propre sortie, pas le volume des musiques. Elle
      // est après ses effets : un arrêt en fondu coupe aussi la queue de réverbération. Une
      // seule musique joue à la fois (playSound libère la précédente), la sortie est donc à elle.
      this._ownVolume = clamped;
      if (this.engine.canUseMediaElementSource) {
        if (this.engine.transitionOut) this.engine.transitionOut.gain.value = clamped;
      } else {
        this.audio.volume = clamped;
      }
      return;
    }
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
    // La musique de transition ne suit pas l'effet de vitesse
    this.playbackRate = this.route === 'transition' ? 1 : this.engine.state.playbackRate;

    if (this._loadPromise) return this._loadPromise;
    if (this.audio.readyState >= 1) return this;

    this._loadPromise = new Promise((resolve, reject) => {
      const cleanup = () => {
        this.audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
        this.audio.removeEventListener('canplaythrough', handleCanPlayThrough);
        this.audio.removeEventListener('error', handleError);
        this._loadPromise = null;
        this._cancelLoad = null;
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
        resolve(this);
      };

      const handleError = () => {
        cleanup();
        reject(new Error(`Impossible de charger ${this.src}`));
      };

      // Piste libérée pendant le chargement : la promesse est tenue tout de suite, et
      // l'appelant (playSound) voit que la piste n'est plus la piste courante
      this._cancelLoad = () => {
        cleanup();
        resolve(this);
      };

      this.audio.addEventListener('loadedmetadata', handleLoadedMetadata);
      this.audio.addEventListener('canplaythrough', handleCanPlayThrough);
      this.audio.addEventListener('error', handleError, { once: true });
      this.audio.load();
    });

    // La promesse elle-même : `await track.load()` attend vraiment le fichier (bug n° 20)
    return this._loadPromise;
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
    this._cancelLoad?.();
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
    // Vide la source : le navigateur libère tout de suite le décodeur et le fichier
    // en mémoire, sans attendre le ramasse-miettes (bug n° 22)
    this.audio.removeAttribute('src');
    this.audio.load();
    this.engine.unregisterTrack(this);
  }

  connectNodes(): void {
    if (!this.engine.canUseMediaElementSource || this.sourceNode) return;

    // load() est toujours appelé après createTrack(), qui crée le contexte
    const context = this.engine.context!;
    this.sourceNode = context.createMediaElementSource(this.audio);
    this.outputGain = context.createGain();
    this.sourceNode.connect(this.outputGain);
    if (this.route === 'transition') {
      this.outputGain.connect(this.engine.transitionBus);
    } else {
      this.outputGain.connect(this.engine.bassFilter);
    }
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
  createTrack: (src: string, route?: TrackRoute) => AUDIO_ENGINE.createTrack(src, route),
  /** Contexte et entrée des sons (créés au besoin) */
  getSoundsOutput: (): { context: AudioContext; input: GainNode } => {
    const context = AUDIO_ENGINE.ensureContext();
    return { context, input: AUDIO_ENGINE.soundsBus };
  },
  setSoundsVolume: (value: number) => AUDIO_ENGINE.setSoundsVolume(value),
  setTransitionVolume: (value: number) => AUDIO_ENGINE.setTransitionVolume(value),
  setTransitionEffects: (effects: TransitionEffects | null) => AUDIO_ENGINE.setTransitionEffects(effects),
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
