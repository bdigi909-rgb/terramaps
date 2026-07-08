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
    // ── PAGE 2 — DEUX VUES ──────────────────────────────────────
    doc.addPage();
    
    // Bordure page 2
    doc.setDrawColor(0); doc.setLineWidth(0.8);
    doc.rect(m, m, W-m*2, H-m*2);
    doc.setLineWidth(0.3);
    doc.rect(m+2, m+2, W-m*2-4, H-m*2-4);

    // Titre page 2
    doc.setFontSize(12); doc.setFont("helvetica","bold"); doc.setTextColor(0,0,0);
    doc.text("ROYAUME DU MAROC", W/2, 18, { align: "center" });
    doc.setFontSize(9); doc.setFont("helvetica","normal");
    doc.text(`Province de ${data.province} — Cercle de ${data.cercle} — Commune de ${data.commune}`, W/2, 24, { align: "center" });
    doc.setLineWidth(0.3); doc.line(m+4, 27, W-m-4, 27);
    doc.setFontSize(11); doc.setFont("helvetica","bold");
    doc.text("PLAN TOPOGRAPHIQUE", W/2, 33, { align: "center" });
    doc.setFontSize(8); doc.setFont("helvetica","normal");
    doc.text(data.projectName, W/2, 38, { align: "center" });
    doc.line(m+4, 41, W-m-4, 41);

    const allPts = data.points;
    const xs = allPts.map((p: any) => p.x);
    const ys = allPts.map((p: any) => p.y);
    const minX = Math.min(...xs), maxX = Math.max(...xs);
    const minY = Math.min(...ys), maxY = Math.max(...ys);
    const rangeX = maxX - minX || 100;
    const rangeY = maxY - minY || 100;

    // ── VUE 1 — CARTE DE SITUATION REELLE ──────────────────────
    const v1X = m+4, v1Y = 44, v1W = W-m*2-8, v1H = 100;
    doc.setDrawColor(0); doc.setLineWidth(0.5);
    doc.rect(v1X, v1Y, v1W, v1H);
    doc.setFontSize(8); doc.setFont("helvetica","bold"); doc.setTextColor(0,0,0);
    doc.text("VUE D'ENSEMBLE — CARTE DE SITUATION", v1X + v1W/2, v1Y + 6, { align: "center" });

    // Calcul centre terrain en WGS84
    const allX = data.points.map((p: any) => p.x);
    const allY = data.points.map((p: any) => p.y);
    const centerX = allX.reduce((a: number, b: number) => a+b, 0) / allX.length;
    const centerY = allY.reduce((a: number, b: number) => a+b, 0) / allY.length;

    // Conversion Lambert -> WGS84
    const a2 = 6378249.2, b2 = 6356515.0;
    const e2 = 1-(b2*b2)/(a2*a2), e = Math.sqrt(e2);
    const lat1r = (31+44/60)*Math.PI/180, lat2r = (34+40/60)*Math.PI/180;
    const lat0r = (33+18/60)*Math.PI/180, lng0r = -5.4*Math.PI/180;
    const x0 = 500000, y0 = 300000;
    const mFn = (l: number) => Math.cos(l)/Math.sqrt(1-e2*Math.sin(l)**2);
    const tFn = (l: number) => Math.tan(Math.PI/4-l/2)/Math.pow((1-e*Math.sin(l))/(1+e*Math.sin(l)),e/2);
    const m1=mFn(lat1r),m2=mFn(lat2r),t1=tFn(lat1r),t2=tFn(lat2r),t0=tFn(lat0r);
    const n=(Math.log(m1)-Math.log(m2))/(Math.log(t1)-Math.log(t2));
    const F=m1/(n*Math.pow(t1,n)), r0=a2*F*Math.pow(t0,n);
    const dx2=centerX-x0, dy2=centerY-y0;
    const r2=Math.sqrt(dx2*dx2+(r0-dy2)*(r0-dy2));
    const theta2=Math.atan2(dx2,r0-dy2);
    const tP2=Math.pow(r2/(a2*F),1/n);
    const lngCenter=(theta2/n+lng0r)*180/Math.PI;
    let latCenter=Math.PI/2-2*Math.atan(tP2);
    for(let i=0;i<10;i++){latCenter=Math.PI/2-2*Math.atan(tP2*Math.pow((1-e*Math.sin(latCenter))/(1+e*Math.sin(latCenter)),e/2));}
    const latCenterDeg = latCenter*180/Math.PI;

    // Charger image OSM
    try {
      const zoom = 15;
      const tileSize = 256;
      const lat2tile = (lat: number, z: number) => Math.floor((1-Math.log(Math.tan(lat*Math.PI/180)+1/Math.cos(lat*Math.PI/180))/Math.PI)/2*Math.pow(2,z));
      const lng2tile = (lng: number, z: number) => Math.floor((lng+180)/360*Math.pow(2,z));
      const tx = lng2tile(lngCenter, zoom);
      const ty = lat2tile(latCenterDeg, zoom);
      
      const imgUrl = `https://maps.geoapify.com/v1/staticmap?style=osm-bright&width=600&height=300&center=lonlat:${lngCenter},${latCenterDeg}&zoom=15&apiKey=a2e85db1e7724a8f9db87b64f7c3f7b0`;
      
      const response = await fetch(imgUrl);
      const blob = await response.blob();
      const reader = new FileReader();
      const imgData = await new Promise<string>((resolve) => {
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(blob);
      });
      
      doc.addImage(imgData, "PNG", v1X+2, v1Y+9, v1W-4, v1H-12);
    } catch {
      // Fallback carte schematique
      doc.setFillColor(235, 245, 255);
      doc.rect(v1X+2, v1Y+9, v1W-4, v1H-12, "F");
      doc.setFontSize(8); doc.setTextColor(100,100,100);
      doc.text(`Centre: ${latCenterDeg.toFixed(5)}°N, ${lngCenter.toFixed(5)}°E`, v1X+v1W/2, v1Y+v1H/2, { align: "center" });
      doc.text(data.commune, v1X+v1W/2, v1Y+v1H/2+8, { align: "center" });
    }

    // Rose des vents vue 1
    const r1X = v1X+v1W-15, r1Y = v1Y+15;
    doc.setDrawColor(0); doc.setFillColor(255,255,255); doc.setLineWidth(0.4);
    doc.circle(r1X, r1Y, 6, "F");
    doc.setFillColor(0,0,0);
    doc.line(r1X, r1Y+5, r1X, r1Y-5);
    doc.triangle(r1X-1.5, r1Y-2, r1X+1.5, r1Y-2, r1X, r1Y-6, "F");
    doc.setFontSize(7); doc.setFont("helvetica","bold"); doc.setTextColor(0,0,0);
    doc.text("N", r1X, r1Y-8, { align: "center" });

    doc.setFontSize(5); doc.setFont("helvetica","normal"); doc.setTextColor(100,100,100);
    doc.text(`Centre: ${latCenterDeg.toFixed(5)}N, ${lngCenter.toFixed(5)}E`, v1X+5, v1Y+v1H-3);
    // ── VUE 2 — PLAN DÉTAILLÉ (bas) ────────────────────────────
    const v2X = m+4, v2Y = v1Y+v1H+8, v2W = W-m*2-8, v2H = H-m-4-v2Y-25;
    doc.setDrawColor(0); doc.setLineWidth(0.5);
    doc.rect(v2X, v2Y, v2W, v2H);
    doc.setFontSize(8); doc.setFont("helvetica","bold"); doc.setTextColor(0,0,0);
    doc.text("PLAN DÉTAILLÉ DE LA PARCELLE", v2X+v2W/2, v2Y+6, { align: "center" });

    const pad = 18;
    const toX = (x: number) => v2X + pad + ((x-minX)/rangeX) * (v2W-pad*2);
    const toY = (y: number) => v2Y + v2H - pad - ((y-minY)/rangeY) * (v2H-pad*2-8);

    // Fond blanc
    doc.setFillColor(250, 250, 250);
    doc.rect(v2X+2, v2Y+9, v2W-4, v2H-12, "F");

    // Grille plan détaillé
    doc.setDrawColor(220,220,220); doc.setLineWidth(0.1);
    for (let i = 0; i <= 6; i++) {
      doc.line(v2X+pad+(i/6)*(v2W-pad*2), v2Y+9, v2X+pad+(i/6)*(v2W-pad*2), v2Y+v2H-3);
      doc.line(v2X+2, v2Y+9+(i/6)*(v2H-12), v2X+v2W-2, v2Y+9+(i/6)*(v2H-12));
    }

    // Coordonnées sur les bords
    doc.setFontSize(4.5); doc.setTextColor(120,120,120);
    doc.text(`X=${minX.toFixed(0)}`, v2X+pad, v2Y+v2H-2);
    doc.text(`X=${maxX.toFixed(0)}`, v2X+v2W-pad-8, v2Y+v2H-2);
    doc.text(`Y=${maxY.toFixed(0)}`, v2X+1, v2Y+pad+5);
    doc.text(`Y=${minY.toFixed(0)}`, v2X+1, v2Y+v2H-pad);

    // LIM — limites parcelle trait épais rouge
    const limPts = data.points.filter((p: any) => p.code === "LIM");
    if (limPts.length >= 2) {
      doc.setDrawColor(200,0,0); doc.setLineWidth(1.0);
      for (let i = 0; i < limPts.length; i++) {
        const j = (i+1) % limPts.length;
        doc.line(toX(limPts[i].x), toY(limPts[i].y), toX(limPts[j].x), toY(limPts[j].y));
      }
      // Hachures intérieures légères
      doc.setDrawColor(255,180,180); doc.setLineWidth(0.1);
    }

    // VOI — voisins pointillés orange
    const voiPts = data.points.filter((p: any) => p.code === "VOI");
    if (voiPts.length >= 2) {
      doc.setDrawColor(217,119,6); doc.setLineWidth(0.4);
      for (let i = 0; i < voiPts.length-1; i++) {
        doc.line(toX(voiPts[i].x), toY(voiPts[i].y), toX(voiPts[i+1].x), toY(voiPts[i+1].y));
      }
    }

    // AXE — axe route orange
    const axePts = data.points.filter((p: any) => p.code === "AXE");
    if (axePts.length >= 2) {
      doc.setDrawColor(249,115,22); doc.setLineWidth(0.6);
      for (let i = 0; i < axePts.length-1; i++) {
        doc.line(toX(axePts[i].x), toY(axePts[i].y), toX(axePts[i+1].x), toY(axePts[i+1].y));
      }
    }

    // BAT — bâtiments rectangles bleus
    const batPts = data.points.filter((p: any) => p.code === "BAT");
    batPts.forEach((p: any) => {
      doc.setFillColor(180,210,255); doc.setDrawColor(37,99,235); doc.setLineWidth(0.3);
      doc.rect(toX(p.x)-3, toY(p.y)-2, 6, 4, "FD");
    });

    // Points avec croix et noms
    const colors: Record<string, number[]> = {
      LIM:[200,0,0], VOI:[217,119,6], BAT:[37,99,235],
      AXE:[249,115,22], TN:[16,185,129], IMP:[80,80,80],
      MUR:[139,92,246], RTE:[107,114,128], PT:[80,80,80],
    };
    allPts.forEach((p: any) => {
      const px = toX(p.x), py = toY(p.y);
      const c = colors[p.code] || [0,0,0];
      doc.setDrawColor(c[0],c[1],c[2]); doc.setLineWidth(0.5);
      doc.line(px-2, py, px+2, py);
      doc.line(px, py-2, px, py+2);
      doc.setFontSize(4.5); doc.setTextColor(c[0],c[1],c[2]);
      doc.text(p.name, px+2.5, py-1);
      // Coordonnées sous le nom pour points LIM
      if (p.code === "LIM") {
        doc.setFontSize(3.5); doc.setTextColor(100,100,100);
        doc.text(`(${p.x.toFixed(0)},${p.y.toFixed(0)})`, px+2.5, py+2.5);
      }
    });

    // Rose des vents vue 2
    const r2X = v2X+v2W-18, r2Y = v2Y+20;
    doc.setDrawColor(0); doc.setFillColor(0,0,0); doc.setLineWidth(0.4);
    doc.line(r2X, r2Y+8, r2X, r2Y-8);
    doc.line(r2X-5, r2Y, r2X+5, r2Y);
    doc.triangle(r2X-2, r2Y-3, r2X+2, r2Y-3, r2X, r2Y-9, "F");
    doc.setFontSize(8); doc.setFont("helvetica","bold"); doc.setTextColor(0,0,0);
    doc.text("N", r2X, r2Y-12, { align: "center" });

    // Échelle graphique
    const scX = v2X+5, scY = v2Y+v2H-8;
    doc.setDrawColor(0); doc.setLineWidth(0.5);
    doc.line(scX, scY, scX+25, scY);
    doc.line(scX, scY-2, scX, scY+2);
    doc.line(scX+25, scY-2, scX+25, scY+2);
    doc.setFontSize(5); doc.setFont("helvetica","normal"); doc.setTextColor(0,0,0);
    doc.text("0", scX, scY-3, { align:"center" });
    doc.text(`${data.echelle}m`, scX+25, scY-3, { align:"center" });
    doc.text(`Éch. 1:${data.echelle}`, scX+12, scY+5, { align:"center" });

    // Légende vue 2
    const lX = v2X+5, lY = v2Y+12;
    doc.setFontSize(5); doc.setFont("helvetica","bold"); doc.setTextColor(0,0,0);
    doc.text("LÉGENDE:", lX, lY);
    [{c:[200,0,0],l:"Limite parcelle"},{c:[217,119,6],l:"Voisins"},{c:[37,99,235],l:"Bâtiments"},{c:[249,115,22],l:"Axe route"}]
    .forEach((item, i) => {
      doc.setDrawColor(item.c[0],item.c[1],item.c[2]); doc.setLineWidth(0.8);
      doc.line(lX, lY+5+i*5, lX+5, lY+5+i*5);
      doc.setFont("helvetica","normal"); doc.setTextColor(0,0,0);
      doc.text(item.l, lX+7, lY+5+i*5+0.5);
    });

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
