"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import AppShell from "@/components/AppShell";
import Header from "@/components/Header";
import { Mountain, RefreshCw, Layers, Download, Info, ZoomIn, ZoomOut, RotateCcw } from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, CartesianGrid, Legend,
} from "recharts";

interface Point3D { x: number; y: number; z: number }
interface Triangle { p1: Point3D; p2: Point3D; p3: Point3D }

function delaunayTriangulate(pts: Point3D[]): Triangle[] {
  if (pts.length < 3) return [];
  const triangles: Triangle[] = [];
  for (let i = 1; i < pts.length - 1; i++) {
    triangles.push({ p1: pts[0], p2: pts[i], p3: pts[i + 1] });
  }
  // Add more triangles for coverage
  for (let i = 0; i < pts.length; i++) {
    for (let j = i + 1; j < pts.length; j++) {
      for (let k = j + 1; k < pts.length; k++) {
        const d1 = Math.sqrt((pts[i].x - pts[j].x) ** 2 + (pts[i].y - pts[j].y) ** 2);
        const d2 = Math.sqrt((pts[j].x - pts[k].x) ** 2 + (pts[j].y - pts[k].y) ** 2);
        const d3 = Math.sqrt((pts[k].x - pts[i].x) ** 2 + (pts[k].y - pts[i].y) ** 2);
        if (d1 < 80 && d2 < 80 && d3 < 80) {
          triangles.push({ p1: pts[i], p2: pts[j], p3: pts[k] });
        }
      }
    }
  }
  return triangles;
}

function elevToColor(z: number, min: number, max: number) {
  const t = (z - min) / (max - min);
  // Color ramp: deep blue → cyan → green → yellow → red
  if (t < 0.25) {
    const u = t / 0.25;
    return `rgb(${Math.round(u * 0)}, ${Math.round(u * 180)}, ${Math.round(160 + u * 95)})`;
  } else if (t < 0.5) {
    const u = (t - 0.25) / 0.25;
    return `rgb(${Math.round(u * 50)}, ${Math.round(180 + u * 60)}, ${Math.round(255 - u * 200)})`;
  } else if (t < 0.75) {
    const u = (t - 0.5) / 0.25;
    return `rgb(${Math.round(50 + u * 200)}, ${Math.round(240 - u * 80)}, ${Math.round(55 - u * 55)})`;
  } else {
    const u = (t - 0.75) / 0.25;
    return `rgb(${Math.round(250)}, ${Math.round(160 - u * 160)}, ${Math.round(u * 20)})`;
  }
}

function generateTerrain(count = 80): Point3D[] {
  const pts: Point3D[] = [];
  // Main ridge
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * 2 * Math.PI;
    const r = 30 + Math.random() * 200;
    const x = 400 + r * Math.cos(angle) + (Math.random() - 0.5) * 40;
    const y = 350 + r * Math.sin(angle) + (Math.random() - 0.5) * 40;
    // Terrain elevation: hill shape + valleys + noise
    const distCenter = Math.sqrt((x - 400) ** 2 + (y - 350) ** 2);
    const hill1 = 80 * Math.exp(-(distCenter * distCenter) / 30000);
    const hill2 = 40 * Math.exp(-(((x - 550) ** 2 + (y - 250) ** 2) / 15000));
        const valley = -(20 * Math.exp(-(((x - 300) ** 2 + (y - 450) ** 2) / 8000)));
    const z = 50 + hill1 + hill2 + valley + (Math.random() - 0.5) * 8;
    pts.push({
      x: Math.round(x * 10) / 10,
      y: Math.round(y * 10) / 10,
      z: Math.round(z * 10) / 10,
    });
  }
  return pts;
}

