/* ================================================================
   timing.test.ts — Temps de lecture, progression, seek
================================================================ */

import { describe, expect, it } from 'vitest';
import { SmoothClock, formatTime, getPlaybackProgress, getSeekTime } from './timing.ts';

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


describe('SmoothClock (bug n° 29)', () => {
  /** Horloge audio qui avance par tampons de 20 ms, lue toutes les 16,7 ms */
  const steppedAudio = (now: number) => Math.floor(now / 20) * 0.02;

  it("avance régulièrement quand l'horloge audio avance par paquets", () => {
    const clock = new SmoothClock();
    const steps: number[] = [];
    let last = clock.read(0, 0);
    for (let i = 1; i <= 120; i++) {
      const now = i * (1000 / 60);
      const t = clock.read(steppedAudio(now), now);
      if (i > 60) steps.push(t - last);
      last = t;
    }
    // Pas brut : 0, 20 ou 40 ms ; pas lissé : 16,7 ms à 2 ms près
    for (const step of steps) expect(Math.abs(step - 1 / 60)).toBeLessThan(0.002);
    // Reste calé sur l'horloge audio
    expect(Math.abs(last - steppedAudio(2000))).toBeLessThan(0.03);
  });

  it('suit la vitesse de lecture', () => {
    const clock = new SmoothClock();
    clock.read(10, 0, 2);
    expect(clock.read(10.04, 16, 2)).toBeCloseTo(10.032 + 0.0008, 3);
  });

  it("se recale d'un coup sur un saut (seek), même en arrière", () => {
    const clock = new SmoothClock();
    clock.read(5, 0);
    clock.read(5.016, 16);
    expect(clock.read(60, 33)).toBe(60);
    expect(clock.read(2, 50)).toBe(2);
  });

  it("ne recule pas pour un petit retard de l'horloge audio", () => {
    const clock = new SmoothClock();
    clock.read(1, 0);
    const a = clock.read(1.1, 100);
    expect(clock.read(1.05, 116)).toBeGreaterThanOrEqual(a);
  });

  it('reset : la lecture suivante rend le temps audio tel quel', () => {
    const clock = new SmoothClock();
    clock.read(1, 0);
    clock.reset();
    expect(clock.read(1.2, 10)).toBe(1.2);
  });
});
