import { describe, it, expect } from 'vitest';
import { MATERIALS, getMaterial, midpoint, parseToolDiameterMm, estimateRpm, estimatePowerKw } from './materials';

describe('getMaterial', () => {
  it('finds a material by id', () => {
    expect(getMaterial('titanium').label).toBe('Titanium Ti-6Al-4V');
  });

  it('falls back to the first material when the id is not found', () => {
    expect(getMaterial('unobtanium')).toBe(MATERIALS[0]);
  });
});

describe('midpoint', () => {
  it('returns the average of a range', () => {
    expect(midpoint([20, 50])).toBe(35);
  });
});

describe('parseToolDiameterMm', () => {
  it('parses a valid diameter string', () => {
    expect(parseToolDiameterMm('6.0mm')).toBe(6.0);
  });

  it('returns 0 for a malformed string instead of throwing', () => {
    expect(parseToolDiameterMm('n/a')).toBe(0);
  });
});

describe('estimateRpm', () => {
  it('computes RPM from cutting speed and tool diameter', () => {
    // RPM = (Vc * 1000) / (pi * D) = (100 * 1000) / (pi * 10) ~= 3183
    expect(estimateRpm(100, 10)).toBe(3183);
  });

  it('guards a zero diameter instead of returning Infinity', () => {
    expect(estimateRpm(100, 0)).toBe(0);
  });

  it('guards a negative diameter instead of returning a negative RPM', () => {
    expect(estimateRpm(100, -5)).toBe(0);
  });

  it('titanium recommends a much lower RPM than aluminum for the same tool', () => {
    const diameter = 6;
    const titaniumRpm = estimateRpm(midpoint(getMaterial('titanium').vcRangeMPerMin), diameter);
    const aluminumRpm = estimateRpm(midpoint(getMaterial('aluminum').vcRangeMPerMin), diameter);
    expect(titaniumRpm).toBeLessThan(aluminumRpm);
  });
});

describe('estimatePowerKw', () => {
  it('computes power from cutting force and cutting speed', () => {
    // P = Fc * Vc / 60000 = 2500 * 35 / 60000
    expect(estimatePowerKw(2500, 35)).toBeCloseTo(1.4583, 3);
  });

  it('returns 0 for 0 cutting speed', () => {
    expect(estimatePowerKw(2500, 0)).toBe(0);
  });
});
