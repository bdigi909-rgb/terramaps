import Link from "next/link";

export default function HomePage() {
  return (
    <div style={{ minHeight: "100vh", background: "#0D1117", color: "#E2EAF2", fontFamily: "Arial" }}>
      {/* Navbar */}
      <nav style={{ background: "rgba(22,27,34,0.95)", backdropFilter: "blur(10px)", borderBottom: "1px solid #1E2D3D", padding: "0 32px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 64, position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ fontSize: 22, fontWeight: 700 }}>Terra<span style={{ color: "#F97316" }}>Maps</span></div>
        <div style={{ display: "flex", gap: 24, alignItems: "center" }}>
          <Link href="#features" style={{ color: "#8BACC8", fontSize: 14, textDecoration: "none" }}>Fonctionnalités</Link>
          <Link href="#pricing" style={{ color: "#8BACC8", fontSize: 14, textDecoration: "none" }}>Tarifs</Link>
          <Link href="/login" style={{ color: "#8BACC8", fontSize: 14, textDecoration: "none" }}>Connexion</Link>
          <Link href="/status" style={{ color: "#22C55E", fontSize: 14, textDecoration: "none" }}>🟢 Status</Link>
          <Link href="/login" style={{ background: "#F97316", color: "#fff", padding: "9px 22px", borderRadius: 8, textDecoration: "none", fontSize: 14, fontWeight: 600 }}>Démarrer →</Link>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ padding: "100px 32px", textAlign: "center", maxWidth: 900, margin: "0 auto" }}>
        <div style={{ display: "inline-block", background: "rgba(249,115,22,0.1)", border: "1px solid rgba(249,115,22,0.3)", color: "#F97316", fontSize: 12, fontWeight: 700, padding: "5px 16px", borderRadius: 20, marginBottom: 24 }}>
          🇲🇦 Plateforme SaaS Topographique Marocaine
        </div>
        <h1 style={{ fontSize: 52, fontWeight: 800, margin: "0 0 24px", lineHeight: 1.15 }}>
          La topographie marocaine<br />
          <span style={{ color: "#F97316" }}>réinventée</span>
        </h1>
        <p style={{ fontSize: 18, color: "#8BACC8", maxWidth: 600, margin: "0 auto 40px", lineHeight: 1.7 }}>
          Plateforme professionnelle de topographie, cartographie et conception routière — compatible Covadis & LandXML. Levés officiels, devis, factures et planning en un seul outil.
        </p>
        <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/login" style={{ background: "#F97316", color: "#fff", padding: "14px 32px", borderRadius: 10, textDecoration: "none", fontSize: 16, fontWeight: 700, maxWidth: 320, textAlign: "center" as any, width: "100%", boxSizing: "border-box" as any }}>
            🚀 Démarrer gratuitement
          </Link>
          <Link href="/help" style={{ background: "transparent", color: "#E2EAF2", padding: "14px 32px", borderRadius: 10, textDecoration: "none", fontSize: 16, fontWeight: 600, border: "1px solid #1E2D3D", maxWidth: 320, textAlign: "center" as any, width: "100%", boxSizing: "border-box" as any }}>
            📖 Voir les fonctionnalités
          </Link>
        </div>
      </section>

      {/* Stats */}
      <section style={{ padding: "40px 32px", borderTop: "1px solid #1E2D3D", borderBottom: "1px solid #1E2D3D" }}>
        <div style={{ display: "flex", justifyContent: "center", gap: 64, flexWrap: "wrap", maxWidth: 800, margin: "0 auto" }}>
          {[
            { value: "50+", label: "Fonctionnalités" },
            { value: "DXF/PDF", label: "Exports compatibles" },
            { value: "100%", label: "Made in Morocco" },
            { value: "24/7", label: "Disponible en ligne" },
          ].map(s => (
            <div key={s.label} style={{ textAlign: "center" }}>
              <div style={{ fontSize: 36, fontWeight: 800, color: "#F97316" }}>{s.value}</div>
              <div style={{ fontSize: 13, color: "#64748B", marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" style={{ padding: "80px 32px", maxWidth: 1100, margin: "0 auto" }}>
        <h2 style={{ textAlign: "center", fontSize: 36, fontWeight: 700, marginBottom: 16 }}>Tout ce dont vous avez besoin</h2>
        <p style={{ textAlign: "center", color: "#64748B", marginBottom: 56, fontSize: 16 }}>Une plateforme complète pour les topographes marocains</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 24 }}>
          {[
            { icon: "📍", title: "Import & Export", desc: "CSV, GSI Leica, LandXML, DXF AutoCAD, Excel — tous les formats supportés" },
            { icon: "🗺️", title: "Carte OpenStreetMap", desc: "Visualisez vos points sur carte OSM réelle avec conversion Lambert Maroc précise" },
            { icon: "📄", title: "Levé Officiel PDF", desc: "Document officiel Royaume du Maroc avec carte, tableau, superficie et signature" },
            { icon: "📐", title: "Calculs Topographiques", desc: "Nivellement, polygonale Bowditch, calculatrice, volumes de terrassement" },
            { icon: "💰", title: "Devis & Factures", desc: "Générez des devis et factures PDF professionnels avec vos infos société" },
            { icon: "📅", title: "Planning Missions", desc: "Calendrier des missions terrain avec assignation des techniciens" },
            { icon: "🔐", title: "Multi-utilisateurs", desc: "Rôles Admin, Manager, Agent avec gestion des permissions et activité" },
            { icon: "🏷️", title: "Grille tarifaire", desc: "Configurez vos tarifs et importez-les directement dans vos devis" },
            { icon: "📱", title: "PWA Mobile", desc: "Installez TerraMaps sur votre téléphone comme une vraie application" },
          ].map(f => (
            <div key={f.title} style={{ background: "#161B22", border: "1px solid #1E2D3D", borderRadius: 12, padding: 24 }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>{f.icon}</div>
              <h3 style={{ margin: "0 0 8px", fontSize: 16, fontWeight: 700 }}>{f.title}</h3>
              <p style={{ margin: 0, color: "#64748B", fontSize: 13, lineHeight: 1.6 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" style={{ padding: "80px 32px", background: "#111827" }}>
        <h2 style={{ textAlign: "center", fontSize: 36, fontWeight: 700, marginBottom: 16 }}>Tarifs simples et transparents</h2>
        <p style={{ textAlign: "center", color: "#64748B", marginBottom: 56, fontSize: 16 }}>Choisissez le plan qui correspond à votre cabinet</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 24, maxWidth: 900, margin: "0 auto" }}>
          {[
            { plan: "Starter", prix: "Gratuit", desc: "Pour découvrir TerraMaps", features: ["1 projet", "Import CSV/GSI", "Carte OSM", "Export PDF"], color: "#64748B" },
            { plan: "Pro", prix: "499 MAD/mois", desc: "Pour les topographes indépendants", features: ["Projets illimités", "Devis & Factures", "Planning missions", "Support prioritaire"], color: "#F97316", popular: true },
            { plan: "Cabinet", prix: "999 MAD/mois", desc: "Pour les bureaux d'études", features: ["Multi-utilisateurs", "Gestion des rôles", "Statistiques avancées", "Formation incluse"], color: "#3B82F6" },
          ].map(p => (
            <div key={p.plan} style={{ background: "#161B22", border: `2px solid ${p.popular ? "#F97316" : "#1E2D3D"}`, borderRadius: 16, padding: 28, position: "relative" }}>
              {p.popular && <div style={{ position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)", background: "#F97316", color: "#fff", fontSize: 11, fontWeight: 700, padding: "3px 16px", borderRadius: 20 }}>⭐ POPULAIRE</div>}
              <h3 style={{ margin: "0 0 8px", fontSize: 20, fontWeight: 700, color: (p as any).color }}>{p.plan}</h3>
              <div style={{ fontSize: 28, fontWeight: 800, margin: "12px 0 8px", color: "#E2EAF2" }}>{p.prix}</div>
              <p style={{ color: "#64748B", fontSize: 13, marginBottom: 20 }}>{p.desc}</p>
              <ul style={{ listStyle: "none", padding: 0, margin: "0 0 24px" }}>
                {p.features.map(f => (
                  <li key={f} style={{ padding: "6px 0", fontSize: 13, color: "#8BACC8", display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ color: "#22C55E" }}>✓</span> {f}
                  </li>
                ))}
              </ul>
              <Link href="/login" style={{ display: "block", textAlign: "center", background: (p as any).popular ? "#F97316" : "transparent", color: (p as any).popular ? "#fff" : "#E2EAF2", padding: "12px", borderRadius: 8, textDecoration: "none", fontWeight: 600, border: (p as any).popular ? "none" : "1px solid #1E2D3D" }}>
                Commencer →
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}

      {/* Témoignages */}
      <section style={{ padding: "80px 32px", maxWidth: 1100, margin: "0 auto" }}>
        <h2 style={{ textAlign: "center", fontSize: 36, fontWeight: 700, marginBottom: 16 }}>Ce que disent nos clients</h2>
        <p style={{ textAlign: "center", color: "#64748B", marginBottom: 56, fontSize: 16 }}>Topographes marocains qui utilisent TerraMaps</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 24 }}>
          {[
            { nom: "Ahmed Benali", ville: "Casablanca", role: "Topographe indépendant", avis: "TerraMaps m a permis de générer des levés officiels en 5 minutes. Le PDF Royaume du Maroc est parfait pour mes clients.", stars: 5 },
            { nom: "Fatima Zahra", ville: "Rabat", role: "Bureau d études", avis: "La facturation intégrée est excellente. Je génère mes devis et factures directement depuis la plateforme.", stars: 5 },
            { nom: "Youssef Alami", ville: "Béni Mellal", role: "Géomètre expert", avis: "L export DXF compatible AutoCAD et le chat équipe ont révolutionné notre workflow terrain.", stars: 5 },
          ].map(t => (
            <div key={t.nom} style={{ background: "#161B22", border: "1px solid #1E2D3D", borderRadius: 12, padding: 24 }}>
              <div style={{ color: "#F59E0B", fontSize: 18, marginBottom: 12 }}>{"★".repeat(t.stars)}</div>
              <p style={{ color: "#8BACC8", fontSize: 13, lineHeight: 1.7, marginBottom: 16 }}>"{t.avis}"</p>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: "50%", background: "#F97316", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 700, color: "#fff" }}>
                  {t.nom.charAt(0)}
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#E2EAF2" }}>{t.nom}</div>
                  <div style={{ fontSize: 11, color: "#64748B" }}>{t.role} — {t.ville}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section style={{ padding: "80px 32px", textAlign: "center" }}>
        <h2 style={{ fontSize: 36, fontWeight: 700, marginBottom: 16 }}>Prêt à moderniser votre cabinet ?</h2>
        <p style={{ color: "#64748B", fontSize: 16, marginBottom: 40 }}>Rejoignez les topographes marocains qui utilisent TerraMaps</p>
        <Link href="/login" style={{ background: "#F97316", color: "#fff", padding: "16px 48px", borderRadius: 12, textDecoration: "none", fontSize: 18, fontWeight: 700 }}>
          🚀 Commencer maintenant — Gratuit
        </Link>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: "1px solid #1E2D3D", padding: "32px", textAlign: "center", color: "#64748B", fontSize: 13 }}>
        <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Terra<span style={{ color: "#F97316" }}>Maps</span></div>
        <p style={{ margin: "0 0 16px" }}>Plateforme SaaS Topographique Marocaine</p>
        <div style={{ display: "flex", gap: 24, justifyContent: "center", marginBottom: 16 }}>
          <Link href="/help" style={{ color: "#64748B", textDecoration: "none" }}>Aide</Link>
          <Link href="/pricing" style={{ color: "#64748B", textDecoration: "none" }}>Tarifs</Link>
          <Link href="/login" style={{ color: "#64748B", textDecoration: "none" }}>Connexion</Link>
        </div>
        <p style={{ margin: 0 }}>© 2026 TerraMaps — terramaps.vercel.app</p>
      </footer>
    </div>
  );
}
