"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function SettingsPage() {
  const [saved, setSaved] = useState(false);
  const [settings, setSettings] = useState({
    societeNom: "",
    societeAdresse: "",
    societeTel: "",
    societeEmail: "",
    societeSite: "terramaps.vercel.app",
    societeRC: "",
    societeIF: "",
    societeICE: "",
    societePatente: "",
    societeVille: "",
    societeLogo: "",
  });

  useEffect(() => {
    const saved = localStorage.getItem("tm_settings");
    if (saved) setSettings(JSON.parse(saved));
  }, []);

  function save() {
    localStorage.setItem("tm_settings", JSON.stringify(settings));
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <div style={{ minHeight: "100vh", background: "#0D1117", color: "#E2EAF2", fontFamily: "Arial" }}>
      <div style={{ background: "#161B22", borderBottom: "1px solid #1E2D3D", padding: "0 24px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 56 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ fontSize: 18, fontWeight: 700 }}>Terra<span style={{ color: "#F97316" }}>Maps</span></div>
          <span style={{ background: "#F97316", color: "#fff", fontSize: 10, fontWeight: 700, padding: "2px 10px", borderRadius: 20 }}>PARAMETRES</span>
        </div>
        <Link href="/dashboard" style={{ color: "#64748B", fontSize: 13, textDecoration: "none" }}>← Dashboard</Link>
      </div>

      <div style={{ padding: 24, maxWidth: 700, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ fontSize: 48, marginBottom: 8 }}>⚙️</div>
          <h1 style={{ margin: "0 0 8px", fontSize: 22, fontWeight: 700 }}>Paramètres de la Société</h1>
          <p style={{ color: "#64748B", fontSize: 13 }}>Ces informations apparaîtront sur tous vos documents PDF</p>
        </div>

        <div style={{ background: "#161B22", border: "1px solid #1E2D3D", borderRadius: 12, padding: 24, marginBottom: 16 }}>
          <h3 style={{ margin: "0 0 16px", fontSize: 14, color: "#F97316", fontWeight: 700 }}>🏢 Informations générales</h3>
          {[
            { key: "societeNom", label: "Nom de la société" },
            { key: "societeAdresse", label: "Adresse" },
            { key: "societeTel", label: "Téléphone" },
            { key: "societeEmail", label: "Email" },
            { key: "societeSite", label: "Site web" },
            { key: "societeVille", label: "Ville" },
          ].map(f => (
            <div key={f.key} style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 11, color: "#64748B", display: "block", marginBottom: 4, textTransform: "uppercase" }}>{f.label}</label>
              <input value={(settings as any)[f.key]} onChange={e => setSettings(p => ({ ...p, [f.key]: e.target.value }))}
                style={{ width: "100%", background: "#0D1117", border: "1px solid #1E2D3D", borderRadius: 8, padding: "8px 12px", color: "#fff", fontSize: 13, boxSizing: "border-box" }} />
            </div>
          ))}
        </div>

        <div style={{ background: "#161B22", border: "1px solid #1E2D3D", borderRadius: 12, padding: 24, marginBottom: 16 }}>
          <h3 style={{ margin: "0 0 16px", fontSize: 14, color: "#3B82F6", fontWeight: 700 }}>📋 Informations fiscales</h3>
          {[
            { key: "societeRC", label: "Registre de Commerce (RC)" },
            { key: "societeIF", label: "Identifiant Fiscal (IF)" },
            { key: "societeICE", label: "ICE" },
            { key: "societePatente", label: "Numéro de Patente" },
          ].map(f => (
            <div key={f.key} style={{ marginBottom: 12 }}>
              <input value={(settings as any)[f.key]} onChange={e => setSettings(p => ({ ...p, [f.key]: e.target.value }))}
                style={{ width: "100%", background: "#0D1117", border: "1px solid #1E2D3D", borderRadius: 8, padding: "8px 12px", color: "#fff", fontSize: 13, boxSizing: "border-box" }} />
            </div>
          ))}
        </div>

        <button onClick={save} style={{ width: "100%", background: saved ? "#22C55E" : "#F97316", border: "none", color: "#fff", padding: "14px", borderRadius: 10, cursor: "pointer", fontSize: 15, fontWeight: 700 }}>
          {saved ? "✅ Paramètres sauvegardés !" : "💾 Sauvegarder"}
        </button>
      </div>
    </div>
  );
}
