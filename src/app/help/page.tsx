"use client";
import { useState } from "react";
import Link from "next/link";

const tutorials = [
  {
    id: 1,
    title: "Créer un projet",
    description: "Créez votre premier projet topographique en quelques clics",
    icon: "📁",
    color: "#F97316",
    steps: ["Cliquez sur '+ Nouveau Projet'", "Remplissez le nom et le type", "Choisissez le système de coordonnées", "Cliquez sur 'Créer le projet'"],
    animation: "project",
    href: "/projects",
  },
  {
    id: 2,
    title: "Importer des points topo",
    description: "Importez vos fichiers CSV, TXT ou GSI depuis votre station totale",
    icon: "📍",
    color: "#3B82F6",
    steps: ["Allez dans 'Import Points'", "Sélectionnez votre projet", "Choisissez votre fichier CSV/GSI", "Cliquez sur 'Importer les points'"],
    animation: "import",
    href: "/import",
  },
  {
    id: 3,
    title: "Visualiser sur la carte",
    description: "Visualisez vos points topographiques sur OpenStreetMap",
    icon: "🗺️",
    color: "#22C55E",
    steps: ["Allez dans 'Survey Points'", "Sélectionnez votre projet", "Cliquez sur l'onglet 'Carte'", "Zoomez sur vos points"],
    animation: "map",
    href: "/survey",
  },
  {
    id: 4,
    title: "Exporter en PDF",
    description: "Générez des rapports professionnels de volumes de terrassement",
    icon: "📊",
    color: "#A855F7",
    steps: ["Allez dans 'Volumes & Reports'", "Sélectionnez votre projet", "Calculez les volumes", "Cliquez sur 'Exporter PDF'"],
    animation: "pdf",
    href: "/volumes",
  },
  {
    id: 5,
    title: "Exporter en Excel",
    description: "Exportez vos points topographiques en fichier Excel",
    icon: "📈",
    color: "#22C55E",
    steps: ["Allez dans 'Survey Points'", "Sélectionnez votre projet", "Filtrez les points si nécessaire", "Cliquez sur 'Export Excel'"],
    animation: "excel",
    href: "/survey",
  },
  {
    id: 6,
    title: "Gerer les utilisateurs",
    description: "Gerez les roles et permissions de votre equipe",
    icon: "👥",
    color: "#EF4444",
    steps: ["Allez dans Admin", "Cliquez sur Ajouter utilisateur", "Choisissez le role", "Envoyez l invitation"],
    href: "/admin",
  },
  {
    id: 7,
    title: "Canevas de nivellement",
    description: "Calculez les altitudes par nivellement direct et verifiez la fermeture",
    icon: "📐",
    color: "#3B82F6",
    steps: ["Allez dans Nivellement", "Saisissez l altitude de depart", "Entrez les visees VA, VI, VaV", "Verifiez la fermeture", "Exportez en PDF ou CSV"],
    href: "/nivellement",
  },
  {
    id: 8,
    title: "Polygonale et compensation",
    description: "Calculez la fermeture de polygonale et compensez avec Bowditch",
    icon: "🔺",
    color: "#A855F7",
    steps: ["Allez dans Polygonale", "Entrez les gisements en grades", "Entrez les distances", "Verifiez la fermeture 1/3000", "Exportez le rapport PDF"],
    href: "/polygonale",
  },
  {
    id: 9,
    title: "Levé topographique officiel",
    description: "Generez un document PDF officiel Royaume du Maroc avec carte reelle",
    icon: "📄",
    color: "#22C55E",
    steps: ["Allez dans Leve Topo", "Selectionnez votre projet", "Remplissez les infos proprietaire", "Ajoutez les voisins et le cachet", "Dessinez votre signature", "Generez le PDF"],
    href: "/leve-topo",
  },
  {
    id: 10,
    title: "Calculatrice topographique",
    description: "Calculez distances, gisements, coordonnees et superficies",
    icon: "🧮",
    color: "#F59E0B",
    steps: ["Allez dans Calculatrice", "Choisissez Distance et Gisement", "Entrez les coordonnees X Y", "Obtenez distance et gisement", "Utilisez Superficie Gauss pour les parcelles"],
    href: "/calculatrice",
  },
  { id: 11, title: "Gerer les utilisateurs",
    icon: "👥",
    color: "#F97316",
    steps: ["Allez dans 'Admin'", "Cliquez sur '+ Nouvel utilisateur'", "Remplissez les informations", "Choisissez le rôle (Agent/Manager)"],
    animation: "users",
    href: "/admin",
  },
];

