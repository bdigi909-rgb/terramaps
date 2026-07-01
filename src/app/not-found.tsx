"use client";
import Link from "next/link";

export default function NotFound() {
  return (
    <div style={{ minHeight: "100vh", background: "#0D1117", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Arial, sans-serif" }}>
      <div style={{ textAlign: "center", padding: 40 }}>
        <div style={{ fontSize: 80, marginBottom: 16 }}>🗺️</div>
        <div style={{ fontSize: 120, fontWeight: 700, color: "#1E2D3D", lineHeight: 1 }}>404</div>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: "#E2EAF2", margin: "16px 0 8px" }}>
          Page introuvable
        </h1>
        <p style={{ fontSize: 14, color: "#64748B", marginBottom: 32, maxWidth: 400 }}>
          Cette page n'existe pas ou a été déplacée. Retournez au dashboard pour continuer.
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
          <Link href="/dashboard" style={{ background: "#F97316", color: "#fff", padding: "12px 24px", borderRadius: 8, textDecoration: "none", fontSize: 14, fontWeight: 600 }}>
            🏠 Retour au Dashboard
          </Link>
          <Link href="/login" style={{ background: "#161B22", color: "#8BACC8", padding: "12px 24px", borderRadius: 8, textDecoration: "none", fontSize: 14, border: "1px solid #1E2D3D" }}>
            🔑 Se connecter
          </Link>
        </div>
        <div style={{ marginTop: 40, fontSize: 12, color: "#4B6080" }}>
          Terra<span style={{ color: "#F97316" }}>Maps</span> v2.0 — terramaps.vercel.app
        </div>
      </div>
    </div>
  );
}
