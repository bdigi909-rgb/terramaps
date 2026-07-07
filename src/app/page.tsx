import Link from "next/link";

export default function HomePage() {
  return (
    <div style={{ minHeight: "100vh", background: "#0D1117", color: "#E2EAF2", fontFamily: "Arial" }}>
      
      {/* Navbar */}
      <nav style={{ background: "rgba(22,27,34,0.95)", backdropFilter: "blur(10px)", borderBottom: "1px solid #1E2D3D", padding: "0 32px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 64, position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ fontSize: 22, fontWeight: 700 }}>Terra<span style={{ color: "#F97316" }}>Maps</span></div>
        <div style={{ display: "flex", gap: 32, alignItems: "center" }}>
          <Link href="/help" style={{ color: "#8BACC8", fontSize: 14, textDecoration: "none" }}>Fonctionnalités</Link>
          <Link href="/pricing" style={{ color: "#8BACC8", fontSize: 14, textDecoration: "none" }}>Tarifs</Link>
          <Link href="/login" style={{ color: "#8BACC8", fontSize: 14, textDecoration: "none" }}>Connexion</Link>
          <Link href="/login" style={{ background: "#F97316", color: "#fff", padding: "9px 22px", borderRadius: 8, textDecoration: "none", fontSize: 14, fontWeight: 600 }}>Démarrer →</Link>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ padding: "80px 32px", textAlign: "center", maxWidth: 900, margin: "0 auto" }}>
        <div style={{ display: "inline-block", background: "rgba(249,115,22,0.1)", border: "1px solid rgba(249,115,22,0.3)", color: "#F97316", fontSize: 12, fontWeight: 700, padding: "5px 16px", borderRadius: 20, marginBottom: 24 }}>
          🇲🇦 Plateforme SaaS Topographique — Made in Morocco
        </div>
        <h1 style={{ margin: "0 0 20px", fontSize: 52, fontWeight: 700, lineHeight: 1.1, color: "#E2EAF2" }}>
          La topographie marocaine<br />
          <span style={{ color: "#F97316" }}>réinventée</span>
        </h1>
        <p style={{ fontSize: 18, color: "#64748B", maxWidth: 600, margin: "0 auto 40px", lineHeight: 1.7 }}>
          TerraMaps remplace Excel et AutoCAD pour les topographes marocains. Importez vos points, calculez les volumes, générez les levés officiels — en quelques clics.
        </p>
        <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/login" style={{ background: "#F97316", color: "#fff", padding: "16px 36px", borderRadius: 10, textDecoration: "none", fontSize: 16, fontWeight: 700, boxShadow: "0 4px 20px rgba(249,115,22,0.3)" }}>
            Essayer gratuitement 14 jours →
          </Link>
          <Link href="/pricing" style={{ background: "transparent", border: "1px solid #1E2D3D", color: "#8BACC8", padding: "16px 36px", borderRadius: 10, textDecoration: "none", fontSize: 16 }}>
            Voir les tarifs
          </Link>
        </div>
        <div style={{ marginTop: 20, fontSize: 12, color: "#4B6080" }}>
          ✅ Sans carte bancaire &nbsp;•&nbsp; ✅ Sans engagement &nbsp;•&nbsp; ✅ Support en français et arabe
        </div>
      </section>

      {/* Stats */}
      <section style={{ background: "#161B22", borderTop: "1px solid #1E2D3D", borderBottom: "1px solid #1E2D3D", padding: "40px 32px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 32, textAlign: "center" }}>
          {[
            { value: "35+", label: "Fonctionnalités", icon: "⚡" },
            { value: "100%", label: "Compatible Maroc", icon: "🇲🇦" },
            { value: "EPSG:26191", label: "Lambert Maroc", icon: "📍" },
            { value: "PDF", label: "Levé officiel", icon: "📄" },
          ].map(s => (
            <div key={s.label}>
              <div style={{ fontSize: 28, marginBottom: 4 }}>{s.icon}</div>
              <div style={{ fontSize: 28, fontWeight: 700, color: "#F97316" }}>{s.value}</div>
              <div style={{ fontSize: 12, color: "#64748B", marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section style={{ padding: "80px 32px", maxWidth: 1100, margin: "0 auto" }}>
        <h2 style={{ textAlign: "center", fontSize: 32, fontWeight: 700, marginBottom: 48 }}>
          Tout ce dont un topographe a besoin
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24 }}>
          {[
            { icon: "📍", title: "Import / Export", desc: "Importez CSV, GSI Leica, TXT. Exportez Excel, LandXML, DXF.", color: "#F97316" },
            { icon: "🗺️", title: "Carte interactive", desc: "OpenStreetMap + Satellite Esri. Mesure de distance et superficie.", color: "#3B82F6" },
            { icon: "📐", title: "Outils topographiques", desc: "Nivellement, polygonale, calculatrice, profil altimétrique.", color: "#22C55E" },
            { icon: "📄", title: "Levé officiel PDF", desc: "Document officiel Royaume du Maroc avec plan schématique.", color: "#A855F7" },
            { icon: "👥", title: "Multi-utilisateurs", desc: "Admin, Manager, Agent, Client — chaque rôle a son espace.", color: "#F59E0B" },
            { icon: "🤖", title: "AI Assist", desc: "Assistant IA topographique pour répondre à vos questions.", color: "#EF4444" },
          ].map(f => (
            <div key={f.title} style={{ background: "#161B22", border: "1px solid #1E2D3D", borderRadius: 12, padding: 24 }}>
              <div style={{ fontSize: 36, marginBottom: 12 }}>{f.icon}</div>
              <h3 style={{ margin: "0 0 8px", fontSize: 16, fontWeight: 700, color: f.color }}>{f.title}</h3>
              <p style={{ margin: 0, fontSize: 13, color: "#64748B", lineHeight: 1.6 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Workflow */}
      <section style={{ background: "#161B22", borderTop: "1px solid #1E2D3D", borderBottom: "1px solid #1E2D3D", padding: "80px 32px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", textAlign: "center" }}>
          <h2 style={{ fontSize: 32, fontWeight: 700, marginBottom: 48 }}>Comment ça marche ?</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 24 }}>
            {[
              { step: "1", title: "Levé terrain", desc: "Le technicien mesure les points X, Y, Z avec sa station totale", icon: "📡" },
              { step: "2", title: "Import CSV/GSI", desc: "Importez le fichier depuis la station totale en un clic", icon: "⬆️" },
              { step: "3", title: "Traitement", desc: "Calculez volumes, vérifiez la fermeture, générez le rapport", icon: "⚙️" },
              { step: "4", title: "PDF officiel", desc: "Le client reçoit le levé topographique officiel Maroc", icon: "📋" },
            ].map((s, i) => (
              <div key={s.step} style={{ position: "relative" }}>
                <div style={{ width: 48, height: 48, borderRadius: "50%", background: "rgba(249,115,22,0.15)", border: "2px solid #F97316", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, fontWeight: 700, color: "#F97316", margin: "0 auto 16px" }}>
                  {s.step}
                </div>
                <div style={{ fontSize: 28, marginBottom: 8 }}>{s.icon}</div>
                <h3 style={{ margin: "0 0 8px", fontSize: 14, fontWeight: 700 }}>{s.title}</h3>
                <p style={{ margin: 0, fontSize: 12, color: "#64748B", lineHeight: 1.6 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section style={{ padding: "80px 32px", textAlign: "center" }}>
        <div style={{ maxWidth: 600, margin: "0 auto" }}>
          <h2 style={{ fontSize: 32, fontWeight: 700, marginBottom: 16 }}>
            Prêt à moderniser votre cabinet ? 🚀
          </h2>
          <p style={{ color: "#64748B", marginBottom: 32, fontSize: 16 }}>
            Rejoignez les topographes marocains qui ont déjà adopté TerraMaps.
          </p>
          <Link href="/login" style={{ background: "#F97316", color: "#fff", padding: "16px 48px", borderRadius: 10, textDecoration: "none", fontSize: 16, fontWeight: 700, display: "inline-block", boxShadow: "0 4px 20px rgba(249,115,22,0.3)" }}>
            Commencer gratuitement →
          </Link>
          <div style={{ marginTop: 16, fontSize: 13, color: "#4B6080" }}>
            14 jours gratuits • Aucune carte bancaire requise
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ background: "#161B22", borderTop: "1px solid #1E2D3D", padding: "32px", textAlign: "center" }}>
        <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Terra<span style={{ color: "#F97316" }}>Maps</span></div>
        <div style={{ display: "flex", gap: 24, justifyContent: "center", marginBottom: 16 }}>
          <Link href="/pricing" style={{ color: "#64748B", fontSize: 13, textDecoration: "none" }}>Tarifs</Link>
          <Link href="/help" style={{ color: "#64748B", fontSize: 13, textDecoration: "none" }}>Aide</Link>
          <Link href="/login" style={{ color: "#64748B", fontSize: 13, textDecoration: "none" }}>Connexion</Link>
          <a href="mailto:support@terramaps.ma" style={{ color: "#64748B", fontSize: 13, textDecoration: "none" }}>Contact</a>
        </div>
        <div style={{ fontSize: 12, color: "#4B6080" }}>© 2026 TerraMaps — Plateforme SaaS Topographique Marocaine</div>
      </footer>
    </div>
  );
}
