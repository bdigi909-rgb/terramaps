"use client";
import { useEffect, useRef } from "react";
import Sidebar from "./Sidebar";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const drawerRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const isOpen = useRef(false);

  useEffect(() => {
    const isTouch = "ontouchstart" in window || navigator.maxTouchPoints > 0;
    if (!isTouch) return;

    const btn = document.getElementById("tm-hamburger");
    const drawer = drawerRef.current;
    const overlay = overlayRef.current;
    if (!btn || !drawer || !overlay) return;

    btn.style.display = "flex";

    function open() {
      isOpen.current = true;
      drawer!.style.left = "0";
      overlay!.style.display = "block";
      btn!.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`;
    }

    function close() {
      isOpen.current = false;
      drawer!.style.left = "-300px";
      overlay!.style.display = "none";
      btn!.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>`;
    }

    btn.addEventListener("click", () => isOpen.current ? close() : open());
    overlay.addEventListener("click", close);
  }, []);

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <div id="tm-sidebar-desktop">
        <Sidebar />
      </div>

      <button id="tm-hamburger"
        style={{ display: "none", position: "fixed", top: 12, left: 12, zIndex: 1100, background: "#F97316", border: "none", borderRadius: 8, padding: "8px 10px", cursor: "pointer", alignItems: "center" }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
          <line x1="3" y1="6" x2="21" y2="6"/>
          <line x1="3" y1="12" x2="21" y2="12"/>
          <line x1="3" y1="18" x2="21" y2="18"/>
        </svg>
      </button>

      <div ref={overlayRef}
        style={{ display: "none", position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 1000 }} />

      <div ref={drawerRef}
        style={{ position: "fixed", left: "-300px", top: 0, zIndex: 1050, height: "100vh", transition: "left 0.3s ease" }}>
        <Sidebar />
      </div>

      <div id="tm-main" style={{ flex: 1, minHeight: "100vh", display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {children}
      </div>
    </div>
  );
}
