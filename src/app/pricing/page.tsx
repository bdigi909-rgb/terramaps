import Link from "next/link";

const plans = [
  {
    name: "Starter",
    price: "499",
    period: "/mois",
    description: "Pour les techniciens independants",
    color: "#3B82F6",
    popular: false,
    features: ["1 utilisateur", "5 projets actifs", "500 points", "Export CSV et Excel", "Carte OpenStreetMap", "Support email"],
    notIncluded: ["Export LandXML", "Leve topographique PDF", "Multi-utilisateurs"],
  },
  {
    name: "Professional",
    price: "999",
    period: "/mois",
    description: "Pour les bureaux d etudes topographiques",
    color: "#F97316",
    popular: true,
    features: ["5 utilisateurs", "Projets illimites", "Points illimites", "Export CSV, Excel, LandXML", "Leve topographique PDF", "Carte satellite Esri", "Outils carte avances", "Nivellement et polygonale", "Calculatrice topographique", "Espace client", "Support prioritaire"],
    notIncluded: ["AI Assist", "API Access"],
  },
  {
    name: "Enterprise",
    price: "2499",
    period: "/mois",
    description: "Pour les grandes entreprises et administrations",
    color: "#A855F7",
    popular: false,
    features: ["Utilisateurs illimites", "Projets illimites", "Points illimites", "Toutes les fonctionnalites Pro", "AI Assist (Gemini)", "API Access", "Domaine personnalise", "Formation incluse", "Support dedie 24/7"],
    notIncluded: [],
  },
];