function AnimationProject() {
  return (
    <div style={{ position: "relative", width: "100%", height: 220, overflow: "hidden" }}>
      <style>{`
        @keyframes slideIn { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        @keyframes pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.05); } }
        @keyframes fadeInUp { from { transform: translateY(10px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        @keyframes typing { from { width: 0; } to { width: 100%; } }
        @keyframes blink { 50% { opacity: 0; } }
      `}</style>
      <div style={{ background: "#0D1117", borderRadius: 8, padding: 16, height: "100%" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <div style={{ fontSize: 12, color: "#8BACC8", fontWeight: 600 }}>Nouveau Projet</div>
          <div style={{ background: "#F97316", color: "#fff", fontSize: 10, padding: "3px 10px", borderRadius: 6, animation: "pulse 2s infinite" }}>+ Créer</div>
        </div>
        <div style={{ animation: "slideIn 0.5s ease 0.3s both" }}>
          <div style={{ background: "#161B22", borderRadius: 6, padding: 10, marginBottom: 8 }}>
            <div style={{ fontSize: 10, color: "#64748B", marginBottom: 4 }}>Nom du projet</div>
            <div style={{ fontSize: 12, color: "#F97316", overflow: "hidden", whiteSpace: "nowrap", borderRight: "2px solid #F97316", animation: "typing 2s steps(20) 0.8s both" }}>RN9 — Déviation Béni Mellal</div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, animation: "fadeInUp 0.5s ease 1s both" }}>
            <div style={{ background: "#161B22", borderRadius: 6, padding: 8 }}>
              <div style={{ fontSize: 9, color: "#64748B" }}>Type</div>
              <div style={{ fontSize: 11, color: "#E2EAF2" }}>Conception Route</div>
            </div>
            <div style={{ background: "#161B22", borderRadius: 6, padding: 8 }}>
              <div style={{ fontSize: 9, color: "#64748B" }}>EPSG</div>
              <div style={{ fontSize: 11, color: "#E2EAF2" }}>26191 — Maroc</div>
            </div>
          </div>
        </div>
        <div style={{ animation: "fadeInUp 0.5s ease 1.5s both", marginTop: 8 }}>
          <div style={{ background: "#22C55E", color: "#fff", fontSize: 10, padding: "6px", borderRadius: 6, textAlign: "center" }}>✅ Projet créé avec succès !</div>
        </div>
      </div>
    </div>
  );
}

function AnimationImport() {
  return (
    <div style={{ position: "relative", width: "100%", height: 220, overflow: "hidden" }}>
      <style>{`
        @keyframes upload { 0% { transform: translateY(0); } 50% { transform: translateY(-10px); } 100% { transform: translateY(0); } }
        @keyframes progress { from { width: 0; } to { width: 100%; } }
        @keyframes appear { from { opacity: 0; transform: scale(0.8); } to { opacity: 1; transform: scale(1); } }
      `}</style>
      <div style={{ background: "#0D1117", borderRadius: 8, padding: 16, height: "100%" }}>
        <div style={{ border: "2px dashed #F97316", borderRadius: 8, padding: 16, textAlign: "center", marginBottom: 10, animation: "upload 2s ease-in-out infinite" }}>
          <div style={{ fontSize: 28 }}>📄</div>
          <div style={{ fontSize: 11, color: "#F97316", fontWeight: 600 }}>points.csv</div>
          <div style={{ fontSize: 10, color: "#64748B" }}>5 points détectés</div>
        </div>
        <div style={{ background: "#161B22", borderRadius: 6, padding: 8, marginBottom: 8 }}>
          <div style={{ height: 6, background: "#1E2D3D", borderRadius: 3, overflow: "hidden" }}>
            <div style={{ height: "100%", background: "#F97316", borderRadius: 3, animation: "progress 2s ease 0.5s both" }} />
          </div>
        </div>
        <div style={{ animation: "appear 0.5s ease 2.5s both", background: "#22C55E22", border: "1px solid #22C55E44", borderRadius: 6, padding: 8, textAlign: "center" }}>
          <div style={{ fontSize: 10, color: "#22C55E", fontWeight: 600 }}>✅ 5 points importés avec succès !</div>
        </div>
      </div>
    </div>
  );
}

