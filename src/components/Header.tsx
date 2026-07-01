"use client";
import NotificationBell from "@/components/NotificationBell";
import { Bell, Search, ChevronDown, User, Zap } from "lucide-react";

interface HeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export default function Header({ title, subtitle, actions }: HeaderProps) {
  return (
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
      <div style={{ flex: 1 }}>
        <h1 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#e2eaf2" }}>
          {title}
        </h1>
        {subtitle && (
          <p style={{ margin: 0, fontSize: 11, color: "#4b6080", marginTop: 1 }}>
            {subtitle}
          </p>
        )}
      </div>

      {/* Search bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          background: "#0f1923",
          border: "1px solid #1e3048",
          borderRadius: 8,
          padding: "6px 12px",
          width: 220,
          cursor: "pointer",
        }}
      >
        <Search size={14} color="#4b6080" />
        <span style={{ fontSize: 13, color: "#4b6080" }}>Search projects...</span>
        <span
          style={{
            marginLeft: "auto",
            fontSize: 10,
            color: "#4b6080",
            background: "#1e3048",
            padding: "1px 5px",
            borderRadius: 3,
          }}
        >
          ⌘K
        </span>
      </div>

      {actions}

      <NotificationBell />

      {/* AI badge */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 5,
          padding: "5px 10px",
          background: "rgba(59,130,246,0.1)",
          border: "1px solid rgba(59,130,246,0.2)",
          borderRadius: 8,
          cursor: "pointer",
          fontSize: 12,
          color: "#60a5fa",
          fontWeight: 600,
        }}
      >
        <Zap size={13} />
        AI Assist
      </div>

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
  );
}
