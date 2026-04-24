/* ================================================================
   audio.js - Moteur audio Web Audio API (MP3 / OGG / WAV)
   Variables globales lues/ecrites : STATE (defini dans app.js)
================================================================ */

// ================================================================
// UTILITAIRES
// ================================================================

function syncAudioSliders(pct) {
  document.querySelectorAll('.audio-vol').forEach(s => {
    if (parseInt(s.value, 10) === pct) return;
    s.value = pct;
    s.style.setProperty('--vol-pct', pct + '%');
    s.closest('.panel-controls').querySelector('.vol-value').textContent = pct + '%';
  });
}

// ================================================================
// MOTEUR WEB AUDIO
// ================================================================

class AudioEngine {
  constructor() {
    this.context = null;
    this.masterGain = null;
    this.lowPass = null;
    this.highPass = null;
    this.eq = null;
    this.delayNode = null;
    this.delayFeedback = null;
    this.delayWet = null;
    this.reverb = null;
    this.reverbWet = null;
    this.dryGain = null;

    this.state = {
      volume: 1,
      lowPassFrequency: 22050,
      highPassFrequency: 0,
      eqFrequency: 1200,
      eqGain: 0,
      delayTime: 0.25,
      delayFeedback: 0.25,
      delayMix: 0,
      reverbMix: 0,
    };

    this.canUseMediaElementSource = window.location.protocol !== 'file:';
  }

  ensureContext() {
    if (this.context) return this.context;

    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) throw new Error('Web Audio API non supportee.');

    const ctx = new AudioCtx();
    this.context = ctx;

    this.masterGain = ctx.createGain();
    this.lowPass = ctx.createBiquadFilter();
    this.highPass = ctx.createBiquadFilter();
    this.eq = ctx.createBiquadFilter();
    this.delayNode = ctx.createDelay(5);
    this.delayFeedback = ctx.createGain();
    this.delayWet = ctx.createGain();
    this.reverb = ctx.createConvolver();
    this.reverbWet = ctx.createGain();
    this.dryGain = ctx.createGain();

    this.lowPass.type = 'lowpass';
    this.highPass.type = 'highpass';
    this.eq.type = 'peaking';

    this.lowPass.connect(this.highPass);
    this.highPass.connect(this.eq);

    this.eq.connect(this.dryGain);
    this.dryGain.connect(this.masterGain);

    this.eq.connect(this.delayNode);
    this.delayNode.connect(this.delayFeedback);
    this.delayFeedback.connect(this.delayNode);
    this.delayNode.connect(this.delayWet);
    this.delayWet.connect(this.masterGain);

    this.eq.connect(this.reverb);
    this.reverb.connect(this.reverbWet);
    this.reverbWet.connect(this.masterGain);

    this.masterGain.connect(ctx.destination);
    this.reverb.buffer = this.createImpulseResponse(ctx, 2.2, 2.6);

