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
  audioVolume:           0.75,
};

// ═══════════════════════════════════════════════════════
// RÉFÉRENCES DOM
// ═══════════════════════════════════════════════════════
const tabNav   = document.getElementById('tab-nav');
const panelsEl = document.getElementById('panels');

// ═══════════════════════════════════════════════════════
// CONSTRUCTION DU DOM
// ═══════════════════════════════════════════════════════
function buildUI() {
  const allTabs      = [];
  const firstAudioIdx = MIDI_TABS.length;

  MIDI_TABS.forEach(tab  => allTabs.push({ ...tab, type: 'midi'  }));
  AUDIO_TABS.forEach(tab => allTabs.push({ ...tab, type: 'audio' }));

  allTabs.forEach((tab, idx) => {

    // Séparateur visuel avant le 1er onglet Audio
    if (idx === firstAudioIdx) {
      const sep = document.createElement('div');
      sep.className = 'tab-separator';
      tabNav.appendChild(sep);
    }

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
      // Calcul des hauteurs après insertion dans le DOM
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
}

// ── Contrôles MIDI ──
function buildMidiControls() {
  const wrap = document.createElement('div');
  wrap.className = 'panel-controls';
  const volPct = (STATE.midiVolume / 127 * 100).toFixed(1);
  wrap.innerHTML = `
    <div class="midi-connect">
      <select class="midi-select">
        <option value="__none__">— Connexion MIDI —</option>
      </select>
      <span class="midi-badge">Non connecté</span>
    </div>
    <div class="volume-wrap">
      <span class="vol-icon">🔊</span>
      <input type="range" class="vol-slider midi-vol"
             min="0" max="127" value="${STATE.midiVolume}"
             style="--vol-pct:${volPct}%" />
      <span class="vol-value">${STATE.midiVolume}</span>
    </div>
    <button class="emergency-stop-btn" title="All Notes Off">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
        <rect x="2" y="2" width="12" height="12" rx="1" fill="currentColor"/>
      </svg>
      STOP
    </button>

  `;

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

  wrap.querySelector('.emergency-stop-btn').addEventListener('click', () => {
    sendEmergencyStop();
  });  

  return wrap;
}

// ── Contrôles Audio ──
function buildAudioControls() {
  const wrap = document.createElement('div');
  wrap.className = 'panel-controls';
  const pct = Math.round(STATE.audioVolume * 100);
  wrap.innerHTML = `
    <div class="now-playing">
      <span class="now-playing-label">NO SOUND PLAYING</span>
      <span class="now-playing-dot"></span>
    </div>
    <div class="volume-wrap">
      <span class="vol-icon">🔊</span>
      <input type="range" class="vol-slider audio-vol"
             min="0" max="100" value="${pct}"
             style="--vol-pct:${pct}%" />
      <span class="vol-value">${pct}%</span>
    </div>
  `;

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
  });

  return wrap;
}

// ── Grille MIDI ──
function buildMidiGrid(tab) {
  const grid = document.createElement('div');
  grid.className = 'midi-grid';

  const colCount = tab.cols ?? 5;  // 5 par défaut si non défini
  const blocksPerCol = Math.ceil(tab.categories.length / colCount);  // nb blocs par colonne

  // Créer les colonnes vides
  const cols = [];
  for (let i = 0; i < colCount; i++) {
    const col = document.createElement('div');
    col.className = 'midi-col';
    grid.appendChild(col);
    cols.push(col);
  }

  // Répartir les catégories dans les colonnes (par bloc)
  tab.categories.forEach((cat, catIdx) => {
    const col = cols[Math.floor(catIdx / blocksPerCol)];

    const block = document.createElement('div');
    block.className = 'cat-block';

    const title = document.createElement('div');
    title.className = 'cat-title';
    title.style.setProperty('--cat-color', cat.color ?? 'var(--text-muted)');
    title.textContent = `${cat.icon ?? ''} ${cat.label}`;
    block.appendChild(title);

    const btnGrid = document.createElement('div');
    btnGrid.className = 'btn-grid';

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

    block.appendChild(btnGrid);
    col.appendChild(block);
  });

  return grid;
}

// ── Hauteur uniforme des boutons MIDI ──
function equalizeMidiButtons() {
  document.querySelectorAll('.panel.panel-midi.active').forEach(panel => {
    const grid = panel.querySelector('.midi-grid');
    if (!grid) return;

    const gridH  = grid.clientHeight;
    if (!gridH) return;  // panneau pas encore visible, on ignore

    const gapPx  = parseInt(getComputedStyle(grid).gap) || 8;

    grid.querySelectorAll('.midi-col').forEach(col => {
      let totalRows = 0;
      col.querySelectorAll('.btn-grid').forEach(btnGrid => {
        totalRows += Math.ceil(btnGrid.children.length / 2);
      });

      const catCount     = col.querySelectorAll('.cat-block').length;
      const titleH       = 20;  // hauteur approx d'un cat-title en px
      const usedByTitles = catCount * (titleH + 5); // 5 = gap interne cat-block
      const usedByGaps   = (catCount - 1) * gapPx;
      const available    = gridH - usedByTitles - usedByGaps;

      const gapsInGrid   = (totalRows - 1) * 5; // 5 = gap btn-grid
      const btnH         = Math.floor((available - gapsInGrid) / totalRows);

      col.style.setProperty('--btn-h', btnH + 'px');
    });
  });
}

