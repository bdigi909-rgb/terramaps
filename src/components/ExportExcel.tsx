"use client";
import { useState } from "react";

interface Point {
  id: number;
  name?: string;
  code?: string;
  x: number;
  y: number;
  z: number;
  description?: string;
}

interface ExportExcelProps {
  points: Point[];
  projectName?: string;
}

export default function ExportExcel({ points, projectName }: ExportExcelProps) {
  const [loading, setLoading] = useState(false);

  async function handleExport() {
    setLoading(true);
    const XLSX = await import("xlsx");

    const data = [
      ["TerraMaps — Export Points Topographiques"],
      [`Projet: ${projectName || "—"}`],
      [`Date: ${new Date().toLocaleDateString("fr-FR")}`],
      [`Total: ${points.length} points`],
      [],
      ["#", "Nom", "Code", "X (Est)", "Y (Nord)", "Z (Altitude)", "Description"],
      ...points.map((p, i) => [
        i + 1,
        p.name || `P${i + 1}`,
        p.code || "—",
        p.x,
        p.y,
        p.z,
        p.description || "—",
      ]),
    ];

    const ws = XLSX.utils.aoa_to_sheet(data);

    // Style header
    ws["!cols"] = [
      { wch: 5 },
      { wch: 15 },
      { wch: 10 },
      { wch: 15 },
      { wch: 15 },
      { wch: 15 },
      { wch: 25 },
    ];

    // Merge title cells
    ws["!merges"] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 6 } },
      { s: { r: 1, c: 0 }, e: { r: 1, c: 6 } },
      { s: { r: 2, c: 0 }, e: { r: 2, c: 6 } },
      { s: { r: 3, c: 0 }, e: { r: 3, c: 6 } },
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Points Topo");

    // Add summary sheet
    const summary = [
      ["Résumé statistique"],
      [],
      ["Total points", points.length],
      ["Z minimum", Math.min(...points.map(p => p.z)).toFixed(3) + " m"],
      ["Z maximum", Math.max(...points.map(p => p.z)).toFixed(3) + " m"],
      ["Z moyen", (points.reduce((s, p) => s + p.z, 0) / points.length).toFixed(3) + " m"],
      [],
      ["Codes utilisés"],
      ...Array.from(new Set(points.map(p => p.code || "—"))).map(code => [
        code,
        points.filter(p => (p.code || "—") === code).length + " points"
      ]),
    ];

    const ws2 = XLSX.utils.aoa_to_sheet(summary);
    ws2["!cols"] = [{ wch: 20 }, { wch: 15 }];
    XLSX.utils.book_append_sheet(wb, ws2, "Résumé");

    XLSX.writeFile(wb, `TerraMaps_Points_${projectName?.replace(/\s+/g, "_") || "export"}_${new Date().toISOString().slice(0, 10)}.xlsx`);
    setLoading(false);
  }

  return (
    <button onClick={handleExport} disabled={loading || points.length === 0}
      style={{
        display: "flex", alignItems: "center", gap: 8,
        background: loading || points.length === 0 ? "#1E2D3D" : "#22C55E",
        border: "none", color: "#fff", padding: "8px 16px",
        borderRadius: 8, cursor: loading || points.length === 0 ? "not-allowed" : "pointer",
        fontSize: 12, fontWeight: 600, opacity: loading || points.length === 0 ? 0.6 : 1,
      }}>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/>
        <line x1="12" y1="18" x2="12" y2="12"/>
        <line x1="9" y1="15" x2="15" y2="15"/>
      </svg>
      {loading ? "Export..." : "Export Excel"}
    </button>
  );
}
