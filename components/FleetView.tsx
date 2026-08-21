
import React from 'react';
import { OeeCounters } from '../types';

type FleetStatus = 'RUNNING' | 'IDLE' | 'ALARM' | 'OFFLINE';

interface FleetMachine {
  id: string;
  model: string;
  status: FleetStatus;
  job: string;
  completionPercent: number;
  detail: string;
  isThisSession?: boolean;
}

/** The rest of the shop floor -- illustrative, matching the exact machine
 * names FileManager's Workspace Catalog already assigns projects to
 * (MACHINE_01/HAAS_VF2/5_AXIS_MILL/ENDER_3), so a viewer who opens both
 * screens finds one consistent fleet, not two unrelated invented rosters. */
const OTHER_MACHINES: FleetMachine[] = [
  { id: 'HAAS_VF2',      model: 'Haas VF-2 (3-Axis Mill)',        status: 'IDLE',    job: 'BRACKET_MOUNT_L.NC',   completionPercent: 100, detail: 'Program complete -- awaiting next job' },
  { id: '5_AXIS_MILL',   model: 'DMG MORI DMU 50 (5-Axis)',       status: 'RUNNING', job: 'TURBINE_BLADE.NC',     completionPercent: 63,  detail: 'Roughing pass 4 of 6' },
  { id: 'ENDER_3',       model: 'Creality Ender 3 (FDM)',         status: 'ALARM',   job: 'CALIBRATION_CUBE.NC', completionPercent: 22,  detail: 'ALM-311: Filament runout detected' },
  { id: 'MAZAK_VTC800',  model: 'Mazak VTC-800 (VMC)',            status: 'OFFLINE', job: '--',                  completionPercent: 0,   detail: 'Scheduled maintenance -- spindle bearing service' },
];

const STATUS_STYLES: Record<FleetStatus, { dot: string; text: string; badge: string }> = {
  RUNNING: { dot: 'bg-cds-interactive animate-pulse', text: 'text-cds-interactive', badge: 'bg-cds-interactive/10 border-cds-interactive/30' },
  IDLE:    { dot: 'bg-cds-text-04',                   text: 'text-cds-text-03',     badge: 'bg-cds-layer-02/50 border-cds-border/30' },
  ALARM:   { dot: 'bg-cds-error animate-pulse',        text: 'text-cds-error',       badge: 'bg-cds-error/10 border-cds-error/30' },
  OFFLINE: { dot: 'bg-cds-text-04',                   text: 'text-cds-text-04',     badge: 'bg-black/30 border-cds-border/20' },
};

const MachineCard: React.FC<{ machine: FleetMachine }> = ({ machine }) => {
  const style = STATUS_STYLES[machine.status];
  return (
    <div className={`bg-cds-bg/60 border p-5 chamfer-md flex flex-col gap-4 relative ${machine.isThisSession ? 'border-cds-interactive/50 shadow-[0_0_20px_rgba(69,137,255,0.1)]' : 'border-cds-border/30'}`}>
      {machine.isThisSession && (
        <span className="absolute top-3 right-3 text-[8px] font-mono text-cds-interactive tracking-widest uppercase">This Session</span>
      )}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-cds-text-01 font-semibold text-body-sm tracking-wide truncate">{machine.id}</h3>
          <p className="text-cds-text-04 text-[9px] mt-0.5 font-mono uppercase tracking-tighter truncate">{machine.model}</p>
        </div>
      </div>

      <div className={`inline-flex items-center gap-2 self-start px-2 py-1 border ${style.badge}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`}></span>
        <span className={`text-[9px] font-semibold tracking-widest ${style.text}`}>{machine.status}</span>
      </div>

      <div>
        <div className="flex justify-between items-baseline mb-1">
          <span className="text-[9px] text-cds-text-04 uppercase tracking-tighter truncate">{machine.job}</span>
          <span className="text-[10px] font-mono text-cds-text-03 shrink-0 ml-2">{machine.completionPercent}%</span>
        </div>
        <div className="w-full bg-black/40 h-1 overflow-hidden">
          <div
            className={`h-full transition-all duration-500 ${machine.status === 'ALARM' ? 'bg-cds-error' : machine.status === 'OFFLINE' ? 'bg-cds-text-04' : 'bg-cds-interactive'}`}
            style={{ width: `${machine.completionPercent}%` }}
          ></div>
        </div>
      </div>

      <p className={`text-[9px] font-mono leading-relaxed ${machine.status === 'ALARM' ? 'text-cds-error' : 'text-cds-text-04'}`}>
        {machine.detail}
      </p>
    </div>
  );
};

/** m:ss for under an hour, h:mm above it -- session/downtime durations in
 * this app are realistically minutes-to-low-hours, not days. */
function formatDuration(ms: number): string {
  const totalSec = Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  if (h > 0) return `${h}h ${String(m).padStart(2, '0')}m`;
  return `${m}:${String(s).padStart(2, '0')}`;
}

