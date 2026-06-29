"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import AppShell from "@/components/AppShell";
import Header from "@/components/Header";
import {
  Route, Plus, Trash2, Save, Download, ChevronRight,
  BarChart3, Info, RefreshCw, ZoomIn, ZoomOut,
} from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, Area, AreaChart, ComposedChart, Bar,
} from "recharts";

interface AlignPoint { x: number; y: number; station: number }
interface CrossSection {
  station: number;
  cutArea: number;
  fillArea: number;
  groundZ: number;
  roadZ: number;
}

function generateAlignment(numPts = 8): AlignPoint[] {
  const pts: AlignPoint[] = [];
  let x = 100, y = 300, station = 0;
  for (let i = 0; i < numPts; i++) {
    if (i > 0) {
      const dx = 80 + Math.random() * 80;
      const dy = (Math.random() - 0.5) * 100;
      x += dx; y += dy;
      const d = Math.sqrt(dx * dx + dy * dy);
      station += d;
    }
    pts.push({ x: Math.round(x), y: Math.round(y), station: Math.round(station) });
  }
  return pts;
}

function generateProfile(alignPts: AlignPoint[]): { station: number; terrain: number; road: number }[] {
  return alignPts.map((p, i) => {
    const terrain = 80 + 30 * Math.sin(i * 0.8) + Math.random() * 10;
    const road = 75 + i * 0.5; // gentle grade
    return { station: p.station, terrain: Math.round(terrain * 10) / 10, road: Math.round(road * 10) / 10 };
  });
}

function generateCrossSections(alignPts: AlignPoint[]): CrossSection[] {
  return alignPts.map((p, i) => {
    const groundZ = 80 + 30 * Math.sin(i * 0.8) + Math.random() * 8;
    const roadZ = 75 + i * 0.5;
    const diff = groundZ - roadZ;
    return {
      station: p.station,
      cutArea: diff > 0 ? Math.round(diff * 12 * 100) / 100 : 0,
      fillArea: diff < 0 ? Math.round(Math.abs(diff) * 12 * 100) / 100 : 0,
      groundZ: Math.round(groundZ * 10) / 10,
      roadZ: Math.round(roadZ * 10) / 10,
    };
  });
}

