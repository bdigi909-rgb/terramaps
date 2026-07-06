"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";

interface PickedPoint {
  lat: number;
  lng: number;
  x: number;
  y: number;
  name: string;
  code: string;
}

function wgs84ToLambert(lat: number, lng: number): { x: number; y: number } {
  const a = 6378249.2;
  const b = 6356515.0;
  const e2 = 1 - (b*b)/(a*a);
  const e = Math.sqrt(e2);
  const lat1 = (31.0 + 44/60) * Math.PI / 180;
  const lat2 = (34.0 + 40/60) * Math.PI / 180;
  const lat0 = (33.0 + 18/60) * Math.PI / 180;
  const lng0 = -5.4 * Math.PI / 180;
  const x0 = 500000;
  const y0 = 300000;
  const latR = lat * Math.PI / 180;
  const lngR = lng * Math.PI / 180;
  const mF = (l: number) => Math.cos(l) / Math.sqrt(1 - e2 * Math.sin(l)**2);
  const tF = (l: number) => Math.tan(Math.PI/4 - l/2) / Math.pow((1 - e*Math.sin(l))/(1 + e*Math.sin(l)), e/2);
  const m1 = mF(lat1), m2 = mF(lat2);
  const t1 = tF(lat1), t2 = tF(lat2), t0 = tF(lat0), tP = tF(latR);
  const n = (Math.log(m1) - Math.log(m2)) / (Math.log(t1) - Math.log(t2));
  const F = m1 / (n * Math.pow(t1, n));
  const r0 = a * F * Math.pow(t0, n);
  const r = a * F * Math.pow(tP, n);
  const theta = n * (lngR - lng0);
  const x = x0 + r * Math.sin(theta);
  const y = y0 + r0 - r * Math.cos(theta);
  return { x: Math.round(x*1000)/1000, y: Math.round(y*1000)/1000 };
}

