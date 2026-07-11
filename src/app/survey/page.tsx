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
  const [mapExpanded, setMapExpanded] = useState(false);
  const [mapHeight, setMapHeight] = useState(600);
  const resizing = useRef<boolean>(false);
  useEffect(() => { setMapHeight(window.innerHeight - 250); }, []);
  const startY = useRef(0);
  const startH = useRef(0);

  function onMouseDown(e: React.MouseEvent) {
    resizing.current = true;
    startY.current = e.clientY;
    startH.current = mapHeight;
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  }
  function onMouseMove(e: MouseEvent) {
    if (!resizing.current) return;
    const diff = e.clientY - startY.current;
    setMapHeight(Math.max(200, Math.min(window.innerHeight - 100, startH.current + diff)));
  }
  function onMouseUp() {
    resizing.current = false;
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseup', onMouseUp);
  }
  const [view, setView] = useState<"map" | "table" | "chart" | "profile">("map");
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
        title="Levé"
        subtitle=""
        actions={
          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn-secondary" style={{ fontSize: 11 }}><Upload size={12} /> Import CSV</button>
            <ExportExcel points={filtered} projectName={projects.find(p => p.id === selectedProject)?.name} />
            <button onClick={() => {
              const projectName = projects.find(p => p.id === selectedProject)?.name || "projet";
              const date = new Date().toISOString().slice(0,10);
              const points = filtered.map((p, i) => `        <CgPoint id="${i+1}" name="${p.name || `PT${i+1}`}" code="${p.code || "TN"}">\n          <X>${p.x.toFixed(3)}</X>\n          <Y>${p.y.toFixed(3)}</Y>\n          <Z>${p.z.toFixed(3)}</Z>\n        </CgPoint>`).join("\n");
              const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<LandXML version="1.2" date="${date}" time="${new Date().toTimeString().slice(0,8)}" xmlns="http://www.landxml.org/schema/LandXML-1.2">\n  <Project desc="${projectName}" />\n  <Units>\n    <Metric linearUnit="meter" areaUnit="squareMeter" volumeUnit="cubicMeter" />\n  </Units>\n  <CgPoints>\n${points}\n  </CgPoints>\n</LandXML>`;
              const blob = new Blob([xml], { type: "application/xml" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a"); a.href = url; a.download = `TerraMaps_${projectName}_${date}.xml`; a.click();
            }} className="btn-secondary" style={{ fontSize: 11, display: "flex", alignItems: "center", gap: 4 }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
              LandXML
            </button>
            <button onClick={() => {
              const projectName = projects.find(p => p.id === selectedProject)?.name || "projet";
              const date = new Date().toISOString().slice(0,10);
              let dxf = "0\nSECTION\n2\nHEADER\n0\nENDSEC\n0\nSECTION\n2\nENTITIES\n";
              // Points
              filtered.forEach((p, i) => {
                dxf += "0\nPOINT\n8\n" + (p.code || "0") + "\n10\n" + p.x + "\n20\n" + p.y + "\n30\n" + p.z + "\n";
              });
              // Polygone LIM
              const lim = filtered.filter(p => p.code === "LIM");
              if (lim.length >= 2) {
                dxf += "0\nPOLYLINE\n8\nLIM\n66\n1\n70\n1\n";
                lim.forEach(p => { dxf += "0\nVERTEX\n8\nLIM\n10\n" + p.x + "\n20\n" + p.y + "\n30\n" + p.z + "\n"; });
                dxf += "0\nSEQEND\n";
              }
              dxf += "0\nENDSEC\n0\nEOF\n";
              const blob = new Blob([dxf], { type: "application/dxf" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a"); a.href = url; a.download = "TerraMaps_" + projectName + "_" + date + ".dxf"; a.click();
            }} className="btn-secondary" style={{ fontSize: 11, display: "flex", alignItems: "center", gap: 4 }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 3v18M15 3v18M3 9h18M3 15h18"/></svg>
              DXF
            </button>
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
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "auto", minHeight: 0 }}>
          {/* Toolbar */}
          <div style={{ background: "#111c28", borderBottom: "1px solid #1e3048", padding: "6px 8px", display: "flex", gap: 6, alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 4, background: "#0f1923", border: "1px solid #1e3048", borderRadius: 7, padding: "5px 8px", maxWidth: 140 }}>
              <Search size={13} color="#4b6080" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Nom ou code..." style={{ background: "transparent", border: "none", color: "#e2eaf2", fontSize: 12, outline: "none", flex: 1 }} />
            </div>
            <select value={view} onChange={e => setView(e.target.value as any)}
              style={{ background: "#0f1923", border: "1px solid #1e3048", borderRadius: 7, padding: "5px 8px", color: "#e2eaf2", fontSize: 11, cursor: "pointer" }}>
              <option value="map">🗺 Carte</option>
              <option value="table">≡ Tableau</option>
              <option value="chart">📊 Graphique</option>
              <option value="profile">📈 Profil</option>
            </select>
            {view === "map" && (
            <div onMouseDown={onMouseDown} style={{ height: 8, background: "#1E2D3D", cursor: "ns-resize", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "0 0 4px 4px", userSelect: "none" }}>
              <div style={{ width: 40, height: 3, background: "#F97316", borderRadius: 2 }} />
            </div>
          )}
          {view === "map" && (
            <div style={{ position: "fixed", top: 64, right: 16, zIndex: 99999 }}>
              <button onClick={() => setMapExpanded(e => !e)}
                style={{ background: "#161B22", border: "1px solid #1E2D3D", color: "#F97316", padding: "6px 12px", borderRadius: 8, cursor: "pointer", fontSize: 12, fontWeight: 600 }}>
                {mapExpanded ? "⊡ Réduire" : "⊞ Agrandir"}
              </button>
            </div>
          )}
          {view === "map" && (
              <div style={{ width: "100%", height: mapExpanded ? "calc(100vh - 120px)" : "500px", position: mapExpanded ? "fixed" : "relative", top: mapExpanded ? 60 : "auto", left: mapExpanded ? 220 : "auto", right: mapExpanded ? 0 : "auto", zIndex: mapExpanded ? 999 : "auto" }}>
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
            {view === "profile" && (
              <div style={{ padding: 24, overflowY: "auto", height: "100%" }}>
                <h3 style={{ color: "#8bacc8", margin: "0 0 8px", fontSize: 13 }}>📈 Profil Altimétrique — Variation de Z</h3>
                <p style={{ color: "#64748B", fontSize: 11, marginBottom: 16 }}>Points triés par distance croissante — altitude Z en mètres</p>
                {filtered.length === 0 ? (
                  <div style={{ textAlign: "center", padding: 40, color: "#64748B" }}>Sélectionnez un projet avec des points</div>
                ) : (
                  <>
                    {/* Stats altimétriques */}
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 20 }}>
                      {[
                        { label: "Z min", value: Math.min(...filtered.map(p => p.z)).toFixed(3) + " m", color: "#3B82F6" },
                        { label: "Z max", value: Math.max(...filtered.map(p => p.z)).toFixed(3) + " m", color: "#EF4444" },
                        { label: "Z moyen", value: (filtered.reduce((s, p) => s + p.z, 0) / filtered.length).toFixed(3) + " m", color: "#F97316" },
                        { label: "Dénivelé", value: (Math.max(...filtered.map(p => p.z)) - Math.min(...filtered.map(p => p.z))).toFixed(3) + " m", color: "#22C55E" },
                      ].map(s => (
                        <div key={s.label} style={{ background: "#111c28", border: "1px solid #1e3048", borderRadius: 8, padding: "12px 14px" }}>
                          <div style={{ fontSize: 16, fontWeight: 700, color: s.color }}>{s.value}</div>
                          <div style={{ fontSize: 10, color: "#64748B", textTransform: "uppercase", marginTop: 2 }}>{s.label}</div>
                        </div>
                      ))}
                    </div>

                    {/* Graphique profil */}
                    <ResponsiveContainer width="100%" height={300}>
                      <ScatterChart margin={{ top: 10, right: 20, bottom: 40, left: 60 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e3048" />
                        <XAxis 
                          dataKey="x" type="number" name="X (Est)"
                          tick={{ fill: "#4b6080", fontSize: 9 }}
                          label={{ value: "X — Coordonnée Est (m)", position: "insideBottom", offset: -10, fill: "#64748B", fontSize: 10 }}
                          domain={["auto", "auto"]}
                        />
                        <YAxis 
                          dataKey="z" type="number" name="Altitude Z"
                          tick={{ fill: "#4b6080", fontSize: 9 }}
                          label={{ value: "Z — Altitude (m)", angle: -90, position: "insideLeft", offset: -10, fill: "#64748B", fontSize: 10 }}
                          domain={["auto", "auto"]}
                        />
                        <ZAxis range={[30, 30]} />
                        <Tooltip 
                          contentStyle={{ background: "#111c28", border: "1px solid #f97316", borderRadius: 6, fontSize: 11 }}
                          formatter={(v: any, name: any) => [typeof v === "number" ? v.toFixed(3) + " m" : v, name]}
                          content={({ active, payload }: any) => {
                            if (active && payload?.length) {
                              const pt = payload[0]?.payload;
                              return (
                                <div style={{ background: "#111c28", border: "1px solid #F97316", borderRadius: 8, padding: "10px 14px", fontSize: 11 }}>
                                  <div style={{ fontWeight: 700, color: "#F97316", marginBottom: 4 }}>{pt?.name || "Point"}</div>
                                  <div style={{ color: "#3B82F6" }}>X: {pt?.x?.toFixed(3)} m</div>
                                  <div style={{ color: "#22C55E" }}>Y: {pt?.y?.toFixed(3)} m</div>
                                  <div style={{ color: "#F97316", fontWeight: 700 }}>Z: {pt?.z?.toFixed(3)} m</div>
                                  <div style={{ color: "#64748B" }}>Code: {pt?.code}</div>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                        <Scatter 
                          data={[...filtered].sort((a, b) => a.x - b.x)} 
                          fill="#F97316" 
                          opacity={0.9}
                          line={{ stroke: "#F97316", strokeWidth: 1.5, strokeDasharray: "4 2" }}
                          lineType="joint"
                        />
                      </ScatterChart>
                    </ResponsiveContainer>

                    {/* Tableau altimétrique */}
                    <div style={{ marginTop: 20 }}>
                      <h4 style={{ color: "#8BACC8", fontSize: 12, marginBottom: 10 }}>Tableau altimétrique</h4>
                      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11 }}>
                        <thead>
                          <tr style={{ borderBottom: "1px solid #1e3048" }}>
                            {["#", "Nom", "Code", "X (m)", "Y (m)", "Z (m)", "ΔZ"].map(h => (
                              <th key={h} style={{ padding: "6px 10px", color: "#64748B", textAlign: "left", fontSize: 10, textTransform: "uppercase" }}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {[...filtered].sort((a, b) => a.x - b.x).map((p, i, arr) => {
                            const dz = i > 0 ? p.z - arr[i-1].z : 0;
                            return (
                              <tr key={p.id} style={{ borderBottom: "1px solid #0D1117" }}>
                                <td style={{ padding: "6px 10px", color: "#64748B" }}>{i+1}</td>
                                <td style={{ padding: "6px 10px", color: "#F97316", fontWeight: 600 }}>{p.name}</td>
                                <td style={{ padding: "6px 10px", color: "#22C55E" }}>{p.code}</td>
                                <td style={{ padding: "6px 10px", color: "#3B82F6", fontFamily: "monospace" }}>{p.x.toFixed(3)}</td>
                                <td style={{ padding: "6px 10px", color: "#22C55E", fontFamily: "monospace" }}>{p.y.toFixed(3)}</td>
                                <td style={{ padding: "6px 10px", color: "#F97316", fontFamily: "monospace", fontWeight: 700 }}>{p.z.toFixed(3)}</td>
                                <td style={{ padding: "6px 10px", color: dz > 0 ? "#EF4444" : dz < 0 ? "#22C55E" : "#64748B", fontFamily: "monospace" }}>
                                  {i === 0 ? "—" : (dz > 0 ? "+" : "") + dz.toFixed(3)}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </>
                )}
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
