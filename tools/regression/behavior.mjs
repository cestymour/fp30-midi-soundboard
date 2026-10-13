// Scénario d'interactions ; enregistre l'état du DOM après chaque étape (comparé entre v1 et nouvelle version)
import { launchBrowser } from './browser.mjs';
const [,, url, vw, vh] = process.argv;
const browser = await launchBrowser();
const ctx = await browser.newContext({ viewport: { width: +vw, height: +vh }, serviceWorkers: 'block' });
const page = await ctx.newPage();
const errors = [];
page.on('pageerror', e => errors.push('pageerror: ' + e.message));
page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
await page.goto(url, { waitUntil: 'networkidle' });
await page.waitForTimeout(500);
const steps = [];
const snap = async (label) => {
  const s = await page.evaluate(() => {
    const ov = id => { const o = document.getElementById(id); if (!o) return null; return {
      open: o.classList.contains('is-open'), aria: o.getAttribute('aria-hidden'),
      active: [...o.querySelectorAll('.fx-preset-btn.is-active')].map(b => b.textContent.trim()),
      sliders: [...o.querySelectorAll('.fx-slider')].map(i => i.value + (i.classList.contains('is-modified') ? '*' : '')),
      values: [...o.querySelectorAll('.fx-control__value')].map(v => v.textContent),
      resetOneDisabled: [...o.querySelectorAll('.fx-one-reset')].map(b => b.disabled),
      cards: [...o.querySelectorAll('.fx-control')].map(c => c.className),
    }; };
    const cls = sel => [...document.querySelectorAll(sel)].map(e => e.className);
    return {
      tabs: cls('.tab-btn'), panels: cls('.panel'),
      midiFx: ov('midi-fx-overlay'), audioFx: ov('audio-fx-overlay'),
      toolbar: cls('.midi-fx-open-btn, .midi-fx-reset-btn, .audio-fx-open-btn, .audio-fx-reset-btn'),
      playPause: [...document.querySelectorAll('.transport-play-pause')].map(b => b.className + '|' + b.disabled + '|' + b.innerHTML),
      handles: cls('.transport-seek-handle'),
      timeKnown: [...document.querySelectorAll('.transport-time')].map(t => /^\d+:\d\d \/ \d+:\d\d$/.test(t.textContent) ? 'temps' : t.textContent),
      soundBtns: [...document.querySelectorAll('.sound-btn')].filter(b => b.className !== 'sound-btn' && !/^sound-btn( sound-btn--img| animaux-\w+)*$/.test(b.className)).map(b => b.title + ':' + b.className),
      progressShown: [...document.querySelectorAll('.sound-btn')].filter(b => !['', '0%', '0.00%'].includes(b.style.getPropertyValue('--progress'))).map(b => b.title),
      progressTransition: [...document.querySelectorAll('.sound-btn')].filter(b => b.style.getPropertyValue('--progress-transition')).map(b => b.title + ':' + b.style.getPropertyValue('--progress-transition')),
      instActive: [...document.querySelectorAll('.inst-btn.active')].map(b => b.title),
      vols: [...document.querySelectorAll('.vol-slider.midi-vol, .vol-slider.audio-vol')].map(s => s.value + '|' + s.style.getPropertyValue('--vol-pct') + '|' + s.closest('.panel-controls').querySelector('.vol-value').textContent + '|' + s.closest('.panel-controls').querySelector('.vol-icon').textContent),
      badges: [...document.querySelectorAll('.midi-badge')].map(b => b.className + ':' + b.textContent),
      about: document.getElementById('about-overlay')?.style.display,
      bodySeeking: document.body.classList.contains('is-seeking'),
    };
  });
  steps.push({ label, ...s });
};
const tab = async i => { await page.click(`.tab-btn[data-tab="${i}"]`); await page.waitForTimeout(250); };
await snap('chargement');
await tab(0);
await page.click('.panel.active .inst-btn >> nth=2'); await page.waitForTimeout(100);
await snap('instrument sélectionné');
await page.click('.panel.active .midi-fx-open-btn'); await page.waitForTimeout(300);
await snap('popup MIDI ouverte');
await page.click('#midi-fx-overlay .fx-preset-btn >> nth=1'); await page.waitForTimeout(600);
await snap('preset MIDI 1');
await page.click('.panel.active .midi-fx-open-btn'); await page.waitForTimeout(200);
await tab(1); await tab(0);
await page.click('.panel.active .midi-fx-open-btn'); await page.waitForTimeout(300);
await snap('réouverture après changement d\'onglet');
await page.click('#midi-fx-overlay .fx-one-reset >> nth=0'); await page.waitForTimeout(600);
await snap('reset d\'un seul curseur');
await page.evaluate(() => { const i = document.querySelectorAll('#midi-fx-overlay .fx-slider')[1]; i.value = '50'; i.dispatchEvent(new Event('input', { bubbles: true })); });
await page.waitForTimeout(100);
await snap('curseur chorus à 50');
await page.click('#midi-fx-overlay .fx-preset-btn >> nth=4'); await page.waitForTimeout(600);
await snap('preset MIDI 4');
await page.keyboard.press('Escape'); await page.waitForTimeout(200);
await snap('Échap');
await page.click('.panel.active .midi-fx-reset-btn'); await page.waitForTimeout(600);
await snap('reset global depuis la barre');
const lastAudio = await page.$$eval('.tab-btn[data-type="audio"]', bs => bs[bs.length - 1].dataset.tab);
await tab(lastAudio);
await page.click('.panel.active .audio-fx-open-btn'); await page.waitForTimeout(300);
await page.click('#audio-fx-overlay .fx-preset-btn >> nth=3'); await page.waitForTimeout(600);
await snap('preset audio 3');
await page.click('#audio-fx-overlay .fx-one-reset >> nth=0'); await page.waitForTimeout(600);
await snap('audio : reset d\'un curseur');
await page.click('.panel.active .audio-fx-open-btn'); await page.waitForTimeout(200);
await page.click('.panel.active .sound-btn >> nth=0'); await page.waitForTimeout(1500);
await snap('lecture son 0');
await page.click('.panel.active .transport-play-pause'); await page.waitForTimeout(600);
await snap('pause');
await page.click('.panel.active .transport-play-pause'); await page.waitForTimeout(600);
await snap('reprise');
const bar = await page.$('.panel.active .transport-seek'); const bb = await bar.boundingBox();
await page.mouse.click(bb.x + bb.width * 0.5, bb.y + bb.height / 2); await page.waitForTimeout(300);
const fill = await page.$eval('.panel.active .transport-seek-fill', e => Math.round(parseFloat(e.style.width) / 10) * 10);
await snap('seek 50 % (remplissage ≈ ' + fill + ' %)');
await page.click('.panel.active .sound-btn >> nth=1'); await page.waitForTimeout(1500);
await snap('changement de son');
await page.click('.panel.active .sound-btn >> nth=1'); await page.waitForTimeout(800);
await snap('stop par re-clic');
await page.click('.panel.active .sound-btn >> nth=2'); await page.waitForTimeout(1200);
await page.click('.panel.active .transport-play-pause'); await page.waitForTimeout(600);
await page.click('.panel.active .sound-btn >> nth=2'); await page.waitForTimeout(1200);
await snap('re-clic en pause : redémarrage');
await page.click('.panel.active .emergency-stop-btn'); await page.waitForTimeout(800);
await snap('arrêt d\'urgence');
await page.evaluate(() => { const s = document.querySelector('.panel.active .audio-vol'); s.value = '30'; s.dispatchEvent(new Event('input', { bubbles: true })); });
await snap('volume audio 30');
await tab(0);
await page.evaluate(() => { const s = document.querySelector('.panel.active .midi-vol'); s.value = '20'; s.dispatchEvent(new Event('input', { bubbles: true })); });
await snap('volume MIDI 20');
await page.evaluate(() => { const b = [...document.querySelectorAll('.sound-btn')].find(b => b.dataset.audio.includes('cheval_hennissement')); b.dataset.audio = 'sounds/inexistant.mp3'; });
await page.click('#settings-btn'); await page.waitForTimeout(200);
await snap('à propos');
console.log(JSON.stringify({ steps, errors }));
await browser.close();
