
import React from 'react';

interface HeaderProps {
  onOpenFileMenu: () => void;
  onOpenEditMenu: () => void;
  onOpenViewMenu: () => void;
  onOpenHelpMenu: () => void;
  onOpenSettings?: () => void;
  /** Opens Help straight to the System Logs (alarm history) tab. */
  onOpenAlarms?: () => void;
  /** True when at least one alarm in history has status 'active' -- swaps
   * the notification bell's dot from the idle blue to a pulsing red. */
  hasActiveAlarm?: boolean;
  /** Opens the Machine Fleet view (the Connected tag becomes a button). */
  onOpenFleetView?: () => void;
  /** Opens the Job Queue (work order queue). */
  onOpenJobQueue?: () => void;
  /** Count of jobs still queued or active -- shown as a badge on the Job
   * Queue button so an operator can see queue depth without opening it. */
  pendingJobCount?: number;
  /** Opens the Collision/Gouge Report. */
  onOpenCollisionReport?: () => void;
  /** True when the static toolpath verification has at least one finding --
   * swaps the report button's dot from idle blue to a pulsing red, same
   * pattern as the alarm bell's hasActiveAlarm. */
  hasCollisionFindings?: boolean;
  isEditActive?: boolean;
  isViewActive?: boolean;
  isHelpActive?: boolean;
}

const Logo = () => (
  <svg width="32" height="32" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-[0_0_5px_rgba(255,255,255,0.2)]">
    <path
      d="M50 5L89.5 27.5V72.5L50 95L10.5 72.5V27.5L50 5Z"
      fill="url(#hexGradient)"
      stroke="#525252"
      strokeWidth="1"
    />
    <path d="M35 30H65L75 40V45H45L35 35V30Z" fill="white" fillOpacity="0.9" />
    <path d="M65 70H35L25 60V55H55L65 65V70Z" fill="white" fillOpacity="0.9" />
    <defs>
      <linearGradient id="hexGradient" x1="50" y1="5" x2="50" y2="95" gradientUnits="userSpaceOnUse">
        <stop stopColor="#525252" />
        <stop offset="1" stopColor="#262626" />
      </linearGradient>
    </defs>
  </svg>
);

