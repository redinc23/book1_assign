import { describe, it, expect } from 'vitest';
import { progressPercent } from './progress';

describe('progressPercent', () => {
  it('returns 0 when the total is zero (division-by-zero guard)', () => {
    expect(progressPercent(0, 0)).toBe(0);
    expect(progressPercent(500, 0)).toBe(0);
  });

  it('returns 0 when the total is negative', () => {
    expect(progressPercent(10, -5)).toBe(0);
  });

  it('returns 0 for non-finite inputs (NaN, Infinity, null, undefined)', () => {
    expect(progressPercent(NaN, 100)).toBe(0);
    expect(progressPercent(50, NaN)).toBe(0);
    expect(progressPercent(Infinity, 100)).toBe(0);
    expect(progressPercent(50, Infinity)).toBe(0);
    expect(progressPercent(null as unknown as number, 100)).toBe(0);
    expect(progressPercent(50, null as unknown as number)).toBe(0);
    expect(progressPercent(undefined as unknown as number, 100)).toBe(0);
    expect(progressPercent(50, undefined as unknown as number)).toBe(0);
  });

  it('computes a rounded percentage', () => {
    expect(progressPercent(50, 100)).toBe(50);
    expect(progressPercent(1, 3)).toBe(33);
    expect(progressPercent(2, 3)).toBe(67);
  });

  it('clamps values above the target to 100', () => {
    expect(progressPercent(150, 100)).toBe(100);
    expect(progressPercent(4200, 4000)).toBe(100);
  });

  it('clamps negative values to 0', () => {
    expect(progressPercent(-20, 100)).toBe(0);
  });

  it('returns 100 at exactly the target', () => {
    expect(progressPercent(100, 100)).toBe(100);
  });
});
