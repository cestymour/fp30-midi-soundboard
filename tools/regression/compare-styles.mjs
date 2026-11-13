// Compare deux relevés de styles calculés (styles.mjs) : liste les propriétés qui diffèrent
// Usage : node compare-styles.mjs <avant.ndjson> <après.ndjson> (un état par ligne, puis { errors })
import { createReadStream } from 'node:fs';
import { createInterface } from 'node:readline';
const [fileA, fileB] = process.argv.slice(2);
const lines = f => createInterface({ input: createReadStream(f), crlfDelay: Infinity })[Symbol.asyncIterator]();
// Identifiants aléatoires du bouton d'arrêt d'urgence (dégradés SVG) : non significatifs
// Préfixe ajouté par Svelte aux @keyframes déclarées dans un composant : non significatif
const normalize = str => str.replace(/url\("#([a-z-]+)-[a-z0-9]+"\)/g, 'url("#$1-ID")').replace(/\bsvelte-[a-z0-9]+-/g, '');
const toMap = str => new Map(normalize(str).split(';').map(p => { const i = p.indexOf(':'); return [p.slice(0, i), p.slice(i + 1)]; }));
// Largeur de la barre de progression d'un son (::before en %) : dépend du moment de la capture
const isTimingOnly = (props, ma, mb, pseudo) => pseudo === '::before'
  && props.every(p => (p === 'width' || p === 'inline-size') && /%$/.test(ma.get(p)) && /%$/.test(mb.get(p)));
const PSEUDO = ['', '', '', '::before', '::after'];
let total = 0;
let count = 0;
const itA = lines(fileA), itB = lines(fileB);
let errorsA = null, errorsB = null;
const compareState = (sa, sb) => {
  let diffs = 0;
  // Éléments appariés par chemin et balise : un élément ajouté ou retiré ne décale pas les suivants
  const key = e => e[0] + ' ' + e[1];
  const byKey = new Map(sb.elems.map(e => [key(e), e]));
  const keysA = new Set(sa.elems.map(key));
  const onlyA = sa.elems.filter(e => !byKey.has(key(e))).map(key);
  const onlyB = sb.elems.filter(e => !keysA.has(key(e))).map(key);
  if (onlyA.length || onlyB.length) {
    console.log(`  ÉCART  ${sa.label} : ${sa.elems.length} éléments → ${sb.elems.length}`);
    if (onlyA.length) console.log(`           seulement avant : ${onlyA.slice(0, 8).join(', ')}${onlyA.length > 8 ? '…' : ''}`);
    if (onlyB.length) console.log(`           seulement après : ${onlyB.slice(0, 8).join(', ')}${onlyB.length > 8 ? '…' : ''}`);
    diffs += onlyA.length + onlyB.length;
  }
  sa.elems.forEach(ea => {
    const eb = byKey.get(key(ea));
    if (!eb) return;
    for (const k of [2, 3, 4]) {
      if (ea[k] === -1 && eb[k] === -1) continue;
      const strA = ea[k] === -1 ? '' : sa.dict[ea[k]];
      const strB = eb[k] === -1 ? '' : sb.dict[eb[k]];
      if (strA === strB) continue;
      const ma = toMap(strA), mb = toMap(strB);
      const props = [...new Set([...ma.keys(), ...mb.keys()])].filter(p => ma.get(p) !== mb.get(p));
      if (props.length === 0 || isTimingOnly(props, ma, mb, PSEUDO[k])) continue;
      diffs++;
      if (diffs > 15) continue;
      console.log(`  ÉCART  ${sa.label} : ${ea[1]} ${ea[0]}${PSEUDO[k]}`);
      props.slice(0, 8).forEach(p => console.log(`           ${p}: ${ma.get(p)} → ${mb.get(p)}`));
    }
  });
  if (diffs > 15) console.log(`  … ${diffs} écarts au total dans « ${sa.label} »`);
  total += diffs;
};
// Lecture des deux relevés ligne à ligne, état par état
for (;;) {
  const [ra, rb] = await Promise.all([itA.next(), itB.next()]);
  if (ra.done && rb.done) break;
  const sa = ra.done ? null : JSON.parse(ra.value);
  const sb = rb.done ? null : JSON.parse(rb.value);
  if (sa && 'errors' in sa) errorsA = sa;
  if (sb && 'errors' in sb) errorsB = sb;
  const stateA = sa && !('errors' in sa) ? sa : null;
  const stateB = sb && !('errors' in sb) ? sb : null;
  if (stateA && stateB) { count++; compareState(stateA, stateB); }
  else if (stateA || stateB) console.log('  ÉCART  état présent d\'un seul côté :', (stateA ?? stateB).label);
}
console.log(`${count} états, ${total} écart(s) ; erreurs : avant = ${JSON.stringify(errorsA?.errors)} ; après = ${JSON.stringify(errorsB?.errors)}`);
