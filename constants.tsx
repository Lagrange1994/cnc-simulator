
import { GCodeLine, Tool } from './types';

export const INITIAL_GCODE: GCodeLine[] = [
  { id: '1', lineNum: '001', command: 'G21', comment: 'Metric Units', type: 'setup' },
  { id: '2', lineNum: '002', command: 'G90', comment: 'Absolute Positioning', type: 'setup' },
  { id: '3', lineNum: '003', command: 'M06', params: 'T1', comment: 'Tool Change', type: 'system' },
  { id: '4', lineNum: '004', command: 'M03', params: 'S12000', type: 'system' },
  { id: '5', lineNum: '005', command: 'G00', params: 'X0 Y0 Z10', type: 'motion' },
  { id: '6', lineNum: '006', command: 'G01', params: 'Z-2 F500', type: 'motion' },
  { id: '7', lineNum: '007', command: 'G01', params: 'X50 Y0 F1200', type: 'motion' },
  { id: '8', lineNum: '008', command: 'G01', params: 'X50 Y50', type: 'motion' },
  { id: '9', lineNum: '009', command: 'G01', params: 'X0 Y50', type: 'motion' },
  { id: '10', lineNum: '010', command: 'G01', params: 'X0 Y0', type: 'motion' },
  { id: '11', lineNum: '011', command: 'G00', params: 'Z10', type: 'motion' },
  { id: '12', lineNum: '012', command: 'M05', type: 'system' },
  { id: '13', lineNum: '013', command: 'M30', type: 'system' },
];

export const TOOLS: Tool[] = [
  { id: 'T1', name: 'Flat End Mill', diameter: '6.0mm', length: '50mm', type: 'End Mill' },
  { id: 'T2', name: 'Ball Nose 3mm', diameter: '3.0mm', length: '45mm', type: 'Ball Nose' },
];
