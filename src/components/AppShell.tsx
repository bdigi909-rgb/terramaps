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
      {/* Sidebar — cachée sur touch via CSS */}
      <div className={isTouch ? "hide-on-touch" : ""}>
        <Sidebar />
      </div>

      {/* Hamburger sur touch */}
      {isTouch && (
        <button
          onClick={() => setSidebarOpen(o => !o)}
          style={{
            position: "fixed", top: 12, left: 12, zIndex: 1100,
            background: sidebarOpen ? "#dc5a0e" : "#F97316",
            border: "none", borderRadius: 8, padding: "8px 10px",
            cursor: "pointer", display: "flex", alignItems: "center"
          }}>
          {sidebarOpen ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <line x1="3" y1="6" x2="21" y2="6"/>
              <line x1="3" y1="12" x2="21" y2="12"/>
              <line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          )}
        </button>
      )}

      {/* Sidebar drawer sur touch */}
      {isTouch && (
        <>
          {sidebarOpen && (
            <div onClick={() => setSidebarOpen(false)}
              style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 1000 }} />
          )}
          <div style={{
            position: "fixed", left: sidebarOpen ? 0 : "-300px",
            top: 0, zIndex: 1050, height: "100vh",
            transition: "left 0.3s ease"
          }}>
            <Sidebar />
          </div>
        </>
      )}

      <div style={{
        flex: 1, minHeight: "100vh", display: "flex",
        flexDirection: "column", overflow: "hidden",
        marginLeft: isTouch ? 0 : "var(--sidebar-width)"
      }}>
        {children}
      </div>
    </div>
  );
}
