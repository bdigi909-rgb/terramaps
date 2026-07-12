"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";

function DocPublicContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const type = searchParams.get("type") || "devis";
  const [doc, setDoc] = useState<any>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    fetch(`/api/${type === "devis" ? "devis" : "factures"}/public?token=${token}`)
      .then(r => r.json())
      .then(d => {
        if (d.error) setError(d.error);
        else setDoc(d);
        setLoading(false);
      });
  }, [token, type]);

  if (loading) return <div style={{ minHeight: "100vh", background: "#0D1117", display: "flex", alignItems: "center", justifyContent: "center", color: "#E2EAF2", fontFamily: "Arial" }}>Chargement...</div>;
  if (error) return (
    <div style={{ minHeight: "100vh", background: "#0D1117", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Arial" }}>
      <div style={{ textAlign: "center", color: "#E2EAF2" }}>
        <div style={{ fontSize: 64, marginBottom: 16 }}>🔒</div>
        <h2>Lien invalide ou expiré</h2>
      </div>
    </div>
  );

  const items = (() => { 
    try { 
      const raw = doc.lignes || doc.items || "[]";
      return typeof raw === "string" ? JSON.parse(raw) : raw;
    } catch { return []; } 
  })();
  const total = items.reduce((s: number, i: any) => s + (parseFloat(i.prixUnit || i.prixUnitaire || 0) * parseFloat(i.quantite || 0) || 0), 0);

  return (
    <div style={{ minHeight: "100vh", background: "#f8f9fa", fontFamily: "Arial", color: "#333" }}>
      <div style={{ background: "#1a2f46", padding: "12px 32px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ color: "#fff", fontWeight: 700, fontSize: 18 }}>Terra<span style={{ color: "#F97316" }}>Maps</span></div>
        <div style={{ color: "#8BACC8", fontSize: 12 }}>{type === "devis" ? "Devis" : "Facture"} — Vue partagée</div>
      </div>
      <div style={{ maxWidth: 800, margin: "32px auto", padding: "0 16px" }}>
        <div style={{ background: "#fff", borderRadius: 12, padding: 32, boxShadow: "0 2px 12px rgba(0,0,0,0.1)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 32 }}>
            <div>
              <h1 style={{ margin: "0 0 8px", fontSize: 24, color: "#1a2f46" }}>{type === "devis" ? "DEVIS" : "FACTURE"}</h1>
              <div style={{ fontSize: 14, color: "#64748B" }}>N° {doc.numero}</div>
              <div style={{ fontSize: 14, color: "#64748B" }}>Date: {doc.date}</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#1a2f46" }}>TerraMaps</div>
              <div style={{ fontSize: 12, color: "#64748B" }}>terramaps.vercel.app</div>
            </div>
          </div>
          <div style={{ background: "#f8f9fa", borderRadius: 8, padding: 16, marginBottom: 24 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#1a2f46", marginBottom: 8 }}>CLIENT</div>
            <div style={{ fontSize: 14 }}>{doc.client}</div>
            {doc.client_adresse && <div style={{ fontSize: 13, color: "#64748B" }}>{doc.client_adresse}</div>}
            {doc.client_email && <div style={{ fontSize: 13, color: "#64748B" }}>{doc.client_email}</div>}
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 24 }}>
            <thead>
              <tr style={{ background: "#1a2f46", color: "#fff" }}>
                {["Description", "Qté", "Prix unit.", "Total"].map(h => (
                  <th key={h} style={{ padding: "10px 12px", textAlign: "left", fontSize: 13 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.map((item: any, i: number) => (
                <tr key={i} style={{ borderBottom: "1px solid #e2e8f0" }}>
                  <td style={{ padding: "10px 12px", fontSize: 13 }}>{item.description}</td>
                  <td style={{ padding: "10px 12px", fontSize: 13 }}>{item.quantite}</td>
                  <td style={{ padding: "10px 12px", fontSize: 13 }}>{parseFloat(item.prixUnit || item.prixUnitaire || 0).toFixed(2)} MAD</td>
                  <td style={{ padding: "10px 12px", fontSize: 13, fontWeight: 600 }}>{(parseFloat(item.prixUnit || item.prixUnitaire || 0) * parseFloat(item.quantite || 0)).toFixed(2)} MAD</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ textAlign: "right", borderTop: "2px solid #1a2f46", paddingTop: 16 }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: "#1a2f46" }}>Total: {total.toFixed(2)} MAD</div>
          </div>
          {doc.notes && <div style={{ marginTop: 24, padding: 16, background: "#f8f9fa", borderRadius: 8, fontSize: 13, color: "#64748B" }}>{doc.notes}</div>}
          <div style={{ textAlign: "center", marginTop: 32, color: "#64748B", fontSize: 12 }}>
            Document généré par TerraMaps v2.0 — terramaps.vercel.app
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DocPublicPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh", background: "#0D1117", display: "flex", alignItems: "center", justifyContent: "center", color: "#E2EAF2" }}>Chargement...</div>}>
      <DocPublicContent />
    </Suspense>
  );
}
