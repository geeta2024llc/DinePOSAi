import { useState } from 'react';

export function useSidebarCollapse() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('dinepos_sidebar_collapsed') === 'true';
    }
    return false;
  });

  const toggleSidebar = () => {
    const nextVal = !sidebarCollapsed;
    setSidebarCollapsed(nextVal);
    localStorage.setItem('dinepos_sidebar_collapsed', nextVal ? 'true' : 'false');
  };

  return { sidebarCollapsed, toggleSidebar };
}
