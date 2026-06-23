import React from 'react';

interface SidebarToggleButtonProps {
  sidebarCollapsed: boolean;
  onToggle: () => void;
}

export const SidebarToggleButton: React.FC<SidebarToggleButtonProps> = ({
  sidebarCollapsed,
  onToggle,
}) => {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`hidden lg:flex fixed top-1/2 -translate-y-1/2 z-[9999] bg-[#0a0a09] border border-white/10 hover:border-white/20 text-[#A69984] hover:text-[#ffe2ab] items-center justify-center transition-all duration-300 shadow-lg cursor-pointer ${
        sidebarCollapsed 
          ? 'left-0 rounded-r-lg rounded-l-none border-l-0 w-5 h-12' 
          : 'left-[268px] rounded-full w-6 h-6'
      }`}
      title={sidebarCollapsed ? "Show Sidebar" : "Hide Sidebar"}
    >
      <span className="material-symbols-outlined text-sm font-bold select-none pointer-events-none">
        {sidebarCollapsed ? 'chevron_right' : 'chevron_left'}
      </span>
    </button>
  );
};
