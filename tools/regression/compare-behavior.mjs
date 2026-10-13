// Compare étape par étape deux sorties JSON de behavior.mjs (v1 / nouvelle version)
import fs from 'node:fs';
const [,, fileA, fileB] = process.argv;
const a = JSON.parse(fs.readFileSync(fileA, 'utf-8'));
const b = JSON.parse(fs.readFileSync(fileB, 'utf-8'));
let gaps = 0;
console.log(`${a.steps.length} étapes ; erreurs v1 = ${JSON.stringify(a.errors)} ; nouvelle = ${JSON.stringify(b.errors)}`);
a.steps.forEach((sa, i) => {
  const sb = b.steps[i] ?? {};
  const keys = Object.keys(sa).filter(k => JSON.stringify(sa[k]) !== JSON.stringify(sb[k]));
  if (!keys.length) { console.log('  ok    ', sa.label); return; }
  gaps++;
  console.log('  ÉCART ', sa.label, keys);
  for (const k of keys) {
    console.log('     v1 :', JSON.stringify(sa[k]).slice(0, 300));
    console.log('     new:', JSON.stringify(sb[k]).slice(0, 300));
  }
});
if (b.errors.length) gaps++;
process.exitCode = gaps ? 1 : 0;
