"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function ProfilePage() {
  const router = useRouter();
  const [me, setMe] = useState<any>(null);
  const [name, setName] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ text: "", type: "" });

  useEffect(() => {
    fetch("/api/auth/me").then(r => r.json()).then(d => {
      if (!d.user) { router.push("/login"); return; }
      setMe(d.user);
      setName(d.user.name || "");
    });
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (newPassword && newPassword !== confirmPassword) {
      setMsg({ text: "Les mots de passe ne correspondent pas", type: "error" });
      return;
    }
    if (newPassword && newPassword.length < 6) {
      setMsg({ text: "Le mot de passe doit faire au moins 6 caractères", type: "error" });
      return;
    }
    setLoading(true);
    const res = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, currentPassword: currentPassword || undefined, newPassword: newPassword || undefined }),
    });
    const data = await res.json();
    if (res.ok) {
      setMsg({ text: "✅ Profil mis à jour avec succès !", type: "success" });
      setCurrentPassword(""); setNewPassword(""); setConfirmPassword("");
      setMe((prev: any) => ({ ...prev, name: data.name }));
    } else {
      setMsg({ text: `❌ ${data.error}`, type: "error" });
    }
    setLoading(false);
    setTimeout(() => setMsg({ text: "", type: "" }), 4000);
  }

  const roleColor: Record<string, string> = { admin: "#F97316", manager: "#3B82F6", agent: "#22C55E", client: "#A855F7" };
  const roleLabel: Record<string, string> = { admin: "Administrateur", manager: "Manager", agent: "Agent", client: "Client" };

  return (
    <div style={{ minHeight: "100vh", background: "#0D1117", color: "#E2EAF2", fontFamily: "Arial, sans-serif" }}>
      {/* Header */}
      <div style={{ background: "#161B22", borderBottom: "1px solid #1E2D3D", padding: "0 32px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 56 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ fontSize: 18, fontWeight: 700 }}>Terra<span style={{ color: "#F97316" }}>Maps</span></div>
          <span style={{ background: "#1E2D3D", color: "#8BACC8", fontSize: 10, fontWeight: 700, padding: "2px 10px", borderRadius: 20 }}>PROFIL</span>
        </div>
        <Link href="/dashboard" style={{ color: "#64748B", fontSize: 13, textDecoration: "none" }}>← Dashboard</Link>
      </div>

      <div style={{ padding: 32, maxWidth: 700, margin: "0 auto" }}>
        {/* Avatar section */}
        <div style={{ background: "#161B22", border: "1px solid #1E2D3D", borderRadius: 16, padding: 32, marginBottom: 24, display: "flex", alignItems: "center", gap: 24 }}>
          <div style={{ width: 80, height: 80, borderRadius: "50%", background: `${roleColor[me?.role] || "#F97316"}22`, border: `3px solid ${roleColor[me?.role] || "#F97316"}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, fontWeight: 700, color: roleColor[me?.role] || "#F97316", flexShrink: 0 }}>
            {me?.name?.charAt(0)?.toUpperCase() || "?"}
          </div>
          <div>
            <div style={{ fontSize: 22, fontWeight: 700, color: "#E2EAF2", marginBottom: 6 }}>{me?.name}</div>
            <div style={{ fontSize: 13, color: "#64748B", marginBottom: 8 }}>{me?.email}</div>
            <span style={{ background: `${roleColor[me?.role] || "#F97316"}22`, color: roleColor[me?.role] || "#F97316", fontSize: 11, fontWeight: 700, padding: "3px 12px", borderRadius: 20, textTransform: "uppercase" }}>
              {roleLabel[me?.role] || me?.role}
            </span>
          </div>
        </div>

        {/* Edit form */}
        <div style={{ background: "#161B22", border: "1px solid #1E2D3D", borderRadius: 16, padding: 32 }}>
          <h2 style={{ margin: "0 0 24px", fontSize: 16, fontWeight: 600, color: "#8BACC8" }}>Modifier mon profil</h2>

          {msg.text && (
            <div style={{ background: msg.type === "success" ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)", border: `1px solid ${msg.type === "success" ? "rgba(34,197,94,0.3)" : "rgba(239,68,68,0.3)"}`, borderRadius: 8, padding: "10px 16px", marginBottom: 20, fontSize: 13, color: msg.type === "success" ? "#22C55E" : "#EF4444" }}>
              {msg.text}
            </div>
          )}

          <form onSubmit={handleSave}>
            {/* Name */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", fontSize: 11, color: "#64748B", marginBottom: 6, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 }}>Nom complet</label>
              <input value={name} onChange={e => setName(e.target.value)} placeholder="Votre nom"
                style={{ width: "100%", background: "#0D1117", border: "1px solid #1E2D3D", borderRadius: 8, padding: "10px 14px", color: "#fff", fontSize: 13, boxSizing: "border-box" }} />
            </div>

            {/* Email (readonly) */}
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: "block", fontSize: 11, color: "#64748B", marginBottom: 6, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 }}>Email <span style={{ color: "#4B6080", fontWeight: 400 }}>(non modifiable)</span></label>
              <input value={me?.email || ""} disabled
                style={{ width: "100%", background: "#0D1117", border: "1px solid #1E2D3D", borderRadius: 8, padding: "10px 14px", color: "#4B6080", fontSize: 13, boxSizing: "border-box", cursor: "not-allowed" }} />
            </div>

            <div style={{ borderTop: "1px solid #1E2D3D", paddingTop: 24, marginBottom: 20 }}>
              <h3 style={{ margin: "0 0 20px", fontSize: 14, fontWeight: 600, color: "#8BACC8" }}>Changer le mot de passe <span style={{ color: "#4B6080", fontWeight: 400, fontSize: 12 }}>(optionnel)</span></h3>

              {[
                { label: "Mot de passe actuel", val: currentPassword, set: setCurrentPassword },
                { label: "Nouveau mot de passe", val: newPassword, set: setNewPassword },
                { label: "Confirmer le nouveau mot de passe", val: confirmPassword, set: setConfirmPassword },
              ].map((f, i) => (
                <div key={i} style={{ marginBottom: 16 }}>
                  <label style={{ display: "block", fontSize: 11, color: "#64748B", marginBottom: 6, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 }}>{f.label}</label>
                  <div style={{ position: "relative" }}>
                    <input type={showPwd ? "text" : "password"} value={f.val} onChange={e => f.set(e.target.value)} placeholder="••••••••"
                      style={{ width: "100%", background: "#0D1117", border: "1px solid #1E2D3D", borderRadius: 8, padding: "10px 40px 10px 14px", color: "#fff", fontSize: 13, boxSizing: "border-box" }} />
                    {i === 0 && (
                      <button type="button" onClick={() => setShowPwd(!showPwd)}
                        style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#64748B", fontSize: 16 }}>
                        {showPwd ? "🙈" : "👁️"}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <button type="submit" disabled={loading}
              style={{ width: "100%", background: loading ? "#1E2D3D" : "#F97316", border: "none", color: "#fff", padding: "12px", borderRadius: 8, cursor: loading ? "not-allowed" : "pointer", fontSize: 14, fontWeight: 600, opacity: loading ? 0.7 : 1 }}>
              {loading ? "Enregistrement..." : "💾 Enregistrer les modifications"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
