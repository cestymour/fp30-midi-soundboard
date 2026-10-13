// Compare deux relevés de styles calculés (styles.mjs) : liste les propriétés qui diffèrent
// Usage : node compare-styles.mjs <avant.json> <après.json>
import { readFileSync } from 'node:fs';
const [a, b] = process.argv.slice(2).map(f => JSON.parse(readFileSync(f, 'utf8')));
// Identifiants aléatoires du bouton d'arrêt d'urgence (dégradés SVG) : non significatifs
// Préfixe ajouté par Svelte aux @keyframes déclarées dans un composant : non significatif
const normalize = str => str.replace(/url\("#([a-z-]+)-[a-z0-9]+"\)/g, 'url("#$1-ID")').replace(/\bsvelte-[a-z0-9]+-/g, '');
const toMap = str => new Map(normalize(str).split(';').map(p => { const i = p.indexOf(':'); return [p.slice(0, i), p.slice(i + 1)]; }));
// Largeur de la barre de progression d'un son (::before en %) : dépend du moment de la capture
const isTimingOnly = (props, ma, mb, pseudo) => pseudo === '::before'
  && props.every(p => (p === 'width' || p === 'inline-size') && /%$/.test(ma.get(p)) && /%$/.test(mb.get(p)));
const PSEUDO = ['', '', '', '::before', '::after'];
let total = 0;
if (a.states.length !== b.states.length) console.log('  ÉCART  nombre d\'états', a.states.length, b.states.length);
a.states.forEach((sa, si) => {
  const sb = b.states[si];
  if (!sb) return;
  let diffs = 0;
  if (sa.elems.length !== sb.elems.length) console.log(`  ÉCART  ${sa.label} : ${sa.elems.length} éléments → ${sb.elems.length}`);
  sa.elems.forEach((ea, ei) => {
    const eb = sb.elems[ei];
    if (!eb || ea[0] !== eb[0] || ea[1] !== eb[1]) { diffs++; return; }
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
});
console.log(`${a.states.length} états, ${total} écart(s) ; erreurs : avant = ${JSON.stringify(a.errors)} ; après = ${JSON.stringify(b.errors)}`);
