"use client";
import { useState, useEffect } from "react";

export default function MessagesAdmin() {
  const [messages, setMessages] = useState<any[]>([]);
  const [reply, setReply] = useState<{[key: number]: string}>({});
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/messages").then(r => r.json()).then(d => { if (Array.isArray(d)) setMessages(d.filter((m: any) => !m.is_reply)); });
    fetch("/api/users").then(r => r.json()).then(d => { if (Array.isArray(d)) setUsers(d); });
  }, []);

  async function sendReply(toUserId: number, msgId: number) {
    if (!reply[msgId]) return;
    await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: reply[msgId], subject: "Réponse TerraMaps", toUserId, isReply: true })
    });
    setReply(prev => ({ ...prev, [msgId]: "" }));
    const msgs = await fetch("/api/messages").then(r => r.json());
    if (Array.isArray(msgs)) setMessages(msgs.filter((m: any) => !m.is_reply));
  }

  return (
    <div>
      <h2 style={{ margin: "0 0 20px", fontSize: 16, fontWeight: 600 }}>💬 Messages clients</h2>
      {messages.length === 0 ? (
        <div style={{ textAlign: "center", padding: 40, color: "#64748B" }}>Aucun message</div>
      ) : messages.map(m => (
        <div key={m.id} style={{ background: "#0D1117", border: "1px solid #1E2D3D", borderRadius: 10, padding: 16, marginBottom: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
            <span style={{ fontWeight: 600, color: "#F97316" }}>👤 {m.user_name || "Client"}</span>
            <span style={{ fontSize: 11, color: "#64748B" }}>{new Date(m.created_at).toLocaleDateString("fr-FR")}</span>
          </div>
          {m.subject && <div style={{ fontSize: 12, color: "#8BACC8", marginBottom: 6 }}>Sujet: {m.subject}</div>}
          <p style={{ margin: "0 0 12px", color: "#E2EAF2", fontSize: 13 }}>{m.content}</p>
          <div style={{ display: "flex", gap: 8 }}>
            <input value={reply[m.id] || ""} onChange={e => setReply(prev => ({ ...prev, [m.id]: e.target.value }))}
              placeholder="Votre réponse..."
              style={{ flex: 1, background: "#161B22", border: "1px solid #1E2D3D", borderRadius: 6, padding: "6px 10px", color: "#E2EAF2", fontSize: 12 }} />
            <button onClick={() => sendReply(m.user_id, m.id)}
              style={{ background: "#F97316", border: "none", color: "#fff", padding: "6px 14px", borderRadius: 6, cursor: "pointer", fontSize: 12, fontWeight: 600 }}>
              Répondre
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