// ── Grille Audio ──
function buildAudioGrid(tab) {
  const grid = document.createElement('div');
  grid.className = 'audio-grid';

  tab.categories.forEach(cat => {
    cat.items.forEach(item => {
      const btn = document.createElement('button');
      btn.className     = 'sound-btn';
      btn.dataset.audio = item.file;
      btn.dataset.label = item.name;
      btn.style.setProperty('--progress', '0%');

      const isImage = item.icon && /\.(png|jpg|jpeg|gif|svg|webp)$/i.test(item.icon);
      const iconHTML = isImage
        ? `<span class="btn-icon"><img src="${item.icon}" alt="${item.name}" /></span>`
        : `<span class="btn-icon">${item.icon ?? '▶'}</span>`;

      btn.innerHTML = `${iconHTML}<span class="btn-label">${item.name}</span>`;
      btn.addEventListener('click', () => {
        btn === STATE.currentSoundBtn
          ? stopSound(true)
          : (stopSound(true), playSound(btn));
      });
      grid.appendChild(btn);
    });
  });

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

  // Masquer les colonnes inutilisées en portrait
  cols.forEach((col, i) => {
    col.style.display = i < colCount ? '' : 'none';
  });

  // Vider les colonnes actives
  cols.slice(0, colCount).forEach(col => {
    while (col.firstChild) col.removeChild(col.firstChild);
  });

  // Redistribuer les blocs par colonne
  blocks.forEach((block, i) => {
    const colIdx = Math.floor(i / blocksPerCol);
    cols[colIdx].appendChild(block);
  });
}

// ═══════════════════════════════════════════════════════
// POPUP "ABOUT"
// ═══════════════════════════════════════════════════════
function buildAboutPopup() {
  // Overlay
  const overlay = document.createElement('div');
  overlay.id = 'about-overlay';
  overlay.setAttribute('aria-hidden', 'true');

  // Carte
  overlay.innerHTML = `
    <div id="about-card">
      <div id="about-title">[IMPRO] Soundboard</div>
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

  // Fermeture
  overlay.addEventListener('click', e => {
    if (e.target === overlay) closeAbout();
  });
  overlay.querySelector('#about-close-btn').addEventListener('click', closeAbout);

  // Reload
  overlay.querySelector('#about-reload-btn').addEventListener('click', async () => {
    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      for (const reg of registrations) await reg.unregister();
    }
    location.reload(true);
  });
}

function openAbout() {
  const overlay = document.getElementById('about-overlay');
  if (!overlay) return;

  // Statut SW
  const swEl = overlay.querySelector('#about-sw-status');
  if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
    swEl.textContent = 'Service Worker : actif ✓';
  } else {
    swEl.textContent = 'Service Worker : inactif';
  }

  // statut Wake Lock (Wake Lock = empêche la mise en veille)
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

  if ('ontouchstart' in window) {
    let pressTimer = null;

    const startPress = () => {
      btn.classList.add('pressing');
      pressTimer = setTimeout(() => {
        btn.classList.remove('pressing');
        openAbout();
      }, 300);
    };

    const cancelPress = () => {
      clearTimeout(pressTimer);
      btn.classList.remove('pressing');
    };

    btn.addEventListener('pointerdown',  startPress);
    btn.addEventListener('pointerup',    cancelPress);
    btn.addEventListener('pointerleave', cancelPress);
    btn.addEventListener('pointermove',  cancelPress);
    btn.addEventListener('contextmenu',  e => e.preventDefault());
  } else {
    // Desktop : clic simple suffit
    btn.addEventListener('click', () => openAbout());
  }
}


// ═══════════════════════════════════════════════════════
// NAVIGATION ONGLETS
// ═══════════════════════════════════════════════════════
function activateTab(idx) {
  document.querySelectorAll('.tab-btn').forEach((b, i) =>
    b.classList.toggle('active', i === idx));
  document.querySelectorAll('.panel').forEach((p, i) =>
    p.classList.toggle('active', i === idx));

  requestAnimationFrame(() => {
    const activePanel = document.querySelector('.panel.active');
    if (activePanel && activePanel.dataset.type === 'midi') {
      rearrangeMidiGrid(activePanel);
    }
    equalizeMidiButtons();
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
// RESIZE — recalcul hauteurs boutons MIDI
// ═══════════════════════════════════════════════════════
const resizeObserver = new ResizeObserver(() => equalizeMidiButtons());
resizeObserver.observe(document.getElementById('panels'));

// ═══════════════════════════════════════════════════════
// WAKE LOCK — Empêche la mise en veille de l'écran
// ═══════════════════════════════════════════════════════
async function requestWakeLock() {
  if (!('wakeLock' in navigator)) return; // non supporté, on ignore silencieusement
  try {
    STATE.wakeLock = await navigator.wakeLock.request('screen');
    console.log('[WakeLock] Actif ✅');
  } catch (err) {
    console.warn('[WakeLock] Échec :', err.message);
  }
}

function initWakeLock() {
  requestWakeLock();

  // Réactive automatiquement au retour sur l'appli
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
        height:100%;color:#ff3d71;font-family:'IBM Plex Mono',monospace;
        font-size:13px;text-align:center;padding:20px;">
        ⚠️ <strong>MIDI_TABS</strong> ou <strong>AUDIO_TABS</strong> introuvable.<br>
        Vérifiez que <strong>midi.config.js</strong> et
        <strong>audio.config.js</strong> sont chargés.
      </div>`;
    return;
  }

  buildUI();
  initAudioTouchFeedback(panelsEl); // dans audio.js
  initBluetooth();                  // dans midi.js
  initWebMidi();                    // dans midi.js
  initLogoInteraction();
  initWakeLock();
}

init();