export default function PricingPage() {
  return (
    <div style={{ minHeight: "100vh", background: "#0D1117", color: "#E2EAF2", fontFamily: "Arial" }}>
      <div style={{ background: "#161B22", borderBottom: "1px solid #1E2D3D", padding: "0 32px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 60 }}>
        <div style={{ fontSize: 20, fontWeight: 700 }}>Terra<span style={{ color: "#F97316" }}>Maps</span></div>
        <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
          <Link href="/" style={{ color: "#8BACC8", fontSize: 13, textDecoration: "none" }}>Accueil</Link>
          <Link href="/login" style={{ background: "#F97316", color: "#fff", padding: "8px 20px", borderRadius: 8, textDecoration: "none", fontSize: 13, fontWeight: 600 }}>Connexion</Link>
        </div>
      </div>

      <div style={{ padding: "48px 32px", maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <h1 style={{ margin: "0 0 12px", fontSize: 36, fontWeight: 700 }}>Tarifs simples et transparents</h1>
          <p style={{ color: "#64748B", fontSize: 16 }}>Sans engagement, sans frais caches.</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24, marginBottom: 48 }}>
          {plans.map(plan => (
            <div key={plan.name} style={{ background: "#161B22", border: "2px solid " + (plan.popular ? plan.color : "#1E2D3D"), borderRadius: 16, padding: 32, position: "relative", transform: plan.popular ? "scale(1.02)" : "scale(1)" }}>
              {plan.popular && (
                <div style={{ position: "absolute", top: -14, left: "50%", transform: "translateX(-50%)", background: "#F97316", color: "#fff", fontSize: 11, fontWeight: 700, padding: "4px 16px", borderRadius: 20, whiteSpace: "nowrap" }}>
                  PLUS POPULAIRE
                </div>
              )}
              <h2 style={{ margin: "0 0 8px", fontSize: 20, fontWeight: 700, color: plan.color }}>{plan.name}</h2>
              <p style={{ margin: "0 0 16px", fontSize: 13, color: "#64748B" }}>{plan.description}</p>
              <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 24 }}>
                <span style={{ fontSize: 36, fontWeight: 700 }}>{plan.price}</span>
                <span style={{ fontSize: 14, color: "#64748B" }}>MAD{plan.period}</span>
              </div>
              <a href={"https://wa.me/212744037160?text=Bonjour%20TerraMaps%2C%20je%20suis%20interesse%20par%20le%20plan%20" + plan.name}
                target="_blank" rel="noopener noreferrer"
                style={{ display: "block", textAlign: "center", background: plan.popular ? plan.color : "transparent", border: "1px solid " + plan.color, color: plan.popular ? "#fff" : plan.color, padding: "12px", borderRadius: 10, textDecoration: "none", fontSize: 14, fontWeight: 600, marginBottom: 24 }}>
                {plan.name === "Enterprise" ? "Nous contacter" : "Commencer"}
              </a>
              <div style={{ borderTop: "1px solid #1E2D3D", paddingTop: 20 }}>
                {plan.features.map(f => (
                  <div key={f} style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                    <span style={{ color: "#22C55E" }}>✓</span>
                    <span style={{ fontSize: 13, color: "#8BACC8" }}>{f}</span>
                  </div>
                ))}
                {plan.notIncluded.map(f => (
                  <div key={f} style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                    <span style={{ color: "#4B6080" }}>✗</span>
                    <span style={{ fontSize: 13, color: "#4B6080" }}>{f}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* FAQ */}
        <div style={{ background: "#161B22", border: "1px solid #1E2D3D", borderRadius: 16, padding: 32, marginBottom: 32 }}>
          <h2 style={{ margin: "0 0 24px", fontSize: 20, fontWeight: 700, textAlign: "center" }}>Questions frequentes</h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
            {[
              { q: "Puis-je changer de plan ?", a: "Oui, vous pouvez upgrader ou downgrader a tout moment sans frais." },
              { q: "Y a-t-il une periode d essai ?", a: "Oui, 14 jours d essai gratuit sans carte bancaire." },
              { q: "Les donnees sont-elles securisees ?", a: "Oui, vos donnees sont chiffrees avec SSL." },
              { q: "Comment contacter le support ?", a: "Par WhatsApp au +212 7 44 03 71 60 ou email support@terramaps.ma" },
            ].map(faq => (
              <div key={faq.q} style={{ borderBottom: "1px solid #1E2D3D", paddingBottom: 16 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: "#E2EAF2", marginBottom: 8 }}>❓ {faq.q}</div>
                <div style={{ fontSize: 13, color: "#64748B", lineHeight: 1.6 }}>{faq.a}</div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div style={{ background: "#161B22", border: "1px solid #F97316", borderRadius: 16, padding: 40, textAlign: "center" }}>
          <h2 style={{ margin: "0 0 12px", fontSize: 24, fontWeight: 700 }}>Pret a commencer ?</h2>
          <p style={{ color: "#64748B", marginBottom: 24 }}>Contactez-nous sur WhatsApp pour demarrer</p>
          <div style={{ display: "flex", gap: 16, justifyContent: "center" }}>
            <a href="https://wa.me/212744037160?text=Bonjour%20TerraMaps%2C%20je%20veux%20demarrer" target="_blank" rel="noopener noreferrer"
              style={{ background: "#25D366", color: "#fff", padding: "14px 32px", borderRadius: 10, textDecoration: "none", fontSize: 15, fontWeight: 700 }}>
              WhatsApp →
            </a>
            <a href="mailto:support@terramaps.ma"
              style={{ background: "transparent", border: "1px solid #1E2D3D", color: "#8BACC8", padding: "14px 32px", borderRadius: 10, textDecoration: "none", fontSize: 15 }}>
              Email
            </a>
          </div>
        </div>
      </div>

      <footer style={{ background: "#161B22", borderTop: "1px solid #1E2D3D", padding: "24px 32px", textAlign: "center" }}>
        <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Terra<span style={{ color: "#F97316" }}>Maps</span></div>
        <div style={{ fontSize: 12, color: "#64748B" }}>2026 TerraMaps — Plateforme SaaS Topographique Marocaine</div>
      </footer>
    </div>
  );
}
