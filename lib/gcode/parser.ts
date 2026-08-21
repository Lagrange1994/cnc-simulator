import { Coordinates, GCodeLine } from '../../types';

export interface ParsedGCodeParams {
  x?: number;
  y?: number;
  z?: number;
  s?: number;
  f?: number;
}

const X_RE = /X(-?\d+\.?\d*)/;
const Y_RE = /Y(-?\d+\.?\d*)/;
const Z_RE = /Z(-?\d+\.?\d*)/;
const S_RE = /S(\d+)/;
const F_RE = /F(-?\d+\.?\d*)/;

export function parseGCodeParams(params?: string): ParsedGCodeParams {
  if (!params) return {};
  const xMatch = params.match(X_RE);
  const yMatch = params.match(Y_RE);
  const zMatch = params.match(Z_RE);
  const sMatch = params.match(S_RE);
  const fMatch = params.match(F_RE);
  return {
    x: xMatch ? parseFloat(xMatch[1]) : undefined,
    y: yMatch ? parseFloat(yMatch[1]) : undefined,
    z: zMatch ? parseFloat(zMatch[1]) : undefined,
    s: sMatch ? parseInt(sMatch[1], 10) : undefined,
    f: fMatch ? parseFloat(fMatch[1]) : undefined,
  };
}

export function distance3D(a: Coordinates, b: Coordinates): number {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const dz = b.z - a.z;
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

export interface GCodeTimelineEntry {
  line: GCodeLine;
  index: number;
  startMs: number;
  durationMs: number;
  endMs: number;
  /** Coordinates after this line executes. */
  coords: Coordinates;
  /** Active feed rate (mm/min) during this line. */
  feedRate: number;
  /** Spindle RPM set by this line's S-word, if any. */
  spindleRpm?: number;
  /** True when this entry was bypassed by the Block Skip modifier -- zero
   * duration, and its params were never applied to coords/feedRate. */
  skipped?: boolean;
}

export interface GCodeTimelineOptions {
  /** Motion lines run at rapidRateMmPerMin regardless of their programmed
   * feed rate -- verifying the toolpath without cutting at production speed. */
  dryRun?: boolean;
  /** Lines with `blockSkip: true` (a "/" prefix in real G-code) are bypassed
   * entirely: zero duration, no effect on coords/feedRate/spindle. */
  skipFlaggedBlocks?: boolean;
}

export interface GCodeTimeline {
  entries: GCodeTimelineEntry[];
  totalDurationMs: number;
}

const MIN_LINE_DURATION_MS = 150;
const NON_MOTION_DURATION_MS = 300;

/**
 * Builds a time-based execution timeline for a fixed G-code program.
 * Feed rate (F-word) and axis position persist across lines like a real
 * controller: an F on one line stays active until a later line changes
 * it, and axes not named on a line keep their last position.
 */
export function computeGCodeTimeline(
  lines: GCodeLine[],
  startCoords: Coordinates,
  initialFeedRateMmPerMin: number,
  rapidRateMmPerMin = 30000,
  options: GCodeTimelineOptions = {}
): GCodeTimeline {
  let coords = startCoords;
  let feedRate = initialFeedRateMmPerMin;
  let cursor = 0;

  const entries: GCodeTimelineEntry[] = lines.map((line, index) => {
    const startMs = cursor;

    // A skipped block is bypassed entirely -- as if the line weren't in the
    // program at all: zero duration, and its params never touch coords or
    // feedRate (a skipped F-word must not become the active feed rate).
    if (options.skipFlaggedBlocks && line.blockSkip) {
      return {
        line,
        index,
        startMs,
        durationMs: 0,
        endMs: startMs,
        coords,
        feedRate,
        spindleRpm: undefined,
        skipped: true,
      };
    }

    const parsed = parseGCodeParams(line.params);
    const target: Coordinates = {
      x: parsed.x ?? coords.x,
      y: parsed.y ?? coords.y,
      z: parsed.z ?? coords.z,
    };
    if (parsed.f !== undefined && parsed.f > 0) {
      feedRate = parsed.f;
    }

    let durationMs = NON_MOTION_DURATION_MS;
    if (line.command === 'G00' || line.command === 'G01') {
      const dist = distance3D(coords, target);
      // Dry Run verifies the toolpath at rapid rate regardless of what's
      // programmed -- G00 always ignores feedRate, so it's unaffected either way.
      const rate = (line.command === 'G00' || options.dryRun) ? rapidRateMmPerMin : feedRate;
      durationMs = rate > 0 ? Math.max(MIN_LINE_DURATION_MS, (dist / rate) * 60000) : MIN_LINE_DURATION_MS;
    }

    const endMs = startMs + durationMs;
    cursor = endMs;
    coords = target;

    return {
      line,
      index,
      startMs,
      durationMs,
      endMs,
      coords,
      feedRate,
      spindleRpm: parsed.s,
    };
  });

  return { entries, totalDurationMs: cursor };
}

/** Finds the timeline entry whose window [startMs, endMs) contains elapsedMs. */
export function findActiveEntry(timeline: GCodeTimeline, elapsedMs: number): GCodeTimelineEntry {
  const { entries } = timeline;
  if (entries.length === 0) {
    throw new Error('computeGCodeTimeline: cannot find active entry for an empty program');
  }
  for (const entry of entries) {
    if (elapsedMs < entry.endMs) return entry;
  }
  return entries[entries.length - 1];
}

export interface ProgramSummary {
  totalDurationMs: number;
  totalToolpathLengthMm: number;
  peakSpindleRpm: number;
  peakFeedRateMmPerMin: number;
}

/**
 * Aggregates a program into headline numbers for a results/summary display.
 * Everything here is derived directly from the G-code (no invented physics)
 * — cycle time from the same timeline the simulator plays back, toolpath
 * length from summed segment distances, peak spindle/feed from the highest
 * value active at any point in the program.
 */
export function summarizeProgram(
  lines: GCodeLine[],
  startCoords: Coordinates,
  initialFeedRateMmPerMin: number,
  rapidRateMmPerMin = 30000
): ProgramSummary {
  const timeline = computeGCodeTimeline(lines, startCoords, initialFeedRateMmPerMin, rapidRateMmPerMin);

  let toolpathLengthMm = 0;
  let peakSpindleRpm = 0;
  let peakFeedRateMmPerMin = 0;
  let currentSpindleRpm = 0;
  let prevCoords = startCoords;

  for (const entry of timeline.entries) {
    if (entry.line.command === 'G00' || entry.line.command === 'G01') {
      toolpathLengthMm += distance3D(prevCoords, entry.coords);
    }
    prevCoords = entry.coords;

    if (entry.spindleRpm !== undefined) currentSpindleRpm = entry.spindleRpm;
    peakSpindleRpm = Math.max(peakSpindleRpm, currentSpindleRpm);
    peakFeedRateMmPerMin = Math.max(peakFeedRateMmPerMin, entry.feedRate);
  }

  return {
    totalDurationMs: timeline.totalDurationMs,
    totalToolpathLengthMm: toolpathLengthMm,
    peakSpindleRpm,
    peakFeedRateMmPerMin,
  };
}
