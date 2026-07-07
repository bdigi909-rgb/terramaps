"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

interface Station {
  id: number;
  point: string;
  angle: string;
  distance: string;
}

export default function PolygonalePage() {
  const [stations, setStations] = useState<Station[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("tm_polygonale_stations");
      if (saved) return JSON.parse(saved);
    }
    return [
    { id: 1, point: "A", angle: "0.0000", distance: "125.450" },
    { id: 2, point: "B", angle: "78.3215", distance: "98.320" },
    { id: 3, point: "C", angle: "142.1530", distance: "110.780" },
    { id: 4, point: "D", angle: "210.4512", distance: "87.650" },
    { id: 5, point: "E", angle: "290.1845", distance: "134.220" },
    ];
  });
  const [xDepart, setXDepart] = useState(() => typeof window !== "undefined" ? localStorage.getItem("tm_poly_x") || "500.000" : "500.000");
  const [yDepart, setYDepart] = useState(() => typeof window !== "undefined" ? localStorage.getItem("tm_poly_y") || "300.000" : "300.000");

  // Load saved data on mount
  useEffect(() => {
    const saved = localStorage.getItem("tm_poly_stations");
    if (saved) setStations(JSON.parse(saved));
    const savedX = localStorage.getItem("tm_poly_x");
    const savedY = localStorage.getItem("tm_poly_y");
    if (savedX) setXDepart(savedX);
    if (savedY) setYDepart(savedY);
  }, []);

  // Load saved data on mount
  useEffect(() => {
    const saved = localStorage.getItem("tm_poly_stations");
    if (saved) setStations(JSON.parse(saved));
    const savedX = localStorage.getItem("tm_poly_x");
    const savedY = localStorage.getItem("tm_poly_y");
    if (savedX) setXDepart(savedX);
    if (savedY) setYDepart(savedY);
  }, []);

  // Auto-save
  useEffect(() => {
    localStorage.setItem("tm_poly_stations", JSON.stringify(stations));
    localStorage.setItem("tm_poly_x", xDepart);
    localStorage.setItem("tm_poly_y", yDepart);
  }, [stations, xDepart, yDepart]);

  function addStation() {
    const lastId = Math.max(...stations.map(s => s.id), 0);
    setStations(prev => [...prev, { id: lastId+1, point: `P${lastId+1}`, angle: "0.0000", distance: "0.000" }]);
  }

  function removeStation(id: number) {
    setStations(prev => prev.filter(s => s.id !== id));
  }

  function updateStation(id: number, field: keyof Station, value: string) {
    setStations(prev => prev.map(s => s.id === id ? { ...s, [field]: value } : s));
  }

  // Conversion grade -> radian
  function gradToRad(g: number) { return g * Math.PI / 200; }

  // Calcul polygonale
  function calculate() {
    const results: any[] = [];
    let x = parseFloat(xDepart) || 0;
    let y = parseFloat(yDepart) || 0;
    let sumDX = 0, sumDY = 0;

    stations.forEach((s, i) => {
      const angle = parseFloat(s.angle) || 0;
      const dist = parseFloat(s.distance) || 0;
      const rad = gradToRad(angle);
      const dx = dist * Math.sin(rad);
      const dy = dist * Math.cos(rad);
      sumDX += dx;
      sumDY += dy;
      const xNext = x + dx;
      const yNext = y + dy;
      results.push({
        point: s.point,
        angle: angle.toFixed(4),
        distance: dist.toFixed(3),
        dx: dx.toFixed(3),
        dy: dy.toFixed(3),
        x: x.toFixed(3),
        y: y.toFixed(3),
      });
      x = xNext;
      y = yNext;
    });

    return { results, sumDX, sumDY, xFinal: x, yFinal: y };
  }

  const { results, sumDX, sumDY, xFinal, yFinal } = calculate();
  const x0 = parseFloat(xDepart) || 0;
  const y0 = parseFloat(yDepart) || 0;
  const fx = xFinal - x0;
  const fy = yFinal - y0;
  const fermeture = Math.sqrt(fx*fx + fy*fy);
  const perimetre = stations.reduce((s, st) => s + (parseFloat(st.distance) || 0), 0);
  const precision = perimetre > 0 ? perimetre / fermeture : 0;
  const tolerance = perimetre / 3000; // Tolérance 1/3000

  function compensate() {
    const { results: res } = calculate();
    const rows = ["Point,X brut,Y brut,Correction X,Correction Y,X compensé,Y compensé"];
    res.forEach((r, i) => {
      const corrX = -fx * (parseFloat(r.distance) / perimetre) * (i+1);
      const corrY = -fy * (parseFloat(r.distance) / perimetre) * (i+1);
      rows.push(`${r.point},${r.x},${r.y},${corrX.toFixed(3)},${corrY.toFixed(3)},${(parseFloat(r.x)+corrX).toFixed(3)},${(parseFloat(r.y)+corrY).toFixed(3)}`);
    });
    const blob = new Blob([rows.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "polygonale_compensee.csv"; a.click();
  }

  async function exportPDF() {
    const { default: jsPDF } = await import("jspdf");
    const { default: autoTable } = await import("jspdf-autotable");
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const W = 210, m = 10;
    doc.setDrawColor(0); doc.setLineWidth(0.8);
    doc.rect(m, m, W-m*2, 277);
    doc.setFillColor(13, 71, 161);
    doc.rect(m+4, m+4, W-m*2-8, 20, "F");
    doc.setFontSize(12); doc.setFont("helvetica", "bold"); doc.setTextColor(255,255,255);
    doc.text("ROYAUME DU MAROC - RAPPORT DE POLYGONALE", W/2, m+12, { align: "center" });
    doc.setFontSize(9); doc.setFont("helvetica", "normal");
    doc.text("TerraMaps v2.0 - " + new Date().toLocaleDateString("fr-FR"), W/2, m+19, { align: "center" });

    autoTable(doc, {
      startY: m + 28, margin: { left: m+4, right: m+4 },
      head: [["Point", "Angle (g)", "Dist (m)", "dX (m)", "dY (m)", "X (m)", "Y (m)"]],
      body: results.map((r: any) => [r.point, r.angle, r.distance, r.dx, r.dy, r.x, r.y]),
      headStyles: { fillColor: [13, 71, 161], textColor: 255, fontStyle: "bold", fontSize: 8 },
      bodyStyles: { fontSize: 7.5 },
      alternateRowStyles: { fillColor: [240, 244, 255] },
    });

    const y = (doc as any).lastAutoTable.finalY + 8;
    autoTable(doc, {
      startY: y, margin: { left: m+4, right: m+4 },
      head: [["Fermeture", "Valeur"]],
      body: [
        ["Perimetre", perimetre.toFixed(3) + " m"],
        ["fX", (fx >= 0 ? "+" : "") + fx.toFixed(3) + " m"],
        ["fY", (fy >= 0 ? "+" : "") + fy.toFixed(3) + " m"],
        ["Fermeture", fermeture.toFixed(3) + " m"],
        ["Tolerance (1/3000)", "+-" + tolerance.toFixed(3) + " m"],
        ["Precision", "1/" + (precision > 0 ? Math.round(precision).toString() : "inf")],
        ["Resultat", accepted ? "POLYGONALE ACCEPTEE" : "POLYGONALE REFUSEE"],
      ],
      headStyles: { fillColor: accepted ? [46, 125, 50] : [183, 28, 28], textColor: 255, fontStyle: "bold", fontSize: 9 },
      bodyStyles: { fontSize: 8 },
      alternateRowStyles: { fillColor: accepted ? [240, 255, 240] : [255, 240, 240] },
    });

    const y2 = (doc as any).lastAutoTable.finalY + 8;
    doc.setFontSize(10); doc.setFont("helvetica", "bold"); doc.setTextColor(0,0,0);
    doc.text("Compensation Bowditch", W/2, y2, { align: "center" });
    autoTable(doc, {
      startY: y2 + 4, margin: { left: m+4, right: m+4 },
      head: [["Point", "X brut", "Y brut", "Corr. X", "Corr. Y", "X comp.", "Y comp."]],
      body: results.map((r: any, i: number) => {
        const corrX = perimetre > 0 ? -fx * (parseFloat(r.distance) / perimetre) * (i+1) : 0;
        const corrY = perimetre > 0 ? -fy * (parseFloat(r.distance) / perimetre) * (i+1) : 0;
        return [r.point, r.x, r.y, corrX.toFixed(3), corrY.toFixed(3), (parseFloat(r.x)+corrX).toFixed(3), (parseFloat(r.y)+corrY).toFixed(3)];
      }),
      headStyles: { fillColor: [74, 20, 140], textColor: 255, fontStyle: "bold", fontSize: 8 },
      bodyStyles: { fontSize: 7.5 },
      alternateRowStyles: { fillColor: [245, 240, 255] },
    });

    const footY = 277;
    doc.setLineWidth(0.3); doc.line(m+4, footY-20, W-m-4, footY-20);
    doc.setFontSize(8); doc.setTextColor(0,0,0);
    doc.text("Technicien :", m+10, footY-14);
    doc.rect(W-m-45, footY-17, 40, 14);
    doc.text("Cachet et Signature", W-m-44, footY-14);
    doc.setFontSize(7); doc.setTextColor(100,100,100);
    doc.text("TerraMaps v2.0 - terramaps.vercel.app", W/2, footY-4, { align: "center" });
    doc.save("Polygonale_" + new Date().toISOString().slice(0,10) + ".pdf");
  }

  function exportCSV() {
    const rows = ["Point,Angle(g),Distance(m),dX(m),dY(m),X(m),Y(m)"];
    results.forEach(r => rows.push(`${r.point},${r.angle},${r.distance},${r.dx},${r.dy},${r.x},${r.y}`));
    const blob = new Blob([rows.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "polygonale.csv"; a.click();
  }

  const accepted = fermeture <= tolerance;

  return (
    <div style={{ minHeight: "100vh", background: "#0D1117", color: "#E2EAF2", fontFamily: "Arial" }}>
      <div style={{ background: "#161B22", borderBottom: "1px solid #1E2D3D", padding: "0 24px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 56 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ fontSize: 18, fontWeight: 700 }}>Terra<span style={{ color: "#F97316" }}>Maps</span></div>
          <span style={{ background: "#A855F7", color: "#fff", fontSize: 10, fontWeight: 700, padding: "2px 10px", borderRadius: 20 }}>POLYGONALE</span>
        </div>
        <Link href="/dashboard" style={{ color: "#64748B", fontSize: 13, textDecoration: "none" }}>← Dashboard</Link>
      </div>

      <div style={{ padding: 24, maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ fontSize: 48, marginBottom: 8 }}>🔺</div>
          <h1 style={{ margin: "0 0 8px", fontSize: 22, fontWeight: 700 }}>Rapport de Fermeture de Polygonale</h1>
          <p style={{ color: "#64748B", fontSize: 13 }}>Calcul et vérification de la fermeture — Angles en grades (gon)</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 24 }}>
          <div>
            {/* Point départ */}
            <div style={{ background: "#161B22", border: "1px solid #1E2D3D", borderRadius: 12, padding: 20, marginBottom: 16 }}>
              <h3 style={{ margin: "0 0 12px", fontSize: 13, fontWeight: 600, color: "#8BACC8" }}>Point de départ</h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={{ fontSize: 10, color: "#64748B", display: "block", marginBottom: 4, textTransform: "uppercase" }}>X départ (m)</label>
                  <input value={xDepart} onChange={e => setXDepart(e.target.value)}
                    style={{ width: "100%", background: "#0D1117", border: "1px solid #3B82F6", borderRadius: 8, padding: "8px 12px", color: "#3B82F6", fontSize: 13, fontFamily: "monospace", fontWeight: 700, boxSizing: "border-box" }} />
                </div>
                <div>
                  <label style={{ fontSize: 10, color: "#64748B", display: "block", marginBottom: 4, textTransform: "uppercase" }}>Y départ (m)</label>
                  <input value={yDepart} onChange={e => setYDepart(e.target.value)}
                    style={{ width: "100%", background: "#0D1117", border: "1px solid #22C55E", borderRadius: 8, padding: "8px 12px", color: "#22C55E", fontSize: 13, fontFamily: "monospace", fontWeight: 700, boxSizing: "border-box" }} />
                </div>
              </div>
            </div>

            {/* Saisie stations */}
            <div style={{ background: "#161B22", border: "1px solid #1E2D3D", borderRadius: 12, padding: 20, marginBottom: 16 }}>
              <h3 style={{ margin: "0 0 12px", fontSize: 13, fontWeight: 600, color: "#8BACC8" }}>Stations et mesures</h3>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid #1E2D3D" }}>
                    {["Point", "Gisement/Angle (g)", "Distance (m)", ""].map(h => (
                      <th key={h} style={{ padding: "6px 8px", color: "#64748B", textAlign: "left", fontSize: 10, textTransform: "uppercase" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {stations.map(s => (
                    <tr key={s.id} style={{ borderBottom: "1px solid #0D1117" }}>
                      <td style={{ padding: "5px 6px" }}>
                        <input value={s.point} onChange={e => updateStation(s.id, "point", e.target.value)}
                          style={{ width: 50, background: "#0D1117", border: "1px solid #1E2D3D", borderRadius: 6, padding: "5px 8px", color: "#F97316", fontSize: 12, fontWeight: 700 }} />
                      </td>
                      <td style={{ padding: "5px 6px" }}>
                        <input value={s.angle} onChange={e => updateStation(s.id, "angle", e.target.value)}
                          style={{ width: 100, background: "#0D1117", border: "1px solid #1E2D3D", borderRadius: 6, padding: "5px 8px", color: "#A855F7", fontSize: 12, fontFamily: "monospace" }} />
                      </td>
                      <td style={{ padding: "5px 6px" }}>
                        <input value={s.distance} onChange={e => updateStation(s.id, "distance", e.target.value)}
                          style={{ width: 90, background: "#0D1117", border: "1px solid #1E2D3D", borderRadius: 6, padding: "5px 8px", color: "#F59E0B", fontSize: 12, fontFamily: "monospace" }} />
                      </td>
                      <td style={{ padding: "5px 6px" }}>
                        <button onClick={() => removeStation(s.id)} style={{ background: "transparent", border: "none", color: "#EF4444", cursor: "pointer", fontSize: 16 }}>×</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <button onClick={addStation} style={{ marginTop: 10, background: "transparent", border: "1px dashed #1E2D3D", color: "#64748B", padding: "7px 14px", borderRadius: 8, cursor: "pointer", fontSize: 12, width: "100%" }}>
                + Ajouter une station
              </button>
            </div>

            {/* Résultats */}
            <div style={{ background: "#161B22", border: "1px solid #1E2D3D", borderRadius: 12, padding: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <h3 style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "#8BACC8" }}>📊 Coordonnées calculées</h3>
                <button onClick={exportCSV} style={{ background: "#F97316", border: "none", color: "#fff", padding: "6px 14px", borderRadius: 6, cursor: "pointer", fontSize: 11, fontWeight: 600 }}>⬇️ CSV</button>
                <button onClick={exportPDF} style={{ background: "#0D47A1", border: "none", color: "#fff", padding: "7px 14px", borderRadius: 6, cursor: "pointer", fontSize: 12, fontWeight: 600 }}>📄 PDF</button>
              </div>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11 }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid #1E2D3D" }}>
                    {["Point", "Angle (g)", "Dist (m)", "dX (m)", "dY (m)", "X (m)", "Y (m)"].map(h => (
                      <th key={h} style={{ padding: "6px 8px", color: "#64748B", textAlign: "left", fontSize: 9, textTransform: "uppercase" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {results.map((r, i) => (
                    <tr key={i} style={{ borderBottom: "1px solid #0D1117", background: i%2===0 ? "rgba(255,255,255,0.02)" : "transparent" }}>
                      <td style={{ padding: "6px 8px", color: "#F97316", fontWeight: 700 }}>{r.point}</td>
                      <td style={{ padding: "6px 8px", color: "#A855F7", fontFamily: "monospace" }}>{r.angle}</td>
                      <td style={{ padding: "6px 8px", color: "#F59E0B", fontFamily: "monospace" }}>{r.distance}</td>
                      <td style={{ padding: "6px 8px", color: parseFloat(r.dx)>=0?"#22C55E":"#EF4444", fontFamily: "monospace" }}>{r.dx}</td>
                      <td style={{ padding: "6px 8px", color: parseFloat(r.dy)>=0?"#22C55E":"#EF4444", fontFamily: "monospace" }}>{r.dy}</td>
                      <td style={{ padding: "6px 8px", color: "#3B82F6", fontFamily: "monospace", fontWeight: 600 }}>{r.x}</td>
                      <td style={{ padding: "6px 8px", color: "#22C55E", fontFamily: "monospace", fontWeight: 600 }}>{r.y}</td>
                    </tr>
                  ))}
                  <tr style={{ borderTop: "2px solid #1E2D3D", background: "rgba(249,115,22,0.05)" }}>
                    <td colSpan={3} style={{ padding: "6px 8px", color: "#64748B", fontSize: 10, fontWeight: 700 }}>SOMMES</td>
                    <td style={{ padding: "6px 8px", color: "#22C55E", fontFamily: "monospace", fontWeight: 700 }}>{sumDX.toFixed(3)}</td>
                    <td style={{ padding: "6px 8px", color: "#22C55E", fontFamily: "monospace", fontWeight: 700 }}>{sumDY.toFixed(3)}</td>
                    <td style={{ padding: "6px 8px", color: "#3B82F6", fontFamily: "monospace", fontWeight: 700 }}>{xFinal.toFixed(3)}</td>
                    <td style={{ padding: "6px 8px", color: "#22C55E", fontFamily: "monospace", fontWeight: 700 }}>{yFinal.toFixed(3)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Panel fermeture */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ background: "#161B22", border: `2px solid ${accepted ? "#22C55E" : "#EF4444"}`, borderRadius: 12, padding: 20 }}>
              <h3 style={{ margin: "0 0 16px", fontSize: 14, fontWeight: 600, color: "#8BACC8" }}>🔍 Fermeture</h3>
              {[
                { label: "Périmètre", value: perimetre.toFixed(3) + " m", color: "#F59E0B" },
                { label: "fX", value: (fx >= 0 ? "+" : "") + fx.toFixed(3) + " m", color: Math.abs(fx) < 0.1 ? "#22C55E" : "#EF4444" },
                { label: "fY", value: (fy >= 0 ? "+" : "") + fy.toFixed(3) + " m", color: Math.abs(fy) < 0.1 ? "#22C55E" : "#EF4444" },
                { label: "Fermeture", value: fermeture.toFixed(3) + " m", color: accepted ? "#22C55E" : "#EF4444" },
                { label: "Tolérance (1/3000)", value: "±" + tolerance.toFixed(3) + " m", color: "#64748B" },
                { label: "Précision", value: "1/" + (precision > 0 ? Math.round(precision).toLocaleString() : "∞"), color: accepted ? "#22C55E" : "#EF4444" },
              ].map(item => (
                <div key={item.label} style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: "1px solid #1E2D3D" }}>
                  <span style={{ fontSize: 12, color: "#64748B" }}>{item.label}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: item.color, fontFamily: "monospace" }}>{item.value}</span>
                </div>
              ))}
              <div style={{ marginTop: 16, padding: 14, borderRadius: 10, background: accepted ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)", border: `1px solid ${accepted ? "rgba(34,197,94,0.3)" : "rgba(239,68,68,0.3)"}`, textAlign: "center" }}>
                <div style={{ fontSize: 20, marginBottom: 4 }}>{accepted ? "✅" : "❌"}</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: accepted ? "#22C55E" : "#EF4444" }}>
                  {accepted ? "POLYGONALE ACCEPTÉE" : "POLYGONALE REFUSÉE"}
                </div>
                <div style={{ fontSize: 11, color: "#64748B", marginTop: 4 }}>
                  {accepted ? `Précision 1/${Math.round(precision).toLocaleString()}` : "Reprendre les mesures"}
                </div>
              </div>
            </div>

            <div style={{ background: "#161B22", border: "1px solid #1E2D3D", borderRadius: 12, padding: 20 }}>
              <h3 style={{ margin: "0 0 12px", fontSize: 13, fontWeight: 600, color: "#8BACC8" }}>💡 Guide</h3>
              <div style={{ fontSize: 11, color: "#64748B", lineHeight: 2 }}>
                <div>• Angles en <b style={{ color: "#A855F7" }}>grades (gon)</b></div>
                <div>• 400g = 360° = tour complet</div>
                <div>• dX = D × sin(G)</div>
                <div>• dY = D × cos(G)</div>
                <div>• Tolérance: P/3000</div>
                <div>• Précision min: 1/3000</div>

        {/* Compensation Bowditch */}
        <div style={{ background: "#161B22", border: "1px solid #1E2D3D", borderRadius: 12, padding: 20, marginTop: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: "#8BACC8" }}>Compensation Bowditch</h3>
            <button onClick={compensate} style={{ background: "#22C55E", border: "none", color: "#fff", padding: "7px 16px", borderRadius: 8, cursor: "pointer", fontSize: 12, fontWeight: 600 }}>Export CSV</button>
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11 }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #1E2D3D" }}>
                {["Point", "X brut", "Y brut", "Corr. X", "Corr. Y", "X comp.", "Y comp."].map(h => (
                  <th key={h} style={{ padding: "6px 8px", color: "#64748B", textAlign: "left", fontSize: 9, textTransform: "uppercase" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {results.map((r, i) => {
                const corrX = perimetre > 0 ? -fx * (parseFloat(r.distance) / perimetre) * (i+1) : 0;
                const corrY = perimetre > 0 ? -fy * (parseFloat(r.distance) / perimetre) * (i+1) : 0;
                return (
                  <tr key={i} style={{ borderBottom: "1px solid #0D1117" }}>
                    <td style={{ padding: "6px 8px", color: "#F97316", fontWeight: 700 }}>{r.point}</td>
                    <td style={{ padding: "6px 8px", color: "#3B82F6", fontFamily: "monospace" }}>{r.x}</td>
                    <td style={{ padding: "6px 8px", color: "#22C55E", fontFamily: "monospace" }}>{r.y}</td>
                    <td style={{ padding: "6px 8px", color: "#EF4444", fontFamily: "monospace" }}>{corrX.toFixed(3)}</td>
                    <td style={{ padding: "6px 8px", color: "#EF4444", fontFamily: "monospace" }}>{corrY.toFixed(3)}</td>
                    <td style={{ padding: "6px 8px", color: "#3B82F6", fontFamily: "monospace", fontWeight: 700 }}>{(parseFloat(r.x)+corrX).toFixed(3)}</td>
                    <td style={{ padding: "6px 8px", color: "#22C55E", fontFamily: "monospace", fontWeight: 700 }}>{(parseFloat(r.y)+corrY).toFixed(3)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
