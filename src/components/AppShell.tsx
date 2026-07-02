"use client";
import { useState, useEffect } from "react";
import Sidebar from "./Sidebar";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isTouch, setIsTouch] = useState(false);

  useEffect(() => {
    setIsTouch("ontouchstart" in window || navigator.maxTouchPoints > 0);
  }, []);

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <div className={isTouch ? "sidebar-hidden" : "sidebar-visible"}>
        <Sidebar />
      </div>

      {isTouch && (
        <button onClick={() => setSidebarOpen(o => !o)}
          style={{ position: "fixed", top: 12, left: 12, zIndex: 1100, background: "#F97316", border: "none", borderRadius: 8, padding: "8px 10px", cursor: "pointer", display: "flex" }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
            <line x1="3" y1="6" x2="21" y2="6"/>
            <line x1="3" y1="12" x2="21" y2="12"/>
            <line x1="3" y1="18" x2="21" y2="18"/>
          </svg>
        </button>
      )}

      {isTouch && sidebarOpen && (
        <>
          <div onClick={() => setSidebarOpen(false)}
            style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 1000 }} />
          <div style={{ position: "fixed", left: 0, top: 0, zIndex: 1050, height: "100vh" }}>
            <Sidebar />
          </div>
        </>
      )}

      <div style={{ flex: 1, minHeight: "100vh", display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {children}
      </div>
    </div>
  );
}
