"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function FinancePage() {
  const [devis, setDevis] = useState<any[]>([]);
  const [factures, setFactures] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState("dashboard");

  async function updateStatutFacture(id: number, statut: string) {
    await fetch("/api/factures", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, statut }) });
    fetch("/api/factures").then(r => r.json()).then(d => { if (Array.isArray(d)) setFactures(d); });
  }

  async function updateStatutDevis(id: number, statut: string) {
    await fetch("/api/devis", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, statut }) });
    fetch("/api/devis").then(r => r.json()).then(d => { if (Array.isArray(d)) setDevis(d); });
  }

  useEffect(() => {
    fetch("/api/devis").then(r => r.json()).then(d => { if (Array.isArray(d)) setDevis(d); });
    fetch("/api/factures").then(r => r.json()).then(d => { if (Array.isArray(d)) setFactures(d); });
  }, []);

  const totalDevis = devis.reduce((s, d) => s + (d.total || 0), 0);
  const totalFactures = factures.reduce((s, f) => s + (f.total || 0), 0);
  const facturesPayees = factures.filter(f => f.statut === "payee");
  const totalPaye = facturesPayees.reduce((s, f) => s + (f.total || 0), 0);

  return (
    <div style={{ minHeight: "100vh", background: "#0D1117", color: "#E2EAF2", fontFamily: "Arial" }}>
      <div style={{ background: "#161B22", borderBottom: "1px solid #1E2D3D", padding: "0 24px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 56 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ fontSize: 18, fontWeight: 700 }}>Terra<span style={{ color: "#F97316" }}>Maps</span></div>
          <span style={{ background: "#22C55E", color: "#fff", fontSize: 10, fontWeight: 700, padding: "2px 10px", borderRadius: 20 }}>FINANCE</span>
        </div>
        <Link href="/dashboard" style={{ color: "#64748B", fontSize: 13, textDecoration: "none" }}>← Dashboard</Link>
      </div>

      <div style={{ padding: 24, maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ fontSize: 48, marginBottom: 8 }}>💰</div>
          <h1 style={{ margin: "0 0 8px", fontSize: 22, fontWeight: 700 }}>Tableau de bord financier</h1>
          <p style={{ color: "#64748B", fontSize: 13 }}>Suivi de vos devis et factures</p>
        </div>

        {/* KPIs */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 32 }}>
          {[
            { label: "Total devis", value: totalDevis.toFixed(2) + " MAD", color: "#3B82F6", icon: "📋", sub: devis.length + " devis" },
            { label: "Total factures", value: totalFactures.toFixed(2) + " MAD", color: "#F97316", icon: "🧾", sub: factures.length + " factures" },
            { label: "Montant payé", value: totalPaye.toFixed(2) + " MAD", color: "#22C55E", icon: "✅", sub: facturesPayees.length + " payees" },
            { label: "En attente", value: (totalFactures - totalPaye).toFixed(2) + " MAD", color: "#EF4444", icon: "⏳", sub: (factures.length - facturesPayees.length) + " impayees" },
          ].map(s => (
            <div key={s.label} style={{ background: "#161B22", border: "1px solid #1E2D3D", borderRadius: 12, padding: 20 }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>{s.icon}</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: s.color, fontFamily: "monospace" }}>{s.value}</div>
              <div style={{ fontSize: 11, color: "#64748B", marginTop: 4, textTransform: "uppercase" }}>{s.label}</div>
              <div style={{ fontSize: 11, color: "#4B6080", marginTop: 2 }}>{s.sub}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
          {[
            { id: "dashboard", label: "📊 Vue globale" },
            { id: "devis", label: "📋 Devis" },
            { id: "factures", label: "🧾 Factures" },
          ].map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              style={{ background: activeTab === t.id ? "#F97316" : "#161B22", border: "1px solid " + (activeTab === t.id ? "#F97316" : "#1E2D3D"), color: "#fff", padding: "8px 20px", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: activeTab === t.id ? 700 : 400 }}>
              {t.label}
            </button>
          ))}
          <div style={{ flex: 1 }} />
          <Link href="/devis" style={{ background: "#3B82F6", color: "#fff", padding: "8px 16px", borderRadius: 8, textDecoration: "none", fontSize: 13, fontWeight: 600 }}>+ Nouveau devis</Link>
          <Link href="/facture" style={{ background: "#22C55E", color: "#fff", padding: "8px 16px", borderRadius: 8, textDecoration: "none", fontSize: 13, fontWeight: 600 }}>+ Nouvelle facture</Link>
        </div>

        {/* Devis list */}
        {(activeTab === "devis" || activeTab === "dashboard") && (
          <div style={{ background: "#161B22", border: "1px solid #1E2D3D", borderRadius: 12, padding: 20, marginBottom: 24 }}>
            <h3 style={{ margin: "0 0 16px", fontSize: 14, color: "#8BACC8" }}>📋 Devis récents</h3>
            {devis.length === 0 ? (
              <div style={{ textAlign: "center", padding: 32, color: "#64748B" }}>Aucun devis généré</div>
            ) : (
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid #1E2D3D" }}>
                    {["N°", "Client", "Projet", "Total", "Statut", "Date"].map(h => (
                      <th key={h} style={{ padding: "8px 10px", color: "#64748B", textAlign: "left", fontSize: 10, textTransform: "uppercase" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {devis.slice(0, activeTab === "dashboard" ? 5 : 100).map((d, i) => (
                    <tr key={i} style={{ borderBottom: "1px solid #0D1117" }}>
                      <td style={{ padding: "8px 10px", color: "#F97316", fontWeight: 600 }}>{d.numero}</td>
                      <td style={{ padding: "8px 10px", color: "#E2EAF2" }}>{d.client || "—"}</td>
                      <td style={{ padding: "8px 10px", color: "#8BACC8" }}>{d.projet || "—"}</td>
                      <td style={{ padding: "8px 10px", color: "#22C55E", fontFamily: "monospace", fontWeight: 700 }}>{(d.total || 0).toFixed(2)} MAD</td>
                      <td style={{ padding: "8px 10px" }}>
                        <span style={{ background: d.statut === "accepte" ? "#22C55E22" : "#F9731622", color: d.statut === "accepte" ? "#22C55E" : "#F97316", fontSize: 10, padding: "2px 8px", borderRadius: 20 }}>
                          {d.statut === "en_attente" ? "En attente" : d.statut === "accepte" ? "Accepté" : d.statut}
                        </span>
                      </td>
                      <td style={{ padding: "8px 10px", color: "#64748B" }}>{d.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Factures list */}
        {(activeTab === "factures" || activeTab === "dashboard") && (
          <div style={{ background: "#161B22", border: "1px solid #1E2D3D", borderRadius: 12, padding: 20 }}>
            <h3 style={{ margin: "0 0 16px", fontSize: 14, color: "#8BACC8" }}>🧾 Factures récentes</h3>
            {factures.length === 0 ? (
              <div style={{ textAlign: "center", padding: 32, color: "#64748B" }}>Aucune facture générée</div>
            ) : (
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid #1E2D3D" }}>
                    {["N°", "Client", "Projet", "Total", "Statut", "Date"].map(h => (
                      <th key={h} style={{ padding: "8px 10px", color: "#64748B", textAlign: "left", fontSize: 10, textTransform: "uppercase" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {factures.slice(0, activeTab === "dashboard" ? 5 : 100).map((f, i) => (
                    <tr key={i} style={{ borderBottom: "1px solid #0D1117" }}>
                      <td style={{ padding: "8px 10px", color: "#22C55E", fontWeight: 600 }}>{f.numero}</td>
                      <td style={{ padding: "8px 10px", color: "#E2EAF2" }}>{f.client || "—"}</td>
                      <td style={{ padding: "8px 10px", color: "#8BACC8" }}>{f.projet || "—"}</td>
                      <td style={{ padding: "8px 10px", color: "#F97316", fontFamily: "monospace", fontWeight: 700 }}>{(f.total || 0).toFixed(2)} MAD</td>
                      <td style={{ padding: "8px 10px" }}>
                        <span style={{ background: f.statut === "payee" ? "#22C55E22" : "#EF444422", color: f.statut === "payee" ? "#22C55E" : "#EF4444", fontSize: 10, padding: "2px 8px", borderRadius: 20 }}>
                          {f.statut === "payee" ? "Payée" : "Non payée"}
                        </span>
                      </td>
                      <td style={{ padding: "8px 10px", color: "#64748B" }}>{f.date}</td>
                      <td style={{ padding: "8px 10px" }}>
                        <button onClick={() => updateStatutFacture(f.id, f.statut === "payee" ? "non_payee" : "payee")}
                          style={{ background: f.statut === "payee" ? "#22C55E22" : "#EF444422", color: f.statut === "payee" ? "#22C55E" : "#EF4444", border: "none", padding: "4px 10px", borderRadius: 6, cursor: "pointer", fontSize: 11, fontWeight: 600 }}>
                          {f.statut === "payee" ? "Payee" : "Marquer payee"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
