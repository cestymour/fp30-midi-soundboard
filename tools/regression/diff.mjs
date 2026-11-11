// Compare deux dossiers de captures au pixel près ; écrit les images de différence dans le dossier parent
// Usage : node diff.mjs <dossier référence> <dossier nouvelle version>
import fs from 'node:fs';
import path from 'node:path';
import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';

const [,, a, b] = process.argv;
for (const f of fs.readdirSync(a).sort()) {
  const A = PNG.sync.read(fs.readFileSync(path.join(a, f)));
  const B = PNG.sync.read(fs.readFileSync(path.join(b, f)));
  if (A.width !== B.width || A.height !== B.height) { console.log(f, 'TAILLE DIFF'); continue; }
  const D = new PNG({ width: A.width, height: A.height });
  const n = pixelmatch(A.data, B.data, D.data, A.width, A.height, { threshold: 0 });
  if (n) fs.writeFileSync(path.join(path.dirname(path.resolve(a)), 'diff-' + f), PNG.sync.write(D));
  console.log(f, n ? n + ' px différents' : 'IDENTIQUE');
}
