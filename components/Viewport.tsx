
import React, { useMemo, useState, useCallback, useEffect, useRef } from 'react';
import { Coordinates, GCodeLine, ViewSettings } from '../types';
import { parseGCodeParams } from '../lib/gcode/parser';
import { formatClock } from '../lib/format';

interface ViewportProps {
  isSimulating: boolean;
  progress: number;
  coords: Coordinates;
  lines: GCodeLine[];
  /** Total program cycle time, from the same timeline the simulator plays
   * back (see summarizeProgram in lib/gcode/parser.ts) -- drives the real
   * RUN TIME/EST readouts below instead of a hardcoded placeholder. */
  totalDurationMs: number;
  /** Scene display settings owned by the View Settings panel (ViewSidebar) --
   * see types.ts. */
  viewSettings: ViewSettings;
}

// Render-mode presets: how the tool + toolpath strokes look for each of the
// four Render Style options in ViewSidebar. Kept as one table instead of a
// scatter of inline ternaries so adding a mode later is a one-line change.
const RENDER_MODE_STYLE: Record<ViewSettings['renderMode'], {
  toolFill: string;
  toolOpacity: number;
  pathStrokeWidth: number;
}> = {
  SOLID:     { toolFill: 'url(#toolGradient)', toolOpacity: 1,    pathStrokeWidth: 2 },
  WIREFRAME: { toolFill: 'none',               toolOpacity: 1,    pathStrokeWidth: 1 },
  'X-RAY':   { toolFill: 'url(#toolGradient)', toolOpacity: 0.35, pathStrokeWidth: 2 },
  PLASTIC:   { toolFill: '#e8935a',            toolOpacity: 1,    pathStrokeWidth: 2 },
};

