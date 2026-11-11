// Non-régression automatique : compare la build courante (dist/) à une version de référence,
// par défaut la dernière version publiée (dernier tag vX.Y.Z), ou REGRESSION_REF (tag ou commit).
// Usage : npm run build, puis npm run regression. Voir tools/regression/README.md.
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import {
  REPO, TMP, compare, copyBuild, exec, fail, finish, freshDir, npm, onExit, requireDist, runScript, serve,
} from './common.mjs';

process.chdir(REPO);
requireDist();

const WORK = process.env.REGRESSION_WORK ?? path.join(TMP, 'fp30-regression');
const REF = process.env.REGRESSION_REF
  ?? execFileSync('git', ['describe', '--tags', '--abbrev=0', '--match', 'v[0-9]*.[0-9]*.[0-9]*'], { encoding: 'utf8' }).trim();
const REF_DIR = path.join(WORK, 'ref');
const OUT = path.join(WORK, 'out');

freshDir(WORK);
freshDir(OUT);
copyBuild('dist', path.join(WORK, 'site'));

// Version de référence : v1-vanilla est un site statique, servi tel quel ;
// les versions suivantes sont construites (npm ci + build) dans un worktree
console.log(`== Référence : ${REF}`);
exec('git', ['worktree', 'prune'], { stdio: 'ignore' });
if (!exec('git', ['worktree', 'add', '-f', REF_DIR, REF], { stdio: 'ignore' })) fail(`référence introuvable : ${REF}`);
onExit(() => exec('git', ['worktree', 'remove', '--force', REF_DIR], { stdio: 'ignore' }));

let refRoot, refUrl;
if (REF === 'v1-vanilla') {
  refRoot = REF_DIR;
  refUrl = 'http://localhost:8090/';
} else {
  const opts = { cwd: REF_DIR };
  if (!npm(['ci', '--no-audit', '--no-fund', '--loglevel=error'], opts)
    || !npm(['run', 'build', '--silent'], { ...opts, stdio: ['ignore', 'ignore', 'inherit'] })) {
    fail('build de la référence impossible');
  }
  refRoot = path.join(WORK, 'site-ref');
  copyBuild(path.join(REF_DIR, 'dist'), refRoot);
  refUrl = 'http://localhost:8090/fp30-midi-soundboard/';
}
const newUrl = 'http://localhost:8091/fp30-midi-soundboard/';

await serve(refRoot, 8090);
await serve(path.join(WORK, 'site'), 8091);

console.log('== Captures (paysage 1280×800, portrait 800×1280)');
runScript('compare.mjs', ['ref', refUrl, path.join(OUT, 'shots/ref')], path.join(OUT, 'shots-ref.json'));
runScript('compare.mjs', ['new', newUrl, path.join(OUT, 'shots/new')], path.join(OUT, 'shots-new.json'));
compare('diff.mjs', [path.join(OUT, 'shots/ref'), path.join(OUT, 'shots/new')]);

for (const [w, h] of [[1280, 800], [800, 1280]]) {
  console.log(`== Scénario d'interactions ${w}×${h}`);
  const refFile = path.join(OUT, `behavior-ref-${w}.json`);
  const newFile = path.join(OUT, `behavior-new-${w}.json`);
  runScript('behavior.mjs', [refUrl, String(w), String(h)], refFile);
  runScript('behavior.mjs', [newUrl, String(w), String(h)], newFile);
  compare('compare-behavior.mjs', [refFile, newFile]);
}

console.log(`Résultats : ${OUT}`);
finish();
