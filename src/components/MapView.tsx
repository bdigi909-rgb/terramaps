"use client";
import { useEffect, useRef } from "react";

interface Point {
  id: number;
  name?: string;
  code?: string;
  x: number;
  y: number;
  z: number;
  description?: string;
}

interface MapViewProps {
  points: Point[];
  epsg?: string;
}

export default function MapView({ points, epsg }: MapViewProps) {
  const mapRef = useRef<any>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (mapInstanceRef.current) return;

    import("leaflet").then((L) => {
      // Fix default markers
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
        iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
        shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
      });

      const map = L.map(mapRef.current, {
        center: [31.9, -5.5],
        zoom: 6,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
        maxZoom: 19,
      }).addTo(map);

      mapInstanceRef.current = map;
    });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!mapInstanceRef.current || points.length === 0) return;

    import("leaflet").then((L) => {
      // Clear old markers
      markersRef.current.forEach(m => m.remove());
      markersRef.current = [];

      const codeColors: Record<string, string> = {
        LIM: "#EF4444", VOI: "#F59E0B", BAT: "#3B82F6",
        RTE: "#6B7280", CAN: "#06B6D4", ARB: "#22C55E",
        BOR: "#A855F7", AXE: "#F97316", BN: "#EC4899",
        GP: "#ec4899", IMP: "#f59e0b", BATH: "#06b6d4", BERGE: "#14b8a6",
      };

      const bounds: [number, number][] = [];

      points.forEach((pt) => {
        // Convert Lambert Maroc (EPSG:26191) to WGS84
        let lat = pt.y, lng = pt.x;
        if (Math.abs(pt.x) > 180 || Math.abs(pt.y) > 90) {
          const x0 = 500000, y0 = 300000;
          const lng0 = -5.4 * Math.PI / 180;
          const lat0 = 33.3 * Math.PI / 180;
          const dx = pt.x - x0;
          const dy = pt.y - y0;
          lat = (lat0 + dy / 111320) * 180 / Math.PI;
          lng = (lng0 + dx / (111320 * Math.cos(lat0))) * 180 / Math.PI;
        }
        if (isNaN(lat) || isNaN(lng)) return;

        const color = codeColors[pt.code ?? ''] || '#64748b';

        const icon = L.divIcon({
          className: "",
          html: `<div style="
            width: 12px; height: 12px; border-radius: 50%;
            background: ${color}; border: 2px solid white;
            box-shadow: 0 1px 4px rgba(0,0,0,0.4);
          "></div>`,
          iconSize: [12, 12],
          iconAnchor: [6, 6],
        });

        const marker = L.marker([lat, lng], { icon })
          .bindPopup(`
            <div style="font-family: Arial; min-width: 160px;">
              <div style="font-weight: bold; color: ${color}; font-size: 14px;">${pt.name}</div>
              <div style="color: #64748b; font-size: 11px; margin: 2px 0;">Code: ${pt.code}</div>
              <hr style="margin: 6px 0; border-color: #e2e8f0;"/>
              <div style="font-size: 12px;">
                <div>X: <b>${pt.x.toFixed(3)}</b></div>
                <div>Y: <b>${pt.y.toFixed(3)}</b></div>
                <div>Z: <b style="color: #a855f7">${pt.z.toFixed(3)} m</b></div>
              </div>
              ${pt.description ? `<div style="font-size: 11px; color: #64748b; margin-top: 4px;">${pt.description}</div>` : ""}
            </div>
          `)
          .addTo(mapInstanceRef.current);

        markersRef.current.push(marker);
        bounds.push([lat, lng]);
      });

      // Connect points of same code with polylines
      const codeGroups: Record<string, [number, number][]> = {};
      bounds.forEach((b, i) => {
        const code = points[i]?.code || "—";
        if (!codeGroups[code]) codeGroups[code] = [];
        codeGroups[code].push(b);
      });

      const connectCodes = ["LIM", "VOI", "BAT", "MUR", "RTE", "CAN", "AXE"];
      Object.entries(codeGroups).forEach(([code, pts]) => {
        if (connectCodes.includes(code) && pts.length > 1) {
          const color = codeColors[code] || "#64748b";
          L.polyline(pts, { color, weight: 2, opacity: 0.7, dashArray: code === "LIM" ? "5,5" : undefined })
            .addTo(mapInstanceRef.current);
        }
      });

      // Remove old legends
      document.querySelectorAll(".leaflet-control-container .leaflet-bottom.leaflet-left").forEach(el => el.innerHTML = "");
      // Add legend
      const legend = (L.control as any)({ position: "bottomleft" });
      legend.onAdd = () => {
        const div = L.DomUtil.create("div", "");
        div.style.cssText = "background:rgba(13,17,23,0.9);padding:8px 12px;border-radius:8px;border:1px solid #1E2D3D;font-size:11px;color:#E2EAF2;";
        const activeCodes = Object.keys(codeGroups);
        div.innerHTML = "<b style=color:#F97316>Légende</b><br/>" + activeCodes.map(c => 
          `<span style="color:${codeColors[c]||"#64748b"}">● </span>${c} (${codeGroups[c].length})`
        ).join("<br/>");
        return div;
      };
      legend.addTo(mapInstanceRef.current);

      if (bounds.length > 0) {
        mapInstanceRef.current.fitBounds(bounds, { padding: [40, 40] });
      }
    });
  }, [points]);

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css"
      />
      <div ref={mapRef} style={{ width: "100%", height: "100%", borderRadius: 8 }} />
    </div>
  );
}
