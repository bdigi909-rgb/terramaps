"use client";
import SignaturePad from "@/components/SignaturePad";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import GenerateLeve from "@/components/GenerateLeve";

export default function LeveTopoPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<any[]>([]);
  const [points, setPoints] = useState<any[]>([]);
  const [selectedProject, setSelectedProject] = useState("");
  const [signature, setSignature] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);

  async function sendEmail() {
    if (!clientEmail) return;
    setSendingEmail(true);
    await fetch("/api/send-leve-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        to: clientEmail,
        clientName: form.proprietaire || "Client",
        projectName: projects.find(p => p.id === parseInt(selectedProject))?.name || "Projet",
        superficie: form.superficie ? form.superficie + " m2" : "Non renseignee",
        technicien: form.technicien || "Technicien"
      })
    });
    setEmailSent(true);
    setSendingEmail(false);
    setTimeout(() => setEmailSent(false), 3000);
  }
  const [form, setForm] = useState({
    province: "Séttat",
    cercle: "Cherrat",
    commune: "Cherrat",
    proprietaire: "",
    cin: "",
    adresse: "",
    superficie: "",
    reference: "",
    date: new Date().toLocaleDateString("fr-FR"),
    technicien: "",
    echelle: "1000",
    epsg: "EPSG:26191 — Lambert Maroc",
    voisinNord: "",
    voisinSud: "",
    voisinEst: "",
    voisinOuest: "",
    clientEmail: "",
    bureauNom: "",
    bureauOrdre: "",
    bureauVille: "",
  });

  useEffect(() => {
    fetch("/api/auth/me").then(r => r.json()).then(d => {
      if (!d.user) { router.push("/login"); return; }
      setForm(f => ({ ...f, technicien: d.user.name }));
    });
    fetch("/api/projects").then(r => r.json()).then(data => {
      if (Array.isArray(data)) setProjects(data);
    });
  }, []);

  useEffect(() => {
    if (!selectedProject) return;
    fetch(`/api/projects/${selectedProject}/survey-points`).then(r => r.json()).then(data => {
      if (Array.isArray(data)) setPoints(data.filter((p: any, i: number, self: any[]) => i === self.findIndex((q: any) => q.name === p.name)));
    });
  }, [selectedProject]);

  const leveData = {
    ...form,
    projectName: projects.find(p => p.id === parseInt(selectedProject))?.name || "Projet",
    points: points.map(p => ({ name: p.name || "PT", code: p.code || "TN", x: p.x, y: p.y, z: p.z })),
    signature: signature,
    bureauNom: ((form as any).bureauNom || "").replace(/"/g, ""),
    bureauOrdre: (form as any).bureauOrdre,
    bureauVille: (form as any).bureauVille,
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0D1117", color: "#E2EAF2", fontFamily: "Arial, sans-serif" }}>
      {/* Header */}
      <div style={{ background: "#161B22", borderBottom: "1px solid #1E2D3D", padding: "0 32px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 56 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ fontSize: 18, fontWeight: 700 }}>Terra<span style={{ color: "#F97316" }}>Maps</span></div>
          <span style={{ background: "#0D47A1", color: "#fff", fontSize: 10, fontWeight: 700, padding: "2px 10px", borderRadius: 20 }}>LEVÉ TOPOGRAPHIQUE</span>
        </div>
        <Link href="/dashboard" style={{ color: "#64748B", fontSize: 13, textDecoration: "none" }}>← Dashboard</Link>
      </div>

      <div style={{ padding: 32, maxWidth: 900, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>📄</div>
          <h1 style={{ margin: "0 0 8px", fontSize: 24, fontWeight: 700 }}>Générer un Levé Topographique Officiel</h1>
          <p style={{ color: "#64748B", fontSize: 14 }}>Document officiel marocain avec coordonnées, plan et tableau</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
          {/* Left — Form */}
          <div style={{ background: "#161B22", border: "1px solid #1E2D3D", borderRadius: 16, padding: 24 }}>
            <h2 style={{ margin: "0 0 20px", fontSize: 15, fontWeight: 600, color: "#8BACC8" }}>📋 Informations officielles</h2>

            {/* Project */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: 11, color: "#64748B", marginBottom: 6, fontWeight: 600, textTransform: "uppercase" }}>Projet</label>
              <select value={selectedProject} onChange={e => setSelectedProject(e.target.value)}
                style={{ width: "100%", background: "#0D1117", border: "1px solid #1E2D3D", borderRadius: 8, padding: "9px 12px", color: "#fff", fontSize: 13 }}>
                <option value="">-- Sélectionnez un projet --</option>
                {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>

            {[
              { key: "province", label: "Province" },
              { key: "cercle", label: "Cercle" },
              { key: "commune", label: "Commune" },
              { key: "proprietaire", label: "Propriétaire / Maître d'ouvrage" },
              { key: "cin", label: "CIN / Référence cadastrale" },
              { key: "adresse", label: "Adresse" },
              { key: "superficie", label: "Superficie déclarée (m²)" },
              { key: "reference", label: "Référence foncière" },
              { key: "date", label: "Date du levé" },
              { key: "technicien", label: "Technicien topographe" },
            ].map(f => (
              <div key={f.key} style={{ marginBottom: 12 }}>
                <label style={{ display: "block", fontSize: 11, color: "#64748B", marginBottom: 4, fontWeight: 600, textTransform: "uppercase" }}>{f.label}</label>
                <input value={(form as any)[f.key]} onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                  style={{ width: "100%", background: "#0D1117", border: "1px solid #1E2D3D", borderRadius: 8, padding: "8px 12px", color: "#fff", fontSize: 13, boxSizing: "border-box" }} />
              </div>
            ))}

            <div style={{ marginBottom: 12 }}>
              <label style={{ display: "block", fontSize: 11, color: "#64748B", marginBottom: 4, fontWeight: 600, textTransform: "uppercase" }}>Échelle</label>
              <select value={form.echelle} onChange={e => setForm(f => ({ ...f, echelle: e.target.value }))}
                style={{ width: "100%", background: "#0D1117", border: "1px solid #1E2D3D", borderRadius: 8, padding: "9px 12px", color: "#fff", fontSize: 13 }}>
                <option value="500">1:500</option>
                <option value="1000">1:1000</option>
                <option value="2000">1:2000</option>
                <option value="5000">1:5000</option>
              </select>
            </div>

            <div style={{ marginBottom: 12 }}>
              <label style={{ display: "block", fontSize: 11, color: "#64748B", marginBottom: 4, fontWeight: 600, textTransform: "uppercase" }}>Système de coordonnées</label>
              <select value={form.epsg} onChange={e => setForm(f => ({ ...f, epsg: e.target.value }))}
                style={{ width: "100%", background: "#0D1117", border: "1px solid #1E2D3D", borderRadius: 8, padding: "9px 12px", color: "#fff", fontSize: 13 }}>
                <option value="EPSG:26191 — Lambert Maroc">EPSG:26191 — Lambert Maroc</option>
                <option value="EPSG:4326 — WGS84 (GPS)">EPSG:4326 — WGS84 (GPS)</option>
                <option value="EPSG:32629 — UTM Zone 29N">EPSG:32629 — UTM Zone 29N</option>
                <option value="EPSG:32630 — UTM Zone 30N">EPSG:32630 — UTM Zone 30N</option>
              </select>
            </div>
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: "block", fontSize: 12, color: "#F97316", marginBottom: 8, fontWeight: 700, textTransform: "uppercase" }}>Voisins</label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                {[
                  { key: "voisinNord", label: "Nord" },
                  { key: "voisinSud", label: "Sud" },
                  { key: "voisinEst", label: "Est" },
                  { key: "voisinOuest", label: "Ouest" },
                ].map(v => (
                  <div key={v.key}>
                    <label style={{ display: "block", fontSize: 10, color: "#64748B", marginBottom: 3 }}>{v.label}</label>
                    <input value={(form as any)[v.key]} onChange={e => setForm(f => ({ ...f, [v.key]: e.target.value }))}
                      placeholder={`Voisin ${v.label}...`}
                      style={{ width: "100%", background: "#0D1117", border: "1px solid #1E2D3D", borderRadius: 8, padding: "7px 10px", color: "#fff", fontSize: 12, boxSizing: "border-box" }} />
                  </div>
                ))}
              </div>
            </div>
              <div style={{ marginBottom: 12 }}>
                <label style={{ display: "block", fontSize: 12, color: "#3B82F6", marginBottom: 8, fontWeight: 700, textTransform: "uppercase" }}>Cachet du bureau</label>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <input value={(form as any).bureauNom} onChange={e => setForm(f => ({ ...f, bureauNom: e.target.value }))}
                    placeholder="Nom du bureau d etudes..."
                    style={{ width: "100%", background: "#0D1117", border: "1px solid #1E2D3D", borderRadius: 8, padding: "7px 10px", color: "#fff", fontSize: 12, boxSizing: "border-box" }} />
                  <input value={(form as any).bureauOrdre} onChange={e => setForm(f => ({ ...f, bureauOrdre: e.target.value }))}
                    placeholder="N ordre topographe..."
                    style={{ width: "100%", background: "#0D1117", border: "1px solid #1E2D3D", borderRadius: 8, padding: "7px 10px", color: "#fff", fontSize: 12, boxSizing: "border-box" }} />
                  <input value={(form as any).bureauVille} onChange={e => setForm(f => ({ ...f, bureauVille: e.target.value }))}
                    placeholder="Ville..."
                    style={{ width: "100%", background: "#0D1117", border: "1px solid #1E2D3D", borderRadius: 8, padding: "7px 10px", color: "#fff", fontSize: 12, boxSizing: "border-box" }} />
                </div>
              </div>
          <div style={{ marginTop: 16 }}>
                <SignaturePad onSignature={setSignature} />
              </div>
            </div>
            {/* Right — Preview & Generate */}
          <div>
            {/* Points summary */}
            <div style={{ background: "#161B22", border: "1px solid #1E2D3D", borderRadius: 16, padding: 24, marginBottom: 20 }}>
              <h3 style={{ margin: "0 0 16px", fontSize: 14, fontWeight: 600, color: "#8BACC8" }}>📍 Points du projet</h3>
              {points.length === 0 ? (
                <div style={{ textAlign: "center", padding: 20, color: "#64748B", fontSize: 13 }}>
                  {selectedProject ? "Aucun point dans ce projet" : "Sélectionnez un projet"}
                </div>
              ) : (
                <>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
                    {[
                      { label: "Total points", value: points.length, color: "#F97316" },
                      { label: "Points LIM", value: points.filter(p => p.code === "LIM").length, color: "#EF4444" },
                      { label: "Points BAT", value: points.filter(p => p.code === "BAT").length, color: "#3B82F6" },
                      { label: "Points AXE", value: points.filter(p => p.code === "AXE").length, color: "#F97316" },
                    ].map(s => (
                      <div key={s.label} style={{ background: "#0D1117", borderRadius: 8, padding: "10px 14px" }}>
                        <div style={{ fontSize: 20, fontWeight: 700, color: s.color }}>{s.value}</div>
                        <div style={{ fontSize: 10, color: "#64748B" }}>{s.label}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ maxHeight: 200, overflowY: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11 }}>
                      <thead>
                        <tr style={{ borderBottom: "1px solid #1E2D3D" }}>
                          {["Nom", "Code", "X", "Y", "Z"].map(h => (
                            <th key={h} style={{ padding: "4px 8px", color: "#64748B", textAlign: "left", fontSize: 10 }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {points.map((p, i) => (
                          <tr key={i} style={{ borderBottom: "1px solid #0D1117" }}>
                            <td style={{ padding: "4px 8px", color: "#F97316" }}>{p.name}</td>
                            <td style={{ padding: "4px 8px", color: "#22C55E" }}>{p.code}</td>
                            <td style={{ padding: "4px 8px", color: "#3B82F6", fontFamily: "monospace", fontSize: 10 }}>{p.x?.toFixed(1)}</td>
                            <td style={{ padding: "4px 8px", color: "#22C55E", fontFamily: "monospace", fontSize: 10 }}>{p.y?.toFixed(1)}</td>
                            <td style={{ padding: "4px 8px", color: "#A855F7", fontFamily: "monospace", fontSize: 10 }}>{p.z?.toFixed(1)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>

            {/* Generate button */}
            <div style={{ background: "#161B22", border: "1px solid #1E2D3D", borderRadius: 16, padding: 24 }}>
              <h3 style={{ margin: "0 0 16px", fontSize: 14, fontWeight: 600, color: "#8BACC8" }}>🇲🇦 Document officiel</h3>
              <p style={{ fontSize: 12, color: "#64748B", marginBottom: 20, lineHeight: 1.6 }}>
                Le document généré contiendra :<br/>
                ✅ En-tête officiel Royaume du Maroc<br/>
                ✅ Informations du propriétaire<br/>
                ✅ Tableau des coordonnées X, Y, Z<br/>
                ✅ Plan schématique avec limites<br/>
                ✅ Superficie calculée (méthode Gauss)<br/>
                ✅ Rose des vents<br/>
                ✅ Zone cachet et signature
              </p>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", fontSize: 11, color: "#64748B", marginBottom: 4, fontWeight: 600, textTransform: "uppercase" }}>Email du client</label>
                <div style={{ display: "flex", gap: 8 }}>
                  <input value={clientEmail} onChange={e => setClientEmail(e.target.value)}
                    placeholder="client@email.com"
                    style={{ flex: 1, background: "#0D1117", border: "1px solid #1E2D3D", borderRadius: 8, padding: "8px 12px", color: "#fff", fontSize: 13 }} />
                  <button onClick={sendEmail} disabled={!clientEmail || sendingEmail}
                    style={{ background: clientEmail ? "#22C55E" : "#1E2D3D", border: "none", color: "#fff", padding: "8px 16px", borderRadius: 8, cursor: clientEmail ? "pointer" : "not-allowed", fontSize: 12, fontWeight: 600, whiteSpace: "nowrap" }}>
                    {emailSent ? "✅ Envoyé!" : sendingEmail ? "Envoi..." : "📧 Envoyer"}
                  </button>
                </div>
              </div>
              <GenerateLeve data={leveData} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
