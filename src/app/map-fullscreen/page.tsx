"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import Link from "next/link";

const MapView = dynamic(() => import("@/components/MapView"), { ssr: false });

function MapFullscreenContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const projectId = searchParams.get("projectId");
  const [points, setPoints] = useState<any[]>([]);
  const [projectName, setProjectName] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!projectId) return;
    fetch(`/api/projects/${projectId}/survey-points`)
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) setPoints(data);
        setLoading(false);
      });
    fetch(`/api/projects/${projectId}`)
      .then(r => r.json())
      .then(data => { if (data.name) setProjectName(data.name); });
  }, [projectId]);

  return (
    <div style={{ width: "100vw", height: "100vh", background: "#0D1117", display: "flex", flexDirection: "column" }}>
      {/* Mini header */}
      <div style={{ background: "rgba(22,27,34,0.95)", backdropFilter: "blur(10px)", borderBottom: "1px solid #1E2D3D", padding: "0 16px", height: 48, display: "flex", alignItems: "center", justifyContent: "space-between", zIndex: 1000, flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ fontSize: 16, fontWeight: 700 }}>Terra<span style={{ color: "#F97316" }}>Maps</span></div>
          {projectName && <span style={{ fontSize: 13, color: "#8BACC8" }}>— {projectName}</span>}
          <span style={{ background: "#22C55E22", color: "#22C55E", fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 20 }}>
            {points.length} points
          </span>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <span style={{ fontSize: 12, color: "#64748B" }}>Vue plein écran</span>
          <button onClick={() => router.back()}
            style={{ background: "#F97316", border: "none", color: "#fff", padding: "6px 14px", borderRadius: 8, cursor: "pointer", fontSize: 12, fontWeight: 600 }}>
            ✕ Fermer
          </button>
        </div>
      </div>

      {/* Carte */}
      <div style={{ flex: 1, position: "relative" }}>
        {loading ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "#64748B" }}>
            Chargement de la carte...
          </div>
        ) : (
          <MapView points={points} height="100%" />
        )}
      </div>

      {/* Info bas */}
      <div style={{ background: "rgba(22,27,34,0.9)", borderTop: "1px solid #1E2D3D", padding: "8px 16px", display: "flex", gap: 16, alignItems: "center", flexShrink: 0 }}>
        <span style={{ fontSize: 11, color: "#64748B" }}>Système: EPSG:26191 — Lambert Maroc</span>
        <span style={{ fontSize: 11, color: "#64748B" }}>|</span>
        <span style={{ fontSize: 11, color: "#64748B" }}>Fond: OpenStreetMap</span>
        {projectId && (
          <>
            <span style={{ fontSize: 11, color: "#64748B" }}>|</span>
            <Link href={`/projects/${projectId}`} style={{ fontSize: 11, color: "#F97316", textDecoration: "none" }}>← Retour au projet</Link>
          </>
        )}
      </div>
    </div>
  );
}

export default function MapFullscreenPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh", background: "#0D1117", display: "flex", alignItems: "center", justifyContent: "center", color: "#E2EAF2" }}>Chargement...</div>}>
      <MapFullscreenContent />
    </Suspense>
  );
}
