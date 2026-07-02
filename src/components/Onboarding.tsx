"use client";
import { useState, useEffect } from "react";

const steps = [
  {
    title: "Bienvenue sur TerraMaps ! 🗺️",
    description: "Plateforme professionnelle de topographie et cartographie. Voici un guide rapide pour démarrer.",
    icon: "🎉",
    action: null,
  },
  {
    title: "Créez votre premier projet 📁",
    description: "Allez dans 'Projects' et cliquez sur '+ Nouveau Projet' pour créer votre premier projet topographique.",
    icon: "📁",
    action: { label: "Voir Projects", href: "/projects" },
  },
  {
    title: "Importez vos points topo 📍",
    description: "Dans 'Import Points', importez vos fichiers CSV, TXT ou GSI depuis votre station totale.",
    icon: "📍",
    action: { label: "Voir Import", href: "/import" },
  },
  {
    title: "Visualisez sur la carte 🗺️",
    description: "Dans 'Survey Points', sélectionnez votre projet et visualisez vos points sur OpenStreetMap.",
    icon: "🗺️",
    action: { label: "Voir Survey Points", href: "/survey" },
  },
  {
    title: "Exportez vos rapports 📊",
    description: "Dans 'Volumes & Reports', calculez les volumes et exportez en PDF ou Excel.",
    icon: "📊",
    action: { label: "Voir Volumes", href: "/volumes" },
  },
  {
    title: "Vous êtes prêt ! 🚀",
    description: "TerraMaps est à votre disposition. N'hésitez pas à explorer toutes les fonctionnalités !",
    icon: "🚀",
    action: null,
  },
];

export default function Onboarding() {
  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    const done = localStorage.getItem("tm_onboarding_done");
    if (!done) setVisible(true);
  }, []);

  function finish() {
    localStorage.setItem("tm_onboarding_done", "true");
    setVisible(false);
  }

  if (!visible) return null;

  const current = steps[step];
  const isLast = step === steps.length - 1;
  const isFirst = step === 0;

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(4px)" }}>
      <div style={{ background: "#161B22", border: "1px solid #1E2D3D", borderRadius: 20, padding: "40px 36px", width: 480, maxWidth: "90vw", boxShadow: "0 20px 60px rgba(0,0,0,0.5)" }}>
        
        {/* Progress dots */}
        <div style={{ display: "flex", gap: 8, justifyContent: "center", marginBottom: 32 }}>
          {steps.map((_, i) => (
            <div key={i} style={{ width: i === step ? 24 : 8, height: 8, borderRadius: 4, background: i === step ? "#F97316" : i < step ? "#22C55E" : "#1E2D3D", transition: "all 0.3s ease" }} />
          ))}
        </div>

        {/* Icon */}
        <div style={{ textAlign: "center", fontSize: 64, marginBottom: 20 }}>{current.icon}</div>

        {/* Content */}
        <h2 style={{ margin: "0 0 12px", fontSize: 20, fontWeight: 700, color: "#E2EAF2", textAlign: "center" }}>{current.title}</h2>
        <p style={{ margin: "0 0 28px", fontSize: 14, color: "#8BACC8", textAlign: "center", lineHeight: 1.6 }}>{current.description}</p>

        {/* Action button */}
        {current.action && (
          <div style={{ textAlign: "center", marginBottom: 20 }}>
            <a href={current.action.href}
              style={{ display: "inline-block", background: "rgba(249,115,22,0.1)", border: "1px solid rgba(249,115,22,0.3)", color: "#F97316", padding: "8px 20px", borderRadius: 8, textDecoration: "none", fontSize: 13, fontWeight: 600 }}>
              {current.action.label} →
            </a>
          </div>
        )}

        {/* Navigation */}
        <div style={{ display: "flex", gap: 12, justifyContent: "space-between", alignItems: "center" }}>
          <button onClick={() => setStep(s => s - 1)} disabled={isFirst}
            style={{ background: "transparent", border: "1px solid #1E2D3D", color: isFirst ? "#2A3F5F" : "#64748B", padding: "10px 20px", borderRadius: 8, cursor: isFirst ? "not-allowed" : "pointer", fontSize: 13 }}>
            ← Précédent
          </button>

          <button onClick={finish}
            style={{ background: "transparent", border: "none", color: "#4B6080", fontSize: 12, cursor: "pointer" }}>
            Passer
          </button>

          {isLast ? (
            <button onClick={finish}
              style={{ background: "#F97316", border: "none", color: "#fff", padding: "10px 24px", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 600 }}>
              Commencer 🚀
            </button>
          ) : (
            <button onClick={() => setStep(s => s + 1)}
              style={{ background: "#F97316", border: "none", color: "#fff", padding: "10px 24px", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 600 }}>
              Suivant →
            </button>
          )}
        </div>

        {/* Step counter */}
        <div style={{ textAlign: "center", marginTop: 16, fontSize: 11, color: "#4B6080" }}>
          Étape {step + 1} sur {steps.length}
        </div>
      </div>
    </div>
  );
}
