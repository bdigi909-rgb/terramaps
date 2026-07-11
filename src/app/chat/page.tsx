"use client";
import { useState, useEffect, useRef } from "react";
import AppShell from "@/components/AppShell";
import Header from "@/components/Header";

interface Message {
  id: number;
  user_id: number;
  user_name: string;
  content: string;
  created_at: string;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [me, setMe] = useState<any>(null);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/auth/me").then(r => r.json()).then(d => {
      if (d.user) setMe(d.user);
    });
    loadMessages();
    const interval = setInterval(loadMessages, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function loadMessages() {
    const res = await fetch("/api/messages");
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) setMessages(data);
    }
  }

  async function sendMessage() {
    if (!input.trim() || sending) return;
    setSending(true);
    await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: input.trim() }),
    });
    setInput("");
    await loadMessages();
    setSending(false);
  }

  function timeAgo(date: string) {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "À l instant";
    if (mins < 60) return `${mins} min`;
    return new Date(date).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
  }

  const COLORS = ["#F97316", "#3B82F6", "#22C55E", "#A855F7", "#EF4444", "#F59E0B"];
  function userColor(name: string) {
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return COLORS[Math.abs(hash) % COLORS.length];
  }

  return (
    <AppShell>
      <Header title="Chat" subtitle="Messagerie interne de l équipe" />
      <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 48px)", background: "#0D1117" }}>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: "auto", padding: "16px 24px", display: "flex", flexDirection: "column", gap: 12 }}>
          {messages.length === 0 && (
            <div style={{ textAlign: "center", color: "#64748B", padding: 40 }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>💬</div>
              <div>Aucun message — commencez la conversation !</div>
            </div>
          )}
          {messages.map(m => {
            const isMe = m.user_id === me?.id;
            const color = userColor(m.user_name || "?");
            return (
              <div key={m.id} style={{ display: "flex", flexDirection: isMe ? "row-reverse" : "row", gap: 10, alignItems: "flex-end" }}>
                {/* Avatar */}
                <div style={{ width: 32, height: 32, borderRadius: "50%", background: color + "22", border: `2px solid ${color}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color, flexShrink: 0 }}>
                  {(m.user_name || "?").charAt(0).toUpperCase()}
                </div>
                {/* Bubble */}
                <div style={{ maxWidth: "60%" }}>
                  {!isMe && (
                    <div style={{ fontSize: 11, color, fontWeight: 600, marginBottom: 4, paddingLeft: 4 }}>{m.user_name}</div>
                  )}
                  <div style={{ background: isMe ? "#0D47A1" : "#161B22", border: `1px solid ${isMe ? "#1565C0" : "#1E2D3D"}`, borderRadius: isMe ? "16px 16px 4px 16px" : "16px 16px 16px 4px", padding: "10px 14px" }}>
                    <div style={{ fontSize: 13, color: "#E2EAF2", lineHeight: 1.5 }}>{m.content}</div>
                  </div>
                  <div style={{ fontSize: 10, color: "#64748B", marginTop: 4, textAlign: isMe ? "right" : "left", paddingLeft: 4 }}>
                    {timeAgo(m.created_at)}
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div style={{ background: "#161B22", borderTop: "1px solid #1E2D3D", padding: "12px 24px", display: "flex", gap: 12, alignItems: "center" }}>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
            placeholder="Écrire un message... (Entrée pour envoyer)"
            style={{ flex: 1, background: "#0D1117", border: "1px solid #1E2D3D", borderRadius: 24, padding: "10px 16px", color: "#E2EAF2", fontSize: 13, outline: "none" }}
          />
          <button onClick={sendMessage} disabled={!input.trim() || sending}
            style={{ background: input.trim() ? "#F97316" : "#1E2D3D", border: "none", borderRadius: "50%", width: 40, height: 40, cursor: input.trim() ? "pointer" : "not-allowed", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
          </button>
        </div>
      </div>
    </AppShell>
  );
}
