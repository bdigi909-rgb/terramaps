"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

function ActivityFeed() {
  const [logs, setLogs] = useState<any[]>([]);
  useEffect(() => {
    fetch("/api/activity").then(r => r.json()).then(d => { if (Array.isArray(d)) setLogs(d); });
  }, []);
  const actionColor: Record<string, string> = { CREATE: "#22C55E", UPDATE: "#3B82F6", DELETE: "#EF4444", IMPORT: "#F59E0B", LOGIN: "#A855F7", LOGOUT: "#64748B", ASSIGN: "#F97316" };
  const actionIcon: Record<string, string> = { CREATE: "➕", UPDATE: "✏️", DELETE: "🗑️", IMPORT: "📥", LOGIN: "🔑", LOGOUT: "🚪", ASSIGN: "👤" };
  function timeAgo(date: string) {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    if (mins < 1) return "À instant";
    if (mins < 60) return `Il y a ${mins} min`;
    if (hours < 24) return `Il y a ${hours}h`;
    return new Date(date).toLocaleDateString("fr-FR");
  }
  return (
    <div style={{ background: "#161B22", border: "1px solid #1E2D3D", borderRadius: 12, padding: 24 }}>
      <h3 style={{ margin: "0 0 20px", fontSize: 14, fontWeight: 600, color: "#8BACC8" }}>Activité récente ({logs.length} actions)</h3>
      {logs.length === 0 ? (
        <div style={{ textAlign: "center", padding: 40, color: "#4B6080" }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>📋</div>
          <div>Aucune activité enregistrée</div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {logs.map((log: any) => (
            <div key={log.id} style={{ background: "#0D1117", border: "1px solid #1E2D3D", borderRadius: 10, padding: "12px 16px", display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 32, height: 32, borderRadius: "50%", background: `${actionColor[log.action] || "#64748B"}22`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, flexShrink: 0 }}>{actionIcon[log.action] || "⚡"}</div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "#E2EAF2" }}>{log.userName || "Système"}</span>
                  <span style={{ background: `${actionColor[log.action] || "#64748B"}22`, color: actionColor[log.action] || "#64748B", fontSize: 10, fontWeight: 700, padding: "1px 8px", borderRadius: 20 }}>{log.action}</span>
                  <span style={{ fontSize: 11, color: "#64748B" }}>{log.entity}</span>
                </div>
                {log.details && <div style={{ fontSize: 11, color: "#64748B", marginTop: 2 }}>{log.details}</div>}
              </div>
              <div style={{ fontSize: 11, color: "#4B6080", flexShrink: 0 }}>{timeAgo(log.createdAt)}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

interface User { id: number; name: string; email: string; role: string; createdAt: string; }
interface Stats { totalProjects: number; totalPoints: number; totalUsers: number; activeProjects: number; }

export default function AdminPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<Stats>({ totalProjects: 0, totalPoints: 0, totalUsers: 0, activeProjects: 0 });
  const [me, setMe] = useState<any>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "agent" });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [activeTab, setActiveTab] = useState<"overview"|"users"|"activity"|"stats">("overview");
  const [agentStats, setAgentStats] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/dashboard").then(r => r.json()).then(data => {
      if (data?.totals) {
        setStats({
          totalProjects: data.totals.projects || 0,
          totalPoints: data.totals.points || 0,
          totalUsers: 0,
          activeProjects: data.statusBreakdown?.find((s: any) => s.status === "active")?.count || 0,
        });
      }
    });
  }, []);

  useEffect(() => {
    fetch("/api/auth/me").then(r => r.json()).then(d => {
      if (!d.user) { router.push("/login"); return; }
      if (d.user.role !== "admin") { router.push("/dashboard"); return; }
      setMe(d.user);
    });
    loadUsers();
    loadStats();
  }, []);

  function loadUsers() {
    fetch("/api/users").then(r => r.json()).then(data => {
      if (Array.isArray(data)) setUsers(data);
    });
  }

  async function resetPassword(userId: number, userName: string) {
    const newPwd = prompt(`Nouveau mot de passe pour ${userName}:`);
    if (!newPwd) return;
    const res = await fetch("/api/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: userId, password: newPwd })
    });
    if (res.ok) setMsg("✅ Mot de passe réinitialisé pour " + userName);
    else setMsg("❌ Erreur lors de la réinitialisation");
  }

  function loadStats() {
    fetch("/api/dashboard").then(r => r.json()).then(data => {
      if (data?.totals) {
        setStats({
          totalProjects: data.totals.projects || 0,
          totalPoints: data.totals.points || 0,
          totalUsers: 0,
          activeProjects: data.statusBreakdown?.find((s: any) => s.status === "active")?.count || 0,
        });
      }
    });
  }

  async function createUser(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/users", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    if (res.ok) { setMsg("✅ Utilisateur créé !"); setShowForm(false); setForm({ name: "", email: "", password: "", role: "agent" }); loadUsers(); }
    else { const d = await res.json(); setMsg(`❌ ${d.error || "Erreur"}`); }
    setLoading(false);
    setTimeout(() => setMsg(""), 3000);
  }

  async function deleteUser(id: number) {
    if (!confirm("Supprimer cet utilisateur ?")) return;
    await fetch("/api/users", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    loadUsers();
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  const roleColor: Record<string, string> = { admin: "#F97316", manager: "#3B82F6", agent: "#22C55E" };
  const roleBg: Record<string, string> = { admin: "rgba(249,115,22,0.15)", manager: "rgba(59,130,246,0.15)", agent: "rgba(34,197,94,0.15)" };

  const kpis = [
    { label: "Total Projets", value: stats.totalProjects, color: "#F97316", icon: "📁" },
    { label: "Projets Actifs", value: stats.activeProjects, color: "#22C55E", icon: "✅" },
    { label: "Points Topo", value: stats.totalPoints, color: "#3B82F6", icon: "📍" },
    { label: "Utilisateurs", value: users.length, color: "#A855F7", icon: "👥" },
    { label: "Admins", value: users.filter(u => u.role === "admin").length, color: "#F97316", icon: "🔑" },
    { label: "Managers", value: users.filter(u => u.role === "manager").length, color: "#3B82F6", icon: "👔" },
    { label: "Agents", value: users.filter(u => u.role === "agent").length, color: "#22C55E", icon: "🛠️" },
    { label: "Nouveaux (7j)", value: users.filter(u => new Date(u.createdAt) > new Date(Date.now() - 7*24*60*60*1000)).length, color: "#EC4899", icon: "🆕" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#0D1117", color: "#E2EAF2", fontFamily: "Arial, sans-serif" }}>
      {/* Header */}
      <div style={{ background: "#161B22", borderBottom: "1px solid #1E2D3D", padding: "0 32px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 56 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ fontSize: 18, fontWeight: 700 }}>Terra<span style={{ color: "#F97316" }}>Maps</span></div>
          <span style={{ background: "#F97316", color: "#fff", fontSize: 10, fontWeight: 700, padding: "2px 10px", borderRadius: 20, letterSpacing: 1 }}>ADMIN</span>
          <span style={{ color: "#64748B", fontSize: 13 }}>Connecté : {me?.name}</span>
        </div>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <Link href="/dashboard" style={{ color: "#64748B", fontSize: 13, textDecoration: "none" }}>← Dashboard</Link>
          <button onClick={logout} style={{ background: "transparent", border: "1px solid #2A3F5F", color: "#EF4444", padding: "6px 14px", borderRadius: 8, cursor: "pointer", fontSize: 12 }}>Déconnexion</button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ background: "#161B22", borderBottom: "1px solid #1E2D3D", padding: "0 32px", display: "flex", gap: 4 }}>
        {[
          { key: "overview", label: "Vue d'ensemble" },
          { key: "users", label: "Utilisateurs" },
          { key: "activity", label: "Activité" },
          { key: "stats", label: "Stats Agents" },
        ].map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key as any)}
            style={{ background: "transparent", border: "none", borderBottom: activeTab === tab.key ? "2px solid #F97316" : "2px solid transparent", color: activeTab === tab.key ? "#F97316" : "#64748B", padding: "14px 20px", cursor: "pointer", fontSize: 13, fontWeight: activeTab === tab.key ? 600 : 400 }}>
            {tab.label}
          </button>
        ))}
      </div>

      <div style={{ padding: 32 }}>

        {/* ── OVERVIEW TAB ── */}
        {activeTab === "overview" && (
          <>
            {/* KPI Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 32 }}>
              {kpis.map(k => (
                <div key={k.label} style={{ background: "#161B22", border: "1px solid #1E2D3D", borderRadius: 12, padding: "20px 24px", borderLeft: `3px solid ${k.color}` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div>
                      <div style={{ fontSize: 28, fontWeight: 700, color: k.color }}>{k.value}</div>
                      <div style={{ fontSize: 11, color: "#64748B", marginTop: 4, textTransform: "uppercase", letterSpacing: 0.5 }}>{k.label}</div>
                    </div>
                    <div style={{ fontSize: 24 }}>{k.icon}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Role distribution */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
              <div style={{ background: "#161B22", border: "1px solid #1E2D3D", borderRadius: 12, padding: 24 }}>
                <h3 style={{ margin: "0 0 20px", fontSize: 14, fontWeight: 600, color: "#8BACC8" }}>Répartition par rôle</h3>
                {["admin", "manager", "agent"].map(role => {
                  const count = users.filter(u => u.role === role).length;
                  const pct = users.length > 0 ? Math.round((count / users.length) * 100) : 0;
                  return (
                    <div key={role} style={{ marginBottom: 16 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                        <span style={{ fontSize: 12, color: roleColor[role], fontWeight: 600, textTransform: "capitalize" }}>{role}</span>
                        <span style={{ fontSize: 12, color: "#64748B" }}>{count} ({pct}%)</span>
                      </div>
                      <div style={{ height: 6, background: "#1E2D3D", borderRadius: 3 }}>
                        <div style={{ height: 6, borderRadius: 3, background: roleColor[role], width: `${pct}%`, transition: "width 0.5s" }} />
                      </div>
                    </div>
                  );
                })}
              </div>

              <div style={{ background: "#161B22", border: "1px solid #1E2D3D", borderRadius: 12, padding: 24 }}>
                <h3 style={{ margin: "0 0 20px", fontSize: 14, fontWeight: 600, color: "#8BACC8" }}>Informations système</h3>
                {[
                  { label: "Version", value: "TerraMaps v2.0" },
                  { label: "Base de données", value: "PostgreSQL (Neon)" },
                  { label: "Hébergement", value: "Vercel (Production)" },
                  { label: "Authentification", value: "JWT (7 jours)" },
                  { label: "Export", value: "PDF, DXF, CSV, LandXML" },
                  { label: "Formats import", value: "CSV, TXT, XYZ, GSI" },
                ].map(item => (
                  <div key={item.label} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #1E2D3D" }}>
                    <span style={{ fontSize: 12, color: "#64748B" }}>{item.label}</span>
                    <span style={{ fontSize: 12, color: "#E2EAF2", fontWeight: 500 }}>{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* ── USERS TAB ── */}
        {activeTab === "users" && (
          <div style={{ background: "#161B22", border: "1px solid #1E2D3D", borderRadius: 12, padding: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h2 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>Gestion des utilisateurs</h2>
              <button onClick={() => setShowForm(!showForm)} style={{ background: "#F97316", border: "none", color: "#fff", padding: "8px 18px", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 600 }}>
                + Nouvel utilisateur
              </button>
            </div>

            {msg && <div style={{ marginBottom: 16, fontSize: 13, color: msg.includes("✅") ? "#22C55E" : "#EF4444" }}>{msg}</div>}

            {showForm && (
              <form onSubmit={createUser} style={{ background: "#0D1117", border: "1px solid #1E2D3D", borderRadius: 10, padding: 20, marginBottom: 20, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                {[
                  { label: "Nom complet", key: "name", type: "text", placeholder: "Ahmed Benali" },
                  { label: "Email", key: "email", type: "email", placeholder: "ahmed@terramaps.ma" },
                  { label: "Mot de passe", key: "password", type: "password", placeholder: "••••••••" },
                ].map(f => (
                  <div key={f.key}>
                    <label style={{ display: "block", fontSize: 11, color: "#64748B", marginBottom: 4 }}>{f.label}</label>
                    <input type={f.type} placeholder={f.placeholder} value={(form as any)[f.key]}
                      onChange={e => setForm({ ...form, [f.key]: e.target.value })} required
                      style={{ width: "100%", background: "#161B22", border: "1px solid #1E2D3D", borderRadius: 6, padding: "8px 12px", color: "#fff", fontSize: 13, boxSizing: "border-box" }} />
                  </div>
                ))}
                <div>
                  <label style={{ display: "block", fontSize: 11, color: "#64748B", marginBottom: 4 }}>Rôle</label>
                  <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}
                    style={{ width: "100%", background: "#161B22", border: "1px solid #1E2D3D", borderRadius: 6, padding: "8px 12px", color: "#fff", fontSize: 13 }}>
                    <option value="agent">Agent</option>
                    <option value="manager">Manager</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div style={{ gridColumn: "1/-1", display: "flex", gap: 10 }}>
                  <button type="submit" disabled={loading} style={{ background: "#F97316", border: "none", color: "#fff", padding: "8px 20px", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 600 }}>
                    {loading ? "Création..." : "Créer"}
                  </button>
                  <button type="button" onClick={() => setShowForm(false)} style={{ background: "transparent", border: "1px solid #1E2D3D", color: "#64748B", padding: "8px 20px", borderRadius: 8, cursor: "pointer", fontSize: 13 }}>Annuler</button>
                </div>
              </form>
            )}

            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #1E2D3D" }}>
                  {["#", "Nom", "Email", "Rôle", "Créé le", "Actions"].map(h => (
                    <th key={h} style={{ textAlign: "left", padding: "10px 12px", fontSize: 10, color: "#64748B", fontWeight: 600, textTransform: "uppercase", letterSpacing: 1 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map((u, idx) => (
                  <tr key={u.id} style={{ borderBottom: "1px solid #0D1117" }}>
                    <td style={{ padding: "12px", fontSize: 12, color: "#4B6080" }}>{idx + 1}</td>
                    <td style={{ padding: "12px", fontSize: 14, fontWeight: 600, color: "#E2EAF2" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ width: 32, height: 32, borderRadius: "50%", background: roleBg[u.role], display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: roleColor[u.role] }}>
                          {u.name.charAt(0).toUpperCase()}
                        </div>
                        <button onClick={() => resetPassword(u.id, u.name)} style={{ background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.2)", color: "#3B82F6", padding: "4px 12px", borderRadius: 6, cursor: "pointer", fontSize: 11, marginRight: 6 }}>
                          Reset MDP
                        </button>
                        <button onClick={() => deleteUser(u.id)} style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", color: "#EF4444", padding: "4px 12px", borderRadius: 6, cursor: "pointer", fontSize: 11 }}>
                          Supprimer
                        </button>
                      </div>
                    </td>
                    <td style={{ padding: "12px", fontSize: 13, color: "#8BACC8" }}>{u.email}</td>
                    <td style={{ padding: "12px" }}>
                      <span style={{ background: roleBg[u.role], color: roleColor[u.role], fontSize: 10, fontWeight: 700, padding: "3px 10px", borderRadius: 20, textTransform: "uppercase", letterSpacing: 0.5 }}>{u.role}</span>
                    </td>
                    <td style={{ padding: "12px", fontSize: 12, color: "#4B6080" }}>{new Date(u.createdAt).toLocaleDateString("fr-FR")}</td>
                    <td style={{ padding: "12px" }}>
                      {u.email !== me?.email && (
                        <button onClick={() => deleteUser(u.id)} style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", color: "#EF4444", padding: "4px 12px", borderRadius: 6, cursor: "pointer", fontSize: 11 }}>
                          Supprimer
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr><td colSpan={6} style={{ padding: 30, textAlign: "center", color: "#4B6080", fontSize: 13 }}>Aucun utilisateur.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* ── ACTIVITY TAB ── */}
        {/* ── ACTIVITY TAB ── */}
        {activeTab === "activity" && <ActivityFeed />}
        {/* ── STATS TAB ── */}
        {activeTab === "stats" && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 20 }}>
            {users.filter(u => u.role === "agent" || u.role === "manager").map(u => (
              <div key={u.id} style={{ background: "#161B22", border: "1px solid #1E2D3D", borderRadius: 12, padding: 24 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                  <div style={{ width: 44, height: 44, borderRadius: "50%", background: u.role === "manager" ? "rgba(59,130,246,0.2)" : "rgba(34,197,94,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 700, color: u.role === "manager" ? "#3B82F6" : "#22C55E" }}>
                    {u.name.charAt(0)}
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "#E2EAF2" }}>{u.name}</div>
                    <div style={{ fontSize: 11, color: "#64748B" }}>{u.email}</div>
                    <span style={{ background: u.role === "manager" ? "rgba(59,130,246,0.2)" : "rgba(34,197,94,0.2)", color: u.role === "manager" ? "#3B82F6" : "#22C55E", fontSize: 9, fontWeight: 700, padding: "2px 8px", borderRadius: 20, textTransform: "uppercase" }}>{u.role}</span>
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  {[
                    { label: "Membre depuis", value: new Date(u.createdAt).toLocaleDateString("fr-FR"), color: "#64748B" },
                    { label: "Statut", value: "Actif", color: "#22C55E" },
                  ].map(s => (
                    <div key={s.label} style={{ background: "#0D1117", borderRadius: 8, padding: 10 }}>
                      <div style={{ fontSize: 10, color: "#64748B", marginBottom: 4 }}>{s.label}</div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: s.color }}>{s.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            {users.filter(u => u.role === "agent" || u.role === "manager").length === 0 && (
              <div style={{ gridColumn: "1/-1", textAlign: "center", padding: 40, color: "#64748B" }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>👥</div>
                <div>Aucun agent ou manager créé.</div>
                <button onClick={() => setActiveTab("users")} style={{ background: "#F97316", border: "none", color: "#fff", padding: "8px 16px", borderRadius: 8, cursor: "pointer", marginTop: 12, fontSize: 13 }}>
                  + Créer des agents
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
