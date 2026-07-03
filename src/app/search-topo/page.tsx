"use client";
import { useState } from "react";
import Link from "next/link";

interface NearPoint {
  id: number;
  name: string;
  code: string;
  x: number;
  y: number;
  z: number;
  distance: number;
  projectId: number;
  projectName?: string;
}

export default function SearchTopoPage() {
  const [x, setX] = useState("");
  const [y, setY] = useState("");
  const [radius, setRadius] = useState("100");
  const [results, setResults] = useState<NearPoint[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setSearched(false);
    const res = await fetch(`/api/search-topo?x=${x}&y=${y}&radius=${radius}`);
    const data = await res.json();
    setResults(Array.isArray(data) ? data : []);
    setSearched(true);
    setLoading(false);
  }

  const codeColor: Record<string, string> = {
    LIM: "#EF4444", VOI: "#F59E0B", BAT: "#3B82F6",
    RTE: "#6B7280", CAN: "#06B6D4", ARB: "#22C55E",
    AXE: "#F97316", TN: "#10B981", IMP: "#F59E0B",
    BOR: "#A855F7", BN: "#EC4899", MUR: "#8B5CF6",
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0D1117", color: "#E2EAF2", fontFamily: "Arial, sans-serif" }}>
      {/* Header */}
      <div style={{ background: "#161B22", borderBottom: "1px solid #1E2D3D", padding: "0 32px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 56 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ fontSize: 18, fontWeight: 700 }}>Terra<span style={{ color: "#F97316" }}>Maps</span></div>
          <span style={{ background: "#3B82F6", color: "#fff", fontSize: 10, fontWeight: 700, padding: "2px 10px", borderRadius: 20 }}>RECHERCHE TOPO</span>
        </div>
        <Link href="/dashboard" style={{ color: "#64748B", fontSize: 13, textDecoration: "none" }}>← Dashboard</Link>
      </div>

      <div style={{ padding: 32, maxWidth: 900, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>📍</div>
          <h1 style={{ margin: "0 0 8px", fontSize: 24, fontWeight: 700 }}>Recherche par coordonnées</h1>
          <p style={{ color: "#64748B", fontSize: 14 }}>Trouvez tous les points topographiques dans un rayon donné</p>
        </div>

        {/* Search form */}
        <div style={{ background: "#161B22", border: "1px solid #1E2D3D", borderRadius: 16, padding: 32, marginBottom: 32 }}>
          <form onSubmit={handleSearch}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 20, marginBottom: 24 }}>
              <div>
                <label style={{ display: "block", fontSize: 11, color: "#64748B", marginBottom: 6, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 }}>
                  X — Coordonnée Est (m)
                </label>
                <input type="number" value={x} onChange={e => setX(e.target.value)} required
                  placeholder="Ex: 450000.000"
                  style={{ width: "100%", background: "#0D1117", border: "1px solid #1E2D3D", borderRadius: 8, padding: "10px 14px", color: "#fff", fontSize: 13, boxSizing: "border-box", fontFamily: "monospace" }} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 11, color: "#64748B", marginBottom: 6, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 }}>
                  Y — Coordonnée Nord (m)
                </label>
                <input type="number" value={y} onChange={e => setY(e.target.value)} required
                  placeholder="Ex: 340000.000"
                  style={{ width: "100%", background: "#0D1117", border: "1px solid #1E2D3D", borderRadius: 8, padding: "10px 14px", color: "#fff", fontSize: 13, boxSizing: "border-box", fontFamily: "monospace" }} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 11, color: "#64748B", marginBottom: 6, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 }}>
                  Rayon de recherche (m)
                </label>
                <select value={radius} onChange={e => setRadius(e.target.value)}
                  style={{ width: "100%", background: "#0D1117", border: "1px solid #1E2D3D", borderRadius: 8, padding: "10px 14px", color: "#fff", fontSize: 13 }}>
                  <option value="10">10 m — Très précis</option>
                  <option value="50">50 m — Précis</option>
                  <option value="100">100 m — Standard</option>
                  <option value="250">250 m — Large</option>
                  <option value="500">500 m — Très large</option>
                  <option value="1000">1000 m — Zone entière</option>
                </select>
              </div>
            </div>

            {/* Quick presets */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 11, color: "#64748B", marginBottom: 8, fontWeight: 600, textTransform: "uppercase" }}>Coordonnées exemples (Maroc)</div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {[
                  { label: "Béni Mellal", x: "450000", y: "340000" },
                  { label: "Casablanca", x: "334000", y: "372000" },
                  { label: "Rabat", x: "317000", y: "399000" },
                  { label: "Marrakech", x: "290000", y: "298000" },
                ].map(p => (
                  <button key={p.label} type="button"
                    onClick={() => { setX(p.x); setY(p.y); }}
                    style={{ background: "#0D1117", border: "1px solid #1E2D3D", color: "#8BACC8", padding: "4px 12px", borderRadius: 6, cursor: "pointer", fontSize: 11 }}>
                    📍 {p.label}
                  </button>
                ))}
              </div>
            </div>

            <button type="submit" disabled={loading}
              style={{ width: "100%", background: loading ? "#1E2D3D" : "#F97316", border: "none", color: "#fff", padding: "13px", borderRadius: 10, cursor: loading ? "not-allowed" : "pointer", fontSize: 15, fontWeight: 700 }}>
              {loading ? "Recherche en cours..." : "🔍 Rechercher dans un rayon de " + radius + "m"}
            </button>
          </form>
        </div>

        {/* Results */}
        {searched && (
          <div style={{ background: "#161B22", border: "1px solid #1E2D3D", borderRadius: 16, padding: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h2 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>
                {results.length > 0 ? `✅ ${results.length} point(s) trouvé(s)` : "❌ Aucun point trouvé"}
                <span style={{ fontSize: 12, color: "#64748B", fontWeight: 400, marginLeft: 8 }}>
                  dans un rayon de {radius}m autour de ({parseFloat(x).toFixed(3)}, {parseFloat(y).toFixed(3)})
                </span>
              </h2>
            </div>

            {results.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px 20px", color: "#64748B" }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
                <div style={{ fontSize: 14, marginBottom: 8 }}>Aucun point topographique dans cette zone</div>
                <div style={{ fontSize: 12 }}>Essayez d'augmenter le rayon de recherche ou vérifiez les coordonnées.</div>
              </div>
            ) : (
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid #1E2D3D" }}>
                    {["Nom", "Code", "X (Est)", "Y (Nord)", "Z (Alt)", "Distance", "Projet"].map(h => (
                      <th key={h} style={{ textAlign: "left", padding: "10px 12px", fontSize: 10, color: "#64748B", fontWeight: 600, textTransform: "uppercase", letterSpacing: 1 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {results.sort((a, b) => a.distance - b.distance).map(pt => (
                    <tr key={pt.id} style={{ borderBottom: "1px solid #0D1117" }}>
                      <td style={{ padding: "12px", fontSize: 13, fontWeight: 600, color: "#E2EAF2" }}>{pt.name}</td>
                      <td style={{ padding: "12px" }}>
                        <span style={{ background: `${codeColor[pt.code] || "#64748B"}22`, color: codeColor[pt.code] || "#64748B", fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 20 }}>
                          {pt.code}
                        </span>
                      </td>
                      <td style={{ padding: "12px", fontSize: 12, color: "#3B82F6", fontFamily: "monospace" }}>{pt.x.toFixed(3)}</td>
                      <td style={{ padding: "12px", fontSize: 12, color: "#22C55E", fontFamily: "monospace" }}>{pt.y.toFixed(3)}</td>
                      <td style={{ padding: "12px", fontSize: 12, color: "#A855F7", fontFamily: "monospace" }}>{pt.z.toFixed(3)}</td>
                      <td style={{ padding: "12px" }}>
                        <span style={{ background: pt.distance < 10 ? "rgba(34,197,94,0.2)" : pt.distance < 50 ? "rgba(249,115,22,0.2)" : "rgba(239,68,68,0.2)", color: pt.distance < 10 ? "#22C55E" : pt.distance < 50 ? "#F97316" : "#EF4444", fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20 }}>
                          {pt.distance.toFixed(2)} m
                        </span>
                      </td>
                      <td style={{ padding: "12px", fontSize: 11, color: "#8BACC8" }}>{pt.projectName || `Projet #${pt.projectId}`}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
