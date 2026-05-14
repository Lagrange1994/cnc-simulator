
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
  <div className="bg-cds-bg/60 hover:bg-cds-layer-01 border border-cds-border/30 group transition-all duration-300 cursor-pointer chamfer-md flex flex-col relative overflow-hidden">
    <div className="relative h-32 w-full overflow-hidden">
      <img src={thumbnail} alt={title} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500 scale-100 group-hover:scale-105" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
      {tag && (
        <span className="absolute top-2 right-2 px-2 py-0.5 bg-cds-interactive/20 border border-cds-interactive/40 text-[8px] font-mono text-cds-interactive tracking-widest uppercase">
          {tag}
        </span>
      )}
    </div>
    <div className="p-4 flex flex-col flex-1 relative z-10">
      <h4 className="text-cds-text-01 font-semibold text-body-sm tracking-wide truncate group-hover:text-cds-interactive transition-colors">{title}</h4>
      <p className="text-cds-text-04 text-[9px] mt-1 font-mono uppercase tracking-tighter italic">Last Sync: {edited}</p>

      <div className="mt-4 pt-4 border-t border-cds-border/20 flex justify-between items-end">
        <div>
          <span className="block text-[8px] font-mono text-cds-text-04 uppercase tracking-tighter">Machine_Profile</span>
          <span className="text-[10px] font-mono text-cds-text-02">{machine}</span>
        </div>
        <div className="text-right">
          <span className="block text-[8px] font-mono text-cds-text-04 uppercase tracking-tighter">Est_Cycle</span>
          <span className="text-[10px] font-mono text-cds-interactive">{time}</span>
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
    { id: 'Open Project',      icon: 'folder_open'  },
    { id: 'Recent Work',       icon: 'schedule'     },
    { id: 'Cloud Drive',       icon: 'cloud_done'   },
    { id: 'Import G-Code',     icon: 'note_add'     },
    { id: 'System Templates',  icon: 'architecture' },
  ];

  const recentFiles = [
    { title: 'PROJECT_ALPHA_V2.NC',  edited: '2H AGO',       machine: 'MACHINE_01',  time: '2h 45m',  thumbnail: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=400', tag: 'CNC'    },
    { title: 'BRACKET_MOUNT_L.NC',   edited: 'YESTERDAY',    machine: 'HAAS_VF2',    time: '0h 55m',  thumbnail: 'https://images.unsplash.com/photo-1558350315-8aa00e8e4590?auto=format&fit=crop&q=80&w=400', tag: 'MILL'   },
    { title: 'TURBINE_BLADE.NC',     edited: '3 DAYS AGO',   machine: '5_AXIS_MILL', time: '12h 10m', thumbnail: 'https://images.unsplash.com/photo-1454165833767-027ffea9e77b?auto=format&fit=crop&q=80&w=400', tag: '5-AXIS' },
    { title: 'CALIBRATION_CUBE.NC',  edited: '5 DAYS AGO',   machine: 'ENDER_3',     time: '0h 15m',  thumbnail: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?auto=format&fit=crop&q=80&w=400', tag: 'PRINT'  },
  ];

  return (
    <div className="fixed inset-0 bg-cds-bg/90 backdrop-blur-2xl z-[150] flex items-center justify-center p-8 animate-in fade-in duration-300">
      <div className="w-full h-full max-w-[1400px] bg-cds-layer-01 border border-cds-border/30 shadow-[0_0_50px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden chamfer-lg relative">

        <div className="absolute inset-0 opacity-[0.03] pointer-events-none hex-bg"></div>

        {/* Header */}
        <div className="h-16 px-8 bg-black/40 border-b border-cds-border/30 flex items-center justify-between shrink-0 z-10">
          <div className="flex items-center gap-4">
            <span className="material-symbols-outlined text-cds-interactive text-2xl">folder_shared</span>
            <div>
              <h1 className="text-cds-text-01 font-semibold text-body-sm tracking-[0.3em] uppercase leading-tight">FILE SYSTEM MANAGER</h1>
              <p className="text-[9px] text-cds-text-04 font-mono tracking-widest uppercase">Storage // Workspace Access & Cloud Sync</p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-cds-text-03 uppercase tracking-tighter">Sync_Status:</span>
              <span className="flex items-center gap-1.5 px-2 py-0.5 bg-cds-interactive/10 border border-cds-interactive/20 text-cds-interactive text-[9px] font-semibold">UP_TO_DATE_LATEST</span>
            </div>
            <button
              onClick={onClose}
              className="size-10 flex items-center justify-center bg-white/5 hover:bg-cds-error/20 hover:text-cds-error transition-all group"
            >
              <span className="material-symbols-outlined text-xl group-hover:rotate-90 transition-transform">close</span>
            </button>
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden z-10">
          {/* Left Sidebar */}
          <aside className="w-72 bg-black/20 border-r border-cds-border/30 flex flex-col p-6 shrink-0">
            {/* Carbon Primary Button */}
            <button className="h-12 w-full mb-8 bg-cds-interactive hover:bg-cds-link text-white font-semibold text-[10px] tracking-[0.2em] flex items-center justify-center gap-3 chamfer-sm transition-all shadow-[0_0_20px_rgba(69,137,255,0.2)] active:scale-95 group">
              <span className="material-symbols-outlined text-sm group-hover:rotate-90 transition-transform">add</span>
              CREATE WORKSPACE
            </button>

            <h2 className="text-[10px] font-semibold text-cds-text-04 uppercase tracking-[0.2em] mb-4 px-2">Navigation</h2>
            <nav className="space-y-1">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full h-12 px-4 flex items-center gap-4 text-[10px] font-semibold tracking-widest transition-all chamfer-sm border ${
                    activeTab === item.id
                      ? 'bg-cds-interactive/10 border-cds-interactive/40 text-cds-interactive shadow-[0_0_15px_rgba(69,137,255,0.1)]'
                      : 'bg-transparent border-transparent text-cds-text-03 hover:text-cds-text-02 hover:bg-white/5'
                  }`}
                >
                  <span className={`material-symbols-outlined text-lg ${activeTab === item.id ? 'text-cds-interactive' : 'text-cds-text-04'}`}>{item.icon}</span>
                  {item.id.toUpperCase()}
                </button>
              ))}
            </nav>

            <div className="mt-auto pt-6 border-t border-cds-border/20">
              <div className="p-4 bg-black/40 border border-cds-border/20 chamfer-sm">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[8px] font-semibold text-cds-text-04 uppercase">Cloud_Storage</span>
                  <span className="text-[8px] font-mono text-cds-text-02">85% Full</span>
                </div>
                <div className="h-1 w-full bg-cds-layer-02 overflow-hidden">
                  <div className="h-full bg-cds-interactive" style={{ width: '85%' }}></div>
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 flex flex-col bg-black/10">
            {activeTab === 'Recent Work' ? (
              <div className="flex-1 flex flex-col p-8 overflow-y-auto">
                <div className="flex justify-between items-center mb-8">
                  <div>
                    <h2 className="text-cds-text-01 font-semibold text-lg tracking-[0.1em] uppercase">WORKSPACE CATALOG</h2>
                    <p className="text-[10px] text-cds-text-03 font-mono tracking-widest uppercase mt-1">Found 12 matching projects in current directory</p>
                  </div>
                  <div className="flex gap-2">
                    <button className="size-10 flex items-center justify-center bg-cds-interactive/10 border border-cds-interactive/40 text-cds-interactive chamfer-sm">
                      <span className="material-symbols-outlined text-xl">grid_view</span>
                    </button>
                    <button className="size-10 flex items-center justify-center bg-black/40 border border-cds-border/20 text-cds-text-04 hover:text-cds-text-02 chamfer-sm transition-all">
                      <span className="material-symbols-outlined text-xl">list</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {recentFiles.map(file => (
                    <FileCard key={file.title} {...file} />
                  ))}
                  {/* Create New Placeholder */}
                  <div className="bg-white/[0.02] border border-cds-border/20 border-dashed chamfer-md flex flex-col items-center justify-center p-8 group cursor-pointer hover:border-cds-interactive/40 transition-all min-h-[220px]">
                    <div className="size-14 bg-white/5 flex items-center justify-center group-hover:bg-cds-interactive/10 chamfer-sm transition-all">
                      <span className="material-symbols-outlined text-cds-text-04 group-hover:text-cds-interactive text-3xl group-hover:scale-110 transition-transform">add_circle</span>
                    </div>
                    <span className="mt-4 text-[10px] font-semibold text-cds-text-04 uppercase tracking-[0.2em] group-hover:text-cds-interactive transition-colors">Initialize Local Project</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center p-20 text-center">
                <div className="max-w-md">
                  <span className="material-symbols-outlined text-6xl text-cds-text-04 mb-6 block">folder_off</span>
                  <h3 className="text-cds-text-01 font-semibold text-lg mb-2 uppercase tracking-widest">ACCESS_DENIED_OR_EMPTY</h3>
                  <p className="text-body-sm text-cds-text-04 leading-relaxed font-mono">
                    The {activeTab} volume is currently inaccessible or contains no valid G-Code metadata. Check system permissions.
                  </p>
                </div>
              </div>
            )}
          </main>
        </div>

        {/* Footer */}
        <div className="h-10 bg-cds-bg px-8 border-t border-cds-border/30 flex items-center justify-between text-[9px] font-mono text-cds-text-04 tracking-[0.2em] uppercase shrink-0">
          <div className="flex gap-8">
            <span className="flex items-center gap-2"><div className="w-1 h-1 bg-cds-success"></div> STORAGE_STATUS: OPTIMAL</span>
            <span className="flex items-center gap-2"><div className="w-1 h-1 bg-cds-interactive"></div> CACHE_IO: 124.5 MB/S</span>
          </div>
          <div>Unauthorized file access is logged by core machine security. BUILD_9923</div>
        </div>
      </div>
    </div>
  );
};

export default FileManager;