function haversine(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000;
  const dLat = (lat2-lat1) * Math.PI/180;
  const dLng = (lng2-lng1) * Math.PI/180;
  const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLng/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

export default function MapToolsPage() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const [picked, setPicked] = useState<PickedPoint[]>([]);
  const [current, setCurrent] = useState<{ lat: number; lng: number; x: number; y: number } | null>(null);
  const [pointName, setPointName] = useState("PT001");
  const [pointCode, setPointCode] = useState("LIM");
  const [mode, setMode] = useState<"pick"|"measure"|"area">("pick");
  const [measureInfo, setMeasureInfo] = useState<string>("");
  const modeRef = useRef<"pick"|"measure"|"area">("pick");
  const measurePtsRef = useRef<[number,number][]>([]);
  const measureLayersRef = useRef<any[]>([]);

  useEffect(() => { modeRef.current = mode; }, [mode]);

  function clearMeasure(L: any) {
    measureLayersRef.current.forEach(l => { try { mapInstance.current?.removeLayer(l); } catch {} });
    measureLayersRef.current = [];
    measurePtsRef.current = [];
    setMeasureInfo("");
  }

  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;
    import("leaflet").then(L => {
      delete (L.Icon.Default.prototype as any)._getIconUrl;

      const map = L.map(mapRef.current!, { center: [31.9, -5.5], zoom: 6 });
      
      const osm = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { attribution: "© OpenStreetMap", maxZoom: 19 });
      const satellite = L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", { attribution: "© Esri", maxZoom: 19 });
      osm.addTo(map);
      L.control.layers({ "🗺️ OSM": osm, "🛰️ Satellite": satellite }).addTo(map);

      map.on("click", (e: any) => {
        const { lat, lng } = e.latlng;
        const lambert = wgs84ToLambert(lat, lng);
        const currentMode = modeRef.current;

        if (currentMode === "pick") {
          setCurrent({ lat, lng, ...lambert });
          const popup = L.popup().setLatLng([lat, lng])
            .setContent(`<div style="font-family:Arial;font-size:12px">
              <b style="color:#F97316">📍 Lambert Maroc</b><br/>
              X: <b style="color:#3B82F6">${lambert.x.toFixed(3)}</b><br/>
              Y: <b style="color:#22C55E">${lambert.y.toFixed(3)}</b><br/>
              <small>Lat: ${lat.toFixed(6)}° | Lng: ${lng.toFixed(6)}°</small>
            </div>`).openOn(map);
          setTimeout(() => map.closePopup(popup), 4000);
        }

        if (currentMode === "measure") {
          measurePtsRef.current.push([lat, lng]);
          const dot = L.circleMarker([lat, lng], { radius: 5, color: "#F97316", fillColor: "#F97316", fillOpacity: 1 }).addTo(map);
          measureLayersRef.current.push(dot);

          if (measurePtsRef.current.length >= 2) {
            const pts = measurePtsRef.current;
            let total = 0;
            for (let i = 1; i < pts.length; i++) {
              total += haversine(pts[i-1][0], pts[i-1][1], pts[i][0], pts[i][1]);
            }
            const line = L.polyline(pts, { color: "#F97316", weight: 2, dashArray: "6,4" }).addTo(map);
            measureLayersRef.current.push(line);
            const info = `📏 Distance: ${total.toFixed(2)} m (${(total/1000).toFixed(3)} km)`;
            setMeasureInfo(info);
            L.popup().setLatLng([lat, lng]).setContent(`<b style="color:#F97316">${info}</b>`).openOn(map);
          }
        }

        if (currentMode === "area") {
          measurePtsRef.current.push([lat, lng]);
          const dot = L.circleMarker([lat, lng], { radius: 5, color: "#22C55E", fillColor: "#22C55E", fillOpacity: 1 }).addTo(map);
          measureLayersRef.current.push(dot);

          if (measurePtsRef.current.length >= 3) {
            measureLayersRef.current.filter(l => l._latlngs).forEach(l => { try { map.removeLayer(l); } catch {} });
            const pts = measurePtsRef.current;
            const poly = L.polygon(pts, { color: "#22C55E", fillOpacity: 0.15, weight: 2 }).addTo(map);
            measureLayersRef.current.push(poly);

            const lambert = pts.map(p => wgs84ToLambert(p[0], p[1]));
            let area = 0;
            for (let i = 0; i < lambert.length; i++) {
              const j = (i+1) % lambert.length;
              area += lambert[i].x * lambert[j].y - lambert[j].x * lambert[i].y;
            }
            area = Math.abs(area) / 2;
            const info = `📐 Superficie: ${area.toFixed(2)} m² = ${(area/10000).toFixed(4)} Ha`;
            setMeasureInfo(info);
            L.popup().setLatLng([lat, lng]).setContent(`<b style="color:#22C55E">${info}</b><br/>${pts.length} points`).openOn(map);
          }
        }
      });

      mapInstance.current = map;
    });
  }, []);

  function addPoint() {
    if (!current) return;
    const newPoint: PickedPoint = { ...current, name: pointName, code: pointCode };
    setPicked(prev => [...prev, newPoint]);
    const match = pointName.match(/^([A-Z]+)(\d+)$/);
    if (match) setPointName(match[1] + String(parseInt(match[2]) + 1).padStart(3, "0"));
    import("leaflet").then(L => {
      if (!mapInstance.current) return;
      const marker = L.circleMarker([current.lat, current.lng], { radius: 6, color: "#22C55E", fillColor: "#22C55E", fillOpacity: 1 }).addTo(mapInstance.current);
      marker.bindPopup(`<b style="color:#22C55E">✅ ${newPoint.name} (${newPoint.code})</b><br/>X: ${newPoint.x}<br/>Y: ${newPoint.y}`);
    });
  }

  function exportCSV() {
    const csv = picked.map(p => `${p.name},${p.x},${p.y},0`).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "points_lambert.csv"; a.click();
  }

  const modeStyle = (m: string) => ({
    background: mode === m ? (m === "measure" ? "#F97316" : m === "area" ? "#22C55E" : "#3B82F6") : "#0D1117",
    border: `1px solid ${mode === m ? (m === "measure" ? "#F97316" : m === "area" ? "#22C55E" : "#3B82F6") : "#1E2D3D"}`,
    color: "#fff", padding: "8px 14px", borderRadius: 8, cursor: "pointer", fontSize: 12, fontWeight: 600,
  });

  return (
    <div style={{ minHeight: "100vh", background: "#0D1117", color: "#E2EAF2", fontFamily: "Arial, sans-serif" }}>
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css" />
      
      <div style={{ background: "#161B22", borderBottom: "1px solid #1E2D3D", padding: "0 24px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 56 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ fontSize: 18, fontWeight: 700 }}>Terra<span style={{ color: "#F97316" }}>Maps</span></div>
          <span style={{ background: "#22C55E", color: "#fff", fontSize: 10, fontWeight: 700, padding: "2px 10px", borderRadius: 20 }}>OUTILS CARTE</span>
        </div>
        <Link href="/dashboard" style={{ color: "#64748B", fontSize: 13, textDecoration: "none" }}>← Dashboard</Link>
      </div>

      {/* Mode selector */}
      <div style={{ background: "#161B22", borderBottom: "1px solid #1E2D3D", padding: "10px 24px", display: "flex", gap: 8, alignItems: "center" }}>
        <span style={{ fontSize: 12, color: "#64748B", marginRight: 8 }}>Mode :</span>
        <button style={modeStyle("pick") as any} onClick={() => { setMode("pick"); import("leaflet").then(L => clearMeasure(L)); }}>📍 Prendre coordonnées</button>
        <button style={modeStyle("measure") as any} onClick={() => { setMode("measure"); import("leaflet").then(L => clearMeasure(L)); }}>📏 Mesurer distance</button>
        <button style={modeStyle("area") as any} onClick={() => { setMode("area"); import("leaflet").then(L => clearMeasure(L)); }}>📐 Calculer superficie</button>
        <button onClick={() => import("leaflet").then(L => clearMeasure(L))} style={{ background: "transparent", border: "1px solid #1E2D3D", color: "#EF4444", padding: "8px 14px", borderRadius: 8, cursor: "pointer", fontSize: 12 }}>🗑️ Effacer</button>
        {measureInfo && <span style={{ marginLeft: 12, fontSize: 13, fontWeight: 700, color: mode === "measure" ? "#F97316" : "#22C55E" }}>{measureInfo}</span>}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", height: "calc(100vh - 106px)" }}>
        <div ref={mapRef} style={{ width: "100%", height: "100%" }} />

        <div style={{ background: "#161B22", borderLeft: "1px solid #1E2D3D", display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <div style={{ padding: 16, borderBottom: "1px solid #1E2D3D" }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#E2EAF2", marginBottom: 12 }}>➕ Ajouter un point</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 10 }}>
              <div>
                <label style={{ fontSize: 10, color: "#64748B", display: "block", marginBottom: 4 }}>Nom</label>
                <input value={pointName} onChange={e => setPointName(e.target.value)}
                  style={{ width: "100%", background: "#0D1117", border: "1px solid #1E2D3D", borderRadius: 6, padding: "6px 10px", color: "#fff", fontSize: 12, boxSizing: "border-box" }} />
              </div>
              <div>
                <label style={{ fontSize: 10, color: "#64748B", display: "block", marginBottom: 4 }}>Code</label>
                <select value={pointCode} onChange={e => setPointCode(e.target.value)}
                  style={{ width: "100%", background: "#0D1117", border: "1px solid #1E2D3D", borderRadius: 6, padding: "6px 10px", color: "#fff", fontSize: 12 }}>
                  {["LIM","VOI","BAT","AXE","TN","BOR","RTE","MUR","ARB","IMP"].map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
            {current ? (
              <div style={{ background: "#0D1117", borderRadius: 8, padding: 10, marginBottom: 10 }}>
                <div style={{ fontSize: 11, fontFamily: "monospace" }}>
                  <span style={{ color: "#3B82F6" }}>X: {current.x.toFixed(3)}</span>{" | "}
                  <span style={{ color: "#22C55E" }}>Y: {current.y.toFixed(3)}</span>
                </div>
                <div style={{ fontSize: 10, color: "#64748B", marginTop: 2 }}>Lat: {current.lat.toFixed(6)}° | Lng: {current.lng.toFixed(6)}°</div>
              </div>
            ) : (
              <div style={{ background: "#0D1117", borderRadius: 8, padding: 10, marginBottom: 10, textAlign: "center", color: "#64748B", fontSize: 11 }}>
                Mode 📍 → cliquez sur la carte
              </div>
            )}
            <button onClick={addPoint} disabled={!current || mode !== "pick"}
              style={{ width: "100%", background: current && mode === "pick" ? "#22C55E" : "#1E2D3D", border: "none", color: "#fff", padding: "8px", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 600 }}>
              ✅ Ajouter ce point
            </button>
          </div>

          <div style={{ flex: 1, overflowY: "auto", padding: 12 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#E2EAF2", marginBottom: 10 }}>📍 Points ({picked.length})</div>
            {picked.length === 0 ? (
              <div style={{ textAlign: "center", padding: 20, color: "#64748B", fontSize: 12 }}>Aucun point ajouté</div>
            ) : (
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11 }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid #1E2D3D" }}>
                    {["Nom", "Code", "X", "Y"].map(h => <th key={h} style={{ padding: "4px 6px", color: "#64748B", textAlign: "left", fontSize: 10 }}>{h}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {picked.map((p, i) => (
                    <tr key={i} style={{ borderBottom: "1px solid #0D1117" }}>
                      <td style={{ padding: "5px 6px", color: "#F97316", fontWeight: 600 }}>{p.name}</td>
                      <td style={{ padding: "5px 6px", color: "#22C55E" }}>{p.code}</td>
                      <td style={{ padding: "5px 6px", color: "#3B82F6", fontFamily: "monospace", fontSize: 10 }}>{p.x.toFixed(1)}</td>
                      <td style={{ padding: "5px 6px", color: "#22C55E", fontFamily: "monospace", fontSize: 10 }}>{p.y.toFixed(1)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {picked.length > 0 && (
            <div style={{ padding: 12, borderTop: "1px solid #1E2D3D", display: "flex", flexDirection: "column", gap: 8 }}>
              <button onClick={exportCSV} style={{ background: "#F97316", border: "none", color: "#fff", padding: "8px", borderRadius: 8, cursor: "pointer", fontSize: 12, fontWeight: 600 }}>⬇️ Télécharger CSV</button>
              <button onClick={() => setPicked([])} style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#EF4444", padding: "8px", borderRadius: 8, cursor: "pointer", fontSize: 12 }}>🗑️ Effacer points</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
