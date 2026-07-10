"use client";
import { useState } from "react";
import Sidebar from "./Sidebar";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#0D1117" }}>
      {/* Overlay mobile */}
      {sidebarOpen && (
        <div onClick={() => setSidebarOpen(false)}
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 100 }} />
      )}

      {/* Sidebar */}
      <div style={{
        position: "fixed",
        top: 0, left: 0,
        height: "100vh",
        width: 260,
        zIndex: 200,
        transform: sidebarOpen ? "translateX(0)" : "translateX(-100%)",
        transition: "transform 0.3s ease",
      }} className="sidebar-mobile">
        <Sidebar onClose={() => setSidebarOpen(false)} />
      </div>

      {/* Sidebar desktop */}
      <div style={{ width: 260, flexShrink: 0 }} className="sidebar-desktop">
        <Sidebar />
      </div>

      {/* Main */}
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
        {/* Hamburger mobile */}
        <button onClick={() => setSidebarOpen(true)}
          className="hamburger-mobile"
          style={{ position: "fixed", top: 12, left: 12, zIndex: 300, background: "#F97316", border: "none", borderRadius: 10, width: 44, height: 44, cursor: "pointer", display: "none", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 5 }}>
          <span style={{ display: "block", width: 22, height: 2.5, background: "#fff", borderRadius: 2 }} />
          <span style={{ display: "block", width: 22, height: 2.5, background: "#fff", borderRadius: 2 }} />
          <span style={{ display: "block", width: 22, height: 2.5, background: "#fff", borderRadius: 2 }} />
        </button>
        {children}
      </div>

      <style>{`
        @media (max-width: 900px) {
          .sidebar-desktop { display: none !important; }
          .sidebar-mobile { transform: ${sidebarOpen ? "translateX(0)" : "translateX(-100%)"}; }
          .hamburger-mobile { display: flex !important; }
        }
        @media (min-width: 901px) {
          .sidebar-mobile { display: none !important; }
          .hamburger-mobile { display: none !important; }
        }
      `}</style>
    </div>
  );
}
