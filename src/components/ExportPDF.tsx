"use client";
import { useState } from "react";

interface VolumeReport {
  projectName: string;
  alignmentName?: string;
  date: string;
  totalCut: number;
  totalFill: number;
  netVolume: number;
  sections?: {
    station: number;
    cutArea: number;
    fillArea: number;
    cutVolume: number;
    fillVolume: number;
  }[];
}

interface ExportPDFProps {
  report: VolumeReport;
  projectId: number;
}

export default function ExportPDF({ report, projectId }: ExportPDFProps) {
  const [loading, setLoading] = useState(false);

  async function generatePDF() {
    setLoading(true);
    const { default: jsPDF } = await import("jspdf");
    const { default: autoTable } = await import("jspdf-autotable");

    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const W = 210;
    const margin = 15;

    // ── HEADER ──────────────────────────────────────────────────────────────
    doc.setFillColor(13, 17, 23);
    doc.rect(0, 0, W, 35, "F");
    doc.setFillColor(249, 115, 22);
    doc.rect(0, 0, 5, 35, "F");

    doc.setTextColor(249, 115, 22);
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text("TerraMaps", 12, 14);

    doc.setTextColor(100, 116, 139);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text("Topographie & Cartographie", 12, 20);
    doc.text("terramaps.vercel.app", 12, 26);

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("RAPPORT DE VOLUMES DE TERRASSEMENT", W - margin, 14, { align: "right" });
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 116, 139);
    doc.text(`Date : ${report.date}`, W - margin, 20, { align: "right" });
    doc.text(`Réf : TM-VOL-${projectId}-${Date.now().toString().slice(-6)}`, W - margin, 26, { align: "right" });

    // ── PROJECT INFO ─────────────────────────────────────────────────────────
    let y = 45;
    doc.setFillColor(241, 245, 249);
    doc.rect(margin, y, W - margin * 2, 28, "F");
    doc.setDrawColor(226, 232, 240);
    doc.rect(margin, y, W - margin * 2, 28, "S");

    doc.setTextColor(13, 17, 23);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("Informations du projet", margin + 5, y + 7);

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 116, 139);
    doc.text("Projet :", margin + 5, y + 14);
    doc.text("Alignement :", margin + 5, y + 20);

    doc.setTextColor(13, 17, 23);
    doc.text(report.projectName, margin + 35, y + 14);
    doc.text(report.alignmentName || "—", margin + 35, y + 20);

    // ── SUMMARY STATS ────────────────────────────────────────────────────────
    y += 38;
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(13, 17, 23);
    doc.text("Résumé des volumes", margin, y);

    doc.setDrawColor(249, 115, 22);
    doc.setLineWidth(0.5);
    doc.line(margin, y + 2, W - margin, y + 2);

    y += 8;
    const statW = (W - margin * 2) / 3;
    const stats = [
      { label: "Volume Déblai (Cut)", value: `${report.totalCut.toLocaleString("fr-FR")} m³`, color: [239, 68, 68] as [number, number, number] },
      { label: "Volume Remblai (Fill)", value: `${report.totalFill.toLocaleString("fr-FR")} m³`, color: [34, 197, 94] as [number, number, number] },
      { label: "Volume Net", value: `${Math.abs(report.netVolume).toLocaleString("fr-FR")} m³`, color: [59, 130, 246] as [number, number, number] },
    ];

    stats.forEach((s, i) => {
      const bx = margin + i * statW;
      doc.setFillColor(241, 245, 249);
      doc.rect(bx, y, statW - 3, 22, "F");
      doc.setDrawColor(...s.color);
      doc.setLineWidth(0.8);
      doc.rect(bx, y, statW - 3, 22, "S");

      doc.setTextColor(...s.color);
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text(s.value, bx + (statW - 3) / 2, y + 11, { align: "center" });

      doc.setTextColor(100, 116, 139);
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.text(s.label, bx + (statW - 3) / 2, y + 18, { align: "center" });
    });

    // ── BALANCE NOTE ────────────────────────────────────────────────────────
    y += 30;
    const isExcess = report.netVolume > 0;
    doc.setFillColor(isExcess ? 254 : 240, isExcess ? 242 : 253, isExcess ? 242 : 244);
    doc.rect(margin, y, W - margin * 2, 12, "F");
    doc.setTextColor(isExcess ? 22 : 153, isExcess ? 163 : 27, isExcess ? 74 : 96);
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    const balanceText = isExcess
      ? `✓ Excédent de déblai : ${report.netVolume.toLocaleString("fr-FR")} m³ à évacuer`
      : `⚠ Déficit en remblai : ${Math.abs(report.netVolume).toLocaleString("fr-FR")} m³ à apporter`;
    doc.text(balanceText, W / 2, y + 7, { align: "center" });

    // ── SECTIONS TABLE ──────────────────────────────────────────────────────
    if (report.sections && report.sections.length > 0) {
      y += 20;
      doc.setTextColor(13, 17, 23);
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("Tableau des profils en travers", margin, y);
      doc.setDrawColor(249, 115, 22);
      doc.setLineWidth(0.5);
      doc.line(margin, y + 2, W - margin, y + 2);
      y += 6;

      autoTable(doc, {
        startY: y,
        margin: { left: margin, right: margin },
        head: [["Station (m)", "Aire Déblai (m²)", "Aire Remblai (m²)", "Vol. Déblai (m³)", "Vol. Remblai (m³)"]],
        body: report.sections.map(s => [
          `Pk ${(s.station / 1000).toFixed(3).replace(".", "+")}`,
          s.cutArea.toFixed(2),
          s.fillArea.toFixed(2),
          s.cutVolume.toFixed(0),
          s.fillVolume.toFixed(0),
        ]),
        headStyles: { fillColor: [13, 17, 23], textColor: [255, 255, 255], fontStyle: "bold", fontSize: 8 },
        bodyStyles: { fontSize: 8, textColor: [13, 17, 23] },
        alternateRowStyles: { fillColor: [241, 245, 249] },
        columnStyles: {
          0: { halign: "center" },
          1: { halign: "right", textColor: [239, 68, 68] },
          2: { halign: "right", textColor: [34, 197, 94] },
          3: { halign: "right", textColor: [239, 68, 68], fontStyle: "bold" },
          4: { halign: "right", textColor: [34, 197, 94], fontStyle: "bold" },
        },
      });
    }

    // ── FOOTER ───────────────────────────────────────────────────────────────
    const pageCount = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      const pageH = doc.internal.pageSize.height;
      doc.setFillColor(13, 17, 23);
      doc.rect(0, pageH - 12, W, 12, "F");
      doc.setTextColor(100, 116, 139);
      doc.setFontSize(7);
      doc.setFont("helvetica", "normal");
      doc.text("TerraMaps v2.0  ·  terramaps.vercel.app  ·  Rapport généré automatiquement", margin, pageH - 5);
      doc.text(`Page ${i} / ${pageCount}`, W - margin, pageH - 5, { align: "right" });
    }

    doc.save(`TerraMaps_Rapport_Volumes_${report.projectName.replace(/\s+/g, "_")}_${report.date}.pdf`);
    setLoading(false);
  }

  return (
    <button
      onClick={generatePDF}
      disabled={loading}
      style={{
        display: "flex", alignItems: "center", gap: 8,
        background: loading ? "#1E2D3D" : "#F97316",
        border: "none", color: "#fff", padding: "10px 18px",
        borderRadius: 8, cursor: loading ? "not-allowed" : "pointer",
        fontSize: 13, fontWeight: 600, opacity: loading ? 0.7 : 1,
      }}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/>
        <line x1="12" y1="18" x2="12" y2="12"/>
        <line x1="9" y1="15" x2="15" y2="15"/>
      </svg>
      {loading ? "Génération..." : "Exporter PDF"}
    </button>
  );
}
