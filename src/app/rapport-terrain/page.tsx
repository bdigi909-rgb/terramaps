"use client";
import SignaturePad from "@/components/SignaturePad";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function RapportTerrainPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [selectedProject, setSelectedProject] = useState("");
  const [points, setPoints] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [signature, setSignature] = useState("");
  const [bureauNom, setBureauNom] = useState("");
  const [bureauOrdre, setBureauOrdre] = useState("");
  const [form, setForm] = useState({
    province: "Séttat",
    commune: "Cherrat",
    proprietaire: "",
    cin: "",
    technicien: "",
    date: new Date().toLocaleDateString("fr-FR"),
    observations: "",
  });

  useEffect(() => {
    fetch("/api/projects").then(r => r.json()).then(data => {
      if (Array.isArray(data)) setProjects(data);
    });
  }, []);

  useEffect(() => {
    if (!selectedProject) return;
    fetch(`/api/projects/${selectedProject}/survey-points`).then(r => r.json()).then(data => {
      if (Array.isArray(data)) {
        setPoints(data.filter((p: any, i: number, self: any[]) => 
          i === self.findIndex((q: any) => q.name === p.name && q.code === p.code)
        ));
      }
    });
  }, [selectedProject]);

  async function generatePDF() {
    setLoading(true);
    const { default: jsPDF } = await import("jspdf");
    const { default: autoTable } = await import("jspdf-autotable");

    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const W = 210, H = 297, m = 10;

    // ── PAGE 1 — RAPPORT COMPLET ────────────────────────────────
    // Bordure
    doc.setDrawColor(0); doc.setLineWidth(0.8);
    doc.rect(m, m, W-m*2, H-m*2);
    doc.setLineWidth(0.3);
    doc.rect(m+2, m+2, W-m*2-4, H-m*2-4);

    // En-tête
    doc.setFillColor(13, 71, 161);
    doc.rect(m+4, m+4, W-m*2-8, 25, "F");
    doc.setFontSize(14); doc.setFont("helvetica", "bold"); doc.setTextColor(255,255,255);
    doc.text("ROYAUME DU MAROC", W/2, m+12, { align: "center" });
    doc.setFontSize(9); doc.setFont("helvetica", "normal");
    doc.text(`Province de ${form.province} — Commune de ${form.commune}`, W/2, m+18, { align: "center" });
    doc.setFontSize(12); doc.setFont("helvetica", "bold");
    doc.text("RAPPORT DE LEVÉ TOPOGRAPHIQUE", W/2, m+25, { align: "center" });

    // Info projet
    let y = m + 35;
    doc.setTextColor(0,0,0);
    const project = projects.find(p => p.id === parseInt(selectedProject));
    
    autoTable(doc, {
      startY: y,
      margin: { left: m+4, right: m+4 },
      head: [["INFORMATIONS DU PROJET", ""]],
      body: [
        ["Projet :", project?.name || "—"],
        ["Propriétaire :", form.proprietaire || "—"],
        ["CIN / Référence :", form.cin || "—"],
        ["Technicien :", form.technicien || "—"],
        ["Date du levé :", form.date],
        ["Nombre de points :", points.length.toString()],
        ["Système de coordonnées :", "EPSG:26191 — Lambert Maroc"],
      ],
      headStyles: { fillColor: [13, 71, 161], textColor: 255, fontStyle: "bold", fontSize: 9 },
      bodyStyles: { fontSize: 8 },
      columnStyles: { 0: { fontStyle: "bold", cellWidth: 60 }, 1: { cellWidth: 110 } },
      alternateRowStyles: { fillColor: [240, 244, 255] },
    });

    // Statistiques altimétrique
    y = (doc as any).lastAutoTable.finalY + 6;
    const zVals = points.map(p => p.z).filter(z => z > 0);
    const zMin = zVals.length > 0 ? Math.min(...zVals) : 0;
    const zMax = zVals.length > 0 ? Math.max(...zVals) : 0;
    const zMoy = zVals.length > 0 ? zVals.reduce((a,b) => a+b, 0) / zVals.length : 0;
    const denivele = zMax - zMin;

    autoTable(doc, {
      startY: y,
      margin: { left: m+4, right: m+4 },
      head: [["STATISTIQUES ALTIMÉTRIQUES", "Valeur"]],
      body: [
        ["Altitude minimale (Z min)", zMin.toFixed(3) + " m"],
        ["Altitude maximale (Z max)", zMax.toFixed(3) + " m"],
        ["Altitude moyenne (Z moy)", zMoy.toFixed(3) + " m"],
        ["Dénivelé total", denivele.toFixed(3) + " m"],
      ],
      headStyles: { fillColor: [46, 125, 50], textColor: 255, fontStyle: "bold", fontSize: 9 },
      bodyStyles: { fontSize: 8 },
      alternateRowStyles: { fillColor: [240, 255, 240] },
    });

    // Tableau des points
    y = (doc as any).lastAutoTable.finalY + 6;
    doc.setFontSize(10); doc.setFont("helvetica", "bold"); doc.setTextColor(0,0,0);
    doc.text("TABLEAU DES COORDONNÉES", W/2, y, { align: "center" });

    autoTable(doc, {
      startY: y + 4,
      margin: { left: m+4, right: m+4 },
      head: [["#", "Nom", "Code", "X (Est) m", "Y (Nord) m", "Z (Alt) m"]],
      body: points.map((p, i) => [i+1, p.name || `PT${i+1}`, p.code || "TN", p.x?.toFixed(3), p.y?.toFixed(3), p.z?.toFixed(3)]),
      headStyles: { fillColor: [13, 71, 161], textColor: 255, fontStyle: "bold", fontSize: 8 },
      bodyStyles: { fontSize: 7.5 },
      alternateRowStyles: { fillColor: [240, 244, 255] },
      columnStyles: {
        0: { halign: "center", cellWidth: 10 },
        1: { cellWidth: 25 },
        2: { halign: "center", cellWidth: 18 },
        3: { halign: "right", cellWidth: 35 },
        4: { halign: "right", cellWidth: 35 },
        5: { halign: "right", cellWidth: 30 },
      },
    });

    // Superficie si points LIM
    const limPts = points.filter(p => p.code === "LIM");
    if (limPts.length >= 3) {
      let area = 0;
      for (let i = 0; i < limPts.length; i++) {
        const j = (i+1) % limPts.length;
        area += limPts[i].x * limPts[j].y - limPts[j].x * limPts[i].y;
      }
      area = Math.abs(area) / 2;
      const supY = (doc as any).lastAutoTable.finalY + 4;
      doc.setFillColor(232, 245, 233);
      doc.rect(m+4, supY, W-m*2-8, 10, "F");
      doc.setDrawColor(76, 175, 80);
      doc.rect(m+4, supY, W-m*2-8, 10, "S");
      doc.setFontSize(9); doc.setFont("helvetica", "bold"); doc.setTextColor(27, 94, 32);
      doc.text(`Superficie calculée (Gauss) : ${area.toFixed(2)} m²  =  ${(area/10000).toFixed(4)} Ha`, W/2, supY+6.5, { align: "center" });
    }

    // Observations
    if (form.observations) {
      const obsY = (doc as any).lastAutoTable.finalY + 18;
      doc.setFontSize(9); doc.setFont("helvetica", "bold"); doc.setTextColor(0,0,0);
      doc.text("OBSERVATIONS :", m+4, obsY);
      doc.setFont("helvetica", "normal"); doc.setFontSize(8);
      doc.text(form.observations, m+4, obsY+6, { maxWidth: W-m*2-8 });
    }

    // Footer
    const footY = H - m - 20;
    doc.setLineWidth(0.3);
    doc.line(m+4, footY, W-m-4, footY);
    doc.setFontSize(8); doc.setFont("helvetica", "normal"); doc.setTextColor(0,0,0);
    doc.text(`Fait à ${form.commune}, le ${form.date}`, m+10, footY+6);
    doc.text("Cachet et Signature", W-m-40, footY+6);
    // Signature numerique
    if (signature) { doc.addImage(signature, "PNG", W-m-45, footY+3, 40, 15); }
    
    // Cachet bureau
    if (bureauNom) {
      doc.setDrawColor(0,0,150); doc.setLineWidth(0.8);
      doc.rect(m+4, footY-2, 60, 20);
      doc.setFontSize(7); doc.setFont("helvetica","bold"); doc.setTextColor(0,0,150);
      doc.text(bureauNom, m+34, footY+4, { align: "center" });
      doc.setFont("helvetica","normal"); doc.setFontSize(6);
      if (bureauOrdre) doc.text("N Ordre: " + bureauOrdre, m+34, footY+9, { align: "center" });
    }
    doc.rect(W-m-45, footY+3, 40, 15);
    doc.setFontSize(7); doc.setTextColor(100,100,100);
    doc.text("Document généré par TerraMaps v2.0 — terramaps.vercel.app", W/2, H-m-4, { align: "center" });

    const projectName = project?.name?.replace(/\s+/g, "_") || "projet";
    doc.save(`Rapport_Terrain_${projectName}_${form.date.replace(/\//g, "-")}.pdf`);
    setLoading(false);
  }

  return (
    <div style={{ minHeight: "100vh", background: "#0D1117", color: "#E2EAF2", fontFamily: "Arial" }}>
      <div style={{ background: "#161B22", borderBottom: "1px solid #1E2D3D", padding: "0 24px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 56 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ fontSize: 18, fontWeight: 700 }}>Terra<span style={{ color: "#F97316" }}>Maps</span></div>
          <span style={{ background: "#0D47A1", color: "#fff", fontSize: 10, fontWeight: 700, padding: "2px 10px", borderRadius: 20 }}>RAPPORT TERRAIN</span>
        </div>
        <Link href="/dashboard" style={{ color: "#64748B", fontSize: 13, textDecoration: "none" }}>← Dashboard</Link>
      </div>

      <div style={{ padding: 24, maxWidth: 900, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ fontSize: 48, marginBottom: 8 }}>📋</div>
          <h1 style={{ margin: "0 0 8px", fontSize: 22, fontWeight: 700 }}>Rapport de Terrain Complet</h1>
          <p style={{ color: "#64748B", fontSize: 13 }}>Document PDF professionnel — Levé + Coordonnées + Statistiques</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
          <div style={{ background: "#161B22", border: "1px solid #1E2D3D", borderRadius: 12, padding: 24 }}>
            <h3 style={{ margin: "0 0 16px", fontSize: 14, color: "#8BACC8" }}>📁 Projet & Informations</h3>
            
            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 11, color: "#64748B", display: "block", marginBottom: 4, textTransform: "uppercase" }}>Projet</label>
              <select value={selectedProject} onChange={e => setSelectedProject(e.target.value)}
                style={{ width: "100%", background: "#0D1117", border: "1px solid #1E2D3D", borderRadius: 8, padding: "8px 12px", color: "#fff", fontSize: 13 }}>
                <option value="">-- Sélectionnez --</option>
                {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>

            {[
              { key: "province", label: "Province" },
              { key: "commune", label: "Commune" },
              { key: "proprietaire", label: "Propriétaire" },
              { key: "cin", label: "CIN / Référence" },
              { key: "technicien", label: "Technicien" },
              { key: "date", label: "Date" },
            ].map(f => (
              <div key={f.key} style={{ marginBottom: 10 }}>
                <label style={{ fontSize: 11, color: "#64748B", display: "block", marginBottom: 4, textTransform: "uppercase" }}>{f.label}</label>
                <input value={(form as any)[f.key]} onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                  style={{ width: "100%", background: "#0D1117", border: "1px solid #1E2D3D", borderRadius: 8, padding: "7px 12px", color: "#fff", fontSize: 12, boxSizing: "border-box" }} />
              </div>
            ))}

            <div style={{ marginBottom: 10 }}>
              <label style={{ fontSize: 11, color: "#64748B", display: "block", marginBottom: 4, textTransform: "uppercase" }}>Observations</label>
              <textarea value={form.observations} onChange={e => setForm(prev => ({ ...prev, observations: e.target.value }))} rows={3}
                style={{ width: "100%", background: "#0D1117", border: "1px solid #1E2D3D", borderRadius: 8, padding: "7px 12px", color: "#fff", fontSize: 12, boxSizing: "border-box", resize: "vertical" }} />
            </div>
          </div>

          <div>
            {/* Aperçu points */}
            <div style={{ background: "#161B22", border: "1px solid #1E2D3D", borderRadius: 12, padding: 20, marginBottom: 16 }}>
              <h3 style={{ margin: "0 0 12px", fontSize: 13, color: "#8BACC8" }}>📍 Points du projet ({points.length})</h3>
              {points.length === 0 ? (
                <div style={{ textAlign: "center", padding: 20, color: "#64748B", fontSize: 12 }}>Sélectionnez un projet</div>
              ) : (
                <div style={{ maxHeight: 200, overflowY: "auto" }}>
                  {[
                    { label: "Total", value: points.length, color: "#F97316" },
                    { label: "Z min", value: Math.min(...points.map(p => p.z)).toFixed(3) + " m", color: "#3B82F6" },
                    { label: "Z max", value: Math.max(...points.map(p => p.z)).toFixed(3) + " m", color: "#EF4444" },
                    { label: "Dénivelé", value: (Math.max(...points.map(p => p.z)) - Math.min(...points.map(p => p.z))).toFixed(3) + " m", color: "#22C55E" },
                  ].map(s => (
                    <div key={s.label} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid #1E2D3D" }}>
                      <span style={{ fontSize: 12, color: "#64748B" }}>{s.label}</span>
                      <span style={{ fontSize: 13, fontWeight: 700, color: s.color, fontFamily: "monospace" }}>{s.value}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Contenu du rapport */}
            <div style={{ background: "#161B22", border: "1px solid #1E2D3D", borderRadius: 12, padding: 20, marginBottom: 16 }}>
              <h3 style={{ margin: "0 0 12px", fontSize: 13, color: "#8BACC8" }}>📄 Contenu du rapport</h3>
              {[
                "✅ En-tête officiel Royaume du Maroc",
                "✅ Informations du projet et propriétaire",
                "✅ Statistiques altimétriques (Z min/max/moy)",
                "✅ Tableau complet des coordonnées X, Y, Z",
                "✅ Superficie calculée (méthode Gauss)",
                "✅ Observations du technicien",
                "✅ Zone cachet et signature",
              ].map(item => (
                <div key={item} style={{ fontSize: 12, color: "#8BACC8", padding: "3px 0" }}>{item}</div>
              ))}
            </div>
            <div style={{ marginBottom: 12 }}>
              <input value={bureauNom} onChange={e => setBureauNom(e.target.value)}
                placeholder="Nom du bureau..."
                style={{ width: "100%", background: "#0D1117", border: "1px solid #1E2D3D", borderRadius: 8, padding: "7px 10px", color: "#fff", fontSize: 12, boxSizing: "border-box", marginBottom: 6 }} />
              <input value={bureauOrdre} onChange={e => setBureauOrdre(e.target.value)}
                placeholder="N ordre topographe..."
                style={{ width: "100%", background: "#0D1117", border: "1px solid #1E2D3D", borderRadius: 8, padding: "7px 10px", color: "#fff", fontSize: 12, boxSizing: "border-box" }} />
            </div>
            <div style={{ marginBottom: 12 }}>
              <SignaturePad onSignature={setSignature} />
            </div>

            <button onClick={generatePDF} disabled={loading || !selectedProject || points.length === 0}
              style={{ width: "100%", background: !selectedProject || points.length === 0 ? "#1E2D3D" : "#0D47A1", border: "none", color: "#fff", padding: "14px", borderRadius: 10, cursor: !selectedProject || points.length === 0 ? "not-allowed" : "pointer", fontSize: 15, fontWeight: 700 }}>
              {loading ? "Generation..." : "Generer le Rapport Complet"}
            </button>
            <button onClick={generatePDF} disabled={loading || !selectedProject || points.length === 0}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
