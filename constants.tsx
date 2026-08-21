
import { GCodeLine, Tool, ViewSettings, CuttingParams, Overrides, WcsId, WcsOffsets, ExecutionModifiers, Job } from './types';
import { MATERIALS, midpoint } from './lib/machine/materials';

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
  { id: '12', lineNum: '012', command: 'M01', comment: 'Optional Stop -- Verify Part', type: 'system' },
  { id: '13', lineNum: '013', command: 'M08', comment: 'Optional Coolant Blast', type: 'system', blockSkip: true },
  { id: '14', lineNum: '014', command: 'M05', type: 'system' },
  { id: '15', lineNum: '015', command: 'M30', type: 'system' },
];

export const TOOLS: Tool[] = [
  { id: 'T1', name: 'Flat End Mill',  diameter: '6.0mm',  length: '50mm', type: 'End Mill',   lengthOffset: 125.400, diameterOffset: 6.015,  lifeUses: 42, lifeMaxUses: 200 },
  { id: 'T2', name: 'Ball Nose 3mm',  diameter: '3.0mm',  length: '45mm', type: 'Ball Nose',  lengthOffset: 118.750, diameterOffset: 3.008,  lifeUses: 15, lifeMaxUses: 150 },
  { id: 'T3', name: 'Drill 8mm',      diameter: '8.0mm',  length: '60mm', type: 'Drill',      lengthOffset: 142.200, diameterOffset: 8.000,  lifeUses: 88, lifeMaxUses: 100 },
  { id: 'T4', name: 'Face Mill 25mm', diameter: '25.0mm', length: '38mm', type: 'Face Mill',  lengthOffset: 95.600,  diameterOffset: 25.050, lifeUses: 5,  lifeMaxUses: 300 },
];

export const DEFAULT_VIEW_SETTINGS: ViewSettings = {
  machineHousing: true,
  fixturesClamps: true,
  rapidLines: false,
  toolpathHistory: true,
  renderMode: 'SOLID',
  projection: 'PERSPECTIVE',
  gridOpacity: 40,
};

export const DEFAULT_CUTTING_PARAMS: CuttingParams = {
  materialId: MATERIALS[0].id,
  vcMPerMin: midpoint(MATERIALS[0].vcRangeMPerMin),
  feedMmPerMin: midpoint(MATERIALS[0].feedRangeMmPerMin),
};

export const DEFAULT_OVERRIDES: Overrides = {
  feedPct: 100,
  spindlePct: 100,
};

// Real controls typically allow 0-150% (some go to 200%); 5% steps match the
// detents on a physical override dial.
export const OVERRIDE_PCT_MIN = 0;
export const OVERRIDE_PCT_MAX = 150;
export const OVERRIDE_PCT_STEP = 5;

export const DEFAULT_EXECUTION_MODIFIERS: ExecutionModifiers = {
  singleBlock: false,
  dryRun: false,
  optionalStop: false,
  blockSkip: false,
};

export const WCS_IDS: WcsId[] = ['G54', 'G55', 'G56', 'G57', 'G58', 'G59'];
export const DEFAULT_ACTIVE_WCS: WcsId = 'G54';
export const DEFAULT_WCS_OFFSETS: WcsOffsets = {
  G54: { x: 0, y: 0, z: 0 },
  G55: { x: 0, y: 0, z: 0 },
  G56: { x: 0, y: 0, z: 0 },
  G57: { x: 0, y: 0, z: 0 },
  G58: { x: 0, y: 0, z: 0 },
  G59: { x: 0, y: 0, z: 0 },
};

// programName matches FleetView's MACHINE_01 card ("PROJECT_ALPHA_V2.NC") --
// one loaded program, several work orders queued to run through it. The
// first job starts partway through (completedQty: 3) so the queue reads as
// an in-progress shop-floor shift rather than a freshly-opened, empty one.
export const DEFAULT_JOB_QUEUE: Job[] = [
  { id: 'job-1', partName: 'Bracket Rev C',   programName: 'PROJECT_ALPHA_V2.NC', quantity: 12, completedQty: 3, scrappedQty: 0, status: 'active' },
  { id: 'job-2', partName: 'Mounting Plate',  programName: 'PROJECT_ALPHA_V2.NC', quantity: 6,  completedQty: 0, scrappedQty: 0, status: 'queued' },
  { id: 'job-3', partName: 'Spacer Ring',     programName: 'PROJECT_ALPHA_V2.NC', quantity: 20, completedQty: 0, scrappedQty: 0, status: 'queued' },
];
