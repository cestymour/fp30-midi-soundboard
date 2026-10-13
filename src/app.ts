/* ================================================================
   app.ts — Chef d'orchestre : construction DOM,
            navigation onglets, initialisation
================================================================ */

import type { AudioItem, AudioTab, Category, MidiTab } from './types.ts';
import { STATE } from './state.ts';
import { MIDI_TABS } from './config/midi.config.ts';
import { AUDIO_TABS } from './config/audio.config.ts';
import { sendEmergencyStopMidi, setMidiVolume } from './midi/midi.ts';
import { initBluetooth, initWebMidi, selectMidiConnection } from './midi/connection.ts';
import { emergencyStopAudio, playSound, setAudioVolume, stopSound, togglePlayPause } from './audio/playback.ts';
import { bindMidiConnectionUI, selectInstrument, syncMidiSliders } from './ui/midi-ui.ts';
import { bindPlaybackUI, initSeekBarDrag, registerSoundButton, syncAudioSliders } from './ui/transport.ts';
import { audioFxOverlay, midiFxOverlay, refreshFxToolbarButtons, resetAllFXEffects } from './ui/fx-overlays.ts';

// ═══════════════════════════════════════════════════════
// RÉFÉRENCES DOM
// ═══════════════════════════════════════════════════════
// Présents dans index.html
const tabNav   = document.getElementById('tab-nav')!;
const panelsEl = document.getElementById('panels')!;

// ═══════════════════════════════════════════════════════
// UTILITAIRES DOM — blocs réutilisables
// ═══════════════════════════════════════════════════════

