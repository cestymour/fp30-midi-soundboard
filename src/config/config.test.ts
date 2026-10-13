/* ================================================================
   config.test.ts — Cohérence de la configuration des onglets
================================================================ */

import { describe, expect, it } from 'vitest';
import { MIDI_TABS } from './midi.config.ts';
import { AUDIO_TABS } from './audio.config.ts';

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
