/* ================================================================
   timing.test.ts — Temps de lecture, progression, seek
================================================================ */

import { describe, expect, it } from 'vitest';
import { formatTime, getPlayableDuration, getPlaybackProgress, getSeekTime } from './timing.ts';

describe('formatTime', () => {
  it('formate en M:SS', () => {
    expect(formatTime(0)).toBe('0:00');
    expect(formatTime(5.9)).toBe('0:05');
    expect(formatTime(65)).toBe('1:05');
    expect(formatTime(3 * 60 + 15)).toBe('3:15');
  });

  it('affiche –:–– pour une durée inconnue ou négative', () => {
    expect(formatTime(NaN)).toBe('–:––');
    expect(formatTime(Infinity)).toBe('–:––');
    expect(formatTime(-1)).toBe('–:––');
  });
});

describe('progression', () => {
  it('compte depuis start et jusqu\'à end', () => {
    expect(getPlaybackProgress({ start: 10, end: 30 }, 20, 120)).toEqual({ elapsed: 10, totalDuration: 20, pct: 50 });
  });

  it('sans end, la fin est la durée du fichier', () => {
    expect(getPlaybackProgress({}, 30, 120)).toEqual({ elapsed: 30, totalDuration: 120, pct: 25 });
  });

  it('borne à 100 % et ne descend pas sous 0', () => {
    expect(getPlaybackProgress({ end: 10 }, 15, 120).pct).toBe(100);
    expect(getPlaybackProgress({ start: 10 }, 5, 120).elapsed).toBe(0);
  });

  it('0 % tant que la durée est inconnue', () => {
    expect(getPlaybackProgress({}, 3, NaN)).toEqual({ elapsed: 3, totalDuration: 0, pct: 0 });
  });
});

describe('seek', () => {
  it('position dans la plage start → end', () => {
    expect(getSeekTime({ start: 10, end: 30 }, 120, 0.5)).toBe(20);
    expect(getSeekTime({ start: 10, end: 30 }, 120, 0)).toBe(10);
    expect(getSeekTime({ start: 10, end: 30 }, 120, 1)).toBe(30);
  });

  it('sans end, jusqu\'à la fin du fichier', () => {
    expect(getSeekTime({}, 200, 0.25)).toBe(50);
  });
});

describe('durée jouable', () => {
  it('end prioritaire, sinon durée du fichier, sinon inconnue', () => {
    expect(getPlayableDuration(5, 9, 100)).toBe(4);
    expect(getPlayableDuration(5, null, 100)).toBe(95);
    expect(getPlayableDuration(5, null, NaN)).toBeNull();
  });
});
