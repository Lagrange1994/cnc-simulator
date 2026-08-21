import { describe, it, expect } from 'vitest';
import { parseGCodeFile, serializeGCodeFile } from './fileIO';

describe('parseGCodeFile', () => {
  it('parses a simple program into GCodeLine entries', () => {
    const text = 'G21\nG90\nG00 X0 Y0 Z10\nG01 X50 F1200\nM30';
    const lines = parseGCodeFile(text);
    expect(lines).toHaveLength(5);
    expect(lines[0]).toMatchObject({ command: 'G21', params: undefined });
    expect(lines[2]).toMatchObject({ command: 'G00', params: 'X0 Y0 Z10' });
    expect(lines[3]).toMatchObject({ command: 'G01', params: 'X50 F1200' });
  });

  it('assigns sequential, zero-padded lineNum and stable ids regardless of source formatting', () => {
    const lines = parseGCodeFile('G21\nG90');
    expect(lines[0].lineNum).toBe('001');
    expect(lines[1].lineNum).toBe('002');
    expect(lines[0].id).not.toBe(lines[1].id);
  });

  it('extracts parenthetical comments and strips them from params', () => {
    const lines = parseGCodeFile('G21 (Metric Units)');
    expect(lines[0]).toMatchObject({ command: 'G21', comment: 'Metric Units', params: undefined });
  });

  it('extracts semicolon-to-end-of-line comments', () => {
    const lines = parseGCodeFile('M03 S12000 ; spindle on');
    expect(lines[0]).toMatchObject({ command: 'M03', params: 'S12000', comment: 'spindle on' });
  });

  it('marks a leading "/" as a block-skip line', () => {
    const lines = parseGCodeFile('/M08 (coolant)');
    expect(lines[0]).toMatchObject({ command: 'M08', blockSkip: true });
  });

  it('does not set blockSkip on a normal line', () => {
    const lines = parseGCodeFile('M08');
    expect(lines[0].blockSkip).toBeUndefined();
  });

  it('strips a leading N-word block number without treating it as a param', () => {
    const lines = parseGCodeFile('N10 G01 X50 Y0');
    expect(lines[0]).toMatchObject({ command: 'G01', params: 'X50 Y0' });
  });

  it('carries the last command forward for a modal line with only axis words', () => {
    const lines = parseGCodeFile('G01 X0 Y0\nX50 Y0\nX50 Y50');
    expect(lines).toHaveLength(3);
    expect(lines[1]).toMatchObject({ command: 'G01', params: 'X50 Y0' });
    expect(lines[2]).toMatchObject({ command: 'G01', params: 'X50 Y50' });
  });

  it('drops blank lines, comment-only lines, and "%" program delimiters', () => {
    const lines = parseGCodeFile('%\nG21\n\n(just a comment)\n   \nG90\n%');
    expect(lines.map(l => l.command)).toEqual(['G21', 'G90']);
  });

  it('drops a bare axis-word line with no command established yet', () => {
    const lines = parseGCodeFile('X50 Y0\nG21');
    expect(lines).toHaveLength(1);
    expect(lines[0].command).toBe('G21');
  });

  it('returns an empty array for a file with no recognizable G-code', () => {
    expect(parseGCodeFile('')).toEqual([]);
    expect(parseGCodeFile('   \n\n  ')).toEqual([]);
    expect(parseGCodeFile('(just a comment)')).toEqual([]);
  });

  it('uppercases command and params for a lowercase source file', () => {
    const lines = parseGCodeFile('g01 x50 y0 f1200');
    expect(lines[0]).toMatchObject({ command: 'G01', params: 'X50 Y0 F1200' });
  });

  it('handles CRLF line endings', () => {
    const lines = parseGCodeFile('G21\r\nG90\r\nM30');
    expect(lines).toHaveLength(3);
  });
});

describe('serializeGCodeFile', () => {
  it('round-trips a parsed program back to equivalent text', () => {
    const original = 'G21\nG00 X0 Y0 Z10\nM03 S12000 (spindle on)';
    const lines = parseGCodeFile(original);
    const text = serializeGCodeFile(lines);
    expect(parseGCodeFile(text)).toEqual(lines);
  });

  it('prefixes a block-skip line with "/"', () => {
    const lines = parseGCodeFile('/M08 (coolant)');
    expect(serializeGCodeFile(lines)).toBe('/M08 (coolant)\n');
  });

  it('omits params/comment segments that are absent', () => {
    const lines = parseGCodeFile('G21');
    expect(serializeGCodeFile(lines)).toBe('G21\n');
  });

  it('ends the file with a trailing newline', () => {
    const lines = parseGCodeFile('G21\nG90');
    expect(serializeGCodeFile(lines).endsWith('\n')).toBe(true);
  });
});
