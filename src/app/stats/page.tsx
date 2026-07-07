"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";

export default function StatsPage() {
  const [data, setData] = useState<any>(null);
  const [activity, setActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/dashboard").then(r => r.json()),
      fetch("/api/activity").then(r => r.json()),
    ]).then(([dash, act]) => {
      setData(dash);
      if (Array.isArray(act)) setActivity(act);
      setLoading(false);
    });
  }, []);

  if (loading) return (
    <div style={{ minHeight: "100vh", background: "#0D1117", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ color: "#F97316", fontSize: 16 }}>Chargement des statistiques...</div>
    </div>
  );

  // Préparer données graphiques
  const statusData = data?.statusBreakdown?.map((s: any) => ({
    name: s.status === "active" ? "Actif" : s.status === "draft" ? "Brouillon" : s.status === "completed" ? "Terminé" : s.status === "review" ? "Révision" : s.status,
    value: parseInt(s.count),
  })) || [];

  const typeData = data?.typeBreakdown?.map((t: any) => ({
    name: t.type === "road_design" ? "Route" : t.type === "survey" ? "Levé" : t.type === "terrain_modeling" ? "Terrain" : t.type === "parcel" ? "Parcelle" : t.type,
    value: parseInt(t.count),
  })) || [];

  // Activité par jour
  const actByDay: Record<string, number> = {};
  activity.forEach((a: any) => {
    const day = new Date(a.createdAt).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" });
    actByDay[day] = (actByDay[day] || 0) + 1;
  });
  const activityData = Object.entries(actByDay).slice(-7).map(([day, count]) => ({ day, actions: count }));

  // Top agents
  const agentActivity: Record<string, { name: string, count: number }> = {};
  activity.forEach((a: any) => {
    if (a.userName) {
      if (!agentActivity[a.userName]) agentActivity[a.userName] = { name: a.userName, count: 0 };
      agentActivity[a.userName].count++;
    }
  });
  const topAgents = Object.values(agentActivity).sort((a, b) => b.count - a.count).slice(0, 5);

  const COLORS = ["#F97316", "#3B82F6", "#22C55E", "#A855F7", "#EF4444", "#F59E0B"];

  return (
    <div style={{ minHeight: "100vh", background: "#0D1117", color: "#E2EAF2", fontFamily: "Arial" }}>
      <div style={{ background: "#161B22", borderBottom: "1px solid #1E2D3D", padding: "0 24px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 56 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ fontSize: 18, fontWeight: 700 }}>Terra<span style={{ color: "#F97316" }}>Maps</span></div>
          <span style={{ background: "#A855F7", color: "#fff", fontSize: 10, fontWeight: 700, padding: "2px 10px", borderRadius: 20 }}>STATISTIQUES</span>
        </div>
        <Link href="/dashboard" style={{ color: "#64748B", fontSize: 13, textDecoration: "none" }}>← Dashboard</Link>
      </div>

      <div style={{ padding: 24, maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ fontSize: 48, marginBottom: 8 }}>📊</div>
          <h1 style={{ margin: "0 0 8px", fontSize: 22, fontWeight: 700 }}>Statistiques Avancées</h1>
          <p style={{ color: "#64748B", fontSize: 13 }}>Vue d'ensemble de l'activité TerraMaps</p>
        </div>

        {/* KPIs */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 32 }}>
          {[
            { label: "Total Projets", value: data?.totals?.projects || 0, color: "#F97316", icon: "📁" },
            { label: "Points Levés", value: data?.totals?.points || 0, color: "#3B82F6", icon: "📍" },
            { label: "Alignements", value: data?.totals?.alignments || 0, color: "#22C55E", icon: "🛣️" },
            { label: "Actions totales", value: activity.length, color: "#A855F7", icon: "⚡" },
          ].map(s => (
            <div key={s.label} style={{ background: "#161B22", border: "1px solid #1E2D3D", borderRadius: 12, padding: 20, textAlign: "center" }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>{s.icon}</div>
              <div style={{ fontSize: 28, fontWeight: 700, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 11, color: "#64748B", textTransform: "uppercase", marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 24 }}>
          {/* Activité par jour */}
          <div style={{ background: "#161B22", border: "1px solid #1E2D3D", borderRadius: 12, padding: 24 }}>
            <h3 style={{ margin: "0 0 20px", fontSize: 14, color: "#8BACC8" }}>⚡ Activité des 7 derniers jours</h3>
            {activityData.length === 0 ? (
              <div style={{ textAlign: "center", padding: 40, color: "#64748B" }}>Aucune activité récente</div>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={activityData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1E2D3D" />
                  <XAxis dataKey="day" tick={{ fill: "#64748B", fontSize: 10 }} />
                  <YAxis tick={{ fill: "#64748B", fontSize: 10 }} />
                  <Tooltip contentStyle={{ background: "#161B22", border: "1px solid #1E2D3D", fontSize: 11 }} />
                  <Bar dataKey="actions" fill="#F97316" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Projets par statut */}
          <div style={{ background: "#161B22", border: "1px solid #1E2D3D", borderRadius: 12, padding: 24 }}>
            <h3 style={{ margin: "0 0 20px", fontSize: 14, color: "#8BACC8" }}>📁 Projets par statut</h3>
            {statusData.length === 0 ? (
              <div style={{ textAlign: "center", padding: 40, color: "#64748B" }}>Aucun projet</div>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, value }) => `${name}: ${value}`}>
                    {statusData.map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: "#161B22", border: "1px solid #1E2D3D", fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
          {/* Top agents */}
          <div style={{ background: "#161B22", border: "1px solid #1E2D3D", borderRadius: 12, padding: 24 }}>
            <h3 style={{ margin: "0 0 20px", fontSize: 14, color: "#8BACC8" }}>🏆 Top Agents</h3>
            {topAgents.length === 0 ? (
              <div style={{ textAlign: "center", padding: 40, color: "#64748B" }}>Aucune activité agent</div>
            ) : (
              <div>
                {topAgents.map((agent, i) => (
                  <div key={agent.name} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
                    <div style={{ width: 28, height: 28, borderRadius: "50%", background: `${COLORS[i]}22`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: COLORS[i], flexShrink: 0 }}>
                      {i+1}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                        <span style={{ fontSize: 12, fontWeight: 600, color: "#E2EAF2" }}>{agent.name}</span>
                        <span style={{ fontSize: 12, color: COLORS[i], fontWeight: 700 }}>{agent.count} actions</span>
                      </div>
                      <div style={{ height: 4, background: "#1E2D3D", borderRadius: 2, overflow: "hidden" }}>
                        <div style={{ height: "100%", width: `${(agent.count / topAgents[0].count) * 100}%`, background: COLORS[i], borderRadius: 2 }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Types de projets */}
          <div style={{ background: "#161B22", border: "1px solid #1E2D3D", borderRadius: 12, padding: 24 }}>
            <h3 style={{ margin: "0 0 20px", fontSize: 14, color: "#8BACC8" }}>🗂️ Types de projets</h3>
            {typeData.length === 0 ? (
              <div style={{ textAlign: "center", padding: 40, color: "#64748B" }}>Aucun projet</div>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={typeData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#1E2D3D" />
                  <XAxis type="number" tick={{ fill: "#64748B", fontSize: 10 }} />
                  <YAxis dataKey="name" type="category" tick={{ fill: "#64748B", fontSize: 10 }} width={60} />
                  <Tooltip contentStyle={{ background: "#161B22", border: "1px solid #1E2D3D", fontSize: 11 }} />
                  <Bar dataKey="value" fill="#3B82F6" radius={[0,4,4,0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Activité récente */}
        <div style={{ background: "#161B22", border: "1px solid #1E2D3D", borderRadius: 12, padding: 24, marginTop: 24 }}>
          <h3 style={{ margin: "0 0 16px", fontSize: 14, color: "#8BACC8" }}>📋 Activité récente</h3>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #1E2D3D" }}>
                {["Agent", "Action", "Date"].map(h => (
                  <th key={h} style={{ padding: "6px 10px", color: "#64748B", textAlign: "left", fontSize: 10, textTransform: "uppercase" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {activity.slice(0, 10).map((a: any, i: number) => (
                <tr key={i} style={{ borderBottom: "1px solid #0D1117" }}>
                  <td style={{ padding: "8px 10px", color: "#F97316", fontWeight: 600 }}>{a.userName || "—"}</td>
                  <td style={{ padding: "8px 10px", color: "#8BACC8" }}>{a.action || "—"}</td>
                  <td style={{ padding: "8px 10px", color: "#64748B" }}>{new Date(a.createdAt).toLocaleDateString("fr-FR")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
