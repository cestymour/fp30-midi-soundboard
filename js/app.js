/* ================================================================
   app.js — Chef d'orchestre : état global, construction DOM,
            navigation onglets, initialisation
   Dépend de : midi.js, audio.js, midi.config.js, audio.config.js
================================================================ */

// ═══════════════════════════════════════════════════════
// ÉTAT GLOBAL PARTAGÉ
// ═══════════════════════════════════════════════════════
const STATE = {
  // ── MIDI ──
  MIDI_CHANNEL:          0,
  bt:                    null,   // instance BluetoothMIDI, initialisée dans midi.js
  midiOutput:            null,
  midiInput:             null,
  midiAccess:            null,
  midiVolume:            100,
  activeInstBtn:         null,
  currentConnectionType: null,   // 'usb' | 'bt' | null
  isSwitchingToUsb:      false,

  // ── Audio ──
  currentAudio:          null,
  currentSoundBtn:       null,
  progressRAF:           null,
  audioVolume:           1,
  isPaused:              false,
  midiFxPopupOpen:       false,
  audioFxPopupOpen:      false,
};

// ═══════════════════════════════════════════════════════
// RÉFÉRENCES DOM
// ═══════════════════════════════════════════════════════
const tabNav   = document.getElementById('tab-nav');
const panelsEl = document.getElementById('panels');

// ═══════════════════════════════════════════════════════
// UTILITAIRES DOM — blocs réutilisables
// ═══════════════════════════════════════════════════════

