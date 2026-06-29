"use client";
import { useEffect, useState } from "react";
import AppShell from "@/components/AppShell";
import Header from "@/components/Header";
import { Layers, Plus, Eye, EyeOff, Lock, Unlock, Trash2, Edit3, X, Check } from "lucide-react";

interface Layer {
  id: number;
  projectId: number;
  name: string;
  color: string;
  lineType: string;
  lineWidth: number;
  visible: boolean;
  locked: boolean;
}

interface Project { id: number; name: string }

const LINE_TYPES = ["solid", "dashed", "dotted", "dashdot"];
const PRESET_COLORS = [
  "#f97316", "#3b82f6", "#10b981", "#facc15", "#ec4899", "#8b5cf6",
  "#06b6d4", "#ef4444", "#ffffff", "#94a3b8", "#4ade80", "#fb923c",
];

const DEFAULT_LAYERS = [
  { name: "Tracé principal", color: "#f97316", lineType: "solid", lineWidth: 2 },
  { name: "Terrain naturel", color: "#10b981", lineType: "solid", lineWidth: 1 },
  { name: "Bâtiments", color: "#8b5cf6", lineType: "solid", lineWidth: 1.5 },
  { name: "Réseau EP", color: "#3b82f6", lineType: "dashed", lineWidth: 1 },
  { name: "Réseau EU", color: "#a78bfa", lineType: "dashed", lineWidth: 1 },
  { name: "Cotation", color: "#facc15", lineType: "solid", lineWidth: 0.5 },
  { name: "Annotations", color: "#94a3b8", lineType: "solid", lineWidth: 0.5 },
  { name: "Limites parcelles", color: "#ec4899", lineType: "dashdot", lineWidth: 1 },
];

