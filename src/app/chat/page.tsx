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
  const [search, setSearch] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
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
    const pingInterval = setInterval(() => {
      if (me?.name) localStorage.setItem("online_" + me.name, Date.now().toString());
      const online: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k?.startsWith("online_")) {
          const t = parseInt(localStorage.getItem(k) || "0");
          if (Date.now() - t < 30000) online.push(k.replace("online_", ""));
        }
      }
      setOnlineUsers(online);
    }, 5000);
    return () => clearInterval(pingInterval);
  }, [me]);

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

  async function deleteMessage(id: number) {
    await fetch("/api/messages", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id })
    });
    setMessages(prev => prev.filter(m => m.id !== id));
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
    if (mins < 1) return "A l instant";
    if (mins < 60) return `${mins} min`;
    return new Date(date).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
  }

  const COLORS = ["#F97316", "#3B82F6", "#22C55E", "#A855F7", "#EF4444", "#F59E0B"];
  function userColor(name: string) {
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return COLORS[Math.abs(hash) % COLORS.length];
  }

  const filteredMessages = search ? messages.filter(m =>
    m.content.toLowerCase().includes(search.toLowerCase()) ||
    m.user_name.toLowerCase().includes(search.toLowerCase())
  ) : messages;

  return (
    <AppShell>
      <Header title="Chat" subtitle={`Messagerie — ${onlineUsers.length} en ligne`}
        actions={
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <button onClick={() => setShowSearch(s => !s)} style={{ background: showSearch ? "#F97316" : "transparent", border: "1px solid #1E2D3D", borderRadius: 8, padding: "6px 10px", cursor: "pointer", color: showSearch ? "#fff" : "#8BACC8", fontSize: 12 }}>🔍</button>
            {onlineUsers.map(u => (
              <div key={u} style={{ display: "flex", alignItems: "center", gap: 4, background: "#0D1117", border: "1px solid #22C55E33", borderRadius: 20, padding: "4px 10px" }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#22C55E" }} />
                <span style={{ fontSize: 11, color: "#22C55E", fontWeight: 600 }}>{u}</span>
              </div>
            ))}
          </div>
        }
      />
      <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 48px)", background: "#0D1117" }}>
        {showSearch && (
          <div style={{ background: "#161B22", borderBottom: "1px solid #1E2D3D", padding: "8px 24px", display: "flex", gap: 8, alignItems: "center" }}>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher dans les messages..."
              style={{ flex: 1, background: "#0D1117", border: "1px solid #1E2D3D", borderRadius: 8, padding: "6px 12px", color: "#E2EAF2", fontSize: 13, outline: "none" }} />
            {search && <button onClick={() => setSearch("")} style={{ background: "transparent", border: "none", color: "#EF4444", cursor: "pointer" }}>x</button>}
            <span style={{ fontSize: 11, color: "#64748B" }}>{filteredMessages.length} resultats</span>
          </div>
        )}
        <div style={{ flex: 1, overflowY: "auto", padding: "16px 24px", display: "flex", flexDirection: "column", gap: 12 }}>
          {filteredMessages.length === 0 && (
            <div style={{ textAlign: "center", color: "#64748B", padding: 40 }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>💬</div>
              <div>Aucun message</div>
            </div>
          )}
          {filteredMessages.map(m => {
            const isMe = m.user_id === me?.id;
            const color = userColor(m.user_name || "?");
            return (
              <div key={m.id} style={{ display: "flex", flexDirection: isMe ? "row-reverse" : "row", gap: 10, alignItems: "flex-end" }}>
                <div style={{ width: 32, height: 32, borderRadius: "50%", background: color + "22", border: `2px solid ${color}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color, flexShrink: 0 }}>
                  {(m.user_name || "?").charAt(0).toUpperCase()}
                </div>
                <div style={{ maxWidth: "60%" }}>
                  {!isMe && <div style={{ fontSize: 11, color, fontWeight: 600, marginBottom: 4, paddingLeft: 4 }}>{m.user_name}</div>}
                  <div style={{ background: isMe ? "#0D47A1" : "#161B22", border: `1px solid ${isMe ? "#1565C0" : "#1E2D3D"}`, borderRadius: isMe ? "16px 16px 4px 16px" : "16px 16px 16px 4px", padding: "10px 14px" }}>
                    <div style={{ fontSize: 13, color: "#E2EAF2", lineHeight: 1.5 }}>{m.content}</div>
                  </div>
                  <div style={{ fontSize: 10, color: "#64748B", marginTop: 4, textAlign: isMe ? "right" : "left", paddingLeft: 4, display: "flex", justifyContent: isMe ? "flex-end" : "flex-start", gap: 8 }}>
                    {timeAgo(m.created_at)}
                    {isMe && <button onClick={() => deleteMessage(m.id)} style={{ background: "transparent", border: "none", color: "#EF4444", cursor: "pointer", fontSize: 10, padding: 0 }}>🗑️</button>}
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>
        <div style={{ background: "#161B22", borderTop: "1px solid #1E2D3D", padding: "12px 24px", display: "flex", gap: 12, alignItems: "center" }}>
          <input value={input} onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
            placeholder="Ecrire un message... (Entree pour envoyer)"
            style={{ flex: 1, background: "#0D1117", border: "1px solid #1E2D3D", borderRadius: 24, padding: "10px 16px", color: "#E2EAF2", fontSize: 13, outline: "none" }} />
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
