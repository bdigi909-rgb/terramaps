"use client";
import NotificationBell from "@/components/NotificationBell";
import GlobalSearch from "@/components/GlobalSearch";
import LangSwitcher from "@/components/LangSwitcher";

import AIAssist from "@/components/AIAssist";
import { useState } from "react";
import { Bell, Search, ChevronDown, User, Zap } from "lucide-react";

interface HeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export default function Header({ title, subtitle, actions }: HeaderProps) {
  return (
    <>
    <button id="mobile-menu-trigger" onClick={() => { const s = document.querySelector(".sidebar"); if(s) s.classList.toggle("sidebar-open"); }} style={{ display: "none", position: "fixed", top: 14, left: 14, zIndex: 1001, background: "#F97316", border: "none", borderRadius: 8, padding: "8px 10px", cursor: "pointer" }} className="mobile-hamburger">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
    </button>
    <header
      style={{
        height: "var(--header-height)",
        background: "var(--sidebar-bg)",
        borderBottom: "1px solid var(--border)",
        display: "flex",
        alignItems: "center",
        padding: "0 24px",
        gap: 16,
        position: "sticky",
        top: 0,
        zIndex: 40,
      }}
    >
      <div style={{ flex: "none", minWidth: 200 }}>
        <h1 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#e2eaf2" }}>
          {title}
        </h1>
        {subtitle && (
          <p style={{ margin: 0, fontSize: 11, color: "#4b6080", marginTop: 1 }}>
            {subtitle}
          </p>
        )}
      </div>

      <div style={{ flex: 1, maxWidth: 500 }}><GlobalSearch /></div>

      {actions}

      
      <LangSwitcher />
      <NotificationBell />

      <AIAssist />

      {/* User */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "4px 10px",
          background: "#0f1923",
          border: "1px solid #1e3048",
          borderRadius: 8,
          cursor: "pointer",
        }}
      >
        <div
          style={{
            width: 26,
            height: 26,
            borderRadius: "50%",
            background: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <User size={14} color="white" />
        </div>
        <span style={{ fontSize: 12, color: "#c8daea", fontWeight: 500 }}>Ingénieur</span>
        <ChevronDown size={13} color="#4b6080" />
      </div>
    </header>
  </>
  );
}
