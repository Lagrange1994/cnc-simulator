
import React, { useState } from 'react';

interface FileCardProps {
  title: string;
  edited: string;
  machine: string;
  time: string;
  thumbnail: string;
  tag?: string;
}

const FileCard: React.FC<FileCardProps> = ({ title, edited, machine, time, thumbnail, tag }) => (
  <div className="bg-[#1A1A1A]/60 hover:bg-[#1A1A1A] border border-white/5 group transition-all duration-300 cursor-pointer chamfer-md flex flex-col relative overflow-hidden">
    <div className="relative h-32 w-full overflow-hidden">
      <img src={thumbnail} alt={title} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500 scale-100 group-hover:scale-105" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
      {tag && (
        <span className="absolute top-2 right-2 px-2 py-0.5 bg-[#1890FF]/20 border border-[#1890FF]/40 text-[8px] font-mono text-[#1890FF] tracking-widest uppercase">
          {tag}
        </span>
      )}
    </div>
    <div className="p-4 flex flex-col flex-1 relative z-10">
      <h4 className="text-white font-bold text-sm tracking-wide truncate group-hover:text-[#1890FF] transition-colors">{title}</h4>
      <p className="text-gray-600 text-[9px] mt-1 font-mono uppercase tracking-tighter italic">Last Sync: {edited}</p>
      
      <div className="mt-4 pt-4 border-t border-white/5 flex justify-between items-end">
        <div>
          <span className="block text-[8px] font-mono text-gray-700 uppercase tracking-tighter">Machine_Profile</span>
          <span className="text-[10px] font-mono text-gray-400">{machine}</span>
        </div>
        <div className="text-right">
          <span className="block text-[8px] font-mono text-gray-700 uppercase tracking-tighter">Est_Cycle</span>
          <span className="text-[10px] font-mono text-[#1890FF]">{time}</span>
        </div>
      </div>
    </div>
  </div>
);

interface FileManagerProps {
  onClose: () => void;
}