const Header: React.FC<HeaderProps> = ({
  onOpenFileMenu,
  onOpenEditMenu,
  onOpenViewMenu,
  onOpenHelpMenu,
  onOpenSettings,
  onOpenAlarms,
  hasActiveAlarm,
  onOpenFleetView,
  onOpenJobQueue,
  pendingJobCount,
  onOpenCollisionReport,
  hasCollisionFindings,
  isEditActive,
  isViewActive,
  isHelpActive
}) => {
  const isAnyOtherTabActive = isEditActive || isViewActive || isHelpActive;
  return (
    /* Carbon Shell Header height = 48px; we keep 56px (h-14) for DRO-heavy layout */
    <header className="h-14 bg-cds-bg border-b border-cds-border flex items-center justify-between px-6 shrink-0 z-20">
      <div className="flex items-center gap-4">
        <div className="size-8 flex items-center justify-center">
          <Logo />
        </div>
        {/* $productive-heading-02 equivalent */}
        <div className="flex flex-col">
          <h1 className="font-display text-cds-text-01 text-base font-semibold tracking-wide uppercase leading-none">Super High Tech</h1>
          <span className="text-label font-mono text-cds-text-03 tracking-widest">CNC SIMULATOR v4.2</span>
        </div>
      </div>

      {/* Carbon-style Navigation Tab Bar */}
      <nav className="hidden lg:flex items-center gap-px mx-8 bg-cds-layer-01/50 p-px border border-cds-border">
        <button
          onClick={onOpenFileMenu}
          className="px-4 min-h-11 flex items-center justify-center hover:bg-white/10 text-cds-text-02 text-body-sm font-medium transition-colors"
        >
          File
        </button>
        <button
          onClick={onOpenEditMenu}
          className={`px-4 min-h-11 flex items-center justify-center text-body-sm font-medium transition-colors ${
            isEditActive
              ? 'bg-cds-interactive/20 text-cds-interactive border border-cds-interactive/30'
              : 'hover:bg-white/10 text-cds-text-02'
          }`}
        >
          Edit
        </button>
        <button
          onClick={onOpenViewMenu}
          className={`px-4 min-h-11 flex items-center justify-center text-body-sm font-medium transition-colors ${
            isViewActive
              ? 'bg-cds-interactive/20 text-cds-interactive border border-cds-interactive/30'
              : 'hover:bg-white/10 text-cds-text-02'
          }`}
        >
          View
        </button>
        {/* Default mode tab – only shown as selected when no other panel is open */}
        <button
          className={`px-4 min-h-11 flex items-center justify-center text-body-sm font-semibold transition-colors ${
            isAnyOtherTabActive
              ? 'text-cds-text-02 hover:bg-white/10'
              : 'bg-cds-interactive/20 text-cds-interactive border border-cds-interactive/30 shadow-[0_0_10px_rgba(69,137,255,0.2)]'
          }`}
        >
          Simulation
        </button>
        <button
          onClick={onOpenHelpMenu}
          className={`px-4 min-h-11 flex items-center justify-center text-body-sm font-medium transition-colors ${
            isHelpActive
              ? 'bg-cds-interactive/20 text-cds-interactive border border-cds-interactive/30'
              : 'hover:bg-white/10 text-cds-text-02'
          }`}
        >
          Help
        </button>
      </nav>

      <div className="flex items-center gap-4">
        {/* Connection tag – Carbon Tag component style. Doubles as the
            Machine Fleet entry point: this is one machine among several on
            the shop floor (see FleetView.tsx). */}
        <button
          onClick={onOpenFleetView}
          className="flex items-center gap-2 bg-cds-layer-01 hover:bg-cds-layer-02 px-3 py-1.5 border border-cds-border transition-colors"
          title="View machine fleet"
        >
          <span className="w-2 h-2 bg-cds-success animate-pulse" aria-hidden="true"></span>
          <span className="text-label text-cds-text-02 font-mono uppercase">Connected: Machine_01</span>
        </button>
        <div className="h-8 w-px bg-cds-border mx-1"></div>
        <div className="flex gap-1">
          <button
            onClick={onOpenJobQueue}
            className="size-11 flex items-center justify-center text-cds-text-03 hover:text-cds-text-01 hover:bg-white/5 transition-colors relative"
            title="Job Queue"
            aria-label={pendingJobCount ? `Job Queue, ${pendingJobCount} pending` : 'Job Queue'}
          >
            <span className="material-symbols-outlined text-[20px]" aria-hidden="true">assignment</span>
            {!!pendingJobCount && (
              <span
                className="absolute top-1.5 right-1.5 min-w-[14px] h-[14px] px-0.5 flex items-center justify-center bg-cds-interactive text-white text-[8px] font-mono font-semibold leading-none"
                aria-hidden="true"
              >
                {pendingJobCount}
              </span>
            )}
          </button>
          <button
            onClick={onOpenCollisionReport}
            className="size-11 flex items-center justify-center text-cds-text-03 hover:text-cds-text-01 hover:bg-white/5 transition-colors relative"
            title={hasCollisionFindings ? 'Collision/Gouge Report -- issues found' : 'Collision/Gouge Report'}
            aria-label={hasCollisionFindings ? 'Collision/Gouge Report, issues found' : 'Collision/Gouge Report, clear'}
          >
            <span className="material-symbols-outlined text-[20px]" aria-hidden="true">fact_check</span>
            <span
              className={`absolute top-2.5 right-2.5 w-1.5 h-1.5 ${hasCollisionFindings ? 'bg-cds-error animate-pulse' : 'bg-cds-interactive'}`}
              aria-hidden="true"
            ></span>
          </button>
          <button
            onClick={onOpenAlarms}
            className="size-11 flex items-center justify-center text-cds-text-03 hover:text-cds-text-01 hover:bg-white/5 transition-colors relative"
            title={hasActiveAlarm ? 'Active alarm -- open System Logs' : 'Notifications'}
            aria-label={hasActiveAlarm ? 'Active alarm, open System Logs' : 'Notifications'}
          >
            <span className="material-symbols-outlined text-[20px]" aria-hidden="true">notifications</span>
            <span
              className={`absolute top-2.5 right-2.5 w-1.5 h-1.5 ${hasActiveAlarm ? 'bg-cds-error animate-pulse' : 'bg-cds-interactive'}`}
              aria-hidden="true"
            ></span>
          </button>
          <button
            onClick={onOpenSettings}
            className="size-11 flex items-center justify-center text-cds-text-03 hover:text-cds-text-01 hover:bg-white/5 transition-colors"
            title="System Configuration"
            aria-label="System configuration"
          >
            <span className="material-symbols-outlined text-[20px]" aria-hidden="true">settings</span>
          </button>
          <div
            className="w-8 h-8 bg-cover bg-center border border-cds-border ml-2 cursor-pointer bg-cds-layer-01"
            title="User Profile"
            style={{ backgroundImage: `url('https://picsum.photos/seed/cnc-user/64/64')` }}
          ></div>
        </div>
      </div>
    </header>
  );
};

export default Header;