function AnimationMap() {
  return (
    <div style={{ position: "relative", width: "100%", height: 220, overflow: "hidden" }}>
      <style>{`
        @keyframes ping { 0% { transform: scale(1); opacity: 1; } 100% { transform: scale(2.5); opacity: 0; } }
        @keyframes zoomIn { from { transform: scale(0.8); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        @keyframes movePin { 0% { transform: translate(0,0); } 25% { transform: translate(30px,-10px); } 50% { transform: translate(60px,10px); } 75% { transform: translate(90px,-5px); } 100% { transform: translate(120px,5px); } }
      `}</style>
      <div style={{ background: "#1a2f3a", borderRadius: 8, height: "100%", position: "relative", overflow: "hidden", animation: "zoomIn 0.5s ease" }}>
        {/* Fake map grid */}
        {[...Array(6)].map((_, i) => (
          <div key={i} style={{ position: "absolute", left: 0, right: 0, top: `${i * 30}px`, height: 1, background: "rgba(255,255,255,0.05)" }} />
        ))}
        {[...Array(6)].map((_, i) => (
          <div key={i} style={{ position: "absolute", top: 0, bottom: 0, left: `${i * 40}px`, width: 1, background: "rgba(255,255,255,0.05)" }} />
        ))}
        {/* Map points */}
        {[
          { x: 30, y: 40, delay: 0.3 },
          { x: 70, y: 60, delay: 0.6 },
          { x: 110, y: 35, delay: 0.9 },
          { x: 150, y: 70, delay: 1.2 },
          { x: 190, y: 45, delay: 1.5 },
        ].map((pt, i) => (
          <div key={i} style={{ position: "absolute", left: pt.x, top: pt.y, animation: `appear 0.3s ease ${pt.delay}s both` }}>
            <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#F97316", border: "2px solid white", position: "relative" }}>
              <div style={{ position: "absolute", inset: 0, borderRadius: "50%", background: "#F97316", animation: "ping 1.5s ease-out infinite", animationDelay: `${pt.delay}s` }} />
            </div>
          </div>
        ))}
        <div style={{ position: "absolute", bottom: 8, right: 8, background: "rgba(0,0,0,0.6)", borderRadius: 4, padding: "3px 8px", fontSize: 9, color: "#fff" }}>
          © OpenStreetMap
        </div>
      </div>
    </div>
  );
}

function AnimationPDF() {
  return (
    <div style={{ position: "relative", width: "100%", height: 220, overflow: "hidden" }}>
      <style>{`
        @keyframes slideDown { from { transform: translateY(-20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        @keyframes growBar { from { height: 0; } to { height: var(--h); } }
        @keyframes download { 0% { transform: translateY(0); } 50% { transform: translateY(5px); } 100% { transform: translateY(0); } }
      `}</style>
      <div style={{ background: "#0D1117", borderRadius: 8, padding: 12, height: "100%" }}>
        <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
          {[
            { label: "Déblai", value: "12,450 m³", color: "#EF4444", h: 80 },
            { label: "Remblai", value: "8,320 m³", color: "#22C55E", h: 55 },
            { label: "Net", value: "4,130 m³", color: "#3B82F6", h: 30 },
          ].map((s, i) => (
            <div key={i} style={{ flex: 1, animation: `slideDown 0.4s ease ${i * 0.2}s both` }}>
              <div style={{ background: "#161B22", borderRadius: 6, padding: 8, textAlign: "center" }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: s.color }}>{s.value}</div>
                <div style={{ fontSize: 9, color: "#64748B" }}>{s.label}</div>
                <div style={{ height: 40, display: "flex", alignItems: "flex-end", justifyContent: "center", marginTop: 4 }}>
                  <div style={{ width: "60%", background: s.color, borderRadius: 2, animation: `growBar 1s ease ${0.5 + i * 0.2}s both`, height: `${s.h}%` }} />
                </div>
              </div>
            </div>
          ))}
        </div>
        <div style={{ background: "#EF4444", color: "#fff", borderRadius: 6, padding: 8, textAlign: "center", animation: "download 1.5s ease-in-out infinite" }}>
          <div style={{ fontSize: 11, fontWeight: 600 }}>⬇️ Télécharger le rapport PDF</div>
        </div>
      </div>
    </div>
  );
}

