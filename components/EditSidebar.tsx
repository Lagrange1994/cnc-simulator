
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
    <div className="fixed top-14 left-0 bottom-6 w-[400px] bg-cds-layer-01/95 backdrop-blur-2xl border-r border-cds-border z-[60] flex flex-col shadow-2xl animate-in slide-in-from-left duration-300 overflow-hidden">
      {/* Header */}
      <div className="h-16 px-6 bg-gradient-to-r from-black/40 to-transparent border-b border-cds-border flex justify-between items-center shrink-0">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-cds-interactive text-2xl">edit_note</span>
          <div>
            <h2 className="text-cds-text-01 font-semibold text-body-sm tracking-[0.2em] uppercase leading-tight">PRO EDITOR</h2>
            <p className="text-label text-cds-text-03 font-mono tracking-wider">COMMAND_CENTER v2.0</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button className="p-2 text-cds-text-03 hover:text-cds-text-01 hover:bg-white/5 transition-all" title="Undo">
            <span className="material-symbols-outlined text-lg">undo</span>
          </button>
          <button className="p-2 text-cds-text-03 hover:text-cds-text-01 hover:bg-white/5 transition-all" title="Redo">
            <span className="material-symbols-outlined text-lg">redo</span>
          </button>
          <button className="p-2 text-cds-interactive hover:bg-cds-interactive/10 transition-all" title="Save">
            <span className="material-symbols-outlined text-lg">save</span>
          </button>
          <div className="w-px h-4 bg-cds-border mx-1"></div>
          <button onClick={onClose} className="p-2 text-cds-text-03 hover:text-cds-error transition-all">
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Quick Actions */}
        <div className="p-6 pb-4">
          <h3 className="text-[10px] font-semibold text-cds-text-03 uppercase tracking-widest mb-3">Quick Search & Nav</h3>
          <div className="flex gap-2">
            {[
              { icon: 'search', label: 'FIND' },
              { icon: 'find_replace', label: 'REPLACE' },
              { icon: 'shortcut', label: 'GOTO' },
            ].map(({ icon, label }) => (
              <button key={label} className="flex-1 aspect-square max-h-12 bg-cds-layer-02 hover:bg-cds-layer-03 border border-cds-border flex flex-col items-center justify-center gap-1 transition-all group chamfer-sm">
                <span className={`material-symbols-outlined text-sm text-cds-text-03 group-hover:text-cds-interactive`}>{icon}</span>
                <span className="text-[8px] font-semibold text-cds-text-04">{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tool & Code Operations */}
        <div className="border-t border-cds-border/30">
          <button
            onClick={() => toggleSection('tools')}
            className="w-full h-12 px-6 flex items-center justify-between bg-white/2 hover:bg-white/5 transition-colors group"
          >
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-sm text-cds-interactive">construction</span>
              <span className="text-[10px] font-semibold tracking-widest text-cds-text-02">TOOL & CODE OPERATIONS</span>
            </div>
            <span className={`material-symbols-outlined text-cds-text-04 transition-transform ${expandedSections.tools ? 'rotate-180' : ''}`}>expand_more</span>
          </button>

          {expandedSections.tools && (
            <div className="p-6 pt-2 space-y-6 animate-in slide-in-from-top-2 duration-300">
              <div>
                <label className="text-[9px] text-cds-text-04 block mb-2 uppercase font-semibold tracking-tighter">Tool Remapper Matrix</label>
                <div className="space-y-1 font-mono">
                  {[
                    { src: 'T01', target: 'T05' },
                    { src: 'T02', target: 'T08' },
                  ].map(({ src, target }) => (
                    <div key={src} className="flex items-center gap-3 text-[10px] bg-black/20 p-2 border border-cds-border/20 chamfer-sm">
                      <span className="text-cds-text-04 w-16">SRC: {src}</span>
                      <span className="material-symbols-outlined text-xs text-cds-interactive">trending_flat</span>
                      <span className="text-cds-text-03">TARGET:</span>
                      <input
                        type="text"
                        defaultValue={target}
                        className="bg-black/40 border border-cds-border/30 w-12 text-center text-cds-interactive outline-none focus:border-cds-interactive text-[10px] font-mono"
                      />
                    </div>
                  ))}
                </div>
                <button className="w-full h-8 mt-3 bg-cds-interactive/10 hover:bg-cds-interactive/20 text-cds-interactive text-[9px] font-semibold tracking-[0.2em] border border-cds-interactive/30 transition-all chamfer-sm">
                  EXECUTE TOOL SWAP
                </button>
              </div>

              <div className="space-y-1.5">
                {[
                  { label: 'Renumber Block Sequence', icon: 'format_list_numbered' },
                  { label: 'Fix Trailing Decimals',   icon: 'exposure_zero' },
                  { label: 'Strip All Comments',       icon: 'comments_disabled' }
                ].map((op) => (
                  <button key={op.label} className="w-full h-10 px-4 bg-black/20 hover:bg-white/5 flex items-center justify-between text-[9px] font-semibold text-cds-text-03 hover:text-cds-text-01 border border-cds-border/20 transition-all group">
                    <span className="flex items-center gap-3">
                      <span className={`material-symbols-outlined text-sm text-cds-text-04 group-hover:text-cds-interactive`}>{op.icon}</span>
                      {op.label.toUpperCase()}
                    </span>
                    <span className="material-symbols-outlined text-xs opacity-0 group-hover:opacity-100">chevron_right</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Bounding Box & Limits */}
        <div className="border-t border-cds-border/30">
          <button
            onClick={() => toggleSection('geometry')}
            className="w-full h-12 px-6 flex items-center justify-between bg-white/2 hover:bg-white/5 transition-colors group"
          >
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-sm text-cds-interactive">architecture</span>
              <span className="text-[10px] font-semibold tracking-widest text-cds-text-02">BOUNDING BOX & LIMITS</span>
            </div>
            <span className={`material-symbols-outlined text-cds-text-04 transition-transform ${expandedSections.geometry ? 'rotate-180' : ''}`}>expand_more</span>
          </button>

          {expandedSections.geometry && (
            <div className="p-6 pt-2 animate-in slide-in-from-top-2 duration-300 hex-bg">
              <div className="bg-cds-bg/80 backdrop-blur-sm border border-cds-border/30 p-4 space-y-4">
                <div>
                  <label className="text-[9px] text-cds-text-04 block mb-3 uppercase font-semibold tracking-tighter">Geometric Range Display</label>
                  <div className="grid grid-cols-2 gap-px bg-cds-border/20 border border-cds-border/20 font-mono overflow-hidden">
                    <div className="bg-black/40 p-2 text-[8px] text-cds-text-04 text-center border-b border-cds-border/20">MINIMUM RANGE</div>
                    <div className="bg-black/40 p-2 text-[8px] text-cds-text-04 text-center border-b border-cds-border/20">MAXIMUM RANGE</div>
                    {[
                      { axis: 'X', min: '-100.000', max: '100.000' },
                      { axis: 'Y', min: '-50.000',  max: '50.000'  },
                      { axis: 'Z', min: '-10.000',  max: '50.000'  },
                    ].map(({ axis, min, max }) => (
                      <React.Fragment key={axis}>
                        <div className="bg-black/20 p-3 text-center border-r border-cds-border/20">
                          <div className="text-[9px] text-cds-text-04 mb-1">{axis}</div>
                          <div className="text-body-sm font-semibold text-cds-error">{min}</div>
                        </div>
                        <div className="bg-black/20 p-3 text-center">
                          <div className="text-[9px] text-cds-text-04 mb-1">{axis}</div>
                          <div className="text-body-sm font-semibold text-cds-text-01">{max}</div>
                        </div>
                      </React.Fragment>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between gap-4 pt-2">
                  <div className="flex-1">
                    <label className="text-[9px] text-cds-text-03 block mb-1 uppercase font-semibold tracking-tighter">Safety Z-Clamp</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-mono text-cds-text-04">MIN_Z:</span>
                      <input
                        type="text"
                        defaultValue="-15.00"
                        className="w-full h-10 bg-black/40 border border-cds-border/30 pl-14 pr-4 text-label font-mono text-cds-interactive outline-none focus:border-cds-interactive/50"
                      />
                    </div>
                  </div>
                  <div className="w-12 h-10 bg-cds-interactive/20 border border-cds-interactive/40 flex items-center justify-center text-cds-interactive">
                    <span className="material-symbols-outlined">lock</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Macro Variables */}
        <div className="border-t border-b border-cds-border/30">
          <button
            onClick={() => toggleSection('macros')}
            className="w-full h-12 px-6 flex items-center justify-between bg-white/2 hover:bg-white/5 transition-colors group"
          >
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-sm text-cds-text-03">settings_input_component</span>
              <span className="text-[10px] font-semibold tracking-widest text-cds-text-03 group-hover:text-cds-text-02">MACRO VARIABLES (#100-#500)</span>
            </div>
            <span className={`material-symbols-outlined text-cds-text-04 transition-transform ${expandedSections.macros ? 'rotate-180' : ''}`}>chevron_right</span>
          </button>

          {expandedSections.macros && (
            <div className="p-6 pt-2 animate-in slide-in-from-top-2 duration-300">
              <div className="text-[10px] text-cds-text-04 italic text-center py-4 border border-dashed border-cds-border/30">
                Macro state storage initialized. Waiting for variable calls...
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="h-10 bg-black/40 border-t border-cds-border flex items-center justify-center gap-6 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 bg-cds-success shadow-[0_0_5px_rgba(66,190,101,0.5)]"></div>
          <span className="text-[8px] font-mono text-cds-text-04 uppercase tracking-widest">Compiler: Active</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 bg-cds-interactive shadow-[0_0_5px_rgba(69,137,255,0.5)]"></div>
          <span className="text-[8px] font-mono text-cds-text-04 uppercase tracking-widest">Latency: 0.002ms</span>
        </div>
      </div>
    </div>
  );
};

export default EditSidebar;
