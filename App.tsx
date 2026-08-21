
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
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
import SimulationLoadingModal from './components/SimulationLoadingModal';
import FleetView from './components/FleetView';
import JobQueue from './components/JobQueue';
import CollisionReport from './components/CollisionReport';
import { Coordinates, MachineStatus, LogMessage, ViewSettings, CuttingParams, Overrides, WcsId, WcsOffsets, Alarm, Tool, ExecutionModifiers, OeeCounters, Job } from './types';
import { INITIAL_GCODE, TOOLS, DEFAULT_VIEW_SETTINGS, DEFAULT_CUTTING_PARAMS, DEFAULT_OVERRIDES, DEFAULT_ACTIVE_WCS, DEFAULT_WCS_OFFSETS, DEFAULT_EXECUTION_MODIFIERS, DEFAULT_JOB_QUEUE } from './constants';
import { computeGCodeTimeline, findActiveEntry, summarizeProgram } from './lib/gcode/parser';
import { analyzeCollisionRisk } from './lib/gcode/collisionCheck';
import { getMaterial, parseToolDiameterMm, estimateRpm } from './lib/machine/materials';
import { MACHINE_SPEC } from './lib/machine/spec';

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
  // Which HelpManager tab to land on next open -- lets the alarm bell deep
  // link straight to System Logs instead of the default G-Code Dictionary.
  const [helpInitialTab, setHelpInitialTab] = useState('G-Code Dictionary');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isFleetViewOpen, setIsFleetViewOpen] = useState(false);
  const [isJobQueueOpen, setIsJobQueueOpen] = useState(false);
  const [isCollisionReportOpen, setIsCollisionReportOpen] = useState(false);
  const [viewSettings, setViewSettings] = useState<ViewSettings>(DEFAULT_VIEW_SETTINGS);
  const updateViewSettings = useCallback((patch: Partial<ViewSettings>) => {
    setViewSettings(prev => ({ ...prev, ...patch }));
  }, []);
  const [cuttingParams, setCuttingParams] = useState<CuttingParams>(DEFAULT_CUTTING_PARAMS);
  const updateCuttingParams = useCallback((patch: Partial<CuttingParams>) => {
    setCuttingParams(prev => ({ ...prev, ...patch }));
  }, []);
  // Feed/Spindle override dials -- unlike cuttingParams these are meant to be
  // ridden live during a cut, so nothing disables them while isSimulating.
  const [overrides, setOverrides] = useState<Overrides>(DEFAULT_OVERRIDES);
  const updateOverrides = useCallback((patch: Partial<Overrides>) => {
    setOverrides(prev => ({ ...prev, ...patch }));
  }, []);
  // Work Coordinate System: `coords` (above) is raw machine position: the
  // DRO shows machine position minus the active WCS's offset ("work
  // position"), same relationship a real control's DRO has to its offset
  // table. zeroAxis mirrors the real touch-off workflow -- jog to the part,
  // hit Zero X, and the current machine position becomes that axis's offset
  // so the DRO reads exactly 0 for it from then on.
  const [activeWcsId, setActiveWcsId] = useState<WcsId>(DEFAULT_ACTIVE_WCS);
  const [wcsOffsets, setWcsOffsets] = useState<WcsOffsets>(DEFAULT_WCS_OFFSETS);
  // Alarm/Fault History -- structured, persistent record of conditions that
  // exceeded a machine limit, separate from the Console Output line-by-line
  // log. Raised/cleared by the effect below; see HelpManager's System Logs
  // tab for the full history and Header's alarm bell for the live indicator.
  const [alarms, setAlarms] = useState<Alarm[]>([]);
  // Tool library / offset table (EditSidebar.tsx): geometry offsets (H/D)
  // and life counters are editable and live here, separate from a tool's
  // fixed nominal diameter/length -- the same split a real control keeps
  // between "how the tool is built" and "what the offset screen says".
  const [tools, setTools] = useState<Tool[]>(TOOLS);
  const updateTool = useCallback((id: string, patch: Partial<Tool>) => {
    setTools(prev => prev.map(t => t.id === id ? { ...t, ...patch } : t));
  }, []);
  // Program execution modifiers (Editor.tsx toggle strip). singleBlock and
  // optionalStop are read live by the pacing effect's interval closure and
  // don't reshape the timeline, so they stay togglable mid-cut (see their
  // dependency-array entries below, same reasoning as overrides.feedPct).
  // dryRun/blockSkip change gcodeTimeline's shape instead, so Editor.tsx
  // locks those two while simulating.
  const [execModifiers, setExecModifiers] = useState<ExecutionModifiers>(DEFAULT_EXECUTION_MODIFIERS);
  const updateExecModifiers = useCallback((patch: Partial<ExecutionModifiers>) => {
    setExecModifiers(prev => ({ ...prev, ...patch }));
  }, []);
  // OEE (FleetView.tsx "Production Metrics"): cyclesStarted/Completed/
  // Scrapped are incremented at their real trigger points below (fresh
  // CYCLE START, program completion, RESET mid-run). sessionElapsedMs
  // ticks every second (effect further down); downtime is derived from
  // `alarms` itself (see the memo further down), not tracked separately.
  const [oee, setOee] = useState<OeeCounters>({ cyclesStarted: 0, cyclesCompleted: 0, cyclesScrapped: 0 });
  const sessionStartRef = useRef(Date.now());
  const [sessionElapsedMs, setSessionElapsedMs] = useState(0);
  // Job Queue (JobQueue.tsx): work orders queued behind the one loaded
  // program. recordJobOutcome is a pure functional setState updater (no
  // addLog call inside it, unlike the alarm effect above) so it's safe to
  // call directly from the completion branch and handleReset below without
  // the impure-updater duplicate-log risk documented on the alarm effect.
  const [jobQueue, setJobQueue] = useState<Job[]>(DEFAULT_JOB_QUEUE);
  const recordJobOutcome = useCallback((outcome: 'completed' | 'scrapped') => {
    setJobQueue(prev => {
      const activeIdx = prev.findIndex(j => j.status === 'active');
      if (activeIdx === -1) return prev;
      const job = prev[activeIdx];
      const completedQty = outcome === 'completed' ? job.completedQty + 1 : job.completedQty;
      const scrappedQty = outcome === 'scrapped' ? job.scrappedQty + 1 : job.scrappedQty;
      const isDone = completedQty + scrappedQty >= job.quantity;
      const next = [...prev];
      next[activeIdx] = { ...job, completedQty, scrappedQty, status: isDone ? 'done' : 'active' };
      if (isDone) {
        const nextQueuedIdx = next.findIndex((j, i) => i !== activeIdx && j.status === 'queued');
        if (nextQueuedIdx !== -1) next[nextQueuedIdx] = { ...next[nextQueuedIdx], status: 'active' };
      }
      return next;
    });
  }, []);
  const addJob = useCallback((partName: string, quantity: number) => {
    setJobQueue(prev => {
      const newJob: Job = {
        id: Math.random().toString(36).substr(2, 9),
        partName,
        programName: 'PROJECT_ALPHA_V2.NC',
        quantity,
        completedQty: 0,
        scrappedQty: 0,
        status: prev.some(j => j.status === 'active') ? 'queued' : 'active',
      };
      return [...prev, newJob];
    });
  }, []);
  const removeJob = useCallback((id: string) => {
    // Active job can't be removed via this action (it's on the machine right
    // now) -- JobQueue.tsx also disables the button, this is defense-in-depth.
    setJobQueue(prev => prev.filter(j => !(j.id === id && j.status !== 'active')));
  }, []);
  const skipJob = useCallback((id: string) => {
    setJobQueue(prev => {
      const idx = prev.findIndex(j => j.id === id);
      if (idx === -1) return prev;
      const job = prev[idx];
      if (job.status === 'done' || job.status === 'skipped') return prev;
      const wasActive = job.status === 'active';
      const next = [...prev];
      next[idx] = { ...job, status: 'skipped' };
      if (wasActive) {
        const nextQueuedIdx = next.findIndex((j, i) => i !== idx && j.status === 'queued');
        if (nextQueuedIdx !== -1) next[nextQueuedIdx] = { ...next[nextQueuedIdx], status: 'active' };
      }
      return next;
    });
  }, []);
  // The ~1.5s "computing" theater between CYCLE START and the real
  // simulation starting (SimulationLoadingModal). Its message-sequencing
  // timer is self-contained in the modal; only this open/closed boolean is
  // lifted here, so it can join isFullScreenModalOpen below.
  const [isCycleLoadingOpen, setIsCycleLoadingOpen] = useState(false);
  // FileManager/HelpManager/SettingsManager each mount their own <h1> as a
  // local document root; hide the app shell's <h1> (in Header) and the rest
  // of the shell behind them so screen readers see one active H1 at a time.
  // The cycle-loading modal joins this set too: it's a transient overlay,
  // not a document root, but the background shell should stay just as inert.
  const isFullScreenModalOpen = isFileMenuOpen || isHelpMenuOpen || isSettingsOpen || isFleetViewOpen || isJobQueueOpen || isCollisionReportOpen || isCycleLoadingOpen;
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

  const zeroWcsAxis = useCallback((axis: keyof Coordinates) => {
    setWcsOffsets(prev => ({
      ...prev,
      [activeWcsId]: { ...prev[activeWcsId], [axis]: coords[axis] },
    }));
    addLog(`${activeWcsId} ${axis.toUpperCase()} zeroed at current position.`, 'info');
  }, [activeWcsId, coords, addLog]);

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

  // G-code timeline. Feed rate (F-word) drives each motion line's duration,
  // so a G01 F100 move actually takes longer to animate than the same
  // distance at F5000. Recomputes when dryRun/blockSkip change (they alter
  // the timeline's shape); Editor.tsx locks both while simulating, so this
  // never reshapes the timeline out from under an in-progress run.
  const gcodeTimeline = useMemo(
    () => computeGCodeTimeline(INITIAL_GCODE, { x: 0, y: 0, z: 10 }, 1200, 30000, {
      dryRun: execModifiers.dryRun,
      skipFlaggedBlocks: execModifiers.blockSkip,
    }),
    [execModifiers.dryRun, execModifiers.blockSkip]
  );

  const programSummary = useMemo(
    () => summarizeProgram(INITIAL_GCODE, { x: 0, y: 0, z: 10 }, 1200),
    []
  );

  // Collision/Gouge Report (CollisionReport.tsx): static verification of the
  // fixed program against the active tool's live geometry -- recomputes
  // whenever `tools` changes, since that's the only thing (Tool Offset
  // Table: diameter offset, life count) that can actually move a finding.
  const collisionReport = useMemo(
    () => analyzeCollisionRisk(INITIAL_GCODE, { x: 0, y: 0, z: 10 }, tools[0]),
    [tools]
  );

  // Movement Logic
  const lastLineIndexRef = useRef(status.activeLineIndex);

  useEffect(() => {
    if (!status.isSimulating) return;

    // Sync the ref to wherever the program actually is (handles Feed Hold ->
    // Cycle Start resuming mid-program, not just a fresh start).
    lastLineIndexRef.current = status.activeLineIndex;

    // The Feed Override dial scales real-time playback speed, exactly like
    // riding the feed override on a real control changes how fast the axes
    // actually move. `speedFactor` > 1 plays faster than programmed, < 1
    // slower. Floored at 1% (not 0) so a dial dragged to 0% goes crawling-
    // slow instead of dividing by zero below.
    const speedFactor = Math.max(overrides.feedPct, 1) / 100;

    // Recompute the start time from current progress so Feed Hold -> Cycle
    // Start (and dragging the override mid-cut, which also re-enters this
    // effect via the overrides.feedPct dependency) resumes mid-program at
    // the new pace instead of restarting the clock.
    const nominalElapsedAtStart = (status.progress / 100) * gcodeTimeline.totalDurationMs;
    const startedAt = Date.now() - nominalElapsedAtStart / speedFactor;

    // Applies every timeline entry from just after the last-seen line
    // through targetIndex (inclusive), not just whichever entry the clock
    // currently lands in. A backgrounded/throttled tab can make setInterval
    // fire as rarely as once a second, jumping `elapsed` past several line
    // windows (150-300ms each) in one tick — without this catch-up, a
    // skipped line's S-word (spindle RPM) or final coordinates would never
    // be applied, silently desyncing the displayed machine state from the
    // program's actual position.
    const applyThrough = (targetIndex: number) => {
      let latestSpindle: number | undefined;
      let hitOptionalStop = false;
      for (let i = lastLineIndexRef.current + 1; i <= targetIndex; i++) {
        const e = gcodeTimeline.entries[i];
        if (e.skipped) {
          addLog(`Block Skip: line ${e.line.lineNum} (${e.line.command}) bypassed.`);
        } else {
          addLog(`Executing line ${e.line.lineNum}: ${e.line.command} ${e.line.params || ''}`);
          if (e.spindleRpm !== undefined) latestSpindle = e.spindleRpm;
          if (e.line.command === 'M01') hitOptionalStop = true;
        }
      }
      const finalEntry = gcodeTimeline.entries[targetIndex];
      lastLineIndexRef.current = targetIndex;
      setCoords(finalEntry.coords);
      return { feedRate: finalEntry.feedRate, spindleRpm: latestSpindle, hitOptionalStop };
    };

    const interval = setInterval(() => {
      // Wall-clock time scaled back into the timeline's own nominal units
      // (the units gcodeTimeline's entry timestamps and totalDurationMs are
      // already expressed in) -- findActiveEntry and the completion check
      // below both expect nominal time, not raw wall-clock elapsed.
      const nominalElapsed = (Date.now() - startedAt) * speedFactor;

      if (nominalElapsed >= gcodeTimeline.totalDurationMs) {
        clearInterval(interval);
        const lastIndex = gcodeTimeline.entries.length - 1;
        const { feedRate, spindleRpm } = applyThrough(lastIndex);
        addLog("Program execution complete.", "success");
        setOee(prev => ({ ...prev, cyclesCompleted: prev.cyclesCompleted + 1 }));
        recordJobOutcome('completed');
        setStatus(prev => ({
          ...prev,
          isSimulating: false,
          progress: 100,
          activeLineIndex: lastIndex,
          feedRate,
          spindleRpm: spindleRpm !== undefined ? spindleRpm : prev.spindleRpm,
        }));
        return;
      }

      const entry = findActiveEntry(gcodeTimeline, nominalElapsed);
      const nextProgress = Math.round((nominalElapsed / gcodeTimeline.totalDurationMs) * 1000) / 10;
      const lineChanged = entry.index !== lastLineIndexRef.current;

      if (lineChanged) {
        const { feedRate, spindleRpm, hitOptionalStop } = applyThrough(entry.index);
        // Single Block pauses after every line; Optional Stop only pauses on
        // an M01 the timeline just crossed. Both reuse the exact resume
        // mechanism Feed Hold -> Cycle Start already relies on (startedAt is
        // recomputed from status.progress above), so the next CYCLE START
        // click steps to just the next line rather than restarting.
        const autoPauseReason = execModifiers.singleBlock
          ? `Single Block: paused after line ${entry.line.lineNum}.`
          : (execModifiers.optionalStop && hitOptionalStop)
            ? `Optional Stop (M01) at line ${entry.line.lineNum}.`
            : null;

        setStatus(prev => ({
          ...prev,
          isSimulating: autoPauseReason ? false : prev.isSimulating,
          progress: nextProgress,
          activeLineIndex: entry.index,
          feedRate,
          spindleRpm: spindleRpm !== undefined ? spindleRpm : prev.spindleRpm,
        }));

        if (autoPauseReason) {
          clearInterval(interval);
          addLog(autoPauseReason, 'warn');
        }
      } else {
        setStatus(prev => ({ ...prev, progress: nextProgress }));
      }
    }, 100);

    return () => clearInterval(interval);
  }, [status.isSimulating, gcodeTimeline, addLog, overrides.feedPct, execModifiers.singleBlock, execModifiers.optionalStop, recordJobOutcome]);

  useEffect(() => {
    setActiveLineIndex(status.activeLineIndex);
  }, [status.activeLineIndex]);

  // Alarm/Fault monitoring: watches the same override-scaled Spindle value
  // the Status card displays (Sidebar.tsx computes the identical formula)
  // against the machine's rated max. This is a real, reachable condition,
  // not a decorative what-if: the default Cutting Parameters (Aluminum,
  // midpoint Vc) already recommend ~15,915 RPM for a 6mm tool, above
  // MACHINE_SPEC.maxSpindleRpm (12,000) -- so the alarm trips the instant
  // CYCLE START seeds that RPM, then clears itself once the G-code's own
  // M03 S12000 (exactly at the limit) takes over a couple seconds in.
  // (Feed has an equivalent rated max, but no reachable combination of
  // material feed-rate presets and the 0-150% override range can actually
  // exceed it today, so a feed-overspeed watcher would never fire -- add
  // one back if a future material/program preset makes it reachable.)
  useEffect(() => {
    const effectiveSpindleRpm = status.spindleRpm * overrides.spindlePct / 100;

    const conditions: { kind: string; code: string; message: string; tripped: boolean }[] = [
      {
        kind: 'spindle-overspeed',
        code: 'ALM-204',
        message: `Spindle speed ${Math.round(effectiveSpindleRpm).toLocaleString()} RPM exceeds rated maximum (${MACHINE_SPEC.maxSpindleRpm.toLocaleString()} RPM).`,
        tripped: effectiveSpindleRpm > MACHINE_SPEC.maxSpindleRpm,
      },
    ];

    // Compute the transition (and any log lines it needs) from the current
    // `alarms` value *before* touching state -- calling addLog from inside a
    // setAlarms updater is exactly the impure-updater pattern that produces
    // duplicate log lines under React.StrictMode's double-invoke (see the
    // regression test "logs each executed line exactly once" above, which
    // exists for the same reason on the movement effect).
    let next = alarms;
    const sideEffectLogs: { text: string; level: LogMessage['level'] }[] = [];

    for (const c of conditions) {
      const active = next.find(a => a.kind === c.kind && a.status === 'active');
      if (c.tripped && !active) {
        const now = Date.now();
        const alarm: Alarm = {
          id: Math.random().toString(36).substr(2, 9),
          kind: c.kind,
          code: c.code,
          message: c.message,
          severity: 'critical',
          status: 'active',
          raisedAt: new Date(now).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          raisedAtMs: now,
        };
        next = [alarm, ...next];
        sideEffectLogs.push({ text: `${c.code}: ${c.message}`, level: 'error' });
      } else if (!c.tripped && active) {
        const now = Date.now();
        next = next.map(a => a.id === active.id
          ? { ...a, status: 'cleared' as const, clearedAt: new Date(now).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }), clearedAtMs: now }
          : a
        );
        sideEffectLogs.push({ text: `${c.code} cleared.`, level: 'success' });
      }
    }

    // Nothing changed -- most renders (e.g. plain progress ticks), skip the
    // setState so this doesn't re-run itself on every one of those.
    if (sideEffectLogs.length === 0) return;

    setAlarms(next);
    sideEffectLogs.forEach(({ text, level }) => addLog(text, level));
  }, [status.spindleRpm, overrides.spindlePct, alarms, addLog]);

  const hasActiveAlarm = alarms.some(a => a.status === 'active');

  // OEE Availability clock: ticks the session-elapsed display every second.
  // Runs for the app's whole lifetime (mount to unmount), independent of
  // whether anything is simulating.
  useEffect(() => {
    const tick = setInterval(() => {
      setSessionElapsedMs(Date.now() - sessionStartRef.current);
    }, 1000);
    return () => clearInterval(tick);
  }, []);

  // OEE downtime: only alarm-active time counts as unplanned downtime (not
  // every Feed Hold or Single-Block pause, which are deliberate operator
  // control, not a fault). Derived from `alarms` itself -- each alarm's own
  // raisedAtMs/clearedAtMs already record exactly this -- rather than a
  // second start/stop timer racing to track the same transition; an
  // in-progress alarm (no clearedAtMs yet) counts through "now". Recomputes
  // every session tick too, so an ongoing alarm's downtime keeps advancing
  // between alarm state changes, not just at raise/clear.
  const downtimeMs = useMemo(
    () => alarms.reduce((sum, a) => sum + ((a.clearedAtMs ?? Date.now()) - a.raisedAtMs), 0),
    [alarms, sessionElapsedMs]
  );

  const openHelpMenu = useCallback((tab: string = 'G-Code Dictionary') => {
    setHelpInitialTab(tab);
    setIsHelpMenuOpen(true);
  }, []);

  const handleCycleStart = useCallback(() => {
    // A "cycle" is a fresh part, not every button press: Feed Hold/Single
    // Block/Optional Stop all leave progress strictly between 0 and 100,
    // and clicking CYCLE START then just resumes the same part -- only
    // count it toward OEE when it's genuinely starting one from scratch.
    const isFreshStart = status.progress <= 0 || status.progress >= 100;
    if (status.progress >= 100) {
      handleReset();
    }
    if (isFreshStart) {
      setOee(prev => ({ ...prev, cyclesStarted: prev.cyclesStarted + 1 }));
    }
    // Seed the initial spindle RPM/feed from the selected Cutting Parameters
    // (material -> Vc -> RPM via the real formula, see lib/machine/materials.ts)
    // instead of a hardcoded value, so the Status card matches whatever the
    // Cutting Parameters panel just showed. The G-code's own S/F-words still
    // take over once the timeline reaches a line that sets them.
    const toolDiameterMm = parseToolDiameterMm(tools[0].diameter);
    const rpm = estimateRpm(cuttingParams.vcMPerMin, toolDiameterMm);
    setStatus(prev => ({ ...prev, isSimulating: true, spindleRpm: rpm, feedRate: cuttingParams.feedMmPerMin, coolant: true }));
    addLog("Cycle Start command received. Spindle spinning up...", "info");
    addLog("Homing sequence bypassed. Initializing path execution.", "warn");
  }, [status.progress, addLog, cuttingParams, tools]);

  // CYCLE START goes through the fake-computing modal first; the modal's
  // onComplete is what actually calls handleCycleStart.
  const handleCycleStartClick = useCallback(() => {
    setIsCycleLoadingOpen(true);
  }, []);

  const handleCycleLoadingComplete = useCallback(() => {
    setIsCycleLoadingOpen(false);
    handleCycleStart();
  }, [handleCycleStart]);

  const handleFeedHold = useCallback(() => {
    setStatus(prev => ({ ...prev, isSimulating: false }));
    addLog("Feed Hold active. Axis motion suspended.", "warn");
  }, [addLog]);

  const handleReset = useCallback(() => {
    // Resetting a part that's strictly mid-run (not idle, not already
    // finished) throws away real progress -- an aborted/scrapped part for
    // OEE Quality. Resetting an idle or already-complete program isn't.
    if (status.progress > 0 && status.progress < 100) {
      setOee(prev => ({ ...prev, cyclesScrapped: prev.cyclesScrapped + 1 }));
      recordJobOutcome('scrapped');
    }
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
  }, [addLog, status.progress, recordJobOutcome]);

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
      {/* When a full-screen modal (File/Help/Settings) is open, hide the app
          shell from the accessibility tree — it nests its own <h1>, which
          would otherwise sit active behind the modal's <h1>. `className="contents"`
          keeps this wrapper out of the flex layout. */}
      <div className="contents" aria-hidden={isFullScreenModalOpen} inert={isFullScreenModalOpen}>
      <Header
        onOpenFileMenu={() => setIsFileMenuOpen(true)}
        onOpenEditMenu={toggleEditMenu}
        onOpenViewMenu={toggleViewMenu}
        onOpenHelpMenu={() => openHelpMenu()}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenAlarms={() => openHelpMenu('System Logs')}
        hasActiveAlarm={hasActiveAlarm}
        onOpenFleetView={() => setIsFleetViewOpen(true)}
        onOpenJobQueue={() => setIsJobQueueOpen(true)}
        pendingJobCount={jobQueue.filter(j => j.status === 'active' || j.status === 'queued').length}
        onOpenCollisionReport={() => setIsCollisionReportOpen(true)}
        hasCollisionFindings={collisionReport.findings.length > 0}
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
            execModifiers={execModifiers}
            onExecModifiersChange={updateExecModifiers}
            isCuttingLocked={status.isSimulating || isCycleLoadingOpen}
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
            totalDurationMs={programSummary.totalDurationMs}
            viewSettings={viewSettings}
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
            activeTool={tools[0]}
            nextTool={tools[1]}
            programSummary={programSummary}
            onCycleStart={handleCycleStartClick}
            onFeedHold={handleFeedHold}
            onReset={handleReset}
            cuttingParams={cuttingParams}
            onCuttingParamsChange={updateCuttingParams}
            overrides={overrides}
            onOverridesChange={updateOverrides}
            activeWcsId={activeWcsId}
            onActiveWcsIdChange={setActiveWcsId}
            wcsOffset={wcsOffsets[activeWcsId]}
            onZeroAxis={zeroWcsAxis}
            isPreparingCycle={isCycleLoadingOpen}
          />
        </div>

        {/* Edit Menu Sidebar Overlay */}
        {isEditMenuOpen && (
          <EditSidebar onClose={() => setIsEditMenuOpen(false)} tools={tools} onUpdateTool={updateTool} />
        )}

        {/* View Menu Sidebar Overlay */}
        {isViewMenuOpen && (
          <ViewSidebar
            onClose={() => setIsViewMenuOpen(false)}
            settings={viewSettings}
            onSettingsChange={updateViewSettings}
          />
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
      </div>

      {/* Overlays */}
      {isFileMenuOpen && <FileManager onClose={() => setIsFileMenuOpen(false)} />}
      {isHelpMenuOpen && <HelpManager onClose={() => setIsHelpMenuOpen(false)} alarms={alarms} initialTab={helpInitialTab} />}
      {isSettingsOpen && <SettingsManager onClose={() => setIsSettingsOpen(false)} />}
      {isFleetViewOpen && (
        <FleetView
          onClose={() => setIsFleetViewOpen(false)}
          liveMachine={{
            isSimulating: status.isSimulating,
            hasActiveAlarm,
            completionPercent: status.progress,
            activeLineLabel: `line ${INITIAL_GCODE[status.activeLineIndex]?.lineNum ?? '001'} (${INITIAL_GCODE[status.activeLineIndex]?.command ?? 'G21'})`,
          }}
          productionMetrics={{
            oee,
            sessionElapsedMs,
            downtimeMs,
            currentFeedPct: overrides.feedPct,
          }}
        />
      )}
      {isJobQueueOpen && (
        <JobQueue
          onClose={() => setIsJobQueueOpen(false)}
          jobs={jobQueue}
          cycleTimeMs={programSummary.totalDurationMs}
          activeUnitProgressPercent={status.progress}
          onAddJob={addJob}
          onRemoveJob={removeJob}
          onSkipJob={skipJob}
        />
      )}
      {isCollisionReportOpen && (
        <CollisionReport
          onClose={() => setIsCollisionReportOpen(false)}
          report={collisionReport}
          activeTool={tools[0]}
        />
      )}
      <SimulationLoadingModal isOpen={isCycleLoadingOpen} onComplete={handleCycleLoadingComplete} />
    </div>
  );
};

export default App;
