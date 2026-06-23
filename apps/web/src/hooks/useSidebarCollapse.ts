import { useState, useEffect } from 'react';

export function useSidebarCollapse() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    const collapsed = localStorage.getItem('dinepos_sidebar_collapsed') === 'true';
    setSidebarCollapsed(collapsed);
  }, []);

  const toggleSidebar = () => {
    const nextVal = !sidebarCollapsed;
    setSidebarCollapsed(nextVal);
    localStorage.setItem('dinepos_sidebar_collapsed', nextVal ? 'true' : 'false');
  };

  return { sidebarCollapsed, toggleSidebar };
}
