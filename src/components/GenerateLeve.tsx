"use client";
import { useState } from "react";

interface Point {
  name: string;
  code: string;
  x: number;
  y: number;
  z: number;
}

interface LeveData {
  province: string;
  cercle: string;
  commune: string;
  proprietaire: string;
  cin: string;
  adresse: string;
  superficie: string;
  reference: string;
  date: string;
  technicien: string;
  echelle: string;
  epsg: string;
  points: Point[];
  projectName: string;
}

export default function GenerateLeve({ data }: { data: LeveData }) {
  const [loading, setLoading] = useState(false);

  async function generatePDF() {
    setLoading(true);
    const { default: jsPDF } = await import("jspdf");
    const { default: autoTable } = await import("jspdf-autotable");

    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const W = 210;
    const H = 297;
    const m = 10; // margin

    // ── BORDER ──────────────────────────────────────────────────────
    doc.setDrawColor(0);
    doc.setLineWidth(0.8);
    doc.rect(m, m, W - m * 2, H - m * 2);
    doc.setLineWidth(0.3);
    doc.rect(m + 2, m + 2, W - m * 2 - 4, H - m * 2 - 4);

    // ── HEADER ──────────────────────────────────────────────────────
    // Logo Maroc (étoile simplifiée)
    doc.setFillColor(200, 16, 46);
    doc.circle(25, 25, 8, "F");
    doc.setFillColor(255, 255, 255);
    doc.circle(25, 25, 5, "F");
    doc.setFillColor(200, 16, 46);
    doc.circle(25, 25, 2, "F");

    // Titre officiel
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 0, 0);
    doc.text("ROYAUME DU MAROC", W / 2, 18, { align: "center" });
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text(`Province de ${data.province}`, W / 2, 23, { align: "center" });
    doc.text(`Cercle de ${data.cercle}`, W / 2, 28, { align: "center" });
    doc.text(`Commune de ${data.commune}`, W / 2, 33, { align: "center" });

    // Ligne séparatrice
    doc.setDrawColor(0);
    doc.setLineWidth(0.5);
    doc.line(m + 4, 38, W - m - 4, 38);

    // Titre principal
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("LEVÉ TOPOGRAPHIQUE", W / 2, 46, { align: "center" });
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(data.projectName, W / 2, 52, { align: "center" });

    // Ligne séparatrice
    doc.line(m + 4, 55, W - m - 4, 55);

    // ── TABLEAU INFO PROPRIÉTAIRE ────────────────────────────────────
    autoTable(doc, {
      startY: 58,
      margin: { left: m + 4, right: m + 4 },
      head: [["INFORMATIONS DU TERRAIN", ""]],
      body: [
        ["Propriétaire / Maître d'ouvrage :", data.proprietaire],
        ["CIN / Référence :", data.cin],
        ["Adresse :", data.adresse],
        ["Superficie (m²) :", data.superficie + " m²"],
        ["Référence cadastrale :", data.reference],
        ["Date du levé :", data.date],
        ["Technicien topographe :", data.technicien],
        ["Système de coordonnées :", data.epsg],
        ["Échelle du plan :", "1 : " + data.echelle],
      ],
      headStyles: { fillColor: [13, 71, 161], textColor: 255, fontStyle: "bold", fontSize: 9 },
      bodyStyles: { fontSize: 8 },
      columnStyles: { 0: { fontStyle: "bold", cellWidth: 65 }, 1: { cellWidth: 100 } },
      alternateRowStyles: { fillColor: [240, 244, 255] },
    });

    // ── TABLEAU DES COORDONNÉES ──────────────────────────────────────
    const tableY = (doc as any).lastAutoTable.finalY + 8;
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("TABLEAU DES COORDONNÉES", W / 2, tableY, { align: "center" });

    autoTable(doc, {
      startY: tableY + 4,
      margin: { left: m + 4, right: m + 4 },
      head: [["N°", "Nom", "Code", "X (Est) m", "Y (Nord) m", "Z (Alt) m"]],
      body: data.points.map((p, i) => [
        i + 1,
        p.name,
        p.code,
        p.x.toFixed(3),
        p.y.toFixed(3),
        p.z.toFixed(3),
      ]),
      headStyles: { fillColor: [13, 71, 161], textColor: 255, fontStyle: "bold", fontSize: 8 },
      bodyStyles: { fontSize: 7.5 },
      alternateRowStyles: { fillColor: [240, 244, 255] },
      columnStyles: {
        0: { halign: "center", cellWidth: 10 },
        1: { cellWidth: 25 },
        2: { halign: "center", cellWidth: 20 },
        3: { halign: "right", cellWidth: 35 },
        4: { halign: "right", cellWidth: 35 },
        5: { halign: "right", cellWidth: 30 },
      },
    });

    // ── CALCUL SUPERFICIE ──────────────────────────────────────────
    const limPoints = data.points.filter(p => p.code === "LIM");
    let superficieCalc = 0;
    if (limPoints.length >= 3) {
      for (let i = 0; i < limPoints.length; i++) {
        const j = (i + 1) % limPoints.length;
        superficieCalc += limPoints[i].x * limPoints[j].y;
        superficieCalc -= limPoints[j].x * limPoints[i].y;
      }
      superficieCalc = Math.abs(superficieCalc) / 2;
    }

    const supY = (doc as any).lastAutoTable.finalY + 6;
    if (superficieCalc > 0) {
      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      doc.setFillColor(232, 245, 233);
      doc.rect(m + 4, supY, W - m * 2 - 8, 10, "F");
      doc.setDrawColor(76, 175, 80);
      doc.rect(m + 4, supY, W - m * 2 - 8, 10, "S");
      doc.setTextColor(27, 94, 32);
      doc.text(`Superficie calculée (Méthode de Gauss) : ${superficieCalc.toFixed(2)} m²  =  ${(superficieCalc / 10000).toFixed(4)} Ha`, W / 2, supY + 6.5, { align: "center" });
      doc.setTextColor(0, 0, 0);
    }

    // ── PLAN SCHÉMATIQUE ──────────────────────────────────────────
    const planY = (doc as any).lastAutoTable.finalY + (superficieCalc > 0 ? 20 : 10);
    const planH = H - m - 4 - planY - 25;

    if (planH > 40 && data.points.length > 0) {
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text("PLAN SCHÉMATIQUE", W / 2, planY, { align: "center" });

      const planX = m + 4;
      const planW = W - m * 2 - 8;
      doc.setDrawColor(0);
      doc.setLineWidth(0.3);
      doc.rect(planX, planY + 3, planW, planH);

      // Normaliser les coordonnées pour le plan
      const xs = data.points.map(p => p.x);
      const ys = data.points.map(p => p.y);
      const minX = Math.min(...xs), maxX = Math.max(...xs);
      const minY = Math.min(...ys), maxY = Math.max(...ys);
      const rangeX = maxX - minX || 1;
      const rangeY = maxY - minY || 1;
      const padding = 10;

      function toPageX(x: number) { return planX + padding + ((x - minX) / rangeX) * (planW - padding * 2); }
      function toPageY(y: number) { return planY + 3 + planH - padding - ((y - minY) / rangeY) * (planH - padding * 2); }

      const codeColors: Record<string, number[]> = {
        LIM: [220, 38, 38], VOI: [217, 119, 6], BAT: [37, 99, 235],
        AXE: [249, 115, 22], TN: [16, 185, 129], IMP: [245, 158, 11],
        MUR: [139, 92, 246], RTE: [107, 114, 128],
      };

      // Dessiner les lignes LIM
      const limPts = data.points.filter(p => p.code === "LIM");
      if (limPts.length >= 2) {
        doc.setDrawColor(220, 38, 38);
        doc.setLineWidth(0.5);
        for (let i = 0; i < limPts.length; i++) {
          const j = (i + 1) % limPts.length;
          doc.line(toPageX(limPts[i].x), toPageY(limPts[i].y), toPageX(limPts[j].x), toPageY(limPts[j].y));
        }
      }

      // Dessiner les lignes AXE
      const axePts = data.points.filter(p => p.code === "AXE");
      if (axePts.length >= 2) {
        doc.setDrawColor(249, 115, 22);
        doc.setLineWidth(0.4);
        for (let i = 0; i < axePts.length - 1; i++) {
          doc.line(toPageX(axePts[i].x), toPageY(axePts[i].y), toPageX(axePts[i+1].x), toPageY(axePts[i+1].y));
        }
      }

      // Dessiner les points
      data.points.forEach(p => {
        const px = toPageX(p.x);
        const py = toPageY(p.y);
        const color = codeColors[p.code] || [100, 116, 139];
        doc.setFillColor(color[0], color[1], color[2]);
        doc.circle(px, py, 1, "F");
        doc.setFontSize(5);
        doc.setTextColor(0, 0, 0);
        doc.text(p.name, px + 1.5, py - 1);
      });

      // Rose des vents
      const roseX = planX + planW - 15;
      const roseY = planY + 10;
      doc.setFontSize(7);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(0, 0, 0);
      doc.text("N", roseX, roseY - 5, { align: "center" });
      doc.setDrawColor(0);
      doc.setLineWidth(0.3);
      doc.line(roseX, roseY - 4, roseX, roseY + 4);
      doc.line(roseX - 4, roseY, roseX + 4, roseY);
      doc.setFillColor(0, 0, 0);
      doc.triangle(roseX - 1, roseY, roseX + 1, roseY, roseX, roseY - 4, "F");
    }

    // ── FOOTER ────────────────────────────────────────────────────
    const footY = H - m - 20;
    doc.setLineWidth(0.3);
    doc.line(m + 4, footY, W - m - 4, footY);

    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text(`Fait à ${data.commune}, le ${data.date}`, m + 10, footY + 6);
    doc.text("Cachet et Signature", W - m - 40, footY + 6);
    doc.rect(W - m - 45, footY + 3, 40, 15);

    doc.setFontSize(7);
    doc.setTextColor(100, 100, 100);
    doc.text("Document généré par TerraMaps v2.0 — terramaps.vercel.app", W / 2, H - m - 4, { align: "center" });

    doc.save(`Leve_Topographique_${data.projectName.replace(/\s+/g, "_")}_${data.date}.pdf`);
    setLoading(false);
  }

  return (
    <button onClick={generatePDF} disabled={loading}
      style={{ display: "flex", alignItems: "center", gap: 8, background: loading ? "#1E2D3D" : "#0D47A1", border: "none", color: "#fff", padding: "10px 20px", borderRadius: 8, cursor: loading ? "not-allowed" : "pointer", fontSize: 13, fontWeight: 600 }}>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/>
      </svg>
      {loading ? "Génération..." : "📄 Générer Levé Topographique"}
    </button>
  );
}
