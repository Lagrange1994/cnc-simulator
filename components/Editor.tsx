
import React from 'react';
import { GCodeLine, ExecutionModifiers } from '../types';
import { CAM_SOURCE_INFO, MACHINE_CONTROL_NAME, PROGRAM_FILE_NAME } from '../constants';
import InfoTooltip from './InfoTooltip';

interface EditorProps {
  lines: GCodeLine[];
  activeLineIndex: number;
  execModifiers: ExecutionModifiers;
  onExecModifiersChange: (patch: Partial<ExecutionModifiers>) => void;
  /** dryRun/blockSkip reshape the timeline (see App.tsx's gcodeTimeline
   * memo), so their toggles lock while simulating; singleBlock/optionalStop
   * only affect the pacing effect's runtime behavior and stay live. */
  isCuttingLocked: boolean;
}

const MODIFIER_TOGGLES: { key: keyof ExecutionModifiers; label: string; locksWhileCutting: boolean }[] = [
  { key: 'singleBlock',  label: 'SNGL BLK', locksWhileCutting: false },
  { key: 'dryRun',       label: 'DRY RUN',  locksWhileCutting: true  },
  { key: 'optionalStop', label: 'OPT STOP', locksWhileCutting: false },
  { key: 'blockSkip',    label: 'BLK SKIP', locksWhileCutting: true  },
];

