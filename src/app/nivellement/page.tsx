"use client";
import { useState } from "react";
import Link from "next/link";

interface Station {
  id: number;
  point: string;
  va: string; // Visée Arrière
  vi: string; // Visée Intermédiaire  
  vav: string; // Visée Avant
  altitude?: number;
  hi?: number; // Hauteur Instrument
}

export default function NivellementPage() {
  const [altitudeDepart, setAltitudeDepart] = useState("100.000");
  const [altitudeArrivee, setAltitudeArrivee] = useState("");
  const [stations, setStations] = useState<Station[]>([
    { id: 1, point: "A", va: "1.245", vi: "", vav: "" },
    { id: 2, point: "B", va: "1.123", vi: "", vav: "0.876" },
    { id: 3, point: "C", va: "0.987", vi: "", vav: "1.234" },
    { id: 4, point: "D", va: "", vi: "", vav: "1.456" },
  ]);

  function addStation() {
    const lastId = stations.length > 0 ? Math.max(...stations.map(s => s.id)) : 0;
    setStations(prev => [...prev, { id: lastId + 1, point: `P${lastId + 1}`, va: "", vi: "", vav: "" }]);
  }

  function removeStation(id: number) {
    setStations(prev => prev.filter(s => s.id !== id));
  }

  function updateStation(id: number, field: keyof Station, value: string) {
    setStations(prev => prev.map(s => s.id === id ? { ...s, [field]: value } : s));
  }

  // Calcul du nivellement
  function calculate() {
    const alt0 = parseFloat(altitudeDepart);
    if (isNaN(alt0)) return [];

    const results: any[] = [];
    let currentAlt = alt0;
    let hi = 0;

    stations.forEach((s, i) => {
      const va = parseFloat(s.va);
      const vi = parseFloat(s.vi);
      const vav = parseFloat(s.vav);

      if (!isNaN(va)) {
        hi = currentAlt + va;
      }

      const altPoint = !isNaN(vi) && s.vi ? hi - vi : currentAlt;
      const altAvant = !isNaN(vav) && s.vav ? hi - vav : null;

      results.push({
        point: s.point,
        va: s.va || "—",
        vi: s.vi || "—",
        vav: s.vav || "—",
        hi: !isNaN(va) ? hi.toFixed(3) : "—",
        altitude: altPoint.toFixed(3),
      });

      if (altAvant !== null) currentAlt = altAvant;
    });

    return results;
  }

  const results = calculate();
  const altFinale = results.length > 0 ? parseFloat(results[results.length-1].altitude) : null;
  const altArriveeParsed = parseFloat(altitudeArrivee);
  const fermeture = altFinale !== null && !isNaN(altArriveeParsed) ? altFinale - altArriveeParsed : null;
  const tolerance = stations.length > 0 ? 0.012 * Math.sqrt(stations.length) : 0;

  // Totaux VA et VaV
  const totalVA = stations.reduce((s, st) => s + (parseFloat(st.va) || 0), 0);
  const totalVAV = stations.reduce((s, st) => s + (parseFloat(st.vav) || 0), 0);
  const depart = parseFloat(altitudeDepart) || 0;
  const altCalculee = depart + totalVA - totalVAV;

  function exportCSV() {
    const rows = ["Point,VA,VI,VaV,HI,Altitude"];
    results.forEach(r => rows.push(`${r.point},${r.va},${r.vi},${r.vav},${r.hi},${r.altitude}`));
    const blob = new Blob([rows.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "nivellement.csv"; a.click();
  }

  return (
    <div style={{ minHeight: "100vh", background: "#0D1117", color: "#E2EAF2", fontFamily: "Arial, sans-serif" }}>
      <div style={{ background: "#161B22", borderBottom: "1px solid #1E2D3D", padding: "0 24px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 56 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ fontSize: 18, fontWeight: 700 }}>Terra<span style={{ color: "#F97316" }}>Maps</span></div>
          <span style={{ background: "#3B82F6", color: "#fff", fontSize: 10, fontWeight: 700, padding: "2px 10px", borderRadius: 20 }}>NIVELLEMENT</span>
        </div>
        <Link href="/dashboard" style={{ color: "#64748B", fontSize: 13, textDecoration: "none" }}>← Dashboard</Link>
      </div>

      <div style={{ padding: 24, maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ fontSize: 48, marginBottom: 8 }}>📐</div>
          <h1 style={{ margin: "0 0 8px", fontSize: 22, fontWeight: 700 }}>Canevas de Nivellement</h1>
          <p style={{ color: "#64748B", fontSize: 13 }}>Calcul automatique des altitudes par nivellement direct</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 24 }}>
          {/* Table de saisie */}
          <div>
            <div style={{ background: "#161B22", border: "1px solid #1E2D3D", borderRadius: 12, padding: 20, marginBottom: 16 }}>
              <div style={{ display: "flex", gap: 16, marginBottom: 16 }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: 11, color: "#64748B", display: "block", marginBottom: 4, fontWeight: 600, textTransform: "uppercase" }}>Altitude départ (m)</label>
                  <input value={altitudeDepart} onChange={e => setAltitudeDepart(e.target.value)}
                    style={{ width: "100%", background: "#0D1117", border: "1px solid #F97316", borderRadius: 8, padding: "8px 12px", color: "#F97316", fontSize: 14, fontWeight: 700, boxSizing: "border-box", fontFamily: "monospace" }} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: 11, color: "#64748B", display: "block", marginBottom: 4, fontWeight: 600, textTransform: "uppercase" }}>Altitude arrivée connue (m)</label>
                  <input value={altitudeArrivee} onChange={e => setAltitudeArrivee(e.target.value)} placeholder="Pour vérif. fermeture"
                    style={{ width: "100%", background: "#0D1117", border: "1px solid #1E2D3D", borderRadius: 8, padding: "8px 12px", color: "#fff", fontSize: 14, boxSizing: "border-box", fontFamily: "monospace" }} />
                </div>
              </div>

              {/* Tableau de saisie */}
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid #1E2D3D" }}>
                    {["Point", "Visée Arrière (VA)", "Visée Interm. (VI)", "Visée Avant (VaV)", ""].map(h => (
                      <th key={h} style={{ padding: "8px 10px", color: "#64748B", textAlign: "left", fontSize: 10, textTransform: "uppercase", fontWeight: 600 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {stations.map(s => (
                    <tr key={s.id} style={{ borderBottom: "1px solid #0D1117" }}>
                      <td style={{ padding: "6px 8px" }}>
                        <input value={s.point} onChange={e => updateStation(s.id, "point", e.target.value)}
                          style={{ width: 60, background: "#0D1117", border: "1px solid #1E2D3D", borderRadius: 6, padding: "5px 8px", color: "#F97316", fontSize: 12, fontWeight: 700 }} />
                      </td>
                      {(["va", "vi", "vav"] as const).map(field => (
                        <td key={field} style={{ padding: "6px 8px" }}>
                          <input value={s[field]} onChange={e => updateStation(s.id, field, e.target.value)}
                            placeholder="0.000"
                            style={{ width: 90, background: "#0D1117", border: "1px solid #1E2D3D", borderRadius: 6, padding: "5px 8px", color: field === "va" ? "#22C55E" : field === "vav" ? "#EF4444" : "#3B82F6", fontSize: 12, fontFamily: "monospace" }} />
                        </td>
                      ))}
                      <td style={{ padding: "6px 8px" }}>
                        <button onClick={() => removeStation(s.id)}
                          style={{ background: "transparent", border: "none", color: "#EF4444", cursor: "pointer", fontSize: 16 }}>×</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr style={{ borderTop: "2px solid #1E2D3D" }}>
                    <td style={{ padding: "8px 10px", color: "#64748B", fontSize: 11, fontWeight: 700 }}>TOTAUX</td>
                    <td style={{ padding: "8px 10px", color: "#22C55E", fontSize: 12, fontFamily: "monospace", fontWeight: 700 }}>{totalVA.toFixed(3)}</td>
                    <td style={{ padding: "8px 10px", color: "#3B82F6", fontSize: 12 }}>—</td>
                    <td style={{ padding: "8px 10px", color: "#EF4444", fontSize: 12, fontFamily: "monospace", fontWeight: 700 }}>{totalVAV.toFixed(3)}</td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>

              <button onClick={addStation}
                style={{ marginTop: 12, background: "transparent", border: "1px dashed #1E2D3D", color: "#64748B", padding: "8px 16px", borderRadius: 8, cursor: "pointer", fontSize: 12, width: "100%" }}>
                + Ajouter une station
              </button>
            </div>

            {/* Résultats */}
            <div style={{ background: "#161B22", border: "1px solid #1E2D3D", borderRadius: 12, padding: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: "#8BACC8" }}>📊 Tableau des altitudes calculées</h3>
                <button onClick={exportCSV} style={{ background: "#F97316", border: "none", color: "#fff", padding: "6px 14px", borderRadius: 6, cursor: "pointer", fontSize: 11, fontWeight: 600 }}>⬇️ Export CSV</button>
                <button onClick={exportPDF} style={{ background: "#0D47A1", border: "none", color: "#fff", padding: "6px 14px", borderRadius: 6, cursor: "pointer", fontSize: 11, fontWeight: 600 }}>📄 Export PDF</button>
              </div>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid #1E2D3D" }}>
                    {["Point", "VA", "VI", "VaV", "HI (m)", "Altitude (m)"].map(h => (
                      <th key={h} style={{ padding: "8px 10px", color: "#64748B", textAlign: "left", fontSize: 10, textTransform: "uppercase" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {results.map((r, i) => (
                    <tr key={i} style={{ borderBottom: "1px solid #0D1117", background: i % 2 === 0 ? "rgba(255,255,255,0.02)" : "transparent" }}>
                      <td style={{ padding: "8px 10px", color: "#F97316", fontWeight: 700 }}>{r.point}</td>
                      <td style={{ padding: "8px 10px", color: "#22C55E", fontFamily: "monospace", fontSize: 11 }}>{r.va}</td>
                      <td style={{ padding: "8px 10px", color: "#3B82F6", fontFamily: "monospace", fontSize: 11 }}>{r.vi}</td>
                      <td style={{ padding: "8px 10px", color: "#EF4444", fontFamily: "monospace", fontSize: 11 }}>{r.vav}</td>
                      <td style={{ padding: "8px 10px", color: "#A855F7", fontFamily: "monospace", fontSize: 11 }}>{r.hi}</td>
                      <td style={{ padding: "8px 10px", color: "#F97316", fontFamily: "monospace", fontSize: 13, fontWeight: 700 }}>{r.altitude}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Panel droit */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Vérification fermeture */}
            <div style={{ background: "#161B22", border: "1px solid #1E2D3D", borderRadius: 12, padding: 20 }}>
              <h3 style={{ margin: "0 0 16px", fontSize: 14, fontWeight: 600, color: "#8BACC8" }}>🔍 Vérification de fermeture</h3>
              
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 11, color: "#64748B", marginBottom: 4 }}>Altitude calculée finale</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: "#F97316", fontFamily: "monospace" }}>
                  {altCalculee.toFixed(3)} m
                </div>
              </div>

              {fermeture !== null && (
                <>
                  <div style={{ marginBottom: 12 }}>
                    <div style={{ fontSize: 11, color: "#64748B", marginBottom: 4 }}>Écart de fermeture</div>
                    <div style={{ fontSize: 18, fontWeight: 700, color: Math.abs(fermeture) <= tolerance ? "#22C55E" : "#EF4444", fontFamily: "monospace" }}>
                      {fermeture > 0 ? "+" : ""}{fermeture.toFixed(3)} m
                    </div>
                  </div>
                  <div style={{ marginBottom: 12 }}>
                    <div style={{ fontSize: 11, color: "#64748B", marginBottom: 4 }}>Tolérance ({stations.length} stations)</div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: "#64748B", fontFamily: "monospace" }}>
                      ±{tolerance.toFixed(3)} m
                    </div>
                  </div>
                  <div style={{ padding: 12, borderRadius: 8, background: Math.abs(fermeture) <= tolerance ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)", border: `1px solid ${Math.abs(fermeture) <= tolerance ? "rgba(34,197,94,0.3)" : "rgba(239,68,68,0.3)"}` }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: Math.abs(fermeture) <= tolerance ? "#22C55E" : "#EF4444" }}>
                      {Math.abs(fermeture) <= tolerance ? "✅ Nivellement ACCEPTÉ" : "❌ Nivellement REFUSÉ"}
                    </div>
                    <div style={{ fontSize: 11, color: "#64748B", marginTop: 4 }}>
                      {Math.abs(fermeture) <= tolerance ? "La précision est dans les tolérances" : "L'écart dépasse la tolérance admissible"}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Infos calcul */}
            <div style={{ background: "#161B22", border: "1px solid #1E2D3D", borderRadius: 12, padding: 20 }}>
              <h3 style={{ margin: "0 0 16px", fontSize: 14, fontWeight: 600, color: "#8BACC8" }}>📋 Récapitulatif</h3>
              {[
                { label: "Altitude départ", value: parseFloat(altitudeDepart).toFixed(3) + " m", color: "#F97316" },
                { label: "Total VA", value: totalVA.toFixed(3) + " m", color: "#22C55E" },
                { label: "Total VaV", value: totalVAV.toFixed(3) + " m", color: "#EF4444" },
                { label: "ΣVA - ΣVaV", value: (totalVA - totalVAV).toFixed(3) + " m", color: "#3B82F6" },
                { label: "Altitude finale", value: altCalculee.toFixed(3) + " m", color: "#F97316" },
                { label: "Nb stations", value: stations.length.toString(), color: "#A855F7" },
              ].map(item => (
                <div key={item.label} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid #1E2D3D" }}>
                  <span style={{ fontSize: 12, color: "#64748B" }}>{item.label}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: item.color, fontFamily: "monospace" }}>{item.value}</span>
                </div>
              ))}
            </div>

            {/* Guide */}
            <div style={{ background: "#161B22", border: "1px solid #1E2D3D", borderRadius: 12, padding: 20 }}>
              <h3 style={{ margin: "0 0 12px", fontSize: 13, fontWeight: 600, color: "#8BACC8" }}>💡 Guide</h3>
              <div style={{ fontSize: 11, color: "#64748B", lineHeight: 1.8 }}>
                <div><span style={{ color: "#22C55E" }}>VA</span> — Visée Arrière (lecture mire arrière)</div>
                <div><span style={{ color: "#3B82F6" }}>VI</span> — Visée Intermédiaire</div>
                <div><span style={{ color: "#EF4444" }}>VaV</span> — Visée Avant (lecture mire avant)</div>
                <div><span style={{ color: "#A855F7" }}>HI</span> = Alt + VA</div>
                <div><span style={{ color: "#F97316" }}>Alt</span> = HI - VaV</div>
                <div style={{ marginTop: 8 }}>Tolérance: <b>12mm × √n</b></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
