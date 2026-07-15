"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ClientSpacePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [devis, setDevis] = useState<any[]>([]);
  const [factures, setFactures] = useState<any[]>([]);
  const [unreadReplies, setUnreadReplies] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/auth/me").then(r => r.json()).then(async d => {
      if (!d.user) { router.push("/login"); return; }
      if (d.user.role !== "client" && d.user.role !== "client_admin") { router.push("/dashboard"); return; }
      setUser(d.user);
      // Demander permission notifications push
      // Demander permission notifications push
      try {
        if ("Notification" in window && "serviceWorker" in navigator) {
          const permission = await Notification.requestPermission();
          if (permission === "granted") {
            const reg = await navigator.serviceWorker.ready;
            const sub = await reg.pushManager.subscribe({
              userVisibleOnly: true,
              applicationServerKey: "BOqYeiKA0GQFeY9YSpxhJJbhZ_G93WiLmWN2oB5R_zQJ22MDmedRVKB64eM9kpnJZRKaqaJQl5tIw3whIOF-N9c"
            });
            await fetch("/api/push", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ subscription: sub })
            });
          }
        }
      } catch (e) { console.error("Push error:", e); }
      setUser(d.user);
      try {
        const proj = await fetch("/api/projects").then(r => r.ok ? r.json() : []);
        const dev = await fetch("/api/devis").then(r => r.ok ? r.json() : []);
        const fact = await fetch("/api/factures").then(r => r.ok ? r.json() : []);
        const msgs = await fetch("/api/messages").then(r => r.ok ? r.json() : []);
        if (Array.isArray(proj)) setProjects(proj);
        if (Array.isArray(dev)) setDevis(dev.filter((x: any) => x.client === d.user.name || x.clientEmail === d.user.email));
        if (Array.isArray(fact)) setFactures(fact.filter((x: any) => x.client === d.user.name || x.clientEmail === d.user.email));
        if (Array.isArray(msgs)) setUnreadReplies(msgs.filter((m: any) => m.is_reply && !m.read).length);
        if (Array.isArray(dev)) setDevis(dev.filter((x: any) => x.client === d.user.name || x.clientEmail === d.user.email));
        if (Array.isArray(fact)) setFactures(fact.filter((x: any) => x.client === d.user.name || x.clientEmail === d.user.email));
      } catch (e) {
        console.error(e);
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) return (
    <div style={{ minHeight: "100vh", background: "#0D1117", display: "flex", alignItems: "center", justifyContent: "center", color: "#E2EAF2" }}>
      Chargement...
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#0D1117", color: "#E2EAF2", fontFamily: "Arial" }}>
      <div style={{ background: "#161B22", borderBottom: "1px solid #1E2D3D", padding: "0 16px", height: 56, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
        <div style={{ fontSize: 18, fontWeight: 700 }}>Terra<span style={{ color: "#F97316" }}>Maps</span></div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <span style={{ fontSize: 13, color: "#8BACC8" }}>👤 {user?.name}</span>
          <button onClick={() => router.push("/messages")}
            style={{ background: unreadReplies > 0 ? "#F97316" : "#1E2D3D", border: "none", color: "#fff", padding: "6px 14px", borderRadius: 8, cursor: "pointer", fontSize: 12, fontWeight: unreadReplies > 0 ? 700 : 400, position: "relative" }}>
            💬 Messages {unreadReplies > 0 && <span style={{ background: "#EF4444", color: "#fff", borderRadius: "50%", padding: "1px 6px", fontSize: 10, marginLeft: 4 }}>{unreadReplies}</span>}
          </button>
          <button onClick={async () => { await fetch("/api/auth/logout", { method: "POST" }); router.push("/login"); }}
            style={{ background: "transparent", border: "1px solid #EF4444", color: "#EF4444", padding: "6px 12px", borderRadius: 8, cursor: "pointer", fontSize: 12 }}>
            Déconnexion
          </button>
      <div style={{ padding: "16px", maxWidth: 1000, margin: "0 auto", width: "100%", boxSizing: "border-box" as any }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>Mon Espace Client</h1>
        <p style={{ color: "#64748B", marginBottom: 32 }}>Bienvenue {user?.name} — Consultez vos projets et documents</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(100px, 1fr))", gap: 12, marginBottom: 24 }}>
          {[
            { icon: "📁", label: "Projets", value: projects.length, color: "#3B82F6" },
            { icon: "📋", label: "Devis", value: devis.length, color: "#F97316" },
            { icon: "🧾", label: "Factures", value: factures.length, color: "#22C55E" },
          ].map(s => (
            <div key={s.label} style={{ background: "#161B22", border: "1px solid #1E2D3D", borderRadius: 12, padding: 20, textAlign: "center" }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>{s.icon}</div>
              <div style={{ fontSize: 28, fontWeight: 700, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 12, color: "#64748B" }}>{s.label}</div>
            </div>
          ))}
        </div>
        <div style={{ background: "#161B22", border: "1px solid #1E2D3D", borderRadius: 12, padding: 24, marginBottom: 24 }}>
          <h3 style={{ margin: "0 0 16px", fontSize: 14, color: "#8BACC8" }}>📁 Mes Projets</h3>
          {projects.length === 0 ? <div style={{ textAlign: "center", padding: 30, color: "#64748B" }}>Aucun projet</div> : (
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, display: "block", overflowX: "auto" }}>
              <thead><tr style={{ borderBottom: "1px solid #1E2D3D" }}>
                {["Nom","Type","Statut","Modifié"].map(h => <th key={h} style={{ textAlign: "left", padding: "8px 12px", color: "#64748B", fontSize: 11 }}>{h}</th>)}
              </tr></thead>
              <tbody>{projects.map(p => (
                <tr key={p.id} style={{ borderBottom: "1px solid #0D1117" }}>
                  <td style={{ padding: "10px 12px", color: "#F97316", fontWeight: 600 }}>{p.name}</td>
                  <td style={{ padding: "10px 12px", color: "#8BACC8" }}>{p.type}</td>
                  <td style={{ padding: "10px 12px" }}><span style={{ background: "#22C55E22", color: "#22C55E", fontSize: 11, padding: "2px 8px", borderRadius: 20 }}>{p.status}</span></td>
                  <td style={{ padding: "10px 12px", color: "#64748B", fontSize: 11 }}>{new Date(p.updatedAt).toLocaleDateString("fr-FR")}</td>
                </tr>
              ))}</tbody>
            </table>
          )}
        <div style={{ background: "#161B22", border: "1px solid #1E2D3D", borderRadius: 12, padding: 24, marginBottom: 24 }}>
          <h3 style={{ margin: "0 0 16px", fontSize: 14, color: "#8BACC8" }}>📋 Mes Devis</h3>
          {devis.length === 0 ? <div style={{ textAlign: "center", padding: 30, color: "#64748B" }}>Aucun devis</div> : (
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, display: "block", overflowX: "auto" }}>
              <thead><tr style={{ borderBottom: "1px solid #1E2D3D" }}>
                {["Numéro","Client","Total","Statut","PDF"].map(h => <th key={h} style={{ textAlign: "left", padding: "8px 12px", color: "#64748B", fontSize: 11 }}>{h}</th>)}
              </tr></thead>
              <tbody>{devis.map(d => (
                <tr key={d.id} style={{ borderBottom: "1px solid #0D1117" }}>
                  <td style={{ padding: "10px 12px", color: "#F97316" }}>{d.numero}</td>
                  <td style={{ padding: "10px 12px", color: "#8BACC8" }}>{d.client}</td>
                  <td style={{ padding: "10px 12px", color: "#22C55E", fontFamily: "monospace" }}>{parseFloat(d.total || 0).toFixed(2)} MAD</td>
                  <td style={{ padding: "10px 12px" }}><span style={{ background: "#3B82F622", color: "#3B82F6", fontSize: 11, padding: "2px 8px", borderRadius: 20 }}>{d.statut}</span></td>
                  <td style={{ padding: "10px 12px" }}>
                    <a href={`/doc-public?type=devis&token=${d.shareToken}`} target="_blank"
                      style={{ background: "#F97316", color: "#fff", padding: "4px 10px", borderRadius: 6, fontSize: 11, textDecoration: "none", fontWeight: 600 }}>
                      📄 PDF
                    </a>
                  </td>
                </tr>
              ))}</tbody>
            </table>
          )}
        </div>
        </div>
          <h3 style={{ margin: "0 0 16px", fontSize: 14, color: "#8BACC8" }}>🧾 Mes Factures</h3>
          {factures.length === 0 ? <div style={{ textAlign: "center", padding: 30, color: "#64748B" }}>Aucune facture</div> : (
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, display: "block", overflowX: "auto" }}>
              <thead><tr style={{ borderBottom: "1px solid #1E2D3D" }}>
                {["Numéro","Client","Total","Statut","PDF"].map(h => <th key={h} style={{ textAlign: "left", padding: "8px 12px", color: "#64748B", fontSize: 11 }}>{h}</th>)}
              </tr></thead>
              <tbody>{factures.map(f => (
                <tr key={f.id} style={{ borderBottom: "1px solid #0D1117" }}>
                  <td style={{ padding: "10px 12px", color: "#F97316" }}>{f.numero}</td>
                  <td style={{ padding: "10px 12px", color: "#8BACC8" }}>{f.client}</td>
                  <td style={{ padding: "10px 12px", color: "#22C55E", fontFamily: "monospace" }}>{parseFloat(f.total || 0).toFixed(2)} MAD</td>
                  <td style={{ padding: "10px 12px" }}><span style={{ background: "#22C55E22", color: "#22C55E", fontSize: 11, padding: "2px 8px", borderRadius: 20 }}>{f.statut}</span></td>
                  <td style={{ padding: "10px 12px" }}>
                    <a href={`/doc-public?type=facture&token=${f.shareToken}`} target="_blank"
                      style={{ background: "#F97316", color: "#fff", padding: "4px 10px", borderRadius: 6, fontSize: 11, textDecoration: "none", fontWeight: 600 }}>
                      📄 PDF
                    </a>
                  </td>
                </tr>
              ))}</tbody>
            </table>
          )}
        </div>
        <div style={{ textAlign: "center", marginTop: 32, color: "#64748B", fontSize: 12 }}>TerraMaps v2.0 — terramaps.vercel.app</div>
      </div>
      </div>
    </div>
  );
}
