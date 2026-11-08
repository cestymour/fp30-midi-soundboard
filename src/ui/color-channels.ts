/* Canaux R, G, B d'une couleur posée par le script en variable CSS.
   À la build, chaque color-mix() devient rgb() / rgba() sur les canaux --nom-r, --nom-g,
   --nom-b (tools/color-mix-compat.ts, compatibilité Chrome 106) : une variable couleur
   posée par le script doit poser aussi ses canaux, par exemple
   style:--panel-accent={accent} style:--panel-accent-r={rgb?.r} … avec rgb = colorChannels(accent).
   Une variable utilisée avec le repli « transparent » (--cat-accent) pose aussi --nom-a à 1. */

export interface ColorChannels { r: number; g: number; b: number }

/** Canaux d'une couleur #rrggbb ou #rgb, undefined sinon (la variable n'est alors pas posée) */
export function colorChannels(hex: string | null | undefined): ColorChannels | undefined {
  const m = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(hex?.trim() ?? '');
  if (!m) return undefined;
  const h = m[1].length === 3 ? m[1].split('').map(c => c + c).join('') : m[1];
  return { r: parseInt(h.slice(0, 2), 16), g: parseInt(h.slice(2, 4), 16), b: parseInt(h.slice(4, 6), 16) };
}
