"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [settings, setSettings] = useState({
    societeNom: "",
    societeAdresse: "",
    societeTel: "",
    societeEmail: "",
    societeVille: "",
    societeRC: "",
    societeIF: "",
    societeICE: "",
  });

  function save() {
    localStorage.setItem("tm_settings", JSON.stringify(settings));
    localStorage.setItem("tm_onboarding_done", "true");
    router.push("/dashboard");
  }

  return (
    <div style={{ minHeight: "100vh", background: "#0D1117", color: "#E2EAF2", fontFamily: "Arial", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ maxWidth: 600, width: "100%", padding: 32 }}>
        
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{ fontSize: 32, fontWeight: 700, marginBottom: 8 }}>Terra<span style={{ color: "#F97316" }}>Maps</span></div>
          <p style={{ color: "#64748B" }}>Configurez votre cabinet topographique</p>
        </div>

        {/* Steps */}
        <div style={{ display: "flex", gap: 8, marginBottom: 32, justifyContent: "center" }}>
          {[1, 2, 3].map(s => (
            <div key={s} style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 32, height: 32, borderRadius: "50%", background: step >= s ? "#F97316" : "#1E2D3D", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: step >= s ? "#fff" : "#64748B" }}>
                {step > s ? "✓" : s}
              </div>
              {s < 3 && <div style={{ width: 40, height: 2, background: step > s ? "#F97316" : "#1E2D3D" }} />}
            </div>
          ))}
        </div>

        {/* Step 1 — Infos générales */}
        {step === 1 && (
          <div style={{ background: "#161B22", border: "1px solid #1E2D3D", borderRadius: 16, padding: 32 }}>
            <h2 style={{ margin: "0 0 8px", fontSize: 20, fontWeight: 700 }}>🏢 Votre cabinet</h2>
            <p style={{ color: "#64748B", marginBottom: 24, fontSize: 13 }}>Informations générales de votre bureau d études topographiques</p>
            {[
              { key: "societeNom", label: "Nom du cabinet / société", placeholder: "Bureau Topo Béni Mellal..." },
              { key: "societeAdresse", label: "Adresse", placeholder: "123 Rue Mohammed V..." },
              { key: "societeVille", label: "Ville", placeholder: "Béni Mellal..." },
              { key: "societeTel", label: "Téléphone", placeholder: "+212 6XX XXX XXX" },
              { key: "societeEmail", label: "Email professionnel", placeholder: "contact@cabinet-topo.ma" },
            ].map(f => (
              <div key={f.key} style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 11, color: "#64748B", display: "block", marginBottom: 4, textTransform: "uppercase" }}>{f.label}</label>
                <input value={(settings as any)[f.key]} onChange={e => setSettings(p => ({ ...p, [f.key]: e.target.value }))}
                  placeholder={f.placeholder}
                  style={{ width: "100%", background: "#0D1117", border: "1px solid #1E2D3D", borderRadius: 8, padding: "10px 14px", color: "#fff", fontSize: 13, boxSizing: "border-box" }} />
              </div>
            ))}
            <button onClick={() => setStep(2)} disabled={!settings.societeNom}
              style={{ width: "100%", background: settings.societeNom ? "#F97316" : "#1E2D3D", border: "none", color: "#fff", padding: "14px", borderRadius: 10, cursor: settings.societeNom ? "pointer" : "not-allowed", fontSize: 15, fontWeight: 700, marginTop: 8 }}>
              Suivant →
            </button>
          </div>
        )}

        {/* Step 2 — Infos fiscales */}
        {step === 2 && (
          <div style={{ background: "#161B22", border: "1px solid #1E2D3D", borderRadius: 16, padding: 32 }}>
            <h2 style={{ margin: "0 0 8px", fontSize: 20, fontWeight: 700 }}>📋 Informations fiscales</h2>
            <p style={{ color: "#64748B", marginBottom: 24, fontSize: 13 }}>Ces informations apparaîtront sur vos devis et factures</p>
            {[
              { key: "societeRC", label: "Registre de Commerce (RC)", placeholder: "RC 12345..." },
              { key: "societeIF", label: "Identifiant Fiscal (IF)", placeholder: "IF 12345678..." },
              { key: "societeICE", label: "ICE", placeholder: "001234567890123..." },
            ].map(f => (
              <div key={f.key} style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 11, color: "#64748B", display: "block", marginBottom: 4, textTransform: "uppercase" }}>{f.label}</label>
                <input value={(settings as any)[f.key]} onChange={e => setSettings(p => ({ ...p, [f.key]: e.target.value }))}
                  placeholder={f.placeholder}
                  style={{ width: "100%", background: "#0D1117", border: "1px solid #1E2D3D", borderRadius: 8, padding: "10px 14px", color: "#fff", fontSize: 13, boxSizing: "border-box" }} />
              </div>
            ))}
            <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
              <button onClick={() => setStep(1)} style={{ flex: 1, background: "transparent", border: "1px solid #1E2D3D", color: "#64748B", padding: "14px", borderRadius: 10, cursor: "pointer", fontSize: 14 }}>
                ← Retour
              </button>
              <button onClick={() => setStep(3)} style={{ flex: 2, background: "#F97316", border: "none", color: "#fff", padding: "14px", borderRadius: 10, cursor: "pointer", fontSize: 15, fontWeight: 700 }}>
                Suivant →
              </button>
            </div>
          </div>
        )}

        {/* Step 3 — Confirmation */}
        {step === 3 && (
          <div style={{ background: "#161B22", border: "1px solid #1E2D3D", borderRadius: 16, padding: 32, textAlign: "center" }}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>🎉</div>
            <h2 style={{ margin: "0 0 8px", fontSize: 24, fontWeight: 700 }}>Tout est prêt !</h2>
            <p style={{ color: "#64748B", marginBottom: 32 }}>Votre cabinet <strong style={{ color: "#F97316" }}>{settings.societeNom}</strong> est configuré.</p>
            
            <div style={{ background: "#0D1117", borderRadius: 12, padding: 20, marginBottom: 24, textAlign: "left" }}>
              {[
                { label: "Cabinet", value: settings.societeNom },
                { label: "Ville", value: settings.societeVille },
                { label: "Tel", value: settings.societeTel },
                { label: "RC", value: settings.societeRC || "—" },
              ].map(item => (
                <div key={item.label} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid #1E2D3D" }}>
                  <span style={{ fontSize: 12, color: "#64748B" }}>{item.label}</span>
                  <span style={{ fontSize: 12, color: "#F97316", fontWeight: 600 }}>{item.value}</span>
                </div>
              ))}
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setStep(2)} style={{ flex: 1, background: "transparent", border: "1px solid #1E2D3D", color: "#64748B", padding: "14px", borderRadius: 10, cursor: "pointer", fontSize: 14 }}>
                ← Modifier
              </button>
              <button onClick={save} style={{ flex: 2, background: "#22C55E", border: "none", color: "#fff", padding: "14px", borderRadius: 10, cursor: "pointer", fontSize: 15, fontWeight: 700 }}>
                🚀 Accéder à TerraMaps
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
