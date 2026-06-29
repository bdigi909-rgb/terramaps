"use client";
import { useEffect, useState } from "react";
import AppShell from "@/components/AppShell";
import Header from "@/components/Header";
import Link from "next/link";
import {
  FolderOpen, Compass, Route, BarChart3, TrendingUp, TrendingDown,
  Activity, Plus, ArrowRight, Mountain, Map, Layers, Clock, CheckCircle,
  AlertCircle, Circle, Archive, Edit3,
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
} from "recharts";

const STATUS_COLORS: Record<string, string> = {
  draft: "#4b6080",
  active: "#4ade80",
  review: "#facc15",
  completed: "#60a5fa",
  archived: "#2a4060",
};

const TYPE_COLORS = ["#f97316", "#3b82f6", "#10b981", "#8b5cf6", "#ec4899", "#14b8a6"];

const TYPE_LABELS: Record<string, string> = {
  road_design: "Road Design",
  terrain_modeling: "Terrain Modeling",
  survey: "Survey",
  drainage: "Drainage",
  parcel: "Parcel",
  infrastructure: "Infrastructure",
};

const STATUS_ICON: Record<string, React.ReactNode> = {
  draft: <Circle size={12} />,
  active: <Activity size={12} />,
  review: <AlertCircle size={12} />,
  completed: <CheckCircle size={12} />,
  archived: <Archive size={12} />,
};

// Sample monthly activity data
const monthlyData = [
  { month: "Jan", projects: 2, points: 120, volume: 4500 },
  { month: "Fev", projects: 3, points: 240, volume: 7200 },
  { month: "Mar", projects: 2, points: 180, volume: 5100 },
  { month: "Avr", projects: 5, points: 400, volume: 9800 },
  { month: "Mai", projects: 4, points: 320, volume: 8400 },
  { month: "Jun", projects: 6, points: 510, volume: 12000 },
];

interface DashboardData {
  totals: { projects: number; points: number; alignments: number; entities: number };
  statusBreakdown: { status: string; count: number }[];
  typeBreakdown: { type: string; count: number }[];
  recentProjects: {
    id: number; name: string; type: string; status: string; client?: string; updatedAt: string;
  }[];
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard")
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const stats = [
    {
      label: "Total Projects",
      value: data?.totals.projects ?? 0,
      icon: FolderOpen,
      color: "#f97316",
      bg: "rgba(249,115,22,0.1)",
      href: "/projects",
      change: "+2 ce mois",
      up: true,
    },
    {
      label: "Survey Points",
      value: data?.totals.points ?? 0,
      icon: Compass,
      color: "#3b82f6",
      bg: "rgba(59,130,246,0.1)",
      href: "/survey",
      change: "+180 total",
      up: true,
    },
    {
      label: "Alignments",
      value: data?.totals.alignments ?? 0,
      icon: Route,
      color: "#10b981",
      bg: "rgba(16,185,129,0.1)",
      href: "/alignment",
      change: "Axes de routes",
      up: true,
    },
    {
      label: "Drawing Entities",
      value: data?.totals.entities ?? 0,
      icon: Map,
      color: "#8b5cf6",
      bg: "rgba(139,92,246,0.1)",
      href: "/canvas",
      change: "Entités dessinées",
      up: false,
    },
  ];

