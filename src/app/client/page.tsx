"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface Project {
  id: number; name: string; type: string; status: string;
  client?: string; location?: string; description?: string;
  pointsCount: number; alignmentsCount: number; createdAt: string;
}

export default function ClientPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [me, setMe] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/auth/me").then(r => r.json()).then(d => {
      if (!d.user) { router.push("/login"); return; }
      setMe(d.user);
    });
    fetch("/api/client").then(r => r.json()).then(data => {
      if (Array.isArray(data)) setProjects(data);
      setLoading(false);
    });
  }, []);

  const statusColor: Record<string, string> = {
    active: "#22C55E", draft: "#64748B", review: "#F59E0B",
    completed: "#3B82F6", archived: "#4B6080"
  };
  const statusLabel: Record<string, string> = {
    active: "En cours", draft: "Brouillon", review: "En révision",
    completed: "Terminé", archived: "Archivé"
  };
  const typeLabel: Record<string, string> = {
    road_design: "Conception Route", terrain_modeling: "Modèle Terrain",
    survey: "Levé Topo", parcel: "Parcellaire", infrastructure: "Infrastructure", drainage: "Drainage"
  };

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  return (
    <div style={{ minHeight: "100vh", background: "#0D1117", color: "#E2EAF2", fontFamily: "Arial, sans-serif" }}>
      {/* Header */}
      <div style={{ background: "#161B22", borderBottom: "1px solid #1E2D3D", padding: "0 32px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 60 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ width: 36, height: 36, borderRadius: 9, background: "#0D1117", border: "2px solid #F97316", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="20" height="20" viewBox="0 0 42 42" fill="none">
              <circle cx="21" cy="21" r="16" stroke="#F97316" strokeWidth="2"/>
              <ellipse cx="21" cy="21" rx="16" ry="6" stroke="#F97316" strokeWidth="1" opacity="0.5"/>
              <ellipse cx="21" cy="21" rx="8" ry="16" stroke="#F97316" strokeWidth="1.5"/>
              <circle cx="26" cy="13" r="4" fill="#F97316"/>
            </svg>
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700 }}>Terra<span style={{ color: "#F97316" }}>Maps</span></div>
            <div style={{ fontSize: 10, color: "#64748B", textTransform: "uppercase", letterSpacing: 1 }}>Espace Client</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ fontSize: 13, color: "#8BACC8" }}>👤 {me?.name}</div>
          <button onClick={logout} style={{ background: "transparent", border: "1px solid #2A3F5F", color: "#EF4444", padding: "6px 14px", borderRadius: 8, cursor: "pointer", fontSize: 12 }}>Déconnexion</button>
        </div>
      </div>

      <div style={{ padding: 32, maxWidth: 1200, margin: "0 auto" }}>
        {/* Welcome */}
        <div style={{ background: "linear-gradient(135deg, #0f1923 0%, #1a2f46 100%)", border: "1px solid #1E2D3D", borderRadius: 16, padding: "24px 32px", marginBottom: 32, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <h1 style={{ margin: "0 0 8px", fontSize: 22, fontWeight: 700 }}>Bienvenue, <span style={{ color: "#F97316" }}>{me?.name}</span> 👋</h1>
            <p style={{ margin: 0, fontSize: 13, color: "#64748B" }}>Suivez l'avancement de vos projets topographiques en temps réel.</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
            {[
              { label: "Projets", value: projects.length, color: "#F97316" },
              { label: "En cours", value: projects.filter(p => p.status === "active").length, color: "#22C55E" },
              { label: "Terminés", value: projects.filter(p => p.status === "completed").length, color: "#3B82F6" },
            ].map(s => (
              <div key={s.label} style={{ textAlign: "center", background: "rgba(255,255,255,0.05)", borderRadius: 10, padding: "12px 20px" }}>
                <div style={{ fontSize: 24, fontWeight: 700, color: s.color }}>{s.value}</div>
                <div style={{ fontSize: 10, color: "#64748B", textTransform: "uppercase" }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Projects */}
        <h2 style={{ margin: "0 0 20px", fontSize: 16, fontWeight: 600, color: "#8BACC8" }}>Vos projets</h2>

        {loading ? (
          <div style={{ textAlign: "center", padding: 60, color: "#64748B" }}>Chargement...</div>
        ) : projects.length === 0 ? (
          <div style={{ textAlign: "center", padding: 60, background: "#161B22", borderRadius: 12, border: "1px solid #1E2D3D" }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>📁</div>
            <div style={{ fontSize: 14, color: "#64748B" }}>Aucun projet disponible pour le moment.</div>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(380px, 1fr))", gap: 20 }}>
            {projects.map(p => (
              <div key={p.id} style={{ background: "#161B22", border: "1px solid #1E2D3D", borderRadius: 16, padding: 24, borderTop: `3px solid ${statusColor[p.status] || "#64748B"}` }}>
                {/* Status & Type */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                  <span style={{ background: `${statusColor[p.status] || "#64748B"}22`, color: statusColor[p.status] || "#64748B", fontSize: 10, fontWeight: 700, padding: "3px 10px", borderRadius: 20, textTransform: "uppercase" }}>
                    {statusLabel[p.status] || p.status}
                  </span>
                  <span style={{ fontSize: 11, color: "#64748B" }}>{typeLabel[p.type] || p.type}</span>
                </div>

                {/* Name */}
                <h3 style={{ margin: "0 0 8px", fontSize: 16, fontWeight: 700, color: "#E2EAF2" }}>{p.name}</h3>
                {p.description && <p style={{ margin: "0 0 16px", fontSize: 12, color: "#64748B", lineHeight: 1.5 }}>{p.description}</p>}

                {/* Location */}
                {p.location && (
                  <div style={{ fontSize: 12, color: "#8BACC8", marginBottom: 16 }}>
                    📍 {p.location}
                  </div>
                )}

                {/* Progress bar */}
                <div style={{ marginBottom: 16 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, fontSize: 11 }}>
                    <span style={{ color: "#64748B" }}>Avancement</span>
                    <span style={{ color: statusColor[p.status] || "#64748B", fontWeight: 600 }}>
                      {p.status === "completed" ? "100%" : p.status === "active" ? "En cours" : p.status === "review" ? "Révision" : "0%"}
                    </span>
                  </div>
                  <div style={{ height: 6, background: "#1E2D3D", borderRadius: 3 }}>
                    <div style={{
                      height: 6, borderRadius: 3,
                      background: statusColor[p.status] || "#64748B",
                      width: p.status === "completed" ? "100%" : p.status === "active" ? "60%" : p.status === "review" ? "85%" : "10%",
                      transition: "width 0.5s"
                    }} />
                  </div>
                </div>

                {/* Stats */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
                  {[
                    { label: "Points levés", value: p.pointsCount, color: "#3B82F6", icon: "📍" },
                    { label: "Alignements", value: p.alignmentsCount, color: "#22C55E", icon: "🛣️" },
                  ].map(s => (
                    <div key={s.label} style={{ background: "#0D1117", borderRadius: 8, padding: "10px 14px", display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 16 }}>{s.icon}</span>
                      <div>
                        <div style={{ fontSize: 16, fontWeight: 700, color: s.color }}>{s.value}</div>
                        <div style={{ fontSize: 10, color: "#64748B" }}>{s.label}</div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Date */}
                <div style={{ fontSize: 11, color: "#4B6080", borderTop: "1px solid #1E2D3D", paddingTop: 12 }}>
                  📅 Créé le {new Date(p.createdAt).toLocaleDateString("fr-FR")}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
