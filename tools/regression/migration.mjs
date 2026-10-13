// Scénario : v1 installée (SW + un son en cache) → déploiement de la nouvelle build → hors ligne
import { launchBrowser } from './browser.mjs';
import { execSync } from 'node:child_process';
const SITE = process.env.SITE2 ?? '/tmp/site2/fp30-midi-soundboard';
const URL_ = 'http://localhost:8095/fp30-midi-soundboard/';
const deploy = src => execSync(`rm -rf ${SITE} && mkdir -p ${SITE} && cp -r ${src}/. ${SITE}/`);
const browser = await launchBrowser();
const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
const page = await ctx.newPage();
const logs = [];
page.on('console', m => { if (!m.text().includes('Pas de connexion MIDI')) logs.push(m.type() + ': ' + m.text()); });
page.on('pageerror', e => logs.push('pageerror: ' + e.message));
const cacheState = () => page.evaluate(async () => {
  const out = {};
  for (const k of await caches.keys()) out[k] = (await (await caches.open(k)).keys()).map(r => decodeURIComponent(r.url.replace(location.origin, '')));
  return out;
});
const playFirstAudio = async (idx = 0) => {
  const t = await page.$$eval('.tab-btn[data-type="audio"]', bs => bs[bs.length - 1].dataset.tab);
  await page.click(`.tab-btn[data-tab="${t}"]`); await page.waitForTimeout(200);
  const file = await page.$$eval('.panel.active .sound-btn', (b, i) => b[i].dataset.audio, idx);
  await page.click(`.panel.active .sound-btn >> nth=${idx}`); await page.waitForTimeout(2500);
  const st = await page.evaluate(() => ({ playing: document.querySelectorAll('.sound-btn.playing').length, missing: document.querySelectorAll('.sound-btn.missing').length, time: document.querySelector('.panel.active .transport-time')?.textContent }));
  await page.click('.panel.active .emergency-stop-btn'); await page.waitForTimeout(600);
  return { file, ...st };
};

// 1. v1 en production
deploy(process.env.V1_DIR ?? '/tmp/v1');
await page.goto(URL_, { waitUntil: 'networkidle' });
await page.waitForTimeout(1500); await page.reload({ waitUntil: 'networkidle' }); await page.waitForTimeout(500);
console.log('v1 version:', await page.evaluate(() => document.getElementById('about-version')?.textContent));
console.log('v1 lecture:', await playFirstAudio());
// Simule un son mis en cache par l'ancien SW (le 4e de l'onglet films)
const legacyFile = await page.$$eval('.panel.active .sound-btn', b => b[3].dataset.audio);
await page.evaluate(async f => { const c = await caches.open('impro-audio-1.6.4'); const u = new URL(f, location.href); await c.put(u, await fetch(u, { cache: 'no-store' })); }, legacyFile);
console.log('v1 caches:', Object.fromEntries(Object.entries(await cacheState()).map(([k, v]) => [k, v.length + ' entrées' + (k.includes('audio') ? ' ' + JSON.stringify(v) : '')])));

// 2. Déploiement de la nouvelle version
deploy(process.env.NEW_BUILD ?? new URL('../../dist', import.meta.url).pathname);
await page.reload({ waitUntil: 'networkidle' });   // page encore servie par l'ancien SW ; le navigateur détecte le nouveau sw.js
await page.waitForTimeout(3000);
await page.reload({ waitUntil: 'networkidle' }); await page.waitForTimeout(1000);
console.log('après MAJ version:', await page.evaluate(() => document.getElementById('about-version')?.textContent));
console.log('après MAJ SW:', await page.evaluate(async () => (await navigator.serviceWorker.getRegistration())?.active?.scriptURL));
const c2 = await cacheState();
console.log('après MAJ caches:', Object.fromEntries(Object.entries(c2).map(([k, v]) => [k, v.length + ' entrées' + (k === 'impro-audio' ? ' ' + JSON.stringify(v) : '')])));

// 3. En ligne : jouer le 2e son (requêtes Range) pour le mettre en cache
console.log('2e son en ligne:', await playFirstAudio(1));
console.log('impro-audio:', (await cacheState())['impro-audio']);
// 4. Hors ligne réel : serveur arrêté
execSync(`kill $(cat ${process.env.SERVER_PID_FILE ?? '/tmp/server.pid'})`);
await page.waitForTimeout(500);
await page.reload({ waitUntil: 'load' }); await page.waitForTimeout(1000);
console.log('hors ligne onglets:', await page.$$eval('.tab-btn', b => b.length), 'polices:', await page.evaluate(() => document.fonts.check('16px Rajdhani')));
console.log('hors ligne, 2e son (joué en ligne):', await playFirstAudio(1));
await page.click(`.panel.active .sound-btn >> nth=1`); await page.waitForTimeout(1500);
const bar = await page.$('.panel.active .transport-seek'); const bb = await bar.boundingBox();
await page.mouse.click(bb.x + bb.width * 0.8, bb.y + bb.height / 2); await page.waitForTimeout(1500);
console.log('hors ligne, seek à 80 % :', await page.$eval('.panel.active .transport-time', e => e.textContent), await page.evaluate(() => document.querySelectorAll('.sound-btn.playing').length));
await page.click('.panel.active .emergency-stop-btn'); await page.waitForTimeout(600);
console.log('hors ligne, 4e son (venu de l\'ancien cache):', await playFirstAudio(3));
console.log('hors ligne, 3e son (jamais joué):', await playFirstAudio(2));
console.log('caches finaux:', Object.fromEntries(Object.entries(await cacheState()).map(([k, v]) => [k, v.length])));
console.log('LOGS:\n' + logs.join('\n'));
await browser.close();