/** Crée un bouton d'arrêt d'urgence avec SVG hazard */
function buildEmergencyStopBtn(extraClass) {
  const uid = Math.random().toString(36).substring(2, 11);
  const btn = document.createElement('button');
  btn.className = 'emergency-stop-btn' + (extraClass ? ' ' + extraClass : '');
  btn.title = 'Stop';
  btn.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 28 28" aria-hidden="true">
      <circle cx="14" cy="14" r="13" fill="none" stroke-width="0"/>
      <clipPath id="ring-clip-${uid}">
        <path d="M14 14 m-13 0 a13 13 0 1 1 26 0 a13 13 0 1 1 -26 0
                M14 14 m-9 0 a9 9 0 1 0 18 0 a9 9 0 1 0 -18 0" 
              clip-rule="evenodd"/>
      </clipPath>
      <rect x="0" y="0" width="28" height="28" fill="url(#hazard-${uid})" clip-path="url(#ring-clip-${uid})"/>
      <defs>
        <pattern id="hazard-${uid}" x="0" y="0" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <rect width="4" height="8" fill="#f5c400"/>
          <rect x="4" width="4" height="8" fill="#111111"/>
        </pattern>
      </defs>
      <circle cx="14" cy="14" r="9" fill="#cc0000"/>
      <circle cx="11" cy="11" r="3.5" fill="rgba(255,255,255,0.18)"/>
    </svg>
    <span class="emergency-stop-btn__label">STOP</span>
  `;
  return btn;
}

function buildPanelUtilityBtn({ className, title, icon, label }) {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = className;
  btn.title = title;
  btn.innerHTML = `
    <span class="${className}__icon">${icon}</span>
    <span class="${className}__label">${label}</span>
  `;
  return btn;
}

/** Détecte si une chaîne est un chemin vers une image */
function isImagePath(str) {
  return str && /\.(png|jpg|jpeg|gif|svg|webp)$/i.test(str);
}

/** Génère le HTML d'icône (image ou emoji) et indique si c'est une image */
function buildIconHTML(item) {
  let hasImage = false;
  let html;

  if (item.img) {
    hasImage = true;
    html = `<span class="btn-icon"><img src="${item.img}" alt="${item.name}" /></span>`;
  } else if (isImagePath(item.icon)) {
    hasImage = true;
    html = `<span class="btn-icon"><img src="${item.icon}" alt="${item.name}" /></span>`;
  } else {
    html = `<span class="btn-icon">${item.icon ?? '▶'}</span>`;
  }

  return { html, hasImage };
}

/** Crée un titre de catégorie */
function buildCatTitle(cat) {
  const title = document.createElement('div');
  title.className = 'cat-title';
  title.style.setProperty('--cat-color', cat.color ?? 'var(--text-muted)');
  title.textContent = `${cat.icon ?? ''} ${cat.label}`;
  return title;
}

/** Crée un bloc catégorie (titre + grille de boutons vide) */
function buildCatBlock(cat, blockClass, gridClass) {
  const block = document.createElement('div');
  block.className = blockClass;
  block.appendChild(buildCatTitle(cat));

  const btnGrid = document.createElement('div');
  btnGrid.className = gridClass;
  block.appendChild(btnGrid);

  return { block, btnGrid };
}

/** Crée N colonnes dans un conteneur et retourne le tableau */
function createColumns(container, count, className) {
  const cols = [];
  for (let i = 0; i < count; i++) {
    const col = document.createElement('div');
    col.className = className;
    container.appendChild(col);
    cols.push(col);
  }
  return cols;
}

/** Formate des secondes en M:SS */
function formatTime(sec) {
  if (!isFinite(sec) || sec < 0) return '–:––';
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

/** Crée un bouton audio (sound-btn) avec tous ses attributs et son listener */
function buildSoundBtn(item) {
  const btn = document.createElement('button');
  btn.className = 'sound-btn';
  btn.dataset.audio = item.file;
  btn.dataset.label = item.name;
  btn.dataset.start = item.start ?? 0;
  btn.dataset.end   = item.end   ?? '';
  btn.style.setProperty('--progress', '0%');

  if (item.catClass) btn.classList.add(item.catClass);

  const icon = buildIconHTML(item);
  if (icon.hasImage) btn.classList.add('sound-btn--img');

  btn.innerHTML = `${icon.html}<span class="btn-label">${item.name}</span>`;
  btn.title = item.title ?? item.name;

  btn.addEventListener('click', () => {
    if (btn === STATE.currentSoundBtn) {
      // Ce bouton est actif → stop (ou restart si en pause)
      if (STATE.isPaused) {
        // En pause → restart depuis le début
        stopSound(false);
        playSound(btn);
      } else {
        // En lecture → stop
        stopSound(true);
      }
    } else {
      // Autre bouton → stop l'ancien, play le nouveau
      stopSound(true);
      playSound(btn);
    }
  });

  return btn;
}

/** Met à jour l'emoji de volume selon le pourcentage */
function updateVolIcon(el, val, max) {
  const pct = val / max * 100;
  if (pct === 0)     el.textContent = '🔇';
  else if (pct < 35) el.textContent = '🔈';
  else if (pct < 70) el.textContent = '🔉';
  else               el.textContent = '🔊';
}

/**
 * Calcule et applique une hauteur uniforme aux boutons d'un panneau en colonnes.
 */
function equalizeColumnButtons(cfg) {
  document.querySelectorAll(cfg.panelSelector).forEach(panel => {
    const grid = panel.querySelector(cfg.gridSelector);
    if (!grid) return;
    if (cfg.guardSelector && !grid.querySelector(cfg.guardSelector)) return;

    const gridH = grid.clientHeight;
    if (!gridH) return;

    const gapPx    = parseInt(getComputedStyle(grid).gap) || 8;
    const gapInner = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--gap-inner')) || 5;

    // Détecter automatiquement le nombre de rangées visuelles via CSS grid
    const gridStyle = getComputedStyle(grid);
    const gridTemplateRows = gridStyle.gridTemplateRows;
    let visualRowCount = 1;
    
    if (grid.classList.contains('audio-grid-cols') && gridTemplateRows && gridTemplateRows !== 'none') {
      visualRowCount = gridTemplateRows.split(' ').filter(v => v && v !== '0px').length;
    }
    
    const availableGridH = (gridH - (visualRowCount - 1) * gapPx) / visualRowCount;

    grid.querySelectorAll(cfg.colSelector).forEach(col => {
      let totalRows = 0;
      col.querySelectorAll(cfg.btnGridSelector).forEach(btnGrid => {
        totalRows += Math.ceil(btnGrid.children.length / cfg.colsPerRow);
      });

      const catCount   = col.querySelectorAll(cfg.catBlockSelector).length;
      const firstTitle = col.querySelector('.cat-title');
      const titleH     = firstTitle ? firstTitle.offsetHeight : 20;

      const usedByTitles = catCount * (titleH + gapInner);
      const usedByGaps   = (catCount - 1) * gapPx;
      const available    = availableGridH - usedByTitles - usedByGaps;

      const gapsInGrid = (totalRows - 1) * gapInner;
      const btnH       = Math.floor((available - gapsInGrid) / totalRows);

      col.style.setProperty('--btn-h', Math.max(40, btnH) + 'px');
    });
  });
}

function equalizeMidiButtons() {
  equalizeColumnButtons({
    panelSelector:    '.panel.panel-midi.active',
    gridSelector:     '.midi-grid',
    guardSelector:    null,
    colSelector:      '.midi-col',
    btnGridSelector:  '.btn-grid',
    catBlockSelector: '.cat-block',
    colsPerRow:       2,
  });
}

function equalizeAudioButtons() {
  equalizeColumnButtons({
    panelSelector:    '.panel.panel-audio.active',
    gridSelector:     '.audio-grid',
    guardSelector:    '.audio-col',
    colSelector:      '.audio-col',
    btnGridSelector:  '.audio-cat-grid',
    catBlockSelector: '.audio-cat-block',
    colsPerRow:       3,
  });
}

// ═══════════════════════════════════════════════════════
// TRANSPORT BAR — Play/Pause + Seek + Time
// ═══════════════════════════════════════════════════════

/**
 * Mise à jour légère — appelée dans la boucle RAF (60fps).
 * Met à jour le temps, la barre de seek et la progression du bouton.
 */
function updateSeekUI() {
  const audio = STATE.currentAudio;
  const btn   = STATE.currentSoundBtn;
  if (!audio || !btn) return;

  const startOffset   = parseFloat(btn.dataset.start) || 0;
  const endRaw        = btn.dataset.end;
  const endOffset     = endRaw ? parseFloat(endRaw) : null;
  const dur           = audio.duration;
  const effectiveEnd  = endOffset ?? (isFinite(dur) ? dur : 0);
  const totalDuration = effectiveEnd - startOffset;
  const elapsed       = Math.max(0, audio.currentTime - startOffset);
  const pct           = totalDuration > 0 ? Math.min(100, (elapsed / totalDuration) * 100) : 0;
  
  // Met à jour la barre de progression sur le bouton lui-même
  btn.style.setProperty('--progress', pct.toFixed(2) + '%');

  // Met à jour toutes les barres de transport
  document.querySelectorAll('.transport-seek').forEach(bar => {
    bar.querySelector('.transport-seek-fill').style.width  = pct + '%';
    bar.querySelector('.transport-seek-handle').style.left = pct + '%';
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
function updateTransportUI() {
  const audio = STATE.currentAudio;
  const btn   = STATE.currentSoundBtn;

  // ── Bouton play/pause et état du "handle" ──
  document.querySelectorAll('.transport-play-pause').forEach(b => {
    if (!audio || !btn) {
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
    handle.classList.toggle('pulsing', !!(audio && btn && !STATE.isPaused));
  });

  // ── Reset des barres et temps si rien ne joue ──
  if (!audio || !btn) {
    document.querySelectorAll('.transport-seek').forEach(bar => {
      bar.querySelector('.transport-seek-fill').style.width = '0%';
      bar.querySelector('.transport-seek-handle').style.left = '0%';
    });
    document.querySelectorAll('.transport-time').forEach(el => {
      el.textContent = '–:–– / –:––';
    });
    // S'assure que le bouton qui jouait est bien remis à zéro
    const playingBtn = document.querySelector('.sound-btn.playing, .sound-btn.paused');
    if (playingBtn) playingBtn.style.setProperty('--progress', '0%');
  }

  // ── État global du panneau audio ──
  document.querySelectorAll('.panel-audio').forEach(p => {
    p.classList.remove('is-playing', 'is-paused');
    if (audio && btn) {
      if (STATE.isPaused) {
        p.classList.add('is-paused');
      } else {
        p.classList.add('is-playing');
      }
    }
  });
}

/** Calcule la position en secondes à partir d'un événement sur la barre de seek */
function getSeekTimeFromEvent(e, bar) {
  if (!STATE.currentAudio || !STATE.currentSoundBtn) return null;

  const rect = bar.getBoundingClientRect();
  const clientX = e.touches ? e.touches[0].clientX : e.clientX;
  const pct = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));

  const btn = STATE.currentSoundBtn;
  const startOffset = parseFloat(btn.dataset.start) || 0;
  const endRaw = btn.dataset.end;
  const endOffset = endRaw ? parseFloat(endRaw) : null;
  const dur = STATE.currentAudio.duration;
  const effectiveEnd = endOffset ?? (isFinite(dur) ? dur : 0);
  const totalDuration = effectiveEnd - startOffset;

  const newTime = startOffset + pct * totalDuration;
  return Math.max(startOffset, Math.min(newTime, effectiveEnd));
}

/** Applique le seek */
function applySeek(e, bar) {
  const newTime = getSeekTimeFromEvent(e, bar);
  if (newTime !== null) {
    STATE.currentAudio.currentTime = newTime;
    updateSeekUI(); // Mise à jour immédiate et légère
  }
}

/** Initialise le drag sur une barre de seek */
function initSeekBarDrag(bar) {
  let isDragging = false;

  const startDrag = (e) => {
    if (!STATE.currentAudio || !STATE.currentSoundBtn) return;
    isDragging = true;
    document.body.classList.add('is-seeking');
    applySeek(e, bar);
    e.preventDefault();
  };

  const doDrag = (e) => {
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


/** Toggle play/pause */
function togglePlayPause() {
  if (!STATE.currentAudio || !STATE.currentSoundBtn) return;

  if (STATE.isPaused) {
    // Resume avec fade in
    STATE.currentAudio.volume = 0;
    STATE.currentAudio.play().then(() => {
      STATE.isPaused = false;
      fadeAudio(STATE.currentAudio, 0, STATE.audioVolume, 150, null);
      startProgressLoop(
        STATE.currentAudio,
        STATE.currentSoundBtn,
        parseFloat(STATE.currentSoundBtn.dataset.start) || 0,
        STATE.currentSoundBtn.dataset.end ? parseFloat(STATE.currentSoundBtn.dataset.end) : null
      );
      updateTransportUI();
    });
  } else {
    // Pause avec fade out
    stopProgressLoop();
    const audio = STATE.currentAudio;
    fadeAudio(audio, audio.volume, 0, 150, () => {
      audio.pause();
      STATE.isPaused = true;
      updateTransportUI();
    });
  }
}

/** Arrêt d'urgence total — coupe MIDI + Audio */
function emergencyStopAll() {
  emergencyStopAudio();
  sendEmergencyStopMidi();
}

// ═══════════════════════════════════════════════════════
// CONSTRUCTION DU DOM
// ═══════════════════════════════════════════════════════
function buildUI() {
  const allTabs       = [];
  const firstAudioIdx = MIDI_TABS.length;

  MIDI_TABS.forEach(tab  => allTabs.push({ ...tab, type: 'midi'  }));
  AUDIO_TABS.forEach(tab => allTabs.push({ ...tab, type: 'audio' }));

  allTabs.forEach((tab, idx) => {

    // ── Onglet ──
    const btn = document.createElement('button');
    btn.className = 'tab-btn' + (idx === 0 ? ' active' : '');
    btn.dataset.tab  = idx;
    btn.dataset.type = tab.type;
    btn.style.setProperty('--tab-accent', tab.accent);
    btn.innerHTML = `
      <span class="tab-icon">${tab.icon}</span>
      <span class="tab-label">${tab.label}</span>
    `;
    tabNav.appendChild(btn);

    // ── Panneau ──
    const panel = document.createElement('section');
    panel.className  = `panel panel-${tab.type}` + (idx === 0 ? ' active' : '');
    panel.dataset.panel = idx;
    panel.dataset.type  = tab.type;
    panel.style.setProperty('--panel-accent', tab.accent);

    if (tab.type === 'midi') {
      panel.appendChild(buildMidiControls());
      panel.appendChild(buildMidiGrid(tab));
      requestAnimationFrame(() => equalizeMidiButtons());
    } else {
      panel.appendChild(buildAudioControls());
      panel.appendChild(buildAudioGrid(tab));
    }

    panelsEl.appendChild(panel);
  });

  // Disposition initiale selon l'orientation au chargement
  const firstMidiPanel = document.querySelector('.panel.panel-midi.active');
  if (firstMidiPanel) rearrangeMidiGrid(firstMidiPanel);

  // Écouter les changements d'orientation
  const orientationMQ = window.matchMedia('(orientation: portrait)');
  orientationMQ.addEventListener('change', () => {
    const activePanel = document.querySelector('.panel.active');
    if (activePanel && activePanel.dataset.type === 'midi') {
      rearrangeMidiGrid(activePanel);
    }
    equalizeMidiButtons();
  });

  buildAboutPopup();
  buildMidiFXPopup();
  buildAudioFXPopup();
}

// ── Contrôles MIDI ──
function buildMidiControls() {
  const wrap = document.createElement('div');
  wrap.className = 'panel-controls';
  
  const volPct = (STATE.midiVolume / 127 * 100).toFixed(1);

  wrap.innerHTML = `
    <div class="controls-left">
      <div class="midi-connect">
        <select class="midi-select">
          <option value="__none__">— Connexion MIDI —</option>
        </select>
        <span class="midi-badge">Non connecté</span>
      </div>
    </div>
    <div class="controls-right">
      <div class="volume-wrap">
        <span class="vol-icon">🔊</span>
        <input type="range" class="vol-slider midi-vol"
               min="0" max="127" value="${STATE.midiVolume}"
               style="--vol-pct:${volPct}%" />
        <span class="vol-value">${STATE.midiVolume}</span>
      </div>
    </div>
  `;

  const stopBtn = buildEmergencyStopBtn();
  stopBtn.addEventListener('click', () => emergencyStopAll());

  const midiFxOpenBtn = buildPanelUtilityBtn({
    className: 'midi-fx-open-btn',
    title: 'Effets piano',
    icon: '🎹',
    label: 'Effets',
  });
  const midiFxResetBtn = buildPanelUtilityBtn({
    className: 'midi-fx-reset-btn',
    title: 'Réinitialiser les effets piano',
    icon: '\u21BA',
    label: 'Reset',
  });

  const controlsRight = wrap.querySelector('.controls-right');
  const volumeWrap = controlsRight.querySelector('.volume-wrap');
  controlsRight.insertBefore(midiFxResetBtn, volumeWrap);
  controlsRight.insertBefore(midiFxOpenBtn, midiFxResetBtn);
  controlsRight.insertBefore(stopBtn, volumeWrap);

  midiFxOpenBtn.addEventListener('click', openMidiFXPopup);
  midiFxResetBtn.addEventListener('click', resetMidiFXEffects);

  const slider = wrap.querySelector('.midi-vol');
  const valEl  = wrap.querySelector('.vol-value');
  const iconEl = wrap.querySelector('.vol-icon');

  slider.addEventListener('input', () => {
    STATE.midiVolume = parseInt(slider.value, 10);
    const pct = (STATE.midiVolume / 127 * 100).toFixed(1);
    slider.style.setProperty('--vol-pct', pct + '%');
    valEl.textContent = STATE.midiVolume;
    updateVolIcon(iconEl, STATE.midiVolume, 127);
    sendVolume(STATE.midiVolume);
    syncMidiSliders(STATE.midiVolume);
  });

  return wrap;
}

// ── Contrôles Audio ──
function buildAudioControls() {
  const wrap = document.createElement('div');
  wrap.className = 'panel-controls';
  const pct = Math.round(STATE.audioVolume * 100);

  wrap.innerHTML = `
    <div class="controls-left">
      <div class="transport-bar">
        <button class="transport-play-pause" disabled><span class="icon-play"></span></button>
        <div class="transport-seek">
          <div class="transport-seek-fill"></div>
          <div class="transport-seek-handle"></div>
        </div>
        <span class="transport-time">–:–– / –:––</span>
      </div>
    </div>
    <div class="controls-right">
      <div class="volume-wrap">
        <span class="vol-icon">🔊</span>
        <input type="range" class="vol-slider audio-vol"
               min="0" max="100" value="${pct}"
               style="--vol-pct:${pct}%" />
        <span class="vol-value">${pct}%</span>
      </div>
    </div>
  `;

  const stopBtn = buildEmergencyStopBtn('audio-stop-btn');
  stopBtn.addEventListener('click', () => emergencyStopAll());
  // Insérer le bouton STOP avant le volume-wrap
  const controlsRight = wrap.querySelector('.controls-right');
  const volumeWrap = controlsRight.querySelector('.volume-wrap');
  const fxOpenBtn = buildPanelUtilityBtn({
    className: 'audio-fx-open-btn',
    title: 'Mixer audio',
    icon: '🎛️',
    label: 'Effets',
  });
  const fxResetBtn = buildPanelUtilityBtn({
    className: 'audio-fx-reset-btn',
    title: 'Réinitialiser les effets audio',
    icon: '\u21BA',
    label: 'Reset',
  });
  controlsRight.insertBefore(fxResetBtn, volumeWrap);
  controlsRight.insertBefore(fxOpenBtn, fxResetBtn);
  controlsRight.insertBefore(stopBtn, volumeWrap);

  const slider = wrap.querySelector('.audio-vol');
  const valEl  = wrap.querySelector('.vol-value');
  const iconEl = wrap.querySelector('.vol-icon');

  slider.addEventListener('input', () => {
    STATE.audioVolume = parseInt(slider.value, 10) / 100;
    const p = Math.round(STATE.audioVolume * 100);
    slider.style.setProperty('--vol-pct', p + '%');
    valEl.textContent = p + '%';
    updateVolIcon(iconEl, p, 100);
    if (STATE.currentAudio) STATE.currentAudio.volume = STATE.audioVolume;
    syncAudioSliders(p);
    if (STATE.audioFxPopupOpen) syncAudioFXPopupFromEngine();
  });

  // Play/Pause
  wrap.querySelector('.transport-play-pause').addEventListener('click', togglePlayPause);
  fxOpenBtn.addEventListener('click', openAudioFXPopup);
  fxResetBtn.addEventListener('click', resetAudioFXEffects);

  // Seek (clic + drag)
  const seekBar = wrap.querySelector('.transport-seek');
  initSeekBarDrag(seekBar);

  return wrap;
}

// ── Grille MIDI ──
function buildMidiGrid(tab) {
  const grid = document.createElement('div');
  grid.className = 'midi-grid';

  const colCount     = tab.cols ?? 5;
  const blocksPerCol = Math.ceil(tab.categories.length / colCount);
  const cols         = createColumns(grid, colCount, 'midi-col');

  tab.categories.forEach((cat, catIdx) => {
    const col = cols[Math.floor(catIdx / blocksPerCol)];
    const { block, btnGrid } = buildCatBlock(cat, 'cat-block', 'btn-grid');

    cat.items.forEach(item => {
      const btn = document.createElement('button');
      btn.className = 'inst-btn';
      btn.title     = item.title ?? item.name;
      btn.innerHTML = `
        <span class="btn-icon">${item.icon}</span>
        <span class="btn-label">${item.name}</span>
      `;
      btn.addEventListener('click', () => selectInstrument(btn, item));
      btnGrid.appendChild(btn);
    });

    col.appendChild(block);
  });

  return grid;
}

// ── Grille Audio ──
function buildAudioGrid(tab) {
  const grid = document.createElement('div');
  grid.className = 'audio-grid';

  if (tab.gridType === 'animals') {
    grid.classList.add('animals-grid');
    const allItems = tab.categories.flatMap(cat => cat.items);
    allItems.forEach(item => grid.appendChild(buildSoundBtn(item)));
    return grid;
  }

  if (tab.cols && tab.cols > 1) {
    grid.classList.add('audio-grid-cols');

    const colCount     = tab.cols;
    const blocksPerCol = Math.ceil(tab.categories.length / colCount);
    const cols         = createColumns(grid, colCount, 'audio-col');

    tab.categories.forEach((cat, catIdx) => {
      const col = cols[Math.floor(catIdx / blocksPerCol)];
      const { block, btnGrid } = buildCatBlock(cat, 'audio-cat-block', 'audio-cat-grid');

      cat.items.forEach(item => btnGrid.appendChild(buildSoundBtn(item)));
      col.appendChild(block);
    });

  } else {
    tab.categories.forEach(cat => {
      cat.items.forEach(item => grid.appendChild(buildSoundBtn(item)));
    });
  }

  return grid;
}

// ── Réorganisation de la grille MIDI selon l'orientation ──
function rearrangeMidiGrid(panel) {
  const grid = panel.querySelector('.midi-grid');
  if (!grid) return;

  const isPortrait = window.matchMedia('(orientation: portrait)').matches;
  const blocks = Array.from(grid.querySelectorAll('.cat-block'));
  const cols = Array.from(grid.querySelectorAll('.midi-col'));

  const colCount = isPortrait ? 2 : cols.length;
  const blocksPerCol = Math.ceil(blocks.length / colCount);

  cols.forEach((col, i) => {
    col.style.display = i < colCount ? '' : 'none';
  });

  cols.slice(0, colCount).forEach(col => {
    while (col.firstChild) col.removeChild(col.firstChild);
  });

  blocks.forEach((block, i) => {
    const colIdx = Math.floor(i / blocksPerCol);
    cols[colIdx].appendChild(block);
  });
}

// ═══════════════════════════════════════════════════════
// POPUP "ABOUT"
// ═══════════════════════════════════════════════════════
function buildAboutPopup() {
  const overlay = document.createElement('div');
  overlay.id = 'about-overlay';
  overlay.setAttribute('aria-hidden', 'true');

  overlay.innerHTML = `
    <div id="about-card">
      <div id="about-title">[IMPRO] Soundboard</div>
      <div id="about-work">Work with 🎹 Piano Roland FP30X</div>
      <div id="about-version">v${typeof APP_VERSION !== 'undefined' ? APP_VERSION : '—'}</div>
      <div id="about-info">
        <span id="about-sw-status">Service Worker : vérification...</span>
        <br>
        <span id="about-wl-status">Wake Lock : vérification...</span>
      </div>
      <div id="about-credit">by cestymour</div>
      <div id="about-actions">
        <button id="about-reload-btn">⟳ Vider le cache et recharger</button>
        <button id="about-close-btn">Fermer</button>
      </div>
    </div>
  `;

  document.getElementById('app').appendChild(overlay);

  overlay.addEventListener('click', e => {
    if (e.target === overlay) closeAbout();
  });
  overlay.querySelector('#about-close-btn').addEventListener('click', closeAbout);

  overlay.querySelector('#about-reload-btn').addEventListener('click', async () => {
    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      for (const reg of registrations) await reg.unregister();
    }
    location.reload();
  });
}

function openAbout() {
  const overlay = document.getElementById('about-overlay');
  if (!overlay) return;

  const swEl = overlay.querySelector('#about-sw-status');
  if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
    swEl.textContent = 'Service Worker : actif ✓';
  } else {
    swEl.textContent = 'Service Worker : inactif';
  }

  const wlEl = overlay.querySelector('#about-wl-status');
  if (wlEl) {
    if (!('wakeLock' in navigator)) {
      wlEl.textContent = 'Wake Lock : non supporté';
    } else if (STATE.wakeLock) {
      wlEl.textContent = 'Wake Lock : actif ✓';
    } else {
      wlEl.textContent = 'Wake Lock : inactif';
    }
  }

  overlay.setAttribute('aria-hidden', 'false');
  overlay.style.display = 'flex';
}

function closeAbout() {
  const overlay = document.getElementById('about-overlay');
  if (!overlay) return;
  overlay.setAttribute('aria-hidden', 'true');
  overlay.style.display = 'none';
}

function initLogoInteraction() {
  const btn = document.getElementById('settings-btn');
  btn.addEventListener('click', openAbout);
  btn.addEventListener('contextmenu', e => e.preventDefault());
}

// ═══════════════════════════════════════════════════════
// NAVIGATION ONGLETS
// ═══════════════════════════════════════════════════════
function activateTab(idx) {
  if (STATE.midiFxPopupOpen)  closeMidiFXPopup();
  if (STATE.audioFxPopupOpen) closeAudioFXPopup();

  document.querySelectorAll('.tab-btn').forEach((b, i) =>
    b.classList.toggle('active', i === idx));
  document.querySelectorAll('.panel').forEach((p, i) =>
    p.classList.toggle('active', i === idx));

  requestAnimationFrame(() => {
    const activePanel = document.querySelector('.panel.active');
    if (activePanel && activePanel.dataset.type === 'midi') {
      rearrangeMidiGrid(activePanel);
      equalizeMidiButtons();
    } else if (activePanel && activePanel.dataset.type === 'audio') {
      equalizeAudioButtons();
    }
  });
}

tabNav.addEventListener('click', e => {
  const btn = e.target.closest('.tab-btn');
  if (!btn) return;
  activateTab(parseInt(btn.dataset.tab, 10));
});

// ═══════════════════════════════════════════════════════
// DÉLÉGATION — Changement select MIDI
// ═══════════════════════════════════════════════════════
panelsEl.addEventListener('change', async e => {
  if (!e.target.classList.contains('midi-select')) return;
  await handleMidiSelectChange(e.target.value);
});

// ═══════════════════════════════════════════════════════
// RESIZE — recalcul hauteurs boutons
// ═══════════════════════════════════════════════════════
const resizeObserver = new ResizeObserver(() => {
  equalizeMidiButtons();
  equalizeAudioButtons();
});
resizeObserver.observe(document.getElementById('panels'));

// ═══════════════════════════════════════════════════════
// WAKE LOCK — Empêche la mise en veille de l'écran
// ═══════════════════════════════════════════════════════
async function requestWakeLock() {
  if (!('wakeLock' in navigator)) return;
  try {
    STATE.wakeLock = await navigator.wakeLock.request('screen');
    console.log('[WakeLock] Actif ✅');
  } catch (err) {
    console.warn('[WakeLock] Échec :', err.message);
  }
}

function initWakeLock() {
  requestWakeLock();
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      requestWakeLock();
    }
  });
}

// ═══════════════════════════════════════════════════════
// INIT
// ═══════════════════════════════════════════════════════
function init() {
  if (typeof MIDI_TABS === 'undefined' || typeof AUDIO_TABS === 'undefined') {
    panelsEl.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:center;
        height:100%;color:var(--color-danger);font-family:'IBM Plex Mono',monospace;
        font-size:13px;text-align:center;padding:20px;">
        ⚠️ <strong>MIDI_TABS</strong> ou <strong>AUDIO_TABS</strong> introuvable.<br>
        Vérifiez que <strong>midi.config.js</strong> et
        <strong>audio.config.js</strong> sont chargés.
      </div>`;
    return;
  }

  buildUI();
  initLogoInteraction();
  initWakeLock();

  try { initBluetooth(); } catch (e) { console.warn('[BT] Init échoué :', e); }
  try { initWebMidi();   } catch (e) { console.warn('[MIDI] Init échoué :', e); }
}

init();

