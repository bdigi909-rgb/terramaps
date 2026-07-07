"use client";
import { useEffect, useState } from "react";
import AppShell from "@/components/AppShell";
import Header from "@/components/Header";
import Link from "next/link";
import {
  Plus, FolderOpen, Search, Filter, Edit3, Trash2, MoreVertical,
  MapPin, User, Calendar, Route, Mountain, Compass, Droplets,
  Home, Building2, Activity, X, ChevronDown,
} from "lucide-react";

const TYPE_LABELS: Record<string, string> = {
  road_design: "Conception Route",
  terrain_modeling: "Modèle Terrain",
  survey: "Levé Topographique",
  drainage: "Drainage/VRD",
  parcel: "Parcellaire",
  infrastructure: "Infrastructure",
};

const TYPE_ICONS: Record<string, React.ReactNode> = {
  road_design: <Route size={14} />,
  terrain_modeling: <Mountain size={14} />,
  survey: <Compass size={14} />,
  drainage: <Droplets size={14} />,
  parcel: <Home size={14} />,
  infrastructure: <Building2 size={14} />,
};

const STATUS_LABELS: Record<string, string> = {
  draft: "Brouillon",
  active: "Actif",
  review: "En révision",
  completed: "Terminé",
  archived: "Archivé",
};

interface Project {
  id: number;
  name: string;
  description?: string;
  type: string;
  status: string;
  client?: string;
  location?: string;
  epsgCode?: string;
  createdAt: string;
  updatedAt: string;
}