  return (
    <AppShell>
      <Header
        title="Tableau de Bord"
        subtitle="Vue d'ensemble de vos projets SRM"
        actions={
          <Link href="/projects" className="btn-primary" style={{ textDecoration: "none" }}>
            <Plus size={16} />
            Nouveau Projet
          </Link>
        }
      />

      <main style={{ padding: "24px", flex: 1, overflowY: "auto" }}>
        {/* Welcome banner */}
        <div
          style={{
            background: "linear-gradient(135deg, #0f1923 0%, #1a2f46 50%, #162030 100%)",
            border: "1px solid #1e3048",
            borderRadius: 12,
            padding: "20px 24px",
            marginBottom: 24,
            display: "flex",
            alignItems: "center",
            gap: 20,
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute", right: 0, top: 0, bottom: 0, width: 300,
              background: "linear-gradient(90deg, transparent, rgba(249,115,22,0.05))",
              pointerEvents: "none",
            }}
          />
          <div
            style={{
              width: 48, height: 48, borderRadius: 12,
              background: "linear-gradient(135deg, #f97316, #ea580c)",
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <Mountain size={24} color="white" />
          </div>
          <div style={{ flex: 1 }}>
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "#e2eaf2" }}>
              Bienvenue dans TerraMaps
            </h2>
            <p style={{ margin: "4px 0 0", fontSize: 13, color: "#8bacc8" }}>
              Plateforme intégrée de topographie, modélisation de terrain et conception routière — compatible Covadis & LandXML
            </p>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <Link href="/projects" style={{ textDecoration: "none" }}>
              <button className="btn-primary">
                <FolderOpen size={14} /> Mes Projets
              </button>
            </Link>
            <Link href="/canvas" style={{ textDecoration: "none" }}>
              <button className="btn-secondary">
                <Map size={14} /> Ouvrir Canvas
              </button>
            </Link>
          </div>
        </div>

        {/* KPI Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 24 }}>
          {stats.map((s) => (
            <Link key={s.label} href={s.href} style={{ textDecoration: "none" }}>
              <div className="stat-card" style={{ cursor: "pointer", transition: "border-color 0.15s" }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                  <div
                    style={{
                      width: 38, height: 38, borderRadius: 9, background: s.bg,
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}
                  >
                    <s.icon size={18} color={s.color} />
                  </div>
                  <span style={{ fontSize: 11, color: s.up ? "#4ade80" : "#f87171", display: "flex", alignItems: "center", gap: 3 }}>
                    {s.up ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                    {s.change}
                  </span>
                </div>
                <div className="stat-value" style={{ color: s.color }}>
                  {loading ? "—" : s.value.toLocaleString()}
                </div>
                <div className="stat-label">{s.label}</div>
              </div>
            </Link>
          ))}
        </div>

        {/* Charts row */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 340px", gap: 16, marginBottom: 24 }}>
          {/* Area chart */}
          <div className="srm-card">
            <h3 style={{ margin: "0 0 16px", fontSize: 13, fontWeight: 600, color: "#8bacc8" }}>
              Activité mensuelle — Points de levé
            </h3>
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={monthlyData}>
                <defs>
                  <linearGradient id="gradPoints" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" tick={{ fill: "#4b6080", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#4b6080", fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: "#111c28", border: "1px solid #1e3048", borderRadius: 6 }}
                  labelStyle={{ color: "#8bacc8" }}
                  itemStyle={{ color: "#3b82f6" }}
                />
                <Area type="monotone" dataKey="points" stroke="#3b82f6" fill="url(#gradPoints)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Bar chart */}
          <div className="srm-card">
            <h3 style={{ margin: "0 0 16px", fontSize: 13, fontWeight: 600, color: "#8bacc8" }}>
              Volumes de terrassement (m³)
            </h3>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={monthlyData} barSize={20}>
                <XAxis dataKey="month" tick={{ fill: "#4b6080", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#4b6080", fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: "#111c28", border: "1px solid #1e3048", borderRadius: 6 }}
                  labelStyle={{ color: "#8bacc8" }}
                  itemStyle={{ color: "#f97316" }}
                />
                <Bar dataKey="volume" fill="#f97316" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Pie chart — project types */}
          <div className="srm-card">
            <h3 style={{ margin: "0 0 8px", fontSize: 13, fontWeight: 600, color: "#8bacc8" }}>
              Types de projets
            </h3>
            {(data?.typeBreakdown?.length ?? 0) === 0 ? (
              <div style={{ color: "#4b6080", fontSize: 12, textAlign: "center", padding: "40px 0" }}>
                Créez vos premiers projets
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie
                    data={data?.typeBreakdown ?? []}
                    dataKey="count"
                    nameKey="type"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={3}
                  >
                    {(data?.typeBreakdown ?? []).map((_, i) => (
                      <Cell key={i} fill={TYPE_COLORS[i % TYPE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ background: "#111c28", border: "1px solid #1e3048", borderRadius: 6 }}
                    formatter={(val, name) => [val, TYPE_LABELS[name as string] ?? name]}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Recent projects + quick actions */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 16 }}>
          {/* Recent projects */}
          <div className="srm-card">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <h3 style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "#8bacc8" }}>
                Projets récents
              </h3>
              <Link href="/projects" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: "#f97316" }}>
                Voir tout <ArrowRight size={12} />
              </Link>
            </div>
            {loading ? (
              <div style={{ color: "#4b6080", fontSize: 13 }}>Chargement...</div>
            ) : (data?.recentProjects?.length ?? 0) === 0 ? (
              <div style={{ textAlign: "center", padding: "30px 0" }}>
                <FolderOpen size={32} color="#2a4060" style={{ marginBottom: 8 }} />
                <p style={{ color: "#4b6080", fontSize: 13, margin: 0 }}>Aucun projet. Commencez maintenant!</p>
                <Link href="/projects" style={{ textDecoration: "none" }}>
                  <button className="btn-primary" style={{ marginTop: 12 }}>
                    <Plus size={14} /> Créer un projet
                  </button>
                </Link>
              </div>
            ) : (
              <table className="srm-table">
                <thead>
                  <tr>
                    <th>Nom</th>
                    <th>Type</th>
                    <th>Statut</th>
                    <th>Client</th>
                    <th>Modifié</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {data?.recentProjects.map((p) => (
                    <tr key={p.id}>
                      <td style={{ fontWeight: 600, color: "#e2eaf2" }}>{p.name}</td>
                      <td>
                        <span style={{ fontSize: 11, color: "#8bacc8" }}>
                          {TYPE_LABELS[p.type] ?? p.type}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`badge badge-${p.status}`}
                          style={{ display: "inline-flex", alignItems: "center", gap: 3 }}
                        >
                          {STATUS_ICON[p.status]}
                          {p.status}
                        </span>
                      </td>
                      <td style={{ color: "#8bacc8" }}>{p.client || "—"}</td>
                      <td style={{ color: "#4b6080", fontSize: 11 }}>
                        {new Date(p.updatedAt).toLocaleDateString("fr-FR")}
                      </td>
                      <td>
                        <Link href={`/projects/${p.id}`} style={{ color: "#f97316" }}>
                          <Edit3 size={13} />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Quick actions */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div className="srm-card">
              <h3 style={{ margin: "0 0 12px", fontSize: 13, fontWeight: 600, color: "#8bacc8" }}>
                Actions rapides
              </h3>
              {[
                { label: "Nouveau Projet Route", icon: Route, color: "#f97316", href: "/projects" },
                { label: "Importer Points Topo", icon: Compass, color: "#3b82f6", href: "/survey" },
                { label: "Calculer Volumes", icon: BarChart3, color: "#10b981", href: "/volumes" },
                { label: "Ouvrir Planche", icon: Map, color: "#8b5cf6", href: "/canvas" },
                { label: "Modèle Terrain", icon: Mountain, color: "#ec4899", href: "/terrain" },
                { label: "Gérer Calques", icon: Layers, color: "#14b8a6", href: "/layers" },
              ].map((action) => (
                <Link
                  key={action.label}
                  href={action.href}
                  style={{ textDecoration: "none" }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      padding: "8px 10px",
                      borderRadius: 7,
                      marginBottom: 4,
                      cursor: "pointer",
                      transition: "background 0.15s",
                      border: "1px solid transparent",
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLDivElement).style.background = "#1e3048";
                      (e.currentTarget as HTMLDivElement).style.borderColor = "#2a4060";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLDivElement).style.background = "transparent";
                      (e.currentTarget as HTMLDivElement).style.borderColor = "transparent";
                    }}
                  >
                    <div
                      style={{
                        width: 28, height: 28, borderRadius: 6,
                        background: `${action.color}18`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}
                    >
                      <action.icon size={14} color={action.color} />
                    </div>
                    <span style={{ fontSize: 12, color: "#c8daea" }}>{action.label}</span>
                    <ArrowRight size={12} color="#2a4060" style={{ marginLeft: "auto" }} />
                  </div>
                </Link>
              ))}
            </div>

            {/* Status breakdown */}
            <div className="srm-card">
              <h3 style={{ margin: "0 0 12px", fontSize: 13, fontWeight: 600, color: "#8bacc8" }}>
                Statuts projets
              </h3>
              {["draft", "active", "review", "completed", "archived"].map((st) => {
                const row = data?.statusBreakdown.find((r) => r.status === st);
                const cnt = row?.count ?? 0;
                const total = data?.totals.projects ?? 1;
                const pct = total > 0 ? Math.round((Number(cnt) / Number(total)) * 100) : 0;
                return (
                  <div key={st} style={{ marginBottom: 8 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3, fontSize: 11, color: "#8bacc8" }}>
                      <span style={{ textTransform: "capitalize" }}>{st}</span>
                      <span style={{ color: STATUS_COLORS[st] }}>{cnt}</span>
                    </div>
                    <div style={{ height: 4, background: "#1e3048", borderRadius: 2 }}>
                      <div
                        style={{
                          height: 4, borderRadius: 2,
                          background: STATUS_COLORS[st],
                          width: `${pct}%`,
                          transition: "width 0.5s",
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Quick info bar */}
        <div
          style={{
            marginTop: 16,
            display: "flex",
            gap: 16,
            padding: "12px 16px",
            background: "var(--card-bg)",
            border: "1px solid var(--border)",
            borderRadius: 10,
            flexWrap: "wrap",
          }}
        >
          {[
            { icon: Clock, label: "Dernière sync", value: "--:--:--" },
            { icon: Activity, label: "Moteur", value: "Drizzle ORM + PostgreSQL" },
            { icon: Mountain, label: "DTM Engine", value: "Delaunay Triangulation" },
            { icon: Layers, label: "Format", value: "DWG / LandXML / DXF" },
            { icon: Route, label: "Normes", value: "SETRA / LCPC / Eurocode" },
          ].map((item) => (
            <div key={item.label} style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <item.icon size={14} color="#4b6080" />
              <span style={{ fontSize: 11, color: "#4b6080" }}>{item.label}:</span>
              <span style={{ fontSize: 11, color: "#8bacc8", fontWeight: 500 }}>{item.value}</span>
            </div>
          ))}
        </div>
      </main>
    </AppShell>
  );
}

