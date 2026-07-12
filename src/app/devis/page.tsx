"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function DevisPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [savedId, setSavedId] = useState<number|null>(null);
  const [societe, setSociete] = useState<any>({});

  useEffect(() => {
    const saved = localStorage.getItem("tm_settings");
    if (saved) setSociete(JSON.parse(saved));
  }, []);
  const [form, setForm] = useState({
    numero: "DEV-2026-001",
    date: new Date().toLocaleDateString("fr-FR"),
    validite: "30",
    client: "",
    clientAdresse: "",
    clientTel: "",
    clientEmail: "",
    projet: "",
    description: "",
    tva: "20",
  });
  const [tarifs, setTarifs] = useState<any[]>([]);
  const [showTarifs, setShowTarifs] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("tm_tarifs");
    if (saved) setTarifs(JSON.parse(saved));
  }, []);

  function importTarif(t: any) {
    setLignes(prev => [...prev, { description: t.prestation, quantite: "1", unite: t.unite, prixUnit: String(t.prix) }]);
    setShowTarifs(false);
  }

  const [lignes, setLignes] = useState([
    { description: "Levé topographique", quantite: "1", unite: "Forfait", prixUnit: "3000" },
    { description: "Rapport PDF officiel", quantite: "1", unite: "Forfait", prixUnit: "500" },
  ]);

  useEffect(() => {
    fetch("/api/projects").then(r => r.json()).then(d => { if (Array.isArray(d)) setProjects(d); });
  }, []);

  const sousTotal = lignes.reduce((s, l) => s + parseFloat(l.quantite || "0") * parseFloat(l.prixUnit || "0"), 0);
  const tva = sousTotal * parseFloat(form.tva || "0") / 100;
  const total = sousTotal + tva;

  function addLigne() {
    setLignes(prev => [...prev, { description: "", quantite: "1", unite: "Forfait", prixUnit: "0" }]);
  }

  function removeLigne(i: number) {
    setLignes(prev => prev.filter((_, j) => j !== i));
  }

  async function generatePDF() {
    setLoading(true);
    const { default: jsPDF } = await import("jspdf");
    const { default: autoTable } = await import("jspdf-autotable");
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const W = 210, m = 15;

    // En-tete avec infos societe
    doc.setFillColor(13, 71, 161);
    doc.rect(0, 0, W, 45, "F");
    // Logo
    if (societe.societeLogo) {
      try { doc.addImage(societe.societeLogo, "PNG", m, 5, 30, 30); } catch {}
    }
    doc.setFontSize(18); doc.setFont("helvetica", "bold"); doc.setTextColor(255, 255, 255);
    doc.text(societe.societeNom || "TerraMaps", societe.societeLogo ? m + 35 : m, 18);
    doc.setFontSize(9); doc.setFont("helvetica", "normal");
    const textX = societe.societeLogo ? m + 35 : m;
    doc.text(societe.societeAdresse || "", textX, 25);
    doc.text((societe.societeVille || "") + " — " + (societe.societeTel || ""), textX, 31);
    doc.text(societe.societeEmail || "", textX, 37);
    if (societe.societeRC) doc.text("RC: " + societe.societeRC + " | IF: " + (societe.societeIF || "") + " | ICE: " + (societe.societeICE || ""), textX, 43);
    
    doc.setFontSize(20); doc.setFont("helvetica", "bold");
    doc.text("DEVIS", W - m - 30, 22);
    doc.setFontSize(10); doc.setFont("helvetica", "normal");
    doc.text(`N° ${form.numero}`, W - m - 30, 30);
    doc.text(`Date: ${form.date}`, W - m - 30, 37);

    // Info client
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(11); doc.setFont("helvetica", "bold");
    doc.text("CLIENT", m, 58);
    doc.setFont("helvetica", "normal"); doc.setFontSize(10);
    doc.text(form.client || "—", m, 66);
    doc.text(form.clientAdresse || "—", m, 72);
    doc.text(form.clientTel || "—", m, 78);
    doc.text(form.clientEmail || "—", m, 84);

    // Info devis
    doc.setFont("helvetica", "bold"); doc.setFontSize(11);
    doc.text("PROJET", W/2, 58);
    doc.setFont("helvetica", "normal"); doc.setFontSize(10);
    doc.text(form.projet || "—", W/2, 66);
    doc.text(`Validite: ${form.validite} jours`, W/2, 72);

    // Tableau lignes
    autoTable(doc, {
      startY: 95,
      margin: { left: m, right: m },
      head: [["Description", "Qte", "Unite", "Prix Unit. (MAD)", "Total (MAD)"]],
      body: lignes.map(l => [
        l.description,
        l.quantite,
        l.unite,
        parseFloat(l.prixUnit).toFixed(2),
        (parseFloat(l.quantite) * parseFloat(l.prixUnit)).toFixed(2),
      ]),
      headStyles: { fillColor: [13, 71, 161], textColor: 255, fontStyle: "bold", fontSize: 9 },
      bodyStyles: { fontSize: 9 },
      alternateRowStyles: { fillColor: [240, 244, 255] },
      columnStyles: {
        0: { cellWidth: 70 },
        1: { halign: "center", cellWidth: 15 },
        2: { halign: "center", cellWidth: 25 },
        3: { halign: "right", cellWidth: 35 },
        4: { halign: "right", cellWidth: 35 },
      },
    });

    const finalY = (doc as any).lastAutoTable.finalY + 8;
    
    // Totaux
    doc.setFont("helvetica", "normal"); doc.setFontSize(10);
    doc.text("Sous-total HT:", W - m - 60, finalY);
    doc.text(`${sousTotal.toFixed(2)} MAD`, W - m, finalY, { align: "right" });
    doc.text(`TVA (${form.tva}%):`, W - m - 60, finalY + 8);
    doc.text(`${tva.toFixed(2)} MAD`, W - m, finalY + 8, { align: "right" });
    doc.setLineWidth(0.5); doc.line(W - m - 65, finalY + 12, W - m, finalY + 12);
    doc.setFont("helvetica", "bold"); doc.setFontSize(12);
    doc.text("TOTAL TTC:", W - m - 60, finalY + 20);
    doc.setTextColor(13, 71, 161);
    doc.text(`${total.toFixed(2)} MAD`, W - m, finalY + 20, { align: "right" });

    // Conditions
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "normal"); doc.setFontSize(8);
    doc.text("Conditions de paiement: 50% a la commande, 50% a la livraison", m, finalY + 35);
    doc.text(`Ce devis est valable ${form.validite} jours a compter de la date d emission.`, m, finalY + 42);

    // Signature
    const footY = 270;
    doc.setLineWidth(0.3); doc.line(m, footY, W - m, footY);
    doc.text("Signature client:", m, footY + 8);
    doc.text("Signature TerraMaps:", W/2, footY + 8);
    doc.rect(m, footY + 10, 70, 15);
    doc.rect(W/2, footY + 10, 70, 15);
    doc.setFontSize(7); doc.setTextColor(100, 100, 100);
    doc.text("Document genere par TerraMaps v2.0 — terramaps.vercel.app", W/2, 290, { align: "center" });

    // Sauvegarder dans BDD
    await fetch("/api/devis", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, sousTotal, tva, total, lignes }),
    });
    doc.save(`Devis_${form.numero}_${form.client.replace(/\s+/g, "_")}.pdf`);
    setLoading(false);
  }

  return (
    <>
    {showTarifs && (
      <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ background: "#161B22", border: "1px solid #1E2D3D", borderRadius: 16, padding: 24, minWidth: 400, maxHeight: "80vh", overflowY: "auto" }}>
          <h3 style={{ margin: "0 0 16px", color: "#E2EAF2" }}>Sélectionner une prestation</h3>
          {tarifs.map((t: any) => (
            <div key={t.id} onClick={() => importTarif(t)}
              style={{ padding: "10px 14px", background: "#0D1117", borderRadius: 8, marginBottom: 8, cursor: "pointer", border: "1px solid #1E2D3D" }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = "#F97316")}
              onMouseLeave={e => (e.currentTarget.style.borderColor = "#1E2D3D")}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#E2EAF2" }}>{t.prestation}</div>
              <div style={{ fontSize: 11, color: "#64748B", marginTop: 2 }}>{t.unite} — {t.prix.toFixed(2)} MAD HT</div>
            </div>
          ))}
          <button onClick={() => setShowTarifs(false)} style={{ width: "100%", background: "transparent", border: "1px solid #1E2D3D", color: "#64748B", padding: "10px", borderRadius: 8, cursor: "pointer", marginTop: 8 }}>Fermer</button>
        </div>
      </div>
    )}
    <div style={{ minHeight: "100vh", background: "#0D1117", color: "#E2EAF2", fontFamily: "Arial" }}>
    <div style={{ minHeight: "100vh", background: "#0D1117", color: "#E2EAF2", fontFamily: "Arial" }}>
      <div style={{ background: "#161B22", borderBottom: "1px solid #1E2D3D", padding: "0 24px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 56 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ fontSize: 18, fontWeight: 700 }}>Terra<span style={{ color: "#F97316" }}>Maps</span></div>
          <span style={{ background: "#22C55E", color: "#fff", fontSize: 10, fontWeight: 700, padding: "2px 10px", borderRadius: 20 }}>DEVIS</span>
        </div>
        <Link href="/dashboard" style={{ color: "#64748B", fontSize: 13, textDecoration: "none" }}>← Dashboard</Link>
      </div>

      <div style={{ padding: 24, maxWidth: 1000, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ fontSize: 48, marginBottom: 8 }}>💰</div>
          <h1 style={{ margin: "0 0 8px", fontSize: 22, fontWeight: 700 }}>Générateur de Devis</h1>
          <p style={{ color: "#64748B", fontSize: 13 }}>Créez des devis professionnels PDF pour vos clients</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
          {/* Formulaire */}
          <div>
            <div style={{ background: "#161B22", border: "1px solid #1E2D3D", borderRadius: 12, padding: 20, marginBottom: 16 }}>
              <h3 style={{ margin: "0 0 16px", fontSize: 13, color: "#F97316", fontWeight: 700 }}>📋 Informations du devis</h3>
              {[
                { key: "numero", label: "N° Devis" },
                { key: "date", label: "Date" },
                { key: "validite", label: "Validité (jours)" },
              ].map(f => (
                <div key={f.key} style={{ marginBottom: 10 }}>
                  <label style={{ fontSize: 11, color: "#64748B", display: "block", marginBottom: 4, textTransform: "uppercase" }}>{f.label}</label>
                  <input value={(form as any)[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                    style={{ width: "100%", background: "#0D1117", border: "1px solid #1E2D3D", borderRadius: 8, padding: "7px 10px", color: "#fff", fontSize: 12, boxSizing: "border-box" }} />
                </div>
              ))}
            </div>

            <div style={{ background: "#161B22", border: "1px solid #1E2D3D", borderRadius: 12, padding: 20, marginBottom: 16 }}>
              <h3 style={{ margin: "0 0 16px", fontSize: 13, color: "#3B82F6", fontWeight: 700 }}>👤 Client</h3>
              {[
                { key: "client", label: "Nom du client" },
                { key: "clientAdresse", label: "Adresse" },
                { key: "clientTel", label: "Téléphone" },
                { key: "clientEmail", label: "Email" },
              ].map(f => (
                <div key={f.key} style={{ marginBottom: 10 }}>
                  <label style={{ fontSize: 11, color: "#64748B", display: "block", marginBottom: 4, textTransform: "uppercase" }}>{f.label}</label>
                  <input value={(form as any)[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                    style={{ width: "100%", background: "#0D1117", border: "1px solid #1E2D3D", borderRadius: 8, padding: "7px 10px", color: "#fff", fontSize: 12, boxSizing: "border-box" }} />
                </div>
              ))}
            </div>

            <div style={{ background: "#161B22", border: "1px solid #1E2D3D", borderRadius: 12, padding: 20 }}>
              <h3 style={{ margin: "0 0 16px", fontSize: 13, color: "#A855F7", fontWeight: 700 }}>📁 Projet</h3>
              <div style={{ marginBottom: 10 }}>
                <label style={{ fontSize: 11, color: "#64748B", display: "block", marginBottom: 4, textTransform: "uppercase" }}>Projet TerraMaps</label>
                <select value={form.projet} onChange={e => setForm(p => ({ ...p, projet: e.target.value }))}
                  style={{ width: "100%", background: "#0D1117", border: "1px solid #1E2D3D", borderRadius: 8, padding: "7px 10px", color: "#fff", fontSize: 12 }}>
                  <option value="">-- Sélectionnez --</option>
                  {projects.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
                </select>
              </div>
              <div style={{ marginBottom: 10 }}>
                <label style={{ fontSize: 11, color: "#64748B", display: "block", marginBottom: 4, textTransform: "uppercase" }}>TVA (%)</label>
                <input value={form.tva} onChange={e => setForm(p => ({ ...p, tva: e.target.value }))}
                  style={{ width: "100%", background: "#0D1117", border: "1px solid #1E2D3D", borderRadius: 8, padding: "7px 10px", color: "#fff", fontSize: 12, boxSizing: "border-box" }} />
              </div>
            </div>
          </div>

          {/* Lignes et totaux */}
          <div>
            <div style={{ background: "#161B22", border: "1px solid #1E2D3D", borderRadius: 12, padding: 20, marginBottom: 16 }}>
              <h3 style={{ margin: "0 0 16px", fontSize: 13, color: "#22C55E", fontWeight: 700 }}>📝 Prestations</h3>
              {lignes.map((l, i) => (
                <div key={i} style={{ background: "#0D1117", borderRadius: 8, padding: 12, marginBottom: 8 }}>
                  <input value={l.description} onChange={e => setLignes(prev => prev.map((x, j) => j === i ? { ...x, description: e.target.value } : x))}
                    placeholder="Description..."
                    style={{ width: "100%", background: "transparent", border: "none", borderBottom: "1px solid #1E2D3D", color: "#E2EAF2", fontSize: 12, padding: "4px 0", marginBottom: 8, outline: "none", boxSizing: "border-box" }} />
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr auto", gap: 6 }}>
                    <input value={l.quantite} onChange={e => setLignes(prev => prev.map((x, j) => j === i ? { ...x, quantite: e.target.value } : x))}
                      placeholder="Qté" style={{ background: "#161B22", border: "1px solid #1E2D3D", borderRadius: 6, padding: "5px 8px", color: "#F97316", fontSize: 11, textAlign: "center" }} />
                    <input value={l.unite} onChange={e => setLignes(prev => prev.map((x, j) => j === i ? { ...x, unite: e.target.value } : x))}
                      placeholder="Unité" style={{ background: "#161B22", border: "1px solid #1E2D3D", borderRadius: 6, padding: "5px 8px", color: "#8BACC8", fontSize: 11 }} />
                    <input value={l.prixUnit} onChange={e => setLignes(prev => prev.map((x, j) => j === i ? { ...x, prixUnit: e.target.value } : x))}
                      placeholder="Prix MAD" style={{ background: "#161B22", border: "1px solid #1E2D3D", borderRadius: 6, padding: "5px 8px", color: "#22C55E", fontSize: 11 }} />
                    <button onClick={() => removeLigne(i)} style={{ background: "transparent", border: "none", color: "#EF4444", cursor: "pointer", fontSize: 16 }}>×</button>
                  </div>
                  <div style={{ textAlign: "right", fontSize: 11, color: "#F97316", marginTop: 6, fontWeight: 700 }}>
                    {(parseFloat(l.quantite || "0") * parseFloat(l.prixUnit || "0")).toFixed(2)} MAD
                  </div>
                </div>
              ))}
              <button onClick={() => setShowTarifs(true)} style={{ width: "100%", background: "transparent", border: "1px dashed #3B82F6", color: "#3B82F6", padding: "8px", borderRadius: 8, cursor: "pointer", fontSize: 12, marginBottom: 6 }}>
                📋 Importer depuis tarifs
              </button>
              <button onClick={addLigne} style={{ width: "100%", background: "transparent", border: "1px dashed #1E2D3D", color: "#64748B", padding: "8px", borderRadius: 8, cursor: "pointer", fontSize: 12, marginTop: 4 }}>
                + Ajouter une prestation
              </button>
            </div>

            {/* Totaux */}
            <div style={{ background: "#161B22", border: "1px solid #1E2D3D", borderRadius: 12, padding: 20, marginBottom: 16 }}>
              <h3 style={{ margin: "0 0 16px", fontSize: 13, color: "#8BACC8", fontWeight: 700 }}>💵 Totaux</h3>
              {[
                { label: "Sous-total HT", value: sousTotal.toFixed(2) + " MAD", color: "#E2EAF2" },
                { label: `TVA (${form.tva}%)`, value: tva.toFixed(2) + " MAD", color: "#64748B" },
                { label: "TOTAL TTC", value: total.toFixed(2) + " MAD", color: "#F97316", big: true },
              ].map(t => (
                <div key={t.label} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #1E2D3D" }}>
                  <span style={{ fontSize: 13, color: "#64748B" }}>{t.label}</span>
                  <span style={{ fontSize: t.big ? 18 : 13, fontWeight: t.big ? 700 : 400, color: t.color, fontFamily: "monospace" }}>{t.value}</span>
                </div>
              ))}
            </div>

            {/* Modeles */}
            <div style={{ background: "#161B22", border: "1px solid #1E2D3D", borderRadius: 12, padding: 16, marginBottom: 16 }}>
              <div style={{ fontSize: 12, color: "#8BACC8", fontWeight: 700, marginBottom: 10, textTransform: "uppercase" }}>📋 Modèles rapides</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {[
                  { label: "Levé standard < 1 Ha", lignes: [{ description: "Levé topographique < 1 Ha", quantite: "1", unite: "Forfait", prixUnit: "3000" }, { description: "Rapport PDF officiel", quantite: "1", unite: "Forfait", prixUnit: "500" }] },
                  { label: "Levé 1-5 Ha + rapport", lignes: [{ description: "Levé topographique 1-5 Ha", quantite: "1", unite: "Forfait", prixUnit: "5000" }, { description: "Rapport PDF officiel", quantite: "1", unite: "Forfait", prixUnit: "500" }] },
                  { label: "Polygonale complète", lignes: [{ description: "Polygonale", quantite: "1", unite: "Forfait", prixUnit: "2000" }, { description: "Canevas de nivellement", quantite: "1", unite: "Forfait", prixUnit: "1500" }, { description: "Rapport PDF officiel", quantite: "1", unite: "Forfait", prixUnit: "500" }] },
                  { label: "Bornage terrain", lignes: [{ description: "Levé topographique < 1 Ha", quantite: "1", unite: "Forfait", prixUnit: "3000" }, { description: "Levé topo certifié", quantite: "1", unite: "Forfait", prixUnit: "800" }, { description: "Frais de déplacement", quantite: "50", unite: "km", prixUnit: "5" }] },
                ].map(m => (
                  <button key={m.label} onClick={() => setLignes(m.lignes)}
                    style={{ background: "#0D1117", border: "1px solid #1E2D3D", color: "#8BACC8", padding: "8px 12px", borderRadius: 8, cursor: "pointer", fontSize: 12, textAlign: "left" }}
                    onMouseEnter={e => (e.currentTarget.style.borderColor = "#F97316")}
                    onMouseLeave={e => (e.currentTarget.style.borderColor = "#1E2D3D")}>
                    📄 {m.label}
                  </button>
                ))}
              </div>
            </div>
            <button onClick={generatePDF} disabled={loading}
              style={{ width: "100%", background: "#0D47A1", border: "none", color: "#fff", padding: "14px", borderRadius: 10, cursor: "pointer", fontSize: 15, fontWeight: 700 }}>
              {loading ? "Generation..." : "Generer le Devis PDF"}
            </button>
            {savedId && (
              <button onClick={async () => {
                const res = await fetch("/api/devis/share", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ id: savedId })
                });
                const data = await res.json();
                const url = window.location.origin + "/doc-public?type=devis&token=" + data.token;
                navigator.clipboard.writeText(url);
                alert("Lien copie ! " + url);
              }} style={{ width: "100%", marginTop: 8, background: "#22C55E", border: "none", color: "#fff", padding: "12px", borderRadius: 10, cursor: "pointer", fontSize: 14, fontWeight: 700 }}>
                🔗 Partager ce devis
              </button>
            )}
              style={{ width: "100%", background: "#0D47A1", border: "none", color: "#fff", padding: "14px", borderRadius: 10, cursor: "pointer", fontSize: 15, fontWeight: 700 }}>
              {loading ? "Generation..." : "Generer le Devis PDF"}
            </button>
          </div>
        </div>
      </div>
    </div>
    </div>
    </>
  );
}
