// Compare le rendu de la version de référence et de la nouvelle build : captures + DOM sérialisé
import { launchBrowser } from './browser.mjs';
import fs from 'node:fs';
const [,, label, url, outDir] = process.argv;
fs.mkdirSync(outDir, { recursive: true });
const browser = await launchBrowser();
const results = {};
for (const [name, vp] of [['land', { width: 1280, height: 800 }], ['port', { width: 800, height: 1280 }]]) {
  const ctx = await browser.newContext({ viewport: vp, serviceWorkers: 'block' });
  const page = await ctx.newPage();
  const errors = [];
  page.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') errors.push(m.type() + ': ' + m.text()); });
  page.on('pageerror', e => errors.push('pageerror: ' + e.message));
  page.on('requestfailed', r => errors.push('reqfail: ' + r.url()));
  page.on('response', r => { if (r.status() >= 400) errors.push(r.status() + ' ' + r.url()); });
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);
  const tabs = await page.$$eval('.tab-btn', bs => bs.length);
  for (let i = 0; i < tabs; i++) {
    await page.click(`.tab-btn[data-tab="${i}"]`);
    await page.waitForTimeout(250);
    await page.screenshot({ path: `${outDir}/${name}-tab${i}.png` });
  }
  // FX MIDI sur onglet 0
  await page.click('.tab-btn[data-tab="0"]'); await page.waitForTimeout(200);
  await page.click('.panel.active .midi-fx-open-btn'); await page.waitForTimeout(300);
  await page.click('#midi-fx-overlay [data-midi-preset="hall"]'); await page.waitForTimeout(600);
  await page.screenshot({ path: `${outDir}/${name}-midifx.png` });
  await page.click('.panel.active .midi-fx-open-btn'); await page.waitForTimeout(200);
  // FX audio sur premier onglet audio
  const firstAudio = await page.$eval('.tab-btn[data-type="audio"]', b => b.dataset.tab);
  await page.click(`.tab-btn[data-tab="${firstAudio}"]`); await page.waitForTimeout(200);
  await page.click('.panel.active .audio-fx-open-btn'); await page.waitForTimeout(300);
  await page.click('#audio-fx-overlay [data-preset="radio"]'); await page.waitForTimeout(600);
  await page.screenshot({ path: `${outDir}/${name}-audiofx.png` });
  await page.click('.panel.active .audio-fx-open-btn'); await page.waitForTimeout(200);
  // Lecture d'un son
  await page.click('.panel.active .sound-btn'); await page.waitForTimeout(1500);
  const playing = await page.evaluate(() => ({
    playing: document.querySelectorAll('.sound-btn.playing').length,
    missing: document.querySelectorAll('.sound-btn.missing').length,
    time: document.querySelector('.panel.active .transport-time')?.textContent,
  }));
  await page.screenshot({ path: `${outDir}/${name}-playing.png` });
  await page.click('#settings-btn'); await page.waitForTimeout(200);
  const about = await page.$eval('#about-card', e => e.innerText);
  await page.screenshot({ path: `${outDir}/${name}-about.png` });
  results[name] = { tabs, errors, playing, about };
  await ctx.close();
}
await browser.close();
console.log(JSON.stringify(results, null, 1));
