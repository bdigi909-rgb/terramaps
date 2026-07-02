"use client";
import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

function ResetForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ text: "", type: "" });

  async function handleReset(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) { setMsg({ text: "Les mots de passe ne correspondent pas", type: "error" }); return; }
    if (password.length < 6) { setMsg({ text: "Minimum 6 caractères", type: "error" }); return; }
    setLoading(true);
    const res = await fetch("/api/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    });
    const data = await res.json();
    if (res.ok) { setMsg({ text: "✅ Mot de passe réinitialisé !", type: "success" }); setTimeout(() => router.push("/login"), 2000); }
    else setMsg({ text: data.error, type: "error" });
    setLoading(false);
  }

  return (
    <div style={{ minHeight: "100vh", background: "#0D1117", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: 420, background: "#161B22", border: "1px solid #1E2D3D", borderRadius: 16, padding: "40px 36px" }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700, color: "#fff" }}>Terra<span style={{ color: "#F97316" }}>Maps</span></h1>
          <p style={{ margin: "6px 0 0", fontSize: 13, color: "#64748B" }}>Réinitialisation du mot de passe</p>
        </div>
        <form onSubmit={handleReset}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", fontSize: 12, color: "#64748B", marginBottom: 6 }}>Nouveau mot de passe</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="••••••••"
              style={{ width: "100%", background: "#0D1117", border: "1px solid #1E2D3D", borderRadius: 8, padding: "10px 14px", color: "#fff", fontSize: 14, outline: "none", boxSizing: "border-box" }} />
          </div>
          <div style={{ marginBottom: 24 }}>
            <label style={{ display: "block", fontSize: 12, color: "#64748B", marginBottom: 6 }}>Confirmer le mot de passe</label>
            <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} required placeholder="••••••••"
              style={{ width: "100%", background: "#0D1117", border: "1px solid #1E2D3D", borderRadius: 8, padding: "10px 14px", color: "#fff", fontSize: 14, outline: "none", boxSizing: "border-box" }} />
          </div>
          {msg.text && <div style={{ background: msg.type === "success" ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)", border: `1px solid ${msg.type === "success" ? "rgba(34,197,94,0.3)" : "rgba(239,68,68,0.3)"}`, borderRadius: 8, padding: "10px 14px", marginBottom: 16, fontSize: 13, color: msg.type === "success" ? "#22C55E" : "#EF4444" }}>{msg.text}</div>}
          <button type="submit" disabled={loading}
            style={{ width: "100%", background: "#F97316", border: "none", borderRadius: 8, padding: "12px", color: "#fff", fontSize: 15, fontWeight: 600, cursor: "pointer" }}>
            {loading ? "Réinitialisation..." : "🔑 Réinitialiser"}
          </button>
        </form>
        <div style={{ textAlign: "center", marginTop: 20 }}>
          <Link href="/login" style={{ color: "#F97316", fontSize: 13, textDecoration: "none" }}>← Retour à la connexion</Link>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return <Suspense><ResetForm /></Suspense>;
}
