"use client";
import { useState, useEffect, useCallback } from "react";
import AppShell from "@/components/AppShell";
import Header from "@/components/Header";
import { BarChart3, TrendingUp, TrendingDown, RefreshCw, Download, FileText, Calculator } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, ComposedChart, Line, Area, AreaChart, ReferenceLine,
} from "recharts";

interface VolumeRow {
  station: number;
  terrainZ: number;
  roadZ: number;
  cutArea: number;
  fillArea: number;
  cutVolume: number;
  fillVolume: number;
  cumulCut: number;
  cumulFill: number;
  balance: number;
}

function generateVolumeData(numSections = 20): VolumeRow[] {
  const rows: VolumeRow[] = [];
  let cumulCut = 0, cumulFill = 0;
  for (let i = 0; i < numSections; i++) {
    const station = i * 50;
    const terrainZ = 80 + 15 * Math.sin(i * 0.4) + 8 * Math.cos(i * 0.8) + (Math.random() - 0.5) * 4;
    const roadZ = 72 + i * 0.3 + (i > 10 ? -i * 0.1 : 0);
    const diff = terrainZ - roadZ;
    const cutArea = diff > 0 ? diff * (8 + Math.random() * 4) : 0;
    const fillArea = diff < 0 ? Math.abs(diff) * (8 + Math.random() * 4) : 0;
    const cutVolume = i > 0 ? ((rows[i - 1].cutArea + cutArea) / 2) * 50 : cutArea * 25;
    const fillVolume = i > 0 ? ((rows[i - 1].fillArea + fillArea) / 2) * 50 : fillArea * 25;
    cumulCut += cutVolume;
    cumulFill += fillVolume;
    rows.push({
      station,
      terrainZ: Math.round(terrainZ * 10) / 10,
      roadZ: Math.round(roadZ * 10) / 10,
      cutArea: Math.round(cutArea * 10) / 10,
      fillArea: Math.round(fillArea * 10) / 10,
      cutVolume: Math.round(cutVolume),
      fillVolume: Math.round(fillVolume),
      cumulCut: Math.round(cumulCut),
      cumulFill: Math.round(cumulFill),
      balance: Math.round(cumulCut - cumulFill),
    });
  }
  return rows;
}

