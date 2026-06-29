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
        AXE: "#f97316", TN: "#22c55e", BN: "#3b82f6", BOR: "#a855f7",
        GP: "#ec4899", IMP: "#f59e0b", BATH: "#06b6d4", BERGE: "#14b8a6",
      };

      const bounds: [number, number][] = [];

      points.forEach((pt) => {
        // Convert Lambert Maroc to lat/lng (approximation)
        let lat = pt.y, lng = pt.x;
        
        // If coordinates look like Lambert (large numbers), convert approximately
        if (Math.abs(pt.x) > 180 || Math.abs(pt.y) > 90) {
          // Simple approximation for Maroc Lambert (EPSG:26191)
          lat = pt.y / 111320;
          lng = pt.x / (111320 * Math.cos(lat * Math.PI / 180));
          // Offset for Morocco
          if (pt.x > 100000 && pt.x < 1000000) {
            lat = 30 + (pt.y - 3500000) / 111320;
            lng = -5 + (pt.x - 500000) / 111320;
          }
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
