"use client";
import Sidebar from "./Sidebar";

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="app-shell">
      <input type="checkbox" id="sidebar-toggle" className="sidebar-checkbox" />
      
      <label htmlFor="sidebar-toggle" className="hamburger-label">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
          <line x1="3" y1="6" x2="21" y2="6"/>
          <line x1="3" y1="12" x2="21" y2="12"/>
          <line x1="3" y1="18" x2="21" y2="18"/>
        </svg>
      </label>

      <label htmlFor="sidebar-toggle" className="sidebar-overlay" />

      <div className="sidebar-drawer">
        <Sidebar />
      </div>

      <div className="app-main">
        {children}
      </div>
    </div>
  );
}
