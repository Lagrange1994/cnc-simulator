
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
    {/* Hexagon Background */}
    <path 
      d="M50 5L89.5 27.5V72.5L50 95L10.5 72.5V27.5L50 5Z" 
      fill="url(#hexGradient)" 
      stroke="#444" 
      strokeWidth="1"
    />
    {/* Stylized Internal Shape */}
    <path 
      d="M35 30H65L75 40V45H45L35 35V30Z" 
      fill="white" 
      fillOpacity="0.9"
    />
    <path 
      d="M65 70H35L25 60V55H55L65 65V70Z" 
      fill="white" 
      fillOpacity="0.9"
    />
    <defs>
      <linearGradient id="hexGradient" x1="50" y1="5" x2="50" y2="95" gradientUnits="userSpaceOnUse">
        <stop stopColor="#666666" />
        <stop offset="1" stopColor="#222222" />
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
    <header className="h-14 bg-[#101010] border-b border-[#404040] flex items-center justify-between px-6 shrink-0 z-20">
      <div className="flex items-center gap-4">
        <div className="size-8 flex items-center justify-center">
          <Logo />
        </div>
        <div className="flex flex-col">
          <h1 className="text-white text-base font-bold tracking-wide uppercase leading-none">Super High Tech</h1>
          <span className="text-xs text-gray-400 font-mono tracking-widest">CNC SIMULATOR v4.2</span>
        </div>
      </div>

      <nav className="hidden lg:flex items-center gap-1 mx-8 bg-[#2B2B2B]/50 p-1 border border-[#404040]">
        <button 
          onClick={onOpenFileMenu}
          className="px-4 py-1.5 hover:bg-white/10 text-gray-300 text-sm font-medium transition-colors"
        >
          File
        </button>
        <button 
          onClick={onOpenEditMenu}
          className={`px-4 py-1.5 text-sm font-medium transition-colors ${isEditActive ? 'bg-[#1791cf]/20 text-[#1791cf] border border-[#1791cf]/30' : 'hover:bg-white/10 text-gray-300'}`}
        >
          Edit
        </button>
        <button 
          onClick={onOpenViewMenu}
          className={`px-4 py-1.5 text-sm font-medium transition-colors ${isViewActive ? 'bg-[#1791cf]/20 text-[#1791cf] border border-[#1791cf]/30' : 'hover:bg-white/10 text-gray-300'}`}
        >
          View
        </button>
        <button className="px-4 py-1.5 bg-[#1791cf]/20 text-[#1791cf] border border-[#1791cf]/30 text-sm font-bold shadow-[0_0_10px_rgba(23,145,207,0.2)]">Simulation</button>
        <button 
          onClick={onOpenHelpMenu}
          className={`px-4 py-1.5 text-sm font-medium transition-colors ${isHelpActive ? 'bg-[#1791cf]/20 text-[#1791cf] border border-[#1791cf]/30' : 'hover:bg-white/10 text-gray-300'}`}
        >
          Help
        </button>
      </nav>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 bg-[#1A1A1A] px-3 py-1.5 border border-[#404040]">
          <span className="w-2 h-2 bg-green-500 animate-pulse"></span>
          <span className="text-xs text-gray-300 font-mono uppercase">Connected: Machine_01</span>
        </div>
        <div className="h-8 w-[1px] bg-[#404040] mx-1"></div>
        <div className="flex gap-1">
          <button className="p-2 text-gray-400 hover:text-white hover:bg-white/5 transition-colors relative">
            <span className="material-symbols-outlined text-[20px]">notifications</span>
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-[#1791cf]"></span>
          </button>
          <button 
            onClick={onOpenSettings}
            className="p-2 text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
            title="System Configuration"
          >
            <span className="material-symbols-outlined text-[20px]">settings</span>
          </button>
          <div 
            className="w-8 h-8 bg-cover bg-center border border-[#404040] ml-2 cursor-pointer bg-slate-700"
            title="User Profile"
            style={{ backgroundImage: `url('https://picsum.photos/seed/cnc-user/64/64')` }}
          ></div>
        </div>
      </div>
    </header>
  );
};

export default Header;
