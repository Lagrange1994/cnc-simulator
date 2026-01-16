
import React, { useMemo, useState, useCallback, useEffect, useRef } from 'react';
import { Coordinates, GCodeLine } from '../types';

interface ViewportProps {
  isSimulating: boolean;
  progress: number;
  coords: Coordinates;
  lines: GCodeLine[];
}

const Viewport: React.FC<ViewportProps> = ({ isSimulating, progress, coords, lines }) => {
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
        const xMatch = line.params?.match(/X(-?\d+\.?\d*)/);
        const yMatch = line.params?.match(/Y(-?\d+\.?\d*)/);
        if (xMatch) currentX = parseFloat(xMatch[1]);
        if (yMatch) currentY = parseFloat(yMatch[1]);
        
        // Scale and shift for visualization: 500 is center
        pathSegments.push(`L ${500 + currentX * 2} ${300 - currentY * 2}`);
      }
    });
    
    return pathSegments.join(' ');
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
      style={{ perspective: '1200px' }}
    >
      {/* 3D Header Overlay */}
      <div className="absolute top-0 left-0 right-0 h-14 bg-gradient-to-b from-black/80 to-transparent z-10 flex justify-between items-start p-4 pointer-events-none">
        <div className="flex gap-2">
          <div className="inline-flex items-center gap-2 bg-black/60 backdrop-blur-md border border-white/10 px-3 py-1 rounded-sm text-xs font-mono text-gray-300 pointer-events-auto">
            <span className={`w-2 h-2 rounded-full ${isSimulating ? 'bg-[#1791cf] animate-pulse' : 'bg-gray-500'}`}></span>
            {isSimulating ? 'SIMULATION ACTIVE' : 'IDLE'}
          </div>
          {/* Quick View Presets */}
          <div className="flex bg-black/60 backdrop-blur-md border border-white/10 p-1 rounded-sm pointer-events-auto text-[10px] font-bold text-gray-400">
             <button onClick={() => setRotation({ x: 0, z: 0 })} className="px-2 hover:text-white border-r border-white/5">TOP (7)</button>
             <button onClick={() => setRotation({ x: 90, z: 0 })} className="px-2 hover:text-white border-r border-white/5">FRONT (1)</button>
             <button onClick={() => setRotation({ x: 90, z: 90 })} className="px-2 hover:text-white">RIGHT (3)</button>
          </div>
        </div>
        
        {/* View Controls */}
        <div className="flex gap-1 bg-black/60 backdrop-blur-md border border-white/10 p-1 rounded-sm pointer-events-auto">
          <button 
            onClick={() => adjustZoom(0.2)} 
            className="p-1.5 hover:bg-white/10 text-white rounded-sm transition-colors" 
            title="Zoom In"
          >
            <span className="material-symbols-outlined text-lg">add</span>
          </button>
          <button 
            onClick={() => adjustZoom(-0.2)} 
            className="p-1.5 hover:bg-white/10 text-white rounded-sm transition-colors" 
            title="Zoom Out"
          >
            <span className="material-symbols-outlined text-lg">remove</span>
          </button>
          <div className="w-[1px] h-4 bg-white/20 my-auto"></div>
          <button 
            onClick={resetView} 
            className="p-1.5 hover:bg-white/10 text-white rounded-sm transition-colors" 
            title="Reset View (Home)"
          >
            <span className="material-symbols-outlined text-lg">center_focus_strong</span>
          </button>
          <button 
            onClick={frameTool}
            className="p-1.5 hover:bg-white/10 text-[#1791cf] rounded-sm transition-colors" 
            title="Frame Tool (.)"
          >
            <span className="material-symbols-outlined text-lg">my_location</span>
          </button>
        </div>
      </div>

      {/* Main Simulation Content */}
      <div className="flex-1 w-full h-full relative flex items-center justify-center bg-[#151515] overflow-hidden">
        <div className="absolute inset-0 opacity-20 hex-bg"></div>
        
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
            {/* Grid Floor Visualization */}
            <g opacity="0.1">
              {Array.from({ length: 21 }).map((_, i) => (
                <React.Fragment key={i}>
                  <line x1={0} y1={i * 30} x2={1000} y2={i * 30} stroke="white" strokeWidth="0.5" />
                  <line x1={i * 50} y1={0} x2={i * 50} y2={600} stroke="white" strokeWidth="0.5" />
                </React.Fragment>
              ))}
            </g>

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
              stroke="#1791cf33" 
              strokeWidth="2" 
              strokeDasharray="4,4"
            />
            {/* Animated Executed Toolpath (Progressive) */}
            <path 
              d={toolpathData} 
              fill="none" 
              stroke="#1791cf" 
              strokeWidth="2" 
              strokeDasharray="10000"
              strokeDashoffset={10000 - (10000 * (progress / 100))}
              className="transition-all duration-300"
            />
            
            {/* Tool Representation */}
            <g transform={`translate(${500 + coords.x * 2}, ${300 - coords.y * 2})`} className="transition-transform duration-100 ease-linear">
              <ellipse cx="0" cy="5" rx="4" ry="2" fill="black" opacity="0.4" />
              <g transform="rotate(0)">
                 <rect x="-4" y="-120" width="8" height="120" fill="url(#toolGradient)" />
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
            className="absolute bg-black/80 backdrop-blur-sm border border-[#1791cf]/40 text-[#1791cf] text-[10px] font-mono px-2 py-0.5 rounded-sm shadow-xl z-10 transition-all duration-100 ease-linear pointer-events-none"
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
          <span>RUN TIME: 00:00:{(progress * 0.45).toFixed(0).padStart(2, '0')}</span>
          <div className="flex items-center gap-2">
            <span className="text-[#1791cf] font-bold">COMPLETION {progress}%</span>
            <div className="w-24 h-1 bg-black/40 rounded-full overflow-hidden">
               <div className="h-full bg-[#1791cf]" style={{ width: `${progress}%` }}></div>
            </div>
          </div>
          <span>EST: 00:00:45</span>
        </div>
        <div className="relative h-2 bg-black/50 rounded-sm overflow-hidden border border-white/5">
          <div 
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-[#1791cf] to-[#1791cf]/60 shadow-[0_0_10px_rgba(23,145,207,0.5)] transition-all duration-300"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>
    </section>
  );
};

export default Viewport;