const Editor: React.FC<EditorProps> = ({ lines, activeLineIndex, execModifiers, onExecModifiersChange, isCuttingLocked }) => {
  // Units check is derived from the actual program, not asserted separately
  // -- if line 001 ever stopped being a G21/G20, this would say so instead
  // of silently repeating a hardcoded "Metric" claim.
  const unitsLine = lines.find(l => l.command === 'G21' || l.command === 'G20');
  const unitsLabel = unitsLine ? (unitsLine.command === 'G21' ? 'Metric (mm)' : 'Imperial (in)') : 'Unspecified';

  return (
    <aside className="flex-1 flex flex-col bg-cds-bg overflow-hidden">
      {/* Carbon $layer-01 toolbar — h-11 so the icon buttons can hit the 44px touch target */}
      <div className="h-11 bg-cds-layer-01 flex items-center justify-between px-4 border-b border-cds-border shrink-0">
        <h2 className="text-body-sm font-semibold text-cds-text-01 uppercase tracking-wider flex items-center gap-2">
          <span className="material-symbols-outlined text-sm text-cds-interactive" aria-hidden="true">code</span>
          G-Code Editor
        </h2>
        <div className="flex gap-1">
          <button className="size-11 flex items-center justify-center hover:text-cds-text-01 text-cds-text-03 transition-colors" aria-label="Upload G-code file">
            <span className="material-symbols-outlined text-sm" aria-hidden="true">upload_file</span>
          </button>
          <button className="size-11 flex items-center justify-center hover:text-cds-text-01 text-cds-text-03 transition-colors" aria-label="Save G-code file">
            <span className="material-symbols-outlined text-sm" aria-hidden="true">save</span>
          </button>
        </div>
      </div>

      {/* Execution Modifiers — the standard toggle bank next to Cycle Start
          on every commercial control (Fanuc/Haas/Siemens/Mach4). */}
      <div className="grid grid-cols-4 gap-px bg-cds-border border-b border-cds-border shrink-0">
        {MODIFIER_TOGGLES.map(({ key, label, locksWhileCutting }) => {
          const active = execModifiers[key];
          const disabled = locksWhileCutting && isCuttingLocked;
          return (
            <button
              key={key}
              type="button"
              onClick={() => onExecModifiersChange({ [key]: !active })}
              disabled={disabled}
              aria-pressed={active}
              className={`h-9 flex items-center justify-center text-[9px] font-semibold tracking-widest transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
                active
                  ? 'bg-cds-interactive/20 text-cds-interactive'
                  : 'bg-cds-layer-01 text-cds-text-04 hover:text-cds-text-02 hover:bg-white/5'
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      <div className="flex-1 overflow-y-auto font-mono text-body-sm relative">
        <table className="w-full text-left border-collapse">
          <thead className="sticky top-0 z-10 bg-cds-bg border-b border-cds-border shadow-sm">
            <tr>
              <th className="w-12 py-2 text-center text-label text-cds-text-04 font-normal select-none">#</th>
              <th className="py-2 pl-4 text-label text-cds-text-04 font-normal">Command</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-cds-border/20">
            {lines.map((line, index) => {
              const isActive = index === activeLineIndex;
              const isBypassed = !!line.blockSkip && execModifiers.blockSkip;
              return (
                <tr
                  key={line.id}
                  className={`${isActive ? 'bg-cds-layer-02/50 text-cds-text-01' : 'text-cds-text-03 hover:bg-white/5'} ${isBypassed ? 'opacity-40' : ''} group relative`}
                >
                  {/* Line number gutter – Carbon $layer-01 */}
                  <td className={`text-right pr-3 py-1.5 text-label select-none border-r border-cds-border/20 ${
                    isActive ? 'text-cds-interactive font-semibold bg-cds-layer-02' : 'text-cds-text-04 bg-cds-layer-01'
                  }`}>
                    {line.blockSkip && <span className="text-cds-warning" title="Block Skip line">/</span>}
                    {line.lineNum}
                    {isActive && <div className="absolute left-0 top-0 bottom-0 w-1 bg-cds-interactive"></div>}
                  </td>
                  <td className={`pl-4 py-1.5 ${isBypassed ? 'line-through decoration-cds-text-04' : ''}`}>
                    {/* G-code command tokens – keep yellow syntax highlight */}
                    <span className="text-cds-warning font-semibold">{line.command}</span>
                    <span className="ml-2 font-medium text-cds-text-02">{line.params}</span>
                    {line.comment && (
                      <span className="text-cds-text-04 text-label italic ml-2">({line.comment})</span>
                    )}
                    {isBypassed && (
                      <span className="text-cds-warning text-label uppercase tracking-widest ml-2 not-italic">skipped</span>
                    )}
                    {isActive && (
                      <span className="animate-pulse inline-block w-2 h-4 bg-cds-interactive align-middle ml-1"></span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Status bar – Carbon $layer-01 */}
      <div className="h-8 bg-cds-layer-01 border-t border-cds-border flex items-center px-4 justify-between text-[10px] text-cds-text-04 font-mono uppercase shrink-0">
        <span>Total Lines: {lines.length}</span>
        <span className="flex items-center gap-1.5 normal-case">
          Source: {CAM_SOURCE_INFO.postProcessor}
          <InfoTooltip>
            <dl className="space-y-2">
              <div><dt className="text-cds-text-04">CAM System</dt><dd className="text-cds-text-01">{CAM_SOURCE_INFO.camSystem}</dd></div>
              <div><dt className="text-cds-text-04">Post-Processor</dt><dd className="text-cds-text-01">{CAM_SOURCE_INFO.postProcessor}</dd></div>
              <div><dt className="text-cds-text-04">Target Control</dt><dd className="text-cds-text-01">{MACHINE_CONTROL_NAME}</dd></div>
              <div><dt className="text-cds-text-04">Program</dt><dd className="text-cds-text-01">{PROGRAM_FILE_NAME}</dd></div>
              <div><dt className="text-cds-text-04">Generated</dt><dd className="text-cds-text-01">{CAM_SOURCE_INFO.generatedAt}</dd></div>
              <div><dt className="text-cds-text-04">Units</dt><dd className="text-cds-text-01">{unitsLabel}{unitsLine ? ` (line ${unitsLine.lineNum})` : ''}</dd></div>
            </dl>
          </InfoTooltip>
        </span>
        <span>Encoding: UTF-8</span>
      </div>
    </aside>
  );
};

export default Editor;
