"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import RatingStars from "@/components/RatingStars";
import MissionsCalendar from "@/components/MissionsCalendar";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import RatingStars from "@/components/RatingStars";
export default function ClientSpacePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [devis, setDevis] = useState<any[]>([]);
  const [factures, setFactures] = useState<any[]>([]);
  const [unreadReplies, setUnreadReplies] = useState(0);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetch("/api/auth/me").then(r => r.json()).then(async d => {
      if (!d.user) { router.push("/login"); return; }
      if (d.user.role !== "client" && d.user.role !== "client_admin") { router.push("/dashboard"); return; }
      setUser(d.user);
      try {
        const proj = await fetch("/api/projects").then(r => r.ok ? r.json() : []);
        const dev = await fetch("/api/devis").then(r => r.ok ? r.json() : []);
        const fact = await fetch("/api/factures").then(r => r.ok ? r.json() : []);
        const msgs = await fetch("/api/messages").then(r => r.ok ? r.json() : []);
        if (Array.isArray(proj)) setProjects(proj);
        if (Array.isArray(dev)) setDevis(dev.filter((x: any) => x.client === d.user.name || x.clientEmail === d.user.email));
        if (Array.isArray(fact)) setFactures(fact.filter((x: any) => x.client === d.user.name || x.clientEmail === d.user.email));
        if (Array.isArray(msgs)) setUnreadReplies(msgs.filter((m: any) => m.is_reply && !m.read).length);
      } catch (e) { console.error(e); }
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);
  if (loading) return (<div style={{ minHeight: "100vh", background: "#0D1117", display: "flex", alignItems: "center", justifyContent: "center", color: "#E2EAF2" }}>Chargement...</div>);
  return (
    <div style={{ minHeight: "100vh", background: "#0D1117", color: "#E2EAF2", fontFamily: "Arial" }}>
      <div style={{ background: "#161B22", borderBottom: "1px solid #1E2D3D", padding: "0 16px", height: 56, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ fontSize: 18, fontWeight: 700 }}>Terra<span style={{ color: "#F97316" }}>Maps</span></div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 13, color: "#8BACC8" }}>👤 {user?.name}</span>
          <button onClick={() => router.push("/messages")} style={{ background: unreadReplies > 0 ? "#F97316" : "#1E2D3D", border: "none", color: "#fff", padding: "6px 14px", borderRadius: 8, cursor: "pointer", fontSize: 12 }}>💬 Messages {unreadReplies > 0 && <span style={{ background: "#EF4444", color: "#fff", borderRadius: "50%", padding: "1px 6px", fontSize: 10, marginLeft: 4 }}>{unreadReplies}</span>}</button>
          <button onClick={async () => { await fetch("/api/auth/logout", { method: "POST" }); router.push("/login"); }} style={{ background: "transparent", border: "1px solid #EF4444", color: "#EF4444", padding: "6px 12px", borderRadius: 8, cursor: "pointer", fontSize: 12 }}>Déconnexion</button>
        </div>
      </div>
      <div style={{ padding: 24, maxWidth: 1000, margin: "0 auto" }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>Mon Espace Client</h1>
        <p style={{ color: "#64748B", marginBottom: 24 }}>Bienvenue {user?.name}</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 24 }}>
          {[{ icon: "📁", label: "Projets", value: projects.length, color: "#3B82F6" },{ icon: "📋", label: "Devis", value: devis.length, color: "#F97316" },{ icon: "🧾", label: "Factures", value: factures.length, color: "#22C55E" }].map(s => (
            <div key={s.label} style={{ background: "#161B22", border: "1px solid #1E2D3D", borderRadius: 12, padding: 20, textAlign: "center" }}>
              <div style={{ fontSize: 28 }}>{s.icon}</div>
              <div style={{ fontSize: 24, fontWeight: 700, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 11, color: "#64748B" }}>{s.label}</div>
            </div>
          ))}
        </div>
        <div style={{ background: "#161B22", border: "1px solid #1E2D3D", borderRadius: 12, padding: 20, marginBottom: 16 }}>
          <h3 style={{ margin: "0 0 12px", fontSize: 13, color: "#8BACC8" }}>📁 Mes Projets</h3>
          {projects.length === 0 ? <div style={{ color: "#64748B", textAlign: "center", padding: 20 }}>Aucun projet</div> : projects.map(p => (
            <div key={p.id} style={{ borderBottom: "1px solid #1E2D3D", padding: "10px 0", display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#F97316", fontWeight: 600 }}>{p.name}</span>
              <span style={{ color: "#64748B", fontSize: 11 }}>{p.status}</span>
              <RatingStars projectId={p.id} />
            </div>
          ))}
        </div>
        <div style={{ background: "#161B22", border: "1px solid #1E2D3D", borderRadius: 12, padding: 20, marginBottom: 16 }}>
          <h3 style={{ margin: "0 0 12px", fontSize: 13, color: "#8BACC8" }}>📋 Mes Devis</h3>
          {devis.length === 0 ? <div style={{ color: "#64748B", textAlign: "center", padding: 20 }}>Aucun devis</div> : devis.map(d => (
            <div key={d.id} style={{ borderBottom: "1px solid #1E2D3D", padding: "10px 0", display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#F97316" }}>{d.numero}</span>
              <span style={{ color: "#22C55E" }}>{parseFloat(d.total || 0).toFixed(2)} MAD</span>
            </div>
          ))}
        </div>
        <div style={{ background: "#161B22", border: "1px solid #1E2D3D", borderRadius: 12, padding: 20 }}>
          <h3 style={{ margin: "0 0 12px", fontSize: 13, color: "#8BACC8" }}>🧾 Mes Factures</h3>
          {factures.length === 0 ? <div style={{ color: "#64748B", textAlign: "center", padding: 20 }}>Aucune facture</div> : factures.map(f => (
            <div key={f.id} style={{ borderBottom: "1px solid #1E2D3D", padding: "10px 0", display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#F97316" }}>{f.numero}</span>
              <span style={{ color: "#22C55E" }}>{parseFloat(f.total || 0).toFixed(2)} MAD</span>
            </div>
          ))}
        </div>
        <div style={{ background: "#161B22", border: "1px solid #1E2D3D", borderRadius: 12, padding: 20, marginTop: 16 }}>
          <h3 style={{ margin: "0 0 12px", fontSize: 13, color: "#8BACC8" }}>🗓️ Calendrier des missions</h3>
          <MissionsCalendar projectIds={projects.map((p: any) => p.id)} />
        </div>
      </div>
    </div>
  );
      </div>
    </div>
  );
}
