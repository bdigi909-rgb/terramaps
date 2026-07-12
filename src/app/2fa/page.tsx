"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AppShell from "@/components/AppShell";
import Header from "@/components/Header";
import Link from "next/link";
import QRCode from "qrcode";

export default function TwoFAPage() {
  const router = useRouter();
  const [me, setMe] = useState<any>(null);
  const [step, setStep] = useState<"info"|"setup"|"verify"|"done">("info");
  const [qrUrl, setQrUrl] = useState("");
  const [secret, setSecret] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me").then(r => r.json()).then(d => {
      if (!d.user) { router.push("/login"); return; }
      setMe(d.user);
    });
  }, []);

  async function setupTOTP() {
    setLoading(true);
    const res = await fetch("/api/totp", { method: "POST" });
    const data = await res.json();
    setSecret(data.secret);
    const url = await QRCode.toDataURL(data.otpauth);
    setQrUrl(url);
    setStep("setup");
    setLoading(false);
  }

  async function verifyTOTP(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const res = await fetch("/api/totp", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code })
    });
    if (res.ok) {
      setStep("done");
    } else {
      setError("Code invalide. Verifiez votre application.");
    }
  }

  async function disableTOTP() {
    await fetch("/api/totp", { method: "DELETE" });
    setStep("info");
    setMe((m: any) => ({ ...m, totp_enabled: false }));
  }

  return (
    <AppShell>
      <Header title="Double Authentification" subtitle="Securisez votre compte avec Google Authenticator" />
      <div style={{ padding: 24, maxWidth: 600, margin: "0 auto" }}>

        {step === "info" && (
          <div style={{ background: "#161B22", border: "1px solid #1E2D3D", borderRadius: 16, padding: 32 }}>
            <div style={{ textAlign: "center", marginBottom: 32 }}>
              <div style={{ fontSize: 64, marginBottom: 16 }}>🔐</div>
              <h2 style={{ margin: "0 0 8px", fontSize: 22, fontWeight: 700 }}>Authentification a deux facteurs</h2>
              <p style={{ color: "#64748B", fontSize: 14 }}>Protegez votre compte avec Google Authenticator</p>
            </div>
            <div style={{ background: "#0D1117", borderRadius: 12, padding: 20, marginBottom: 24 }}>
              {[
                { icon: "📱", text: "Installez Google Authenticator sur votre telephone" },
                { icon: "📷", text: "Scannez le QR code avec l application" },
                { icon: "🔑", text: "Entrez le code a 6 chiffres pour confirmer" },
              ].map((s, i) => (
                <div key={i} style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 12 }}>
                  <div style={{ fontSize: 24 }}>{s.icon}</div>
                  <div style={{ fontSize: 13, color: "#8BACC8" }}>{s.text}</div>
                </div>
              ))}
            </div>
            <button onClick={setupTOTP} disabled={loading}
              style={{ width: "100%", background: "#F97316", border: "none", borderRadius: 10, padding: "14px", color: "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer" }}>
              {loading ? "Preparation..." : "🚀 Configurer le 2FA"}
            </button>
          </div>
        )}

        {step === "setup" && (
          <div style={{ background: "#161B22", border: "1px solid #1E2D3D", borderRadius: 16, padding: 32 }}>
            <h2 style={{ margin: "0 0 8px", fontSize: 18, fontWeight: 700, textAlign: "center" }}>Scanner le QR Code</h2>
            <p style={{ color: "#64748B", fontSize: 13, textAlign: "center", marginBottom: 24 }}>Ouvrez Google Authenticator et scannez ce code</p>
            {qrUrl && (
              <div style={{ textAlign: "center", marginBottom: 24 }}>
                <img src={qrUrl} alt="QR Code" style={{ width: 200, height: 200, border: "4px solid #fff", borderRadius: 12 }} />
              </div>
            )}
            <div style={{ background: "#0D1117", borderRadius: 8, padding: 16, marginBottom: 24, textAlign: "center" }}>
              <div style={{ fontSize: 11, color: "#64748B", marginBottom: 4 }}>Ou entrez ce code manuellement</div>
              <div style={{ fontFamily: "monospace", fontSize: 16, color: "#F97316", letterSpacing: 2 }}>{secret}</div>
            </div>
            <button onClick={() => setStep("verify")}
              style={{ width: "100%", background: "#3B82F6", border: "none", borderRadius: 10, padding: "14px", color: "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer" }}>
              ✅ Jai scanne le code
            </button>
          </div>
        )}

        {step === "verify" && (
          <div style={{ background: "#161B22", border: "1px solid #1E2D3D", borderRadius: 16, padding: 32 }}>
            <h2 style={{ margin: "0 0 8px", fontSize: 18, fontWeight: 700, textAlign: "center" }}>Verifier le code</h2>
            <p style={{ color: "#64748B", fontSize: 13, textAlign: "center", marginBottom: 24 }}>Entrez le code a 6 chiffres de Google Authenticator</p>
            <form onSubmit={verifyTOTP}>
              <input value={code} onChange={e => setCode(e.target.value)} maxLength={6} placeholder="000000"
                style={{ width: "100%", background: "#0D1117", border: "1px solid #1E2D3D", borderRadius: 8, padding: "14px", color: "#fff", fontSize: 32, fontWeight: 700, textAlign: "center", letterSpacing: 8, boxSizing: "border-box", marginBottom: 16 }} />
              {error && <div style={{ color: "#EF4444", fontSize: 13, marginBottom: 16, textAlign: "center" }}>{error}</div>}
              <button type="submit"
                style={{ width: "100%", background: "#22C55E", border: "none", borderRadius: 10, padding: "14px", color: "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer" }}>
                Verifier et activer
              </button>
            </form>
          </div>
        )}

        {step === "done" && (
          <div style={{ background: "#161B22", border: "1px solid #1E2D3D", borderRadius: 16, padding: 32, textAlign: "center" }}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>✅</div>
            <h2 style={{ margin: "0 0 8px", fontSize: 22, fontWeight: 700, color: "#22C55E" }}>2FA Active !</h2>
            <p style={{ color: "#64748B", fontSize: 14, marginBottom: 24 }}>Votre compte est maintenant protege par Google Authenticator</p>
            <Link href="/profile" style={{ display: "inline-block", background: "#F97316", color: "#fff", padding: "12px 32px", borderRadius: 10, textDecoration: "none", fontWeight: 600 }}>
              Retour au profil
            </Link>
          </div>
        )}
      </div>
    </AppShell>
  );
}
