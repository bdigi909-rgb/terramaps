"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Project { id: number; name: string; type: string; status: string; client?: string; assignedTo?: number; }
interface User { id: number; name: string; email: string; role: string; }

export default function AssignPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [me, setMe] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/auth/me").then(r => r.json()).then(d => {
      if (!d.user) { router.push("/login"); return; }
      if (d.user.role === "agent") { router.push("/dashboard"); return; }
      setMe(d.user);
    });
    fetch("/api/projects").then(r => r.json()).then(data => { if (Array.isArray(data)) setProjects(data); });
    fetch("/api/users").then(r => r.json()).then(data => { if (Array.isArray(data)) setUsers(data.filter((u: User) => u.role === "agent" || u.role === "manager")); });
  }, []);

  async function assign(projectId: number, userId: number | null) {
    setLoading(true);
    const res = await fetch("/api/projects/assign", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ projectId, userId }),
    });
    if (res.ok) {
      setProjects(prev => prev.map(p => p.id === projectId ? { ...p, assignedTo: userId || undefined } : p));
      setMsg("✅ Assignation mise à jour !");
      setTimeout(() => setMsg(""), 2000);
    }
    setLoading(false);
  }

  const filtered = projects.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.client || "").toLowerCase().includes(search.toLowerCase())
  );

  const statusColor: Record<string, string> = {
    active: "#22C55E", draft: "#64748B", review: "#F59E0B", completed: "#3B82F6", archived: "#4B6080"
  };

  const roleColor: Record<string, string> = { admin: "#F97316", manager: "#3B82F6", agent: "#22C55E" };

  return (
    <div style={{ minHeight: "100vh", background: "#0D1117", color: "#E2EAF2", fontFamily: "Arial, sans-serif" }}>
      {/* Header */}
      <div style={{ background: "#161B22", borderBottom: "1px solid #1E2D3D", padding: "0 32px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 56 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ fontSize: 18, fontWeight: 700 }}>Terra<span style={{ color: "#F97316" }}>Maps</span></div>
          <span style={{ background: "#3B82F6", color: "#fff", fontSize: 10, fontWeight: 700, padding: "2px 10px", borderRadius: 20, letterSpacing: 1 }}>ASSIGNATION</span>
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <Link href="/admin" style={{ color: "#64748B", fontSize: 13, textDecoration: "none" }}>← Admin</Link>
          <Link href="/dashboard" style={{ color: "#64748B", fontSize: 13, textDecoration: "none" }}>Dashboard</Link>
        </div>
      </div>

      <div style={{ padding: 32 }}>
        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 32 }}>
          {[
            { label: "Total Projets", value: projects.length, color: "#F97316" },
            { label: "Assignés", value: projects.filter(p => p.assignedTo).length, color: "#22C55E" },
            { label: "Non assignés", value: projects.filter(p => !p.assignedTo).length, color: "#EF4444" },
            { label: "Agents disponibles", value: users.length, color: "#3B82F6" },
          ].map(s => (
            <div key={s.label} style={{ background: "#161B22", border: "1px solid #1E2D3D", borderRadius: 12, padding: "16px 20px", borderLeft: `3px solid ${s.color}` }}>
              <div style={{ fontSize: 26, fontWeight: 700, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 11, color: "#64748B", marginTop: 4, textTransform: "uppercase" }}>{s.label}</div>
            </div>
          ))}
        </div>

        {msg && (
          <div style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.3)", borderRadius: 8, padding: "10px 16px", marginBottom: 16, fontSize: 13, color: "#22C55E" }}>
            {msg}
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 24 }}>
          {/* Projects list */}
          <div style={{ background: "#161B22", border: "1px solid #1E2D3D", borderRadius: 12, padding: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h2 style={{ margin: 0, fontSize: 15, fontWeight: 600 }}>Assignation des projets</h2>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher..."
                style={{ background: "#0D1117", border: "1px solid #1E2D3D", borderRadius: 8, padding: "6px 12px", color: "#fff", fontSize: 12, width: 200 }} />
            </div>

            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #1E2D3D" }}>
                  {["Projet", "Type", "Statut", "Assigné à", "Action"].map(h => (
                    <th key={h} style={{ textAlign: "left", padding: "10px 12px", fontSize: 10, color: "#64748B", fontWeight: 600, textTransform: "uppercase", letterSpacing: 1 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(p => {
                  const assignedUser = users.find(u => u.id === p.assignedTo);
                  return (
                    <tr key={p.id} style={{ borderBottom: "1px solid #0D1117" }}>
                      <td style={{ padding: "12px", fontSize: 13, fontWeight: 600, color: "#E2EAF2" }}>{p.name}</td>
                      <td style={{ padding: "12px", fontSize: 11, color: "#64748B" }}>{p.type}</td>
                      <td style={{ padding: "12px" }}>
                        <span style={{ background: `${statusColor[p.status]}22`, color: statusColor[p.status], fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 20, textTransform: "uppercase" }}>
                          {p.status}
                        </span>
                      </td>
                      <td style={{ padding: "12px" }}>
                        {assignedUser ? (
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <div style={{ width: 24, height: 24, borderRadius: "50%", background: "rgba(34,197,94,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "#22C55E" }}>
                              {assignedUser.name.charAt(0)}
                            </div>
                            <span style={{ fontSize: 12, color: "#E2EAF2" }}>{assignedUser.name}</span>
                          </div>
                        ) : (
                          <span style={{ fontSize: 11, color: "#EF4444" }}>Non assigné</span>
                        )}
                      </td>
                      <td style={{ padding: "12px" }}>
                        <select
                          value={p.assignedTo || ""}
                          onChange={e => assign(p.id, e.target.value ? parseInt(e.target.value) : null)}
                          disabled={loading}
                          style={{ background: "#0D1117", border: "1px solid #1E2D3D", borderRadius: 6, padding: "5px 8px", color: "#fff", fontSize: 11, cursor: "pointer" }}
                        >
                          <option value="">-- Non assigné --</option>
                          {users.map(u => (
                            <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr><td colSpan={5} style={{ padding: 30, textAlign: "center", color: "#4B6080", fontSize: 13 }}>Aucun projet trouvé.</td></tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Agents panel */}
          <div style={{ background: "#161B22", border: "1px solid #1E2D3D", borderRadius: 12, padding: 24 }}>
            <h3 style={{ margin: "0 0 20px", fontSize: 14, fontWeight: 600, color: "#8BACC8" }}>Agents & Managers</h3>
            {users.map(u => {
              const assignedCount = projects.filter(p => p.assignedTo === u.id).length;
              return (
                <div key={u.id} style={{ background: "#0D1117", border: "1px solid #1E2D3D", borderRadius: 10, padding: "14px 16px", marginBottom: 12 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
                    <div style={{ width: 36, height: 36, borderRadius: "50%", background: `${roleColor[u.role]}22`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700, color: roleColor[u.role] }}>
                      {u.name.charAt(0)}
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "#E2EAF2" }}>{u.name}</div>
                      <div style={{ fontSize: 11, color: "#64748B" }}>{u.email}</div>
                    </div>
                    <span style={{ marginLeft: "auto", background: `${roleColor[u.role]}22`, color: roleColor[u.role], fontSize: 9, fontWeight: 700, padding: "2px 8px", borderRadius: 20, textTransform: "uppercase" }}>{u.role}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 11, color: "#64748B" }}>Projets assignés</span>
                    <span style={{ fontSize: 14, fontWeight: 700, color: assignedCount > 0 ? "#22C55E" : "#4B6080" }}>{assignedCount}</span>
                  </div>
                  <div style={{ height: 4, background: "#1E2D3D", borderRadius: 2, marginTop: 6 }}>
                    <div style={{ height: 4, borderRadius: 2, background: roleColor[u.role], width: `${Math.min((assignedCount / Math.max(projects.length, 1)) * 100, 100)}%` }} />
                  </div>
                  {projects.filter(p => p.assignedTo === u.id).map(p => (
                    <div key={p.id} style={{ fontSize: 11, color: "#8BACC8", marginTop: 6, padding: "4px 8px", background: "#161B22", borderRadius: 4 }}>
                      📁 {p.name}
                    </div>
                  ))}
                </div>
              );
            })}
            {users.length === 0 && (
              <div style={{ textAlign: "center", padding: 20, color: "#4B6080", fontSize: 13 }}>
                Aucun agent disponible.<br />
                <Link href="/admin" style={{ color: "#F97316", fontSize: 12 }}>Créer des agents →</Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
