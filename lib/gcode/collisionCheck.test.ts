import { describe, it, expect } from 'vitest';
import { analyzeCollisionRisk, SAFE_CLEARANCE_Z_MM, DIAMETER_OFFSET_TOLERANCE_MM } from './collisionCheck';
import { GCodeLine, Tool } from '../../types';

const startCoords = { x: 0, y: 0, z: 10 };

const baseTool: Tool = {
  id: 'T1',
  name: 'Flat End Mill',
  diameter: '6.0mm',
  length: '50mm',
  type: 'End Mill',
  lengthOffset: 125.4,
  diameterOffset: 6.015,
  lifeUses: 42,
  lifeMaxUses: 200,
};

function line(partial: Partial<GCodeLine> & Pick<GCodeLine, 'id' | 'lineNum' | 'command'>): GCodeLine {
  return { type: 'motion', ...partial };
}

describe('analyzeCollisionRisk', () => {
  it('returns no findings for a clean program and a tool within tolerance', () => {
    const lines: GCodeLine[] = [
      line({ id: '1', lineNum: '001', command: 'G00', params: 'X0 Y0 Z10' }),
      line({ id: '2', lineNum: '002', command: 'G01', params: 'Z-2 F500' }),
      line({ id: '3', lineNum: '003', command: 'G01', params: 'X50 Y0 F1200' }),
      line({ id: '4', lineNum: '004', command: 'G00', params: 'Z10' }),
    ];
    const report = analyzeCollisionRisk(lines, startCoords, baseTool);
    expect(report.findings).toEqual([]);
    expect(report.safeClearanceZMm).toBe(SAFE_CLEARANCE_Z_MM);
    expect(report.diameterToleranceMm).toBe(DIAMETER_OFFSET_TOLERANCE_MM);
  });

  it('flags a rapid move that changes X/Y while below the clearance plane', () => {
    const lines: GCodeLine[] = [
      line({ id: '1', lineNum: '001', command: 'G01', params: 'X0 Y0 Z-2 F500' }),
      // Rapids straight from one cutting-depth point to another -- a real
      // "traverse through the part at G0" mistake.
      line({ id: '2', lineNum: '002', command: 'G00', params: 'X50 Y50' }),
    ];
    const report = analyzeCollisionRisk(lines, startCoords, baseTool);
    expect(report.findings).toHaveLength(1);
    expect(report.findings[0]).toMatchObject({ severity: 'critical', lineNum: '002' });
    expect(report.findings[0].detail).toMatch(/002/);
  });

  it('does not flag a pure vertical rapid retract, even from below the clearance plane', () => {
    const lines: GCodeLine[] = [
      line({ id: '1', lineNum: '001', command: 'G01', params: 'X0 Y0 Z-2 F500' }),
      line({ id: '2', lineNum: '002', command: 'G00', params: 'Z10' }), // no X/Y change
    ];
    const report = analyzeCollisionRisk(lines, startCoords, baseTool);
    expect(report.findings).toEqual([]);
  });

  it('does not flag a rapid X/Y move that stays above the clearance plane', () => {
    const lines: GCodeLine[] = [
      line({ id: '1', lineNum: '001', command: 'G00', params: 'X50 Y50 Z10' }),
    ];
    const report = analyzeCollisionRisk(lines, startCoords, baseTool);
    expect(report.findings).toEqual([]);
  });

  it('flags a tool whose diameter offset has drifted past tolerance', () => {
    const wornTool: Tool = { ...baseTool, diameterOffset: 6.5 };
    const report = analyzeCollisionRisk([], startCoords, wornTool);
    expect(report.findings).toHaveLength(1);
    expect(report.findings[0]).toMatchObject({ severity: 'warning', title: 'Tool diameter offset exceeds tolerance' });
  });

  it('does not flag a tool whose diameter offset is within tolerance', () => {
    const finetool: Tool = { ...baseTool, diameterOffset: 6.2 };
    const report = analyzeCollisionRisk([], startCoords, finetool);
    expect(report.findings).toEqual([]);
  });

  it('flags a tool that has reached or exceeded its rated life', () => {
    const wornOutTool: Tool = { ...baseTool, lifeUses: 200, lifeMaxUses: 200 };
    const report = analyzeCollisionRisk([], startCoords, wornOutTool);
    expect(report.findings).toHaveLength(1);
    expect(report.findings[0]).toMatchObject({ severity: 'warning', title: 'Active tool has exceeded its rated life' });
  });

  it('does not flag a tool under its rated life', () => {
    const freshTool: Tool = { ...baseTool, lifeUses: 199, lifeMaxUses: 200 };
    const report = analyzeCollisionRisk([], startCoords, freshTool);
    expect(report.findings).toEqual([]);
  });

  it('can report multiple findings at once', () => {
    const lines: GCodeLine[] = [
      line({ id: '1', lineNum: '001', command: 'G01', params: 'X0 Y0 Z-2 F500' }),
      line({ id: '2', lineNum: '002', command: 'G00', params: 'X50 Y50' }),
    ];
    const wornTool: Tool = { ...baseTool, diameterOffset: 7, lifeUses: 200, lifeMaxUses: 200 };
    const report = analyzeCollisionRisk(lines, startCoords, wornTool);
    expect(report.findings).toHaveLength(3);
  });
});
