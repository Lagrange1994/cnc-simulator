
import React, { useState, useEffect, useCallback, useRef } from 'react';
import Header from './components/Header';
import Editor from './components/Editor';
import Viewport from './components/Viewport';
import Sidebar from './components/Sidebar';
import Terminal from './components/Terminal';
import AiAssistant from './components/AiAssistant';
import FileManager from './components/FileManager';
import EditSidebar from './components/EditSidebar';
import ViewSidebar from './components/ViewSidebar';
import HelpManager from './components/HelpManager';
import SettingsManager from './components/SettingsManager';
import { Coordinates, MachineStatus, LogMessage } from './types';
import { INITIAL_GCODE, TOOLS } from './constants';

const App: React.FC = () => {
  const [activeLineIndex, setActiveLineIndex] = useState(0);
  const [coords, setCoords] = useState<Coordinates>({ x: 0, y: 0, z: 10.000 });
  const [logs, setLogs] = useState<LogMessage[]>([]);
  const [status, setStatus] = useState<MachineStatus>({
    spindleRpm: 0,
    feedRate: 1200,
    isSimulating: false,
    progress: 0,
    activeLineIndex: 0,
    coolant: false,
  });

  // UI State
  const [isFileMenuOpen, setIsFileMenuOpen] = useState(false);
  const [isEditMenuOpen, setIsEditMenuOpen] = useState(false);
  const [isViewMenuOpen, setIsViewMenuOpen] = useState(false);
  const [isHelpMenuOpen, setIsHelpMenuOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [leftWidth, setLeftWidth] = useState(420);
  const [rightWidth, setRightWidth] = useState(340);
  const [terminalHeight, setTerminalHeight] = useState(200);
  const [isResizingLeft, setIsResizingLeft] = useState(false);
  const [isResizingRight, setIsResizingRight] = useState(false);
  const [isResizingTerminal, setIsResizingTerminal] = useState(false);

  const logsRef = useRef(logs);
  logsRef.current = logs;

  const addLog = useCallback((text: string, level: LogMessage['level'] = 'info') => {
    const newLog: LogMessage = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      text,
      level
    };
    setLogs(prev => [...prev.slice(-49), newLog]);
  }, []);

  // Keyboard listeners (F1 for help)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F1') {
        e.preventDefault();
        setIsHelpMenuOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Resizing Effects
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isResizingLeft) {
        const newWidth = Math.max(250, Math.min(600, e.clientX));
        setLeftWidth(newWidth);
      } else if (isResizingRight) {
        const newWidth = Math.max(250, Math.min(500, window.innerWidth - e.clientX));
        setRightWidth(newWidth);
      } else if (isResizingTerminal) {
        const mainElement = document.querySelector('main');
        if (mainElement) {
          const mainRect = mainElement.getBoundingClientRect();
          const newHeight = Math.max(100, Math.min(mainRect.height - 100, mainRect.bottom - e.clientY));
          setTerminalHeight(newHeight);
        }
      }
    };

    const handleMouseUp = () => {
      setIsResizingLeft(false);
      setIsResizingRight(false);
      setIsResizingTerminal(false);
      document.body.style.cursor = 'default';
    };

    if (isResizingLeft || isResizingRight || isResizingTerminal) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      if (isResizingLeft || isResizingRight) document.body.style.cursor = 'col-resize';
      if (isResizingTerminal) document.body.style.cursor = 'row-resize';
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizingLeft, isResizingRight, isResizingTerminal]);

  // Movement Logic
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;

    if (status.isSimulating) {
      interval = setInterval(() => {
        setStatus(prev => {
          if (prev.progress >= 100) {
            addLog("Program execution complete.", "success");
            return { ...prev, isSimulating: false, progress: 100 };
          }

          const nextProgress = prev.progress + 0.5;
          const linesCount = INITIAL_GCODE.length;
          const nextIndex = Math.min(Math.floor((nextProgress / 100) * linesCount), linesCount - 1);

          if (nextIndex !== prev.activeLineIndex) {
            const nextLine = INITIAL_GCODE[nextIndex];
            addLog(`Executing line ${nextLine.lineNum}: ${nextLine.command} ${nextLine.params || ''}`);

            if (nextLine.params) {
              const xMatch = nextLine.params.match(/X(-?\d+\.?\d*)/);
              const yMatch = nextLine.params.match(/Y(-?\d+\.?\d*)/);
              const zMatch = nextLine.params.match(/Z(-?\d+\.?\d*)/);
              const sMatch = nextLine.params.match(/S(\d+)/);

              setCoords(c => ({
                x: xMatch ? parseFloat(xMatch[1]) : c.x,
                y: yMatch ? parseFloat(yMatch[1]) : c.y,
                z: zMatch ? parseFloat(zMatch[1]) : c.z,
              }));

              if (sMatch) {
                setStatus(s => ({ ...s, spindleRpm: parseInt(sMatch[1]) }));
              }
            }
          }

          return {
            ...prev,
            progress: nextProgress,
            activeLineIndex: nextIndex
          };
        });
      }, 100);
    }

    return () => clearInterval(interval);
  }, [status.isSimulating, addLog]);

  useEffect(() => {
    setActiveLineIndex(status.activeLineIndex);
  }, [status.activeLineIndex]);

  const handleCycleStart = useCallback(() => {
    if (status.progress >= 100) {
      handleReset();
    }
    setStatus(prev => ({ ...prev, isSimulating: true, spindleRpm: 12000, coolant: true }));
    addLog("Cycle Start command received. Spindle spinning up...", "info");
    addLog("Homing sequence bypassed. Initializing path execution.", "warn");
  }, [status.progress, addLog]);

  const handleFeedHold = useCallback(() => {
    setStatus(prev => ({ ...prev, isSimulating: false }));
    addLog("Feed Hold active. Axis motion suspended.", "warn");
  }, [addLog]);

  const handleReset = useCallback(() => {
    setStatus({
      spindleRpm: 0,
      feedRate: 1200,
      isSimulating: false,
      progress: 0,
      activeLineIndex: 0,
      coolant: false,
    });
    setCoords({ x: 0, y: 0, z: 10 });
    setActiveLineIndex(0);
    addLog("System Reset. Returning to program start.", "info");
  }, [addLog]);

  const toggleEditMenu = () => {
    setIsEditMenuOpen(!isEditMenuOpen);
    if (!isEditMenuOpen) setIsViewMenuOpen(false);
  };

  const toggleViewMenu = () => {
    setIsViewMenuOpen(!isViewMenuOpen);
    if (!isViewMenuOpen) setIsEditMenuOpen(false);
  };

  return (
    <div className={`h-screen flex flex-col bg-cds-bg text-cds-text-01 antialiased overflow-hidden select-none ${(isResizingLeft || isResizingRight) ? 'cursor-col-resize' : ''} ${isResizingTerminal ? 'cursor-row-resize' : ''}`}>
      <Header
        onOpenFileMenu={() => setIsFileMenuOpen(true)}
        onOpenEditMenu={toggleEditMenu}
        onOpenViewMenu={toggleViewMenu}
        onOpenHelpMenu={() => setIsHelpMenuOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        isEditActive={isEditMenuOpen}
        isViewActive={isViewMenuOpen}
        isHelpActive={isHelpMenuOpen}
      />

      <main className="flex-1 flex overflow-hidden relative">
        {/* Left Side: G-Code Editor & Terminal */}
        <div
          className="flex flex-col border-r border-cds-border bg-cds-bg"
          style={{ width: `${leftWidth}px` }}
        >
           <Editor
            lines={INITIAL_GCODE}
            activeLineIndex={activeLineIndex}
          />
          {/* Vertical Resizer */}
          <div
            onMouseDown={() => setIsResizingTerminal(true)}
            className={`h-1 z-30 cursor-row-resize hover:bg-cds-interactive transition-colors shrink-0 ${isResizingTerminal ? 'bg-cds-interactive' : 'bg-cds-border'}`}
          />
          <Terminal logs={logs} height={terminalHeight} />
        </div>

        {/* Resizer Left */}
        <div
          onMouseDown={() => setIsResizingLeft(true)}
          className={`w-1 z-30 cursor-col-resize hover:bg-cds-interactive transition-colors shrink-0 ${isResizingLeft ? 'bg-cds-interactive' : 'bg-transparent'}`}
        />

        {/* Middle: 3D Visualization */}
        <div className="flex-1 relative flex flex-col min-w-0">
          <Viewport
            isSimulating={status.isSimulating}
            progress={status.progress}
            coords={coords}
            lines={INITIAL_GCODE}
          />
          <AiAssistant currentGCode={INITIAL_GCODE} />
        </div>

        {/* Resizer Right */}
        <div
          onMouseDown={() => setIsResizingRight(true)}
          className={`w-1 z-30 cursor-col-resize hover:bg-cds-interactive transition-colors shrink-0 ${isResizingRight ? 'bg-cds-interactive' : 'bg-transparent'}`}
        />

        {/* Right Side: DRO & Controls */}
        <div
          className="flex flex-col border-l border-cds-border"
          style={{ width: `${rightWidth}px` }}
        >
          <Sidebar
            coords={coords}
            status={status}
            activeTool={TOOLS[0]}
            nextTool={TOOLS[1]}
            onCycleStart={handleCycleStart}
            onFeedHold={handleFeedHold}
            onReset={handleReset}
          />
        </div>

        {/* Edit Menu Sidebar Overlay */}
        {isEditMenuOpen && (
          <EditSidebar onClose={() => setIsEditMenuOpen(false)} />
        )}

        {/* View Menu Sidebar Overlay */}
        {isViewMenuOpen && (
          <ViewSidebar onClose={() => setIsViewMenuOpen(false)} />
        )}
      </main>

      {/* Carbon Shell Footer – $shell-panel-01 height = 24px */}
      <footer className="h-6 bg-cds-bg border-t border-cds-border flex items-center px-4 justify-between text-[10px] font-mono text-cds-text-04 uppercase tracking-widest shrink-0">
        <div className="flex gap-4">
          <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 bg-cds-success"></span> ENGINE: ONLINE</span>
          <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 bg-cds-interactive"></span> API: CONNECTED</span>
        </div>
        <div>BUFFER: 4096KB / LOAD: {(Math.random() * 5 + 2).toFixed(1)}%</div>
      </footer>

      {/* Overlays */}
      {isFileMenuOpen && <FileManager onClose={() => setIsFileMenuOpen(false)} />}
      {isHelpMenuOpen && <HelpManager onClose={() => setIsHelpMenuOpen(false)} />}
      {isSettingsOpen && <SettingsManager onClose={() => setIsSettingsOpen(false)} />}
    </div>
  );
};

export default App;
