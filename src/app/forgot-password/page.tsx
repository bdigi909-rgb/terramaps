"use client";
import { useState } from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await fetch("/api/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    setSent(true);
    setLoading(false);
  }

  return (
    <div style={{ minHeight: "100vh", background: "#0D1117", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: 420, background: "#161B22", border: "1px solid #1E2D3D", borderRadius: 16, padding: "40px 36px" }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700, color: "#fff" }}>Terra<span style={{ color: "#F97316" }}>Maps</span></h1>
          <p style={{ margin: "6px 0 0", fontSize: 13, color: "#64748B" }}>Mot de passe oublié</p>
        </div>

        {sent ? (
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>📧</div>
            <h3 style={{ color: "#22C55E", marginBottom: 8 }}>Email envoyé !</h3>
            <p style={{ color: "#64748B", fontSize: 13 }}>Vérifiez votre boîte email et cliquez sur le lien de réinitialisation.</p>
            <Link href="/login" style={{ display: "inline-block", marginTop: 20, color: "#F97316", textDecoration: "none", fontSize: 13 }}>← Retour à la connexion</Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <p style={{ color: "#8BACC8", fontSize: 13, marginBottom: 20 }}>Entrez votre email et nous vous enverrons un lien pour réinitialiser votre mot de passe.</p>
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: "block", fontSize: 12, color: "#64748B", marginBottom: 6 }}>Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="votre@email.com"
                style={{ width: "100%", background: "#0D1117", border: "1px solid #1E2D3D", borderRadius: 8, padding: "10px 14px", color: "#fff", fontSize: 14, outline: "none", boxSizing: "border-box" }} />
            </div>
            <button type="submit" disabled={loading}
              style={{ width: "100%", background: "#F97316", border: "none", borderRadius: 8, padding: "12px", color: "#fff", fontSize: 15, fontWeight: 600, cursor: "pointer" }}>
              {loading ? "Envoi..." : "📧 Envoyer le lien"}
            </button>
            <div style={{ textAlign: "center", marginTop: 16 }}>
              <Link href="/login" style={{ color: "#64748B", fontSize: 13, textDecoration: "none" }}>← Retour à la connexion</Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
