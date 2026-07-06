"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";

interface PickedPoint {
  lat: number;
  lng: number;
  x: number;
  y: number;
  name: string;
}

// Conversion WGS84 -> Lambert Maroc (EPSG:26191) approximation
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

export default function MapToolsPage() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const [picked, setPicked] = useState<PickedPoint[]>([]);
  const [current, setCurrent] = useState<{ lat: number; lng: number; x: number; y: number } | null>(null);
  const [pointName, setPointName] = useState("PT001");
  const [pointCode, setPointCode] = useState("LIM");
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;
    import("leaflet").then(L => {
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
        shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
      });

      const map = L.map(mapRef.current!, { center: [31.9, -5.5], zoom: 6 });
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors", maxZoom: 19,
      }).addTo(map);

      // Layer satellite
      const satellite = L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", {
        attribution: "© Esri", maxZoom: 19,
      });

      L.control.layers({ "OpenStreetMap": L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 19 }), "Satellite": satellite }).addTo(map);

      // ── OUTILS MESURE ET SUPERFICIE ──────────────────────────
      let measureMode = false;
      let areaMode = false;
      let measurePoints: [number, number][] = [];
      let measureMarkers: any[] = [];
      let measureLines: any[] = [];
      let totalDistance = 0;

      // Bouton mesure distance
      const measureBtn = (L as any).control({ position: "topleft" });
      measureBtn.onAdd = () => {
        const div = L.DomUtil.create("div", "leaflet-bar leaflet-control");
        div.innerHTML = `<a href="#" title="Mesurer distance" style="font-size:16px;display:flex;align-items:center;justify-content:center;width:30px;height:30px;text-decoration:none">📏</a>`;
        div.onclick = (e) => {
          e.preventDefault(); e.stopPropagation();
          measureMode = !measureMode; areaMode = false;
          measurePoints = []; totalDistance = 0;
          measureMarkers.forEach(m => map.removeLayer(m));
          measureLines.forEach(l => map.removeLayer(l));
          measureMarkers = []; measureLines = [];
          div.style.background = measureMode ? "#F97316" : "white";
          map.getContainer().style.cursor = measureMode ? "crosshair" : "";
        };
        return div;
      };
      measureBtn.addTo(map);

      // Bouton superficie
      const areaBtn = (L as any).control({ position: "topleft" });
      areaBtn.onAdd = () => {
        const div = L.DomUtil.create("div", "leaflet-bar leaflet-control");
        div.innerHTML = `<a href="#" title="Calculer superficie" style="font-size:16px;display:flex;align-items:center;justify-content:center;width:30px;height:30px;text-decoration:none">📐</a>`;
        div.onclick = (e) => {
          e.preventDefault(); e.stopPropagation();
          areaMode = !areaMode; measureMode = false;
          measurePoints = [];
          measureMarkers.forEach(m => map.removeLayer(m));
          measureLines.forEach(l => map.removeLayer(l));
          measureMarkers = []; measureLines = [];
          div.style.background = areaMode ? "#22C55E" : "white";
          map.getContainer().style.cursor = areaMode ? "crosshair" : "";
        };
        return div;
      };
      areaBtn.addTo(map);

      // Bouton effacer mesures
      const clearBtn = (L as any).control({ position: "topleft" });
      clearBtn.onAdd = () => {
        const div = L.DomUtil.create("div", "leaflet-bar leaflet-control");
        div.innerHTML = `<a href="#" title="Effacer mesures" style="font-size:16px;display:flex;align-items:center;justify-content:center;width:30px;height:30px;text-decoration:none">🗑️</a>`;
        div.onclick = (e) => {
          e.preventDefault(); e.stopPropagation();
          measurePoints = []; totalDistance = 0;
          measureMarkers.forEach(m => map.removeLayer(m));
          measureLines.forEach(l => map.removeLayer(l));
          measureMarkers = []; measureLines = [];
          measureMode = false; areaMode = false;
          map.getContainer().style.cursor = "";
        };
        return div;
      };
      clearBtn.addTo(map);

      // Gestion des clics mesure/superficie
      map.on("click", (e: any) => {
        if (!measureMode && !areaMode) return;
        const { lat, lng } = e.latlng;
        measurePoints.push([lat, lng]);

        // Marqueur point
        const dot = L.circleMarker([lat, lng], { radius: 5, color: measureMode ? "#F97316" : "#22C55E", fillColor: measureMode ? "#F97316" : "#22C55E", fillOpacity: 1 }).addTo(map);
        measureMarkers.push(dot);

        if (measureMode && measurePoints.length >= 2) {
          const prev = measurePoints[measurePoints.length - 2];
          const curr = measurePoints[measurePoints.length - 1];
          const line = L.polyline([prev, curr], { color: "#F97316", weight: 2, dashArray: "5,5" }).addTo(map);
          measureLines.push(line);

          // Distance segment
          const R = 6371000;
          const dLat = (curr[0]-prev[0]) * Math.PI/180;
          const dLng = (curr[1]-prev[1]) * Math.PI/180;
          const a = Math.sin(dLat/2)**2 + Math.cos(prev[0]*Math.PI/180)*Math.cos(curr[0]*Math.PI/180)*Math.sin(dLng/2)**2;
          const segDist = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
          totalDistance += segDist;

          dot.bindPopup(`<b style="color:#F97316">Distance totale: ${totalDistance.toFixed(2)} m</b><br/>Segment: ${segDist.toFixed(2)} m`).openPopup();
        }

        if (areaMode && measurePoints.length >= 3) {
          measureLines.forEach(l => map.removeLayer(l));
          measureLines = [];
          const polygon = L.polygon(measurePoints, { color: "#22C55E", fillOpacity: 0.2, weight: 2 }).addTo(map);
          measureLines.push(polygon);

          // Superficie (formule Shoelace)
          let area = 0;
          const lambert = measurePoints.map(p => wgs84ToLambert(p[0], p[1]));
          for (let i = 0; i < lambert.length; i++) {
            const j = (i+1) % lambert.length;
            area += lambert[i].x * lambert[j].y;
            area -= lambert[j].x * lambert[i].y;
          }
          area = Math.abs(area) / 2;

          dot.bindPopup(`<b style="color:#22C55E">Superficie: ${area.toFixed(2)} m²</b><br/>${(area/10000).toFixed(4)} Ha<br/>Points: ${measurePoints.length}`).openPopup();
        }
      });

      map.on("click", (e: any) => {
        const { lat, lng } = e.latlng;
        const lambert = wgs84ToLambert(lat, lng);
        setCurrent({ lat, lng, ...lambert });
        
        // Marqueur temporaire
        const tempMarker = L.marker([lat, lng], {
          icon: L.divIcon({
            className: "",
            html: `<div style="width:14px;height:14px;border-radius:50%;background:#F97316;border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,0.4)"></div>`,
            iconSize: [14, 14], iconAnchor: [7, 7],
          })
        }).addTo(map);

        tempMarker.bindPopup(`
          <div style="font-family:Arial;font-size:12px;min-width:180px">
            <b style="color:#F97316">📍 Point sélectionné</b><br/>
            <hr style="margin:4px 0"/>
            <b>WGS84 (GPS)</b><br/>
            Lat: <b>${lat.toFixed(6)}</b><br/>
            Lng: <b>${lng.toFixed(6)}</b><br/>
            <hr style="margin:4px 0"/>
            <b>Lambert Maroc (EPSG:26191)</b><br/>
            X: <b style="color:#3B82F6">${lambert.x.toFixed(3)}</b><br/>
            Y: <b style="color:#22C55E">${lambert.y.toFixed(3)}</b>
          </div>
        `).openPopup();

        setTimeout(() => map.removeLayer(tempMarker), 5000);
      });

      mapInstance.current = map;
    });
  }, []);

  function addPoint() {
    if (!current) return;
    const newPoint: PickedPoint = {
      lat: current.lat,
      lng: current.lng,
      x: current.x,
      y: current.y,
      name: pointName,
    };
    setPicked(prev => [...prev, newPoint]);

    // Incrémenter le nom automatiquement
    const match = pointName.match(/^([A-Z]+)(\d+)$/);
    if (match) {
      setPointName(match[1] + String(parseInt(match[2]) + 1).padStart(3, "0"));
    }

    // Ajouter marqueur permanent
    import("leaflet").then(L => {
      if (!mapInstance.current) return;
      const marker = L.marker([current.lat, current.lng], {
        icon: L.divIcon({
          className: "",
          html: `<div style="width:12px;height:12px;border-radius:50%;background:#22C55E;border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,0.4)"></div>`,
          iconSize: [12, 12], iconAnchor: [6, 6],
        })
      }).addTo(mapInstance.current);
      marker.bindPopup(`<b style="color:#22C55E">✅ ${newPoint.name}</b><br/>X: ${newPoint.x}<br/>Y: ${newPoint.y}`);
    });
  }

  function copyCSV() {
    const csv = picked.map(p => `${p.name},${p.x},${p.y},0`).join("\n");
    navigator.clipboard.writeText(csv);
  }

  function exportCSV() {
    const csv = picked.map(p => `${p.name},${p.x},${p.y},0`).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "points_lambert_maroc.csv";
    a.click();
  }

  return (
    <div style={{ minHeight: "100vh", background: "#0D1117", color: "#E2EAF2", fontFamily: "Arial, sans-serif" }}>
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css" />
      
      {/* Header */}
      <div style={{ background: "#161B22", borderBottom: "1px solid #1E2D3D", padding: "0 24px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 56 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ fontSize: 18, fontWeight: 700 }}>Terra<span style={{ color: "#F97316" }}>Maps</span></div>
          <span style={{ background: "#22C55E", color: "#fff", fontSize: 10, fontWeight: 700, padding: "2px 10px", borderRadius: 20 }}>OUTILS CARTE</span>
        </div>
        <Link href="/dashboard" style={{ color: "#64748B", fontSize: 13, textDecoration: "none" }}>← Dashboard</Link>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", height: "calc(100vh - 56px)" }}>
        
        {/* Map */}
        <div style={{ position: "relative" }}>
          <div ref={mapRef} style={{ width: "100%", height: "100%" }} />
          
          {/* Info banner */}
          <div style={{ position: "absolute", top: 10, left: "50%", transform: "translateX(-50%)", zIndex: 1000, background: "rgba(13,17,23,0.9)", border: "1px solid #F97316", borderRadius: 10, padding: "8px 16px", fontSize: 12, color: "#E2EAF2", textAlign: "center" }}>
            🖱️ Cliquez sur la carte pour obtenir les coordonnées Lambert Maroc
          </div>

          {/* Current coords */}
          {current && (
            <div style={{ position: "absolute", bottom: 30, left: 10, zIndex: 1000, background: "rgba(13,17,23,0.95)", border: "1px solid #1E2D3D", borderRadius: 10, padding: "12px 16px", fontSize: 12 }}>
              <div style={{ fontWeight: 700, color: "#F97316", marginBottom: 6 }}>📍 Coordonnées du clic</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                <div>
                  <div style={{ fontSize: 10, color: "#64748B" }}>WGS84 Latitude</div>
                  <div style={{ color: "#E2EAF2", fontFamily: "monospace" }}>{current.lat.toFixed(6)}°</div>
                </div>
                <div>
                  <div style={{ fontSize: 10, color: "#64748B" }}>WGS84 Longitude</div>
                  <div style={{ color: "#E2EAF2", fontFamily: "monospace" }}>{current.lng.toFixed(6)}°</div>
                </div>
                <div>
                  <div style={{ fontSize: 10, color: "#64748B" }}>Lambert X (Est)</div>
                  <div style={{ color: "#3B82F6", fontFamily: "monospace", fontWeight: 700 }}>{current.x.toFixed(3)} m</div>
                </div>
                <div>
                  <div style={{ fontSize: 10, color: "#64748B" }}>Lambert Y (Nord)</div>
                  <div style={{ color: "#22C55E", fontFamily: "monospace", fontWeight: 700 }}>{current.y.toFixed(3)} m</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Panel */}
        <div style={{ background: "#161B22", borderLeft: "1px solid #1E2D3D", display: "flex", flexDirection: "column", overflow: "hidden" }}>
          
          {/* Add point form */}
          <div style={{ padding: 16, borderBottom: "1px solid #1E2D3D" }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#E2EAF2", marginBottom: 12 }}>➕ Ajouter un point</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 10 }}>
              <div>
                <label style={{ fontSize: 10, color: "#64748B", display: "block", marginBottom: 4 }}>Nom du point</label>
                <input value={pointName} onChange={e => setPointName(e.target.value)}
                  style={{ width: "100%", background: "#0D1117", border: "1px solid #1E2D3D", borderRadius: 6, padding: "6px 10px", color: "#fff", fontSize: 12, boxSizing: "border-box" }} />
              </div>
              <div>
                <label style={{ fontSize: 10, color: "#64748B", display: "block", marginBottom: 4 }}>Code</label>
                <select value={pointCode} onChange={e => setPointCode(e.target.value)}
                  style={{ width: "100%", background: "#0D1117", border: "1px solid #1E2D3D", borderRadius: 6, padding: "6px 10px", color: "#fff", fontSize: 12 }}>
                  {["LIM","VOI","BAT","AXE","TN","BOR","RTE","MUR","ARB","IMP"].map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>
            {current ? (
              <div style={{ marginBottom: 10, background: "#0D1117", borderRadius: 8, padding: 10 }}>
                <div style={{ fontSize: 10, color: "#64748B", marginBottom: 4 }}>Coordonnées Lambert sélectionnées</div>
                <div style={{ fontSize: 12, fontFamily: "monospace" }}>
                  <span style={{ color: "#3B82F6" }}>X: {current.x.toFixed(3)}</span>
                  {" | "}
                  <span style={{ color: "#22C55E" }}>Y: {current.y.toFixed(3)}</span>
                </div>
              </div>
            ) : (
              <div style={{ marginBottom: 10, background: "#0D1117", borderRadius: 8, padding: 10, textAlign: "center", color: "#64748B", fontSize: 12 }}>
                Cliquez sur la carte pour sélectionner un point
              </div>
            )}
            <button onClick={addPoint} disabled={!current}
              style={{ width: "100%", background: current ? "#22C55E" : "#1E2D3D", border: "none", color: "#fff", padding: "8px", borderRadius: 8, cursor: current ? "pointer" : "not-allowed", fontSize: 13, fontWeight: 600 }}>
              ✅ Ajouter ce point
            </button>
          </div>

          {/* Points list */}
          <div style={{ flex: 1, overflowY: "auto", padding: 12 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#E2EAF2", marginBottom: 10 }}>
              📍 Points collectés ({picked.length})
            </div>
            {picked.length === 0 ? (
              <div style={{ textAlign: "center", padding: 20, color: "#64748B", fontSize: 12 }}>
                Aucun point ajouté.<br/>Cliquez sur la carte puis "Ajouter ce point".
              </div>
            ) : (
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11 }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid #1E2D3D" }}>
                    {["Nom", "X", "Y"].map(h => (
                      <th key={h} style={{ padding: "4px 6px", color: "#64748B", textAlign: "left", fontSize: 10 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {picked.map((p, i) => (
                    <tr key={i} style={{ borderBottom: "1px solid #0D1117" }}>
                      <td style={{ padding: "5px 6px", color: "#F97316", fontWeight: 600 }}>{p.name}</td>
                      <td style={{ padding: "5px 6px", color: "#3B82F6", fontFamily: "monospace", fontSize: 10 }}>{p.x.toFixed(1)}</td>
                      <td style={{ padding: "5px 6px", color: "#22C55E", fontFamily: "monospace", fontSize: 10 }}>{p.y.toFixed(1)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Export buttons */}
          {picked.length > 0 && (
            <div style={{ padding: 12, borderTop: "1px solid #1E2D3D", display: "flex", flexDirection: "column", gap: 8 }}>
              <button onClick={copyCSV}
                style={{ background: "#0D1117", border: "1px solid #1E2D3D", color: "#E2EAF2", padding: "8px", borderRadius: 8, cursor: "pointer", fontSize: 12, fontWeight: 600 }}>
                📋 Copier CSV
              </button>
              <button onClick={exportCSV}
                style={{ background: "#F97316", border: "none", color: "#fff", padding: "8px", borderRadius: 8, cursor: "pointer", fontSize: 12, fontWeight: 600 }}>
                ⬇️ Télécharger CSV
              </button>
              <button onClick={() => setPicked([])}
                style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#EF4444", padding: "8px", borderRadius: 8, cursor: "pointer", fontSize: 12 }}>
                🗑️ Effacer tout
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