/** Crée un bouton d'arrêt d'urgence avec SVG hazard */
function buildEmergencyStopBtn(extraClass?: string): HTMLButtonElement {
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

function buildPanelUtilityBtn({ className, title, icon, label }: {
  className: string; title: string; icon: string; label: string;
}): HTMLButtonElement {
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
function isImagePath(str: string | undefined): boolean {
  return !!str && /\.(png|jpg|jpeg|gif|svg|webp)$/i.test(str);
}

/** Génère le HTML d'icône (image ou emoji) et indique si c'est une image */
function buildIconHTML(item: { name: string; icon?: string; img?: string }): { html: string; hasImage: boolean } {
  let hasImage = false;
  let html: string;

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
function buildCatTitle(cat: Category<unknown>): HTMLDivElement {
  const title = document.createElement('div');
  title.className = 'cat-title';
  title.style.setProperty('--cat-color', cat.color ?? 'var(--text-muted)');
  title.textContent = `${cat.icon ?? ''} ${cat.label}`;
  return title;
}

/** Crée un bloc catégorie (titre + grille de boutons vide) */
function buildCatBlock(
  cat: Category<unknown>, blockClass: string, gridClass: string,
): { block: HTMLDivElement; btnGrid: HTMLDivElement } {
  const block = document.createElement('div');
  block.className = blockClass;
  block.appendChild(buildCatTitle(cat));

  const btnGrid = document.createElement('div');
  btnGrid.className = gridClass;
  block.appendChild(btnGrid);

  return { block, btnGrid };
}

/** Crée N colonnes dans un conteneur et retourne le tableau */
function createColumns(container: HTMLElement, count: number, className: string): HTMLDivElement[] {
  const cols: HTMLDivElement[] = [];
  for (let i = 0; i < count; i++) {
    const col = document.createElement('div');
    col.className = className;
    container.appendChild(col);
    cols.push(col);
  }
  return cols;
}

/** Crée un bouton audio (sound-btn) avec tous ses attributs et son listener */
function buildSoundBtn(item: AudioItem): HTMLButtonElement {
  const btn = document.createElement('button');
  btn.className = 'sound-btn';
  btn.dataset.audio = item.file;
  btn.dataset.label = item.name;
  btn.dataset.start = String(item.start ?? 0);
  btn.dataset.end   = String(item.end   ?? '');
  btn.style.setProperty('--progress', '0%');

  if (item.catClass) btn.classList.add(item.catClass);

  const icon = buildIconHTML(item);
  if (icon.hasImage) btn.classList.add('sound-btn--img');

  btn.innerHTML = `${icon.html}<span class="btn-label">${item.name}</span>`;
  btn.title = item.title ?? item.name;

  btn.addEventListener('click', () => {
    if (item === STATE.currentSoundItem) {
      // Ce bouton est actif → stop (ou restart si en pause)
      if (STATE.isPaused) {
        // En pause → restart depuis le début
        stopSound(false);
        playSound(item);
      } else {
        // En lecture → stop
        stopSound(true);
      }
    } else {
      // Autre bouton → stop l'ancien, play le nouveau
      stopSound(true);
      playSound(item);
    }
  });

  registerSoundButton(item, btn);

  return btn;
}

/** Met à jour l'emoji de volume selon le pourcentage */
function updateVolIcon(el: Element, val: number, max: number): void {
  const pct = val / max * 100;
  if (pct === 0)     el.textContent = '🔇';
  else if (pct < 35) el.textContent = '🔈';
  else if (pct < 70) el.textContent = '🔉';
  else               el.textContent = '🔊';
}

/**
 * Calcule et applique une hauteur uniforme aux boutons d'un panneau en colonnes.
 */
interface EqualizeConfig {
  panelSelector:    string;
  gridSelector:     string;
  guardSelector:    string | null;
  colSelector:      string;
  btnGridSelector:  string;
  catBlockSelector: string;
  colsPerRow:       number;
}

function equalizeColumnButtons(cfg: EqualizeConfig): void {
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

    grid.querySelectorAll<HTMLElement>(cfg.colSelector).forEach(col => {
      let totalRows = 0;
      col.querySelectorAll(cfg.btnGridSelector).forEach(btnGrid => {
        totalRows += Math.ceil(btnGrid.children.length / cfg.colsPerRow);
      });

      const catCount   = col.querySelectorAll(cfg.catBlockSelector).length;
      const firstTitle = col.querySelector<HTMLElement>('.cat-title');
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

function equalizeMidiButtons(): void {
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

function equalizeAudioButtons(): void {
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

/** Arrêt d'urgence total — coupe MIDI + Audio */
function emergencyStopAll(): void {
  emergencyStopAudio();
  sendEmergencyStopMidi();
}

// ═══════════════════════════════════════════════════════
// CONSTRUCTION DU DOM
// ═══════════════════════════════════════════════════════
type TabWithType = (MidiTab & { type: 'midi' }) | (AudioTab & { type: 'audio' });

function buildUI(): void {
  const allTabs: TabWithType[] = [];

  MIDI_TABS.forEach(tab  => allTabs.push({ ...tab, type: 'midi'  }));
  AUDIO_TABS.forEach(tab => allTabs.push({ ...tab, type: 'audio' }));

  allTabs.forEach((tab, idx) => {

    // ── Onglet ──
    const btn = document.createElement('button');
    btn.className = 'tab-btn' + (idx === 0 ? ' active' : '');
    btn.dataset.tab  = String(idx);
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
    panel.dataset.panel = String(idx);
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
  const firstMidiPanel = document.querySelector<HTMLElement>('.panel.panel-midi.active');
  if (firstMidiPanel) rearrangeMidiGrid(firstMidiPanel);

  // Écouter les changements d'orientation
  const orientationMQ = window.matchMedia('(orientation: portrait)');
  orientationMQ.addEventListener('change', () => {
    const activePanel = document.querySelector<HTMLElement>('.panel.active');
    if (activePanel && activePanel.dataset.type === 'midi') {
      rearrangeMidiGrid(activePanel);
    }
    equalizeMidiButtons();
  });

  buildAboutPopup();
  midiFxOverlay.build();
  audioFxOverlay.build();
}

// ── Contrôles MIDI ──
function buildMidiControls(): HTMLDivElement {
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
    icon: '🎚️',
    label: 'Effets',
  });
  const midiFxResetBtn = buildPanelUtilityBtn({
    className: 'midi-fx-reset-btn',
    title: 'Réinitialiser les effets piano',
    icon: '\u21BA',
    label: 'Reset',
  });

  const controlsRight = wrap.querySelector('.controls-right')!;
  const volumeWrap = controlsRight.querySelector('.volume-wrap');
  const midiFxBtnGroup = document.createElement('div');
  midiFxBtnGroup.className = 'fx-btn-group';
  midiFxBtnGroup.appendChild(midiFxOpenBtn);
  midiFxBtnGroup.appendChild(midiFxResetBtn);
  controlsRight.insertBefore(midiFxBtnGroup, volumeWrap);
  controlsRight.insertBefore(stopBtn, volumeWrap);

  midiFxOpenBtn.addEventListener('click', () => midiFxOverlay.open());
  midiFxResetBtn.addEventListener('click', resetAllFXEffects);

  const slider = wrap.querySelector<HTMLInputElement>('.midi-vol')!;
  const valEl  = wrap.querySelector('.vol-value')!;
  const iconEl = wrap.querySelector('.vol-icon')!;

  slider.addEventListener('input', () => {
    setMidiVolume(parseInt(slider.value, 10));
    const pct = (STATE.midiVolume / 127 * 100).toFixed(1);
    slider.style.setProperty('--vol-pct', pct + '%');
    valEl.textContent = String(STATE.midiVolume);
    updateVolIcon(iconEl, STATE.midiVolume, 127);
    syncMidiSliders(STATE.midiVolume);
  });

  return wrap;
}

// ── Contrôles Audio ──
function buildAudioControls(): HTMLDivElement {
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
  const controlsRight = wrap.querySelector('.controls-right')!;
  const volumeWrap = controlsRight.querySelector('.volume-wrap');
  const fxOpenBtn = buildPanelUtilityBtn({
    className: 'audio-fx-open-btn',
    title: 'Mixer audio',
    icon: '🎚️',
    label: 'Effets',
  });
  const fxResetBtn = buildPanelUtilityBtn({
    className: 'audio-fx-reset-btn',
    title: 'Réinitialiser les effets audio',
    icon: '\u21BA',
    label: 'Reset',
  });
  const fxBtnGroup = document.createElement('div');
  fxBtnGroup.className = 'fx-btn-group';
  fxBtnGroup.appendChild(fxOpenBtn);
  fxBtnGroup.appendChild(fxResetBtn);
  controlsRight.insertBefore(fxBtnGroup, volumeWrap);
  controlsRight.insertBefore(stopBtn, volumeWrap);

  const slider = wrap.querySelector<HTMLInputElement>('.audio-vol')!;
  const valEl  = wrap.querySelector('.vol-value')!;
  const iconEl = wrap.querySelector('.vol-icon')!;

  slider.addEventListener('input', () => {
    setAudioVolume(parseInt(slider.value, 10) / 100);
    const p = Math.round(STATE.audioVolume * 100);
    slider.style.setProperty('--vol-pct', p + '%');
    valEl.textContent = p + '%';
    updateVolIcon(iconEl, p, 100);
    syncAudioSliders(p);
    if (audioFxOverlay.isOpen) audioFxOverlay.sync();
  });

  // Play/Pause
  wrap.querySelector('.transport-play-pause')!.addEventListener('click', togglePlayPause);
  fxOpenBtn.addEventListener('click', () => audioFxOverlay.open());
  fxResetBtn.addEventListener('click', resetAllFXEffects);

  // Seek (clic + drag)
  const seekBar = wrap.querySelector<HTMLElement>('.transport-seek')!;
  initSeekBarDrag(seekBar);

  return wrap;
}

// ── Grille MIDI ──
function buildMidiGrid(tab: MidiTab): HTMLDivElement {
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
function buildAudioGrid(tab: AudioTab): HTMLDivElement {
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
function rearrangeMidiGrid(panel: HTMLElement): void {
  const grid = panel.querySelector('.midi-grid');
  if (!grid) return;

  const isPortrait = window.matchMedia('(orientation: portrait)').matches;
  const blocks = Array.from(grid.querySelectorAll('.cat-block'));
  const cols = Array.from(grid.querySelectorAll<HTMLElement>('.midi-col'));

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
function buildAboutPopup(): void {
  const overlay = document.createElement('div');
  overlay.id = 'about-overlay';
  overlay.setAttribute('aria-hidden', 'true');

  overlay.innerHTML = `
    <div id="about-card">
      <div id="about-title">[IMPRO] Soundboard</div>
      <div id="about-work">Work with 🎹 Piano Roland FP30X</div>
      <div id="about-version">v${__APP_VERSION__}</div>
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

  document.getElementById('app')!.appendChild(overlay);

  overlay.addEventListener('click', e => {
    if (e.target === overlay) closeAbout();
  });
  overlay.querySelector('#about-close-btn')!.addEventListener('click', closeAbout);

  overlay.querySelector('#about-reload-btn')!.addEventListener('click', async () => {
    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      for (const reg of registrations) await reg.unregister();
    }
    location.reload();
  });
}

function openAbout(): void {
  const overlay = document.getElementById('about-overlay');
  if (!overlay) return;

  const swEl = overlay.querySelector('#about-sw-status')!;
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

function closeAbout(): void {
  const overlay = document.getElementById('about-overlay');
  if (!overlay) return;
  overlay.setAttribute('aria-hidden', 'true');
  overlay.style.display = 'none';
}

function initLogoInteraction(): void {
  const btn = document.getElementById('settings-btn')!;
  btn.addEventListener('click', openAbout);
  btn.addEventListener('contextmenu', e => e.preventDefault());
}

// ═══════════════════════════════════════════════════════
// NAVIGATION ONGLETS
// ═══════════════════════════════════════════════════════
function activateTab(idx: number): void {
  if (midiFxOverlay.isOpen)  midiFxOverlay.close();
  if (audioFxOverlay.isOpen) audioFxOverlay.close();

  document.querySelectorAll('.tab-btn').forEach((b, i) =>
    b.classList.toggle('active', i === idx));
  document.querySelectorAll('.panel').forEach((p, i) =>
    p.classList.toggle('active', i === idx));

  refreshFxToolbarButtons();

  requestAnimationFrame(() => {
    const activePanel = document.querySelector<HTMLElement>('.panel.active');
    if (activePanel && activePanel.dataset.type === 'midi') {
      rearrangeMidiGrid(activePanel);
      equalizeMidiButtons();
    } else if (activePanel && activePanel.dataset.type === 'audio') {
      equalizeAudioButtons();
    }
  });
}

function initTabNavigation(): void {
  tabNav.addEventListener('click', e => {
    const btn = (e.target as Element).closest<HTMLElement>('.tab-btn');
    if (!btn) return;
    activateTab(parseInt(btn.dataset.tab!, 10));
  });
}

// ═══════════════════════════════════════════════════════
// DÉLÉGATION — Changement select MIDI
// ═══════════════════════════════════════════════════════
function initMidiSelectDelegation(): void {
  panelsEl.addEventListener('change', async e => {
    const target = e.target as HTMLSelectElement;
    if (!target.classList.contains('midi-select')) return;
    await selectMidiConnection(target.value);
  });
}

// ═══════════════════════════════════════════════════════
// RESIZE — recalcul hauteurs boutons
// ═══════════════════════════════════════════════════════
function initResizeObserver(): void {
  const resizeObserver = new ResizeObserver(() => {
    equalizeMidiButtons();
    equalizeAudioButtons();
  });
  resizeObserver.observe(document.getElementById('panels')!);
}

// ═══════════════════════════════════════════════════════
// WAKE LOCK — Empêche la mise en veille de l'écran
// ═══════════════════════════════════════════════════════
async function requestWakeLock(): Promise<void> {
  if (!('wakeLock' in navigator)) return;
  try {
    STATE.wakeLock = await navigator.wakeLock.request('screen');
    console.log('[WakeLock] Actif ✅');
  } catch (err) {
    console.warn('[WakeLock] Échec :', (err as Error).message);
  }
}

function initWakeLock(): void {
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
export function init(): void {
  initTabNavigation();
  initMidiSelectDelegation();
  initResizeObserver();
  bindMidiConnectionUI();
  bindPlaybackUI();

  buildUI();
  initLogoInteraction();
  initWakeLock();

  try { initBluetooth(); } catch (e) { console.warn('[BT] Init échoué :', e); }
  try { initWebMidi();   } catch (e) { console.warn('[MIDI] Init échoué :', e); }
}

