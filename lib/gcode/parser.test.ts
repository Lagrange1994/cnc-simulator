import { describe, it, expect } from 'vitest';
import { parseGCodeParams, distance3D, computeGCodeTimeline, findActiveEntry, summarizeProgram } from './parser';
import { GCodeLine } from '../../types';

describe('parseGCodeParams', () => {
  it('extracts X, Y, Z, S, and F from a params string', () => {
    expect(parseGCodeParams('X50 Y0 Z-2 S12000 F1200')).toEqual({
      x: 50, y: 0, z: -2, s: 12000, f: 1200,
    });
  });

  it('returns an empty object for undefined params', () => {
    expect(parseGCodeParams(undefined)).toEqual({});
  });

  it('returns an empty object for an empty string', () => {
    expect(parseGCodeParams('')).toEqual({});
  });

  it('only returns the fields present in the string', () => {
    expect(parseGCodeParams('X10')).toEqual({ x: 10 });
  });

  it('handles negative and decimal values', () => {
    expect(parseGCodeParams('Z-2.5 F0.5')).toEqual({ z: -2.5, f: 0.5 });
  });
});

describe('distance3D', () => {
  it('computes straight-line distance between two points', () => {
    expect(distance3D({ x: 0, y: 0, z: 0 }, { x: 3, y: 4, z: 0 })).toBe(5);
  });

  it('returns 0 for identical points', () => {
    expect(distance3D({ x: 1, y: 2, z: 3 }, { x: 1, y: 2, z: 3 })).toBe(0);
  });
});

describe('computeGCodeTimeline', () => {
  const startCoords = { x: 0, y: 0, z: 10 };

  it('gives a longer duration to a slower feed rate over the same distance', () => {
    const fastLine: GCodeLine = { id: '1', lineNum: '1', command: 'G01', params: 'X100 F1200' };
    const slowLine: GCodeLine = { id: '1', lineNum: '1', command: 'G01', params: 'X100 F100' };

    const fast = computeGCodeTimeline([fastLine], startCoords, 1200);
    const slow = computeGCodeTimeline([slowLine], startCoords, 1200);

    expect(slow.totalDurationMs).toBeGreaterThan(fast.totalDurationMs);
  });

  it('carries the F-word forward to later lines until changed', () => {
    const lines: GCodeLine[] = [
      { id: '1', lineNum: '1', command: 'G01', params: 'X10 F600' },
      { id: '2', lineNum: '2', command: 'G01', params: 'X20' },
    ];
    const { entries } = computeGCodeTimeline(lines, startCoords, 1200);
    expect(entries[0].feedRate).toBe(600);
    expect(entries[1].feedRate).toBe(600);
  });

  it('does not divide by zero when feed rate is 0 or negative', () => {
    const lines: GCodeLine[] = [
      { id: '1', lineNum: '1', command: 'G01', params: 'X100 F0' },
    ];
    const { totalDurationMs } = computeGCodeTimeline(lines, startCoords, 1200);
    expect(Number.isFinite(totalDurationMs)).toBe(true);
    expect(totalDurationMs).toBeGreaterThan(0);
  });

  it('ignores a negative F-word rather than adopting it', () => {
    const lines: GCodeLine[] = [
      { id: '1', lineNum: '1', command: 'G01', params: 'X10 F-500' },
    ];
    const { entries } = computeGCodeTimeline(lines, startCoords, 1200);
    expect(entries[0].feedRate).toBe(1200);
  });

  it('gives a zero-distance move a minimal but non-zero duration', () => {
    const lines: GCodeLine[] = [
      { id: '1', lineNum: '1', command: 'G01', params: 'X0 Y0 F1200' },
    ];
    const { totalDurationMs } = computeGCodeTimeline(lines, startCoords, 1200);
    expect(totalDurationMs).toBeGreaterThan(0);
  });

  it('holds unspecified axes at their last position', () => {
    const lines: GCodeLine[] = [
      { id: '1', lineNum: '1', command: 'G01', params: 'X10 Y5' },
      { id: '2', lineNum: '2', command: 'G01', params: 'X20' },
    ];
    const { entries } = computeGCodeTimeline(lines, startCoords, 1200);
    expect(entries[1].coords).toEqual({ x: 20, y: 5, z: 10 });
  });

  it('treats non-motion lines (setup/system) as a fixed short duration', () => {
    const lines: GCodeLine[] = [
      { id: '1', lineNum: '1', command: 'G21', params: undefined },
    ];
    const { entries } = computeGCodeTimeline(lines, startCoords, 1200);
    expect(entries[0].durationMs).toBe(300);
    expect(entries[0].coords).toEqual(startCoords);
  });

  it('captures the spindle RPM set by an S-word, including S0', () => {
    const lines: GCodeLine[] = [
      { id: '1', lineNum: '1', command: 'M03', params: 'S0' },
    ];
    const { entries } = computeGCodeTimeline(lines, startCoords, 1200);
    expect(entries[0].spindleRpm).toBe(0);
  });
});