    this.applyState();
    return ctx;
  }

  async resume() {
    const ctx = this.ensureContext();
    if (ctx.state === 'suspended') {
      await ctx.resume();
    }
  }

  createImpulseResponse(ctx, duration, decay) {
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

  applyState() {
    if (!this.context) return;

    this.masterGain.gain.value = this.state.volume;
    this.lowPass.frequency.value = Math.max(10, this.state.lowPassFrequency);
    this.highPass.frequency.value = Math.max(0, this.state.highPassFrequency);
    this.eq.frequency.value = Math.max(10, this.state.eqFrequency);
    this.eq.gain.value = this.state.eqGain;
    this.delayNode.delayTime.value = Math.max(0, this.state.delayTime);
    this.delayFeedback.gain.value = Math.max(0, Math.min(0.95, this.state.delayFeedback));
    this.delayWet.gain.value = Math.max(0, Math.min(1, this.state.delayMix));
    this.reverbWet.gain.value = Math.max(0, Math.min(1, this.state.reverbMix));
    this.dryGain.gain.value = 1;
  }

  setMasterVolume(value) {
    this.state.volume = Math.max(0, Math.min(1, value));
    if (this.canUseMediaElementSource && this.masterGain && this.context) {
      this.masterGain.gain.cancelScheduledValues(this.context.currentTime);
      this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, this.context.currentTime);
      this.masterGain.gain.linearRampToValueAtTime(this.state.volume, this.context.currentTime + 0.02);
    }
  }

  setLowPassFrequency(value) {
    this.state.lowPassFrequency = value;
    if (this.lowPass) this.lowPass.frequency.value = Math.max(10, value);
  }

  setHighPassFrequency(value) {
    this.state.highPassFrequency = value;
    if (this.highPass) this.highPass.frequency.value = Math.max(0, value);
  }

  setEQ({ frequency, gain } = {}) {
    if (typeof frequency === 'number') {
      this.state.eqFrequency = frequency;
      if (this.eq) this.eq.frequency.value = Math.max(10, frequency);
    }
    if (typeof gain === 'number') {
      this.state.eqGain = gain;
      if (this.eq) this.eq.gain.value = gain;
    }
  }

  setDelay({ time, feedback, mix } = {}) {
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

  setReverbMix(value) {
    this.state.reverbMix = value;
    if (this.reverbWet) this.reverbWet.gain.value = Math.max(0, Math.min(1, value));
  }

  getCurrentSettings() {
    return { ...this.state };
  }

  createTrack(src) {
    this.ensureContext();
    return new MediaElementTrack(this, src);
  }
}

