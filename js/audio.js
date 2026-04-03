/* ================================================================
   audio.js — Gestion lecture audio (MP3 / OGG / WAV)
   Variables globales lues/écrites : STATE (défini dans app.js)
================================================================ */

// ═══════════════════════════════════════════════════════
// UTILITAIRES
// ═══════════════════════════════════════════════════════

function updateVolIcon(el, val, max) {
  const pct = val / max * 100;
  if (pct === 0)     el.textContent = '🔇';
  else if (pct < 35) el.textContent = '🔈';
  else if (pct < 70) el.textContent = '🔉';
  else               el.textContent = '🔊';
}

function syncAudioSliders(pct) {
  document.querySelectorAll('.audio-vol').forEach(s => {
    if (parseInt(s.value) === pct) return;
    s.value = pct;
    s.style.setProperty('--vol-pct', pct + '%');
    s.closest('.panel-controls').querySelector('.vol-value').textContent = pct + '%';
  });
}

function updateNowPlaying(text) {
  document.querySelectorAll('.panel-audio .now-playing-label')
    .forEach(el => el.textContent = text);
}

// ═══════════════════════════════════════════════════════
// FONDU
// ═══════════════════════════════════════════════════════

function fadeAudio(audio, from, to, ms, onDone) {
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

function startProgressLoop(audio, btn) {
  function tick() {
    if (!STATE.currentAudio || !STATE.currentSoundBtn) return;
    const dur = audio.duration;
    const pct = (dur && isFinite(dur))
      ? Math.min(100, (audio.currentTime / dur) * 100).toFixed(1) + '%'
      : '0%';
    btn.style.setProperty('--progress', pct);
    STATE.progressRAF = requestAnimationFrame(tick);
  }
  if (STATE.progressRAF) cancelAnimationFrame(STATE.progressRAF);
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
    STATE.currentSoundBtn.classList.remove('playing');
    STATE.currentSoundBtn.style.setProperty('--progress', '0%');
    STATE.currentSoundBtn = null;
  }

  document.querySelectorAll('.panel-audio').forEach(p => p.classList.remove('is-playing'));
  updateNowPlaying('NO SOUND PLAYING');

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

  const audio = new Audio(src);
  audio.volume = 0;

  audio.addEventListener('canplaythrough', () => {
    audio.play()
      .then(() => {
        fadeAudio(audio, 0, STATE.audioVolume, 300, null);
        startProgressLoop(audio, btn);
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
  btn.classList.add('playing');
  btn.style.setProperty('--progress', '0%');

  btn.closest('.panel-audio')?.classList.add('is-playing');
  updateNowPlaying('▶ ' + (btn.dataset.label || 'EN LECTURE'));

  audio.load();
}

// ═══════════════════════════════════════════════════════
// RETOUR TACTILE
// ═══════════════════════════════════════════════════════

function initAudioTouchFeedback(panelsEl) {
  panelsEl.addEventListener('touchstart', e => {
    const btn = e.target.closest('.sound-btn, .inst-btn');
    if (!btn || btn.classList.contains('missing')) return;
    btn.style.transform = 'scale(0.93)';
    setTimeout(() => { btn.style.transform = ''; }, 120);
  }, { passive: true });
}
