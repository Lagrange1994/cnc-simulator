
import React, { useState } from 'react';

interface EditSidebarProps {
  onClose: () => void;
}

const EditSidebar: React.FC<EditSidebarProps> = ({ onClose }) => {
  const [expandedSections, setExpandedSections] = useState({
    tools: true,
    geometry: true,
    macros: false
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  return (
    <div className="fixed top-14 left-0 bottom-6 w-[400px] bg-[#1F1F1F]/95 backdrop-blur-2xl border-r border-white/10 z-[60] flex flex-col shadow-2xl animate-in slide-in-from-left duration-300 overflow-hidden">
      {/* HEADER: PRO EDITOR - Unified Icon + Text Style */}
      <div className="h-16 px-6 bg-gradient-to-r from-black/40 to-transparent border-b border-white/10 flex justify-between items-center shrink-0">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-[#1890FF] text-2xl">edit_note</span>
          <div>
            <h2 className="text-white font-black text-sm tracking-[0.2em] uppercase leading-tight">PRO EDITOR</h2>
            <p className="text-[9px] text-gray-500 font-mono tracking-wider">COMMAND_CENTER v2.0</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button className="p-2 text-gray-400 hover:text-white hover:bg-white/5 transition-all" title="Undo"><span className="material-symbols-outlined text-lg">undo</span></button>
          <button className="p-2 text-gray-400 hover:text-white hover:bg-white/5 transition-all" title="Redo"><span className="material-symbols-outlined text-lg">redo</span></button>
          <button className="p-2 text-[#1890FF] hover:bg-[#1890FF]/10 transition-all" title="Save"><span className="material-symbols-outlined text-lg">save</span></button>
          <div className="w-px h-4 bg-white/10 mx-1"></div>
          <button onClick={onClose} className="p-2 text-gray-500 hover:text-red-500 transition-all"><span className="material-symbols-outlined text-lg">close</span></button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin">
        {/* SECTION 1: QUICK ACTIONS */}
        <div className="p-6 pb-4">
          <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3">Quick Search & Nav</h3>
          <div className="flex gap-2">
            <button className="flex-1 aspect-square max-h-12 bg-[#2B2B2B] hover:bg-[#3D3D3D] border border-white/10 flex flex-col items-center justify-center gap-1 transition-all group chamfer-sm">
              <span className="material-symbols-outlined text-sm text-gray-400 group-hover:text-[#1890FF]">search</span>
              <span className="text-[8px] font-bold text-gray-500">FIND</span>
            </button>
            <button className="flex-1 aspect-square max-h-12 bg-[#2B2B2B] hover:bg-[#3D3D3D] border border-white/10 flex flex-col items-center justify-center gap-1 transition-all group chamfer-sm">
              <span className="material-symbols-outlined text-sm text-gray-400 group-hover:text-[#1890FF]">find_replace</span>
              <span className="text-[8px] font-bold text-gray-500">REPLACE</span>
            </button>
            <button className="flex-1 aspect-square max-h-12 bg-[#2B2B2B] hover:bg-[#3D3D3D] border border-white/10 flex flex-col items-center justify-center gap-1 transition-all group chamfer-sm">
              <span className="material-symbols-outlined text-sm text-gray-400 group-hover:text-[#1890FF]">shortcut</span>
              <span className="text-[8px] font-bold text-gray-500">GOTO</span>
            </button>
          </div>
        </div>

        {/* SECTION 2: TOOL & CODE OPS */}
        <div className="border-t border-white/5">
          <button 
            onClick={() => toggleSection('tools')}
            className="w-full h-12 px-6 flex items-center justify-between bg-white/2 hover:bg-white/5 transition-colors group"
          >
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-sm text-[#1890FF]">construction</span>
              <span className="text-[10px] font-black tracking-widest text-gray-300">TOOL & CODE OPERATIONS</span>
            </div>
            <span className={`material-symbols-outlined text-gray-600 transition-transform ${expandedSections.tools ? 'rotate-180' : ''}`}>expand_more</span>
          </button>
          
          {expandedSections.tools && (
            <div className="p-6 pt-2 space-y-6 animate-in slide-in-from-top-2 duration-300">
              {/* Tool Mapper Grid */}
              <div>
                <label className="text-[9px] text-gray-600 block mb-2 uppercase font-bold tracking-tighter">Tool Remapper Matrix</label>
                <div className="space-y-1 font-mono">
                  <div className="flex items-center gap-3 text-[10px] bg-black/20 p-2 border border-white/5 chamfer-sm">
                    <span className="text-gray-500 w-16">SRC: T01</span>
                    <span className="material-symbols-outlined text-xs text-[#1890FF]">trending_flat</span>
                    <span className="text-gray-400">TARGET:</span>
                    <input type="text" defaultValue="T05" className="bg-black/40 border border-white/10 w-12 text-center text-[#1890FF] outline-none focus:border-[#1890FF]" />
                  </div>
                  <div className="flex items-center gap-3 text-[10px] bg-black/20 p-2 border border-white/5 chamfer-sm">
                    <span className="text-gray-500 w-16">SRC: T02</span>
                    <span className="material-symbols-outlined text-xs text-[#1890FF]">trending_flat</span>
                    <span className="text-gray-400">TARGET:</span>
                    <input type="text" defaultValue="T08" className="bg-black/40 border border-white/10 w-12 text-center text-[#1890FF] outline-none focus:border-[#1890FF]" />
                  </div>
                </div>
                <button className="w-full h-8 mt-3 bg-[#1890FF]/10 hover:bg-[#1890FF]/20 text-[#1890FF] text-[9px] font-black tracking-[0.2em] border border-[#1890FF]/30 transition-all chamfer-sm">
                  EXECUTE TOOL SWAP
                </button>
              </div>

              {/* Standard Ops */}
              <div className="space-y-1.5">
                {[
                  { label: 'Renumber Block Sequence', icon: 'format_list_numbered' },
                  { label: 'Fix Trailing Decimals', icon: 'exposure_zero' },
                  { label: 'Strip All Comments', icon: 'comments_disabled' }
                ].map((op) => (
                  <button key={op.label} className="w-full h-10 px-4 bg-black/20 hover:bg-white/5 flex items-center justify-between text-[9px] font-bold text-gray-400 hover:text-white border border-white/5 transition-all group">
                    <span className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-sm text-gray-600 group-hover:text-[#1890FF]">{op.icon}</span>
                      {op.label.toUpperCase()}
                    </span>
                    <span className="material-symbols-outlined text-xs opacity-0 group-hover:opacity-100">chevron_right</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* SECTION 3: BOUNDING BOX & LIMITS */}
        <div className="border-t border-white/5">
          <button 
            onClick={() => toggleSection('geometry')}
            className="w-full h-12 px-6 flex items-center justify-between bg-white/2 hover:bg-white/5 transition-colors group"
          >
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-sm text-[#1890FF]">architecture</span>
              <span className="text-[10px] font-black tracking-widest text-gray-300">BOUNDING BOX & LIMITS</span>
            </div>
            <span className={`material-symbols-outlined text-gray-600 transition-transform ${expandedSections.geometry ? 'rotate-180' : ''}`}>expand_more</span>
          </button>
          
          {expandedSections.geometry && (
            <div className="p-6 pt-2 animate-in slide-in-from-top-2 duration-300 hex-bg">
              <div className="bg-[#1A1A1A]/80 backdrop-blur-sm border border-white/10 p-4 space-y-4">
                {/* Min/Max Grid */}
                <div>
                  <label className="text-[9px] text-gray-600 block mb-3 uppercase font-bold tracking-tighter">Geometric Range Display</label>
                  <div className="grid grid-cols-2 gap-px bg-white/5 border border-white/10 font-mono overflow-hidden">
                    {/* Headers */}
                    <div className="bg-black/40 p-2 text-[8px] text-gray-600 text-center border-b border-white/5">MINIMUM RANGE</div>
                    <div className="bg-black/40 p-2 text-[8px] text-gray-600 text-center border-b border-white/5">MAXIMUM RANGE</div>
                    
                    {/* Rows */}
                    <div className="bg-black/20 p-3 text-center border-r border-white/5">
                      <div className="text-[9px] text-gray-600 mb-1">X</div>
                      <div className="text-sm font-bold text-red-500">-100.000</div>
                    </div>
                    <div className="bg-black/20 p-3 text-center">
                      <div className="text-[9px] text-gray-600 mb-1">X</div>
                      <div className="text-sm font-bold text-white">100.000</div>
                    </div>
                    
                    <div className="bg-black/20 p-3 text-center border-r border-white/5">
                      <div className="text-[9px] text-gray-600 mb-1">Y</div>
                      <div className="text-sm font-bold text-red-500">-50.000</div>
                    </div>
                    <div className="bg-black/20 p-3 text-center">
                      <div className="text-[9px] text-gray-600 mb-1">Y</div>
                      <div className="text-sm font-bold text-white">50.000</div>
                    </div>
                    
                    <div className="bg-black/20 p-3 text-center border-r border-white/5">
                      <div className="text-[9px] text-gray-600 mb-1">Z</div>
                      <div className="text-sm font-bold text-red-500">-10.000</div>
                    </div>
                    <div className="bg-black/20 p-3 text-center">
                      <div className="text-[9px] text-gray-600 mb-1">Z</div>
                      <div className="text-sm font-bold text-white">50.000</div>
                    </div>
                  </div>
                </div>

                {/* Z-Clamp */}
                <div className="flex items-center justify-between gap-4 pt-2">
                  <div className="flex-1">
                    <label className="text-[9px] text-gray-500 block mb-1 uppercase font-bold tracking-tighter">Safety Z-Clamp</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-mono text-gray-600">MIN_Z:</span>
                      <input type="text" defaultValue="-15.00" className="w-full h-10 bg-black/40 border border-white/10 pl-14 pr-4 text-xs font-mono text-[#1890FF] outline-none focus:border-[#1890FF]/50" />
                    </div>
                  </div>
                  <div className="w-12 h-10 bg-[#1890FF]/20 border border-[#1890FF]/40 flex items-center justify-center text-[#1890FF]">
                    <span className="material-symbols-outlined">lock</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* SECTION 4: MACRO VARIABLES */}
        <div className="border-t border-b border-white/5">
          <button 
            onClick={() => toggleSection('macros')}
            className="w-full h-12 px-6 flex items-center justify-between bg-white/2 hover:bg-white/5 transition-colors group"
          >
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-sm text-gray-500">settings_input_component</span>
              <span className="text-[10px] font-black tracking-widest text-gray-500 group-hover:text-gray-300">MACRO VARIABLES (#100-#500)</span>
            </div>
            <span className={`material-symbols-outlined text-gray-700 transition-transform ${expandedSections.macros ? 'rotate-180' : ''}`}>chevron_right</span>
          </button>
          
          {expandedSections.macros && (
            <div className="p-6 pt-2 animate-in slide-in-from-top-2 duration-300">
              <div className="text-[10px] text-gray-600 italic text-center py-4 border border-dashed border-white/10">
                Macro state storage initialized. Waiting for variable calls...
              </div>
            </div>
          )}
        </div>
      </div>

      {/* FOOTER: SYSTEM STATUS */}
      <div className="h-10 bg-black/40 border-t border-white/10 flex items-center justify-center gap-6 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 bg-green-500 shadow-[0_0_5px_rgba(34,197,94,0.5)]"></div>
          <span className="text-[8px] font-mono text-gray-500 uppercase tracking-widest">Compiler: Active</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 bg-[#1890FF] shadow-[0_0_5px_rgba(24,144,255,0.5)]"></div>
          <span className="text-[8px] font-mono text-gray-500 uppercase tracking-widest">Latency: 0.002ms</span>
        </div>
      </div>
    </div>
  );
};

export default EditSidebar;
