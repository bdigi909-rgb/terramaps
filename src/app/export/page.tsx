"use client";
import { useState } from "react";
import AppShell from "@/components/AppShell";
import Header from "@/components/Header";

export default function ExportPage() {
  const [loading, setLoading] = useState<string>("");
  const [done, setDone] = useState<string>("");

  async function exportData(type: string) {
    setLoading(type);
    setDone("");
    let data: any = {};
    let filename = "";

    if (type === "all") {
      const [proj, devis, fact, msgs] = await Promise.all([
        fetch("/api/projects").then(r => r.json()),
        fetch("/api/devis").then(r => r.json()),
        fetch("/api/factures").then(r => r.json()),
        fetch("/api/messages").then(r => r.json()),
      ]);
      data = { exported: new Date().toISOString(), projects: proj, devis, factures: fact, messages: msgs };
      filename = "terramaps_backup_complet.json";
    } else if (type === "projects") {
      data = await fetch("/api/projects").then(r => r.json());
      filename = "terramaps_projets.json";
    } else if (type === "devis") {
      data = await fetch("/api/devis").then(r => r.json());
      filename = "terramaps_devis.json";
    } else if (type === "factures") {
      data = await fetch("/api/factures").then(r => r.json());
      filename = "terramaps_factures.json";
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    setLoading("");
    setDone(type);
    setTimeout(() => setDone(""), 3000);
  }

  const exports = [
    { id: "all", icon: "📦", label: "Backup complet", desc: "Tous les projets, devis, factures et messages", color: "#F97316" },
    { id: "projects", icon: "📁", label: "Projets", desc: "Export de tous vos projets TerraMaps", color: "#3B82F6" },
    { id: "devis", icon: "📋", label: "Devis", desc: "Export de tous vos devis PDF", color: "#22C55E" },
    { id: "factures", icon: "🧾", label: "Factures", desc: "Export de toutes vos factures", color: "#A855F7" },
  ];

  return (
    <AppShell>
      <Header title="Export & Backup" subtitle="Téléchargez vos données TerraMaps" />
      <div style={{ padding: 32, maxWidth: 800, margin: "0 auto" }}>
        <div style={{ background: "rgba(249,115,22,0.1)", border: "1px solid rgba(249,115,22,0.3)", borderRadius: 12, padding: 16, marginBottom: 32, display: "flex", gap: 12, alignItems: "center" }}>
          <div style={{ fontSize: 24 }}>💡</div>
          <div style={{ fontSize: 13, color: "#8BACC8" }}>Les exports sont en format JSON — sauvegardez-les régulièrement pour protéger vos données.</div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16 }}>
          {exports.map(e => (
            <div key={e.id} style={{ background: "#161B22", border: `1px solid ${done === e.id ? "#22C55E" : "#1E2D3D"}`, borderRadius: 12, padding: 24 }}>
              <div style={{ fontSize: 36, marginBottom: 12 }}>{e.icon}</div>
              <h3 style={{ margin: "0 0 6px", fontSize: 16, fontWeight: 700, color: e.color }}>{e.label}</h3>
              <p style={{ margin: "0 0 20px", fontSize: 13, color: "#64748B" }}>{e.desc}</p>
              <button onClick={() => exportData(e.id)} disabled={loading === e.id}
                style={{ width: "100%", background: done === e.id ? "#22C55E" : e.color, border: "none", borderRadius: 8, padding: "10px", color: "#fff", fontSize: 13, fontWeight: 600, cursor: loading === e.id ? "not-allowed" : "pointer", opacity: loading === e.id ? 0.7 : 1 }}>
                {done === e.id ? "✅ Téléchargé !" : loading === e.id ? "Exportation..." : "⬇️ Télécharger"}
              </button>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
