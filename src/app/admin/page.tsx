"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface User { id: number; name: string; email: string; role: string; createdAt: string; }

export default function AdminPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [me, setMe] = useState<any>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "agent" });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    fetch("/api/auth/me").then(r => r.json()).then(d => {
      if (!d.user) { router.push("/login"); return; }
      if (d.user.role !== "admin") { router.push("/dashboard"); return; }
      setMe(d.user);
    });
    loadUsers();
  }, []);

  function loadUsers() {
    fetch("/api/users").then(r => r.json()).then(setUsers);
  }

  async function createUser(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/users", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    if (res.ok) { setMsg("✅ Utilisateur créé !"); setShowForm(false); setForm({ name: "", email: "", password: "", role: "agent" }); loadUsers(); }
    else setMsg("❌ Erreur lors de la création");
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

  return (
    <div style={{ minHeight: "100vh", background: "#0D1117", color: "#E2EAF2" }}>
      {/* Header */}
      <div style={{ background: "#161B22", borderBottom: "1px solid #1E2D3D", padding: "16px 32px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ fontSize: 20, fontWeight: 700 }}>Terra<span style={{ color: "#F97316" }}>Maps</span></div>
          <span style={{ background: "#F97316", color: "#fff", fontSize: 11, fontWeight: 700, padding: "2px 10px", borderRadius: 20 }}>ADMIN</span>
        </div>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <Link href="/dashboard" style={{ color: "#64748B", fontSize: 13, textDecoration: "none" }}>← Dashboard</Link>
          <button onClick={logout} style={{ background: "transparent", border: "1px solid #1E2D3D", color: "#64748B", padding: "6px 14px", borderRadius: 8, cursor: "pointer", fontSize: 13 }}>Déconnexion</button>
        </div>
      </div>

      <div style={{ padding: "32px" }}>
        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 32 }}>
          {[
            { label: "Total Utilisateurs", value: users.length, color: "#F97316" },
            { label: "Managers", value: users.filter(u => u.role === "manager").length, color: "#3B82F6" },
            { label: "Agents", value: users.filter(u => u.role === "agent").length, color: "#22C55E" },
          ].map(s => (
            <div key={s.label} style={{ background: "#161B22", border: "1px solid #1E2D3D", borderRadius: 12, padding: "20px 24px" }}>
              <div style={{ fontSize: 32, fontWeight: 700, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 12, color: "#64748B", marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Users table */}
        <div style={{ background: "#161B22", border: "1px solid #1E2D3D", borderRadius: 12, padding: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <h2 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>Gestion des utilisateurs</h2>
            <button onClick={() => setShowForm(!showForm)} style={{ background: "#F97316", border: "none", color: "#fff", padding: "8px 18px", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 600 }}>
              + Nouvel utilisateur
            </button>
          </div>

          {msg && <div style={{ marginBottom: 16, fontSize: 13, color: msg.includes("✅") ? "#22C55E" : "#EF4444" }}>{msg}</div>}

          {/* Create form */}
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
                <button type="button" onClick={() => setShowForm(false)} style={{ background: "transparent", border: "1px solid #1E2D3D", color: "#64748B", padding: "8px 20px", borderRadius: 8, cursor: "pointer", fontSize: 13 }}>
                  Annuler
                </button>
              </div>
            </form>
          )}

          {/* Table */}
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #1E2D3D" }}>
                {["Nom", "Email", "Rôle", "Créé le", "Actions"].map(h => (
                  <th key={h} style={{ textAlign: "left", padding: "10px 12px", fontSize: 11, color: "#64748B", fontWeight: 600, textTransform: "uppercase", letterSpacing: 1 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} style={{ borderBottom: "1px solid #0D1117" }}>
                  <td style={{ padding: "12px", fontSize: 14, fontWeight: 600, color: "#E2EAF2" }}>{u.name}</td>
                  <td style={{ padding: "12px", fontSize: 13, color: "#8BACC8" }}>{u.email}</td>
                  <td style={{ padding: "12px" }}>
                    <span style={{ background: `${roleColor[u.role]}22`, color: roleColor[u.role], fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20, textTransform: "uppercase" }}>{u.role}</span>
                  </td>
                  <td style={{ padding: "12px", fontSize: 12, color: "#4B6080" }}>{new Date(u.createdAt).toLocaleDateString("fr-FR")}</td>
                  <td style={{ padding: "12px" }}>
                    {u.email !== me?.email && (
                      <button onClick={() => deleteUser(u.id)} style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", color: "#EF4444", padding: "4px 12px", borderRadius: 6, cursor: "pointer", fontSize: 12 }}>
                        Supprimer
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr><td colSpan={5} style={{ padding: 30, textAlign: "center", color: "#4B6080", fontSize: 13 }}>Aucun utilisateur. Créez le premier admin.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
