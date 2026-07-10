"use client";
import { useState } from "react";
import Sidebar from "./Sidebar";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="app-shell-wrap">
      {/* Overlay */}
      {open && (
        <div onClick={() => setOpen(false)} className="app-overlay" />
      )}

      {/* Sidebar desktop */}
      <aside className="app-sidebar-desktop">
        <Sidebar />
      </aside>

      {/* Sidebar mobile */}
      <aside className={`app-sidebar-mobile ${open ? "app-sidebar-open" : ""}`}>
        <Sidebar />
      </aside>

      {/* Hamburger */}
      <button onClick={() => setOpen(o => !o)} className="app-burger">
        <span /><span /><span />
      </button>

      {/* Main */}
      <main className="app-main-content">
        {children}
      </main>

      <style>{`
        .app-shell-wrap {
          display: flex;
          min-height: 100vh;
          background: #0D1117;
        }
        .app-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.6);
          z-index: 998;
        }
        .app-sidebar-desktop {
          width: 260px;
          flex-shrink: 0;
          background: #161B22;
          min-height: 100vh;
        }
        .app-sidebar-mobile {
          position: fixed;
          top: 0; left: 0;
          width: 260px;
          height: 100vh;
          background: #161B22;
          z-index: 999;
          transform: translateX(-100%);
          transition: transform 0.3s ease;
          display: none;
        }
        .app-sidebar-open {
          transform: translateX(0) !important;
        }
        .app-burger {
          display: none;
          position: fixed;
          top: 12px; left: 12px;
          z-index: 1000;
          background: #F97316;
          border: none;
          border-radius: 10px;
          width: 44px; height: 44px;
          cursor: pointer;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 5px;
        }
        .app-burger span {
          display: block;
          width: 22px; height: 2.5px;
          background: white;
          border-radius: 2px;
        }
        .app-main-content {
          flex: 1;
          min-width: 0;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }
        @media (max-width: 900px) {
          .app-sidebar-desktop { display: none !important; }
          .app-sidebar-mobile { display: block !important; }
          .app-burger { display: flex !important; }
        }
      `}</style>
    </div>
  );
}
