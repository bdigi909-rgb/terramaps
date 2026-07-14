"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function MessagesPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me").then(r => r.json()).then(d => {
      if (!d.user) { router.push("/login"); return; }
      setUser(d.user);
    });
    fetch("/api/messages").then(r => r.ok ? r.json() : []).then(msgs => {
      if (Array.isArray(msgs)) setMessages(msgs);
    });
  }, []);

  async function sendMessage() {
    if (!content) return;
    setSending(true);
    await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subject, content })
    });
    setSubject("");
    setContent("");
    setSending(false);
    setSent(true);
    const msgs = await fetch("/api/messages").then(r => r.json());
    if (Array.isArray(msgs)) setMessages(msgs);
    setTimeout(() => setSent(false), 3000);
  }

  return (
    <div style={{ minHeight: "100vh", background: "#0D1117", color: "#E2EAF2", fontFamily: "Arial" }}>
      <div style={{ background: "#161B22", borderBottom: "1px solid #1E2D3D", padding: "0 32px", height: 56, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ fontSize: 18, fontWeight: 700 }}>Terra<span style={{ color: "#F97316" }}>Maps</span></div>
        <div style={{ display: "flex", gap: 12 }}>
          <button onClick={() => router.push("/client-space")}
            style={{ background: "#1E2D3D", border: "none", color: "#8BACC8", padding: "6px 14px", borderRadius: 8, cursor: "pointer", fontSize: 12 }}>
            ← Espace Client
          </button>
          <button onClick={async () => { await fetch("/api/auth/logout", { method: "POST" }); router.push("/login"); }}
            style={{ background: "transparent", border: "1px solid #EF4444", color: "#EF4444", padding: "6px 12px", borderRadius: 8, cursor: "pointer", fontSize: 12 }}>
            Déconnexion
          </button>
        </div>
      </div>
      <div style={{ padding: 32, maxWidth: 800, margin: "0 auto" }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 24 }}>💬 Messagerie</h1>

        {/* Formulaire nouveau message */}
        <div style={{ background: "#161B22", border: "1px solid #1E2D3D", borderRadius: 12, padding: 24, marginBottom: 24 }}>
          <h3 style={{ margin: "0 0 16px", fontSize: 14, color: "#F97316" }}>✉️ Nouveau message</h3>
          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 11, color: "#64748B", display: "block", marginBottom: 4 }}>Sujet</label>
            <input value={subject} onChange={e => setSubject(e.target.value)} placeholder="Sujet du message..."
              style={{ width: "100%", background: "#0D1117", border: "1px solid #1E2D3D", borderRadius: 8, padding: "8px 12px", color: "#E2EAF2", fontSize: 13, boxSizing: "border-box" }} />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 11, color: "#64748B", display: "block", marginBottom: 4 }}>Message *</label>
            <textarea value={content} onChange={e => setContent(e.target.value)} placeholder="Votre message..." rows={4}
              style={{ width: "100%", background: "#0D1117", border: "1px solid #1E2D3D", borderRadius: 8, padding: "8px 12px", color: "#E2EAF2", fontSize: 13, boxSizing: "border-box", resize: "vertical" }} />
          </div>
          <button onClick={sendMessage} disabled={sending || !content}
            style={{ background: "#F97316", border: "none", color: "#fff", padding: "10px 24px", borderRadius: 8, cursor: "pointer", fontWeight: 700, fontSize: 13 }}>
            {sending ? "Envoi..." : "📤 Envoyer"}
          </button>
          {sent && <span style={{ marginLeft: 12, color: "#22C55E", fontSize: 13 }}>✅ Message envoyé !</span>}
        </div>

        {/* Liste des messages */}
        <div style={{ background: "#161B22", border: "1px solid #1E2D3D", borderRadius: 12, padding: 24 }}>
          <h3 style={{ margin: "0 0 16px", fontSize: 14, color: "#8BACC8" }}>📥 Historique</h3>
          {messages.length === 0 ? (
            <div style={{ textAlign: "center", padding: 30, color: "#64748B" }}>Aucun message</div>
          ) : messages.map(m => (
            <div key={m.id} style={{ borderBottom: "1px solid #1E2D3D", padding: "14px 0" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: m.from_user_id === user?.id ? "#F97316" : "#3B82F6" }}>
                  {m.from_user_id === user?.id ? "📤 Vous" : "📥 TerraMaps"} — {m.subject || "Sans sujet"}
                </span>
                <span style={{ fontSize: 11, color: "#64748B" }}>{new Date(m.created_at).toLocaleDateString("fr-FR")}</span>
              </div>
              <p style={{ margin: 0, fontSize: 13, color: "#8BACC8", lineHeight: 1.5 }}>{m.content}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