const OeeTile: React.FC<{ label: string; percent: number; isHeadline?: boolean }> = ({ label, percent, isHeadline }) => {
  const color = percent >= 85 ? 'text-cds-success' : percent >= 60 ? 'text-cds-warning' : 'text-cds-error';
  return (
    <div className={`bg-black/30 border border-cds-border/30 p-4 chamfer-sm ${isHeadline ? 'border-cds-interactive/40' : ''}`}>
      <div className="text-[9px] text-cds-text-04 uppercase tracking-widest mb-1">{label}</div>
      <div className={`text-3xl font-mono font-semibold tabular-nums ${color}`}>{percent.toFixed(1)}<span className="text-lg">%</span></div>
      <div className="w-full bg-black/40 h-1 mt-2 overflow-hidden">
        <div className={`h-full transition-all duration-500 ${percent >= 85 ? 'bg-cds-success' : percent >= 60 ? 'bg-cds-warning' : 'bg-cds-error'}`} style={{ width: `${Math.min(100, Math.max(0, percent))}%` }}></div>
      </div>
    </div>
  );
};

interface FleetViewProps {
  onClose: () => void;
  /** MACHINE_01 is this session's actual simulator, so its card is built
   * from real App state instead of the static roster above. */
  liveMachine: {
    isSimulating: boolean;
    hasActiveAlarm: boolean;
    completionPercent: number;
    activeLineLabel: string;
  };
  /** OEE inputs -- all real, session-tracked App state (see App.tsx's oee/
   * sessionElapsedMs/downtimeMs). FleetView derives Availability/
   * Performance/Quality/OEE from these rather than App.tsx precomputing
   * them, so the formulas live in one place next to what displays them. */
  productionMetrics: {
    oee: OeeCounters;
    sessionElapsedMs: number;
    downtimeMs: number;
    currentFeedPct: number;
  };
}

