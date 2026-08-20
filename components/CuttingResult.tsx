import React from 'react';
import { ProgramSummary } from '../lib/gcode/parser';
import { formatDuration, formatLength } from '../lib/format';

interface CuttingResultProps {
  summary: ProgramSummary;
}

const Stat: React.FC<{ label: string; value: string; unit?: string }> = ({ label, value, unit }) => (
  <div>
    <div className="text-[9px] text-cds-text-04 uppercase tracking-widest mb-1">{label}</div>
    <div className="flex items-baseline gap-1">
      <span className="text-2xl font-mono font-semibold text-cds-text-01 tabular-nums">{value}</span>
      {unit && <span className="text-[10px] text-cds-text-03 font-mono">{unit}</span>}
    </div>
  </div>
);

/**
 * Hero summary of the loaded program — the headline numbers a viewer should
 * walk away remembering, surfaced once instead of scattered across small
 * telemetry readouts elsewhere in the UI. Every value here is derived
 * directly from the G-code (via the same timeline the simulator plays back),
 * not invented — this is deliberately NOT a cutting-force/material-removal
 * estimate, since this build has no physics model behind it yet.
 */
const CuttingResult: React.FC<CuttingResultProps> = ({ summary }) => {
  return (
    <div className="p-6 border-b border-cds-border bg-gradient-to-br from-cds-layer-01 to-cds-bg relative overflow-hidden">
      <div className="absolute top-0 left-0 bottom-0 w-1 bg-cds-interactive shadow-[0_0_12px_rgba(69,137,255,0.6)]"></div>
      <h2 className="text-cds-text-01 font-semibold text-base uppercase tracking-wide mb-4 flex items-center gap-2">
        <span className="material-symbols-outlined text-cds-interactive text-xl">insights</span>
        Cutting Result
      </h2>
      <div className="grid grid-cols-2 gap-x-4 gap-y-5">
        <Stat label="Est. Cycle Time" value={formatDuration(summary.totalDurationMs)} unit="min" />
        <Stat label="Toolpath Length" value={formatLength(summary.totalToolpathLengthMm)} />
        <Stat label="Peak Spindle" value={summary.peakSpindleRpm.toLocaleString()} unit="RPM" />
        <Stat label="Peak Feed" value={summary.peakFeedRateMmPerMin.toLocaleString()} unit="mm/min" />
      </div>
    </div>
  );
};

export default CuttingResult;