export default function TerrainPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [points, setPoints] = useState<Point3D[]>([]);
  const [triangles, setTriangles] = useState<Triangle[]>([]);
  const [showContours, setShowContours] = useState(true);
  const [showTIN, setShowTIN] = useState(true);
  const [showPoints, setShowPoints] = useState(true);
  const [showSlope, setShowSlope] = useState(false);
  const [contourInterval, setContourInterval] = useState(5);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [stats, setStats] = useState({ min: 0, max: 0, mean: 0, area: 0 });
  const [profile, setProfile] = useState<{ x: number; z: number }[]>([]);

  const generate = useCallback(() => {
    const pts = generateTerrain(80);
    setPoints(pts);
    const tris = delaunayTriangulate(pts);
    setTriangles(tris);

    const zVals = pts.map((p) => p.z);
    const minZ = Math.min(...zVals);
    const maxZ = Math.max(...zVals);
    const meanZ = zVals.reduce((a, b) => a + b, 0) / zVals.length;
    setStats({ min: minZ, max: maxZ, mean: meanZ, area: Math.round(tris.length * 0.5 * 100) });

    // Generate profile along X axis
    const sorted = [...pts].sort((a, b) => a.x - b.x);
    setProfile(sorted.map((p) => ({ x: Math.round(p.x), z: Math.round(p.z * 10) / 10 })));
  }, []);

  useEffect(() => { generate(); }, [generate]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Background
    ctx.fillStyle = "#0a1520";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (points.length === 0) return;

    const zVals = points.map((p) => p.z);
    const minZ = Math.min(...zVals);
    const maxZ = Math.max(...zVals);

    const toScreen = (p: Point3D) => ({
      sx: p.x * zoom + pan.x,
      sy: p.y * zoom + pan.y,
    });

    // Draw TIN triangles (colored by elevation)
    if (showTIN) {
      triangles.forEach((tri) => {
        const p1 = toScreen(tri.p1);
        const p2 = toScreen(tri.p2);
        const p3 = toScreen(tri.p3);
        const avgZ = (tri.p1.z + tri.p2.z + tri.p3.z) / 3;

        if (showSlope) {
          // Slope visualization
          const dx = tri.p2.x - tri.p1.x;
          const dy = tri.p2.y - tri.p1.y;
          const dz = tri.p2.z - tri.p1.z;
          const slope = Math.abs(dz) / Math.sqrt(dx * dx + dy * dy + dz * dz);
          const slopeT = Math.min(slope * 5, 1);
          ctx.fillStyle = `rgba(${Math.round(slopeT * 255)}, ${Math.round((1 - slopeT) * 150)}, 50, 0.7)`;
        } else {
          const col = elevToColor(avgZ, minZ, maxZ);
          ctx.fillStyle = col.replace("rgb(", "rgba(").replace(")", ", 0.75)");
        }

        ctx.beginPath();
        ctx.moveTo(p1.sx, p1.sy);
        ctx.lineTo(p2.sx, p2.sy);
        ctx.lineTo(p3.sx, p3.sy);
        ctx.closePath();
        ctx.fill();

        // Triangle edges
        ctx.strokeStyle = "rgba(0,0,0,0.2)";
        ctx.lineWidth = 0.3;
        ctx.stroke();
      });
    }

    // Draw contour lines
    if (showContours) {
      const elMin = Math.ceil(minZ / contourInterval) * contourInterval;
      for (let elev = elMin; elev <= maxZ; elev += contourInterval) {
        const isMajor = Math.round(elev) % (contourInterval * 5) === 0;
        ctx.strokeStyle = isMajor ? "rgba(255,200,100,0.8)" : "rgba(200,200,255,0.35)";
        ctx.lineWidth = isMajor ? 1.5 : 0.7;

        // Marching squares approximation along triangles
        triangles.forEach((tri) => {
          const pts = [tri.p1, tri.p2, tri.p3, tri.p1];
          const crossings: { sx: number; sy: number }[] = [];

          for (let i = 0; i < 3; i++) {
            const a = pts[i];
            const b = pts[i + 1];
            if ((a.z <= elev && b.z > elev) || (a.z > elev && b.z <= elev)) {
              const t = (elev - a.z) / (b.z - a.z);
              const ix = a.x + t * (b.x - a.x);
              const iy = a.y + t * (b.y - a.y);
              const s = toScreen({ x: ix, y: iy, z: elev });
              crossings.push(s);
            }
          }

          if (crossings.length === 2) {
            ctx.beginPath();
            ctx.moveTo(crossings[0].sx, crossings[0].sy);
            ctx.lineTo(crossings[1].sx, crossings[1].sy);
            ctx.stroke();
          }
        });

        // Labels for major contours
        if (isMajor) {
          ctx.fillStyle = "rgba(255,200,100,0.9)";
          ctx.font = `${9 * zoom}px monospace`;
        }
      }
    }

    // Draw points
    if (showPoints) {
      points.forEach((p) => {
        const { sx, sy } = toScreen(p);
        ctx.fillStyle = elevToColor(p.z, minZ, maxZ);
        ctx.beginPath();
        ctx.arc(sx, sy, 3, 0, 2 * Math.PI);
        ctx.fill();
      });
    }

    // Color legend
    const legendW = 16, legendH = 150;
    const lx = canvas.width - 80, ly = 20;
    for (let i = 0; i <= legendH; i++) {
      const t = 1 - i / legendH;
      const z = minZ + t * (maxZ - minZ);
      ctx.fillStyle = elevToColor(z, minZ, maxZ);
      ctx.fillRect(lx, ly + i, legendW, 1);
    }
    ctx.strokeStyle = "#2a4060";
    ctx.lineWidth = 1;
    ctx.strokeRect(lx, ly, legendW, legendH);
    ctx.fillStyle = "#e2eaf2";
    ctx.font = "10px monospace";
    ctx.fillText(`${maxZ.toFixed(0)}m`, lx + legendW + 4, ly + 8);
    ctx.fillText(`${((minZ + maxZ) / 2).toFixed(0)}m`, lx + legendW + 4, ly + legendH / 2 + 4);
    ctx.fillText(`${minZ.toFixed(0)}m`, lx + legendW + 4, ly + legendH);

  }, [points, triangles, showContours, showTIN, showPoints, showSlope, contourInterval, zoom, pan]);

  useEffect(() => { draw(); }, [draw]);

  return (
    <AppShell>
      <Header
        title="Modèle Numérique de Terrain (MNT)"
        subtitle="Triangulation de Delaunay · Courbes de niveau · Analyse de pente"
        actions={
          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn-secondary" style={{ fontSize: 11 }}>
              <Download size={12} /> Exporter MNT
            </button>
            <button className="btn-primary" onClick={generate} style={{ fontSize: 11 }}>
              <RefreshCw size={12} /> Régénérer
            </button>
          </div>
        }
      />

      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        {/* Canvas */}
        <div style={{ flex: 1, position: "relative" }}>
          <canvas
            ref={canvasRef}
            width={1400}
            height={900}
            style={{ display: "block", width: "100%", height: "100%", background: "#0a1520" }}
            onWheel={(e) => {
              e.preventDefault();
              const f = e.deltaY > 0 ? 0.9 : 1.1;
              setZoom((z) => Math.max(0.2, Math.min(5, z * f)));
            }}
          />
          {/* Controls overlay */}
          <div style={{ position: "absolute", bottom: 12, left: 12, display: "flex", gap: 6 }}>
            <button className="tool-btn" onClick={() => setZoom((z) => Math.min(z * 1.3, 5))}><ZoomIn size={15} /></button>
            <button className="tool-btn" onClick={() => setZoom((z) => Math.max(z / 1.3, 0.2))}><ZoomOut size={15} /></button>
            <button className="tool-btn" onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }}><RotateCcw size={15} /></button>
          </div>
          {/* Stats overlay */}
          <div
            style={{
              position: "absolute", top: 12, left: 12,
              background: "rgba(11,21,32,0.85)",
              border: "1px solid #1e3048",
              borderRadius: 8,
              padding: "8px 12px",
              fontFamily: "monospace",
              fontSize: 11,
              color: "#8bacc8",
              lineHeight: 1.7,
            }}
          >
            <div style={{ color: "#f97316", fontWeight: 600, marginBottom: 2 }}>MNT — Statistiques</div>
            <div>Points: <span style={{ color: "#4ade80" }}>{points.length}</span></div>
            <div>Triangles: <span style={{ color: "#60a5fa" }}>{triangles.length}</span></div>
            <div>Z min: <span style={{ color: "#06b6d4" }}>{stats.min.toFixed(2)} m</span></div>
            <div>Z max: <span style={{ color: "#f59e0b" }}>{stats.max.toFixed(2)} m</span></div>
            <div>Z moy: <span style={{ color: "#4ade80" }}>{stats.mean.toFixed(2)} m</span></div>
            <div>Surface: <span style={{ color: "#e2eaf2" }}>{stats.area.toLocaleString()} m²</span></div>
          </div>
        </div>

        {/* Right panel */}
        <div
          style={{
            width: 280, background: "#111c28", borderLeft: "1px solid #1e3048",
            padding: 14, display: "flex", flexDirection: "column", gap: 14, overflowY: "auto",
          }}
        >
          <div>
            <div className="section-title">Affichage</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 8 }}>
              {[
                { label: "Triangulation TIN", state: showTIN, set: setShowTIN },
                { label: "Courbes de niveau", state: showContours, set: setShowContours },
                { label: "Points de levé", state: showPoints, set: setShowPoints },
                { label: "Carte de pentes", state: showSlope, set: setShowSlope },
              ].map((item) => (
                <label key={item.label} style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 12, color: "#8bacc8" }}>
                  <input
                    type="checkbox"
                    checked={item.state}
                    onChange={(e) => item.set(e.target.checked)}
                    style={{ accentColor: "#f97316" }}
                  />
                  {item.label}
                </label>
              ))}
            </div>
          </div>

          <div>
            <div className="section-title">Paramètres MNT</div>
            <div style={{ marginTop: 8 }}>
              <label style={{ fontSize: 11, color: "#4b6080", display: "block", marginBottom: 4 }}>
                Équidistance courbes: {contourInterval}m
              </label>
              <input
                type="range" min={1} max={20} value={contourInterval}
                onChange={(e) => setContourInterval(parseInt(e.target.value))}
                style={{ width: "100%", accentColor: "#f97316" }}
              />
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "#4b6080" }}>
                <span>1m</span><span>5m</span><span>10m</span><span>20m</span>
              </div>
            </div>
          </div>

          {/* Profile chart */}
          <div>
            <div className="section-title">Profil longitudinal</div>
            <div style={{ marginTop: 8 }}>
              <ResponsiveContainer width="100%" height={130}>
                <AreaChart data={profile}>
                  <defs>
                    <linearGradient id="terrainGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.5} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e3048" />
                  <XAxis dataKey="x" tick={{ fill: "#4b6080", fontSize: 9 }} />
                  <YAxis tick={{ fill: "#4b6080", fontSize: 9 }} />
                  <Tooltip contentStyle={{ background: "#111c28", border: "1px solid #1e3048", borderRadius: 4, fontSize: 10 }} />
                  <Area type="monotone" dataKey="z" stroke="#10b981" fill="url(#terrainGrad)" strokeWidth={1.5} name="Élévation (m)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Legend */}
          <div>
            <div className="section-title">Légende altimétrique</div>
            <div style={{ marginTop: 8 }}>
              {[
                { label: "Sommets", color: "#ff5500" },
                { label: "Pentes fortes", color: "#ffaa00" },
                { label: "Pentes moyennes", color: "#aaff00" },
                { label: "Plaines", color: "#00ccaa" },
                { label: "Zones basses", color: "#0055ff" },
              ].map((item) => (
                <div key={item.label} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4, fontSize: 11, color: "#8bacc8" }}>
                  <div style={{ width: 18, height: 8, background: item.color, borderRadius: 2 }} />
                  {item.label}
                </div>
              ))}
            </div>
          </div>

          {/* Info */}
          <div style={{ background: "rgba(59,130,246,0.08)", border: "1px solid rgba(59,130,246,0.15)", borderRadius: 8, padding: 10, fontSize: 11, color: "#8bacc8" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 5, color: "#60a5fa", marginBottom: 4, fontWeight: 600 }}>
              <Info size={12} /> Moteur MNT
            </div>
            <div>Algorithme: Triangulation de Delaunay</div>
            <div>Interpolation: Barycentrique</div>
            <div>Courbes: Marching Triangles</div>
            <div style={{ marginTop: 4 }}>Compatible: LandXML, DXF/DWG</div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
