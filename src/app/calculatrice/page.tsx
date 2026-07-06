"use client";
import { useState } from "react";
import Link from "next/link";

export default function CalculatricePage() {
  const [activeCalc, setActiveCalc] = useState("distance");
  
  // Distance et gisement
  const [x1, setX1] = useState("409599.374");
  const [y1, setY1] = useState("192702.767");
  const [x2, setX2] = useState("409885.779");
  const [y2, setY2] = useState("192654.078");

  // Coordonnées depuis gisement
  const [xDep, setXDep] = useState("500.000");
  const [yDep, setYDep] = useState("300.000");
  const [gisement, setGisement] = useState("45.0000");
  const [distance, setDistance] = useState("100.000");

  // Gauss superficie
  const [gaussPoints, setGaussPoints] = useState([
    { x: "409599", y: "192702" },
    { x: "409808", y: "192616" },
    { x: "409849", y: "192706" },
    { x: "409885", y: "192654" },
    { x: "409739", y: "192567" },
    { x: "409707", y: "192635" },
  ]);

  // Calculs distance et gisement
  const dx = parseFloat(x2) - parseFloat(x1);
  const dy = parseFloat(y2) - parseFloat(y1);
  const dist = Math.sqrt(dx*dx + dy*dy);
  const gis = ((Math.atan2(dx, dy) * 200 / Math.PI) + 400) % 400;
  const gisDD = ((Math.atan2(dx, dy) * 180 / Math.PI) + 360) % 360;

  // Calcul coordonnées depuis gisement
  const gRad = parseFloat(gisement) * Math.PI / 200;
  const distN = parseFloat(distance) || 0;
  const xArr = parseFloat(xDep) + distN * Math.sin(gRad);
  const yArr = parseFloat(yDep) + distN * Math.cos(gRad);

  // Calcul superficie Gauss
  function calcGauss() {
    const pts = gaussPoints.map(p => ({ x: parseFloat(p.x) || 0, y: parseFloat(p.y) || 0 }));
    let area = 0;
    for (let i = 0; i < pts.length; i++) {
      const j = (i+1) % pts.length;
      area += pts[i].x * pts[j].y - pts[j].x * pts[i].y;
    }
    return Math.abs(area) / 2;
  }

  const gaussArea = calcGauss();

  const calcs = [
    { id: "distance", label: "📏 Distance & Gisement", color: "#F97316" },
    { id: "coordonnees", label: "📍 Coordonnées", color: "#3B82F6" },
    { id: "gauss", label: "📐 Superficie Gauss", color: "#22C55E" },
    { id: "conversion", label: "🔄 Conversions", color: "#A855F7" },
  ];

  // Conversions angles
  const [angleInput, setAngleInput] = useState("100");
  const [angleType, setAngleType] = useState("grade");
  const angleVal = parseFloat(angleInput) || 0;
  const toGrade = angleType === "grade" ? angleVal : angleType === "degree" ? angleVal * 400/360 : angleVal * 200/Math.PI;
  const toDegree = angleType === "grade" ? angleVal * 360/400 : angleType === "degree" ? angleVal : angleVal * 180/Math.PI;
  const toRadian = angleType === "grade" ? angleVal * Math.PI/200 : angleType === "degree" ? angleVal * Math.PI/180 : angleVal;
  const dms = (() => {
    const deg = Math.abs(toDegree);
    const d = Math.floor(deg);
    const m = Math.floor((deg - d) * 60);
    const s = ((deg - d) * 60 - m) * 60;
    return `${d}° ${m}' ${s.toFixed(2)}"`;
  })();

  return (
    <div style={{ minHeight: "100vh", background: "#0D1117", color: "#E2EAF2", fontFamily: "Arial" }}>
      <div style={{ background: "#161B22", borderBottom: "1px solid #1E2D3D", padding: "0 24px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 56 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ fontSize: 18, fontWeight: 700 }}>Terra<span style={{ color: "#F97316" }}>Maps</span></div>
          <span style={{ background: "#F59E0B", color: "#fff", fontSize: 10, fontWeight: 700, padding: "2px 10px", borderRadius: 20 }}>CALCULATRICE</span>
        </div>
        <Link href="/dashboard" style={{ color: "#64748B", fontSize: 13, textDecoration: "none" }}>← Dashboard</Link>
      </div>

      <div style={{ padding: 24, maxWidth: 900, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ fontSize: 48, marginBottom: 8 }}>🧮</div>
          <h1 style={{ margin: "0 0 8px", fontSize: 22, fontWeight: 700 }}>Calculatrice Topographique</h1>
          <p style={{ color: "#64748B", fontSize: 13 }}>Outils de calcul courants pour le topographe</p>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap" }}>
          {calcs.map(c => (
            <button key={c.id} onClick={() => setActiveCalc(c.id)}
              style={{ background: activeCalc === c.id ? c.color : "#161B22", border: `1px solid ${activeCalc === c.id ? c.color : "#1E2D3D"}`, color: "#fff", padding: "10px 20px", borderRadius: 10, cursor: "pointer", fontSize: 13, fontWeight: activeCalc === c.id ? 700 : 400 }}>
              {c.label}
            </button>
          ))}
        </div>

        {/* Distance & Gisement */}
        {activeCalc === "distance" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            <div style={{ background: "#161B22", border: "1px solid #1E2D3D", borderRadius: 12, padding: 24 }}>
              <h3 style={{ margin: "0 0 16px", fontSize: 14, color: "#8BACC8" }}>Point 1</h3>
              {[["X1", x1, setX1], ["Y1", y1, setY1]].map(([label, val, set]: any) => (
                <div key={label} style={{ marginBottom: 12 }}>
                  <label style={{ fontSize: 11, color: "#64748B", display: "block", marginBottom: 4 }}>{label} (m)</label>
                  <input value={val} onChange={e => set(e.target.value)}
                    style={{ width: "100%", background: "#0D1117", border: "1px solid #1E2D3D", borderRadius: 8, padding: "8px 12px", color: "#3B82F6", fontSize: 13, fontFamily: "monospace", boxSizing: "border-box" }} />
                </div>
              ))}
              <h3 style={{ margin: "16px 0", fontSize: 14, color: "#8BACC8" }}>Point 2</h3>
              {[["X2", x2, setX2], ["Y2", y2, setY2]].map(([label, val, set]: any) => (
                <div key={label} style={{ marginBottom: 12 }}>
                  <label style={{ fontSize: 11, color: "#64748B", display: "block", marginBottom: 4 }}>{label} (m)</label>
                  <input value={val} onChange={e => set(e.target.value)}
                    style={{ width: "100%", background: "#0D1117", border: "1px solid #1E2D3D", borderRadius: 8, padding: "8px 12px", color: "#22C55E", fontSize: 13, fontFamily: "monospace", boxSizing: "border-box" }} />
                </div>
              ))}
            </div>
            <div style={{ background: "#161B22", border: "1px solid #1E2D3D", borderRadius: 12, padding: 24 }}>
              <h3 style={{ margin: "0 0 20px", fontSize: 14, color: "#8BACC8" }}>Résultats</h3>
              {[
                { label: "Distance", value: dist.toFixed(3) + " m", color: "#F97316", big: true },
                { label: "Gisement (grades)", value: gis.toFixed(4) + " g", color: "#A855F7", big: true },
                { label: "Gisement (degrés)", value: gisDD.toFixed(4) + "°", color: "#3B82F6" },
                { label: "dX", value: dx.toFixed(3) + " m", color: "#22C55E" },
                { label: "dY", value: dy.toFixed(3) + " m", color: "#22C55E" },
              ].map(r => (
                <div key={r.label} style={{ background: "#0D1117", borderRadius: 8, padding: "12px 16px", marginBottom: 10 }}>
                  <div style={{ fontSize: 10, color: "#64748B", marginBottom: 4, textTransform: "uppercase" }}>{r.label}</div>
                  <div style={{ fontSize: r.big ? 22 : 16, fontWeight: 700, color: r.color, fontFamily: "monospace" }}>{r.value}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Coordonnées depuis gisement */}
        {activeCalc === "coordonnees" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            <div style={{ background: "#161B22", border: "1px solid #1E2D3D", borderRadius: 12, padding: 24 }}>
              <h3 style={{ margin: "0 0 16px", fontSize: 14, color: "#8BACC8" }}>Point de départ + Mesures</h3>
              {[
                ["X départ", xDep, setXDep, "#3B82F6"],
                ["Y départ", yDep, setYDep, "#22C55E"],
                ["Gisement (g)", gisement, setGisement, "#A855F7"],
                ["Distance (m)", distance, setDistance, "#F59E0B"],
              ].map(([label, val, set, color]: any) => (
                <div key={label} style={{ marginBottom: 14 }}>
                  <label style={{ fontSize: 11, color: "#64748B", display: "block", marginBottom: 4 }}>{label}</label>
                  <input value={val} onChange={e => set(e.target.value)}
                    style={{ width: "100%", background: "#0D1117", border: `1px solid ${color}40`, borderRadius: 8, padding: "8px 12px", color, fontSize: 13, fontFamily: "monospace", boxSizing: "border-box" }} />
                </div>
              ))}
            </div>
            <div style={{ background: "#161B22", border: "1px solid #1E2D3D", borderRadius: 12, padding: 24 }}>
              <h3 style={{ margin: "0 0 20px", fontSize: 14, color: "#8BACC8" }}>Point d'arrivée calculé</h3>
              <div style={{ background: "#0D1117", borderRadius: 10, padding: 20, marginBottom: 16, textAlign: "center" }}>
                <div style={{ fontSize: 11, color: "#64748B", marginBottom: 8 }}>X arrivée</div>
                <div style={{ fontSize: 24, fontWeight: 700, color: "#3B82F6", fontFamily: "monospace" }}>{xArr.toFixed(3)} m</div>
              </div>
              <div style={{ background: "#0D1117", borderRadius: 10, padding: 20, textAlign: "center" }}>
                <div style={{ fontSize: 11, color: "#64748B", marginBottom: 8 }}>Y arrivée</div>
                <div style={{ fontSize: 24, fontWeight: 700, color: "#22C55E", fontFamily: "monospace" }}>{yArr.toFixed(3)} m</div>
              </div>
              <div style={{ background: "#0D1117", borderRadius: 10, padding: 16, marginTop: 16 }}>
                <div style={{ fontSize: 11, color: "#64748B", marginBottom: 8 }}>Formules utilisées</div>
                <div style={{ fontSize: 12, color: "#8BACC8", fontFamily: "monospace" }}>
                  X = {parseFloat(xDep).toFixed(3)} + {distN.toFixed(3)} × sin({parseFloat(gisement).toFixed(4)}g)<br/>
                  Y = {parseFloat(yDep).toFixed(3)} + {distN.toFixed(3)} × cos({parseFloat(gisement).toFixed(4)}g)
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Gauss superficie */}
        {activeCalc === "gauss" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            <div style={{ background: "#161B22", border: "1px solid #1E2D3D", borderRadius: 12, padding: 24 }}>
              <h3 style={{ margin: "0 0 16px", fontSize: 14, color: "#8BACC8" }}>Points du polygone</h3>
              <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 12 }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid #1E2D3D" }}>
                    <th style={{ padding: "6px 8px", color: "#64748B", textAlign: "left", fontSize: 10 }}>#</th>
                    <th style={{ padding: "6px 8px", color: "#64748B", textAlign: "left", fontSize: 10 }}>X (m)</th>
                    <th style={{ padding: "6px 8px", color: "#64748B", textAlign: "left", fontSize: 10 }}>Y (m)</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {gaussPoints.map((p, i) => (
                    <tr key={i} style={{ borderBottom: "1px solid #0D1117" }}>
                      <td style={{ padding: "4px 8px", color: "#F97316", fontWeight: 700, fontSize: 12 }}>{i+1}</td>
                      <td style={{ padding: "4px 6px" }}>
                        <input value={p.x} onChange={e => setGaussPoints(prev => prev.map((pt, j) => j===i ? {...pt, x: e.target.value} : pt))}
                          style={{ width: 85, background: "#0D1117", border: "1px solid #1E2D3D", borderRadius: 6, padding: "4px 8px", color: "#3B82F6", fontSize: 11, fontFamily: "monospace" }} />
                      </td>
                      <td style={{ padding: "4px 6px" }}>
                        <input value={p.y} onChange={e => setGaussPoints(prev => prev.map((pt, j) => j===i ? {...pt, y: e.target.value} : pt))}
                          style={{ width: 85, background: "#0D1117", border: "1px solid #1E2D3D", borderRadius: 6, padding: "4px 8px", color: "#22C55E", fontSize: 11, fontFamily: "monospace" }} />
                      </td>
                      <td style={{ padding: "4px 6px" }}>
                        <button onClick={() => setGaussPoints(prev => prev.filter((_, j) => j !== i))}
                          style={{ background: "transparent", border: "none", color: "#EF4444", cursor: "pointer" }}>×</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <button onClick={() => setGaussPoints(prev => [...prev, { x: "0", y: "0" }])}
                style={{ width: "100%", background: "transparent", border: "1px dashed #1E2D3D", color: "#64748B", padding: "7px", borderRadius: 8, cursor: "pointer", fontSize: 12 }}>
                + Ajouter un point
              </button>
            </div>
            <div style={{ background: "#161B22", border: "1px solid #1E2D3D", borderRadius: 12, padding: 24 }}>
              <h3 style={{ margin: "0 0 20px", fontSize: 14, color: "#8BACC8" }}>Superficie calculée</h3>
              <div style={{ background: "#0D1117", borderRadius: 12, padding: 24, textAlign: "center", marginBottom: 16 }}>
                <div style={{ fontSize: 11, color: "#64748B", marginBottom: 8 }}>Superficie (Méthode Gauss)</div>
                <div style={{ fontSize: 28, fontWeight: 700, color: "#22C55E", fontFamily: "monospace" }}>{gaussArea.toFixed(2)} m²</div>
                <div style={{ fontSize: 16, color: "#64748B", marginTop: 8 }}>{(gaussArea/10000).toFixed(4)} Ha</div>
                <div style={{ fontSize: 14, color: "#64748B" }}>{(gaussArea/10000*1.0).toFixed(4)} hectares</div>
              </div>
              <div style={{ background: "#0D1117", borderRadius: 8, padding: 16 }}>
                <div style={{ fontSize: 11, color: "#64748B", marginBottom: 8 }}>Informations</div>
                <div style={{ fontSize: 12, color: "#8BACC8", lineHeight: 1.8 }}>
                  Nombre de points: <b style={{ color: "#F97316" }}>{gaussPoints.length}</b><br/>
                  Périmètre approx: <b style={{ color: "#3B82F6" }}>~{Math.sqrt(gaussArea * 4).toFixed(1)} m</b><br/>
                  Formule: S = |Σ(Xi·Yi+1 - Xi+1·Yi)| / 2
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Conversions */}
        {activeCalc === "conversion" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            <div style={{ background: "#161B22", border: "1px solid #1E2D3D", borderRadius: 12, padding: 24 }}>
              <h3 style={{ margin: "0 0 16px", fontSize: 14, color: "#8BACC8" }}>Convertir un angle</h3>
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 11, color: "#64748B", display: "block", marginBottom: 4 }}>Valeur</label>
                <input value={angleInput} onChange={e => setAngleInput(e.target.value)}
                  style={{ width: "100%", background: "#0D1117", border: "1px solid #A855F7", borderRadius: 8, padding: "10px 14px", color: "#A855F7", fontSize: 16, fontFamily: "monospace", fontWeight: 700, boxSizing: "border-box" }} />
              </div>
              <div>
                <label style={{ fontSize: 11, color: "#64748B", display: "block", marginBottom: 4 }}>Type d'entrée</label>
                <select value={angleType} onChange={e => setAngleType(e.target.value)}
                  style={{ width: "100%", background: "#0D1117", border: "1px solid #1E2D3D", borderRadius: 8, padding: "10px 14px", color: "#fff", fontSize: 13 }}>
                  <option value="grade">Grades (gon)</option>
                  <option value="degree">Degrés (°)</option>
                  <option value="radian">Radians (rad)</option>
                </select>
              </div>
            </div>
            <div style={{ background: "#161B22", border: "1px solid #1E2D3D", borderRadius: 12, padding: 24 }}>
              <h3 style={{ margin: "0 0 16px", fontSize: 14, color: "#8BACC8" }}>Résultats</h3>
              {[
                { label: "Grades (gon)", value: toGrade.toFixed(4) + " g", color: "#F97316" },
                { label: "Degrés (°)", value: toDegree.toFixed(4) + "°", color: "#3B82F6" },
                { label: "Radians", value: toRadian.toFixed(6) + " rad", color: "#22C55E" },
                { label: "DMS", value: dms, color: "#A855F7" },
              ].map(r => (
                <div key={r.label} style={{ background: "#0D1117", borderRadius: 8, padding: "12px 16px", marginBottom: 10 }}>
                  <div style={{ fontSize: 10, color: "#64748B", marginBottom: 4 }}>{r.label}</div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: r.color, fontFamily: "monospace" }}>{r.value}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
