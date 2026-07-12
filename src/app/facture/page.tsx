"use client";
import SignaturePad from "@/components/SignaturePad";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function FacturePage() {
  const [loading, setLoading] = useState(false);
  const [savedId, setSavedId] = useState<number|null>(null);
  const [signature, setSignature] = useState("");
  const [societe, setSociete] = useState<any>({});
  const [form, setForm] = useState({
    numero: "FAC-2026-001",
    date: new Date().toLocaleDateString("fr-FR"),
    devisRef: "",
    client: "",
    clientAdresse: "",
    clientTel: "",
    clientEmail: "",
    projet: "",
    tva: "20",
    timbre: "20",
    modePaiement: "Virement bancaire",
  });
  const [lignes, setLignes] = useState([
    { description: "Levé topographique", quantite: "1", unite: "Forfait", prixUnit: "3000" },
    { description: "Rapport PDF officiel", quantite: "1", unite: "Forfait", prixUnit: "500" },
  ]);
  const [projects, setProjects] = useState<any[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem("tm_settings");
    if (saved) setSociete(JSON.parse(saved));
    fetch("/api/projects").then(r => r.json()).then(d => { if (Array.isArray(d)) setProjects(d); });
  }, []);

  const sousTotal = lignes.reduce((s, l) => s + parseFloat(l.quantite || "0") * parseFloat(l.prixUnit || "0"), 0);
  const tva = sousTotal * parseFloat(form.tva || "0") / 100;
  const timbre = parseFloat(form.timbre || "0");
  const total = sousTotal + tva + timbre;

  async function generatePDF() {
    setLoading(true);
    const { default: jsPDF } = await import("jspdf");
    const { default: autoTable } = await import("jspdf-autotable");
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const W = 210, m = 15;

    // En-tete societe
    doc.setFillColor(13, 71, 161);
    doc.rect(0, 0, W, 45, "F");
    // Logo
    if (societe.societeLogo) {
      try { doc.addImage(societe.societeLogo, "PNG", m, 5, 30, 30); } catch {}
    }
    doc.setFontSize(18); doc.setFont("helvetica", "bold"); doc.setTextColor(255,255,255);
    const textX = societe.societeLogo ? m + 35 : m;
    doc.text(societe.societeNom || "TerraMaps", textX, 18);
    doc.setFontSize(9); doc.setFont("helvetica", "normal");
    doc.text(societe.societeAdresse || "", textX, 25);
    doc.text((societe.societeVille || "") + " — " + (societe.societeTel || ""), textX, 31);
    doc.text(societe.societeEmail || "", textX, 37);
    if (societe.societeRC) doc.text("RC: " + societe.societeRC + " | IF: " + (societe.societeIF || "") + " | ICE: " + (societe.societeICE || ""), textX, 43);
    

    // Titre FACTURE
    doc.setFontSize(22); doc.setFont("helvetica", "bold"); doc.setTextColor(255,255,255);
    doc.text("FACTURE", W-m-35, 20);
    doc.setFontSize(10); doc.setFont("helvetica", "normal");
    doc.text("N° " + form.numero, W-m-35, 28);
    doc.text("Date: " + form.date, W-m-35, 35);
    if (form.devisRef) doc.text("Ref devis: " + form.devisRef, W-m-35, 42);

    // Client
    doc.setTextColor(0,0,0);
    doc.setFontSize(11); doc.setFont("helvetica", "bold");
    doc.text("FACTURER A:", m, 58);
    doc.setFont("helvetica", "normal"); doc.setFontSize(10);
    doc.text(form.client || "—", m, 66);
    doc.text(form.clientAdresse || "—", m, 72);
    doc.text(form.clientTel || "—", m, 78);
    doc.text(form.clientEmail || "—", m, 84);

    // Projet
    doc.setFont("helvetica", "bold"); doc.setFontSize(11);
    doc.text("PROJET:", W/2, 58);
    doc.setFont("helvetica", "normal"); doc.setFontSize(10);
    doc.text(form.projet || "—", W/2, 66);
    doc.text("Mode paiement: " + form.modePaiement, W/2, 72);

    // Tableau prestations
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
    doc.text("Sous-total HT:", W-m-60, finalY);
    doc.text(sousTotal.toFixed(2) + " MAD", W-m, finalY, { align: "right" });
    doc.text("TVA (" + form.tva + "%):", W-m-60, finalY+8);
    doc.text(tva.toFixed(2) + " MAD", W-m, finalY+8, { align: "right" });
    doc.text("Timbre fiscal:", W-m-60, finalY+16);
    doc.text(timbre.toFixed(2) + " MAD", W-m, finalY+16, { align: "right" });
    doc.setLineWidth(0.5); doc.line(W-m-65, finalY+20, W-m, finalY+20);
    doc.setFont("helvetica", "bold"); doc.setFontSize(13);
    doc.text("TOTAL TTC:", W-m-60, finalY+28);
    doc.setTextColor(13,71,161);
    doc.text(total.toFixed(2) + " MAD", W-m, finalY+28, { align: "right" });

    // Arrete
    doc.setTextColor(0,0,0);
    doc.setFont("helvetica", "italic"); doc.setFontSize(9);
    doc.text("Arretee la presente facture a la somme de: " + total.toFixed(2) + " MAD TTC", m, finalY+40);

    // Pied de page
    const footY = 265;
    doc.setLineWidth(0.3); doc.line(m, footY, W-m, footY);
    doc.setFont("helvetica", "normal"); doc.setFontSize(8);
    doc.text("Signature client:", m, footY+8);
    doc.text("Cachet et Signature:", W/2, footY+8);
    doc.rect(m, footY+10, 70, 15);
    doc.rect(W/2, footY+10, 70, 15);

    // Infos societe footer
    doc.setFontSize(7); doc.setFont("helvetica", "bold"); doc.setTextColor(0,0,100);
    doc.text(societe.societeNom || "TerraMaps", m, footY+30);
    doc.setFont("helvetica", "normal"); doc.setFontSize(6); doc.setTextColor(100,100,100);
    if (societe.societeRC) doc.text("RC: "+societe.societeRC+" | IF: "+(societe.societeIF||"")+" | ICE: "+(societe.societeICE||""), m, footY+35);
    doc.text("Document genere par TerraMaps v2.0", W/2, footY+35, { align: "center" });

    if (signature) { doc.addImage(signature, "PNG", W/2, footY+10, 70, 15); }
    // Sauvegarder dans BDD
    // Sauvegarder dans BDD
    const saveRes = await fetch("/api/factures", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, sousTotal, tva: tva, timbre, total, lignes }),
    });
    const saved = await saveRes.json();
    if (saved.id) setSavedId(saved.id);
    doc.save("Facture_" + form.numero + "_" + (form.client || "client").replace(/\s+/g,"_") + ".pdf");
    setLoading(false);
  }

  return (
    <div style={{ minHeight: "100vh", background: "#0D1117", color: "#E2EAF2", fontFamily: "Arial" }}>
      <div style={{ background: "#161B22", borderBottom: "1px solid #1E2D3D", padding: "0 24px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 56 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ fontSize: 18, fontWeight: 700 }}>Terra<span style={{ color: "#F97316" }}>Maps</span></div>
          <span style={{ background: "#22C55E", color: "#fff", fontSize: 10, fontWeight: 700, padding: "2px 10px", borderRadius: 20 }}>FACTURE</span>
        </div>
        <Link href="/dashboard" style={{ color: "#64748B", fontSize: 13, textDecoration: "none" }}>← Dashboard</Link>
      </div>

      <div style={{ padding: 24, maxWidth: 1000, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ fontSize: 48, marginBottom: 8 }}>🧾</div>
          <h1 style={{ margin: "0 0 8px", fontSize: 22, fontWeight: 700 }}>Générateur de Factures</h1>
          <p style={{ color: "#64748B", fontSize: 13 }}>Créez des factures officielles PDF pour vos clients</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
          <div>
            <div style={{ background: "#161B22", border: "1px solid #1E2D3D", borderRadius: 12, padding: 20, marginBottom: 16 }}>
              <h3 style={{ margin: "0 0 16px", fontSize: 13, color: "#F97316", fontWeight: 700 }}>📋 Informations facture</h3>
              {[
                { key: "numero", label: "N° Facture" },
                { key: "date", label: "Date" },
                { key: "devisRef", label: "Référence devis" },
                { key: "modePaiement", label: "Mode de paiement" },
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
              <h3 style={{ margin: "0 0 16px", fontSize: 13, color: "#A855F7", fontWeight: 700 }}>💰 Taxes</h3>
              {[
                { key: "tva", label: "TVA (%)" },
                { key: "timbre", label: "Timbre fiscal (MAD)" },
              ].map(f => (
                <div key={f.key} style={{ marginBottom: 10 }}>
                  <label style={{ fontSize: 11, color: "#64748B", display: "block", marginBottom: 4, textTransform: "uppercase" }}>{f.label}</label>
                  <input value={(form as any)[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                    style={{ width: "100%", background: "#0D1117", border: "1px solid #1E2D3D", borderRadius: 8, padding: "7px 10px", color: "#fff", fontSize: 12, boxSizing: "border-box" }} />
                </div>
              ))}
            </div>
          </div>

          <div>
            <div style={{ background: "#161B22", border: "1px solid #1E2D3D", borderRadius: 12, padding: 20, marginBottom: 16 }}>
              <h3 style={{ margin: "0 0 16px", fontSize: 13, color: "#22C55E", fontWeight: 700 }}>📝 Prestations</h3>
              {lignes.map((l, i) => (
                <div key={i} style={{ background: "#0D1117", borderRadius: 8, padding: 12, marginBottom: 8 }}>
                  <input value={l.description} onChange={e => setLignes(prev => prev.map((x, j) => j===i ? {...x, description: e.target.value} : x))}
                    placeholder="Description..."
                    style={{ width: "100%", background: "transparent", border: "none", borderBottom: "1px solid #1E2D3D", color: "#E2EAF2", fontSize: 12, padding: "4px 0", marginBottom: 8, outline: "none", boxSizing: "border-box" }} />
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr auto", gap: 6 }}>
                    <input value={l.quantite} onChange={e => setLignes(prev => prev.map((x, j) => j===i ? {...x, quantite: e.target.value} : x))}
                      placeholder="Qté" style={{ background: "#161B22", border: "1px solid #1E2D3D", borderRadius: 6, padding: "5px 8px", color: "#F97316", fontSize: 11, textAlign: "center" }} />
                    <input value={l.unite} onChange={e => setLignes(prev => prev.map((x, j) => j===i ? {...x, unite: e.target.value} : x))}
                      placeholder="Unité" style={{ background: "#161B22", border: "1px solid #1E2D3D", borderRadius: 6, padding: "5px 8px", color: "#8BACC8", fontSize: 11 }} />
                    <input value={l.prixUnit} onChange={e => setLignes(prev => prev.map((x, j) => j===i ? {...x, prixUnit: e.target.value} : x))}
                      placeholder="Prix" style={{ background: "#161B22", border: "1px solid #1E2D3D", borderRadius: 6, padding: "5px 8px", color: "#22C55E", fontSize: 11 }} />
                    <button onClick={() => setLignes(prev => prev.filter((_,j) => j!==i))} style={{ background: "transparent", border: "none", color: "#EF4444", cursor: "pointer", fontSize: 16 }}>×</button>
                  </div>
                  <div style={{ textAlign: "right", fontSize: 11, color: "#F97316", marginTop: 6, fontWeight: 700 }}>
                    {(parseFloat(l.quantite||"0") * parseFloat(l.prixUnit||"0")).toFixed(2)} MAD
                  </div>
                </div>
              ))}
              <button onClick={() => setLignes(prev => [...prev, { description: "", quantite: "1", unite: "Forfait", prixUnit: "0" }])}
                style={{ width: "100%", background: "transparent", border: "1px dashed #1E2D3D", color: "#64748B", padding: "8px", borderRadius: 8, cursor: "pointer", fontSize: 12, marginTop: 4 }}>
                + Ajouter une prestation
              </button>
            </div>

            <div style={{ background: "#161B22", border: "1px solid #1E2D3D", borderRadius: 12, padding: 20, marginBottom: 16 }}>
              <h3 style={{ margin: "0 0 16px", fontSize: 13, color: "#8BACC8", fontWeight: 700 }}>💵 Totaux</h3>
              {[
                { label: "Sous-total HT", value: sousTotal.toFixed(2) + " MAD", color: "#E2EAF2" },
                { label: "TVA (" + form.tva + "%)", value: tva.toFixed(2) + " MAD", color: "#64748B" },
                { label: "Timbre fiscal", value: timbre.toFixed(2) + " MAD", color: "#64748B" },
                { label: "TOTAL TTC", value: total.toFixed(2) + " MAD", color: "#F97316", big: true },
              ].map(t => (
                <div key={t.label} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #1E2D3D" }}>
                  <span style={{ fontSize: 13, color: "#64748B" }}>{t.label}</span>
                  <span style={{ fontSize: (t as any).big ? 18 : 13, fontWeight: (t as any).big ? 700 : 400, color: t.color, fontFamily: "monospace" }}>{t.value}</span>
                </div>
              ))}
            </div>

            <div style={{ marginBottom: 16 }}>
              <SignaturePad onSignature={setSignature} />
            </div>
            <button onClick={generatePDF} disabled={loading}
              const allFact = await fetch("/api/factures").then(r => r.json());
              const last = Array.isArray(allFact) ? allFact[0] : null;
              if (!last) return alert("Generez d abord une facture !");
              const res = await fetch("/api/factures/share", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: last.id })
              });
              const data = await res.json();
              const url = window.location.origin + "/doc-public?type=facture&token=" + data.token;
              navigator.clipboard.writeText(url);
              alert("Lien copie ! " + url);
            }} style={{ width: "100%", marginTop: 8, background: "#3B82F6", border: "none", color: "#fff", padding: "12px", borderRadius: 10, cursor: "pointer", fontSize: 14, fontWeight: 700 }}>
              🔗 Partager la derniere facture
            </button>
              {loading ? "Generation..." : "🧾 Générer la Facture PDF"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
