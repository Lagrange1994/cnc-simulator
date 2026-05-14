
import React, { useState } from 'react';

interface SettingsManagerProps {
  onClose: () => void;
}

const SettingsManager: React.FC<SettingsManagerProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState('General');

  const [qualityPreset, setQualityPreset] = useState('ULTRA');
  const [unitSystem, setUnitSystem] = useState('METRIC');
  const [rayTracing, setRayTracing] = useState(true);

  const [collisionToolFixture, setCollisionToolFixture] = useState(true);
  const [collisionRapidStock, setCollisionRapidStock] = useState(true);
  const [collisionHolderStock, setCollisionHolderStock] = useState(false);
  const [pauseM06, setPauseM06] = useState(true);
  const [pauseM01, setPauseM01] = useState(false);
  const [pauseCollision, setPauseCollision] = useState(true);
  const [stockResolution, setStockResolution] = useState(80);

  const [editorFont, setEditorFont] = useState('IBM Plex Mono');
  const [editorFontSize, setEditorFontSize] = useState(14);
  const [editorTheme, setEditorTheme] = useState('Carbon Dark');
  const [autoComplete, setAutoComplete] = useState(true);
  const [showLineNumbers, setShowLineNumbers] = useState(true);

  const tabs = [
    { id: 'General',            icon: 'settings'                  },
    { id: 'Machine Setup',      icon: 'precision_manufacturing'   },
    { id: 'Simulation Rules',   icon: 'model_training'            },
    { id: 'Editor Preferences', icon: 'terminal'                  },
    { id: 'Cloud Sync',         icon: 'cloud_sync'                },
  ];

  /* Carbon Toggle Switch */
  const ToggleSwitch = ({
    checked, onChange, danger = false, label = "ENABLED"
  }: { checked: boolean; onChange: (v: boolean) => void; danger?: boolean; label?: string }) => (
    <div className="flex items-center gap-3">
      <span className={`text-[9px] font-semibold tracking-widest uppercase transition-colors ${checked ? 'text-cds-text-01' : 'text-cds-text-04'}`}>
        {checked ? label : 'DISABLED'}
      </span>
      <button
        onClick={() => onChange(!checked)}
        className={`w-10 h-5 relative transition-colors duration-300 ${
          checked
            ? (danger ? 'bg-orange-500/40' : 'bg-cds-interactive/40')
            : 'bg-cds-layer-03'
        }`}
      >
        <div className={`absolute top-0.5 bottom-0.5 w-4 bg-white transition-all duration-300 shadow-md ${
          checked
            ? `right-0.5 ${danger ? 'shadow-[0_0_8px_#f97316]' : 'shadow-[0_0_8px_#4589ff]'}`
            : 'left-0.5'
        }`}></div>
      </button>
    </div>
  );

  /* Carbon Checkbox */
  const Checkbox = ({
    label, checked, onChange, isWarning = false
  }: { label: string; checked: boolean; onChange: (v: boolean) => void; isWarning?: boolean }) => (
    <button onClick={() => onChange(!checked)} className="flex items-center gap-3 w-full group text-left">
      <div className={`w-5 h-5 border flex items-center justify-center transition-all chamfer-sm ${
        checked
          ? (isWarning ? 'bg-orange-500 border-orange-500 text-black' : 'bg-cds-interactive border-cds-interactive text-white')
          : 'bg-black/40 border-cds-border/30 hover:border-cds-border-str'
      }`}>
        {checked && <span className="material-symbols-outlined text-sm font-semibold">check</span>}
      </div>
      <span className={`text-[10px] font-semibold uppercase tracking-wide transition-colors ${checked ? 'text-cds-text-01' : 'text-cds-text-03 group-hover:text-cds-text-02'}`}>
        {label}
      </span>
    </button>
  );

  /* Shared input classes */
  const inputCls = "h-12 bg-cds-bg border border-cds-border/30 text-cds-text-02 font-mono text-label px-4 outline-none focus:border-cds-interactive appearance-none chamfer-sm transition-colors shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)]";
  const accentMarkCls = "w-1 h-3 bg-cds-interactive";

  return (
    <div className="fixed inset-0 bg-cds-bg/95 backdrop-blur-xl z-[150] flex items-center justify-center p-8 animate-in fade-in duration-300">
      <div className="w-full h-full max-w-[1400px] bg-cds-layer-01 border border-cds-border/30 shadow-[0_0_50px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden chamfer-lg relative">

        {/* Header */}
        <div className="h-16 px-8 bg-black/40 border-b border-cds-border/30 flex items-center justify-between shrink-0 z-10">
          <div className="flex items-center gap-4">
            <span className="material-symbols-outlined text-cds-interactive text-2xl">admin_panel_settings</span>
            <div>
              <h1 className="text-cds-text-01 font-semibold text-body-sm tracking-[0.3em] uppercase leading-tight">SYSTEM CONFIGURATION</h1>
              <p className="text-[9px] text-cds-text-04 font-mono tracking-widest uppercase">BIOS Setup Utility // Kernel v4.2</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="size-10 flex items-center justify-center bg-white/5 hover:bg-cds-error/20 hover:text-cds-error transition-all group"
          >
            <span className="material-symbols-outlined text-xl group-hover:rotate-90 transition-transform">close</span>
          </button>
        </div>

        <div className="flex-1 flex overflow-hidden z-10">
          {/* Left Tab Navigation */}
          <aside className="w-64 bg-black/20 border-r border-cds-border/30 flex flex-col py-6 shrink-0">
            <nav className="space-y-1 px-4">
              {tabs.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full h-12 px-4 flex items-center gap-4 text-[10px] font-semibold tracking-widest transition-all chamfer-sm border border-transparent ${
                      isActive
                        ? 'bg-cds-interactive text-white shadow-[0_0_15px_rgba(69,137,255,0.3)] translate-x-1'
                        : 'text-cds-text-03 hover:text-cds-text-02 hover:bg-white/5'
                    }`}
                  >
                    <span className={`material-symbols-outlined text-lg ${isActive ? 'text-white' : 'text-cds-text-04'}`}>{tab.icon}</span>
                    {tab.id.toUpperCase()}
                  </button>
                );
              })}
            </nav>

            <div className="mt-auto px-6">
              {activeTab === 'Machine Setup' && (
                <div className="p-4 bg-orange-500/5 border border-orange-500/20 chamfer-sm">
                  <div className="flex items-center gap-2 mb-2 text-orange-500">
                    <span className="material-symbols-outlined text-sm">warning</span>
                    <span className="text-[9px] font-semibold uppercase">System Lock</span>
                  </div>
                  <p className="text-[9px] text-cds-text-03 leading-relaxed font-mono">
                    Kinematic changes require a cold restart.
                  </p>
                </div>
              )}
            </div>
          </aside>

          {/* Content Area */}
          <main className="flex-1 flex bg-cds-layer-01 overflow-hidden">

            {/* ── GENERAL ── */}
            {activeTab === 'General' && (
              <>
                <div className="flex-[3] p-8 overflow-y-auto border-r border-cds-border/20">
                  <div className="mb-8 pb-4 border-b border-cds-border/20 flex justify-between items-end">
                    <h2 className="text-cds-text-01 font-semibold text-lg tracking-[0.1em] uppercase">SYSTEM ENVIRONMENT</h2>
                    <span className="text-[10px] font-mono text-cds-text-03 bg-cds-layer-02/50 px-2 py-1">BUILD: 2024.05.15.RC2</span>
                  </div>

                  <div className="mb-10">
                    <label className="text-[10px] text-cds-text-03 block mb-4 uppercase font-semibold tracking-widest flex items-center gap-2">
                      <span className={accentMarkCls}></span> Display & Region
                    </label>
                    <div className="grid grid-cols-2 gap-8">
                      <div>
                        <label className="block text-[9px] text-cds-text-04 uppercase font-semibold mb-2">Interface Language</label>
                        <div className="relative">
                          <select className={`w-full ${inputCls}`}>
                            <option>English (US)</option>
                            <option>Japanese (JP)</option>
                            <option>German (DE)</option>
                          </select>
                          <span className="absolute right-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-cds-text-04 pointer-events-none text-sm">expand_more</span>
                        </div>
                      </div>
                      <div>
                        <label className="block text-[9px] text-cds-text-04 uppercase font-semibold mb-2">Measurement Standard</label>
                        <div className="flex h-12 bg-cds-bg border border-cds-border/30 chamfer-sm p-1">
                          {['METRIC', 'IMPERIAL'].map((u) => (
                            <button
                              key={u}
                              onClick={() => setUnitSystem(u)}
                              className={`flex-1 flex items-center justify-center text-[10px] font-semibold tracking-wider transition-all chamfer-sm ${
                                unitSystem === u ? 'bg-cds-interactive text-white shadow-lg' : 'text-cds-text-03 hover:text-cds-text-02'
                              }`}
                            >
                              {u === 'METRIC' ? 'METRIC (mm)' : 'IMPERIAL (in)'}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="col-span-2">
                        <div className="flex justify-between items-center mb-2">
                          <label className="text-[9px] text-cds-text-04 uppercase font-semibold">UI Scale Factor</label>
                          <span className="text-[10px] font-mono text-cds-interactive">100%</span>
                        </div>
                        <div className="relative h-6 flex items-center">
                          <input type="range" min="100" max="150" step="10" defaultValue="100" className="w-full accent-[#4589ff]" />
                          <div className="absolute left-0 bottom-0 text-[8px] text-cds-text-04 font-mono">100%</div>
                          <div className="absolute right-0 bottom-0 text-[8px] text-cds-text-04 font-mono">150%</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mb-8">
                    <label className="text-[10px] text-cds-text-03 block mb-6 uppercase font-semibold tracking-widest flex items-center gap-2">
                      <span className={accentMarkCls}></span> Render Pipeline
                    </label>
                    <div className="grid grid-cols-3 gap-4 mb-8">
                      {['PERFORMANCE', 'BALANCED', 'ULTRA'].map((preset) => {
                        const isSelected = qualityPreset === preset;
                        return (
                          <button
                            key={preset}
                            onClick={() => setQualityPreset(preset)}
                            className={`h-24 relative flex flex-col items-center justify-center gap-2 border transition-all duration-300 chamfer-md group ${
                              isSelected
                                ? 'bg-cds-interactive/10 border-cds-interactive shadow-[0_0_20px_rgba(69,137,255,0.2)]'
                                : 'bg-cds-bg border-cds-border/30 hover:border-cds-border-str hover:bg-white/5'
                            }`}
                          >
                            <span className={`material-symbols-outlined text-lg ${isSelected ? 'text-cds-interactive' : 'text-cds-text-04'}`}>
                              {preset === 'ULTRA' ? 'hexagon' : preset === 'PERFORMANCE' ? 'bolt' : 'tune'}
                            </span>
                            <span className={`text-[10px] font-semibold tracking-widest ${isSelected ? 'text-cds-text-01' : 'text-cds-text-03 group-hover:text-cds-text-02'}`}>
                              {preset}
                            </span>
                            {isSelected && <div className="absolute top-2 right-2 w-1.5 h-1.5 bg-cds-interactive shadow-[0_0_5px_#4589ff]"></div>}
                          </button>
                        );
                      })}
                    </div>
                    <div className="grid grid-cols-2 gap-8">
                      <div>
                        <label className="block text-[9px] text-cds-text-04 uppercase font-semibold mb-2">Anti-Aliasing</label>
                        <div className="relative">
                          <select className={`w-full ${inputCls}`}>
                            <option>MSAA 2x</option>
                            <option>MSAA 4x</option>
                            <option>MSAA 8x</option>
                            <option>TAA (High)</option>
                          </select>
                          <span className="absolute right-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-cds-text-04 pointer-events-none text-sm">expand_more</span>
                        </div>
                      </div>
                      <div>
                        <label className="block text-[9px] text-cds-text-04 uppercase font-semibold mb-2">Ray Tracing (DXR)</label>
                        <div className="h-12 flex items-center px-4 bg-cds-bg border border-cds-border/30 chamfer-sm justify-between">
                          <span className={`text-[10px] font-semibold tracking-wider ${rayTracing ? 'text-cds-text-01' : 'text-cds-text-04'}`}>
                            {rayTracing ? 'ENABLED' : 'DISABLED'}
                          </span>
                          <ToggleSwitch checked={rayTracing} onChange={setRayTracing} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Preview Column */}
                <div className="flex-[2] bg-black/40 relative flex flex-col items-center justify-center overflow-hidden border-l border-cds-border/20">
                  <div className="absolute inset-0 opacity-10 hex-bg pointer-events-none"></div>
                  <div className="relative z-10 w-64 aspect-square bg-cds-bg border border-cds-border/30 p-2 chamfer-md shadow-2xl">
                    <div className="w-full h-full bg-cds-layer-01 overflow-hidden relative group">
                      <div className="absolute inset-0 bg-gradient-to-br from-cds-interactive/20 to-transparent opacity-50"></div>
                      <svg className="absolute inset-0 w-full h-full p-8" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="50" cy="50" r="30" stroke="#4589ff" strokeWidth="1" strokeDasharray="4 2" className="animate-[spin_10s_linear_infinite]" />
                        <path d="M50 20 L80 70 L20 70 Z" stroke="white" strokeWidth="0.5" className="animate-[pulse_4s_ease-in-out_infinite]" />
                        <path d="M20 30 H80 V80 H20 Z" stroke="white" strokeWidth="0.5" strokeOpacity="0.5" />
                      </svg>
                      {rayTracing && (
                        <div className="absolute top-2 left-2 flex items-center gap-1">
                          <span className="material-symbols-outlined text-cds-interactive text-[10px]">auto_awesome</span>
                          <span className="text-[8px] font-mono text-cds-interactive uppercase tracking-tighter">RTX ON</span>
                        </div>
                      )}
                      <div className="absolute bottom-0 left-0 right-0 bg-black/80 backdrop-blur-sm p-2 border-t border-cds-border/20">
                        <div className="flex justify-between items-center">
                          <span className="text-[8px] font-mono text-cds-text-03 uppercase">Preset</span>
                          <span className="text-[9px] font-semibold text-cds-text-01 uppercase tracking-wider">{qualityPreset}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-8 text-center px-8">
                    <h3 className="text-cds-text-01 text-[10px] font-semibold tracking-[0.2em] uppercase mb-2">Graphics Pipeline</h3>
                    <p className="text-[9px] text-cds-text-04 font-mono leading-relaxed">
                      Adjusting render quality may impact simulation framerate during complex toolpath interpolation.
                    </p>
                  </div>
                </div>
              </>
            )}

            {/* ── MACHINE SETUP ── */}
            {activeTab === 'Machine Setup' && (
              <>
                <div className="flex-[3] p-8 overflow-y-auto border-r border-cds-border/20">
                  <div className="mb-8 pb-4 border-b border-cds-border/20 flex justify-between items-end">
                    <h2 className="text-cds-text-01 font-semibold text-lg tracking-[0.1em] uppercase">KINEMATICS & AXIS LIMITS</h2>
                    <span className="text-[10px] font-mono text-cds-text-03 bg-cds-layer-02/50 px-2 py-1">PROFILE: HAAS_VF2_DEFAULT</span>
                  </div>

                  <div className="mb-8">
                    <label className="text-[10px] text-cds-text-03 block mb-2 uppercase font-semibold tracking-widest flex items-center gap-2">
                      <span className={accentMarkCls}></span> CNC Controller Definition
                    </label>
                    <div className="relative w-full max-w-md">
                      <select className={`w-full ${inputCls}`}>
                        <option>[ FANUC 0i-MF Plus ]</option>
                        <option>[ Siemens Sinumerik 840D ]</option>
                        <option>[ Heidenhain TNC 640 ]</option>
                        <option>[ Haas NGC ]</option>
                      </select>
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-cds-text-04 pointer-events-none">expand_more</span>
                    </div>
                  </div>

                  <div className="mb-8">
                    <label className="text-[10px] text-cds-text-03 block mb-4 uppercase font-semibold tracking-widest flex items-center gap-2">
                      <span className={accentMarkCls}></span> Axis Soft Limits (Travel)
                    </label>
                    <div className="grid grid-cols-[80px_1fr_1fr_40px] gap-4 max-w-2xl items-center mb-2 px-2 text-[9px] font-mono text-cds-text-04 uppercase tracking-widest">
                      <span>Axis ID</span><span>Minimum Limit</span><span>Maximum Limit</span><span>Unit</span>
                    </div>
                    <div className="space-y-3 max-w-2xl">
                      {[
                        { axis: 'X', color: 'text-cds-text-01', min: '-500.000', max: '500.000' },
                        { axis: 'Y', color: 'text-cds-text-01', min: '-300.000', max: '300.000' },
                        { axis: 'Z', color: 'text-cyan-400',    min: '-100.000', max: '600.000' },
                      ].map(({ axis, color, min, max }) => (
                        <div key={axis} className="grid grid-cols-[80px_1fr_1fr_40px] gap-4 items-center">
                          <div className={`h-10 bg-cds-layer-02 border border-cds-border/30 flex items-center justify-center font-semibold font-mono text-lg chamfer-sm shadow-inner ${color}`}>{axis}</div>
                          <input type="text" defaultValue={min} className={`h-10 ${inputCls} text-right ${color} focus:text-cds-interactive`} />
                          <input type="text" defaultValue={max} className={`h-10 ${inputCls} text-right ${color} focus:text-cds-interactive`} />
                          <span className="text-label text-cds-text-03 font-mono">mm</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mb-8">
                    <label className="text-[10px] text-cds-text-03 block mb-4 uppercase font-semibold tracking-widest flex items-center gap-2">
                      <span className={accentMarkCls}></span> Spindle & Tool Changer
                    </label>
                    <div className="flex gap-6 max-w-2xl">
                      {[
                        { lbl: 'Max Spindle RPM', val: '12,000', unit: 'RPM', cls: 'text-cds-text-02' },
                        { lbl: 'Tool Change Return', val: 'G30', unit: '', cls: 'text-cds-warning' },
                        { lbl: 'Rapid (G00) Rate', val: '30,000', unit: 'mm/m', cls: 'text-cds-text-02' },
                      ].map(({ lbl, val, unit, cls }) => (
                        <div key={lbl} className="flex-1">
                          <label className="block text-[9px] text-cds-text-04 uppercase font-semibold mb-1">{lbl}</label>
                          <div className="relative">
                            <input type="text" defaultValue={val} className={`w-full h-10 ${inputCls} pl-3 ${unit ? 'pr-10' : 'pr-3'} ${cls} focus:border-cds-interactive`} />
                            {unit && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] text-cds-text-04 font-mono">{unit}</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex-[2] bg-black/40 relative flex flex-col items-center justify-center overflow-hidden border-l border-cds-border/20">
                  <div className="absolute inset-0 opacity-10 hex-bg pointer-events-none"></div>
                  <div className="relative z-10 w-64 h-64">
                    <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-[0_0_30px_rgba(69,137,255,0.1)]">
                      <g transform="translate(100,100) rotateX(-20) rotateY(45) scale(0.85)">
                        <path d="M-50 -50 L50 -50 L50 50 M-50 -50 L-50 50" fill="none" stroke="#525252" strokeWidth="0.5" strokeDasharray="2,2" />
                        <path d="M-50 50 L50 50 L50 -50" fill="none" stroke="#4589ff" strokeWidth="1.5" strokeOpacity="0.8" />
                        <path d="M-50 50 L-50 -50 L50 -50" fill="none" stroke="#4589ff" strokeWidth="1.5" strokeOpacity="0.8" />
                        <rect x="-50" y="-50" width="100" height="100" fill="#4589ff" fillOpacity="0.05" />
                        {[-50, 50].map(x => [-50, 50].map(y => <circle key={`${x}${y}`} cx={x} cy={y} r="2" fill="white" />))}
                        <line x1="0" y1="0" x2="80" y2="0" stroke="white" strokeWidth="2" />
                        <text x="90" y="5" fill="white" fontSize="12" fontFamily="monospace" fontWeight="bold">X</text>
                        <line x1="0" y1="0" x2="0" y2="-80" stroke="white" strokeWidth="2" />
                        <text x="-5" y="-90" fill="white" fontSize="12" fontFamily="monospace" fontWeight="bold">Y</text>
                        <line x1="0" y1="0" x2="-60" y2="40" stroke="#22d3ee" strokeWidth="2" />
                        <text x="-75" y="50" fill="#22d3ee" fontSize="12" fontFamily="monospace" fontWeight="bold">Z</text>
                      </g>
                    </svg>
                    <div className="absolute top-4 right-4 text-[9px] font-mono text-cds-text-03 text-right tracking-widest">
                      <div>X_RANGE: 1000mm</div>
                      <div>Y_RANGE: 600mm</div>
                      <div className="text-cyan-400">Z_RANGE: 700mm</div>
                    </div>
                  </div>
                  <div className="mt-8 text-center bg-black/40 border border-cds-border/20 px-4 py-2 chamfer-sm">
                    <h3 className="text-cds-text-01 text-[10px] font-semibold tracking-[0.2em] uppercase mb-1">Volumetric Preview</h3>
                    <p className="text-[8px] text-cds-text-04 font-mono uppercase">Real-time Kinematic Mesh</p>
                  </div>
                </div>
              </>
            )}

            {/* ── SIMULATION RULES ── */}
            {activeTab === 'Simulation Rules' && (
              <>
                <div className="flex-[3] p-8 overflow-y-auto border-r border-cds-border/20">
                  <div className="mb-8 pb-4 border-b border-cds-border/20 flex justify-between items-end">
                    <h2 className="text-cds-text-01 font-semibold text-lg tracking-[0.1em] uppercase">PHYSICS & SAFETY PROTOCOLS</h2>
                    <span className="text-[10px] font-mono text-orange-500 bg-orange-500/10 border border-orange-500/20 px-2 py-1 flex items-center gap-2">
                      <span className="material-symbols-outlined text-sm">warning</span> SAFETY LEVEL: STRICT
                    </span>
                  </div>

                  <div className="mb-10">
                    <label className="text-[10px] text-cds-text-03 block mb-6 uppercase font-semibold tracking-widest flex items-center gap-2">
                      <span className="w-1 h-3 bg-orange-500"></span> Collision Detection Matrix
                    </label>
                    <div className="space-y-3">
                      {[
                        { lbl: 'Tool vs. Fixture',           sub: 'Critical machinery protection',    checked: collisionToolFixture, set: setCollisionToolFixture, danger: true,  label: 'CRITICAL' },
                        { lbl: 'Rapid Move (G00) vs. Stock', sub: 'PREVENTS PART GOUGING',            checked: collisionRapidStock,  set: setCollisionRapidStock,  danger: true,  label: 'ACTIVE'   },
                        { lbl: 'Holder vs. Stock',           sub: 'Requires detailed tool definition', checked: collisionHolderStock, set: setCollisionHolderStock, danger: false, label: 'ENABLED'  },
                      ].map(({ lbl, sub, checked, set, danger, label }) => (
                        <div key={lbl} className={`flex items-center justify-between bg-cds-layer-02 border border-cds-border/20 p-4 chamfer-sm ${!checked && lbl === 'Holder vs. Stock' ? 'opacity-75' : ''}`}>
                          <div>
                            <div className="text-cds-text-02 text-label font-semibold uppercase tracking-wide">{lbl}</div>
                            <div className={`text-[9px] font-mono mt-1 ${danger ? 'text-cds-error flex items-center gap-1' : 'text-cds-text-04'}`}>
                              {danger && lbl.includes('G00') && <span className="material-symbols-outlined text-[10px]">error</span>}
                              {sub}
                            </div>
                          </div>
                          <ToggleSwitch checked={checked} onChange={set} danger={danger} label={label} />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mb-10">
                    <label className="text-[10px] text-cds-text-03 block mb-6 uppercase font-semibold tracking-widest flex items-center gap-2">
                      <span className={accentMarkCls}></span> Stop Conditions
                    </label>
                    <div className="grid grid-cols-1 gap-3">
                      <Checkbox label="Pause on Tool Change (M06)"    checked={pauseM06}       onChange={setPauseM06}       />
                      <Checkbox label="Pause on Optional Stop (M01)"  checked={pauseM01}       onChange={setPauseM01}       />
                      <Checkbox label="Pause on Collision Event"       checked={pauseCollision} onChange={setPauseCollision} isWarning />
                    </div>
                  </div>

                  <div className="mb-8">
                    <label className="text-[10px] text-cds-text-03 block mb-6 uppercase font-semibold tracking-widest flex items-center gap-2">
                      <span className={accentMarkCls}></span> Solver Precision
                    </label>
                    <div className="bg-cds-layer-02 p-6 border border-cds-border/20 chamfer-sm">
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-[10px] font-semibold text-cds-text-02 uppercase tracking-wide">Stock Resolution (Voxel Size)</span>
                        <span className="text-label font-mono text-cds-interactive font-semibold">0.01mm</span>
                      </div>
                      <input
                        type="range" min="1" max="100"
                        value={stockResolution}
                        onChange={(e) => setStockResolution(parseInt(e.target.value))}
                        className="w-full mb-4 accent-[#4589ff]"
                      />
                      <div className="flex justify-between text-[8px] font-mono text-cds-text-04 uppercase tracking-widest mb-4">
                        <span>Coarse (Performance)</span>
                        <span>Fine (Quality)</span>
                      </div>
                      <div className="flex items-center gap-2 text-[9px] text-cds-text-03 bg-black/40 p-2 border border-cds-border/20">
                        <span className="material-symbols-outlined text-sm">info</span>
                        Higher precision drastically impacts GPU memory usage and framerate.
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex-[2] bg-black/40 relative flex flex-col items-center justify-center overflow-hidden border-l border-cds-border/20">
                  <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'repeating-linear-gradient(45deg, #000, #000 10px, #f97316 10px, #f97316 20px)' }}></div>
                  <div className="absolute inset-0 bg-gradient-to-t from-cds-layer-01 via-transparent to-cds-layer-01"></div>
                  <div className="relative z-10">
                    <div className="w-64 h-64 border border-orange-500/30 bg-black/50 backdrop-blur-sm p-4 chamfer-md flex items-center justify-center relative shadow-[0_0_50px_rgba(249,115,22,0.1)]">
                      <div className="absolute top-0 right-0 p-2">
                        <span className="material-symbols-outlined text-orange-500 animate-pulse">warning</span>
                      </div>
                      <svg viewBox="0 0 100 100" className="w-full h-full">
                        <path d="M20 80 L80 80 L80 50 L20 50 Z" fill="none" stroke="#525252" strokeWidth="1" />
                        <path d="M50 10 L50 60" stroke="#4589ff" strokeWidth="2" />
                        <path d="M45 60 L55 60 L50 80 Z" fill="#4589ff" />
                        <circle cx="50" cy="50" r="15" fill="none" stroke="orange" strokeWidth="0.5" className="animate-ping" opacity="0.5" />
                        <path d="M50 50 L60 40 M50 50 L40 40 M50 50 L60 60 M50 50 L40 60" stroke="orange" strokeWidth="1" />
                      </svg>
                      <div className="absolute bottom-2 left-0 right-0 text-center text-[9px] text-orange-500 font-mono uppercase tracking-widest">
                        Collision Vector: Z-Axis
                      </div>
                    </div>
                  </div>
                  <div className="mt-8 text-center px-8 z-10">
                    <h3 className="text-orange-500 text-[10px] font-semibold tracking-[0.2em] uppercase mb-2">Safety Protocols Engaged</h3>
                    <p className="text-[9px] text-cds-text-04 font-mono leading-relaxed">
                      Physics engine running at 1000Hz. Real-time interference checking is active for all rapid motions.
                    </p>
                  </div>
                </div>
              </>
            )}

            {/* ── EDITOR PREFERENCES ── */}
            {activeTab === 'Editor Preferences' && (
              <div className="flex h-full">
                <div className="flex-[2] p-8 border-r border-cds-border/20 overflow-y-auto">
                  <div className="mb-8 pb-4 border-b border-cds-border/20 flex justify-between items-end">
                    <h2 className="text-cds-text-01 font-semibold text-lg tracking-[0.1em] uppercase">IDE CONFIGURATION</h2>
                    <span className="text-[10px] font-mono text-cds-text-03 bg-cds-layer-02/50 px-2 py-1">SYNTAX ENGINE: V3</span>
                  </div>

                  <div className="mb-8">
                    <label className="text-[10px] text-cds-text-03 block mb-4 uppercase font-semibold tracking-widest flex items-center gap-2">
                      <span className={accentMarkCls}></span> Typography
                    </label>
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <label className="block text-[9px] text-cds-text-04 uppercase font-semibold mb-2">Font Family</label>
                        <div className="relative">
                          <select value={editorFont} onChange={(e) => setEditorFont(e.target.value)} className={`w-full ${inputCls}`}>
                            <option>IBM Plex Mono</option>
                            <option>JetBrains Mono</option>
                            <option>Fira Code</option>
                            <option>Source Code Pro</option>
                          </select>
                          <span className="absolute right-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-cds-text-04 pointer-events-none text-sm">expand_more</span>
                        </div>
                      </div>
                      <div>
                        <label className="block text-[9px] text-cds-text-04 uppercase font-semibold mb-2">Font Size (px)</label>
                        <input
                          type="number"
                          value={editorFontSize}
                          onChange={(e) => setEditorFontSize(parseInt(e.target.value))}
                          className={`w-full ${inputCls}`}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mb-8">
                    <label className="text-[10px] text-cds-text-03 block mb-4 uppercase font-semibold tracking-widest flex items-center gap-2">
                      <span className={accentMarkCls}></span> Appearance & Behavior
                    </label>
                    <div className="space-y-6">
                      <div>
                        <label className="block text-[9px] text-cds-text-04 uppercase font-semibold mb-2">Color Theme</label>
                        <div className="relative">
                          <select value={editorTheme} onChange={(e) => setEditorTheme(e.target.value)} className={`w-full ${inputCls}`}>
                            <option>Carbon Dark</option>
                            <option>Cyberpunk Neon</option>
                            <option>High Contrast</option>
                            <option>Classic Fanuc (Green)</option>
                          </select>
                          <span className="absolute right-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-cds-text-04 pointer-events-none text-sm">expand_more</span>
                        </div>
                      </div>
                      <div className="bg-cds-layer-02 border border-cds-border/20 p-4 chamfer-sm space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-semibold text-cds-text-02 uppercase">Auto-Complete G-Code</span>
                          <ToggleSwitch checked={autoComplete} onChange={setAutoComplete} />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-semibold text-cds-text-02 uppercase">Show Line Numbers</span>
                          <ToggleSwitch checked={showLineNumbers} onChange={setShowLineNumbers} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Live Preview */}
                <div className="flex-[3] bg-black/40 p-12 flex flex-col items-center justify-center relative border-l border-cds-border/20">
                  <div className="absolute inset-0 opacity-10 hex-bg pointer-events-none"></div>
                  <div className="w-full max-w-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-[9px] font-semibold text-cds-interactive uppercase tracking-widest flex items-center gap-2">
                        <span className="w-2 h-2 bg-cds-interactive animate-pulse"></span> Live Preview
                      </span>
                      <span className="text-[9px] font-mono text-cds-text-04">{editorFont} | {editorFontSize}px</span>
                    </div>
                    <div className="bg-cds-bg border border-cds-interactive shadow-[0_0_30px_rgba(69,137,255,0.1)] p-4 chamfer-md relative overflow-hidden h-64">
                      <div className="flex h-full font-mono" style={{ fontFamily: editorFont, fontSize: `${editorFontSize}px` }}>
                        {showLineNumbers && (
                          <div className="pr-4 border-r border-cds-border/20 text-cds-text-04 select-none text-right">
                            <div>1</div><div>2</div><div>3</div>
                          </div>
                        )}
                        <div className="pl-4 text-cds-text-02">
                          <div className="flex gap-2">
                            <span className="text-cds-text-04">N10</span>
                            <span className="text-cds-warning font-semibold">G90</span>
                            <span className="text-cds-warning font-semibold">G54</span>
                            <span className="text-cds-text-04">;</span>
                          </div>
                          <div className="flex gap-2">
                            <span className="text-cds-text-04">N20</span>
                            <span className="text-purple-400 font-semibold">M06</span>
                            <span className="text-cds-text-01">T1</span>
                            <span className="text-cds-text-04 italic">(Drill)</span>
                            <span className="text-cds-text-04">;</span>
                          </div>
                          <div className="flex gap-2">
                            <span className="text-cds-text-04">N30</span>
                            <span className="text-cds-warning font-semibold">G01</span>
                            <span className="text-cyan-400">Z-5.0</span>
                            <span className="text-orange-400">F500</span>
                            <span className="text-cds-text-04">;</span>
                          </div>
                          <div className="w-2 h-4 bg-cds-interactive animate-pulse mt-1"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── CLOUD SYNC ── */}
            {activeTab === 'Cloud Sync' && (
              <>
                <div className="flex-[3] p-8 overflow-y-auto border-r border-cds-border/20">
                  <div className="mb-8 pb-4 border-b border-cds-border/20 flex justify-between items-end">
                    <h2 className="text-cds-text-01 font-semibold text-lg tracking-[0.1em] uppercase">NETWORK & STORAGE</h2>
                    <span className="text-[10px] font-mono text-cds-interactive bg-cds-interactive/10 border border-cds-interactive/20 px-2 py-1 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-cds-interactive animate-pulse"></span> UPLINK ACTIVE
                    </span>
                  </div>

                  {/* User Profile */}
                  <div className="bg-cds-layer-02 border border-cds-border/20 p-6 mb-10 chamfer-md relative group overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:opacity-100 transition-opacity">
                      <span className="material-symbols-outlined text-4xl text-cds-text-01">verified_user</span>
                    </div>
                    <div className="flex items-start gap-6 relative z-10">
                      <div className="w-20 h-20 p-1 border border-cds-border/30 chamfer-sm bg-black/50">
                        <img src="https://i.pravatar.cc/150?img=11" alt="Profile" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <span className="text-cds-interactive text-[9px] font-semibold tracking-widest uppercase bg-cds-interactive/10 px-2 py-0.5">Commander Level User</span>
                          <span className="text-cds-text-03 text-[9px] font-mono tracking-widest uppercase border border-cds-border/30 px-2 py-0.5">Pro License Active</span>
                        </div>
                        <h3 className="text-cds-text-01 text-2xl font-semibold uppercase tracking-wide mb-2">Dr. Alex Chen</h3>
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 bg-cds-success animate-pulse shadow-[0_0_8px_#42be65]"></span>
                          <span className="text-[10px] text-cds-text-02 font-mono tracking-wide">
                            Connected to Server: <span className="text-cds-text-01">ASIA-EAST-1</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Cloud Storage */}
                  <div className="mb-10">
                    <label className="text-[10px] text-cds-text-03 block mb-4 uppercase font-semibold tracking-widest flex items-center gap-2">
                      <span className={accentMarkCls}></span> Cloud Storage
                    </label>
                    <div className="bg-cds-layer-02 border border-cds-border/20 p-6 chamfer-sm relative">
                      <div className="absolute inset-0 opacity-10 hex-bg pointer-events-none"></div>
                      <div className="relative z-10">
                        <div className="flex justify-between items-end mb-2">
                          <span className="text-cds-text-01 font-mono text-xl">12.4 <span className="text-body-sm text-cds-text-03">GB Used</span></span>
                          <span className="text-[10px] font-semibold text-cds-text-03 uppercase tracking-widest">45% of 50GB</span>
                        </div>
                        <div className="h-3 w-full bg-cds-bg border border-cds-border/20 chamfer-sm overflow-hidden p-[1px]">
                          <div className="h-full bg-gradient-to-r from-cds-interactive to-cyan-400 w-[45%] shadow-[0_0_15px_rgba(69,137,255,0.4)]"></div>
                        </div>
                        <div className="flex gap-6 mt-4">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-cds-interactive"></div>
                            <span className="text-[9px] font-mono text-cds-text-03 uppercase">Project Files (8GB)</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-cyan-400"></div>
                            <span className="text-[9px] font-mono text-cds-text-03 uppercase">Libraries (4.4GB)</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Team Workspace */}
                  <div>
                    <label className="text-[10px] text-cds-text-03 block mb-4 uppercase font-semibold tracking-widest flex items-center gap-2">
                      <span className={accentMarkCls}></span> Team Workspace
                    </label>
                    <div className="space-y-3">
                      {[
                        { name: "Sarah Connor",  role: "Design Lead",          img: "5" },
                        { name: "Marcus Wright", role: "G-Code Specialist",     img: "3" },
                        { name: "T-800 Model",   role: "Automation Bot",        img: "8" },
                      ].map((member, i) => (
                        <div key={i} className="flex items-center justify-between p-3 bg-black/40 border border-cds-border/20 hover:border-cds-border-str transition-all chamfer-sm group">
                          <div className="flex items-center gap-4">
                            <div className="relative">
                              <img src={`https://i.pravatar.cc/150?img=${member.img}`} className="w-8 h-8 chamfer-sm grayscale group-hover:grayscale-0 transition-all" alt={member.name} />
                              <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-cds-success border border-black"></div>
                            </div>
                            <div>
                              <div className="text-label font-semibold text-cds-text-02 group-hover:text-cds-text-01 transition-colors">{member.name}</div>
                              <div className="text-[8px] font-mono text-cds-text-04 uppercase tracking-wider">{member.role}</div>
                            </div>
                          </div>
                          <button className="text-cds-text-04 hover:text-cds-text-01 transition-colors">
                            <span className="material-symbols-outlined text-lg">more_vert</span>
                          </button>
                        </div>
                      ))}
                      <div className="flex gap-3 mt-4">
                        <button className="flex-1 py-3 border border-cds-border/30 hover:border-cds-interactive hover:bg-cds-interactive/5 text-cds-text-03 hover:text-cds-interactive text-[10px] font-semibold tracking-[0.2em] uppercase chamfer-sm transition-all flex items-center justify-center gap-2 group">
                          <span className="material-symbols-outlined text-sm group-hover:scale-110 transition-transform">add_circle</span>
                          INVITE MEMBER
                        </button>
                        <div className="flex-1 flex items-center justify-end px-4 border border-cds-border/20 bg-black/20 chamfer-sm">
                          <span className="text-[9px] font-mono text-cds-text-04 uppercase tracking-widest flex items-center gap-2">
                            <span className="material-symbols-outlined text-[12px]">history</span>
                            Last synced: 2 mins ago
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Network Diagram */}
                <div className="flex-[2] bg-black/40 relative flex flex-col items-center justify-center overflow-hidden border-l border-cds-border/20">
                  <div className="absolute inset-0 opacity-10 hex-bg pointer-events-none"></div>
                  <div className="relative w-full h-full p-12 flex items-center justify-center">
                    <div className="relative w-64 h-64 border border-cds-border/20 chamfer-md bg-black/20 backdrop-blur-sm p-4">
                      {/* Carbon corner brackets */}
                      {[['top-0 left-0 border-t border-l', ''], ['top-0 right-0 border-t border-r', ''], ['bottom-0 left-0 border-b border-l', ''], ['bottom-0 right-0 border-b border-r', '']].map(([pos], i) => (
                        <div key={i} className={`absolute ${pos} w-2 h-2 border-cds-interactive`}></div>
                      ))}
                      <div className="w-full h-full flex flex-col items-center justify-center gap-4">
                        <div className="w-16 h-16 border-2 border-cds-interactive chamfer-sm flex items-center justify-center shadow-[0_0_20px_rgba(69,137,255,0.2)] animate-pulse">
                          <span className="material-symbols-outlined text-3xl text-cds-text-01">hub</span>
                        </div>
                        <div className="w-full h-px bg-gradient-to-r from-transparent via-cds-interactive/50 to-transparent"></div>
                        <div className="flex justify-between w-full px-4">
                          {[{ icon: 'dns', label: 'DB_01' }, { icon: 'cloud', label: 'CDN' }, { icon: 'lan', label: 'VPN' }].map(({ icon, label }) => (
                            <div key={label} className="flex flex-col items-center gap-2">
                              <div className="w-8 h-8 border border-cds-border chamfer-sm flex items-center justify-center bg-black">
                                <span className="material-symbols-outlined text-label text-cds-text-03">{icon}</span>
                              </div>
                              <span className="text-[8px] font-mono text-cds-text-04">{label}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="absolute bottom-8 left-0 right-0 text-center">
                    <h3 className="text-cds-interactive text-[10px] font-semibold tracking-[0.2em] uppercase mb-1">Topology Map</h3>
                    <p className="text-[8px] text-cds-text-04 font-mono">End-to-End Encryption Enabled</p>
                  </div>
                </div>
              </>
            )}
          </main>
        </div>

        {/* Footer Action Bar – Carbon $layer-01 with primary/ghost buttons */}
        <div className="h-20 bg-cds-bg border-t border-cds-border/30 flex items-center justify-between px-8 shrink-0 z-20">
          <button
            onClick={onClose}
            className="text-[10px] font-semibold tracking-[0.2em] text-cds-text-04 hover:text-cds-text-01 transition-colors uppercase"
          >
            Reset to Defaults
          </button>
          {/* Carbon Primary Button */}
          <button
            onClick={onClose}
            className="px-8 py-4 bg-cds-interactive hover:bg-cds-link text-white text-[10px] font-semibold tracking-[0.2em] uppercase chamfer-md shadow-[0_0_20px_rgba(69,137,255,0.3)] hover:shadow-[0_0_30px_rgba(69,137,255,0.5)] transition-all active:scale-95 flex items-center gap-3"
          >
            <span className="material-symbols-outlined text-xl">save_as</span>
            SAVE & RESTART
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsManager;
