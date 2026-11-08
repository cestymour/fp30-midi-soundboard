import { describe, expect, it } from 'vitest';
import postcss from 'postcss';
import { colorMixCompat, convertColorMix, hexToChannels } from './color-mix-compat';

describe('hexToChannels', () => {
  it('lit #rrggbb et #rgb', () => {
    expect(hexToChannels('#ffcc66')).toEqual([255, 204, 102]);
    expect(hexToChannels('#fc6')).toEqual([255, 204, 102]);
    expect(hexToChannels('red')).toBeNull();
  });
});

describe('convertColorMix', () => {
  it('mélange avec transparent → rgba', () => {
    expect(convertColorMix('color-mix(in srgb, var(--panel-accent) 24%, transparent)'))
      .toBe('rgba(var(--panel-accent-r), var(--panel-accent-g), var(--panel-accent-b), 0.24)');
    expect(convertColorMix('color-mix(in srgb, #ffcc66 22%, transparent)'))
      .toBe('rgba(255, 204, 102, 0.22)');
  });

  it('mélange de deux couleurs → rgb(calc())', () => {
    expect(convertColorMix('color-mix(in srgb, #ffcc66 70%, var(--border))')).toBe(
      'rgb(calc(255 * 0.7 + var(--border-r) * 0.3), calc(204 * 0.7 + var(--border-g) * 0.3), calc(102 * 0.7 + var(--border-b) * 0.3))');
  });

  it('variable avec repli', () => {
    expect(convertColorMix('color-mix(in srgb, var(--panel-accent, var(--current-accent)) 14%, transparent)')).toBe(
      'rgba(var(--panel-accent-r, var(--current-accent-r)), var(--panel-accent-g, var(--current-accent-g)), var(--panel-accent-b, var(--current-accent-b)), 0.14)');
  });

  it('repli transparent → couleur de l\'autre opérande, avec son opacité', () => {
    expect(convertColorMix('color-mix(in srgb, var(--cat-accent, transparent) 8%, var(--bg-card))')).toBe(
      'rgba(calc(var(--cat-accent-r, var(--bg-card-r)) * 0.08 + var(--bg-card-r) * 0.92), '
      + 'calc(var(--cat-accent-g, var(--bg-card-g)) * 0.08 + var(--bg-card-g) * 0.92), '
      + 'calc(var(--cat-accent-b, var(--bg-card-b)) * 0.08 + var(--bg-card-b) * 0.92), '
      + 'var(--cat-accent-a, 0.92))');
  });

  it('plusieurs color-mix() dans une valeur, le reste intact', () => {
    expect(convertColorMix('0 0 0 1px color-mix(in srgb, #000 35%, transparent), 0 0 18px color-mix(in srgb, #fff 22%, transparent)'))
      .toBe('0 0 0 1px rgba(0, 0, 0, 0.35), 0 0 18px rgba(255, 255, 255, 0.22)');
    expect(convertColorMix('linear-gradient(165deg, color-mix(in srgb, #000 14%, transparent) 0%, transparent 50%)'))
      .toBe('linear-gradient(165deg, rgba(0, 0, 0, 0.14) 0%, transparent 50%)');
  });

  it('pourcentage sur le second opérande', () => {
    expect(convertColorMix('color-mix(in srgb, #000, #fff 25%)'))
      .toBe('rgb(calc(0 * 0.75 + 255 * 0.25), calc(0 * 0.75 + 255 * 0.25), calc(0 * 0.75 + 255 * 0.25))');
  });

  it('refuse une forme inconnue plutôt que de produire du CSS faux', () => {
    expect(() => convertColorMix('color-mix(in oklch, red 50%, blue)')).toThrow();
    expect(() => convertColorMix('color-mix(in srgb, red 50%, blue)')).toThrow();
  });
});

describe('plugin PostCSS', () => {
  it('réécrit color-mix() et ajoute les canaux des variables hexadécimales', async () => {
    const css = ':root { --border: #2a2a35; } .a { --cat-accent: #ff00ff; border-color: color-mix(in srgb, var(--cat-accent) 35%, var(--border)); }';
    const out = (await postcss([colorMixCompat()]).process(css, { from: undefined })).css;
    expect(out).toContain('--border: #2a2a35; --border-r: 42; --border-g: 42; --border-b: 53; --border-a: 1;');
    expect(out).toContain('--cat-accent: #ff00ff; --cat-accent-r: 255; --cat-accent-g: 0; --cat-accent-b: 255; --cat-accent-a: 1;');
    expect(out).not.toContain('color-mix');
  });
});
