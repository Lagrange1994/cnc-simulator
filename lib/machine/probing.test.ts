import { describe, it, expect } from 'vitest';
import { computeTrueSurfacePosition } from './probing';

describe('computeTrueSurfacePosition', () => {
  it('adds the probe radius for a positive-direction approach', () => {
    // Ø4mm tip (radius 2mm), probe travels +X until it touches a wall --
    // the wall is one radius further +X than the ball center.
    expect(computeTrueSurfacePosition(10, 4, 'positive')).toBe(12);
  });

  it('subtracts the probe radius for a negative-direction approach', () => {
    // Same tip, probe travels -Z down onto a top surface -- the surface is
    // one radius below the ball center.
    expect(computeTrueSurfacePosition(10, 4, 'negative')).toBe(8);
  });

  it('collapses to the trigger position itself for a zero-diameter probe', () => {
    expect(computeTrueSurfacePosition(10, 0, 'positive')).toBe(10);
    expect(computeTrueSurfacePosition(10, 0, 'negative')).toBe(10);
  });

  it('handles negative trigger positions correctly', () => {
    expect(computeTrueSurfacePosition(-5, 6, 'positive')).toBe(-2);
    expect(computeTrueSurfacePosition(-5, 6, 'negative')).toBe(-8);
  });
});
