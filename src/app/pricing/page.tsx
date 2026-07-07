import Link from "next/link";

export default function PricingPage() {
  const plans = [
    {
      name: "Starter",
      price: "499",
      currency: "MAD",
      period: "/mois",
      description: "Idéal pour les techniciens indépendants",
      color: "#3B82F6",
      features: [
        "1 utilisateur",
        "5 projets actifs",
        "500 points par projet",
        "Export CSV et Excel",
        "Carte OpenStreetMap",
        "Support email",
      ],
      notIncluded: [
        "Export LandXML",
        "Levé topographique officiel",
        "Multi-utilisateurs",
        "API Access",
      ],
    },
    {
      name: "Professional",
      price: "999",
      currency: "MAD",
      period: "/mois",
      description: "Pour les bureaux d'études topographiques",
      color: "#F97316",
      popular: true,
      features: [
        "5 utilisateurs",
        "Projets illimités",
        "Points illimités",
        "Export CSV, Excel, LandXML",
        "Levé topographique officiel PDF",
        "Carte satellite Esri",
        "Outils carte avancés",
        "Nivellement et polygonale",
        "Calculatrice topographique",
        "Espace client",
        "Support prioritaire",
      ],
      notIncluded: [
        "AI Assist",
        "API Access",
      ],
    },
    {
      name: "Enterprise",
      price: "2499",
      currency: "MAD",
      period: "/mois",
      description: "Pour les grandes entreprises et administrations",
      color: "#A855F7",
      features: [
        "Utilisateurs illimités",
        "Projets illimités",
        "Points illimités",
        "Toutes les fonctionnalités Pro",
        "AI Assist (Gemini)",
        "API Access complète",
        "Domaine personnalisé",
        "Formation incluse",
        "Support dédié 24/7",
        "Sauvegarde automatique",
        "Rapport personnalisé",
      ],
      notIncluded: [],
    },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#0D1117", color: "#E2EAF2", fontFamily: "Arial" }}>
      {/* Header */}
      <div style={{ background: "#161B22", borderBottom: "1px solid #1E2D3D", padding: "0 32px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 60 }}>
        <div style={{ fontSize: 20, fontWeight: 700 }}>Terra<span style={{ color: "#F97316" }}>Maps</span></div>
        <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
          <Link href="/" style={{ color: "#8BACC8", fontSize: 13, textDecoration: "none" }}>Accueil</Link>
          <Link href="/login" style={{ background: "#F97316", color: "#fff", padding: "8px 20px", borderRadius: 8, textDecoration: "none", fontSize: 13, fontWeight: 600 }}>Connexion</Link>
        </div>
      </div>

      <div style={{ padding: "48px 32px", maxWidth: 1100, margin: "0 auto" }}>
        {/* Hero */}
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <span style={{ background: "rgba(249,115,22,0.15)", color: "#F97316", fontSize: 12, fontWeight: 700, padding: "4px 16px", borderRadius: 20, border: "1px solid rgba(249,115,22,0.3)" }}>
            🇲🇦 Plateforme SaaS Topographique Marocaine
          </span>
          <h1 style={{ margin: "20px 0 12px", fontSize: 36, fontWeight: 700, lineHeight: 1.2 }}>
            Tarifs simples et transparents
          </h1>
          <p style={{ color: "#64748B", fontSize: 16, maxWidth: 500, margin: "0 auto" }}>
            Choisissez le plan adapté à votre activité. Sans engagement, sans frais cachés.
          </p>
        </div>

        {/* Plans */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24, marginBottom: 48 }}>
          {plans.map(plan => (
            <div key={plan.name} style={{
              background: "#161B22",
              border: `2px solid ${plan.popular ? plan.color : "#1E2D3D"}`,
              borderRadius: 16,
              padding: 32,
              position: "relative",
              transform: plan.popular ? "scale(1.02)" : "scale(1)",
            }}>
              {plan.popular && (
                <div style={{ position: "absolute", top: -14, left: "50%", transform: "translateX(-50%)", background: "#F97316", color: "#fff", fontSize: 11, fontWeight: 700, padding: "4px 16px", borderRadius: 20, whiteSpace: "nowrap" }}>
                  ⭐ LE PLUS POPULAIRE
                </div>
              )}

              <div style={{ marginBottom: 24 }}>
                <h2 style={{ margin: "0 0 8px", fontSize: 20, fontWeight: 700, color: plan.color }}>{plan.name}</h2>
                <p style={{ margin: "0 0 16px", fontSize: 13, color: "#64748B" }}>{plan.description}</p>
                <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
                  <span style={{ fontSize: 36, fontWeight: 700, color: "#E2EAF2" }}>{plan.price}</span>
                  <span style={{ fontSize: 14, color: "#64748B" }}>{plan.currency}{plan.period}</span>
                </div>
              </div>

              <Link href="/login" style={{
                display: "block", textAlign: "center",
                background: plan.popular ? plan.color : "transparent",
                border: `1px solid ${plan.color}`,
                color: plan.popular ? "#fff" : plan.color,
                padding: "12px", borderRadius: 10,
                textDecoration: "none", fontSize: 14, fontWeight: 600,
                marginBottom: 24,
              }}>
                {plan.name === "Enterprise" ? "Nous contacter" : "Commencer gratuitement"}
              </Link>

              <div style={{ borderTop: "1px solid #1E2D3D", paddingTop: 20 }}>
                <div style={{ fontSize: 11, color: "#64748B", fontWeight: 700, textTransform: "uppercase", marginBottom: 12 }}>Inclus :</div>
                {plan.features.map(f => (
                  <div key={f} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                    <span style={{ color: "#22C55E", fontSize: 14 }}>✓</span>
                    <span style={{ fontSize: 13, color: "#8BACC8" }}>{f}</span>
                  </div>
                ))}
                {plan.notIncluded.map(f => (
                  <div key={f} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                    <span style={{ color: "#4B6080", fontSize: 14 }}>✗</span>
                    <span style={{ fontSize: 13, color: "#4B6080" }}>{f}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* FAQ */}
        <div style={{ background: "#161B22", border: "1px solid #1E2D3D", borderRadius: 16, padding: 32, marginBottom: 32 }}>
          <h2 style={{ margin: "0 0 24px", fontSize: 20, fontWeight: 700, textAlign: "center" }}>Questions fréquentes</h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
            {[
              { q: "Puis-je changer de plan ?", a: "Oui, vous pouvez upgrader ou downgrader à tout moment sans frais supplémentaires." },
              { q: "Y a-t-il une période d'essai ?", a: "Oui, 14 jours d'essai gratuit pour tous les plans sans carte bancaire." },
              { q: "Les données sont-elles sécurisées ?", a: "Oui, vos données sont hébergées sur des serveurs sécurisés avec chiffrement SSL." },
              { q: "Comment contacter le support ?", a: "Par email à support@terramaps.ma ou via le chat intégré dans l'application." },
            ].map(faq => (
              <div key={faq.q} style={{ borderBottom: "1px solid #1E2D3D", paddingBottom: 16 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: "#E2EAF2", marginBottom: 8 }}>❓ {faq.q}</div>
                <div style={{ fontSize: 13, color: "#64748B", lineHeight: 1.6 }}>{faq.a}</div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div style={{ background: "linear-gradient(135deg, #1a1f35, #161B22)", border: "1px solid #F97316", borderRadius: 16, padding: 40, textAlign: "center" }}>
          <h2 style={{ margin: "0 0 12px", fontSize: 24, fontWeight: 700 }}>Prêt à commencer ? 🚀</h2>
          <p style={{ color: "#64748B", marginBottom: 24 }}>Rejoignez les topographes marocains qui utilisent TerraMaps</p>
          <div style={{ display: "flex", gap: 16, justifyContent: "center" }}>
            <Link href="/login" style={{ background: "#F97316", color: "#fff", padding: "14px 32px", borderRadius: 10, textDecoration: "none", fontSize: 15, fontWeight: 700 }}>
              Démarrer gratuitement →
            </Link>
            <a href="mailto:support@terramaps.ma" style={{ background: "transparent", border: "1px solid #1E2D3D", color: "#8BACC8", padding: "14px 32px", borderRadius: 10, textDecoration: "none", fontSize: 15 }}>
              Nous contacter
            </a>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{ background: "#161B22", borderTop: "1px solid #1E2D3D", padding: "24px 32px", textAlign: "center" }}>
        <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Terra<span style={{ color: "#F97316" }}>Maps</span></div>
        <div style={{ fontSize: 12, color: "#64748B" }}>© 2026 TerraMaps — Plateforme SaaS Topographique Marocaine — terramaps.vercel.app</div>
      </div>
    </div>
  );
}
