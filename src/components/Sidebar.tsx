"use client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
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
  Activity,
  User,
  HelpCircle,
} from "lucide-react";

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
  { label: "Projects", icon: FolderOpen, href: "/projects" },
  { label: "Survey Points", icon: Compass, href: "/survey" },
  { label: "Import Points", icon: FileText, href: "/import" },
  { label: "Assignation", icon: Users, href: "/assign" },
  { label: "Activité", icon: Activity, href: "/activity" },
  { label: "Mon Profil", icon: User, href: "/profile" },
  { label: "Terrain Model", icon: Mountain, href: "/terrain" },
  { label: "Road Alignment", icon: Route, href: "/alignment" },
  { label: "Volumes & Reports", icon: BarChart3, href: "/volumes" },
  { label: "Layers", icon: Layers, href: "/layers" },
  { label: "Drawing Canvas", icon: Map, href: "/canvas" },
];

const bottomItems: { label: string; icon: any; href: string }[] = [];

export default function Sidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);
  const router = useRouter();
  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }
  const pathname = usePathname();

  return (
    <aside
      className={`sidebar ${mobileOpen ? "sidebar-open" : ""}`}
      style={{
        display: isMobile && !mobileOpen ? "none" : "flex",
        position: isMobile ? "fixed" as const : "relative" as const,
        zIndex: isMobile ? 1000 : "auto",
        width: "var(--sidebar-width)",
        transition: "all 0.3s ease",
        background: "var(--sidebar-bg)",
        borderRight: "1px solid var(--border)",
        flexDirection: "column",
        height: "100vh",
        overflowY: "auto",
      }}
    >
      {/* Logo */}
      <div
        style={{
          padding: "18px 16px 16px",
          borderBottom: "1px solid var(--border)",
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
      <div style={{ padding: "8px 12px", marginBottom: 8 }}>
        <button onClick={logout} style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", background: "transparent", border: "1px solid #2a3f5f", borderRadius: 8, padding: "9px 14px", color: "#EF4444", cursor: "pointer", fontSize: 13 }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
          Déconnexion
        </button>
      </div>
      <div style={{ padding: "8px", borderTop: "1px solid var(--border)" }}>
        {bottomItems.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            style={{
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

