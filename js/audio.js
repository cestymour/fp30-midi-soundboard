/* ================================================================
   audio.js — Gestion lecture audio (MP3 / OGG / WAV)
   Variables globales lues/écrites : STATE (défini dans app.js)
================================================================ */

// ═══════════════════════════════════════════════════════
// UTILITAIRES
// ═══════════════════════════════════════════════════════

function syncAudioSliders(pct) {
  document.querySelectorAll('.audio-vol').forEach(s => {
    if (parseInt(s.value) === pct) return;
    s.value = pct;
    s.style.setProperty('--vol-pct', pct + '%');
    s.closest('.panel-controls').querySelector('.vol-value').textContent = pct + '%';
  });
}

// ═══════════════════════════════════════════════════════
// FONDU
// ═══════════════════════════════════════════════════════

function fadeAudio(audio, from, to, ms, onDone) {
  if (from === to || ms <= 0) {
    audio.volume = Math.min(1, Math.max(0, to));
    onDone?.();
    return null;
  }

  const steps    = 20;
  const interval = ms / steps;
  const delta    = (to - from) / steps;
  let current    = from;
  const timer    = setInterval(() => {
    current += delta;
    audio.volume = Math.min(1, Math.max(0, current));
    if ((delta < 0 && current <= to) || (delta > 0 && current >= to)) {
      clearInterval(timer);
      onDone?.();
    }
  }, interval);
  return timer;
}

// ═══════════════════════════════════════════════════════
// PROGRESSION
// ═══════════════════════════════════════════════════════

function startProgressLoop(audio, btn, startOffset, endOffset) {
  if (STATE.progressRAF) cancelAnimationFrame(STATE.progressRAF);

  const dur              = audio.duration;
  const effectiveEnd     = endOffset !== null ? endOffset : (dur && isFinite(dur) ? dur : null);
  const playableDuration = effectiveEnd !== null ? effectiveEnd - startOffset : null;

  // Transition adaptative pour sons courts
  if (playableDuration !== null) {
    if (playableDuration < 3)       btn.style.setProperty('--progress-transition', '0.05s');
    else if (playableDuration < 10) btn.style.setProperty('--progress-transition', '0.15s');
    else                            btn.style.setProperty('--progress-transition', '0.30s');
  }

  function tick() {
    if (!STATE.currentAudio || !STATE.currentSoundBtn) return;

    // Arrêt anticipé si on a dépassé endOffset
    if (endOffset !== null && audio.currentTime >= endOffset) {
      stopSound(false);
      return;
    }

    const elapsed = audio.currentTime - startOffset;
    const pct = (playableDuration && playableDuration > 0)
      ? Math.min(100, (elapsed / playableDuration) * 100).toFixed(1) + '%'
      : '0%';

    btn.style.setProperty('--progress', pct);

    // Mise à jour du transport
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

// ═══════════════════════════════════════════════════════
// STOP
// ═══════════════════════════════════════════════════════

function stopSound(fade = false) {
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
      audio.pause();
      audio.currentTime = 0;
    });
  } else {
    STATE.currentAudio.pause();
    STATE.currentAudio.currentTime = 0;
    STATE.currentAudio = null;
  }
}

// ═══════════════════════════════════════════════════════
// PLAY
// ═══════════════════════════════════════════════════════

function playSound(btn) {
  const src = btn.dataset.audio;
  if (!src) return;

  const startOffset = parseFloat(btn.dataset.start || '0') || 0;
  const endRaw      = btn.dataset.end;
  const endOffset   = endRaw ? parseFloat(endRaw) : null;

  const audio = new Audio(src);
  audio.volume = 0;

  audio.addEventListener('canplaythrough', () => {
    if (startOffset > 0) audio.currentTime = startOffset;
    audio.play()
      .then(() => {
        fadeAudio(audio, 0, STATE.audioVolume, 300, null);
        startProgressLoop(audio, btn, startOffset, endOffset);
      })
      .catch(() => stopSound());
  }, { once: true });

  audio.addEventListener('ended', () => stopSound(false), { once: true });

  audio.addEventListener('error', () => {
    console.warn('Fichier introuvable :', src);
    btn.classList.add('missing');
    stopSound();
  }, { once: true });

  STATE.currentAudio    = audio;
  STATE.currentSoundBtn = btn;
  STATE.isPaused        = false;
  btn.classList.remove('paused');
  btn.classList.add('playing');
  btn.style.setProperty('--progress', '0%');

  updateTransportUI();

  audio.load();
}
