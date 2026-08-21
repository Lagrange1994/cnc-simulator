
export interface Coordinates {
  x: number;
  y: number;
  z: number;
}

export interface GCodeLine {
  id: string;
  lineNum: string;
  command: string;
  comment?: string;
  params?: string;
  type?: 'motion' | 'setup' | 'system';
}

export interface MachineStatus {
  spindleRpm: number;
  feedRate: number;
  isSimulating: boolean;
  progress: number;
  activeLineIndex: number;
  coolant: boolean;
  error?: string;
}

/** A tool's nominal geometry (diameter/length, as fitted) never changes; its
 * offsets and life do, via the Tool Offset Table (EditSidebar.tsx) -- the
 * real analogue is the H/D geometry offset screen every control keeps
 * separate from the DRO, and a tool-life counter that ticks toward a
 * replacement threshold. */
export interface Tool {
  id: string;
  name: string;
  diameter: string;
  length: string;
  type: string;
  /** Length offset (H), mm -- measured tool length from the spindle gauge line. */
  lengthOffset: number;
  /** Diameter offset (D), mm -- measured/compensated cutting diameter (nominal + wear). */
  diameterOffset: number;
  lifeUses: number;
  lifeMaxUses: number;
}

export interface LogMessage {
  id: string;
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'success';
  text: string;
}

/** Feed/Spindle override dials (Sidebar.tsx Status section) -- operator-set
 * percentage multipliers applied on top of the programmed feed rate/spindle
 * speed, exactly like the physical override knobs on a real CNC control.
 * Unlike CuttingParams (locked out while simulating), these stay live during
 * a cut -- riding the feed override mid-cut is the whole point of the dial.
 * feedPct also scales the simulation's real-time playback speed (see
 * App.tsx's pacing effect); spindlePct only scales the displayed RPM. */
export interface Overrides {
  feedPct: number;
  spindlePct: number;
}

/** A single alarm/fault history entry -- distinct from the free-text
 * Machine Console Output (Terminal.tsx), which logs every executed line.
 * Alarms are structured, rarer, and persist in `status: 'cleared'` form
 * after the underlying condition resolves, matching a real control's
 * alarm history screen (you can see what tripped and when, not just what's
 * currently active). `kind` is an internal, stable key App.tsx uses to find
 * "the active alarm for this condition" again without re-triggering a
 * duplicate entry every render; `code`/`message`/`severity` are the
 * operator-facing fields. */
export type AlarmSeverity = 'critical' | 'warning';
export type AlarmStatus = 'active' | 'cleared';

export interface Alarm {
  id: string;
  kind: string;
  code: string;
  message: string;
  severity: AlarmSeverity;
  status: AlarmStatus;
  raisedAt: string;
  clearedAt?: string;
}

/** Work Coordinate System id (G54-G59) -- which offset table entry is
 * currently active. The DRO shows position relative to whichever WCS is
 * active, not raw machine position; see Sidebar.tsx's workCoords. */
export type WcsId = 'G54' | 'G55' | 'G56' | 'G57' | 'G58' | 'G59';

/** Per-axis offset for every WCS slot: how far that work zero sits from
 * machine zero. Set via the DRO's per-axis "ZERO" buttons (Sidebar.tsx),
 * which mirror the real touch-off workflow -- jog to the part, hit Zero X,
 * the current machine position becomes that axis's offset. */
export type WcsOffsets = Record<WcsId, Coordinates>;

/** Cutting Parameters panel state (Sidebar.tsx) -- which material is
 * selected and the cutting speed/feed rate within that material's
 * recommended range. RPM and Power are derived, not stored (see
 * lib/machine/materials.ts), so they can't drift out of sync with Vc. */
export interface CuttingParams {
  materialId: string;
  vcMPerMin: number;
  feedMmPerMin: number;
}

export type RenderMode = 'SOLID' | 'WIREFRAME' | 'X-RAY' | 'PLASTIC';
export type Projection = 'PERSPECTIVE' | 'ORTHOGRAPHIC';

/** Scene display settings owned by ViewSidebar's "View Settings" panel but
 * consumed by Viewport -- lifted up to App so both sides read/write the
 * same state instead of ViewSidebar's controls being disconnected chrome. */
export interface ViewSettings {
  machineHousing: boolean;
  fixturesClamps: boolean;
  rapidLines: boolean;
  toolpathHistory: boolean;
  renderMode: RenderMode;
  projection: Projection;
  gridOpacity: number;
}
