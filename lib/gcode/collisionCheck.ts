/**
 * Static toolpath verification for the Collision/Gouge Report
 * (components/CollisionReport.tsx). Everything here is computed directly
 * from the program's own timeline and the active tool's real, editable
 * geometry (Tool Offset Table, EditSidebar.tsx) -- no random/simulated
 * incidents. INITIAL_GCODE itself is fixed and was authored clean, so by
 * default every check below passes; pushing T1's diameter offset or life
 * count past a real tolerance in the Tool Offset Table is what actually
 * trips a finding, the same "real, reachable condition" design as the
 * spindle-overspeed alarm in App.tsx.
 */

import { Coordinates, GCodeLine, Tool } from '../../types';
import { computeGCodeTimeline } from './parser';
import { parseToolDiameterMm } from '../machine/materials';

export type CollisionSeverity = 'critical' | 'warning';

export interface CollisionFinding {
  id: string;
  severity: CollisionSeverity;
  lineNum?: string;
  title: string;
  detail: string;
}

export interface CollisionReport {
  findings: CollisionFinding[];
  safeClearanceZMm: number;
  diameterToleranceMm: number;
}

/** Rapid (G00) moves are not supposed to cut -- they don't ramp into
 * material like a feed move, so a rapid that both changes X/Y AND dips
 * below the clearance plane is a real traverse-through-stock collision
 * risk. A pure vertical G00 (a pecking/retract move) is exactly how the
 * program itself gets out of the cut at line 011, so it's deliberately
 * NOT flagged -- only diagonal rapids that cross the clearance plane are. */
export const SAFE_CLEARANCE_Z_MM = 5;

/** Diameter offset (D) compensates real, small tool wear (hundredths of a
 * millimeter) -- if it's drifted this far from the tool's nominal diameter,
 * either the offset was fat-fingered or the tool has worn/chipped enough to
 * cut an oversized slot, gouging walls the program planned around the
 * nominal size. */
export const DIAMETER_OFFSET_TOLERANCE_MM = 0.3;

function analyzeRapidTraverses(lines: GCodeLine[], startCoords: Coordinates): CollisionFinding[] {
  const timeline = computeGCodeTimeline(lines, startCoords, 1, 30000);
  const findings: CollisionFinding[] = [];

  timeline.entries.forEach((entry, i) => {
    if (entry.line.command !== 'G00') return;
    const prevCoords = i === 0 ? startCoords : timeline.entries[i - 1].coords;
    const target = entry.coords;
    const movesInXY = prevCoords.x !== target.x || prevCoords.y !== target.y;
    const dipsBelow = Math.min(prevCoords.z, target.z) < SAFE_CLEARANCE_Z_MM;
    if (movesInXY && dipsBelow) {
      findings.push({
        id: `rapid-${entry.line.id}`,
        severity: 'critical',
        lineNum: entry.line.lineNum,
        title: 'Rapid traverse below clearance plane',
        detail: `Line ${entry.line.lineNum} (${entry.line.command}) moves in X/Y while dipping to Z${Math.min(prevCoords.z, target.z).toFixed(3)}mm, below the Z${SAFE_CLEARANCE_Z_MM.toFixed(3)}mm safe clearance plane -- risk of colliding with stock or fixtures at rapid rate.`,
      });
    }
  });

  return findings;
}

function analyzeToolGeometry(activeTool: Tool): CollisionFinding[] {
  const findings: CollisionFinding[] = [];
  const nominalDiameterMm = parseToolDiameterMm(activeTool.diameter);
  const diameterDriftMm = Math.abs(activeTool.diameterOffset - nominalDiameterMm);

  if (diameterDriftMm > DIAMETER_OFFSET_TOLERANCE_MM) {
    findings.push({
      id: `diameter-drift-${activeTool.id}`,
      severity: 'warning',
      title: 'Tool diameter offset exceeds tolerance',
      detail: `${activeTool.id}'s diameter offset (${activeTool.diameterOffset.toFixed(3)}mm) has drifted ${diameterDriftMm.toFixed(3)}mm from its nominal diameter (${nominalDiameterMm.toFixed(3)}mm), past the ${DIAMETER_OFFSET_TOLERANCE_MM.toFixed(3)}mm tolerance -- expect an oversized cut and possible gouging on walls the program planned around the nominal size.`,
    });
  }

  if (activeTool.lifeUses >= activeTool.lifeMaxUses) {
    findings.push({
      id: `life-exceeded-${activeTool.id}`,
      severity: 'warning',
      title: 'Active tool has exceeded its rated life',
      detail: `${activeTool.id} is at ${activeTool.lifeUses}/${activeTool.lifeMaxUses} rated uses -- continued cutting risks dimensional drift and gouging from tool wear. Replace and reset via the Tool Offset Table.`,
    });
  }

  return findings;
}

/**
 * Runs every check against the given program and active tool. Pure and
 * synchronous -- callers (App.tsx) wrap it in useMemo keyed on whatever
 * inputs can actually change it (the tool's live offset/life state; the
 * program itself is a fixed constant).
 */
export function analyzeCollisionRisk(
  lines: GCodeLine[],
  startCoords: Coordinates,
  activeTool: Tool
): CollisionReport {
  const findings = [
    ...analyzeRapidTraverses(lines, startCoords),
    ...analyzeToolGeometry(activeTool),
  ];

  return {
    findings,
    safeClearanceZMm: SAFE_CLEARANCE_Z_MM,
    diameterToleranceMm: DIAMETER_OFFSET_TOLERANCE_MM,
  };
}
