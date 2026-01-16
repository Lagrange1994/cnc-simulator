
import React, { useState } from 'react';

interface SettingsManagerProps {
  onClose: () => void;
}

const SettingsManager: React.FC<SettingsManagerProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState('General');
  
  // General Tab State
  const [qualityPreset, setQualityPreset] = useState('ULTRA');
  const [unitSystem, setUnitSystem] = useState('METRIC');
  const [rayTracing, setRayTracing] = useState(true);

  // Simulation Rules Tab State
  const [collisionToolFixture, setCollisionToolFixture] = useState(true);
  const [collisionRapidStock, setCollisionRapidStock] = useState(true);
  const [collisionHolderStock, setCollisionHolderStock] = useState(false);
  const [pauseM06, setPauseM06] = useState(true);
  const [pauseM01, setPauseM01] = useState(false);
  const [pauseCollision, setPauseCollision] = useState(true);
  const [stockResolution, setStockResolution] = useState(80);

  // Editor Preferences State
  const [editorFont, setEditorFont] = useState('JetBrains Mono');
  const [editorFontSize, setEditorFontSize] = useState(14);
  const [editorTheme, setEditorTheme] = useState('Cyberpunk Neon');
  const [autoComplete, setAutoComplete] = useState(true);
  const [showLineNumbers, setShowLineNumbers] = useState(true);

  const tabs = [
    { id: 'General', icon: 'settings' },
    { id: 'Machine Setup', icon: 'precision_manufacturing' },
    { id: 'Simulation Rules', icon: 'model_training' },
    { id: 'Editor Preferences', icon: 'terminal' },
    { id: 'Cloud Sync', icon: 'cloud_sync' },
  ];

  const ToggleSwitch = ({ checked, onChange, color = "bg-[#1890FF]", label = "ENABLED" }: { checked: boolean, onChange: (v: boolean) => void, color?: string, label?: string }) => (
    <div className="flex items-center gap-3">
        <span className={`text-[9px] font-black tracking-widest uppercase transition-colors ${checked ? 'text-white' : 'text-gray-600'}`}>
            {checked ? label : 'DISABLED'}
        </span>
        <button 
            onClick={() => onChange(!checked)}
            className={`w-10 h-5 relative transition-colors duration-300 ${checked ? color.replace('text-', 'bg-').replace('border-', 'bg-') : 'bg-gray-800'}`}
        >
            {/* Background Opacity Layer for color */}
            <div className={`absolute inset-0 ${checked ? 'opacity-40' : 'opacity-0'}`}></div>
            
            {/* Slider */}
            <div className={`absolute top-0.5 bottom-0.5 w-4 bg-white transition-all duration-300 shadow-md ${checked ? 'right-0.5' : 'left-0.5'}`}></div>
        </button>
    </div>
  );

  const Checkbox = ({ label, checked, onChange, isWarning = false }: { label: string, checked: boolean, onChange: (v: boolean) => void, isWarning?: boolean }) => (
      <button 
        onClick={() => onChange(!checked)}
        className="flex items-center gap-3 w-full group text-left"
      >
          <div className={`w-5 h-5 border flex items-center justify-center transition-all chamfer-sm ${
              checked 
              ? (isWarning ? 'bg-orange-500 border-orange-500 text-black' : 'bg-[#1890FF] border-[#1890FF] text-white') 
              : 'bg-black/40 border-white/10 hover:border-white/30'
          }`}>
              {checked && <span className="material-symbols-outlined text-sm font-bold">check</span>}
          </div>
          <span className={`text-[10px] font-bold uppercase tracking-wide transition-colors ${checked ? 'text-white' : 'text-gray-500 group-hover:text-gray-400'}`}>
              {label}
          </span>
      </button>
  );

  return (
    <div className="fixed inset-0 bg-[#0a0a0a]/95 backdrop-blur-xl z-[150] flex items-center justify-center p-8 animate-in fade-in duration-300">
      <div className="w-full h-full max-w-[1400px] bg-[#141414] border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden chamfer-lg relative">
        
        {/* Top Header Bar */}
        <div className="h-16 px-8 bg-black/40 border-b border-white/10 flex items-center justify-between shrink-0 z-10">
          <div className="flex items-center gap-4">
            <span className="material-symbols-outlined text-[#1890FF] text-2xl">admin_panel_settings</span>
            <div>
              <h1 className="text-white font-black text-sm tracking-[0.3em] uppercase leading-tight">SYSTEM CONFIGURATION</h1>
              <p className="text-[9px] text-gray-600 font-mono tracking-widest uppercase">BIOS Setup Utility // Kernel v4.2</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="size-10 flex items-center justify-center bg-white/5 hover:bg-red-500/20 hover:text-red-500 transition-all group"
          >
            <span className="material-symbols-outlined text-xl group-hover:rotate-90 transition-transform">close</span>
          </button>
        </div>

        <div className="flex-1 flex overflow-hidden z-10">
          {/* Left Sidebar (Category Tabs) */}
          <aside className="w-64 bg-black/20 border-r border-white/10 flex flex-col py-6 shrink-0">
            <nav className="space-y-1 px-4">
              {tabs.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full h-12 px-4 flex items-center gap-4 text-[10px] font-bold tracking-widest transition-all chamfer-sm border border-transparent ${
                      isActive 
                      ? 'bg-[#1890FF] text-white shadow-[0_0_15px_rgba(24,144,255,0.3)] translate-x-1' 
                      : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
                    }`}
                  >
                    <span className={`material-symbols-outlined text-lg ${isActive ? 'text-white' : 'text-gray-600'}`}>{tab.icon}</span>
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
                      <span className="text-[9px] font-black uppercase">System Lock</span>
                   </div>
                   <p className="text-[9px] text-gray-500 leading-relaxed font-mono">
                     Kinematic changes require a cold restart.
                   </p>
                </div>
              )}
            </div>
          </aside>

          {/* Center Content Area */}
          <main className="flex-1 flex bg-[#141414] overflow-hidden">
            
            {/* ---------------- GENERAL SETTINGS TAB ---------------- */}
            {activeTab === 'General' && (
              <>
                <div className="flex-[3] p-8 overflow-y-auto scrollbar-thin border-r border-white/5">
                  <div className="mb-8 pb-4 border-b border-white/5 flex justify-between items-end">
                    <h2 className="text-white font-black text-lg tracking-[0.1em] uppercase">SYSTEM ENVIRONMENT</h2>
                    <span className="text-[10px] font-mono text-gray-500 bg-white/5 px-2 py-1">BUILD: 2024.05.15.RC2</span>
                  </div>

                  {/* Input Group 1: DISPLAY & REGION */}
                  <div className="mb-10">
                    <label className="text-[10px] text-gray-500 block mb-4 uppercase font-bold tracking-widest flex items-center gap-2">
                       <span className="w-1 h-3 bg-[#1890FF]"></span>
                       Display & Region
                    </label>
                    
                    <div className="grid grid-cols-2 gap-8">
                       {/* Language */}
                       <div>
                          <label className="block text-[9px] text-gray-600 uppercase font-bold mb-2">Interface Language</label>
                          <div className="relative">
                             <select className="w-full h-12 bg-[#0a0a0a] border border-white/10 text-gray-200 font-mono text-xs px-4 outline-none focus:border-[#1890FF] appearance-none chamfer-sm transition-colors shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)]">
                                <option>English (US)</option>
                                <option>Japanese (JP)</option>
                                <option>German (DE)</option>
                             </select>
                             <span className="absolute right-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-gray-500 pointer-events-none text-sm">expand_more</span>
                          </div>
                       </div>

                       {/* Default Units */}
                       <div>
                          <label className="block text-[9px] text-gray-600 uppercase font-bold mb-2">Measurement Standard</label>
                          <div className="flex h-12 bg-[#0a0a0a] border border-white/10 chamfer-sm p-1">
                             <button 
                               onClick={() => setUnitSystem('METRIC')}
                               className={`flex-1 flex items-center justify-center text-[10px] font-black tracking-wider transition-all chamfer-sm ${unitSystem === 'METRIC' ? 'bg-[#1890FF] text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}
                             >
                               METRIC (mm)
                             </button>
                             <button 
                               onClick={() => setUnitSystem('IMPERIAL')}
                               className={`flex-1 flex items-center justify-center text-[10px] font-black tracking-wider transition-all chamfer-sm ${unitSystem === 'IMPERIAL' ? 'bg-[#1890FF] text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}
                             >
                               IMPERIAL (in)
                             </button>
                          </div>
                       </div>

                       {/* UI Scale */}
                       <div className="col-span-2">
                          <div className="flex justify-between items-center mb-2">
                            <label className="text-[9px] text-gray-600 uppercase font-bold">UI Scale Factor</label>
                            <span className="text-[10px] font-mono text-[#1890FF]">100%</span>
                          </div>
                          <div className="relative h-6 flex items-center">
                             <input type="range" min="100" max="150" step="10" defaultValue="100" className="w-full h-1 bg-white/10 appearance-none cursor-pointer accent-[#1890FF]" />
                             <div className="absolute left-0 bottom-0 text-[8px] text-gray-600 font-mono">100%</div>
                             <div className="absolute right-0 bottom-0 text-[8px] text-gray-600 font-mono">150%</div>
                          </div>
                       </div>
                    </div>
                  </div>

                  {/* Input Group 2: RENDER PIPELINE */}
                  <div className="mb-8">
                    <label className="text-[10px] text-gray-500 block mb-6 uppercase font-bold tracking-widest flex items-center gap-2">
                       <span className="w-1 h-3 bg-[#1890FF]"></span>
                       Render Pipeline
                    </label>

                    {/* Quality Preset Cards */}
                    <div className="grid grid-cols-3 gap-4 mb-8">
                       {['PERFORMANCE', 'BALANCED', 'ULTRA'].map((preset) => {
                         const isSelected = qualityPreset === preset;
                         return (
                           <button
                             key={preset}
                             onClick={() => setQualityPreset(preset)}
                             className={`h-24 relative flex flex-col items-center justify-center gap-2 border transition-all duration-300 chamfer-md group ${
                               isSelected 
                               ? 'bg-[#1890FF]/10 border-[#1890FF] shadow-[0_0_20px_rgba(24,144,255,0.2)]' 
                               : 'bg-[#0a0a0a] border-white/10 hover:border-white/20 hover:bg-white/5'
                             }`}
                           >
                             {preset === 'ULTRA' && (
                               <span className={`material-symbols-outlined text-lg ${isSelected ? 'text-[#1890FF]' : 'text-gray-600'}`}>hexagon</span>
                             )}
                             {preset !== 'ULTRA' && (
                               <span className={`material-symbols-outlined text-lg ${isSelected ? 'text-[#1890FF]' : 'text-gray-600'}`}>
                                 {preset === 'PERFORMANCE' ? 'bolt' : 'tune'}
                               </span>
                             )}
                             <span className={`text-[10px] font-black tracking-widest ${isSelected ? 'text-white' : 'text-gray-500 group-hover:text-gray-300'}`}>
                               {preset}
                             </span>
                             {isSelected && (
                               <div className="absolute top-2 right-2 w-1.5 h-1.5 bg-[#1890FF] shadow-[0_0_5px_#1890FF]"></div>
                             )}
                           </button>
                         )
                       })}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-8">
                       {/* Anti-Aliasing */}
                       <div>
                          <label className="block text-[9px] text-gray-600 uppercase font-bold mb-2">Anti-Aliasing</label>
                          <div className="relative">
                             <select className="w-full h-12 bg-[#0a0a0a] border border-white/10 text-gray-200 font-mono text-xs px-4 outline-none focus:border-[#1890FF] appearance-none chamfer-sm transition-colors shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)]">
                                <option>MSAA 2x</option>
                                <option selected>MSAA 4x</option>
                                <option>MSAA 8x</option>
                                <option>TAA (High)</option>
                             </select>
                             <span className="absolute right-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-gray-500 pointer-events-none text-sm">expand_more</span>
                          </div>
                       </div>

                       {/* Ray Tracing Toggle */}
                       <div>
                          <label className="block text-[9px] text-gray-600 uppercase font-bold mb-2">Ray Tracing (DXR)</label>
                          <div className="h-12 flex items-center px-4 bg-[#0a0a0a] border border-white/10 chamfer-sm justify-between">
                             <span className={`text-[10px] font-bold tracking-wider ${rayTracing ? 'text-white' : 'text-gray-600'}`}>
                                {rayTracing ? 'ENABLED' : 'DISABLED'}
                             </span>
                             <button 
                               onClick={() => setRayTracing(!rayTracing)}
                               className={`w-10 h-5 relative transition-colors duration-300 ${rayTracing ? 'bg-[#1890FF]/40' : 'bg-gray-700'}`}
                             >
                                <div className={`absolute top-0.5 bottom-0.5 w-4 bg-white transition-all duration-300 ${rayTracing ? 'right-0.5 shadow-[0_0_8px_#1890FF]' : 'left-0.5'}`}></div>
                             </button>
                          </div>
                       </div>
                    </div>
                  </div>
                </div>

                {/* Right Column (Visual Diagram for General) */}
                <div className="flex-[2] bg-black/40 relative flex flex-col items-center justify-center overflow-hidden border-l border-white/5">
                   <div className="absolute inset-0 opacity-10 hex-bg pointer-events-none"></div>
                   
                   {/* Graphics Preview Card */}
                   <div className="relative z-10 w-64 aspect-square bg-[#0a0a0a] border border-white/10 p-2 chamfer-md shadow-2xl">
                      <div className="w-full h-full bg-[#111] overflow-hidden relative group">
                        {/* Placeholder for complex graphic */}
                        <div className="absolute inset-0 bg-gradient-to-br from-[#1890FF]/20 to-transparent opacity-50"></div>
                        
                        {/* Abstract 3D shape SVG */}
                        <svg className="absolute inset-0 w-full h-full p-8" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <circle cx="50" cy="50" r="30" stroke="#1890FF" strokeWidth="1" strokeDasharray="4 2" className="animate-[spin_10s_linear_infinite]" />
                          <path d="M50 20 L80 70 L20 70 Z" stroke="white" strokeWidth="0.5" className="animate-[pulse_4s_ease-in-out_infinite]" />
                          <path d="M20 30 H80 V80 H20 Z" stroke="white" strokeWidth="0.5" strokeOpacity="0.5" />
                        </svg>

                        {/* Ray Tracing Indicator */}
                        {rayTracing && (
                           <div className="absolute top-2 left-2 flex items-center gap-1">
                              <span className="material-symbols-outlined text-[#1890FF] text-[10px]">auto_awesome</span>
                              <span className="text-[8px] font-mono text-[#1890FF] uppercase tracking-tighter">RTX ON</span>
                           </div>
                        )}
                        
                        {/* Quality Label */}
                        <div className="absolute bottom-0 left-0 right-0 bg-black/80 backdrop-blur-sm p-2 border-t border-white/5">
                           <div className="flex justify-between items-center">
                              <span className="text-[8px] font-mono text-gray-400 uppercase">Preset</span>
                              <span className="text-[9px] font-black text-white uppercase tracking-wider">{qualityPreset}</span>
                           </div>
                        </div>
                      </div>
                   </div>
                   
                   <div className="mt-8 text-center px-8">
                      <h3 className="text-white text-[10px] font-bold tracking-[0.2em] uppercase mb-2">Graphics Pipeline</h3>
                      <p className="text-[9px] text-gray-600 font-mono leading-relaxed">
                        Adjusting render quality may impact simulation framerate during complex toolpath interpolation.
                      </p>
                   </div>
                </div>
              </>
            )}

            {/* ---------------- MACHINE SETUP TAB ---------------- */}
            {activeTab === 'Machine Setup' && (
              <>
                <div className="flex-[3] p-8 overflow-y-auto scrollbar-thin border-r border-white/5">
                  <div className="mb-8 pb-4 border-b border-white/5 flex justify-between items-end">
                    <h2 className="text-white font-black text-lg tracking-[0.1em] uppercase">KINEMATICS & AXIS LIMITS</h2>
                    <span className="text-[10px] font-mono text-gray-500 bg-white/5 px-2 py-1">PROFILE: HAAS_VF2_DEFAULT</span>
                  </div>

                  {/* Input Group 1: Controller */}
                  <div className="mb-8">
                    <label className="text-[10px] text-gray-500 block mb-2 uppercase font-bold tracking-widest flex items-center gap-2">
                       <span className="w-1 h-3 bg-[#1890FF]"></span>
                       CNC Controller Definition
                    </label>
                    <div className="relative w-full max-w-md">
                       <select className="w-full h-12 bg-[#0a0a0a] border border-white/10 text-gray-200 font-mono text-sm px-4 outline-none focus:border-[#1890FF] appearance-none chamfer-sm transition-colors shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)]">
                          <option>[ FANUC 0i-MF Plus ]</option>
                          <option>[ Siemens Sinumerik 840D ]</option>
                          <option>[ Heidenhain TNC 640 ]</option>
                          <option>[ Haas NGC ]</option>
                       </select>
                       <span className="absolute right-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-gray-500 pointer-events-none">expand_more</span>
                    </div>
                  </div>

                  {/* Input Group 2: Axis Limits */}
                  <div className="mb-8">
                    <label className="text-[10px] text-gray-500 block mb-4 uppercase font-bold tracking-widest flex items-center gap-2">
                       <span className="w-1 h-3 bg-[#1890FF]"></span>
                       Axis Soft Limits (Travel)
                    </label>
                    
                    <div className="grid grid-cols-[80px_1fr_1fr_40px] gap-4 max-w-2xl items-center mb-2 px-2 text-[9px] font-mono text-gray-600 uppercase tracking-widest">
                      <span>Axis ID</span>
                      <span>Minimum Limit</span>
                      <span>Maximum Limit</span>
                      <span>Unit</span>
                    </div>

                    <div className="space-y-3 max-w-2xl">
                      {/* X Row */}
                      <div className="grid grid-cols-[80px_1fr_1fr_40px] gap-4 items-center group">
                         <div className="h-10 bg-[#1A1A1A] border border-white/10 flex items-center justify-center text-white font-black font-mono text-lg chamfer-sm shadow-inner">X</div>
                         <input type="text" defaultValue="-500.000" className="h-10 bg-[#0a0a0a] border border-white/10 text-right px-4 text-white font-mono focus:border-[#1890FF] outline-none chamfer-sm focus:text-[#1890FF] transition-colors shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)]" />
                         <input type="text" defaultValue="500.000" className="h-10 bg-[#0a0a0a] border border-white/10 text-right px-4 text-white font-mono focus:border-[#1890FF] outline-none chamfer-sm focus:text-[#1890FF] transition-colors shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)]" />
                         <span className="text-xs text-gray-500 font-mono">mm</span>
                      </div>

                      {/* Y Row */}
                      <div className="grid grid-cols-[80px_1fr_1fr_40px] gap-4 items-center group">
                         <div className="h-10 bg-[#1A1A1A] border border-white/10 flex items-center justify-center text-white font-black font-mono text-lg chamfer-sm shadow-inner">Y</div>
                         <input type="text" defaultValue="-300.000" className="h-10 bg-[#0a0a0a] border border-white/10 text-right px-4 text-white font-mono focus:border-[#1890FF] outline-none chamfer-sm focus:text-[#1890FF] transition-colors shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)]" />
                         <input type="text" defaultValue="300.000" className="h-10 bg-[#0a0a0a] border border-white/10 text-right px-4 text-white font-mono focus:border-[#1890FF] outline-none chamfer-sm focus:text-[#1890FF] transition-colors shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)]" />
                         <span className="text-xs text-gray-500 font-mono">mm</span>
                      </div>

                      {/* Z Row - Cyan Text */}
                      <div className="grid grid-cols-[80px_1fr_1fr_40px] gap-4 items-center group">
                         <div className="h-10 bg-[#1A1A1A] border border-white/10 flex items-center justify-center text-cyan-400 font-black font-mono text-lg chamfer-sm shadow-inner">Z</div>
                         <input type="text" defaultValue="-100.000" className="h-10 bg-[#0a0a0a] border border-white/10 text-right px-4 text-cyan-400 font-mono focus:border-cyan-400 outline-none chamfer-sm transition-colors shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)]" />
                         <input type="text" defaultValue="600.000" className="h-10 bg-[#0a0a0a] border border-white/10 text-right px-4 text-cyan-400 font-mono focus:border-cyan-400 outline-none chamfer-sm transition-colors shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)]" />
                         <span className="text-xs text-gray-500 font-mono">mm</span>
                      </div>
                    </div>
                  </div>

                  {/* Input Group 3: Spindle */}
                  <div className="mb-8">
                    <label className="text-[10px] text-gray-500 block mb-4 uppercase font-bold tracking-widest flex items-center gap-2">
                       <span className="w-1 h-3 bg-[#1890FF]"></span>
                       Spindle & Tool Changer
                    </label>
                    <div className="flex gap-6 max-w-2xl">
                       <div className="flex-1">
                          <label className="block text-[9px] text-gray-600 uppercase font-bold mb-1">Max Spindle RPM</label>
                          <div className="relative">
                            <input type="text" defaultValue="12,000" className="w-full h-10 bg-[#0a0a0a] border border-white/10 pl-3 pr-10 text-white font-mono focus:border-[#1890FF] outline-none chamfer-sm shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)]" />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] text-gray-500 font-mono">RPM</span>
                          </div>
                       </div>
                       <div className="flex-1">
                          <label className="block text-[9px] text-gray-600 uppercase font-bold mb-1">Tool Change Return</label>
                          <div className="relative">
                            <input type="text" defaultValue="G30" className="w-full h-10 bg-[#0a0a0a] border border-white/10 pl-3 pr-3 text-yellow-500 font-mono focus:border-yellow-500 outline-none chamfer-sm shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)]" />
                          </div>
                       </div>
                       <div className="flex-1">
                          <label className="block text-[9px] text-gray-600 uppercase font-bold mb-1">Rapid (G00) Rate</label>
                          <div className="relative">
                            <input type="text" defaultValue="30,000" className="w-full h-10 bg-[#0a0a0a] border border-white/10 pl-3 pr-10 text-white font-mono focus:border-[#1890FF] outline-none chamfer-sm shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)]" />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] text-gray-500 font-mono">mm/m</span>
                          </div>
                       </div>
                    </div>
                  </div>
                </div>

                {/* Right Column (Visual Diagram for Machine) */}
                <div className="flex-[2] bg-black/40 relative flex flex-col items-center justify-center overflow-hidden border-l border-white/5">
                   <div className="absolute inset-0 opacity-10 hex-bg pointer-events-none"></div>
                   
                   <div className="relative z-10 w-64 h-64 perspective-1000">
                      <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-[0_0_30px_rgba(24,144,255,0.1)]">
                         {/* 3D Box Wireframe - Futuristic Style */}
                         <g transform="translate(100,100) rotateX(-20) rotateY(45) scale(0.85)">
                            {/* Rear Structure */}
                            <path d="M-50 -50 L50 -50 L50 50 M-50 -50 L-50 50" fill="none" stroke="#333" strokeWidth="0.5" strokeDasharray="2,2" />
                            
                            {/* Main Volume */}
                            <path d="M-50 50 L50 50 L50 -50" fill="none" stroke="#1890FF" strokeWidth="1.5" strokeOpacity="0.8" />
                            <path d="M-50 50 L-50 -50 L50 -50" fill="none" stroke="#1890FF" strokeWidth="1.5" strokeOpacity="0.8" />
                            <rect x="-50" y="-50" width="100" height="100" fill="#1890FF" fillOpacity="0.05" stroke="none" />
                            
                            {/* Corners */}
                            <circle cx="-50" cy="50" r="2" fill="white" />
                            <circle cx="50" cy="50" r="2" fill="white" />
                            <circle cx="50" cy="-50" r="2" fill="white" />
                            <circle cx="-50" cy="-50" r="2" fill="white" />

                            {/* Axis Arrows Overlay */}
                            <line x1="0" y1="0" x2="80" y2="0" stroke="white" strokeWidth="2" />
                            <text x="90" y="5" fill="white" fontSize="12" fontFamily="monospace" fontWeight="bold">X</text>

                            <line x1="0" y1="0" x2="0" y2="-80" stroke="white" strokeWidth="2" />
                            <text x="-5" y="-90" fill="white" fontSize="12" fontFamily="monospace" fontWeight="bold">Y</text>

                            <line x1="0" y1="0" x2="-60" y2="40" stroke="#22d3ee" strokeWidth="2" />
                            <text x="-75" y="50" fill="#22d3ee" fontSize="12" fontFamily="monospace" fontWeight="bold">Z</text>
                         </g>
                      </svg>
                      
                      <div className="absolute top-4 right-4 text-[9px] font-mono text-gray-500 text-right tracking-widest">
                         <div>X_RANGE: 1000mm</div>
                         <div>Y_RANGE: 600mm</div>
                         <div className="text-cyan-400">Z_RANGE: 700mm</div>
                      </div>
                   </div>
                   
                   <div className="mt-8 text-center bg-black/40 border border-white/5 px-4 py-2 chamfer-sm">
                      <h3 className="text-white text-[10px] font-bold tracking-[0.2em] uppercase mb-1">Volumetric Preview</h3>
                      <p className="text-[8px] text-gray-600 font-mono uppercase">Real-time Kinematic Mesh</p>
                   </div>
                </div>
              </>
            )}

            {/* ---------------- SIMULATION RULES TAB ---------------- */}
            {activeTab === 'Simulation Rules' && (
              <>
                <div className="flex-[3] p-8 overflow-y-auto scrollbar-thin border-r border-white/5">
                    <div className="mb-8 pb-4 border-b border-white/5 flex justify-between items-end">
                        <h2 className="text-white font-black text-lg tracking-[0.1em] uppercase">PHYSICS & SAFETY PROTOCOLS</h2>
                        <span className="text-[10px] font-mono text-orange-500 bg-orange-500/10 border border-orange-500/20 px-2 py-1 flex items-center gap-2">
                            <span className="material-symbols-outlined text-sm">warning</span>
                            SAFETY LEVEL: STRICT
                        </span>
                    </div>

                    {/* Section 1: COLLISION DETECTION MATRIX */}
                    <div className="mb-10">
                        <label className="text-[10px] text-gray-500 block mb-6 uppercase font-bold tracking-widest flex items-center gap-2">
                            <span className="w-1 h-3 bg-orange-500"></span>
                            Collision Detection Matrix
                        </label>
                        
                        <div className="space-y-3">
                            {/* Toggle 1 */}
                            <div className="flex items-center justify-between bg-[#1A1A1A] border border-white/5 p-4 chamfer-sm">
                                <div>
                                    <div className="text-gray-200 text-xs font-bold uppercase tracking-wide">Tool vs. Fixture</div>
                                    <div className="text-[9px] text-gray-500 font-mono mt-1">Critical machinery protection</div>
                                </div>
                                <ToggleSwitch 
                                    checked={collisionToolFixture} 
                                    onChange={setCollisionToolFixture} 
                                    color="bg-orange-500" 
                                    label="CRITICAL"
                                />
                            </div>
                            
                             {/* Toggle 2 */}
                            <div className="flex items-center justify-between bg-[#1A1A1A] border border-white/5 p-4 chamfer-sm">
                                <div>
                                    <div className="text-gray-200 text-xs font-bold uppercase tracking-wide">Rapid Move (G00) vs. Stock</div>
                                    <div className="text-[9px] text-red-400 font-mono mt-1 flex items-center gap-1">
                                         <span className="material-symbols-outlined text-[10px]">error</span>
                                         PREVENTS PART GOUGING
                                    </div>
                                </div>
                                <ToggleSwitch 
                                    checked={collisionRapidStock} 
                                    onChange={setCollisionRapidStock} 
                                    color="bg-red-500"
                                    label="ACTIVE"
                                />
                            </div>

                             {/* Toggle 3 */}
                            <div className="flex items-center justify-between bg-[#1A1A1A] border border-white/5 p-4 chamfer-sm opacity-75">
                                <div>
                                    <div className="text-gray-400 text-xs font-bold uppercase tracking-wide">Holder vs. Stock</div>
                                    <div className="text-[9px] text-gray-600 font-mono mt-1">Requires detailed tool definition</div>
                                </div>
                                <ToggleSwitch 
                                    checked={collisionHolderStock} 
                                    onChange={setCollisionHolderStock} 
                                    color="bg-orange-500" 
                                />
                            </div>
                        </div>
                    </div>

                    {/* Section 2: STOP CONDITIONS */}
                    <div className="mb-10">
                         <label className="text-[10px] text-gray-500 block mb-6 uppercase font-bold tracking-widest flex items-center gap-2">
                            <span className="w-1 h-3 bg-[#1890FF]"></span>
                            Stop Conditions
                        </label>
                        
                        <div className="grid grid-cols-1 gap-3">
                            <Checkbox label="Pause on Tool Change (M06)" checked={pauseM06} onChange={setPauseM06} />
                            <Checkbox label="Pause on Optional Stop (M01)" checked={pauseM01} onChange={setPauseM01} />
                            <Checkbox label="Pause on Collision Event" checked={pauseCollision} onChange={setPauseCollision} isWarning />
                        </div>
                    </div>

                    {/* Section 3: SOLVER PRECISION */}
                    <div className="mb-8">
                         <label className="text-[10px] text-gray-500 block mb-6 uppercase font-bold tracking-widest flex items-center gap-2">
                            <span className="w-1 h-3 bg-[#1890FF]"></span>
                            Solver Precision
                        </label>
                        
                        <div className="bg-[#1A1A1A] p-6 border border-white/5 chamfer-sm">
                            <div className="flex justify-between items-center mb-4">
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Stock Resolution (Voxel Size)</span>
                                <span className="text-xs font-mono text-[#1890FF] font-bold">0.01mm</span>
                            </div>
                            
                            <input 
                                type="range" 
                                min="1" 
                                max="100" 
                                value={stockResolution}
                                onChange={(e) => setStockResolution(parseInt(e.target.value))}
                                className="w-full h-1 bg-gray-700 appearance-none cursor-pointer accent-[#1890FF] mb-4"
                            />
                            
                            <div className="flex justify-between text-[8px] font-mono text-gray-500 uppercase tracking-widest mb-4">
                                <span>Coarse (Performance)</span>
                                <span>Fine (Quality)</span>
                            </div>

                            <div className="flex items-center gap-2 text-[9px] text-gray-500 bg-black/40 p-2 border border-white/5">
                                <span className="material-symbols-outlined text-sm">info</span>
                                Higher precision drastically impacts GPU memory usage and framerate.
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column (Visual Aid) */}
                <div className="flex-[2] bg-black/40 relative flex flex-col items-center justify-center overflow-hidden border-l border-white/5">
                    {/* Hazard Background */}
                    <div className="absolute inset-0 opacity-5 pointer-events-none" style={{
                        backgroundImage: 'repeating-linear-gradient(45deg, #000, #000 10px, #ff9900 10px, #ff9900 20px)'
                    }}></div>
                    <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-transparent to-[#141414]"></div>

                    {/* Visual Graphic */}
                    <div className="relative z-10">
                        {/* SVG Visualizer for Physics/Collision */}
                         <div className="w-64 h-64 border border-orange-500/30 bg-black/50 backdrop-blur-sm p-4 chamfer-md flex items-center justify-center relative shadow-[0_0_50px_rgba(255,153,0,0.1)]">
                             <div className="absolute top-0 right-0 p-2">
                                 <span className="material-symbols-outlined text-orange-500 animate-pulse">warning</span>
                             </div>
                             {/* Simple abstract collision diagram */}
                             <svg viewBox="0 0 100 100" className="w-full h-full">
                                 <path d="M20 80 L80 80 L80 50 L20 50 Z" fill="none" stroke="#444" strokeWidth="1" /> {/* Stock */}
                                 <path d="M50 10 L50 60" stroke="#1890FF" strokeWidth="2" /> {/* Tool Shank */}
                                 <path d="M45 60 L55 60 L50 80 Z" fill="#1890FF" /> {/* Tool Tip */}
                                 {/* Collision Spark */}
                                 <circle cx="50" cy="50" r="15" fill="none" stroke="orange" strokeWidth="0.5" className="animate-ping" opacity="0.5" />
                                 <path d="M50 50 L60 40 M50 50 L40 40 M50 50 L60 60 M50 50 L40 60" stroke="orange" strokeWidth="1" />
                             </svg>
                             <div className="absolute bottom-2 left-0 right-0 text-center text-[9px] text-orange-500 font-mono uppercase tracking-widest">
                                 Collision Vector: Z-Axis
                             </div>
                         </div>
                    </div>

                    <div className="mt-8 text-center px-8 z-10">
                        <h3 className="text-orange-500 text-[10px] font-bold tracking-[0.2em] uppercase mb-2">Safety Protocols Engaged</h3>
                        <p className="text-[9px] text-gray-600 font-mono leading-relaxed">
                        Physics engine running at 1000Hz. Real-time interference checking is active for all rapid motions.
                        </p>
                    </div>
                </div>
              </>
            )}

            {/* ---------------- EDITOR PREFERENCES TAB ---------------- */}
            {activeTab === 'Editor Preferences' && (
              <div className="flex h-full">
                {/* Left Column - Controls */}
                <div className="flex-[2] p-8 border-r border-white/5 overflow-y-auto">
                  {/* ... Header ... */}
                  <div className="mb-8 pb-4 border-b border-white/5 flex justify-between items-end">
                    <h2 className="text-white font-black text-lg tracking-[0.1em] uppercase">IDE CONFIGURATION</h2>
                    <span className="text-[10px] font-mono text-gray-500 bg-white/5 px-2 py-1">SYNTAX ENGINE: V3</span>
                  </div>

                  {/* Input Group: Typography */}
                  <div className="mb-8">
                     <label className="text-[10px] text-gray-500 block mb-4 uppercase font-bold tracking-widest flex items-center gap-2">
                        <span className="w-1 h-3 bg-[#1890FF]"></span>
                        Typography
                     </label>
                     <div className="grid grid-cols-2 gap-6">
                        <div>
                           <label className="block text-[9px] text-gray-600 uppercase font-bold mb-2">Font Family</label>
                           <div className="relative">
                              <select 
                                value={editorFont}
                                onChange={(e) => setEditorFont(e.target.value)}
                                className="w-full h-12 bg-[#0a0a0a] border border-white/10 text-gray-200 font-mono text-xs px-4 outline-none focus:border-[#1890FF] appearance-none chamfer-sm transition-colors shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)]"
                              >
                                 <option>JetBrains Mono</option>
                                 <option>Fira Code</option>
                                 <option>Source Code Pro</option>
                                 <option>Consolas</option>
                              </select>
                              <span className="absolute right-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-gray-500 pointer-events-none text-sm">expand_more</span>
                           </div>
                        </div>
                        <div>
                           <label className="block text-[9px] text-gray-600 uppercase font-bold mb-2">Font Size (px)</label>
                           <input 
                             type="number" 
                             value={editorFontSize}
                             onChange={(e) => setEditorFontSize(parseInt(e.target.value))}
                             className="w-full h-12 bg-[#0a0a0a] border border-white/10 text-gray-200 font-mono text-xs px-4 outline-none focus:border-[#1890FF] chamfer-sm transition-colors shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)]"
                           />
                        </div>
                     </div>
                  </div>

                  {/* Input Group: Theme & Behavior */}
                  <div className="mb-8">
                     <label className="text-[10px] text-gray-500 block mb-4 uppercase font-bold tracking-widest flex items-center gap-2">
                        <span className="w-1 h-3 bg-[#1890FF]"></span>
                        Appearance & Behavior
                     </label>
                     
                     <div className="space-y-6">
                        <div>
                           <label className="block text-[9px] text-gray-600 uppercase font-bold mb-2">Color Theme</label>
                           <div className="relative">
                              <select 
                                value={editorTheme}
                                onChange={(e) => setEditorTheme(e.target.value)}
                                className="w-full h-12 bg-[#0a0a0a] border border-white/10 text-gray-200 font-mono text-xs px-4 outline-none focus:border-[#1890FF] appearance-none chamfer-sm transition-colors shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)]"
                              >
                                 <option>Cyberpunk Neon</option>
                                 <option>High Contrast</option>
                                 <option>Classic Fanuc (Green)</option>
                              </select>
                              <span className="absolute right-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-gray-500 pointer-events-none text-sm">expand_more</span>
                           </div>
                        </div>

                        <div className="bg-[#1A1A1A] border border-white/5 p-4 chamfer-sm space-y-4">
                           <div className="flex items-center justify-between">
                              <span className="text-[10px] font-bold text-gray-300 uppercase">Auto-Complete G-Code</span>
                              <ToggleSwitch checked={autoComplete} onChange={setAutoComplete} />
                           </div>
                           <div className="flex items-center justify-between">
                              <span className="text-[10px] font-bold text-gray-300 uppercase">Show Line Numbers</span>
                              <ToggleSwitch checked={showLineNumbers} onChange={setShowLineNumbers} />
                           </div>
                        </div>
                     </div>
                  </div>
                </div>

                {/* Right Column - Live Preview */}
                <div className="flex-[3] bg-black/40 p-12 flex flex-col items-center justify-center relative border-l border-white/5">
                   <div className="absolute inset-0 opacity-10 hex-bg pointer-events-none"></div>
                   
                   <div className="w-full max-w-lg">
                      <div className="flex justify-between items-center mb-2">
                         <span className="text-[9px] font-bold text-[#1890FF] uppercase tracking-widest flex items-center gap-2">
                           <span className="w-2 h-2 bg-[#1890FF] animate-pulse"></span>
                           Live Preview
                         </span>
                         <span className="text-[9px] font-mono text-gray-600">{editorFont} | {editorFontSize}px</span>
                      </div>
                      
                      <div className="bg-[#000000] border border-[#1890FF] shadow-[0_0_30px_rgba(24,144,255,0.1)] p-4 chamfer-md relative overflow-hidden h-64">
                         {/* Simulated Editor Window */}
                         <div className="flex h-full font-mono" style={{ fontFamily: editorFont, fontSize: `${editorFontSize}px` }}>
                            {showLineNumbers && (
                               <div className="pr-4 border-r border-white/10 text-gray-600 select-none text-right">
                                  <div>1</div>
                                  <div>2</div>
                                  <div>3</div>
                               </div>
                            )}
                            <div className="pl-4 text-gray-300">
                               {/* Line 1 */}
                               <div className="flex gap-2">
                                  <span className="text-gray-500">N10</span>
                                  <span className="text-yellow-500 font-bold">G90</span>
                                  <span className="text-yellow-500 font-bold">G54</span><span className="text-gray-500">;</span>
                               </div>
                               {/* Line 2 */}
                               <div className="flex gap-2">
                                  <span className="text-gray-500">N20</span>
                                  <span className="text-purple-400 font-bold">M06</span>
                                  <span className="text-white">T1</span>
                                  <span className="text-gray-500 italic">(Drill)</span><span className="text-gray-500">;</span>
                               </div>
                               {/* Line 3 */}
                               <div className="flex gap-2">
                                  <span className="text-gray-500">N30</span>
                                  <span className="text-yellow-500 font-bold">G01</span>
                                  <span className="text-cyan-400">Z-5.0</span>
                                  <span className="text-orange-400">F500</span><span className="text-gray-500">;</span>
                               </div>
                               {/* Cursor */}
                               <div className="w-2 h-4 bg-[#1890FF] animate-pulse mt-1"></div>
                            </div>
                         </div>
                         
                         {/* Decorative Scanline */}
                         <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-white/5 to-transparent h-1 w-full animate-[scan_2s_linear_infinite]"></div>
                      </div>
                   </div>
                </div>
              </div>
            )}

            {/* ---------------- CLOUD SYNC TAB ---------------- */}
            {activeTab === 'Cloud Sync' && (
              <>
                <div className="flex-[3] p-8 overflow-y-auto scrollbar-thin border-r border-white/5">
                   <div className="mb-8 pb-4 border-b border-white/5 flex justify-between items-end">
                      <h2 className="text-white font-black text-lg tracking-[0.1em] uppercase">NETWORK & STORAGE</h2>
                      <span className="text-[10px] font-mono text-[#1890FF] bg-[#1890FF]/10 border border-[#1890FF]/20 px-2 py-1 flex items-center gap-2">
                         <span className="w-1.5 h-1.5 bg-[#1890FF] rounded-full animate-pulse"></span>
                         UPLINK ACTIVE
                      </span>
                   </div>

                   {/* User Profile */}
                   <div className="bg-[#1A1A1A] border border-white/5 p-6 mb-10 chamfer-md relative group overflow-hidden">
                      <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:opacity-100 transition-opacity">
                          <span className="material-symbols-outlined text-4xl text-white">verified_user</span>
                      </div>
                      <div className="flex items-start gap-6 relative z-10">
                          <div className="w-20 h-20 p-1 border border-white/10 chamfer-sm bg-black/50">
                              <img src="https://i.pravatar.cc/150?img=11" alt="Profile" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />
                          </div>
                          <div className="flex-1">
                              <div className="flex items-center gap-3 mb-1">
                                  <span className="text-[#1890FF] text-[9px] font-black tracking-widest uppercase bg-[#1890FF]/10 px-2 py-0.5">Commander Level User</span>
                                  <span className="text-gray-500 text-[9px] font-mono tracking-widest uppercase border border-white/10 px-2 py-0.5">Pro License Active</span>
                              </div>
                              <h3 className="text-white text-2xl font-black uppercase tracking-wide mb-2">Dr. Alex Chen</h3>
                              <div className="flex items-center gap-2">
                                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_#22c55e]"></span>
                                  <span className="text-[10px] text-gray-400 font-mono tracking-wide">Connected to Server: <span className="text-white">ASIA-EAST-1</span></span>
                              </div>
                          </div>
                      </div>
                   </div>

                   {/* Cloud Storage */}
                   <div className="mb-10">
                      <label className="text-[10px] text-gray-500 block mb-4 uppercase font-bold tracking-widest flex items-center gap-2">
                         <span className="w-1 h-3 bg-[#1890FF]"></span>
                         Cloud Storage
                      </label>
                      <div className="bg-[#1A1A1A] border border-white/5 p-6 chamfer-sm relative">
                         <div className="absolute inset-0 opacity-10 hex-bg pointer-events-none"></div>
                         
                         <div className="relative z-10">
                             <div className="flex justify-between items-end mb-2">
                                 <span className="text-white font-mono text-xl">12.4 <span className="text-sm text-gray-500">GB Used</span></span>
                                 <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">45% of 50GB</span>
                             </div>
                             
                             <div className="h-3 w-full bg-black border border-white/10 chamfer-sm overflow-hidden p-[1px]">
                                 <div className="h-full bg-gradient-to-r from-[#1890FF] to-cyan-400 w-[45%] relative shadow-[0_0_15px_rgba(24,144,255,0.4)]">
                                     <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNCIgaGVpZ2h0PSI0IiB2aWV3Qm94PSIwIDAgNCA0IiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxwYXRoIGQ9Ik00IDBMMCA0IiBzdHJva2U9InJnYmEoMjU1LDI1NSwyNTUsMC4yKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9zdmc+')] opacity-30"></div>
                                 </div>
                             </div>

                             <div className="flex gap-6 mt-4">
                                 <div className="flex items-center gap-2">
                                     <div className="w-2 h-2 bg-[#1890FF]"></div>
                                     <span className="text-[9px] font-mono text-gray-500 uppercase">Project Files (8GB)</span>
                                 </div>
                                 <div className="flex items-center gap-2">
                                     <div className="w-2 h-2 bg-cyan-400"></div>
                                     <span className="text-[9px] font-mono text-gray-500 uppercase">Libraries (4.4GB)</span>
                                 </div>
                             </div>
                         </div>
                      </div>
                   </div>

                   {/* Team Workspace */}
                   <div>
                      <label className="text-[10px] text-gray-500 block mb-4 uppercase font-bold tracking-widest flex items-center gap-2">
                         <span className="w-1 h-3 bg-[#1890FF]"></span>
                         Team Workspace
                      </label>

                      <div className="space-y-3">
                          {[
                            { name: "Sarah Connor", role: "Design Lead", img: "5" },
                            { name: "Marcus Wright", role: "G-Code Specialist", img: "3" },
                            { name: "T-800 Model", role: "Automation Bot", img: "8" }
                          ].map((member, i) => (
                              <div key={i} className="flex items-center justify-between p-3 bg-black/40 border border-white/5 hover:border-white/20 transition-all chamfer-sm group">
                                  <div className="flex items-center gap-4">
                                      <div className="relative">
                                          <img src={`https://i.pravatar.cc/150?img=${member.img}`} className="w-8 h-8 chamfer-sm grayscale group-hover:grayscale-0 transition-all" />
                                          <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-green-500 border border-black rounded-full"></div>
                                      </div>
                                      <div>
                                          <div className="text-xs font-bold text-gray-300 group-hover:text-white transition-colors">{member.name}</div>
                                          <div className="text-[8px] font-mono text-gray-600 uppercase tracking-wider">{member.role}</div>
                                      </div>
                                  </div>
                                  <button className="text-gray-600 hover:text-white transition-colors"><span className="material-symbols-outlined text-lg">more_vert</span></button>
                              </div>
                          ))}

                          <div className="flex gap-3 mt-4">
                              <button className="flex-1 py-3 border border-white/10 hover:border-[#1890FF] hover:bg-[#1890FF]/5 text-gray-400 hover:text-[#1890FF] text-[10px] font-bold tracking-[0.2em] uppercase chamfer-sm transition-all flex items-center justify-center gap-2 group">
                                  <span className="material-symbols-outlined text-sm group-hover:scale-110 transition-transform">add_circle</span>
                                  INVITE MEMBER
                              </button>
                              <div className="flex-1 flex items-center justify-end px-4 border border-white/5 bg-black/20 chamfer-sm">
                                   <span className="text-[9px] font-mono text-gray-500 uppercase tracking-widest flex items-center gap-2">
                                       <span className="material-symbols-outlined text-[12px]">history</span>
                                       Last synced: 2 mins ago
                                   </span>
                              </div>
                          </div>
                      </div>
                   </div>
                </div>

                {/* Right Column (Visual) */}
                <div className="flex-[2] bg-black/40 relative flex flex-col items-center justify-center overflow-hidden border-l border-white/5">
                    <div className="absolute inset-0 opacity-10 hex-bg pointer-events-none"></div>
                    {/* Network Diagram */}
                    <div className="relative w-full h-full p-12 flex items-center justify-center">
                         <div className="relative w-64 h-64 border border-white/5 chamfer-md bg-black/20 backdrop-blur-sm p-4">
                             <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-[#1890FF]"></div>
                             <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-[#1890FF]"></div>
                             <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-[#1890FF]"></div>
                             <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-[#1890FF]"></div>
                             
                             <div className="w-full h-full flex flex-col items-center justify-center gap-4">
                                 {/* Center Node */}
                                 <div className="w-16 h-16 border-2 border-[#1890FF] chamfer-sm flex items-center justify-center shadow-[0_0_20px_rgba(24,144,255,0.2)] animate-pulse">
                                     <span className="material-symbols-outlined text-3xl text-white">hub</span>
                                 </div>
                                 {/* Lines */}
                                 <div className="w-full h-px bg-gradient-to-r from-transparent via-[#1890FF]/50 to-transparent"></div>
                                 <div className="flex justify-between w-full px-4">
                                     <div className="flex flex-col items-center gap-2">
                                        <div className="w-8 h-8 border border-gray-600 chamfer-sm flex items-center justify-center bg-black">
                                            <span className="material-symbols-outlined text-xs text-gray-400">dns</span>
                                        </div>
                                        <span className="text-[8px] font-mono text-gray-600">DB_01</span>
                                     </div>
                                     <div className="flex flex-col items-center gap-2">
                                        <div className="w-8 h-8 border border-gray-600 chamfer-sm flex items-center justify-center bg-black">
                                            <span className="material-symbols-outlined text-xs text-gray-400">cloud</span>
                                        </div>
                                        <span className="text-[8px] font-mono text-gray-600">CDN</span>
                                     </div>
                                     <div className="flex flex-col items-center gap-2">
                                        <div className="w-8 h-8 border border-gray-600 chamfer-sm flex items-center justify-center bg-black">
                                            <span className="material-symbols-outlined text-xs text-gray-400">lan</span>
                                        </div>
                                        <span className="text-[8px] font-mono text-gray-600">VPN</span>
                                     </div>
                                 </div>
                             </div>
                         </div>
                    </div>
                    <div className="absolute bottom-8 left-0 right-0 text-center">
                        <h3 className="text-[#1890FF] text-[10px] font-bold tracking-[0.2em] uppercase mb-1">Topology Map</h3>
                        <p className="text-[8px] text-gray-600 font-mono">End-to-End Encryption Enabled</p>
                    </div>
                </div>
              </>
            )}

          </main>
        </div>

        {/* Footer Action Bar */}
        <div className="h-20 bg-[#0a0a0a] border-t border-white/10 flex items-center justify-between px-8 shrink-0 z-20">
           <button 
             onClick={onClose}
             className="text-[10px] font-bold tracking-[0.2em] text-gray-600 hover:text-white transition-colors uppercase"
           >
             Reset to Defaults
           </button>
           <button 
             onClick={onClose}
             className="px-8 py-4 bg-[#1890FF] hover:bg-[#40a9ff] text-white text-[10px] font-black tracking-[0.2em] uppercase chamfer-md shadow-[0_0_20px_rgba(24,144,255,0.3)] hover:shadow-[0_0_30px_rgba(24,144,255,0.5)] transition-all active:scale-95 flex items-center gap-3"
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
