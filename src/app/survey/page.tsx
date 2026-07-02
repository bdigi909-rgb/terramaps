"use client";
import ExportExcel from "@/components/ExportExcel";
import MapView from "@/components/MapView";
import { useEffect, useRef, useState, useCallback } from "react";
import AppShell from "@/components/AppShell";
import Header from "@/components/Header";
import {
  Compass, Plus, Trash2, Download, Upload, RefreshCw,
  Map, Search, Filter, ZoomIn, ZoomOut,
} from "lucide-react";
import { ScatterChart, Scatter, XAxis, YAxis, ZAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

interface SurveyPoint {
  id: number; name?: string; code?: string; x: number; y: number; z: number; projectId: number;
}
interface Project { id: number; name: string }

function generateSamplePoints(n = 50): Omit<SurveyPoint, "id" | "projectId">[] {
  const pts = [];
  const codes = ["TN", "LIM", "VOI", "BAT", "MUR", "RTE", "CAN", "ARB", "BOR", "AXE", "BN"];
  for (let i = 0; i < n; i++) {
    const angle = (i / n) * 2 * Math.PI * 3;
    const r = 50 + (i / n) * 300 + (Math.random() - 0.5) * 60;
    const x = 500 + r * Math.cos(angle) + (Math.random() - 0.5) * 30;
    const y = 400 + r * Math.sin(angle) + (Math.random() - 0.5) * 30;
    const z = 80 + 20 * Math.sin(angle) + Math.random() * 10;
    pts.push({
      name: `PT${String(i + 1).padStart(3, "0")}`,
      code: codes[i % codes.length],
      x: Math.round(x * 100) / 100,
      y: Math.round(y * 100) / 100,
      z: Math.round(z * 100) / 100,
    });
  }
  return pts;
}

export default function SurveyPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<number | null>(null);
  const [points, setPoints] = useState<SurveyPoint[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [filterCode, setFilterCode] = useState("all");
  const [view, setView] = useState<"map" | "table" | "chart">("map");
  const [zoom, setZoom] = useState(0.8);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [selectedPoint, setSelectedPoint] = useState<SurveyPoint | null>(null);

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
    fetch(`/api/projects/${selectedProject}/survey-points`)
      .then((r) => r.json())
      .then((d) => { setPoints(Array.isArray(d) ? d : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [selectedProject]);

  const generateSample = async () => {
    if (!selectedProject) return;
    const pts = generateSamplePoints(50);
    await fetch(`/api/projects/${selectedProject}/survey-points`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(pts),
    });
    const updated = await fetch(`/api/projects/${selectedProject}/survey-points`).then((r) => r.json());
    setPoints(updated);
  };

  const deletePoint = async (id: number) => {
    if (!selectedProject) return;
    await fetch(`/api/projects/${selectedProject}/survey-points?pointId=${id}`, { method: "DELETE" });
    setPoints((prev) => prev.filter((p) => p.id !== id));
    if (selectedPoint?.id === id) setSelectedPoint(null);
  };

  const clearAll = async () => {
    if (!selectedProject || !confirm("Supprimer tous les points du projet?")) return;
    await fetch(`/api/projects/${selectedProject}/survey-points`, { method: "DELETE" });
    setPoints([]);
    setSelectedPoint(null);
  };

  const codes = ["all", ...Array.from(new Set(points.map((p) => p.code).filter((c): c is string => Boolean(c))))];
  const filtered = points.filter((p) => {
    const matchSearch = !search || (p.name ?? "").toLowerCase().includes(search.toLowerCase()) || (p.code ?? "").toLowerCase().includes(search.toLowerCase());
    const matchCode = filterCode === "all" || p.code === filterCode;
    return matchSearch && matchCode;
  });

  const zVals = points.map((p) => p.z);
  const minZ = zVals.length > 0 ? Math.min(...zVals) : 0;
  const maxZ = zVals.length > 0 ? Math.max(...zVals) : 100;
  const meanZ = zVals.length > 0 ? zVals.reduce((a, b) => a + b, 0) / zVals.length : 0;

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || view !== "map") return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#0a1520";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Grid
    ctx.strokeStyle = "#162030";
    ctx.lineWidth = 0.5;
    const gs = 50 * zoom;
    for (let x = pan.x % gs; x < canvas.width; x += gs) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
    }
    for (let y = pan.y % gs; y < canvas.height; y += gs) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
    }

    const toS = (p: { x: number; y: number }) => ({
      sx: p.x * zoom + pan.x,
      sy: p.y * zoom + pan.y,
    });

    const CODE_COLORS: Record<string, string> = {
      TN: "#10b981", CB: "#f97316", PT: "#3b82f6",
      MUR: "#8b5cf6", AR: "#6b7280", EP: "#06b6d4",
      LIM: "#EF4444", VOI: "#F59E0B", BAT: "#3B82F6",
      RTE: "#6B7280", CAN: "#06B6D4", ARB: "#22C55E",
      BOR: "#A855F7", AXE: "#F97316", BN: "#EC4899",
      EU: "#a78bfa", TRO: "#ec4899",
    };

    // Draw points
    filtered.forEach((p) => {
      const { sx, sy } = toS(p);
      if (sx < -10 || sx > canvas.width + 10 || sy < -10 || sy > canvas.height + 10) return;

      const isSelected = selectedPoint?.id === p.id;
      const color = CODE_COLORS[p.code ?? ""] ?? "#8bacc8";

      if (isSelected) {
        ctx.fillStyle = "rgba(255,255,255,0.2)";
        ctx.beginPath(); ctx.arc(sx, sy, 10, 0, 2 * Math.PI); ctx.fill();
      }

      ctx.fillStyle = color;
      ctx.beginPath(); ctx.arc(sx, sy, isSelected ? 5 : 3, 0, 2 * Math.PI); ctx.fill();

      // Cross
      ctx.strokeStyle = color;
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(sx - 5, sy); ctx.lineTo(sx + 5, sy); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(sx, sy - 5); ctx.lineTo(sx, sy + 5); ctx.stroke();

      if (zoom > 0.8 || isSelected) {
        ctx.fillStyle = color;
        ctx.font = `${isSelected ? 11 : 9}px monospace`;
        ctx.fillText(p.name ?? "", sx + 6, sy - 4);
        if (zoom > 1.2 || isSelected) {
          ctx.fillStyle = "#4b6080";
          ctx.font = "8px monospace";
          ctx.fillText(`z=${p.z.toFixed(1)}`, sx + 6, sy + 8);
        }
      }
    });

    // Legend
    const entries = Object.entries(CODE_COLORS);
    entries.forEach(([code, color], i) => {
      const lx = 12, ly = 12 + i * 16;
      ctx.fillStyle = color;
      ctx.beginPath(); ctx.arc(lx + 5, ly + 4, 4, 0, 2 * Math.PI); ctx.fill();
      ctx.fillStyle = "#8bacc8";
      ctx.font = "10px monospace";
      ctx.fillText(code, lx + 14, ly + 8);
    });

  }, [filtered, zoom, pan, view, selectedPoint]);

  useEffect(() => { draw(); }, [draw]);

  return (
    <AppShell>
      <Header
        title="Points de Levé Topographique"
        subtitle="Import / Export · Visualisation carte · Analyse statistique"
        actions={
          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn-secondary" style={{ fontSize: 11 }}><Upload size={12} /> Import CSV</button>
            <ExportExcel points={filtered} projectName={projects.find(p => p.id === selectedProject)?.name} />
            {selectedProject && (
              <button className="btn-primary" style={{ fontSize: 11 }} onClick={generateSample}>
                <RefreshCw size={12} /> Générer échantillon
              </button>
            )}
          </div>
        }
      />

      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        {/* Left panel */}
        <div style={{ width: 160, background: "#111c28", borderRight: "1px solid #1e3048", padding: 12, flexShrink: 0, overflowY: "auto" }}>
          <div className="section-title">Projet</div>
          <select className="srm-select" style={{ marginTop: 6 }} value={selectedProject ?? ""} onChange={(e) => setSelectedProject(parseInt(e.target.value))}>
            <option value="">Choisir...</option>
            {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>

          <div className="section-title" style={{ marginTop: 12 }}>Statistiques</div>
          <div style={{ marginTop: 8, fontSize: 11, color: "#8bacc8", lineHeight: 1.8 }}>
            <div>Total: <span style={{ color: "#e2eaf2" }}>{points.length}</span></div>
            <div>Filtrés: <span style={{ color: "#f97316" }}>{filtered.length}</span></div>
            <div>Z min: <span style={{ color: "#06b6d4" }}>{minZ.toFixed(2)}m</span></div>
            <div>Z max: <span style={{ color: "#f59e0b" }}>{maxZ.toFixed(2)}m</span></div>
            <div>Z moy: <span style={{ color: "#4ade80" }}>{meanZ.toFixed(2)}m</span></div>
          </div>

          <div className="section-title" style={{ marginTop: 12 }}>Codes</div>
          <div style={{ marginTop: 6 }}>
            {codes.map((code) => {
              const cnt = code === "all" ? points.length : points.filter((p) => p.code === code).length;
              return (
                <div
                  key={code}
                  onClick={() => setFilterCode(code)}
                  style={{
                    padding: "5px 8px", borderRadius: 5, marginBottom: 2, cursor: "pointer",
                    background: filterCode === code ? "rgba(249,115,22,0.12)" : "transparent",
                    color: filterCode === code ? "#f97316" : "#8bacc8",
                    fontSize: 11, display: "flex", justifyContent: "space-between",
                  }}
                >
                  <span>{code === "all" ? "Tous" : code}</span>
                  <span style={{ color: "#4b6080" }}>{cnt}</span>
                </div>
              );
            })}
          </div>

          {points.length > 0 && (
            <button onClick={clearAll} className="btn-danger" style={{ width: "100%", marginTop: 12, fontSize: 11, justifyContent: "center" }}>
              <Trash2 size={12} /> Effacer tout
            </button>
          )}
        </div>

        {/* Main */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          {/* Toolbar */}
          <div style={{ background: "#111c28", borderBottom: "1px solid #1e3048", padding: "8px 16px", display: "flex", gap: 10, alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, background: "#0f1923", border: "1px solid #1e3048", borderRadius: 7, padding: "6px 10px", flex: 1, maxWidth: 280 }}>
              <Search size={13} color="#4b6080" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Nom ou code..." style={{ background: "transparent", border: "none", color: "#e2eaf2", fontSize: 12, outline: "none", flex: 1 }} />
            </div>
            <div style={{ display: "flex", border: "1px solid #1e3048", borderRadius: 7, overflow: "hidden" }}>
              {(["map", "table", "chart"] as const).map((v) => (
                <button key={v} onClick={() => setView(v)}
                  style={{ padding: "6px 12px", background: view === v ? "#1e3048" : "transparent", border: "none", color: view === v ? "#e2eaf2" : "#4b6080", cursor: "pointer", fontSize: 11 }}>
                  {v === "map" ? "🗺 Carte" : v === "table" ? "≡ Tableau" : "📊 Graphique"}
                </button>
              ))}
            </div>
            {view === "map" && (
              <div style={{ width: "100%", height: "70vh", minHeight: "500px" }}>
                <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css" />
                <MapView points={filtered} epsg={undefined} />
              </div>
            )}

            {view === "table" && (
              <div style={{ overflowY: "auto", height: "100%" }}>
                <table className="srm-table" style={{ fontSize: 12 }}>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Nom</th>
                      <th>Code</th>
                      <th>X (m)</th>
                      <th>Y (m)</th>
                      <th>Z (m)</th>
                      <th>Projet</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((p, i) => (
                      <tr key={p.id} style={{ cursor: "pointer" }} onClick={() => setSelectedPoint(p)}>
                        <td style={{ color: "#4b6080" }}>{i + 1}</td>
                        <td style={{ fontFamily: "monospace", color: "#60a5fa", fontWeight: 600 }}>{p.name || "—"}</td>
                        <td><span className="badge" style={{ background: "#1e3048", color: "#8bacc8" }}>{p.code || "—"}</span></td>
                        <td style={{ fontFamily: "monospace", color: "#4ade80" }}>{p.x.toFixed(3)}</td>
                        <td style={{ fontFamily: "monospace", color: "#4ade80" }}>{p.y.toFixed(3)}</td>
                        <td style={{ fontFamily: "monospace", color: "#f97316" }}>{p.z.toFixed(3)}</td>
                        <td style={{ color: "#4b6080", fontSize: 10 }}>#{p.projectId}</td>
                        <td>
                          <button onClick={(e) => { e.stopPropagation(); deletePoint(p.id); }} style={{ background: "none", border: "none", cursor: "pointer", color: "#f87171" }}>
                            <Trash2 size={12} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {view === "chart" && (
              <div style={{ padding: 24, overflowY: "auto", height: "100%" }}>
                <h3 style={{ color: "#8bacc8", margin: "0 0 16px", fontSize: 13 }}>Distribution XY des points de levé</h3>
                <ResponsiveContainer width="100%" height={350}>
                  <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e3048" />
                    <XAxis dataKey="x" type="number" name="X" tick={{ fill: "#4b6080", fontSize: 10 }} domain={["auto", "auto"]} />
                    <YAxis dataKey="y" type="number" name="Y" tick={{ fill: "#4b6080", fontSize: 10 }} domain={["auto", "auto"]} />
                    <ZAxis dataKey="z" type="number" range={[20, 200]} name="Z" />
                    <Tooltip cursor={{ strokeDasharray: "3 3" }} contentStyle={{ background: "#111c28", border: "1px solid #1e3048", borderRadius: 6, fontSize: 11 }} formatter={(v, name) => [typeof v === "number" ? v.toFixed(3) : v, name]} />
                    <Scatter data={filtered} fill="#3b82f6" opacity={0.8} />
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Selected point info */}
            {selectedPoint && (
              <div style={{ position: "absolute", bottom: 12, right: 12, background: "rgba(17,28,40,0.95)", border: "1px solid #f97316", borderRadius: 10, padding: "12px 16px", minWidth: 200 }}>
                <div style={{ fontWeight: 700, color: "#f97316", marginBottom: 6, fontSize: 13 }}>
                  {selectedPoint.name || "Point sélectionné"}
                </div>
                <div style={{ fontSize: 11, color: "#8bacc8", lineHeight: 1.8, fontFamily: "monospace" }}>
                  <div>Code: <span style={{ color: "#e2eaf2" }}>{selectedPoint.code || "—"}</span></div>
                  <div>X: <span style={{ color: "#4ade80" }}>{selectedPoint.x.toFixed(4)}</span></div>
                  <div>Y: <span style={{ color: "#4ade80" }}>{selectedPoint.y.toFixed(4)}</span></div>
                  <div>Z: <span style={{ color: "#f97316" }}>{selectedPoint.z.toFixed(4)}</span></div>
                </div>
                <button onClick={() => setSelectedPoint(null)} style={{ position: "absolute", top: 6, right: 8, background: "none", border: "none", cursor: "pointer", color: "#4b6080", fontSize: 16 }}>×</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
