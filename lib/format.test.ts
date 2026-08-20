import { describe, it, expect } from 'vitest';
import { formatDuration, formatClock, formatHoursMinutes, formatLength } from './format';

describe('formatDuration', () => {
  it('formats as M:SS with zero-padded seconds', () => {
    expect(formatDuration(65000)).toBe('1:05');
  });

  it('clamps negative durations to 0:00 instead of a negative string', () => {
    expect(formatDuration(-500)).toBe('0:00');
  });
});

describe('formatClock', () => {
  it('formats as zero-padded HH:MM:SS', () => {
    expect(formatClock(3725000)).toBe('01:02:05');
  });

  it('handles zero duration', () => {
    expect(formatClock(0)).toBe('00:00:00');
  });

  it('clamps negative durations to 00:00:00', () => {
    expect(formatClock(-1)).toBe('00:00:00');
  });
});

describe('formatHoursMinutes', () => {
  it('formats as "Xh Ym"', () => {
    expect(formatHoursMinutes(6300000)).toBe('1h 45m');
  });

  it('rounds sub-minute durations up to the nearest minute', () => {
    expect(formatHoursMinutes(45000)).toBe('0h 1m');
  });

  it('clamps negative durations to 0h 0m', () => {
    expect(formatHoursMinutes(-1)).toBe('0h 0m');
  });
});

describe('formatLength', () => {
  it('formats sub-1000mm lengths in mm', () => {
    expect(formatLength(100)).toBe('100 mm');
  });

  it('formats 1000mm+ lengths in meters', () => {
    expect(formatLength(1500)).toBe('1.50 m');
  });
});
