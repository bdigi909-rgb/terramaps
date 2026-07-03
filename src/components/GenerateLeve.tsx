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
    const planH = H - m - 4 - planY - 30;

    if (planH > 50 && data.points.length > 0) {
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(0, 0, 0);
      doc.text("CROQUIS DE SITUATION", W / 2, planY, { align: "center" });

      const planX = m + 4;
      const planW = W - m * 2 - 8;
      doc.setDrawColor(0);
      doc.setLineWidth(0.5);
      doc.rect(planX, planY + 3, planW, planH);

      const allPts = data.points;
      const xs = allPts.map((p: any) => p.x);
      const ys = allPts.map((p: any) => p.y);
      const minX = Math.min(...xs), maxX = Math.max(...xs);
      const minY = Math.min(...ys), maxY = Math.max(...ys);
      const rangeX = maxX - minX || 100;
      const rangeY = maxY - minY || 100;
      const pad = 20;

      const toX = (x: number) => planX + pad + ((x - minX) / rangeX) * (planW - pad * 2);
      const toY = (y: number) => planY + 3 + planH - pad - ((y - minY) / rangeY) * (planH - pad * 2);

      // Grid
      doc.setDrawColor(220, 220, 220);
      doc.setLineWidth(0.1);
      for (let i = 0; i <= 4; i++) {
        doc.line(planX + pad + (i/4)*(planW-pad*2), planY+3, planX + pad + (i/4)*(planW-pad*2), planY+3+planH);
        doc.line(planX, planY+3+pad+(i/4)*(planH-pad*2), planX+planW, planY+3+pad+(i/4)*(planH-pad*2));
      }

      // Coordonnées axes
      doc.setFontSize(4.5);
      doc.setTextColor(120, 120, 120);
      doc.text(`X=${minX.toFixed(0)}`, planX + pad, planY + 3 + planH - 2);
      doc.text(`X=${maxX.toFixed(0)}`, planX + planW - pad - 8, planY + 3 + planH - 2);
      doc.text(`Y=${maxY.toFixed(0)}`, planX + 1, planY + 3 + pad + 3);
      doc.text(`Y=${minY.toFixed(0)}`, planX + 1, planY + 3 + planH - pad);

      // LIM — limites parcelle
      const limPts = data.points.filter((p: any) => p.code === "LIM");
      if (limPts.length >= 2) {
        doc.setDrawColor(200, 0, 0);
        doc.setLineWidth(0.8);
        for (let i = 0; i < limPts.length; i++) {
          const j = (i + 1) % limPts.length;
          doc.line(toX(limPts[i].x), toY(limPts[i].y), toX(limPts[j].x), toY(limPts[j].y));
        }
      }

      // AXE — axe route
      const axePts = data.points.filter((p: any) => p.code === "AXE");
      if (axePts.length >= 2) {
        doc.setDrawColor(249, 115, 22);
        doc.setLineWidth(0.5);
        for (let i = 0; i < axePts.length - 1; i++) {
          doc.line(toX(axePts[i].x), toY(axePts[i].y), toX(axePts[i+1].x), toY(axePts[i+1].y));
        }
      }

      // VOI — voisins pointillés
      const voiPts = data.points.filter((p: any) => p.code === "VOI");
      if (voiPts.length >= 2) {
        doc.setDrawColor(217, 119, 6);
        doc.setLineWidth(0.3);
        for (let i = 0; i < voiPts.length - 1; i++) {
          doc.line(toX(voiPts[i].x), toY(voiPts[i].y), toX(voiPts[i+1].x), toY(voiPts[i+1].y));
        }
      }

      // BAT — bâtiments rectangles
      const batPts = data.points.filter((p: any) => p.code === "BAT");
      batPts.forEach((p: any) => {
        doc.setFillColor(200, 220, 255);
        doc.setDrawColor(37, 99, 235);
        doc.setLineWidth(0.3);
        doc.rect(toX(p.x) - 3, toY(p.y) - 2, 6, 4, "FD");
      });

      // Points avec croix et numéros
      const colors: Record<string, number[]> = {
        LIM: [200,0,0], VOI: [217,119,6], BAT: [37,99,235],
        AXE: [249,115,22], TN: [16,185,129], IMP: [100,100,100],
        MUR: [139,92,246], RTE: [107,114,128], PT: [80,80,80],
      };
      allPts.forEach((p: any) => {
        const px = toX(p.x);
        const py = toY(p.y);
        const c = colors[p.code] || [0,0,0];
        doc.setDrawColor(c[0], c[1], c[2]);
        doc.setLineWidth(0.4);
        doc.line(px-1.5, py, px+1.5, py);
        doc.line(px, py-1.5, px, py+1.5);
        doc.setFontSize(4.5);
        doc.setTextColor(c[0], c[1], c[2]);
        doc.text(p.name, px + 2, py - 1);
      });

      // Rose des vents
      const rX = planX + planW - 20;
      const rY = planY + 18;
      doc.setDrawColor(0); doc.setFillColor(0,0,0);
      doc.setLineWidth(0.4);
      doc.line(rX, rY+8, rX, rY-8);
      doc.line(rX-5, rY, rX+5, rY);
      doc.triangle(rX-2, rY-3, rX+2, rY-3, rX, rY-9, "F");
      doc.setFontSize(8); doc.setFont("helvetica","bold"); doc.setTextColor(0,0,0);
      doc.text("N", rX, rY-12, { align: "center" });

      // Échelle graphique
      const scX = planX + 5;
      const scY = planY + 3 + planH - 8;
      doc.setDrawColor(0); doc.setLineWidth(0.4);
      doc.line(scX, scY, scX+20, scY);
      doc.line(scX, scY-2, scX, scY+2);
      doc.line(scX+20, scY-2, scX+20, scY+2);
      doc.setFontSize(5); doc.setFont("helvetica","normal"); doc.setTextColor(0,0,0);
      doc.text("0", scX, scY-3, { align: "center" });
      doc.text(`${data.echelle}m`, scX+20, scY-3, { align: "center" });
      doc.text(`Échelle 1:${data.echelle}`, scX+10, scY+5, { align: "center" });

      // Légende
      const lX = planX + 5;
      const lY = planY + 10;
      doc.setFontSize(5); doc.setFont("helvetica","bold"); doc.setTextColor(0,0,0);
      doc.text("LÉGENDE :", lX, lY);
      [
        { c: [200,0,0], l: "Limite parcelle (LIM)" },
        { c: [217,119,6], l: "Voisins (VOI)" },
        { c: [37,99,235], l: "Bâtiments (BAT)" },
        { c: [249,115,22], l: "Axe route (AXE)" },
      ].forEach((item, i) => {
        doc.setDrawColor(item.c[0], item.c[1], item.c[2]);
        doc.setLineWidth(0.8);
        doc.line(lX, lY+5+i*5, lX+5, lY+5+i*5);
        doc.setFont("helvetica","normal"); doc.setTextColor(0,0,0);
        doc.text(item.l, lX+7, lY+5+i*5+0.5);
      });
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
