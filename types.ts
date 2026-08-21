
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
  /** True for a line prefixed with "/" in real G-code -- bypassed entirely
   * when the Block Skip modifier is on, executed normally when it's off. */
  blockSkip?: boolean;
}

/** 'demo' is the app's built-in illustrative program (INITIAL_GCODE); 'upload'
 * is a real file the operator loaded via Editor's Upload button or File
 * Manager's Import G-Code tab. Drives whether the Editor status bar's CAM
 * Source tooltip shows the illustrative post-processor metadata or honestly
 * says it has none for a real uploaded file. */
export type ProgramSource = 'demo' | 'upload';

/** Program execution modifiers -- the standard toggle bank next to Cycle
 * Start on every commercial control, separate from Feed/Spindle Override
 * (Overrides) because these change *what* runs, not how fast.
 * - singleBlock: auto-pause after every line, requiring another CYCLE START
 *   to advance -- stays live mid-cut, like Overrides.
 * - optionalStop: pause when the program hits an M01 line (ignored when off).
 *   Also stays live mid-cut.
 * - dryRun: motion lines run at rapid rate regardless of programmed feed --
 *   changes the timeline's shape, so it's locked while simulating.
 * - blockSkip: lines with `blockSkip: true` are bypassed entirely -- also
 *   changes the timeline's shape, also locked while simulating.
 */
export interface ExecutionModifiers {
  singleBlock: boolean;
  dryRun: boolean;
  optionalStop: boolean;
  blockSkip: boolean;
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

/** Session-tracked production counters behind the OEE panel (FleetView.tsx).
 * A "cycle" starts at a fresh CYCLE START (progress 0, not a Feed
 * Hold/Single Block/Optional Stop resume) and ends either at completed
 * (M30 reached -- a good part) or scrapped (RESET pressed mid-run -- an
 * aborted part). Quality = completed / (completed + scrapped). */
export interface OeeCounters {
  cyclesStarted: number;
  cyclesCompleted: number;
  cyclesScrapped: number;
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
  /** Display-formatted local time (HelpManager's System Logs table). */
  raisedAt: string;
  clearedAt?: string;
  /** Epoch ms twins of the strings above -- the OEE panel's Availability
   * derives Alarm Downtime straight from these (sum of clearedAtMs ??
   * now() minus raisedAtMs across every alarm) instead of a second,
   * independently-tracked start/stop timer. Two mechanisms racing to
   * track the same "is an alarm active" transition is exactly how that
   * second timer produced a multi-decade downtime reading in testing --
   * one source of truth (this array) is the fix, not a tighter race. */
  raisedAtMs: number;
  clearedAtMs?: number;
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

/** Job/Work-Order Queue (JobQueue.tsx) -- a shop-floor queue of batches to
 * run through the *same* loaded program (PROJECT_ALPHA_V2.NC -- there's only
 * one program in this app, see App.tsx's INITIAL_GCODE), each batch tracked
 * as its own work order with its own quantity/genealogy. This mirrors a real
 * workflow: the same NC file cutting several distinct customer orders back
 * to back, each counted separately even though the toolpath is identical.
 * Exactly one job is 'active' at a time (the one this session's Cycle
 * Start/Reset outcomes are credited to); 'queued' jobs wait behind it;
 * 'done' means quantity was fully produced (completed + scrapped); 'skipped'
 * is an operator override that retires a job without finishing it. */
export type JobStatus = 'queued' | 'active' | 'done' | 'skipped';

export interface Job {
  id: string;
  partName: string;
  programName: string;
  quantity: number;
  completedQty: number;
  scrappedQty: number;
  status: JobStatus;
}

/** Accent color theme (SettingsManager.tsx's "Color Theme" select, wired to
 * real CSS custom-property overrides in index.css via a `data-accent`
 * attribute on <html> -- see App.tsx). Swaps only the interactive/link
 * accent tokens, not the whole Gray-90 dark chrome: a full light theme
 * would need every `bg-black/40`/`bg-white/5` overlay across the app
 * re-audited, which is out of scope here (see index.css's comment on the
 * accent blocks for the full reasoning). */
export type AccentTheme = 'carbon-dark' | 'cyberpunk-neon' | 'high-contrast' | 'classic-fanuc';

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
