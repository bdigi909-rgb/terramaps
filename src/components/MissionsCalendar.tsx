"use client";
import { useState, useEffect } from "react";

export default function MissionsCalendar({ projectIds }: { projectIds: number[] }) {
  const [missions, setMissions] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/missions").then(r => r.json()).then(d => {
      if (Array.isArray(d)) {
        setMissions(d.filter((m: any) => projectIds.includes(m.project_id) || projectIds.includes(parseInt(m.projet))));
      }
    });
  }, [projectIds]);

  const statusColor: any = {
    planifiee: "#3B82F6",
    en_cours: "#F97316",
    terminee: "#22C55E",
    annulee: "#EF4444"
  };

  const statusLabel: any = {
    planifiee: "Planifiée",
    en_cours: "En cours",
    terminee: "Terminée",
    annulee: "Annulée"
  };

  if (missions.length === 0) return (
    <div style={{ color: "#64748B", textAlign: "center", padding: 20, fontSize: 13 }}>Aucune mission planifiée</div>
  );

  return (
    <div style={{ display: "grid", gap: 8 }}>
      {missions.map(m => (
        <div key={m.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", background: "#0D1117", borderRadius: 8, borderLeft: `3px solid ${statusColor[m.statut] || "#3B82F6"}` }}>
          <div style={{ minWidth: 80, fontSize: 11, color: "#8BACC8", fontWeight: 600 }}>
            {new Date(m.date).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" })}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#E2EAF2" }}>{m.titre}</div>
            <div style={{ fontSize: 11, color: "#64748B" }}>Projet: {m.projet} — Technicien: {m.technicien}</div>
          </div>
          <span style={{ background: statusColor[m.statut] + "22", color: statusColor[m.statut], fontSize: 11, padding: "2px 8px", borderRadius: 20 }}>
            {statusLabel[m.statut] || m.statut}
          </span>
        </div>
      ))}
    </div>
  );
}
