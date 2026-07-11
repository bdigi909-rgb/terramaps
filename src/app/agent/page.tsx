"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AppShell from "@/components/AppShell";
import Header from "@/components/Header";
import Link from "next/link";

export default function AgentPage() {
  const router = useRouter();
  const [me, setMe] = useState<any>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [missions, setMissions] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/auth/me").then(r => r.json()).then(d => {
      if (!d.user) { router.push("/login"); return; }
      setMe(d.user);
    });
    fetch("/api/projects").then(r => r.json()).then(d => { if (Array.isArray(d)) setProjects(d); });
    const saved = localStorage.getItem("tm_missions");
    if (saved) {
      const all = JSON.parse(saved);
      const today = new Date().toISOString().slice(0, 10);
      setMissions(all.filter((m: any) => m.date >= today).slice(0, 5));
    }
  }, []);

  return (
    <AppShell>
      <Header title="Mon Espace" subtitle={`Bonjour ${me?.name || ""}`} />
      <div style={{ padding: 24, maxWidth: 1000, margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 24 }}>
          {[
            { icon: "📁", label: "Mes projets", value: projects.length, color: "#3B82F6", href: "/projects" },
            { icon: "📅", label: "Missions", value: missions.length, color: "#F97316", href: "/planning" },
            { icon: "💬", label: "Chat equipe", value: "", color: "#22C55E", href: "/chat" },
          ].map(s => (
            <Link key={s.label} href={s.href} style={{ textDecoration: "none" }}>
              <div style={{ background: "#161B22", border: `1px solid ${s.color}33`, borderRadius: 12, padding: 20, cursor: "pointer" }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>{s.icon}</div>
                <div style={{ fontSize: 28, fontWeight: 700, color: s.color }}>{s.value}</div>
                <div style={{ fontSize: 12, color: "#64748B", marginTop: 4 }}>{s.label}</div>
              </div>
            </Link>
          ))}
        </div>

        <div style={{ background: "#161B22", border: "1px solid #1E2D3D", borderRadius: 12, padding: 20, marginBottom: 24 }}>
          <h3 style={{ margin: "0 0 16px", fontSize: 14, color: "#8BACC8" }}>Projets recents</h3>
          {projects.slice(0, 5).map(p => (
            <Link key={p.id} href={`/projects/${p.id}`} style={{ textDecoration: "none" }}>
              <div style={{ background: "#0D1117", border: "1px solid #1E2D3D", borderRadius: 8, padding: "12px 16px", marginBottom: 8, display: "flex", justifyContent: "space-between" }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#E2EAF2" }}>{p.name}</div>
                <span style={{ fontSize: 11, color: "#64748B" }}>{p.status}</span>
              </div>
            </Link>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
          {[
            { label: "Importer", href: "/import", icon: "📥" },
            { label: "Leve topo", href: "/leve-topo", icon: "📄" },
            { label: "Calculatrice", href: "/calculatrice", icon: "🧮" },
            { label: "Chat", href: "/chat", icon: "💬" },
          ].map(a => (
            <Link key={a.label} href={a.href} style={{ textDecoration: "none" }}>
              <div style={{ background: "#161B22", border: "1px solid #1E2D3D", borderRadius: 10, padding: 16, textAlign: "center" }}>
                <div style={{ fontSize: 24, marginBottom: 8 }}>{a.icon}</div>
                <div style={{ fontSize: 12, color: "#8BACC8" }}>{a.label}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