describe('findActiveEntry', () => {
  const lines: GCodeLine[] = [
    { id: '1', lineNum: '1', command: 'G01', params: 'X10 F600' },
    { id: '2', lineNum: '2', command: 'G01', params: 'X20 F600' },
  ];
  const timeline = computeGCodeTimeline(lines, { x: 0, y: 0, z: 0 }, 1200);

  it('returns the first entry at elapsed = 0', () => {
    expect(findActiveEntry(timeline, 0).index).toBe(0);
  });

  it('returns the last entry once elapsed exceeds the total duration', () => {
    expect(findActiveEntry(timeline, timeline.totalDurationMs + 1000).index).toBe(1);
  });

  it('throws on an empty timeline rather than returning undefined', () => {
    expect(() => findActiveEntry({ entries: [], totalDurationMs: 0 }, 0)).toThrow();
  });
});

describe('summarizeProgram', () => {
  const startCoords = { x: 0, y: 0, z: 0 };

  it('sums straight-line segment distances across motion lines', () => {
    const lines: GCodeLine[] = [
      { id: '1', lineNum: '1', command: 'G01', params: 'X10' },
      { id: '2', lineNum: '2', command: 'G01', params: 'Y10' },
    ];
    const summary = summarizeProgram(lines, startCoords, 1200);
    expect(summary.totalToolpathLengthMm).toBeCloseTo(20, 5);
  });

  it('ignores non-motion lines when summing toolpath length', () => {
    const lines: GCodeLine[] = [
      { id: '1', lineNum: '1', command: 'G21', params: undefined },
      { id: '2', lineNum: '2', command: 'M03', params: 'S8000' },
      { id: '3', lineNum: '3', command: 'G01', params: 'X10' },
    ];
    const summary = summarizeProgram(lines, startCoords, 1200);
    expect(summary.totalToolpathLengthMm).toBeCloseTo(10, 5);
  });

  it('reports the peak spindle RPM reached, carrying the value across lines with no S-word', () => {
    const lines: GCodeLine[] = [
      { id: '1', lineNum: '1', command: 'M03', params: 'S8000' },
      { id: '2', lineNum: '2', command: 'G01', params: 'X10' }, // no S-word, RPM should carry
      { id: '3', lineNum: '3', command: 'M03', params: 'S4000' }, // drops, but peak stays 8000
    ];
    const summary = summarizeProgram(lines, startCoords, 1200);
    expect(summary.peakSpindleRpm).toBe(8000);
  });

  it('reports the peak feed rate reached across F-word changes', () => {
    const lines: GCodeLine[] = [
      { id: '1', lineNum: '1', command: 'G01', params: 'X10 F500' },
      { id: '2', lineNum: '2', command: 'G01', params: 'X20 F1500' },
      { id: '3', lineNum: '3', command: 'G01', params: 'X30 F800' },
    ];
    const summary = summarizeProgram(lines, startCoords, 1200);
    expect(summary.peakFeedRateMmPerMin).toBe(1500);
  });

  it('returns zero peak spindle RPM for a program with no S-word at all', () => {
    const lines: GCodeLine[] = [
      { id: '1', lineNum: '1', command: 'G01', params: 'X10' },
    ];
    const summary = summarizeProgram(lines, startCoords, 1200);
    expect(summary.peakSpindleRpm).toBe(0);
  });

  it('returns zero toolpath length for a program with no motion lines', () => {
    const lines: GCodeLine[] = [
      { id: '1', lineNum: '1', command: 'G21', params: undefined },
      { id: '2', lineNum: '2', command: 'M30', params: undefined },
    ];
    const summary = summarizeProgram(lines, startCoords, 1200);
    expect(summary.totalToolpathLengthMm).toBe(0);
  });

  it('matches the total duration computed directly by computeGCodeTimeline', () => {
    const lines: GCodeLine[] = [
      { id: '1', lineNum: '1', command: 'G01', params: 'X50 F1200' },
    ];
    const summary = summarizeProgram(lines, startCoords, 1200);
    const timeline = computeGCodeTimeline(lines, startCoords, 1200);
    expect(summary.totalDurationMs).toBe(timeline.totalDurationMs);
  });
});
