"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Log {
  id: number;
  userId?: number;
  userName?: string;
  action: string;
  entity: string;
  entityId?: number;
  details?: string;
  createdAt: string;
}

export default function ActivityPage() {
  const router = useRouter();
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterAction, setFilterAction] = useState("all");
  const [filterUser, setFilterUser] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/auth/me").then(r => r.json()).then(d => {
      if (!d.user) { router.push("/login"); return; }
      if (d.user.role === "agent") { router.push("/dashboard"); return; }
    });
    fetch("/api/activity").then(r => r.json()).then(data => {
      if (Array.isArray(data)) setLogs(data);
      setLoading(false);
    });
  }, []);

  const actionColor: Record<string, string> = {
    CREATE: "#22C55E", UPDATE: "#3B82F6", DELETE: "#EF4444",
    IMPORT: "#F59E0B", LOGIN: "#A855F7", LOGOUT: "#64748B", ASSIGN: "#F97316",
  };

  const actionIcon: Record<string, string> = {
    CREATE: "➕", UPDATE: "✏️", DELETE: "🗑️",
    IMPORT: "📥", LOGIN: "🔑", LOGOUT: "🚪", ASSIGN: "👤",
  };

  const entityIcon: Record<string, string> = {
    project: "📁", survey_point: "📍", alignment: "🛣️",
    user: "👥", layer: "🗂️", entity: "✏️",
  };

  const filtered = logs.filter(l => {
    const matchFilter = (filter === "all" || l.action === filter) && (filterAction === "all" || l.action === filterAction);
    const matchSearch = search === "" ||
      (l.userName || "").toLowerCase().includes(search.toLowerCase()) ||
      l.action.toLowerCase().includes(search.toLowerCase()) ||
      l.entity.toLowerCase().includes(search.toLowerCase()) ||
      (l.details || "").toLowerCase().includes(search.toLowerCase());
    const matchUser = !filterUser || (l.userName || "").toLowerCase().includes(filterUser.toLowerCase());
    const matchDate = !filterDate || l.createdAt.startsWith(filterDate);
    return matchFilter && matchSearch && matchUser && matchDate;
  });

  function timeAgo(date: string) {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (mins < 1) return "À l'instant";
    if (mins < 60) return `Il y a ${mins} min`;
    if (hours < 24) return `Il y a ${hours}h`;
    return `Il y a ${days}j`;
  }

  return (
    <div style={{ minHeight: "100vh", background: "#0D1117", color: "#E2EAF2", fontFamily: "Arial, sans-serif" }}>
      {/* Header */}
      <div style={{ background: "#161B22", borderBottom: "1px solid #1E2D3D", padding: "0 32px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 56 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ fontSize: 18, fontWeight: 700 }}>Terra<span style={{ color: "#F97316" }}>Maps</span></div>
          <span style={{ background: "#A855F7", color: "#fff", fontSize: 10, fontWeight: 700, padding: "2px 10px", borderRadius: 20, letterSpacing: 1 }}>ACTIVITÉ</span>
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
            { label: "Total Actions", value: logs.length, color: "#A855F7" },
            { label: "Créations", value: logs.filter(l => l.action === "CREATE").length, color: "#22C55E" },
            { label: "Modifications", value: logs.filter(l => l.action === "UPDATE").length, color: "#3B82F6" },
            { label: "Suppressions", value: logs.filter(l => l.action === "DELETE").length, color: "#EF4444" },
          ].map(s => (
            <div key={s.label} style={{ background: "#161B22", border: "1px solid #1E2D3D", borderRadius: 12, padding: "16px 20px", borderLeft: `3px solid ${s.color}` }}>
              <div style={{ fontSize: 26, fontWeight: 700, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 11, color: "#64748B", marginTop: 4, textTransform: "uppercase" }}>{s.label}</div>
            </div>
          ))}
        </div>
        {/* Filtres */}
        <div style={{ display: "flex", gap: 12, marginBottom: 24, flexWrap: "wrap" }}>
        <div style={{ display: "flex", gap: 12, marginBottom: 24, flexWrap: "wrap" }}>
          <select value={filterAction} onChange={e => setFilterAction(e.target.value)}
            style={{ background: "#161B22", border: "1px solid #1E2D3D", borderRadius: 8, padding: "8px 12px", color: "#E2EAF2", fontSize: 13 }}>
            <option value="all">Toutes les actions</option>
            <option value="CREATE">➕ Créations</option>
            <option value="UPDATE">✏️ Modifications</option>
            <option value="DELETE">🗑️ Suppressions</option>
            <option value="IMPORT">📥 Imports</option>
            <option value="LOGIN">🔑 Connexions</option>
          </select>
          <input value={filterUser} onChange={e => setFilterUser(e.target.value)}
            placeholder="Filtrer par utilisateur..."
            style={{ background: "#161B22", border: "1px solid #1E2D3D", borderRadius: 8, padding: "8px 12px", color: "#E2EAF2", fontSize: 13, minWidth: 200 }} />
          <input type="date" value={filterDate} onChange={e => setFilterDate(e.target.value)}
            style={{ background: "#161B22", border: "1px solid #1E2D3D", borderRadius: 8, padding: "8px 12px", color: "#E2EAF2", fontSize: 13 }} />
          {(filterAction !== "all" || filterUser || filterDate) && (
            <button onClick={() => { setFilterAction("all"); setFilterUser(""); setFilterDate(""); }}
              style={{ background: "#EF4444", border: "none", color: "#fff", padding: "8px 16px", borderRadius: 8, cursor: "pointer", fontSize: 13 }}>
              ✕ Effacer filtres
            </button>
          )}
          <span style={{ color: "#64748B", fontSize: 13, padding: "8px 0" }}>{filtered.length} résultats</span>
        </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div style={{ background: "#161B22", border: "1px solid #1E2D3D", borderRadius: 12, padding: 24 }}>
          <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 Rechercher..."
              style={{ background: "#0D1117", border: "1px solid #1E2D3D", borderRadius: 8, padding: "8px 14px", color: "#fff", fontSize: 13, flex: 1, minWidth: 200 }} />
            <div style={{ display: "flex", gap: 6 }}>
              {["all", "CREATE", "UPDATE", "DELETE", "IMPORT", "LOGIN", "ASSIGN"].map(f => (
                <button key={f} onClick={() => setFilter(f)}
                  style={{ background: filter === f ? (actionColor[f] || "#F97316") : "#0D1117", border: `1px solid ${filter === f ? (actionColor[f] || "#F97316") : "#1E2D3D"}`, color: filter === f ? "#fff" : "#64748B", padding: "6px 12px", borderRadius: 6, cursor: "pointer", fontSize: 11, fontWeight: filter === f ? 600 : 400 }}>
                  {f === "all" ? "Tout" : f}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div style={{ textAlign: "center", padding: 40, color: "#64748B" }}>Chargement...</div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: "center", padding: 60 }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>📋</div>
              <div style={{ fontSize: 14, color: "#64748B", marginBottom: 8 }}>Aucune activité enregistrée</div>
              <div style={{ fontSize: 12, color: "#4B6080" }}>Les actions des utilisateurs apparaîtront ici automatiquement.</div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {filtered.map(log => (
                <div key={log.id} style={{ background: "#0D1117", border: "1px solid #1E2D3D", borderRadius: 10, padding: "14px 16px", display: "flex", alignItems: "center", gap: 16 }}>
                  {/* Action badge */}
                  <div style={{ width: 36, height: 36, borderRadius: "50%", background: `${actionColor[log.action] || "#64748B"}22`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>
                    {actionIcon[log.action] || "⚡"}
                  </div>
                  {/* Content */}
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: "#E2EAF2" }}>{log.userName || "Système"}</span>
                      <span style={{ background: `${actionColor[log.action] || "#64748B"}22`, color: actionColor[log.action] || "#64748B", fontSize: 10, fontWeight: 700, padding: "1px 8px", borderRadius: 20 }}>{log.action}</span>
                      <span style={{ fontSize: 11, color: "#64748B" }}>{entityIcon[log.entity] || "📄"} {log.entity}</span>
                      {log.entityId && <span style={{ fontSize: 11, color: "#4B6080" }}>#{log.entityId}</span>}
                    </div>
                    {log.details && <div style={{ fontSize: 12, color: "#64748B" }}>{log.details}</div>}
                  </div>
                  {/* Time */}
                  <div style={{ fontSize: 11, color: "#4B6080", flexShrink: 0, textAlign: "right" }}>
                    <div>{timeAgo(log.createdAt)}</div>
                    <div style={{ marginTop: 2 }}>{new Date(log.createdAt).toLocaleDateString("fr-FR")}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
