"use client";
import { useState, useEffect, use } from "react";
import Link from "next/link";

export default function SharedProjectPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/share/${token}`)
      .then(r => r.json())
      .then(d => {
        if (d.error) setError(d.error);
        else setData(d);
        setLoading(false);
      });
  }, [token]);

  if (loading) return (
    <div style={{ minHeight: "100vh", background: "#0D1117", display: "flex", alignItems: "center", justifyContent: "center", color: "#E2EAF2", fontFamily: "Arial" }}>
      Chargement...
    </div>
  );

  if (error) return (
    <div style={{ minHeight: "100vh", background: "#0D1117", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Arial" }}>
      <div style={{ textAlign: "center", color: "#E2EAF2" }}>
        <div style={{ fontSize: 64, marginBottom: 16 }}>🔒</div>
        <h2>Lien invalide ou expire</h2>
        <Link href="/" style={{ color: "#F97316" }}>Retour a l accueil</Link>
      </div>
    </div>
  );

  const { project, points, photos } = data;

  return (
    <div style={{ minHeight: "100vh", background: "#0D1117", color: "#E2EAF2", fontFamily: "Arial" }}>
      <div style={{ background: "#161B22", borderBottom: "1px solid #1E2D3D", padding: "0 32px", height: 56, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ fontSize: 18, fontWeight: 700 }}>Terra<span style={{ color: "#F97316" }}>Maps</span></div>
        <div style={{ fontSize: 12, color: "#64748B" }}>Vue partagee — lecture seule</div>
      </div>
      <div style={{ padding: 32, maxWidth: 900, margin: "0 auto" }}>
        <div style={{ background: "#161B22", border: "1px solid #1E2D3D", borderRadius: 16, padding: 24, marginBottom: 24 }}>
          <h1 style={{ margin: "0 0 8px", fontSize: 24, fontWeight: 700 }}>{project.name}</h1>
          <div style={{ color: "#64748B", fontSize: 13 }}>{project.type} — EPSG:{project.epsg_code}</div>
          {project.client && <div style={{ color: "#8BACC8", fontSize: 13, marginTop: 4 }}>Client: {project.client}</div>}
          {project.location && <div style={{ color: "#8BACC8", fontSize: 13 }}>Lieu: {project.location}</div>}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 24 }}>
          {[
            { icon: "📍", label: "Points leves", value: points.length, color: "#3B82F6" },
            { icon: "📸", label: "Photos", value: photos.length, color: "#F97316" },
            { icon: "📅", label: "Modifie le", value: new Date(project.updated_at).toLocaleDateString("fr-FR"), color: "#22C55E" },
          ].map(s => (
            <div key={s.label} style={{ background: "#161B22", border: "1px solid #1E2D3D", borderRadius: 12, padding: 20, textAlign: "center" }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>{s.icon}</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 11, color: "#64748B", marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>
        {points.length > 0 && (
          <div style={{ background: "#161B22", border: "1px solid #1E2D3D", borderRadius: 12, padding: 20, marginBottom: 24 }}>
            <h3 style={{ margin: "0 0 16px", fontSize: 14, color: "#8BACC8" }}>📍 Points topographiques ({points.length})</h3>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid #1E2D3D" }}>
                    {["Nom", "Code", "X", "Y", "Z"].map(h => (
                      <th key={h} style={{ textAlign: "left", padding: "8px 12px", color: "#64748B" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {points.map((p: any, i: number) => (
                    <tr key={i} style={{ borderBottom: "1px solid #0D1117" }}>
                      <td style={{ padding: "8px 12px", color: "#F97316" }}>{p.name}</td>
                      <td style={{ padding: "8px 12px", color: "#22C55E" }}>{p.code}</td>
                      <td style={{ padding: "8px 12px", fontFamily: "monospace", color: "#3B82F6" }}>{parseFloat(p.x).toFixed(3)}</td>
                      <td style={{ padding: "8px 12px", fontFamily: "monospace", color: "#22C55E" }}>{parseFloat(p.y).toFixed(3)}</td>
                      <td style={{ padding: "8px 12px", fontFamily: "monospace", color: "#A855F7" }}>{parseFloat(p.z).toFixed(3)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        <div style={{ textAlign: "center", marginTop: 32, color: "#64748B", fontSize: 12 }}>
          Document genere par TerraMaps v2.0 — terramaps.vercel.app
        </div>
      </div>
    </div>
  );
}
