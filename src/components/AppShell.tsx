"use client";
import { useState } from "react";
import Sidebar from "./Sidebar";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      
      {/* Overlay */}
      {open && (
        <div onClick={() => setOpen(false)} style={{
          position: "fixed", inset: 0,
          background: "rgba(0,0,0,0.6)",
          zIndex: 998,
        }} />
      )}

      {/* Sidebar */}
      <aside style={{
        width: 260,
        flexShrink: 0,
        position: "relative",
        zIndex: 999,
      }} className="tm-sidebar">
        <Sidebar />
      </aside>

      {/* Hamburger */}
      <button onClick={() => setOpen(o => !o)} className="tm-burger"
        style={{ display: "none", position: "fixed", top: 12, left: 12, zIndex: 1000, background: "#F97316", border: "none", borderRadius: 10, width: 44, height: 44, cursor: "pointer", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 5 }}>
        <span style={{ width: 22, height: 2.5, background: "#fff", borderRadius: 2, display: "block" }} />
        <span style={{ width: 22, height: 2.5, background: "#fff", borderRadius: 2, display: "block" }} />
        <span style={{ width: 22, height: 2.5, background: "#fff", borderRadius: 2, display: "block" }} />
      </button>

      {/* Sidebar mobile */}
      <aside style={{
        display: "none",
        position: "fixed",
        top: 0, left: 0,
        width: 260,
        height: "100vh",
        zIndex: 999,
        transform: open ? "translateX(0)" : "translateX(-100%)",
        transition: "transform 0.3s ease",
      }} className="tm-sidebar-mobile">
        <Sidebar />
      </aside>

      {/* Main */}
      <main style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {children}
      </main>

      <style>{`
        @media (max-width: 900px) {
          .tm-sidebar { display: none !important; }
          .tm-burger { display: flex !important; }
          .tm-sidebar-mobile { display: block !important; }
        }
      `}</style>
    </div>
  );
}