class MediaElementTrack {
  constructor(engine, src) {
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

  get duration() {
    const rawDuration = this.audio.duration;
    if (!isFinite(rawDuration)) return NaN;
    return this.segmentEnd !== null ? Math.min(this.segmentEnd, rawDuration) : rawDuration;
  }

  get currentTime() {
    return this.audio.currentTime || 0;
  }

  set currentTime(value) {
    const limit = this.duration;
    const nextTime = Math.max(0, Math.min(value || 0, isFinite(limit) ? limit : Infinity));
    this.audio.currentTime = nextTime;
  }

  get volume() {
    if (this.engine.canUseMediaElementSource) {
      return this.engine.getCurrentSettings().volume;
    }
    return this.audio.volume;
  }

  set volume(value) {
    const clamped = Math.max(0, Math.min(1, value));
    if (this.engine.canUseMediaElementSource) {
      this.engine.setMasterVolume(clamped);
    }
    this.audio.volume = clamped;
  }

  async load() {
    this.connectNodes();

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

  setPlaybackRange(startOffset, endOffset) {
    this.audio.currentTime = Math.max(0, startOffset || 0);
    this.segmentEnd = endOffset !== null && isFinite(endOffset)
      ? Math.max(this.audio.currentTime, endOffset)
      : null;
  }

  async play() {
    await this.engine.resume();
    await this.load();
    if (isFinite(this.duration) && this.audio.currentTime >= this.duration) {
      this.audio.currentTime = 0;
    }
    await this.audio.play();
    return this;
  }

  pause() {
    this.audio.pause();
  }

  stop() {
    this.audio.pause();
    this.audio.currentTime = 0;
  }

  connectNodes() {
    if (!this.engine.canUseMediaElementSource || this.sourceNode) return;

    this.sourceNode = this.engine.context.createMediaElementSource(this.audio);
    this.outputGain = this.engine.context.createGain();
    this.sourceNode.connect(this.outputGain);
    this.outputGain.connect(this.engine.lowPass);
  }

  handleEnded() {
    this.onended?.();
  }

  handleError() {
    this.onerror?.(new Error(`Impossible de charger ${this.src}`));
  }
}

const AUDIO_ENGINE = new AudioEngine();

window.AudioEngineAPI = {
  init: () => AUDIO_ENGINE.ensureContext(),
  resume: () => AUDIO_ENGINE.resume(),
  load: (src) => AUDIO_ENGINE.createTrack(src).load(),
  createTrack: (src) => AUDIO_ENGINE.createTrack(src),
  setMasterVolume: (value) => AUDIO_ENGINE.setMasterVolume(value),
  setLowPassFrequency: (value) => AUDIO_ENGINE.setLowPassFrequency(value),
  setHighPassFrequency: (value) => AUDIO_ENGINE.setHighPassFrequency(value),
  setEQ: (options) => AUDIO_ENGINE.setEQ(options),
  setDelay: (options) => AUDIO_ENGINE.setDelay(options),
  setReverbMix: (value) => AUDIO_ENGINE.setReverbMix(value),
  getCurrentSettings: () => AUDIO_ENGINE.getCurrentSettings(),
};

// ================================================================
// FONDU
// ================================================================

let _fadeTimer = null;
let _fadingAudio = null;

function cancelFade() {
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

function fadeAudio(audio, from, to, ms, onDone) {
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
      clearInterval(_fadeTimer);
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

function startProgressLoop(audio, btn, startOffset, endOffset) {
  if (STATE.progressRAF) cancelAnimationFrame(STATE.progressRAF);

  const dur = audio.duration;
  const effectiveEnd = endOffset !== null ? endOffset : (dur && isFinite(dur) ? dur : null);
  const playableDuration = effectiveEnd !== null ? effectiveEnd - startOffset : null;

  if (playableDuration !== null) {
    if (playableDuration < 3)       btn.style.setProperty('--progress-transition', '0.05s');
    else if (playableDuration < 10) btn.style.setProperty('--progress-transition', '0.15s');
    else                            btn.style.setProperty('--progress-transition', '0.30s');
  }

  function tick() {
    if (!STATE.currentAudio || !STATE.currentSoundBtn) return;

    if (endOffset !== null && audio.currentTime >= endOffset) {
      stopSound(false);
      return;
    }

    const elapsed = audio.currentTime - startOffset;
    const pct = (playableDuration && playableDuration > 0)
      ? Math.min(100, (elapsed / playableDuration) * 100).toFixed(1) + '%'
      : '0%';

    btn.style.setProperty('--progress', pct);
    updateTransportUI();

    STATE.progressRAF = requestAnimationFrame(tick);
  }

  STATE.progressRAF = requestAnimationFrame(tick);
}

function stopProgressLoop() {
  if (STATE.progressRAF) {
    cancelAnimationFrame(STATE.progressRAF);
    STATE.progressRAF = null;
  }
}

// ================================================================
// STOP
// ================================================================

function stopSound(fade = false) {
  cancelFade();
  stopProgressLoop();

  if (STATE.currentSoundBtn) {
    STATE.currentSoundBtn.classList.remove('playing', 'paused');
    STATE.currentSoundBtn.style.setProperty('--progress', '0%');
    STATE.currentSoundBtn = null;
  }

  STATE.isPaused = false;
  updateTransportUI();

  if (!STATE.currentAudio) return;

  if (fade) {
    const audio = STATE.currentAudio;
    STATE.currentAudio = null;
    fadeAudio(audio, audio.volume, 0, 400, () => {
      audio.stop();
      audio.volume = STATE.audioVolume;
    });
  } else {
    STATE.currentAudio.stop();
    STATE.currentAudio = null;
  }
}

function emergencyStopAudio() {
  stopSound(true);
}

// ================================================================
// PLAY
// ================================================================

let _playRequestId = 0;

async function playSound(btn) {
  const src = btn.dataset.audio;
  if (!src) return;

  const requestId = ++_playRequestId;

  cancelFade();

  if (STATE.currentAudio) {
    STATE.currentAudio.stop();
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
  btn.style.setProperty('--progress', '0%');

  updateTransportUI();

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
      audio.stop();
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