const Viewport: React.FC<ViewportProps> = ({ isSimulating, progress, coords, lines, totalDurationMs, viewSettings }) => {
  const [zoomScale, setZoomScale] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [rotation, setRotation] = useState({ x: 20, z: -15 }); // Initial 3D tilt
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Interaction Refs
  const isPanningRef = useRef(false);
  const isRotatingRef = useRef(false);
  const isZoomingRef = useRef(false);
  const lastMousePosRef = useRef({ x: 0, y: 0 });

  // Simple heuristic to build a path from G-Code
  const toolpathData = useMemo(() => {
    let currentX = 0;
    let currentY = 0;
    const pathSegments: string[] = ["M 500 300"]; // Start center
    
    lines.forEach(line => {
      if (line.command === 'G00' || line.command === 'G01') {
        const { x, y } = parseGCodeParams(line.params);
        if (x !== undefined) currentX = x;
        if (y !== undefined) currentY = y;

        // Scale and shift for visualization: 500 is center
        pathSegments.push(`L ${500 + currentX * 2} ${300 - currentY * 2}`);
      }
    });
    
    return pathSegments.join(' ');
  }, [lines]);

  // Rapid (G00) moves only, as independent M-broken segments -- kept
  // separate from toolpathData above so the "Rapid Lines (G00)" toggle in
  // ViewSidebar can show/hide just the rapid moves without touching the
  // continuous cut-path animation.
  const rapidPathData = useMemo(() => {
    let currentX = 0;
    let currentY = 0;
    const segments: string[] = [];

    lines.forEach(line => {
      if (line.command === 'G00' || line.command === 'G01') {
        const prevX = currentX;
        const prevY = currentY;
        const { x, y } = parseGCodeParams(line.params);
        if (x !== undefined) currentX = x;
        if (y !== undefined) currentY = y;

        if (line.command === 'G00' && (currentX !== prevX || currentY !== prevY)) {
          segments.push(`M ${500 + prevX * 2} ${300 - prevY * 2} L ${500 + currentX * 2} ${300 - currentY * 2}`);
        }
      }
    });

    return segments.join(' ');
  }, [lines]);

  const adjustZoom = useCallback((delta: number) => {
    setZoomScale(prev => {
      const newScale = prev + delta;
      return Math.max(0.1, Math.min(10, newScale));
    });
  }, []);

  const resetView = useCallback(() => {
    setZoomScale(1);
    setPanOffset({ x: 0, y: 0 });
    setRotation({ x: 20, z: -15 });
  }, []);

  const frameTool = useCallback(() => {
    // Center view on current tool coordinates
    setPanOffset({
      x: -(coords.x * 2),
      y: (coords.y * 2)
    });
  }, [coords.x, coords.y]);

  // Handle Blender Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent shortcuts if typing in input
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') return;

      switch(e.key) {
        case '1': // Front View
          setRotation({ x: 90, z: 0 });
          break;
        case '3': // Right View
          setRotation({ x: 90, z: 90 });
          break;
        case '7': // Top View
          setRotation({ x: 0, z: 0 });
          break;
        case 'Home':
          resetView();
          break;
        case '.': // Period: Focus Tool
          frameTool();
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [resetView, frameTool]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    // Blender Standard: All primary navigation uses Middle Mouse Button (button 1)
    if (e.button === 1) {
      e.preventDefault();
      lastMousePosRef.current = { x: e.clientX, y: e.clientY };
      
      if (e.shiftKey) {
        isPanningRef.current = true;
        if (containerRef.current) containerRef.current.style.cursor = 'grabbing';
      } else if (e.ctrlKey) {
        isZoomingRef.current = true;
        if (containerRef.current) containerRef.current.style.cursor = 'ns-resize';
      } else {
        isRotatingRef.current = true;
        if (containerRef.current) containerRef.current.style.cursor = 'move';
      }
    }
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isPanningRef.current && !isRotatingRef.current && !isZoomingRef.current) return;
      
      const deltaX = e.clientX - lastMousePosRef.current.x;
      const deltaY = e.clientY - lastMousePosRef.current.y;
      
      if (isPanningRef.current) {
        setPanOffset(prev => ({
          x: prev.x + deltaX,
          y: prev.y + deltaY
        }));
      } else if (isRotatingRef.current) {
        setRotation(prev => ({
          z: prev.z + deltaX * 0.5,
          x: Math.max(0, Math.min(90, prev.x - deltaY * 0.5)) 
        }));
      } else if (isZoomingRef.current) {
        adjustZoom(-deltaY * 0.01);
      }
      
      lastMousePosRef.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseUp = () => {
      isPanningRef.current = false;
      isRotatingRef.current = false;
      isZoomingRef.current = false;
      if (containerRef.current) {
        containerRef.current.style.cursor = 'default';
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [adjustZoom]);

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.1 : 0.1;
      adjustZoom(delta);
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('wheel', handleWheel, { passive: false });
    }
    return () => {
      if (container) {
        container.removeEventListener('wheel', handleWheel);
      }
    };
  }, [adjustZoom]);

  return (
    <section 
      className="flex-1 flex flex-col bg-[#0d0d0d] relative overflow-hidden" 
      ref={containerRef}
      onMouseDown={handleMouseDown}
      style={{ perspective: viewSettings.projection === 'PERSPECTIVE' ? '1200px' : 'none' }}
    >
      {/* 3D Header Overlay */}
      <div className="absolute top-0 left-0 right-0 h-14 bg-gradient-to-b from-black/80 to-transparent z-10 flex justify-between items-start p-4 pointer-events-none">
        <div className="flex gap-2">
          <div className="inline-flex items-center gap-2 bg-black/60 backdrop-blur-md border border-white/10 px-3 py-1 rounded-sm text-xs font-mono text-gray-300 pointer-events-auto">
            <span className={`w-2 h-2 rounded-full ${isSimulating ? 'bg-[#4589ff] animate-pulse' : 'bg-gray-500'}`}></span>
            {isSimulating ? 'SIMULATION ACTIVE' : 'IDLE'}
          </div>
          {/* Quick View Presets */}
          <div className="flex items-stretch bg-black/60 backdrop-blur-md border border-white/10 p-1 rounded-sm pointer-events-auto text-[10px] font-bold text-gray-400">
             <button onClick={() => setRotation({ x: 0, z: 0 })} className="px-2 min-h-11 flex items-center hover:text-white border-r border-white/5">TOP (7)</button>
             <button onClick={() => setRotation({ x: 90, z: 0 })} className="px-2 min-h-11 flex items-center hover:text-white border-r border-white/5">FRONT (1)</button>
             <button onClick={() => setRotation({ x: 90, z: 90 })} className="px-2 min-h-11 flex items-center hover:text-white">RIGHT (3)</button>
          </div>
        </div>
        
        {/* View Controls */}
        <div className="flex items-center gap-1 bg-black/60 backdrop-blur-md border border-white/10 p-1 rounded-sm pointer-events-auto">
          <button
            onClick={() => adjustZoom(0.2)}
            className="size-11 flex items-center justify-center hover:bg-white/10 text-white rounded-sm transition-colors"
            title="Zoom In"
            aria-label="Zoom in"
          >
            <span className="material-symbols-outlined text-lg" aria-hidden="true">add</span>
          </button>
          <button
            onClick={() => adjustZoom(-0.2)}
            className="size-11 flex items-center justify-center hover:bg-white/10 text-white rounded-sm transition-colors"
            title="Zoom Out"
            aria-label="Zoom out"
          >
            <span className="material-symbols-outlined text-lg" aria-hidden="true">remove</span>
          </button>
          <div className="w-[1px] h-4 bg-white/20 my-auto"></div>
          <button
            onClick={resetView}
            className="size-11 flex items-center justify-center hover:bg-white/10 text-white rounded-sm transition-colors"
            title="Reset View (Home)"
            aria-label="Reset view"
          >
            <span className="material-symbols-outlined text-lg" aria-hidden="true">center_focus_strong</span>
          </button>
          <button
            onClick={frameTool}
            className="size-11 flex items-center justify-center hover:bg-white/10 text-[#4589ff] rounded-sm transition-colors"
            title="Frame Tool (.)"
            aria-label="Frame tool in view"
          >
            <span className="material-symbols-outlined text-lg" aria-hidden="true">my_location</span>
          </button>
        </div>
      </div>

      {/* Main Simulation Content */}
      <div className="flex-1 w-full h-full relative flex items-center justify-center bg-[#151515] overflow-hidden">
        <div className="absolute inset-0 opacity-30 hex-bg"></div>
        
        {/* 3D Wrapper */}
        <div 
          className="relative w-full h-full flex items-center justify-center transition-transform duration-300 ease-out"
          style={{ 
            transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoomScale}) rotateX(${rotation.x}deg) rotateZ(${rotation.z}deg)`,
            transformStyle: 'preserve-3d'
          }}
        >
          <svg
            className="w-[1000px] h-[600px] pointer-events-none"
            viewBox="0 0 1000 600"
          >
            {/* Grid Floor Visualization -- opacity driven by ViewSidebar's
                "Floor Grid Intensity" slider (0-100%, scaled to a 0-0.3 range
                so the default 40% matches the original hardcoded 0.1 look) */}
            <g opacity={(viewSettings.gridOpacity / 100) * 0.3}>
              {Array.from({ length: 21 }).map((_, i) => (
                <React.Fragment key={i}>
                  <line x1={0} y1={i * 30} x2={1000} y2={i * 30} stroke="white" strokeWidth="0.5" />
                  <line x1={i * 50} y1={0} x2={i * 50} y2={600} stroke="white" strokeWidth="0.5" />
                </React.Fragment>
              ))}
            </g>

            {/* Machine Housing (outer machine-bed frame) — ViewSidebar's
                "Machine Housing" scene-visibility toggle */}
            {viewSettings.machineHousing && (
              <rect
                x={80} y={40} width={840} height={520}
                fill="none" stroke="#525252" strokeOpacity="0.5"
                strokeWidth="2" strokeDasharray="10,6"
              />
            )}

            {/* Work Envelope (machine table bounds) — visual anchor so the
                canvas doesn't read as empty void on large screens */}
            <g>
              <rect
                x={150} y={100} width={700} height={400}
                fill="#262626" fillOpacity="0.25"
                stroke="#4589ff" strokeOpacity="0.35"
                strokeWidth="1.5" strokeDasharray="6,4"
              />
              {[[150, 100], [850, 100], [850, 500], [150, 500]].map(([cx, cy], i) => {
                const dx = cx === 150 ? 1 : -1;
                const dy = cy === 100 ? 1 : -1;
                return (
                  <path
                    key={i}
                    d={`M ${cx} ${cy + dy * 24} L ${cx} ${cy} L ${cx + dx * 24} ${cy}`}
                    fill="none" stroke="#4589ff" strokeOpacity="0.7" strokeWidth="2"
                  />
                );
              })}
              {/* Fixtures & Clamps — small clamp markers pinning stock to the
                  work-envelope corners; ViewSidebar's "Fixtures & Clamps"
                  scene-visibility toggle */}
              {viewSettings.fixturesClamps && [[150, 100], [850, 100], [850, 500], [150, 500]].map(([cx, cy], i) => (
                <rect
                  key={i}
                  x={cx - 9} y={cy - 9} width={18} height={18}
                  fill="#f1c21b" fillOpacity="0.85" stroke="#161616" strokeWidth="1"
                />
              ))}
              <text x={158} y={92} fill="#4589ff" fillOpacity="0.6" fontSize="10" fontFamily="monospace" letterSpacing="1">
                WORK ENVELOPE
              </text>
            </g>

            {/* Toolpath History — the static shadow/planned overlays behind
                the live progressive path; ViewSidebar's "Toolpath History"
                scene-visibility toggle */}
            {viewSettings.toolpathHistory && (
              <>
                {/* Base Toolpath (Shadow) */}
                <path
                  d={toolpathData}
                  fill="none"
                  stroke="#222"
                  strokeWidth="4"
                  strokeLinecap="round"
                />
                {/* Planned Toolpath */}
                <path
                  d={toolpathData}
                  fill="none"
                  stroke="#4589ff33"
                  strokeWidth="2"
                  strokeDasharray="4,4"
                />
              </>
            )}
            {/* Rapid (G00) moves — ViewSidebar's "Rapid Lines (G00)" toggle */}
            {viewSettings.rapidLines && (
              <path
                d={rapidPathData}
                fill="none"
                stroke="#f1c21b"
                strokeWidth="1.5"
                strokeDasharray="3,3"
                strokeLinecap="round"
              />
            )}
            {/* Animated Executed Toolpath (Progressive) -- strokeDasharray/
                strokeDashoffset is the reveal mechanism (one dash as long as
                the whole path, offset back by (100-progress)%), so it stays
                fixed across render modes; only stroke width varies. */}
            <path
              d={toolpathData}
              fill="none"
              stroke="#4589ff"
              strokeWidth={RENDER_MODE_STYLE[viewSettings.renderMode].pathStrokeWidth}
              strokeDasharray="10000"
              strokeDashoffset={10000 - (10000 * (progress / 100))}
              className="transition-all duration-300"
            />

            {/* Tool Representation */}
            <g
              transform={`translate(${500 + coords.x * 2}, ${300 - coords.y * 2})`}
              className="transition-transform duration-100 ease-linear"
              opacity={RENDER_MODE_STYLE[viewSettings.renderMode].toolOpacity}
            >
              <ellipse cx="0" cy="5" rx="4" ry="2" fill="black" opacity="0.4" />
              <g transform="rotate(0)">
                 <rect x="-4" y="-120" width="8" height="120" fill={RENDER_MODE_STYLE[viewSettings.renderMode].toolFill} stroke={RENDER_MODE_STYLE[viewSettings.renderMode].toolFill === 'none' ? '#4589ff' : 'none'} />
                 <path d="M-4 0 L4 0 L6 -10 L-6 -10 Z" fill="#eee" />
              </g>
              <defs>
                <linearGradient id="toolGradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#444" />
                  <stop offset="50%" stopColor="#888" />
                  <stop offset="100%" stopColor="#444" />
                </linearGradient>
              </defs>
            </g>
          </svg>

          {/* Coordinate Tag */}
          <div 
            className="absolute bg-black/80 backdrop-blur-sm border border-[#4589ff]/40 text-[#4589ff] text-[10px] font-mono px-2 py-0.5 rounded-sm shadow-xl z-10 transition-all duration-100 ease-linear pointer-events-none"
            style={{ 
              left: `${500 + coords.x * 2 + 15}px`, 
              top: `${300 - coords.y * 2 - 15}px`,
              transform: `rotateZ(${-rotation.z}deg) rotateX(${-rotation.x}deg)` 
            }}
          >
            REL X:{coords.x.toFixed(2)} Y:{coords.y.toFixed(2)} Z:{coords.z.toFixed(2)}
          </div>
        </div>

        <div className="absolute inset-0 pointer-events-none scanlines opacity-5"></div>
        
        {/* View State Indicators - Updated for Blender controls */}
        <div className="absolute bottom-4 right-4 flex flex-col items-end gap-1 z-10">
          <div className="flex gap-2">
            <div className="bg-black/60 border border-white/10 px-2 py-1 text-[9px] font-mono text-gray-500 uppercase tracking-widest">
              Zoom: {(zoomScale * 100).toFixed(0)}%
            </div>
            <div className="bg-black/60 border border-white/10 px-2 py-1 text-[9px] font-mono text-gray-500 uppercase tracking-widest">
              Tilt: {rotation.x.toFixed(0)}° Rot: {rotation.z.toFixed(0)}°
            </div>
          </div>
          <div className="bg-black/60 border border-white/10 px-2 py-1 text-[9px] font-mono text-gray-500 uppercase tracking-widest">
            Pan: {panOffset.x.toFixed(0)}, {panOffset.y.toFixed(0)}
          </div>
          <div className="mt-1 text-[8px] text-gray-600 font-mono uppercase tracking-tighter text-right leading-tight bg-black/20 p-1">
            MMB: Orbit | Shift + MMB: Pan | Ctrl + MMB: Zoom<br/>
            Keys: 1:Front, 3:Right, 7:Top, .:Focus Tool, Home:Reset
          </div>
        </div>
      </div>

      {/* Progress Scrubber */}
      <div className="h-16 bg-[#2B2B2B] border-t border-[#404040] flex flex-col justify-center px-6 z-20">
        <div className="flex justify-between items-center mb-2 text-xs text-gray-400 font-mono">
          <span>RUN TIME: {formatClock((progress / 100) * totalDurationMs)}</span>
          <div className="flex items-center gap-2">
            <span className="text-[#4589ff] font-bold">COMPLETION {progress}%</span>
            <div className="w-24 h-1 bg-black/40 rounded-full overflow-hidden">
               <div className="h-full bg-[#4589ff]" style={{ width: `${progress}%` }}></div>
            </div>
          </div>
          <span>EST: {formatClock(totalDurationMs)}</span>
        </div>
        <div className="relative h-2 bg-black/50 rounded-sm overflow-hidden border border-white/5">
          <div 
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-[#4589ff] to-[#4589ff]/60 shadow-[0_0_10px_rgba(var(--cds-interactive-glow-rgb),0.5)] transition-all duration-300"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>
    </section>
  );
};

export default Viewport;