export default function LayersPage() {
  const [layers, setLayers] = useState<Layer[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", color: "#3b82f6", lineType: "solid", lineWidth: 1 });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<Partial<Layer>>({});

  useEffect(() => {
    fetch("/api/projects")
      .then((r) => r.json())
      .then((d) => {
        setProjects(d);
        if (d.length > 0) setSelectedProject(d[0].id);
      });
  }, []);

  useEffect(() => {
    if (!selectedProject) return;
    setLoading(true);
    fetch(`/api/projects/${selectedProject}/layers`)
      .then((r) => r.json())
      .then((d) => { setLayers(Array.isArray(d) ? d : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [selectedProject]);

  const createLayer = async () => {
    if (!selectedProject || !form.name) return;
    const r = await fetch(`/api/projects/${selectedProject}/layers`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const newLayer = await r.json();
    setLayers((prev) => [...prev, newLayer]);
    setForm({ name: "", color: "#3b82f6", lineType: "solid", lineWidth: 1 });
    setShowForm(false);
  };

  const createDefaultLayers = async () => {
    if (!selectedProject) return;
    for (const l of DEFAULT_LAYERS) {
      const r = await fetch(`/api/projects/${selectedProject}/layers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(l),
      });
      const newLayer = await r.json();
      setLayers((prev) => [...prev, newLayer]);
    }
  };

  const toggleVisible = async (layer: Layer) => {
    const r = await fetch(`/api/projects/${selectedProject}/layers?layerId=${layer.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...layer, visible: !layer.visible }),
    });
    const updated = await r.json();
    setLayers((prev) => prev.map((l) => (l.id === layer.id ? updated : l)));
  };

  const toggleLocked = async (layer: Layer) => {
    const r = await fetch(`/api/projects/${selectedProject}/layers?layerId=${layer.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...layer, locked: !layer.locked }),
    });
    const updated = await r.json();
    setLayers((prev) => prev.map((l) => (l.id === layer.id ? updated : l)));
  };

  const deleteLayer = async (id: number) => {
    await fetch(`/api/projects/${selectedProject}/layers?layerId=${id}`, { method: "DELETE" });
    setLayers((prev) => prev.filter((l) => l.id !== id));
  };

  const startEdit = (layer: Layer) => {
    setEditingId(layer.id);
    setEditForm({ ...layer });
  };

  const saveEdit = async () => {
    if (!editingId || !selectedProject) return;
    const r = await fetch(`/api/projects/${selectedProject}/layers?layerId=${editingId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editForm),
    });
    const updated = await r.json();
    setLayers((prev) => prev.map((l) => (l.id === editingId ? updated : l)));
    setEditingId(null);
  };

  return (
    <AppShell>
      <Header
        title="Gestion des Calques"
        subtitle="Organisation des données par calques — style AutoCAD"
        actions={
          <div style={{ display: "flex", gap: 8 }}>
            {selectedProject && layers.length === 0 && (
              <button className="btn-secondary" onClick={createDefaultLayers} style={{ fontSize: 11 }}>
                Calques par défaut
              </button>
            )}
            <button className="btn-primary" onClick={() => setShowForm(true)}>
              <Plus size={14} /> Nouveau calque
            </button>
          </div>
        }
      />

      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        {/* Left: project selector */}
        <div style={{ width: 220, background: "#111c28", borderRight: "1px solid #1e3048", padding: 12, flexShrink: 0, overflowY: "auto" }}>
          <div className="section-title">Projets</div>
          <div style={{ marginTop: 8 }}>
            {projects.length === 0 ? (
              <div style={{ fontSize: 12, color: "#4b6080", textAlign: "center", padding: 20 }}>
                Créez un projet d&apos;abord
              </div>
            ) : (
              projects.map((p) => (
                <div
                  key={p.id}
                  onClick={() => setSelectedProject(p.id)}
                  style={{
                    padding: "8px 10px",
                    borderRadius: 7,
                    marginBottom: 4,
                    cursor: "pointer",
                    background: selectedProject === p.id ? "rgba(249,115,22,0.12)" : "transparent",
                    border: selectedProject === p.id ? "1px solid rgba(249,115,22,0.2)" : "1px solid transparent",
                    color: selectedProject === p.id ? "#f97316" : "#8bacc8",
                    fontSize: 12,
                  }}
                >
                  {p.name}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Main: layers list */}
        <div style={{ flex: 1, padding: 24, overflowY: "auto" }}>
          {!selectedProject ? (
            <div style={{ textAlign: "center", padding: 60, color: "#4b6080" }}>
              Sélectionnez un projet
            </div>
          ) : loading ? (
            <div style={{ textAlign: "center", padding: 60, color: "#4b6080" }}>Chargement...</div>
          ) : (
            <>
              {/* Add layer form */}
              {showForm && (
                <div className="srm-card" style={{ marginBottom: 16, border: "1px solid #3b82f6" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                    <span style={{ fontWeight: 600, color: "#60a5fa", fontSize: 13 }}>Nouveau calque</span>
                    <button onClick={() => setShowForm(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "#4b6080" }}><X size={16} /></button>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "2fr 120px 140px 100px", gap: 10, alignItems: "end" }}>
                    <div>
                      <label style={{ fontSize: 11, color: "#4b6080", display: "block", marginBottom: 3 }}>Nom</label>
                      <input className="srm-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ex: Tracé principal" />
                    </div>
                    <div>
                      <label style={{ fontSize: 11, color: "#4b6080", display: "block", marginBottom: 3 }}>Couleur</label>
                      <input type="color" value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} style={{ width: "100%", height: 36, borderRadius: 6, border: "1px solid #1e3048", background: "#0f1923", cursor: "pointer" }} />
                    </div>
                    <div>
                      <label style={{ fontSize: 11, color: "#4b6080", display: "block", marginBottom: 3 }}>Type de ligne</label>
                      <select className="srm-select" value={form.lineType} onChange={(e) => setForm({ ...form, lineType: e.target.value })}>
                        {LINE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                    <div>
                      <label style={{ fontSize: 11, color: "#4b6080", display: "block", marginBottom: 3 }}>Épaisseur</label>
                      <input className="srm-input" type="number" step={0.5} min={0.25} max={10} value={form.lineWidth} onChange={(e) => setForm({ ...form, lineWidth: parseFloat(e.target.value) })} />
                    </div>
                  </div>
                  <div style={{ marginTop: 8 }}>
                    <label style={{ fontSize: 11, color: "#4b6080", display: "block", marginBottom: 4 }}>Couleurs prédéfinies</label>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      {PRESET_COLORS.map((c) => (
                        <button key={c} onClick={() => setForm({ ...form, color: c })}
                          style={{ width: 22, height: 22, borderRadius: 4, background: c, border: "none", cursor: "pointer", outline: form.color === c ? "2px solid white" : "none", outlineOffset: 2 }} />
                      ))}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 10 }}>
                    <button className="btn-secondary" onClick={() => setShowForm(false)}>Annuler</button>
                    <button className="btn-primary" onClick={createLayer} disabled={!form.name}><Plus size={13} /> Créer</button>
                  </div>
                </div>
              )}

              {layers.length === 0 ? (
                <div style={{ textAlign: "center", padding: 60 }}>
                  <Layers size={48} color="#1e3048" style={{ marginBottom: 12 }} />
                  <p style={{ color: "#4b6080" }}>Aucun calque. Créez votre premier calque ou utilisez les calques par défaut.</p>
                  <div style={{ display: "flex", gap: 8, justifyContent: "center", marginTop: 12 }}>
                    <button className="btn-secondary" onClick={createDefaultLayers}>Calques par défaut</button>
                    <button className="btn-primary" onClick={() => setShowForm(true)}><Plus size={13} /> Nouveau calque</button>
                  </div>
                </div>
              ) : (
                <div className="srm-card" style={{ padding: 0, overflow: "hidden" }}>
                  <table className="srm-table">
                    <thead>
                      <tr>
                        <th style={{ width: 40 }}>Vis.</th>
                        <th style={{ width: 40 }}>Ver.</th>
                        <th>Nom du calque</th>
                        <th>Couleur</th>
                        <th>Type ligne</th>
                        <th>Épaisseur</th>
                        <th>Aperçu</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {layers.map((layer) => (
                        <tr key={layer.id} style={{ opacity: layer.visible ? 1 : 0.45 }}>
                          <td>
                            <button onClick={() => toggleVisible(layer)} style={{ background: "none", border: "none", cursor: "pointer", color: layer.visible ? "#4ade80" : "#4b6080" }}>
                              {layer.visible ? <Eye size={15} /> : <EyeOff size={15} />}
                            </button>
                          </td>
                          <td>
                            <button onClick={() => toggleLocked(layer)} style={{ background: "none", border: "none", cursor: "pointer", color: layer.locked ? "#f97316" : "#4b6080" }}>
                              {layer.locked ? <Lock size={15} /> : <Unlock size={15} />}
                            </button>
                          </td>
                          <td>
                            {editingId === layer.id ? (
                              <input className="srm-input" style={{ padding: "4px 8px", fontSize: 12 }} value={editForm.name ?? ""} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} />
                            ) : (
                              <span style={{ fontWeight: 600, color: "#e2eaf2" }}>{layer.name}</span>
                            )}
                          </td>
                          <td>
                            {editingId === layer.id ? (
                              <input type="color" value={editForm.color ?? "#3b82f6"} onChange={(e) => setEditForm({ ...editForm, color: e.target.value })} style={{ width: 40, height: 28, borderRadius: 4, border: "1px solid #1e3048", background: "#0f1923", cursor: "pointer" }} />
                            ) : (
                              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                <div style={{ width: 16, height: 16, borderRadius: 3, background: layer.color }} />
                                <span style={{ fontFamily: "monospace", fontSize: 11, color: "#8bacc8" }}>{layer.color}</span>
                              </div>
                            )}
                          </td>
                          <td>
                            {editingId === layer.id ? (
                              <select className="srm-select" style={{ fontSize: 11 }} value={editForm.lineType ?? "solid"} onChange={(e) => setEditForm({ ...editForm, lineType: e.target.value })}>
                                {LINE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                              </select>
                            ) : (
                              <span style={{ fontSize: 11, color: "#8bacc8" }}>{layer.lineType}</span>
                            )}
                          </td>
                          <td>
                            {editingId === layer.id ? (
                              <input className="srm-input" type="number" step={0.5} style={{ padding: "4px 8px", fontSize: 12, width: 60 }} value={editForm.lineWidth ?? 1} onChange={(e) => setEditForm({ ...editForm, lineWidth: parseFloat(e.target.value) })} />
                            ) : (
                              <span style={{ fontSize: 11, color: "#8bacc8" }}>{layer.lineWidth}px</span>
                            )}
                          </td>
                          <td>
                            <svg width="80" height="20">
                              <line
                                x1="0" y1="10" x2="80" y2="10"
                                stroke={layer.color}
                                strokeWidth={Math.min(layer.lineWidth * 2, 6)}
                                strokeDasharray={
                                  layer.lineType === "dashed" ? "8 4"
                                  : layer.lineType === "dotted" ? "2 3"
                                  : layer.lineType === "dashdot" ? "10 3 2 3"
                                  : undefined
                                }
                              />
                            </svg>
                          </td>
                          <td>
                            <div style={{ display: "flex", gap: 6 }}>
                              {editingId === layer.id ? (
                                <>
                                  <button onClick={saveEdit} style={{ background: "none", border: "none", cursor: "pointer", color: "#4ade80" }}><Check size={14} /></button>
                                  <button onClick={() => setEditingId(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "#f87171" }}><X size={14} /></button>
                                </>
                              ) : (
                                <>
                                  <button onClick={() => startEdit(layer)} style={{ background: "none", border: "none", cursor: "pointer", color: "#3b82f6" }}><Edit3 size={13} /></button>
                                  <button onClick={() => deleteLayer(layer.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#f87171" }}><Trash2 size={13} /></button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </div>

        {/* Right: properties */}
        <div style={{ width: 220, background: "#111c28", borderLeft: "1px solid #1e3048", padding: 14, overflowY: "auto", flexShrink: 0 }}>
          <div className="section-title">Statistiques</div>
          <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 8, fontSize: 12, color: "#8bacc8" }}>
            <div>Total calques: <span style={{ color: "#e2eaf2" }}>{layers.length}</span></div>
            <div>Visibles: <span style={{ color: "#4ade80" }}>{layers.filter((l) => l.visible).length}</span></div>
            <div>Verrouillés: <span style={{ color: "#f97316" }}>{layers.filter((l) => l.locked).length}</span></div>
          </div>

          <div className="section-title" style={{ marginTop: 16 }}>Types de lignes</div>
          <div style={{ marginTop: 8 }}>
            {LINE_TYPES.map((t) => (
              <div key={t} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <svg width="60" height="16">
                  <line x1="0" y1="8" x2="60" y2="8" stroke="#8bacc8" strokeWidth="1.5"
                    strokeDasharray={t === "dashed" ? "8 4" : t === "dotted" ? "2 3" : t === "dashdot" ? "10 3 2 3" : undefined} />
                </svg>
                <span style={{ fontSize: 11, color: "#4b6080", textTransform: "capitalize" }}>{t}</span>
              </div>
            ))}
          </div>

          <div className="section-title" style={{ marginTop: 16 }}>Calques standard</div>
          <div style={{ fontSize: 11, color: "#4b6080", lineHeight: 1.8, marginTop: 8 }}>
            <div>• Tracé principal</div>
            <div>• Terrain naturel</div>
            <div>• Bâtiments</div>
            <div>• Réseau EP/EU</div>
            <div>• Cotation</div>
            <div>• Annotations</div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
