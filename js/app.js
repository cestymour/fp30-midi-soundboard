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
    } else {
      panel.appendChild(buildAudioControls());
      panel.appendChild(buildAudioGrid(tab));
    }

    panelsEl.appendChild(panel);
  });
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

  tab.categories.forEach(cat => {
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
    grid.appendChild(block);
  });

  return grid;
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

// ═══════════════════════════════════════════════════════
// NAVIGATION ONGLETS
// ═══════════════════════════════════════════════════════
function activateTab(idx) {
  document.querySelectorAll('.tab-btn').forEach((b, i) =>
    b.classList.toggle('active', i === idx));
  document.querySelectorAll('.panel').forEach((p, i) =>
    p.classList.toggle('active', i === idx));
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
}

init();