const EMPTY_FORM = {
  name: "",
  description: "",
  type: "road_design",
  status: "draft",
  client: "",
  location: "",
  epsgCode: "2154",
};

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterClient, setFilterClient] = useState("");
  const [sortBy, setSortBy] = useState("date");
  const [sortOrder, setSortOrder] = useState("desc");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [view, setView] = useState<"grid" | "list">("grid");

  const fetchProjects = () => {
    setLoading(true);
    fetch("/api/projects")
      .then((r) => r.json())
      .then((d) => { setProjects(d); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { fetchProjects(); }, []);

  const handleCreate = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false);
    setShowModal(false);
    setForm(EMPTY_FORM);
    fetchProjects();
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Supprimer ce projet et toutes ses données ?")) return;
    await fetch(`/api/projects/${id}`, { method: "DELETE" });
    fetchProjects();
  };

  const filtered = projects.filter((p) => {
    const matchSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.client ?? "").toLowerCase().includes(search.toLowerCase()) ||
      (p.location ?? "").toLowerCase().includes(search.toLowerCase());
    const matchType = filterType === "all" || p.type === filterType;
    const matchStatus = filterStatus === "all" || p.status === filterStatus;
    const matchClient = !filterClient || (p.client ?? "").toLowerCase().includes(filterClient.toLowerCase());
    return matchSearch && matchType && matchStatus && matchClient;
  }).sort((a, b) => {
    if (sortBy === "date") return sortOrder === "desc" ? new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime() : new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
    if (sortBy === "name") return sortOrder === "desc" ? b.name.localeCompare(a.name) : a.name.localeCompare(b.name);
    if (sortBy === "points") return sortOrder === "desc" ? (b.pointsCount||0) - (a.pointsCount||0) : (a.pointsCount||0) - (b.pointsCount||0);
    return 0;
  });

  return (
    <AppShell>
      <Header
        title="Projets"
        subtitle={`${projects.length} projet(s) au total`}
        actions={
          <button className="btn-primary" onClick={() => setShowModal(true)}>
            <Plus size={16} /> Nouveau Projet
          </button>
        }
      />

      <main style={{ padding: 24, flex: 1, overflowY: "auto" }}>
        {/* Filters */}
        <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
          <div
            style={{
              flex: 1, minWidth: 200, display: "flex", alignItems: "center", gap: 8,
              background: "#111c28", border: "1px solid #1e3048", borderRadius: 8, padding: "8px 12px",
            }}
          >
            <Search size={15} color="#4b6080" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher par nom, client, localisation..."
              style={{ background: "transparent", border: "none", color: "#e2eaf2", fontSize: 13, outline: "none", flex: 1 }}
            />
          </div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="srm-select"
            style={{ width: 180 }}
          >
            <option value="all">Tous les types</option>
            {Object.entries(TYPE_LABELS).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="srm-select"
            style={{ width: 150 }}
          >
            <option value="all">Tous les statuts</option>
            {Object.entries(STATUS_LABELS).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
          <input
            value={filterClient}
            onChange={(e) => setFilterClient(e.target.value)}
            placeholder="Filtrer par client..."
            style={{ background: "#0f1923", border: "1px solid #1e3048", borderRadius: 8, padding: "6px 12px", color: "#e2eaf2", fontSize: 13, width: 160 }}
          />
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}
            style={{ background: "#0f1923", border: "1px solid #1e3048", borderRadius: 8, padding: "6px 12px", color: "#e2eaf2", fontSize: 13 }}>
            <option value="date">Trier par date</option>
            <option value="name">Trier par nom</option>
            <option value="points">Trier par points</option>
          </select>
          <button onClick={() => setSortOrder(o => o === "desc" ? "asc" : "desc")}
            style={{ background: "#0f1923", border: "1px solid #1e3048", borderRadius: 8, padding: "6px 10px", color: "#e2eaf2", cursor: "pointer", fontSize: 14 }}>
            {sortOrder === "desc" ? "↓" : "↑"}
          </button>
          <div style={{ display: "flex", border: "1px solid #1e3048", borderRadius: 8, overflow: "hidden" }}>
            {(["grid", "list"] as const).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                style={{
                  padding: "8px 14px",
                  background: view === v ? "#1e3048" : "transparent",
                  border: "none",
                  color: view === v ? "#e2eaf2" : "#4b6080",
                  cursor: "pointer",
                  fontSize: 12,
                }}
              >
                {v === "grid" ? "⊞ Grille" : "≡ Liste"}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: 60, color: "#4b6080" }}>Chargement...</div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: 60 }}>
            <FolderOpen size={48} color="#1e3048" style={{ marginBottom: 12 }} />
            <p style={{ color: "#4b6080", fontSize: 14 }}>
              {search || filterType !== "all" || filterStatus !== "all"
                ? "Aucun projet ne correspond aux filtres"
                : "Aucun projet. Créez votre premier projet!"}
            </p>
            <button className="btn-primary" style={{ marginTop: 8 }} onClick={() => setShowModal(true)}>
              <Plus size={14} /> Créer un projet
            </button>
          </div>
        ) : view === "grid" ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
            {filtered.map((p) => (
              <div
                key={p.id}
                className="srm-card"
                style={{ cursor: "pointer", transition: "border-color 0.15s", position: "relative" }}
              >
                {/* Type color bar */}
                <div
                  style={{
                    position: "absolute", top: 0, left: 0, right: 0, height: 3,
                    borderRadius: "10px 10px 0 0",
                    background: p.type === "road_design" ? "#f97316"
                      : p.type === "terrain_modeling" ? "#3b82f6"
                      : p.type === "survey" ? "#10b981"
                      : p.type === "drainage" ? "#06b6d4"
                      : p.type === "parcel" ? "#8b5cf6"
                      : "#ec4899",
                  }}
                />
                <div style={{ paddingTop: 8 }}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 8 }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                        <span className={`badge badge-${p.status}`}>{STATUS_LABELS[p.status]}</span>
                      </div>
                      <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#e2eaf2" }}>{p.name}</h3>
                    </div>
                    <div style={{ display: "flex", gap: 6 }}>
                      <Link href={`/projects/${p.id}`} style={{ color: "#3b82f6" }}>
                        <Edit3 size={14} />
                      </Link>
                      <button
                        onClick={() => handleDelete(p.id)}
                        style={{ background: "none", border: "none", cursor: "pointer", color: "#f87171", padding: 0 }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  {p.description && (
                    <p style={{ fontSize: 12, color: "#8bacc8", margin: "0 0 10px", lineHeight: 1.5 }}>
                      {p.description.slice(0, 80)}{p.description.length > 80 ? "..." : ""}
                    </p>
                  )}

                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "#8bacc8" }}>
                      {TYPE_ICONS[p.type]}
                      {TYPE_LABELS[p.type]}
                    </div>
                    {p.client && (
                      <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "#8bacc8" }}>
                        <User size={11} /> {p.client}
                      </div>
                    )}
                    {p.location && (
                      <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "#8bacc8" }}>
                        <MapPin size={11} /> {p.location}
                      </div>
                    )}
                  </div>

                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 10, borderTop: "1px solid #1a2535" }}>
                    <span style={{ fontSize: 10, color: "#4b6080", display: "flex", alignItems: "center", gap: 3 }}>
                      <Calendar size={10} /> {new Date(p.updatedAt).toLocaleDateString("fr-FR")}
                    </span>
                    <span style={{ fontSize: 10, color: "#4b6080" }}>EPSG:{p.epsgCode}</span>
                    <Link
                      href={`/projects/${p.id}`}
                      style={{ fontSize: 11, color: "#f97316", textDecoration: "none", fontWeight: 600 }}
                    >
                      Ouvrir →
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="srm-card" style={{ padding: 0, overflow: "hidden" }}>
            <table className="srm-table">
              <thead>
                <tr>
                  <th>Nom</th>
                  <th>Type</th>
                  <th>Statut</th>
                  <th>Client</th>
                  <th>Localisation</th>
                  <th>EPSG</th>
                  <th>Modifié</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr key={p.id}>
                    <td style={{ fontWeight: 600, color: "#e2eaf2" }}>
                      <Link href={`/projects/${p.id}`} style={{ color: "#e2eaf2", textDecoration: "none" }}>
                        {p.name}
                      </Link>
                    </td>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 5, color: "#8bacc8", fontSize: 12 }}>
                        {TYPE_ICONS[p.type]} {TYPE_LABELS[p.type]}
                      </div>
                    </td>
                    <td><span className={`badge badge-${p.status}`}>{STATUS_LABELS[p.status]}</span></td>
                    <td style={{ color: "#8bacc8" }}>{p.client || "—"}</td>
                    <td style={{ color: "#8bacc8" }}>{p.location || "—"}</td>
                    <td style={{ color: "#4b6080", fontSize: 11 }}>{p.epsgCode}</td>
                    <td style={{ color: "#4b6080", fontSize: 11 }}>
                      {new Date(p.updatedAt).toLocaleDateString("fr-FR")}
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: 8 }}>
                        <Link href={`/projects/${p.id}`} style={{ color: "#3b82f6" }}>
                          <Edit3 size={14} />
                        </Link>
                        <button
                          onClick={() => handleDelete(p.id)}
                          style={{ background: "none", border: "none", cursor: "pointer", color: "#f87171", padding: 0 }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {/* Create Project Modal */}
      {showModal && (
        <div
          style={{
            position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)",
            zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center",
          }}
          onClick={(e) => e.target === e.currentTarget && setShowModal(false)}
        >
          <div
            style={{
              background: "#111c28", border: "1px solid #1e3048", borderRadius: 12,
              padding: 24, width: 520, maxWidth: "95vw", maxHeight: "90vh", overflowY: "auto",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#e2eaf2" }}>
                Nouveau Projet
              </h2>
              <button
                onClick={() => setShowModal(false)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "#4b6080" }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label style={{ fontSize: 12, color: "#8bacc8", display: "block", marginBottom: 4 }}>
                  Nom du projet *
                </label>
                <input
                  className="srm-input"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="ex: Route RN7 — Section Km 45 à Km 52"
                />
              </div>

              <div>
                <label style={{ fontSize: 12, color: "#8bacc8", display: "block", marginBottom: 4 }}>
                  Description
                </label>
                <textarea
                  className="srm-input"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Description du projet..."
                  rows={3}
                  style={{ resize: "vertical" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12, color: "#8bacc8", display: "block", marginBottom: 4 }}>Type</label>
                  <select
                    className="srm-select"
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                  >
                    {Object.entries(TYPE_LABELS).map(([k, v]) => (
                      <option key={k} value={k}>{v}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 12, color: "#8bacc8", display: "block", marginBottom: 4 }}>Statut</label>
                  <select
                    className="srm-select"
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                  >
                    {Object.entries(STATUS_LABELS).map(([k, v]) => (
                      <option key={k} value={k}>{v}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12, color: "#8bacc8", display: "block", marginBottom: 4 }}>
                    <User size={11} style={{ marginRight: 3 }} />Client / Maître d&apos;ouvrage
                  </label>
                  <input
                    className="srm-input"
                    value={form.client}
                    onChange={(e) => setForm({ ...form, client: e.target.value })}
                    placeholder="Nom du client"
                  />
                </div>
                <div>
                  <label style={{ fontSize: 12, color: "#8bacc8", display: "block", marginBottom: 4 }}>
                    <MapPin size={11} style={{ marginRight: 3 }} />Localisation
                  </label>
                  <input
                    className="srm-input"
                    value={form.location}
                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                    placeholder="Ville, région, pays"
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: 12, color: "#8bacc8", display: "block", marginBottom: 4 }}>
                  Code EPSG (Système de coordonnées)
                </label>
                <select
                  className="srm-select"
                  value={form.epsgCode}
                  onChange={(e) => setForm({ ...form, epsgCode: e.target.value })}
                >
                  <option value="2154">EPSG:2154 — RGF93 / Lambert-93 (France)</option>
                  <option value="4326">EPSG:4326 — WGS84 (GPS)</option>
                  <option value="32632">EPSG:32632 — UTM Zone 32N</option>
                  <option value="32630">EPSG:32630 — UTM Zone 30N</option>
                  <option value="26191">EPSG:26191 — Maroc (Lambert)</option>
                  <option value="32632">EPSG:32632 — Algérie (UTM 32N)</option>
                  <option value="3857">EPSG:3857 — WebMercator</option>
                </select>
              </div>

              <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 8, paddingTop: 16, borderTop: "1px solid #1e3048" }}>
                <button className="btn-secondary" onClick={() => setShowModal(false)}>Annuler</button>
                <button className="btn-primary" onClick={handleCreate} disabled={saving || !form.name.trim()}>
                  {saving ? "Création..." : <><Plus size={14} /> Créer le projet</>}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
