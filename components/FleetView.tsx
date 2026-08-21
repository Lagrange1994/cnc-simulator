
import React from 'react';

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
}

const FleetView: React.FC<FleetViewProps> = ({ onClose, liveMachine }) => {
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
