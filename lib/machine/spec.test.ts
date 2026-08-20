import { describe, it, expect } from 'vitest';
import { loadFillPercent, MACHINE_SPEC } from './spec';

describe('loadFillPercent', () => {
  it('computes the percentage of max that value represents', () => {
    expect(loadFillPercent(6000, 12000)).toBe(50);
    expect(loadFillPercent(1500, MACHINE_SPEC.maxFeedRateMmPerMin)).toBe(50);
  });

  it('clamps above-max values to 100', () => {
    expect(loadFillPercent(24000, 12000)).toBe(100);
  });

  it('clamps negative values to 0', () => {
    expect(loadFillPercent(-100, 12000)).toBe(0);
  });

  it('returns 0 instead of dividing by a zero or negative max', () => {
    expect(loadFillPercent(500, 0)).toBe(0);
    expect(loadFillPercent(500, -1)).toBe(0);
  });
});
