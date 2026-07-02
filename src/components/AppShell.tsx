"use client";
import { useEffect } from "react";
import Sidebar from "./Sidebar";

export default function AppShell({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const isTouch = "ontouchstart" in window || navigator.maxTouchPoints > 0;
    if (!isTouch) return;

    document.body.classList.add("is-mobile");

    const btn = document.getElementById("hamburger");
    const drawer = document.getElementById("drawer");
    const overlay = document.getElementById("overlay");

    if (!btn || !drawer || !overlay) { console.log('Elements not found'); return; }
    console.log('Elements found, attaching listeners');

    let open = false;

    btn.addEventListener("click", (e) => {
      e.preventDefault();
      alert('clicked!');
      e.stopPropagation();
      e.stopPropagation();
      open = !open;
      drawer.style.left = open ? "0" : "-300px";
      overlay.style.display = open ? "block" : "none";
    });

    overlay.addEventListener("click", () => {
      open = false;
      drawer.style.transform = "translateX(-100%)";
      overlay.style.display = "none";
    });
  }, []);

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      {/* Desktop sidebar */}
      <div id="desktop-sidebar">
        <Sidebar />
      </div>

      {/* Hamburger button */}
      <button id="hamburger" type="button" style={{
        display: "none", position: "fixed", top: 12, left: 12,
        zIndex: 2000, background: "#F97316", border: "none",
        borderRadius: 8, padding: "10px 12px", cursor: "pointer",
        alignItems: "center", justifyContent: "center"
      }}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
          <line x1="3" y1="6" x2="21" y2="6"/>
          <line x1="3" y1="12" x2="21" y2="12"/>
          <line x1="3" y1="18" x2="21" y2="18"/>
        </svg>
      </button>

      {/* Overlay */}
      <div id="overlay" style={{
        display: "none", position: "fixed", inset: 0,
        background: "rgba(0,0,0,0.6)", zIndex: 1500
      }} />

      {/* Mobile drawer */}
      <div id="drawer" style={{
        position: "fixed", left: "-300px", top: 0, zIndex: 1800, height: "100vh", width: "280px", transition: "left 0.3s ease", background: "var(--sidebar-bg)"
      }}>
        <Sidebar />
      </div>

      {/* Main content */}
      <div id="main-content" style={{
        flex: 1, minHeight: "100vh", display: "flex",
        flexDirection: "column", overflow: "hidden"
      }}>
        {children}
      </div>
    </div>
  );
}