export default function VolumesPage() {
  const [data, setData] = useState<VolumeRow[]>([]);
  const [method, setMethod] = useState<"trapezoidal" | "prismatic">("trapezoidal");
  const [bulkFactor, setBulkFactor] = useState(1.1);
  const [shrinkFactor, setShrinkFactor] = useState(0.9);
  const [transportCost, setTransportCost] = useState(2.5);

  const generate = useCallback(() => {
    setData(generateVolumeData(20));
  }, []);

  useEffect(() => { generate(); }, [generate]);

  const totalCut = data.reduce((s, r) => s + r.cutVolume, 0);
  const totalFill = data.reduce((s, r) => s + r.fillVolume, 0);
  const netBalance = totalCut - totalFill;
  const adjustedCut = totalCut * bulkFactor;
  const adjustedFill = totalFill / shrinkFactor;
  const earthworkCost = (totalCut + totalFill) * transportCost;

  const chartData = data.map((r) => ({
    station: `PK${(r.station / 1000).toFixed(2)}`,
    Déblai: r.cutVolume,
    Remblai: r.fillVolume,
    "Bilan cumulé": r.balance,
    "Coupe area": r.cutArea,
    "Remblai area": r.fillArea,
  }));

  return (
    <AppShell>
      <Header
        title="Calcul de Volumes de Terrassement"
        subtitle="Cubatures déblai/remblai — Méthode trapézoïdale / prismatique"
        actions={
          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn-secondary" style={{ fontSize: 11 }}><Download size={12} /> Rapport PDF</button>
            <button className="btn-secondary" style={{ fontSize: 11 }}><FileText size={12} /> Export CSV</button>
            <button className="btn-primary" onClick={generate} style={{ fontSize: 11 }}><RefreshCw size={12} /> Recalculer</button>
          </div>
        }
      />

      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        <div style={{ flex: 1, overflowY: "auto", padding: 24, display: "flex", flexDirection: "column", gap: 20 }}>
          {/* KPIs */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
            {[
              { label: "Volume déblai total", value: `${totalCut.toLocaleString()} m³`, icon: TrendingUp, color: "#3b82f6", sub: `+${((bulkFactor - 1) * 100).toFixed(0)}% foisonnement = ${adjustedCut.toLocaleString("fr")} m³` },
              { label: "Volume remblai total", value: `${totalFill.toLocaleString()} m³`, icon: TrendingDown, color: "#f97316", sub: `Compactage = ${adjustedFill.toLocaleString("fr")} m³` },
              { label: "Bilan terrassement", value: `${Math.abs(netBalance).toLocaleString()} m³`, icon: BarChart3, color: netBalance >= 0 ? "#4ade80" : "#f87171", sub: netBalance >= 0 ? "Excédent déblai" : "Déficit — apport matériaux" },
              { label: "Coût estimatif", value: `${Math.round(earthworkCost).toLocaleString()} €`, icon: Calculator, color: "#facc15", sub: `@ ${transportCost}€/m³` },
            ].map((s) => (
              <div key={s.label} className="stat-card">
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <s.icon size={16} color={s.color} />
                  <span className="stat-label">{s.label}</span>
                </div>
                <div className="stat-value" style={{ color: s.color, fontSize: 22 }}>{s.value}</div>
                <div style={{ fontSize: 10, color: "#4b6080", marginTop: 2 }}>{s.sub}</div>
              </div>
            ))}
          </div>

          {/* Volume histogram */}
          <div className="srm-card">
            <h3 style={{ margin: "0 0 16px", fontSize: 13, fontWeight: 600, color: "#8bacc8" }}>
              Histogramme des volumes par section (m³)
            </h3>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={chartData} barSize={18}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e3048" />
                <XAxis dataKey="station" tick={{ fill: "#4b6080", fontSize: 9 }} angle={-30} textAnchor="end" height={40} />
                <YAxis tick={{ fill: "#4b6080", fontSize: 10 }} />
                <Tooltip contentStyle={{ background: "#111c28", border: "1px solid #1e3048", borderRadius: 6, fontSize: 11 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="Déblai" fill="#3b82f6" radius={[2, 2, 0, 0]} />
                <Bar dataKey="Remblai" fill="#f97316" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Cumulative mass curve (courbe des masses) */}
          <div className="srm-card">
            <h3 style={{ margin: "0 0 6px", fontSize: 13, fontWeight: 600, color: "#8bacc8" }}>
              Courbe des masses — Bilan cumulé (m³)
            </h3>
            <p style={{ margin: "0 0 12px", fontSize: 11, color: "#4b6080" }}>
              Positive = excédent déblai disponible · Négative = déficit à compenser par emprunt
            </p>
            <ResponsiveContainer width="100%" height={220}>
              <ComposedChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e3048" />
                <XAxis dataKey="station" tick={{ fill: "#4b6080", fontSize: 9 }} angle={-30} textAnchor="end" height={40} />
                <YAxis tick={{ fill: "#4b6080", fontSize: 10 }} />
                <Tooltip contentStyle={{ background: "#111c28", border: "1px solid #1e3048", borderRadius: 6, fontSize: 11 }} />
                <ReferenceLine y={0} stroke="#facc15" strokeDasharray="5 5" label={{ value: "Équilibre", fill: "#facc15", fontSize: 10 }} />
                <Area type="monotone" dataKey="Bilan cumulé" stroke="#10b981" fill="rgba(16,185,129,0.2)" strokeWidth={2} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          {/* Detailed table */}
          <div className="srm-card" style={{ padding: 0, overflow: "hidden" }}>
            <div style={{ padding: "12px 16px", borderBottom: "1px solid #1e3048" }}>
              <h3 style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "#8bacc8" }}>
                Tableau de cubature détaillé
              </h3>
            </div>
            <div style={{ overflowX: "auto" }}>
              <table className="srm-table">
                <thead>
                  <tr>
                    <th>Station</th>
                    <th>Z terrain</th>
                    <th>Z projet</th>
                    <th>Section déblai (m²)</th>
                    <th>Section remblai (m²)</th>
                    <th>Vol. déblai (m³)</th>
                    <th>Vol. remblai (m³)</th>
                    <th>Cumul déblai</th>
                    <th>Cumul remblai</th>
                    <th>Bilan</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((row) => (
                    <tr key={row.station}>
                      <td style={{ fontFamily: "monospace", color: "#f97316", fontWeight: 600 }}>
                        PK {(row.station / 1000).toFixed(3)}
                      </td>
                      <td style={{ fontFamily: "monospace", color: "#10b981" }}>{row.terrainZ}</td>
                      <td style={{ fontFamily: "monospace", color: "#8b5cf6" }}>{row.roadZ}</td>
                      <td style={{ fontFamily: "monospace", color: "#60a5fa" }}>{row.cutArea > 0 ? row.cutArea : "—"}</td>
                      <td style={{ fontFamily: "monospace", color: "#f97316" }}>{row.fillArea > 0 ? row.fillArea : "—"}</td>
                      <td style={{ fontFamily: "monospace", color: "#60a5fa", fontWeight: 600 }}>{row.cutVolume > 0 ? row.cutVolume.toLocaleString() : "—"}</td>
                      <td style={{ fontFamily: "monospace", color: "#f97316", fontWeight: 600 }}>{row.fillVolume > 0 ? row.fillVolume.toLocaleString() : "—"}</td>
                      <td style={{ fontFamily: "monospace", color: "#8bacc8" }}>{row.cumulCut.toLocaleString()}</td>
                      <td style={{ fontFamily: "monospace", color: "#8bacc8" }}>{row.cumulFill.toLocaleString()}</td>
                      <td style={{ fontFamily: "monospace", color: row.balance >= 0 ? "#4ade80" : "#f87171", fontWeight: 600 }}>
                        {row.balance >= 0 ? "+" : ""}{row.balance.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                  <tr style={{ background: "#0f1923" }}>
                    <td colSpan={5} style={{ fontWeight: 700, color: "#e2eaf2", padding: "10px 12px" }}>TOTAUX</td>
                    <td style={{ fontFamily: "monospace", color: "#60a5fa", fontWeight: 700 }}>{totalCut.toLocaleString()}</td>
                    <td style={{ fontFamily: "monospace", color: "#f97316", fontWeight: 700 }}>{totalFill.toLocaleString()}</td>
                    <td colSpan={2} />
                    <td style={{ fontFamily: "monospace", color: netBalance >= 0 ? "#4ade80" : "#f87171", fontWeight: 700 }}>
                      {netBalance >= 0 ? "+" : ""}{netBalance.toLocaleString()}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right panel */}
        <div style={{ width: 240, background: "#111c28", borderLeft: "1px solid #1e3048", padding: 14, overflowY: "auto", flexShrink: 0 }}>
          <div className="section-title">Paramètres de calcul</div>
          <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 12 }}>
            <div>
              <label style={{ fontSize: 11, color: "#4b6080", display: "block", marginBottom: 3 }}>Méthode</label>
              <select className="srm-select" value={method} onChange={(e) => setMethod(e.target.value as "trapezoidal" | "prismatic")}>
                <option value="trapezoidal">Trapézoïdale</option>
                <option value="prismatic">Prismatique</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: 11, color: "#4b6080", display: "block", marginBottom: 3 }}>
                Coeff. foisonnement: {bulkFactor}
              </label>
              <input type="range" min={1} max={1.5} step={0.05} value={bulkFactor} onChange={(e) => setBulkFactor(parseFloat(e.target.value))} style={{ width: "100%", accentColor: "#3b82f6" }} />
            </div>
            <div>
              <label style={{ fontSize: 11, color: "#4b6080", display: "block", marginBottom: 3 }}>
                Coeff. compactage: {shrinkFactor}
              </label>
              <input type="range" min={0.7} max={1} step={0.05} value={shrinkFactor} onChange={(e) => setShrinkFactor(parseFloat(e.target.value))} style={{ width: "100%", accentColor: "#f97316" }} />
            </div>
            <div>
              <label style={{ fontSize: 11, color: "#4b6080", display: "block", marginBottom: 3 }}>
                Coût transport (€/m³)
              </label>
              <input className="srm-input" type="number" step={0.5} value={transportCost} onChange={(e) => setTransportCost(parseFloat(e.target.value))} />
            </div>
          </div>

          <div className="section-title" style={{ marginTop: 16 }}>Bilan financier</div>
          <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 8 }}>
            {[
              { label: "Déblai", value: `${Math.round(totalCut * transportCost * 0.7).toLocaleString()} €`, color: "#3b82f6" },
              { label: "Remblai", value: `${Math.round(totalFill * transportCost).toLocaleString()} €`, color: "#f97316" },
              { label: "Transport", value: `${Math.round(Math.abs(netBalance) * transportCost * 0.5).toLocaleString()} €`, color: "#facc15" },
              { label: "TOTAL", value: `${Math.round(earthworkCost * 1.2).toLocaleString()} €`, color: "#e2eaf2" },
            ].map((item) => (
              <div key={item.label} style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
                <span style={{ color: "#4b6080" }}>{item.label}</span>
                <span style={{ color: item.color, fontWeight: 600 }}>{item.value}</span>
              </div>
            ))}
          </div>

          <div className="section-title" style={{ marginTop: 16 }}>Informations</div>
          <div style={{ fontSize: 11, color: "#4b6080", lineHeight: 1.7, marginTop: 8 }}>
            <div>• Méthode: {method === "trapezoidal" ? "Trapézoïdale" : "Prismatique"}</div>
            <div>• Sections: {data.length} profils</div>
            <div>• Espacement: 50m</div>
            <div>• Normes: SETRA / LCPC</div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
