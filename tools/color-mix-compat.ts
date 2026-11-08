/* ============================================================
   Compatibilité Chrome 106 : color-mix() → rgb() / rgba()
   ------------------------------------------------------------
   color-mix() n'existe que depuis Chrome 111. La tablette de scène est en
   Chrome 106 : avec des var(), le navigateur garde la déclaration puis l'abandonne
   au calcul (fond transparent, bordure blanche ; bug n° 26). Ce plugin PostCSS
   réécrit à la build chaque color-mix(in srgb, …) en rgb(calc(…)) ou rgba(…),
   compris par tous les navigateurs : le rendu est le même partout. Les sources
   gardent color-mix(), plus lisible.

   Chaque couleur mélangée doit exister en canaux : --nom-r, --nom-g, --nom-b, et
   --nom-a (opacité, 1) pour une variable utilisée avec le repli « transparent ».
   - Une variable déclarée en CSS avec une couleur hexadécimale (--border: #2a2a35)
     reçoit ses canaux automatiquement, juste après elle.
   - Une variable posée par le script (style:--panel-accent) doit poser aussi ses
     canaux : voir colorChannels() dans src/ui/color-channels.ts.

   Formes reconnues : color-mix(in srgb, A p%, B), color-mix(in srgb, A, B q%),
   avec A et B : #hex, transparent, var(--nom) ou var(--nom, repli).
   Un repli « transparent » (var(--cat-accent, transparent) 8%, var(--bg-card)) :
   variable absente, le résultat est l'autre couleur à 92 % d'opacité, comme color-mix().
============================================================ */

type Channels = [string, string, string] | 'transparent';

/** Canaux d'une couleur hexadécimale (#rgb ou #rrggbb), null sinon */
export function hexToChannels(hex: string): [number, number, number] | null {
  const m = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return null;
  const h = m[1].length === 3 ? m[1].split('').map(c => c + c).join('') : m[1];
  return [0, 2, 4].map(i => parseInt(h.slice(i, i + 2), 16)) as [number, number, number];
}

/** Découpe aux virgules de premier niveau (hors parenthèses) */
function splitTopLevel(s: string): string[] {
  const parts: string[] = [];
  let depth = 0, start = 0;
  for (let i = 0; i < s.length; i++) {
    if (s[i] === '(') depth++;
    else if (s[i] === ')') depth--;
    else if (s[i] === ',' && depth === 0) { parts.push(s.slice(start, i).trim()); start = i + 1; }
  }
  parts.push(s.slice(start).trim());
  return parts;
}

function fail(expr: string, why: string): never {
  throw new Error(`color-mix-compat : ${why} dans « ${expr} »`);
}

/** Canaux d'un opérande. `other` sert au repli « transparent » d'une variable. */
function operandChannels(expr: string, other: () => Channels): Channels {
  const e = expr.trim();
  if (e === 'transparent') return 'transparent';
  const rgb = hexToChannels(e);
  if (rgb) return rgb.map(String) as [string, string, string];
  const v = /^var\(\s*(--[\w-]+)\s*(?:,\s*([\s\S]*))?\)$/.exec(e);
  if (!v) fail(e, 'couleur non reconnue (attendu : #hex, transparent ou var())');
  const [, name, fallback] = v;
  let fb: Channels | null = null;
  if (fallback !== undefined) {
    fb = operandChannels(fallback, other);
    if (fb === 'transparent') fb = other();
    if (fb === 'transparent') fail(e, 'repli transparent avec un autre opérande transparent');
  }
  return (['r', 'g', 'b'] as const).map((c, i) =>
    fb ? `var(${name}-${c}, ${fb[i]})` : `var(${name}-${c})`) as [string, string, string];
}

const num = (x: number) => String(Math.round(x * 10000) / 10000);

/** Réécrit un color-mix() (contenu entre les parenthèses) */
function convertMix(inner: string): string {
  const args = splitTopLevel(inner);
  if (args.length !== 3 || args[0] !== 'in srgb') fail(inner, 'seule la forme « in srgb, A, B » est gérée');
  const parse = (a: string) => {
    const m = /^([\s\S]*?)\s+(\d+(?:\.\d+)?)%$/.exec(a);
    return m ? { expr: m[1], pct: Number(m[2]) / 100 } : { expr: a, pct: null };
  };
  const a = parse(args[1]), b = parse(args[2]);
  const p = a.pct ?? (b.pct !== null ? 1 - b.pct : 0.5);

  // Repli transparent d'un opérande → couleur de l'autre
  const plain = (expr: string) => operandChannels(expr, () => 'transparent');
  const ca = operandChannels(a.expr, () => plain(b.expr));
  const cb = operandChannels(b.expr, () => plain(a.expr));

  if (ca === 'transparent' && cb === 'transparent') return 'transparent';
  if (cb === 'transparent') return `rgba(${(ca as string[]).join(', ')}, ${num(p)})`;
  if (ca === 'transparent') return `rgba(${cb.join(', ')}, ${num(1 - p)})`;
  const A = ca, B = cb;
  const channels = [0, 1, 2].map(i => `calc(${A[i]} * ${num(p)} + ${B[i]} * ${num(1 - p)})`).join(', ');
  // Variable au repli transparent : non définie, color-mix() donne l'autre couleur avec
  // l'opacité de son seul poids. Son canal --nom-a (1 quand elle est définie) le reproduit.
  const transparentVar = (expr: string) => /^var\(\s*(--[\w-]+)\s*,\s*transparent\s*\)$/.exec(expr.trim())?.[1];
  const ta = transparentVar(a.expr), tb = transparentVar(b.expr);
  if (ta) return `rgba(${channels}, var(${ta}-a, ${num(1 - p)}))`;
  if (tb) return `rgba(${channels}, var(${tb}-a, ${num(p)}))`;
  return `rgb(${channels})`;
}

/** Réécrit tous les color-mix() d'une valeur CSS */
export function convertColorMix(value: string): string {
  let out = value;
  for (let i = out.indexOf('color-mix('); i !== -1; i = out.indexOf('color-mix(')) {
    const open = i + 'color-mix'.length;
    let depth = 0, close = -1;
    for (let j = open; j < out.length; j++) {
      if (out[j] === '(') depth++;
      else if (out[j] === ')' && --depth === 0) { close = j; break; }
    }
    if (close === -1) fail(value, 'parenthèse non fermée');
    out = out.slice(0, i) + convertMix(out.slice(open + 1, close)) + out.slice(close + 1);
  }
  return out;
}

/** Ce dont le plugin a besoin d'une déclaration PostCSS */
interface Decl {
  prop: string;
  value: string;
  cloneAfter(overrides: { prop: string; value: string }): Decl;
}

/** Plugin PostCSS (voir vite.config.ts) */
export function colorMixCompat() {
  return {
    postcssPlugin: 'color-mix-compat',
    Declaration(decl: Decl) {
      if (decl.value.includes('color-mix(')) decl.value = convertColorMix(decl.value);
      // Variable couleur en hexadécimal : ses canaux juste après elle
      if (decl.prop.startsWith('--') && !/-[rgba]$/.test(decl.prop)) {
        const rgb = hexToChannels(decl.value);
        if (rgb) {
          let last = decl;
          [...rgb, 1].forEach((value, i) => {
            last = last.cloneAfter({ prop: `${decl.prop}-${'rgba'[i]}`, value: String(value) });
          });
        }
      }
    },
  };
}
colorMixCompat.postcss = true;