const FleetView: React.FC<FleetViewProps> = ({ onClose, liveMachine, productionMetrics }) => {
  const liveStatus: FleetStatus = liveMachine.hasActiveAlarm ? 'ALARM' : liveMachine.isSimulating ? 'RUNNING' : 'IDLE';
  const machines: FleetMachine[] = [
    {
      id: 'MACHINE_01',
      model: 'Fanuc 0i-MF Plus (3-Axis Mill)',
      status: liveStatus,
      job: 'PROJECT_ALPHA_V2.NC',
      completionPercent: Math.round(liveMachine.completionPercent),
      detail: liveMachine.hasActiveAlarm
        ? 'Active alarm -- see System Logs for detail'
        : liveMachine.isSimulating
          ? `Executing ${liveMachine.activeLineLabel}`
          : 'Idle -- ready for CYCLE START',
      isThisSession: true,
    },
    ...OTHER_MACHINES,
  ];

  const counts = machines.reduce((acc, m) => {
    acc[m.status] = (acc[m.status] ?? 0) + 1;
    return acc;
  }, {} as Record<FleetStatus, number>);

  // OEE = Availability x Performance x Quality, the standard three-factor
  // breakdown. Under a second of session time isn't enough to divide by
  // meaningfully, so Availability reads 100% until then rather than
  // swinging on rounding noise.
  const { oee, sessionElapsedMs, downtimeMs, currentFeedPct } = productionMetrics;
  const availability = sessionElapsedMs > 1000
    ? Math.max(0, Math.min(100, ((sessionElapsedMs - downtimeMs) / sessionElapsedMs) * 100))
    : 100;
  const performance = Math.max(0, Math.min(100, currentFeedPct));
  const totalParts = oee.cyclesCompleted + oee.cyclesScrapped;
  const quality = totalParts > 0 ? (oee.cyclesCompleted / totalParts) * 100 : 100;
  const oeeScore = (availability / 100) * (performance / 100) * (quality / 100) * 100;

  return (
    <div className="fixed inset-0 bg-cds-bg/90 backdrop-blur-2xl z-[150] flex items-center justify-center p-8 animate-in fade-in duration-300">
      <div role="dialog" aria-modal="true" aria-labelledby="fleet-view-title" className="w-full h-full max-w-[1400px] bg-cds-layer-01 border border-cds-border/30 shadow-[0_0_50px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden chamfer-lg relative">

        <div className="absolute inset-0 opacity-[0.03] pointer-events-none hex-bg"></div>

        {/* Header */}
        <div className="h-16 px-8 bg-black/40 border-b border-cds-border/30 flex items-center justify-between shrink-0 z-10">
          <div className="flex items-center gap-4">
            <span className="material-symbols-outlined text-cds-interactive text-2xl" aria-hidden="true">hub</span>
            <div>
              <h1 id="fleet-view-title" className="font-display text-cds-text-01 font-semibold text-body-sm tracking-[0.3em] uppercase leading-tight">MACHINE FLEET</h1>
              <p className="text-[9px] text-cds-text-04 font-mono tracking-widest uppercase">Shop Floor // Real-Time Monitoring</p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-4 text-[9px] font-mono uppercase tracking-widest">
              <span className="flex items-center gap-1.5 text-cds-interactive"><span className="w-1.5 h-1.5 rounded-full bg-cds-interactive"></span>{counts.RUNNING ?? 0} Running</span>
              <span className="flex items-center gap-1.5 text-cds-text-03"><span className="w-1.5 h-1.5 rounded-full bg-cds-text-04"></span>{counts.IDLE ?? 0} Idle</span>
              <span className="flex items-center gap-1.5 text-cds-error"><span className="w-1.5 h-1.5 rounded-full bg-cds-error"></span>{counts.ALARM ?? 0} Alarm</span>
              <span className="flex items-center gap-1.5 text-cds-text-04"><span className="w-1.5 h-1.5 rounded-full bg-cds-text-04"></span>{counts.OFFLINE ?? 0} Offline</span>
            </div>
            <button
              onClick={onClose}
              className="size-10 flex items-center justify-center bg-white/5 hover:bg-cds-error/20 hover:text-cds-error transition-all group"
              aria-label="Close Machine Fleet"
            >
              <span className="material-symbols-outlined text-xl group-hover:rotate-90 transition-transform" aria-hidden="true">close</span>
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto p-8 z-10">
          <div className="mb-6">
            <h2 className="text-cds-text-01 font-semibold text-lg tracking-[0.1em] uppercase">{machines.length} Machines On Floor</h2>
            <p className="text-[10px] text-cds-text-03 font-mono tracking-widest uppercase mt-1">MACHINE_01 reflects this session live -- the rest is shop-floor telemetry</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {machines.map(machine => (
              <MachineCard key={machine.id} machine={machine} />
            ))}
          </div>

          {/* Production Metrics -- OEE for MACHINE_01 this session. The
              other four machines are illustrative telemetry (see
              OTHER_MACHINES above), so OEE is scoped to the one machine
              with real numbers behind it rather than faking a fleet-wide
              average. */}
          <div className="mt-10">
            <h2 className="text-cds-text-01 font-semibold text-lg tracking-[0.1em] uppercase">Production Metrics -- MACHINE_01 (This Session)</h2>
            <p className="text-[10px] text-cds-text-03 font-mono tracking-widest uppercase mt-1">
              Availability x Performance x Quality -- tracked live since this session started
            </p>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
              <OeeTile label="OEE" percent={oeeScore} isHeadline />
              <OeeTile label="Availability" percent={availability} />
              <OeeTile label="Performance" percent={performance} />
              <OeeTile label="Quality" percent={quality} />
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mt-4">
              <div className="bg-black/20 border border-cds-border/20 p-3 chamfer-sm">
                <div className="text-[8px] text-cds-text-04 uppercase tracking-widest">Session Uptime</div>
                <div className="text-body-sm font-mono text-cds-text-01 mt-1">{formatDuration(sessionElapsedMs)}</div>
              </div>
              <div className="bg-black/20 border border-cds-border/20 p-3 chamfer-sm">
                <div className="text-[8px] text-cds-text-04 uppercase tracking-widest">Alarm Downtime</div>
                <div className={`text-body-sm font-mono mt-1 ${downtimeMs > 0 ? 'text-cds-error' : 'text-cds-text-01'}`}>{formatDuration(downtimeMs)}</div>
              </div>
              <div className="bg-black/20 border border-cds-border/20 p-3 chamfer-sm">
                <div className="text-[8px] text-cds-text-04 uppercase tracking-widest">Cycles Started</div>
                <div className="text-body-sm font-mono text-cds-text-01 mt-1">{oee.cyclesStarted}</div>
              </div>
              <div className="bg-black/20 border border-cds-border/20 p-3 chamfer-sm">
                <div className="text-[8px] text-cds-text-04 uppercase tracking-widest">Parts Completed</div>
                <div className="text-body-sm font-mono text-cds-success mt-1">{oee.cyclesCompleted}</div>
              </div>
              <div className="bg-black/20 border border-cds-border/20 p-3 chamfer-sm">
                <div className="text-[8px] text-cds-text-04 uppercase tracking-widest">Parts Scrapped</div>
                <div className={`text-body-sm font-mono mt-1 ${oee.cyclesScrapped > 0 ? 'text-cds-error' : 'text-cds-text-01'}`}>{oee.cyclesScrapped}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="h-10 bg-cds-bg px-8 border-t border-cds-border/30 flex items-center justify-between text-[9px] font-mono text-cds-text-04 tracking-[0.2em] uppercase shrink-0">
          <div className="flex gap-8">
            <span className="flex items-center gap-2"><div className="w-1 h-1 bg-cds-success"></div> FLEET_LINK: OPTIMAL</span>
            <span className="flex items-center gap-2"><div className="w-1 h-1 bg-cds-interactive"></div> POLL_INTERVAL: 2.0S</span>
          </div>
          <div>MTConnect adapter v1.2 // 5 agents registered</div>
        </div>
      </div>
    </div>
  );
};

export default FleetView;
