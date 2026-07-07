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
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

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
  const statusProgress: Record<string, number> = {
    draft: 10, active: 60, review: 85, completed: 100, archived: 100
  };
  const typeLabel: Record<string, string> = {
    road_design: "Conception Route", terrain_modeling: "Modèle Terrain",
    survey: "Levé Topo", parcel: "Parcellaire", infrastructure: "Infrastructure", drainage: "Drainage"
  };

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  if (loading) return (
    <div style={{ minHeight: "100vh", background: "#0D1117", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ color: "#F97316", fontSize: 16 }}>Chargement...</div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#0D1117", color: "#E2EAF2", fontFamily: "Arial, sans-serif" }}>
      {/* Header */}
      <div style={{ background: "#161B22", borderBottom: "1px solid #1E2D3D", padding: "0 32px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 60 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ fontSize: 20, fontWeight: 700 }}>Terra<span style={{ color: "#F97316" }}>Maps</span></div>
          <span style={{ background: "rgba(249,115,22,0.15)", color: "#F97316", fontSize: 11, fontWeight: 700, padding: "3px 12px", borderRadius: 20, border: "1px solid rgba(249,115,22,0.3)" }}>ESPACE CLIENT</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ fontSize: 13, color: "#8BACC8" }}>
            Bonjour, <span style={{ color: "#F97316", fontWeight: 600 }}>{me?.name}</span>
          </div>
          <button onClick={logout} style={{ background: "transparent", border: "1px solid #2a3f5f", borderRadius: 8, padding: "6px 14px", color: "#EF4444", cursor: "pointer", fontSize: 12 }}>
            Déconnexion
          </button>
        </div>
      </div>

      <div style={{ padding: "32px", maxWidth: 1100, margin: "0 auto" }}>
        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 32 }}>
          {[
            { label: "Total Projets", value: projects.length, color: "#F97316", icon: "📁" },
            { label: "En cours", value: projects.filter(p => p.status === "active").length, color: "#22C55E", icon: "🔄" },
            { label: "Terminés", value: projects.filter(p => p.status === "completed").length, color: "#3B82F6", icon: "✅" },
            { label: "Points levés", value: projects.reduce((s, p) => s + (p.pointsCount || 0), 0), color: "#A855F7", icon: "📍" },
          ].map(s => (
            <div key={s.label} style={{ background: "#161B22", border: "1px solid #1E2D3D", borderRadius: 12, padding: "20px 24px" }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>{s.icon}</div>
              <div style={{ fontSize: 26, fontWeight: 700, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 11, color: "#64748B", textTransform: "uppercase", marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: selectedProject ? "1fr 1fr" : "1fr", gap: 24 }}>
          {/* Liste projets */}
          <div>
            <h2 style={{ margin: "0 0 16px", fontSize: 16, fontWeight: 600, color: "#E2EAF2" }}>Mes Projets</h2>
            {projects.length === 0 ? (
              <div style={{ background: "#161B22", border: "1px solid #1E2D3D", borderRadius: 12, padding: 40, textAlign: "center", color: "#64748B" }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>📭</div>
                <div>Aucun projet assigné pour le moment.</div>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {projects.map(p => {
                  const progress = statusProgress[p.status] || 0;
                  const color = statusColor[p.status] || "#64748B";
                  return (
                    <div key={p.id}
                      onClick={() => setSelectedProject(selectedProject?.id === p.id ? null : p)}
                      style={{ background: "#161B22", border: `1px solid ${selectedProject?.id === p.id ? "#F97316" : "#1E2D3D"}`, borderRadius: 12, padding: 20, cursor: "pointer", transition: "border-color 0.2s" }}>
                      
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                        <div>
                          <div style={{ fontSize: 15, fontWeight: 700, color: "#E2EAF2", marginBottom: 4 }}>{p.name}</div>
                          <div style={{ fontSize: 11, color: "#64748B" }}>{typeLabel[p.type] || p.type} • {p.location || "—"}</div>
                        </div>
                        <span style={{ background: `${color}22`, color, fontSize: 10, fontWeight: 700, padding: "3px 10px", borderRadius: 20, border: `1px solid ${color}44`, whiteSpace: "nowrap" }}>
                          {statusLabel[p.status] || p.status}
                        </span>
                      </div>

                      {/* Barre de progression */}
                      <div style={{ marginBottom: 10 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                          <span style={{ fontSize: 10, color: "#64748B" }}>Avancement</span>
                          <span style={{ fontSize: 10, color, fontWeight: 700 }}>{progress}%</span>
                        </div>
                        <div style={{ height: 6, background: "#1E2D3D", borderRadius: 3, overflow: "hidden" }}>
                          <div style={{ height: "100%", width: `${progress}%`, background: color, borderRadius: 3, transition: "width 0.5s ease" }} />
                        </div>
                      </div>

                      <div style={{ display: "flex", gap: 16 }}>
                        <span style={{ fontSize: 11, color: "#64748B" }}>📍 {p.pointsCount || 0} points</span>
                        <span style={{ fontSize: 11, color: "#64748B" }}>📅 {new Date(p.createdAt).toLocaleDateString("fr-FR")}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Détail projet */}
          {selectedProject && (
            <div>
              <h2 style={{ margin: "0 0 16px", fontSize: 16, fontWeight: 600, color: "#E2EAF2" }}>Détails du projet</h2>
              <div style={{ background: "#161B22", border: "1px solid #F97316", borderRadius: 12, padding: 24 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                  <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>{selectedProject.name}</h3>
                  <button onClick={() => setSelectedProject(null)} style={{ background: "transparent", border: "none", color: "#64748B", cursor: "pointer", fontSize: 20 }}>×</button>
                </div>

                {selectedProject.description && (
                  <p style={{ fontSize: 13, color: "#8BACC8", marginBottom: 20, lineHeight: 1.6 }}>{selectedProject.description}</p>
                )}

                {[
                  { label: "Type", value: typeLabel[selectedProject.type] || selectedProject.type },
                  { label: "Statut", value: statusLabel[selectedProject.status] || selectedProject.status },
                  { label: "Localisation", value: selectedProject.location || "—" },
                  { label: "Points levés", value: selectedProject.pointsCount?.toString() || "0" },
                  { label: "Créé le", value: new Date(selectedProject.createdAt).toLocaleDateString("fr-FR") },
                ].map(item => (
                  <div key={item.label} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #1E2D3D" }}>
                    <span style={{ fontSize: 12, color: "#64748B" }}>{item.label}</span>
                    <span style={{ fontSize: 12, fontWeight: 600, color: "#E2EAF2" }}>{item.value}</span>
                  </div>
                ))}

                {/* Actions */}
                <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 10 }}>
                  <a href="/search-topo" style={{ background: "#0D47A1", color: "#fff", padding: "10px 16px", borderRadius: 8, textDecoration: "none", fontSize: 13, fontWeight: 600, textAlign: "center" }}>
                    🔍 Rechercher les points du projet
                  </a>
                  <a href="/leve-topo" style={{ background: "rgba(249,115,22,0.15)", color: "#F97316", border: "1px solid rgba(249,115,22,0.3)", padding: "10px 16px", borderRadius: 8, textDecoration: "none", fontSize: 13, fontWeight: 600, textAlign: "center" }}>
                    📄 Générer le Levé Topographique
                  </a>
                  <a href="/rapport-terrain" style={{ background: "rgba(34,197,94,0.1)", color: "#22C55E", border: "1px solid rgba(34,197,94,0.3)", padding: "10px 16px", borderRadius: 8, textDecoration: "none", fontSize: 13, fontWeight: 600, textAlign: "center" }}>
                    📋 Télécharger le Rapport
                  </a>
                </div>

                {/* Contact */}
                <div style={{ marginTop: 20, background: "#0D1117", borderRadius: 8, padding: 16 }}>
                  <div style={{ fontSize: 12, color: "#64748B", marginBottom: 8 }}>📞 Contacter votre technicien</div>
                  <div style={{ fontSize: 13, color: "#E2EAF2" }}>TerraMaps — support@terramaps.ma</div>
                  <div style={{ fontSize: 12, color: "#64748B", marginTop: 4 }}>Lun-Ven 8h-18h</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
