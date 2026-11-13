// Compare les styles calculés de deux builds (référence et dist/ courant) sur plusieurs tailles d'écran.
// Usage : npm run regression:styles -- <dossier de la build de référence>
// Pour un changement purement CSS : copier dist/ avant le changement, puis le passer ici en référence.
import path from 'node:path';
import { REPO, TMP, compare, copyBuild, fail, finish, freshDir, requireDist, runScript, serve } from './common.mjs';

const ref = process.argv[2] ? path.resolve(process.argv[2]) : fail('dossier de la build de référence manquant');
process.chdir(REPO);
requireDist();

const WORK = process.env.STYLES_WORK ?? path.join(TMP, 'fp30-styles');
const OUT = path.join(WORK, 'out');
freshDir(WORK);
freshDir(OUT);
copyBuild(ref, path.join(WORK, 'ref'));
copyBuild('dist', path.join(WORK, 'new'));

await serve(path.join(WORK, 'ref'), 8092);
await serve(path.join(WORK, 'new'), 8093);
const refUrl = 'http://localhost:8092/fp30-midi-soundboard/';
const newUrl = 'http://localhost:8093/fp30-midi-soundboard/';

// Paysage, portrait, et chaque palier des media queries (1200, 1024, 900, 600, 520 px)
for (const [w, h] of [[1280, 800], [800, 1280], [1100, 700], [1000, 1300], [880, 600], [560, 900], [500, 400]]) {
  console.log(`== Styles calculés ${w}×${h}`);
  const refFile = path.join(OUT, `ref-${w}.ndjson`);
  const newFile = path.join(OUT, `new-${w}.ndjson`);
  runScript('styles.mjs', [refUrl, String(w), String(h)], refFile);
  runScript('styles.mjs', [newUrl, String(w), String(h)], newFile);
  compare('compare-styles.mjs', [refFile, newFile]);
}
finish();
