"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const [step, setStep] = useState<"login"|"2fa">("login");
  const [userId, setUserId] = useState<number>(0);
  const [code, setCode] = useState("");
  const [codeError, setCodeError] = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (res.ok && data.user) {
      const totpRes = await fetch("/api/totp", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: data.user.id, code: "check" })
      });
      const totpData = await totpRes.json();
      if (totpData.skip) {
        router.push(data.user.role === "client" ? "/client-space" : "/dashboard");
      } else {
        setUserId(data.user.id);
        setUserRole(data.user.role);
        setStep("2fa");
      }
    } else {
      setError(data.error || "Email ou mot de passe incorrect");
    }
    setLoading(false);
  }

  async function verify2FA(e: React.FormEvent) {
    e.preventDefault();
    setCodeError("");
    const res = await fetch("/api/totp", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, code })
    });
    if (res.ok) {
      router.push(userRole === "client" ? "/client-space" : "/dashboard");
    } else {
      setCodeError("Code invalide. Reessayez.");
    }
  }

  if (step === "2fa") {
    return (
      <div style={{ minHeight: "100vh", background: "#0D1117", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: 420, background: "#161B22", border: "1px solid #1E2D3D", borderRadius: 16, padding: "40px 36px" }}>
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>📱</div>
            <h2 style={{ margin: "0 0 8px", fontSize: 20, fontWeight: 700, color: "#E2EAF2" }}>Code Google Authenticator</h2>
            <p style={{ color: "#64748B", fontSize: 13 }}>Entrez le code a 6 chiffres de votre application</p>
          </div>
          <form onSubmit={verify2FA}>
            <input value={code} onChange={e => setCode(e.target.value)} maxLength={6} placeholder="000000"
              style={{ width: "100%", background: "#0D1117", border: "1px solid #1E2D3D", borderRadius: 8, padding: "14px", color: "#fff", fontSize: 32, fontWeight: 700, textAlign: "center", letterSpacing: 8, boxSizing: "border-box", marginBottom: 16 }} />
            {codeError && <div style={{ color: "#EF4444", fontSize: 13, marginBottom: 16, textAlign: "center" }}>{codeError}</div>}
            <button type="submit" style={{ width: "100%", background: "#F97316", border: "none", borderRadius: 8, padding: "12px", color: "#fff", fontSize: 15, fontWeight: 600, cursor: "pointer" }}>
              Verifier le code
            </button>
            <button type="button" onClick={() => setStep("login")} style={{ width: "100%", background: "transparent", border: "none", color: "#64748B", fontSize: 13, cursor: "pointer", marginTop: 12 }}>
              Retour a la connexion
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#0D1117", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: 420, background: "#161B22", border: "1px solid #1E2D3D", borderRadius: 16, padding: "40px 36px" }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ width: 56, height: 56, borderRadius: 14, background: "#0D1117", border: "2px solid #F97316", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
            <svg width="32" height="32" viewBox="0 0 42 42" fill="none">
              <circle cx="21" cy="21" r="16" stroke="#F97316" strokeWidth="2"/>
              <ellipse cx="21" cy="21" rx="16" ry="6" stroke="#F97316" strokeWidth="1" opacity="0.5"/>
              <line x1="5" y1="21" x2="37" y2="21" stroke="#F97316" strokeWidth="1" opacity="0.4"/>
              <ellipse cx="21" cy="21" rx="8" ry="16" stroke="#F97316" strokeWidth="1.5"/>
              <circle cx="26" cy="13" r="4" fill="#F97316"/>
              <line x1="26" y1="17" x2="26" y2="23" stroke="#F97316" strokeWidth="2"/>
            </svg>
          </div>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700, color: "#fff" }}>Terra<span style={{ color: "#F97316" }}>Maps</span></h1>
          <p style={{ margin: "6px 0 0", fontSize: 13, color: "#64748B" }}>Topographie & Cartographie</p>
        </div>
        <h2 style={{ margin: "0 0 24px", fontSize: 18, fontWeight: 600, color: "#E2EAF2", textAlign: "center" }}>Connexion</h2>
        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", fontSize: 12, color: "#64748B", marginBottom: 6 }}>Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="admin@terramaps.ma"
              style={{ width: "100%", background: "#0D1117", border: "1px solid #1E2D3D", borderRadius: 8, padding: "10px 14px", color: "#fff", fontSize: 14, boxSizing: "border-box" }} />
          </div>
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: "block", fontSize: 12, color: "#64748B", marginBottom: 6 }}>Mot de passe</label>
            <div style={{ position: "relative" }}>
              <input type={showPwd ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} required
                style={{ width: "100%", background: "#0D1117", border: "1px solid #1E2D3D", borderRadius: 8, padding: "10px 40px 10px 14px", color: "#fff", fontSize: 14, boxSizing: "border-box" }} />
              <button type="button" onClick={() => setShowPwd(!showPwd)}
                style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "transparent", border: "none", color: "#64748B", cursor: "pointer", fontSize: 16 }}>
                {showPwd ? "🙈" : "👁️"}
              </button>
            </div>
          </div>
          {error && <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 8, padding: "10px 16px", marginBottom: 16, fontSize: 13, color: "#EF4444" }}>{error}</div>}
          <button type="submit" disabled={loading}
            style={{ width: "100%", background: "#F97316", border: "none", borderRadius: 8, padding: "12px", color: "#fff", fontSize: 15, fontWeight: 600, cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1 }}>
            {loading ? "Connexion..." : "Se connecter"}
          </button>
        </form>
        <p style={{ textAlign: "center", marginTop: 20, fontSize: 12, color: "#4B6080" }}>
          <a href="/forgot-password" style={{ color: "#F97316", textDecoration: "none", fontSize: 13 }}>Mot de passe oublie ?</a>
        </p>
        <div style={{ textAlign: "center", marginTop: 24, paddingTop: 24, borderTop: "1px solid #1E2D3D", display: "flex", justifyContent: "center", gap: 24 }}>
          <a href="/" style={{ color: "#64748B", textDecoration: "none", fontSize: 12 }}>🏠 Accueil</a>
          <a href="/help" style={{ color: "#64748B", textDecoration: "none", fontSize: 12 }}>📖 Aide</a>
          <a href="/status" style={{ color: "#22C55E", textDecoration: "none", fontSize: 12 }}>🟢 Status</a>
        </div>
      </div>
    </div>
  );
}
