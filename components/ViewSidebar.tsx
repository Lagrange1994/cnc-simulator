
import React, { useState } from 'react';

interface ViewSidebarProps {
  onClose: () => void;
}

const ViewSidebar: React.FC<ViewSidebarProps> = ({ onClose }) => {
  const [toggles, setToggles] = useState({
    machineHousing: true,
    fixturesClamps: true,
    rapidLines: false,
    toolpathHistory: true,
  });

  const [renderMode, setRenderMode] = useState('SOLID');
  const [projection, setProjection] = useState('PERSPECTIVE');
  const [gridOpacity, setGridOpacity] = useState(40);

  const toggleSwitch = (key: keyof typeof toggles) => {
    setToggles(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const renderModes = [
    { id: 'SOLID',     label: 'SOLID',     img: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=200&h=200&fit=crop' },
    { id: 'WIREFRAME', label: 'WIREFRAME', img: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=200&h=200&fit=crop' },
    { id: 'X-RAY',     label: 'X-RAY',     img: 'https://images.unsplash.com/photo-1531746790731-6c087fecd05a?w=200&h=200&fit=crop' },
    { id: 'PLASTIC',   label: 'PLASTIC',   img: 'https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?w=200&h=200&fit=crop' },
  ];

  return (
    <div className="fixed top-14 left-0 bottom-6 w-[400px] bg-cds-layer-01/95 backdrop-blur-2xl border-r border-cds-border z-[60] flex flex-col shadow-2xl animate-in slide-in-from-left duration-300 overflow-hidden">
      {/* Header */}
      <div className="h-16 px-6 bg-gradient-to-r from-black/40 to-transparent border-b border-cds-border flex justify-between items-center shrink-0">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-cds-interactive text-2xl">visibility</span>
          <div>
            <h2 className="text-cds-text-01 font-semibold text-body-sm tracking-[0.2em] uppercase leading-tight">VIEW SETTINGS</h2>
            <p className="text-label text-cds-text-03 font-mono tracking-wider">VISUAL_CONTROL_ROOM v4.2</p>
          </div>
        </div>
        <button onClick={onClose} className="p-2 text-cds-text-03 hover:text-cds-text-01 transition-all">
          <span className="material-symbols-outlined text-xl">close</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Scene Visibility */}
        <section className="p-6">
          <h3 className="text-[10px] font-semibold text-cds-text-03 uppercase tracking-widest mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">view_in_ar</span> Scene Visibility
          </h3>
          <div className="space-y-3">
            {[
              { id: 'machineHousing',  label: 'Machine Housing'      },
              { id: 'fixturesClamps',  label: 'Fixtures & Clamps'    },
              { id: 'rapidLines',      label: 'Rapid Lines (G00)'    },
              { id: 'toolpathHistory', label: 'Toolpath History'     },
            ].map((item) => (
              <div key={item.id} className="flex items-center justify-between p-3 bg-black/20 border border-cds-border/20 chamfer-sm">
                <span className="text-[11px] font-semibold text-cds-text-02 uppercase tracking-tight">{item.label}</span>
                {/* Carbon Toggle */}
                <button
                  onClick={() => toggleSwitch(item.id as keyof typeof toggles)}
                  className={`w-10 h-5 relative transition-colors duration-300 ${toggles[item.id as keyof typeof toggles] ? 'bg-cds-interactive/40' : 'bg-cds-layer-03'}`}
                >
                  <div className={`absolute top-0.5 bottom-0.5 w-4 bg-white transition-all duration-300 ${toggles[item.id as keyof typeof toggles] ? 'right-0.5 shadow-[0_0_8px_#4589ff]' : 'left-0.5'}`}></div>
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Render Style */}
        <section className="p-6 border-t border-cds-border/30 bg-black/10">
          <h3 className="text-[10px] font-semibold text-cds-text-03 uppercase tracking-widest mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">palette</span> Render Style
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {renderModes.map((mode) => (
              <button
                key={mode.id}
                onClick={() => setRenderMode(mode.id)}
                className={`relative aspect-square chamfer-md overflow-hidden border transition-all group ${
                  renderMode === mode.id
                    ? 'border-cds-interactive shadow-[0_0_15px_rgba(69,137,255,0.3)]'
                    : 'border-cds-border/20 hover:border-cds-border-str opacity-60 hover:opacity-100'
                }`}
              >
                <img src={mode.img} alt={mode.label} className="w-full h-full object-cover grayscale brightness-50 group-hover:brightness-75 transition-all" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-2">
                  <span className={`text-[10px] font-semibold tracking-widest ${renderMode === mode.id ? 'text-cds-interactive' : 'text-cds-text-01'}`}>{mode.label}</span>
                </div>
                {renderMode === mode.id && (
                  <div className="absolute top-2 right-2 size-2 bg-cds-interactive shadow-[0_0_5px_#4589ff]"></div>
                )}
              </button>
            ))}
          </div>
        </section>

        {/* Camera & Grid */}
        <section className="p-6 border-t border-cds-border/30">
          <h3 className="text-[10px] font-semibold text-cds-text-03 uppercase tracking-widest mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">videocam</span> Camera & Grid
          </h3>
          <div className="space-y-6">
            <div>
              <label className="text-[9px] text-cds-text-04 block mb-2 uppercase font-semibold tracking-tighter">View Projection</label>
              <div className="flex bg-black/40 p-1 border border-cds-border/20 chamfer-sm">
                {['PERSPECTIVE', 'ORTHOGRAPHIC'].map((opt) => (
                  <button
                    key={opt}
                    onClick={() => setProjection(opt)}
                    className={`flex-1 h-9 text-[10px] font-semibold tracking-widest transition-all ${
                      projection === opt
                        ? 'bg-cds-interactive text-white shadow-[0_0_10px_rgba(69,137,255,0.3)]'
                        : 'text-cds-text-04 hover:text-cds-text-02'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-3">
                <label className="text-[9px] text-cds-text-04 uppercase font-semibold tracking-tighter">Floor Grid Intensity</label>
                <span className="text-[10px] font-mono text-cds-interactive">{gridOpacity}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={gridOpacity}
                onChange={(e) => setGridOpacity(parseInt(e.target.value))}
                className="w-full accent-[#4589ff]"
              />
            </div>
          </div>
        </section>

        {/* Data Visualization */}
        <section className="p-6 border-t border-cds-border/30 hex-bg min-h-[180px] relative">
          <div className="relative z-10">
            <h3 className="text-[10px] font-semibold text-cds-interactive uppercase tracking-widest mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">bar_chart</span> Data Visualization
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-[9px] text-cds-text-02 block mb-2 uppercase font-semibold tracking-tighter">Heatmap Layer</label>
                <div className="relative">
                  <select className="w-full h-10 bg-cds-bg/90 border border-cds-interactive/30 px-3 text-[11px] font-semibold text-cds-text-01 appearance-none outline-none focus:border-cds-interactive transition-all cursor-pointer">
                    <option>Color by Feed Rate</option>
                    <option>Color by Tool Depth</option>
                    <option>Color by Axial Load</option>
                    <option>Color by G-Code Block</option>
                  </select>
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-cds-text-04 pointer-events-none">expand_more</span>
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center mb-2 px-1">
                  <span className="text-[8px] font-mono text-cds-interactive">LOW FEED</span>
                  <span className="text-[8px] font-mono text-cds-error">HIGH FEED</span>
                </div>
                <div className="h-1.5 w-full bg-gradient-to-r from-blue-600 via-green-500 to-red-600 chamfer-sm"></div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Footer */}
      <div className="h-10 bg-cds-bg border-t border-cds-border flex items-center justify-center gap-6 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 bg-cds-success shadow-[0_0_5px_rgba(66,190,101,0.5)]"></div>
          <span className="text-[8px] font-mono text-cds-text-04 uppercase tracking-widest">Graphics: Optimal</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 bg-cds-interactive shadow-[0_0_5px_rgba(69,137,255,0.5)]"></div>
          <span className="text-[8px] font-mono text-cds-text-04 uppercase tracking-widest">FPS: 144.0</span>
        </div>
      </div>
    </div>
  );
};

export default ViewSidebar;
