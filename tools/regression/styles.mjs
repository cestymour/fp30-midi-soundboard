// Relevé des styles calculés de chaque élément (et de ses ::before / ::after) dans une série d'états
// de l'interface. Sert à vérifier qu'un changement purement CSS (découpage en styles de composants)
// ne modifie aucun style : comparer deux relevés avec compare-styles.mjs.
// Usage : node styles.mjs <url> <largeur> <hauteur> > relevé.json
import { launchBrowser } from './browser.mjs';
const [,, url, vw, vh] = process.argv;
const browser = await launchBrowser();
const ctx = await browser.newContext({ viewport: { width: +vw, height: +vh }, serviceWorkers: 'block' });
const page = await ctx.newPage();
page.setDefaultTimeout(5000);
const errors = [];
page.on('pageerror', e => errors.push('pageerror: ' + e.message));
await page.goto(url, { waitUntil: 'networkidle' });
await page.waitForTimeout(500);

const states = [];
const dump = async (label) => {
  const s = await page.evaluate(() => {
    // Positions de lecture (styles en ligne mis à jour en continu) fixées le temps du relevé
    const freeze = new CSSStyleSheet();
    freeze.replaceSync(`
      .transport-seek-fill[style*="width"] { width: 37% !important; }
      .transport-seek-handle[style*="left"] { left: 37% !important; }
      .sound-btn[style*="--progress"]:not([style*="--progress: 0%"]) { --progress: 37% !important; }
    `);
    document.adoptedStyleSheets = [...document.adoptedStyleSheets, freeze];
    getComputedStyle(document.body).width;
    // Animations figées au début, transitions terminées : relevé indépendant du moment de la capture
    const anims = document.getAnimations();
    anims.forEach(a => {
      if (a instanceof CSSTransition) { try { a.finish(); } catch { /* transition infinie : ignorée */ } }
      else { a.pause(); a.currentTime = 0; }
    });
    const dict = new Map();
    const id = str => { if (!dict.has(str)) dict.set(str, dict.size); return dict.get(str); };
    const serialize = cs => { const parts = []; for (let i = 0; i < cs.length; i++) parts.push(cs[i] + ':' + cs.getPropertyValue(cs[i])); return parts.join(';'); };
    const elems = [];
    const walk = (el, path) => {
      const before = getComputedStyle(el, '::before');
      const after  = getComputedStyle(el, '::after');
      elems.push([path, el.tagName, id(serialize(getComputedStyle(el))),
        before.content === 'none' ? -1 : id(serialize(before)),
        after.content  === 'none' ? -1 : id(serialize(after))]);
      [...el.children].forEach((c, i) => walk(c, path + '/' + i));
    };
    walk(document.documentElement, '0');
    document.adoptedStyleSheets = document.adoptedStyleSheets.filter(sheet => sheet !== freeze);
    anims.forEach(a => { if (!(a instanceof CSSTransition)) a.play(); });
    return { elems, dict: [...dict.keys()] };
  });
  states.push({ label, ...s });
};
const tab = async i => { await page.click(`.tab-btn[data-tab="${i}"]`); await page.waitForTimeout(250); };
const tabCount = await page.$$eval('.tab-btn', bs => bs.length);
const audioTabs = await page.$$eval('.tab-btn[data-type="audio"]', bs => bs.map(b => b.dataset.tab));

for (let i = 0; i < tabCount; i++) { await tab(i); await dump('onglet ' + i); }

await tab(0);
await page.click('.panel.active .inst-btn >> nth=2'); await page.waitForTimeout(300);
await page.hover('.panel.active .inst-btn >> nth=3'); await page.waitForTimeout(300);
await dump('instrument actif, survol d\'un autre');
await page.click('.panel.active .midi-fx-open-btn'); await page.waitForTimeout(400);
await page.click('#midi-fx-overlay .fx-preset-btn >> nth=1'); await page.waitForTimeout(800);
await page.hover('#midi-fx-overlay .fx-one-reset >> nth=0'); await page.waitForTimeout(300);
await dump('popup MIDI, preset 1');
await page.keyboard.press('Escape'); await page.waitForTimeout(300);
await page.hover('.panel.active .midi-fx-reset-btn'); await page.waitForTimeout(300);
await dump('effets MIDI actifs, survol Reset');
await page.keyboard.press('Tab'); await page.keyboard.press('Tab'); await page.waitForTimeout(300);
await dump('focus clavier');

for (const t of audioTabs) {
  await tab(t);
  await page.click('.panel.active .audio-fx-open-btn'); await page.waitForTimeout(400);
  await page.click('#audio-fx-overlay .fx-preset-btn >> nth=3'); await page.waitForTimeout(800);
  await dump('popup audio, preset 3, onglet ' + t);
  await page.click('.panel.active .audio-fx-open-btn'); await page.waitForTimeout(300);
  await page.hover('.panel.active .sound-btn >> nth=1'); await page.waitForTimeout(300);
  await dump('survol d\'un son, onglet ' + t);
  await page.click('.panel.active .sound-btn >> nth=0'); await page.waitForTimeout(800);
  await page.hover('.panel.active .transport-seek'); await page.waitForTimeout(300);
  await dump('lecture, survol seek, onglet ' + t);
  await page.click('.panel.active .transport-play-pause', { force: true }); await page.waitForTimeout(600);
  await dump('pause, onglet ' + t);
  const bar = await page.$('.panel.active .transport-seek'); const bb = await bar.boundingBox();
  await page.mouse.move(bb.x + bb.width * 0.3, bb.y + bb.height / 2);
  await page.mouse.down(); await page.mouse.move(bb.x + bb.width * 0.4, bb.y + bb.height / 2); await page.waitForTimeout(300);
  await dump('glisser seek, onglet ' + t);
  await page.mouse.up(); await page.waitForTimeout(200);
  await page.click('.panel.active .emergency-stop-btn'); await page.waitForTimeout(800);
  await page.evaluate(() => { const s = document.querySelector('.panel.active .audio-vol'); s.value = '0'; s.dispatchEvent(new Event('input', { bubbles: true })); });
  await dump('arrêté, volume 0, onglet ' + t);
}

await page.route('**/sounds/**', r => r.abort());
await page.click('.panel.active .sound-btn >> nth=5'); await page.waitForTimeout(1200);
await dump('son introuvable');
await page.click('#settings-btn'); await page.waitForTimeout(300);
await dump('à propos');

console.log(JSON.stringify({ states, errors }));
await browser.close();
