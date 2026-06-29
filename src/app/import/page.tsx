"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function ImportPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<any[]>([]);
  const [projectId, setProjectId] = useState("");
  const [code, setCode] = useState("IMP");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/projects").then(r => r.json()).then(setProjects);
  }, []);

  function parsePreview(content: string, ext: string) {
    const lines = content.split(/\r?\n/).filter(l => l.trim() && !l.startsWith("#")).slice(0, 10);
    const pts = [];
    for (const line of lines) {
      const cols = line.split(/[,;\t ]+/).filter(Boolean);
      if (cols.length >= 3) {
        const nums = cols.map(Number);
        if (!isNaN(nums[0]) && !isNaN(nums[1]) && !isNaN(nums[2])) {
          pts.push({ name: isNaN(Number(cols[0])) ? cols[0] : `P${pts.length+1}`, x: nums[0], y: nums[1], z: nums[2] });
        } else if (!isNaN(nums[1]) && !isNaN(nums[2]) && !isNaN(nums[3])) {
          pts.push({ name: cols[0], x: nums[1], y: nums[2], z: nums[3] });
        }
      }
    }
    return pts;
  }

  async function handleFile(f: File) {
    setFile(f);
    setResult(null);
    setError("");
    const content = await f.text();
    const ext = f.name.split(".").pop()?.toLowerCase() || "";
    const pts = parsePreview(content, ext);
    setPreview(pts);
  }

  async function handleImport() {
    if (!file || !projectId) { setError("Sélectionnez un projet et un fichier"); return; }
    setLoading(true);
    setError("");
    const fd = new FormData();
    fd.append("file", file);
    fd.append("projectId", projectId);
    fd.append("code", code);
    const res = await fetch("/api/import", { method: "POST", body: fd });
    const data = await res.json();
    if (!res.ok) { setError(data.error); setLoading(false); return; }
    setResult(data);
    setLoading(false);
  }

  return (
    <div style={{ minHeight: "100vh", background: "#0D1117", color: "#E2EAF2", padding: 32 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 32 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>
            Terra<span style={{ color: "#F97316" }}>Maps</span>
            <span style={{ fontSize: 14, color: "#64748B", fontWeight: 400, marginLeft: 12 }}>— Import de points topographiques</span>
          </h1>
        </div>
        <Link href="/dashboard" style={{ color: "#64748B", fontSize: 13, textDecoration: "none" }}>← Dashboard</Link>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        {/* Left — Config */}
        <div style={{ background: "#161B22", border: "1px solid #1E2D3D", borderRadius: 12, padding: 24 }}>
          <h2 style={{ margin: "0 0 20px", fontSize: 15, fontWeight: 600, color: "#8BACC8" }}>Configuration de l'import</h2>

          {/* Project */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", fontSize: 11, color: "#64748B", marginBottom: 6, fontWeight: 600, textTransform: "uppercase" }}>Projet cible</label>
            <select value={projectId} onChange={e => setProjectId(e.target.value)}
              style={{ width: "100%", background: "#0D1117", border: "1px solid #1E2D3D", borderRadius: 8, padding: "10px 14px", color: "#fff", fontSize: 13 }}>
              <option value="">-- Sélectionnez un projet --</option>
              {projects.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>

          {/* Code */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", fontSize: 11, color: "#64748B", marginBottom: 6, fontWeight: 600, textTransform: "uppercase" }}>Code des points</label>
            <input value={code} onChange={e => setCode(e.target.value)} placeholder="AXE, TN, BOR..."
              style={{ width: "100%", background: "#0D1117", border: "1px solid #1E2D3D", borderRadius: 8, padding: "10px 14px", color: "#fff", fontSize: 13, boxSizing: "border-box" }} />
            <p style={{ fontSize: 11, color: "#4B6080", margin: "4px 0 0" }}>AXE = axe route, TN = terrain naturel, BOR = borne, BN = nivellement</p>
          </div>

          {/* File drop */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: "block", fontSize: 11, color: "#64748B", marginBottom: 6, fontWeight: 600, textTransform: "uppercase" }}>Fichier de points</label>
            <label style={{ display: "block", border: "2px dashed #1E2D3D", borderRadius: 10, padding: "30px 20px", textAlign: "center", cursor: "pointer", background: file ? "rgba(249,115,22,0.05)" : "transparent", borderColor: file ? "#F97316" : "#1E2D3D" }}>
              <input type="file" accept=".csv,.txt,.xyz,.dat,.gsi,.asc" onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} style={{ display: "none" }} />
              {file ? (
                <div>
                  <div style={{ fontSize: 24, marginBottom: 8 }}>📄</div>
                  <div style={{ fontSize: 13, color: "#F97316", fontWeight: 600 }}>{file.name}</div>
                  <div style={{ fontSize: 11, color: "#64748B", marginTop: 4 }}>{(file.size / 1024).toFixed(1)} Ko — {preview.length} points détectés (aperçu)</div>
                </div>
              ) : (
                <div>
                  <div style={{ fontSize: 32, marginBottom: 8 }}>📂</div>
                  <div style={{ fontSize: 13, color: "#64748B" }}>Cliquez pour choisir un fichier</div>
                  <div style={{ fontSize: 11, color: "#4B6080", marginTop: 4 }}>CSV, TXT, XYZ, DAT, GSI (Leica)</div>
                </div>
              )}
            </label>
          </div>

          {/* Formats info */}
          <div style={{ background: "#0D1117", border: "1px solid #1E2D3D", borderRadius: 8, padding: 14, marginBottom: 20 }}>
            <div style={{ fontSize: 11, color: "#64748B", fontWeight: 600, marginBottom: 8, textTransform: "uppercase" }}>Formats supportés</div>
            {[
              ["CSV/TXT", "N, X, Y, Z  ou  X, Y, Z  (séparateurs: virgule, point-virgule, espace, tabulation)"],
              ["XYZ/DAT", "X Y Z  (format standard stations totales)"],
              ["GSI Leica", "Format natif Leica Wild (.gsi 8/16)"],
              ["ASC", "Format ASCII générique topographie"],
            ].map(([fmt, desc]) => (
              <div key={fmt} style={{ display: "flex", gap: 10, marginBottom: 6 }}>
                <span style={{ background: "#F97316", color: "#fff", fontSize: 9, fontWeight: 700, padding: "2px 6px", borderRadius: 4, flexShrink: 0, height: "fit-content" }}>{fmt}</span>
                <span style={{ fontSize: 11, color: "#4B6080" }}>{desc}</span>
              </div>
            ))}
          </div>

          {error && <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 8, padding: "10px 14px", marginBottom: 16, fontSize: 13, color: "#EF4444" }}>{error}</div>}

          {result ? (
            <div style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.3)", borderRadius: 8, padding: 16, textAlign: "center" }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>✅</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: "#22C55E" }}>{result.count} points importés avec succès !</div>
              <div style={{ display: "flex", gap: 10, justifyContent: "center", marginTop: 12 }}>
                <button onClick={() => router.push("/survey")} style={{ background: "#22C55E", border: "none", color: "#fff", padding: "8px 16px", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 600 }}>Voir les points</button>
                <button onClick={() => { setFile(null); setPreview([]); setResult(null); }} style={{ background: "transparent", border: "1px solid #1E2D3D", color: "#64748B", padding: "8px 16px", borderRadius: 8, cursor: "pointer", fontSize: 13 }}>Nouvel import</button>
              </div>
            </div>
          ) : (
            <button onClick={handleImport} disabled={loading || !file || !projectId}
              style={{ width: "100%", background: !file || !projectId ? "#1E2D3D" : "#F97316", border: "none", color: !file || !projectId ? "#4B6080" : "#fff", padding: "12px", borderRadius: 8, cursor: !file || !projectId ? "not-allowed" : "pointer", fontSize: 14, fontWeight: 600 }}>
              {loading ? "Import en cours..." : "⬆️ Importer les points"}
            </button>
          )}
        </div>

        {/* Right — Preview */}
        <div style={{ background: "#161B22", border: "1px solid #1E2D3D", borderRadius: 12, padding: 24 }}>
          <h2 style={{ margin: "0 0 20px", fontSize: 15, fontWeight: 600, color: "#8BACC8" }}>
            Aperçu des points {preview.length > 0 && <span style={{ color: "#F97316" }}>({preview.length} premiers)</span>}
          </h2>
          {preview.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 20px", color: "#4B6080" }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>📍</div>
              <div style={{ fontSize: 13 }}>Sélectionnez un fichier pour voir l'aperçu</div>
            </div>
          ) : (
            <>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid #1E2D3D" }}>
                    {["#", "Nom", "X (Est)", "Y (Nord)", "Z (Alt)"].map(h => (
                      <th key={h} style={{ textAlign: "left", padding: "8px 10px", color: "#64748B", fontWeight: 600, textTransform: "uppercase", fontSize: 10, letterSpacing: 1 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {preview.map((pt, i) => (
                    <tr key={i} style={{ borderBottom: "1px solid #0D1117" }}>
                      <td style={{ padding: "8px 10px", color: "#4B6080" }}>{i + 1}</td>
                      <td style={{ padding: "8px 10px", color: "#F97316", fontWeight: 600 }}>{pt.name}</td>
                      <td style={{ padding: "8px 10px", color: "#3B82F6", fontFamily: "monospace" }}>{pt.x?.toFixed(3)}</td>
                      <td style={{ padding: "8px 10px", color: "#22C55E", fontFamily: "monospace" }}>{pt.y?.toFixed(3)}</td>
                      <td style={{ padding: "8px 10px", color: "#A855F7", fontFamily: "monospace" }}>{pt.z?.toFixed(3)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div style={{ marginTop: 12, padding: "10px 14px", background: "#0D1117", borderRadius: 8, fontSize: 11, color: "#64748B" }}>
                ℹ️ Aperçu limité aux 10 premiers points. Tous les points du fichier seront importés.
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
