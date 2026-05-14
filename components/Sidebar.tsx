
import React from 'react';
import { Coordinates, MachineStatus, Tool } from '../types';

interface SidebarProps {
  coords: Coordinates;
  status: MachineStatus;
  activeTool: Tool;
  nextTool: Tool;
  onCycleStart: () => void;
  onFeedHold: () => void;
  onReset: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  coords, status, activeTool, nextTool,
  onCycleStart, onFeedHold, onReset
}) => {
  return (
    <aside className="flex-1 flex flex-col bg-cds-bg border-cds-border shadow-xl z-20 overflow-hidden">
      <div className="flex-1 overflow-y-auto">

        {/* Digital Read Out (DRO) – Carbon $layer-01 panel */}
        <div className="p-6 border-b border-cds-border bg-cds-layer-01">
          <h3 className="text-label font-semibold text-cds-text-03 uppercase tracking-widest mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">my_location</span> Coordinates
          </h3>
          <div className="grid grid-cols-1 gap-3 font-mono">
            <DROField label="X" value={coords.x} color="red-500" />
            <DROField label="Y" value={coords.y} color="cds-success" />
            <DROField label="Z" value={coords.z} color="cds-interactive" />
          </div>
        </div>

        {/* Machine Status */}
        <div className="p-6 border-b border-cds-border">
          <h3 className="text-label font-semibold text-cds-text-03 uppercase tracking-widest mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">speed</span> Status
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <StatusCard label="Spindle (RPM)" value={status.spindleRpm.toLocaleString()} fillPercent={status.isSimulating ? 80 : 0} color="white" />
            <StatusCard label="Feed (mm/m)"   value={status.feedRate}                   fillPercent={status.isSimulating ? 40 : 0} color="interactive" />
          </div>
        </div>

        {/* Tools Section */}
        <div className="flex-1 flex flex-col p-6">
          <h3 className="text-label font-semibold text-cds-text-03 uppercase tracking-widest mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">handyman</span> Tooling
          </h3>

          {/* Active Tool – Carbon $layer-02 */}
          <div className="bg-cds-layer-01 border border-cds-border p-4 flex gap-4 items-center shrink-0">
            <div className="w-12 h-12 bg-white/5 flex items-center justify-center border border-cds-border-str/30 shrink-0">
              <span className="material-symbols-outlined text-cds-text-02">construction</span>
            </div>
            <div className="min-w-0">
              <div className="text-cds-interactive font-semibold font-mono text-body-sm truncate">{activeTool.id}</div>
              <div className="text-cds-text-01 text-body-sm font-medium truncate">{activeTool.name}</div>
              <div className="text-cds-text-04 text-label mt-0.5 truncate">D: {activeTool.diameter} | L: {activeTool.length}</div>
            </div>
          </div>

          {/* Next Tool Preview */}
          <div className="mt-4 opacity-60 shrink-0">
            <div className="text-[10px] uppercase text-cds-text-04 font-semibold mb-2 px-1">Next Up</div>
            <div className="bg-cds-layer-01/50 border border-white/5 p-3 flex gap-3 items-center">
              <div className="w-8 h-8 bg-white/5 flex items-center justify-center border border-cds-border/30 shrink-0">
                <span className="material-symbols-outlined text-cds-text-03 text-sm">circle</span>
              </div>
              <div className="min-w-0">
                <div className="text-cds-text-02 font-semibold font-mono text-label truncate">{nextTool.id}</div>
                <div className="text-cds-text-03 text-label font-medium truncate">{nextTool.name}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Control Actions – Carbon Primary / Ghost buttons */}
      <div className="p-6 bg-cds-layer-01 border-t border-cds-border shrink-0">
        <div className="grid grid-cols-2 gap-3 mb-3">
          {/* Carbon Primary Button – $interactive */}
          <button
            onClick={onCycleStart}
            disabled={status.isSimulating}
            className={`col-span-2 h-16 font-bold text-xl flex items-center justify-center gap-3 transition-all chamfer-lg active:scale-[0.98] ${
              status.isSimulating
                ? 'bg-cds-layer-02 cursor-not-allowed opacity-50 text-cds-text-04'
                : 'bg-cds-interactive hover:bg-cds-link text-white shadow-[0_0_20px_rgba(69,137,255,0.4)]'
            }`}
          >
            <span className="material-symbols-outlined text-2xl">play_arrow</span>
            CYCLE START
          </button>
          {/* Carbon Ghost Button */}
          <button
            onClick={onFeedHold}
            className="h-10 bg-cds-layer-02 hover:bg-cds-layer-03 text-cds-text-01 font-medium text-body-sm flex items-center justify-center gap-2 border border-cds-border-str/40 transition-colors chamfer-sm"
          >
            <span className="material-symbols-outlined text-cds-warning text-[18px]">pause</span>
            FEED HOLD
          </button>
          <button
            onClick={onReset}
            className="h-10 bg-cds-layer-02 hover:bg-red-900/30 text-cds-text-01 font-medium text-body-sm flex items-center justify-center gap-2 border border-cds-border-str/40 hover:border-cds-error/50 transition-colors chamfer-sm"
          >
            <span className="material-symbols-outlined text-cds-error text-[18px]">stop</span>
            RESET
          </button>
        </div>
        <div className="flex justify-between items-center mt-4 pt-4 border-t border-cds-border">
          <span className="text-[10px] text-cds-text-04 font-mono">EST TIME: 1h 45m</span>
          <span className="text-[10px] text-cds-text-04 font-mono whitespace-nowrap">
            COOLANT: <span className={`font-semibold ${status.coolant ? 'text-cds-interactive' : 'text-cds-text-04'}`}>
              {status.coolant ? 'ON' : 'OFF'}
            </span>
          </span>
        </div>
      </div>
    </aside>
  );
};

const DROField: React.FC<{ label: string; value: number; color: string }> = ({ label, value, color }) => (
  <div className="flex items-center justify-between bg-black/40 border border-cds-border/30 p-3 relative overflow-hidden group">
    <div className={`absolute left-0 top-0 bottom-0 w-1 bg-${color}`}></div>
    <span className="text-cds-text-03 text-lg font-semibold">{label}</span>
    <span className={`text-3xl font-medium tracking-tight text-cds-text-01 group-hover:text-${color} transition-colors tabular-nums font-mono`}>
      {value.toFixed(3).padStart(8, '0')}
    </span>
    <span className="text-label text-cds-text-04">mm</span>
  </div>
);

const StatusCard: React.FC<{ label: string; value: string | number; fillPercent: number; color: string }> = ({ label, value, fillPercent, color }) => (
  <div className="bg-cds-layer-02 p-3 border border-cds-border/30 overflow-hidden">
    <div className="text-[10px] uppercase text-cds-text-03 mb-1 truncate">{label}</div>
    <div className="flex items-baseline gap-1">
      <span className="text-xl font-mono text-cds-text-01 tabular-nums">{value}</span>
    </div>
    <div className="w-full bg-black/40 h-1 mt-2 overflow-hidden">
      <div
        className={`h-full transition-all duration-500 ${color === 'interactive' ? 'bg-cds-interactive' : 'bg-cds-text-01'}`}
        style={{ width: `${fillPercent}%` }}
      ></div>
    </div>
  </div>
);

export default Sidebar;
