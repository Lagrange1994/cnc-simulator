
import React from 'react';

interface HeaderProps {
  onOpenFileMenu: () => void;
  onOpenEditMenu: () => void;
  onOpenViewMenu: () => void;
  onOpenHelpMenu: () => void;
  onOpenSettings?: () => void;
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
  isEditActive,
  isViewActive,
  isHelpActive
}) => {
  return (
    /* Carbon Shell Header height = 48px; we keep 56px (h-14) for DRO-heavy layout */
    <header className="h-14 bg-cds-bg border-b border-cds-border flex items-center justify-between px-6 shrink-0 z-20">
      <div className="flex items-center gap-4">
        <div className="size-8 flex items-center justify-center">
          <Logo />
        </div>
        {/* $productive-heading-02 equivalent */}
        <div className="flex flex-col">
          <h1 className="text-cds-text-01 text-base font-semibold tracking-wide uppercase leading-none">Super High Tech</h1>
          <span className="text-label font-mono text-cds-text-03 tracking-widest">CNC SIMULATOR v4.2</span>
        </div>
      </div>

      {/* Carbon-style Navigation Tab Bar */}
      <nav className="hidden lg:flex items-center gap-px mx-8 bg-cds-layer-01/50 p-px border border-cds-border">
        <button
          onClick={onOpenFileMenu}
          className="px-4 py-1.5 hover:bg-white/10 text-cds-text-02 text-body-sm font-medium transition-colors"
        >
          File
        </button>
        <button
          onClick={onOpenEditMenu}
          className={`px-4 py-1.5 text-body-sm font-medium transition-colors ${
            isEditActive
              ? 'bg-cds-interactive/20 text-cds-interactive border border-cds-interactive/30'
              : 'hover:bg-white/10 text-cds-text-02'
          }`}
        >
          Edit
        </button>
        <button
          onClick={onOpenViewMenu}
          className={`px-4 py-1.5 text-body-sm font-medium transition-colors ${
            isViewActive
              ? 'bg-cds-interactive/20 text-cds-interactive border border-cds-interactive/30'
              : 'hover:bg-white/10 text-cds-text-02'
          }`}
        >
          View
        </button>
        {/* Active / selected tab – Carbon $interactive fill */}
        <button className="px-4 py-1.5 bg-cds-interactive/20 text-cds-interactive border border-cds-interactive/30 text-body-sm font-semibold shadow-[0_0_10px_rgba(69,137,255,0.2)]">
          Simulation
        </button>
        <button
          onClick={onOpenHelpMenu}
          className={`px-4 py-1.5 text-body-sm font-medium transition-colors ${
            isHelpActive
              ? 'bg-cds-interactive/20 text-cds-interactive border border-cds-interactive/30'
              : 'hover:bg-white/10 text-cds-text-02'
          }`}
        >
          Help
        </button>
      </nav>

      <div className="flex items-center gap-4">
        {/* Connection tag – Carbon Tag component style */}
        <div className="flex items-center gap-2 bg-cds-layer-01 px-3 py-1.5 border border-cds-border">
          <span className="w-2 h-2 bg-cds-success animate-pulse"></span>
          <span className="text-label text-cds-text-02 font-mono uppercase">Connected: Machine_01</span>
        </div>
        <div className="h-8 w-px bg-cds-border mx-1"></div>
        <div className="flex gap-1">
          <button className="p-2 text-cds-text-03 hover:text-cds-text-01 hover:bg-white/5 transition-colors relative">
            <span className="material-symbols-outlined text-[20px]">notifications</span>
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-cds-interactive"></span>
          </button>
          <button
            onClick={onOpenSettings}
            className="p-2 text-cds-text-03 hover:text-cds-text-01 hover:bg-white/5 transition-colors"
            title="System Configuration"
          >
            <span className="material-symbols-outlined text-[20px]">settings</span>
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
