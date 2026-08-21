import { describe, it, expect } from 'vitest';
import { findMatchingLines, findLineByNumber } from './search';
import { GCodeLine } from '../../types';

const lines: GCodeLine[] = [
  { id: '1', lineNum: '001', command: 'G21', comment: 'Metric Units' },
  { id: '2', lineNum: '002', command: 'G90', comment: 'Absolute Positioning' },
  { id: '3', lineNum: '003', command: 'M06', params: 'T1', comment: 'Tool Change' },
  { id: '4', lineNum: '004', command: 'G01', params: 'X50 Y0 F1200' },
];

describe('findMatchingLines', () => {
  it('matches on command, case-insensitively', () => {
    expect(findMatchingLines(lines, 'g21')).toEqual([lines[0]]);
  });

  it('matches on params', () => {
    expect(findMatchingLines(lines, 'X50')).toEqual([lines[3]]);
  });

  it('matches on comment', () => {
    expect(findMatchingLines(lines, 'tool change')).toEqual([lines[2]]);
  });

  it('returns every line that matches, not just the first', () => {
    // "G" matches G21/G90/G01 by command, plus M06 via its "Tool Change" comment.
    expect(findMatchingLines(lines, 'G')).toEqual([lines[0], lines[1], lines[2], lines[3]]);
  });

  it('returns an empty array for an empty or whitespace-only query', () => {
    expect(findMatchingLines(lines, '')).toEqual([]);
    expect(findMatchingLines(lines, '   ')).toEqual([]);
  });

  it('returns an empty array when nothing matches', () => {
    expect(findMatchingLines(lines, 'zzz')).toEqual([]);
  });

  it('does not throw on a line with neither params nor comment', () => {
    const bare: GCodeLine[] = [{ id: '9', lineNum: '009', command: 'M30' }];
    expect(findMatchingLines(bare, 'm30')).toEqual(bare);
    expect(findMatchingLines(bare, 'missing')).toEqual([]);
  });
});

describe('findLineByNumber', () => {
  it('finds a line by its numeric line number, ignoring zero-padding', () => {
    expect(findLineByNumber(lines, '3')).toEqual(lines[2]);
    expect(findLineByNumber(lines, '003')).toEqual(lines[2]);
  });

  it('returns undefined for a line number that does not exist', () => {
    expect(findLineByNumber(lines, '999')).toBeUndefined();
  });

  it('returns undefined for a non-numeric query', () => {
    expect(findLineByNumber(lines, 'abc')).toBeUndefined();
  });

  it('returns undefined for an empty query', () => {
    expect(findLineByNumber(lines, '')).toBeUndefined();
    expect(findLineByNumber(lines, '   ')).toBeUndefined();
  });
});
