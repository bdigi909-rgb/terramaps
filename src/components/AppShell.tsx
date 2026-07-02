"use client";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import Sidebar from "./Sidebar";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [mobile, setMobile] = useState(true);

  useLayoutEffect(() => {
    const fn = () => setMobile(window.matchMedia("(hover: none) and (pointer: coarse)").matches || window.innerWidth < 1024);
    fn();
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, []);

  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <>
      {/* Desktop layout */}
      {!mobile && (
        <div style={{ display: "flex", minHeight: "100vh" }}>
          <div style={{ width: "var(--sidebar-width)", flexShrink: 0 }}>
            <Sidebar />
          </div>
          <div style={{ flex: 1, minHeight: "100vh", display: "flex", flexDirection: "column", overflow: "hidden" }}>
            {children}
          </div>
        </div>
      )}

      {/* Mobile layout */}
      {mobile && (
        <div style={{ minHeight: "100vh" }}>
          {/* Hamburger */}
          <button
            onClick={() => setOpen(true)}
            style={{
              position: "fixed", top: 14, left: 14, zIndex: 9999,
              width: 42, height: 42, background: "#F97316",
              border: "none", borderRadius: 10, cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 2px 8px rgba(249,115,22,0.4)"
            }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
              <line x1="3" y1="6" x2="21" y2="6"/>
              <line x1="3" y1="12" x2="21" y2="12"/>
              <line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          </button>

          {/* Overlay */}
          {open && (
            <div
              onClick={() => setOpen(false)}
              style={{
                position: "fixed", inset: 0, zIndex: 9998,
                background: "rgba(0,0,0,0.5)",
                backdropFilter: "blur(2px)"
              }}
            />
          )}

          {/* Drawer */}
          <div style={{
            position: "fixed", top: 0, left: 0, zIndex: 9999,
            height: "100vh", width: "280px",
            transform: open ? "translateX(0)" : "translateX(-100%)",
            transition: "transform 0.3s cubic-bezier(0.4,0,0.2,1)",
            overflowY: "auto"
          }}>
            <Sidebar onClose={() => setOpen(false)} />
          </div>

          {/* Content */}
          <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
            {children}
          </div>
        </div>
      )}
    </>
  );
}