function AnimationExcel() {
  return (
    <div style={{ position: "relative", width: "100%", height: 220, overflow: "hidden" }}>
      <div style={{ background: "#0D1117", borderRadius: 8, padding: 12, height: "100%" }}>
        <div style={{ background: "#161B22", borderRadius: 6, overflow: "hidden" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", background: "#1E2D3D" }}>
            {["Nom", "X", "Y", "Z"].map(h => (
              <div key={h} style={{ padding: "6px 8px", fontSize: 9, color: "#64748B", fontWeight: 700, textAlign: "center" }}>{h}</div>
            ))}
          </div>
          {[
            ["PT001", "450000", "340000", "420.5"],
            ["PT002", "450045", "340048", "421.2"],
            ["PT003", "450089", "340098", "422.8"],
          ].map((row, i) => (
            <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", borderBottom: "1px solid #0D1117", animation: `fadeInUp 0.3s ease ${0.3 + i * 0.2}s both` }}>
              {row.map((cell, j) => (
                <div key={j} style={{ padding: "5px 8px", fontSize: 9, color: j === 0 ? "#F97316" : j === 3 ? "#A855F7" : "#E2EAF2", textAlign: "center", fontFamily: "monospace" }}>{cell}</div>
              ))}
            </div>
          ))}
        </div>
        <div style={{ background: "#22C55E", color: "#fff", borderRadius: 6, padding: 8, textAlign: "center", marginTop: 8, animation: "pulse 2s infinite" }}>
          <div style={{ fontSize: 11, fontWeight: 600 }}>📊 Export Excel (.xlsx)</div>
        </div>
      </div>
    </div>
  );
}

function AnimationUsers() {
  return (
    <div style={{ position: "relative", width: "100%", height: 220, overflow: "hidden" }}>
      <div style={{ background: "#0D1117", borderRadius: 8, padding: 12, height: "100%" }}>
        {[
          { name: "Ahmed Benali", role: "Agent", color: "#22C55E", delay: 0.2 },
          { name: "Sara Kadiri", role: "Manager", color: "#3B82F6", delay: 0.5 },
          { name: "Youssef Alami", role: "Agent", color: "#22C55E", delay: 0.8 },
        ].map((u, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, background: "#161B22", borderRadius: 8, padding: "8px 12px", marginBottom: 6, animation: `slideIn 0.4s ease ${u.delay}s both` }}>
            <div style={{ width: 28, height: 28, borderRadius: "50%", background: `${u.color}22`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: u.color }}>
              {u.name.charAt(0)}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: "#E2EAF2" }}>{u.name}</div>
            </div>
            <span style={{ background: `${u.color}22`, color: u.color, fontSize: 9, padding: "2px 8px", borderRadius: 20, fontWeight: 700 }}>{u.role}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

const animations: Record<string, React.FC> = {
  project: AnimationProject,
  import: AnimationImport,
  map: AnimationMap,
  pdf: AnimationPDF,
  excel: AnimationExcel,
  users: AnimationUsers,
};

export default function HelpPage() {
  const [active, setActive] = useState<number | null>(null);

  return (
    <div style={{ minHeight: "100vh", background: "#0D1117", color: "#E2EAF2", fontFamily: "Arial, sans-serif" }}>
      {/* Header */}
      <div style={{ background: "#161B22", borderBottom: "1px solid #1E2D3D", padding: "0 32px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 56 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ fontSize: 18, fontWeight: 700 }}>Terra<span style={{ color: "#F97316" }}>Maps</span></div>
          <span style={{ background: "#3B82F6", color: "#fff", fontSize: 10, fontWeight: 700, padding: "2px 10px", borderRadius: 20 }}>AIDE</span>
        </div>
        <Link href="/dashboard" style={{ color: "#64748B", fontSize: 13, textDecoration: "none" }}>← Dashboard</Link>
      </div>

      <div style={{ padding: "40px 32px", maxWidth: 1100, margin: "0 auto" }}>
        {/* Hero */}
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🗺️</div>
          <h1 style={{ margin: "0 0 12px", fontSize: 28, fontWeight: 700 }}>
            Comment utiliser <span style={{ color: "#F97316" }}>TerraMaps</span> ?
          </h1>
          <p style={{ color: "#64748B", fontSize: 15, maxWidth: 500, margin: "0 auto" }}>
            Guides animés pour maîtriser toutes les fonctionnalités de la plateforme
          </p>
        </div>

        {/* Tutorials grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 24 }}>
          {tutorials.map(tuto => {
            const Anim = tuto.animation ? animations[tuto.animation as keyof typeof animations] : null;
            const isActive = active === tuto.id;
            return (
              <div key={tuto.id}
                style={{ background: "#161B22", border: `1px solid ${isActive ? tuto.color : "#1E2D3D"}`, borderRadius: 16, overflow: "hidden", transition: "border-color 0.3s", cursor: "pointer" }}
                onClick={() => setActive(isActive ? null : tuto.id)}>
                
                {/* Animation zone */}
                <div style={{ padding: 16, background: "#0D1117" }}>
                  <Anim />
                </div>

                {/* Content */}
                <div style={{ padding: 20 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                    <span style={{ fontSize: 24 }}>{tuto.icon}</span>
                    <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#E2EAF2" }}>{tuto.title}</h3>
                  </div>
                  <p style={{ margin: "0 0 16px", fontSize: 12, color: "#64748B", lineHeight: 1.5 }}>{tuto.description}</p>

                  {/* Steps */}
                  {isActive && (
                    <div style={{ marginBottom: 16 }}>
                      {tuto.steps.map((step, i) => (
                        <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 8 }}>
                          <div style={{ width: 20, height: 20, borderRadius: "50%", background: tuto.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: "#fff", flexShrink: 0 }}>
                            {i + 1}
                          </div>
                          <span style={{ fontSize: 12, color: "#8BACC8", lineHeight: 1.5 }}>{step}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <button onClick={(e) => { e.stopPropagation(); setActive(isActive ? null : tuto.id); }}
                      style={{ background: "transparent", border: `1px solid ${tuto.color}`, color: tuto.color, padding: "6px 14px", borderRadius: 6, cursor: "pointer", fontSize: 11, fontWeight: 600 }}>
                      {isActive ? "Fermer ↑" : "Voir les étapes ↓"}
                    </button>
                    <Link href={tuto.href} onClick={e => e.stopPropagation()}
                      style={{ background: tuto.color, color: "#fff", padding: "6px 14px", borderRadius: 6, textDecoration: "none", fontSize: 11, fontWeight: 600 }}>
                      Essayer →
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* FAQ */}
        <div style={{ marginTop: 48, background: "#161B22", border: "1px solid #1E2D3D", borderRadius: 16, padding: 32 }}>
          <h2 style={{ margin: "0 0 24px", fontSize: 18, fontWeight: 700 }}>❓ Questions fréquentes</h2>
          {[
            { q: "Quels formats de fichiers sont supportés ?", a: "TerraMaps supporte CSV, TXT, XYZ, DAT et GSI (format Leica). Les fichiers doivent contenir les colonnes X, Y, Z." },
            { q: "Comment changer mon mot de passe ?", a: "Allez dans 'Mon Profil' depuis le menu latéral. Vous pouvez y modifier votre nom et votre mot de passe." },
            { q: "Comment assigner un projet à un agent ?", a: "Allez dans 'Assignation' depuis le menu. Sélectionnez le projet et l'agent dans le menu déroulant." },
            { q: "Comment exporter en PDF ?", a: "Dans 'Volumes & Reports', sélectionnez votre projet, calculez les volumes et cliquez sur 'Exporter PDF'." },
            { q: "Quel système de coordonnées utiliser au Maroc ?", a: "Utilisez EPSG:26191 (Lambert Maroc) pour les projets marocains. Pour les coordonnées GPS, utilisez EPSG:4326 (WGS84)." },
          ].map((faq, i) => (
            <div key={i} style={{ borderBottom: i < 4 ? "1px solid #1E2D3D" : "none", paddingBottom: i < 4 ? 16 : 0, marginBottom: i < 4 ? 16 : 0 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: "#E2EAF2", marginBottom: 6 }}>❓ {faq.q}</div>
              <div style={{ fontSize: 13, color: "#64748B", lineHeight: 1.6 }}>💡 {faq.a}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
