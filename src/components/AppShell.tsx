"use client";
import { useState, useEffect } from "react";
import Sidebar from "./Sidebar";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const check = () => {
      const mobile = "ontouchstart" in window || navigator.maxTouchPoints > 0;
      setIsMobile(mobile);
    };
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      {/* Mobile hamburger */}
      {mounted && isMobile && (
        <button onClick={() => setSidebarOpen(!sidebarOpen)}
          style={{ position: "fixed", top: 12, left: 12, zIndex: 1100, background: "#F97316", border: "none", borderRadius: 8, padding: "8px 10px", cursor: "pointer", display: "flex" }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
            <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
          </svg>
        </button>
      )}

      {/* Overlay mobile */}
      {mounted && isMobile && sidebarOpen && (
        <div onClick={() => setSidebarOpen(false)}
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 1000 }} />
      )}

      {/* Sidebar desktop - toujours visible */}
      {(!mounted || !isMobile) && <Sidebar />}

      {/* Sidebar mobile - drawer */}
      {mounted && isMobile && sidebarOpen && (
        <div style={{ position: "fixed", left: 0, top: 0, zIndex: 1050, height: "100vh" }}>
          <Sidebar />
        </div>
      )}

      {/* Main content */}
      <div className="main-content" style={{ flex: 1, minHeight: "100vh", display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {children}
      </div>
    </div>
  );
}