const FileManager: React.FC<FileManagerProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState('Recent Work');

  const menuItems = [
    { id: 'Open Project', icon: 'folder_open' },
    { id: 'Recent Work', icon: 'schedule' },
    { id: 'Cloud Drive', icon: 'cloud_done' },
    { id: 'Import G-Code', icon: 'note_add' },
    { id: 'System Templates', icon: 'architecture' },
  ];

  const recentFiles = [
    { title: 'PROJECT_ALPHA_V2.NC', edited: '2H AGO', machine: 'MACHINE_01', time: '2h 45m', thumbnail: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=400', tag: 'CNC' },
    { title: 'BRACKET_MOUNT_L.NC', edited: 'YESTERDAY', machine: 'HAAS_VF2', time: '0h 55m', thumbnail: 'https://images.unsplash.com/photo-1558350315-8aa00e8e4590?auto=format&fit=crop&q=80&w=400', tag: 'MILL' },
    { title: 'TURBINE_BLADE.NC', edited: '3 DAYS AGO', machine: '5_AXIS_MILL', time: '12h 10m', thumbnail: 'https://images.unsplash.com/photo-1454165833767-027ffea9e77b?auto=format&fit=crop&q=80&w=400', tag: '5-AXIS' },
    { title: 'CALIBRATION_CUBE.NC', edited: '5 DAYS AGO', machine: 'ENDER_3', time: '0h 15m', thumbnail: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?auto=format&fit=crop&q=80&w=400', tag: 'PRINT' },
  ];

  return (
    <div className="fixed inset-0 bg-[#0a0a0a]/90 backdrop-blur-2xl z-[150] flex items-center justify-center p-8 animate-in fade-in duration-300">
      <div className="w-full h-full max-w-[1400px] bg-[#141414] border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden chamfer-lg relative">
        
        {/* Background Hex Pattern - Matches HelpManager */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none hex-bg"></div>

        {/* Top Header Bar - Identical Structure to HelpManager */}
        <div className="h-16 px-8 bg-black/40 border-b border-white/10 flex items-center justify-between shrink-0 z-10">
          <div className="flex items-center gap-4">
            <span className="material-symbols-outlined text-[#1890FF] text-2xl">folder_shared</span>
            <div>
              <h1 className="text-white font-black text-sm tracking-[0.3em] uppercase leading-tight">FILE SYSTEM MANAGER</h1>
              <p className="text-[9px] text-gray-600 font-mono tracking-widest uppercase">Storage // Workspace Access & Cloud Sync</p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-gray-500 uppercase tracking-tighter">Sync_Status:</span>
              <span className="flex items-center gap-1.5 px-2 py-0.5 bg-blue-500/10 border border-blue-500/20 text-[#1890FF] text-[9px] font-bold">UP_TO_DATE_LATEST</span>
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
          {/* Left Sidebar Navigation - Chamfered Tabs matching HelpManager */}
          <aside className="w-72 bg-black/20 border-r border-white/10 flex flex-col p-6 shrink-0">
            <button className="h-12 w-full mb-8 bg-[#1890FF] hover:bg-[#40a9ff] text-white font-black text-[10px] tracking-[0.2em] flex items-center justify-center gap-3 chamfer-sm transition-all shadow-[0_0_20px_rgba(24,144,255,0.2)] active:scale-95 group">
              <span className="material-symbols-outlined text-sm group-hover:rotate-90 transition-transform">add</span>
              CREATE WORKSPACE
            </button>

            <h2 className="text-[10px] font-black text-gray-600 uppercase tracking-[0.2em] mb-4 px-2">Navigation</h2>
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
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[8px] font-black text-gray-600 uppercase">Cloud_Storage</span>
                  <span className="text-[8px] font-mono text-gray-400">85% Full</span>
                </div>
                <div className="h-1 w-full bg-white/5 overflow-hidden">
                  <div className="h-full bg-[#1890FF]" style={{ width: '85%' }}></div>
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content Area */}
          <main className="flex-1 flex flex-col bg-black/10">
            {activeTab === 'Recent Work' ? (
              <div className="flex-1 flex flex-col p-8 overflow-y-auto scrollbar-thin">
                <div className="flex justify-between items-center mb-8">
                  <div>
                    <h2 className="text-white font-black text-lg tracking-[0.1em] uppercase">WORKSPACE CATALOG</h2>
                    <p className="text-[10px] text-gray-500 font-mono tracking-widest uppercase mt-1">Found 12 matching projects in current directory</p>
                  </div>
                  <div className="flex gap-2">
                    <button className="size-10 flex items-center justify-center bg-[#1890FF]/10 border border-[#1890FF]/40 text-[#1890FF] chamfer-sm"><span className="material-symbols-outlined text-xl">grid_view</span></button>
                    <button className="size-10 flex items-center justify-center bg-black/40 border border-white/10 text-gray-600 hover:text-gray-300 chamfer-sm transition-all"><span className="material-symbols-outlined text-xl">list</span></button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {recentFiles.map(file => (
                    <FileCard key={file.title} {...file} />
                  ))}
                  
                  {/* Create New Placeholder */}
                  <div className="bg-white/[0.02] border border-white/10 border-dashed chamfer-md flex flex-col items-center justify-center p-8 group cursor-pointer hover:border-[#1890FF]/40 transition-all min-h-[220px]">
                    <div className="size-14 bg-white/5 flex items-center justify-center group-hover:bg-[#1890FF]/10 chamfer-sm transition-all">
                      <span className="material-symbols-outlined text-gray-700 group-hover:text-[#1890FF] text-3xl group-hover:scale-110 transition-transform">add_circle</span>
                    </div>
                    <span className="mt-4 text-[10px] font-black text-gray-700 uppercase tracking-[0.2em] group-hover:text-[#1890FF] transition-colors">Initialize Local Project</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center p-20 text-center">
                <div className="max-w-md">
                  <span className="material-symbols-outlined text-6xl text-gray-800 mb-6 block">folder_off</span>
                  <h3 className="text-white font-bold text-lg mb-2 uppercase tracking-widest">ACCESS_DENIED_OR_EMPTY</h3>
                  <p className="text-sm text-gray-600 leading-relaxed font-mono">
                    The {activeTab} volume is currently inaccessible or contains no valid G-Code metadata. Check system permissions.
                  </p>
                </div>
              </div>
            )}
          </main>
        </div>

        {/* Modal Bottom Status Bar - Matches HelpManager Style */}
        <div className="h-10 bg-black px-8 border-t border-white/10 flex items-center justify-between text-[9px] font-mono text-gray-600 tracking-[0.2em] uppercase shrink-0">
          <div className="flex gap-8">
            <span className="flex items-center gap-2"><div className="w-1 h-1 bg-green-500"></div> STORAGE_STATUS: OPTIMAL</span>
            <span className="flex items-center gap-2"><div className="w-1 h-1 bg-[#1890FF]"></div> CACHE_IO: 124.5 MB/S</span>
          </div>
          <div>Unauthorized file access is logged by core machine security. BUILD_9923</div>
        </div>
      </div>
    </div>
  );
};

export default FileManager;
