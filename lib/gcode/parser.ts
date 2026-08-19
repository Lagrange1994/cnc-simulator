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
  rapidRateMmPerMin = 30000
): GCodeTimeline {
  let coords = startCoords;
  let feedRate = initialFeedRateMmPerMin;
  let cursor = 0;

  const entries: GCodeTimelineEntry[] = lines.map((line, index) => {
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
      const rate = line.command === 'G00' ? rapidRateMmPerMin : feedRate;
      durationMs = rate > 0 ? Math.max(MIN_LINE_DURATION_MS, (dist / rate) * 60000) : MIN_LINE_DURATION_MS;
    }

    const startMs = cursor;
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
