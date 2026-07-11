"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

interface ServiceStatus {
  name: string;
  status: "operational" | "degraded" | "down";
  latency?: number;
  lastCheck: string;
}

export default function StatusPage() {
  const [services, setServices] = useState<ServiceStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState("");

  async function checkServices() {
    setLoading(true);
    const results: ServiceStatus[] = [];
    const checks = [
      { name: "API TerraMaps", url: "/api/health" },
      { name: "Base de données", url: "/api/dashboard" },
      { name: "Authentification", url: "/api/auth/me" },
      { name: "Projets", url: "/api/projects" },
      { name: "Survey Points", url: "/api/projects/3/survey-points" },
      { name: "Notifications", url: "/api/notifications" },
    ];

    for (const check of checks) {
      const start = Date.now();
      try {
        const res = await fetch(check.url);
        const latency = Date.now() - start;
        results.push({
          name: check.name,
          status: res.ok ? "operational" : "degraded",
          latency,
          lastCheck: new Date().toLocaleTimeString("fr-FR"),
        });
      } catch {
        results.push({
          name: check.name,
          status: "down",
          lastCheck: new Date().toLocaleTimeString("fr-FR"),
        });
      }
    }

    setServices(results);
    setLastUpdate(new Date().toLocaleTimeString("fr-FR"));
    setLoading(false);
  }

  useEffect(() => {
    checkServices();
    const interval = setInterval(checkServices, 60000);
    return () => clearInterval(interval);
  }, []);

  const allOperational = services.every(s => s.status === "operational");
  const hasDegraded = services.some(s => s.status === "degraded");
  const hasDown = services.some(s => s.status === "down");

  const globalStatus = hasDown ? "down" : hasDegraded ? "degraded" : "operational";
  const globalColor = globalStatus === "operational" ? "#22C55E" : globalStatus === "degraded" ? "#F59E0B" : "#EF4444";
  const globalLabel = globalStatus === "operational" ? "Tous les systemes operationnels" : globalStatus === "degraded" ? "Degradation partielle" : "Panne detectee";
  const globalIcon = globalStatus === "operational" ? "✅" : globalStatus === "degraded" ? "⚠️" : "❌";

  const statusColor = { operational: "#22C55E", degraded: "#F59E0B", down: "#EF4444" };
  const statusLabel = { operational: "Operationnel", degraded: "Degrade", down: "Hors service" };

  return (
    <div style={{ minHeight: "100vh", background: "#0D1117", color: "#E2EAF2", fontFamily: "Arial" }}>
      {/* Header */}
      <div style={{ background: "#161B22", borderBottom: "1px solid #1E2D3D", padding: "0 32px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 56 }}>
        <div style={{ fontSize: 18, fontWeight: 700 }}>Terra<span style={{ color: "#F97316" }}>Maps</span> <span style={{ fontSize: 13, color: "#64748B", fontWeight: 400 }}>Status</span></div>
        <Link href="/dashboard" style={{ color: "#64748B", fontSize: 13, textDecoration: "none" }}>← Dashboard</Link>
      </div>

      <div style={{ padding: 32, maxWidth: 800, margin: "0 auto" }}>
        {/* Global Status */}
        <div style={{ background: `${globalColor}11`, border: `2px solid ${globalColor}33`, borderRadius: 16, padding: 32, textAlign: "center", marginBottom: 32 }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>{globalIcon}</div>
          <h1 style={{ margin: "0 0 8px", fontSize: 24, fontWeight: 700, color: globalColor }}>{globalLabel}</h1>
          <p style={{ color: "#64748B", margin: 0, fontSize: 13 }}>Dernière mise à jour : {lastUpdate}</p>
          <button onClick={checkServices} style={{ marginTop: 16, background: "#161B22", border: "1px solid #1E2D3D", color: "#E2EAF2", padding: "8px 20px", borderRadius: 8, cursor: "pointer", fontSize: 13 }}>
            🔄 Actualiser
          </button>
        </div>

        {/* Services */}
        <div style={{ background: "#161B22", border: "1px solid #1E2D3D", borderRadius: 12, overflow: "hidden", marginBottom: 24 }}>
          <div style={{ padding: "16px 24px", borderBottom: "1px solid #1E2D3D" }}>
            <h2 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: "#8BACC8" }}>Services TerraMaps</h2>
          </div>
          {loading ? (
            <div style={{ padding: 40, textAlign: "center", color: "#64748B" }}>Vérification en cours...</div>
          ) : (
            services.map((s, i) => (
              <div key={i} style={{ padding: "16px 24px", borderBottom: i < services.length - 1 ? "1px solid #1E2D3D" : "none", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 10, height: 10, borderRadius: "50%", background: statusColor[s.status] }} />
                  <span style={{ fontSize: 14, color: "#E2EAF2" }}>{s.name}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  {s.latency && <span style={{ fontSize: 12, color: "#64748B" }}>{s.latency}ms</span>}
                  <span style={{ fontSize: 12, fontWeight: 600, color: statusColor[s.status] }}>{statusLabel[s.status]}</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Info */}
        <div style={{ background: "#161B22", border: "1px solid #1E2D3D", borderRadius: 12, padding: 24 }}>
          <h3 style={{ margin: "0 0 16px", fontSize: 14, color: "#8BACC8" }}>Informations système</h3>
          {[
            { label: "Version", value: "TerraMaps v2.0" },
            { label: "Hébergement", value: "Vercel (Washington DC)" },
            { label: "Base de données", value: "PostgreSQL Neon (EU West)" },
            { label: "Uptime", value: "99.9%" },
          ].map(item => (
            <div key={item.label} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #1E2D3D" }}>
              <span style={{ fontSize: 13, color: "#64748B" }}>{item.label}</span>
              <span style={{ fontSize: 13, color: "#E2EAF2", fontWeight: 600 }}>{item.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
