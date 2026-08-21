
import React from 'react';
import { Tool } from '../types';
import { CollisionReport as CollisionReportData, CollisionSeverity } from '../lib/gcode/collisionCheck';

const SEVERITY_STYLES: Record<CollisionSeverity, { text: string; badge: string; icon: string }> = {
  critical: { text: 'text-cds-error',   badge: 'bg-cds-error/10 border-cds-error/30',     icon: 'dangerous' },
  warning:  { text: 'text-cds-warning', badge: 'bg-cds-warning/10 border-cds-warning/30', icon: 'warning' },
};

interface CollisionReportProps {
  onClose: () => void;
  report: CollisionReportData;
  activeTool: Tool;
}

const CollisionReportView: React.FC<CollisionReportProps> = ({ onClose, report, activeTool }) => {
  const { findings } = report;
  const criticalCount = findings.filter(f => f.severity === 'critical').length;
  const warningCount = findings.filter(f => f.severity === 'warning').length;
  const isClear = findings.length === 0;

  return (
    <div className="fixed inset-0 bg-cds-bg/90 backdrop-blur-2xl z-[150] flex items-center justify-center p-8 animate-in fade-in duration-300">
      <div role="dialog" aria-modal="true" aria-labelledby="collision-report-title" className="w-full h-full max-w-[1400px] bg-cds-layer-01 border border-cds-border/30 shadow-[0_0_50px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden chamfer-lg relative">

        <div className="absolute inset-0 opacity-[0.03] pointer-events-none hex-bg"></div>

        {/* Header */}
        <div className="h-16 px-8 bg-black/40 border-b border-cds-border/30 flex items-center justify-between shrink-0 z-10">
          <div className="flex items-center gap-4">
            <span className="material-symbols-outlined text-cds-interactive text-2xl" aria-hidden="true">fact_check</span>
            <div>
              <h1 id="collision-report-title" className="font-display text-cds-text-01 font-semibold text-body-sm tracking-[0.3em] uppercase leading-tight">COLLISION / GOUGE REPORT</h1>
              <p className="text-[9px] text-cds-text-04 font-mono tracking-widest uppercase">Static Toolpath Verification // MACHINE_01</p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-4 text-[9px] font-mono uppercase tracking-widest">
              <span className="flex items-center gap-1.5 text-cds-error"><span className="w-1.5 h-1.5 rounded-full bg-cds-error"></span>{criticalCount} Critical</span>
              <span className="flex items-center gap-1.5 text-cds-warning"><span className="w-1.5 h-1.5 rounded-full bg-cds-warning"></span>{warningCount} Warning</span>
            </div>
            <button
              onClick={onClose}
              className="size-10 flex items-center justify-center bg-white/5 hover:bg-cds-error/20 hover:text-cds-error transition-all group"
              aria-label="Close Collision/Gouge Report"
            >
              <span className="material-symbols-outlined text-xl group-hover:rotate-90 transition-transform" aria-hidden="true">close</span>
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto p-8 z-10">
          <div className={`flex items-center gap-4 p-5 border chamfer-md mb-8 ${isClear ? 'bg-cds-success/10 border-cds-success/30' : 'bg-cds-error/10 border-cds-error/30'}`}>
            <span className={`material-symbols-outlined text-3xl ${isClear ? 'text-cds-success' : 'text-cds-error'}`} aria-hidden="true">
              {isClear ? 'verified' : 'report'}
            </span>
            <div>
              <h2 className={`text-lg font-semibold tracking-[0.1em] uppercase ${isClear ? 'text-cds-success' : 'text-cds-error'}`}>
                {isClear ? 'Clear -- No Risks Detected' : `${findings.length} Issue${findings.length === 1 ? '' : 's'} Found`}
              </h2>
              <p className="text-[10px] text-cds-text-03 font-mono tracking-widest uppercase mt-1">
                {isClear
                  ? `Program verified against a Z${report.safeClearanceZMm.toFixed(3)}mm clearance plane and ${activeTool.id}'s live geometry`
                  : 'Review each finding below before running this program unattended'}
              </p>
            </div>
          </div>

          {!isClear && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
              {findings.map(finding => {
                const style = SEVERITY_STYLES[finding.severity];
                return (
                  <div key={finding.id} className={`bg-cds-bg/60 border p-5 chamfer-md flex flex-col gap-3 ${style.badge}`}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className={`material-symbols-outlined text-xl shrink-0 ${style.text}`} aria-hidden="true">{style.icon}</span>
                        <h3 className="text-cds-text-01 font-semibold text-body-sm tracking-wide truncate">{finding.title}</h3>
                      </div>
                      <span className={`text-[9px] font-semibold tracking-widest uppercase shrink-0 ${style.text}`}>{finding.severity}</span>
                    </div>
                    {finding.lineNum && (
                      <span className="text-[9px] font-mono text-cds-text-04 uppercase tracking-tighter">Line {finding.lineNum}</span>
                    )}
                    <p className="text-[11px] text-cds-text-03 leading-relaxed">{finding.detail}</p>
                  </div>
                );
              })}
            </div>
          )}

          {/* How this works -- makes clear these are real, computed checks
              against live tool state, not random incidents, and tells a
              viewer exactly how to go trip one. */}
          <div className="bg-black/20 border border-cds-border/20 p-5 chamfer-sm">
            <h2 className="text-cds-text-01 font-semibold text-body-sm tracking-[0.1em] uppercase mb-3">How This Report Works</h2>
            <ul className="space-y-2 text-[11px] text-cds-text-03 leading-relaxed">
              <li><span className="text-cds-text-01 font-semibold">Rapid traverse check:</span> flags any G00 rapid move that changes X/Y while dipping below the Z{report.safeClearanceZMm.toFixed(3)}mm clearance plane -- a real traverse-through-stock collision risk, since rapids don't ramp into material like a feed move.</li>
              <li><span className="text-cds-text-01 font-semibold">Tool diameter offset check:</span> flags the active tool if its diameter offset (D, Tool Offset Table) has drifted more than {report.diameterToleranceMm.toFixed(3)}mm from its nominal diameter -- an oversized cutter gouges walls the program planned around the nominal size.</li>
              <li><span className="text-cds-text-01 font-semibold">Tool life check:</span> flags the active tool once its use count reaches its rated life -- worn tooling drifts dimensionally and increases gouge risk.</li>
            </ul>
            <p className="text-[10px] text-cds-text-04 font-mono mt-4 uppercase tracking-widest">
              Try it: Edit &rarr; Tool Offset Table &rarr; push {activeTool.id}'s D offset past &plusmn;{report.diameterToleranceMm.toFixed(3)}mm, then reopen this report.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="h-10 bg-cds-bg px-8 border-t border-cds-border/30 flex items-center justify-between text-[9px] font-mono text-cds-text-04 tracking-[0.2em] uppercase shrink-0">
          <div className="flex gap-8">
            <span className="flex items-center gap-2"><div className={`w-1 h-1 ${isClear ? 'bg-cds-success' : 'bg-cds-error'}`}></div> VERIFY_LINK: {isClear ? 'CLEAR' : 'ISSUES FOUND'}</span>
            <span>3 checks run against {activeTool.id}</span>
          </div>
          <div>STATIC TOOLPATH ANALYSIS v1.0</div>
        </div>
      </div>
    </div>
  );
};

export default CollisionReportView;
