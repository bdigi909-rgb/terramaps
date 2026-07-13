"use client";

function ActivityLog({ projectId }: { projectId: string }) {
  const [logs, setLogs] = useState<any[]>([]);
  useEffect(() => {
    fetch("/api/activity").then(r => r.json()).then(data => {
      if (Array.isArray(data)) {
        const filtered = data.filter((log: any) => 
          log.action !== "LOGIN" || data.indexOf(log) < 5
        ).slice(0, 20);
        setLogs(filtered);
      }
    });
  }, [projectId]);
  const actionColor: Record<string, string> = {
    LOGIN: "#64748B", IMPORT: "#22C55E", CREATE: "#3B82F6",
    UPDATE: "#F59E0B", DELETE: "#EF4444", EXPORT: "#A855F7",
  };
  return (
    <div>
      {logs.length === 0 ? (
        <div style={{ textAlign: "center", padding: 40, color: "#64748B" }}>Aucune activite enregistree</div>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
          <thead>
            <tr style={{ borderBottom: "1px solid #1E2D3D" }}>
              {["Action", "Utilisateur", "Date"].map(h => (
                <th key={h} style={{ padding: "8px 10px", color: "#64748B", textAlign: "left", fontSize: 10, textTransform: "uppercase" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {logs.map((log, i) => (
              <tr key={i} style={{ borderBottom: "1px solid #0D1117" }}>
                <td style={{ padding: "8px 10px" }}>
                  <span style={{ background: (actionColor[log.action] || "#64748B") + "22", color: actionColor[log.action] || "#64748B", fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 20 }}>{log.action}</span>
                </td>
                <td style={{ padding: "8px 10px", color: "#E2EAF2", fontWeight: 600 }}>{log.userName || "—"}</td>
                <td style={{ padding: "8px 10px", color: "#64748B" }}>{new Date(log.createdAt).toLocaleDateString("fr-FR")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
import { use, useEffect, useRef, useState } from "react";
import AppShell from "@/components/AppShell";
import Header from "@/components/Header";
import Link from "next/link";
import PrintButton from "@/components/PrintButton";
import PhotosTab from "@/components/PhotosTab";
import {
  ArrowLeft, Save, Compass, Route, BarChart3, Layers, Map,
  Mountain, Plus, Trash2, X, FileDown, Activity, Camera,
} from "lucide-react";

interface Project {
  id: number; name: string; description?: string; type: string; status: string;
  client?: string; location?: string; epsgCode?: string;
}
interface SurveyPoint { id: number; name?: string; code?: string; x: number; y: number; z: number; }
interface Alignment { id: number; name: string; type: string; totalLength?: number; description?: string; }
interface Stats { points: number; alignments: number; entities: number; layers: number; }

const TABS = [
  { id: "overview", label: "Vue générale", icon: Activity },
  { id: "survey", label: "Points topo", icon: Compass },
  { id: "alignment", label: "Alignements", icon: Route },
  { id: "terrain", label: "MNT", icon: Mountain },
  { id: "volumes", label: "Volumes", icon: BarChart3 },
  { id: "photos", label: "Photos", icon: Camera },
  { id: "layers", label: "Calques", icon: Layers },
  { id: "activity", label: "Activite", icon: Activity },
];

const TYPE_LABELS: Record<string, string> = {
  road_design: "Conception Routière", terrain_modeling: "Modèle Terrain",
  survey: "Levé Topo", drainage: "Drainage VRD", parcel: "Parcellaire", infrastructure: "Infrastructure",
};

export default function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [project, setProject] = useState<Project | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [tab, setTab] = useState("overview");
  const [points, setPoints] = useState<SurveyPoint[]>([]);
  const [alignments, setAlignments] = useState<Alignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [autoSaved, setAutoSaved] = useState(false);
  const autoSaveTimer = useRef<any>(null);

  function triggerAutoSave(updatedProject: any) {
    clearTimeout(autoSaveTimer.current);
    setAutoSaved(false);
    autoSaveTimer.current = setTimeout(async () => {
      if (!updatedProject) return;
      await fetch(`/api/projects/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedProject),
      });
      setAutoSaved(true);
      setTimeout(() => setAutoSaved(false), 3000);
    }, 2000);
  }

  // Point form
  const [showPointForm, setShowPointForm] = useState(false);
  const [pForm, setPForm] = useState({ name: "", code: "", x: "", y: "", z: "" });

  // Alignment form
  const [showAlignForm, setShowAlignForm] = useState(false);
  const [aForm, setAForm] = useState({ name: "", type: "horizontal", description: "", totalLength: "" });

  useEffect(() => {
    Promise.all([
      fetch(`/api/projects/${id}`).then((r) => r.json()),
      fetch(`/api/projects/${id}/stats`).then((r) => r.json()),
      fetch(`/api/projects/${id}/survey-points`).then((r) => r.json()),
      fetch(`/api/projects/${id}/alignments`).then((r) => r.json()),
    ]).then(([proj, st, pts, aligns]) => {
      setProject(proj);
      setStats(st);
      setPoints(pts);
      setAlignments(aligns);
      setLoading(false);
    }).catch(() => setLoading(false));
  };
  const handleDeletePoint = async (pid: number) => {
    await fetch(`/api/projects/${id}/survey-points?pointId=${pid}`, { method: "DELETE" });
    setPoints((prev) => prev.filter((p) => p.id !== pid));
    const st = await fetch(`/api/projects/${id}/stats`).then((r) => r.json());
    setStats(st);
  };

  const handleAddAlignment = async () => {
    if (!aForm.name) return;
    await fetch(`/api/projects/${id}/alignments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...aForm, totalLength: aForm.totalLength ? parseFloat(aForm.totalLength) : null }),
    });
    const aligns = await fetch(`/api/projects/${id}/alignments`).then((r) => r.json());
    setAlignments(aligns);
    setShowAlignForm(false);
    setAForm({ name: "", type: "horizontal", description: "", totalLength: "" });
    const st = await fetch(`/api/projects/${id}/stats`).then((r) => r.json());
    setStats(st);
  };

  const handleDeleteAlignment = async (aid: number) => {
    await fetch(`/api/projects/${id}/alignments?alignId=${aid}`, { method: "DELETE" });
    setAlignments((prev) => prev.filter((a) => a.id !== aid));
  };

  const generateSamplePoints = async () => {
    const pts = [];
    for (let i = 0; i < 20; i++) {
      const angle = (i / 20) * 2 * Math.PI;
      pts.push({
        name: `PT${String(i + 1).padStart(3, "0")}`,
        code: "TN",
        x: Math.round((500 + 200 * Math.cos(angle)) * 100) / 100,
        y: Math.round((500 + 200 * Math.sin(angle)) * 100) / 100,
        z: Math.round((100 + 10 * Math.sin(angle * 2)) * 100) / 100,
      });
    }
    await fetch(`/api/projects/${id}/survey-points`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(pts),
    });
    const updated = await fetch(`/api/projects/${id}/survey-points`).then((r) => r.json());
    setPoints(updated);
    const st = await fetch(`/api/projects/${id}/stats`).then((r) => r.json());
    setStats(st);
  };

  if (loading) {
    return (
      <AppShell>
        <Header title="Chargement..." />
        <div style={{ textAlign: "center", padding: 80, color: "#4b6080" }}>Chargement du projet...</div>
      </AppShell>
    );
  }

  if (!project) {
    return (
      <AppShell>
        <Header title="Projet introuvable" />
        <div style={{ textAlign: "center", padding: 80 }}>
          <p style={{ color: "#f87171" }}>Projet introuvable</p>
          <Link href="/projects" className="btn-primary" style={{ textDecoration: "none" }}>
            ← Retour
          </Link>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <Header
        title={project.name}
        subtitle={`${TYPE_LABELS[project.type] ?? project.type} · EPSG:${project.epsgCode}`}
        actions={
          <div style={{ display: "flex", gap: 8 }}>
            <Link href="/projects" style={{ textDecoration: "none" }}>
              <button className="btn-secondary"><ArrowLeft size={14} /> Retour</button>
            </Link>
            <button className="btn-secondary" onClick={async () => {
              if (!project) return;
              const JSZip = (await import("jszip")).default;
              const zip = new JSZip();
              
              // Points CSV
              const ptsRaw = await fetch(`/api/projects/${project.id}/survey-points`).then(r => r.json());
              const pts = Array.isArray(ptsRaw) ? ptsRaw.filter((p: any, i: number, self: any[]) => i === self.findIndex((q: any) => q.name === p.name && q.code === p.code)) : [];
              if (Array.isArray(pts) && pts.length > 0) {
                const csv = "Nom,Code,X,Y,Z\n" + pts.map((p: any) => `${p.name},${p.code},${p.x},${p.y},${p.z}`).join("\n");
                zip.file("points.csv", csv);
              }
              
              // LandXML
              if (Array.isArray(pts) && pts.length > 0) {
                const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<LandXML version="1.2" xmlns="http://www.landxml.org/schema/LandXML-1.2">\n  <Project desc="${project.name}" />\n  <CgPoints>\n${pts.map((p: any, i: number) => `    <CgPoint id="${i+1}" name="${p.name}" code="${p.code}">\n      <X>${p.x}</X>\n      <Y>${p.y}</Y>\n      <Z>${p.z}</Z>\n    </CgPoint>`).join("\n")}\n  </CgPoints>\n</LandXML>`;
                zip.file("points.xml", xml);
              }
              
              // Infos projet JSON
              const info = {
                nom: project.name,
                type: project.type,
                statut: project.status,
                client: project.client,
                localisation: project.location,
                epsg: project.epsgCode,
                date_export: new Date().toLocaleDateString("fr-FR"),
                total_points: Array.isArray(pts) ? pts.length : 0,
              };
              zip.file("projet_info.json", JSON.stringify(info, null, 2));
              
              // Télécharger
              const blob = await zip.generateAsync({ type: "blob" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = `TerraMaps_${project.name.replace(/\s+/g, "_")}_export.zip`;
              a.click();
            }}><FileDown size={14} /> Exporter ZIP</button>
            <button className="btn-secondary" onClick={async () => {
              const res = await fetch("/api/share", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ projectId: project.id })
              });
              const data = await res.json();
              const url = window.location.origin + "/share/" + data.token;
              navigator.clipboard.writeText(url);
              alert("Lien copie ! " + url);
            }}>🔗 Partager</button>
            <PrintButton title={project?.name || "Projet TerraMaps"} />
            <button className="btn-primary" onClick={handleSave} disabled={saving}>
            {autoSaved && <span style={{ color: "#22C55E", fontSize: 11, marginLeft: 8 }}>✅ Sauvegarde auto</span>}
              <Save size={14} /> {saving ? "Enregistrement..." : "Enregistrer"}
            </button>
          </div>
        }
      />

      {/* Tabs */}
      <div style={{ borderBottom: "1px solid #1e3048", display: "flex", padding: "0 24px", background: "#111c28", overflowX: "auto" }}>
        {TABS.map((t) => (
          <button
            key={t.id}
            className={`tab-btn ${tab === t.id ? "active" : ""}`}
            onClick={() => setTab(t.id)}
            style={{ display: "flex", alignItems: "center", gap: 5 }}
          >
            <t.icon size={13} /> {t.label}
          </button>
        ))}
      </div>

      <main style={{ padding: 24, flex: 1, overflowY: "auto" }}>
        {/* Overview */}
        {tab === "overview" && (
          <div>
            {/* Stats */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 24 }}>
              {[
                { label: "Points levés", value: stats?.points ?? 0, color: "#3b82f6" },
                { label: "Alignements", value: stats?.alignments ?? 0, color: "#f97316" },
                { label: "Entités dessin", value: stats?.entities ?? 0, color: "#10b981" },
                { label: "Calques", value: stats?.layers ?? 0, color: "#8b5cf6" },
              ].map((s) => (
                <div key={s.label} className="stat-card">
                  <div className="stat-value" style={{ color: s.color, fontSize: 28 }}>{s.value}</div>
                  <div className="stat-label">{s.label}</div>
                </div>
              ))}
            </div>

            {/* Edit form */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div className="srm-card">
                <h3 style={{ margin: "0 0 16px", fontSize: 13, fontWeight: 600, color: "#8bacc8" }}>
                  Informations du projet
                </h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <div>
                    <label style={{ fontSize: 11, color: "#4b6080", display: "block", marginBottom: 4 }}>Nom</label>
                    <input className="srm-input" value={project.name} onChange={(e) => setProject({ ...project, name: e.target.value })} />
                  </div>
                  <div>
                    <label style={{ fontSize: 11, color: "#4b6080", display: "block", marginBottom: 4 }}>Description</label>
                    <textarea className="srm-input" value={project.description ?? ""} onChange={(e) => setProject({ ...project, description: e.target.value })} rows={3} style={{ resize: "vertical" }} />
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                    <div>
                      <label style={{ fontSize: 11, color: "#4b6080", display: "block", marginBottom: 4 }}>Statut</label>
                      <select className="srm-select" value={project.status} onChange={(e) => setProject({ ...project, status: e.target.value })}>
                        {["draft","active","review","completed","archived"].map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                    <div>
                      <label style={{ fontSize: 11, color: "#4b6080", display: "block", marginBottom: 4 }}>Type</label>
                      <select className="srm-select" value={project.type} onChange={(e) => setProject({ ...project, type: e.target.value })}>
                        {["road_design","terrain_modeling","survey","drainage","parcel","infrastructure"].map((t) => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                    <div>
                      <label style={{ fontSize: 11, color: "#4b6080", display: "block", marginBottom: 4 }}>Client</label>
                      <input className="srm-input" value={project.client ?? ""} onChange={(e) => setProject({ ...project, client: e.target.value })} />
                    </div>
                    <div>
                      <label style={{ fontSize: 11, color: "#4b6080", display: "block", marginBottom: 4 }}>Localisation</label>
                      <input className="srm-input" value={project.location ?? ""} onChange={(e) => setProject({ ...project, location: e.target.value })} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="srm-card">
                <h3 style={{ margin: "0 0 16px", fontSize: 13, fontWeight: 600, color: "#8bacc8" }}>
                  Paramètres cartographiques
                </h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <div>
                    <label style={{ fontSize: 11, color: "#4b6080", display: "block", marginBottom: 4 }}>Système de coordonnées (EPSG)</label>
                    <select className="srm-select" value={project.epsgCode ?? "4326"} onChange={(e) => setProject({ ...project, epsgCode: e.target.value })}>
                      <option value="2154">EPSG:2154 — RGF93 / Lambert-93</option>
                      <option value="4326">EPSG:4326 — WGS84</option>
                      <option value="32632">EPSG:32632 — UTM Zone 32N</option>
                      <option value="26191">EPSG:26191 — Maroc Lambert</option>
                    </select>
                  </div>
                  <div
                    style={{
                      background: "#0f1923", borderRadius: 8, padding: 12, border: "1px solid #1e3048",
                      fontFamily: "monospace", fontSize: 11, color: "#4b6080", lineHeight: 1.8,
                    }}
                  >
                    <div style={{ color: "#3b82f6" }}>Paramètres du projet:</div>
                    <div>ID: <span style={{ color: "#e2eaf2" }}>{project.id}</span></div>
                    <div>Points: <span style={{ color: "#10b981" }}>{stats?.points ?? 0}</span></div>
                    <div>Alignements: <span style={{ color: "#f97316" }}>{stats?.alignments ?? 0}</span></div>
                    <div>EPSG: <span style={{ color: "#8b5cf6" }}>{project.epsgCode}</span></div>
                    <div>Format export: <span style={{ color: "#e2eaf2" }}>LandXML, DWG, DXF</span></div>
                  </div>

                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <Link href="/canvas" style={{ textDecoration: "none" }}>
                      <button className="btn-secondary" style={{ fontSize: 12 }}><Map size={12} /> Ouvrir Canvas</button>
                    </Link>
                    <Link href="/terrain" style={{ textDecoration: "none" }}>
                      <button className="btn-secondary" style={{ fontSize: 12 }}><Mountain size={12} /> Modèle Terrain</button>
                    </Link>
                    <Link href="/alignment" style={{ textDecoration: "none" }}>
                      <button className="btn-secondary" style={{ fontSize: 12 }}><Route size={12} /> Alignements</button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Survey Points */}
        {tab === "survey" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h3 style={{ margin: 0, color: "#8bacc8", fontSize: 14 }}>
                Points de levé topographique ({points.length})
              </h3>
              <div style={{ display: "flex", gap: 8 }}>
                <button className="btn-secondary" onClick={generateSamplePoints} style={{ fontSize: 12 }}>
                  Générer exemples
                </button>
                <button className="btn-primary" onClick={() => setShowPointForm(true)}>
                  <Plus size={14} /> Ajouter point
                </button>
                <Link href={`/map-fullscreen?projectId=${id}`} style={{ textDecoration: "none" }}>
                  <button className="btn-secondary" style={{ fontSize: 12 }}>🗺️ Carte plein ecran</button>
                </Link>
              </div>
            </div>

            {showPointForm && (
              <div className="srm-card" style={{ marginBottom: 16, border: "1px solid #3b82f6" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "#60a5fa" }}>Nouveau point</span>
                  <button onClick={() => setShowPointForm(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "#4b6080" }}><X size={16} /></button>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr", gap: 10, alignItems: "end" }}>
                  <div>
                    <label style={{ fontSize: 11, color: "#4b6080", display: "block", marginBottom: 3 }}>Nom</label>
                    <input className="srm-input" placeholder="PT001" value={pForm.name} onChange={(e) => setPForm({ ...pForm, name: e.target.value })} />
                  </div>
                  <div>
                    <label style={{ fontSize: 11, color: "#4b6080", display: "block", marginBottom: 3 }}>Code</label>
                    <input className="srm-input" placeholder="TN" value={pForm.code} onChange={(e) => setPForm({ ...pForm, code: e.target.value })} />
                  </div>
                  <div>
                    <label style={{ fontSize: 11, color: "#4b6080", display: "block", marginBottom: 3 }}>X (m)</label>
                    <input className="srm-input" type="number" placeholder="500.00" value={pForm.x} onChange={(e) => setPForm({ ...pForm, x: e.target.value })} />
                  </div>
                  <div>
                    <label style={{ fontSize: 11, color: "#4b6080", display: "block", marginBottom: 3 }}>Y (m)</label>
                    <input className="srm-input" type="number" placeholder="500.00" value={pForm.y} onChange={(e) => setPForm({ ...pForm, y: e.target.value })} />
                  </div>
                  <div>
                    <label style={{ fontSize: 11, color: "#4b6080", display: "block", marginBottom: 3 }}>Z (m)</label>
                    <input className="srm-input" type="number" placeholder="100.00" value={pForm.z} onChange={(e) => setPForm({ ...pForm, z: e.target.value })} />
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 10 }}>
                  <button className="btn-secondary" onClick={() => setShowPointForm(false)}>Annuler</button>
                  <button className="btn-primary" onClick={handleAddPoint}>Ajouter</button>
                </div>
              </div>
            )}

            <div className="srm-card" style={{ padding: 0, overflow: "hidden" }}>
              <table className="srm-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Nom</th>
                    <th>Code</th>
                    <th>X (m)</th>
                    <th>Y (m)</th>
                    <th>Z (m)</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {points.length === 0 ? (
                    <tr><td colSpan={7} style={{ textAlign: "center", color: "#4b6080", padding: 30 }}>
                      Aucun point. Ajoutez des points manuellement ou générez des exemples.
                    </td></tr>
                  ) : points.map((p, i) => (
                    <tr key={p.id}>
                      <td style={{ color: "#4b6080" }}>{i + 1}</td>
                      <td style={{ fontFamily: "monospace", color: "#60a5fa", fontWeight: 600 }}>{p.name || "—"}</td>
                      <td><span className="badge" style={{ background: "#1e3048", color: "#8bacc8" }}>{p.code || "—"}</span></td>
                      <td style={{ fontFamily: "monospace", color: "#4ade80" }}>{p.x.toFixed(3)}</td>
                      <td style={{ fontFamily: "monospace", color: "#4ade80" }}>{p.y.toFixed(3)}</td>
                      <td style={{ fontFamily: "monospace", color: "#f97316" }}>{p.z.toFixed(3)}</td>
                      <td>
                        <button onClick={async () => {
                          const name = prompt("Nom:", p.name || "");
                          if (name === null) return;
                          const code = prompt("Code:", p.code || "") || p.code;
                          const x = parseFloat(prompt("X:", p.x.toString()) || p.x.toString());
                          const y = parseFloat(prompt("Y:", p.y.toString()) || p.y.toString());
                          const z = parseFloat(prompt("Z:", p.z.toString()) || p.z.toString());
                          await fetch("/api/survey-points", {
                            method: "PUT",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ id: p.id, name, code, x, y, z })
                          });
                          setPoints(prev => prev.map(pt => pt.id === p.id ? { ...pt, name, code, x, y, z } : pt));
                        }} style={{ background: "none", border: "none", cursor: "pointer", color: "#3B82F6", marginRight: 6 }}>✏️</button>
                        <button onClick={() => handleDeletePoint(p.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#f87171" }}>
                          <Trash2 size={13} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Alignments */}
        {tab === "alignment" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h3 style={{ margin: 0, color: "#8bacc8", fontSize: 14 }}>Alignements ({alignments.length})</h3>
              <button className="btn-primary" onClick={() => setShowAlignForm(true)}>
                <Plus size={14} /> Nouvel alignement
              </button>
            </div>

            {showAlignForm && (
              <div className="srm-card" style={{ marginBottom: 16, border: "1px solid #f97316" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "#f97316" }}>Nouvel alignement</span>
                  <button onClick={() => setShowAlignForm(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "#4b6080" }}><X size={16} /></button>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: 10, alignItems: "end" }}>
                  <div>
                    <label style={{ fontSize: 11, color: "#4b6080", display: "block", marginBottom: 3 }}>Nom de l'axe</label>
                    <input className="srm-input" placeholder="Axe principal RN7" value={aForm.name} onChange={(e) => setAForm({ ...aForm, name: e.target.value })} />
                  </div>
                  <div>
                    <label style={{ fontSize: 11, color: "#4b6080", display: "block", marginBottom: 3 }}>Type</label>
                    <select className="srm-select" value={aForm.type} onChange={(e) => setAForm({ ...aForm, type: e.target.value })}>
                      <option value="horizontal">Horizontal</option>
                      <option value="vertical">Vertical (Profil)</option>
                      <option value="combined">Combiné</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: 11, color: "#4b6080", display: "block", marginBottom: 3 }}>Longueur totale (m)</label>
                    <input className="srm-input" type="number" placeholder="1250.00" value={aForm.totalLength} onChange={(e) => setAForm({ ...aForm, totalLength: e.target.value })} />
                  </div>
                  <div>
                    <label style={{ fontSize: 11, color: "#4b6080", display: "block", marginBottom: 3 }}>Description</label>
                    <input className="srm-input" placeholder="Section km45-52" value={aForm.description} onChange={(e) => setAForm({ ...aForm, description: e.target.value })} />
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 10 }}>
                  <button className="btn-secondary" onClick={() => setShowAlignForm(false)}>Annuler</button>
                  <button className="btn-primary" onClick={handleAddAlignment}>Créer</button>
                </div>
              </div>
            )}

            {alignments.length === 0 ? (
              <div className="srm-card" style={{ textAlign: "center", padding: 40 }}>
                <Route size={36} color="#2a4060" style={{ marginBottom: 10 }} />
                <p style={{ color: "#4b6080" }}>Aucun alignement défini</p>
              </div>
            ) : (
              <div style={{ display: "grid", gap: 10 }}>
                {alignments.map((a) => (
                  <div key={a.id} className="srm-card" style={{ display: "flex", alignItems: "center", gap: 14 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 8, background: "rgba(249,115,22,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Route size={18} color="#f97316" />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, color: "#e2eaf2", fontSize: 14 }}>{a.name}</div>
                      <div style={{ fontSize: 11, color: "#8bacc8", marginTop: 2 }}>
                        Type: {a.type} · {a.totalLength ? `${a.totalLength.toFixed(0)} m` : "longueur non définie"}
                        {a.description && ` · ${a.description}`}
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <Link href="/alignment" style={{ textDecoration: "none" }}>
                        <button className="btn-secondary" style={{ fontSize: 11 }}>Éditer</button>
                      </Link>
                      <button onClick={() => handleDeleteAlignment(a.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#f87171" }}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Terrain */}
        {tab === "terrain" && (
          <div className="srm-card" style={{ textAlign: "center", padding: 60 }}>
            <Mountain size={48} color="#3b82f6" style={{ marginBottom: 12 }} />
            <h3 style={{ color: "#e2eaf2" }}>Modèle Numérique de Terrain</h3>
            <p style={{ color: "#8bacc8", marginBottom: 20 }}>Accédez au module MNT pour visualiser votre triangulation Delaunay et les courbes de niveau</p>
            <Link href="/terrain" style={{ textDecoration: "none" }}>
              <button className="btn-primary"><Mountain size={14} /> Ouvrir Module MNT</button>
            </Link>
          </div>
        )}

        {/* Volumes */}
        {tab === "volumes" && (
          <div className="srm-card" style={{ textAlign: "center", padding: 60 }}>
            <BarChart3 size={48} color="#10b981" style={{ marginBottom: 12 }} />
            <h3 style={{ color: "#e2eaf2" }}>Calcul de Volumes de Terrassement</h3>
            <p style={{ color: "#8bacc8", marginBottom: 20 }}>Calculez les cubatures déblai/remblai à partir de vos profils en travers</p>
            <Link href="/volumes" style={{ textDecoration: "none" }}>
              <button className="btn-primary"><BarChart3 size={14} /> Ouvrir Module Volumes</button>
            </Link>
          </div>
        )}

        {/* Layers */}
        {tab === "layers" && (
          <div className="srm-card" style={{ textAlign: "center", padding: 60 }}>
            <Layers size={48} color="#8b5cf6" style={{ marginBottom: 12 }} />
            <h3 style={{ color: "#e2eaf2" }}>Gestion des Calques</h3>
            <p style={{ color: "#8bacc8", marginBottom: 20 }}>Organisez vos données par calques comme dans AutoCAD</p>
            <Link href="/layers" style={{ textDecoration: "none" }}>
              <button className="btn-primary"><Layers size={14} /> Gérer les Calques</button>
            </Link>
          </div>
        )}
      </main>
        {tab === "activity" && (
          <div className="srm-card">
            <h3 style={{ margin: "0 0 20px", fontSize: 15, fontWeight: 600, color: "#8BACC8" }}>Activite du projet</h3>
            <ActivityLog projectId={id} />
          </div>
        )}
        {tab === "photos" && (
          <div className="srm-card">
            <h3 style={{ margin: "0 0 20px", fontSize: 15, fontWeight: 600, color: "#8BACC8" }}>📸 Photos terrain</h3>
            <PhotosTab projectId={parseInt(id)} />
          </div>
        )}
    </AppShell>
  );
}
