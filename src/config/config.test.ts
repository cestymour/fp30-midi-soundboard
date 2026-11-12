/* ================================================================
   config.test.ts — Cohérence de la configuration des onglets
================================================================ */

import { describe, expect, it } from 'vitest';
import { MIDI_TABS } from './midi.config.ts';
import { AUDIO_TABS } from './audio.config.ts';
import { TRANSITION_MUSICS } from './transition.config.ts';
import { TILE_ICONS, TILE_ICONS_SIMPLE } from '../icons/index.ts';

/** Renvoie les id présents plusieurs fois dans la liste */
function findDuplicateIds(entries: { id: string }[]): string[] {
  const seen = new Set<string>();
  const duplicates = new Set<string>();
  for (const { id } of entries) {
    if (seen.has(id)) duplicates.add(id);
    seen.add(id);
  }
  return [...duplicates];
}

const ID_FORMAT = /^[a-z0-9]+(-[a-z0-9]+)*$/;

describe('identifiants de la configuration', () => {
  const allTabs = [...MIDI_TABS, ...AUDIO_TABS];

  it('les onglets (MIDI et audio confondus) ont des id uniques', () => {
    expect(findDuplicateIds(allTabs)).toEqual([]);
  });

  for (const tab of allTabs) {
    it(`onglet « ${tab.label} » : catégories et tuiles ont des id uniques`, () => {
      expect(findDuplicateIds(tab.categories)).toEqual([]);
      for (const category of tab.categories) {
        expect(findDuplicateIds(category.items), `catégorie ${category.id}`).toEqual([]);
      }
    });
  }

  it('les id sont des slugs courts (minuscules, chiffres, tirets)', () => {
    const ids = allTabs.flatMap(tab => [
      tab.id,
      ...tab.categories.flatMap(category => [category.id, ...category.items.map(item => item.id)]),
    ]);
    expect(ids.filter(id => !ID_FORMAT.test(id))).toEqual([]);
  });
});

describe('onglets sons', () => {
  const soundTabs = AUDIO_TABS.filter(tab => tab.kind === 'sounds');

  it('il y a des onglets sons et des onglets musiques', () => {
    expect(soundTabs.length).toBeGreaterThan(0);
    expect(AUDIO_TABS.some(tab => tab.kind === 'music')).toBe(true);
  });

  it("aucun son n'a l'option noFade (les sons n'ont jamais de fondu)", () => {
    const withNoFade = soundTabs.flatMap(tab => tab.categories.flatMap(category => category.items))
      .filter(item => item.noFade !== undefined)
      .map(item => item.id);
    expect(withNoFade).toEqual([]);
  });
});

describe('musiques de transition', () => {
  it('il y en a, avec des id uniques au format slug', () => {
    expect(TRANSITION_MUSICS.length).toBeGreaterThan(0);
    expect(findDuplicateIds(TRANSITION_MUSICS)).toEqual([]);
    expect(TRANSITION_MUSICS.map(music => music.id).filter(id => !ID_FORMAT.test(id))).toEqual([]);
  });

  it('début et moments marquants sont des positions valides (au moins un moment après le 0)', () => {
    const invalid = TRANSITION_MUSICS
      .filter(music => music.restarts.length === 0 || !((music.start ?? 0) >= 0)
        || music.restarts.some(time => !(time >= 0) || (music.end !== undefined && time >= music.end)))
      .map(music => music.id);
    expect(invalid).toEqual([]);
  });

  it('les fichiers existent dans public/', () => {
    // Liste des fichiers seulement : les fonctions d'import ne sont jamais appelées
    const files = new Set(Object.keys(import.meta.glob('../../public/sounds/**/*'))
      .map(path => path.replace('../../public/', '')));
    const missing = TRANSITION_MUSICS.filter(music => !files.has(music.file)).map(music => music.file);
    expect(missing).toEqual([]);
  });
});

describe('dessins des tuiles', () => {
  it('chaque `svg` de la configuration a son fichier dans src/icons/', () => {
    const items: { id: string; svg?: string }[] = [...MIDI_TABS, ...AUDIO_TABS]
      .flatMap(tab => tab.categories.flatMap<{ id: string; svg?: string }>(category => category.items));
    const missing = items.filter(item => item.svg !== undefined && !(item.svg in TILE_ICONS)).map(item => item.id);
    expect(missing).toEqual([]);
    // Essai : chaque dessin existe aussi en silhouette simple (src/icons/simple/)
    const missingSimple = items.filter(item => item.svg !== undefined && !(item.svg in TILE_ICONS_SIMPLE)).map(item => item.id);
    expect(missingSimple).toEqual([]);
  });

  it('chaque dessin est un SVG de 64 × 64', () => {
    for (const [name, svg] of [...Object.entries(TILE_ICONS), ...Object.entries(TILE_ICONS_SIMPLE)]) {
      expect(svg, name).toMatch(/^<svg [^>]*viewBox="0 0 64 64"/);
    }
  });
});
