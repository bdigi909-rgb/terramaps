"use client";
import { useState, useEffect } from "react";

export default function RatingsOverview() {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/projects").then(r => r.json()).then(async (projects) => {
      if (!Array.isArray(projects)) return;
      const ratings = await Promise.all(projects.map(async (p: any) => {
        const r = await fetch(`/api/ratings?projectId=${p.id}`).then(r => r.json());
        return { name: p.name, average: r.average, count: r.ratings?.length || 0 };
      }));
      setData(ratings.filter((r: any) => r.count > 0));
    });
  }, []);

  if (data.length === 0) return <div style={{ color: "#64748B", fontSize: 13 }}>Aucune note client pour le moment</div>;

  return (
    <div style={{ display: "grid", gap: 8 }}>
      {data.map((r: any) => (
        <div key={r.name} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid #1E2D3D" }}>
          <span style={{ fontSize: 13, color: "#E2EAF2" }}>{r.name}</span>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ color: "#F97316", fontSize: 16 }}>{"★".repeat(Math.round(parseFloat(r.average)))}</span>
            <span style={{ fontSize: 12, color: "#8BACC8" }}>{r.average}/5 ({r.count} avis)</span>
          </div>
        </div>
      ))}
    </div>
  );
}
