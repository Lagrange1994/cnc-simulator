
import React, { useState } from 'react';

interface HelpManagerProps {
  onClose: () => void;
}

const HelpManager: React.FC<HelpManagerProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState('G-Code Dictionary');
  const [searchQuery, setSearchQuery] = useState('');

  const menuItems = [
    { id: 'G-Code Dictionary', icon: 'dictionary' },
    { id: 'Shortcuts Map', icon: 'keyboard' },
    { id: 'System Logs', icon: 'terminal' },
    { id: 'Video Tutorials', icon: 'smart_display' },
    { id: 'Contact Support', icon: 'support_agent' },
  ];

  const gCodeData = [
    { code: 'G00', func: 'Rapid Positioning', type: 'Motion', color: 'text-yellow-500' },
    { code: 'G01', func: 'Linear Interpolation', type: 'Motion', color: 'text-blue-400' },
    { code: 'G02', func: 'Circular Interpolation (CW)', type: 'Motion', color: 'text-blue-400' },
    { code: 'G03', func: 'Circular Interpolation (CCW)', type: 'Motion', color: 'text-blue-400' },
    { code: 'G21', func: 'Metric Unit System', type: 'Setup', color: 'text-purple-400' },
    { code: 'G90', func: 'Absolute Positioning', type: 'Setup', color: 'text-purple-400' },
    { code: 'M03', func: 'Spindle ON (Clockwise)', type: 'Misc', color: 'text-green-500' },
    { code: 'M05', func: 'Spindle Stop', type: 'Misc', color: 'text-green-500' },
    { code: 'M06', func: 'Tool Change Execution', type: 'Misc', color: 'text-red-500' },
    { code: 'M08', func: 'Coolant ON (Flood)', type: 'Misc', color: 'text-cyan-400' },
    { code: 'M30', func: 'Program End & Reset', type: 'Misc', color: 'text-orange-500' },
  ];

  const filteredGCode = gCodeData.filter(item => 
    item.code.toLowerCase().includes(searchQuery.toLowerCase()) || 
    item.func.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-[#0a0a0a]/90 backdrop-blur-2xl z-[150] flex items-center justify-center p-8 animate-in fade-in duration-300">
      <div className="w-full h-full max-w-[1400px] bg-[#141414] border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden chamfer-lg relative">
        
        {/* Background Hex Pattern */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none hex-bg"></div>

        {/* Top bar - Identical Structure to FileManager */}
        <div className="h-16 px-8 bg-black/40 border-b border-white/10 flex items-center justify-between shrink-0 z-10">
          <div className="flex items-center gap-4">
            <span className="material-symbols-outlined text-[#1890FF] text-2xl">help_center</span>
            <div>
              <h1 className="text-white font-black text-sm tracking-[0.3em] uppercase leading-tight">SYSTEM COMMAND CENTER</h1>
              <p className="text-[9px] text-gray-600 font-mono tracking-widest uppercase">Knowledge Base // Central Database Access</p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-gray-500 uppercase tracking-tighter">Status:</span>
              <span className="flex items-center gap-1.5 px-2 py-0.5 bg-green-500/10 border border-green-500/20 text-green-500 text-[9px] font-bold">LATEST_SYNC_SUCCESS</span>
            </div>
            <button 
              onClick={onClose}
              className="size-10 flex items-center justify-center bg-white/5 hover:bg-red-500/20 hover:text-red-500 transition-all group"
            >
              <span className="material-symbols-outlined text-xl group-hover:rotate-90 transition-transform">close</span>
            </button>
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden z-10">
          {/* Left Sidebar Navigation - Identical to FileManager */}
          <aside className="w-72 bg-black/20 border-r border-white/10 flex flex-col p-6 shrink-0">
            <div className="mb-8">
               <div className="p-4 bg-[#1890FF]/5 border border-[#1890FF]/20 text-[#1890FF] chamfer-sm text-center">
                  <span className="text-[10px] font-black tracking-[0.2em] uppercase">Security Level 4</span>
               </div>
            </div>

            <h2 className="text-[10px] font-black text-gray-600 uppercase tracking-[0.2em] mb-4 px-2">Knowledge Base</h2>
            <nav className="space-y-1">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full h-12 px-4 flex items-center gap-4 text-[10px] font-bold tracking-widest transition-all chamfer-sm border ${
                    activeTab === item.id 
                    ? 'bg-[#1890FF]/10 border-[#1890FF]/40 text-[#1890FF] shadow-[0_0_15px_rgba(24,144,255,0.1)]' 
                    : 'bg-transparent border-transparent text-gray-500 hover:text-gray-300 hover:bg-white/5'
                  }`}
                >
                  <span className={`material-symbols-outlined text-lg ${activeTab === item.id ? 'text-[#1890FF]' : 'text-gray-600'}`}>{item.icon}</span>
                  {item.id.toUpperCase()}
                </button>
              ))}
            </nav>

            <div className="mt-auto pt-6 border-t border-white/5">
              <div className="p-4 bg-black/40 border border-white/5 chamfer-sm">
                <p className="text-[9px] text-gray-600 leading-relaxed font-mono uppercase tracking-tighter">
                  Index standard: ISO/DIN 66025
                </p>
              </div>
            </div>
          </aside>

          {/* Right Content Area */}
          <main className="flex-1 flex flex-col bg-black/10">
            {activeTab === 'G-Code Dictionary' ? (
              <div className="flex-1 flex flex-col p-8 overflow-hidden">
                {/* Search Bar - Matches the style in FileManager if it had one */}
                <div className="mb-8 relative">
                  <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none">
                    <span className="material-symbols-outlined text-gray-600 text-xl">search</span>
                  </div>
                  <input 
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search Command (e.g., G83)..."
                    className="w-full h-16 bg-black/40 border border-white/10 pl-16 pr-6 text-white font-mono placeholder:text-gray-800 outline-none focus:border-[#1890FF]/50 transition-all chamfer-sm text-lg"
                  />
                </div>

                {/* The Grid Table */}
                <div className="flex-1 flex flex-col overflow-hidden border border-white/5 bg-black/20 chamfer-md">
                  <div className="grid grid-cols-[150px_1fr_150px] bg-black/40 border-b border-white/10 px-8 h-12 items-center">
                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Code</span>
                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Function Description</span>
                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest text-right">Type</span>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto scrollbar-thin">
                    {filteredGCode.length > 0 ? (
                      filteredGCode.map((item, idx) => (
                        <div 
                          key={item.code} 
                          className={`grid grid-cols-[150px_1fr_150px] px-8 h-14 items-center border-b border-white/5 hover:bg-white/5 transition-colors group ${idx % 2 === 0 ? 'bg-white/[0.01]' : ''}`}
                        >
                          <span className={`text-xl font-mono font-black tracking-tighter ${item.color} drop-shadow-[0_0_8px_currentColor]`}>
                            {item.code}
                          </span>
                          <span className="text-sm font-medium text-gray-400 group-hover:text-white transition-colors">
                            {item.func}
                          </span>
                          <div className="flex justify-end">
                            <span className="text-[10px] font-bold py-1 px-3 bg-white/5 border border-white/10 text-gray-600 uppercase tracking-tighter rounded-full">
                              {item.type}
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full gap-4 text-gray-700">
                        <span className="material-symbols-outlined text-5xl">inventory_2</span>
                        <p className="text-xs font-mono uppercase tracking-widest">Query returned null</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center p-20 text-center">
                <div className="max-w-md">
                  <span className="material-symbols-outlined text-6xl text-gray-800 mb-6 block">database_off</span>
                  <h3 className="text-white font-bold text-lg mb-2 uppercase tracking-widest">Module Offline</h3>
                  <p className="text-sm text-gray-600 leading-relaxed font-mono">
                    The {activeTab} section is currently being indexed by the central processing engine. Check status logs.
                  </p>
                </div>
              </div>
            )}
          </main>
        </div>

        {/* Floating Help Hint - Visual Parity with FileManager */}
        <div className="absolute bottom-12 right-12 z-20 flex items-center gap-3">
          <div className="flex flex-col items-end">
            <span className="text-[9px] text-gray-600 uppercase tracking-widest mb-1">Quick Access</span>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-gray-500 font-bold uppercase">Press</span>
              <div className="size-8 bg-[#2B2B2B] border border-white/20 flex items-center justify-center text-white font-bold text-xs shadow-lg chamfer-sm">F1</div>
              <span className="text-[10px] text-gray-500 font-bold uppercase">for help</span>
            </div>
          </div>
        </div>

        {/* Footer info - Identical to FileManager */}
        <div className="h-10 bg-black px-8 border-t border-white/10 flex items-center justify-between text-[9px] font-mono text-gray-600 tracking-[0.2em] uppercase shrink-0">
          <div className="flex gap-8">
            <span className="flex items-center gap-2"><div className="w-1 h-1 bg-green-500"></div> DB_VERSION: 1.0.4</span>
            <span className="flex items-center gap-2"><div className="w-1 h-1 bg-[#1890FF]"></div> LOCAL_INDEX: 4,096 ENTRIES</span>
          </div>
          <div>Authorized duplication of this database is prohibited by machine security protocols.</div>
        </div>
      </div>
    </div>
  );
};

export default HelpManager;
