"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FolderOpen,
  Map,
  Route,
  BarChart3,
  Layers,
  Settings,
  ChevronRight,
  Cpu,
  Compass,
  Mountain,
  FileText,
  Users,
  HelpCircle,
} from "lucide-react";

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
  { label: "Projects", icon: FolderOpen, href: "/projects" },
  { label: "Survey Points", icon: Compass, href: "/survey" },
  { label: "Terrain Model", icon: Mountain, href: "/terrain" },
  { label: "Road Alignment", icon: Route, href: "/alignment" },
  { label: "Volumes & Reports", icon: BarChart3, href: "/volumes" },
  { label: "Layers", icon: Layers, href: "/layers" },
  { label: "Drawing Canvas", icon: Map, href: "/canvas" },
];

const bottomItems: { label: string; icon: any; href: string }[] = [];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside
      style={{
        width: "var(--sidebar-width)",
        background: "var(--sidebar-bg)",
        borderRight: "1px solid var(--border)",
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        position: "fixed",
        left: 0,
        top: 0,
        zIndex: 50,
        overflowY: "auto",
      }}
    >
      {/* Logo */}
      <div
        style={{
          padding: "18px 16px 16px",
          borderBottom: "1px solid var(--border)",
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}
      >
        <div style={{ width: 40, height: 40, borderRadius: 10, background: "#0D1117", border: "2px solid #F97316", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><svg width="26" height="26" viewBox="0 0 42 42" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="21" cy="21" r="16" stroke="#F97316" strokeWidth="2"/><ellipse cx="21" cy="21" rx="16" ry="6" stroke="#F97316" strokeWidth="1" opacity="0.5"/><line x1="5" y1="21" x2="37" y2="21" stroke="#F97316" strokeWidth="1" opacity="0.4"/><ellipse cx="21" cy="21" rx="8" ry="16" stroke="#F97316" strokeWidth="1.5"/><circle cx="26" cy="13" r="4" fill="#F97316"/><line x1="26" y1="17" x2="26" y2="23" stroke="#F97316" strokeWidth="2"/></svg></div>
        <div>
          <div style={{ fontWeight: 700, fontSize: 15, color: "#e2eaf2", letterSpacing: "-0.3px" }}>
            Terra<span style={{ color: "#f97316" }}>Maps</span>
          </div>
          <div style={{ fontSize: 10, color: "#4b6080", textTransform: "uppercase", letterSpacing: 1 }}>
            TOPOGRAPHIE & CARTO
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav style={{ padding: "12px 8px", flex: 1 }}>
        <div className="section-title" style={{ paddingLeft: 8 }}>
          Main Menu
        </div>
        {navItems.map((item) => {
          const active =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "8px 10px",
                borderRadius: 7,
                marginBottom: 2,
                textDecoration: "none",
                background: active ? "rgba(249,115,22,0.12)" : "transparent",
                color: active ? "#f97316" : "#8bacc8",
                fontWeight: active ? 600 : 400,
                fontSize: 13,
                transition: "all 0.15s",
                border: active ? "1px solid rgba(249,115,22,0.2)" : "1px solid transparent",
              }}
            >
              <item.icon size={16} />
              <span style={{ flex: 1 }}>{item.label}</span>
              {active && <ChevronRight size={14} style={{ opacity: 0.6 }} />}
            </Link>
          );
        })}
      </nav>

      {/* Version badge */}
      <div
        style={{
          margin: "8px",
          padding: "8px 12px",
          background: "rgba(249,115,22,0.08)",
          borderRadius: 8,
          border: "1px solid rgba(249,115,22,0.15)",
          fontSize: 11,
          color: "#8bacc8",
        }}
      >
        <div style={{ color: "#f97316", fontWeight: 600, marginBottom: 2 }}>
          TerraMaps v2.0
        </div>
        <div>Moteur Covadis-compatible</div>
      </div>

      {/* Bottom nav */}
      <div style={{ padding: "8px", borderTop: "1px solid var(--border)" }}>
        {bottomItems.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "7px 10px",
              borderRadius: 6,
              marginBottom: 1,
              textDecoration: "none",
              color: "#4b6080",
              fontSize: 12,
              transition: "all 0.15s",
            }}
          >
            <item.icon size={14} />
            {item.label}
          </Link>
        ))}
      </div>
    </aside>
  );
}