export default function AlignmentPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [alignPts, setAlignPts] = useState<AlignPoint[]>([]);
  const [profile, setProfile] = useState<{ station: number; terrain: number; road: number }[]>([]);
  const [crossSections, setCrossSections] = useState<CrossSection[]>([]);
  const [tab, setTab] = useState<"plan" | "profile" | "cross">("plan");
  const [selectedStation, setSelectedStation] = useState<number | null>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });

  // Road design params
  const [speed, setSpeed] = useState(80);
  const [laneWidth, setLaneWidth] = useState(3.5);
  const [numLanes, setNumLanes] = useState(2);
  const [shoulderWidth, setShouldderWidth] = useState(2.0);

  const generate = useCallback(() => {
    const pts = generateAlignment();
    setAlignPts(pts);
    setProfile(generateProfile(pts));
    setCrossSections(generateCrossSections(pts));
  }, []);

  useEffect(() => { generate(); }, [generate]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
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

    if (alignPts.length < 2) return;

    const toS = (p: { x: number; y: number }) => ({
      sx: p.x * zoom + pan.x,
      sy: p.y * zoom + pan.y,
    });

    const roadWidth = (laneWidth * numLanes + shoulderWidth * 2) * zoom;

    // Road body (fill)
    ctx.beginPath();
    const fp = toS(alignPts[0]);
    ctx.moveTo(fp.sx, fp.sy);
    alignPts.slice(1).forEach((p) => { const s = toS(p); ctx.lineTo(s.sx, s.sy); });
    ctx.strokeStyle = "#374151";
    ctx.lineWidth = roadWidth;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.stroke();

    // Road surface
    ctx.beginPath();
    ctx.moveTo(fp.sx, fp.sy);
    alignPts.slice(1).forEach((p) => { const s = toS(p); ctx.lineTo(s.sx, s.sy); });
    ctx.strokeStyle = "#4b5563";
    ctx.lineWidth = (laneWidth * numLanes) * zoom;
    ctx.stroke();

    // Lane markings
    ctx.beginPath();
    ctx.moveTo(fp.sx, fp.sy);
    alignPts.slice(1).forEach((p) => { const s = toS(p); ctx.lineTo(s.sx, s.sy); });
    ctx.strokeStyle = "#facc15";
    ctx.lineWidth = Math.max(1, 0.2 * zoom);
    ctx.setLineDash([20 * zoom, 15 * zoom]);
    ctx.stroke();
    ctx.setLineDash([]);

    // Axis line
    ctx.beginPath();
    ctx.moveTo(fp.sx, fp.sy);
    alignPts.slice(1).forEach((p) => { const s = toS(p); ctx.lineTo(s.sx, s.sy); });
    ctx.strokeStyle = "#f97316";
    ctx.lineWidth = 2;
    ctx.setLineDash([8 * zoom, 5 * zoom]);
    ctx.stroke();
    ctx.setLineDash([]);

    // Cross section marks
    crossSections.forEach((cs) => {
      const idx = alignPts.findIndex((p) => p.station === cs.station);
      if (idx < 0 || idx >= alignPts.length - 1) return;
      const p = toS(alignPts[idx]);
      const next = toS(alignPts[idx + 1]);
      const dx = next.sx - p.sx;
      const dy = next.sy - p.sy;
      const len = Math.sqrt(dx * dx + dy * dy);
      if (len < 0.01) return;
      const nx = -dy / len * 20;
      const ny = dx / len * 20;

      ctx.strokeStyle = cs.cutArea > 0 ? "#3b82f6" : "#f97316";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(p.sx - nx, p.sy - ny);
      ctx.lineTo(p.sx + nx, p.sy + ny);
      ctx.stroke();

      if (selectedStation === cs.station) {
        ctx.fillStyle = "#facc15";
        ctx.beginPath();
        ctx.arc(p.sx, p.sy, 5, 0, 2 * Math.PI);
        ctx.fill();
      }
    });

    // Station labels
    ctx.font = `${10 * zoom}px monospace`;
    alignPts.forEach((p, i) => {
      const { sx, sy } = toS(p);
      ctx.fillStyle = "#f97316";
      ctx.beginPath(); ctx.arc(sx, sy, 5, 0, 2 * Math.PI); ctx.fill();
      ctx.fillStyle = "#8bacc8";
      ctx.fillText(`Km ${(p.station / 1000).toFixed(3)}`, sx + 6, sy - 4);
    });

    // North arrow
    ctx.fillStyle = "#e2eaf2";
    ctx.font = "12px sans-serif";
    ctx.fillText("N↑", 20, 30);

    // Scale bar
    const scaleLen = 100 * zoom;
    ctx.strokeStyle = "#8bacc8";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(20, canvas.height - 20);
    ctx.lineTo(20 + scaleLen, canvas.height - 20);
    ctx.stroke();
    ctx.fillStyle = "#8bacc8";
    ctx.font = "10px monospace";
    ctx.fillText("100m", 20, canvas.height - 24);

  }, [alignPts, crossSections, zoom, pan, laneWidth, numLanes, shoulderWidth, selectedStation]);

  useEffect(() => { draw(); }, [draw]);

  const totalLength = alignPts.length > 0 ? alignPts[alignPts.length - 1].station : 0;
  const totalCut = crossSections.reduce((s, c) => s + c.cutArea * 25, 0);
  const totalFill = crossSections.reduce((s, c) => s + c.fillArea * 25, 0);

  return (
    <AppShell>
      <Header
        title="Alignements & Tracé en Plan"
        subtitle="Conception géométrique routière — Tracé plan / profil / section"
        actions={
          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn-secondary" style={{ fontSize: 11 }}>
              <Download size={12} /> Exporter
            </button>
            <button className="btn-primary" onClick={generate} style={{ fontSize: 11 }}>
              <RefreshCw size={12} /> Nouveau tracé
            </button>
          </div>
        }
      />

      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        {/* Main content */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          {/* Tabs */}
          <div style={{ background: "#111c28", borderBottom: "1px solid #1e3048", display: "flex", padding: "0 16px" }}>
            {(["plan", "profile", "cross"] as const).map((t) => (
              <button
                key={t}
                className={`tab-btn ${tab === t ? "active" : ""}`}
                onClick={() => setTab(t)}
              >
                {t === "plan" ? "📐 Tracé en plan"
                  : t === "profile" ? "📈 Profil en long"
                  : "📊 Profils en travers"}
              </button>
            ))}
          </div>

          {/* Plan view */}
          {tab === "plan" && (
            <div style={{ flex: 1, position: "relative" }}>
              <canvas
                ref={canvasRef}
                width={1200}
                height={700}
                style={{ display: "block", width: "100%", height: "100%", background: "#0a1520" }}
                onWheel={(e) => {
                  e.preventDefault();
                  const f = e.deltaY > 0 ? 0.9 : 1.1;
                  setZoom((z) => Math.max(0.2, Math.min(5, z * f)));
                }}
                onClick={(e) => {
                  const rect = canvasRef.current!.getBoundingClientRect();
                  const wx = (e.clientX - rect.left - pan.x) / zoom;
                  const wy = (e.clientY - rect.top - pan.y) / zoom;
                  // Find nearest station
                  let nearest: number | null = null;
                  let nearestDist = Infinity;
                  alignPts.forEach((p) => {
                    const d = Math.sqrt((p.x - wx) ** 2 + (p.y - wy) ** 2);
                    if (d < nearestDist) { nearestDist = d; nearest = p.station; }
                  });
                  if (nearestDist < 30) setSelectedStation(nearest);
                  else setSelectedStation(null);
                }}
              />
              <div style={{ position: "absolute", bottom: 12, left: 12, display: "flex", gap: 6 }}>
                <button className="tool-btn" onClick={() => setZoom((z) => Math.min(z * 1.3, 5))}><ZoomIn size={15} /></button>
                <button className="tool-btn" onClick={() => setZoom((z) => Math.max(z / 1.3, 0.2))}><ZoomOut size={15} /></button>
              </div>
              {/* Legend */}
              <div style={{ position: "absolute", top: 12, right: 12, background: "rgba(11,21,32,0.9)", border: "1px solid #1e3048", borderRadius: 8, padding: "8px 12px", fontSize: 11, color: "#8bacc8" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 4 }}><div style={{ width: 20, height: 2, background: "#f97316" }} /> Axe route</div>
                <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 4 }}><div style={{ width: 20, height: 6, background: "#4b5563" }} /> Chaussée</div>
                <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 4 }}><div style={{ width: 20, height: 2, background: "#3b82f6" }} /> Déblai</div>
                <div style={{ display: "flex", alignItems: "center", gap: 5 }}><div style={{ width: 20, height: 2, background: "#f97316" }} /> Remblai</div>
              </div>
            </div>
          )}

          {/* Profile view */}
          {tab === "profile" && (
            <div style={{ flex: 1, padding: 24, background: "#0f1923", overflowY: "auto" }}>
              <h3 style={{ color: "#8bacc8", fontSize: 13, marginTop: 0 }}>Profil en long — Terrain naturel vs Projet</h3>
              <ResponsiveContainer width="100%" height={350}>
                <ComposedChart data={profile} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="terrainGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e3048" />
                  <XAxis dataKey="station" tick={{ fill: "#4b6080", fontSize: 11 }} label={{ value: "Station (m)", position: "insideBottomRight", fill: "#4b6080", fontSize: 11 }} />
                  <YAxis tick={{ fill: "#4b6080", fontSize: 11 }} label={{ value: "Altitude (m)", angle: -90, position: "insideLeft", fill: "#4b6080", fontSize: 11 }} />
                  <Tooltip contentStyle={{ background: "#111c28", border: "1px solid #1e3048", borderRadius: 6 }} labelFormatter={(v) => `Station: ${v}m`} />
                  <Area type="monotone" dataKey="terrain" stroke="#10b981" fill="url(#terrainGrad)" strokeWidth={2} name="Terrain naturel (m)" />
                  <Line type="monotone" dataKey="road" stroke="#f97316" strokeWidth={2} dot={false} name="Projet route (m)" />
                </ComposedChart>
              </ResponsiveContainer>

              {/* Cut/Fill chart */}
              <h3 style={{ color: "#8bacc8", fontSize: 13 }}>Déblai / Remblai par profil</h3>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={crossSections}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e3048" />
                  <XAxis dataKey="station" tick={{ fill: "#4b6080", fontSize: 10 }} />
                  <YAxis tick={{ fill: "#4b6080", fontSize: 10 }} />
                  <Tooltip contentStyle={{ background: "#111c28", border: "1px solid #1e3048", borderRadius: 6 }} />
                  <Area type="monotone" dataKey="cutArea" stroke="#3b82f6" fill="rgba(59,130,246,0.3)" name="Déblai (m²)" />
                  <Area type="monotone" dataKey="fillArea" stroke="#f97316" fill="rgba(249,115,22,0.3)" name="Remblai (m²)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Cross sections view */}
          {tab === "cross" && (
            <div style={{ flex: 1, padding: 24, background: "#0f1923", overflowY: "auto" }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
                {crossSections.map((cs, i) => (
                  <div key={cs.station} className="srm-card" style={{ border: selectedStation === cs.station ? "1px solid #f97316" : undefined }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: "#f97316" }}>
                        PK {(cs.station / 1000).toFixed(3)}
                      </span>
                      <span className={`badge ${cs.cutArea > 0 ? "badge-completed" : "badge-review"}`}>
                        {cs.cutArea > 0 ? "Déblai" : "Remblai"}
                      </span>
                    </div>
                    {/* Mini profile canvas */}
                    <div style={{ position: "relative", height: 80, background: "#0f1923", borderRadius: 6, overflow: "hidden", marginBottom: 8 }}>
                      <svg width="100%" height="80" style={{ position: "absolute" }}>
                        {/* Ground profile */}
                        <polyline
                          points={`0,${80 - (cs.groundZ - 60) * 2} 40,${80 - (cs.groundZ + 5 - 60) * 2} 80,${80 - (cs.groundZ + 3 - 60) * 2} 120,${80 - (cs.groundZ - 60) * 2} 160,${80 - (cs.groundZ - 3 - 60) * 2} 200,${80 - (cs.groundZ - 60) * 2} 240,${80 - (cs.groundZ + 2 - 60) * 2} 280,${80 - (cs.groundZ - 60) * 2}`}
                          fill="rgba(16,185,129,0.3)"
                          stroke="#10b981"
                          strokeWidth="1.5"
                        />
                        {/* Road profile */}
                        <line
                          x1="40" y1={80 - (cs.roadZ - 60) * 2}
                          x2="240" y2={80 - (cs.roadZ - 60) * 2}
                          stroke="#f97316" strokeWidth="3"
                        />
                        {/* Cut fill fill */}
                        {cs.cutArea > 0 && (
                          <rect x="80" y={80 - (cs.groundZ - 60) * 2} width="120" height={Math.max(0, (cs.groundZ - cs.roadZ) * 2)} fill="rgba(59,130,246,0.3)" />
                        )}
                        {cs.fillArea > 0 && (
                          <rect x="80" y={80 - (cs.roadZ - 60) * 2} width="120" height={Math.max(0, (cs.roadZ - cs.groundZ) * 2)} fill="rgba(249,115,22,0.3)" />
                        )}
                        {/* Shoulder lines */}
                        <line x1="40" y1="0" x2="40" y2="80" stroke="#4b5563" strokeWidth="1" strokeDasharray="3,2" />
                        <line x1="240" y1="0" x2="240" y2="80" stroke="#4b5563" strokeWidth="1" strokeDasharray="3,2" />
                      </svg>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, fontSize: 11, color: "#8bacc8" }}>
                      <div>Z terrain: <span style={{ color: "#10b981" }}>{cs.groundZ}m</span></div>
                      <div>Z projet: <span style={{ color: "#f97316" }}>{cs.roadZ}m</span></div>
                      {cs.cutArea > 0 && <div>Déblai: <span style={{ color: "#60a5fa" }}>{cs.cutArea.toFixed(1)} m²</span></div>}
                      {cs.fillArea > 0 && <div>Remblai: <span style={{ color: "#f97316" }}>{cs.fillArea.toFixed(1)} m²</span></div>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right panel */}
        <div style={{ width: 260, background: "#111c28", borderLeft: "1px solid #1e3048", padding: 14, overflowY: "auto", flexShrink: 0 }}>
          <div className="section-title">Paramètres Route</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 8 }}>
            <div>
              <label style={{ fontSize: 11, color: "#4b6080", display: "block", marginBottom: 3 }}>Vitesse projet (km/h)</label>
              <select className="srm-select" value={speed} onChange={(e) => setSpeed(parseInt(e.target.value))}>
                {[40, 50, 60, 70, 80, 90, 100, 110, 120, 130].map((s) => <option key={s} value={s}>{s} km/h</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 11, color: "#4b6080", display: "block", marginBottom: 3 }}>
                Largeur voie: {laneWidth}m
              </label>
              <input type="range" min={2.5} max={4.5} step={0.25} value={laneWidth} onChange={(e) => setLaneWidth(parseFloat(e.target.value))} style={{ width: "100%", accentColor: "#f97316" }} />
            </div>
            <div>
              <label style={{ fontSize: 11, color: "#4b6080", display: "block", marginBottom: 3 }}>Nombre de voies</label>
              <select className="srm-select" value={numLanes} onChange={(e) => setNumLanes(parseInt(e.target.value))}>
                {[1, 2, 3, 4].map((n) => <option key={n} value={n}>{n} voie(s)</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 11, color: "#4b6080", display: "block", marginBottom: 3 }}>
                Accotement: {shoulderWidth}m
              </label>
              <input type="range" min={0} max={4} step={0.5} value={shoulderWidth} onChange={(e) => setShouldderWidth(parseFloat(e.target.value))} style={{ width: "100%", accentColor: "#10b981" }} />
            </div>
          </div>

          <div className="section-title" style={{ marginTop: 16 }}>Résultats</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 8 }}>
            {[
              { label: "Longueur totale", value: `${totalLength.toFixed(0)} m`, color: "#f97316" },
              { label: "Largeur chaussée", value: `${(laneWidth * numLanes).toFixed(1)} m`, color: "#3b82f6" },
              { label: "Largeur totale (avec acc.)", value: `${(laneWidth * numLanes + shoulderWidth * 2).toFixed(1)} m`, color: "#8b5cf6" },
              { label: "Volume déblai total", value: `${totalCut.toFixed(0)} m³`, color: "#60a5fa" },
              { label: "Volume remblai total", value: `${totalFill.toFixed(0)} m³`, color: "#f97316" },
              { label: "Bilan net", value: `${(totalCut - totalFill).toFixed(0)} m³`, color: totalCut > totalFill ? "#4ade80" : "#f87171" },
            ].map((item) => (
              <div key={item.label} style={{ display: "flex", justifyContent: "space-between", fontSize: 11 }}>
                <span style={{ color: "#4b6080" }}>{item.label}</span>
                <span style={{ color: item.color, fontWeight: 600 }}>{item.value}</span>
              </div>
            ))}
          </div>

          <div className="section-title" style={{ marginTop: 16 }}>Normes appliquées</div>
          <div style={{ marginTop: 8, fontSize: 11, color: "#4b6080", lineHeight: 1.7 }}>
            <div>• SETRA — Instruction 73 VR</div>
            <div>• LCPC — Catalogues 88/98</div>
            <div>• Eurocode 7 (géotechnique)</div>
            <div>• ARP — Aménagement Routes</div>
            <div style={{ marginTop: 6, color: "#8bacc8" }}>Rayon min: <span style={{ color: "#f97316" }}>{speed < 80 ? speed * 7 : speed * 9}m</span></div>
            <div>Déclivité max: <span style={{ color: "#f97316" }}>{speed >= 100 ? "4%" : speed >= 80 ? "6%" : "8%"}</span></div>
          </div>

          <div className="section-title" style={{ marginTop: 16 }}>Stations</div>
          <div style={{ maxHeight: 180, overflowY: "auto", marginTop: 8 }}>
            {alignPts.map((p) => (
              <div
                key={p.station}
                onClick={() => setSelectedStation(selectedStation === p.station ? null : p.station)}
                style={{
                  display: "flex", justifyContent: "space-between",
                  padding: "5px 8px", borderRadius: 5, cursor: "pointer", marginBottom: 2,
                  background: selectedStation === p.station ? "#1e3048" : "transparent",
                  fontSize: 11, color: "#8bacc8",
                }}
              >
                <span style={{ fontFamily: "monospace", color: "#f97316" }}>PK {(p.station / 1000).toFixed(3)}</span>
                <span>({p.x.toFixed(0)}, {p.y.toFixed(0)})</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
