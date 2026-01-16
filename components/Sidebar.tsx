
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
    <aside className="flex-1 flex flex-col bg-[#1A1A1A] border-[#404040] shadow-xl z-20 overflow-hidden">
      <div className="flex-1 overflow-y-auto">
        {/* Digital Read Out (DRO) */}
        <div className="p-6 border-b border-[#404040] bg-[#181818]">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">my_location</span> Coordinates
          </h3>
          <div className="grid grid-cols-1 gap-3 font-mono">
            <DROField label="X" value={coords.x} color="red-500" />
            <DROField label="Y" value={coords.y} color="green-500" />
            <DROField label="Z" value={coords.z} color="blue-500" />
          </div>
        </div>

        {/* Machine Status */}
        <div className="p-6 border-b border-[#404040]">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">speed</span> Status
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <StatusCard label="Spindle (RPM)" value={status.spindleRpm.toLocaleString()} fillPercent={status.isSimulating ? 80 : 0} color="white" />
            <StatusCard label="Feed (mm/m)" value={status.feedRate} fillPercent={status.isSimulating ? 40 : 0} color="primary" />
          </div>
        </div>

        {/* Tools Section */}
        <div className="flex-1 flex flex-col p-6">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">handyman</span> Tooling
          </h3>
          
          {/* Active Tool */}
          <div className="bg-[#141414] border border-[#404040] p-4 flex gap-4 items-center shrink-0">
            <div className="w-12 h-12 bg-white/5 flex items-center justify-center border border-white/10 shrink-0">
              <span className="material-symbols-outlined text-gray-300">construction</span>
            </div>
            <div className="min-w-0">
              <div className="text-[#1791cf] font-bold font-mono text-sm truncate">{activeTool.id}</div>
              <div className="text-white text-sm font-medium truncate">{activeTool.name}</div>
              <div className="text-gray-500 text-xs mt-0.5 truncate">D: {activeTool.diameter} | L: {activeTool.length}</div>
            </div>
          </div>

          {/* Next Tool Preview */}
          <div className="mt-4 opacity-60 shrink-0">
            <div className="text-[10px] uppercase text-gray-500 font-bold mb-2 px-1">Next Up</div>
            <div className="bg-[#2B2B2B]/50 border border-white/5 p-3 flex gap-3 items-center">
              <div className="w-8 h-8 bg-white/5 flex items-center justify-center border border-white/10 shrink-0">
                <span className="material-symbols-outlined text-gray-400 text-sm">circle</span>
              </div>
              <div className="min-w-0">
                <div className="text-gray-300 font-bold font-mono text-xs truncate">{nextTool.id}</div>
                <div className="text-gray-400 text-xs font-medium truncate">{nextTool.name}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Control Actions */}
      <div className="p-6 bg-[#111] border-t border-[#404040] shrink-0">
        <div className="grid grid-cols-2 gap-3 mb-3">
          <button 
            onClick={onCycleStart}
            disabled={status.isSimulating}
            className={`col-span-2 h-16 font-black text-xl flex items-center justify-center gap-3 transition-all chamfer-lg active:scale-[0.98] ${
              status.isSimulating 
                ? 'bg-gray-600 cursor-not-allowed opacity-50' 
                : 'bg-[#1791cf] hover:bg-[#1fa9f0] shadow-[0_0_20px_rgba(23,145,207,0.4)]'
            }`}
          >
            <span className="material-symbols-outlined text-2xl">play_arrow</span>
            CYCLE START
          </button>
          <button 
            onClick={onFeedHold}
            className="h-10 bg-[#2B2B2B] hover:bg-white/10 text-white font-medium text-sm flex items-center justify-center gap-2 border border-white/10 transition-colors chamfer-sm"
          >
            <span className="material-symbols-outlined text-yellow-500 text-[18px]">pause</span>
            FEED HOLD
          </button>
          <button 
            onClick={onReset}
            className="h-10 bg-[#2B2B2B] hover:bg-red-900/30 text-white font-medium text-sm flex items-center justify-center gap-2 border border-white/10 hover:border-red-500/50 transition-colors chamfer-sm"
          >
            <span className="material-symbols-outlined text-red-500 text-[18px]">stop</span>
            RESET
          </button>
        </div>
        <div className="flex justify-between items-center mt-4 pt-4 border-t border-white/10">
          <span className="text-[10px] text-gray-500 font-mono">EST TIME: 1h 45m</span>
          <span className="text-[10px] text-gray-500 font-mono whitespace-nowrap">COOLANT: <span className={`font-bold ${status.coolant ? 'text-[#1791cf]' : 'text-gray-400'}`}>{status.coolant ? 'ON' : 'OFF'}</span></span>
        </div>
      </div>
    </aside>
  );
};

const DROField: React.FC<{ label: string; value: number; color: string }> = ({ label, value, color }) => (
  <div className="flex items-center justify-between bg-black/40 border border-white/5 p-3 relative overflow-hidden group">
    <div className={`absolute left-0 top-0 bottom-0 w-1 bg-${color}`}></div>
    <span className="text-gray-400 text-lg font-bold">{label}</span>
    <span className={`text-3xl font-medium tracking-tight text-white group-hover:text-${color} transition-colors tabular-nums`}>
      {value.toFixed(3).padStart(8, '0')}
    </span>
    <span className="text-xs text-gray-600">mm</span>
  </div>
);

const StatusCard: React.FC<{ label: string; value: string | number; fillPercent: number; color: string }> = ({ label, value, fillPercent, color }) => (
  <div className="bg-[#2B2B2B] p-3 border border-white/5 overflow-hidden">
    <div className="text-[10px] uppercase text-gray-400 mb-1 truncate">{label}</div>
    <div className="flex items-baseline gap-1">
      <span className="text-xl font-mono text-white tabular-nums">{value}</span>
    </div>
    <div className="w-full bg-black h-1 mt-2 overflow-hidden">
      <div className={`h-full transition-all duration-500 ${color === 'primary' ? 'bg-[#1791cf]' : 'bg-white'}`} style={{ width: `${fillPercent}%` }}></div>
    </div>
  </div>
);

export default Sidebar;
